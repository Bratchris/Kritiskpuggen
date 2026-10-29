// Tegner kjæledyrene og eggene som SVG i et 100 × 100-rutenett. Dyrene står med føttene ved y = 92.
import type { EggKind, Species, Variant } from './catalog';

interface Pal { main: string; belly: string; dark: string; accent: string; horn: string; skin?: string }
const NATURAL: Record<Species, Pal> = {
  ku: { main: '#ffffff', belly: '#f6eee6', dark: '#2b2b2b', accent: '#f6b8c8', horn: '#efe0b8' },
  sau: { main: '#f6f2ea', belly: '#ffffff', dark: '#3a3030', accent: '#f6b8c8', horn: '#d9c7a0' },
  kanin: { main: '#e9e1d8', belly: '#fffaf4', dark: '#9b8a78', accent: '#ffb3cf', horn: '#ffffff' },
  hund: { main: '#d1924f', belly: '#f5e0c4', dark: '#7a4a25', accent: '#ff8aa8', horn: '#2b2b2b' },
  katt: { main: '#f2a05a', belly: '#fff1e0', dark: '#c46a28', accent: '#ff9cbc', horn: '#ffffff' },
  skilpadde: { main: '#5f9a3e', belly: '#e8d79a', dark: '#3f6b2a', accent: '#ff9cbc', horn: '#a9cf73', skin: '#a9cf73' },
  minigris: { main: '#f8b8c8', belly: '#ffd6e0', dark: '#e27c9a', accent: '#f08aa8', horn: '#ffffff' },
  enhjorning: { main: '#fdf9ff', belly: '#ffffff', dark: '#c9b8e8', accent: '#ff9cc0', horn: '#ffd36a' },
  drage: { main: '#4fb06b', belly: '#f4d67e', dark: '#2c7a47', accent: '#ff9c7a', horn: '#f5e7b8' },
};
const METAL: Partial<Record<Variant, Pal>> = {
  bronse: { main: '#c7844a', belly: '#e8b483', dark: '#7a4a22', accent: '#f0b48a', horn: '#f0c79a' },
  solv: { main: '#c8d0d8', belly: '#eef2f6', dark: '#76818d', accent: '#f2c6d2', horn: '#ffffff' },
  gull: { main: '#f2c230', belly: '#ffe68f', dark: '#b07d10', accent: '#ffb3a0', horn: '#fff3c0' },
  smaragd: { main: '#2fbf71', belly: '#a9f0c8', dark: '#137a45', accent: '#ff9cbc', horn: '#d6ffe8' },
  neon: { main: '#ff4fd8', belly: '#62f4ff', dark: '#7a2cff', accent: '#fff36a', horn: '#62f4ff' },
};
function pal(sp: Species, va: Variant): Pal {
  const m = METAL[va];
  if (!m) return NATURAL[sp];
  return { ...m, skin: sp === 'skilpadde' ? m.belly : undefined };
}
function shade(h: string, f: number): string {
  const c = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)).map((v) => Math.round(f < 0 ? v * (1 + f) : v + (255 - v) * f));
  return '#' + c.map((v) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0')).join('');
}
const P = (d: string, f: string, x = '') => '<path d="' + d + '" fill="' + f + '"' + x + '/>';
const C = (cx: number, cy: number, r: number, f: string, x = '') => '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + f + '"' + x + '/>';
const E = (cx: number, cy: number, rx: number, ry: number, f: string, x = '') => '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" fill="' + f + '"' + x + '/>';
const L = (d: string, s: string, w: number, x = '') => '<path d="' + d + '" fill="none" stroke="' + s + '" stroke-width="' + w + '" stroke-linecap="round" stroke-linejoin="round"' + x + '/>';
const rot = (a: number, x: number, y: number) => ' transform="rotate(' + a + ' ' + x + ' ' + y + ')"';

function eyes(y: number, dx = 9, onDark = false): string {
  const k = '#231a24';
  return (onDark ? C(50 - dx, y, 4.6, '#fff') + C(50 + dx, y, 4.6, '#fff') : '') +
    E(50 - dx, y, 3.6, 4.2, k) + E(50 + dx, y, 3.6, 4.2, k) + C(50 - dx + 1.3, y - 1.6, 1.4, '#fff') + C(50 + dx + 1.3, y - 1.6, 1.4, '#fff') + C(50 - dx - 1, y + 1.6, 0.6, '#fff') + C(50 + dx - 1, y + 1.6, 0.6, '#fff');
}
const blush = (y: number, dx = 15) => E(50 - dx, y, 4, 2.6, '#ff8aa8', ' opacity=".45"') + E(50 + dx, y, 4, 2.6, '#ff8aa8', ' opacity=".45"');
const smile = (y: number, c = '#5a2a2a') => L('M45.5,' + y + ' Q48,' + (y + 2.6) + ' 50,' + y + ' Q52,' + (y + 2.6) + ' 54.5,' + y, c, 1.4);
const feet = (c: string, y = 90) => E(38, y, 7, 4, c) + E(62, y, 7, 4, c);
const body = (p: Pal) => E(50, 72, 23, 18, p.main) + E(50, 76, 14, 11, p.belly);
const stripesOn = (c: string) => L('M30,64 Q34,70 30,76 M70,64 Q66,70 70,76 M38,58 Q41,66 37,72 M62,58 Q59,66 63,72', c, 3, ' opacity=".55"') + L('M44,26 Q46,31 44,35 M50,24 V33 M56,26 Q54,31 56,35', c, 2.6, ' opacity=".55"');

type Draw = (p: Pal) => { back?: string; main: string };
const DRAW: Record<Species, Draw> = {
  ku: (p) => ({
    main: feet(p.dark) + body(p) + E(36, 68, 6, 4.4, p.dark) + E(64, 78, 5, 3.6, p.dark) +
      P('M38,26 Q34,16 40,14 Q40,20 42,24Z', p.horn) + P('M62,26 Q66,16 60,14 Q60,20 58,24Z', p.horn) +
      E(27, 38, 8, 4.4, p.main, rot(-18, 27, 38)) + E(73, 38, 8, 4.4, p.main, rot(18, 73, 38)) + E(27, 38, 4.4, 2.2, p.accent, rot(-18, 27, 38)) + E(73, 38, 4.4, 2.2, p.accent, rot(18, 73, 38)) +
      C(50, 42, 21, p.main) + E(41, 30, 6, 4.5, p.dark) + E(50, 54, 12, 8, p.accent) + E(46, 54, 1.5, 2, shade(p.accent, -0.4)) + E(54, 54, 1.5, 2, shade(p.accent, -0.4)) +
      eyes(41) + blush(48, 16),
  }),
  sau: (p) => {
    let wool = '';
    for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; wool += C(Math.round(50 + Math.cos(a) * 21), Math.round(70 + Math.sin(a) * 15), 8, p.main); }
    let top = '';
    for (const [x, y] of [[38, 26], [46, 22], [54, 22], [62, 26], [50, 20]]) top += C(x, y, 7, p.main);
    return { main: feet(p.dark) + wool + E(50, 70, 21, 15, p.main) + E(29, 40, 8, 4, p.dark, rot(-15, 29, 40)) + E(71, 40, 8, 4, p.dark, rot(15, 71, 40)) + E(50, 44, 15, 18, p.dark) + top + eyes(43, 7, true) + E(50, 54, 3, 2, shade(p.dark, -0.4)) + blush(50, 11) };
  },
  kanin: (p) => ({
    main: feet(p.main) + body(p) + E(40, 16, 6, 16, p.main, rot(-8, 40, 16)) + E(60, 16, 6, 16, p.main, rot(8, 60, 16)) + E(40, 17, 3, 11, p.accent, rot(-8, 40, 17)) + E(60, 17, 3, 11, p.accent, rot(8, 60, 17)) +
      C(50, 44, 20, p.main) + E(50, 52, 9, 6, p.belly) + E(50, 50, 2.6, 1.8, p.accent) + P('M48,55 H52 V58.5 H48Z', '#fff', ' stroke="#d8cfc4" stroke-width=".6"') + L('M50,52 V55', '#5a2a2a', 1) + eyes(42) + blush(50, 14),
  }),
  hund: (p) => ({
    main: feet(p.dark) + body(p) + P('M84,64 Q94,54 88,48', 'none', ' stroke="' + p.main + '" stroke-width="6" stroke-linecap="round"') +
      C(50, 42, 21, p.main) + E(29, 46, 7, 13, p.dark, rot(12, 29, 46)) + E(71, 46, 7, 13, p.dark, rot(-12, 71, 46)) + E(50, 52, 11, 8, p.belly) + E(50, 47.5, 4, 3, p.horn) +
      smile(52) + P('M48,54 Q50,61 52,54Z', p.accent) + eyes(39) + blush(48, 15) + E(40, 32, 4, 2.4, shade(p.main, 0.25), ' opacity=".6"'),
  }),
  katt: (p) => ({
    back: L('M70,80 Q90,82 88,64 Q87,56 80,56', p.main, 6),
    main: feet(p.main) + body(p) + P('M30,32 L32,14 L44,24Z', p.main) + P('M70,32 L68,14 L56,24Z', p.main) + P('M33,28 L34,19 L40,24Z', p.accent) + P('M67,28 L66,19 L60,24Z', p.accent) +
      C(50, 42, 20, p.main) + E(50, 51, 8, 5, p.belly) + P('M48,48 H52 L50,50.5Z', p.accent) + smile(51) +
      L('M38,49 L26,47 M38,52 L26,53 M62,49 L74,47 M62,52 L74,53', shade(p.main, -0.45), 0.8, ' opacity=".6"') + eyes(41) + blush(48, 14),
  }),
  skilpadde: (p) => {
    const sk = p.skin || p.belly;
    let hex = '';
    for (const [x, y] of [[50, 64], [38, 70], [62, 70], [44, 80], [56, 80]]) hex += P('M' + (x - 5) + ',' + y + ' L' + (x - 2.5) + ',' + (y - 4.3) + ' L' + (x + 2.5) + ',' + (y - 4.3) + ' L' + (x + 5) + ',' + y + ' L' + (x + 2.5) + ',' + (y + 4.3) + ' L' + (x - 2.5) + ',' + (y + 4.3) + 'Z', p.dark);
    return { main: E(30, 86, 8, 5, sk) + E(70, 86, 8, 5, sk) + P('M20,82 Q20,52 50,52 Q80,52 80,82Z', p.main) + hex + P('M20,82 H80 Q80,88 50,88 Q20,88 20,82Z', p.belly) +
      C(50, 40, 17, sk) + eyes(38, 7) + smile(46) + blush(44, 12) };
  },
  minigris: (p) => ({
    back: L('M73,72 Q82,70 80,64 Q78,60 75,64 Q74,68 79,68', p.dark, 2.4),
    main: feet(p.dark) + body(p) + P('M32,30 L30,18 L42,25Z', p.main) + P('M68,30 L70,18 L58,25Z', p.main) + P('M33,27 L32,21 L38,25Z', p.dark) + P('M67,27 L68,21 L62,25Z', p.dark) +
      C(50, 44, 20, p.main) + E(50, 52, 8, 5.6, p.accent) + E(47, 52, 1.6, 2.2, shade(p.accent, -0.45)) + E(53, 52, 1.6, 2.2, shade(p.accent, -0.45)) + eyes(41) + blush(48, 14),
  }),
  enhjorning: (p) => {
    const mane = ['#ff9cc0', '#ffd36a', '#8fe3c0', '#9ab8ff', '#c9a6ff'];
    const m = p === NATURAL.enhjorning ? mane : [p.belly, p.dark, p.belly, p.dark, p.belly];
    let s = '';
    m.forEach((c, i) => { s += C(66 + (i % 2) * 3, 26 + i * 8, 7, c); });
    return { back: L('M70,80 Q86,84 84,70', m[3], 6) + L('M70,80 Q88,80 86,68', m[1], 3),
      main: E(38, 90, 6, 4, p.horn) + E(62, 90, 6, 4, p.horn) + body(p) + P('M36,26 L38,14 L46,22Z', p.main) + C(50, 44, 20, p.main) + s + C(56, 22, 6, m[0]) + C(48, 20, 5, m[2]) +
        P('M47,24 L50,2 L53,24Z', p.horn) + L('M48,18 L52,16 M47.5,12 L52.5,10', shade(p.horn, -0.25), 1) + E(50, 53, 9, 6, p.belly) + E(47, 53, 1.2, 1.6, p.dark) + E(53, 53, 1.2, 1.6, p.dark) + eyes(41) + blush(48, 14) };
  },
  drage: (p) => ({
    back: P('M30,62 L6,44 L12,58 L4,64 L16,68 L12,78 L32,74Z', p.dark) + P('M70,62 L94,44 L88,58 L96,64 L84,68 L88,78 L68,74Z', p.dark) + L('M68,84 Q88,90 92,76', p.main, 6) + P('M90,70 L98,72 L92,80Z', p.dark),
    main: feet(p.dark) + E(50, 72, 23, 18, p.main) + E(50, 76, 13, 12, p.belly) + L('M40,70 H60 M39,76 H61 M41,82 H59', shade(p.belly, -0.2), 1.2) +
      P('M36,28 Q30,14 26,12 Q34,14 42,24Z', p.horn) + P('M64,28 Q70,14 74,12 Q66,14 58,24Z', p.horn) + C(50, 42, 21, p.main) + P('M46,22 L50,16 L54,22Z', p.dark) +
      E(50, 52, 11, 7, p.belly) + E(46.5, 50, 1.3, 1.8, shade(p.main, -0.5)) + E(53.5, 50, 1.3, 1.8, shade(p.main, -0.5)) + smile(54) + P('M47,55 L48,58 L49,55Z', '#fff') + eyes(40) + blush(48, 15),
  }),
};

/** Glans og glitter for metall og edelsten. */
function finish(va: Variant): string {
  const sp = (x: number, y: number, s: number, c: string) => '<path transform="translate(' + x + ' ' + y + ') scale(' + s + ')" d="M0,-6 Q1,-1 6,0 Q1,1 0,6 Q-1,1 -6,0 Q-1,-1 0,-6Z" fill="' + c + '"/>';
  if (va === 'gull') return E(40, 34, 7, 3.5, '#fff', ' opacity=".55"' + rot(-30, 40, 34)) + sp(80, 22, 1, '#fff6c0') + sp(18, 52, 0.7, '#fff6c0') + sp(84, 60, 0.6, '#ffffff');
  if (va === 'solv' || va === 'bronse') return E(40, 34, 7, 3.5, '#fff', ' opacity=".5"' + rot(-30, 40, 34)) + sp(80, 24, 0.7, '#ffffff');
  if (va === 'smaragd') return L('M36,64 L44,76 L56,62 L64,76', '#d6ffe8', 1, ' opacity=".6"') + sp(80, 22, 0.9, '#d6ffe8') + sp(18, 50, 0.6, '#ffffff') + E(40, 34, 6, 3, '#fff', ' opacity=".45"' + rot(-30, 40, 34));
  return '';
}

export function petG(sp: Species, va: Variant): string {
  const p = pal(sp, va), d = DRAW[sp](p);
  return (d.back || '') + d.main + (va === 'stripete' ? stripesOn(shade(p.dark === p.main ? p.main : p.dark, -0.1)) : '') + finish(va);
}

export function petSVG(sp: Species, va: Variant, cls = ''): string {
  return '<svg class="pet ' + va + ' ' + cls + '" viewBox="0 0 100 100" aria-hidden="true">' + E(50, 93, 26, 4, '#000', ' opacity=".12"') + petG(sp, va) + '</svg>';
}

const EGG = 'M50,8 C72,8 84,44 84,62 C84,82 68,94 50,94 C32,94 16,82 16,62 C16,44 28,8 50,8Z';
/** Egget, med sprekker etter hvert som det nærmer seg klekking. */
export function eggG(kind: EggKind, progress: number): string {
  let s: string;
  if (kind === 'mytisk') {
    s = E(50, 56, 44, 44, '#b06bff', ' opacity=".25"') + P(EGG, '#3a1f5c') + P('M50,8 C60,8 70,22 76,38 C66,30 58,28 50,30 C42,28 34,30 24,38 C30,22 40,8 50,8Z', '#5a2f8a');
    for (const [x, y] of [[36, 50], [50, 46], [64, 50], [30, 64], [43, 62], [57, 62], [70, 64], [36, 76], [50, 74], [64, 76], [44, 86], [56, 86]]) s += P('M' + (x - 6) + ',' + y + ' Q' + x + ',' + (y + 7) + ' ' + (x + 6) + ',' + y, 'none', ' stroke="#ffd36a" stroke-width="1.4" opacity=".75"');
    s += E(38, 26, 5, 9, '#fff', ' opacity=".18"' + rot(-20, 38, 26)) + P('M50,58 l3,7 7,1 -5,5 1,7 -6,-3 -6,3 1,-7 -5,-5 7,-1z', '#ffd36a', ' opacity=".9"');
  } else {
    s = P(EGG, '#fff3dc') + E(32, 46, 6, 5, '#ffb3cf') + E(62, 34, 5, 4, '#8fd3ff') + E(66, 64, 7, 6, '#ffe27a') + E(40, 76, 6, 5, '#8fe3c0') + E(54, 54, 4, 3.4, '#c9a6ff') + E(24, 66, 3, 4, '#8fd3ff') + E(38, 26, 5, 9, '#fff', ' opacity=".7"' + rot(-20, 38, 26)) +
      P(EGG, 'none', ' stroke="#e8d6b0" stroke-width="1.6"');
  }
  const ink = kind === 'mytisk' ? '#ffd36a' : '#6b5a44';
  if (progress >= 0.5) s += L('M60,30 L56,36 L62,40 L58,46', ink, 1.6);
  if (progress >= 0.85) s += L('M30,58 L36,54 L40,60 L46,55', ink, 1.6);
  if (progress >= 1) s += L('M18,62 L26,58 L32,64 L40,58 L48,64 L56,58 L64,64 L72,58 L82,62', ink, 2.2);
  return s;
}
export function eggSVG(kind: EggKind, progress: number, cls = ''): string {
  return '<svg class="egg ' + kind + (progress >= 1 ? ' ready' : '') + ' ' + cls + '" viewBox="0 0 100 100" aria-hidden="true">' + E(50, 95, 26, 3.4, '#000', ' opacity=".12"') + eggG(kind, progress) + '</svg>';
}
