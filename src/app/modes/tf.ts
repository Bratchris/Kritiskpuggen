import { $, esc, shuffle } from '../../lib/dom';
import { S, T, head, tag, inTopic, focusMain, panel, verdict, track, mark, earnOnce, earnedToday, readLock } from '../core';

const key = (idx: number) => 'tf:' + idx;

function start() {
  // Påstander som ikke har gitt poeng i dag, kommer først.
  const pool = shuffle(T.content.tf.map((q, idx) => ({ ...q, idx, got: 0 })).filter(inTopic));
  pool.sort((a, b) => Number(earnedToday(key(a.idx))) - Number(earnedToday(key(b.idx))));
  S.cur.tf = { qs: pool.slice(0, 12), i: 0, score: 0, pick: null, streak: 0, best: 0 };
}
export function renderTf(): void {
  if (!S.cur.tf) start();
  const z = S.cur.tf, p = panel();
  if (z.i >= z.qs.length) {
    p.innerHTML = head('tf') + '<div class="result"><p class="big">' + z.score + ' av ' + z.qs.length + ' riktige</p><p>Lengste rekke: ' + z.best + '. ' + verdict(z.score, z.qs.length) + '</p><button class="btn primary" data-focus id="t-new" type="button">Ny runde</button></div>';
    $('#t-new').onclick = () => { start(); renderTf(); };
    focusMain(); return;
  }
  const q = z.qs[z.i], done = z.pick !== null, ok = done && z.pick === q.v;
  const cls = (val: boolean) => { let c = 'opt'; if (done) { if (val === q.v) c += ' ok'; else if (val === z.pick) c += ' bad'; } return c; };
  p.innerHTML = head('tf') + '<div class="meta">' + tag(q.t) + '<span class="count">' + (z.i + 1) + ' av ' + z.qs.length + ' <span class="streak"> · rekke ' + z.streak + '</span></span></div>' +
    '<p class="qtext">' + esc(q.s) + '</p><div class="tfrow"><button class="' + cls(true) + '" data-v="1" type="button"' + (done ? ' disabled' : '') + '>Sant</button><button class="' + cls(false) + '" data-v="0" type="button"' + (done ? ' disabled' : '') + '>Usant</button></div>' +
    (done ? '<div class="fb ' + (ok ? 'ok' : 'bad') + '"><strong>' + (ok ? (q.got ? 'Riktig. +' + q.got + ' poeng.' : 'Riktig. Du har allerede fått poeng for denne påstanden i dag.') : 'Feil. Utsagnet er ' + (q.v ? 'sant' : 'usant') + '.') + '</strong>' + esc(q.e) + '</div><div class="row"><button class="btn primary" data-focus id="t-next" type="button">' + (z.i + 1 >= z.qs.length ? 'Se resultat' : 'Neste') + '</button></div>' : '');
  if (!done) {
    mark();
    readLock('.tfrow .opt', q);
    p.querySelectorAll('.opt').forEach((b: HTMLElement) => { b.onclick = () => { if ((b as HTMLButtonElement).disabled) return; z.pick = b.dataset.v === '1'; track(z.pick === q.v); if (z.pick === q.v) { z.score++; z.streak++; z.best = Math.max(z.best, z.streak); q.got = earnOnce(key(q.idx), 1); } else z.streak = 0; renderTf(); }; });
  } else {
    $('#t-next').onclick = () => { z.i++; z.pick = null; renderTf(); };
    focusMain();
  }
}
