// Nivå 9–16 i Nyreligiøspuggen: to nye trofeer per nivå.
import { box, cyl } from '../../app/room/iso';
import { f1, flame, fr, at, WOODD, DARKL, GOLD } from '../kritisk/room';
import { star, snow, zodiacWheel, drawTree, ball, RED, GREEN, WHITE, GOLDB } from './room';
import type { RoomItem, Level } from '../types';

function dLykt() {
  return box(.2, .2, 0, 4, DARKL) + '<path d="M-10,-4h20l-2,-26h-16z" style="fill:rgba(255,236,170,.35);stroke:#2a2630;stroke-width:2.4"/>' +
    '<path d="M-12,-30h24l-12,-10z" style="fill:#2a2630"/><path d="M0,-40v-4" style="stroke:#2a2630;stroke-width:2.4"/><circle cx="0" cy="-46" r="2.6" style="fill:none;stroke:#2a2630;stroke-width:1.6"/>' +
    at(0, -6, '<rect x="-3" y="-12" width="6" height="12" style="fill:#f6f3ec"/>' + flame(-12)) + '<path d="M-14,-30q14,6 28,0" style="fill:none;stroke:#2f7045;stroke-width:3"/>' + ball(-8, -28, 2, '#d64b3c');
}
function dVannmannen() {
  return fr(64, 64, '<path d="M10,26q5,-6 11,0t11,0t11,0t11,0M10,40q5,-6 11,0t11,0t11,0t11,0" style="fill:none;stroke:#6fd0f0;stroke-width:3.4;stroke-linecap:round"/>' +
    snow([[12, 10, 1], [52, 12, 1.2], [30, 54, .8], [48, 52, 1]]) + '<text x="32" y="60" text-anchor="middle" style="font:700 6px system-ui,sans-serif;fill:#cfe8fb">VANNMANNEN</text>', '#143a63');
}
function dTeleskop() {
  return '<path d="M0,-2L-12,0M0,-2L10,2M0,-2V-22" style="stroke:#5a4030;stroke-width:2.4;stroke-linecap:round"/>' +
    '<g transform="rotate(-28 0 -26)"><rect x="-22" y="-31" width="40" height="10" rx="2" style="fill:#2b4f86"/><rect x="14" y="-33" width="8" height="14" rx="2" style="fill:#e3ad33"/><rect x="-26" y="-29" width="6" height="6" style="fill:#e3ad33"/></g>' +
    star(24, -54, 5);
}
function dFiskene() {
  const fish = (x: number, y: number, flip: number) => '<g transform="translate(' + x + ' ' + y + ') scale(' + flip + ' 1)"><path d="M-12,0q12,-10 22,0q-10,10 -22,0zM-12,0l-7,-6v12z" style="fill:#f6e7a8"/><circle cx="5" cy="-1.5" r="1.4" style="fill:#1c2450"/></g>';
  return fr(64, 64, fish(32, 22, 1) + fish(32, 42, -1) + '<path d="M16,22q-6,10 0,20M48,22q6,10 0,20" style="fill:none;stroke:#f6e7a8;stroke-width:1.2;stroke-dasharray:2 2"/>', '#1c2450');
}
function dAmetyst() {
  let s = '<ellipse cx="0" cy="-20" rx="20" ry="22" style="fill:#7a6f68"/><ellipse cx="0" cy="-20" rx="15" ry="17" style="fill:#4a2f72"/>';
  for (let i = 0; i < 10; i++) { const a = i * Math.PI / 5, x = f1(Math.cos(a) * 9), y = f1(-20 + Math.sin(a) * 10); s += '<path d="M' + x + ',' + y + 'l-3,-6 3,-4 3,4z" style="fill:' + (i % 2 ? '#b39ddb' : '#9575cd') + '"/>'; }
  return s + '<path d="M-3,-22l3,-8 3,8z" style="fill:#d1c4e9"/>' + box(.3, .22, 0, 3, WOODD);
}
function dEnergi() {
  let s = '<circle cx="32" cy="16" r="5" style="fill:#fff3c4"/><path d="M26,50l2,-14 -8,-6 8,-6h8l8,6 -8,6 2,14z" style="fill:#fff3c4"/>';
  ['#e57373', '#ffb74d', '#fff176', '#81c784', '#64b5f6', '#9575cd', '#f06292'].forEach((c, i) => { s += '<circle cx="32" cy="' + (48 - i * 5.4) + '" r="2" style="fill:' + c + '"/>'; });
  for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; s += '<path d="M' + f1(32 + Math.cos(a) * 18) + ',' + f1(32 + Math.sin(a) * 18) + 'L' + f1(32 + Math.cos(a) * 26) + ',' + f1(32 + Math.sin(a) * 26) + '" style="stroke:#fff3c4;stroke-width:1.4;opacity:.7"/>'; }
  return fr(64, 64, s, '#3a2f6b');
}
function dVismann() {
  return '<path d="M-12,0Q-14,-30 0,-32Q14,-30 12,0Z" style="fill:#614a92"/><path d="M-12,0Q-6,-4 0,0Q6,-4 12,0" style="fill:#e3ad33"/>' +
    '<circle cx="0" cy="-37" r="6.5" style="fill:#c68a5a"/><path d="M-5,-34q5,10 10,0q-2,6 -5,7q-3,-1 -5,-7z" style="fill:#e0e0e0"/>' +
    '<path d="M-8,-41l2,-8 3,4 3,-6 3,6 3,-4 2,8z" style="fill:#ffd25a"/>' +
    at(9, -16, '<rect x="-5" y="-8" width="10" height="8" rx="1" style="fill:#e3ad33"/><path d="M-6,-8h12" style="stroke:#c9962a;stroke-width:2"/><circle cx="0" cy="-10" r="1.6" style="fill:#d64b3c"/>');
}
function dBetlehem() {
  return fr(128, 56, '<path d="M4,52V44c40,-6 80,-6 120,0V52z" style="fill:#2a2340"/>' +
    '<path d="M50,46V32l14,-10 14,10V46z" style="fill:#5a4030"/><path d="M46,33l18,-14 18,14" style="fill:none;stroke:#3a2a1c;stroke-width:3"/><path d="M58,46v-8h12v8z" style="fill:#ffd25a"/>' +
    star(96, 16, 9, '#fff3c4') + '<path d="M96,25L66,40" style="stroke:#fff3c4;stroke-width:1.6;opacity:.6"/>' +
    snow([[14, 10, 1], [30, 22, .8], [44, 8, 1], [118, 30, .8], [78, 10, .9]]), '#1c2450');
}
function dLavvo() {
  return '<path d="M-22,0L0,-46L22,0Z" style="fill:#8d7b68"/><path d="M0,-46L22,0L8,0Z" style="fill:#766554"/><path d="M-6,0L0,-16L6,0Z" style="fill:#2a1a12"/>' +
    '<path d="M-4,-50L0,-44M4,-50L0,-44M0,-52V-44" style="stroke:#5a4030;stroke-width:1.8"/>' +
    '<path d="M-18,-8h36" style="stroke:#d64b3c;stroke-width:2.4"/><path d="M-16,-11h32" style="stroke:#2b4f86;stroke-width:2"/><path d="M-14,-14h28" style="stroke:#ffd25a;stroke-width:1.6"/>';
}
function dBeaivi() {
  let s = '<rect x="12" y="12" width="40" height="40" transform="rotate(45 32 32)" style="fill:none;stroke:#d64b3c;stroke-width:3"/>';
  for (let i = 0; i < 4; i++) s += '<path d="M32,6V14" transform="rotate(' + i * 90 + ' 32 32)" style="stroke:#d64b3c;stroke-width:3;stroke-linecap:round"/>';
  return fr(64, 64, s + '<circle cx="32" cy="32" r="8" style="fill:#ffd25a;stroke:#d64b3c;stroke-width:2"/>', '#f2e6cf');
}
function dAlter() {
  return box(.4, .28, 0, 16, ['#5a4030', '#46301f', '#352416']) + box(.42, .3, 16, 2, WHITE) +
    at(-14, -20, '<rect x="-2" y="-12" width="4" height="12" style="fill:#f6f3ec"/>' + flame(-12)) + at(14, -20, '<rect x="-2" y="-9" width="4" height="9" style="fill:#2a2630"/>' + flame(-9)) +
    '<ellipse cx="0" cy="-20" rx="8" ry="3.4" style="fill:#9aa3ab"/><path d="M-8,-20q8,8 16,0" style="fill:#7d868e"/>' +
    '<circle cx="0" cy="-34" r="7" style="fill:#f6e7a8"/><circle cx="3" cy="-36" r="6" style="fill:#46301f"/>' +
    '<path d="M-6,-18c2,-4 -2,-6 0,-10" style="fill:none;stroke:#3f9a63;stroke-width:1.6"/>';
}
function dTrippelmane() {
  return fr(64, 64, '<circle cx="32" cy="32" r="10" style="fill:#f6e7a8"/>' +
    '<path d="M18,22a12,12 0 1 0 0,20a10,10 0 0 1 0,-20z" style="fill:#f6e7a8"/><path d="M46,22a12,12 0 1 1 0,20a10,10 0 0 0 0,-20z" style="fill:#f6e7a8"/>' +
    snow([[10, 10, 1], [54, 12, .8], [32, 54, 1]]), '#1c2450');
}
function dAstrolab() {
  return cyl(.16, 0, 4, GOLD) + cyl(.03, 4, 10, GOLD) +
    '<circle cx="0" cy="-34" r="17" style="fill:none;stroke:#e3ad33;stroke-width:2.4"/><ellipse cx="0" cy="-34" rx="17" ry="6" style="fill:none;stroke:#c9962a;stroke-width:1.8"/>' +
    '<ellipse cx="0" cy="-34" rx="6" ry="17" style="fill:none;stroke:#c9962a;stroke-width:1.8"/><ellipse cx="0" cy="-34" rx="17" ry="5" transform="rotate(25 0 -34)" style="fill:none;stroke:#ffe18f;stroke-width:1.4"/>' +
    '<circle cx="0" cy="-34" r="4" style="fill:#2b4f86"/>';
}
function dStjernekart() {
  const pts = [[16, 40], [30, 22], [48, 30], [62, 14], [80, 26], [98, 18], [112, 38]];
  return fr(128, 60, zodiacWheel(64, 30, 22, 'rgba(255,210,90,.35)') + '<path d="M' + pts.map((q) => q.join(',')).join('L') + '" style="fill:none;stroke:#cfe8fb;stroke-width:1;opacity:.8"/>' +
    pts.map((q) => '<circle cx="' + q[0] + '" cy="' + q[1] + '" r="2" style="fill:#fff"/>').join('') + snow([[24, 50, .7], [90, 48, .7], [104, 8, .7]]), '#101833');
}
function dGullslede() {
  return '<path d="M-26,-2H22q8,0 8,-8" style="fill:none;stroke:#c9962a;stroke-width:3;stroke-linecap:round"/><path d="M-16,-2v-6M12,-2v-6" style="stroke:#c9962a;stroke-width:2.4"/>' +
    '<path d="M-24,-8H20l4,-18H-18q-8,0 -8,10z" style="fill:#d64b3c"/><path d="M-24,-8H20l4,-18" style="fill:none;stroke:#e3ad33;stroke-width:2"/>' +
    box(.2, .14, 26, 10, GREEN, -.1, -.05) + box(.14, .14, 26, 14, ['#ffe18f', '#e3ad33', '#c9962a'], .18, .06) + star(-4, -50, 6);
}
function dKronen() {
  return fr(64, 64, '<path d="M12,46L10,22l12,10 10,-16 10,16 12,-10 -2,24z" style="fill:#e3ad33;stroke:#c9962a;stroke-width:2"/>' +
    '<path d="M12,46h40v6h-40z" style="fill:#c9962a"/>' + star(32, 12, 6, '#fff3c4') + ball(22, 40, 2.6, '#d64b3c') + ball(32, 38, 2.6, '#3f9a63') + ball(42, 40, 2.6, '#d64b3c'), '#2b1d3f');
}
// Trær brukes ikke her, men holder tegnehjelperne samlet ett sted.
void drawTree; void RED; void GOLDB;

export const EXTRA_ITEMS: Record<string, RoomItem> = {
  lykt: { n: 'Vinterlykta', k: 'floor', w: 1, d: 1, f: dLykt, dsc: 'Lys midt i den mørkeste tida. Mange nyreligiøse er inspirert av førkristne tradisjoner knyttet til årstidene.' },
  vannmannen: { n: 'Vannmannen', k: 'wall', w: 1, h: 64, f: dVannmannen, dsc: 'Ifølge new age skal Vannmannens tidsalder bli en tid der alt henger sammen i en helhet.' },
  teleskop: { n: 'Stjernekikkerten', k: 'floor', w: 1, d: 1, f: dTeleskop, dsc: 'Astrologi og astronomi er ikke det samme. Astronomi er vitenskap, astrologi bygger på tro.' },
  fiskene: { n: 'Fiskene', k: 'wall', w: 1, h: 64, f: dFiskene, dsc: 'Ifølge astrologien lever vi i Fiskenes tegn, kristendommens tid, som har vært preget av splittelse.' },
  ametyst: { n: 'Ametystgeoden', k: 'floor', w: 1, d: 1, f: dAmetyst, dsc: 'Pen å se på. Men kan en stein helbrede? Spør om dokumentasjon.' },
  energi: { n: 'Energibildet', k: 'wall', w: 1, h: 64, f: dEnergi, dsc: 'I healing tror man at kroppen har energier som må være i balanse.' },
  vismann: { n: 'Vismannen', k: 'floor', w: 1, d: 1, f: dVismann, dsc: 'De vise menn fulgte en stjerne. Stjernetyding er kjent fra flere årtusener tilbake.' },
  betlehem: { n: 'Betlehemsstjernen', k: 'wall', w: 2, h: 56, f: dBetlehem, dsc: 'Julen er en kristen høytid. Mange nyreligiøse henter elementer fra kristendommen, slik antroposofien gjør.' },
  lavvo: { n: 'Lavvoen', k: 'floor', w: 1, d: 1, f: dLavvo, dsc: 'I urfolks naturreligioner hadde alt i naturen sjel: trær, fjell, steiner og sola.' },
  beaivi: { n: 'Solsymbolet', k: 'wall', w: 1, h: 64, f: dBeaivi, dsc: 'Sola, vinden og tordenen var guddommelige makter i førkristen samisk religion.' },
  alter: { n: 'Måne-alteret', k: 'floor', w: 1, d: 1, f: dAlter, dsc: 'Hekser danner små grupper og utfører ritualer sammen. Regelen er å unngå å skade andre.' },
  trippelmane: { n: 'Den trefoldige månen', k: 'wall', w: 1, h: 64, f: dTrippelmane, dsc: 'Den trefoldige gudinne symboliserer ofte månen i wicca.' },
  astrolab: { n: 'Himmelkula', k: 'floor', w: 1, d: 1, f: dAstrolab, dsc: 'Alt henger sammen: et holistisk verdenssyn.' },
  stjernekart: { n: 'Stjernekartet', k: 'wall', w: 2, h: 60, f: dStjernekart, dsc: 'Teosofien fikk betydning for nyreligiøse retninger på 1960- og 1970-tallet.' },
  gullslede: { n: 'Gullsleden', k: 'floor', w: 1, d: 1, f: dGullslede, dsc: 'Bare de mest utholdende får kjøre den. Du er en julelegende.' },
  kronen: { n: 'Julekronen', k: 'wall', w: 1, h: 64, f: dKronen, dsc: 'Den høyeste utmerkelsen i Nyreligiøspuggen. Fortsett å samle stjerner.' },
};

export const EXTRA_LEVELS: Level[] = [
  { n: 'Vintersolverv', xp: 460, t: ['lykt', 'vannmannen'] },
  { n: 'Stjernekikker', xp: 580, t: ['teleskop', 'fiskene'] },
  { n: 'Krystallvokter', xp: 720, t: ['ametyst', 'energi'] },
  { n: 'Vismann', xp: 880, t: ['vismann', 'betlehem'] },
  { n: 'Trommereisende', xp: 1060, t: ['lavvo', 'beaivi'] },
  { n: 'Månevokter', xp: 1260, t: ['alter', 'trippelmane'] },
  { n: 'Nordstjerne', xp: 1500, t: ['astrolab', 'stjernekart'] },
  { n: 'Julelegende', xp: 1800, t: ['gullslede', 'kronen'] },
];
