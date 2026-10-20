import { $, esc, shuffle } from '../../lib/dom';
import { S, T, head, focusMain, panel, verdict, addPoints } from '../core';

function start() { S.cur.sort = { qs: shuffle(T.content.sort), i: 0, score: 0, pick: null, log: [] }; }
const dot = (color: string) => '<i style="background:var(--' + color + ')"></i>';
export function renderSort(): void {
  if (!S.cur.sort) start();
  const z = S.cur.sort, p = panel(), B = T.buckets, name = (k: string) => (B.find((b) => b.k === k) || { name: k }).name;
  if (z.i >= z.qs.length) {
    const cols = B.map((b) => '<div><h4>' + dot(b.color) + esc(b.name) + '</h4><ul>' + z.log.filter((x: any) => x.b === b.k).map((x: any) => '<li class="' + (x.miss ? 'miss' : '') + '">' + esc(x.text) + '</li>').join('') + '</ul></div>').join('');
    p.innerHTML = head('sort') + '<div class="result"><p class="big">' + z.score + ' av ' + z.qs.length + ' riktige</p><p>' + verdict(z.score, z.qs.length) + ' Røde punkter er de du plasserte feil.</p></div><div class="fasit">' + cols + '</div><button class="btn primary" data-focus id="s-new" type="button">Prøv igjen</button>';
    $('#s-new').onclick = () => { start(); renderSort(); };
    focusMain(); return;
  }
  const q = z.qs[z.i], done = z.pick !== null;
  p.innerHTML = head('sort') + '<div class="meta"><span class="count">' + (z.i + 1) + ' av ' + z.qs.length + '</span></div><div class="item">' + esc(q.text) + '</div><div class="buckets">' +
    B.map((b) => { let c = 'bk'; if (done) { if (b.k === q.b) c += ' ok'; else if (b.k === z.pick) c += ' bad'; } return '<button class="' + c + '" data-k="' + b.k + '" type="button"' + (done ? ' disabled' : '') + '>' + dot(b.color) + esc(b.name) + '</button>'; }).join('') + '</div>' +
    (done ? '<div class="fb ' + (z.pick === q.b ? 'ok' : 'bad') + '"><strong>' + (z.pick === q.b ? 'Riktig.' : 'Riktig kurv er «' + esc(name(q.b)) + '».') + '</strong>' + esc(q.e) + '</div><div class="row"><button class="btn primary" data-focus id="s-next" type="button">' + (z.i + 1 >= z.qs.length ? 'Se fasit' : 'Neste') + '</button></div>' : '');
  if (!done) {
    p.querySelectorAll('.bk').forEach((b: HTMLElement) => { b.onclick = () => { z.pick = b.dataset.k; const ok = z.pick === q.b; if (ok) { z.score++; addPoints(1); } z.log.push({ text: q.text, b: q.b, miss: !ok }); renderSort(); }; });
  } else {
    $('#s-next').onclick = () => { z.i++; z.pick = null; renderSort(); };
    focusMain();
  }
}
