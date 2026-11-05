// Julehuset i Nyreligiøspuggen: møbler, tepper, veggpynt og trofeene for nivå 1–8.
// Gulvting tegnes med origo midt på gulvruta (y oppover er negativ).
// Veggting tegnes flatt, 64 enheter per rute i bredden, origo øverst til venstre.
import { iso, poly, box, cyl, cone } from '../../app/room/iso';
import { f1, flame, fv, rectF, at, fr, WOODD, DARKL, STONED, GOLD } from '../kritisk/room';
import type { RoomItem, Level, Placement } from '../types';

export const RED = ['#d64b3c', '#b23a2e', '#8f2d24'], GREEN = ['#3f9a63', '#2e7d4f', '#22603c'], WHITE = ['#f6f3ec', '#ddd6c8', '#c4bcae'],
  GINGER = ['#c98a4b', '#a86d36', '#8a5628'], PINE = ['#3d8a55', '#2f7045', '#245736'], VIOLET = ['#9b7fd0', '#7c61b3', '#614a92'];
const GOLDB = ['#ffe18f', '#e3ad33', '#c9962a'];

/** Sukkerglasur: en bølget hvit strek. */
function icing(x0: number, x1: number, y: number, k = 3) {
  let d = 'M' + x0 + ',' + y;
  for (let x = x0; x < x1; x += k * 2) d += 'q' + k / 2 + ',' + k + ' ' + k + ',0q' + k / 2 + ',' + -k + ' ' + k + ',0';
  return '<path d="' + d + '" style="fill:none;stroke:#fffaf0;stroke-width:1.6;stroke-linecap:round"/>';
}
const ball = (x: number, y: number, r: number, c: string) => '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" style="fill:' + c + '"/><circle cx="' + f1(x - r * .35) + '" cy="' + f1(y - r * .35) + '" r="' + f1(r * .3) + '" style="fill:#fff;opacity:.55"/>';
/** Femtakket stjerne med sentrum (x, y) og radius r. */
export function star(x: number, y: number, r: number, c = '#ffd25a', extra = '') {
  let d = '';
  for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * .45 : r; d += (i ? 'L' : 'M') + f1(x + rr * Math.cos(a)) + ',' + f1(y + rr * Math.sin(a)); }
  return '<path d="' + d + 'Z" style="fill:' + c + extra + '"/>';
}
/** Gran i tre lag. h = høyde over gulvet. */
export function tree(h: number, w: number, deco = true) {
  let s = cyl(.08, 0, h * .12, ['#7a5230', '#5a3c22']);
  const L = 3;
  for (let i = 0; i < L; i++) {
    const y0 = -(h * .12 + i * h * .26), y1 = y0 - h * .42, ww = w * (1 - i * .26);
    s += '<path d="M' + -ww + ',' + f1(y0) + 'Q0,' + f1(y0 + 6) + ' ' + ww + ',' + f1(y0) + 'L0,' + f1(y1) + 'Z" style="fill:' + PINE[i % 2] + '"/>' +
      '<path d="M0,' + f1(y1) + 'L' + ww + ',' + f1(y0) + 'Q' + f1(ww / 2) + ',' + f1(y0 + 4) + ' 0,' + f1(y0 + 5) + 'Z" style="fill:' + PINE[2] + ';opacity:.5"/>';
    if (deco) s += ball(f1(-ww * .55), f1(y0 - 3), 2.6, i % 2 ? '#e3ad33' : '#d64b3c') + ball(f1(ww * .35), f1(y0 - 6), 2.4, i % 2 ? '#d64b3c' : '#6fb3e0') + ball(f1(ww * .05), f1(y0 - 12), 2.2, '#f6f3ec');
  }
  return s + (deco ? star(0, f1(-(h * .12 + 2 * h * .26 + h * .42) - 2), 6) : '');
}
function gift(a: number, b: number, z0: number, h: number, c: string[], ribbon: string, cu = 0, cv = 0) {
  return box(a, b, z0, h, c, cu, cv) + poly([iso(cu - a, cv - .04, z0 + h), iso(cu + a, cv - .04, z0 + h), iso(cu + a, cv + .04, z0 + h), iso(cu - a, cv + .04, z0 + h)], ribbon) +
    poly([iso(cu - .04, cv - b, z0 + h), iso(cu + .04, cv - b, z0 + h), iso(cu + .04, cv + b, z0 + h), iso(cu - .04, cv + b, z0 + h)], ribbon) +
    fv(cu - .04, cu + .04, cv + b, z0, z0 + h, ribbon);
}

/* ---------- møbler ---------- */
function dSofa() {
  return box(1.45, .45, 0, 9, RED) + box(1.45, .14, 9, 26, RED, 0, -.31) + box(.13, .45, 9, 13, RED, -1.32, 0) +
    box(1.18, .32, 9, 6, ['#e86a5a', '#cc5244', '#a8433a'], 0, .06) + box(.22, .09, 15, 15, WHITE, -.8, -.12) + box(.22, .09, 15, 15, GREEN, .7, -.12) + box(.13, .45, 9, 13, RED, 1.32, 0) +
    poly([iso(-.2, -.3, 35), iso(.6, -.3, 35), iso(.6, -.3, 24), iso(-.2, -.3, 24)], '#2e7d4f') + poly([iso(-.2, -.3, 31), iso(.6, -.3, 31), iso(.6, -.3, 29), iso(-.2, -.3, 29)], '#f6f3ec');
}
function dLenestol() {
  return box(.42, .42, 0, 9, GREEN) + box(.42, .12, 9, 30, GREEN, 0, -.3) + box(.1, .42, 9, 15, GREEN, -.32, 0) +
    box(.22, .3, 9, 5, ['#55b07a', '#3f9a63', '#2e7d4f'], 0, .04) + box(.1, .42, 9, 15, GREEN, .32, 0) +
    poly([iso(-.1, -.2, 40), iso(.3, -.2, 40), iso(.3, .3, 15), iso(-.1, .3, 15)], '#d64b3c') + poly([iso(-.1, .08, 26), iso(.3, .08, 26), iso(.3, .14, 24), iso(-.1, .14, 24)], '#f6f3ec');
}
function dBord() {
  let legs = '';
  [[-.8, -.3], [.8, -.3], [-.8, .3], [.8, .3]].sort((a, b) => (a[0] + a[1]) - (b[0] + b[1])).forEach((q) => { legs += box(.05, .05, 0, 12, DARKL, q[0], q[1]); });
  return legs + box(.9, .4, 12, 3, WOODD) + rectF(.6, .14, 15.2, '#d64b3c') +
    at(-22, -15, cyl(.05, 0, 12, WHITE) + flame(-12)) + at(-10, -16, cyl(.05, 0, 9, WHITE) + flame(-9)) +
    at(14, -16, '<ellipse cx="0" cy="0" rx="12" ry="5" style="fill:#e3ad33"/><path d="M-8,-1h5v-4h-5zM-1,-2h5v-4h-5zM5,-1h4v-3h-4z" style="fill:#c98a4b"/><path d="M-8,-5h5M-1,-6h5" style="stroke:#fffaf0;stroke-width:1"/>');
}
function dHylle() {
  let s = box(.95, .26, 0, 72, WOODD) + fv(-.86, .86, .26, 4, 68, '#24180f');
  const bk = ['#d64b3c', '#2e7d4f', '#e3ad33', '#614a92', '#f6f3ec', '#3a6fa0', '#a86d36'];
  for (let r = 0; r < 3; r++) {
    const z = 6 + r * 21; let u = -.8, i = 0;
    s += fv(-.9, .9, .26, z - 2, z, '#6b4c34');
    while (u < .72) {
      const w = .09 + ((r * 3 + i) % 3) * .03, h = 12 + ((i * 5 + r * 3) % 4) * 2;
      if (r === 1 && i === 3) { s += at(f1(iso(u + .08, .26, 0)[0]), f1(iso(u + .08, .26, z)[1]), '<path d="M-5,0L0,-14L5,0Z" style="fill:#d64b3c"/><circle cx="0" cy="-14" r="1.6" style="fill:#fff"/><circle cx="0" cy="-4" r="3" style="fill:#f1c9a5"/><path d="M-3,-1q3,5 6,0" style="fill:#fff"/>'); u += .2; i++; continue; }
      s += fv(u, u + w, .26, z, z + h, bk[(i + r * 2) % bk.length]); u += w + .01; i++;
    }
  }
  return s;
}
function dPeis() {
  const BR = ['#c0644a', '#a4513b', '#86412f'];
  let s = box(1, .3, 0, 50, BR) + box(1.1, .36, 50, 5, WHITE) + fv(-.55, .55, .3, 3, 34, '#2a1a12') +
    '<g>' + at(f1(iso(0, .3, 0)[0]), f1(iso(0, .3, 6)[1]), '<path d="M-14,0q4,-10 8,-4q2,-14 8,-2q4,-8 6,4z" style="fill:#f08a24"/><path d="M-8,0q3,-6 5,-2q2,-8 5,0z" style="fill:#ffd25a"/><path d="M-16,2h32" style="stroke:#5a3c22;stroke-width:3"/>') + '</g>';
  for (let i = 0; i < 3; i++) {
    const p = iso(-.7 + i * .7, .36, 48);
    s += at(f1(p[0]), f1(p[1]), '<path d="M-4,0v12q0,5 5,5h5v-6h-4v-11z" style="fill:' + ['#d64b3c', '#2e7d4f', '#d64b3c'][i] + '"/><path d="M-5,0h10v3h-10z" style="fill:#f6f3ec"/>');
  }
  const g = iso(0, .36, 62);
  return s + at(f1(g[0]), f1(g[1]), '<path d="M-26,0q26,-10 52,0" style="fill:none;stroke:#2f7045;stroke-width:5;stroke-linecap:round"/>' + ball(-14, -2, 2, '#d64b3c') + ball(0, -5, 2, '#e3ad33') + ball(14, -2, 2, '#d64b3c'));
}
function dJuletre() { return gift(.22, .16, 0, 8, RED, '#e3ad33', -.25, .2) + tree(78, 26) + gift(.16, .16, 0, 6, ['#6fb3e0', '#4f93c0', '#3a76a0'], '#f6f3ec', .28, .25); }
function dLampe() {
  return cyl(.2, 0, 4, GOLD) + cyl(.03, 4, 6, GOLD) + '<path d="M-17,-10h34l-3,4h-28z" style="fill:#c9962a"/>' +
    [-12, -4, 4, 12].map((x, i) => at(x, -14, '<rect x="-2" y="' + (-8 - i * 0) + '" width="4" height="8" style="fill:#f6f3ec"/>' + (i < 2 ? flame(-8) : ''))).join('') +
    '<path d="M-18,-6q18,6 36,0" style="fill:none;stroke:#2f7045;stroke-width:3"/>';
}
function dPlante() {
  let s = cyl(.2, 0, 14, ['#c0644a', '#a4513b']) + '<path d="M-9,-14V-22M0,-14V-26M8,-14V-21" style="stroke:#2f7045;stroke-width:2"/>';
  const leaf = (x: number, y: number, r: number, c: string) => '<path d="M' + x + ',' + y + 'q-3,-9 0,-14q3,5 0,14z" transform="rotate(' + r + ' ' + x + ' ' + y + ')" style="fill:' + c + '"/>';
  for (let i = 0; i < 6; i++) s += leaf(0, -26, i * 60, '#2f7045');
  for (let i = 0; i < 6; i++) s += leaf(0, -26, i * 60 + 30, '#d64b3c');
  return s + '<circle cx="0" cy="-26" r="2.2" style="fill:#ffd25a"/>';
}
function dPuff() { return gift(.32, .32, 0, 16, GREEN, '#d64b3c') + '<path d="M0,-28c-8,-8 -12,0 0,0c12,0 8,-8 0,0" style="fill:none;stroke:#d64b3c;stroke-width:2.6"/>'; }
function dMeditasjon() {
  return cyl(.36, 0, 6, ['#b39ddb', '#9575cd']) + '<ellipse cx="0" cy="-6" rx="13" ry="6.5" style="fill:#c5b3e6"/><circle cx="0" cy="-6" r="2.2" style="fill:#7e57c2"/>' +
    at(16, -2, cyl(.06, 0, 4, ['#a1887f', '#795548']) + '<path d="M0,-4V-22" style="stroke:#6d4c41;stroke-width:1.2"/><path d="M0,-24c-3,-4 3,-6 0,-10M0,-30c3,-3 -2,-6 1,-9" style="fill:none;stroke:#cfc6dc;stroke-width:1.2;opacity:.8"/>');
}
function dTeppeA() {
  let s = rectF(1.5, 1, 1, '#8f2d24') + rectF(1.36, .86, 1, '#b23a2e');
  for (let i = -3; i <= 3; i++) for (let j = -1; j <= 1; j++) { const c = iso(i * .38, j * .5, 1); s += '<path d="M' + f1(c[0]) + ',' + f1(c[1] - 4) + 'l2,4 -2,4 -2,-4z" style="fill:' + ((i + j) % 2 ? '#f6f3ec' : '#3f9a63') + '"/>'; }
  return s;
}
function dTeppeB() {
  let s = '<ellipse cx="0" cy="0" rx="86" ry="43" style="fill:#614a92"/><ellipse cx="0" cy="0" rx="76" ry="38" style="fill:#7c61b3"/>';
  for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; s += '<ellipse cx="' + f1(Math.cos(a) * 48) + '" cy="' + f1(Math.sin(a) * 24) + '" rx="12" ry="6" transform="rotate(' + f1(a * 180 / Math.PI) + ' ' + f1(Math.cos(a) * 48) + ' ' + f1(Math.sin(a) * 24) + ')" style="fill:#b39ddb"/>'; }
  return s + '<ellipse cx="0" cy="0" rx="26" ry="13" style="fill:#e3ad33"/><ellipse cx="0" cy="0" rx="12" ry="6" style="fill:#fff3c4"/>';
}
function dTeppeC() {
  let s = rectF(.42, 1.5, 1, '#2e7d4f');
  for (let i = 0; i < 6; i++) s += poly([iso(-.42, -1.45 + i * .5, 1), iso(.42, -1.45 + i * .5, 1), iso(.42, -1.4 + i * .5, 1), iso(-.42, -1.4 + i * .5, 1)], '#22603c');
  return s + poly([iso(-.42, 1.2, 1), iso(.42, 1.2, 1), iso(.42, 1.5, 1), iso(-.42, 1.5, 1)], '#3f9a63');
}

/* ---------- veggpynt ---------- */
const snow = (a: number[][]) => a.map((q) => '<circle cx="' + q[0] + '" cy="' + q[1] + '" r="' + (q[2] || 1.2) + '" style="fill:#fff"/>').join('');
function dVinter() {
  return fr(128, 56, '<path d="M4,52V36c20,-10 40,-12 60,-4s40,6 60,-2V52z" style="fill:#f4f7fb"/>' +
    at(30, 44, tree(30, 9, false)) + at(44, 46, tree(22, 7, false)) + at(100, 42, tree(28, 9, false)) +
    '<path d="M64,40h18v10h-18z" style="fill:#c0644a"/><path d="M61,41l12,-9 12,9z" style="fill:#f4f7fb"/><rect x="70" y="43" width="5" height="5" style="fill:#ffd25a"/>' +
    snow([[12, 10], [26, 18], [50, 8], [84, 14], [110, 10], [118, 24], [60, 22]]), '#9cc3e4');
}
function dNordlys() {
  return fr(128, 60, '<path d="M4,30C30,4 56,40 80,14S118,20 124,8V30C100,40 80,30 60,40S20,36 4,46Z" style="fill:#5ce0a5;opacity:.55"/>' +
    '<path d="M4,22C34,8 60,28 90,10S120,14 124,4" style="fill:none;stroke:#b8f5d4;stroke-width:2;opacity:.7"/>' + snow([[14, 8, 1], [40, 12, .8], [70, 6, 1], [110, 30, .8], [96, 22, 1]]) +
    '<path d="M4,56V46l20,-12 16,10 24,-16 22,14 18,-10 20,14V56z" style="fill:#16223f"/><path d="M60,32l4,-4 4,4M84,40l2,-2 2,2" style="stroke:#f4f7fb;stroke-width:2"/>', '#0f1a36');
}
function dKrans() {
  let s = '<circle cx="32" cy="32" r="22" style="fill:none;stroke:#2f7045;stroke-width:12"/>';
  for (let i = 0; i < 16; i++) { const a = i * Math.PI / 8; s += '<path d="M' + f1(32 + Math.cos(a) * 22) + ',' + f1(32 + Math.sin(a) * 22) + 'l4,-3" style="stroke:#3f9a63;stroke-width:3;stroke-linecap:round"/>'; }
  [0.4, 1.6, 2.8, 4, 5.2].forEach((a, i) => { s += ball(f1(32 + Math.cos(a) * 22), f1(32 + Math.sin(a) * 22), 3, i % 2 ? '#e3ad33' : '#d64b3c'); });
  return s + '<path d="M26,52l6,-6 6,6M32,46l-4,10M32,46l4,10" style="fill:none;stroke:#d64b3c;stroke-width:3;stroke-linecap:round"/>';
}
export const ZSYM = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];
function zodiacWheel(cx: number, cy: number, r: number, ink: string) {
  let s = '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" style="fill:none;stroke:' + ink + ';stroke-width:1.6"/><circle cx="' + cx + '" cy="' + cy + '" r="' + f1(r * .62) + '" style="fill:none;stroke:' + ink + ';stroke-width:1.2"/>';
  for (let i = 0; i < 12; i++) {
    const a = i * Math.PI / 6 - Math.PI / 2, b = a + Math.PI / 12;
    s += '<path d="M' + f1(cx + Math.cos(a) * r * .62) + ',' + f1(cy + Math.sin(a) * r * .62) + 'L' + f1(cx + Math.cos(a) * r) + ',' + f1(cy + Math.sin(a) * r) + '" style="stroke:' + ink + ';stroke-width:1"/>' +
      '<text x="' + f1(cx + Math.cos(b) * r * .81) + '" y="' + f1(cy + Math.sin(b) * r * .81 + r * .07) + '" text-anchor="middle" style="font:' + f1(r * .2) + 'px \'DejaVu Sans\',\'Segoe UI Symbol\',sans-serif;fill:' + ink + '">' + ZSYM[i] + '︎</text>';
  }
  return s;
}
function dStjernetegn() {
  return fr(128, 60, zodiacWheel(64, 30, 25, '#ffd25a') + '<circle cx="64" cy="30" r="8" style="fill:#ffd25a"/><path d="M64,22a8,8 0 0 0 0,16a5,8 0 0 1 0,-16z" style="fill:#1c2450"/>' + snow([[14, 12, 1], [24, 44, .8], [104, 14, 1], [116, 46, .8]]), '#1c2450');
}
function dKalender() {
  let s = '';
  for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) { const n = r * 4 + c + 1; s += '<rect x="' + (9 + c * 12) + '" y="' + (13 + r * 11) + '" width="10" height="9" rx="1.5" style="fill:' + (n % 3 ? '#f6f3ec' : '#ffd25a') + '"/><text x="' + (14 + c * 12) + '" y="' + (20 + r * 11) + '" text-anchor="middle" style="font:700 5.5px system-ui,sans-serif;fill:#8f2d24">' + n + '</text>'; }
  return fr(64, 64, s + '<path d="M8,9h48" style="stroke:#2f7045;stroke-width:3"/>', '#c0392b');
}
function dDrommefanger() {
  let s = '<path d="M32,2v6" style="stroke:#8a5628;stroke-width:1.4"/><circle cx="32" cy="24" r="16" style="fill:none;stroke:#a86d36;stroke-width:2.6"/>';
  for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; s += '<path d="M32,24L' + f1(32 + Math.cos(a) * 16) + ',' + f1(24 + Math.sin(a) * 16) + '" style="stroke:#e9dcc6;stroke-width:.8"/>'; }
  s += '<circle cx="32" cy="24" r="9" style="fill:none;stroke:#e9dcc6;stroke-width:.8"/><circle cx="32" cy="24" r="2.4" style="fill:#7c61b3"/>';
  [20, 32, 44].forEach((x, i) => { s += '<path d="M' + x + ',' + (36 + (i % 2) * 3) + 'V' + (46 + (i % 2) * 6) + '" style="stroke:#8a5628;stroke-width:1"/><path d="M' + x + ',' + (46 + (i % 2) * 6) + 'q-4,6 0,12q4,-6 0,-12z" style="fill:' + ['#d64b3c', '#f6f3ec', '#3f9a63'][i] + '"/>'; });
  return s;
}

/* ---------- trofeer, nivå 1–8 ---------- */
function dSnomann() {
  return '<ellipse cx="0" cy="-12" rx="15" ry="13" style="fill:#f6f3ec"/><ellipse cx="0" cy="-32" rx="11" ry="10" style="fill:#fff"/><circle cx="0" cy="-48" r="8" style="fill:#fff"/>' +
    '<circle cx="-3" cy="-50" r="1.2" style="fill:#1e1a24"/><circle cx="3" cy="-50" r="1.2" style="fill:#1e1a24"/><path d="M0,-47l7,1.5 -7,1.5z" style="fill:#f08a24"/>' +
    '<path d="M-10,-41q10,5 20,0v4q-10,4 -20,0z" style="fill:#d64b3c"/><path d="M7,-39v10" style="stroke:#d64b3c;stroke-width:4"/>' +
    '<path d="M-8,-56h16l-2,-10h-12z" style="fill:#1e1a24"/><path d="M-11,-56h22" style="stroke:#1e1a24;stroke-width:3"/>' +
    '<circle cx="0" cy="-34" r="1.4" style="fill:#1e1a24"/><circle cx="0" cy="-28" r="1.4" style="fill:#1e1a24"/><path d="M-11,-34l-10,-8M11,-34l10,-8" style="stroke:#6d4c41;stroke-width:2;stroke-linecap:round"/>';
}
function dKrystall() {
  return '<ellipse cx="0" cy="-2" rx="16" ry="7" style="fill:#5f676e"/>' +
    '<path d="M-6,-4L-10,-28L-5,-38L0,-28L-2,-4Z" style="fill:#b39ddb"/><path d="M-5,-38L0,-28L-2,-4L-3,-4Z" style="fill:#7e57c2"/>' +
    '<path d="M0,-4L2,-36L8,-48L14,-36L10,-4Z" style="fill:#c5b3e6"/><path d="M8,-48L14,-36L10,-4L7,-4Z" style="fill:#9575cd"/>' +
    '<path d="M-14,-3L-16,-18L-12,-24L-9,-18L-8,-3Z" style="fill:#9575cd"/><path d="M4,-38l2,-6" style="stroke:#fff;stroke-width:1.4;opacity:.7"/>';
}
function dSnofnugg() {
  let s = '';
  for (let i = 0; i < 6; i++) s += '<g transform="rotate(' + i * 60 + ' 32 32)"><path d="M32,32V8M32,16l-6,-6M32,16l6,-6M32,24l-4,-4M32,24l4,-4" style="fill:none;stroke:#cfe8fb;stroke-width:2.6;stroke-linecap:round"/></g>';
  return fr(64, 64, s + '<circle cx="32" cy="32" r="3.4" style="fill:#fff"/>', '#2b4f86');
}
function dPepperkakehus() {
  return box(.4, .32, 0, 22, GINGER) + poly([iso(-.46, -.38, 22), iso(.46, -.38, 22), iso(.46, 0, 42), iso(-.46, 0, 42)], '#f6f3ec') +
    poly([iso(-.46, 0, 42), iso(.46, 0, 42), iso(.46, .38, 22), iso(-.46, .38, 22)], '#ece4d6') +
    poly([iso(.46, -.38, 22), iso(.46, .38, 22), iso(.46, 0, 42)], '#8a5628') + fv(-.1, .1, .32, 0, 10, '#5a3c22') +
    poly([iso(.4, -.2, 16), iso(.4, -.04, 16), iso(.4, -.04, 9), iso(.4, -.2, 9)], '#ffd25a') + poly([iso(-.3, .32, 18), iso(-.16, .32, 18), iso(-.16, .32, 12), iso(-.3, .32, 12)], '#ffd25a') +
    at(f1(iso(-.3, .38, 0)[0]), f1(iso(-.3, .38, 23)[1]), icing(-8, 14, 0, 2.5)) + ball(f1(iso(0, 0, 42)[0]), f1(iso(0, 0, 42)[1]) - 2, 2.4, '#d64b3c');
}
function dKule() {
  return box(.24, .24, 0, 6, ['#6d4c41', '#5d4037', '#4e342e']) + cyl(.12, 6, 3, GOLD) +
    '<circle cx="0" cy="-25" r="15" style="fill:rgba(170,200,255,.75)"/>' + snowBall() +
    '<ellipse cx="-6" cy="-32" rx="5" ry="2.6" transform="rotate(-30 -6 -32)" style="fill:#fff;opacity:.6"/>';
}
function snowBall() { return '<path d="M-12,-18q12,4 24,0a15,15 0 0 1 -24,0z" style="fill:#fff"/>' + at(0, -18, tree(14, 5, false)) + snow([[-6, -30, .8], [5, -34, .8], [8, -24, .7], [-9, -24, .7]]); }
function dStjernetegnMini() { return fr(64, 64, zodiacWheel(32, 32, 24, '#ffd25a') + star(32, 32, 7), '#1c2450'); }
function dNisse() {
  return '<ellipse cx="0" cy="-2" rx="11" ry="5" style="fill:#5a3c22"/><path d="M-11,-2Q-12,-24 0,-26Q12,-24 11,-2Z" style="fill:#7a8590"/>' +
    '<circle cx="0" cy="-30" r="8" style="fill:#f1c9a5"/><path d="M-8,-29q8,16 16,0q-2,8 -8,10q-6,-2 -8,-10z" style="fill:#f6f3ec"/>' +
    '<path d="M-9,-32Q-6,-56 10,-48L9,-32Z" style="fill:#d64b3c"/><circle cx="10" cy="-48" r="3" style="fill:#f6f3ec"/><path d="M-10,-32h20" style="stroke:#f6f3ec;stroke-width:3;stroke-linecap:round"/>' +
    '<circle cx="-3" cy="-31" r="1" style="fill:#1e1a24"/><circle cx="3" cy="-31" r="1" style="fill:#1e1a24"/><circle cx="0" cy="-28" r="1.6" style="fill:#e58a8a"/>';
}
function dTarot() {
  const card = (r: number, x: number, fill: string, sym: string) => '<g transform="translate(' + x + ' -4) rotate(' + r + ')"><rect x="-8" y="-28" width="16" height="26" rx="2" style="fill:#f6f3ec;stroke:#c9962a;stroke-width:1.2"/><rect x="-5.5" y="-25" width="11" height="20" style="fill:' + fill + '"/>' + sym + '</g>';
  return box(.34, .24, 0, 5, ['#7c61b3', '#614a92', '#4e3a78']) +
    card(-18, -10, '#1c2450', star(0, -15, 4)) + card(0, 0, '#614a92', '<circle cx="0" cy="-15" r="4" style="fill:#f6f3ec"/><circle cx="1.6" cy="-16" r="3.4" style="fill:#614a92"/>') + card(18, 10, '#d64b3c', '<circle cx="0" cy="-15" r="4" style="fill:#ffd25a"/>');
}
function dYinyang() {
  return fr(64, 64, '<circle cx="32" cy="32" r="22" style="fill:#f6f3ec;stroke:#1e1a24;stroke-width:1.6"/><path d="M32,10a22,22 0 0 1 0,44a11,11 0 0 1 0,-22a11,11 0 0 0 0,-22z" style="fill:#1e1a24"/>' +
    '<circle cx="32" cy="21" r="3.4" style="fill:#1e1a24"/><circle cx="32" cy="43" r="3.4" style="fill:#f6f3ec"/>', '#e8dfd0');
}
function dRein() {
  return '<path d="M-14,-4V-18M-8,-4V-17M8,-4V-18M14,-4V-17" style="stroke:#6d4c41;stroke-width:3;stroke-linecap:round"/>' +
    '<ellipse cx="0" cy="-22" rx="18" ry="8" style="fill:#a1887f"/><path d="M12,-26l6,-14 6,2 -4,14z" style="fill:#a1887f"/><ellipse cx="21" cy="-40" rx="6" ry="4.5" style="fill:#a1887f"/>' +
    '<circle cx="27" cy="-39" r="2.4" style="fill:#d64b3c"/><circle cx="19" cy="-42" r="1" style="fill:#1e1a24"/>' +
    '<path d="M18,-44c-2,-6 -6,-10 -10,-12M14,-50l-4,2M22,-44c2,-6 2,-10 6,-14M26,-54l4,0" style="fill:none;stroke:#5d4037;stroke-width:2;stroke-linecap:round"/>' +
    '<path d="M10,-28h8" style="stroke:#d64b3c;stroke-width:3"/><circle cx="14" cy="-26" r="2" style="fill:#ffd25a"/><ellipse cx="-16" cy="-22" rx="3" ry="2.4" style="fill:#f6f3ec"/>';
}
function dTromme() {
  return '<path d="M-3,0L-6,-10M3,0L6,-10" style="stroke:#6d4c41;stroke-width:2.6"/>' +
    '<ellipse cx="0" cy="-28" rx="17" ry="19" style="fill:#e9dcc6;stroke:#8a5628;stroke-width:3"/>' +
    '<path d="M0,-46V-10M-16,-28H16" style="stroke:#a4513b;stroke-width:1.4"/><circle cx="0" cy="-28" r="5" style="fill:none;stroke:#a4513b;stroke-width:1.6"/>' +
    '<path d="M0,-33V-38M0,-23V-18M-5,-28H-10M5,-28H10" style="stroke:#a4513b;stroke-width:1.6"/>' +
    '<path d="M-9,-40l2,4 2,-4M6,-18l2,3 2,-3M-10,-18l2,3 2,-3M6,-40l2,4 2,-4" style="fill:none;stroke:#a4513b;stroke-width:1.2"/>' +
    '<path d="M14,-6L26,-20" style="stroke:#6d4c41;stroke-width:2.6;stroke-linecap:round"/><ellipse cx="27" cy="-21" rx="3" ry="2.4" style="fill:#a1887f"/>';
}
function dManefaser() {
  let s = '';
  [[16, 0], [40, .35], [64, 1], [88, .65], [112, 0]].forEach(([x, k], i) => {
    s += '<circle cx="' + x + '" cy="28" r="9" style="fill:#f6e7a8"/>';
    if (i !== 2) s += '<circle cx="' + f1(x + (i < 2 ? -1 : 1) * (6 + 12 * k)) + '" cy="28" r="9" style="fill:#1c2450"/>';
  });
  return fr(128, 56, s + snow([[28, 12, .8], [52, 46, .8], [76, 10, 1], [100, 44, .8]]), '#1c2450');
}
function dLucia() {
  return '<path d="M-10,0Q-12,-26 0,-28Q12,-26 10,0Z" style="fill:#fff"/><path d="M-9,-14h18" style="stroke:#d64b3c;stroke-width:3"/>' +
    '<circle cx="0" cy="-33" r="7" style="fill:#f1c9a5"/><path d="M-7,-34q0,-9 7,-9q7,0 7,9q-2,-6 -7,-6q-5,0 -7,6z" style="fill:#e3b04a"/>' +
    '<path d="M-9,-40q9,-4 18,0" style="fill:none;stroke:#2f7045;stroke-width:3"/>' + [-7, 0, 7].map((x) => at(x, -42, '<rect x="-1.2" y="-6" width="2.4" height="6" style="fill:#fff"/>' + flame(-6))).join('') +
    at(9, -16, '<rect x="-1.4" y="-8" width="2.8" height="8" style="fill:#fff"/>' + flame(-8));
}
function dMeditasjonsfigur() {
  return cyl(.32, 0, 5, ['#c5b3e6', '#9575cd']) +
    '<path d="M-16,-7Q-16,-14 -8,-14H8Q16,-14 16,-7Z" style="fill:#e3ad33"/><path d="M-9,-14Q-10,-30 0,-32Q10,-30 9,-14Z" style="fill:#e3ad33"/>' +
    '<circle cx="0" cy="-38" r="7" style="fill:#f1c46a"/><path d="M-3,-38h2M1,-38h2" style="stroke:#8a5628;stroke-width:1"/><path d="M-2,-35q2,1.4 4,0" style="fill:none;stroke:#8a5628;stroke-width:1"/>' +
    '<path d="M-6,-16q6,4 12,0" style="fill:none;stroke:#c9962a;stroke-width:1.6"/><circle cx="0" cy="-46" r="2.6" style="fill:#f1c46a"/>';
}
function dKarma() {
  const st = (x: number, y: number, rx: number, ry: number, c: string) => '<ellipse cx="' + x + '" cy="' + y + '" rx="' + rx + '" ry="' + ry + '" style="fill:' + c + '"/>';
  return fr(64, 64, st(32, 50, 22, 8, '#2a2630') + st(32, 37, 16, 6.5, '#3a3540') + st(32, 26, 11, 5, '#2a2630') +
    '<text x="32" y="40" text-anchor="middle" style="font:700 7px system-ui,sans-serif;fill:#e9e4f0;letter-spacing:.5px">KARMA</text>', '#d8e6dc');
}
function dStjernelykt() {
  return cyl(.12, 0, 3, DARKL) + cyl(.02, 3, 30, ['#a3b0b9', '#6c7a85']) + star(0, -48, 15, '#ffd25a', ';stroke:#e3ad33;stroke-width:1.4') + star(0, -48, 7, '#fff3c4');
}
function dHealing() {
  return box(.36, .26, 0, 4, ['#e9dcc6', '#d4c4a8', '#bba98b']) +
    at(-12, -6, '<path d="M-4,0L-5,-14L0,-20L5,-14L4,0Z" style="fill:#80cbc4"/><path d="M0,-20L5,-14L4,0L1,0Z" style="fill:#4db6ac"/>') +
    at(2, -8, '<path d="M-3,0L-4,-10L0,-15L4,-10L3,0Z" style="fill:#f48fb1"/>') + at(13, -6, '<path d="M-4,0L-5,-12L0,-18L5,-12L4,0Z" style="fill:#b39ddb"/>') +
    '<path d="M-18,-2a6,6 0 0 1 12,0" style="fill:none;stroke:#d64b3c;stroke-width:3"/><path d="M-18,-2h3M-9,-2h3" style="stroke:#9aa3ab;stroke-width:3"/>';
}
function dEngel() {
  return fr(64, 64, '<path d="M32,30C16,18 6,28 10,40C18,38 24,36 30,36ZM32,30C48,18 58,28 54,40C46,38 40,36 34,36Z" style="fill:#fff"/>' +
    '<path d="M24,58L32,28L40,58Z" style="fill:#f6f3ec;stroke:#e3d8c4;stroke-width:1"/><circle cx="32" cy="24" r="6" style="fill:#f1c9a5"/>' +
    '<ellipse cx="32" cy="15" rx="7" ry="2.2" style="fill:none;stroke:#ffd25a;stroke-width:2"/>' + snow([[10, 10, 1], [54, 12, 1], [50, 52, .8]]), '#8fb2d9');
}
function dGoetheanum() {
  return box(.44, .34, 0, 16, ['#e8e0d0', '#cfc4ae', '#b5a990']) +
    '<path d="M-26,-26Q-24,-46 0,-50Q24,-46 26,-26Q14,-22 0,-21Q-14,-22 -26,-26Z" style="fill:#c9bda5"/><path d="M0,-50Q24,-46 26,-26Q14,-22 0,-21Z" style="fill:#b5a990"/>' +
    '<path d="M-6,-6v-8q6,-4 12,0v8" style="fill:#7d6a56"/><path d="M-20,-14h6v-5h-6zM14,-14h6v-5h-6z" style="fill:#7d6a56"/>';
}
function dGaver() {
  return gift(.3, .28, 0, 14, RED, '#e3ad33', -.12, .08) + gift(.22, .22, 14, 12, GREEN, '#f6f3ec', -.1, .06) + gift(.14, .14, 26, 9, ['#6fb3e0', '#4f93c0', '#3a76a0'], '#d64b3c', -.08, .04) +
    gift(.16, .16, 0, 10, ['#ffe18f', '#e3ad33', '#c9962a'], '#d64b3c', .36, .2);
}
function dKanal() {
  return fr(64, 64, '<path d="M14,52V22a18,18 0 0 1 36,0V52z" style="fill:#2b3566"/>' +
    '<path d="M22,46h20M22,40h20M22,34h14" style="stroke:#f6e7a8;stroke-width:2;stroke-linecap:round;opacity:.85"/>' +
    '<path d="M32,8c-6,6 -6,10 0,14c6,-4 6,-8 0,-14z" style="fill:#fff;opacity:.9"/><path d="M24,14q-6,-2 -8,4M40,14q6,-2 8,4" style="fill:none;stroke:#fff;stroke-width:1.6;opacity:.7"/>' +
    snow([[10, 12, 1], [54, 10, 1], [52, 30, .8]]), '#1c2450');
}
function dPokal() {
  return box(.4, .4, 0, 9, DARKL) + box(.26, .26, 9, 5, DARKL) + cyl(.17, 14, 4, GOLD) + cyl(.05, 18, 10, GOLD) +
    '<path d="M-17,-42c-11,0-12,10-5,14M17,-42c11,0 12,10 5,14" style="fill:none;stroke:#e3ad33;stroke-width:3;stroke-linecap:round"/>' +
    '<path d="M-17,-45C-17,-33 -9,-29 0,-27C9,-29 17,-33 17,-45Z" style="fill:#e3ad33"/><ellipse cx="0" cy="-45" rx="17" ry="5" style="fill:#ffe18f"/>';
}
function dGpokal() { return dPokal() + star(0, -58, 11, '#ffd25a', ';stroke:#c9962a;stroke-width:1.2'); }
function dJuletarn() { return gift(.36, .36, 0, 14, RED, '#e3ad33') + gift(.28, .28, 14, 12, GREEN, '#f6f3ec') + gift(.2, .2, 26, 10, WHITE, '#d64b3c') + gift(.12, .12, 36, 8, ['#ffe18f', '#e3ad33', '#c9962a'], '#d64b3c') + star(0, -54, 7); }
function dMedalje() {
  return '<path d="M22,4L28,26M42,4L36,26" style="stroke:#d64b3c;stroke-width:6"/><path d="M22,4L28,26" style="stroke:#2f7045;stroke-width:2"/>' +
    '<circle cx="32" cy="40" r="16" style="fill:#e3ad33;stroke:#c9962a;stroke-width:3"/>' + star(32, 40, 9, '#fff3c4');
}

export const ITEMS: Record<string, RoomItem> = {
  sofa: { n: 'Julesofa', k: 'floor', w: 3, d: 1, f: dSofa, cat: 'mob', dsc: 'Rød og myk, med et grønt pledd. Her kan du slappe av etter pugginga.' },
  lenestol: { n: 'Lenestol med pledd', k: 'floor', w: 1, d: 1, f: dLenestol, cat: 'mob', dsc: 'Plass til én som leser julebøker.' },
  bord: { n: 'Julebordet', k: 'floor', w: 2, d: 1, f: dBord, cat: 'mob', dsc: 'Med levende lys og et fat pepperkaker.' },
  hylle: { n: 'Bokhylle med nisse', k: 'floor', w: 2, d: 1, f: dHylle, cat: 'mob', dsc: 'En liten nisse har gjemt seg blant bøkene. Snu hylla for å sette den mot en annen vegg.' },
  peis: { n: 'Peisen', k: 'floor', w: 2, d: 1, f: dPeis, cat: 'mob', dsc: 'Knitrende varme og tre julestrømper på rad.' },
  juletre: { n: 'Juletreet', k: 'floor', w: 1, d: 1, f: dJuletre, cat: 'mob', dsc: 'Med kuler, stjerne og gaver under.' },
  lampe: { n: 'Lysestaken', k: 'floor', w: 1, d: 1, f: dLampe, cat: 'mob', dsc: 'To lys er tent. Lys i mørketida er en gammel tradisjon.' },
  plante: { n: 'Julestjerna', k: 'floor', w: 1, d: 1, f: dPlante, cat: 'mob', dsc: 'Rød og grønn blomst i potte.' },
  puff: { n: 'Gavepuffen', k: 'floor', w: 1, d: 1, f: dPuff, cat: 'mob', dsc: 'Ser ut som en gave, men er en puff.' },
  meditasjon: { n: 'Meditasjonsputa', k: 'floor', w: 1, d: 1, f: dMeditasjon, cat: 'mob', dsc: 'En pute og en røkelsespinne. Meditasjon er hentet fra buddhismen.' },
  teppeA: { n: 'Juleteppet', k: 'rug', w: 3, d: 2, f: dTeppeA, cat: 'rug', dsc: 'Et stort rødt teppe med grønne og hvite ruter.' },
  teppeB: { n: 'Mandalateppet', k: 'rug', w: 2, d: 2, f: dTeppeB, cat: 'rug', dsc: 'Rundt teppe med et mønster som starter i midten og vokser utover.' },
  teppeC: { n: 'Yogamatta', k: 'rug', w: 1, d: 3, f: dTeppeC, cat: 'rug', dsc: 'For pusteøvelser og trening. Snu den for å legge den andre veien.' },
  vinter: { n: 'Vinterlandskapet', k: 'wall', w: 2, h: 56, f: dVinter, cat: 'art', dsc: 'Snø, granskog og en liten rød hytte.' },
  nordlys: { n: 'Nordlyset', k: 'wall', w: 2, h: 60, f: dNordlys, cat: 'art', dsc: 'Grønt lys som danser over fjellene i vinternatta.' },
  krans: { n: 'Julekransen', k: 'wall', w: 1, h: 64, f: dKrans, cat: 'art', dsc: 'Grønn krans med røde og gule kuler.' },
  stjernetegn: { n: 'Stjernetegnhjulet', k: 'wall', w: 2, h: 60, f: dStjernetegn, cat: 'art', dsc: 'Alle de tolv stjernetegnene i en sirkel. Astrologien bygger på hvordan stjernene sto da du ble født.' },
  kalender: { n: 'Julekalenderen', k: 'wall', w: 1, h: 64, f: dKalender, cat: 'art', dsc: 'Én luke om dagen fram til julaften.' },
  drommefanger: { n: 'Drømmefangeren', k: 'wall', w: 1, h: 64, f: dDrommefanger, cat: 'art', dsc: 'Henger over senga og skal fange de vonde drømmene.' },

  snomann: { n: 'Snømannen', k: 'floor', w: 1, d: 1, f: dSnomann, dsc: 'Ditt første trofé. Nyreligiøsitet er nye og alternative religiøse retninger fra de siste 150 årene.' },
  krystall: { n: 'Krystallen', k: 'floor', w: 1, d: 1, f: dKrystall, dsc: 'Mange nyreligiøse setter sammen biter fra ulike religioner til en ny helhet, som krystaller i en klynge.' },
  snofnugg: { n: 'Snøfnugget', k: 'wall', w: 1, h: 64, f: dSnofnugg, dsc: 'Ingen to snøfnugg er like. Hvert menneske må få bestemme innholdet i sin egen tro.' },
  pepperkakehus: { n: 'Pepperkakehuset', k: 'floor', w: 1, d: 1, f: dPepperkakehus, dsc: 'Sekularisering: religion har blitt mer og mer en privatsak, noe man bygger selv.' },
  kule: { n: 'Snøkula', k: 'floor', w: 1, d: 1, f: dKule, dsc: 'Rist den, og alt virvler rundt. 20–25 prosent av nordmenn tror på reinkarnasjon og astrologi.' },
  stjernetegnmini: { n: 'Horoskopet', k: 'wall', w: 1, h: 64, f: dStjernetegnMini, dsc: 'En astrolog mener å kunne si hvem du er ut fra stjernene. Stemmer det for deg?' },
  nisse: { n: 'Fjøsnissen', k: 'floor', w: 1, d: 1, f: dNisse, dsc: 'Teosofene mente det fantes skjulte visdommer og sannheter som mennesket kunne søke.' },
  tarot: { n: 'Tarotkortene', k: 'floor', w: 1, d: 1, f: dTarot, dsc: 'Kortene tolkes for å si noe om framtiden, men det er ikke sagt at den blir slik.' },
  yinyang: { n: 'Yin og yang', k: 'wall', w: 1, h: 64, f: dYinyang, dsc: 'To motstridende krefter som utfyller hverandre og skaper balanse.' },
  rein: { n: 'Reinsdyret', k: 'floor', w: 1, d: 1, f: dRein, dsc: 'Den samiske nysjamanismen oppsto i 1990-årene, inspirert av førkristen samisk religion.' },
  tromme: { n: 'Sjamantrommen', k: 'floor', w: 1, d: 1, f: dTromme, dsc: 'På trommereisen synger, danser og tromme sjamanen seg inn i transe.' },
  manefaser: { n: 'Månefasene', k: 'wall', w: 2, h: 56, f: dManefaser, dsc: 'Ritualene i wicca følger årstidene og månefasene.' },
  lucia: { n: 'Luciapiken', k: 'floor', w: 1, d: 1, f: dLucia, dsc: 'Lys i mørketida. Rudolf Steiner grunnla Antroposofisk selskap i 1913.' },
  meditasjonsfigur: { n: 'Den mediterende', k: 'floor', w: 1, d: 1, f: dMeditasjonsfigur, dsc: 'Yoga og meditasjon skal gi ro og konsentrasjon, både som trening og som åndelig praksis.' },
  karma: { n: 'Karmasteinene', k: 'wall', w: 1, h: 64, f: dKarma, dsc: 'Karma betyr «handling og handlingers resultat».' },
  stjernelykt: { n: 'Stjernelykta', k: 'floor', w: 1, d: 1, f: dStjernelykt, dsc: 'New age venter på en ny tidsalder i Vannmannens tegn, rundt år 2150.' },
  healing: { n: 'Healingkrystallene', k: 'floor', w: 1, d: 1, f: dHealing, dsc: 'Healere bruker krystaller og magneter. Finnes det dokumentert effekt? Tenk kritisk.' },
  engel: { n: 'Engelen', k: 'wall', w: 1, h: 64, f: dEngel, dsc: 'Antroposofene tror engler hjelper oss å utvikle oss før vi blir gjenfødt.' },
  goetheanum: { n: 'Goetheanum-modellen', k: 'floor', w: 1, d: 1, f: dGoetheanum, dsc: 'Hovedsetet for antroposofene, tegnet av Rudolf Steiner selv.' },
  gaver: { n: 'Gavestabelen', k: 'floor', w: 1, d: 1, f: dGaver, dsc: 'Manifestering: Kan du tenke deg til gavene du ønsker deg? Kritikerne savner innsatsen.' },
  kanal: { n: 'Budskapet', k: 'wall', w: 1, h: 64, f: dKanal, dsc: 'Noen tror de kan motta budskap fra engler, ånder og avdøde.' },
  gpokal: { n: 'Stjernepokalen', k: 'floor', w: 1, d: 1, f: dGpokal, dsc: 'Du kan forklare nyreligiøsitet med egne ord. Imponerende!' },
  juletarn: { n: 'Gavetårnet', k: 'floor', w: 1, d: 1, f: dJuletarn, dsc: 'Bit for bit, akkurat som en nyreligiøs bygger sitt eget livssyn.' },
  medalje: { n: 'Julemedaljen', k: 'wall', w: 1, h: 64, f: dMedalje, dsc: 'Belønning for innsatsen din. God jul!' },
};

export const LEVELS: Level[] = [
  { n: 'Snøfnugg', xp: 0, t: ['snomann', 'krystall', 'snofnugg'] },
  { n: 'Pepperkake', xp: 25, t: ['pepperkakehus', 'kule', 'stjernetegnmini'] },
  { n: 'Fjøsnisse', xp: 60, t: ['nisse', 'tarot', 'yinyang'] },
  { n: 'Reinsdyr', xp: 100, t: ['rein', 'tromme', 'manefaser'] },
  { n: 'Lucia', xp: 150, t: ['lucia', 'meditasjonsfigur', 'karma'] },
  { n: 'Stjernetyder', xp: 210, t: ['stjernelykt', 'healing', 'engel'] },
  { n: 'Julengel', xp: 280, t: ['goetheanum', 'gaver', 'kanal'] },
  { n: 'Julemester', xp: 360, t: ['gpokal', 'juletarn', 'medalje'] },
];

export const HOME: Record<string, Placement> = {
  sofa: { x: 2, y: 0, f: 0 }, hylle: { x: 0, y: 1, f: 1 }, peis: { x: 0, y: 3, f: 1 }, teppeA: { x: 2, y: 1, f: 0 }, bord: { x: 2, y: 2, f: 0 },
  lenestol: { x: 5, y: 1, f: 0 }, juletre: { x: 6, y: 0, f: 0 }, lampe: { x: 0, y: 5, f: 0 }, puff: { x: 4, y: 4, f: 0 },
  vinter: { wl: 'R', s: 0 }, krans: { wl: 'R', s: 3 }, kalender: { wl: 'R', s: 6 }, nordlys: { wl: 'L', s: 0 }, stjernetegn: { wl: 'L', s: 3 },
};

export { tree as drawTree, gift, ball, snow, zodiacWheel, icing, GOLDB, STONED };
