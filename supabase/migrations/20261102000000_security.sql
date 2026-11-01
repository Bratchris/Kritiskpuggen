-- Sikkerhet og personvern.
-- 1. Poeng kan ikke tjenes raskere enn et menneske klarer: høyst 60 XP per minutt per elev.
-- 2. Topplisten er av for nye klasser. Læreren slår den på selv (innebygd personvern).
-- 3. Aktivitet i spillene slettes automatisk etter 180 dager.
-- 4. Hjelpefunksjoner kan ikke kalles uten innlogging.
-- Kjør etter de andre migrasjonene. Trygg å kjøre flere ganger.

-- ---------- 1. Fartsgrense for poeng ----------
create table if not exists public.xp_rate (
  student_id uuid primary key references public.profiles (id) on delete cascade,
  window_start timestamptz not null default now(),
  xp integer not null default 0
);
alter table public.xp_rate enable row level security;   -- ingen policyer: bare funksjonene under kan lese og skrive

create or replace function public.award_points(p_theme text, p_n integer) returns integer
language plpgsql security definer set search_path = public as $$
declare v integer; r public.xp_rate;
begin
  perform public.require_student_theme(p_theme);
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
  insert into public.progress (student_id, theme, points) values (auth.uid(), p_theme, p_n)
  on conflict (student_id, theme) do update set points = public.progress.points + p_n, updated_at = now()
  returning points into v;
  return v;
end $$;

-- ---------- 2. Topplisten av som standard ----------
alter table public.classes alter column leaderboard set default false;

-- ---------- 3. Automatisk sletting ----------
create or replace function public.purge_old_data() returns void
language sql security definer set search_path = public as $$
  delete from public.activity where day < current_date - 180;
  delete from public.xp_rate where window_start < now() - interval '1 day';
$$;
revoke execute on function public.purge_old_data() from public, anon, authenticated;
select public.purge_old_data();

-- Kjør oppryddingen hver natt med pg_cron, hvis utvidelsen er tilgjengelig.
do $$
begin
  create extension if not exists pg_cron;
  perform cron.unschedule(jobid) from cron.job where jobname = 'puggen-opprydding';
  perform cron.schedule('puggen-opprydding', '17 3 * * *', 'select public.purge_old_data()');
exception when others then
  raise notice 'pg_cron er ikke tilgjengelig (%). Slå på pg_cron under Database > Extensions og kjør filen på nytt.', sqlerrm;
end $$;

-- ---------- 4. Ingen funksjoner for anonyme ----------
revoke execute on function public.is_teacher_of(uuid), public.my_class_id(), public.require_student_theme(text) from anon;

-- Kontroll
select (select count(*) from pg_proc where proname = 'purge_old_data') as opprydding,
       (select column_default from information_schema.columns where table_schema = 'public' and table_name = 'classes' and column_name = 'leaderboard') as toppliste_standard,
       exists (select 1 from pg_extension where extname = 'pg_cron') as nattlig_sletting;
