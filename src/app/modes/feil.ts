import { $, esc, shuffle } from '../../lib/dom';
import { S, T, head, tag, inTopic, focusMain, panel, verdict, addPoints, track } from '../core';

function start() { S.cur.feil = { qs: shuffle(T.content.feil.filter(inTopic)).slice(0, 5), i: 0, score: 0, pts: 0, miss: [], state: null, got: 0 }; }
/** Deler teksten i ord. Feilen står mellom [[ og ]] i dataene. */
function tokens(text: string) {
  const m = /\[\[(.+?)\]\]/.exec(text)!;
  const segs: [string, boolean][] = [[text.slice(0, m.index), false], [m[1], true], [text.slice(m.index + m[0].length), false]];
  const out: { w: string; e: boolean }[] = [];
  segs.forEach(([s, e]) => s.split(/(\s+)/).forEach((w) => { if (w) out.push({ w, e }); }));
  return out;
}
export function renderFeil(): void {
  if (!S.cur.feil) start();
  const z = S.cur.feil, p = panel();
  if (!z.qs.length) { p.innerHTML = head('feil') + '<p>Ingen tekster i dette emnet.</p>'; return; }
  if (z.i >= z.qs.length) {
    p.innerHTML = head('feil') + '<div class="result"><p class="big">' + z.score + ' av ' + z.qs.length + ' feil funnet</p><p>Du tjente ' + z.pts + ' poeng. ' + verdict(z.score, z.qs.length) + '</p><button class="btn primary" data-focus id="f-new" type="button">Nye tekster</button></div>';
    $('#f-new').onclick = () => { start(); renderFeil(); };
    focusMain(); return;
  }
  const q = z.qs[z.i], toks = tokens(q.text), done = !!z.state, left = 3 - z.miss.length;
  const body = toks.map((t, j) => {
    if (/^\s+$/.test(t.w)) return ' ';
    if (!/[0-9A-Za-zÆØÅæøåÀ-ÿ]/.test(t.w)) return esc(t.w);
    let c = 'w';
    if (z.miss.indexOf(j) > -1) c += ' miss';
    if (done && t.e) c += z.state === 'ok' ? ' hit' : ' show';
    return '<button class="' + c + '" type="button" data-j="' + j + '"' + (done || z.miss.indexOf(j) > -1 ? ' disabled' : '') + '>' + esc(t.w) + '</button>';
  }).join('');
  p.innerHTML = head('feil') +
    '<div class="meta">' + tag(q.t) + '<span class="count">Tekst ' + (z.i + 1) + ' av ' + z.qs.length + '</span></div>' +
    '<div class="srcbox"><span class="lbl2">Sammenlign med originalen</span>Teksten «' + esc(q.src) + '»' + (q.sec ? ', avsnittet «' + esc(q.sec) + '»' : '') + '</div>' +
    '<p class="ftext">' + body + '</p>' +
    (done
      ? '<div class="fb ' + (z.state === 'ok' ? 'ok' : 'bad') + '"><strong>' + (z.state === 'ok' ? 'Riktig, du fant feilen. +' + z.got + ' poeng.' : 'Feilen er markert.') + '</strong>I originalteksten står det «' + esc(q.fix) + '». ' + esc(q.e) + '</div><div class="row"><button class="btn primary" data-focus id="f-next" type="button">' + (z.i + 1 >= z.qs.length ? 'Se resultat' : 'Neste tekst') + '</button></div>'
      : '<p class="msg">' + (z.miss.length ? 'Det ordet er riktig. Du har ' + left + ' forsøk igjen.' : 'Trykk på ordet som er feil. Ett forsøk gir 3 poeng, to gir 2, tre gir 1.') + '</p><div class="row"><button class="btn ghost" id="f-give" type="button">Vis feilen</button></div>');
  if (done) { $('#f-next').onclick = () => { z.i++; z.miss = []; z.state = null; renderFeil(); }; focusMain(); return; }
  p.querySelectorAll('.w').forEach((b: HTMLElement) => {
    b.onclick = () => {
      const j = +b.dataset.j!;
      track(!!toks[j].e);
      if (toks[j].e) { z.got = 3 - z.miss.length; z.state = 'ok'; z.score++; z.pts += z.got; addPoints(z.got); }
      else { z.miss.push(j); if (z.miss.length >= 3) z.state = 'bad'; }
      renderFeil();
      if (!z.state) {
        const ws = Array.from(p.querySelectorAll('.w:not([disabled])')) as HTMLElement[];
        const nb = ws.find((x) => +x.dataset.j! > j) || ws[0]; if (nb) nb.focus({ preventScroll: true });
      }
    };
  });
  $('#f-give').onclick = () => { z.state = 'bad'; track(false); renderFeil(); };
}
