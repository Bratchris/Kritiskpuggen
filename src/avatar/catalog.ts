// Valgene i avatarskjermen og kostymene som kan kjøpes.
// Prisene i SKINS må stemme med skin_items i databasen (supabase/migrations/*_avatar.sql).

export type Gender = 'g' | 'j' | 'n';
export type Slot = 'hat' | 'face' | 'back' | 'hand' | 'top' | 'outfit';

export interface AvatarCfg {
  g: Gender;
  skin: number;
  hair: string;
  hairC: number;
  eyes: 'rund' | 'glad';
  lashes: boolean;
  mouth: 'smil' | 'glis' | 'rolig';
  blush: boolean;
  top: string;
  topC: number;
  bottom: string;
  bottomC: number;
  shoes: string;
  shoesC: number;
  /** Kostymer på, ett per plass. */
  eq: Partial<Record<Slot, string>>;
  /** Satt når eleven har lagret en egen avatar. */
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
  { id: 'kort', name: 'Kort' }, { id: 'pigg', name: 'Piggete' }, { id: 'snau', name: 'Snauklipp' },
  { id: 'krøller', name: 'Krøller' }, { id: 'afro', name: 'Afro' }, { id: 'langt', name: 'Langt' },
  { id: 'hestehale', name: 'Hestehale' }, { id: 'fletter', name: 'Fletter' }, { id: 'bolle', name: 'Knute' },
];
export const HAIR_COLORS: Swatch[] = [
  { c: '#1f1712', name: 'Svart' }, { c: '#4a2f1f', name: 'Mørkebrun' }, { c: '#8b5a2b', name: 'Brun' },
  { c: '#e0b84f', name: 'Blond' }, { c: '#b5512a', name: 'Rødt' }, { c: '#d8d3cc', name: 'Grått' },
  { c: '#3b6fb6', name: 'Blått' }, { c: '#d36ba6', name: 'Rosa' },
];
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
export const EYES: Opt[] = [{ id: 'rund', name: 'Runde' }, { id: 'glad', name: 'Glade' }];
export const MOUTHS: Opt[] = [{ id: 'smil', name: 'Smil' }, { id: 'glis', name: 'Glis' }, { id: 'rolig', name: 'Rolig' }];

export interface Skin { id: string; theme: string; slot: Slot; name: string; price: number; desc: string }
export const SLOT_NAMES: Record<Slot, string> = { hat: 'Hodet', face: 'Ansiktet', back: 'Ryggen', hand: 'Hånden', top: 'Overdel', outfit: 'Hele kostymet' };

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
];
export const skinById = (id: string) => SKINS.find((s) => s.id === id);

export function defaultAvatar(seed = Math.random()): AvatarCfg {
  const pick = <T>(a: T[], k: number) => a[Math.floor((seed * 9973 * (k + 1)) % a.length)];
  return {
    g: 'n', skin: Math.floor(seed * SKIN_TONES.length) % SKIN_TONES.length, hair: pick(['kort', 'krøller', 'langt', 'pigg'], 1), hairC: pick([0, 1, 2, 3], 2),
    eyes: 'rund', lashes: false, mouth: 'smil', blush: false,
    top: 'hettegenser', topC: pick([0, 3, 4, 5], 3), bottom: 'bukse', bottomC: 7, shoes: 'joggesko', shoesC: 8, eq: {},
  };
}

/** Rydder en lagret avatar: ukjente verdier byttes ut, og kostymer eleven ikke eier tas av. */
export function cleanAvatar(raw: any, owned: Set<string>): AvatarCfg {
  const d = defaultAvatar(0.37), c: any = { ...d, ...(raw && typeof raw === 'object' ? raw : {}) };
  const inList = (v: unknown, l: { id: string }[], f: string) => (l.some((o) => o.id === v) ? v : f);
  const idx = (v: unknown, n: number, f: number) => (Number.isInteger(v) && (v as number) >= 0 && (v as number) < n ? v : f);
  c.g = inList(c.g, GENDERS, d.g); c.hair = inList(c.hair, HAIR_STYLES, d.hair);
  c.top = inList(c.top, TOPS, d.top); c.bottom = inList(c.bottom, BOTTOMS, d.bottom); c.shoes = inList(c.shoes, SHOES, d.shoes);
  c.eyes = inList(c.eyes, EYES, d.eyes); c.mouth = inList(c.mouth, MOUTHS, d.mouth);
  c.skin = idx(c.skin, SKIN_TONES.length, d.skin); c.hairC = idx(c.hairC, HAIR_COLORS.length, d.hairC);
  c.topC = idx(c.topC, CLOTH_COLORS.length, d.topC); c.bottomC = idx(c.bottomC, CLOTH_COLORS.length, d.bottomC); c.shoesC = idx(c.shoesC, CLOTH_COLORS.length, d.shoesC);
  c.lashes = !!c.lashes; c.blush = !!c.blush; c.made = !!c.made;
  const eq: Partial<Record<Slot, string>> = {};
  for (const [slot, id] of Object.entries(c.eq || {})) { const s = skinById(String(id)); if (s && s.slot === slot && owned.has(s.id)) eq[slot as Slot] = s.id; }
  c.eq = eq;
  return c as AvatarCfg;
}
