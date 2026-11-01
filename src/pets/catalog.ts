// Kjæledyr og egg. Artene, fargevariantene og vektene må stemme med hatch_egg i
// supabase/migrations/20261029800000_pets.sql, som avgjør hva som klekker.

/** halloween, jul og prove er sesongegg, se src/seasons/catalog.ts. */
export type EggKind = 'vanlig' | 'mytisk' | 'halloween' | 'jul' | 'prove';
export type Species = 'ku' | 'sau' | 'kanin' | 'hund' | 'katt' | 'skilpadde' | 'minigris' | 'enhjorning' | 'drage' | 'ugle' | 'rev' | 'elefant' | 'foniks';
export type Variant = 'vanlig' | 'stripete' | 'bronse' | 'solv' | 'smaragd' | 'neon' | 'gull' | 'halloween' | 'jul' | 'prove';

export interface Pet {
  id: string;
  /** belonning = fått fra et achievement, ikke klekket av et egg. */
  egg: EggKind | 'belonning';
  found_at: string;
  found_theme: string;
  xp_start: number;
  xp_need: number;
  hatched_at: string | null;
  species: Species | null;
  variant: Variant | null;
  rarity: number | null;
  /** XP dyret har fått som følgesvenn ved avataren. */
  pet_xp?: number;
}

export const SPECIES: { id: Species; name: string; tier: number; w: number; egg: EggKind | 'belonning' }[] = [
  { id: 'ku', name: 'Ku', tier: 0, w: 16, egg: 'vanlig' },
  { id: 'sau', name: 'Sau', tier: 0, w: 16, egg: 'vanlig' },
  { id: 'kanin', name: 'Kanin', tier: 0, w: 16, egg: 'vanlig' },
  { id: 'hund', name: 'Hund', tier: 0, w: 14, egg: 'vanlig' },
  { id: 'katt', name: 'Katt', tier: 0, w: 14, egg: 'vanlig' },
  { id: 'skilpadde', name: 'Skilpadde', tier: 0, w: 12, egg: 'vanlig' },
  { id: 'minigris', name: 'Minigris', tier: 1, w: 9, egg: 'vanlig' },
  { id: 'enhjorning', name: 'Enhjørning', tier: 2, w: 3, egg: 'vanlig' },
  { id: 'drage', name: 'Drage', tier: 3, w: 1, egg: 'mytisk' },
  // Bare via achievements. Kommer alltid i vanlig farge.
  { id: 'ugle', name: 'Ugle', tier: 2, w: 0, egg: 'belonning' },
  { id: 'rev', name: 'Rev', tier: 2, w: 0, egg: 'belonning' },
  { id: 'elefant', name: 'Elefant', tier: 2, w: 0, egg: 'belonning' },
  { id: 'foniks', name: 'Føniks', tier: 4, w: 0, egg: 'belonning' },
];
export const VARIANTS: { id: Variant; name: string; prefix: string; tier: number; w: number }[] = [
  { id: 'vanlig', name: 'Vanlig', prefix: '', tier: 0, w: 55 },
  { id: 'stripete', name: 'Stripete', prefix: 'Stripete ', tier: 1, w: 17 },
  { id: 'bronse', name: 'Bronse', prefix: 'Bronse', tier: 1, w: 12 },
  { id: 'solv', name: 'Sølv', prefix: 'Sølv', tier: 2, w: 8 },
  { id: 'smaragd', name: 'Smaragd', prefix: 'Smaragd', tier: 3, w: 4 },
  { id: 'neon', name: 'Neon', prefix: 'Neon', tier: 3, w: 3 },
  { id: 'gull', name: 'Gull', prefix: 'Gull', tier: 4, w: 1 },
];
/** Fargene fra sesongegg. Finnes bare mens læreren har sesongen på. */
export const SEASON_VARIANTS: { id: Variant; name: string; prefix: string; tier: number; w: number }[] = [
  { id: 'halloween', name: 'Halloween', prefix: 'Halloween-', tier: 3, w: 0 },
  { id: 'jul', name: 'Jul', prefix: 'Jule', tier: 3, w: 0 },
  { id: 'prove', name: 'Geni', prefix: 'Geni', tier: 3, w: 0 },
];
export const RARITIES = ['Vanlig', 'Sjelden', 'Veldig sjelden', 'Episk', 'Legendarisk'];
export const EGGS: Record<EggKind, { name: string; need: number; desc: string }> = {
  vanlig: { name: 'Egg', need: 300, desc: 'Et prikkete egg. Noe lite rører seg inni.' },
  mytisk: { name: 'Mytisk egg', need: 600, desc: 'Et glødende egg med skjell. Det er varmt å holde i.' },
  halloween: { name: 'Gresskaregg', need: 300, desc: 'Et oransje egg som gløder svakt. Dyret inni får halloweenfarger.' },
  jul: { name: 'Juleegg', need: 300, desc: 'Et egg pakket inn som en gave. Dyret inni får julefarger.' },
  prove: { name: 'Kunnskapsegg', need: 300, desc: 'Et blått egg med stjerner. Dyret inni blir et lite geni.' },
};
export const isSeasonEgg = (e: string) => e === 'halloween' || e === 'jul' || e === 'prove';

// ---------- dyr som vokser ----------
/** Dyret ved avataren får XP. Nivå L nås ved 20 · L · (L − 1) XP, opp til nivå 10. */
export const PET_MAX = 10;
export const petLevelXp = (l: number) => 20 * l * (l - 1);
export function petLevel(xp = 0): number { let l = 1; while (l < PET_MAX && xp >= petLevelXp(l + 1)) l++; return l; }
/** 1 = liten (nivå 1–4), 2 = ung (5–9), 3 = mester (10). */
export function petStage(xp = 0): 1 | 2 | 3 { const l = petLevel(xp); return l >= 10 ? 3 : l >= 5 ? 2 : 1; }
export const STAGE_NAMES = ['', 'Liten', 'Ung', 'Mester'];
/** Sjansen per svar som gir XP. Står også i roll_egg i databasen. */
export const CHANCE = { vanlig: 0.025, mytisk: 0.0015, perDay: 5, maxEggs: 8, cooldownMs: 12000 };

export const speciesOf = (id: string | null) => SPECIES.find((s) => s.id === id);
export const variantOf = (id: string | null) => VARIANTS.find((v) => v.id === id) || SEASON_VARIANTS.find((v) => v.id === id);
export function rarityOf(sp: string | null, va: string | null): number { return Math.min(4, (speciesOf(sp)?.tier ?? 0) + (variantOf(va)?.tier ?? 0)); }

/** «Gullkatt», «Stripete hund», «Smaragddrage». */
export function petName(sp: string | null, va: string | null): string {
  const s = speciesOf(sp), v = variantOf(va);
  if (!s) return 'Ukjent dyr';
  if (!v || !v.prefix) return s.name;
  return v.prefix + s.name.toLowerCase();
}

/** Trekk etter vekt, brukt i lærerens forhåndsvisning. Elevenes dyr trekkes i databasen. */
export function pick<T extends { w: number }>(list: T[]): T {
  const tot = list.reduce((a, b) => a + b.w, 0);
  let r = Math.random() * tot;
  for (const x of list) { if ((r -= x.w) < 0) return x; }
  return list[list.length - 1];
}

/** Hvor langt egget har kommet, 0 til 1. */
export function eggProgress(p: Pet, totalXp: number): number { return Math.max(0, Math.min(1, (totalXp - p.xp_start) / p.xp_need)); }
