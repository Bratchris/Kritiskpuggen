// Felles tilstand og hjelpere for øvingsappen. Temaet byttes med setTheme(),
// og alle moduler leser data og tilstand herfra.
import { $, esc, toast } from '../lib/dom';
import type { Store, SavedState, Gift } from '../lib/store';
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
  known: Record<string, 1>;
  notes: Record<string, string>;
  cur: Record<string, any>;
}

export const S: AppState = { topic: 'alle', mode: 'quiz', last: 'quiz', points: 0, spent: 0, gifts: [], home: null, seenLvl: -1, known: {}, notes: {}, cur: {} };

export let T: Theme;
export let store: Store;
export let MODES: Mode[];
export let LEVELS: Level[];
export let ITEMS: Record<string, RoomItem>;

export function setTheme(theme: Theme, st: Store, flags: { leaderboard?: boolean } = {}): void {
  T = theme; store = st;
  MODES = theme.modes.filter((m) => (m.id !== 'feil' || theme.content.feil.length > 0) && (m.id !== 'top' || flags.leaderboard !== false));
  LEVELS = theme.room.levels;
  ITEMS = theme.room.items;
}

export function loadProgress(p: { points: number; spent: number; state: SavedState; gifts: Gift[] }): void {
  S.points = p.points; S.spent = p.spent; S.gifts = p.gifts;
  S.known = p.state.known; S.notes = p.state.notes; S.home = p.state.home; S.seenLvl = p.state.seenLvl;
  S.cur = {}; S.topic = 'alle';
  const first = MODES.find((m) => !m.g);
  S.mode = S.last = first ? first.id : 'kort';
}

export function save(): void {
  store.saveState(T.id, { known: S.known, notes: S.notes, home: S.home, seenLvl: S.seenLvl });
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

export function addPoints(n: number): void {
  const before = lvl(S.points);
  S.points += n;
  hooks.onPoints(before, lvl(S.points), n);
  store.award(T.id, n).then(
    (server) => { if (typeof server === 'number' && server > S.points) S.points = server; },
    () => { toast('Poengene ble ikke lagret. Sjekk nettet.'); },
  );
}
