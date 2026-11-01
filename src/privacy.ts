// Personvern: erklæringen eleven og læreren kan lese, og «Last ned dataene mine».
import { esc } from './lib/dom';
import { supabase } from './lib/supabase';

const SECTIONS: [string, string[]][] = [
  ['Hvem er ansvarlig?', [
    'Skolen din er behandlingsansvarlig for opplysningene i Puggen. Det er læreren som oppretter klassen og elevkontoene, og skolen avgjør behandlingsgrunnlaget. For elever er det normalt skolens oppgave med å gi opplæring (GDPR artikkel 6 nr. 1 bokstav e).',
    'Har du spørsmål, kan du spørre læreren din eller personvernombudet på skolen.',
  ]],
  ['Hva lagres om elever?', [
    'Navnet eller kallenavnet læreren skrev inn, brukernavnet ditt og hvilken klasse du går i. Elevkontoen har ingen e-postadresse. Koden din lagres bare kryptert (som et hash), så heller ikke læreren kan lese den.',
    'Fremgangen din: XP og poeng, hvilke kort du kan, det du skriver i «Tenk selv», troférommet, avataren, kostymer, bakgrunner, egg og dyr, achievements, dagens mål og rekka di, og gaver du har kjøpt til læreren.',
    'Aktivitet i spillene: per spill og dag lagres antall svar, hvor mange som var riktige, XP og hvor lang tid du brukte. Selve svarene lagres ikke. Aktiviteten slettes automatisk etter 180 dager.',
    'Når du sist var innlogget.',
  ]],
  ['Hva lagres om lærere?', ['Navn, e-postadresse og klassene læreren har laget.']],
  ['Hvem ser opplysningene?', [
    'Du ser alt om deg selv. Læreren din ser fremgangen, aktiviteten, gavene, dyrene, achievementene og svarene i «Tenk selv» for elevene i sine egne klasser.',
    'Klassekameratene dine ser bare topp 3 i topplisten (navn og XP), og bare hvis læreren har slått topplisten på. Andre elever kan aldri se hva du har skrevet, og poengene dine bare hvis du er blant topp 3.',
  ]],
  ['Hvor lagres det?', [
    'Databasen og innloggingen ligger hos Supabase, i en region i EU. Selve nettsiden leveres av Vercel, som kan se IP-adressen din i vanlige serverlogger.',
    'Skriftene ligger i appen selv, så ingenting sendes til Google. Appen har ingen annonser, ingen sporing og ingen analyseverktøy.',
  ]],
  ['Hva lagres på enheten din?', [
    'Nettleseren lagrer innloggingen din. Med «Husk meg» varer den til du logger ut, uten haken til nettleseren lukkes. Nettleseren husker også valgene i Innstillinger og siste klassekode og brukernavn hvis du valgte «Husk meg». Appen bruker ingen informasjonskapsler for sporing.',
  ]],
  ['Hvor lenge?', [
    'Opplysningene ligger til læreren sletter kontoen din eller klassen. Da slettes alt om deg, også fremgang, gaver, dyr og aktivitet. Aktivitet i spillene slettes uansett etter 180 dager.',
  ]],
  ['Rettighetene dine', [
    'Du kan få se alt som er lagret om deg. Trykk på «Last ned dataene mine» i Innstillinger, eller spør læreren.',
    'Du kan be om å få rettet feil, for eksempel navnet ditt, og be om å få kontoen slettet. Snakk med læreren eller skolen.',
    'Du kan klage til Datatilsynet hvis du mener opplysningene dine behandles feil.',
  ]],
];

export function privacyHTML(): string {
  return SECTIONS.map(([h, ps]) => '<h3>' + esc(h) + '</h3>' + ps.map((p) => '<p>' + esc(p) + '</p>').join('')).join('');
}

/** Personvernerklæringen i et eget vindu. */
export function showPrivacy(): void {
  const back = document.activeElement as HTMLElement | null;
  const el = document.createElement('div');
  el.className = 'petpop privpop'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-labelledby', 'priv-t');
  el.innerHTML = '<div class="petbox privbox"><h2 id="priv-t">Personvern i Puggen</h2>' + privacyHTML() + '<div class="row"><button class="btn primary" type="button" id="priv-x">Lukk</button></div></div>';
  document.body.appendChild(el);
  const close = () => { el.remove(); document.removeEventListener('keydown', key); back?.focus({ preventScroll: true }); };
  const key = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
  document.addEventListener('keydown', key);
  el.addEventListener('click', (e) => { if (e.target === el) close(); });
  const x = el.querySelector('#priv-x') as HTMLElement; x.onclick = close; x.focus({ preventScroll: true });
}

/** Lagrer et objekt som en JSON-fil på enheten. */
export function downloadJSON(name: string, data: unknown): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

/** Alt som er lagret om den innloggede eleven og som eleven selv har lov til å lese. */
export async function exportMine(preview: boolean): Promise<Record<string, unknown>> {
  const out: Record<string, unknown> = { laget: new Date().toISOString(), forklaring: 'Alt Puggen har lagret om deg. Koden din er ikke med, fordi den bare lagres kryptert.' };
  if (preview) {
    const keys = Object.keys(localStorage).filter((k) => k.startsWith('puggen-preview'));
    for (const k of keys) { try { out[k] = JSON.parse(localStorage.getItem(k) || 'null'); } catch { out[k] = localStorage.getItem(k); } }
    return out;
  }
  const { data: u } = await supabase.auth.getUser();
  const id = u.user?.id ?? '';
  const q = async (name: string, run: () => PromiseLike<{ data: unknown; error: unknown }>) => { const r = await run(); out[name] = r.error ? 'Kunne ikke hentes' : r.data; };
  await q('profil', () => supabase.from('profiles').select('display_name, username, role, created_at, last_seen, avatar').eq('id', id).maybeSingle());
  await q('klasse', () => supabase.from('classes').select('name, themes'));
  await q('fremgang', () => supabase.from('progress').select('theme, points, spent, state, updated_at'));
  await q('gaver', () => supabase.from('gifts').select('theme, item_id, price, created_at'));
  await q('kostymer_og_bakgrunner', () => supabase.from('wardrobe').select('theme, item_id, created_at'));
  await q('egg_og_dyr', () => supabase.from('pets').select('*'));
  await q('achievements', () => supabase.from('achievements').select('id, unlocked_at'));
  out.aktivitet = 'Aktiviteten i spillene (antall svar, riktige, XP og tid per dag) kan bare læreren se. Spør læreren om du vil ha den.';
  return out;
}
