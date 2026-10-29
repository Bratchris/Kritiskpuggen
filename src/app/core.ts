// Felles tilstand og hjelpere for øvingsappen. Temaet byttes med setTheme(),
// og alle moduler leser data og tilstand herfra.
import { $, esc, toast } from '../lib/dom';
import type { Store, SavedState, Gift, ActivityRow } from '../lib/store';
import type { Theme, Mode, Level, RoomItem, Placement, Topic } from '../themes/types';

export interface AppState {
  topic: string;
  mode: string;
  last: string;
  points: number;
  spent: number;
  gifts: Gift[];
  home: Record<string, Placement> | null;
  seenLvl: number;
  seeded: number[];
  known: Record<string, 1>;
  notes: Record<string, string>;
  cur: Record<string, any>;
}

export const S: AppState = { topic: 'alle', mode: 'quiz', last: 'quiz', points: 0, spent: 0, gifts: [], home: null, seenLvl: -1, seeded: [], known: {}, notes: {}, cur: {} };

export let T: Theme;
export let store: Store;
export let MODES: Mode[];
export let LEVELS: Level[];
export let ITEMS: Record<string, RoomItem>;

export function setTheme(theme: Theme, st: Store, flags: { leaderboard?: boolean } = {}): void {
  if (T && store && Object.keys(ACT).length) void flushActivity();
  T = theme; store = st;
  MODES = theme.modes.filter((m) => (m.id !== 'feil' || theme.content.feil.length > 0) && (m.id !== 'top' || flags.leaderboard !== false));
  LEVELS = theme.room.levels;
  ITEMS = theme.room.items;
}

export function loadProgress(p: { points: number; spent: number; state: SavedState; gifts: Gift[] }): void {
  S.points = p.points; S.spent = p.spent; S.gifts = p.gifts;
  S.known = p.state.known; S.notes = p.state.notes; S.home = p.state.home; S.seenLvl = p.state.seenLvl;
  // Elever med lagret stue fra før huset kom: første rom regnes som innredet.
  S.seeded = p.state.seeded ?? (p.state.home ? [0] : []);
  S.cur = {}; S.topic = 'alle';
  const first = MODES.find((m) => !m.g);
  S.mode = S.last = first ? first.id : 'kort';
}

export function save(): void {
  store.saveState(T.id, { known: S.known, notes: S.notes, home: S.home, seenLvl: S.seenLvl, seeded: S.seeded });
}

export function owned(): Record<string, number> {
  const o: Record<string, number> = {};
  S.gifts.forEach((g) => { o[g.item_id] = (o[g.item_id] || 0) + 1; });
  return o;
}

export function inTopic(x: { t: string }): boolean { return S.topic === 'alle' || x.t === S.topic; }
export function verdict(s: number, n: number): string {
  const r = s / n;
  return r === 1 ? 'Full pott. Det sitter.' : r >= 0.8 ? 'Sterkt. Bare noen detaljer igjen.' : r >= 0.5 ? 'Greit utgangspunkt. Ta en runde til.' : 'Her er det mye å hente. Gå gjennom kortstokken først.';
}
export function topicOf(k: string): Topic | undefined { return T.topics.find((t) => t.k === k); }
export function tag(k: string): string {
  const t = topicOf(k); if (!t) return '';
  return '<span class="tag"><i style="background:var(--' + t.color + ')"></i>' + esc(t.name) + '</span>';
}
export function modeOf(id: string): Mode { return MODES.find((m) => m.id === id) || MODES[0]; }
export function isGlobal(id: string): boolean { return !!modeOf(id).g; }
export function head(id: string): string { const m = modeOf(id); return '<div class="phead"><h2>' + esc(m.name) + '</h2><p>' + esc(m.desc) + '</p></div>'; }
export function focusMain(): void { const b = $('[data-focus]'); if (b) b.focus({ preventScroll: true }); }
export function panel(): any { return $('#panel'); }

export function lvl(p: number): number { let k = 0; for (let i = 0; i < LEVELS.length; i++) if (p >= LEVELS[i].xp) k = i; return k; }
export function level(p: number): string { return LEVELS[lvl(p)].n; }
/** Etter øverste nivå gir hver STAR_XP en stjerne, så det finnes ikke noe tak. */
export const STAR_XP = 300;
export function topXp(): number { return LEVELS[LEVELS.length - 1].xp; }
export function stars(p: number): number { return p >= topXp() ? Math.floor((p - topXp()) / STAR_XP) : 0; }
export function starText(n: number): string { return n > 0 ? ' ★' + n : ''; }

/** Kalles av skallet (app.ts) når poengene endres, for å tegne toppen og vise nytt nivå. */
export const hooks = {
  refresh: () => {},
  onPoints: (_before: number, _after: number, _n: number) => {},
};
export function CARDS_KNOWN(): number { return T.content.cards.filter((c) => S.known[c.id] === 1).length; }

// ---------- aktivitet til spilloversikten ----------
/** Svar raskere enn dette (ms) telles som «raske». Spill uten grense måles ikke på fart. */
export const FAST_MS: Record<string, number> = { quiz: 3000, tf: 2000, hull: 2500, sort: 2000, kort: 1500, feil: 1200 };
const MAX_MS = 120000;
let ACT: Record<string, ActivityRow> = {};
let lastMark = performance.now();
let flushTimer: number | undefined;

/** Kalles når et nytt spørsmål vises, så tiden per svar måles fra da. */
export function mark(): void { lastMark = performance.now(); }
function row(mode: string): ActivityRow { return ACT[mode] || (ACT[mode] = { mode, answers: 0, correct: 0, xp: 0, timed: 0, ms: 0, fast: 0 }); }
/** Registrerer ett svar i spillet eleven er i. */
export function track(ok: boolean, mode: string = S.mode): void {
  const now = performance.now(), ms = now - lastMark, r = row(mode);
  lastMark = now;
  r.answers++; if (ok) r.correct++;
  if (ms > 0 && ms < MAX_MS) { r.timed++; r.ms += Math.round(ms); if (FAST_MS[mode] && ms < FAST_MS[mode]) r.fast++; }
  scheduleFlush();
}
function scheduleFlush() { clearTimeout(flushTimer); flushTimer = window.setTimeout(() => { void flushActivity(); }, 15000); }
export async function flushActivity(): Promise<void> {
  clearTimeout(flushTimer);
  const rows = Object.values(ACT).filter((r) => r.answers || r.xp);
  if (!rows.length || !T) return;
  const theme = T.id, st = store;
  ACT = {};
  try { await st.logActivity(theme, rows); }
  catch { rows.forEach((r) => { const t = row(r.mode); t.answers += r.answers; t.correct += r.correct; t.xp += r.xp; t.timed += r.timed; t.ms += r.ms; t.fast += r.fast; }); scheduleFlush(); }
}
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') void flushActivity(); });
  window.addEventListener('pagehide', () => { void flushActivity(); });
}

export function addPoints(n: number): void {
  row(S.mode).xp += n; scheduleFlush();
  const before = lvl(S.points);
  S.points += n;
  hooks.onPoints(before, lvl(S.points), n);
  store.award(T.id, n).then(
    (server) => { if (typeof server === 'number' && server > S.points) S.points = server; },
    () => { toast('Poengene ble ikke lagret. Sjekk nettet.'); },
  );
}
