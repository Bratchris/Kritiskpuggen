-- Bakgrunner bak appen. De gratis bakgrunnene trenger ingen rad. Resten kjøpes med buy_skin,
-- som for kostymer, og ligger inne én gang per tema.
-- Kjør etter 20261029500000_merch.sql. Trygg å kjøre flere ganger.

insert into public.skin_items (theme, id, name, price) values
  ('kritisk', 'bg_katter', 'Søte katter', 40),
  ('kritisk', 'bg_kaniner', 'Kaniner og gulrøtter', 45),
  ('kritisk', 'bg_pandaer', 'Pandaer', 50),
  ('kritisk', 'bg_jordbaer', 'Jordbær', 40),
  ('kritisk', 'bg_andunger', 'Andunger', 55),
  ('kritisk', 'bg_fotball', 'Fotballgress', 30),
  ('kritisk', 'bg_neon', 'Neon', 60),
  ('kritisk', 'bg_lyn', 'Lyn', 50),
  ('kritisk', 'bg_flammer', 'Flammer', 70),
  ('kritisk', 'bg_kamo', 'Kamuflasje', 60),
  ('kritisk', 'bg_flaggermus', 'Flaggermus og måne', 45),
  ('kritisk', 'bg_spokelser', 'Søte spøkelser', 50),
  ('kritisk', 'bg_nett', 'Edderkoppnett', 55),
  ('kritisk', 'bg_godteri', 'Halloweengodteri', 50),
  ('kritisk', 'bg_kirkegard', 'Kirkegård', 65),
  ('klima', 'bg_katter', 'Søte katter', 40),
  ('klima', 'bg_kaniner', 'Kaniner og gulrøtter', 45),
  ('klima', 'bg_pandaer', 'Pandaer', 50),
  ('klima', 'bg_jordbaer', 'Jordbær', 40),
  ('klima', 'bg_andunger', 'Andunger', 55),
  ('klima', 'bg_fotball', 'Fotballgress', 30),
  ('klima', 'bg_neon', 'Neon', 60),
  ('klima', 'bg_lyn', 'Lyn', 50),
  ('klima', 'bg_flammer', 'Flammer', 70),
  ('klima', 'bg_kamo', 'Kamuflasje', 60),
  ('klima', 'bg_flaggermus', 'Flaggermus og måne', 45),
  ('klima', 'bg_spokelser', 'Søte spøkelser', 50),
  ('klima', 'bg_nett', 'Edderkoppnett', 55),
  ('klima', 'bg_godteri', 'Halloweengodteri', 50),
  ('klima', 'bg_kirkegard', 'Kirkegård', 65)
on conflict (theme, id) do update set name = excluded.name, price = excluded.price;

-- Kontroll: antall bakgrunner til salgs per tema. Forventet 15 i hvert tema.
select theme as tema, count(*) as bakgrunner from public.skin_items where id like 'bg\_%' group by theme order by theme;
