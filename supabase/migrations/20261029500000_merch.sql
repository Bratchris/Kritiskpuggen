-- CRISPY-G-butikken: merch som kan kjøpes i alle temaer.
-- Varene ligger inne én gang per tema, slik at buy_skin trekker poeng fra temaet eleven står i.
-- Kjør etter 20261029400000_avatar.sql. Trygg å kjøre flere ganger.

insert into public.skin_items (theme, id, name, price) values
  ('kritisk', 'cg_pannebaand', 'CRISPY-G pannebånd', 50),
  ('kritisk', 'cg_fotball', 'CRISPY-G fotball', 60),
  ('kritisk', 'cg_caps', 'CRISPY-G caps', 70),
  ('kritisk', 'cg_bottehatt', 'CRISPY-G bøttehatt', 75),
  ('kritisk', 'cg_tskjorte', 'CRISPY-G T-skjorte', 80),
  ('kritisk', 'cg_sneakers', 'CRISPY-G sneakers', 90),
  ('kritisk', 'cg_sekk', 'CRISPY-G ryggsekk', 100),
  ('kritisk', 'cg_hoodie', 'CRISPY-G hoodie', 120),
  ('kritisk', 'cg_kjede', 'CRISPY-G gullkjede', 140),
  ('kritisk', 'cg_hjemme', 'Fotballdrakt, hjemme', 160),
  ('kritisk', 'cg_borte', 'Fotballdrakt, borte', 160),
  ('kritisk', 'cg_keeper', 'Keeperdrakt', 170),
  ('kritisk', 'cg_tracksuit', 'CRISPY-G tracksuit', 180),
  ('kritisk', 'cg_gullball', 'Gullballen', 250),
  ('klima', 'cg_pannebaand', 'CRISPY-G pannebånd', 50),
  ('klima', 'cg_fotball', 'CRISPY-G fotball', 60),
  ('klima', 'cg_caps', 'CRISPY-G caps', 70),
  ('klima', 'cg_bottehatt', 'CRISPY-G bøttehatt', 75),
  ('klima', 'cg_tskjorte', 'CRISPY-G T-skjorte', 80),
  ('klima', 'cg_sneakers', 'CRISPY-G sneakers', 90),
  ('klima', 'cg_sekk', 'CRISPY-G ryggsekk', 100),
  ('klima', 'cg_hoodie', 'CRISPY-G hoodie', 120),
  ('klima', 'cg_kjede', 'CRISPY-G gullkjede', 140),
  ('klima', 'cg_hjemme', 'Fotballdrakt, hjemme', 160),
  ('klima', 'cg_borte', 'Fotballdrakt, borte', 160),
  ('klima', 'cg_keeper', 'Keeperdrakt', 170),
  ('klima', 'cg_tracksuit', 'CRISPY-G tracksuit', 180),
  ('klima', 'cg_gullball', 'Gullballen', 250)
on conflict (theme, id) do update set name = excluded.name, price = excluded.price;

-- Kontroll: antall varer per tema. Forventet 26 i hvert tema (12 kostymer + 14 CRISPY-G).
select theme as tema, count(*) as varer, count(*) filter (where id like 'cg\_%') as crispy_g from public.skin_items group by theme order by theme;
