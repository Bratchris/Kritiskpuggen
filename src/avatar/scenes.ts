// To større bakgrunnsbilder: skog og fjell med bål, røyk og nordlys.
// Den ene er en vanlig tegning (SVG), den andre pikselkunst som tegnes på et lerret i nettleseren.

/** Fast tallrekke, så bildet blir likt hver gang. */
function rng(seed: number) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
const r1 = (n: number) => Math.round(n * 10) / 10;

// ---------- vanlig tegning ----------
function pine(x: number, base: number, h: number, c: string, edge: string): string {
  const w = h * 0.42, t = base - h;
  let d = '';
  for (let i = 0; i < 3; i++) {
    const top = t + i * h * 0.24, bot = t + h * (0.42 + i * 0.25), hw = w * (0.55 + i * 0.25);
    d += 'M' + r1(x) + ',' + r1(top) + ' L' + r1(x + hw) + ',' + r1(bot) + ' L' + r1(x - hw) + ',' + r1(bot) + 'Z ';
  }
  return '<path d="' + d + '" fill="' + c + '"/><path d="M' + r1(x - 2) + ',' + r1(base - h * 0.1) + ' h4 v' + r1(h * 0.12) + ' h-4z" fill="' + edge + '"/>';
}
function ridge(pts: [number, number][], fill: string, snow: string, snowPart: number): string {
  let s = '<path d="M' + pts.map((p) => p.join(',')).join(' L') + ' L1600,900 L0,900Z" fill="' + fill + '"/>';
  for (let i = 1; i < pts.length - 1; i++) {
    const [px, py] = pts[i], [ax, ay] = pts[i - 1], [bx, by] = pts[i + 1];
    if (py > ay || py > by) continue;
    const f = snowPart, lx = px + (ax - px) * f * 0.9, ly = py + (ay - py) * f * 0.9, rx = px + (bx - px) * f, ry = py + (by - py) * f;
    const my = Math.max(ly, ry);
    s += '<path d="M' + r1(lx) + ',' + r1(ly) + ' L' + px + ',' + py + ' L' + r1(rx) + ',' + r1(ry) + ' L' + r1(px + (rx - px) * 0.55) + ',' + r1(my - 8) + ' L' + r1(px + (rx - px) * 0.2) + ',' + r1(my + 4) + ' L' + r1(px - (px - lx) * 0.3) + ',' + r1(my - 6) + ' L' + r1(px - (px - lx) * 0.65) + ',' + r1(my + 2) + 'Z" fill="' + snow + '"/>';
  }
  return s;
}

export function nordlysSVG(): string {
  const R = rng(7);
  let stars = '';
  for (let i = 0; i < 150; i++) { const x = r1(R() * 1600), y = r1(R() * 520), rr = r1(0.6 + R() * 1.6); stars += '<circle cx="' + x + '" cy="' + y + '" r="' + rr + '" fill="#fff" opacity="' + r1(0.35 + R() * 0.6) + '"/>'; }
  // Nordlys: bølgende bånd og tynne stråler.
  const band = (y0: number, amp: number, k: number, ph: number, th: number) => {
    let top = '', bot = '';
    for (let x = -50; x <= 1650; x += 50) {
      const y = y0 + Math.sin(x * k + ph) * amp + Math.sin(x * k * 2.3 + ph * 1.7) * amp * 0.35;
      top += (x === -50 ? 'M' : ' L') + x + ',' + r1(y - th);
      bot = ' L' + x + ',' + r1(y) + bot;
    }
    return top + bot.replace(/^ L/, ' L') + 'Z';
  };
  let rays = '';
  for (let x = 0; x < 1600; x += 9) {
    const y = 250 + Math.sin(x * 0.004 + 0.6) * 70 + Math.sin(x * 0.0092 + 1) * 25;
    const h = 90 + R() * 130;
    rays += '<path d="M' + x + ',' + r1(y) + ' V' + r1(y - h) + '" stroke="url(#ray)" stroke-width="' + r1(2 + R() * 4) + '" opacity="' + r1(0.25 + R() * 0.45) + '"/>';
  }
  let back = '', front = '';
  const R2 = rng(21);
  for (let x = -10; x < 1620; x += 14 + R2() * 16) back += pine(x, 700 + R2() * 14, 70 + R2() * 50, '#13293a', '#0d1c28');
  for (let x = -20; x < 1640; x += 26 + R2() * 30) { front += pine(x, 790 + R2() * 20, 130 + R2() * 90, '#0a1a17', '#07110f'); }
  // Røyk: dotter som stiger og blir større og lysere.
  let smoke = '';
  for (let i = 0; i < 16; i++) { const t = i / 15, x = 262 + Math.sin(t * 7) * (14 + t * 50) + t * 170, y = 740 - t * 540, rr = 9 + t * 40; smoke += '<circle cx="' + r1(x) + '" cy="' + r1(y) + '" r="' + r1(rr) + '" fill="#a7afc0" opacity="' + r1(0.3 * (1 - t) + 0.05) + '"/>'; }
  const flame = (sx: number, sy: number, k: number, c1: string, c2: string) => '<path transform="translate(' + sx + ' ' + sy + ') scale(' + k + ')" d="M0,0 C-26,-4 -30,-30 -16,-50 C-14,-36 -6,-34 -4,-40 C-10,-60 0,-80 10,-96 C10,-74 30,-60 26,-30 C24,-10 14,0 0,0Z" fill="' + c1 + '"/>' +
    '<path transform="translate(' + sx + ' ' + sy + ') scale(' + (k * 0.55) + ')" d="M0,0 C-20,-4 -22,-26 -10,-40 C-8,-28 0,-28 0,-34 C-2,-50 6,-62 12,-70 C12,-52 26,-42 22,-22 C20,-8 12,0 0,0Z" fill="' + c2 + '"/>';
  let sparks = '';
  for (let i = 0; i < 14; i++) sparks += '<circle cx="' + r1(230 + R() * 60) + '" cy="' + r1(700 - R() * 120) + '" r="' + r1(1 + R() * 1.6) + '" fill="#ffd36a" opacity="' + r1(0.5 + R() * 0.5) + '"/>';
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice">' +
    '<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#040817"/><stop offset=".55" stop-color="#0c1b40"/><stop offset="1" stop-color="#1b3263"/></linearGradient>' +
    '<linearGradient id="aur" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8a5cff" stop-opacity="0"/><stop offset=".45" stop-color="#5ad1c8" stop-opacity=".55"/><stop offset="1" stop-color="#3dff9a" stop-opacity=".9"/></linearGradient>' +
    '<linearGradient id="ray" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#7dffb8"/><stop offset=".6" stop-color="#3fd6a8" stop-opacity=".5"/><stop offset="1" stop-color="#9a6bff" stop-opacity="0"/></linearGradient>' +
    '<radialGradient id="glow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffb347" stop-opacity=".75"/><stop offset=".4" stop-color="#ff7a2a" stop-opacity=".25"/><stop offset="1" stop-color="#ff7a2a" stop-opacity="0"/></radialGradient>' +
    '<filter id="b8" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="10"/></filter><filter id="b3"><feGaussianBlur stdDeviation="3"/></filter><filter id="b6" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4"/></filter></defs>' +
    '<rect width="1600" height="900" fill="url(#sky)"/>' + stars +
    '<g filter="url(#b8)"><path d="' + band(260, 70, 0.004, 0.6, 120) + '" fill="url(#aur)"/><path d="' + band(170, 40, 0.006, 2.2, 70) + '" fill="url(#aur)" opacity=".55"/></g>' +
    '<g filter="url(#b3)">' + rays + '</g>' +
    '<circle cx="1380" cy="120" r="34" fill="#f4eed4"/><circle cx="1366" cy="110" r="7" fill="#e3dbbb"/><circle cx="1392" cy="134" r="5" fill="#e3dbbb"/>' +
    ridge([[0, 560], [120, 470], [210, 520], [330, 380], [420, 450], [520, 360], [640, 470], [760, 400], [880, 500], [1000, 350], [1120, 450], [1220, 390], [1340, 480], [1460, 400], [1600, 470]], '#2b3d6b', '#dfe8ff', 0.32) +
    ridge([[0, 640], [150, 560], [260, 610], [400, 520], [540, 600], [700, 540], [860, 620], [980, 560], [1120, 630], [1260, 550], [1420, 610], [1600, 560]], '#1c2a4d', '#b9c7ea', 0.22) +
    back + '<path d="M0,760 Q300,730 600,752 T1200,748 T1600,744 V900 H0Z" fill="#0b1815"/>' +
    front + '<circle cx="262" cy="800" r="200" fill="url(#glow)" opacity=".8"/>' +
    '<g filter="url(#b6)">' + smoke + '</g>' +
    '<ellipse cx="262" cy="812" rx="70" ry="14" fill="#2a1a10" opacity=".7"/>' +
    [[214, 812, 16], [306, 814, 14], [236, 822, 12], [292, 824, 13]].map(([x, y, rr]) => '<ellipse cx="' + x + '" cy="' + y + '" rx="' + rr + '" ry="' + (rr * 0.7) + '" fill="#4d5566"/>').join('') +
    '<rect x="222" y="798" width="84" height="13" rx="6" fill="#6b4226" transform="rotate(14 264 805)"/><rect x="222" y="798" width="84" height="13" rx="6" fill="#57351e" transform="rotate(-14 264 805)"/>' +
    flame(262, 806, 1, '#ff6a1f', '#ffd84a') + flame(240, 808, 0.55, '#ff8a2a', '#ffe98a') + flame(286, 808, 0.6, '#ff5a1a', '#ffd36a') + sparks + '</svg>';
}

// ---------- pikselkunst ----------
const PW = 160, PH = 96;
/** Tegner pikselbildet på et lerret og gir det tilbake som PNG-adresse. Tomt hvis nettleseren ikke har lerret. */
export function nordlysPixelPNG(): string {
  if (typeof document === 'undefined') return '';
  const cv = document.createElement('canvas'); cv.width = PW; cv.height = PH;
  const g = cv.getContext('2d'); if (!g) return '';
  const px = (x: number, y: number, c: string) => { if (x >= 0 && y >= 0 && x < PW && y < PH) { g.fillStyle = c; g.fillRect(x, y, 1, 1); } };
  const R = rng(3);
  // Himmel i trinn, med rutemønster mellom trinnene.
  const SKY = ['#050a1c', '#081131', '#0c1a44', '#132454', '#1a3064', '#223a73'];
  for (let y = 0; y < PH; y++) for (let x = 0; x < PW; x++) {
    const f = Math.min(1, y / 70) * (SKY.length - 1), i = Math.floor(f), fr = f - i;
    px(x, y, SKY[Math.min(SKY.length - 1, i + (fr > 0.5 && (x + y) % 2 === 0 ? 1 : 0))]);
  }
  for (let i = 0; i < 90; i++) { const x = Math.floor(R() * PW), y = Math.floor(R() * 56); px(x, y, R() < 0.3 ? '#cfd8ff' : '#ffffff'); if (R() < 0.08) { px(x - 1, y, '#8fa0d8'); px(x + 1, y, '#8fa0d8'); px(x, y - 1, '#8fa0d8'); px(x, y + 1, '#8fa0d8'); } }
  // Nordlys: et gardin av loddrette striper.
  const curtain = (y0: number, amp: number, k: number, ph: number, len: number, x0: number, x1: number) => {
    for (let x = x0; x < x1; x++) {
      const yc = Math.round(y0 + Math.sin(x * k + ph) * amp + Math.sin(x * k * 2.7 + ph) * amp * 0.3);
      const l = len + Math.round(Math.sin(x * 0.7) * 2 + Math.sin(x * 0.23) * 3);
      for (let d = 0; d < l; d++) {
        const y = yc - d, t = d / l;
        let c = t < 0.12 ? '#b6ffd6' : t < 0.35 ? '#3dff9a' : t < 0.6 ? '#22c58a' : t < 0.8 ? '#1a8f8f' : '#6a4cd6';
        if (t >= 0.8 && (x + y) % 2) continue; // tynnes ut mot toppen
        if (t >= 0.6 && t < 0.8 && (x + y) % 3 === 0) c = '#2b6fa0';
        px(x, y, c);
      }
    }
  };
  curtain(27, 5, 0.06, 0.4, 13, 0, PW); curtain(15, 3, 0.09, 2, 7, 60, 150);
  // Måne
  for (let y = -4; y <= 4; y++) for (let x = -4; x <= 4; x++) if (x * x + y * y <= 17) px(136 + x, 12 + y, x * x + y * y > 10 && x < 0 ? '#d9d1b0' : '#f4eed4');
  // Fjell
  const tri = (u: number) => 1 - Math.abs(2 * (u - Math.floor(u)) - 1);
  const mb = (x: number) => Math.round(54 - 18 * tri(x / 46 + 0.3) - 5 * tri(x / 17 + 0.1));
  const mf = (x: number) => Math.round(64 - 11 * tri(x / 34 + 0.75) - 3 * tri(x / 11));
  for (let x = 0; x < PW; x++) {
    const a = mb(x); for (let y = a; y < PH; y++) px(x, y, a < 38 && y < a + Math.max(1, Math.round((38 - a) * 0.55)) - ((x + y) % 2) ? '#dfe8ff' : (x % 7 === 0 && y > a + 3 ? '#26355f' : '#2b3b66'));
    const b = mf(x); for (let y = b; y < PH; y++) px(x, y, b < 55 && y < b + Math.max(1, Math.round((55 - b) * 0.5)) - ((x + y) % 2) ? '#b8c6ea' : '#1d2847');
  }
  // Skog
  const tree = (cx: number, base: number, h: number, c: string, e: string) => {
    for (let k = 0; k < h; k++) { const y = base - h + k, hw = Math.floor((k % Math.ceil(h / 3)) / 1.6) + Math.floor(k / Math.ceil(h / 3)); for (let x = -hw; x <= hw; x++) px(cx + x, y, x === -hw ? e : c); }
    px(cx, base, '#0a0f0c'); px(cx, base + 1, '#0a0f0c');
  };
  for (let x = 0; x < PW; x += 3 + Math.floor(R() * 3)) tree(x, 72 + Math.floor(R() * 3), 9 + Math.floor(R() * 5), '#12283a', '#1a3a4a');
  for (let y = 76; y < PH; y++) for (let x = 0; x < PW; x++) px(x, y, (x * 7 + y * 3) % 11 === 0 ? '#0f201b' : '#0a1612');
  for (let x = 0; x < PW; x += 5 + Math.floor(R() * 4)) { if (x > 20 && x < 44) continue; tree(x, 83 + Math.floor(R() * 4), 14 + Math.floor(R() * 8), '#0b1c18', '#16302a'); }
  // Lys fra bålet
  const fx = 32, fy = 88;
  for (let y = 60; y < PH; y++) for (let x = 0; x < 70; x++) {
    const d = Math.hypot(x - fx, (y - fy) * 1.4);
    if (d < 6 || (d < 11 && (x + y) % 2 === 0) || (d < 15 && x % 2 === 0 && y % 2 === 0)) {
      const id = g.getImageData(x, y, 1, 1).data; const k = d < 6 ? 0.45 : 0.28;
      px(x, y, 'rgb(' + Math.round(id[0] + (255 - id[0]) * k) + ',' + Math.round(id[1] + (140 - id[1]) * k * 0.8) + ',' + Math.round(id[2] * (1 - k)) + ')');
    }
  }
  // Røyk
  for (let i = 0; i < 46; i++) {
    const t = i / 45, cx = Math.round(fx + 1 + Math.sin(t * 8) * (2 + t * 7) + t * 26), cy = Math.round(fy - 10 - t * 60), rr = Math.round(t * 3);
    for (let y = -rr; y <= rr; y++) for (let x = -rr; x <= rr; x++) if (x * x + y * y <= rr * rr + 1 && ((cx + x + cy + y) % 2 === 0 || t < 0.2)) px(cx + x, cy + y, t < 0.35 ? '#9aa0b0' : t < 0.7 ? '#757b8c' : '#565c74');
  }
  // Steiner, ved og flammer
  for (const [x, c] of [[fx - 6, '#4d5566'], [fx - 4, '#5e6778'], [fx + 5, '#4d5566'], [fx + 7, '#5e6778']] as [number, string][]) { px(x, fy + 2, c); px(x + 1, fy + 2, c); px(x, fy + 1, c); }
  for (let i = -5; i <= 5; i++) { px(fx + i, fy + 1 - Math.floor((i + 5) / 4), '#6b4226'); px(fx - i, fy + 1 - Math.floor((i + 5) / 4), '#57351e'); }
  const F = ['....y....', '...yo....', '...oyo...', '..oyyo.y.', '..oyYyoo.', '.oyYYyyo.', '.oyYWYyro', 'roYYWYyor', '.rooYoor.'];
  const FC: Record<string, string> = { W: '#ffffff', Y: '#fff3a0', y: '#ffd84a', o: '#ff8a1f', r: '#e84a1a' };
  F.forEach((row, j) => [...row].forEach((ch, i) => { if (FC[ch]) px(fx - 4 + i, fy - 9 + j, FC[ch]); }));
  for (const [x, y] of [[fx - 3, fy - 13], [fx + 4, fy - 15], [fx + 1, fy - 18], [fx - 1, fy - 21]]) px(x, y, '#ffd84a');
  return cv.toDataURL('image/png');
}
