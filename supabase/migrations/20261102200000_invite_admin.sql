-- Bare utvalgte lærere kan invitere nye lærere. Kolleger som blir invitert, kan ikke invitere videre.
-- Den første lærerkontoen (din) får lov. Vil du gi en annen lærer lov senere, se nederst.
-- Kjør etter 20261102100000_teacher_invites.sql. Trygg å kjøre flere ganger.

alter table public.profiles add column if not exists can_invite boolean not null default false;

-- Den eldste lærerkontoen får lov til å invitere.
update public.profiles set can_invite = true
where id = (select id from public.profiles where role = 'teacher' order by created_at limit 1);

create or replace function public.create_teacher_invite(p_note text default null) returns text
language plpgsql security definer set search_path = public as $$
declare v_code text; alphabet text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; i int;
begin
  if not exists (select 1 from public.profiles where id = auth.uid() and role = 'teacher' and can_invite) then
    raise exception 'Du har ikke lov til å invitere nye lærere' using errcode = '42501';
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
revoke execute on function public.create_teacher_invite(text) from public, anon;
grant execute on function public.create_teacher_invite(text) to authenticated;

-- Kontroll: hvem kan invitere? Skal være deg.
select display_name as kan_invitere, created_at from public.profiles where can_invite;

-- Gi en annen lærer lov senere (bytt ut navnet):
--   update public.profiles set can_invite = true where role = 'teacher' and display_name = 'Navn Navnesen';
