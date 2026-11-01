-- Sesonghendelser og dyr som vokser.
--
-- Sesonghendelser: læreren slår på Halloween-uka, Juleuka eller Prøveuka for en klasse i lærerrommet.
-- Mens en hendelse pågår (7 dager), kan elevene finne sesongegg, kjøpe sesongkostymer og -bakgrunner,
-- og få mer XP hvis læreren har valgt det. XP-bonusen regnes ut her i databasen, ikke i nettleseren.
--
-- Dyr som vokser: dyret som står ved avataren, får like mye XP som eleven tjener, og går opp i nivå.
-- Nivået regnes ut fra pet_xp i appen.
--
-- Kjør etter de andre migrasjonene. Trygg å kjøre flere ganger.

alter table public.classes add column if not exists events jsonb not null default '{}'::jsonb;
alter table public.pets add column if not exists pet_xp integer not null default 0;
alter table public.pets drop constraint if exists pets_egg_check;
alter table public.pets add constraint pets_egg_check check (egg in ('vanlig', 'mytisk', 'belonning', 'halloween', 'jul', 'prove'));

-- Sesongvarer: hvilken sesong hver vare hører til.
create table if not exists public.season_items (item_id text primary key, season text not null);
alter table public.season_items enable row level security;
drop policy if exists "alle innloggede ser sesongvarer" on public.season_items;
create policy "alle innloggede ser sesongvarer" on public.season_items for select to authenticated using (true);
grant select on public.season_items to authenticated;
insert into public.season_items (item_id, season) values
  ('hw_horn', 'halloween'),
  ('hw_kost', 'halloween'),
  ('hw_lykt', 'halloween'),
  ('jul_nisselue', 'jul'),
  ('jul_gevir', 'jul'),
  ('jul_skjerf', 'jul'),
  ('jul_genser', 'jul'),
  ('prove_hodetelefoner', 'prove'),
  ('prove_kopp', 'prove'),
  ('prove_hoodie', 'prove'),
  ('bg_heksenatt', 'halloween'),
  ('bg_sno', 'jul'),
  ('bg_julelys', 'jul'),
  ('bg_bibliotek', 'prove'),
  ('bg_kladdebok', 'prove')
on conflict (item_id) do update set season = excluded.season;

insert into public.skin_items (theme, id, name, price) values
  ('kritisk', 'hw_horn', 'Djevelhorn', 60),
  ('kritisk', 'hw_kost', 'Heksekost', 80),
  ('kritisk', 'hw_lykt', 'Gresskarlykt', 90),
  ('kritisk', 'jul_nisselue', 'Nisselue', 60),
  ('kritisk', 'jul_gevir', 'Reinsdyrgevir', 70),
  ('kritisk', 'jul_skjerf', 'Juleskjerf', 70),
  ('kritisk', 'jul_genser', 'Julegenser', 120),
  ('kritisk', 'prove_hodetelefoner', 'Hodetelefoner', 80),
  ('kritisk', 'prove_kopp', 'Kakaokopp', 60),
  ('kritisk', 'prove_hoodie', 'Prøveuke-hoodie', 120),
  ('kritisk', 'bg_heksenatt', 'Heksenatt', 70),
  ('kritisk', 'bg_sno', 'Snøfall', 60),
  ('kritisk', 'bg_julelys', 'Julelys', 70),
  ('kritisk', 'bg_bibliotek', 'Biblioteket', 60),
  ('kritisk', 'bg_kladdebok', 'Kladdeboka', 70),
  ('klima', 'hw_horn', 'Djevelhorn', 60),
  ('klima', 'hw_kost', 'Heksekost', 80),
  ('klima', 'hw_lykt', 'Gresskarlykt', 90),
  ('klima', 'jul_nisselue', 'Nisselue', 60),
  ('klima', 'jul_gevir', 'Reinsdyrgevir', 70),
  ('klima', 'jul_skjerf', 'Juleskjerf', 70),
  ('klima', 'jul_genser', 'Julegenser', 120),
  ('klima', 'prove_hodetelefoner', 'Hodetelefoner', 80),
  ('klima', 'prove_kopp', 'Kakaokopp', 60),
  ('klima', 'prove_hoodie', 'Prøveuke-hoodie', 120),
  ('klima', 'bg_heksenatt', 'Heksenatt', 70),
  ('klima', 'bg_sno', 'Snøfall', 60),
  ('klima', 'bg_julelys', 'Julelys', 70),
  ('klima', 'bg_bibliotek', 'Biblioteket', 60),
  ('klima', 'bg_kladdebok', 'Kladdeboka', 70)
on conflict (theme, id) do update set name = excluded.name, price = excluded.price;

-- Sesongene som pågår i en klasse.
create or replace function public.active_seasons(p_class uuid) returns text[]
language sql stable security definer set search_path = public as $$
  select coalesce(array_agg(k), '{}') from public.classes c, jsonb_each(c.events) e(k, v)
  where c.id = p_class and k in ('halloween', 'jul', 'prove') and (v ->> 'until')::timestamptz > now();
$$;
-- XP-bonusen: den største blant sesongene som pågår, 1 til 3.
create or replace function public.class_xp_mult(p_class uuid) returns integer
language sql stable security definer set search_path = public as $$
  select greatest(1, least(3, coalesce(max(round((v ->> 'xp')::numeric))::int, 1))) from public.classes c, jsonb_each(c.events) e(k, v)
  where c.id = p_class and k in ('halloween', 'jul', 'prove') and (v ->> 'until')::timestamptz > now();
$$;
revoke execute on function public.active_seasons(uuid), public.class_xp_mult(uuid) from public, anon;

-- Poeng: med XP-bonus fra sesongen og XP til dyret ved avataren. Fartsgrensen gjelder grunnpoengene.
create or replace function public.award_points(p_theme text, p_n integer) returns integer
language plpgsql security definer set search_path = public as $$
declare v integer; r public.xp_rate; v_class uuid; v_gain integer;
begin
  v_class := public.require_student_theme(p_theme);
  if p_n is null or p_n < 1 or p_n > 6 then
    raise exception 'Ugyldig poengsum' using errcode = '22023';
  end if;
  insert into public.xp_rate (student_id) values (auth.uid()) on conflict do nothing;
  select * into r from public.xp_rate where student_id = auth.uid() for update;
  if r.window_start < now() - interval '1 minute' then
    update public.xp_rate set window_start = now(), xp = p_n where student_id = auth.uid();
  elsif r.xp + p_n > 60 then
    raise exception 'For mange poeng på kort tid' using errcode = '22023';
  else
    update public.xp_rate set xp = xp + p_n where student_id = auth.uid();
  end if;
  v_gain := p_n * public.class_xp_mult(v_class);
  insert into public.progress (student_id, theme, points) values (auth.uid(), p_theme, v_gain)
  on conflict (student_id, theme) do update set points = public.progress.points + v_gain, updated_at = now()
  returning points into v;
  update public.pets set pet_xp = pet_xp + v_gain
  where student_id = auth.uid() and hatched_at is not null
    and id::text = (select avatar ->> 'pet' from public.profiles where id = auth.uid());
  return v;
end $$;

-- Egg: mens en sesong pågår, blir 6 av 10 vanlige egg til sesongegg.
create or replace function public.roll_egg(p_theme text) returns public.pets
language plpgsql security definer set search_path = public as $$
declare v_roll public.egg_rolls; v_r double precision; v_egg text; v_row public.pets; v_class uuid; v_seasons text[];
begin
  v_class := public.require_student_theme(p_theme);
  insert into public.egg_rolls (student_id) values (auth.uid()) on conflict do nothing;
  select * into v_roll from public.egg_rolls where student_id = auth.uid() for update;
  if v_roll.last_roll > now() - interval '12 seconds' then return null; end if;
  if v_roll.day <> current_date then v_roll.day := current_date; v_roll.found_today := 0; end if;
  update public.egg_rolls set last_roll = now(), day = v_roll.day, found_today = v_roll.found_today where student_id = auth.uid();
  if v_roll.found_today >= 5 then return null; end if;
  if (select count(*) from public.pets where student_id = auth.uid() and hatched_at is null) >= 8 then return null; end if;
  v_r := random();
  if v_r < 0.0015 then v_egg := 'mytisk';
  elsif v_r < 0.0265 then v_egg := 'vanlig';
  else return null;
  end if;
  v_seasons := public.active_seasons(v_class);
  if v_egg = 'vanlig' and array_length(v_seasons, 1) > 0 and random() < 0.6 then
    v_egg := v_seasons[1 + floor(random() * array_length(v_seasons, 1))::int];
  end if;
  insert into public.pets (student_id, egg, found_theme, xp_start, xp_need)
  values (auth.uid(), v_egg, p_theme, public.total_xp(auth.uid()), case when v_egg = 'mytisk' then 600 else 300 end)
  returning * into v_row;
  update public.egg_rolls set found_today = found_today + 1 where student_id = auth.uid();
  return v_row;
end $$;

-- Klekking: sesongegg gir de samme dyrene som vanlige egg, men alltid i sesongens farge (minst episk).
create or replace function public.hatch_egg(p_id uuid) returns public.pets
language plpgsql security definer set search_path = public as $$
declare v_row public.pets; v_species text; v_variant text; v_tier integer; v_st integer;
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
  v_st := case v_species when 'drage' then 3 when 'enhjorning' then 2 when 'minigris' then 1 else 0 end;
  if v_row.egg in ('halloween', 'jul', 'prove') then
    v_variant := v_row.egg;
    v_tier := v_st + 3;
  else
    v_variant := public.pick_weighted(
      array['vanlig', 'stripete', 'bronse', 'solv', 'smaragd', 'neon', 'gull'],
      array[55, 17, 12, 8, 4, 3, 1]);
    v_tier := v_st + (case v_variant when 'gull' then 4 when 'neon' then 3 when 'smaragd' then 3 when 'solv' then 2 when 'bronse' then 1 when 'stripete' then 1 else 0 end);
  end if;
  update public.pets set hatched_at = now(), species = v_species, variant = v_variant, rarity = least(4, v_tier)
  where id = p_id returning * into v_row;
  return v_row;
end $$;

-- Kjøp: sesongvarer kan bare kjøpes mens sesongen pågår i klassen.
create or replace function public.buy_skin(p_theme text, p_item text) returns integer
language plpgsql security definer set search_path = public as $$
declare v_price integer; v_row public.progress; v_class uuid; v_season text;
begin
  v_class := public.require_student_theme(p_theme);
  select price into v_price from public.skin_items where theme = p_theme and id = p_item;
  if v_price is null then raise exception 'Ukjent kostyme' using errcode = '22023'; end if;
  select season into v_season from public.season_items where item_id = p_item;
  if v_season is not null and not (v_season = any (public.active_seasons(v_class))) then
    raise exception 'Denne varen kan bare kjøpes mens sesongen pågår' using errcode = '22023';
  end if;
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

-- Kontroll
select (select count(*) from public.season_items) as sesongvarer,
       (select count(*) from information_schema.columns where table_name = 'pets' and column_name = 'pet_xp') as dyr_xp,
       (select count(*) from information_schema.columns where table_name = 'classes' and column_name = 'events') as hendelser;
