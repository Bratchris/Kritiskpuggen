# Personvern og sikkerhet i Puggen

Dette dokumentet er for læreren og skolen. Det beskriver hvilke personopplysninger appen behandler, hvor de lagres, og hva skolen bør ha på plass før appen brukes i klassen. Elevene finner en kortere forklaring i appen under «Personvern: hva lagres om deg?» på innloggingssiden og under Innstillinger.

## Roller

- **Behandlingsansvarlig:** skolen (skoleeieren). Læreren oppretter klassen og elevkontoene på vegne av skolen.
- **Databehandlere:** Supabase (database og innlogging) og Vercel (leverer nettsiden). Skolen bør inngå databehandleravtale med begge. Supabase og Vercel tilbyr standardavtaler (DPA) på nettsidene sine.
- **Behandlingsgrunnlag:** skolen avgjør dette. For elever er det normalt skolens oppgave med å gi opplæring, GDPR artikkel 6 nr. 1 bokstav e.

## Hvilke opplysninger

| Opplysning | Hvem | Hvorfor | Hvor lenge |
| --- | --- | --- | --- |
| Navn eller kallenavn, brukernavn, klasse | Elev | Innlogging og lærerens oversikt | Til kontoen eller klassen slettes |
| Kode (passord), bare som hash | Elev | Innlogging | Til kontoen slettes |
| XP, poeng, kort, troférom, avatar, kostymer, bakgrunner, egg, dyr, achievements, dagens mål | Elev | Selve læringsspillet | Til kontoen slettes |
| Svar i «Tenk selv» (fritekst) | Elev | Øving, læreren kan lese | Til kontoen slettes |
| Gaver til læreren | Elev | Belønning | Til kontoen slettes |
| Aktivitet per spill og dag (antall svar, riktige, XP, tid) | Elev | Lærerens spilloversikt, oppdage grinding | Slettes automatisk etter 180 dager |
| Siste innlogging | Elev | Lærerens oversikt | Til kontoen slettes |
| Navn og e-post | Lærer | Innlogging | Til kontoen slettes |

Elevkontoene har ingen ekte e-postadresse. Appen bruker ingen informasjonskapsler for sporing, ingen annonser og ingen analyseverktøy. Skriftene ligger i appen selv, så ingen IP-adresser sendes til Google.

Fritekst i «Tenk selv» kan inneholde personopplysninger eleven skriver selv. Be elevene om ikke å skrive sensitive opplysninger der.

## Tilgangsstyring

- Radsikkerhet (RLS) er slått på for alle tabeller. En elev kan bare lese sine egne data. En lærer kan bare lese data for elever i egne klasser.
- Alle endringer går gjennom databasefunksjoner som sjekker hvem som spør. Ingen kan skrive direkte i tabellene fra nettleseren.
- Klassekamerater ser bare topp 3 i topplisten, og bare hvis læreren har slått den på. Topplisten er av som standard for nye klasser.
- Service-nøkkelen brukes bare i edge-funksjonen `manage-students`, aldri i nettleseren.

## Sikkerhetstiltak

- **Husk meg:** på delte maskiner kan eleven ta bort haken ved innlogging. Da lagres innloggingen bare til nettleseren lukkes, og klassekode og brukernavn huskes ikke.
- **Sterkere koder:** nye elevkoder har form som `bjørn-4821` (360 000 kombinasjoner). Supabase begrenser i tillegg antall innloggingsforsøk.
- **Fartsgrense for poeng:** databasen godtar høyst 60 XP per minutt per elev, så poeng ikke kan skrus opp med et skript.
- **Sikkerhetshoder:** nettsiden sendes med Content-Security-Policy, HSTS, `X-Frame-Options: DENY`, en streng `Permissions-Policy` og `Referrer-Policy` (se `vercel.json`).
- **Automatisk sletting:** funksjonen `purge_old_data` sletter aktivitet eldre enn 180 dager. Den kjøres hver natt med pg_cron når utvidelsen er slått på.

## Rettighetene til eleven

- **Innsyn:** eleven kan laste ned sine egne data under Innstillinger → «Last ned dataene mine». Læreren kan laste ned alt om hele klassen under «Innstillinger for klassen» → «Last ned klassens data».
- **Retting:** læreren kan endre navn ved å slette og opprette eleven på nytt, eller rette det direkte i Supabase.
- **Sletting:** læreren sletter en elev eller hele klassen i lærerrommet. Da slettes alt om eleven.

## Sjekkliste før bruk

1. Supabase-prosjektet ligger i en EU-region.
2. Databehandleravtale med Supabase og Vercel er på plass, eller skolen har godkjent bruken.
3. Alle migrasjonene er kjørt, også `20261102000000_security.sql`.
4. pg_cron er slått på (Database → Extensions), slik at aktivitet slettes automatisk.
5. Bruk fornavn eller kallenavn på elevene, ikke fullt navn.
6. Vurder om topplisten skal være på for klassen.
7. Lagre nedlastede klassefiler trygt, og slett dem når de ikke trengs.
