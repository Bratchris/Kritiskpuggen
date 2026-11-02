// Feilbanken: spørsmål eleven har svart feil på i quiz, sant eller usant, hull i teksten og kurvene.
// Riktig svar her fjerner spørsmålet fra banken. Poengene deles med det vanlige spillet (samme nøkkel
// i earnOnce), så det lønner seg ikke å svare feil med vilje for å få spørsmål hit. Ingen bonus.
import { $, esc, norm, shuffle } from '../../lib/dom';
import { S, T, head, panel, focusMain, track, mark, earnOnce, earnedToday, recordMiss, clearMiss, tag } from '../core';

interface Item { key: string; kind: string; idx: number; t?: string; q: string; opts?: string[]; ci?: number; answers?: string[]; e: string; n: number; base: number }
const KIND: Record<string, string> = { quiz: 'Quiz', tf: 'Sant eller usant', hull: 'Hull i teksten', sort: 'Kurvene' };

/** Gjør en nøkkel som «quiz:12» om til et spørsmål. Null hvis innholdet ikke finnes lenger. */
function itemOf(key: string): Item | null {
  const [kind, raw] = key.split(':'), idx = Number(raw), n = S.miss[key]?.n || 1, C = T.content;
  if (kind === 'quiz' && C.quiz[idx]) { const q = C.quiz[idx], opts = shuffle([q.a].concat(q.w)); return { key, kind, idx, t: q.t, q: q.q, opts, ci: opts.indexOf(q.a), e: q.e, n, base: 2 }; }
  if (kind === 'tf' && C.tf[idx]) { const q = C.tf[idx]; return { key, kind, idx, t: q.t, q: q.s, opts: ['Sant', 'Usant'], ci: q.v ? 0 : 1, e: q.e, n, base: 1 }; }
  if (kind === 'hull' && C.hull[idx]) { const q = C.hull[idx]; return { key, kind, idx, t: q.t, q: q.s, answers: q.a, e: 'Svaret er «' + q.a[0] + '».', n, base: 2 }; }
  if (kind === 'sort' && C.sort[idx]) { const q = C.sort[idx], B = T.buckets; return { key, kind, idx, q: q.text, opts: B.map((b) => b.name), ci: B.findIndex((b) => b.k === q.b), e: q.e, n, base: 1 }; }
  return null;
}
export const bankKeys = () => Object.keys(S.miss).filter((k) => itemOf(k));

function start(): void {
  const items = bankKeys().map(itemOf).filter(Boolean) as Item[];
  // De du har bommet mest på, først, men litt stokket.
  const order = shuffle(items).sort((a, b) => b.n - a.n).slice(0, 10);
  S.cur.feilbank = { qs: order, i: 0, pick: null as number | null, typed: '', res: null as null | 'ok' | 'bad', cleared: 0, got: 0 };
}

export function renderFeilbank(): void {
  const p = panel();
  if (!S.cur.feilbank || (S.cur.feilbank.i >= S.cur.feilbank.qs.length && S.cur.feilbank.done)) start();
  const z = S.cur.feilbank, total = bankKeys().length;
  if (!z.qs.length) {
    p.innerHTML = head('feilbank') + '<div class="result"><p class="big">Feilbanken er tom</p><p>Alt du svarer feil på i quiz, sant eller usant, hull i teksten og kurvene havner her, så du kan øve på det igjen.</p></div>';
    return;
  }
  if (z.i >= z.qs.length) {
    z.done = true;
    p.innerHTML = head('feilbank') + '<div class="result"><p class="big">' + z.cleared + ' av ' + z.qs.length + ' ut av banken</p><p>' + (total ? 'Det er ' + total + ' spørsmål igjen i feilbanken.' : 'Feilbanken er tom. Sterkt!') + '</p>' + (total ? '<button class="btn primary" data-focus id="fb-new" type="button">Øv på flere</button>' : '') + '</div>';
    const nb = $('#fb-new'); if (nb) nb.onclick = () => { start(); renderFeilbank(); };
    focusMain(); return;
  }
  const q: Item = z.qs[z.i], done = z.res !== null;
  const meta = '<div class="meta">' + (q.t ? tag(q.t) : '') + '<span class="count">' + esc(KIND[q.kind]) + ' · bommet ' + q.n + (q.n === 1 ? ' gang' : ' ganger') + '</span><span class="count">' + (z.i + 1) + ' av ' + z.qs.length + ' · ' + total + ' i banken</span></div>';
  let body = '';
  if (q.answers) {
    const parts = q.q.split('___');
    body = '<p class="sentence">' + esc(parts[0]) + (done ? '<b class="fill ' + (z.res === 'ok' ? 'okt' : 'badt') + '">' + esc(q.answers[0]) + '</b>' : '<span class="blank">&emsp;&emsp;</span>') + esc(parts[1] || '') + '</p>' +
      (done ? '' : '<form class="ans" id="fb-form"><label class="sr" for="fb-in">Ditt svar</label><input id="fb-in" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Skriv ordet"><button class="btn primary" type="submit">Sjekk</button></form>');
  } else {
    body = '<p class="qtext">' + esc(q.q) + '</p><div class="opts">' + q.opts!.map((o, j) => {
      let c = 'opt'; if (done) { if (j === q.ci) c += ' ok'; else if (j === z.pick) c += ' bad'; }
      return '<button class="' + c + '" data-j="' + j + '" type="button"' + (done ? ' disabled' : '') + '><span>' + esc(o) + '</span></button>';
    }).join('') + '</div>';
  }
  const fb = !done ? '' : '<div class="fb ' + (z.res === 'ok' ? 'ok' : 'bad') + '"><strong>' + (z.res === 'ok' ? 'Riktig, ut av feilbanken!' + (z.got ? ' +' + z.got + ' poeng.' : ' Du har allerede fått poeng for dette spørsmålet i dag.') : 'Ikke helt. Spørsmålet blir liggende i banken.') + '</strong>' + esc(q.e) + '</div>' +
    '<div class="row"><button class="btn primary" data-focus id="fb-next" type="button">' + (z.i + 1 >= z.qs.length ? 'Se resultat' : 'Neste') + '</button></div>';
  p.innerHTML = head('feilbank') + '<p class="keyhint">Et spørsmål gir poeng bare én gang per dag, enten du svarer riktig her eller i det vanlige spillet.</p>' + meta + body + fb;

  const answer = (ok: boolean) => {
    track(ok);
    z.res = ok ? 'ok' : 'bad';
    if (ok) { z.cleared++; clearMiss(q.key); z.got = earnedToday(q.key) ? 0 : earnOnce(q.key, q.base); }
    else { z.got = 0; recordMiss(q.kind, q.idx); }
    renderFeilbank();
  };
  if (done) { $('#fb-next').onclick = () => { z.i++; z.res = null; z.pick = null; renderFeilbank(); }; focusMain(); return; }
  mark();
  if (q.answers) {
    const inp = $('#fb-in'); inp.focus({ preventScroll: true });
    $('#fb-form').onsubmit = (e: Event) => { e.preventDefault(); const v = norm(inp.value); if (!v) return; answer(q.answers!.indexOf(v) > -1); };
  } else {
    p.querySelectorAll('.opt').forEach((b: HTMLElement) => { b.onclick = () => { z.pick = +b.dataset.j!; answer(z.pick === q.ci); }; });
  }
}
