import { $, esc, shuffle } from '../../lib/dom';
import { S, T, head, panel, addPoints, track } from '../core';

function start(pi: number) {
  const P = T.content.order[pi]; let l = P.items.map((_, i) => i);
  do { l = shuffle(l); } while (l.every((v, i) => v === i));
  S.cur.ord = { pi, list: l, checked: false, solved: false, good: 0, paid: false };
}
export function renderOrd(): void {
  if (!S.cur.ord) start(0);
  const o = S.cur.ord, P = T.content.order[o.pi], p = panel(), n = P.items.length;
  p.innerHTML = head('ord') +
    '<div class="filters" style="margin-bottom:14px" role="group" aria-label="Velg oppgave">' + T.content.order.map((x, i) => '<button class="chip" type="button" data-pi="' + i + '" aria-pressed="' + (i === o.pi) + '">' + esc(x.title) + '</button>').join('') + '</div>' +
    '<p style="margin:0 0 12px;color:var(--muted)">' + esc(P.intro) + '</p><ol class="ord">' +
    o.list.map((v: number, pos: number) => {
      const c = o.checked ? (v === pos ? 'ok' : 'bad') : '';
      return '<li class="' + c + '"><span class="otext">' + esc(P.items[v][0]) + (o.solved ? '<em class="lbl">' + esc(P.items[v][1]) + '</em>' : '') + '</span><span class="ctl"><button class="mv" type="button" data-p="' + pos + '" data-d="-1" aria-label="Flytt opp"' + (pos === 0 ? ' disabled' : '') + '>↑</button><button class="mv" type="button" data-p="' + pos + '" data-d="1" aria-label="Flytt ned"' + (pos === n - 1 ? ' disabled' : '') + '>↓</button></span></li>';
    }).join('') + '</ol>' +
    (o.checked ? '<div class="fb ' + (o.solved ? 'ok' : 'bad') + '"><strong>' + (o.solved ? 'Riktig rekkefølge.' : o.good + ' av ' + n + ' står på rett plass.') + '</strong>' + (o.solved ? 'Nå ser du fasiten ved hvert punkt.' : 'Flytt litt på dem og sjekk igjen.') + '</div>' : '') +
    '<div class="row"><button class="btn primary" id="o-check" type="button"' + (o.solved ? ' disabled' : '') + '>Sjekk rekkefølgen</button><button class="btn ghost" id="o-new" type="button">Stokk om</button></div>';
  p.querySelectorAll('[data-pi]').forEach((b: HTMLElement) => { b.onclick = () => { start(+b.dataset.pi!); renderOrd(); }; });
  p.querySelectorAll('.mv').forEach((b: HTMLElement) => {
    b.onclick = () => {
      const pos = +b.dataset.p!, d = +b.dataset.d!, t = o.list[pos]; o.list[pos] = o.list[pos + d]; o.list[pos + d] = t;
      o.checked = false; o.solved = false; renderOrd();
      const again = p.querySelector('.mv[data-p="' + (pos + d) + '"][data-d="' + d + '"]') || p.querySelector('.mv[data-p="' + (pos + d) + '"]'); if (again) again.focus({ preventScroll: true });
    };
  });
  $('#o-check').onclick = () => {
    o.good = o.list.filter((v: number, i: number) => v === i).length; o.checked = true; o.solved = (o.good === n); track(o.solved);
    if (o.solved && !o.paid) { o.paid = true; addPoints(3); }
    renderOrd();
  };
  $('#o-new').onclick = () => { start(o.pi); renderOrd(); };
}
