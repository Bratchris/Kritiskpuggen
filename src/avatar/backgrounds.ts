import { nordlysSVG, nordlysPixelPNG } from './scenes';
import { piratePNG } from './pirate';
import { julekveldSVG, julenattPixelPNG } from './julescenes';

// Bakgrunner bak appen. Hvert mønster er en liten SVG-flis som gjentas over hele siden.
// Pris 0 = gratis for alle. Andre kjøpes med poeng gjennom buy_skin, og prisene må stemme med skin_items
// (supabase/migrations/20261029600000_backgrounds.sql).

export type BgGroup = 'sot' | 'kul' | 'halloween' | 'jul' | 'natur' | 'pirat' | 'sesong';
export const BG_GROUPS: { id: BgGroup; name: string }[] = [
  { id: 'sot', name: 'Søte' }, { id: 'kul', name: 'Kule' }, { id: 'halloween', name: 'Halloween' }, { id: 'jul', name: 'Jul' }, { id: 'natur', name: 'Natur' }, { id: 'pirat', name: 'Piratøya' },
];
/** cover = ett stort bilde som fyller skjermen i stedet for et mønster. pixel = skarpe piksler når bildet forstørres. image = ferdig bildeadresse i stedet for SVG. */
export interface Background { id: string; group: BgGroup; name: string; price: number; color: string; size: number; tile: () => string; cover?: boolean; pixel?: boolean; image?: () => string; /** Bare til salgs i denne sesonghendelsen. */ season?: string }

const r = (n: number) => Math.round(n * 10) / 10;
const P = (d: string, f: string, x = '') => '<path d="' + d + '" fill="' + f + '"' + x + '/>';
const C = (cx: number, cy: number, rr: number, f: string, x = '') => '<circle cx="' + cx + '" cy="' + cy + '" r="' + rr + '" fill="' + f + '"' + x + '/>';
const E = (cx: number, cy: number, rx: number, ry: number, f: string, x = '') => '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" fill="' + f + '"' + x + '/>';
const L = (d: string, s: string, w: number, x = '') => '<path d="' + d + '" fill="none" stroke="' + s + '" stroke-width="' + w + '" stroke-linecap="round" stroke-linejoin="round"' + x + '/>';
const at = (x: number, y: number, s: number, inner: string, rot = 0) => '<g transform="translate(' + x + ' ' + y + ')' + (rot ? ' rotate(' + rot + ')' : '') + (s !== 1 ? ' scale(' + s + ')' : '') + '">' + inner + '</g>';

// ---------- små figurer, tegnet rundt (0,0) ----------
const heart = (f: string) => P('M0,-3 C0,-9 -9,-9 -9,-2 C-9,4 0,9 0,10 C0,9 9,4 9,-2 C9,-9 0,-9 0,-3Z', f);
const star = (f: string) => P('M0,-8 L2.3,-2.6 8,-2.5 3.6,1.2 5,7 0,3.8 -5,7 -3.6,1.2 -8,-2.5 -2.3,-2.6Z', f);
const sparkle = (f: string) => P('M0,-6 Q1,-1 6,0 Q1,1 0,6 Q-1,1 -6,0 Q-1,-1 0,-6Z', f);
function cat(fur: string, inner: string) {
  return P('M-14,-4 L-12,-20 L-3,-12Z', fur) + P('M14,-4 L12,-20 L3,-12Z', fur) + P('M-11.5,-8 L-11,-16 L-6,-11Z', inner) + P('M11.5,-8 L11,-16 L6,-11Z', inner) +
    E(0, 0, 16, 13, fur) + C(-6, -1, 2.2, '#3a2a35') + C(6, -1, 2.2, '#3a2a35') + C(-5.3, -1.8, 0.7, '#fff') + C(6.7, -1.8, 0.7, '#fff') +
    P('M-2,3 H2 L0,5.4Z', '#ff7aa8') + L('M0,5.4 Q-2,8 -4,7 M0,5.4 Q2,8 4,7', '#3a2a35', 1) +
    L('M-9,4 L-18,2 M-9,6 L-18,7 M9,4 L18,2 M9,6 L18,7', '#3a2a35', 0.7, ' opacity=".6"') + C(-10, 5, 2.6, '#ff9cc0', ' opacity=".55"') + C(10, 5, 2.6, '#ff9cc0', ' opacity=".55"');
}
function bunny(fur: string) {
  return E(-6, -20, 4.2, 12, fur, ' transform="rotate(-10 -6 -20)"') + E(6, -20, 4.2, 12, fur, ' transform="rotate(10 6 -20)"') +
    E(-6, -20, 2, 8, '#ffb3cf', ' transform="rotate(-10 -6 -20)"') + E(6, -20, 2, 8, '#ffb3cf', ' transform="rotate(10 6 -20)"') +
    E(0, 0, 14, 12, fur) + C(-5, -1, 2, '#3a2a35') + C(5, -1, 2, '#3a2a35') + E(0, 3.5, 2, 1.4, '#ff7aa8') + L('M0,5 V7 M-2.6,7.6 Q0,9.6 2.6,7.6', '#3a2a35', 0.9) +
    C(-9, 4, 2.4, '#ff9cc0', ' opacity=".5"') + C(9, 4, 2.4, '#ff9cc0', ' opacity=".5"');
}
const carrot = P('M-2.5,-6 L2.5,-6 L0,9Z', '#ff8a3d') + L('M-1,-6 L-3,-11 M0,-6 V-12 M1,-6 L3,-11', '#4caf50', 1.4);
function panda() {
  return C(-11, -10, 5.4, '#2b2b2b') + C(11, -10, 5.4, '#2b2b2b') + E(0, 0, 15, 13, '#fff') + E(-6, -1, 4, 5, '#2b2b2b', ' transform="rotate(20 -6 -1)"') + E(6, -1, 4, 5, '#2b2b2b', ' transform="rotate(-20 6 -1)"') +
    C(-5.6, -1.6, 1.4, '#fff') + C(5.6, -1.6, 1.4, '#fff') + E(0, 4, 2.4, 1.6, '#2b2b2b') + L('M-2.4,7 Q0,8.6 2.4,7', '#2b2b2b', 0.9) + C(-10, 5, 2.4, '#ff9cc0', ' opacity=".6"') + C(10, 5, 2.4, '#ff9cc0', ' opacity=".6"');
}
function duck() {
  return E(0, 4, 13, 10, '#ffd84a') + C(-7, -7, 8, '#ffd84a') + C(-9, -9, 1.6, '#3a2a35') + P('M-15,-6 Q-21,-5 -15,-2Z', '#ff9a3c') + P('M2,1 Q8,-2 11,4 Q6,6 2,1Z', '#f2c230') + C(-12, -4, 2, '#ff9cc0', ' opacity=".6"');
}
function strawberry() {
  let s = P('M0,10 C-10,4 -11,-6 -6,-8 C-3,-9 3,-9 6,-8 C11,-6 10,4 0,10Z', '#ff4d6d') + P('M-7,-8 L-3,-6 L0,-10 L3,-6 L7,-8 L4,-4 L0,-6 L-4,-4Z', '#4caf50');
  for (const [x, y] of [[-4, -2], [0, -3], [4, -2], [-2, 2], [2, 2], [0, 6]]) s += E(x, y, 0.7, 1.1, '#ffe08a');
  return s;
}
const flower = (f: string) => [0, 72, 144, 216, 288].map((a) => C(r(Math.cos(a * Math.PI / 180) * 4), r(Math.sin(a * Math.PI / 180) * 4), 3.2, f)).join('') + C(0, 0, 2.4, '#ffd84a');
const cloud = (f: string) => C(-8, 2, 7, f) + C(0, -3, 9, f) + C(9, 2, 7, f) + P('M-15,2 H16 V9 H-15Z', f) + C(-15, 5, 4, f) + C(16, 5, 4, f);
function pumpkin(face = true) {
  return L('M0,-11 Q1,-15 4,-16', '#4a7a2a', 2.4) + E(0, 0, 14, 11, '#e8701a') + E(-6, 0, 6, 11, '#f58a2c') + E(6, 0, 6, 11, '#f58a2c') + E(0, 0, 4, 11, '#ff9b3e') +
    (face ? P('M-8,-3 L-5,-7 L-2,-3Z', '#3a1a05') + P('M8,-3 L5,-7 L2,-3Z', '#3a1a05') + P('M-8,3 Q0,10 8,3 L5,4 L3,2.4 L0,5 L-3,2.4 L-5,4Z', '#3a1a05') : '');
}
const bat = (f: string) => P('M0,-3 C2,-6 4,-6 5,-3 C8,-7 13,-7 16,-4 C13,-3 12,0 13,3 C10,1 8,2 6,4 C4,2 2,3 0,5 C-2,3 -4,2 -6,4 C-8,2 -10,1 -13,3 C-12,0 -13,-3 -16,-4 C-13,-7 -8,-7 -5,-3 C-4,-6 -2,-6 0,-3Z', f) + P('M-2,-4 L-3,-7 L-1,-5 M2,-4 L3,-7 L1,-5', f);
function ghost() {
  return P('M-11,12 L-11,-2 C-11,-17 11,-17 11,-2 L11,12 L7,8 L3,12 L-1,8 L-5,12 L-8,8Z', '#f6f4ff') + E(-4, -3, 2, 2.8, '#2b2240') + E(4, -3, 2, 2.8, '#2b2240') + E(0, 4, 2.2, 2.6, '#2b2240') +
    C(-7, 1.5, 2, '#ff9cc0', ' opacity=".6"') + C(7, 1.5, 2, '#ff9cc0', ' opacity=".6"');
}
const spider = L('M0,-30 V-4', '#cfc6dd', 0.8) + E(0, 0, 4.4, 5, '#120e18') + C(0, -5.4, 3, '#120e18') + L('M-3,-2 L-9,-6 L-11,-1 M-3,1 L-10,1 L-12,6 M3,-2 L9,-6 L11,-1 M3,1 L10,1 L12,6 M-2,3 L-7,8 M2,3 L7,8', '#120e18', 1.1) + C(-1.2, -6, 0.8, '#ff4d4d') + C(1.2, -6, 0.8, '#ff4d4d');
function candy(f: string, g: string) {
  return P('M-7,0 L-14,-6 L-13,6Z', g) + P('M7,0 L14,-6 L13,6Z', g) + E(0, 0, 8, 6, f) + L('M-4,-5 Q-1,0 -4,5 M1,-5.6 Q4,0 1,5.6', 'rgba(255,255,255,.45)', 1.4);
}
const grave = (f: string) => P('M-9,12 V-4 C-9,-14 9,-14 9,-4 V12Z', f) + '<text x="0" y="2" text-anchor="middle" font-family="Georgia,serif" font-size="6.5" font-weight="700" fill="#2b3340">RIP</text>' + P('M-12,12 H12 V15 H-12Z', '#4a6b3a');
const bolt = (f: string) => P('M3,-14 L-7,2 L-1,2 L-4,14 L7,-3 L1,-3Z', f);
function flame(a: string, b: string) { return P('M0,14 C-10,12 -11,2 -6,-4 C-6,1 -3,3 -2,1 C-4,-6 0,-12 3,-16 C3,-9 10,-5 9,4 C8,11 4,14 0,14Z', a) + P('M0,13 C-5,12 -5,6 -2,3 C-1,6 1,6 1,4 C2,7 5,8 4,10 C3,12 2,13 0,13Z', b); }

/** Bygger en flis som en hel SVG. */
function svg(size: number, bg: string, inner: string) { return '<svg xmlns="http://www.w3.org/2000/svg" width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '"><rect width="' + size + '" height="' + size + '" fill="' + bg + '"/>' + inner + '</svg>'; }

export const BACKGROUNDS: Background[] = [
  // ---------- søte ----------
  { id: 'bg_hjerter', group: 'sot', name: 'Rosa hjerter', price: 0, color: '#ffd6e7', size: 120, tile: () => svg(120, '#ffd6e7',
    at(28, 30, 1.3, heart('#ff8fb8')) + at(88, 86, 1.1, heart('#ff6fa3')) + at(90, 24, 0.6, heart('#ffffff')) + at(26, 92, 0.7, heart('#ffffff')) + at(60, 60, 0.5, sparkle('#fff6fb')) + at(110, 56, 0.4, sparkle('#ff9cc0')) + at(54, 110, 0.4, heart('#ffb3cf'))) },
  { id: 'bg_skyer', group: 'sot', name: 'Pastellskyer', price: 0, color: '#cfe6ff', size: 140, tile: () => svg(140, '#cfe6ff',
    at(38, 36, 1.1, cloud('#ffffff')) + at(104, 100, 0.9, cloud('#fdf5ff')) + at(104, 30, 0.7, star('#ffe27a')) + at(30, 106, 0.6, star('#ffc6e0')) + at(70, 70, 0.5, sparkle('#ffffff')) + at(130, 66, 0.4, sparkle('#ffe27a'))) },
  { id: 'bg_katter', group: 'sot', name: 'Søte katter', price: 40, color: '#fcd7ea', size: 130, tile: () => svg(130, '#fcd7ea',
    at(34, 40, 1, cat('#ffffff', '#ffb3cf')) + at(98, 100, 1, cat('#ffb46b', '#ffd6b0')) + at(98, 30, 0.55, heart('#ff8fb8')) + at(30, 104, 0.5, heart('#ffffff')) + at(66, 70, 0.5, sparkle('#ffffff'))) },
  { id: 'bg_kaniner', group: 'sot', name: 'Kaniner og gulrøtter', price: 45, color: '#d7f4e6', size: 130, tile: () => svg(130, '#d7f4e6',
    at(34, 48, 1, bunny('#ffffff')) + at(98, 108, 0.9, bunny('#f2e3d3')) + at(96, 40, 1, carrot, 20) + at(30, 112, 0.9, carrot, -25) + at(66, 80, 0.8, flower('#ffb3cf')) + at(120, 72, 0.6, flower('#ffffff'))) },
  { id: 'bg_pandaer', group: 'sot', name: 'Pandaer', price: 50, color: '#e8dcff', size: 130, tile: () => svg(130, '#e8dcff',
    at(36, 38, 1, panda()) + at(98, 98, 1, panda()) + at(100, 32, 0.7, flower('#ffb3cf')) + at(30, 100, 0.6, heart('#ff9cc0')) + at(66, 68, 0.5, star('#fff'))) },
  { id: 'bg_jordbaer', group: 'sot', name: 'Jordbær', price: 40, color: '#fff0f4', size: 110, tile: () => svg(110, '#fff0f4',
    at(28, 30, 1.2, strawberry(), -12) + at(82, 82, 1.1, strawberry(), 14) + at(84, 26, 0.8, flower('#ffffff')) + at(26, 86, 0.7, flower('#ffc2d6')) + at(55, 56, 0.4, sparkle('#ff9cc0'))) },
  { id: 'bg_andunger', group: 'sot', name: 'Andunger', price: 55, color: '#fff6c9', size: 130, tile: () => svg(130, '#fff6c9',
    at(38, 40, 1, duck()) + at(100, 100, 0.9, duck()) + at(100, 34, 0.8, cloud('#ffffff')) + at(32, 104, 0.6, heart('#ffb3cf')) + at(70, 72, 0.5, sparkle('#ffd84a'))) },
  // ---------- kule ----------
  { id: 'bg_galakse', group: 'kul', name: 'Galakse', price: 0, color: '#12133a', size: 160, tile: () => {
    let s = '';
    const pts = [[12, 20, 1.2], [40, 70, 0.8], [70, 14, 1], [130, 40, 1.4], [150, 120, 0.8], [96, 140, 1.1], [20, 130, 0.9], [60, 104, 0.7], [118, 88, 0.6], [86, 50, 0.6], [146, 10, 0.7], [6, 82, 0.6]];
    for (const [x, y, rr] of pts) s += C(x, y, rr, '#ffffff', ' opacity=".9"');
    return svg(160, '#12133a', s + at(110, 108, 1, C(0, 0, 12, '#ff8fb8') + C(-4, -4, 4, '#ffb3cf', ' opacity=".7"') + E(0, 0, 22, 5, 'none', ' stroke="#ffe27a" stroke-width="2" transform="rotate(-18)"')) +
      at(40, 40, 1, C(0, 0, 7, '#7ad7ff') + C(2, -2, 2, '#c8f0ff')) + at(130, 30, 0.6, sparkle('#ffe27a')) + at(30, 112, 0.5, sparkle('#b8a6ff')));
  } },
  { id: 'bg_geometri', group: 'kul', name: 'Geometri', price: 0, color: '#1d3b4a', size: 80, tile: () => svg(80, '#1d3b4a',
    P('M0,0 L40,0 L0,40Z', '#235063') + P('M40,40 L80,40 L40,80Z', '#235063') + P('M80,0 L80,40 L40,0Z', '#2c6278') + P('M40,40 L40,80 L0,80Z', '#2c6278') + C(40, 40, 3, '#ffd25a') + C(0, 0, 3, '#ffd25a') + C(80, 0, 3, '#ffd25a') + C(0, 80, 3, '#ffd25a') + C(80, 80, 3, '#ffd25a')) },
  { id: 'bg_fotball', group: 'kul', name: 'Fotballgress', price: 30, color: '#3f9b45', size: 120, tile: () => svg(120, '#3f9b45',
    P('M0,0 H30 V120 H0Z', '#46a84c') + P('M60,0 H90 V120 H60Z', '#46a84c') + L('M0,60 H120', 'rgba(255,255,255,.35)', 2) + C(60, 60, 14, 'none', ' stroke="rgba(255,255,255,.35)" stroke-width="2"')) },
  { id: 'bg_neon', group: 'kul', name: 'Neon', price: 60, color: '#16012e', size: 100, tile: () => svg(100, '#16012e',
    L('M0,0.5 H100 M0.5,0 V100', '#ff3fd1', 1.2, ' opacity=".6"') + L('M50,0 V100 M0,50 H100', '#3ff0ff', 0.8, ' opacity=".35"') +
    at(25, 25, 1, P('M0,-8 L8,6 L-8,6Z', 'none', ' stroke="#3ff0ff" stroke-width="1.6"')) + at(75, 75, 1, C(0, 0, 7, 'none', ' stroke="#ff3fd1" stroke-width="1.6"')) + at(75, 25, 0.5, sparkle('#ffe27a')) + at(25, 75, 0.5, sparkle('#ffffff'))) },
  { id: 'bg_lyn', group: 'kul', name: 'Lyn', price: 50, color: '#1b2a4a', size: 110, tile: () => svg(110, '#1b2a4a',
    at(30, 30, 1.3, bolt('#ffd84a'), 10) + at(82, 82, 1.1, bolt('#7ad7ff'), -12) + C(84, 24, 1.6, '#ffffff') + C(22, 84, 1.4, '#ffffff') + C(56, 56, 1, '#ffd84a') + C(104, 50, 1, '#7ad7ff')) },
  { id: 'bg_flammer', group: 'kul', name: 'Flammer', price: 70, color: '#1e1a24', size: 110, tile: () => svg(110, '#1e1a24',
    at(28, 34, 1.3, flame('#ff5a1f', '#ffd84a')) + at(82, 86, 1.1, flame('#ff3d6e', '#ffb02e')) + at(86, 26, 0.5, flame('#ff8a1f', '#ffe27a')) + at(26, 94, 0.45, flame('#ff8a1f', '#ffe27a'))) },
  { id: 'bg_kamo', group: 'kul', name: 'Kamuflasje', price: 60, color: '#6b7a45', size: 120, tile: () => svg(120, '#6b7a45',
    P('M10,20 C20,4 46,8 50,22 C54,36 30,44 18,38 C6,32 4,28 10,20Z', '#4a5730') + P('M70,60 C84,46 110,54 108,72 C106,88 84,92 74,84 C64,76 62,68 70,60Z', '#3a4224') +
    P('M60,10 C70,2 90,6 88,18 C86,28 70,30 62,24 C56,20 56,14 60,10Z', '#8f9a62') + P('M14,74 C24,62 44,66 44,82 C44,98 26,104 16,96 C8,90 8,80 14,74Z', '#8f9a62') + P('M46,96 C54,90 66,94 64,104 C62,112 50,114 46,108Z', '#2c321b') + P('M90,100 C98,96 110,100 108,110 C106,118 94,118 90,112Z', '#4a5730')) },
  // ---------- halloween ----------
  { id: 'bg_gresskar', group: 'halloween', name: 'Gresskar', price: 0, color: '#2b1a3c', size: 130, tile: () => svg(130, '#2b1a3c',
    at(34, 40, 1.2, pumpkin()) + at(98, 100, 1, pumpkin()) + at(98, 32, 0.6, pumpkin(false)) + at(30, 104, 0.55, star('#ffd25a')) + at(66, 72, 0.4, sparkle('#ffb02e'))) },
  { id: 'bg_flaggermus', group: 'halloween', name: 'Flaggermus og måne', price: 45, color: '#3a2b5c', size: 150, tile: () => svg(150, '#3a2b5c',
    at(40, 44, 1, C(0, 0, 18, '#ffe9a8') + C(-6, -4, 4, '#f5d98a') + C(5, 6, 3, '#f5d98a')) + at(104, 30, 1, bat('#17112a')) + at(110, 104, 1.2, bat('#17112a'), -10) + at(36, 116, 0.8, bat('#17112a'), 12) + C(80, 70, 1.2, '#fff') + C(140, 70, 1, '#fff') + C(10, 84, 1, '#fff')) },
  { id: 'bg_spokelser', group: 'halloween', name: 'Søte spøkelser', price: 50, color: '#1f2638', size: 130, tile: () => svg(130, '#1f2638',
    at(34, 40, 1.2, ghost()) + at(98, 100, 1, ghost(), 8) + at(98, 30, 0.6, star('#ffd25a')) + at(30, 106, 0.5, star('#b8a6ff')) + at(66, 70, 0.5, sparkle('#ffffff'))) },
  { id: 'bg_nett', group: 'halloween', name: 'Edderkoppnett', price: 55, color: '#241d2e', size: 140, tile: () => {
    let w = '';
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; w += L('M70,70 L' + r(70 + Math.cos(a) * 70) + ',' + r(70 + Math.sin(a) * 70), '#6e6383', 0.8); }
    for (const rr of [14, 30, 48, 66]) { let d = ''; for (let i = 0; i <= 8; i++) { const a = i * Math.PI / 4, b = (i - 0.5) * Math.PI / 4; const x = r(70 + Math.cos(a) * rr), y = r(70 + Math.sin(a) * rr); d += i ? ' Q' + r(70 + Math.cos(b) * rr * 0.86) + ',' + r(70 + Math.sin(b) * rr * 0.86) + ' ' + x + ',' + y : 'M' + x + ',' + y; } w += L(d, '#6e6383', 0.8); }
    return svg(140, '#241d2e', w + at(108, 44, 1, spider) + at(30, 112, 0.7, spider));
  } },
  { id: 'bg_godteri', group: 'halloween', name: 'Halloweengodteri', price: 50, color: '#ff9f43', size: 120, tile: () => svg(120, '#ff9f43',
    at(30, 30, 1.2, candy('#6a3d9a', '#8f5cc2'), -20) + at(88, 86, 1.1, candy('#2f9e5a', '#55c27e'), 25) + at(90, 28, 0.9, candy('#1e1a24', '#3a3344'), 10) + at(28, 90, 0.9, candy('#d9453b', '#f06a5e'), -10) + at(60, 58, 0.5, star('#fff3c4'))) },
  { id: 'bg_kirkegard', group: 'halloween', name: 'Kirkegård', price: 65, color: '#27303d', size: 140, tile: () => svg(140, '#27303d',
    at(112, 28, 1, C(0, 0, 12, '#f2ecd0') + C(-5, -3, 12, '#27303d')) + at(36, 50, 1.1, grave('#9aa5b1')) + at(100, 110, 1, grave('#828e9b')) + at(32, 118, 0.8, P('M-2,-12 H2 V-4 H8 V0 H2 V12 H-2 V0 H-8 V-4 H-2Z', '#9aa5b1')) +
    at(76, 60, 0.6, bat('#11151c')) + C(60, 14, 1, '#fff') + C(10, 20, 1, '#fff') + C(132, 80, 1, '#fff')) },
  // ---------- sesong (bare til salgs mens læreren har sesongen på) ----------
  { id: 'bg_heksenatt', group: 'sesong', season: 'halloween', name: 'Heksenatt', price: 70, color: '#2a1f4a', size: 160, tile: () => svg(160, '#2a1f4a',
    at(40, 40, 1, C(0, 0, 20, '#ffe9a8') + C(-7, -5, 4, '#f5d98a') + C(6, 7, 3, '#f5d98a')) +
    at(112, 108, 1, L('M-22,6 L18,-4', '#6b4a2a', 2.6) + P('M18,-4 L30,-10 L28,0 L32,6 L18,2Z', '#c9a86a') + C(-2, -6, 4, '#1e1a24') + P('M-6,-4 Q-2,6 4,-2 L2,2 Q-4,8 -10,0Z', '#1e1a24') + P('M-8,-10 L-2,-24 L4,-10Z', '#1e1a24')) +
    at(120, 30, 0.7, bat('#120d1e')) + at(30, 120, 0.6, bat('#120d1e')) + C(80, 70, 1.2, '#fff') + C(150, 60, 1, '#fff') + C(10, 90, 1, '#fff')) },
  { id: 'bg_sno', group: 'sesong', season: 'jul', name: 'Snøfall', price: 60, color: '#1b2f57', size: 120, tile: () => {
    const flake = (c: string) => L('M0,-8 V8 M-7,-4 L7,4 M-7,4 L7,-4 M-2,-6 L0,-4 L2,-6 M-2,6 L0,4 L2,6', c, 1.4);
    return svg(120, '#1b2f57', at(28, 30, 1.1, flake('#ffffff')) + at(88, 86, 0.9, flake('#dbe8ff')) + at(90, 24, 0.6, flake('#ffffff')) + at(26, 92, 0.5, flake('#dbe8ff')) + C(60, 58, 2, '#fff', ' opacity=".8"') + C(108, 54, 1.5, '#fff', ' opacity=".7"') + C(54, 112, 1.6, '#fff', ' opacity=".7"') + C(8, 60, 1.2, '#fff', ' opacity=".6"'));
  } },
  { id: 'bg_julelys', group: 'sesong', season: 'jul', name: 'Julelys', price: 70, color: '#16382a', size: 140, tile: () => {
    const bulb = (x: number, y: number, c: string) => L('M' + x + ',' + (y - 6) + ' V' + (y - 3), '#3a3a3a', 1.6) + E(x, y + 2, 4, 6, c) + E(x - 1.4, y, 1.2, 2, '#fff', ' opacity=".6"');
    const cs = ['#ff4d4d', '#ffd25a', '#4fc3f7', '#7ed957', '#ff8ae0'];
    let w = L('M0,20 Q35,36 70,20 T140,20', '#2b2b2b', 1.4) + L('M0,90 Q35,106 70,90 T140,90', '#2b2b2b', 1.4);
    [10, 35, 60, 85, 110, 132].forEach((x, i) => { w += bulb(x, 20 + Math.round(Math.sin(x / 140 * Math.PI * 2) * 7) + 6, cs[i % 5]) + bulb(x, 90 + Math.round(Math.sin(x / 140 * Math.PI * 2) * 7) + 6, cs[(i + 2) % 5]); });
    return svg(140, '#16382a', w + at(40, 60, 0.5, star('#ffd25a')) + at(110, 130, 0.4, star('#ffffff')));
  } },
  { id: 'bg_bibliotek', group: 'sesong', season: 'prove', name: 'Biblioteket', price: 60, color: '#5a3a22', size: 120, tile: () => {
    let b = P('M0,0 H120 V6 H0Z', '#3e2716') + P('M0,60 H120 V66 H0Z', '#3e2716');
    const cs = ['#d9453b', '#2e86c1', '#4fae6b', '#f2c230', '#6a3d9a', '#e8742a', '#1f6b8a', '#b04fae'];
    for (const y0 of [6, 66]) { let x = 2; let i = y0; while (x < 116) { const w = 8 + (i * 7) % 7, h = 40 + (i * 13) % 14; b += P('M' + x + ',' + (y0 + 54 - h) + ' h' + w + ' v' + h + ' h-' + w + 'z', cs[i % 8]) + L('M' + (x + 2) + ',' + (y0 + 60 - h) + ' h' + (w - 4), 'rgba(255,255,255,.5)', 1); x += w + 1; i++; } }
    return svg(120, '#5a3a22', b);
  } },
  { id: 'bg_kladdebok', group: 'sesong', season: 'prove', name: 'Kladdeboka', price: 70, color: '#fbfaf3', size: 120, tile: () => {
    let g = '';
    for (let i = 0; i <= 120; i += 12) g += L('M' + i + ',0 V120 M0,' + i + ' H120', '#cfe0f2', 0.8);
    return svg(120, '#fbfaf3', g + L('M10,30 h22 M21,19 v22', '#2e86c1', 2) + '<text x="70" y="40" font-family="Georgia,serif" font-size="16" fill="#d9453b" font-weight="700">A+</text>' +
      L('M14,90 Q24,74 34,90 T54,90', '#4fae6b', 2) + '<text x="74" y="98" font-family="Georgia,serif" font-size="13" fill="#6a3d9a" font-style="italic">x²=4</text>' + at(102, 66, 0.6, star('#f2c230')));
  } },
  // ---------- jul ----------
  { id: 'bg_pepperkaker', group: 'jul', name: 'Pepperkaker', price: 45, color: '#f3e4cf', size: 130, tile: () => {
    const ice = (d: string) => L(d, '#fffaf0', 1.6);
    const man = P('M0,-14 a5,5 0 1 1 0.1,0 Z M-4,-9 H4 L12,-4 L10,-1 L4,-4 V3 L8,13 H3 L0,6 L-3,13 H-8 L-4,3 V-4 L-10,-1 L-12,-4Z', '#b8733c') + ice('M-9,-3 l2,-1 M7,-3 l2,1 M-6,11 h3 M3,11 h3') + C(-1.8, -15, 0.9, '#3a2418') + C(1.8, -15, 0.9, '#3a2418') + C(0, -2, 1.2, '#d64b3c') + C(0, 2, 1.2, '#2e7d4f');
    const hj = heart('#b8733c') + ice('M-6,-2 Q0,4 6,-2');
    return svg(130, '#f3e4cf', at(32, 36, 1.3, man) + at(98, 98, 1.3, man, 12) + at(96, 30, 1.6, hj, -10) + at(30, 100, 1.4, hj, 14) + at(64, 66, 1, star('#d89a55')) + C(64, 12, 1.6, '#d64b3c') + C(10, 64, 1.6, '#2e7d4f') + C(120, 64, 1.6, '#ffd25a'));
  } },
  { id: 'bg_polkagris', group: 'jul', name: 'Polkagris', price: 40, color: '#fff4f4', size: 100, tile: () => {
    const cane = L('M0,18 V-6 A7,7 0 0 1 14,-6', '#ffffff', 6) + L('M0,18 V-6 A7,7 0 0 1 14,-6', '#e2342d', 6, ' stroke-dasharray="4 4"');
    return svg(100, '#fff4f4', at(24, 30, 1, cane, -20) + at(74, 78, 1, cane, 25) + at(78, 20, 0.6, sparkle('#e2342d')) + at(22, 80, 0.6, sparkle('#2e7d4f')) + C(50, 52, 2, '#e2342d', ' opacity=".5"'));
  } },
  { id: 'bg_julekuler', group: 'jul', name: 'Julekuler', price: 50, color: '#123a2a', size: 130, tile: () => {
    const kule = (c: string, d: string) => L('M0,-22 V-12', '#c9a227', 1) + P('M-3,-13 h6 v3 h-6z', '#c9a227') + C(0, 0, 10, c) + L('M-10,0 Q0,5 10,0', d, 1.6) + L('M-8,-5 Q0,-2 8,-5', d, 1.2) + C(-3.5, -3.5, 2.4, '#fff', ' opacity=".5"');
    return svg(130, '#123a2a', L('M0,4 Q65,26 130,4', '#c9a227', 0.8) + at(24, 30, 1, kule('#d64b3c', '#ffd25a')) + at(66, 36, 0.9, kule('#ffd25a', '#d64b3c')) + at(108, 28, 1, kule('#4f9ee0', '#ffffff')) +
      at(42, 96, 1.1, kule('#ffffff', '#d64b3c')) + at(98, 100, 0.9, kule('#9b7fd0', '#ffd25a')) + at(70, 74, 0.4, star('#ffd25a')) + at(10, 74, 0.3, star('#fff')) + at(124, 70, 0.3, star('#fff')));
  } },
  { id: 'bg_julegaver', group: 'jul', name: 'Julegaver', price: 50, color: '#f7efe2', size: 130, tile: () => {
    const gave = (c: string, b: string) => P('M-12,-8 H12 V12 H-12Z', c) + P('M-14,-12 H14 V-6 H-14Z', c) + P('M-2,-12 H2 V12 H-2Z', b) + L('M0,-12 C-8,-20 -12,-12 0,-12 C12,-12 8,-20 0,-12', b, 2);
    return svg(130, '#f7efe2', at(32, 34, 1, gave('#d64b3c', '#ffd25a')) + at(98, 40, 0.8, gave('#2e7d4f', '#ffffff')) + at(64, 98, 1.1, gave('#3a6fa0', '#ffd25a'), 8) + at(14, 100, 0.6, gave('#ffd25a', '#d64b3c'), -10) +
      at(110, 104, 0.4, star('#d64b3c')) + at(64, 60, 0.4, star('#2e7d4f')));
  } },
  { id: 'bg_nisser', group: 'jul', name: 'Nisser', price: 55, color: '#1d4f3a', size: 140, tile: () => {
    const nisse = P('M-10,8 Q-10,-6 0,-7 Q10,-6 10,8Z', '#7a8590') + C(0, -10, 6, '#f1c9a5') + P('M-6,-9 Q0,4 6,-9 Q4,-2 0,-1 Q-4,-2 -6,-9Z', '#ffffff') + P('M-7,-12 Q-4,-30 10,-24 L7,-12Z', '#d64b3c') + C(10, -24, 2.4, '#fff') + L('M-7,-12 H7', '#ffffff', 2.4) + C(-2, -11, 0.8, '#1e1a24') + C(2, -11, 0.8, '#1e1a24') + C(0, -9, 1.2, '#e58a8a');
    return svg(140, '#1d4f3a', at(34, 44, 1.4, nisse) + at(104, 108, 1.4, nisse) + at(104, 36, 0.5, star('#ffd25a')) + at(34, 112, 0.5, star('#ffd25a')) + C(70, 74, 1.6, '#fff', ' opacity=".7"') + C(130, 70, 1.3, '#fff', ' opacity=".6"') + C(8, 76, 1.3, '#fff', ' opacity=".6"'));
  } },
  { id: 'bg_julestrikk', group: 'jul', name: 'Julestrikk', price: 60, color: '#b8322a', size: 96, tile: () => {
    // Strikkemønster: masker i rutenett, med snøfnugg og en rad med hjerter.
    const W = '#f6f3ec', G = '#2e7d4f';
    let s = '';
    const knit = (x: number, y: number, c: string) => P('M' + x + ',' + y + ' l2,4 2,-4 v2 l-2,4 -2,-4z', c);
    const rows = ['..X...X...X.', '.XXX.XXX.XXX', '..X...X...X.'];
    rows.forEach((r, j) => r.split('').forEach((ch, i) => { if (ch === 'X') s += knit(i * 8, 4 + j * 6, W); }));
    for (let i = 0; i < 12; i++) s += knit(i * 8, 24, G) + knit(i * 8, 90, G);
    const flake = ['...X...', '.X.X.X.', '..XXX..', 'XXXXXXX', '..XXX..', '.X.X.X.', '...X...'];
    const put = (ox: number, oy: number) => flake.forEach((r, j) => r.split('').forEach((ch, i) => { if (ch === 'X') s += knit(ox + i * 4, oy + j * 5, W); }));
    put(6, 40); put(54, 40);
    return svg(96, '#b8322a', s);
  } },
  { id: 'bg_julekveld', group: 'jul', name: 'Julekveld i bygda', price: 100, color: '#16245a', size: 0, cover: true, tile: julekveldSVG },
  { id: 'bg_julenatt_piksel', group: 'jul', name: 'Julenatt i piksler', price: 100, color: '#121d4a', size: 0, cover: true, pixel: true, tile: () => '', image: julenattPixelPNG },
  // ---------- natur ----------
  { id: 'bg_nordlys', group: 'natur', name: 'Nordlys over skogen', price: 80, color: '#0c1b40', size: 0, cover: true, tile: nordlysSVG },
  { id: 'bg_nordlys_piksel', group: 'natur', name: 'Nordlys i piksler', price: 80, color: '#0c1a44', size: 0, cover: true, pixel: true, tile: () => '', image: nordlysPixelPNG },
  // ---------- piratøya ----------
  { id: 'bg_pirat_soloppgang', group: 'pirat', name: 'Piratøya ved soloppgang', price: 100, color: '#f2a6a6', size: 0, cover: true, pixel: true, tile: () => '', image: () => piratePNG('soloppgang') },
  { id: 'bg_pirat_solnedgang', group: 'pirat', name: 'Piratøya ved solnedgang', price: 100, color: '#a23f6b', size: 0, cover: true, pixel: true, tile: () => '', image: () => piratePNG('solnedgang') },
  { id: 'bg_pirat_natt', group: 'pirat', name: 'Piratøya en stjerneklar natt', price: 100, color: '#0b1638', size: 0, cover: true, pixel: true, tile: () => '', image: () => piratePNG('natt') },
];
export const bgById = (id: string | undefined | null) => BACKGROUNDS.find((b) => b.id === id);

const cache: Record<string, string> = {};
/** CSS-verdi for bakgrunnen, klar til background-image. */
export function bgImage(b: Background): string {
  if (cache[b.id]) return cache[b.id];
  if (b.image) { const u = b.image(); return u ? (cache[b.id] = 'url("' + u + '")') : 'none'; }
  return (cache[b.id] = 'url("data:image/svg+xml,' + encodeURIComponent(b.tile()) + '")');
}
/** background-size og -repeat for et mønster eller et stort bilde. */
export function bgFit(b: Background, scale = 1): { size: string; repeat: string; pos: string } {
  return b.cover ? { size: 'cover', repeat: 'no-repeat', pos: 'center bottom' } : { size: Math.round(b.size * scale) + 'px', repeat: 'repeat', pos: '0 0' };
}

/** Legger bakgrunnen bak hele appen. null eller ukjent id gir temaets vanlige bakgrunn. */
export function applyBackground(id: string | null | undefined): void {
  const b = bgById(id), s = document.body.style;
  document.body.classList.toggle('bgimg', !!b);
  document.body.classList.toggle('bgpixel', !!b?.pixel);
  const keys = ['--appbg', '--appbg-c', '--appbg-s', '--appbg-r', '--appbg-p'];
  if (b) { const f = bgFit(b); [bgImage(b), b.color, f.size, f.repeat, f.pos].forEach((v, i) => s.setProperty(keys[i], v)); }
  else keys.forEach((k) => s.removeProperty(k));
}
