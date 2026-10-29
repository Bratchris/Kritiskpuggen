-- Avatar: elevens karakter og kostymer som kjøpes med poeng.
-- Avataren lagres på profilen, så den er den samme i alle temaer.
-- Kostymer kjøpes med poeng fra temaet de hører til, og eies for godt.
--
-- Trygg å kjøre flere ganger.

alter table public.profiles add column if not exists avatar jsonb;

create table if not exists public.skin_items (
  theme text not null,
  id text not null,
  name text not null,
  price integer not null check (price > 0),
  primary key (theme, id)
);

create table if not exists public.wardrobe (
  student_id uuid not null references public.profiles (id) on delete cascade,
  theme text not null,
  item_id text not null,
  created_at timestamptz not null default now(),
  primary key (student_id, theme, item_id),
  foreign key (theme, item_id) references public.skin_items (theme, id)
);

alter table public.skin_items enable row level security;
alter table public.wardrobe enable row level security;
drop policy if exists "alle innloggede ser kostymer" on public.skin_items;
create policy "alle innloggede ser kostymer" on public.skin_items for select to authenticated using (true);
drop policy if exists "elev ser egne kostymer" on public.wardrobe;
create policy "elev ser egne kostymer" on public.wardrobe for select using (student_id = auth.uid());
drop policy if exists "lærer ser kostymer i klassene sine" on public.wardrobe;
create policy "lærer ser kostymer i klassene sine" on public.wardrobe for select using (exists (
  select 1 from public.profiles p where p.id = wardrobe.student_id and public.is_teacher_of(p.class_id)
));
grant select on public.skin_items, public.wardrobe to authenticated;

-- Lagrer elevens avatar. Bare utseendet, aldri poeng eller eierskap.
create or replace function public.save_avatar(p_avatar jsonb) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.profiles where id = auth.uid() and role = 'student') then
    raise exception 'Bare elever har avatar' using errcode = '42501';
  end if;
  if jsonb_typeof(p_avatar) <> 'object' or pg_column_size(p_avatar) > 4000 then
    raise exception 'Ugyldig avatar' using errcode = '22023';
  end if;
  update public.profiles set avatar = p_avatar where id = auth.uid();
end $$;

-- Kjøper et kostyme. Prisen hentes fra skin_items, og poengene trekkes som i godteributikken.
create or replace function public.buy_skin(p_theme text, p_item text) returns integer
language plpgsql security definer set search_path = public as $$
declare v_price integer; v_row public.progress;
begin
  perform public.require_student_theme(p_theme);
  select price into v_price from public.skin_items where theme = p_theme and id = p_item;
  if v_price is null then raise exception 'Ukjent kostyme' using errcode = '22023'; end if;
  if exists (select 1 from public.wardrobe where student_id = auth.uid() and theme = p_theme and item_id = p_item) then
    raise exception 'Du har allerede dette kostymet' using errcode = '22023';
  end if;
  insert into public.progress (student_id, theme) values (auth.uid(), p_theme) on conflict do nothing;
  select * into v_row from public.progress where student_id = auth.uid() and theme = p_theme for update;
  if v_row.points - v_row.spent < v_price then
    raise exception 'Ikke nok poeng' using errcode = '22023';
  end if;
  update public.progress set spent = spent + v_price, updated_at = now() where student_id = auth.uid() and theme = p_theme;
  insert into public.wardrobe (student_id, theme, item_id) values (auth.uid(), p_theme, p_item);
  return v_row.spent + v_price;
end $$;

revoke execute on function public.save_avatar(jsonb), public.buy_skin(text, text) from public, anon;
grant execute on function public.save_avatar(jsonb), public.buy_skin(text, text) to authenticated;

insert into public.skin_items (theme, id, name, price) values
  ('kritisk', 'heksehatt', 'Heksehatt', 40),
  ('kritisk', 'kattorer', 'Katteører', 45),
  ('kritisk', 'varulvorer', 'Varulvører', 60),
  ('kritisk', 'tryllestav', 'Tryllestav', 50),
  ('kritisk', 'heksekappe', 'Heksekappe', 90),
  ('kritisk', 'flaggermusvinger', 'Flaggermusvinger', 100),
  ('kritisk', 'vampyrkappe', 'Vampyrkappe', 120),
  ('kritisk', 'mumie', 'Mumiedrakt', 140),
  ('kritisk', 'skjelett', 'Skjelettdrakt', 150),
  ('kritisk', 'trollmann', 'Trollmannskappe', 160),
  ('kritisk', 'gresskarhode', 'Gresskarhode', 180),
  ('kritisk', 'spokelse', 'Spøkelseslaken', 220),
  ('klima', 'sydvest', 'Sydvest', 40),
  ('klima', 'strikkelue', 'Strikkelue', 45),
  ('klima', 'solbriller', 'Solbriller', 50),
  ('klima', 'blomsterkrans', 'Blomsterkrans', 55),
  ('klima', 'kikkert', 'Kikkert', 60),
  ('klima', 'ryggsekk', 'Tursekk', 70),
  ('klima', 'regnfrakk', 'Regnfrakk', 90),
  ('klima', 'marius', 'Mariusgenser', 110),
  ('klima', 'forskerfrakk', 'Forskerfrakk', 120),
  ('klima', 'klimahelt', 'Klimaheltkappe', 130),
  ('klima', 'biedrakt', 'Biedrakt', 150),
  ('klima', 'astronaut', 'Astronautdrakt', 240)
on conflict (theme, id) do update set name = excluded.name, price = excluded.price;

-- Kontroll: antall kostymer per tema.
select theme as tema, count(*) as kostymer from public.skin_items group by theme order by theme;
