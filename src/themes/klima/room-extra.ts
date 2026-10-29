// Nivå 9–16 i Klimapuggen: to nye trofeer per nivå.
import { box, cyl, COL } from '../../app/room/iso';
import { fr, dPokal, WOODD } from './room';
import type { RoomItem, Level } from '../types';

function dSolcelle() {
  return cyl(.12, 0, 3, ['#a3b0b9', '#6c7a85']) +
    '<path d="M-5,-3V-18M5,-3V-13" style="stroke:#8f9ca6;stroke-width:2.4"/>' +
    '<path d="M-26,-22L4,-36L26,-22L-4,-8Z" style="fill:#2b4f8a;stroke:#c3cbce;stroke-width:1.6;stroke-linejoin:round"/>' +
    '<path d="M-15,-15L15,-29M-11,-29L11,-15" style="stroke:#7fa7d8;stroke-width:1"/>' +
    '<path d="M-20,-24.8L-1,-33.6" style="stroke:#cfe1f6;stroke-width:1.4;opacity:.7"/>';
}
function dSol() {
  let r = '';
  for (let i = 0; i < 12; i++) r += '<path d="M32,6V14" transform="rotate(' + i * 30 + ' 32 32)" style="stroke:#f2a516;stroke-width:3;stroke-linecap:round"/>';
  return fr(64, 64, r + '<circle cx="32" cy="32" r="12" style="fill:#ffd25a;stroke:#f2a516;stroke-width:2"/>', '#cdeafb');
}
function dBikube() {
  const Y = ['#f2c230', '#d9a915', '#b8900f'];
  return box(.26, .26, 0, 4, WOODD) + box(.23, .23, 4, 10, Y) + box(.23, .23, 14, 10, Y) + box(.27, .27, 24, 3, COL.wood) +
    '<rect x="-4" y="-9" width="8" height="2.4" rx="1.2" style="fill:#3a2a1c"/>' +
    '<g style="fill:#2b2b2b"><ellipse cx="16" cy="-36" rx="2.6" ry="1.8"/><ellipse cx="-14" cy="-40" rx="2.6" ry="1.8"/></g>' +
    '<g style="fill:#fff;opacity:.85"><ellipse cx="15" cy="-38" rx="1.6" ry="1"/><ellipse cx="-15" cy="-42" rx="1.6" ry="1"/></g>';
}
function dBlomster() {
  const f = (x: number, y: number, c: string) => {
    let p = '';
    for (let i = 0; i < 5; i++) p += '<ellipse cx="' + x + '" cy="' + (y - 5) + '" rx="3" ry="5" transform="rotate(' + i * 72 + ' ' + x + ' ' + y + ')" style="fill:' + c + '"/>';
    return '<path d="M' + x + ',' + y + 'V52" style="stroke:#3d8556;stroke-width:2"/>' + p + '<circle cx="' + x + '" cy="' + y + '" r="2.6" style="fill:#f2c230"/>';
  };
  return fr(128, 56, f(22, 24, '#d9453b') + f(46, 30, '#7a5aa6') + f(70, 20, '#f08a24') + f(94, 28, '#e85a9a') + f(112, 22, '#3b9ad9') +
    '<path d="M4,52h120" style="stroke:#4ea06b;stroke-width:4"/>', '#eaf6e4');
}
function dFyr() {
  return cyl(.32, 0, 5, COL.stone) +
    '<path d="M-10,-5L-6,-48H6L10,-5Z" style="fill:#f4f6f6"/>' +
    '<path d="M-9.1,-15L-8.2,-25H8.2L9.1,-15Z" style="fill:#d9453b"/><path d="M-7.3,-35L-6.6,-43H6.6L7.3,-35Z" style="fill:#d9453b"/>' +
    '<rect x="-7" y="-56" width="14" height="8" style="fill:#ffd25a;stroke:#333e47;stroke-width:1.2"/>' +
    '<path d="M-9,-56L0,-64L9,-56Z" style="fill:#333e47"/>' +
    '<path d="M7,-53L26,-58V-48Z" style="fill:#fff2b0;opacity:.6"/>';
}
function dHval() {
  return fr(128, 56, '<rect x="4" y="4" width="120" height="48" style="fill:#3c7fa6"/>' +
    '<path d="M4,18c20,-6 40,6 60,0s40,-6 60,0V4H4z" style="fill:#bfe3f2"/>' +
    '<path d="M28,36c4,-12 34,-14 52,-6c6,3 10,2 14,-4l6,-6c0,8 -2,12 -8,16c4,2 8,6 8,10c-8,-4 -12,-4 -18,-2c-18,6 -48,6 -54,-8z" style="fill:#24506e"/>' +
    '<path d="M32,40c10,4 30,4 44,0" style="fill:none;stroke:#cfe3ef;stroke-width:2"/><circle cx="38" cy="33" r="1.6" style="fill:#fff"/>' +
    '<path d="M44,22c-2,-6 2,-10 0,-14M44,22c2,-5 6,-6 6,-10" style="fill:none;stroke:#e9f6fc;stroke-width:1.6;stroke-linecap:round"/>');
}
function dVarde() {
  const S = (cy: number, rx: number, ry: number, c: string) => '<ellipse cx="0" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" style="fill:' + c + '"/>';
  return S(-5, 20, 8, '#8f9ca6') + S(-15, 16, 7, '#a3b0b9') + S(-25, 13, 6, '#7d8a94') + S(-34, 10, 5, '#b7c3cb') + S(-42, 7, 4, '#8f9ca6') + S(-48, 4, 3, '#a3b0b9');
}
function dKompass() {
  return '<circle cx="32" cy="32" r="27" style="fill:#f4efe2;stroke:#8a6735;stroke-width:5"/>' +
    '<path d="M32,10L37,32L32,54L27,32Z" style="fill:#d9453b"/><path d="M32,32L37,32L32,54L27,32Z" style="fill:#333e47"/>' +
    '<path d="M10,32L32,28L54,32L32,36Z" style="fill:#8f9ca6"/><circle cx="32" cy="32" r="2.4" style="fill:#c9962a"/>' +
    '<text x="32" y="9.5" text-anchor="middle" style="font:700 6px Georgia,serif;fill:#333e47">N</text>';
}
function dReinsdyr() {
  return '<path d="M-10,-6V-18M-4,-6V-18M6,-6V-18M12,-6V-18" style="stroke:#6b4a2b;stroke-width:3;stroke-linecap:round"/>' +
    '<ellipse cx="1" cy="-22" rx="15" ry="8" style="fill:#8a6440"/><ellipse cx="1" cy="-20" rx="11" ry="4" style="fill:#c9a27a"/>' +
    '<path d="M12,-26L18,-38" style="stroke:#8a6440;stroke-width:6;stroke-linecap:round"/>' +
    '<ellipse cx="22" cy="-40" rx="6" ry="4" style="fill:#8a6440"/><circle cx="27" cy="-39.5" r="1.6" style="fill:#2b2b2b"/>' +
    '<path d="M18,-43c-2,-6 -8,-8 -10,-14M14,-50l-4,-2M20,-43c2,-6 0,-12 4,-16M23,-53l4,-1" style="fill:none;stroke:#d9c7a8;stroke-width:1.8;stroke-linecap:round"/>';
}
function dNordlys() {
  return fr(128, 60, '<rect x="4" y="4" width="120" height="52" style="fill:#0f1a33"/>' +
    '<path d="M4,34C24,10 44,30 64,18S104,6 124,22V4H4z" style="fill:#3ccf8e;opacity:.55"/>' +
    '<path d="M4,40C30,22 50,38 74,28S108,20 124,32V22C104,8 84,28 64,22S24,18 4,34z" style="fill:#7a5aa6;opacity:.45"/>' +
    '<path d="M4,56V46l18,-8 14,6 20,-12 22,14 16,-8 30,10V56z" style="fill:#0a1224"/>' +
    '<circle cx="20" cy="12" r="1" style="fill:#fff"/><circle cx="98" cy="40" r="1" style="fill:#fff"/><circle cx="58" cy="46" r=".8" style="fill:#fff"/>');
}
function dSymaskin() {
  const W = ['#f4f6f6', '#d6dde0', '#b7c3cb'];
  return box(.4, .28, 0, 4, WOODD) + box(.34, .2, 4, 6, W) +
    box(.08, .16, 10, 22, W, .24, 0) + box(.32, .12, 26, 7, W, 0, 0) +
    '<path d="M-14,-24v8" style="stroke:#8f9ca6;stroke-width:2"/><circle cx="16" cy="-40" r="3.4" style="fill:#d9453b"/>' +
    '<path d="M-26,-12c8,-3 16,1 24,-2" style="fill:none;stroke:#3b9ad9;stroke-width:3;stroke-linecap:round"/>';
}
function dLappeteppe() {
  const c = ['#d9453b', '#f2c230', '#3b9ad9', '#4fae6b', '#e8742a', '#7a5aa6', '#f4efe2', '#2e6f93'];
  let s = '';
  for (let r = 0; r < 4; r++) for (let k = 0; k < 9; k++) s += '<rect x="' + (10 + k * 12) + '" y="' + (6 + r * 11) + '" width="12" height="11" style="fill:' + c[(r * 3 + k * 5) % c.length] + ';stroke:#fff;stroke-width:1;stroke-dasharray:2 1.4"/>';
  return '<path d="M4,4h120" style="stroke:#8a6735;stroke-width:4;stroke-linecap:round"/>' + s;
}
function dTreplante() {
  return '<ellipse cx="0" cy="-2" rx="20" ry="9" style="fill:#7a5a3a"/><ellipse cx="0" cy="-4" rx="15" ry="6" style="fill:#8a6a48"/>' +
    '<path d="M0,-4V-28" style="stroke:#6b4a2b;stroke-width:2.6"/>' +
    '<ellipse cx="-7" cy="-24" rx="7" ry="4" transform="rotate(-25 -7 -24)" style="fill:#4fae6b"/>' +
    '<ellipse cx="7" cy="-30" rx="7" ry="4" transform="rotate(25 7 -30)" style="fill:#3d8556"/>' +
    '<ellipse cx="0" cy="-34" rx="4" ry="6" style="fill:#6cc08a"/>' +
    '<path d="M18,-6L24,-40" style="stroke:#8a6735;stroke-width:2.4;stroke-linecap:round"/><path d="M15,-8l6,1 -1,7 -7,-1z" style="fill:#a3b0b9"/>';
}
function dBlad() {
  return fr(64, 64, '<path d="M14,52C10,26 30,10 52,12C54,34 40,54 14,52z" style="fill:#4fae6b"/>' +
    '<path d="M14,52C24,40 34,28 50,14M26,40l-2,-10M32,34l6,2M38,27l-2,-8M42,23l6,1" style="fill:none;stroke:#2d7a47;stroke-width:1.6;stroke-linecap:round"/>', '#eaf6e4');
}
function dJordpokal() {
  return dPokal() + '<circle cx="0" cy="-56" r="10" style="fill:#2e86c1"/>' +
    '<path d="M-6,-61c3,-3 7,-3 8,0 1,3 -2,4 -4,6 -2,2 -5,0 -4,-6z" style="fill:#4fae6b"/><path d="M2,-53c3,-1 6,0 6,3 -1,3 -3,4 -5,5 -1,-2 -3,-4 -1,-8z" style="fill:#4fae6b"/>';
}
function dGullstjerne() {
  return '<circle cx="32" cy="32" r="28" style="fill:#2e6f93;stroke:#c9962a;stroke-width:4"/>' +
    '<path d="M32,10l6.5,13.2 14.5,2.1-10.5,10.2 2.5,14.5-13-6.8-13,6.8 2.5-14.5-10.5-10.2 14.5-2.1z" style="fill:#ffd25a;stroke:#e3ad33;stroke-width:1.6;stroke-linejoin:round"/>';
}

export const EXTRA_ITEMS: Record<string, RoomItem> = {
  solcelle: { n: 'Solcellepanelet', k: 'floor', w: 1, d: 1, f: dSolcelle, dsc: 'Fornybar energi fra sola erstatter kull og olje.' },
  sol: { n: 'Sola', k: 'wall', w: 1, h: 64, f: dSol, dsc: 'Solenergi er fornybar. Sola går ikke tom.' },
  bikube: { n: 'Bikuben', k: 'floor', w: 1, d: 1, f: dBikube, dsc: 'Bier pollinerer plantene vi spiser. Artsmangfoldet må beskyttes.' },
  blomster: { n: 'Blomsterengen', k: 'wall', w: 2, h: 56, f: dBlomster, dsc: 'Et rikt artsmangfold er en del av miljø- og klimadimensjonen.' },
  fyr: { n: 'Fyrtårnet', k: 'floor', w: 1, d: 1, f: dFyr, dsc: 'Et lys som viser vei, slik bærekraftsmålene viser vei mot framtiden.' },
  hval: { n: 'Hvalen', k: 'wall', w: 2, h: 56, f: dHval, dsc: 'Korallrev dør i varmt hav, og hele økosystemer ødelegges.' },
  varde: { n: 'Varden', k: 'floor', w: 1, d: 1, f: dVarde, dsc: 'Stein på stein. Små tiltak bygger opp til store endringer.' },
  kompass: { n: 'Kompasset', k: 'wall', w: 1, h: 64, f: dKompass, dsc: 'Parisavtalen er et felles kompass: under 2 grader, helst 1,5.' },
  reinsdyr: { n: 'Reinsdyret', k: 'floor', w: 1, d: 1, f: dReinsdyr, dsc: 'Når det blir varmere, mister arter leveområdene sine på polene.' },
  nordlys: { n: 'Nordlyset', k: 'wall', w: 2, h: 60, f: dNordlys, dsc: 'Natur vi vil ta vare på for kommende generasjoner.' },
  symaskin: { n: 'Symaskinen', k: 'floor', w: 1, d: 1, f: dSymaskin, dsc: 'Reparer i stedet for å kjøpe nytt. Det motsatte av fast fashion.' },
  lappeteppe: { n: 'Lappeteppet', k: 'wall', w: 2, h: 56, f: dLappeteppe, dsc: 'Gamle klær kan bli noe nytt i stedet for å havne i Atacama-ørkenen.' },
  treplante: { n: 'Treplanten', k: 'floor', w: 1, d: 1, f: dTreplante, dsc: 'Bærekraftig skogdrift: felle skånsomt og plante nye trær.' },
  blad: { n: 'Bladet', k: 'wall', w: 1, h: 64, f: dBlad, dsc: 'Skogen er jordas lunger.' },
  jordpokal: { n: 'Jordpokalen', k: 'floor', w: 1, d: 1, f: dJordpokal, dsc: 'Du er en klimalegende. Hvert tiltak teller.' },
  gullstjerne: { n: 'Gullstjernen', k: 'wall', w: 1, h: 64, f: dGullstjerne, dsc: 'Den høyeste utmerkelsen i Klimapuggen. Fortsett å samle stjerner.' },
};

export const EXTRA_LEVELS: Level[] = [
  { n: 'Solfanger', xp: 460, t: ['solcelle', 'sol'] },
  { n: 'Pollinator', xp: 580, t: ['bikube', 'blomster'] },
  { n: 'Havvokter', xp: 720, t: ['fyr', 'hval'] },
  { n: 'Fjellvandrer', xp: 880, t: ['varde', 'kompass'] },
  { n: 'Nordlysjeger', xp: 1060, t: ['reinsdyr', 'nordlys'] },
  { n: 'Gjenbruker', xp: 1260, t: ['symaskin', 'lappeteppe'] },
  { n: 'Skogplanter', xp: 1500, t: ['treplante', 'blad'] },
  { n: 'Klimalegende', xp: 1800, t: ['jordpokal', 'gullstjerne'] },
];
