// Memory: kortene ligger med baksiden opp. Eleven snur to om gangen og
// prøver å finne et begrep og forklaringen som hører til.
import { $, esc, shuffle } from '../../lib/dom';
import { S, T, head, focusMain, panel, addPoints, track } from '../core';

const PAIRS_PER_GAME = 6;
const FLIP_BACK_MS = 1300;

interface MCard { pi: number; side: 'term' | 'expl'; text: string }
interface Game { cards: MCard[]; open: number[]; found: Record<number, true>; tries: number; lock: boolean; paid: number; timer?: number }

function start() {
  const pick = shuffle(T.content.pairs).slice(0, PAIRS_PER_GAME);
  const cards: MCard[] = [];
  pick.forEach((p, i) => { cards.push({ pi: i, side: 'term', text: p[0] }, { pi: i, side: 'expl', text: p[1] }); });
  if (S.cur.memo?.timer) clearTimeout(S.cur.memo.timer);
  S.cur.memo = { cards: shuffle(cards), open: [], found: {}, tries: 0, lock: false, paid: -1 } as Game;
}

/** 3 poeng for å fullføre, pluss inntil 3 for få forsøk. Seks par kan i beste fall løses på seks forsøk. */
export function memoPoints(tries: number): number {
  return 3 + (tries <= 9 ? 3 : tries <= 12 ? 2 : tries <= 15 ? 1 : 0);
}

export function renderMemo(): void {
  if (!S.cur.memo) start();
  const g: Game = S.cur.memo, p = panel(), n = g.cards.length / 2, nf = Object.keys(g.found).length;

  if (nf === n) {
    if (g.paid < 0) { g.paid = memoPoints(g.tries); addPoints(g.paid); }
    p.innerHTML = head('memo') + '<div class="result"><p class="big">Alle ' + n + ' par funnet</p><p>Du brukte ' + g.tries + ' forsøk og fikk ' + g.paid + ' poeng. ' +
      (g.tries <= 9 ? 'Sterk hukommelse.' : 'Klarer du det på færre forsøk neste gang? Under 10 forsøk gir flest poeng.') + '</p>' +
      '<button class="btn primary" data-focus id="m-new" type="button">Nytt spill</button></div>';
    $('#m-new').onclick = () => { start(); renderMemo(); };
    focusMain(); return;
  }

  const cell = (c: MCard, i: number) => {
    const up = g.open.indexOf(i) > -1 || !!g.found[c.pi], done = !!g.found[c.pi];
    const label = up ? (c.side === 'term' ? 'Begrep: ' : 'Forklaring: ') + c.text : 'Kort ' + (i + 1) + ', skjult';
    return '<button class="mc' + (up ? ' up' : '') + (done ? ' done' : '') + ' ' + c.side + '" type="button" data-i="' + i + '" aria-label="' + esc(label) + '"' + (done ? ' disabled' : '') + '>' +
      '<span class="mc-in"><span class="mc-back" aria-hidden="true"></span><span class="mc-face" aria-hidden="true"><small>' + (c.side === 'term' ? 'Begrep' : 'Forklaring') + '</small><span>' + esc(c.text) + '</span></span></span></button>';
  };
  p.innerHTML = head('memo') +
    '<div class="meta"><span class="count">' + nf + ' av ' + n + ' par funnet</span><span class="count">Forsøk: ' + g.tries + '</span></div>' +
    '<div class="memo" role="group" aria-label="Memorykort">' + g.cards.map(cell).join('') + '</div>' +
    '<p class="msg" id="mmsg" aria-live="polite">' + (g.open.length === 2 ? 'Ikke et par. Kortene snus tilbake.' : g.open.length === 1 ? 'Finn kortet som hører sammen med dette.' : 'Snu to kort.') + '</p>' +
    '<div class="row"><button class="btn ghost" id="m-new" type="button">Stokk om</button></div>';

  $('#m-new').onclick = () => { start(); renderMemo(); };
  p.querySelectorAll('.mc').forEach((b: HTMLElement) => {
    b.onclick = () => {
      const i = +b.dataset.i!;
      if (g.lock || g.open.indexOf(i) > -1 || g.found[g.cards[i].pi]) return;
      g.open.push(i);
      if (g.open.length === 2) {
        g.tries++;
        const [a, c] = g.open;
        track(g.cards[a].pi === g.cards[c].pi);
        if (g.cards[a].pi === g.cards[c].pi) { g.found[g.cards[a].pi] = true; g.open = []; }
        else {
          g.lock = true;
          g.timer = window.setTimeout(() => { g.open = []; g.lock = false; if (S.mode === 'memo' && S.cur.memo === g) renderMemo(); }, FLIP_BACK_MS);
        }
      }
      renderMemo();
      const again = p.querySelector('.mc[data-i="' + i + '"]') as HTMLElement | null;
      if (again && !again.hasAttribute('disabled')) again.focus({ preventScroll: true });
      else { const next = p.querySelector('.mc:not([disabled]):not(.up)') as HTMLElement | null; if (next) next.focus({ preventScroll: true }); }
    };
  });
}
