import { achieve } from '../../achievements/engine';
import { $, esc, norm } from '../../lib/dom';
import { S, T, head, panel, save } from '../core';

/** Krav for achievementet «Filosof»: et ordentlig svar, ikke bare begrepene ramset opp. */
export const FILOSOF = { words: 40, sentences: 3, otherWords: 30, unique: 25 };

/** Sjekker om et svar holder til «Filosof». Returnerer tallene, så eleven kan se hva som mangler. */
export function judgeAnswer(text: string, keys: [string, string][]): { ok: boolean; words: number; sentences: number; keys: number } {
  const v = norm(text);
  // Ord med minst to bokstaver og en vokal. Tilfeldige tastetrykk som «sdfg» teller ikke.
  const words = text.toLowerCase().split(/[^a-zæøåéü0-9-]+/).filter((w) => w.length > 1 && /[aeiouyæøåé]/.test(w));
  const other = words.filter((w) => !keys.some((k) => w.indexOf(k[1].split(' ')[0]) > -1));
  // En setning må ha minst fire ord.
  const sentences = text.split(/[.!?]+/).filter((x) => x.trim().split(/\s+/).filter(Boolean).length >= 4).length;
  const nKeys = keys.filter((k) => v.indexOf(k[1]) > -1).length;
  const ok = keys.length > 0 && nKeys === keys.length && words.length >= FILOSOF.words && sentences >= FILOSOF.sentences &&
    other.length >= FILOSOF.otherWords && new Set(words).size >= FILOSOF.unique;
  return { ok, words: words.length, sentences, keys: nKeys };
}

/** Stjernetegnene, med det astrologien sier om dem. Brukes i oppgaven «Hvilket stjernetegn er du?». */
export const ZODIAC: { id: string; name: string; sym: string; dates: string; traits: string }[] = [
  { id: 'varen', name: 'Væren', sym: '♈', dates: '21. mars – 19. april', traits: 'modig, energisk og utålmodig, og liker å gå foran' },
  { id: 'tyren', name: 'Tyren', sym: '♉', dates: '20. april – 20. mai', traits: 'tålmodig, pålitelig og sta, og glad i trygghet og god mat' },
  { id: 'tvillingene', name: 'Tvillingene', sym: '♊', dates: '21. mai – 20. juni', traits: 'nysgjerrig, pratsom og rastløs, og tilpasser seg lett' },
  { id: 'krepsen', name: 'Krepsen', sym: '♋', dates: '21. juni – 22. juli', traits: 'omsorgsfull, følsom og glad i hjemmet' },
  { id: 'loven', name: 'Løven', sym: '♌', dates: '23. juli – 22. august', traits: 'selvsikker, raus og stolt, og liker oppmerksomhet' },
  { id: 'jomfruen', name: 'Jomfruen', sym: '♍', dates: '23. august – 22. september', traits: 'nøyaktig, praktisk og hjelpsom, men kan være kritisk' },
  { id: 'vekten', name: 'Vekten', sym: '♎', dates: '23. september – 22. oktober', traits: 'rettferdig, sosial og diplomatisk, men ofte ubesluttsom' },
  { id: 'skorpionen', name: 'Skorpionen', sym: '♏', dates: '23. oktober – 21. november', traits: 'lidenskapelig, lojal og intens, og litt hemmelighetsfull' },
  { id: 'skytten', name: 'Skytten', sym: '♐', dates: '22. november – 21. desember', traits: 'eventyrlysten, optimistisk og ærlig' },
  { id: 'steinbukken', name: 'Steinbukken', sym: '♑', dates: '22. desember – 19. januar', traits: 'ambisiøs, disiplinert og ansvarsfull' },
  { id: 'vannmannen', name: 'Vannmannen', sym: '♒', dates: '20. januar – 18. februar', traits: 'original, selvstendig og idealistisk' },
  { id: 'fiskene', name: 'Fiskene', sym: '♓', dates: '19. februar – 20. mars', traits: 'fantasifull, empatisk og drømmende' },
];
const wordCount = (t: string) => t.trim().split(/\s+/).filter((w) => /[a-zæøå]/i.test(w)).length;
/** En oppgave regnes som besvart (hake i oversikten) fra 20 ord. */
const ANSWERED = 20;

export function renderThink(): void {
  const p = panel(), list = T.content.think;
  const z = S.cur.tenk || (S.cur.tenk = { i: Math.max(0, list.findIndex((t) => wordCount(S.notes[t.id] || '') < ANSWERED)) });
  if (z.i >= list.length) z.i = 0;
  const t = list[z.i], done = list.filter((x) => wordCount(S.notes[x.id] || '') >= ANSWERED).length;
  const signId = S.notes[t.id + ':tegn'] || '', sign = ZODIAC.find((x) => x.id === signId);

  p.innerHTML = head('tenk') +
    '<div class="thinknav"><div class="thinkprog"><b>' + done + ' av ' + list.length + '</b> besvart<span class="meter" aria-hidden="true"><i style="width:' + Math.round(done / list.length * 100) + '%"></i></span></div>' +
    '<div class="thinkdots" role="tablist" aria-label="Refleksjonsoppgaver">' + list.map((x, j) => '<button type="button" role="tab" class="tdot' + (j === z.i ? ' on' : '') + (wordCount(S.notes[x.id] || '') >= ANSWERED ? ' ok' : '') + '" data-ti="' + j + '" aria-selected="' + (j === z.i) + '" aria-label="Oppgave ' + (j + 1) + '">' + (wordCount(S.notes[x.id] || '') >= ANSWERED ? '✓' : j + 1) + '</button>').join('') + '</div></div>' +
    '<section class="think"><p class="eyebrow">Oppgave ' + (z.i + 1) + ' av ' + list.length + '</p><h3>' + esc(t.q) + '</h3>' +
    (t.zodiac ? '<div class="zodiac" role="radiogroup" aria-label="Velg stjernetegnet ditt">' + ZODIAC.map((x) => '<button type="button" role="radio" class="zsign' + (x.id === signId ? ' on' : '') + '" aria-checked="' + (x.id === signId) + '" data-z="' + x.id + '"><span class="zsym" aria-hidden="true">' + x.sym + '︎</span><b>' + esc(x.name) + '</b><small>' + esc(x.dates) + '</small></button>').join('') + '</div>' +
      (sign ? '<div class="zcard"><span class="zsym big" aria-hidden="true">' + sign.sym + '︎</span><div><b>' + esc(sign.name) + '</b><p>Ifølge astrologien er ' + esc(sign.name.toLowerCase()) + ' ' + esc(sign.traits) + '. Stemmer det med hvordan du ser deg selv? Passer det kanskje på andre også?</p></div></div>' : '<p class="keyhint">Velg stjernetegnet ditt for å se hva astrologien sier om det.</p>') : '') +
    '<details><summary>Se hva teksten sier</summary><div class="cols">' +
    t.boxes.map((b) => '<div class="box"><h4>' + esc(b.h) + '</h4><ul>' + b.items.map((i) => '<li>' + esc(i) + '</li>').join('') + '</ul></div>').join('') + '</div></details>' +
    (t.starters ? '<div class="starters"><span class="lbl2">Står du fast? Start med</span>' + t.starters.map((x, j) => '<button type="button" class="chip starter" data-st="' + j + '">' + esc(x) + '</button>').join('') + '</div>' : '') +
    '<label class="lbl2" for="ta-' + t.id + '">Ditt svar</label><textarea id="ta-' + t.id + '" rows="7" maxlength="4000" placeholder="Skriv tre til fem setninger med egne ord. Begrunn det du mener."></textarea>' +
    '<div class="thinkfoot"><span class="wc" id="wc-' + t.id + '"></span><div class="keys" id="keys-' + t.id + '">' + t.keys.map((k) => '<span class="key">' + esc(k[0]) + '</span>').join('') + '</div></div>' +
    '<p class="keyhint">Begreper du bruker i svaret, lyser opp. Svaret lagres automatisk.</p><p class="keyhint filo" id="filo-' + t.id + '" aria-live="polite"></p>' +
    '<div class="row thinkbtns"><button class="btn" type="button" id="t-prev"' + (z.i === 0 ? ' disabled' : '') + '>Forrige</button><button class="btn primary" type="button" id="t-nxt">' + (z.i + 1 >= list.length ? 'Til første oppgave' : 'Neste oppgave') + '</button></div></section>';

  const ta = $('#ta-' + t.id) as HTMLTextAreaElement;
  ta.value = S.notes[t.id] || '';
  const upd = () => {
    const v = norm(ta.value), n = wordCount(ta.value);
    $('#keys-' + t.id).querySelectorAll('.key').forEach((el: HTMLElement, i: number) => { el.classList.toggle('on', v.indexOf(t.keys[i][1]) > -1); });
    $('#wc-' + t.id).textContent = n + (n === 1 ? ' ord' : ' ord');
    const dot = p.querySelector('[data-ti="' + z.i + '"]') as HTMLElement | null;
    if (dot) { const ok = n >= ANSWERED; dot.classList.toggle('ok', ok); dot.textContent = ok ? '✓' : String(z.i + 1); }
    const j = judgeAnswer(ta.value, t.keys), f = $('#filo-' + t.id);
    if (j.ok) achieve('tenk_begreper');
    f.textContent = S.ach.has('tenk_begreper') || !S.achReady || !ta.value.trim() ? '' :
      'Achievementet «Filosof»: ' + Math.min(j.words, FILOSOF.words) + ' av ' + FILOSOF.words + ' ord, ' + Math.min(j.sentences, FILOSOF.sentences) + ' av ' + FILOSOF.sentences + ' setninger og ' + j.keys + ' av ' + t.keys.length + ' begreper.' +
      (j.words >= FILOSOF.words && j.sentences >= FILOSOF.sentences && j.keys === t.keys.length && !j.ok ? ' Forklar mer med egne ord.' : '');
  };
  ta.addEventListener('input', () => { S.notes[t.id] = ta.value; save(); upd(); });
  upd();
  // Setningsstarteren settes inn der markøren står, på en ny linje hvis det allerede står noe.
  p.querySelectorAll('[data-st]').forEach((b: HTMLElement) => {
    b.onclick = () => {
      const x = t.starters![+b.dataset.st!].replace(/\s*…\s*$/, ' ').replace(/\s*…\s*/, ' … ');
      const pre = ta.value && !/\s$/.test(ta.value) ? (/[.!?]$/.test(ta.value.trim()) ? ' ' : '. ') : '';
      ta.value = ta.value + pre + x; S.notes[t.id] = ta.value; save(); upd();
      ta.focus(); const pos = ta.value.indexOf('…', ta.value.length - x.length - 1); if (pos > -1) ta.setSelectionRange(pos, pos + 1); else ta.setSelectionRange(ta.value.length, ta.value.length);
    };
  });
  p.querySelectorAll('[data-z]').forEach((b: HTMLElement) => { b.onclick = () => { S.notes[t.id + ':tegn'] = b.dataset.z!; save(); renderThink(); const f = p.querySelector('[data-z="' + b.dataset.z + '"]') as HTMLElement | null; if (f) f.focus({ preventScroll: true }); }; });
  p.querySelectorAll('[data-ti]').forEach((b: HTMLElement) => { b.onclick = () => { z.i = +b.dataset.ti!; renderThink(); window.scrollTo(0, 0); }; });
  $('#t-prev').onclick = () => { if (z.i > 0) { z.i--; renderThink(); window.scrollTo(0, 0); } };
  $('#t-nxt').onclick = () => { z.i = (z.i + 1) % list.length; renderThink(); window.scrollTo(0, 0); };
}
