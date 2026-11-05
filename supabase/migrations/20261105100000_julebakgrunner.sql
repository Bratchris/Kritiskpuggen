-- Julebakgrunner: seks mønstre og to store bilder (en tegning og en i piksler).
-- Kan kjøpes i alle temaer hele året. Prisene her er fasiten. Trygg å kjøre flere ganger.
insert into public.skin_items (theme, id, name, price)
select t.theme, b.id, b.name, b.price
from (values ('kritisk'), ('klima'), ('nyrel')) as t(theme)
cross join (values
  ('bg_pepperkaker', 'Pepperkaker', 45),
  ('bg_polkagris', 'Polkagris', 40),
  ('bg_julekuler', 'Julekuler', 50),
  ('bg_julegaver', 'Julegaver', 50),
  ('bg_nisser', 'Nisser', 55),
  ('bg_julestrikk', 'Julestrikk', 60),
  ('bg_julekveld', 'Julekveld i bygda', 100),
  ('bg_julenatt_piksel', 'Julenatt i piksler', 100)
) as b(id, name, price)
on conflict (theme, id) do update set name = excluded.name, price = excluded.price;

-- Kontroll: 24 (8 bakgrunner i 3 temaer)
select count(*) as julebakgrunner from public.skin_items where id in ('bg_pepperkaker', 'bg_polkagris', 'bg_julekuler', 'bg_julegaver', 'bg_nisser', 'bg_julestrikk', 'bg_julekveld', 'bg_julenatt_piksel');
