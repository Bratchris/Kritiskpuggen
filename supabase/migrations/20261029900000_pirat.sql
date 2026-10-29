-- Tre bakgrunner med en karibisk piratøy i pikselkunst: soloppgang, solnedgang og stjerneklar natt.
-- Kjør etter 20261029700000_nordlys.sql. Trygg å kjøre flere ganger.

insert into public.skin_items (theme, id, name, price) values
  ('kritisk', 'bg_pirat_soloppgang', 'Piratøya ved soloppgang', 100),
  ('kritisk', 'bg_pirat_solnedgang', 'Piratøya ved solnedgang', 100),
  ('kritisk', 'bg_pirat_natt', 'Piratøya en stjerneklar natt', 100),
  ('klima', 'bg_pirat_soloppgang', 'Piratøya ved soloppgang', 100),
  ('klima', 'bg_pirat_solnedgang', 'Piratøya ved solnedgang', 100),
  ('klima', 'bg_pirat_natt', 'Piratøya en stjerneklar natt', 100)
on conflict (theme, id) do update set name = excluded.name, price = excluded.price;

-- Kontroll: antall bakgrunner til salgs per tema. Forventet 20 i hvert tema.
select theme as tema, count(*) as bakgrunner from public.skin_items where id like 'bg\_%' group by theme order by theme;
