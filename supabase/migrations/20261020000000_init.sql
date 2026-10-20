-- Puggen: klasser, elever, fremgang og godterigaver.
-- Alle skrivinger fra appen går gjennom funksjonene nederst (security definer),
-- slik at elevene ikke kan endre poengene sine direkte.

create extension if not exists pgcrypto;

-- ---------- Tabeller ----------

create or replace function public.gen_class_code() returns text
language plpgsql volatile as $$
declare
  alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result text := '';
begin
  for i in 1..6 loop
    result := result || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
  end loop;
  return result;
end $$;

create table public.classes (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 60),
  code text not null unique default public.gen_class_code(),
  themes text[] not null default '{kritisk}' check (cardinality(themes) between 1 and 10),
  created_at timestamptz not null default now()
);
create index classes_teacher_idx on public.classes (teacher_id);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('teacher', 'student')),
  display_name text not null check (char_length(display_name) between 1 and 60),
  username text,
  class_id uuid references public.classes (id) on delete cascade,
  created_at timestamptz not null default now(),
  last_seen timestamptz,
  unique (class_id, username),
  check ((role = 'student') = (class_id is not null and username is not null))
);
create index profiles_class_idx on public.profiles (class_id);

create table public.progress (
  student_id uuid not null references public.profiles (id) on delete cascade,
  theme text not null,
  points integer not null default 0 check (points >= 0),   -- XP: alt eleven har tjent
  spent integer not null default 0 check (spent >= 0),     -- brukt i butikken
  state jsonb not null default '{}'::jsonb,                -- kort, notater, rommet
  updated_at timestamptz not null default now(),
  primary key (student_id, theme),
  check (spent <= points)
);

create table public.shop_items (
  theme text not null,
  id text not null,
  name text not null,
  price integer not null check (price > 0),
  primary key (theme, id)
);

create table public.gifts (
  id bigint generated always as identity primary key,
  student_id uuid not null references public.profiles (id) on delete cascade,
  class_id uuid not null references public.classes (id) on delete cascade,
  theme text not null,
  item_id text not null,
  price integer not null,
  created_at timestamptz not null default now(),
  foreign key (theme, item_id) references public.shop_items (theme, id)
);
create index gifts_class_idx on public.gifts (class_id, created_at desc);
create index gifts_student_idx on public.gifts (student_id);

-- ---------- Hjelpefunksjoner ----------

create or replace function public.my_class_id() returns uuid
language sql stable security definer set search_path = public as $$
  select class_id from public.profiles where id = auth.uid()
$$;

create or replace function public.is_teacher_of(p_class uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.classes where id = p_class and teacher_id = auth.uid())
$$;

-- Ny bruker i auth.users -> profil. Elever får rollen sin fra app_metadata,
-- som bare kan settes med service-nøkkelen (edge function), aldri av brukeren selv.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.raw_app_meta_data ->> 'role' = 'student' then
    insert into public.profiles (id, role, display_name, username, class_id)
    values (
      new.id, 'student',
      left(coalesce(nullif(new.raw_user_meta_data ->> 'display_name', ''), new.raw_app_meta_data ->> 'username'), 60),
      new.raw_app_meta_data ->> 'username',
      (new.raw_app_meta_data ->> 'class_id')::uuid
    );
  else
    insert into public.profiles (id, role, display_name)
    values (
      new.id, 'teacher',
      left(coalesce(nullif(new.raw_user_meta_data ->> 'display_name', ''), split_part(new.email, '@', 1)), 60)
    );
  end if;
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- Radsikkerhet ----------

alter table public.classes enable row level security;
alter table public.profiles enable row level security;
alter table public.progress enable row level security;
alter table public.shop_items enable row level security;
alter table public.gifts enable row level security;

create policy "lærer ser egne klasser" on public.classes
  for select using (teacher_id = auth.uid());
create policy "elev ser sin klasse" on public.classes
  for select using (id = public.my_class_id());
create policy "lærer lager klasser" on public.classes
  for insert with check (
    teacher_id = auth.uid()
    and exists (select 1 from public.profiles where id = auth.uid() and role = 'teacher')
  );
create policy "lærer endrer egne klasser" on public.classes
  for update using (teacher_id = auth.uid()) with check (teacher_id = auth.uid());
create policy "lærer sletter egne klasser" on public.classes
  for delete using (teacher_id = auth.uid());

create policy "se egen profil" on public.profiles
  for select using (id = auth.uid());
create policy "lærer ser elevene sine" on public.profiles
  for select using (class_id is not null and public.is_teacher_of(class_id));

create policy "elev ser egen fremgang" on public.progress
  for select using (student_id = auth.uid());
create policy "lærer ser fremgang i klassene sine" on public.progress
  for select using (exists (
    select 1 from public.profiles p where p.id = progress.student_id and public.is_teacher_of(p.class_id)
  ));

create policy "alle innloggede ser butikkvarer" on public.shop_items
  for select to authenticated using (true);

create policy "elev ser egne gaver" on public.gifts
  for select using (student_id = auth.uid());
create policy "lærer ser gavene i klassene sine" on public.gifts
  for select using (public.is_teacher_of(class_id));

-- Ingen insert/update/delete-policyer på progress, gifts og profiles:
-- de endres bare gjennom funksjonene under.

-- ---------- Funksjoner appen kaller ----------

create or replace function public.require_student_theme(p_theme text) returns uuid
language plpgsql stable security definer set search_path = public as $$
declare v_class uuid;
begin
  select p.class_id into v_class
  from public.profiles p join public.classes c on c.id = p.class_id
  where p.id = auth.uid() and p.role = 'student' and p_theme = any (c.themes);
  if v_class is null then
    raise exception 'Temaet er ikke tilgjengelig for deg' using errcode = '42501';
  end if;
  return v_class;
end $$;

create or replace function public.ensure_progress(p_theme text) returns public.progress
language plpgsql security definer set search_path = public as $$
declare r public.progress;
begin
  perform public.require_student_theme(p_theme);
  insert into public.progress (student_id, theme) values (auth.uid(), p_theme)
  on conflict (student_id, theme) do nothing;
  select * into r from public.progress where student_id = auth.uid() and theme = p_theme;
  update public.profiles set last_seen = now() where id = auth.uid();
  return r;
end $$;

create or replace function public.save_state(p_theme text, p_state jsonb) returns timestamptz
language plpgsql security definer set search_path = public as $$
declare t timestamptz := now();
begin
  perform public.require_student_theme(p_theme);
  if jsonb_typeof(p_state) <> 'object' or pg_column_size(p_state) > 200000 then
    raise exception 'Ugyldig lagring' using errcode = '22023';
  end if;
  insert into public.progress (student_id, theme, state, updated_at) values (auth.uid(), p_theme, p_state, t)
  on conflict (student_id, theme) do update set state = excluded.state, updated_at = t;
  update public.profiles set last_seen = t where id = auth.uid();
  return t;
end $$;

-- Én øvelse gir høyst 6 poeng om gangen (parkoblingen).
create or replace function public.award_points(p_theme text, p_n integer) returns integer
language plpgsql security definer set search_path = public as $$
declare v integer;
begin
  perform public.require_student_theme(p_theme);
  if p_n is null or p_n < 1 or p_n > 6 then
    raise exception 'Ugyldig poengsum' using errcode = '22023';
  end if;
  insert into public.progress (student_id, theme, points) values (auth.uid(), p_theme, p_n)
  on conflict (student_id, theme) do update set points = public.progress.points + p_n, updated_at = now()
  returning points into v;
  return v;
end $$;

create or replace function public.buy_gift(p_theme text, p_item text) returns integer
language plpgsql security definer set search_path = public as $$
declare v_class uuid; v_price integer; v_row public.progress;
begin
  v_class := public.require_student_theme(p_theme);
  select price into v_price from public.shop_items where theme = p_theme and id = p_item;
  if v_price is null then raise exception 'Ukjent vare' using errcode = '22023'; end if;
  select * into v_row from public.progress where student_id = auth.uid() and theme = p_theme for update;
  if v_row is null or v_row.points - v_row.spent < v_price then
    raise exception 'Ikke nok poeng' using errcode = '22023';
  end if;
  update public.progress set spent = spent + v_price, updated_at = now()
  where student_id = auth.uid() and theme = p_theme;
  insert into public.gifts (student_id, class_id, theme, item_id, price)
  values (auth.uid(), v_class, p_theme, p_item, v_price);
  return v_row.spent + v_price;
end $$;

-- Læreren kan gi eller trekke poeng (erstatter juksekoden).
create or replace function public.grant_points(p_student uuid, p_theme text, p_n integer) returns integer
language plpgsql security definer set search_path = public as $$
declare v_class uuid; v integer;
begin
  select class_id into v_class from public.profiles where id = p_student and role = 'student';
  if v_class is null or not public.is_teacher_of(v_class) then
    raise exception 'Ingen tilgang' using errcode = '42501';
  end if;
  if not exists (select 1 from public.classes where id = v_class and p_theme = any (themes)) then
    raise exception 'Klassen har ikke dette temaet' using errcode = '22023';
  end if;
  if p_n is null or p_n = 0 or abs(p_n) > 1000 then
    raise exception 'Ugyldig poengsum' using errcode = '22023';
  end if;
  insert into public.progress (student_id, theme, points) values (p_student, p_theme, greatest(p_n, 0))
  on conflict (student_id, theme) do update
    set points = greatest(public.progress.points + p_n, public.progress.spent), updated_at = now()
  returning points into v;
  return v;
end $$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.gen_class_code() from anon;
revoke execute on function public.ensure_progress(text), public.save_state(text, jsonb),
  public.award_points(text, integer), public.buy_gift(text, text), public.grant_points(uuid, text, integer),
  public.require_student_theme(text), public.my_class_id(), public.is_teacher_of(uuid)
  from public, anon;
grant execute on function public.ensure_progress(text), public.save_state(text, jsonb),
  public.award_points(text, integer), public.buy_gift(text, text), public.grant_points(uuid, text, integer),
  public.require_student_theme(text), public.my_class_id(), public.is_teacher_of(uuid)
  to authenticated;

-- ---------- Butikkvarer (prisene her er fasiten) ----------

insert into public.shop_items (theme, id, name, price) values
  ('kritisk', 'laban', 'Laban', 15),
  ('kritisk', 'seigmenn', 'Seigmenn', 20),
  ('kritisk', 'bamsemums', 'Bamsemums', 30),
  ('kritisk', 'kvikklunsj', 'Kvikk Lunsj', 45),
  ('kritisk', 'smash', 'Smash!', 60),
  ('kritisk', 'stratos', 'Stratos', 75),
  ('kritisk', 'twist', 'Twist-pose', 90),
  ('kritisk', 'smagodt', 'Kilo med smågodt', 180),
  ('kritisk', 'gull', 'Den gylne gresskarbøtta', 300),
  ('klima', 'kopp', 'Kaffekopp', 15),
  ('klima', 'filter', 'Kaffefilter', 20),
  ('klima', 'bonner', 'Kaffebønner', 30),
  ('klima', 'termos', 'Termokopp', 45),
  ('klima', 'kvern', 'Kaffekvern', 60),
  ('klima', 'skummer', 'Melkeskummer', 75),
  ('klima', 'presse', 'Presskanne', 90),
  ('klima', 'maskin', 'Espressomaskin', 180),
  ('klima', 'gull', 'Gullkoppen', 300)
on conflict (theme, id) do update set name = excluded.name, price = excluded.price;
