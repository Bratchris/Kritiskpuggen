// Sesonghendelser. Læreren slår dem på for en klasse i lærerrommet, og de varer i 7 dager.
// Mens en hendelse pågår, kan eleven finne sesongegg, kjøpe sesongkostymer og -bakgrunner,
// og få mer XP hvis læreren har valgt det. Id-ene må stemme med 20261102300000_seasons_petlevels.sql.

export type SeasonId = 'halloween' | 'jul' | 'prove';
export interface Season {
  id: SeasonId;
  name: string;
  /** Kort navn til menyer. */
  short: string;
  desc: string;
  /** Standard XP-bonus når læreren slår den på. */
  xp: number;
  egg: { name: string; desc: string };
  /** Navn på dyrefargen fra sesongegget. */
  variant: string;
}
export const SEASONS: Season[] = [
  { id: 'halloween', name: 'Halloween-uka', short: 'Halloween', xp: 1, variant: 'Halloween',
    desc: 'Gresskaregg, uhyggelige kostymer og en heksenatt-bakgrunn.',
    egg: { name: 'Gresskaregg', desc: 'Et oransje egg som gløder svakt. Dyret inni får halloweenfarger.' } },
  { id: 'jul', name: 'Juleuka', short: 'Jul', xp: 1, variant: 'Jule',
    desc: 'Juleegg, nisselue og julegenser, og snø over hele appen.',
    egg: { name: 'Juleegg', desc: 'Et egg pakket inn som en gave. Dyret inni får julefarger og nisselue.' } },
  { id: 'prove', name: 'Prøveuka', short: 'Prøveuke', xp: 2, variant: 'Geni',
    desc: 'Dobbel XP som standard, kunnskapsegg og alt du trenger for en lang leseøkt.',
    egg: { name: 'Kunnskapsegg', desc: 'Et blått egg med stjerner. Dyret inni får geni-farger og doktorhatt.' } },
];
export const SEASON_IDS = SEASONS.map((s) => s.id) as string[];
export const seasonById = (id: string) => SEASONS.find((s) => s.id === id);

/** Det som ligger i classes.events: når hver hendelse varer til, og XP-bonusen. */
export type Events = Partial<Record<SeasonId, { until: string; xp: number }>>;
export const SEASON_DAYS = 7;

export function activeSeasons(ev: Events | null | undefined, now = Date.now()): SeasonId[] {
  if (!ev || typeof ev !== 'object') return [];
  return SEASONS.filter((s) => { const e = ev[s.id]; return !!e && typeof e.until === 'string' && new Date(e.until).getTime() > now; }).map((s) => s.id);
}
/** XP-bonusen: den største blant hendelsene som pågår, 1 til 3. */
export function xpMult(ev: Events | null | undefined): number {
  const act = activeSeasons(ev);
  return act.length ? Math.min(3, Math.max(1, ...act.map((id) => Math.round(Number(ev![id]!.xp) || 1)))) : 1;
}
export function untilText(iso: string): string {
  return new Date(iso).toLocaleDateString('nb-NO', { weekday: 'long', day: 'numeric', month: 'long' });
}
