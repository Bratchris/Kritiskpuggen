import { $, esc, shuffle } from '../../lib/dom';
import { S, T, head, focusMain, panel, addPoints } from '../core';

function start() { const pick = shuffle(T.content.pairs).slice(0, 6), idx = pick.map((_, i) => i); S.cur.par = { pick, left: shuffle(idx), right: shuffle(idx), done: {}, sel: null, wrong: 0, paid: false }; }
export function renderPar(): void {
  if (!S.cur.par) start();
  const g = S.cur.par, p = panel(), n = g.pick.length, nd = Object.keys(g.done).length;
  if (nd === n) {
    if (!g.paid) { g.paid = true; addPoints(Math.max(1, n - g.wrong)); }
    p.innerHTML = head('par') + '<div class="result"><p class="big">Alle ' + n + ' par funnet</p><p>' + (g.wrong === 0 ? 'Ingen feil. Imponerende.' : g.wrong + ' feil underveis.') + '</p><button class="btn primary" data-focus id="p-new" type="button">Nye par</button></div>';
    $('#p-new').onclick = () => { start(); renderPar(); };
    focusMain(); return;
  }
  const btn = (side: string, i: number, txt: string) => { const d = g.done[i]; return '<button class="pb' + (d ? ' ok' : '') + (!d && side === 'l' && g.sel === i ? ' sel' : '') + '" data-side="' + side + '" data-i="' + i + '" type="button"' + (d ? ' disabled' : '') + '>' + esc(txt) + '</button>'; };
  p.innerHTML = head('par') + '<div class="meta"><span class="count">' + nd + ' av ' + n + ' funnet</span><span class="count">Feil: ' + g.wrong + '</span></div><div class="pairs"><div>' +
    g.left.map((i: number) => btn('l', i, g.pick[i][0])).join('') + '</div><div>' + g.right.map((i: number) => btn('r', i, g.pick[i][1])).join('') + '</div></div><p class="msg" id="pmsg">' + (g.sel === null ? 'Velg et begrep til venstre.' : 'Nå: velg forklaringen til høyre.') + '</p>';
  p.querySelectorAll('.pb').forEach((b: HTMLElement) => {
    b.onclick = () => {
      const i = +b.dataset.i!;
      if (b.dataset.side === 'l') { g.sel = (g.sel === i) ? null : i; renderPar(); return; }
      if (g.sel === null) { $('#pmsg').textContent = 'Velg først et begrep til venstre.'; return; }
      if (g.sel === i) { g.done[i] = true; g.sel = null; renderPar(); return; }
      g.wrong++; b.classList.add('bad'); $('#pmsg').textContent = 'Ikke helt. Prøv en annen forklaring.';
      setTimeout(() => b.classList.remove('bad'), 700);
    };
  });
}
