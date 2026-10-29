// Valgene i avatarskjermen og alt som kan kjøpes.
import { bgById } from './backgrounds';

// Prisene i SKINS må stemme med skin_items i databasen (supabase/migrations/*_avatar*.sql).

export type Gender = 'g' | 'j' | 'n';
export type Slot = 'hat' | 'face' | 'neck' | 'back' | 'hand' | 'top' | 'outfit' | 'feet';
export type ColorKey = 'skinC' | 'hairC' | 'headC' | 'eyeC' | 'blushC' | 'lipC' | 'shadowC' | 'topC' | 'bottomC' | 'shoesC';

export interface AvatarCfg {
  g: Gender;
  skinC: string;
  hair: string;
  hairC: string;
  /** Hodeplagg som erstatter håret, f.eks. hijab. */
  headwear: 'ingen' | 'hijab';
  headC: string;
  eyes: 'rund' | 'store' | 'glad';
  eyeC: string;
  lashes: boolean;
  mouth: 'smil' | 'glis' | 'rolig';
  blush: boolean;
  blushC: string;
  lips: boolean;
  lipC: string;
  shadow: boolean;
  shadowC: string;
  liner: boolean;
  freckles: boolean;
  top: string;
  topC: string;
  bottom: string;
  bottomC: string;
  shoes: string;
  shoesC: string;
  /** Kostymer på, ett per plass. */
  eq: Partial<Record<Slot, string>>;
  /** Egen farge på kostymer som kan fargelegges, per kostyme-id. */
  tint: Record<string, string>;
  /** Bakgrunnen bak appen, id fra backgrounds.ts. Tom = temaets vanlige bakgrunn. */
  bg?: string;
  /** Egget eller dyret som står ved siden av avataren (id fra tabellen pets). */
  pet?: string;
  made?: boolean;
}

export interface Opt { id: string; name: string }
export interface Swatch { c: string; name: string }

export const GENDERS: { id: Gender; name: string }[] = [
  { id: 'g', name: 'Gutt' }, { id: 'j', name: 'Jente' }, { id: 'n', name: 'Nøytral' },
];
export const SKIN_TONES: Swatch[] = [
  { c: '#f9dcc4', name: 'Lys' }, { c: '#f1c27d', name: 'Lys oliven' }, { c: '#e0ac69', name: 'Middels' },
  { c: '#c68642', name: 'Gyllenbrun' }, { c: '#8d5524', name: 'Brun' }, { c: '#5c3a21', name: 'Mørkebrun' },
];
export const HAIR_STYLES: Opt[] = [
  { id: 'kort', name: 'Kort' }, { id: 'pigg', name: 'Piggete' }, { id: 'snau', name: 'Snauklipp' }, { id: 'pannelugg', name: 'Pannelugg' },
  { id: 'sidelugg', name: 'Sidelugg' }, { id: 'mohawk', name: 'Hanekam' }, { id: 'krøller', name: 'Krøller' }, { id: 'afro', name: 'Afro' },
  { id: 'cornrows', name: 'Cornrows' }, { id: 'dreads', name: 'Dreads' }, { id: 'bob', name: 'Bob' }, { id: 'langt', name: 'Langt' },
  { id: 'langkrøll', name: 'Lange krøller' }, { id: 'hestehale', name: 'Hestehale' }, { id: 'fletter', name: 'Fletter' }, { id: 'bolle', name: 'Knute' },
  { id: 'musefletter', name: 'To knuter' },
];
export const HEADWEAR: Opt[] = [{ id: 'ingen', name: 'Ingen' }, { id: 'hijab', name: 'Hijab' }];
export const HAIR_COLORS: Swatch[] = [
  { c: '#1f1712', name: 'Svart' }, { c: '#4a2f1f', name: 'Mørkebrun' }, { c: '#8b5a2b', name: 'Brun' },
  { c: '#e0b84f', name: 'Blond' }, { c: '#b5512a', name: 'Rødt' }, { c: '#d8d3cc', name: 'Grått' },
  { c: '#3b6fb6', name: 'Blått' }, { c: '#d36ba6', name: 'Rosa' },
];
export const EYE_COLORS: Swatch[] = [
  { c: '#5a3a22', name: 'Brune' }, { c: '#2b1d14', name: 'Mørkebrune' }, { c: '#4a7fb5', name: 'Blå' },
  { c: '#5e8f4a', name: 'Grønne' }, { c: '#8a9aa6', name: 'Grå' }, { c: '#b07a3a', name: 'Hasselnøtt' },
];
export const LIP_COLORS: Swatch[] = [
  { c: '#c2455a', name: 'Rød' }, { c: '#e07a8a', name: 'Rosa' }, { c: '#9b4a5a', name: 'Bær' }, { c: '#c98a6a', name: 'Nøytral' }, { c: '#6a3d9a', name: 'Lilla' },
];
export const SHADOW_COLORS: Swatch[] = [
  { c: '#b48be0', name: 'Lilla' }, { c: '#6fb3d9', name: 'Blå' }, { c: '#e0a86a', name: 'Gull' }, { c: '#7aa86a', name: 'Grønn' }, { c: '#8a6a5a', name: 'Brun' },
];
export const BLUSH_COLORS: Swatch[] = [{ c: '#f08a8a', name: 'Rosa' }, { c: '#e8a07a', name: 'Fersken' }, { c: '#d9607a', name: 'Bringebær' }];
export const CLOTH_COLORS: Swatch[] = [
  { c: '#d9453b', name: 'Rød' }, { c: '#e8742a', name: 'Oransje' }, { c: '#f2c230', name: 'Gul' },
  { c: '#4fae6b', name: 'Grønn' }, { c: '#2e86c1', name: 'Blå' }, { c: '#6a3d9a', name: 'Lilla' },
  { c: '#e85a9a', name: 'Rosa' }, { c: '#333e47', name: 'Mørkegrå' }, { c: '#f4f1e8', name: 'Hvit' }, { c: '#8a6440', name: 'Brun' },
];
export const TOPS: Opt[] = [
  { id: 'tskjorte', name: 'T-skjorte' }, { id: 'genser', name: 'Genser' }, { id: 'hettegenser', name: 'Hettegenser' }, { id: 'skjorte', name: 'Skjorte' },
];
export const BOTTOMS: Opt[] = [{ id: 'bukse', name: 'Bukse' }, { id: 'shorts', name: 'Shorts' }, { id: 'skjort', name: 'Skjørt' }];
export const SHOES: Opt[] = [{ id: 'joggesko', name: 'Joggesko' }, { id: 'stovler', name: 'Støvler' }];
export const EYES: Opt[] = [{ id: 'rund', name: 'Runde' }, { id: 'store', name: 'Store' }, { id: 'glad', name: 'Glade' }];
export const MOUTHS: Opt[] = [{ id: 'smil', name: 'Smil' }, { id: 'glis', name: 'Glis' }, { id: 'rolig', name: 'Rolig' }];

export interface Skin { id: string; theme: string; slot: Slot; name: string; price: number; desc: string; tint?: string }
export const SLOT_NAMES: Record<Slot, string> = { hat: 'Hodet', face: 'Ansiktet', neck: 'Halsen', back: 'Ryggen', hand: 'Hånden', top: 'Overdel', outfit: 'Hele drakten', feet: 'Føttene' };

/** theme 'merch' = CRISPY-G-butikken, som finnes i alle temaer. tint = standardfarge for varer som kan fargelegges. */
export const SKINS: Skin[] = [
  // Kritiskpuggen: halloween
  { id: 'heksehatt', theme: 'kritisk', slot: 'hat', name: 'Heksehatt', price: 40, desc: 'Spiss og lilla. Perfekt til gresskarsesongen.' },
  { id: 'kattorer', theme: 'kritisk', slot: 'hat', name: 'Katteører', price: 45, desc: 'Svarte katteører. Bringer de ulykke? Sjekk kildene!' },
  { id: 'varulvorer', theme: 'kritisk', slot: 'hat', name: 'Varulvører', price: 60, desc: 'Lodne ører for fullmånenetter.' },
  { id: 'tryllestav', theme: 'kritisk', slot: 'hand', name: 'Tryllestav', price: 50, desc: 'Med stjerne på toppen.' },
  { id: 'heksekappe', theme: 'kritisk', slot: 'outfit', name: 'Heksekappe', price: 90, desc: 'Lang svart kappe med lilla belte.' },
  { id: 'flaggermusvinger', theme: 'kritisk', slot: 'back', name: 'Flaggermusvinger', price: 100, desc: 'Vinger som folder seg ut bak deg.' },
  { id: 'vampyrkappe', theme: 'kritisk', slot: 'back', name: 'Vampyrkappe', price: 120, desc: 'Svart kappe med rødt fôr og høy krage.' },
  { id: 'mumie', theme: 'kritisk', slot: 'outfit', name: 'Mumiedrakt', price: 140, desc: 'Pakket inn fra topp til tå.' },
  { id: 'skjelett', theme: 'kritisk', slot: 'outfit', name: 'Skjelettdrakt', price: 150, desc: 'Svart drakt med hvite knokler.' },
  { id: 'trollmann', theme: 'kritisk', slot: 'outfit', name: 'Trollmannskappe', price: 160, desc: 'Blå kappe med gylne stjerner.' },
  { id: 'gresskarhode', theme: 'kritisk', slot: 'hat', name: 'Gresskarhode', price: 180, desc: 'Et helt gresskar på hodet.' },
  { id: 'spokelse', theme: 'kritisk', slot: 'outfit', name: 'Spøkelseslaken', price: 220, desc: 'Det klassiske. Bøø!' },
  // Klimapuggen: natur og vær
  { id: 'sydvest', theme: 'klima', slot: 'hat', name: 'Sydvest', price: 40, desc: 'Gul regnhatt for norsk høstvær.' },
  { id: 'strikkelue', theme: 'klima', slot: 'hat', name: 'Strikkelue', price: 45, desc: 'Med dusk på toppen.' },
  { id: 'solbriller', theme: 'klima', slot: 'face', name: 'Solbriller', price: 50, desc: 'Fornybar energi rett i øynene.' },
  { id: 'blomsterkrans', theme: 'klima', slot: 'hat', name: 'Blomsterkrans', price: 55, desc: 'Ville blomster for artsmangfoldet.' },
  { id: 'kikkert', theme: 'klima', slot: 'hand', name: 'Kikkert', price: 60, desc: 'For å se på fugler og isbreer.' },
  { id: 'ryggsekk', theme: 'klima', slot: 'back', name: 'Tursekk', price: 70, desc: 'Klar for fjelltur.' },
  { id: 'regnfrakk', theme: 'klima', slot: 'outfit', name: 'Regnfrakk', price: 90, desc: 'Gul frakk mot ekstremvær.' },
  { id: 'marius', theme: 'klima', slot: 'top', name: 'Mariusgenser', price: 110, desc: 'Strikket og varm. Varer i mange år.' },
  { id: 'forskerfrakk', theme: 'klima', slot: 'top', name: 'Forskerfrakk', price: 120, desc: 'Hvit frakk for klimaforskere.' },
  { id: 'klimahelt', theme: 'klima', slot: 'back', name: 'Klimaheltkappe', price: 130, desc: 'Grønn kappe med blad på brystet.' },
  { id: 'biedrakt', theme: 'klima', slot: 'outfit', name: 'Biedrakt', price: 150, desc: 'Gule og svarte striper, med antenner.' },
  { id: 'astronaut', theme: 'klima', slot: 'outfit', name: 'Astronautdrakt', price: 240, desc: 'Se jorda fra verdensrommet.' },
  // CRISPY-G merch
  { id: 'cg_pannebaand', theme: 'merch', slot: 'hat', name: 'CRISPY-G pannebånd', price: 50, desc: 'Svetteband med logo. For de som jobber hardt.', tint: '#d9453b' },
  { id: 'cg_fotball', theme: 'merch', slot: 'hand', name: 'CRISPY-G fotball', price: 60, desc: 'Signert ball med gull-logo.' },
  { id: 'cg_caps', theme: 'merch', slot: 'hat', name: 'CRISPY-G caps', price: 70, desc: 'Klassisk caps med CG foran.', tint: '#1f2a44' },
  { id: 'cg_bottehatt', theme: 'merch', slot: 'hat', name: 'CRISPY-G bøttehatt', price: 75, desc: 'Bøttehatt for sol, regn og stil.', tint: '#e8742a' },
  { id: 'cg_tskjorte', theme: 'merch', slot: 'top', name: 'CRISPY-G T-skjorte', price: 80, desc: 'Myk T-skjorte med stor logo.', tint: '#f4f1e8' },
  { id: 'cg_sneakers', theme: 'merch', slot: 'feet', name: 'CRISPY-G sneakers', price: 90, desc: 'Høye sneakers med gull-detaljer.', tint: '#f4f1e8' },
  { id: 'cg_sekk', theme: 'merch', slot: 'back', name: 'CRISPY-G ryggsekk', price: 100, desc: 'Plass til både bøker og fotballsko.', tint: '#1e1a24' },
  { id: 'cg_hoodie', theme: 'merch', slot: 'top', name: 'CRISPY-G hoodie', price: 120, desc: 'Tykk hoodie med flamme-logo.', tint: '#1e1a24' },
  { id: 'cg_kjede', theme: 'merch', slot: 'neck', name: 'CRISPY-G gullkjede', price: 140, desc: 'Tungt kjede med CG-medaljong.' },
  { id: 'cg_hjemme', theme: 'merch', slot: 'outfit', name: 'Fotballdrakt, hjemme', price: 160, desc: 'Hjemmedrakt med nummer 10 og strømper.', tint: '#d9453b' },
  { id: 'cg_borte', theme: 'merch', slot: 'outfit', name: 'Fotballdrakt, borte', price: 160, desc: 'Stripete bortedrakt med nummer 7.', tint: '#2e86c1' },
  { id: 'cg_keeper', theme: 'merch', slot: 'outfit', name: 'Keeperdrakt', price: 170, desc: 'Langermet keeperdrakt med hansker.', tint: '#4fae6b' },
  { id: 'cg_tracksuit', theme: 'merch', slot: 'outfit', name: 'CRISPY-G tracksuit', price: 180, desc: 'Joggedress med tre striper og glidelås.', tint: '#6a3d9a' },
  { id: 'cg_gullball', theme: 'merch', slot: 'hand', name: 'Gullballen', price: 250, desc: 'Prisen for årets beste pugger.' },
];
export const skinById = (id: string) => SKINS.find((s) => s.id === id);
export const isMerch = (s: Skin) => s.theme === 'merch';

export function defaultAvatar(seed = Math.random()): AvatarCfg {
  const pick = <T>(a: T[], k: number) => a[Math.floor((seed * 9973 * (k + 1)) % a.length)];
  return {
    g: 'n', skinC: SKIN_TONES[Math.floor(seed * SKIN_TONES.length) % SKIN_TONES.length].c, hair: pick(['kort', 'krøller', 'langt', 'pigg'], 1), hairC: pick(HAIR_COLORS.slice(0, 4), 2).c,
    headwear: 'ingen', headC: '#2e6f93',
    eyes: 'rund', eyeC: EYE_COLORS[0].c, lashes: false, mouth: 'smil', blush: false, blushC: BLUSH_COLORS[0].c,
    lips: false, lipC: LIP_COLORS[1].c, shadow: false, shadowC: SHADOW_COLORS[0].c, liner: false, freckles: false,
    top: 'hettegenser', topC: pick([CLOTH_COLORS[0], CLOTH_COLORS[3], CLOTH_COLORS[4], CLOTH_COLORS[5]], 3).c, bottom: 'bukse', bottomC: CLOTH_COLORS[7].c,
    shoes: 'joggesko', shoesC: CLOTH_COLORS[8].c, eq: {}, tint: {},
  };
}

const HEX = /^#[0-9a-f]{6}$/i;
/** Godtar hex-farge, eller et gammelt palettnummer fra første versjon av avataren. */
function color(v: unknown, palette: Swatch[], fallback: string): string {
  if (typeof v === 'string' && HEX.test(v)) return v.toLowerCase();
  if (Number.isInteger(v) && (v as number) >= 0 && (v as number) < palette.length) return palette[v as number].c;
  return fallback;
}

/** Rydder en lagret avatar: ukjente verdier byttes ut, og ting eleven ikke eier tas av. */
export function cleanAvatar(raw: any, owned: Set<string>): AvatarCfg {
  const d = defaultAvatar(0.37), r = raw && typeof raw === 'object' ? raw : {}, c: any = { ...d, ...r };
  const inList = (v: unknown, l: { id: string }[], f: string) => (l.some((o) => o.id === v) ? v : f);
  c.g = inList(c.g, GENDERS, d.g); c.hair = inList(c.hair, HAIR_STYLES, d.hair); c.headwear = inList(c.headwear, HEADWEAR, d.headwear);
  c.top = inList(c.top, TOPS, d.top); c.bottom = inList(c.bottom, BOTTOMS, d.bottom); c.shoes = inList(c.shoes, SHOES, d.shoes);
  c.eyes = inList(c.eyes, EYES, d.eyes); c.mouth = inList(c.mouth, MOUTHS, d.mouth);
  // Første versjon lagret hudfarge som tallet «skin».
  c.skinC = color(r.skinC ?? r.skin, SKIN_TONES, d.skinC);
  c.hairC = color(r.hairC, HAIR_COLORS, d.hairC); c.headC = color(r.headC, CLOTH_COLORS, d.headC); c.eyeC = color(r.eyeC, EYE_COLORS, d.eyeC);
  c.blushC = color(r.blushC, BLUSH_COLORS, d.blushC); c.lipC = color(r.lipC, LIP_COLORS, d.lipC); c.shadowC = color(r.shadowC, SHADOW_COLORS, d.shadowC);
  c.topC = color(r.topC, CLOTH_COLORS, d.topC); c.bottomC = color(r.bottomC, CLOTH_COLORS, d.bottomC); c.shoesC = color(r.shoesC, CLOTH_COLORS, d.shoesC);
  for (const k of ['lashes', 'blush', 'lips', 'shadow', 'liner', 'freckles', 'made']) c[k] = !!c[k];
  delete c.skin;
  const eq: Partial<Record<Slot, string>> = {};
  for (const [slot, id] of Object.entries(c.eq || {})) { const s = skinById(String(id)); if (s && s.slot === slot && owned.has(s.id)) eq[slot as Slot] = s.id; }
  c.eq = eq;
  const tint: Record<string, string> = {};
  for (const [id, v] of Object.entries(c.tint || {})) { const s = skinById(id); if (s?.tint && typeof v === 'string' && HEX.test(v)) tint[id] = v.toLowerCase(); }
  c.tint = tint;
  const bg = bgById(c.bg);
  if (!bg || (bg.price > 0 && !owned.has(bg.id))) delete c.bg;
  if (typeof c.pet !== 'string' || c.pet.length > 64) delete c.pet;
  return c as AvatarCfg;
}
