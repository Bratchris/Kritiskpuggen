import { supabase } from './supabase';
import type { Placement } from '../themes/types';

/** Det som lagres per elev og tema, i tillegg til poengene. */
export interface SavedState {
  known: Record<string, 1>;
  notes: Record<string, string>;
  home: Record<string, Placement> | null;
  seenLvl: number;
  /** Rom i huset som har fått startmøblene sine. */
  seeded?: number[];
}
export interface Gift { item_id: string; created_at: string }
/** rank og total kommer fra databasen. Elever får bare topp 3 og sin egen rad. */
export interface LbRow { display_name: string; points: number; is_me: boolean; rank?: number; total?: number }
export interface Progress { points: number; spent: number; state: SavedState; gifts: Gift[] }

/**
 * Lagring for appen. RemoteStore snakker med Supabase for innloggede elever.
 * PreviewStore lagrer bare i nettleseren og brukes når læreren prøver appen.
 */
export interface Store {
  readonly kind: 'remote' | 'preview';
  load(theme: string): Promise<Progress>;
  saveState(theme: string, state: SavedState): void;
  flush(): Promise<void>;
  award(theme: string, n: number): Promise<number>;
  buy(theme: string, itemId: string, price: number): Promise<number>;
  leaderboard(theme: string): Promise<LbRow[]>;
}

function emptyState(): SavedState { return { known: {}, notes: {}, home: null, seenLvl: -1 }; }
function cleanState(raw: any): SavedState {
  const s = emptyState();
  if (raw && typeof raw === 'object') {
    if (raw.known && typeof raw.known === 'object') s.known = raw.known;
    if (raw.notes && typeof raw.notes === 'object') s.notes = raw.notes;
    if (raw.home && typeof raw.home === 'object') s.home = raw.home;
    if (typeof raw.seenLvl === 'number') s.seenLvl = raw.seenLvl;
    if (Array.isArray(raw.seeded)) s.seeded = raw.seeded.filter((n: unknown) => typeof n === 'number');
  }
  return s;
}

export class RemoteStore implements Store {
  readonly kind = 'remote' as const;
  private pending: { theme: string; state: SavedState } | null = null;
  private timer: number | undefined;
  private chain: Promise<unknown> = Promise.resolve();

  constructor() {
    // Lagre det som venter når eleven bytter fane eller lukker siden.
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') void this.flush(); });
    window.addEventListener('pagehide', () => { void this.flush(); });
  }

  async load(theme: string): Promise<Progress> {
    const { data, error } = await supabase.rpc('ensure_progress', { p_theme: theme });
    if (error) throw error;
    const row = Array.isArray(data) ? data[0] : data;
    const g = await supabase.from('gifts').select('item_id, created_at').eq('theme', theme).order('created_at');
    if (g.error) throw g.error;
    return { points: row?.points ?? 0, spent: row?.spent ?? 0, state: cleanState(row?.state), gifts: g.data ?? [] };
  }

  saveState(theme: string, state: SavedState): void {
    this.pending = { theme, state: JSON.parse(JSON.stringify(state)) };
    clearTimeout(this.timer);
    this.timer = window.setTimeout(() => { void this.flush(); }, 1200);
  }

  async flush(): Promise<void> {
    clearTimeout(this.timer);
    const p = this.pending; if (!p) return;
    this.pending = null;
    const { error } = await supabase.rpc('save_state', { p_theme: p.theme, p_state: p.state });
    if (error && !this.pending) {
      this.pending = p; // prøv igjen ved neste lagring
      this.timer = window.setTimeout(() => { void this.flush(); }, 8000);
    }
  }

  /** Poeng sendes i rekkefølge, så de ikke går tapt om eleven klikker raskt. */
  award(theme: string, n: number): Promise<number> {
    const run = async () => {
      const { data, error } = await supabase.rpc('award_points', { p_theme: theme, p_n: n });
      if (error) throw error;
      return data as number;
    };
    const next = this.chain.then(run, run);
    this.chain = next.catch(() => undefined);
    return next;
  }

  async buy(theme: string, itemId: string): Promise<number> {
    const { data, error } = await supabase.rpc('buy_gift', { p_theme: theme, p_item: itemId });
    if (error) throw error;
    return data as number;
  }

  async leaderboard(theme: string): Promise<LbRow[]> {
    const { data, error } = await supabase.rpc('get_leaderboard', { p_theme: theme });
    if (error) throw error;
    return (data ?? []) as LbRow[];
  }
}

export class PreviewStore implements Store {
  readonly kind = 'preview' as const;
  /** Klassen læreren forhåndsviser fra, slik at topplisten viser ekte elever. */
  constructor(private classId: string | null = null) {}
  async leaderboard(theme: string): Promise<LbRow[]> {
    if (!this.classId) return [];
    const { data, error } = await supabase.rpc('get_leaderboard', { p_theme: theme, p_class: this.classId });
    if (error) throw error;
    return (data ?? []) as LbRow[];
  }
  private key(theme: string) { return 'puggen-preview-' + theme; }
  private read(theme: string): Progress {
    try {
      const r = JSON.parse(localStorage.getItem(this.key(theme)) || 'null');
      if (r) return { points: r.points | 0, spent: r.spent | 0, state: cleanState(r.state), gifts: Array.isArray(r.gifts) ? r.gifts : [] };
    } catch { /* tom forhåndsvisning */ }
    return { points: 0, spent: 0, state: emptyState(), gifts: [] };
  }
  private write(theme: string, p: Progress) { try { localStorage.setItem(this.key(theme), JSON.stringify(p)); } catch { /* ignorer */ } }
  async load(theme: string) { return this.read(theme); }
  saveState(theme: string, state: SavedState) { const p = this.read(theme); p.state = state; this.write(theme, p); }
  async flush() { /* alt er allerede lagret */ }
  async award(theme: string, n: number) { const p = this.read(theme); p.points += n; this.write(theme, p); return p.points; }
  async buy(theme: string, itemId: string, price: number) {
    const p = this.read(theme);
    if (p.points - p.spent < price) throw new Error('Ikke nok poeng');
    p.spent += price; p.gifts.push({ item_id: itemId, created_at: new Date().toISOString() }); this.write(theme, p);
    return p.spent;
  }
  reset(theme: string) { try { localStorage.removeItem(this.key(theme)); } catch { /* ignorer */ } }
}
