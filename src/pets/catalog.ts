// Kjæledyr og egg. Artene, fargevariantene og vektene må stemme med hatch_egg i
// supabase/migrations/20261029800000_pets.sql, som avgjør hva som klekker.

export type EggKind = 'vanlig' | 'mytisk';
export type Species = 'ku' | 'sau' | 'kanin' | 'hund' | 'katt' | 'skilpadde' | 'minigris' | 'enhjorning' | 'drage';
export type Variant = 'vanlig' | 'stripete' | 'bronse' | 'solv' | 'smaragd' | 'neon' | 'gull';

export interface Pet {
  id: string;
  egg: EggKind;
  found_at: string;
  found_theme: string;
  xp_start: number;
  xp_need: number;
  hatched_at: string | null;
  species: Species | null;
  variant: Variant | null;
  rarity: number | null;
}

export const SPECIES: { id: Species; name: string; tier: number; w: number; egg: EggKind }[] = [
  { id: 'ku', name: 'Ku', tier: 0, w: 16, egg: 'vanlig' },
  { id: 'sau', name: 'Sau', tier: 0, w: 16, egg: 'vanlig' },
  { id: 'kanin', name: 'Kanin', tier: 0, w: 16, egg: 'vanlig' },
  { id: 'hund', name: 'Hund', tier: 0, w: 14, egg: 'vanlig' },
  { id: 'katt', name: 'Katt', tier: 0, w: 14, egg: 'vanlig' },
  { id: 'skilpadde', name: 'Skilpadde', tier: 0, w: 12, egg: 'vanlig' },
  { id: 'minigris', name: 'Minigris', tier: 1, w: 9, egg: 'vanlig' },
  { id: 'enhjorning', name: 'Enhjørning', tier: 2, w: 3, egg: 'vanlig' },
  { id: 'drage', name: 'Drage', tier: 3, w: 1, egg: 'mytisk' },
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
export const RARITIES = ['Vanlig', 'Sjelden', 'Veldig sjelden', 'Episk', 'Legendarisk'];
export const EGGS: Record<EggKind, { name: string; need: number; desc: string }> = {
  vanlig: { name: 'Egg', need: 300, desc: 'Et prikkete egg. Noe lite rører seg inni.' },
  mytisk: { name: 'Mytisk egg', need: 600, desc: 'Et glødende egg med skjell. Det er varmt å holde i.' },
};
/** Sjansen per svar som gir XP. Står også i roll_egg i databasen. */
export const CHANCE = { vanlig: 0.025, mytisk: 0.0015, perDay: 2, maxEggs: 4, cooldownMs: 12000 };

export const speciesOf = (id: string | null) => SPECIES.find((s) => s.id === id);
export const variantOf = (id: string | null) => VARIANTS.find((v) => v.id === id);
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
