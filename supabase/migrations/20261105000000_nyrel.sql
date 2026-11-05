-- Nyreligiøspuggen: et nytt tema i KRLE om nyreligiøsitet, med juletema.
-- Legger inn butikkvarene og kostymene for temaet. Prisene her er fasiten.
-- Felles varer (CRISPY-G, bakgrunner og sesongvarer) kopieres fra Klimapuggen, slik at de kan kjøpes i alle temaer.
-- Trygg å kjøre flere ganger.

insert into public.shop_items (theme, id, name, price) values
  ('nyrel', 'pepperkake', 'Pepperkakehjerte', 15),
  ('nyrel', 'klementin', 'Klementin', 20),
  ('nyrel', 'marsipangris', 'Marsipangris', 30),
  ('nyrel', 'glogg', 'Kopp gløgg', 45),
  ('nyrel', 'duftlys', 'Duftlys med kanel', 60),
  ('nyrel', 'krystall', 'Krystall', 75),
  ('nyrel', 'syvslag', 'Sju slag kaker', 90),
  ('nyrel', 'pepperkakehus', 'Pepperkakehus', 180),
  ('nyrel', 'gull', 'Den gylne julestjernen', 300)
on conflict (theme, id) do update set name = excluded.name, price = excluded.price;

insert into public.skin_items (theme, id, name, price) values
  ('nyrel', 'ny_tarot', 'Tarotkort', 45),
  ('nyrel', 'ny_luciakrans', 'Luciakrans', 50),
  ('nyrel', 'ny_krystallkjede', 'Krystallkjede', 55),
  ('nyrel', 'ny_krystallkule', 'Krystallkule', 60),
  ('nyrel', 'ny_manediadem', 'Månediadem', 65),
  ('nyrel', 'ny_glorie', 'Glorie', 70),
  ('nyrel', 'ny_tromme', 'Sjamantromme', 90),
  ('nyrel', 'ny_yoga', 'Yogaantrekk', 100),
  ('nyrel', 'ny_englevinger', 'Englevinger', 110),
  ('nyrel', 'ny_luciakjole', 'Luciakjole', 140),
  ('nyrel', 'ny_astrologkappe', 'Astrologkappe', 160),
  ('nyrel', 'ny_nissedrakt', 'Nissedrakt', 180)
on conflict (theme, id) do update set name = excluded.name, price = excluded.price;

-- Felles varer: alt fra Klimapuggen unntatt Klimapuggens egne kostymer.
insert into public.skin_items (theme, id, name, price)
select 'nyrel', id, name, price from public.skin_items
where theme = 'klima'
  and id not in ('sydvest', 'strikkelue', 'solbriller', 'blomsterkrans', 'kikkert', 'ryggsekk', 'regnfrakk', 'marius', 'forskerfrakk', 'klimahelt', 'biedrakt', 'astronaut')
on conflict (theme, id) do update set name = excluded.name, price = excluded.price;

-- Kontroll: 9 butikkvarer og 12 egne kostymer, pluss de felles varene.
select (select count(*) from public.shop_items where theme = 'nyrel') as julegaver,
       (select count(*) from public.skin_items where theme = 'nyrel' and id like 'ny\_%') as kostymer,
       (select count(*) from public.skin_items where theme = 'nyrel') as alle_varer,
       (select count(*) from public.skin_items where theme = 'klima') as klima_varer;
