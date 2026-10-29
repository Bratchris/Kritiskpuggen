// Nivå 9–16 i Kritiskpuggen: to nye trofeer per nivå.
// Gulvtrofeer tegnes med origo midt på gulvruta (y oppover er negativ).
// Veggtrofeer tegnes flatt, 64 enheter per rute i bredden.
import { box, cyl } from '../../app/room/iso';
import { bat, fr, pk, WOODD, DARKL, STONED } from './room';
import type { RoomItem, Level } from '../types';

const GOLDB = ['#ffe18f', '#e3ad33', '#c9962a'];
const PURPLE = ['#8a64b0', '#6f4f93', '#5a3f7a'];

function dTimeglass() {
  return box(.24, .24, 0, 4, WOODD) +
    '<path d="M-10,-4L10,-4L2,-22L10,-40L-10,-40L-2,-22Z" style="fill:rgba(214,228,240,.6);stroke:#cfd8e8;stroke-width:1.2"/>' +
    '<path d="M-7.5,-4L7.5,-4L2.5,-12L-2.5,-12Z" style="fill:#e3b04a"/>' +
    '<path d="M-6.5,-36L6.5,-36L1.2,-27L-1.2,-27Z" style="fill:#e3b04a"/><path d="M0,-27V-12" style="stroke:#e3b04a;stroke-width:1"/>' +
    '<path d="M-13,-4V-40M13,-4V-40" style="stroke:#5a4030;stroke-width:2.6"/>' +
    box(.24, .24, 40, 4, WOODD);
}
function dForstorrelse() {
  return fr(64, 64, '<path d="M12,16h30M12,24h38M12,32h26M12,40h34M12,48h22" style="stroke:#b9b09a;stroke-width:2.4"/>' +
    '<circle cx="34" cy="30" r="12" style="fill:rgba(207,216,232,.55);stroke:#c9a227;stroke-width:3.4"/>' +
    '<path d="M42,39l10,10" style="stroke:#6b4c34;stroke-width:5;stroke-linecap:round"/>' +
    '<path d="M28,24a7,7 0 0 1 6,-3" style="fill:none;stroke:#fff;stroke-width:2;stroke-linecap:round"/>', '#f4efe2');
}
function dRavn() {
  return cyl(.14, 0, 3, DARKL) +
    '<path d="M0,-3V-30M-13,-30H13" style="stroke:#5a4030;stroke-width:3;stroke-linecap:round"/>' +
    '<path d="M-3,-31v-4M3,-31v-4" style="stroke:#3a3540;stroke-width:1.4"/>' +
    '<path d="M-9,-38l-11,5 3,-7z" style="fill:#1e1a24"/>' +
    '<ellipse cx="0" cy="-40" rx="10" ry="7" style="fill:#1e1a24"/>' +
    '<path d="M-6,-42c4,-4 10,-3 12,1c-4,2 -9,3 -12,-1z" style="fill:#2e2838"/>' +
    '<circle cx="8" cy="-48" r="5.4" style="fill:#1e1a24"/>' +
    '<path d="M12,-49.5l7,1.5-7,1.8z" style="fill:#3a3540"/>' +
    '<circle cx="9" cy="-49.4" r="1.1" style="fill:#f6d32a"/>';
}
function dTavle() {
  return fr(128, 56, '<text x="64" y="30" text-anchor="middle" style="font:700 17px Georgia,serif;fill:#f4f1e8">Hvorfor?</text>' +
    '<text x="64" y="44" text-anchor="middle" style="font:400 8px Georgia,serif;fill:#cfd8c8">Er det sant? Hvem sier det?</text>' +
    '<rect x="4" y="47" width="120" height="5" style="fill:#6b4c34"/><rect x="96" y="45" width="10" height="3" rx="1" style="fill:#f4f1e8"/>', '#2f4a3a');
}
function dTeleskop() {
  return '<path d="M0,-28L-13,0M0,-28L13,0M0,-28L2,5" style="stroke:#5a4030;stroke-width:2.6;stroke-linecap:round"/>' +
    '<g transform="rotate(-26 0 -32)"><rect x="-20" y="-37" width="36" height="10" rx="2" style="fill:#c9a227"/>' +
    '<rect x="16" y="-39.5" width="7" height="15" rx="1.5" style="fill:#a8801c"/><rect x="-25" y="-35" width="6" height="6" rx="1" style="fill:#6b4a2b"/>' +
    '<path d="M-14,-35h22" style="stroke:#ffe18f;stroke-width:1.4"/></g>';
}
function dStjernekart() {
  const st = [[12, 10], [24, 48], [104, 12], [116, 44], [92, 52], [36, 14]].map((q) => '<circle cx="' + q[0] + '" cy="' + q[1] + '" r="1" style="fill:#f6e7a8"/>').join('');
  return fr(128, 60, st +
    '<ellipse cx="64" cy="30" rx="18" ry="8" style="fill:none;stroke:#8f98c8;stroke-width:1"/>' +
    '<ellipse cx="64" cy="30" rx="32" ry="14" style="fill:none;stroke:#8f98c8;stroke-width:1"/>' +
    '<ellipse cx="64" cy="30" rx="48" ry="21" style="fill:none;stroke:#8f98c8;stroke-width:1"/>' +
    '<circle cx="64" cy="30" r="7" style="fill:#ffd25a"/>' +
    '<circle cx="82" cy="30" r="2.6" style="fill:#d9733a"/><circle cx="41" cy="20" r="3.4" style="fill:#4a8fd1"/><circle cx="92" cy="45" r="3" style="fill:#c45050"/>', '#1c1f4a');
}
function dVekt() {
  return cyl(.2, 0, 3, ['#ffe18f', '#c9962a']) +
    '<path d="M0,-3V-50" style="stroke:#c9962a;stroke-width:3"/>' +
    '<path d="M-22,-45L22,-49" style="stroke:#e3ad33;stroke-width:2.6;stroke-linecap:round"/>' +
    '<path d="M-22,-45L-28,-31M-22,-45L-16,-31M22,-49L16,-35M22,-49L28,-35" style="stroke:#a8801c;stroke-width:1"/>' +
    '<path d="M-29,-31a7,3.4 0 0 0 14,0z" style="fill:#e3ad33"/><path d="M15,-35a7,3.4 0 0 0 14,0z" style="fill:#e3ad33"/>' +
    '<circle cx="0" cy="-51" r="2.8" style="fill:#ffe18f"/>';
}
function dOppslag() {
  return '<path d="M8,64V16a24,12 0 0 1 48,0V64Z" style="fill:#6b4c34;stroke:#4a3528;stroke-width:3"/>' +
    '<path d="M20,64V8M32,64V4M44,64V8" style="stroke:#5a4030;stroke-width:1.2"/>' +
    '<rect x="17" y="20" width="30" height="32" style="fill:#f4efe2"/>' +
    '<path d="M21,27h22M21,32h18M21,37h22M21,42h14M21,47h19" style="stroke:#9a8f78;stroke-width:1.4"/>' +
    '<circle cx="32" cy="22.5" r="1.4" style="fill:#5f676e"/><circle cx="50" cy="44" r="2" style="fill:#c9a227"/>';
}
function dByste() {
  return box(.22, .22, 0, 22, STONED) +
    '<path d="M-13,-22c0,-7 5,-10 13,-10s13,3 13,10z" style="fill:#e3dfd6"/>' +
    '<path d="M-5,-31v-4h10v4z" style="fill:#d8d2c6"/>' +
    '<ellipse cx="0" cy="-42" rx="8" ry="9" style="fill:#efebe3"/>' +
    '<path d="M-7,-41c0,9 3,13 7,13s7,-4 7,-13c-2,3 -5,4 -7,4s-5,-1 -7,-4z" style="fill:#d8d2c6"/>' +
    '<path d="M-4,-44h2.6M1.4,-44h2.6" style="stroke:#8f8a80;stroke-width:1.2;stroke-linecap:round"/>';
}
function dTrylleformel() {
  return '<rect x="12" y="8" width="40" height="48" style="fill:#efe2c2"/>' +
    '<rect x="8" y="4" width="48" height="7" rx="3.5" style="fill:#c9b28a"/><rect x="8" y="53" width="48" height="7" rx="3.5" style="fill:#c9b28a"/>' +
    '<path d="M18,18h28M18,25h22M18,32h26M18,39h18" style="stroke:#8a7a5a;stroke-width:1.6"/>' +
    '<path d="M38,44l2.4,5 5.4,.6-4,3.6 1.1,5.2-4.9-2.7-4.9,2.7 1.1-5.2-4-3.6 5.4-.6z" transform="translate(0 -6)" style="fill:#6b4a8f"/>';
}
function dOrrery() {
  return cyl(.18, 0, 4, ['#5a4030', '#46301f']) +
    '<path d="M0,-4V-30" style="stroke:#a8801c;stroke-width:2.4"/>' +
    '<ellipse cx="0" cy="-34" rx="22" ry="8" style="fill:none;stroke:#c9a227;stroke-width:1.4"/>' +
    '<ellipse cx="0" cy="-34" rx="13" ry="5" style="fill:none;stroke:#c9a227;stroke-width:1.2"/>' +
    '<circle cx="0" cy="-34" r="5.4" style="fill:#ffb52e"/>' +
    '<circle cx="22" cy="-34" r="3" style="fill:#4a8fd1"/><circle cx="-9.2" cy="-30.5" r="2.4" style="fill:#d9453b"/><circle cx="-15.6" cy="-39.7" r="2.6" style="fill:#4ea06b"/>';
}
function dManefaser() {
  const y = 28, r = 8, M = '#f6e7a8', B = '#1c1f4a';
  return fr(128, 56,
    '<circle cx="20" cy="' + y + '" r="' + r + '" style="fill:none;stroke:#8f98c8;stroke-width:1.2"/>' +
    '<circle cx="42" cy="' + y + '" r="' + r + '" style="fill:' + M + '"/><circle cx="46" cy="' + y + '" r="' + r + '" style="fill:' + B + '"/>' +
    '<circle cx="64" cy="' + y + '" r="' + r + '" style="fill:none;stroke:#8f98c8;stroke-width:1.2"/><path d="M64,20a8,8 0 0 1 0,16z" style="fill:' + M + '"/>' +
    '<circle cx="86" cy="' + y + '" r="' + r + '" style="fill:' + M + '"/><circle cx="76" cy="' + y + '" r="' + r + '" style="fill:' + B + '"/>' +
    '<circle cx="108" cy="' + y + '" r="' + r + '" style="fill:' + M + '"/>', B);
}
function dTroll() {
  return '<path d="M9,-8c8,2 12,-2 13,-8" style="fill:none;stroke:#6b7d4a;stroke-width:3;stroke-linecap:round"/><circle cx="22.5" cy="-17" r="3" style="fill:#4a3528"/>' +
    '<ellipse cx="-6" cy="-2" rx="6" ry="3" style="fill:#5a6b3e"/><ellipse cx="6" cy="-2" rx="6" ry="3" style="fill:#5a6b3e"/>' +
    '<ellipse cx="0" cy="-17" rx="12" ry="15" style="fill:#7a5a3a"/>' +
    '<ellipse cx="-11" cy="-38" rx="3" ry="5" style="fill:#7a8c55"/><ellipse cx="11" cy="-38" rx="3" ry="5" style="fill:#7a8c55"/>' +
    '<circle cx="0" cy="-37" r="11" style="fill:#7a8c55"/>' +
    '<path d="M-6,-47c2,-6 4,-8 6,-8s4,3 3,8" style="fill:#4a3528"/>' +
    '<ellipse cx="3" cy="-33" rx="5" ry="7" style="fill:#8a9c62"/>' +
    '<circle cx="-4" cy="-40" r="1.6" style="fill:#1e1a24"/><circle cx="6" cy="-40" r="1.6" style="fill:#1e1a24"/>';
}
function dFlaggermussverm() {
  return fr(128, 56, '<circle cx="96" cy="24" r="14" style="fill:#f6e7a8"/>' +
    bat(26, 18, .8) + bat(48, 30, 1) + bat(70, 14, .7) + bat(92, 26, 1.1) + bat(112, 40, .6) + bat(36, 42, .6), '#2b2f5e');
}
function dGulltrone() {
  // Tegnes bakfra og fram: venstre armlene, ryggen, setet, puten, høyre armlene.
  return box(.07, .3, 0, 24, GOLDB, -.3, 0) + box(.36, .08, 0, 52, GOLDB, 0, -.22) +
    box(.23, .22, 0, 12, GOLDB, 0, .04) + box(.21, .2, 12, 3, PURPLE, 0, .04) +
    box(.07, .3, 0, 24, GOLDB, .3, 0) +
    '<g transform="translate(0 -62) scale(.45)">' + pk(0, -10, 20, 14, true) + '</g>';
}
function dKronen() {
  return '<rect x="6" y="6" width="52" height="52" rx="4" style="fill:#2b2235;stroke:#4a3528;stroke-width:4"/>' +
    '<path d="M12,44L15,20L24,31L32,14L40,31L49,20L52,44Z" style="fill:#e3ad33;stroke:#c9962a;stroke-width:1.6;stroke-linejoin:round"/>' +
    '<rect x="12" y="44" width="40" height="6" style="fill:#c9962a"/>' +
    '<circle cx="32" cy="38" r="3" style="fill:#c45050"/><circle cx="22" cy="40" r="2" style="fill:#6b4a8f"/><circle cx="42" cy="40" r="2" style="fill:#4ea06b"/>';
}

export const EXTRA_ITEMS: Record<string, RoomItem> = {
  timeglass: { n: 'Timeglasset', k: 'floor', w: 1, d: 1, f: dTimeglass, dsc: 'Ta deg tid. Kritisk tenkning handler om å ikke trekke for raske slutninger.' },
  forstorrelse: { n: 'Lupen', k: 'wall', w: 1, h: 64, f: dForstorrelse, dsc: 'Se nøye etter: Hvem er avsender, og stemmer det med andre kilder?' },
  ravn: { n: 'Ravnen', k: 'floor', w: 1, d: 1, f: dRavn, dsc: 'I norrøn mytologi het Odins ravner Hugin og Munin: tanke og minne.' },
  tavle: { n: 'Spørsmålstavla', k: 'wall', w: 2, h: 56, f: dTavle, dsc: '«Hvorfor tror du på det?» er et åpnere spørsmål enn «Hvordan kan du tro på det?»' },
  teleskop: { n: 'Teleskopet', k: 'floor', w: 1, d: 1, f: dTeleskop, dsc: 'Copernicus undersøkte himmelen og kom fram til at sola er i sentrum.' },
  stjernekart: { n: 'Solsystemkartet', k: 'wall', w: 2, h: 60, f: dStjernekart, dsc: 'Det nye verdensbildet med sola i sentrum provoserte mange på 1500-tallet.' },
  vekt: { n: 'Vekta', k: 'floor', w: 1, d: 1, f: dVekt, dsc: 'Vei argumentene for og imot før du bestemmer deg.' },
  oppslag: { n: 'Kirkedøra', k: 'wall', w: 1, h: 64, f: dOppslag, dsc: 'Martin Luther kritiserte avlatshandelen og fikk en ny retning i kristendommen.' },
  byste: { n: 'Sokrates-bysten', k: 'floor', w: 1, d: 1, f: dByste, dsc: '«Det eneste jeg vet, er at jeg ingenting vet.»' },
  trylleformel: { n: 'Trippelfilteret', k: 'wall', w: 1, h: 64, f: dTrylleformel, dsc: 'Er det sant? Er det godt? Er det nyttig?' },
  orrery: { n: 'Planetmodellen', k: 'floor', w: 1, d: 1, f: dOrrery, dsc: 'Copernicus kombinerte naturvitenskap og tro: Gud skapte verden etter et matematisk mønster.' },
  manefaser: { n: 'Månefasene', k: 'wall', w: 2, h: 56, f: dManefaser, dsc: 'Månen ser forskjellig ut fra natt til natt, men det er samme måne. Ulike perspektiver på samme sak.' },
  troll: { n: 'Trollet', k: 'floor', w: 1, d: 1, f: dTroll, dsc: 'Troll sprekker i sola. Rykter og usannheter tåler heller ikke å bli sett i lyset.' },
  flaggermussverm: { n: 'Nattsvermen', k: 'wall', w: 2, h: 56, f: dFlaggermussverm, dsc: 'Følg ikke flokken blindt. Tenk selv.' },
  gulltrone: { n: 'Gulltronen', k: 'floor', w: 1, d: 1, f: dGulltrone, dsc: 'Bare de mest utholdende får sitte her. Du er en halloweenlegende.' },
  kronen: { n: 'Kronen', k: 'wall', w: 1, h: 64, f: dKronen, dsc: 'Den høyeste utmerkelsen i Kritiskpuggen. Fortsett å samle stjerner.' },
};

export const EXTRA_LEVELS: Level[] = [
  { n: 'Gjenferd', xp: 460, t: ['timeglass', 'forstorrelse'] },
  { n: 'Spøkelsesjeger', xp: 580, t: ['ravn', 'tavle'] },
  { n: 'Trollmann', xp: 720, t: ['teleskop', 'stjernekart'] },
  { n: 'Lyktebærer', xp: 880, t: ['vekt', 'oppslag'] },
  { n: 'Draugen', xp: 1060, t: ['byste', 'trylleformel'] },
  { n: 'Månevokter', xp: 1260, t: ['orrery', 'manefaser'] },
  { n: 'Skyggemester', xp: 1500, t: ['troll', 'flaggermussverm'] },
  { n: 'Halloweenlegende', xp: 1800, t: ['gulltrone', 'kronen'] },
];
