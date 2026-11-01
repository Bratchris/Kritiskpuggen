-- Achievements. Eleven låser dem opp i appen, og noen gir et kostyme eller et dyr som bare finnes her.
-- XP- og dyre-achievements sjekkes mot databasen. At eleven har mestret et spill, kan databasen ikke se,
-- så de stoler på appen. Belønningene er bare utseende, og ingen gir poeng.
-- Kjør etter de andre migrasjonene. Trygg å kjøre flere ganger.

create table if not exists public.achievements (
  student_id uuid not null references public.profiles (id) on delete cascade,
  id text not null,
  unlocked_at timestamptz not null default now(),
  primary key (student_id, id)
);
alter table public.achievements enable row level security;
drop policy if exists "elev ser egne achievements" on public.achievements;
create policy "elev ser egne achievements" on public.achievements for select using (student_id = auth.uid());
drop policy if exists "lærer ser achievements i klassene sine" on public.achievements;
create policy "lærer ser achievements i klassene sine" on public.achievements for select using (exists (
  select 1 from public.profiles p where p.id = achievements.student_id and public.is_teacher_of(p.class_id)
));
grant select on public.achievements to authenticated;

-- Dyr fra achievements er ikke klekket av et egg.
alter table public.pets drop constraint if exists pets_egg_check;
alter table public.pets add constraint pets_egg_check check (egg in ('vanlig', 'mytisk', 'belonning'));

-- Kostymene fra achievements. Temaet 'ach' finnes ikke i noen klasse, så buy_skin kan aldri selge dem.
insert into public.skin_items (theme, id, name, price) values
  ('ach', 'ach_krone', 'Gullkrone', 1),
  ('ach', 'ach_medalje', 'Gullmedalje', 1),
  ('ach', 'ach_briller', 'Ordsmedens briller', 1),
  ('ach', 'ach_detektiv', 'Detektivhatt', 1),
  ('ach', 'ach_bok', 'Visdomsbok', 1),
  ('ach', 'ach_doktorhatt', 'Doktorhatt', 1),
  ('ach', 'ach_kappe', 'Superheltkappe', 1),
  ('ach', 'ach_rustning', 'Ridderrustning', 1),
  ('ach', 'ach_laurbaer', 'Laurbærkrans', 1)
on conflict (theme, id) do update set name = excluded.name;

create or replace function public.unlock_achievement(p_theme text, p_id text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare v_xp integer; v_ok boolean := true; v_new boolean; v_skin text; v_species text; v_pet public.pets; v_tier integer;
begin
  perform public.require_student_theme(p_theme);
  if p_id not in ('quiz_perfekt','tf_perfekt','par_feilfri','memo_skarp','ord_forste','sort_perfekt','hull_perfekt','feil_perfekt','tenk_begreper','kort_alle','allsidig','xp_100','xp_500','xp_1000','xp_1800','huseier','stjerne','egg_forste','klekk_forste','samler_5','legendarisk','gave_forste','kostyme_forste') then
    raise exception 'Ukjent achievement' using errcode = '22023';
  end if;
  v_xp := public.total_xp(auth.uid());
  v_ok := case p_id
    when 'xp_100' then v_xp >= 100
    when 'xp_500' then v_xp >= 500
    when 'xp_1000' then v_xp >= 1000
    when 'xp_1800' then v_xp >= 1800
    when 'stjerne' then exists (select 1 from public.progress where student_id = auth.uid() and points >= 2100)
    when 'egg_forste' then exists (select 1 from public.pets where student_id = auth.uid() and egg <> 'belonning')
    when 'klekk_forste' then exists (select 1 from public.pets where student_id = auth.uid() and egg <> 'belonning' and hatched_at is not null)
    when 'samler_5' then (select count(distinct species || '/' || variant) from public.pets where student_id = auth.uid() and hatched_at is not null) >= 5
    when 'legendarisk' then exists (select 1 from public.pets where student_id = auth.uid() and egg <> 'belonning' and rarity = 4)
    else true end;
  if not v_ok then raise exception 'Achievementet er ikke oppnådd ennå' using errcode = '22023'; end if;

  insert into public.achievements (student_id, id) values (auth.uid(), p_id) on conflict do nothing;
  get diagnostics v_new = row_count;
  if not v_new then return jsonb_build_object('new', false); end if;

  v_skin := case p_id
      when 'quiz_perfekt' then 'ach_krone'
      when 'tf_perfekt' then 'ach_medalje'
      when 'hull_perfekt' then 'ach_briller'
      when 'feil_perfekt' then 'ach_detektiv'
      when 'tenk_begreper' then 'ach_bok'
      when 'kort_alle' then 'ach_doktorhatt'
      when 'allsidig' then 'ach_kappe'
      when 'xp_1000' then 'ach_rustning'
      when 'huseier' then 'ach_laurbaer'
    else null end;
  v_species := case p_id
      when 'memo_skarp' then 'elefant'
      when 'sort_perfekt' then 'rev'
      when 'xp_500' then 'ugle'
      when 'xp_1800' then 'foniks'
    else null end;
  if v_skin is not null then
    insert into public.wardrobe (student_id, theme, item_id) values (auth.uid(), 'ach', v_skin) on conflict do nothing;
  end if;
  if v_species is not null then
    v_tier := case v_species when 'foniks' then 4 else 2 end;
    insert into public.pets (student_id, egg, found_theme, xp_start, xp_need, hatched_at, species, variant, rarity)
    values (auth.uid(), 'belonning', p_theme, v_xp, 0, now(), v_species, 'vanlig', v_tier)
    returning * into v_pet;
  end if;
  return jsonb_build_object('new', true, 'skin', v_skin, 'pet', case when v_pet.id is null then null else to_jsonb(v_pet) end);
end $$;

revoke execute on function public.unlock_achievement(text, text) from public, anon;
grant execute on function public.unlock_achievement(text, text) to authenticated;

-- Kontroll: tabellen og funksjonen finnes, og kostymene er lagt inn.
select (select count(*) from public.skin_items where theme = 'ach') as kostymer,
       (select count(*) from pg_proc where proname = 'unlock_achievement') as funksjon;
