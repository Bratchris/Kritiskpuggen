-- Flere egg: høyst 5 egg per dag og 8 uklekte egg om gangen (før 2 og 4).
-- Kjør etter 20261029800000_pets.sql. Trygg å kjøre flere ganger.

create or replace function public.roll_egg(p_theme text) returns public.pets
language plpgsql security definer set search_path = public as $$
declare v_roll public.egg_rolls; v_r double precision; v_egg text; v_row public.pets;
begin
  perform public.require_student_theme(p_theme);
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
  insert into public.pets (student_id, egg, found_theme, xp_start, xp_need)
  values (auth.uid(), v_egg, p_theme, public.total_xp(auth.uid()), case when v_egg = 'mytisk' then 600 else 300 end)
  returning * into v_row;
  update public.egg_rolls set found_today = found_today + 1 where student_id = auth.uid();
  return v_row;
end $$;

-- Kontroll: funksjonen har de nye grensene.
select position('found_today >= 5' in prosrc) > 0 as fem_per_dag, position('>= 8 then' in prosrc) > 0 as atte_om_gangen
from pg_proc where proname = 'roll_egg';
