-- Spillaktivitet: daglige tellere per elev, tema og spill.
-- Brukes til spilloversikten i lærerrommet (mest og minst brukte spill, og tegn på
-- at noen «grinder» XP uten å tenke). Det lagres bare tall, ikke hvilke svar eleven ga.
--
-- Trygg å kjøre flere ganger.

create table if not exists public.activity (
  student_id uuid not null references public.profiles (id) on delete cascade,
  class_id uuid not null references public.classes (id) on delete cascade,
  theme text not null,
  mode text not null,
  day date not null,
  answers integer not null default 0,   -- antall svar / forsøk
  correct integer not null default 0,   -- av dem riktige
  xp integer not null default 0,        -- XP tjent i spillet
  timed integer not null default 0,     -- svar med målt tid
  ms_total bigint not null default 0,   -- samlet tid for de målte svarene
  fast integer not null default 0,      -- svar raskere enn grensen for spillet
  primary key (student_id, theme, mode, day)
);
create index if not exists activity_class_idx on public.activity (class_id, theme, day);

alter table public.activity enable row level security;
drop policy if exists "lærer ser aktivitet i klassene sine" on public.activity;
create policy "lærer ser aktivitet i klassene sine" on public.activity
  for select using (public.is_teacher_of(class_id));
-- Elevene skriver bare gjennom log_activity og kan ikke lese tabellen.

create or replace function public.log_activity(p_theme text, p_rows jsonb) returns void
language plpgsql security definer set search_path = public as $$
declare
  v_class uuid; r jsonb;
  v_day date := (now() at time zone 'Europe/Oslo')::date;
  a int; c int; x int; t int; ms bigint; f int; m text;
begin
  v_class := public.require_student_theme(p_theme);
  if jsonb_typeof(p_rows) <> 'array' or jsonb_array_length(p_rows) > 20 then
    raise exception 'Ugyldig aktivitet' using errcode = '22023';
  end if;
  for r in select * from jsonb_array_elements(p_rows) loop
    m := r ->> 'mode';
    if m is null or m !~ '^[a-z]{2,12}$' then continue; end if;
    a := least(greatest(coalesce((r ->> 'answers')::int, 0), 0), 500);
    c := least(greatest(coalesce((r ->> 'correct')::int, 0), 0), a);
    x := least(greatest(coalesce((r ->> 'xp')::int, 0), 0), 3000);
    t := least(greatest(coalesce((r ->> 'timed')::int, 0), 0), a);
    ms := least(greatest(coalesce((r ->> 'ms')::bigint, 0), 0), t::bigint * 600000);
    f := least(greatest(coalesce((r ->> 'fast')::int, 0), 0), t);
    if a = 0 and x = 0 then continue; end if;
    insert into public.activity as act (student_id, class_id, theme, mode, day, answers, correct, xp, timed, ms_total, fast)
    values (auth.uid(), v_class, p_theme, m, v_day, a, c, x, t, ms, f)
    on conflict (student_id, theme, mode, day) do update set
      answers = act.answers + excluded.answers, correct = act.correct + excluded.correct, xp = act.xp + excluded.xp,
      timed = act.timed + excluded.timed, ms_total = act.ms_total + excluded.ms_total, fast = act.fast + excluded.fast;
  end loop;
end $$;

revoke execute on function public.log_activity(text, jsonb) from public, anon;
grant execute on function public.log_activity(text, jsonb) to authenticated;
grant select on public.activity to authenticated;

-- Kontroll: tabellen finnes (0 rader rett etter oppdateringen).
select count(*) as rader_i_activity from public.activity;
