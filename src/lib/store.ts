import { supabase } from './supabase';
import type { Placement } from '../themes/types';
import { type Pet, type EggKind, type Species, type Variant, EGGS, CHANCE, SPECIES, VARIANTS, pick, rarityOf, isSeasonEgg } from '../pets/catalog';
import { achById, ACHS } from '../achievements/catalog';
import { SKINS } from '../avatar/catalog';
import { BACKGROUNDS } from '../avatar/backgrounds';

/** Det som lagres per elev og tema, i tillegg til poengene. */
export interface SavedState {
  known: Record<string, 1>;
  notes: Record<string, string>;
  home: Record<string, Placement> | null;
  seenLvl: number;
  /** Rom i huset som har fått startmøblene sine. */
  seeded?: number[];
  /** Spørsmål som har gitt poeng, med dato (ÅÅÅÅ-MM-DD). Bare dagens beholdes. */
  earned?: Record<string, string>;
  /** Spill der eleven har tjent XP, til achievementet «Allsidig». */
  played?: string[];
  /** XP i dag, og dager på rad der dagens mål er nådd. */
  day?: { d: string; xp: number };
  streak?: { n: number; last: string; best: number; days: string[] };
  /** Feilbanken: spørsmål eleven har svart feil på, med antall bom og dato. Nøkkel som «quiz:12». */
  miss?: Record<string, { n: number; d: string }>;
  /** Quizspørsmål (indekser) eleven har svart riktig på minst én gang. Brukes til lekser. */
  qok?: number[];
}
export interface Gift { item_id: string; created_at: string }
/** rank og total kommer fra databasen. Elever får bare topp 3 og sin egen rad. */
export interface LbRow { display_name: string; points: number; is_me: boolean; rank?: number; total?: number }
/** Tellere for ett spill siden forrige sending. */
export interface ActivityRow { mode: string; answers: number; correct: number; xp: number; timed: number; ms: number; fast: number }
/** Avatar og kostymer eleven eier (id-er fra alle temaer). ready = databasen har avatarstøtte. */
export interface AvatarData { cfg: unknown; owned: string[]; ready: boolean }
/** Egg og dyr, og XP i alle temaer til sammen. ready = databasen har støtte for dyr. */
export interface PetData { pets: Pet[]; total: number; ready: boolean }
/** Svar fra unlock_achievement. new = første gang. skin og pet er belønningen, om det er en. */
export interface AchResult { new: boolean; skin?: string | null; pet?: Pet | null }
export interface Progress { points: number; spent: number; state: SavedState; gifts: Gift[] }
/** En lekse: et emne i et tema som klassen skal mestre innen en dato (ÅÅÅÅ-MM-DD). */
export interface Homework { id: string; theme: string; topic: string; due: string; created_at: string }
/** Det eleven ser av en live-økt akkurat nå. ci, e, score og rank kommer først når svaret vises. */
export interface LiveState {
  id: string; status: 'lobby' | 'question' | 'reveal' | 'end'; idx: number; total: number; time_limit: number;
  left_ms: number | null; q: string | null; opts: string[] | null; ci: number | null; e: string | null;
  my_choice: number | null; my_correct: boolean | null; my_points: number | null; score: number | null; rank: number | null; players: number;
}

/**
 * Lagring for appen. RemoteStore snakker med Supabase for innloggede elever.
 * PreviewStore lagrer bare i nettleseren og brukes når læreren prøver appen.
 */
export interface Store {
  readonly kind: 'remote' | 'preview';
  load(theme: string): Promise<Progress>;
  saveState(theme: string, state: SavedState): void;
  flush(): Promise<void>;
  /** n er grunnpoengene. Databasen ganger med XP-bonusen for sesongen selv; mult brukes bare i forhåndsvisningen. */
  award(theme: string, n: number, mult?: number): Promise<number>;
  buy(theme: string, itemId: string, price: number): Promise<number>;
  leaderboard(theme: string): Promise<LbRow[]>;
  logActivity(theme: string, rows: ActivityRow[]): Promise<void>;
  loadAvatar(): Promise<AvatarData>;
  saveAvatar(cfg: unknown): void;
  buySkin(theme: string, itemId: string, price: number): Promise<number>;
  loadPets(): Promise<PetData>;
  /** Kanskje et egg. null = ingen egg denne gangen. */
  rollEgg(theme: string): Promise<Pet | null>;
  hatchEgg(id: string): Promise<Pet>;
  /** ready = databasen har achievements. */
  loadAchievements(): Promise<{ ids: string[]; ready: boolean }>;
  unlockAchievement(theme: string, id: string): Promise<AchResult>;
  /** Leksene klassen har fått i temaet. */
  loadHomework(theme: string): Promise<Homework[]>;
  /** Live-økten som pågår i klassen, eller null. */
  liveState(join?: boolean): Promise<LiveState | null>;
  liveAnswer(session: string, idx: number, choice: number): Promise<boolean>;
  /** Lytter på signalet for klassen i sanntid. Returnerer en funksjon som slutter å lytte. */
  liveListen(cb: () => void): () => void;
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
    if (raw.earned && typeof raw.earned === 'object') s.earned = raw.earned;
    if (Array.isArray(raw.played)) s.played = raw.played.filter((x: unknown) => typeof x === 'string');
    if (raw.miss && typeof raw.miss === 'object') s.miss = raw.miss;
    if (Array.isArray(raw.qok)) s.qok = raw.qok.filter((n: unknown) => typeof n === 'number');
    if (raw.day && typeof raw.day.d === 'string') s.day = { d: raw.day.d, xp: Number(raw.day.xp) || 0 };
    if (raw.streak && typeof raw.streak.last === 'string') s.streak = { n: Number(raw.streak.n) || 0, last: raw.streak.last, best: Number(raw.streak.best) || 0, days: Array.isArray(raw.streak.days) ? raw.streak.days.slice(-14) : [] };
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
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') { void this.flush(); void this.flushAvatar(); } });
    window.addEventListener('pagehide', () => { void this.flush(); void this.flushAvatar(); });
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

  async logActivity(theme: string, rows: ActivityRow[]): Promise<void> {
    const { error } = await supabase.rpc('log_activity', { p_theme: theme, p_rows: rows });
    if (error) throw error;
  }

  async loadAvatar(): Promise<AvatarData> {
    const { data: u } = await supabase.auth.getUser();
    const [p, w] = await Promise.all([
      supabase.from('profiles').select('avatar').eq('id', u.user?.id ?? '').maybeSingle(),
      supabase.from('wardrobe').select('item_id'),
    ]);
    if (p.error || w.error) return { cfg: null, owned: [], ready: false };
    return { cfg: p.data?.avatar ?? null, owned: (w.data ?? []).map((r: { item_id: string }) => r.item_id), ready: true };
  }

  private avaTimer: number | undefined;
  private avaPending: unknown = null;
  saveAvatar(cfg: unknown): void {
    this.avaPending = JSON.parse(JSON.stringify(cfg));
    clearTimeout(this.avaTimer);
    this.avaTimer = window.setTimeout(() => { void this.flushAvatar(); }, 800);
  }
  private async flushAvatar() {
    clearTimeout(this.avaTimer);
    const c = this.avaPending; if (!c) return;
    this.avaPending = null;
    const { error } = await supabase.rpc('save_avatar', { p_avatar: c });
    if (error && !this.avaPending) { this.avaPending = c; this.avaTimer = window.setTimeout(() => { void this.flushAvatar(); }, 8000); }
  }

  async buySkin(theme: string, itemId: string): Promise<number> {
    const { data, error } = await supabase.rpc('buy_skin', { p_theme: theme, p_item: itemId });
    if (error) throw error;
    return data as number;
  }

  async leaderboard(theme: string): Promise<LbRow[]> {
    const { data, error } = await supabase.rpc('get_leaderboard', { p_theme: theme });
    if (error) throw error;
    return (data ?? []) as LbRow[];
  }

  async loadPets(): Promise<PetData> {
    const [p, x] = await Promise.all([
      supabase.from('pets').select('*').order('found_at'),
      supabase.from('progress').select('points'),
    ]);
    if (p.error) return { pets: [], total: 0, ready: false };
    const total = (x.data ?? []).reduce((a: number, r: { points: number }) => a + (r.points || 0), 0);
    return { pets: (p.data ?? []) as Pet[], total, ready: true };
  }
  async rollEgg(theme: string): Promise<Pet | null> {
    const { data, error } = await supabase.rpc('roll_egg', { p_theme: theme });
    if (error) throw error;
    const d = data as Pet | null;
    return d && d.id ? d : null;
  }
  async hatchEgg(id: string): Promise<Pet> {
    const { data, error } = await supabase.rpc('hatch_egg', { p_id: id });
    if (error) throw error;
    return data as Pet;
  }
  async loadAchievements() {
    const { data, error } = await supabase.from('achievements').select('id');
    if (error) return { ids: [], ready: false };
    return { ids: (data ?? []).map((r: { id: string }) => r.id), ready: true };
  }
  async unlockAchievement(theme: string, id: string): Promise<AchResult> {
    const { data, error } = await supabase.rpc('unlock_achievement', { p_theme: theme, p_id: id });
    if (error) throw error;
    return (data ?? { new: false }) as AchResult;
  }
  async loadHomework(theme: string): Promise<Homework[]> { return homeworkFor(theme); }
  async liveState(join = true): Promise<LiveState | null> {
    const { data, error } = await supabase.rpc('live_state', { p_join: join });
    if (error) throw error;
    return (data ?? null) as LiveState | null;
  }
  async liveAnswer(session: string, idx: number, choice: number): Promise<boolean> {
    const { data, error } = await supabase.rpc('live_answer', { p_session: session, p_idx: idx, p_choice: choice });
    if (error) throw error;
    return !!data;
  }
  liveListen(cb: () => void): () => void { return listenTicks(cb); }
}

/** Lekser i temaet. RLS gir eleven bare sin egen klasse, og læreren bare sine. */
async function homeworkFor(theme: string, classId?: string | null): Promise<Homework[]> {
  let q = supabase.from('homework').select('id, theme, topic, due, created_at').eq('theme', theme);
  if (classId) q = q.eq('class_id', classId);
  const { data, error } = await q.order('due');
  if (error) return [];
  return (data ?? []) as Homework[];
}
/** Sanntid på live_ticks. Virker ikke Realtime, spør appen jevnlig likevel. */
export function listenTicks(cb: () => void, classId?: string): () => void {
  try {
    const ch = supabase.channel('live-' + (classId || 'me') + '-' + Math.random().toString(36).slice(2, 8))
      .on('postgres_changes' as any, { event: '*', schema: 'public', table: 'live_ticks', ...(classId ? { filter: 'class_id=eq.' + classId } : {}) }, () => cb())
      .subscribe();
    return () => { try { void supabase.removeChannel(ch); } catch { /* ignorer */ } };
  } catch { return () => {}; }
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
  async award(theme: string, n: number, mult = 1) {
    const p = this.read(theme), gain = n * mult; p.points += gain; this.write(theme, p);
    // Dyret ved avataren får like mye XP, som i databasen.
    const a = await this.loadAvatar(), id = (a.cfg as { pet?: string } | null)?.pet;
    if (id) { const all = this.petsRead(), pet = all.find((x) => x.id === id && x.hatched_at); if (pet) { pet.pet_xp = (pet.pet_xp || 0) + gain; this.petsWrite(all); } }
    return p.points;
  }
  /** Sesongene som pågår i klassen læreren forhåndsviser. */
  seasons: string[] = [];
  async buy(theme: string, itemId: string, price: number) {
    const p = this.read(theme);
    if (p.points - p.spent < price) throw new Error('Ikke nok poeng');
    p.spent += price; p.gifts.push({ item_id: itemId, created_at: new Date().toISOString() }); this.write(theme, p);
    return p.spent;
  }
  reset(theme: string) { try { localStorage.removeItem(this.key(theme)); localStorage.removeItem('puggen-preview-avatar'); localStorage.removeItem('puggen-preview-pets'); localStorage.removeItem('puggen-preview-ach'); } catch { /* ignorer */ } }
  /** Forhåndsvisningen registrerer ikke aktivitet. */
  async logActivity() { /* ingenting */ }
  async loadAvatar(): Promise<AvatarData> {
    try { const r = JSON.parse(localStorage.getItem('puggen-preview-avatar') || 'null'); if (r) return { cfg: r.cfg, owned: Array.isArray(r.owned) ? r.owned : [], ready: true }; } catch { /* tom */ }
    return { cfg: null, owned: [], ready: true };
  }
  private avaWrite(cfg: unknown, owned: string[]) { try { localStorage.setItem('puggen-preview-avatar', JSON.stringify({ cfg, owned })); } catch { /* ignorer */ } }
  saveAvatar(cfg: unknown) { void this.loadAvatar().then((a) => this.avaWrite(cfg, a.owned)); }
  async buySkin(theme: string, itemId: string, price: number) {
    const p = this.read(theme), a = await this.loadAvatar();
    if (a.owned.includes(itemId)) throw new Error('Du har allerede dette kostymet');
    if (p.points - p.spent < price) throw new Error('Ikke nok poeng');
    p.spent += price; this.write(theme, p); this.avaWrite(a.cfg, a.owned.concat(itemId));
    return p.spent;
  }
  // ---------- dyr i forhåndsvisningen: samme regler som i databasen, men lagret i nettleseren ----------
  private petsRead(): Pet[] { try { const r = JSON.parse(localStorage.getItem('puggen-preview-pets') || '[]'); return Array.isArray(r) ? r : []; } catch { return []; } }
  private petsWrite(p: Pet[]) { try { localStorage.setItem('puggen-preview-pets', JSON.stringify(p)); } catch { /* ignorer */ } }
  private total() { return ['kritisk', 'klima', 'nyrel'].reduce((a, t) => a + this.read(t).points, 0); }
  private lastRoll = 0;
  async loadPets(): Promise<PetData> { return { pets: this.petsRead(), total: this.total(), ready: true }; }
  /** Lager et egg med en gang. Bare for læreren, så hen kan prøve klekkingen. */
  async giveEgg(theme: string, egg: EggKind): Promise<Pet> {
    const p: Pet = { id: 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), egg, found_at: new Date().toISOString(), found_theme: theme, xp_start: this.total(), xp_need: EGGS[egg].need, hatched_at: null, species: null, variant: null, rarity: null };
    this.petsWrite(this.petsRead().concat(p));
    return p;
  }
  /** Bare for læreren: gjør alle egg klare til å klekke. */
  readyEggs(): Pet[] { const all = this.petsRead(), t = this.total(); all.forEach((p) => { if (!p.hatched_at) p.xp_start = Math.min(p.xp_start, t - p.xp_need); }); this.petsWrite(all); return all; }
  async rollEgg(theme: string): Promise<Pet | null> {
    if (Date.now() - this.lastRoll < CHANCE.cooldownMs) return null;
    this.lastRoll = Date.now();
    const all = this.petsRead(), day = new Date().toISOString().slice(0, 10);
    if (all.filter((p) => !p.hatched_at).length >= CHANCE.maxEggs || all.filter((p) => p.found_at.slice(0, 10) === day).length >= CHANCE.perDay) return null;
    const r = Math.random();
    let egg: EggKind | null = r < CHANCE.mytisk ? 'mytisk' : r < CHANCE.mytisk + CHANCE.vanlig ? 'vanlig' : null;
    if (egg === 'vanlig' && this.seasons.length && Math.random() < 0.6) egg = this.seasons[Math.floor(Math.random() * this.seasons.length)] as EggKind;
    return egg ? this.giveEgg(theme, egg) : null;
  }
  async hatchEgg(id: string): Promise<Pet> {
    const all = this.petsRead(), p = all.find((x) => x.id === id);
    if (!p) throw new Error('Fant ikke egget');
    if (p.hatched_at) return p;
    if (this.total() < p.xp_start + p.xp_need) throw new Error('Egget er ikke klart til å klekke ennå');
    p.species = p.egg === 'mytisk' ? 'drage' : pick(SPECIES.filter((s) => s.egg === 'vanlig')).id;
    p.variant = isSeasonEgg(p.egg) ? (p.egg as Variant) : pick(VARIANTS).id;
    p.rarity = rarityOf(p.species, p.variant);
    p.hatched_at = new Date().toISOString();
    this.petsWrite(all);
    return p;
  }
  // ---------- achievements i forhåndsvisningen ----------
  private achRead(): string[] { try { const r = JSON.parse(localStorage.getItem('puggen-preview-ach') || '[]'); return Array.isArray(r) ? r : []; } catch { return []; } }
  async loadAchievements() { return { ids: this.achRead(), ready: true }; }
  async unlockAchievement(theme: string, id: string): Promise<AchResult> {
    const ids = this.achRead();
    if (ids.includes(id)) return { new: false };
    try { localStorage.setItem('puggen-preview-ach', JSON.stringify(ids.concat(id))); } catch { /* ignorer */ }
    const r = achById(id)?.reward;
    if (r?.kind === 'skin') { const a = await this.loadAvatar(); if (!a.owned.includes(r.id)) this.avaWrite(a.cfg, a.owned.concat(r.id)); return { new: true, skin: r.id }; }
    if (r?.kind === 'pet') {
      const p: Pet = { id: 'p' + Date.now().toString(36), egg: 'belonning', found_at: new Date().toISOString(), found_theme: theme, xp_start: this.total(), xp_need: 0, hatched_at: new Date().toISOString(), species: r.species as Species, variant: 'vanlig', rarity: rarityOf(r.species, 'vanlig') };
      this.petsWrite(this.petsRead().concat(p));
      return { new: true, pet: p };
    }
    return { new: true };
  }
  /** Læreren ser klassens ekte lekser i forhåndsvisningen. Live er bare for elever. */
  async loadHomework(theme: string): Promise<Homework[]> { return this.classId ? homeworkFor(theme, this.classId) : []; }
  async liveState(): Promise<LiveState | null> { return null; }
  async liveAnswer(): Promise<boolean> { return false; }
  liveListen(): () => void { return () => {}; }
  /**
   * Lærerens «Lås opp alt» i forhåndsvisningen: høyeste nivå med poeng til overs, alle kostymer og bakgrunner,
   * alle achievements og ett dyr av hver art. Lagres bare i denne nettleseren og rører aldri databasen.
   */
  async unlockEverything(theme: string, topXp: number): Promise<{ points: number; owned: string[]; ach: string[]; pets: Pet[] }> {
    const p = this.read(theme); p.points = Math.max(p.points, topXp + 3000); this.write(theme, p);
    const a = await this.loadAvatar(), owned = Array.from(new Set(a.owned.concat(SKINS.map((k) => k.id), BACKGROUNDS.filter((b) => b.price > 0).map((b) => b.id))));
    this.avaWrite(a.cfg, owned);
    const ach = ACHS.map((x) => x.id);
    try { localStorage.setItem('puggen-preview-ach', JSON.stringify(ach)); } catch { /* ignorer */ }
    const pets = this.petsRead(), now = new Date().toISOString(), t = this.total();
    SPECIES.forEach((sp, i) => {
      if (pets.some((x) => x.hatched_at && x.species === sp.id)) return;
      pets.push({ id: 'u' + Date.now().toString(36) + i, egg: sp.egg === 'belonning' ? 'belonning' : sp.egg, found_at: now, found_theme: theme, xp_start: t, xp_need: 0, hatched_at: now, species: sp.id, variant: 'vanlig', rarity: rarityOf(sp.id, 'vanlig') });
    });
    this.petsWrite(pets);
    return { points: p.points, owned, ach, pets };
  }
  /** Er alt låst opp i forhåndsvisningen? */
  async allUnlocked(theme: string, topXp: number): Promise<boolean> {
    const a = await this.loadAvatar();
    return this.read(theme).points >= topXp && SKINS.every((k) => a.owned.includes(k.id)) && ACHS.every((x) => this.achRead().includes(x.id));
  }
  /** Lærerens «Lås opp alt»: setter XP i forhåndsvisningen. Rører ikke databasen. */
  async setPoints(theme: string, n: number) { const p = this.read(theme); p.points = Math.max(p.points, n); this.write(theme, p); return p.points; }
}
