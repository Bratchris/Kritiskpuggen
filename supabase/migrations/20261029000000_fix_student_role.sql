-- Retting: elevkontoer ble lagret som lærere.
--
-- Supabase Auth lagrer en ny bruker i to steg: først raden i auth.users uten
-- app_metadata fra edge-funksjonen, og rett etter en egen UPDATE som legger inn
-- role, class_id og username. Triggeren on_auth_user_created ser bare det første
-- steget, så den laget en lærerprofil for alle elever.
--
-- Denne filen
-- 1. lager en trigger som gjør profilen om til elev når rollen blir lagt inn,
-- 2. reparerer elevkontoene som allerede er lagret som lærere,
-- 3. viser til slutt en liste over alle elever, så du kan se at det virket.
--
-- Trygg å kjøre flere ganger.

create or replace function public.handle_user_role() returns trigger
language plpgsql security definer set search_path = public as $$
declare v_class uuid;
begin
  if new.raw_app_meta_data ->> 'role' is distinct from 'student'
     or new.raw_app_meta_data ->> 'username' is null then
    return new;
  end if;
  select id into v_class from public.classes where id = (new.raw_app_meta_data ->> 'class_id')::uuid;
  if v_class is null then
    return new;
  end if;
  -- En elev skal ikke eie klasser. Fjern det en feilaktig «lærerprofil» kan ha laget.
  delete from public.classes where teacher_id = new.id;
  insert into public.profiles (id, role, display_name, username, class_id)
  values (
    new.id, 'student',
    left(coalesce(nullif(new.raw_user_meta_data ->> 'display_name', ''), new.raw_app_meta_data ->> 'username'), 60),
    new.raw_app_meta_data ->> 'username',
    v_class
  )
  on conflict (id) do update
    set role = 'student', username = excluded.username, class_id = excluded.class_id, display_name = excluded.display_name;
  return new;
end $$;

revoke execute on function public.handle_user_role() from public, anon, authenticated;

drop trigger if exists on_auth_user_role_set on auth.users;
create trigger on_auth_user_role_set
  after update of raw_app_meta_data on auth.users
  for each row
  when (new.raw_app_meta_data ->> 'role' = 'student')
  execute function public.handle_user_role();

-- Reparer elevkontoer som allerede finnes.
delete from public.classes c
using auth.users u
where c.teacher_id = u.id and u.raw_app_meta_data ->> 'role' = 'student';

insert into public.profiles (id, role, display_name, username, class_id)
select
  u.id, 'student',
  left(coalesce(nullif(u.raw_user_meta_data ->> 'display_name', ''), u.raw_app_meta_data ->> 'username'), 60),
  u.raw_app_meta_data ->> 'username',
  c.id
from auth.users u
join public.classes c on c.id = (u.raw_app_meta_data ->> 'class_id')::uuid
where u.raw_app_meta_data ->> 'role' = 'student'
  and u.raw_app_meta_data ->> 'username' is not null
on conflict (id) do update
  set role = 'student', username = excluded.username, class_id = excluded.class_id, display_name = excluded.display_name;

-- Kontroll: alle elever skal stå med rollen «student» og riktig klasse.
select c.name as klasse, p.display_name as elev, p.username as brukernavn, p.role as rolle
from public.profiles p
join public.classes c on c.id = p.class_id
where p.role = 'student'
order by c.name, p.display_name;
