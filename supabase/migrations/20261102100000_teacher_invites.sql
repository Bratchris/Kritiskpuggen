-- Lærerkontoer bare med invitasjon.
-- Før kunne hvem som helst opprette en lærerkonto. Nå trengs en invitasjonskode fra en lærer som
-- allerede bruker appen. Koden kan brukes én gang og varer i 14 dager.
-- Eksisterende lærere og elever påvirkes ikke. Elevkontoer lages fortsatt av læreren i lærerrommet.
-- Kjør etter de andre migrasjonene. Trygg å kjøre flere ganger.

create table if not exists public.teacher_invites (
  code text primary key,
  created_by uuid not null references public.profiles (id) on delete cascade,
  note text check (char_length(note) <= 80),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '14 days',
  used_by uuid references auth.users (id) on delete set null,
  used_at timestamptz
);
alter table public.teacher_invites enable row level security;
drop policy if exists "lærer ser egne invitasjoner" on public.teacher_invites;
create policy "lærer ser egne invitasjoner" on public.teacher_invites for select using (created_by = auth.uid());
grant select on public.teacher_invites to authenticated;

-- En lærer lager en invitasjon til en kollega. Høyst 10 ubrukte om gangen.
create or replace function public.create_teacher_invite(p_note text default null) returns text
language plpgsql security definer set search_path = public as $$
declare v_code text; alphabet text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; i int;
begin
  if not exists (select 1 from public.profiles where id = auth.uid() and role = 'teacher') then
    raise exception 'Bare lærere kan invitere' using errcode = '42501';
  end if;
  if (select count(*) from public.teacher_invites where created_by = auth.uid() and used_by is null and expires_at > now()) >= 10 then
    raise exception 'Du har allerede 10 ubrukte invitasjoner' using errcode = '22023';
  end if;
  loop
    v_code := '';
    for i in 1 .. 12 loop v_code := v_code || substr(alphabet, 1 + floor(random() * 32)::int, 1); end loop;
    v_code := substr(v_code, 1, 4) || '-' || substr(v_code, 5, 4) || '-' || substr(v_code, 9, 4);
    exit when not exists (select 1 from public.teacher_invites where code = v_code);
  end loop;
  insert into public.teacher_invites (code, created_by, note) values (v_code, auth.uid(), nullif(left(trim(p_note), 80), ''));
  return v_code;
end $$;

create or replace function public.revoke_teacher_invite(p_code text) returns void
language sql security definer set search_path = public as $$
  delete from public.teacher_invites where code = upper(trim(p_code)) and created_by = auth.uid() and used_by is null;
$$;

-- Sjekker en kode før registrering, så skjemaet kan si fra med en gang. Sier bare ja eller nei.
create or replace function public.check_teacher_invite(p_code text) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.teacher_invites where code = upper(trim(p_code)) and used_by is null and expires_at > now());
$$;

revoke execute on function public.create_teacher_invite(text), public.revoke_teacher_invite(text), public.check_teacher_invite(text) from public;
grant execute on function public.create_teacher_invite(text), public.revoke_teacher_invite(text) to authenticated;
grant execute on function public.check_teacher_invite(text) to anon, authenticated;

-- Ny bruker: elever lages av edge-funksjonen (rollen settes like etter, se 20261029000000_fix_student_role.sql).
-- Lærere får profil bare med en gyldig invitasjonskode. Uten kode lages ingen profil,
-- og kontoen kan verken se eller lage noe.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare v_code text;
begin
  if new.raw_app_meta_data ->> 'role' = 'student' then
    insert into public.profiles (id, role, display_name, username, class_id)
    values (
      new.id, 'student',
      left(coalesce(nullif(new.raw_user_meta_data ->> 'display_name', ''), new.raw_app_meta_data ->> 'username'), 60),
      new.raw_app_meta_data ->> 'username',
      (new.raw_app_meta_data ->> 'class_id')::uuid
    );
    return new;
  end if;
  v_code := upper(trim(coalesce(new.raw_user_meta_data ->> 'invite', '')));
  if v_code = '' then return new; end if;
  update public.teacher_invites set used_by = new.id, used_at = now()
  where code = v_code and used_by is null and expires_at > now();
  if not found then return new; end if;
  insert into public.profiles (id, role, display_name)
  values (new.id, 'teacher', left(coalesce(nullif(new.raw_user_meta_data ->> 'display_name', ''), split_part(new.email, '@', 1)), 60))
  on conflict (id) do nothing;
  return new;
end $$;
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- Kontroll: funksjonene finnes, og antall lærere er uendret.
select (select count(*) from pg_proc where proname in ('create_teacher_invite', 'revoke_teacher_invite', 'check_teacher_invite')) as funksjoner,
       (select count(*) from public.profiles where role = 'teacher') as laerere;
