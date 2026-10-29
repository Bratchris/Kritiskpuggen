export interface Card { id: number; t: string; q: string; a: string }
export interface QuizItem { t: string; q: string; a: string; w: string[]; e: string }
export interface TfItem { t: string; s: string; v: boolean; e: string }
export interface HullItem { t: string; s: string; a: string[] }
export interface SortItem { text: string; b: string; e: string }
export interface FeilItem { t: string; src: string; sec: string; text: string; fix: string; e: string }
export interface OrderPuzzle { title: string; intro: string; items: [string, string][] }
export interface ThinkItem { id: string; q: string; boxes: { h: string; items: string[] }[]; keys: [string, string][] }

/** f: viser emnefilteret. g: global funksjon i den faste linjen øverst. */
export interface Mode { id: string; name: string; desc: string; f: number; g?: number }

export interface Content {
  cards: Card[];
  quiz: QuizItem[];
  tf: TfItem[];
  hull: HullItem[];
  pairs: [string, string][];
  order: OrderPuzzle[];
  sort: SortItem[];
  think: ThinkItem[];
  feil: FeilItem[];
}

export interface Product { id: string; name: string; price: number; ic: string; desc: string }

export interface ShopDef {
  products: Product[];
  icons: Record<string, string>;
  /** Overskrift for det eleven har gitt, f.eks. «Lærerens godteriskål». */
  shelfTitle: string;
  emptyText: string;
  goldId: string;
}

export interface Level { n: string; xp: number; t: string[] }

export interface RoomItem {
  n: string;
  k: 'floor' | 'rug' | 'wall';
  w: number;
  d?: number;
  h?: number;
  f: () => string;
  cat?: string;
  dsc: string;
  lv?: number;
}

/** Gulv: x, y og f (snudd). Vegg: wl (venstre/høyre) og s (plass langs veggen). */
export interface Placement { x?: number; y?: number; f?: number; wl?: 'L' | 'R'; s?: number; /** Rommet i huset (0 = første rom). */ r?: number }

/** Ett rom i huset. lv er nivået (indeks i levels) som låser det opp. */
export interface HouseRoom {
  name: string;
  pos: 'g1' | 'g2' | 'base' | 'loft';
  lv: number;
  /** CSS-klasse med rommets farger, se themes.css. Tom for første rom. */
  cls: string;
  /** false = ingen vindu (f.eks. kjeller). */
  window?: boolean;
  /** Møblene rommet starter med første gang det åpnes. */
  home: Record<string, Placement>;
}

export interface RoomDef {
  levels: Level[];
  items: Record<string, RoomItem>;
  defaultHome: Record<string, Placement>;
  /** SVG-innhold i vinduet (64x56 i veggens koordinater). */
  windowArt: string;
  groups: [string, string][];
  rooms: HouseRoom[];
  ariaLabel: string;
}

export interface Topic { k: string; name: string; color: string }

export interface Theme {
  id: string;
  title: string;
  eyebrow: string;
  sources: string;
  topics: Topic[];
  buckets: Topic[];
  stripes: string[];
  modes: Mode[];
  content: Content;
  shop: ShopDef;
  room: RoomDef;
}
