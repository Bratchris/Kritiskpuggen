-- Toppliste for klassen.
-- Elevene kan fortsatt ikke lese andres profiler eller fremgang direkte.
-- Funksjonen under gir bare navn og XP for elevene i egen klasse, og bare når
-- læreren har slått på topplisten for klassen.
--
-- Trygg å kjøre flere ganger.

alter table public.classes add column if not exists leaderboard boolean not null default true;

create or replace function public.get_leaderboard(p_theme text, p_class uuid default null)
returns table (display_name text, points integer, is_me boolean)
language plpgsql stable security definer set search_path = public as $$
declare v_class uuid;
begin
  if p_class is not null and public.is_teacher_of(p_class) then
    v_class := p_class;                       -- læreren ser klassens liste, også når den er slått av
  else
    select c.id into v_class
    from public.profiles p join public.classes c on c.id = p.class_id
    where p.id = auth.uid() and p.role = 'student' and c.leaderboard and p_theme = any (c.themes);
    if v_class is null then
      raise exception 'Topplisten er ikke tilgjengelig' using errcode = '42501';
    end if;
  end if;

  return query
    select p.display_name, coalesce(g.points, 0)::integer, p.id = auth.uid()
    from public.profiles p
    left join public.progress g on g.student_id = p.id and g.theme = p_theme
    where p.class_id = v_class and p.role = 'student'
    order by coalesce(g.points, 0) desc, p.display_name;
end $$;

revoke execute on function public.get_leaderboard(text, uuid) from public, anon;
grant execute on function public.get_leaderboard(text, uuid) to authenticated;

-- Kontroll: viser klassene og om topplisten er på.
select name as klasse, leaderboard as toppliste_pa from public.classes order by name;
