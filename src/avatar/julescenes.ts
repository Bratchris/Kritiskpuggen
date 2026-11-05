// To store julebakgrunner: en vanlig tegning (SVG) av en snødekt bygd på julekvelden,
// og pikselkunst av en tømmerhytte i skogen julenatta.

/** Fast tallrekke, så bildet blir likt hver gang. */
function rng(seed: number) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
const r1 = (n: number) => Math.round(n * 10) / 10;

// ---------- vanlig tegning ----------
/** Gran med snø på greinene. */
function snowPine(x: number, base: number, h: number, c: string, snow: string, lights = false): string {
  let s = '<path d="M' + r1(x - 3) + ',' + r1(base - h * 0.1) + ' h6 v' + r1(h * 0.12) + ' h-6z" fill="#2a1c12"/>';
  for (let i = 0; i < 4; i++) {
    const top = base - h + i * h * 0.2, bot = base - h * (0.66 - i * 0.2), hw = h * (0.18 + i * 0.09);
    s += '<path d="M' + r1(x) + ',' + r1(top) + ' L' + r1(x + hw) + ',' + r1(bot) + ' L' + r1(x - hw) + ',' + r1(bot) + 'Z" fill="' + c + '"/>';
    s += '<path d="M' + r1(x - hw * 0.95) + ',' + r1(bot) + ' Q' + r1(x - hw * 0.5) + ',' + r1(bot - h * 0.05) + ' ' + r1(x) + ',' + r1(bot - h * 0.03) + ' Q' + r1(x + hw * 0.5) + ',' + r1(bot - h * 0.06) + ' ' + r1(x + hw * 0.95) + ',' + r1(bot) + ' Q' + r1(x) + ',' + r1(bot + h * 0.03) + ' ' + r1(x - hw * 0.95) + ',' + r1(bot) + 'Z" fill="' + snow + '"/>';
    if (lights) for (let k = 0; k < 5; k++) { const t = (k + 0.5) / 5, lx = x - hw * 0.85 + hw * 1.7 * t, ly = bot - h * 0.06 + Math.sin(t * Math.PI) * h * 0.02; s += '<circle cx="' + r1(lx) + '" cy="' + r1(ly) + '" r="' + r1(h * 0.016 + 1) + '" fill="' + ['#ff5a5a', '#ffd25a', '#6fd0ff', '#8cff7a', '#ff8ae0'][(k + i) % 5] + '"/>'; }
  }
  return s;
}
/** Hus med saltak, snø og lys i vinduene. */
function house(x: number, base: number, w: number, h: number, wall: string, side: string, smoke: boolean): string {
  const roofH = h * 0.55, d = w * 0.35;
  let s = '<path d="M' + x + ',' + base + ' V' + (base - h) + ' H' + (x + w) + ' V' + base + 'Z" fill="' + wall + '"/>' +
    '<path d="M' + (x + w) + ',' + base + ' V' + (base - h) + ' L' + r1(x + w + d) + ',' + r1(base - h - d * 0.35) + ' V' + r1(base - d * 0.35) + 'Z" fill="' + side + '"/>' +
    '<path d="M' + (x - 8) + ',' + (base - h + 2) + ' L' + r1(x + w / 2) + ',' + r1(base - h - roofH) + ' L' + (x + w + 8) + ',' + (base - h + 2) + 'Z" fill="#f4f7fb"/>' +
    '<path d="M' + r1(x + w / 2) + ',' + r1(base - h - roofH) + ' L' + r1(x + w / 2 + d) + ',' + r1(base - h - roofH - d * 0.35) + ' L' + r1(x + w + 8 + d) + ',' + r1(base - h + 2 - d * 0.35) + ' L' + (x + w + 8) + ',' + (base - h + 2) + 'Z" fill="#d9e3f0"/>';
  const cols = Math.max(1, Math.floor(w / 34));
  for (let i = 0; i < cols; i++) {
    const wx = x + (w / cols) * (i + 0.5) - 8, wy = base - h * 0.72;
    s += '<rect x="' + r1(wx - 6) + '" y="' + r1(wy - 6) + '" width="28" height="30" rx="4" fill="#ffd36a" opacity=".25"/><rect x="' + r1(wx) + '" y="' + r1(wy) + '" width="16" height="18" fill="#ffd36a"/><path d="M' + r1(wx + 8) + ',' + r1(wy) + ' v18 M' + r1(wx) + ',' + r1(wy + 9) + ' h16" stroke="' + side + '" stroke-width="2"/>';
  }
  if (smoke) {
    const cx = x + w * 0.72, cy = base - h - roofH * 0.45;
    s += '<rect x="' + r1(cx) + '" y="' + r1(cy - 26) + '" width="14" height="30" fill="' + side + '"/><rect x="' + r1(cx - 2) + '" y="' + r1(cy - 30) + '" width="18" height="6" fill="#f4f7fb"/>';
    for (let i = 0; i < 6; i++) { const t = i / 5; s += '<circle cx="' + r1(cx + 7 + Math.sin(t * 5) * 8 + t * 30) + '" cy="' + r1(cy - 40 - t * 120) + '" r="' + r1(7 + t * 16) + '" fill="#c9d4e6" opacity="' + r1(0.35 * (1 - t) + 0.06) + '"/>'; }
  }
  return s;
}
function star5(cx: number, cy: number, r: number, fill: string): string {
  let d = '';
  for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.42 : r; d += (i ? 'L' : 'M') + r1(cx + rr * Math.cos(a)) + ',' + r1(cy + rr * Math.sin(a)); }
  return '<path d="' + d + 'Z" fill="' + fill + '"/>';
}

export function julekveldSVG(): string {
  const R = rng(12);
  let stars = '';
  for (let i = 0; i < 160; i++) stars += '<circle cx="' + r1(R() * 1600) + '" cy="' + r1(R() * 480) + '" r="' + r1(0.6 + R() * 1.5) + '" fill="#fff" opacity="' + r1(0.3 + R() * 0.6) + '"/>';
  let snow = '';
  for (let i = 0; i < 220; i++) snow += '<circle cx="' + r1(R() * 1600) + '" cy="' + r1(R() * 900) + '" r="' + r1(1 + R() * 2.6) + '" fill="#fff" opacity="' + r1(0.4 + R() * 0.5) + '"/>';
  // Julestjernen med stråler
  const sx = 1180, sy = 150;
  let rays = '';
  for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, l = i % 2 ? 90 : 190; rays += '<path d="M' + sx + ',' + sy + ' L' + r1(sx + Math.cos(a) * l) + ',' + r1(sy + Math.sin(a) * l) + '" stroke="#fff6cf" stroke-width="' + (i % 2 ? 2 : 3.4) + '" opacity=".5" stroke-linecap="round"/>'; }
  // Skog bak bygda
  let back = '';
  for (let x = -10; x < 1620; x += 16 + R() * 18) back += snowPine(x, 640 + R() * 12, 60 + R() * 46, '#1c3b45', '#cfdbea');
  // Bygda
  const houses = house(380, 700, 120, 70, '#b3362d', '#8a2a23', true) + house(560, 690, 90, 56, '#e3b04a', '#b98a33', false) +
    house(1010, 706, 140, 74, '#b3362d', '#8a2a23', true) + house(1220, 694, 96, 60, '#2e6f8e', '#22566e', true) + house(1380, 702, 110, 66, '#b3362d', '#8a2a23', false);
  // Kirke med tårn
  const church = '<path d="M760,700 V630 H880 V700Z" fill="#f2efe6"/><path d="M880,700 V630 L920,616 V686Z" fill="#d6d1c3"/>' +
    '<path d="M752,632 L820,592 L888,632Z" fill="#f4f7fb"/><path d="M820,592 L860,578 L928,618 L888,632Z" fill="#d9e3f0"/>' +
    '<path d="M794,630 V560 H834 V630Z" fill="#f2efe6"/><path d="M786,562 L814,490 L842,562Z" fill="#3a3f52"/><path d="M814,490 V470 M806,478 H822" stroke="#e3ad33" stroke-width="3"/>' +
    '<rect x="806" y="580" width="16" height="22" rx="8" fill="#ffd36a"/><rect x="776" y="650" width="14" height="22" rx="7" fill="#ffd36a"/><rect x="848" y="650" width="14" height="22" rx="7" fill="#ffd36a"/><path d="M808,700 v-26 a12,12 0 0 1 24,0 v26z" fill="#6b4226"/>';
  // Stort juletre på torget
  const bigTree = snowPine(660, 760, 230, '#1f6b45', '#e8f0f8', true) + star5(660, 528, 18, '#ffd25a');
  // Forgrunn
  let front = '';
  const R2 = rng(31);
  for (let x = -30; x < 1640; x += 120 + R2() * 140) { if ((x > 140 && x < 360) || (x > 420 && x < 1000) || (x > 1100 && x < 1340)) continue; front += snowPine(x, 880 + R2() * 20, 200 + R2() * 110, '#123528', '#eef4fb'); }
  const sled = '<path d="M1160,842 H1290 q14,0 14,-14" fill="none" stroke="#7a4a26" stroke-width="5" stroke-linecap="round"/><path d="M1180,842 v-14 M1270,842 v-14" stroke="#7a4a26" stroke-width="4"/>' +
    '<path d="M1170,828 H1290 L1296,800 H1176Z" fill="#c9302c"/>' +
    '<rect x="1186" y="770" width="40" height="32" fill="#2e7d4f"/><path d="M1206,770 v32 M1186,786 h40" stroke="#ffd25a" stroke-width="4"/>' +
    '<rect x="1232" y="780" width="34" height="22" fill="#ffd25a"/><path d="M1249,780 v22 M1232,791 h34" stroke="#c9302c" stroke-width="4"/>' +
    '<rect x="1208" y="748" width="26" height="22" fill="#6fb3e0"/><path d="M1221,748 v22" stroke="#fff" stroke-width="3"/>';
  const snowman = '<circle cx="250" cy="828" r="40" fill="#fbfdff" stroke="#c9d6ea" stroke-width="3"/><circle cx="250" cy="768" r="28" fill="#fbfdff" stroke="#c9d6ea" stroke-width="3"/><circle cx="250" cy="726" r="20" fill="#fbfdff" stroke="#c9d6ea" stroke-width="3"/>' +
    '<rect x="234" y="690" width="32" height="22" fill="#1e1a24"/><rect x="226" y="708" width="48" height="6" fill="#1e1a24"/><path d="M250,728 l18,4 -18,4z" fill="#f08a24"/>' +
    '<circle cx="243" cy="720" r="2.4" fill="#1e1a24"/><circle cx="257" cy="720" r="2.4" fill="#1e1a24"/><path d="M228,748 q22,10 44,0 v8 q-22,10 -44,0z" fill="#c9302c"/><path d="M262,754 v26" stroke="#c9302c" stroke-width="8"/>' +
    '<path d="M224,764 L188,736 M276,764 L312,736" stroke="#6b4226" stroke-width="4" stroke-linecap="round"/><circle cx="250" cy="768" r="3" fill="#1e1a24"/><circle cx="250" cy="784" r="3" fill="#1e1a24"/>';

  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice">' +
    '<defs><linearGradient id="jsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#060a24"/><stop offset=".5" stop-color="#16245a"/><stop offset="1" stop-color="#3a4f8f"/></linearGradient>' +
    '<radialGradient id="jstar" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff6cf" stop-opacity=".9"/><stop offset=".25" stop-color="#ffe39a" stop-opacity=".35"/><stop offset="1" stop-color="#ffe39a" stop-opacity="0"/></radialGradient>' +
    '<radialGradient id="jglow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffd36a" stop-opacity=".45"/><stop offset="1" stop-color="#ffd36a" stop-opacity="0"/></radialGradient>' +
    '<filter id="jb2"><feGaussianBlur stdDeviation="2"/></filter></defs>' +
    '<rect width="1600" height="900" fill="url(#jsky)"/>' + stars +
    '<circle cx="' + sx + '" cy="' + sy + '" r="170" fill="url(#jstar)"/><g filter="url(#jb2)">' + rays + '</g>' + star5(sx, sy, 22, '#fffbe8') +
    '<circle cx="230" cy="130" r="40" fill="#f4eed4"/><circle cx="246" cy="118" r="36" fill="#0d1638" opacity=".92"/>' +
    '<path d="M0,560 L140,470 L240,520 L380,410 L500,500 L620,430 L760,520 L900,440 L1040,520 L1160,450 L1300,520 L1440,440 L1600,520 V900 H0Z" fill="#33467e"/>' +
    '<path d="M330,450 L380,410 L430,452 L404,446 L380,460 L356,446Z M860,470 L900,440 L944,474 L918,468 L900,480 L882,468Z M1400,470 L1440,440 L1484,474 L1458,468 L1440,480 L1420,468Z" fill="#e6eefb"/>' +
    '<path d="M0,640 Q300,590 620,630 T1240,620 T1600,610 V900 H0Z" fill="#c3d2e8"/>' + back +
    '<path d="M0,700 Q400,660 800,690 T1600,680 V900 H0Z" fill="#e3ecf7"/>' + houses + church +
    '<ellipse cx="660" cy="760" rx="180" ry="40" fill="url(#jglow)"/>' + bigTree +
    '<path d="M0,800 Q420,760 820,790 T1600,780 V900 H0Z" fill="#f4f8fd"/>' + snowman + sled + front +
    '<path d="M0,860 Q500,830 1000,856 T1600,850 V900 H0Z" fill="#ffffff"/>' + snow + '</svg>';
}

// ---------- pikselkunst ----------
const PW = 160, PH = 96;
export function julenattPixelPNG(): string {
  if (typeof document === 'undefined') return '';
  const cv = document.createElement('canvas'); cv.width = PW; cv.height = PH;
  const g = cv.getContext('2d'); if (!g) return '';
  const px = (x: number, y: number, c: string) => { if (x >= 0 && y >= 0 && x < PW && y < PH) { g.fillStyle = c; g.fillRect(x, y, 1, 1); } };
  const rect = (x: number, y: number, w: number, h: number, c: string) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) px(x + i, y + j, c); };
  const R = rng(5);
  // Himmel i trinn
  const SKY = ['#070b24', '#0c1436', '#121d4a', '#1a2a5e', '#243872', '#2f4785'];
  for (let y = 0; y < PH; y++) for (let x = 0; x < PW; x++) { const f = Math.min(1, y / 66) * (SKY.length - 1), i = Math.floor(f), fr = f - i; px(x, y, SKY[Math.min(SKY.length - 1, i + (fr > 0.5 && (x + y) % 2 === 0 ? 1 : 0))]); }
  for (let i = 0; i < 80; i++) { const x = Math.floor(R() * PW), y = Math.floor(R() * 50); px(x, y, R() < 0.3 ? '#cfd8ff' : '#ffffff'); }
  // Svakt nordlys
  for (let x = 0; x < PW; x++) { const yc = Math.round(22 + Math.sin(x * 0.05) * 4 + Math.sin(x * 0.13) * 2); for (let d = 0; d < 7; d++) { if ((x + d) % 2 && d > 3) continue; px(x, yc - d, d < 2 ? '#5effb0' : d < 4 ? '#2fb38a' : '#2a5f8f'); } }
  // Julestjernen
  const stx = 124, sty = 12;
  px(stx, sty, '#ffffff'); for (let k = 1; k <= 5; k++) { const c = k < 3 ? '#fff6cf' : '#c9b878'; px(stx + k, sty, c); px(stx - k, sty, c); px(stx, sty + k, c); px(stx, sty - k, c); if (k < 3) { px(stx + k, sty + k, '#e6d9a0'); px(stx - k, sty - k, '#e6d9a0'); px(stx + k, sty - k, '#e6d9a0'); px(stx - k, sty + k, '#e6d9a0'); } }
  // Snøfjell og åser
  const tri = (u: number) => 1 - Math.abs(2 * (u - Math.floor(u)) - 1);
  for (let x = 0; x < PW; x++) {
    const a = Math.round(52 - 14 * tri(x / 40 + 0.2) - 4 * tri(x / 13)); for (let y = a; y < PH; y++) px(x, y, y < a + 4 - ((x + y) % 2) ? '#eef3fb' : '#3b4d86');
    const b = Math.round(66 - 6 * tri(x / 60 + 0.5)); for (let y = b; y < PH; y++) px(x, y, (x + y) % 5 === 0 ? '#c3d0e6' : '#d6e0ef');
  }
  // Grantrær med snø
  const tree = (cx: number, base: number, h: number, dark: string, mid: string, lights: boolean) => {
    for (let k = 0; k < h; k++) {
      const y = base - h + k, seg = Math.ceil(h / 3), hw = Math.floor((k % seg) / 1.5) + Math.floor(k / seg);
      for (let x = -hw; x <= hw; x++) px(cx + x, y, k % seg === seg - 1 || (k % seg === 0 && Math.abs(x) <= 1) ? '#eef3fb' : x < 0 ? mid : dark);
      if (lights && k % 3 === 1 && hw > 1) px(cx + ((k * 5) % (hw * 2 + 1)) - hw, y, ['#ff5a5a', '#ffd25a', '#6fd0ff', '#8cff7a'][k % 4]);
    }
    px(cx, base, '#3a2418'); px(cx, base + 1, '#3a2418');
  };
  for (let x = 2; x < PW; x += 6 + Math.floor(R() * 5)) tree(x, 66 + Math.floor(R() * 3), 10 + Math.floor(R() * 6), '#173d34', '#1f5040', false);
  // Tømmerhytta
  const hx = 54, hy = 72;
  rect(hx, hy - 14, 30, 14, '#9c3a2c');
  for (let j = 0; j < 14; j += 2) for (let i = 0; i < 30; i++) if ((i + j) % 7 === 0) px(hx + i, hy - 14 + j, '#7a2c22');
  for (let k = 0; k < 11; k++) { const y = hy - 15 - k; for (let i = hx - 3 + k; i <= hx + 32 - k; i++) px(i, y, k < 2 || (i + y) % 3 ? '#f4f7fb' : '#dbe4f2'); }
  // Vinduer med lys og dør
  const win = (x: number, y: number) => { rect(x - 1, y - 1, 7, 7, '#5a2018'); rect(x, y, 5, 5, '#ffd36a'); px(x + 2, y, '#d99a3a'); px(x + 2, y + 1, '#d99a3a'); px(x + 2, y + 3, '#d99a3a'); px(x + 2, y + 4, '#d99a3a'); for (let i = 0; i < 5; i++) px(x + i, y + 2, '#d99a3a'); };
  win(hx + 4, hy - 10); win(hx + 21, hy - 10); rect(hx + 13, hy - 9, 5, 9, '#4a2a18'); px(hx + 17, hy - 5, '#e3ad33');
  // Lysskjær ut på snøen
  for (let y = hy; y < hy + 8; y++) for (let x = hx - 6; x < hx + 36; x++) if ((x + y) % 2 === 0 && Math.abs(x - hx - 15) < 22 - (y - hy) * 2) px(x, y, '#f6e6b8');
  // Pipe og røyk
  rect(hx + 22, hy - 28, 3, 6, '#5a2018'); rect(hx + 21, hy - 29, 5, 1, '#f4f7fb');
  for (let i = 0; i < 9; i++) { const sx = hx + 23 + Math.round(Math.sin(i * 0.9) * 2 + i * 0.8), sy = hy - 31 - i * 3; for (let d = 0; d < 1 + Math.floor(i / 3); d++) { px(sx + d, sy, '#aab6cc'); px(sx - d, sy - 1, '#8f9cb5'); } }
  // Pyntet juletre ved hytta, snømann og forgrunnstrær
  tree(98, 80, 18, '#1f6b45', '#2e8a57', true); px(98, 61, '#ffd25a'); px(97, 62, '#ffd25a'); px(99, 62, '#ffd25a');
  rect(103, 78, 4, 3, '#c9302c'); rect(92, 78, 4, 3, '#2e7dc4'); px(105, 78, '#ffd25a'); px(94, 78, '#ffd25a');
  const sm = (cx: number, cy: number) => { for (let y = -4; y <= 4; y++) for (let x = -4; x <= 4; x++) if (x * x + y * y <= 17) px(cx + x, cy + y, x > 1 ? '#dbe4f2' : '#ffffff'); for (let y = -3; y <= 3; y++) for (let x = -3; x <= 3; x++) if (x * x + y * y <= 9) px(cx + x, cy - 7 + y, x > 1 ? '#dbe4f2' : '#ffffff'); px(cx - 1, cy - 8, '#1e1a24'); px(cx + 1, cy - 8, '#1e1a24'); px(cx + 1, cy - 6, '#f08a24'); px(cx + 2, cy - 6, '#f08a24'); rect(cx - 3, cy - 4, 7, 1, '#c9302c'); rect(cx - 2, cy - 13, 5, 3, '#1e1a24'); rect(cx - 3, cy - 10, 7, 1, '#1e1a24'); };
  sm(128, 82);
  for (let y = 84; y < PH; y++) for (let x = 0; x < PW; x++) px(x, y, (x * 3 + y * 7) % 13 === 0 ? '#dfe7f4' : '#f6f9fd');
  for (let x = 0; x < PW; x += 16 + Math.floor(R() * 12)) { if (x > 40 && x < 140) continue; tree(x, 94, 22 + Math.floor(R() * 8), '#0f2e25', '#174236', false); }
  // Snøfall
  for (let i = 0; i < 70; i++) px(Math.floor(R() * PW), Math.floor(R() * PH), '#ffffff');
  return cv.toDataURL('image/png');
}
