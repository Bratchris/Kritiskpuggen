import { $, esc, shuffle, norm } from '../../lib/dom';
import { S, T, head, tag, inTopic, focusMain, panel, verdict, track, mark, earnOnce, earnedToday } from '../core';

const key = (idx: number) => 'hull:' + idx;

function start() {
  const pool = shuffle(T.content.hull.map((q, idx) => ({ ...q, idx, got: 0 })).filter(inTopic));
  pool.sort((a, b) => Number(earnedToday(key(a.idx))) - Number(earnedToday(key(b.idx))));
  S.cur.hull = { qs: pool.slice(0, 10), i: 0, score: 0, res: null, hint: false, val: '' }; }
function hintOf(q: { a: string[] }) { const a = q.a[0]; return a.charAt(0) + new Array(a.length).join(' _'); }
export function renderHull(): void {
  if (!S.cur.hull) start();
  const h = S.cur.hull, p = panel();
  if (h.i >= h.qs.length) {
    p.innerHTML = head('hull') + '<div class="result"><p class="big">' + h.score + ' av ' + h.qs.length + ' riktige</p><p>' + verdict(h.score, h.qs.length) + '</p><button class="btn primary" data-focus id="h-new" type="button">Ny runde</button></div>';
    $('#h-new').onclick = () => { start(); renderHull(); };
    focusMain(); return;
  }
  const q = h.qs[h.i], parts = q.s.split('___');
  const blank = h.res ? '<b class="fill ' + (h.res === 'ok' ? 'okt' : 'badt') + '">' + esc(q.a[0]) + '</b>' : '<span class="blank">' + (h.hint ? esc(hintOf(q)) : '&emsp;&emsp;') + '</span>';
  p.innerHTML = head('hull') + '<div class="meta">' + tag(q.t) + '<span class="count">' + (h.i + 1) + ' av ' + h.qs.length + '</span></div>' +
    '<p class="sentence">' + esc(parts[0]) + blank + esc(parts[1] || '') + '</p>' +
    (h.res ? '<div class="fb ' + (h.res === 'ok' ? 'ok' : 'bad') + '"><strong>' + (h.res === 'ok' ? (q.got ? 'Riktig. +' + q.got + ' poeng.' : 'Riktig. Du har allerede fått poeng for denne setningen i dag.') : 'Svaret er «' + esc(q.a[0]) + '».') + '</strong></div><div class="row"><button class="btn primary" data-focus id="h-next" type="button">' + (h.i + 1 >= h.qs.length ? 'Se resultat' : 'Neste') + '</button></div>'
      : '<form class="ans" id="h-form"><label class="sr" for="h-in">Ditt svar</label><input id="h-in" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Skriv ordet"><button class="btn primary" type="submit">Sjekk</button></form><div class="row"><button class="btn ghost" id="h-hint" type="button"' + (h.hint ? ' disabled' : '') + '>Hint</button><button class="btn ghost" id="h-give" type="button">Vis svaret</button></div>');
  if (h.res) { $('#h-next').onclick = () => { h.i++; h.res = null; h.hint = false; h.val = ''; renderHull(); }; focusMain(); return; }
  if (!h.val && !h.hint) mark();
  const inp = $('#h-in'); inp.value = h.val; inp.addEventListener('input', () => { h.val = inp.value; }); inp.focus({ preventScroll: true });
  $('#h-form').onsubmit = (e: Event) => { e.preventDefault(); const v = norm(inp.value); if (!v) return; if (q.a.indexOf(v) > -1) { h.res = 'ok'; h.score++; q.got = earnOnce(key(q.idx), h.hint ? 1 : 2); } else h.res = 'bad'; track(h.res === 'ok'); renderHull(); };
  $('#h-hint').onclick = () => { h.hint = true; renderHull(); };
  $('#h-give').onclick = () => { h.res = 'bad'; track(false); renderHull(); };
}
