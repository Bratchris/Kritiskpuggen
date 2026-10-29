import { cards, Q, T, H, SI } from '../helpers';
import type { Card, QuizItem, TfItem, HullItem, SortItem, FeilItem, OrderPuzzle, ThinkItem, Mode } from '../types';

export const CARDS: Card[] = cards([
['k','Hva er forskjellen på vær og klima?','Vær er været fra dag til dag. Klima er gjennomsnittlig vær over tid.'],
['k','Når kan vi si at klimaendringer er et faktum?','Når værmønstrene gradvis endrer seg år etter år. Én varm dag i mai eller én kjip sommer beviser ingenting.'],
['k','Hva er typisk for norsk klima?','Fire årstider, og vanligvis mer regn om høsten enn om sommeren.'],
['k','Hvilke seks klimasoner finnes det?','Arktisk, subarktisk, temperert, subtropisk, tropisk og ekvatorial klimasone.'],
['k','Hvilke klimasoner ligger Norge i?','Det meste i den tempererte klimasonen, resten i den arktiske.'],
['k','Hvordan er klimaet i den tropiske klimasonen?','Mer enn 18 grader året rundt. Bare to årstider: tørketid og regntid. Noen steder er det ikke årstider i det hele tatt.'],
['k','Er klimaendringer noe nytt?','Nei. Istider, våte og varmere perioder er naturlige sykluser. Men de siste par hundre årene har endringene fått et annet omfang.'],
['k','Hvorfor har CO2-nivået økt de siste to hundre årene?','Vi har brent store mengder kull og olje siden 1700- og 1800-tallet. CO2 i atmosfæren påvirker værmønstrene.'],
['k','1,5-gradersmålet: 1,5 grader i forhold til hva?','Gjennomsnittstemperaturen i førindustriell tid, altså før vi begynte å brenne kull og olje i store mengder.'],
['k','Hva sier forskerne hvis vi fortsetter å leve som i dag?','Gjennomsnittstemperaturen vil mest sannsynlig øke med mer enn 3 grader i løpet av de neste hundre årene.'],
['k','Hva gjør oppvarming med regn og tørke?','Der det regner, kan det regne mer og kraftigere (oversvømmelser og ras). Der det regner lite, kan det regne enda mindre (tørke).'],
['k','Hvilke følger har tørke?','Den påvirker jordbruk og tilgang på drikkevann (for eksempel i Asia), og skogbrannene blir kraftigere.'],
['k','Hva skjer med natur og dyreliv når det blir varmere?','Korallrev dør i varmt hav, og hele økosystemer ødelegges. Arter mister leveområder på polene eller blir fordrevet av tørke.'],
['k','Hva er klimaflyktninger?','Mennesker som blir fordrevet av klimaendringene.'],
['k','Hvilke to hendelser fra sommeren 2025 nevnes?','Store skogbranner på Kreta i juli, og en ekstrem flom i Texas som tok livet av 130 mennesker.'],
['k','Hva må land, bedrifter og enkeltmennesker gjøre?','Land: grønnere politikk og fornybar energi. Bedrifter: bærekraftig produksjon og frakt, og produkter som varer lenger. Enkeltmennesker: tenke gjennom eget forbruk (klær, dusjing, utelys, flyturer).'],
['k','Er det for sent å gjøre noe?','Nei. Vi kan nok ikke stanse klimaendringene helt, men tiltakene som er gjort har gunstig innvirkning på framtiden. Vi må handle nå.'],
['b','Hva betyr bærekraft?','Å kunne gjøre noe igjen og igjen uten å ødelegge for framtidige generasjoners muligheter til å gjøre det samme. Jorda skal kunne «bære» oss.'],
['b','Når er skogdrift bærekraftig?','Når vi feller trær slik at skogens økosystem tas vare på, og samtidig gradvis planter nye trær.'],
['b','Hvorfor er det ikke bærekraftig å felle en hel skog og plante like trær?','Dyr, insekter og bakterier mister hjem, mat og jaktområder. Og det tar lang tid før skogen kan fungere som jordas lunger igjen.'],
['b','Hva er problemet med palmeolje?','Verdens mest brukte planteolje tar plass: regnskog i Sørøst-Asia, Afrika og Sør-Amerika må vike. Karbonfangsten forsvinner, og orangutang og tiger mister leveområder.'],
['b','Hvem introduserte bærekraftig utvikling, og når?','Gro Harlem Brundtland, på FNs generalforsamling i New York i 1987, med rapporten «Vår felles framtid».'],
['b','Hva er FNs definisjon av bærekraftig utvikling?','Utvikling som imøtekommer dagens behov uten å ødelegge mulighetene for at kommende generasjoner skal få dekket sine behov (økonomi, miljø og sosiale forhold).'],
['b','Hva var Brundtlandkommisjonen?','FNs verdenskommisjon for miljø og utvikling. Brundtland ble leder i 1983, og rapporten «Vår felles framtid» kom fem år senere.'],
['b','Hvem er Gro Harlem Brundtland?','Norges første kvinnelige statsminister (tre perioder) og leder av Brundtlandkommisjonen.'],
['b','Hva er de tre dimensjonene i bærekraftig utvikling?','Klima og miljø, sosiale forhold og økonomi. Enklere sagt: natur, samfunn og penger. Alle tre må fungere sammen.'],
['b','Hva handler miljø- og klimadimensjonen om?','Å løse klima- og miljøkrisen: fornybar energi, god skogforvaltning og beskyttelse av artsmangfoldet.'],
['b','Hva handler dimensjonen om sosiale forhold om?','At alle har rett til et godt og verdig liv (menneskerettighetene). Hovedmålet er å bekjempe fattigdom.'],
['b','Hva handler økonomidimensjonen om?','Å redusere forskjellene mellom rik og fattig, med rettferdig fordeling innad i og mellom land. Det skal være lønnsomt å tenke grønt og ikke lønnsomt å forurense.'],
['s','Hva er Parisavtalen?','Den første juridisk bindende klimaavtalen mellom så mange land, inngått i Paris i 2015. Før 2016 var over hadde nesten alle FNs medlemsland sluttet seg til.'],
['s','Hva var nytt med Parisavtalen?','Alle land skulle bidra, ikke bare de rikeste, og det skulle straffe seg å bryte avtalen.'],
['s','Hva er temperaturmålet i Parisavtalen?','Temperaturen på kloden skal ikke stige mer enn 2 grader, helst bare 1,5.'],
['s','Hva skal hvert land gjøre i Parisavtalen?','Sette egne målsetninger ut fra bærekraftsmålene. Hvert femte år skal landene rapportere hvordan de ligger an og sette seg nye, mer ambisiøse mål.'],
['s','Hva er FNs bærekraftsmål?','FNs arbeidsplan for en bærekraftig framtid: 17 mål og 169 delmål, vedtatt i forkant av klimatoppmøtet i Paris.'],
['s','Nevn fire av bærekraftsmålene','Utrydde sult, likestilling mellom kjønnene, bærekraftige byer og ansvarlig produksjon og forbruk.'],
['s','Hvorfor henger «utrydde sult» sammen med alle tre dimensjonene?','Bedre rettigheter for små matprodusenter (særlig kvinner, minoriteter og urfolk) og klimavennlig matproduksjon gir forbedringer i sosiale forhold, økonomi og klima.'],
['s','Hva er forskjellen på tidligere klimaavtaler og Parisavtalen?','Tidligere avtaler gjaldt i hovedsak industrilandene. Parisavtalen gjelder alle land, både høy- og lavinntektsland.'],
['s','Hvilke utfordringer har globale klimaavtaler?','Gjør landene det de sier? Er målene ambisiøse nok? Skal bærekraft nedprioriteres ved krig? Og er det rettferdig at land som først nå har fått industri (som India) tar like mye ansvar som de som har forurenset i to hundre år?'],
['s','Hva er klimakvoter, og hvorfor er Norge kritisert?','Norge betaler andre land for å kutte utslipp og fører kuttene som sine egne. Motargument: det er det totale kuttet som teller.'],
['s','Hvilke eksempler viser at verden kan samarbeide?','Ozonlaget på 80-tallet (gassene ble ulovlige, og ozonlaget er på bedringens vei) og koronapandemien.'],
['s','Hvorfor har det vært vanskelig å mobilisere mot klimatrusselen?','Den har kommet snikende og er blitt oppfattet som noe som først får betydning langt fram i tid.'],
['c','Hvor ligger «klesindustriens kirkegård»?','I Atacama-ørkenen, nord i Chile.'],
['c','Hva skjer i Atacama-ørkenen?','Tonnevis av klær som rike land ikke vil ha, havner der. De danner fjell av søppel som forurenser ørkenen, grunnvannet og havet.'],
['c','Hva er fast fashion?','«Rask mote»: billige klesplagg vi kjøper i store mengder.'],
['c','Hvorfor ender klær fra rike land i Chile?','Vi leverer dem til gjenbruksstasjoner med god samvittighet, men UFF og Fretex kan ikke ta imot alt. Mye sendes videre til tredjeland, som Chile.'],
['c','Hvem er «syndebukken» i teksten om klesfjellet?','Fast fashion.'],
['c','Hvilket bærekraftsmål passer best til klesfjellet?','Ansvarlig produksjon og forbruk. Sammenheng på tvers av tekstene: teksten om klimaendringer spør «Hvor mye klær kjøper vi, og hvor lenge varer klærne?»']
] as [string, string, string][]);

export const QUIZ: QuizItem[] = [
Q('k','Hva er klima?','Gjennomsnittlig vær over tid',['Været akkurat i dag','Kraftig regn og storm','Temperaturen om sommeren'],'Vær er dag til dag. Klima er gjennomsnittet over tid.'),
Q('k','Hva må til før vi kan snakke om klimaendringer?','Værmønstrene endrer seg gradvis år etter år',['En ekstra varm dag i mai','En kjip sommer','Et kraftig uvær i januar'],'Enkeltdager og enkeltsomre beviser ingenting. Det er endring over tid som teller.'),
Q('k','Hva menes med 1,5-gradersmålet?','At oppvarmingen skal holdes under 1,5 grader sammenlignet med førindustriell tid',['At det skal bli 1,5 grader kaldere enn i dag','At temperaturen skal øke med 1,5 grader hvert år','At det er 1,5 grader i Norge om vinteren'],'Vi sammenligner med gjennomsnittstemperaturen før vi begynte å brenne kull og olje i store mengder.'),
Q('k','Hva sier forskerne skjer hvis vi fortsetter å leve som i dag?','Mer enn 3 grader varmere de neste hundre årene',['Ingen endring i temperaturen','Omtrent 0,5 grader kaldere','Nøyaktig 1,5 grader varmere neste år'],'Mest sannsynlig mer enn 3 grader i løpet av de neste hundre årene.'),
Q('k','Hvilken klimasone ligger det meste av Norge i?','Den tempererte',['Den tropiske','Den subtropiske','Den ekvatoriale'],'Det meste av Norge er temperert, resten er arktisk.'),
Q('k','Hva kjennetegner den tropiske klimasonen?','Over 18 grader året rundt, med tørketid og regntid',['Fire årstider med mest regn om høsten','Snø og is store deler av året','Kalde vintre og lyse sommernetter'],'Fire årstider med mest regn om høsten er typisk norsk klima.'),
Q('k','Hva skjer med nedbøren når jorda blir varmere?','Der det regner kan det regne mer, og der det er tørt kan det bli enda tørrere',['Det regner like mye overalt','Det slutter å regne i hele verden','Det regner bare mer, aldri mindre'],'Det kalles ekstremvær: mer av begge deler.'),
Q('k','Hva kalles mennesker som blir fordrevet av klimaendringer?','Klimaflyktninger',['Industriarbeidere','Delegater','Urfolk'],'Klimaendringene fordriver både dyr og mennesker.'),
Q('k','Hva skjer med skogbrannene når tørkeperiodene er lange?','De blir kraftigere',['De blir svakere','De stopper helt','De skjer bare i tropene'],'Lange tørkeperioder har gjort skogbrannene kraftigere rundt om i verden.'),
Q('b','Hva betyr bærekraft?','Å kunne gjøre noe igjen og igjen uten å ødelegge for framtidige generasjoner',['Å bruke så mye ressurser som mulig i dag','Å bare tenke på økonomi','Å plante like trær overalt'],'Jorda skal kunne «bære» oss og handlingene våre.'),
Q('b','Hvem la fram «Vår felles framtid» for FN i 1987?','Gro Harlem Brundtland',['Greta Thunberg','Jens Stoltenberg','Barack Obama'],'Hun ledet også verdenskommisjonen fra 1983, og var Norges første kvinnelige statsminister.'),
Q('b','Hva er de tre dimensjonene i bærekraftig utvikling?','Klima og miljø, sosiale forhold og økonomi',['Skole, jobb og fritid','Luft, vann og jord','Politikk, teknologi og kultur'],'Enklere sagt: natur, samfunn og penger.'),
Q('b','Hvorfor er palmeoljeplantasjer et bærekraftsproblem?','Regnskog må vike, karbonfangsten forsvinner og dyr som orangutang og tiger mister leveområder',['Plantasjene bruker for lite vann','Palmeolje brukes bare i Europa','Palmetrær gir for lite olje'],'Palmeolje er verdens mest brukte planteolje, og produksjonen tar mye plass.'),
Q('b','Hva handler økonomidimensjonen om?','Mindre forskjell på rik og fattig, og at det skal lønne seg å tenke grønt',['At alle land skal tjene like mye penger','At det skal være lønnsomt å slippe ut klimagasser','At fattige land skal betale mest'],'Det skal ikke være lønnsomt å slippe ut klimagasser eller skade miljøet.'),
Q('b','Hva er et eksempel på bærekraftig skogdrift?','Å felle trær skånsomt for økosystemet og plante nye gradvis',['Å felle hele skogen og plante like trær','Å hente alt trevirke fra regnskogen','Å bytte ut skogen med palmetrær'],'En hel skog med like trær mister dyrene sine og blir ikke jordas lunger på lenge.'),
Q('s','Hva var nytt med Parisavtalen?','Første juridisk bindende klimaavtale mellom så mange land, og alle land skulle bidra',['Bare de rikeste landene skulle bidra','Den ble inngått i 1987','Den var ikke bindende'],'Det skulle straffe seg å bryte avtalen.'),
Q('s','Hvor ofte skal landene rapportere og sette nye mål?','Hvert femte år',['Hvert år','Hvert tiende år','Hvert andre år'],'De nye målene skal være mer ambisiøse enn sist.'),
Q('s','Hvor mange mål og delmål har FNs bærekraftsmål?','17 mål og 169 delmål',['10 mål og 100 delmål','17 mål og 196 delmål','20 mål og 169 delmål'],'Delmålene konkretiserer veien til hvert av de 17 målene.'),
Q('s','Hva er klimakvoter?','Å betale andre land for å kutte utslipp og føre kuttene som sine egne',['En grense for hvor mange biler et land kan ha','Penger som går direkte til FN','Et forbud mot å bruke kull'],'Norge har fått kritikk for dette, men motargumentet er at det totale kuttet er det viktigste.'),
Q('s','Hva er et eksempel på at verden har klart å samarbeide?','Gasser som ga ozonhull ble ulovlige på 80-tallet',['Alle land har nådd 1,5-gradersmålet','Plastforbruket er fjernet','Alle klimagassutslipp er kuttet'],'Ozonlaget er siden på bedringens vei. Også under koronapandemien mobiliserte verden.'),
Q('s','Hvilken temperaturgrense setter Parisavtalen?','Ikke mer enn 2 grader, helst 1,5',['Ikke mer enn 5 grader','Ikke mer enn 0,5 grader','Ingen grense'],'Hvert land setter egne mål for å få det til.'),
Q('c','Hvor ligger «klesindustriens kirkegård»?','Atacama-ørkenen i Chile',['Sahara i Egypt','Gobi-ørkenen i Kina','Svalbard'],'Her havner tonnevis av klær fra rike land.'),
Q('c','Hva er fast fashion?','Billige klær vi kjøper i store mengder',['Klær som varer i mange tiår','Dyre designerklær','Klær laget av gjenbruk'],'Det betyr «rask mote».'),
Q('c','Hvorfor sendes mange klær videre til tredjeland?','UFF og Fretex kan ikke ta imot alt som leveres',['Klærne er for gode til å brukes i Norge','Chile ber om å få klærne','Klærne skal resirkuleres av FN'],'Mye sendes videre til tredjeland, som Chile.'),
Q('c','Hva forurenses av klesfjellene i Atacama?','Ørkenen, grunnvannet og havet',['Bare lufta over Norge','Bare regnskogen','Ozonlaget'],'Klærne danner store fjell av søppel.')
];

export const TF: TfItem[] = [
T('k','Klima er været vi ser fra dag til dag.',false,'Det er vær. Klima er gjennomsnittlig vær over tid.'),
T('k','Klimaendringer har aldri skjedd før i jordas historie.',false,'Istider og varmere perioder er naturlige sykluser. Det nye er omfanget de siste par hundre årene.'),
T('k','I tropisk klimasone måler en som regel mer enn 18 grader året rundt.',true),
T('k','Teksten nevner seks klimasoner.',true,'Arktisk, subarktisk, temperert, subtropisk, tropisk og ekvatorial.'),
T('k','1,5-gradersmålet sammenligner med temperaturen i dag.',false,'Det sammenligner med førindustriell tid.'),
T('k','Vi har sluppet ut store mengder CO2 siden vi begynte å brenne kull og olje på 1700- og 1800-tallet.',true),
T('k','Der det regner lite, kan det regne enda mindre når det blir varmere.',true),
T('k','Det er for sent å gjøre noe med klimaendringene.',false,'Det er ikke for sent, men vi må handle nå.'),
T('k','Flommen i Texas sommeren 2025 tok livet av 130 mennesker.',true),
T('b','Begrepet bærekraftig utvikling ble introdusert for FN i 1987.',true),
T('b','Gro Harlem Brundtland ble leder for verdenskommisjonen i 1987.',false,'Hun ble leder i 1983. Rapporten ble lagt fram fem år senere, i 1987.'),
T('b','Palmeolje er verdens mest brukte planteolje.',true),
T('b','Økonomidimensjonen går ut på at det skal være lønnsomt å slippe ut klimagasser.',false,'Det skal ikke være lønnsomt å forurense, men lønnsomt å tenke grønt.'),
T('b','Å felle en hel skog og plante like trær er bærekraftig.',false,'Økosystemet mister hjem og mat, og det tar lang tid før skogen fungerer som jordas lunger igjen.'),
T('b','Hovedmålet i dimensjonen om sosiale forhold er å bekjempe fattigdom.',true),
T('b','Gro Harlem Brundtland var Norges første kvinnelige statsminister.',true),
T('s','Parisavtalen ble inngått i 2015.',true),
T('s','Parisavtalen gjaldt bare de rikeste landene.',false,'Den gjaldt alle land, både høy- og lavinntektsland.'),
T('s','Landene skal rapportere hvert tiende år.',false,'De skal rapportere hvert femte år.'),
T('s','FNs bærekraftsmål har 17 mål og 169 delmål.',true),
T('s','Parisavtalen var den første juridisk bindende klimaavtalen mellom så mange land.',true),
T('s','Tidligere klimaavtaler gjaldt i hovedsak industrilandene.',true),
T('s','Norge kan kjøpe klimakvoter og føre kuttene som sine egne.',true),
T('s','Verden klarte aldri å samarbeide om ozonlaget.',false,'På 80-tallet ble gassene som skapte ozonhull ulovlige, og ozonlaget er på bedringens vei.'),
T('c','UFF og Fretex tar imot alle klær som blir levert.',false,'De kan ikke ta imot alt, og mye sendes videre til tredjeland.'),
T('c','Klesfjellene ligger i Atacama-ørkenen i Argentina.',false,'Atacama-ørkenen ligger i Chile.'),
T('c','Fast fashion betyr «rask mote».',true),
T('c','Klesfjellene forurenser ørkenen, grunnvannet og havet.',true)
];

export const HULL: HullItem[] = [
H('k','Vær er været fra dag til dag. ___ er gjennomsnittlig vær over tid.',['klima']),
H('s','Parisavtalen ble inngått i ___ (årstall).',['2015']),
H('s','FNs bærekraftsmål består av ___ mål og 169 delmål.',['17','sytten']),
H('s','Landene skal rapportere hvert ___ år og sette seg mer ambisiøse mål.',['femte','5']),
H('b','Bærekraftig utvikling har tre dimensjoner: miljø og klima, ___ forhold og økonomi.',['sosiale']),
H('b','Gro Harlem Brundtland la fram rapporten «Vår felles ___».',['framtid','fremtid']),
H('k','1,5-gradersmålet sammenligner med ___ tid, før vi brente kull og olje i store mengder.',['førindustriell','forindustriell']),
H('k','I den ___ klimasonen er det over 18 grader året rundt.',['tropiske','tropisk']),
H('c','Fast fashion betyr «___ mote».',['rask']),
H('c','Klærne i Atacama-ørkenen i ___ forurenser ørkenen, grunnvannet og havet.',['chile']),
H('k','Mennesker som blir fordrevet av klimaendringene kalles ___.',['klimaflyktninger','klimaflyktning']),
H('s','Norge kan kjøpe ___ og føre kuttene som sine egne.',['klimakvoter','klimakvote']),
H('b','Palmeolje er verdens mest brukte ___.',['planteolje']),
H('k','Siden 1700- og 1800-tallet har vi sluppet ut store mengder ___ ved å brenne kull og olje.',['co2']),
H('s','Temperaturen skal ikke stige mer enn ___ grader, helst bare 1,5.',['2','to'])
];

export const PAIRS: [string, string][] = [
['Vær','Været fra dag til dag'],
['Klima','Gjennomsnittlig vær over tid'],
['Parisavtalen','Første juridisk bindende klimaavtale (2015)'],
['Brundtland','La fram «Vår felles framtid» (1987)'],
['Fast fashion','Billige klær kjøpt i store mengder'],
['Atacama','Ørken i Chile med fjell av klær'],
['Klimakvoter','Betale andre land for å kutte utslipp'],
['Klimaflyktning','Menneske fordrevet av klimaendringer'],
['Ekstremvær','Kraftigere regn og lengre tørke'],
['Palmeolje','Regnskog må vike for plantasjer'],
['Førindustriell tid','Før vi brant kull og olje i store mengder'],
['Bærekraft','Gjøre noe igjen og igjen uten å ødelegge for framtiden'],
['Delmål','169 stykker under de 17 bærekraftsmålene'],
['Tropisk klimasone','Over 18 grader, tørketid og regntid']
];

export const ORDER: OrderPuzzle[] = [
{ title: 'Klimatidslinjen', intro: 'Sett hendelsene i riktig rekkefølge, eldst øverst.', items: [
  ['Vi begynner å brenne kull og olje i store mengder','1700- og 1800-tallet'],
  ['Brundtland blir leder for FNs verdenskommisjon','1983'],
  ['«Vår felles framtid» legges fram for FN i New York','1987'],
  ['Parisavtalen inngås i Paris','2015'],
  ['Nesten alle FNs medlemsland har sluttet seg til Parisavtalen','2016'],
  ['Skogbranner på Kreta og flom i Texas','Sommeren 2025'] ] },
{ title: 'Klimakjeden', intro: 'Årsak og virkning: hva fører til hva? Start med årsaken øverst.', items: [
  ['Vi brenner kull og olje i store mengder','Steg 1'],
  ['CO2-nivået i atmosfæren øker','Steg 2'],
  ['Værmønstrene på jorda endrer seg','Steg 3'],
  ['Vi får mer ekstremvær: kraftigere regn og lengre tørke','Steg 4'],
  ['Flom, ras, tørke og skogbranner rammer folk og dyr','Steg 5'] ] },
{ title: 'Klesplaggets reise', intro: 'Følg et billig plagg fra butikken til Atacama-ørkenen.', items: [
  ['Billige klær kjøpes i store mengder i rike land','Steg 1'],
  ['Klærne leveres til gjenbruksstasjoner med god samvittighet','Steg 2'],
  ['UFF og Fretex kan ikke ta imot alt som leveres','Steg 3'],
  ['Resten sendes videre til tredjeland, som Chile','Steg 4'],
  ['Klesfjell hoper seg opp i Atacama og forurenser ørkenen, grunnvannet og havet','Steg 5'] ] }
];

export const SORT: SortItem[] = [
SI('Satse på fornybar energi','klima','Fornybar energi nevnes under miljø- og klimadimensjonen.'),
SI('God skogforvaltning','klima','Nevnt under miljø- og klimadimensjonen.'),
SI('Beskytte artsmangfoldet','klima','Nevnt under miljø- og klimadimensjonen.'),
SI('Ta vare på naturen og atmosfæren','klima','Det er kjernen i miljø- og klimadimensjonen.'),
SI('Bekjempe fattigdom','sosial','Hovedmålet i dimensjonen om sosiale forhold.'),
SI('Menneskerettighetene','sosial','Sosiale forhold henger sammen med menneskerettighetene.'),
SI('At alle har rett til et godt og verdig liv','sosial','Det er selve poenget med dimensjonen om sosiale forhold.'),
SI('Redusere forskjellene mellom rik og fattig','okon','Det er kjernen i økonomidimensjonen.'),
SI('Rettferdig fordeling av goder, innad i og mellom land','okon','Nevnt under økonomidimensjonen.'),
SI('Det skal være lønnsomt å tenke grønt','okon','Nevnt under økonomidimensjonen.'),
SI('Det skal ikke være lønnsomt å slippe ut klimagasser','okon','Nevnt under økonomidimensjonen.'),
SI('Utrydde sult','alle','Teksten om bærekraftsmålene sier at å utrydde sult gir forbedringer i sosiale forhold, økonomi og klima.')
];

export const THINK: ThinkItem[] = [
{ id: 'kvoter', q: 'Norge kan kjøpe klimakvoter. Er det greit å kjøpe seg ut av ansvaret?',
  boxes: [
   { h: 'Argumenter for', items: ['Det er det totale klimagasskuttet som er det viktige i klimakampen.', 'Så lenge kuttene gjennomføres, er det kanskje likegyldig hvem som utfører dem.'] },
   { h: 'Argumenter mot', items: ['Norge har mye penger og kan føre andre lands kutt som sine egne.', 'Norge har fått kritikk i det globale samarbeidet for dette.'] } ],
  keys: [['klimakvoter','klimakvot'],['utslipp','utslipp'],['totale kutt','total'],['Norge','norge'],['rettferdig','rettferd']] },
{ id: 'india', q: 'Bør India bremse sin industrielle utvikling fordi vi nærmer oss en klimagrense?',
  boxes: [
   { h: 'Argumenter for å bremse', items: ['Parisavtalen gjelder alle land, både høy- og lavinntektsland.', 'Temperaturen skal ikke stige mer enn 2 grader, helst bare 1,5.'] },
   { h: 'Argumenter mot', items: ['Mange mener det er urettferdig at land som først nå har fått industri, tar like mye ansvar som de som har forurenset i to hundre år.', 'Grensen vi nærmer oss, er en grense vestlige land har ført oss til.'] } ],
  keys: [['India','india'],['industrilandene','industri'],['rettferdig','rettferd'],['Parisavtalen','paris'],['lavinntektsland','lavinntekt']] },
{ id: 'klaer', q: 'Hvem har ansvaret for klesfjellet i Atacama: de som kjøper klærne, eller de som lager dem?',
  boxes: [
   { h: 'Forbrukerne', items: ['Vi kjøper billige klær i store mengder.', 'Vi leverer dem til gjenbruksstasjoner med god samvittighet.', 'Vi bør tenke gjennom eget forbruk: Hvor mye klær kjøper vi, og hvor lenge varer de?'] },
   { h: 'Bedrifter og land', items: ['Bedrifter må bli mer bærekraftige i hvordan ting produseres og fraktes, og hvor lenge produkter er ment å vare.', 'Landene må føre en grønnere politikk.', 'UFF og Fretex kan ikke ta imot alt, så mye sendes videre til tredjeland.'] } ],
  keys: [['fast fashion','fast fashion'],['ansvarlig produksjon og forbruk','ansvarlig'],['forbruk','forbruk'],['Chile','chile'],['tredjeland','tredjeland'],['gjenbruk','gjenbruk']] },
{ id: 'dim', q: 'Forklar med egne ord: Hvorfor må klima, samfunn og økonomi henge sammen for at noe skal være bærekraftig? Bruk «utrydde sult» eller klesfjellet som eksempel.',
  boxes: [
   { h: 'Fra tekstene', items: ['Alle tre dimensjonene må fungere sammen for at noe skal regnes som bærekraftig.', 'Å utrydde sult gir forbedringer i både sosiale forhold, økonomi og klima.', 'Bærekraftig utvikling handler om natur, samfunn og penger.'] } ],
  keys: [['klima og miljø','klima'],['sosiale forhold','sosial'],['økonomi','økonomi'],['bærekraft','bærekraft'],['framtidige generasjoner','framtid']] }
];

export const MODES: Mode[] = [
 { id: 'kort', name: 'Kortstokken', desc: 'Snu kortet og si om du kan det eller må øve mer. Kortene du kan, legges bort.', f: 1, g: 1 },
 { id: 'quiz', name: 'Quiz', desc: 'Ti spørsmål med fire svar. Du får forklaringen med en gang.', f: 1 },
 { id: 'tf', name: 'Sant eller usant', desc: 'Avslør hva som er sant og hva som er rene løgner.', f: 1 },
 { id: 'par', name: 'Parkoblingen', desc: 'Trykk på et begrep til venstre, og deretter på forklaringen til høyre.', f: 0 },
 { id: 'memo', name: 'Memory', desc: 'Kortene ligger med baksiden opp. Snu to og finn begrepet og forklaringen som hører sammen.', f: 0 },
 { id: 'ord', name: 'Rekkefølgen', desc: 'Sett hendelser og årsaker i riktig rekkefølge.', f: 0 },
 { id: 'sort', name: 'Kurvene', desc: 'Hører det til klima og miljø, sosiale forhold, økonomi, eller alle tre?', f: 0 },
 { id: 'hull', name: 'Hull i teksten', desc: 'Skriv ordet som mangler. Her må du huske, ikke gjette.', f: 1 },
 { id: 'tenk', name: 'Tenk selv', desc: 'Øv på spørsmål der du må argumentere og se sammenhenger.', f: 0 },
 { id: 'shop', name: 'Kaffebutikken', desc: 'Bruk poengene dine på digitale kaffegaver til læreren. Jo mer du øver, jo større gaver kan du kjøpe.', f: 0, g: 1 },
 { id: 'rom', name: 'Troférommet', desc: 'Stig i nivå for å låse opp trofeer.', f: 0, g: 1 },
 { id: 'top', name: 'Topplisten', desc: 'Hvem i klassen har samlet mest XP? Plassen din oppdateres når du tjener poeng.', f: 0, g: 1 }
];

export const FEIL: FeilItem[] = [];
