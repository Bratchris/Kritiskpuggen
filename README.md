# Puggen

Kritiskpuggen og Klimapuggen i én app. Elevene logger inn med en kode fra læreren og øver på pensum. Poeng, nivåer, troférom og godterigaver lagres i Supabase, slik at fremgangen følger eleven fra enhet til enhet. Læreren har et eget lærerrom der hen lager klasser og elevkoder og ser fremgang og gaver.

Teknikk: Vite + TypeScript i nettleseren, Supabase (Postgres, Auth og en Edge Function) og hosting på Vercel.

## Oppsett

### 1. Supabase

1. Lag et prosjekt på [supabase.com](https://supabase.com). Velg en region i EU, for eksempel Stockholm (`eu-north-1`).
2. Åpne **SQL Editor** og kjør filene i `supabase/migrations/` én om gangen, i rekkefølge etter navn: først `20261020000000_init.sql`, så `20261029000000_fix_student_role.sql` så `20261029100000_leaderboard.sql` så `20261029200000_leaderboard_top3.sql` og til slutt `20261029300000_activity.sql`. Har du Supabase CLI, kan du i stedet kjøre `supabase link` og så `supabase db push`.
3. Publiser edge-funksjonen som lager elevkontoer:
   ```bash
   npx supabase login
   npx supabase link --project-ref <prosjekt-id>
   npx supabase functions deploy manage-students
   ```
4. Gå til **Authentication → URL Configuration**:
   - Sett **Site URL** til adressen appen får på Vercel, for eksempel `https://kritiskpuggen.vercel.app`.
   - Legg til den samme adressen under **Redirect URLs**.
5. Under **Authentication → Providers → Email** kan e-postbekreftelse stå på. Den gjelder bare lærerkontoer, fordi elevkontoene opprettes ferdig bekreftet.
6. Noter **Project URL** og **anon public key** fra **Project Settings → API**.

### 2. Vercel

1. Importer GitHub-repoet i Vercel. Rammeverket blir gjenkjent som Vite.
2. Legg inn miljøvariablene:
   - `VITE_SUPABASE_URL`: Project URL fra Supabase
   - `VITE_SUPABASE_ANON_KEY`: anon public key fra Supabase
3. Trykk Deploy. Hver push til `main` publiserer en ny versjon.

### 3. Første gang

1. Åpne appen, velg **Lærer** og **Opprett lærerkonto**. Bekreft e-postadressen.
2. Lag en klasse og velg temaer. Klassen får en klassekode, for eksempel `K7RQ2M`.
3. Lim inn elevnavn, ett per linje, og trykk **Lag elevkoder**. Kopier eller skriv ut listen. Kodene vises bare én gang, men du kan lage en ny kode for en elev når som helst.
4. Elevene logger inn med klassekode, brukernavn og kode.

### Lokalt

```bash
cp .env.example .env.local   # fyll inn verdiene
npm install
npm run dev
```

## Slik fungerer innlogging

- **Lærere** har en vanlig Supabase-konto med e-post og passord, og kan bruke «Glemt passord».
- **Elever** har ingen e-post. Edge-funksjonen `manage-students` lager en konto med en intern adresse (`brukernavn.klassekode@elev.puggen.invalid`) og en kode som `ugle-482`. Innloggingsskjemaet bygger den samme adressen ut fra det eleven skriver inn.
- **Innloggingen huskes** på enheten til eleven logger ut. Supabase fornyer tilgangen automatisk, og fornyelsesnøkkelen utløper ikke med standardinnstillingene.

Vil du bruke et annet domene for de interne adressene, setter du det likt begge steder:

```bash
npx supabase secrets set STUDENT_EMAIL_DOMAIN=elev.dittdomene.no   # edge-funksjonen
# og VITE_STUDENT_EMAIL_DOMAIN=elev.dittdomene.no i Vercel
```

Gjør dette før du lager de første elevene, siden eksisterende elevkontoer beholder adressen de ble laget med.

## Nivåer og toppliste

- Hvert tema har 16 nivåer, fra 0 til 1800 XP. Etter øverste nivå får eleven en stjerne for hver 300 XP, så det finnes ikke noe tak.
- Topplisten viser topp 3 i egen klasse og elevens egen plass. Databasefunksjonen `get_leaderboard` sender bare disse radene til elevene, så de ser ikke XP-en til de andre. Læreren ser hele listen i lærerrommet. Læreren slår topplisten av og på under «Innstillinger for klassen».

## Spilloversikt

Lærerrommet viser hvilke spill elevene bruker mest og minst, og hvor de tjener XP. Appen teller per elev, spill og dag: antall svar, riktige svar, XP, tid per svar og svar som kommer raskere enn en grense per spill. Selve svarene lagres ikke. Tellerne sendes samlet hvert 15. sekund og når eleven forlater siden, gjennom databasefunksjonen `log_activity`. Elever kan ikke lese tabellen `activity`.

Merknadene «Mange raske svar» og «Treffer nær gjetting» er tommelfingerregler, ikke bevis. Grensene står i `src/teacher/activity.ts` og `FAST_MS` i `src/app/core.ts`.

## Arkitektur

```
src/
  main.ts            ruting: innlogging, lærerrom eller øvingsapp
  lib/
    supabase.ts      klient, elevadresse og feilmeldinger på norsk
    store.ts         lagring: RemoteStore (Supabase) og PreviewStore (lærerens forhåndsvisning)
    dom.ts           små DOM-hjelpere
  auth/login.ts      innlogging for elev og lærer
  teacher/teacher.ts lærerrommet
  app/
    core.ts          felles tilstand, tema og poeng
    app.ts           skallet: topp, fast linje, faner, filter og nivå-dialog
    modes/           én fil per øvingsform
    shop.ts          butikken
    room/            troférommet (motor og isometriske tegnehjelpere)
  themes/
    types.ts         hva et tema består av
    kritisk/         innhold, butikk og rom for Kritiskpuggen
    klima/           innhold, butikk og rom for Klimapuggen
  styles/            grunnlag, app, temafarger og lærerrom
supabase/
  migrations/        tabeller, radsikkerhet og databasefunksjoner
  functions/manage-students/   oppretter, nullstiller og sletter elevkontoer
```

### Sikkerhet

- Radsikkerhet (RLS) er slått på for alle tabeller. Elever ser bare sin egen fremgang og sine egne gaver. Lærere ser bare klassene sine.
- Elevene kan ikke skrive poeng direkte. Alle endringer går gjennom databasefunksjoner:
  - `award_points` gir 1 til 6 poeng om gangen.
  - `buy_gift` sjekker prisen i `shop_items` og at eleven har nok poeng.
  - `save_state` lagrer kort, notater og rommet.
  - `grant_points` lar læreren gi eller trekke poeng. Den erstatter juksekoden fra den gamle versjonen.
- Rollen «elev» settes i `app_metadata`, som bare kan endres med service-nøkkelen. Den som registrerer seg selv, blir alltid lærer uten klasser.
- Service-nøkkelen brukes bare i edge-funksjonen, aldri i nettleseren.

### Personvern

Elevene er under 18 år. Bruk gjerne bare fornavn eller kallenavn når du lager elevkoder. Sjekk med skolen om det trengs en databehandleravtale med Supabase og Vercel før appen tas i bruk i klassen.

## Legge til et nytt tema

1. Lag en mappe i `src/themes/` med `content.ts`, `shop.ts`, `room.ts` og `index.ts`. Bruk `kritisk/` som mal.
2. Registrer temaet i `src/themes/index.ts`.
3. Legg til temafarger under `:root[data-tema="ditt-tema"]` i `src/styles/themes.css`.
4. Legg butikkvarene inn i `shop_items` med en ny migrasjon. Prisene i databasen er fasiten.
