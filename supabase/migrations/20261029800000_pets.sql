-- Egg og kjæledyr.
-- Eleven kan finne et egg når et svar gir XP. Egget klekker når eleven har tjent nok XP etter funnet
-- (summen av XP i alle temaer). Hvilket dyr som kommer ut, avgjøres her i databasen når egget klekker,
-- så det ikke kan jukses fram i nettleseren.
-- Kjør etter de andre migrasjonene. Trygg å kjøre flere ganger.

create table if not exists public.pets (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles (id) on delete cascade,
  egg text not null check (egg in ('vanlig', 'mytisk')),
  found_at timestamptz not null default now(),
  found_theme text not null,
  xp_start integer not null,
  xp_need integer not null,
  hatched_at timestamptz,
  species text,
  variant text,
  rarity smallint check (rarity between 0 and 4)
);
create index if not exists pets_student on public.pets (student_id);

-- Når eleven sist prøvde lykken, og hvor mange egg hen har funnet i dag.
create table if not exists public.egg_rolls (
  student_id uuid primary key references public.profiles (id) on delete cascade,
  last_roll timestamptz not null default 'epoch',
  day date not null default current_date,
  found_today integer not null default 0
);

alter table public.pets enable row level security;
alter table public.egg_rolls enable row level security;
drop policy if exists "elev ser egne dyr" on public.pets;
create policy "elev ser egne dyr" on public.pets for select using (student_id = auth.uid());
drop policy if exists "lærer ser dyr i klassene sine" on public.pets;
create policy "lærer ser dyr i klassene sine" on public.pets for select using (exists (
  select 1 from public.profiles p where p.id = pets.student_id and public.is_teacher_of(p.class_id)
));
grant select on public.pets to authenticated;

create or replace function public.total_xp(p_student uuid) returns integer
language sql stable security definer set search_path = public as $$
  select coalesce(sum(points), 0)::integer from public.progress where student_id = p_student
$$;
revoke execute on function public.total_xp(uuid) from public, anon, authenticated;

-- Sjanser. Endres her, og husk å endre teksten i src/pets/catalog.ts også.
--   2,5 % for et vanlig egg og 0,15 % for et mytisk egg per svar som gir XP,
--   høyst ett forsøk per 12. sekund, høyst 2 egg per dag og høyst 4 uklekte egg om gangen.
create or replace function public.roll_egg(p_theme text) returns public.pets
language plpgsql security definer set search_path = public as $$
declare v_roll public.egg_rolls; v_r double precision; v_egg text; v_row public.pets;
begin
  perform public.require_student_theme(p_theme);
  insert into public.egg_rolls (student_id) values (auth.uid()) on conflict do nothing;
  select * into v_roll from public.egg_rolls where student_id = auth.uid() for update;
  if v_roll.last_roll > now() - interval '12 seconds' then return null; end if;
  if v_roll.day <> current_date then v_roll.day := current_date; v_roll.found_today := 0; end if;
  update public.egg_rolls set last_roll = now(), day = v_roll.day, found_today = v_roll.found_today where student_id = auth.uid();
  if v_roll.found_today >= 2 then return null; end if;
  if (select count(*) from public.pets where student_id = auth.uid() and hatched_at is null) >= 4 then return null; end if;
  v_r := random();
  if v_r < 0.0015 then v_egg := 'mytisk';
  elsif v_r < 0.0265 then v_egg := 'vanlig';
  else return null;
  end if;
  insert into public.pets (student_id, egg, found_theme, xp_start, xp_need)
  values (auth.uid(), v_egg, p_theme, public.total_xp(auth.uid()), case when v_egg = 'mytisk' then 600 else 300 end)
  returning * into v_row;
  update public.egg_rolls set found_today = found_today + 1 where student_id = auth.uid();
  return v_row;
end $$;

-- Trekker et element etter vekt. p_items og p_weights må være like lange.
create or replace function public.pick_weighted(p_items text[], p_weights integer[]) returns text
language plpgsql volatile set search_path = public as $$
declare v_total integer := 0; v_r double precision; v_acc integer := 0; i integer;
begin
  for i in 1 .. array_length(p_weights, 1) loop v_total := v_total + p_weights[i]; end loop;
  v_r := random() * v_total;
  for i in 1 .. array_length(p_items, 1) loop
    v_acc := v_acc + p_weights[i];
    if v_r < v_acc then return p_items[i]; end if;
  end loop;
  return p_items[array_length(p_items, 1)];
end $$;

-- Klekker et egg når eleven har tjent nok XP. Artene, fargene og vektene må stemme med src/pets/catalog.ts.
create or replace function public.hatch_egg(p_id uuid) returns public.pets
language plpgsql security definer set search_path = public as $$
declare v_row public.pets; v_species text; v_variant text; v_tier integer;
begin
  select * into v_row from public.pets where id = p_id and student_id = auth.uid() for update;
  if v_row.id is null then raise exception 'Fant ikke egget' using errcode = '22023'; end if;
  if v_row.hatched_at is not null then return v_row; end if;
  if public.total_xp(auth.uid()) < v_row.xp_start + v_row.xp_need then
    raise exception 'Egget er ikke klart til å klekke ennå' using errcode = '22023';
  end if;
  if v_row.egg = 'mytisk' then
    v_species := 'drage';
  else
    v_species := public.pick_weighted(
      array['ku', 'sau', 'kanin', 'hund', 'katt', 'skilpadde', 'minigris', 'enhjorning'],
      array[16, 16, 16, 14, 14, 12, 9, 3]);
  end if;
  v_variant := public.pick_weighted(
    array['vanlig', 'stripete', 'bronse', 'solv', 'smaragd', 'neon', 'gull'],
    array[55, 17, 12, 8, 4, 3, 1]);
  v_tier := (case v_species when 'drage' then 3 when 'enhjorning' then 2 when 'minigris' then 1 else 0 end)
          + (case v_variant when 'gull' then 4 when 'neon' then 3 when 'smaragd' then 3 when 'solv' then 2 when 'bronse' then 1 when 'stripete' then 1 else 0 end);
  update public.pets set hatched_at = now(), species = v_species, variant = v_variant, rarity = least(4, v_tier)
  where id = p_id returning * into v_row;
  return v_row;
end $$;

revoke execute on function public.roll_egg(text), public.hatch_egg(uuid), public.pick_weighted(text[], integer[]) from public, anon;
grant execute on function public.roll_egg(text), public.hatch_egg(uuid) to authenticated;

-- Kontroll: tabellene finnes, og funksjonene er på plass.
select (select count(*) from public.pets) as dyr_og_egg,
       (select count(*) from pg_proc where proname in ('roll_egg', 'hatch_egg', 'pick_weighted', 'total_xp')) as funksjoner;
