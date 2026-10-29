// Tegner avataren som SVG. Koordinatsystem: 120 bredt, y fra -24 (plass til hatter) til 160 (føttene).
import { AvatarCfg, Gender, Slot, skinById } from './catalog';

export const VIEWBOX = '0 -24 120 184';
export const HEAD_VIEWBOX = '18 -6 84 92';

type Pt = [number, number];
interface Body { torso: string; sh: [Pt, Pt]; hand: [Pt, Pt] }
const BODY: Record<Gender, Body> = {
  g: { torso: 'M38,82 Q38,75 46,75 H74 Q82,75 82,82 L80,118 H40 Z', sh: [[39, 80], [81, 80]], hand: [[31, 113], [89, 113]] },
  j: { torso: 'M42,82 Q42,75 48,75 H72 Q78,75 78,82 L76,98 Q82,108 81,118 H39 Q38,108 44,98 Z', sh: [[43, 80], [77, 80]], hand: [[35, 111], [85, 111]] },
  n: { torso: 'M40,82 Q40,75 47,75 H73 Q80,75 80,82 L79,118 H41 Z', sh: [[41, 80], [79, 80]], hand: [[33, 112], [87, 112]] },
};

function hex(h: string) { return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; }
/** f < 0 gjør fargen mørkere, f > 0 lysere. */
export function shade(h: string, f: number): string {
  const c = hex(h).map((v) => Math.round(f < 0 ? v * (1 + f) : v + (255 - v) * f));
  return '#' + c.map((v) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0')).join('');
}
const path = (d: string, fill: string, extra = '') => '<path d="' + d + '" style="fill:' + fill + extra + '"/>';
const line = (d: string, stroke: string, w: number, extra = '') => '<path d="' + d + '" style="fill:none;stroke:' + stroke + ';stroke-width:' + w + ';stroke-linecap:round;stroke-linejoin:round' + extra + '"/>';
const circ = (x: number, y: number, r: number, fill: string, extra = '') => '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" style="fill:' + fill + extra + '"/>';
const ell = (x: number, y: number, rx: number, ry: number, fill: string, extra = '') => '<ellipse cx="' + x + '" cy="' + y + '" rx="' + rx + '" ry="' + ry + '" style="fill:' + fill + extra + '"/>';
const r1 = (n: number) => Math.round(n * 10) / 10;
/** Lys eller mørk skrift som synes på bakgrunnen. */
function ink(bg: string) { const [r, g, b] = hex(bg); return r * 0.299 + g * 0.587 + b * 0.114 > 150 ? '#1e1a24' : '#f4f1e8'; }
const txt = (x: number, y: number, size: number, fill: string, t: string, extra = '') => '<text x="' + x + '" y="' + y + '" text-anchor="middle" style="font:900 ' + size + 'px system-ui,Arial,sans-serif;fill:' + fill + extra + '">' + t + '</text>';
const rect = (x: number, y: number, w: number, h: number, fill: string, extra = '') => '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" style="fill:' + fill + extra + '"/>';
/** CRISPY-G-merket: et lite skjold med CG. */
function badge(x: number, y: number, k: number, _bg?: string) {
  const w = 7 * k, h = 8 * k;
  return path('M' + r1(x - w / 2) + ',' + r1(y - h / 2) + ' h' + r1(w) + ' v' + r1(h * 0.55) + ' q0,' + r1(h * 0.35) + ' -' + r1(w / 2) + ',' + r1(h * 0.45) + ' q-' + r1(w / 2) + ',-' + r1(h * 0.1) + ' -' + r1(w / 2) + ',-' + r1(h * 0.45) + 'z', '#ffd25a', ';stroke:' + shade('#ffd25a', -0.35) + ';stroke-width:' + r1(0.5 * k)) +
    txt(x, r1(y + 1.4 * k), r1(3.6 * k), '#5a3a0a', 'CG');
}
function along(a: Pt, b: Pt, t: number): Pt { return [r1(a[0] + (b[0] - a[0]) * t), r1(a[1] + (b[1] - a[1]) * t)]; }
function arm(B: Body, color: string, t: number, w: number) {
  return [0, 1].map((i) => { const e = along(B.sh[i], B.hand[i], t); return line('M' + B.sh[i][0] + ',' + B.sh[i][1] + ' L' + e[0] + ',' + e[1], color, w); }).join('');
}
const LEGS = ['M45,114 H58 V146 Q51,149 45,146 Z', 'M62,114 H75 V146 Q69,149 62,146 Z'];
const legs = (fill: string, toY = 146) => toY >= 146 ? LEGS.map((d) => path(d, fill)).join('') :
  path('M45,114 H58 V' + toY + ' H45 Z', fill) + path('M62,114 H75 V' + toY + ' H62 Z', fill);

// ---------- hår ----------
function hair(style: string, c: string): { back: string; front: string } {
  const d = shade(c, -0.25);
  const cap = 'M34,44 Q34,16 60,16 Q86,16 86,44 Q78,29 60,29 Q42,29 34,44Z';
  switch (style) {
    case 'pigg': return { back: '', front: path('M34,42 L36,24 L44,28 L46,13 L54,23 L60,8 L66,23 L74,13 L76,28 L84,24 L86,42 Q78,30 60,30 Q42,30 34,42Z', c) };
    case 'snau': return { back: '', front: path('M34,40 Q36,19 60,19 Q84,19 86,40 Q76,25 60,25 Q44,25 34,40Z', c, ';opacity:.92') };
    case 'krøller': {
      let s = '';
      for (let i = 0; i <= 8; i++) { const a = Math.PI * (1.05 + i * 0.1125), x = 60 + Math.cos(a) * 24, y = 40 + Math.sin(a) * 22; s += circ(r1(x), r1(y), 8, i % 2 ? c : d); }
      return { back: circ(36, 48, 7, d) + circ(84, 48, 7, d), front: s };
    }
    case 'afro': return { back: circ(60, 38, 37, c) + circ(60, 38, 37, d, ';opacity:.25'), front: path('M36,40 Q40,24 60,22 Q80,24 84,40 Q72,32 60,32 Q48,32 36,40Z', c) };
    case 'langt': return { back: path('M31,40 Q30,13 60,13 Q90,13 89,40 L91,98 Q60,106 29,98 Z', d), front: path('M34,46 Q34,16 60,16 Q86,16 86,46 Q83,30 67,26 Q50,34 34,46Z', c) };
    case 'hestehale': return { back: path('M78,26 Q102,30 98,60 Q95,80 86,92 Q89,64 80,44 Z', d) + ell(84, 30, 4, 5, shade(c, -0.45)), front: path(cap, c) };
    case 'fletter': {
      let b = '';
      for (let i = 0; i < 5; i++) b += ell(33, 58 + i * 9, 5.5, 5.4, i % 2 ? c : d) + ell(87, 58 + i * 9, 5.5, 5.4, i % 2 ? c : d);
      return { back: b + circ(33, 102, 3, '#d9453b') + circ(87, 102, 3, '#d9453b'), front: path('M34,46 Q34,16 60,16 Q86,16 86,46 Q76,28 60,29 Q44,28 34,46Z', c) + line('M60,17 V28', d, 1.4) };
    }
    case 'bolle': return { back: circ(60, 12, 11, d), front: path(cap, c) };
    case 'musefletter': return { back: circ(34, 22, 10, d) + circ(86, 22, 10, d), front: path(cap, c) + line('M60,17 V28', d, 1.4) };
    case 'pannelugg': return { back: '', front: path('M34,46 Q32,15 60,15 Q88,15 86,46 L84,36 Q80,38 76,35 Q72,38 68,35 Q64,38 60,35 Q56,38 52,35 Q48,38 44,35 Q40,38 36,36Z', c) };
    case 'sidelugg': return { back: '', front: path('M34,48 Q32,15 60,15 Q88,15 86,42 Q80,30 70,30 Q54,32 42,40 Q38,44 34,48Z', c) + line('M44,38 Q58,28 74,28', d, 1.4) };
    case 'mohawk': return { back: '', front: path('M34,40 Q36,21 60,21 Q84,21 86,40 Q76,27 60,27 Q44,27 34,40Z', shade(c, -0.1), ';opacity:.55') + path('M52,24 L50,10 L56,14 L58,2 L62,2 L64,14 L70,10 L68,24 Q60,30 52,24Z', c) };
    case 'cornrows': {
      let f = path('M34,42 Q35,18 60,18 Q85,18 86,42 Q76,27 60,27 Q44,27 34,42Z', c);
      for (const x of [44, 52, 60, 68, 76]) f += line('M' + x + ',' + (x === 60 ? 18 : 21) + ' Q' + (60 + (x - 60) * 1.3) + ',28 ' + (60 + (x - 60) * 1.45) + ',34', d, 1.3);
      return { back: '', front: f };
    }
    case 'dreads': {
      let b = '';
      for (let i = 0; i < 9; i++) { const x = 32 + i * 7; b += line('M' + x + ',36 L' + (x + (i < 4 ? -3 : i > 4 ? 3 : 0)) + ',' + (88 - Math.abs(i - 4) * 3), i % 2 ? c : d, 6); }
      return { back: b, front: path(cap, c) + line('M42,24 Q46,30 44,36 M52,20 Q55,27 53,32 M68,20 Q65,27 67,32 M78,24 Q74,30 76,36', d, 1.4) };
    }
    case 'bob': return { back: path('M30,40 Q30,12 60,12 Q90,12 90,40 L90,68 Q84,72 78,68 L78,50 H42 L42,68 Q36,72 30,68 Z', d), front: path('M33,50 Q30,14 60,14 Q90,14 87,50 Q84,32 72,28 Q58,34 40,32 Q34,38 33,50Z', c) };
    case 'langkrøll': {
      let b = '';
      for (let i = 0; i < 6; i++) b += circ(31 - (i % 2) * 2, 50 + i * 9, 7, i % 2 ? c : d) + circ(89 + (i % 2) * 2, 50 + i * 9, 7, i % 2 ? d : c);
      return { back: path('M31,40 Q30,13 60,13 Q90,13 89,40 L90,88 H30 Z', d) + b, front: path('M34,46 Q34,16 60,16 Q86,16 86,46 Q82,30 68,27 Q52,34 34,46Z', c) + circ(40, 30, 6, c) + circ(80, 30, 6, c) + circ(60, 18, 6, d) };
    }
    default: return { back: '', front: path(cap, c) };
  }
}

// ---------- klær ----------
function top(id: string, B: Body, c: string) {
  const dk = shade(c, -0.2);
  let s = '';
  if (id === 'tskjorte') s += arm(B, c, 0.42, 11) + path(B.torso, c) + line('M54,76 Q60,82 66,76', dk, 1.6);
  else s += arm(B, c, 0.88, 11) + path(B.torso, c);
  if (id === 'genser') s += line('M53,76 Q60,81 67,76', dk, 2.4) + line('M42,116 H78', dk, 3);
  if (id === 'hettegenser') s += path('M44,77 Q60,92 76,77 Q74,70 60,70 Q46,70 44,77Z', dk) + path('M48,100 H72 L70,112 H50Z', dk) + line('M56,80 V92 M64,80 V92', '#f4f1e8', 1.4);
  if (id === 'skjorte') s += path('M53,75 L60,84 L50,82Z', shade(c, 0.5)) + path('M67,75 L60,84 L70,82Z', shade(c, 0.5)) + circ(60, 92, 1.4, dk) + circ(60, 101, 1.4, dk) + circ(60, 110, 1.4, dk);
  return s;
}
function bottom(id: string, c: string, skin: string) {
  if (id === 'shorts') return legs(skin) + legs(c, 128);
  if (id === 'skjort') return legs(skin) + path('M40,112 H80 L86,134 H34 Z', c) + line('M40,113 H80', shade(c, -0.2), 2.4);
  return legs(c) + line('M60,116 V124', shade(c, -0.25), 1.4);
}
function shoes(id: string, c: string) {
  if (id === 'stovler') { const b = shade(c, -0.35); return path('M44,134 H59 V150 Q52,154 42,152 Q41,148 44,146Z', b) + path('M61,134 H76 V146 Q79,148 78,152 Q68,154 61,150Z', b); }
  return ell(51, 150, 9.5, 5, '#f4f6f6') + ell(69, 150, 9.5, 5, '#f4f6f6') + line('M45,150 H56 M64,150 H75', c, 2.2) + line('M42,153 H60 M60,153 H78', '#b7c3cb', 1.6);
}

// ---------- kostymer ----------
interface Layers { back?: string; body?: string; legs?: boolean; front?: string; cover?: string; hideHair?: boolean; feet?: string }
type Ctx = { B: Body; c: AvatarCfg; skin: string; t: string };
const socks = (t: string) => path('M45,128 H58 V146 Q51,149 45,146 Z', t) + path('M62,128 H75 V146 Q69,149 62,146 Z', t) + line('M45,131 H58 M62,131 H75', '#f4f1e8', 1.6);
function kit(x: Ctx, shirt: string, num: string, numC: string, shorts: string) {
  const { B, skin, t } = x;
  return legs(skin) + legs(shorts, 128) + socks(t) + arm(B, shirt, 0.42, 11) + path(B.torso, shirt) + path('M52,75 L60,82 L68,75Z', shade(t, -0.3)) + txt(60, 106, 16, numC, num) + badge(70, 86, 1, shirt);
}
const SKIN_DRAW: Record<string, (x: Ctx) => Layers> = {
  heksehatt: () => ({ front: ell(60, 20, 36, 7, '#2b2235') + path('M42,20 L58,-18 Q62,-20 64,-14 L78,20Z', '#2b2235') + path('M43,15 H77 L78,20 H42Z', '#6b4a8f') + path('M57,-12 Q66,-22 72,-10 Q64,-14 57,-12Z', '#2b2235') }),
  kattorer: () => ({ front: path('M36,30 L38,6 L52,22Z', '#1e1a24') + path('M84,30 L82,6 L68,22Z', '#1e1a24') + path('M40,24 L41,12 L48,21Z', '#e58aa0') + path('M80,24 L79,12 L72,21Z', '#e58aa0') }),
  varulvorer: () => ({ front: path('M34,32 L34,4 L52,20Z', '#7d6a5a') + path('M86,32 L86,4 L68,20Z', '#7d6a5a') + path('M38,24 L38,12 L46,20Z', '#c9b8a8') + path('M82,24 L82,12 L74,20Z', '#c9b8a8') + path('M34,32 Q38,24 42,30 Q46,22 50,28', '#7d6a5a') }),
  tryllestav: ({ B }) => { const h = B.hand[1]; return { front: line('M' + h[0] + ',' + h[1] + ' L' + (h[0] + 12) + ',' + (h[1] - 34), '#3a2a1c', 3) + '<path d="M0,-7l2,5 5,.5-4,3.5 1.2,5-4.2-2.6-4.2,2.6 1.2-5-4-3.5 5-.5z" transform="translate(' + (h[0] + 12) + ' ' + (h[1] - 36) + ')" style="fill:#ffd25a;stroke:#e3ad33;stroke-width:1"/>' }; },
  heksekappe: ({ B }) => ({ legs: true, body: legs('#1e1a24') + arm(B, '#2b2235', 0.9, 13) + path('M36,82 Q36,74 46,74 H74 Q84,74 84,82 L92,148 Q60,154 28,148 Z', '#2b2235') + path('M42,104 H78 V110 H42Z', '#6b4a8f') + path('M54,74 L60,90 L66,74Z', '#1e1a24') }),
  flaggermusvinger: () => ({ back: path('M44,82 L4,62 L10,78 L2,90 L14,96 L10,110 L42,100Z', '#2b2235') + path('M76,82 L116,62 L110,78 L118,90 L106,96 L110,110 L78,100Z', '#2b2235') + line('M44,84 L8,66 M42,92 L6,90 M42,98 L12,108 M76,84 L112,66 M78,92 L114,90 M78,98 L108,108', '#4a3a5a', 1.2) }),
  vampyrkappe: () => ({ back: path('M34,78 L18,152 H102 L86,78 Z', '#a02525') + path('M38,78 L24,152 H96 L82,78 Z', '#1e1a24'), front: path('M44,76 L36,60 L54,72Z', '#1e1a24') + path('M76,76 L84,60 L66,72Z', '#1e1a24') + path('M44,76 L40,64 L52,72Z', '#a02525') + path('M76,76 L80,64 L68,72Z', '#a02525') }),
  mumie: ({ B }) => {
    const w = '#e8e0cc', l = '#c9bea3';
    let s = legs(w) + arm(B, w, 0.95, 11) + path(B.torso, w);
    for (let y = 82; y < 146; y += 7) s += line('M38,' + y + ' L82,' + (y - 3), l, 1.4);
    return { legs: true, body: s };
  },
  skjelett: ({ B }) => {
    const k = '#1e1a24', w = '#f4f1e8';
    let s = legs(k) + arm(B, k, 0.95, 11) + path(B.torso, k) + line('M60,78 V116', w, 3);
    for (let i = 0; i < 4; i++) s += line('M48,' + (84 + i * 7) + ' Q60,' + (80 + i * 7) + ' 72,' + (84 + i * 7), w, 2.2);
    s += line('M51,118 V144 M69,118 V144', w, 2.6) + circ(51, 131, 2.4, w) + circ(69, 131, 2.4, w) + path('M50,112 Q60,120 70,112 Q60,108 50,112Z', w);
    return { legs: true, body: s };
  },
  trollmann: ({ B }) => {
    const b = '#2b4f8a', st = (x: number, y: number) => '<path d="M0,-4l1.2,2.8 3,.3-2.3,2 .7,3-2.6-1.6-2.6,1.6 .7-3-2.3-2 3-.3z" transform="translate(' + x + ' ' + y + ')" style="fill:#ffd25a"/>';
    return { legs: true, body: legs('#1f3a66') + arm(B, b, 0.9, 14) + path('M38,82 Q38,74 46,74 H74 Q82,74 82,82 L90,150 Q60,154 30,150 Z', b) + st(48, 96) + st(70, 112) + st(56, 132) + st(76, 138) + st(44, 140) + line('M54,74 L60,86 L66,74', '#ffd25a', 1.6) };
  },
  gresskarhode: () => ({
    hideHair: true,
    cover: ell(60, 42, 34, 30, '#d9681a') + ell(46, 42, 14, 29, '#ec7d22') + ell(74, 42, 14, 29, '#ec7d22') + ell(60, 42, 10, 30, '#f6943a') +
      line('M60,13 Q62,4 70,2', '#4a6b2a', 4) + path('M42,40 L50,30 L56,40Z', '#ffd25a') + path('M64,40 L70,30 L78,40Z', '#ffd25a') +
      path('M42,52 Q60,70 78,52 L72,56 L66,52 L60,58 L54,52 L48,56Z', '#ffd25a'),
  }),
  spokelse: () => ({
    legs: true, hideHair: true,
    cover: path('M28,44 Q28,10 60,10 Q92,10 92,44 L98,150 L88,142 L78,152 L68,142 L58,152 L48,142 L38,152 L28,142 L22,150 Z', '#f4f1f8', ';stroke:#b9aed0;stroke-width:1.5') +
      ell(49, 46, 5, 7, '#1e1a24') + ell(71, 46, 5, 7, '#1e1a24') + ell(60, 64, 5, 6, '#1e1a24'),
  }),
  // klima
  sydvest: () => ({ front: path('M24,26 Q60,8 96,26 Q98,34 88,32 Q60,24 32,32 Q22,34 24,26Z', '#f2c230') + path('M36,28 Q36,8 60,6 Q84,8 84,28 Q60,20 36,28Z', '#f2c230') + line('M36,28 Q60,20 84,28', '#d9a915', 2) }),
  strikkelue: () => ({ front: path('M34,34 Q34,8 60,8 Q86,8 86,34 Z', '#d9453b') + path('M33,28 H87 V36 H33Z', '#f4f1e8') + line('M42,14 V28 M50,10 V28 M60,8 V28 M70,10 V28 M78,14 V28', '#b8392f', 1.2) + circ(60, 4, 7, '#f4f1e8') }),
  solbriller: () => ({ front: path('M40,44 H56 Q57,55 48,55 Q40,55 40,44Z', '#1e1a24') + path('M64,44 H80 Q80,55 72,55 Q63,55 64,44Z', '#1e1a24') + line('M56,46 H64 M40,45 L34,43 M80,45 L86,43', '#1e1a24', 2) + line('M44,47 L48,47', '#5a6b8a', 1.4) }),
  blomsterkrans: () => {
    const cs = ['#d9453b', '#f2c230', '#e85a9a', '#3b9ad9', '#f08a24', '#7a5aa6', '#d9453b'];
    let s = line('M34,32 Q60,14 86,32', '#3d8556', 3);
    cs.forEach((c, i) => { const t = i / 6, x = 34 + 52 * t, y = 32 - 18 * Math.sin(Math.PI * t) + 2; s += circ(r1(x), r1(y), 4.6, c) + circ(r1(x), r1(y), 1.6, '#fff3b0'); });
    return { front: s };
  },
  kikkert: () => ({ front: path('M44,96 h12 v12 h-12z', '#333e47') + path('M64,96 h12 v12 h-12z', '#333e47') + path('M54,98 h12 v6 h-12z', '#47545e') + circ(50, 108, 5, '#5e97ba') + circ(70, 108, 5, '#5e97ba') }),
  ryggsekk: () => ({ back: path('M34,78 Q32,70 42,70 H78 Q88,70 86,78 L88,124 Q60,130 32,124 Z', '#4a6b2a') + path('M38,96 H82 V106 H38Z', '#3d5a22'), front: line('M48,76 L46,116 M72,76 L74,116', '#3d5a22', 3.4) }),
  regnfrakk: ({ B }) => ({ legs: true, body: legs('#2e4a7a') + arm(B, '#f2c230', 0.88, 12) + path('M38,82 Q38,74 46,74 H74 Q82,74 82,82 L84,132 H36 Z', '#f2c230') + line('M60,78 V132', '#d9a915', 1.6) + circ(55, 90, 1.6, '#8a6735') + circ(55, 102, 1.6, '#8a6735') + circ(55, 114, 1.6, '#8a6735') + path('M52,74 L60,82 L68,74Z', '#d9a915') }),
  marius: ({ B }) => {
    const r = '#d9453b', bl = '#24304f', w = '#f4f1e8';
    let s = arm(B, bl, 0.88, 11) + path(B.torso, bl) + path('M40,78 H80 V92 H40Z', r) + path('M40,92 H80 V96 H40Z', w);
    for (let x = 44; x < 80; x += 8) s += path('M' + x + ',84 l4,-4 4,4 -4,4z', w);
    s += line('M42,116 H78', r, 3);
    return { body: s };
  },
  forskerfrakk: ({ B }) => ({ body: arm(B, '#f4f6f6', 0.9, 12) + path('M38,82 Q38,74 46,74 H74 Q82,74 82,82 L84,136 H36 Z', '#f4f6f6', ';stroke:#c3cbce;stroke-width:1') + path('M55,74 L60,96 L65,74Z', '#4fae6b') + line('M60,96 V136', '#c3cbce', 1.4) + path('M66,100 h10 v8 h-10z', '#dce2e4') + line('M68,98 V104', '#2e86c1', 1.6) }),
  klimahelt: () => ({ back: path('M36,78 L22,150 H98 L84,78 Z', '#2d7a47'), front: circ(60, 92, 7, '#ffd25a') + path('M56,96 C54,88 62,84 66,86 C66,92 60,96 56,96Z', '#2d7a47') }),
  biedrakt: ({ B }) => {
    const y = '#f2c230', k = '#2b2b2b';
    let s = legs(k) + arm(B, k, 0.88, 11) + path(B.torso, y);
    for (let yy = 86; yy < 118; yy += 12) s += path('M39,' + yy + ' H81 V' + (yy + 5) + ' H39Z', k);
    s += path('M38,84 Q24,72 26,92 Q30,100 40,94Z', 'rgba(220,240,255,.75)') + path('M82,84 Q96,72 94,92 Q90,100 80,94Z', 'rgba(220,240,255,.75)');
    return { legs: true, body: s, front: line('M50,22 Q46,8 40,4 M70,22 Q74,8 80,4', k, 2) + circ(40, 4, 3, k) + circ(80, 4, 3, k) };
  },
  astronaut: ({ B }) => ({
    legs: true,
    body: legs('#e8eef0') + arm(B, '#e8eef0', 0.95, 13) + path(B.torso, '#e8eef0', ';stroke:#b7c3cb;stroke-width:1') + path('M50,90 h20 v14 h-20z', '#b7c3cb') + circ(54, 97, 2, '#d9453b') + circ(60, 97, 2, '#4fae6b') + circ(66, 97, 2, '#2e86c1') + line('M45,136 H58 M62,136 H75', '#b7c3cb', 3),
    cover: circ(60, 44, 33, 'rgba(190,226,245,.32)', ';stroke:#e8eef0;stroke-width:4') + path('M36,30 Q44,18 56,16', 'none', ';stroke:#fff;stroke-width:3;stroke-linecap:round;opacity:.8') + path('M40,72 Q60,80 80,72 L78,78 Q60,86 42,78Z', '#e8eef0'),
  }),
  // CRISPY-G
  cg_pannebaand: ({ t }) => ({ front: path('M34,33 Q60,23 86,33 L86,40 Q60,30 34,40Z', t) + txt(60, 35, 5, ink(t), 'CRISPY-G') }),
  cg_caps: ({ t }) => ({ front: path('M34,34 Q34,10 60,10 Q86,10 86,34 Q60,28 34,34Z', t) + path('M34,34 Q60,27 92,31 Q100,35 92,38 Q60,33 34,37Z', shade(t, -0.3)) + circ(60, 10, 2.2, shade(t, -0.3)) + badge(60, 22, 1.4, t) }),
  cg_bottehatt: ({ t }) => ({ front: path('M38,32 Q38,10 60,10 Q82,10 82,32Z', t) + path('M24,38 Q28,27 60,29 Q92,27 96,38 Q60,33 24,38Z', shade(t, -0.2)) + line('M38,30 Q60,26 82,30', shade(t, -0.35), 2) + txt(60, 25, 5, ink(t), 'CRISPY-G') }),
  cg_tskjorte: ({ B, t }) => ({ body: arm(B, t, 0.42, 11) + path(B.torso, t) + line('M54,76 Q60,82 66,76', shade(t, -0.2), 1.6) + txt(60, 98, 7.2, ink(t), 'CRISPY') + txt(60, 108, 10, '#ffd25a', 'G', ';stroke:' + shade('#ffd25a', -0.4) + ';stroke-width:.6') }),
  cg_hoodie: ({ B, t }) => {
    const dk = shade(t, -0.25);
    return { body: arm(B, t, 0.88, 11) + path(B.torso, t) + path('M44,77 Q60,92 76,77 Q74,70 60,70 Q46,70 44,77Z', dk) + path('M48,104 H72 L70,114 H50Z', dk) + line('M56,80 V92 M64,80 V92', '#ffd25a', 1.4) +
      path('M60,88 C52,96 54,102 60,104 C66,102 68,96 64,92 C63,96 61,96 60,94 C59,92 61,90 60,88Z', '#e8742a') + txt(60, 103, 5, ink(t), 'CG') };
  },
  cg_sneakers: ({ t }) => {
    const dk = shade(t, -0.3);
    const one = (x: number) => path('M' + (x - 7) + ',136 H' + (x + 6) + ' V146 Q' + (x + 12) + ',147 ' + (x + 12) + ',151 H' + (x - 9) + ' Q' + (x - 10) + ',146 ' + (x - 7) + ',144Z', t, ';stroke:' + dk + ';stroke-width:.8') +
      rect(x - 10, 150, 23, 4, '#f4f1e8', ';stroke:#b7c3cb;stroke-width:.6') + line('M' + (x - 6) + ',145 Q' + x + ',140 ' + (x + 6) + ',146', '#ffd25a', 2) + line('M' + (x - 4) + ',138 H' + (x + 3) + ' M' + (x - 4) + ',141 H' + (x + 3), dk, 1);
    return { feet: one(51) + one(69) };
  },
  cg_sekk: ({ t }) => ({ back: path('M34,78 Q32,70 42,70 H78 Q88,70 86,78 L88,124 Q60,130 32,124 Z', t) + path('M38,98 H82 V108 H38Z', shade(t, -0.2)), front: line('M48,76 L46,116 M72,76 L74,116', shade(t, -0.3), 3.4) + badge(60, 88, 1.3, t) }),
  cg_kjede: () => ({ front: line('M50,76 Q52,88 60,90 Q68,88 70,76', '#e3ad33', 1.8, ';stroke-dasharray:2 1') + circ(60, 93, 5.4, '#ffd25a', ';stroke:#c08a1e;stroke-width:1') + txt(60, 95, 4.6, '#7a5310', 'CG') }),
  cg_hjemme: (x) => ({ legs: true, body: kit(x, x.t, '10', ink(x.t), '#f4f1e8') }),
  cg_borte: (x) => {
    const w = '#f4f1e8';
    let s = kit(x, w, '', w, x.t);
    for (const xx of [46, 54, 62, 70]) s += rect(xx, 80, 4, 37, x.t);
    s += path('M52,75 L60,82 L68,75Z', shade(x.t, -0.3)) + rect(53, 94, 14, 14, w) + txt(60, 106, 14, x.t, '7') + badge(70, 86, 1, w);
    return { legs: true, body: s };
  },
  cg_keeper: (x) => {
    const { B, skin, t } = x, dk = shade(t, -0.3);
    const s = legs(skin) + legs('#1e1a24', 128) + socks(t) + arm(B, t, 0.86, 11) + path(B.torso, t) + path('M40,80 L60,96 L80,80 V88 L60,104 L40,88Z', dk) + txt(60, 114, 9, ink(t), '1') + badge(70, 84, 1, t);
    const glove = (p: Pt) => circ(p[0], p[1], 6.6, '#f2c230', ';stroke:#1e1a24;stroke-width:1');
    return { legs: true, body: s, front: glove(B.hand[0]) + glove(B.hand[1]) };
  },
  cg_tracksuit: ({ B, t }) => {
    const w = '#f4f1e8';
    const s = legs(t) + line('M47,116 V145 M73,116 V145', w, 1.6) + arm(B, t, 0.92, 12) + line('M' + B.sh[0][0] + ',' + (B.sh[0][1] - 3) + ' L' + along(B.sh[0], B.hand[0], 0.9).join(',') + ' M' + B.sh[1][0] + ',' + (B.sh[1][1] - 3) + ' L' + along(B.sh[1], B.hand[1], 0.9).join(','), w, 1.4) +
      path(B.torso, t) + path('M50,74 H70 V79 H50Z', shade(t, -0.3)) + line('M60,79 V117', '#c9ccd0', 1.6) + rect(38, 114, 44, 4, shade(t, -0.3)) + badge(70, 88, 1, t);
    return { legs: true, body: s };
  },
  cg_fotball: ({ B }) => { const [x, y] = B.hand[1]; const cx = x + 4, cy = y + 8; return { front: circ(cx, cy, 8, '#f4f1e8', ';stroke:#1e1a24;stroke-width:1') + path('M' + cx + ',' + (cy - 3) + ' l3,2.2 -1.2,3.4 h-3.6 l-1.2,-3.4z', '#1e1a24') + line('M' + cx + ',' + (cy - 3) + ' V' + (cy - 8) + ' M' + (cx + 3) + ',' + (cy - 0.8) + ' L' + (cx + 7.6) + ',' + (cy - 2.4) + ' M' + (cx - 3) + ',' + (cy - 0.8) + ' L' + (cx - 7.6) + ',' + (cy - 2.4) + ' M' + (cx - 1.8) + ',' + (cy + 2.6) + ' L' + (cx - 4.6) + ',' + (cy + 6.4) + ' M' + (cx + 1.8) + ',' + (cy + 2.6) + ' L' + (cx + 4.6) + ',' + (cy + 6.4), '#1e1a24', 0.9) }; },
  cg_gullball: ({ B }) => { const [x, y] = B.hand[1]; const cx = x + 2, cy = y - 12; return { front: rect(cx - 6, cy + 9, 12, 5, '#7a5310') + path('M' + (cx - 3) + ',' + (cy + 9) + ' L' + (cx - 2) + ',' + (cy + 5) + ' H' + (cx + 2) + ' L' + (cx + 3) + ',' + (cy + 9) + 'Z', '#e3ad33') + circ(cx, cy - 2, 9, '#ffd25a', ';stroke:#c08a1e;stroke-width:1.2') + path('M' + cx + ',' + (cy - 5) + ' l3,2.2 -1.2,3.4 h-3.6 l-1.2,-3.4z', '#e3ad33') + circ(cx - 3.6, cy - 5.6, 2, '#fff8d0', ';opacity:.8') }; },
};

export interface RenderOpts { crop?: 'head' | 'full'; cls?: string; title?: string; ariaHidden?: boolean }

/** Hele avataren som SVG. Kostymer som ikke er i eq, tegnes ikke. */
export function avatarSVG(c: AvatarCfg, o: RenderOpts = {}): string {
  return '<svg class="avatar ' + (o.cls || '') + '" viewBox="' + (o.crop === 'head' ? HEAD_VIEWBOX : VIEWBOX) + '"' + (o.ariaHidden !== false ? ' aria-hidden="true"' : ' role="img"') + '>' + (o.title ? '<title>' + o.title + '</title>' : '') + avatarG(c) + '</svg>';
}

/** Kostymer som kan fargelegges, bruker elevens farge eller standardfargen. */
export function tintOf(c: AvatarCfg, id: string): string { return c.tint?.[id] || skinById(id)?.tint || '#888888'; }

const SLOT_ORDER: Slot[] = ['back', 'outfit', 'top', 'hat', 'face', 'neck', 'hand', 'feet'];

/** Bare tegningen (uten svg-element), til bruk i troférommet. */
export function avatarG(c: AvatarCfg): string {
  const B = BODY[c.g], skin = c.skinC, hc = c.hairC;
  const L = {} as Record<Slot, Layers>;
  for (const sl of SLOT_ORDER) { const id = c.eq[sl]; L[sl] = id && SKIN_DRAW[id] ? SKIN_DRAW[id]({ B, c, skin, t: tintOf(c, id) }) : {}; }
  const all = SLOT_ORDER.map((sl) => L[sl]);
  const out = L.outfit, tp = L.top;
  const H = hair(c.hair, hc);
  const hideHair = all.some((x) => x.hideHair);
  const hijab = c.headwear === 'hijab' && !hideHair, hj = c.headC, hjd = shade(hj, -0.22);
  let s = '';
  s += all.map((x) => x.back || '').join('');
  if (hijab) s += path('M27,46 Q27,10 60,10 Q93,10 93,46 Q95,72 86,86 Q60,96 34,86 Q25,72 27,46Z', hjd);
  else if (!hideHair) s += H.back;
  if (!out.legs) s += bottom(c.bottom, c.bottomC, skin);
  s += L.feet.feet || shoes(c.shoes, c.shoesC);
  s += path('M54,66 H66 V80 H54Z', shade(skin, -0.12));
  s += arm(B, skin, 1, 9) + circ(B.hand[0][0], B.hand[0][1], 5, skin) + circ(B.hand[1][0], B.hand[1][1], 5, skin);
  if (out.body) s += out.body;
  else if (tp.body) s += tp.body;
  else s += top(c.top, B, c.topC);
  if (out.body) s += circ(B.hand[0][0], B.hand[0][1], 5, skin) + circ(B.hand[1][0], B.hand[1][1], 5, skin);
  // hode og ansikt
  s += circ(34, 47, 5, skin) + circ(86, 47, 5, skin) + circ(60, 44, 26, skin);
  s += face(c, skin, hc);
  if (hijab) s += path('M27,46 Q27,10 60,10 Q93,10 93,46 Q95,72 86,86 Q60,96 34,86 Q25,72 27,46Z M40,46 Q40,24 60,24 Q80,24 80,46 Q80,68 60,70 Q40,68 40,46Z', hj, ';fill-rule:evenodd') +
    line('M40,46 Q40,24 60,24 Q80,24 80,46', hjd, 1.6) + line('M44,84 Q60,90 76,84', hjd, 1.4);
  else if (!hideHair) s += H.front;
  for (const sl of ['hat', 'face', 'back', 'outfit', 'top', 'neck'] as Slot[]) s += L[sl].front || '';
  s += all.map((x) => x.cover || '').join('');
  s += L.hand.front || '';
  return s;
}

function face(c: AvatarCfg, skin: string, hc: string): string {
  const k = '#2b2b2b', brow = shade(hc, -0.2);
  let s = '';
  if (c.freckles) { const f = shade(skin, -0.35); for (const [x, y] of [[43, 53], [46, 56], [41, 57], [77, 53], [74, 56], [79, 57], [57, 52], [63, 52]]) s += circ(x, y, 0.8, f, ';opacity:.8'); }
  if (c.blush) s += circ(44, 56, 4.4, c.blushC, ';opacity:.45') + circ(76, 56, 4.4, c.blushC, ';opacity:.45');
  if (c.shadow) s += ell(50, 44.5, 5.6, 3.4, c.shadowC, ';opacity:.6') + ell(70, 44.5, 5.6, 3.4, c.shadowC, ';opacity:.6');
  s += line('M45,40 Q50,37.5 55,40', brow, 2) + line('M65,40 Q70,37.5 75,40', brow, 2);
  if (c.eyes === 'glad') s += line('M46,49 Q50,45 54,49', k, 2.4) + line('M66,49 Q70,45 74,49', k, 2.4);
  else {
    const big = c.eyes === 'store', rx = big ? 4.8 : 3.8, ry = big ? 5.4 : 4.4, ir = big ? 3.4 : 2.6;
    for (const x of [50, 70]) s += ell(x, 48, rx, ry, '#ffffff', ';stroke:' + k + ';stroke-width:.9') + circ(x, 48.6, ir, c.eyeC) + circ(x, 48.6, ir * 0.48, '#141414') + circ(x + 1.1, 47.2, ir * 0.32, '#fff');
  }
  if (c.liner && c.eyes !== 'glad') s += line('M45.5,46 Q50,42.6 54.6,45.6 L57,44.2 M65.4,45.6 Q70,42.6 74.5,46 L77,44.2', '#141414', 1.5);
  if (c.lashes) s += line('M46.5,44.5 L44,42.5 M53.5,44.5 L56,42.5 M66.5,44.5 L64,42.5 M73.5,44.5 L76,42.5', k, 1.3);
  const lip = c.lips ? c.lipC : '#7a3b2e';
  if (c.mouth === 'glis') s += path('M52,56 Q60,67 68,56 Z', c.lips ? shade(lip, -0.25) : lip) + path('M54,57 H66 L65,59 H55Z', '#fff') + (c.lips ? line('M52,56 Q60,67 68,56 Q60,54.6 52,56', lip, 1.6) : '');
  else if (c.mouth === 'rolig') s += c.lips ? path('M54,59 Q57,57 60,58 Q63,57 66,59 Q60,62.4 54,59Z', lip) : line('M55,59 H65', lip, 2);
  else s += c.lips ? path('M53,57 Q60,56 67,57 Q60,65 53,57Z', lip) + line('M54,57.4 Q60,61 66,57.4', shade(lip, -0.35), 0.8) : line('M53,57 Q60,63 67,57', lip, 2.2);
  return s;
}
