// Topplisten: elevene i klassen sortert etter XP i dette temaet.
import { $, esc } from '../../lib/dom';
import { friendly } from '../../lib/supabase';
import type { LbRow } from '../../lib/store';
import { S, T, store, head, panel, hooks, LEVELS, stars, starText } from '../core';

interface Board { rows: LbRow[]; at: number; loading: boolean; error: string }
const STALE_MS = 30_000;

function board(): Board { return S.cur.top || (S.cur.top = { rows: [], at: 0, loading: false, error: '' }); }

function levelName(xp: number) { let k = 0; LEVELS.forEach((l, i) => { if (xp >= l.xp) k = i; }); return { i: k, n: LEVELS[k].n }; }

/** Rader med egen XP oppdatert lokalt, sortert, og med delt plass ved likt antall XP. */
export function ranked(): (LbRow & { rank: number })[] {
  const rows = board().rows.map((r) => (r.is_me ? { ...r, points: Math.max(r.points, S.points) } : r));
  rows.sort((a, b) => b.points - a.points || a.display_name.localeCompare(b.display_name, 'nb'));
  let rank = 0, prev = -1;
  return rows.map((r, i) => { if (r.points !== prev) { rank = i + 1; prev = r.points; } return { ...r, rank }; });
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
  const r = ranked(), me = r.find((x) => x.is_me);
  return me ? 'Nr. ' + me.rank + ' av ' + r.length : 'Se plassen din';
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

  const rows = ranked(), me = rows.find((x) => x.is_me);
  let summary = '';
  if (me) {
    const ahead = rows.filter((x) => x.points > me.points).pop();
    summary = '<div class="lbme"><b>Nr. ' + me.rank + '</b><span>av ' + rows.length + ' i klassen · ' + me.points + ' XP</span>' +
      (ahead ? '<span class="keyhint">Du mangler ' + (ahead.points - me.points + 1) + ' XP for å gå forbi ' + esc(ahead.display_name) + '.</span>' : '<span class="keyhint">Du ligger øverst. Hold posisjonen!</span>') + '</div>';
  } else {
    summary = '<p class="previewnote">Slik ser elevene topplisten. Elevene ser bare sin egen klasse.</p>';
  }

  const list = rows.map((r) => {
    const lv = levelName(r.points), st = stars(r.points);
    return '<li class="lbrow' + (r.is_me ? ' me' : '') + (r.rank <= 3 && r.points > 0 ? ' r' + r.rank : '') + '">' +
      '<span class="lbrank">' + r.rank + '</span>' +
      '<span class="lbname"><b>' + esc(r.display_name) + (r.is_me ? ' <em>(deg)</em>' : '') + '</b><small>Nivå ' + (lv.i + 1) + ' · ' + esc(lv.n) + starText(st) + '</small></span>' +
      '<span class="lbxp">' + r.points + '<small>XP</small></span></li>';
  }).join('');

  p.innerHTML = head('top') + summary +
    (rows.length ? '<ol class="lb" aria-label="Topplisten">' + list + '</ol>' : '<p class="muted">Ingen elever i klassen ennå.</p>') +
    '<div class="row"><button class="btn ghost" id="lb-re" type="button"' + (b.loading ? ' disabled' : '') + '>' + (b.loading ? 'Oppdaterer …' : 'Oppdater') + '</button></div>' +
    '<p class="keyhint">Topplisten viser XP i ' + esc(T.title) + ', altså alle poengene som er tjent. Å bruke poeng i butikken trekker ikke ned plassen din.</p>';
  $('#lb-re').onclick = () => { void loadBoard(true); };
}
