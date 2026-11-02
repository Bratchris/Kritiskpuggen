-- Livemodus (som Kahoot) og lekser.
--
-- Livemodus: læreren starter en quiz fra lærerrommet og viser den på tavla. Elevene svarer i appen.
-- Spørsmålene og fasiten ligger i live_sessions, som elevene ikke kan lese. De får bare det de skal se,
-- gjennom live_state, og fasiten først når læreren viser svaret. Poengene regnes ut her i databasen.
-- live_ticks er et lite «signal» per klasse som appen lytter på (sanntid), uten spørsmål eller fasit.
--
-- Lekser: læreren gir klassen et emne å mestre innen en dato. Fremgangen regnes ut fra kortene eleven
-- kan og quizspørsmålene hen har svart riktig på i emnet, som allerede lagres i progress.state.
--
-- Kjør etter de andre migrasjonene. Trygg å kjøre flere ganger.

-- ---------- Livemodus ----------
create table if not exists public.live_sessions (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes (id) on delete cascade,
  teacher_id uuid not null references public.profiles (id) on delete cascade,
  theme text not null,
  questions jsonb not null,
  idx integer not null default -1,
  status text not null default 'lobby' check (status in ('lobby', 'question', 'reveal', 'end')),
  time_limit integer not null default 20 check (time_limit between 5 and 120),
  q_started timestamptz,
  created_at timestamptz not null default now()
);
create table if not exists public.live_ticks (
  class_id uuid primary key references public.classes (id) on delete cascade,
  session_id uuid references public.live_sessions (id) on delete cascade,
  status text, idx integer, updated_at timestamptz not null default now()
);
create table if not exists public.live_players (
  session_id uuid not null references public.live_sessions (id) on delete cascade,
  student_id uuid not null references public.profiles (id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (session_id, student_id)
);
create table if not exists public.live_answers (
  session_id uuid not null references public.live_sessions (id) on delete cascade,
  student_id uuid not null references public.profiles (id) on delete cascade,
  idx integer not null,
  choice integer not null,
  correct boolean not null,
  points integer not null,
  at timestamptz not null default now(),
  primary key (session_id, student_id, idx)
);
alter table public.live_sessions enable row level security;
alter table public.live_ticks enable row level security;
alter table public.live_players enable row level security;
alter table public.live_answers enable row level security;
drop policy if exists "lærer ser egne liveøkter" on public.live_sessions;
create policy "lærer ser egne liveøkter" on public.live_sessions for select using (teacher_id = auth.uid());
drop policy if exists "klassen ser signalet" on public.live_ticks;
create policy "klassen ser signalet" on public.live_ticks for select using (class_id = public.my_class_id() or public.is_teacher_of(class_id));
grant select on public.live_sessions, public.live_ticks to authenticated;

-- Sanntid for signalet, hvis Realtime er på. Appen spør også jevnlig, så den virker uansett.
do $$ begin
  alter publication supabase_realtime add table public.live_ticks;
exception when others then raise notice 'Realtime ble ikke slått på for live_ticks (%). Appen bruker jevnlige spørringer i stedet.', sqlerrm;
end $$;

create or replace function public.live_start(p_class uuid, p_theme text, p_questions jsonb, p_time integer default 20) returns uuid
language plpgsql security definer set search_path = public as $$
declare v_id uuid;
begin
  if not public.is_teacher_of(p_class) then raise exception 'Bare læreren i klassen kan starte' using errcode = '42501'; end if;
  if jsonb_typeof(p_questions) <> 'array' or jsonb_array_length(p_questions) not between 1 and 30 or pg_column_size(p_questions) > 100000 then
    raise exception 'Ugyldige spørsmål' using errcode = '22023';
  end if;
  update public.live_sessions set status = 'end' where class_id = p_class and status <> 'end';
  insert into public.live_sessions (class_id, teacher_id, theme, questions, time_limit)
  values (p_class, auth.uid(), p_theme, p_questions, greatest(5, least(120, coalesce(p_time, 20))))
  returning id into v_id;
  insert into public.live_ticks (class_id, session_id, status, idx, updated_at) values (p_class, v_id, 'lobby', -1, now())
  on conflict (class_id) do update set session_id = excluded.session_id, status = 'lobby', idx = -1, updated_at = now();
  return v_id;
end $$;

create or replace function public.live_set(p_session uuid, p_status text, p_idx integer) returns void
language plpgsql security definer set search_path = public as $$
declare s public.live_sessions;
begin
  select * into s from public.live_sessions where id = p_session and teacher_id = auth.uid();
  if s.id is null then raise exception 'Fant ikke økten' using errcode = '42501'; end if;
  if p_status not in ('lobby', 'question', 'reveal', 'end') or p_idx < -1 or p_idx >= jsonb_array_length(s.questions) then
    raise exception 'Ugyldig steg' using errcode = '22023';
  end if;
  update public.live_sessions set status = p_status, idx = p_idx,
    q_started = case when p_status = 'question' then now() else q_started end
  where id = p_session;
  update public.live_ticks set status = p_status, idx = p_idx, updated_at = now() where class_id = s.class_id and session_id = p_session;
end $$;

-- Det eleven skal se akkurat nå. Fasiten kommer først når læreren viser svaret.
-- p_join = false bare sjekker om en økt pågår (banneret på startsiden), uten å bli med.
drop function if exists public.live_state();
create or replace function public.live_state(p_join boolean default true) returns jsonb
language plpgsql security definer set search_path = public as $$
declare v_class uuid; s public.live_sessions; q jsonb; v_my record; v_total int; v_rank int; v_players int; v_show boolean;
begin
  select class_id into v_class from public.profiles where id = auth.uid() and role = 'student';
  if v_class is null then return null; end if;
  select ls.* into s from public.live_ticks t join public.live_sessions ls on ls.id = t.session_id
  where t.class_id = v_class and ls.created_at > now() - interval '4 hours';
  if s.id is null or (s.status = 'end' and now() - s.created_at > interval '3 hours') then return null; end if;
  if not coalesce(p_join, true) then return jsonb_build_object('id', s.id, 'status', s.status, 'idx', s.idx, 'total', jsonb_array_length(s.questions)); end if;
  insert into public.live_players (session_id, student_id) values (s.id, auth.uid()) on conflict do nothing;
  v_show := s.status in ('reveal', 'end');
  q := case when s.idx >= 0 then s.questions -> s.idx else null end;
  select choice, correct, points into v_my from public.live_answers where session_id = s.id and student_id = auth.uid() and idx = s.idx;
  select coalesce(sum(points), 0) into v_total from public.live_answers where session_id = s.id and student_id = auth.uid();
  select count(*) into v_players from public.live_players where session_id = s.id;
  select 1 + count(*) into v_rank from (
    select student_id, sum(points) as p from public.live_answers where session_id = s.id group by student_id
  ) x where x.p > v_total;
  return jsonb_build_object(
    'id', s.id, 'status', s.status, 'idx', s.idx, 'total', jsonb_array_length(s.questions), 'time_limit', s.time_limit,
    'left_ms', case when s.status = 'question' then greatest(0, s.time_limit * 1000 - floor(extract(epoch from now() - s.q_started) * 1000))::int else null end,
    'q', q ->> 'q', 'opts', q -> 'opts',
    'ci', case when v_show then (q ->> 'ci')::int else null end, 'e', case when v_show then q ->> 'e' else null end,
    'my_choice', v_my.choice, 'my_correct', case when v_show then v_my.correct else null end, 'my_points', case when v_show then v_my.points else null end,
    'score', case when v_show then v_total else null end, 'rank', case when v_show then v_rank else null end, 'players', v_players);
end $$;

create or replace function public.live_answer(p_session uuid, p_idx integer, p_choice integer) returns boolean
language plpgsql security definer set search_path = public as $$
declare s public.live_sessions; v_ms numeric; v_ok boolean; v_pts int;
begin
  select ls.* into s from public.live_sessions ls join public.profiles p on p.class_id = ls.class_id
  where ls.id = p_session and p.id = auth.uid() and p.role = 'student';
  if s.id is null or s.status <> 'question' or s.idx <> p_idx then return false; end if;
  v_ms := extract(epoch from now() - s.q_started) * 1000;
  if v_ms > s.time_limit * 1000 + 1500 then return false; end if;
  if p_choice < 0 or p_choice >= jsonb_array_length(s.questions -> s.idx -> 'opts') then return false; end if;
  v_ok := p_choice = ((s.questions -> s.idx ->> 'ci')::int);
  v_pts := case when v_ok then round(500 + 500 * greatest(0, 1 - v_ms / (s.time_limit * 1000.0)))::int else 0 end;
  insert into public.live_players (session_id, student_id) values (s.id, auth.uid()) on conflict do nothing;
  insert into public.live_answers (session_id, student_id, idx, choice, correct, points) values (s.id, auth.uid(), p_idx, p_choice, v_ok, v_pts)
  on conflict do nothing;
  return true;
end $$;

-- Tavla: hvem som er med, hvor mange som har svart, fordelingen og topp 5.
create or replace function public.live_board(p_session uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare s public.live_sessions; v_counts jsonb; v_answered int; v_players int; v_names jsonb; v_top jsonb;
begin
  select * into s from public.live_sessions where id = p_session and teacher_id = auth.uid();
  if s.id is null then raise exception 'Fant ikke økten' using errcode = '42501'; end if;
  select coalesce(jsonb_agg(c order by i), '[]') into v_counts from (
    select i, (select count(*) from public.live_answers a where a.session_id = s.id and a.idx = s.idx and a.choice = i) as c
    from generate_series(0, greatest(0, coalesce(jsonb_array_length(s.questions -> greatest(s.idx, 0) -> 'opts'), 4) - 1)) i) x;
  select count(*) into v_answered from public.live_answers where session_id = s.id and idx = s.idx;
  select count(*), coalesce(jsonb_agg(p.display_name order by lp.joined_at), '[]') into v_players, v_names
  from public.live_players lp join public.profiles p on p.id = lp.student_id where lp.session_id = s.id;
  select coalesce(jsonb_agg(jsonb_build_object('name', name, 'points', pts) order by pts desc), '[]') into v_top from (
    select p.display_name as name, coalesce(sum(a.points), 0) as pts from public.live_players lp
    join public.profiles p on p.id = lp.student_id left join public.live_answers a on a.session_id = lp.session_id and a.student_id = lp.student_id
    where lp.session_id = s.id group by lp.student_id, p.display_name order by pts desc limit 5) t;
  return jsonb_build_object('status', s.status, 'idx', s.idx, 'total', jsonb_array_length(s.questions), 'time_limit', s.time_limit,
    'left_ms', case when s.status = 'question' then greatest(0, s.time_limit * 1000 - floor(extract(epoch from now() - s.q_started) * 1000))::int else null end,
    'counts', v_counts, 'answered', v_answered, 'players', v_players, 'names', v_names, 'top', v_top);
end $$;

revoke execute on function public.live_start(uuid, text, jsonb, integer), public.live_set(uuid, text, integer), public.live_state(boolean), public.live_answer(uuid, integer, integer), public.live_board(uuid) from public, anon;
grant execute on function public.live_start(uuid, text, jsonb, integer), public.live_set(uuid, text, integer), public.live_state(boolean), public.live_answer(uuid, integer, integer), public.live_board(uuid) to authenticated;

-- ---------- Lekser ----------
create table if not exists public.homework (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes (id) on delete cascade,
  theme text not null,
  topic text not null,
  due date not null,
  created_by uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now()
);
create index if not exists homework_class on public.homework (class_id);
alter table public.homework enable row level security;
drop policy if exists "klassen ser lekser" on public.homework;
create policy "klassen ser lekser" on public.homework for select using (class_id = public.my_class_id() or public.is_teacher_of(class_id));
drop policy if exists "lærer gir lekser" on public.homework;
create policy "lærer gir lekser" on public.homework for insert with check (public.is_teacher_of(class_id) and created_by = auth.uid());
drop policy if exists "lærer endrer lekser" on public.homework;
create policy "lærer endrer lekser" on public.homework for update using (public.is_teacher_of(class_id)) with check (public.is_teacher_of(class_id));
drop policy if exists "lærer sletter lekser" on public.homework;
create policy "lærer sletter lekser" on public.homework for delete using (public.is_teacher_of(class_id));
grant select, insert, update, delete on public.homework to authenticated;

-- Oppryddingen om natta sletter også gamle liveøkter.
create or replace function public.purge_old_data() returns void
language sql security definer set search_path = public as $$
  delete from public.activity where day < current_date - 180;
  delete from public.xp_rate where window_start < now() - interval '1 day';
  delete from public.live_sessions where created_at < now() - interval '30 days';
$$;
revoke execute on function public.purge_old_data() from public, anon, authenticated;

-- Kontroll
select (select count(*) from pg_proc where proname like 'live\_%') as livefunksjoner,
       (select count(*) from information_schema.tables where table_name = 'homework') as lekser;
