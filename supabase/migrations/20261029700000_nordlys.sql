-- To nye bakgrunner med nordlys, skog, fjell og bål: en vanlig tegning og en i pikselkunst.
-- Kjør etter 20261029600000_backgrounds.sql. Trygg å kjøre flere ganger.

insert into public.skin_items (theme, id, name, price) values
  ('kritisk', 'bg_nordlys', 'Nordlys over skogen', 80),
  ('kritisk', 'bg_nordlys_piksel', 'Nordlys i piksler', 80),
  ('klima', 'bg_nordlys', 'Nordlys over skogen', 80),
  ('klima', 'bg_nordlys_piksel', 'Nordlys i piksler', 80)
on conflict (theme, id) do update set name = excluded.name, price = excluded.price;

-- Kontroll: antall bakgrunner til salgs per tema. Forventet 17 i hvert tema.
select theme as tema, count(*) as bakgrunner from public.skin_items where id like 'bg\_%' group by theme order by theme;
