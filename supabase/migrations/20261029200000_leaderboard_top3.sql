-- Topplisten viser bare topp 3.
-- Elevene får navn og XP for de tre beste (flere ved delt plass) og sin egen plass.
-- Andre elevers XP sendes ikke til elevene. Elever med 0 XP regnes ikke med i topp 3.
-- Læreren får fortsatt hele listen.
--
-- Trygg å kjøre flere ganger.

drop function if exists public.get_leaderboard(text, uuid);

create function public.get_leaderboard(p_theme text, p_class uuid default null)
returns table (display_name text, points integer, is_me boolean, rank integer, total integer)
language plpgsql stable security definer set search_path = public as $$
#variable_conflict use_column
declare v_class uuid; v_teacher boolean := false;
begin
  if p_class is not null and public.is_teacher_of(p_class) then
    v_class := p_class; v_teacher := true;
  else
    select c.id into v_class
    from public.profiles p join public.classes c on c.id = p.class_id
    where p.id = auth.uid() and p.role = 'student' and c.leaderboard and p_theme = any (c.themes);
    if v_class is null then
      raise exception 'Topplisten er ikke tilgjengelig' using errcode = '42501';
    end if;
  end if;

  return query
    with b as (
      select p.display_name as nm, coalesce(g.points, 0)::integer as pts, p.id = auth.uid() as me
      from public.profiles p
      left join public.progress g on g.student_id = p.id and g.theme = p_theme
      where p.class_id = v_class and p.role = 'student'
    ), r as (
      select b.*, (rank() over (order by b.pts desc))::integer as rk, (count(*) over ())::integer as tot from b
    )
    select r.nm, r.pts, r.me, r.rk, r.tot
    from r
    where v_teacher or r.me or (r.rk <= 3 and r.pts > 0)
    order by r.rk, r.nm;
end $$;

revoke execute on function public.get_leaderboard(text, uuid) from public, anon;
grant execute on function public.get_leaderboard(text, uuid) to authenticated;

-- Kontroll: funksjonen finnes og gir fem kolonner.
select proname as funksjon, pg_get_function_result(oid) as gir_tilbake
from pg_proc where proname = 'get_leaderboard';
