# Puggen

Kritiskpuggen, Klimapuggen og Nyreligiøspuggen i én app. Elevene logger inn med en kode fra læreren og øver på pensum. Poeng, nivåer, troférom og godterigaver lagres i Supabase, slik at fremgangen følger eleven fra enhet til enhet. Læreren har et eget lærerrom der hen lager klasser og elevkoder og ser fremgang og gaver.

Teknikk: Vite + TypeScript i nettleseren, Supabase (Postgres, Auth og en Edge Function) og hosting på Vercel.

## Oppsett

### 1. Supabase

1. Lag et prosjekt på [supabase.com](https://supabase.com). Velg en region i EU, for eksempel Stockholm (`eu-north-1`).
2. Åpne **SQL Editor** og kjør filene i `supabase/migrations/` én om gangen, i rekkefølge etter navn: først `20261020000000_init.sql`, så `20261029000000_fix_student_role.sql` så `20261029100000_leaderboard.sql` så `20261029200000_leaderboard_top3.sql` så `20261029300000_activity.sql` så `20261029400000_avatar.sql` så `20261029500000_merch.sql` så `20261029600000_backgrounds.sql` så `20261029700000_nordlys.sql` så `20261029800000_pets.sql` så `20261029900000_pirat.sql` så `20261030000000_more_eggs.sql` så `20261101000000_achievements.sql` så `20261102000000_security.sql` så `20261102100000_teacher_invites.sql` så `20261102200000_invite_admin.sql` så `20261102300000_seasons_petlevels.sql` så `20261102400000_live_homework.sql` og til slutt `20261105000000_nyrel.sql`. Har du Supabase CLI, kan du i stedet kjøre `supabase link` og så `supabase db push`.
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

1. Åpne appen, velg **Lærer** og **Opprett lærerkonto**. Bekreft e-postadressen. Den aller første lærerkontoen må lages før du kjører `20261102100000_teacher_invites.sql`. Etter det trenger nye lærere en invitasjon fra lærerrommet (se «Lærerkontoer» under).
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

- **Lærere** har en vanlig Supabase-konto med e-post og passord, og kan bruke «Glemt passord». Nye lærerkontoer krever en invitasjonskode. Bare lærere med `can_invite` (den første lærerkontoen, og andre du gir lov med SQL-en nederst i `20261102200000_invite_admin.sql`) ser «Kolleger» i lærerrommet. Der lages koden, og lenken sendes til kollegaen. Inviterte kolleger kan ikke invitere videre. Koden kan brukes én gang og varer i 14 dager. Uten gyldig kode får kontoen ingen profil og kan verken se eller lage noe. Kontrollen skjer i databasetriggeren `handle_new_user`.
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

## Avatar

Hver elev lager en avatar med kjønn, hudfarge, 17 frisyrer, hijab, øyenfarge, sminke (leppestift, øyenskygge, eyeliner og rouge), fregner og klær. Alle farger kan velges fra ferdige farger eller blandes med glidebrytere for rødt, grønt og blått, og lagres som hex-farger. Avatarer lagret i første versjon, med palettnummer, gjøres om automatisk. Avataren vises øverst i appen og står på en tilfeldig ledig rute i troférommet. Den lagres på profilen (`profiles.avatar`), så den er den samme i alle temaer.

Kostymer kjøpes med poeng fra temaet de hører til, gjennom databasefunksjonen `buy_skin`, som sjekker prisen i `skin_items` og trekker poengene som i godteributikken. Kjøpte kostymer ligger i `wardrobe`. Kostymene og prisene står i `src/avatar/catalog.ts`, og tegningene i `src/avatar/render.ts`. Nye kostymer må også legges inn i `skin_items` med en migrasjon.

CRISPY-G-butikken er en egen fane med merch (fotballdrakter, keeperdrakt, tracksuit, hoodie, caps, sneakers og mer). Den finnes i alle temaer: varene har `theme: 'merch'` i katalogen og ligger inne én gang per tema i `skin_items`, så eleven betaler med poengene fra temaet hen står i. Varer med `tint` kan fargelegges etter kjøp. Fargen lagres i `avatar.tint`.

Under fanen «Bakgrunn» velger eleven et mønster som legges bak hele appen: søte (hjerter, katter, kaniner, pandaer og mer), kule (galakse, neon, lyn, flammer, kamuflasje) og halloween (gresskar, flaggermus, spøkelser, edderkoppnett, kirkegård) natur (nordlys over skog og fjell med bål, både som vanlig tegning og som pikselkunst) og piratøya (en karibisk øy med fiskelandsby, brygge og piratskip i pikselkunst, ved soloppgang, solnedgang og en stjerneklar natt, i `src/avatar/pirate.ts`). Naturbildene fyller hele skjermen i stedet for å gjentas, og ligger i `src/avatar/scenes.ts`. Pikselversjonen tegnes på et lerret i nettleseren og forstørres med skarpe piksler. Fem er gratis. Resten kjøpes med poeng gjennom `buy_skin`, som kostymene. Mønstrene er SVG-fliser tegnet i `src/avatar/backgrounds.ts`, og valget lagres som `avatar.bg`.

## Menyen

Appen er bygd i lag, slik mange læringsspill gjør det, så eleven bare ser det som hører til der hen er:

- **Toppen** viser bare poeng å bruke, nivået med en fremdriftsring, profilknappen (avataren) og tannhjulet for innstillinger.
- **Hovedmenyen** har fem knapper: Øv, Kort, Huset, Butikk og Topp. På mobil ligger den nederst på skjermen, på større skjermer øverst.
- **Øv** er startsiden med nivå, XP til neste nivå, egg på vei, «Fortsett» og alle spillene som fliser. Emnefilteret vises først når eleven har åpnet et spill.
- **Butikk** samler godteri- eller kaffebutikken, kostymer, CRISPY-G og bakgrunner i én undermeny.
- **Profil** (avataren i toppen) har Avatar, Garderobe og Dyr og egg.
- **Innstillinger** har fargemodus (automatisk, lys eller mørk), tekststørrelse, rolige animasjoner, bakgrunnene eleven eier, bytte fag og logge ut. Fargemodus, tekst og animasjoner lagres bare på enheten. I lærerens forhåndsvisning ligger «Lås opp alt» og «Nullstill» her.

## Belønninger i grensesnittet

- **Dagens mål og rekke:** eleven velger et mål per dag i innstillingene (20, 40, 60 eller 100 XP, standard 40). Startsiden viser målet som en ring, dager på rad med en flamme, og hvilke dager denne uka målet ble nådd. Flammen står også øverst i appen. Når målet nås, kommer konfetti og et varsel. Rekka lagres per tema sammen med resten av fremgangen.
- **Rekke-teller:** fra tre riktige svar på rad vises en teller nederst på skjermen. Den blir varmere ved 5 og 10, med konfetti.
- **+XP:** poengene flyr opp fra knappen eleven trykket på, og poengtallet øverst ruller opp.
- **Stjerner:** rundene i quiz, sant eller usant, kurvene, hull i teksten, finn feilen, memory og parkoblingen gir én til tre stjerner. Tre stjerner gir konfetti.
- Riktige svar spretter, gale rister, og nytt nivå gir konfetti. Alt dette slås av med «Animasjoner: Rolig» i innstillingene.

## Egg og kjæledyr

Når et svar gir XP, er det 2,5 % sjanse for å finne et egg og 0,15 % for et mytisk egg. Eleven kan finne høyst 5 egg om dagen og ha 8 uklekte egg om gangen. Et vanlig egg klekker etter 300 nye XP og et mytisk etter 600, summert over alle temaer. Trekningen og klekkingen skjer i databasefunksjonene `roll_egg` og `hatch_egg`, så eleven kan ikke jukse fram et dyr i nettleseren.

Vanlige egg gir ku, sau, kanin, hund, katt, skilpadde, minigris eller enhjørning. Mytiske egg gir alltid en drage. Hvert dyr får en farge: vanlig, stripete, bronse, sølv, smaragd, neon eller gull. Art og farge gir sjeldenhetsgraden: vanlig (grå), sjelden (grønn), veldig sjelden (blå), episk (lilla) eller legendarisk (oransje). Vektene står både i `src/pets/catalog.ts` og i `hatch_egg`, og de må endres begge steder.

Eleven ser eggene, dyrene og dyreboka (alle 63 kombinasjoner) under «Dyr og egg» i avatarskjermen. Et egg eller dyr kan stå ved siden av avataren øverst i appen, på avatarskjermen og i troférommet. I lærerens forhåndsvisning finnes knapper for å få et egg og gjøre eggene klare med en gang.

## Sesonghendelser

Under «Innstillinger for klassen» i lærerrommet kan læreren starte Halloween-uka, Juleuka eller Prøveuka for klassen i 7 dager, forlenge den eller avslutte den. For hver hendelse velger læreren XP-bonus: vanlig, 2× eller 3× (Prøveuka står på 2× som standard). Mens en hendelse pågår:

- vises et banner på startsiden, og i Juleuka faller det snø over appen,
- blir 6 av 10 egg til sesongegg (gresskaregg, juleegg eller kunnskapsegg). De gir de vanlige dyrene i sesongfargen, med hatt, og er alltid episke eller legendariske,
- finnes en egen «Sesong»-fane i butikken med sesongkostymer og -bakgrunner, som bare kan kjøpes mens hendelsen pågår. Det eleven har kjøpt, beholder hen,
- gir hvert poeng XP-bonusen. Bonusen regnes ut i `award_points` i databasen, så eleven kan ikke sette den selv.

Hendelsene lagres i `classes.events`. Innholdet står i `src/seasons/catalog.ts`.

## Dyr som vokser

Dyret som står ved avataren, får like mye XP som eleven tjener (også det står i `award_points`). Nivå L nås ved 20 · L · (L − 1) XP, opp til nivå 10. På nivå 5 blir dyret ungt og får skjerf, og på nivå 10 blir det en mester med krone, gyllen glans og litt større kropp. Små dyr (nivå 1–4) er litt mindre. Eleven får et varsel med konfetti når dyret vokser.

## Nyreligiøspuggen

KRLE-tema om nyreligiøsitet, bygget på tekstene «Hva er nyreligiøsitet?» og «Nyreligiøse praksiser». Alt har juletema: julemarked med gaver til læreren, et julehus med peis og juletre, og 40 trofeer som blander jul og nyreligiøsitet. Det snør i appen hele tida. Tolv egne kostymer (blant annet nissedrakt, luciakjole, astrologkappe, englevinger og sjamantromme).

«Tenk selv» har tolv refleksjonsoppgaver, med alle oppgavene fra «Tenk og skriv om nyreligiøse praksiser» og «Hvilket stjernetegn er du?». Oppgavene vises én om gangen med en oversikt over hvilke som er besvart, og har setningsstartere eleven kan trykke på. Stjernetegnoppgaven har en velger med alle tolv stjernetegn og hva astrologien sier om dem. Den nye visningen gjelder «Tenk selv» i alle temaene.

## Live, Feilbanken og Lekser

Tre spill finnes i alle temaer, i tillegg til temaets egne.

- **Live** er en quiz for hele klassen, som Kahoot. Læreren trykker «Start live-quiz» i lærerrommet, velger tema, emne, antall spørsmål og tid, og viser tavla på storskjerm. Elevene trykker Live (eller banneret på startsiden) og svarer på egen skjerm. Tavla viser hvem som er med, hvor mange som har svart, fordelingen av svar, riktig svar med forklaring, topp 5 og til slutt en pall. Svaret vises av seg selv når tiden er ute eller alle har svart. Poengene (500–1000 for riktig svar, mer jo raskere) regnes ut i databasen, og elevene får aldri fasiten før læreren viser svaret. Riktige svar gir også litt vanlig XP. Appen spør databasen hvert 1,5 sekund og bruker Realtime på `live_ticks` når det er på.
- **Feilbanken** samler spørsmål eleven har svart feil på i quiz, sant eller usant, hull i teksten og kurvene. Svarer eleven riktig i feilbanken, forsvinner spørsmålet. Feilbanken gir ingen ekstra XP: et spørsmål gir poeng én gang per dag, enten det besvares i feilbanken eller i det vanlige spillet. Da lønner det seg ikke å svare feil med vilje.
- **Lekser**: Læreren gir klassen et emne med frist under «Lekser» i lærerrommet. Eleven er ferdig når hen kan alle kortene i emnet og har svart riktig på hvert quizspørsmål i emnet minst én gang. Elevene ser leksen på startsiden. Læreren ser hvor mange som er ferdige, i gang og ikke startet, snittet, og en tabell per elev.

## Achievements

Det finnes 23 achievements i tre grupper: mestre spillene (for eksempel alle riktige i en quizrunde, Memory på 8 forsøk eller færre, alle kortene mestret), fremgang (XP, alle rom, første stjerne) og samling (egg, dyr og kjøp). Når eleven låser opp et, glir en medalje ned fra toppen av skjermen. Oversikten ligger under Profil → Achievements.

Ti achievements gir en belønning som ikke kan kjøpes eller klekkes: ni kostymer (blant annet gullkrone, detektivhatt, doktorhatt, superheltkappe og ridderrustning) og fire dyr (ugle, rev, elefant og føniks). Definisjonene står i `src/achievements/catalog.ts`, og databasefunksjonen `unlock_achievement` gir belønningen. XP-, egg- og dyre-achievements sjekkes mot databasen. At et spill er mestret, kan databasen ikke se, så de stoler på appen. Belønningene er bare utseende og gir ingen poeng.

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
    app.ts           skallet: topp, hovedmeny, undermeny og nivå-dialog
    home.ts          startsiden med nivå og spillfliser
    settings.ts      innstillinger
    icons.ts         ikonene i menyen
    modes/           én fil per øvingsform
    shop.ts          butikken
    room/            troférommet (motor og isometriske tegnehjelpere)
  themes/
    types.ts         hva et tema består av
    kritisk/         innhold, butikk og rom for Kritiskpuggen
    klima/           innhold, butikk og rom for Klimapuggen
    nyrel/           innhold, julemarked og julehus for Nyreligiøspuggen (KRLE)
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

Se [docs/personvern.md](docs/personvern.md) for hvilke opplysninger som lagres, hvem som ser dem, hvor lenge de lagres og en sjekkliste før bruk. Kort fortalt:

- Elevene kan lese personvernerklæringen i appen og laste ned sine egne data under Innstillinger. Læreren kan laste ned alt om en klasse i lærerrommet.
- Skriftene ligger i appen (`public/fonts`), så ingen IP-adresser sendes til Google Fonts.
- «Husk meg» ved innlogging kan slås av på delte maskiner.
- Topplisten er av som standard for nye klasser.
- Aktivitet slettes automatisk etter 180 dager (`purge_old_data`, kjøres hver natt med pg_cron).
- Databasen godtar høyst 60 XP per minutt per elev.
- Nettsiden sendes med strenge sikkerhetshoder, blant annet Content-Security-Policy (se `vercel.json`).

## Legge til et nytt tema

1. Lag en mappe i `src/themes/` med `content.ts`, `shop.ts`, `room.ts` og `index.ts`. Bruk `kritisk/` som mal.
2. Registrer temaet i `src/themes/index.ts`.
3. Legg til temafarger under `:root[data-tema="ditt-tema"]` i `src/styles/themes.css`.
4. Legg butikkvarene inn i `shop_items` med en ny migrasjon. Prisene i databasen er fasiten.
