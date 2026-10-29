// Pikselkunst: en karibisk piratøy med fiskelandsby, brygge og skip, i tre tider på døgnet.
// Bildet tegnes på et lerret i nettleseren og gis tilbake som PNG.

export type PirateTime = 'soloppgang' | 'solnedgang' | 'natt';
const W = 192, H = 108, HZ = 60; // HZ = horisonten

function rng(seed: number) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const toHex = (c: number[]) => '#' + c.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
/** Blander to farger. t = 0 gir a, t = 1 gir b. */
const mix = (a: string, b: string, t: number) => { const x = hex(a), y = hex(b); return toHex(x.map((v, i) => v + (y[i] - v) * t)); };

interface Look {
  sky: string[]; sea: string[]; sun: { x: number; y: number; r: number; c: string; glow: string } | null; moon: boolean; stars: number;
  /** Farge som legges over landskapet (lys og skygge for tiden på døgnet), og hvor sterkt. */
  tint: string; tintK: number; cloud: string; cloudHi: string; wave: string; lights: number; gulls: boolean;
}
const LOOK: Record<PirateTime, Look> = {
  soloppgang: {
    sky: ['#3b4f8f', '#6a6fb0', '#b98bc4', '#f2a6a6', '#ffc89a', '#ffe2a8'], sea: ['#f7c79a', '#7fb7c9', '#3f8fae', '#2a6f95', '#1f5a80'],
    sun: { x: 72, y: 55, r: 10, c: '#fff1b8', glow: '#ffd08a' }, moon: false, stars: 6, tint: '#ffb48a', tintK: 0.16, cloud: '#f7b8c0', cloudHi: '#ffe6d0', wave: '#ffe2c0', lights: 0.5, gulls: true,
  },
  solnedgang: {
    sky: ['#2a1f55', '#5a2f6e', '#a23f6b', '#e2604f', '#ff9440', '#ffc35a'], sea: ['#ff9f55', '#c75a5a', '#7a3a6a', '#45305f', '#2a2450'],
    sun: { x: 104, y: 56, r: 10, c: '#ffe08a', glow: '#ff8a3a' }, moon: false, stars: 10, tint: '#ff6a3a', tintK: 0.24, cloud: '#c24a6a', cloudHi: '#ffb07a', wave: '#ffc890', lights: 0.85, gulls: true,
  },
  natt: {
    sky: ['#040716', '#070d26', '#0b1638', '#11204a', '#18305e', '#1f3c6e'], sea: ['#1d3460', '#152a52', '#102143', '#0b1834', '#081227'],
    sun: null, moon: true, stars: 120, tint: '#1a2a5a', tintK: 0.55, cloud: '#1c2c55', cloudHi: '#3a4f80', wave: '#5a78b0', lights: 1, gulls: false,
  },
};

export function piratePNG(time: PirateTime): string {
  if (typeof document === 'undefined') return '';
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const g = cv.getContext('2d'); if (!g) return '';
  const L = LOOK[time], R = rng(11);
  const buf: string[] = new Array(W * H).fill('#000000');
  const px = (x: number, y: number, c: string) => { x = Math.round(x); y = Math.round(y); if (x >= 0 && y >= 0 && x < W && y < H) buf[y * W + x] = c; };
  const get = (x: number, y: number) => buf[y * W + x];
  /** Landskapsfarge med døgnets lys over. */
  const T = (c: string) => mix(c, L.tint, L.tintK);
  const dither = (x: number, y: number) => (x + y) % 2 === 0;

  // ---------- himmel ----------
  for (let y = 0; y < HZ; y++) for (let x = 0; x < W; x++) {
    const f = (y / HZ) * (L.sky.length - 1), i = Math.floor(f), fr = f - i;
    px(x, y, L.sky[Math.min(L.sky.length - 1, i + (fr > 0.5 && dither(x, y) ? 1 : 0) + (fr > 0.82 ? 1 : 0) - (fr > 0.82 && dither(x, y) ? 1 : 0))]);
  }
  for (let i = 0; i < L.stars; i++) { const x = Math.floor(R() * W), y = Math.floor(R() * (time === 'natt' ? 50 : 16)); px(x, y, R() < 0.3 ? '#cfd8ff' : '#ffffff'); if (time === 'natt' && R() < 0.06) { for (const [a, b] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) px(x + a, y + b, '#6f82c0'); } }
  if (L.moon) for (let y = -5; y <= 5; y++) for (let x = -5; x <= 5; x++) { const d = x * x + y * y; if (d <= 26 && (x + 2) * (x + 2) + (y - 1) * (y - 1) > 18) px(46 + x, 14 + y, d > 18 ? '#d8d0a8' : '#f6efc8'); }
  if (L.sun) {
    const s = L.sun;
    for (let y = -s.r - 6; y <= s.r + 6; y++) for (let x = -s.r - 6; x <= s.r + 6; x++) {
      const d = Math.hypot(x, y), yy = s.y + y; if (yy >= HZ) continue;
      if (d <= s.r) px(s.x + x, yy, d > s.r - 1.5 ? s.glow : s.c);
      else if (d <= s.r + 3 && dither(x, y)) px(s.x + x, yy, mix(get(s.x + x, yy) || s.glow, s.glow, 0.6));
      else if (d <= s.r + 6 && (x % 2 === 0 && y % 2 === 0)) px(s.x + x, yy, mix(get(s.x + x, yy) || s.glow, s.glow, 0.4));
    }
  }
  const cloud = (cx: number, cy: number, w: number) => {
    for (let x = -w; x <= w; x++) {
      const h = Math.round(Math.sqrt(Math.max(0, 1 - (x / w) ** 2)) * (w / 3) + (Math.sin(x * 0.9) > 0.3 ? 1 : 0));
      for (let y = 0; y <= h; y++) px(cx + x, cy - y, y >= h - 1 ? L.cloudHi : L.cloud);
      px(cx + x, cy + 1, L.cloud);
    }
  };
  cloud(70, 18, 11); cloud(84, 15, 7); cloud(140, 10, 9); cloud(20, 30, 7); cloud(112, 34, 6);

  // ---------- hav ----------
  for (let y = HZ; y < H; y++) for (let x = 0; x < W; x++) {
    const f = Math.pow((y - HZ) / (H - HZ), 0.7) * (L.sea.length - 1), i = Math.floor(f), fr = f - i;
    px(x, y, L.sea[Math.min(L.sea.length - 1, i + (fr > 0.5 && dither(x, y) ? 1 : 0))]);
  }
  for (let i = 0; i < 140; i++) { const y = HZ + 2 + Math.floor(Math.pow(R(), 0.8) * (H - HZ - 2)), x = Math.floor(R() * W), len = 2 + Math.floor((y - HZ) / 9); for (let k = 0; k < len; k++) px(x + k, y, mix(get(Math.min(W - 1, x + k), y), L.wave, 0.55)); }
  if (L.sun) for (let y = HZ; y < H; y++) { const w = Math.max(1, Math.round(L.sun.r * (1 - (y - HZ) / 60))); for (let x = -w; x <= w; x++) if ((y + x) % 3 !== 0 && (y % 2 === 0 || Math.abs(x) < w / 2)) px(L.sun.x + x + Math.round(Math.sin(y * 1.3) * 1.5), y, mix(get(Math.min(W - 1, Math.max(0, L.sun.x + x)), y), L.sun.c, 0.55)); }
  if (L.moon) for (let y = HZ + 1; y < H; y += 2) { const w = 3 - Math.floor((y - HZ) / 18); for (let x = -w; x <= w; x++) if (dither(x, y)) px(46 + x + Math.round(Math.sin(y) * 1), y, mix(get(46, y), '#f6efc8', 0.5)); }

  // ---------- liten øy langt borte ----------
  for (let x = 62; x < 92; x++) { const h = Math.round(4 * Math.sqrt(Math.max(0, 1 - ((x - 77) / 15) ** 2))); for (let y = HZ - h; y < HZ; y++) px(x, y, T(mix('#4f7f6a', L.sky[4], 0.45))); }

  // ---------- hovedøya ----------
  const hill = (x: number) => { const a = Math.max(0, 1 - ((x - 162) / 34) ** 2), b = Math.max(0, 1 - ((x - 182) / 16) ** 2); return Math.round(30 * Math.pow(a, 0.8) + 10 * b + (x > 118 ? 4 : 0)); };
  for (let x = 112; x < W; x++) {
    const top = HZ - hill(x);
    for (let y = top; y < HZ + 2; y++) {
      const d = y - top;
      let c = d < 1 ? '#6fbf4a' : d < 3 && dither(x, y) ? '#5aa83e' : '#3f8a34';
      if ((x * 7 + y * 13) % 17 === 0) c = '#2f6e2a';
      if (((x - 163) / 11) ** 2 + ((y - (HZ - 25)) / 9) ** 2 < 1) c = d < 2 ? '#8a8f86' : dither(x, y) ? '#6e7068' : '#7c7f76'; // klippe
      px(x, y, T(c));
    }
    // strand
    for (let y = HZ - 1; y < HZ + 3; y++) px(x, y, T(y === HZ + 2 ? '#e8cf8f' : dither(x, y) ? '#f2dc9e' : '#ecd496'));
  }
  // Hodeskalleklippen
  const sx = 163, sy = HZ - 25;
  for (let y = -6; y <= 5; y++) for (let x = -7; x <= 7; x++) { if ((x * x) / 49 + (y * y) / 36 > 1) continue; px(sx + x, sy + y, T(y > 2 ? '#b8b6a8' : dither(x, y) ? '#d8d4c4' : '#ccc8b8')); }
  for (const a of [-3, 2]) for (let y = -2; y <= 0; y++) for (let x = 0; x <= 1; x++) px(sx + a + x, sy + y, '#2a2420');
  px(sx, sy + 2, '#2a2420'); px(sx - 2, sy + 4, '#2a2420'); px(sx, sy + 4, '#2a2420'); px(sx + 2, sy + 4, '#2a2420');
  // palmer
  const palm = (x0: number, base: number, h: number, lean: number) => {
    let x = x0;
    for (let k = 0; k < h; k++) { x = x0 + Math.round(lean * (k / h) * (k / h) * 6); px(x, base - k, T(k % 3 === 0 ? '#7a5230' : '#9a6a3c')); }
    const tx = x, ty = base - h;
    for (const [dx, dy, len] of [[-1, 0.35, 7], [1, 0.35, 7], [-1, -0.3, 5], [1, -0.3, 5], [-0.4, 0.9, 5], [0.4, 0.9, 5]] as [number, number, number][]) {
      for (let k = 1; k <= len; k++) { const fx = tx + dx * k, fy = ty + dy * k + (k * k) / (len * 1.6); px(fx, fy, T(k > len - 2 ? '#2f7a2a' : '#46a33a')); if (k % 2) px(fx, fy + 1, T('#2f7a2a')); }
    }
    px(tx - 1, ty + 1, T('#6b4a1e')); px(tx + 1, ty + 1, T('#6b4a1e'));
  };
  palm(126, HZ - 2, 13, 0.8); palm(136, HZ - 3, 16, -0.6); palm(186, HZ - 4, 12, -1); palm(146, HZ - 8, 10, 0.5); palm(118, HZ - 1, 9, -0.7);

  // ---------- fiskelandsbyen ----------
  const lit = (c: string) => mix('#3a2a1a', c, L.lights);
  const hut = (x0: number, w: number, base: number, roof: string) => {
    for (let y = base - 6; y <= base; y++) for (let x = x0; x < x0 + w; x++) px(x, y, T((x - x0) % 3 === 0 ? '#7a5230' : '#9a6a3c'));
    for (let k = 0; k <= Math.ceil(w / 2) + 1; k++) for (let x = x0 - 1 + k; x <= x0 + w - k; x++) px(x, base - 7 - k, T(k === 0 ? shadeS(roof) : dither(x, k) ? roof : shadeS(roof)));
    px(x0 + 1, base - 3, lit('#ffd36a')); px(x0 + 2, base - 3, lit('#ffd36a')); px(x0 + 1, base - 4, lit('#ffe9a0')); px(x0 + 2, base - 4, lit('#ffd36a'));
    for (let y = base - 3; y <= base; y++) px(x0 + w - 2, y, T('#4a3018'));
    for (let k = 1; k <= 2; k++) { px(x0, base + k, T('#5a3a20')); px(x0 + w - 1, base + k, T('#5a3a20')); }
  };
  const shadeS = (c: string) => mix(c, '#000000', 0.25);
  hut(119, 7, HZ - 1, '#e0b85a'); hut(129, 8, HZ - 2, '#d8a848'); hut(140, 6, HZ - 3, '#e6c26a'); hut(149, 7, HZ - 1, '#d8a848');
  // fyrlykt/tårn ytterst på odden
  for (let y = HZ - 14; y < HZ; y++) for (let x = 183; x < 186; x++) px(x, y, T(((y - HZ) & 3) < 2 ? '#e8e2d6' : '#c43a2a'));
  for (let x = 182; x < 187; x++) px(x, HZ - 15, T('#3a2a1a'));
  px(184, HZ - 16, lit('#fff3a0')); px(183, HZ - 16, lit('#ffd36a')); px(185, HZ - 16, lit('#ffd36a'));

  // ---------- brygga ----------
  const pier0 = 92, pier1 = 124, py0 = HZ + 4;
  for (let x = pier0; x < pier1; x++) { px(x, py0, T(x % 4 === 0 ? '#6b4a2a' : '#a8784a')); px(x, py0 + 1, T('#6b4a2a')); }
  for (let x = pier0; x < pier1; x += 5) for (let y = py0 + 2; y < py0 + 7; y++) px(x, y, T(y > py0 + 4 ? mix('#4a3018', L.sea[1], 0.5) : '#4a3018'));
  for (const x of [pier0 + 1, pier0 + 15]) { for (let y = py0 - 5; y < py0; y++) px(x, y, T('#3a2a1a')); px(x, py0 - 6, lit('#ffd36a')); px(x - 1, py0 - 5, lit('#ffb347')); px(x + 1, py0 - 5, lit('#ffb347')); }
  for (let x = 118; x < 124; x++) px(x, py0 - 1, T('#6b4a2a')); // trapp opp til stranda

  // ---------- liten slupp ved brygga ----------
  const boat = (x0: number, wl: number, len: number, hull: string, sail: string, mast: number) => {
    for (let k = 0; k < 4; k++) for (let x = x0 + k; x < x0 + len - k * 1.5; x++) px(x, wl - 3 + k, T(k === 0 ? '#e0c080' : hull));
    const mx = x0 + Math.round(len / 2);
    for (let y = wl - 4 - mast; y < wl - 3; y++) px(mx, y, T('#4a3018'));
    for (let y = 0; y < mast - 2; y++) for (let x = 1; x <= Math.round((y + 1) * 0.55); x++) px(mx + x, wl - 4 - mast + 1 + y, T(sail));
  };
  boat(98, py0 + 3, 13, '#7a4a2a', '#f2ead2', 11);
  boat(170, HZ + 8, 9, '#5a3a20', '#e8dcc0', 7);

  // ---------- piratskipet ----------
  const shipX = 10, wl = HZ + 13;
  const hullC = '#4a2a18', hullD = '#2e1a0e', gold = '#d9a43a';
  for (let k = 0; k < 9; k++) {
    const left = shipX + Math.round(k * 0.9) + (k < 2 ? 2 : 0), right = shipX + 52 - Math.round(k * 1.6);
    for (let x = left; x <= right; x++) px(x, wl - 8 + k, T(k === 1 ? gold : k > 6 ? hullD : hullC));
  }
  for (let x = shipX + 40; x <= shipX + 54; x++) for (let y = wl - 12; y < wl - 8; y++) if (x - (shipX + 40) >= (wl - 8 - y) - 1) px(x, y, T(y === wl - 12 ? gold : hullC)); // akterkastell
  for (let x = shipX + 46; x < shipX + 52; x += 3) px(x, wl - 10, lit('#ffd36a'));
  for (let x = shipX + 8; x < shipX + 46; x += 6) { px(x, wl - 5, '#141010'); px(x + 1, wl - 5, '#141010'); } // kanonporter
  for (let k = 0; k < 9; k++) px(shipX - k, wl - 9 - Math.round(k * 0.5), T('#3a2414')); // baugspryd
  const masts: [number, number][] = [[shipX + 12, 30], [shipX + 26, 38], [shipX + 40, 28]];
  const sailC = time === 'natt' ? '#c8bea0' : '#f2e8cc', sailD = mix(sailC, '#7a6a50', 0.35);
  masts.forEach(([mx, h]) => {
    for (let y = wl - 8 - h; y < wl - 8; y++) px(mx, y, T('#3a2414'));
    const sails = [[0.12, 0.38], [0.45, 0.72]];
    sails.forEach(([a, b]) => {
      const y0 = Math.round(wl - 8 - h + h * a), y1 = Math.round(wl - 8 - h + h * b), half = Math.round(h * 0.2);
      for (let y = y0; y <= y1; y++) { const bulge = Math.round(Math.sin(((y - y0) / (y1 - y0)) * Math.PI) * 2); for (let x = mx - half - bulge; x <= mx + half + bulge; x++) px(x, y, T(x === mx - half - bulge || y === y1 ? sailD : sailC)); }
      for (let x = mx - half - 1; x <= mx + half + 1; x++) px(x, y0 - 1, T('#3a2414'));
    });
    for (let x = mx - Math.round(h * 0.22); x <= mx + Math.round(h * 0.22); x++) px(x, wl - 8 - h + 2, T('#3a2414'));
  });
  // Piratflagg på stormasta
  const fx = masts[1][0] + 1, fy = wl - 8 - masts[1][1] - 1;
  for (let y = 0; y < 6; y++) for (let x = 0; x < 9; x++) px(fx + x, fy + y + (x > 5 && y === 0 ? 1 : 0), '#141014');
  for (const [a, b] of [[3, 1], [4, 1], [5, 1], [3, 2], [5, 2], [4, 3], [2, 4], [6, 4]]) px(fx + a, fy + b, '#f4f0e6');
  // Hodeskalle på seilet på stormasta
  const ss = [masts[1][0], Math.round(wl - 8 - masts[1][1] + masts[1][1] * 0.58)];
  const SK = ['.###.', '#####', '#.#.#', '#####', '.#.#.', '', 'X...X', '.X.X.', '..X..', '.X.X.', 'X...X'];
  SK.forEach((row, j) => [...row].forEach((ch, i) => { if (ch !== '.') px(ss[0] - 2 + i, ss[1] - 6 + j, T('#2a2420')); }));
  // Lanterne i baugen og speiling
  px(shipX + 3, wl - 11, lit('#ffd36a')); px(shipX + 3, wl - 10, lit('#ffb347'));

  // ---------- lys i vannet ----------
  if (L.lights > 0.6) {
    for (const [x0, y0] of [[121, HZ + 2], [131, HZ + 1], [142, HZ], [151, HZ + 2], [pier0 + 1, py0 + 2], [pier0 + 15, py0 + 2], [184, HZ + 2], [shipX + 49, wl + 1], [shipX + 3, wl + 1]]) {
      for (let y = y0; y < Math.min(H, y0 + 12); y += 2) if (R() > 0.25) { const xx = x0 + Math.round(Math.sin(y * 1.7) * 1); if (get(xx, y) && y > HZ + 1) px(xx, y, mix(get(xx, y), '#ffd36a', 0.6 * L.lights)); }
    }
  }
  // Skumringslys rundt hyttene om natta
  if (time === 'natt') for (const [cx, cy] of [[121, HZ - 4], [131, HZ - 5], [142, HZ - 6], [151, HZ - 4], [pier0 + 1, py0 - 6], [pier0 + 15, py0 - 6], [184, HZ - 16]]) {
    for (let y = -4; y <= 4; y++) for (let x = -4; x <= 4; x++) { const d = x * x + y * y; if (d > 2 && d < 16 && (x + y) % 2 === 0) { const c = get(cx + x, cy + y); if (c) px(cx + x, cy + y, mix(c, '#ffb347', 0.25)); } }
  }
  // måker
  if (L.gulls) for (const [x, y] of [[96, 26], [104, 22], [58, 40], [150, 30]]) { const c = time === 'solnedgang' ? '#3a2240' : '#ffffff'; px(x - 1, y - 1, c); px(x, y, c); px(x + 1, y - 1, c); px(x - 2, y - 1, c); px(x + 2, y - 1, c); }

  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { g.fillStyle = buf[y * W + x]; g.fillRect(x, y, 1, 1); }
  return cv.toDataURL('image/png');
}
