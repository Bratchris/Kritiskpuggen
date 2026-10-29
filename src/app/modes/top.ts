// Topplisten: elevene i klassen sortert etter XP i dette temaet.
import { $, esc } from '../../lib/dom';
import { friendly } from '../../lib/supabase';
import type { LbRow } from '../../lib/store';
import { S, T, store, head, panel, hooks, LEVELS, stars, starText } from '../core';

interface Board { rows: LbRow[]; at: number; loading: boolean; error: string }
const STALE_MS = 30_000;

function board(): Board { return S.cur.top || (S.cur.top = { rows: [], at: 0, loading: false, error: '' }); }

function levelName(xp: number) { let k = 0; LEVELS.forEach((l, i) => { if (xp >= l.xp) k = i; }); return { i: k, n: LEVELS[k].n }; }

const TOP_N = 3;

interface Ranked extends LbRow { rank: number }
/** Rangerer med delt plass ved likt antall XP (1, 2, 2, 4 …). */
function rankRows(rows: LbRow[]): Ranked[] {
  const sorted = rows.slice().sort((x, y) => y.points - x.points || x.display_name.localeCompare(y.display_name, 'nb'));
  let rank = 0, prev = -1;
  return sorted.map((r, i) => { if (r.points !== prev) { rank = i + 1; prev = r.points; } return { ...r, rank }; });
}

/**
 * Topp 3 og egen plass. Egen XP oppdateres lokalt når eleven tjener poeng, så plassen
 * flytter seg med en gang. Databasen sender bare topp 3 og elevens egen rad.
 */
export function standing(): { top: Ranked[]; me: Ranked | null; total: number } {
  const b = board(), server = b.rows;
  const total = server.reduce((m, r) => Math.max(m, r.total ?? 0), 0) || server.length;
  const meRow = server.find((r) => r.is_me) || null;
  const others = server.filter((r) => !r.is_me);
  if (!meRow) {
    // Læreren: hele listen, vis topp 3.
    const all = rankRows(server);
    return { top: all.filter((r) => r.rank <= TOP_N && r.points > 0), me: null, total };
  }
  const myPts = Math.max(meRow.points, S.points);
  const top3 = rankRows(others).filter((r) => r.rank <= TOP_N);
  const third = top3.length >= TOP_N ? top3[top3.length - 1].points : 0;
  // Alle som har mer XP enn eleven, finnes i topp 3-listen hvis eleven er over tredjeplassen.
  const myRank = myPts > 0 && (myPts >= third || top3.length < TOP_N)
    ? 1 + others.filter((r) => r.points > myPts).length
    : Math.max(meRow.rank ?? 0, 1 + others.filter((r) => r.points > myPts).length);
  const me: Ranked = { ...meRow, points: myPts, rank: myRank };
  const top = rankRows(others.concat(myRank <= TOP_N && myPts > 0 ? [me] : []))
    .filter((r) => r.rank <= TOP_N && r.points > 0)
    .map((r) => (r.is_me ? { ...r, rank: myRank } : r));
  return { top, me, total };
}

/** Henter topplisten i bakgrunnen. Kalles når appen åpnes og når eleven går inn på topplisten. */
export async function loadBoard(force = false): Promise<void> {
  const b = board();
  if (b.loading || (!force && b.at && Date.now() - b.at < STALE_MS)) return;
  b.loading = true; b.error = '';
  try { b.rows = await store.leaderboard(T.id); b.at = Date.now(); }
  catch (e) {
    const m = String((e as Error)?.message || '');
    b.error = /get_leaderboard|function|schema cache/i.test(m) ? 'Topplisten er ikke klar ennå. Læreren må oppdatere databasen først.' : /ikke tilgjengelig/i.test(m) ? 'Læreren har slått av topplisten.' : friendly(e);
  }
  b.loading = false;
  hooks.refresh();
  if (S.mode === 'top') renderTop();
}

export function myRankText(): string {
  const { me, total } = standing();
  return me ? 'Nr. ' + me.rank + ' av ' + total : 'Se topp 3';
}

export function renderTop(): void {
  const b = board(), p = panel();
  if (!b.at && !b.error) { p.innerHTML = head('top') + '<p class="loading">Henter topplisten …</p>'; void loadBoard(); return; }
  if (Date.now() - b.at > STALE_MS && !b.loading) void loadBoard();

  if (b.error && !b.rows.length) {
    p.innerHTML = head('top') + '<p class="fb bad">' + esc(b.error) + '</p><div class="row"><button class="btn" id="lb-re" type="button">Prøv igjen</button></div>';
    $('#lb-re').onclick = () => { void loadBoard(true); };
    return;
  }

  const { top, me, total } = standing();
  let summary = '';
  if (me) {
    const inTop = top.some((r) => r.is_me);
    const above = top.filter((r) => !r.is_me && r.points > me.points).pop();
    const third = top.filter((r) => !r.is_me).slice(-1)[0];
    let tip: string;
    if (inTop && above) tip = 'Du mangler ' + (above.points - me.points + 1) + ' XP for å gå forbi ' + esc(above.display_name) + '.';
    else if (inTop) tip = 'Du ligger øverst. Hold posisjonen!';
    else if (third) tip = 'Du mangler ' + (third.points - me.points + 1) + ' XP for å komme inn på topp 3.';
    else tip = 'Tjen poeng i øvelsene for å komme inn på topp 3.';
    summary = '<div class="lbme"><span class="lbme-l">Din plass</span><b>Nr. ' + me.rank + '</b><span>av ' + total + ' i klassen · ' + me.points + ' XP</span><span class="keyhint">' + tip + '</span></div>';
  } else {
    summary = '<p class="previewnote">Slik ser elevene topplisten: topp 3 og sin egen plass. Hele listen finner du i lærerrommet.</p>';
  }

  const list = top.map((r) => {
    const lv = levelName(r.points), st = stars(r.points);
    return '<li class="lbrow r' + r.rank + (r.is_me ? ' me' : '') + '">' +
      '<span class="lbrank">' + r.rank + '</span>' +
      '<span class="lbname"><b>' + esc(r.display_name) + (r.is_me ? ' <em>(deg)</em>' : '') + '</b><small>Nivå ' + (lv.i + 1) + ' · ' + esc(lv.n) + starText(st) + '</small></span>' +
      '<span class="lbxp">' + r.points + '<small>XP</small></span></li>';
  }).join('');

  p.innerHTML = head('top') + summary +
    '<h3 class="lbtitle">Topp 3</h3>' + (top.length ? '<ol class="lb" aria-label="Topp 3">' + list + '</ol>' : '<p class="muted">Ingen har tjent poeng ennå. Bli den første på topplisten!</p>') +
    '<div class="row"><button class="btn ghost" id="lb-re" type="button"' + (b.loading ? ' disabled' : '') + '>' + (b.loading ? 'Oppdaterer …' : 'Oppdater') + '</button></div>' +
    '<p class="keyhint">Topplisten viser XP i ' + esc(T.title) + ', altså alle poengene som er tjent. Å bruke poeng i butikken trekker ikke ned plassen din.</p>';
  $('#lb-re').onclick = () => { void loadBoard(true); };
}
