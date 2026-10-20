import { iso, pts, poly, box, cyl, cone, COL } from '../../app/room/iso';
import type { RoomItem, Level, Placement } from '../types';

function f1(n) { return Math.round(n * 10) / 10; }
function flame(y) { return '<ellipse cx="0" cy="' + f1(y - 3.4) + '" rx="1.9" ry="3.6" style="fill:#ffb52e"/><ellipse cx="0" cy="' + f1(y - 2.6) + '" rx=".9" ry="1.8" style="fill:#fff2b0"/>'; }
function pk(x, y, rx, ry, face) {
  var s = '<ellipse cx="' + x + '" cy="' + y + '" rx="' + rx + '" ry="' + ry + '" style="fill:#d9681a"/>' +
    '<ellipse cx="' + f1(x - rx * .45) + '" cy="' + y + '" rx="' + f1(rx * .5) + '" ry="' + f1(ry * .95) + '" style="fill:#ec7d22"/>' +
    '<ellipse cx="' + f1(x + rx * .45) + '" cy="' + y + '" rx="' + f1(rx * .5) + '" ry="' + f1(ry * .95) + '" style="fill:#ec7d22"/>' +
    '<ellipse cx="' + x + '" cy="' + y + '" rx="' + f1(rx * .38) + '" ry="' + ry + '" style="fill:#f6943a"/>' +
    '<path d="M' + x + ',' + f1(y - ry + 1.5) + 'q1,' + f1(-ry * .45) + ' ' + f1(rx * .25) + ',' + f1(-ry * .5) + '" style="fill:none;stroke:#4a6b2a;stroke-width:' + f1(Math.max(2, rx * .16)) + ';stroke-linecap:round"/>';
  if (face) {
    var e = rx * .22;
    s += '<path d="M' + f1(x - rx * .48) + ',' + f1(y - ry * .02) + 'l' + f1(e) + ',' + f1(-e * 1.4) + 'l' + f1(e) + ',' + f1(e * 1.4) + 'zM' + f1(x + rx * .04) + ',' + f1(y - ry * .02) + 'l' + f1(e) + ',' + f1(-e * 1.4) + 'l' + f1(e) + ',' + f1(e * 1.4) + 'z" style="fill:#ffd25a"/>' +
      '<path d="M' + f1(x - rx * .5) + ',' + f1(y + ry * .22) + 'Q' + x + ',' + f1(y + ry * .85) + ' ' + f1(x + rx * .5) + ',' + f1(y + ry * .22) + 'L' + f1(x + rx * .3) + ',' + f1(y + ry * .36) + 'L' + f1(x + rx * .12) + ',' + f1(y + ry * .22) + 'L' + f1(x - rx * .08) + ',' + f1(y + ry * .38) + 'L' + f1(x - rx * .28) + ',' + f1(y + ry * .22) + 'Z" style="fill:#ffd25a"/>';
  }
  return s;
}
function bat(x, y, k?, c?) {
  k = k || 1;
  var P = [[0, 2], [-3, -3], [-8, -4], [-11, -1], [-8, 0], [-7, 3], [-7, 5], [-5, 3], [-3, 3], [-1, 5], [0, 3], [1, 5], [3, 3], [5, 3], [7, 5], [7, 3], [8, 0], [11, -1], [8, -4], [3, -3]];
  var d = 'M' + P.map(function (p) { return f1(x + p[0] * k) + ',' + f1(y + p[1] * k); }).join('L') + 'Z';
  return '<path d="' + d + '" style="fill:' + (c || '#1e1a24') + '"/><path d="M' + f1(x - 2 * k) + ',' + f1(y - 2 * k) + 'l' + f1(-.5 * k) + ',' + f1(-2.5 * k) + 'l' + f1(1.5 * k) + ',' + f1(1.5 * k) + 'zM' + f1(x + 2 * k) + ',' + f1(y - 2 * k) + 'l' + f1(.5 * k) + ',' + f1(-2.5 * k) + 'l' + f1(-1.5 * k) + ',' + f1(1.5 * k) + 'z" style="fill:' + (c || '#1e1a24') + '"/>';
}
var FAB = ['#6b4a8f', '#553a73', '#432d5c'], CUSH = ['#8a64b0', '#6f4f93', '#5a3f7a'], PIL = ['#f08a24', '#cf6f12', '#a8580c'],
  CHAIR = ['#a33a3a', '#842d2d', '#6a2323'], CHAIRS = ['#c45050', '#a33a3a', '#842d2d'],
  DARK = ['#47404f', '#332d3a', '#26212c'], DARKL = ['#3a3540', '#2a2630', '#1f1c24'],
  WOODD = ['#5a4030', '#46301f', '#352416'], STONED = ['#9aa3ab', '#7d868e', '#5f676e'], GOLD = ['#ffe18f', '#e3ad33'];
function fv(u0, u1, v, z0, z1, c) { return poly([iso(u0, v, z1), iso(u1, v, z1), iso(u1, v, z0), iso(u0, v, z0)], c); }
function rectF(hw, hd, z, c) { return poly([iso(-hw, -hd, z), iso(hw, -hd, z), iso(hw, hd, z), iso(-hw, hd, z)], c); }
function rectO(hw, hd, z, c) { return '<polygon points="' + pts([iso(-hw, -hd, z), iso(hw, -hd, z), iso(hw, hd, z), iso(-hw, hd, z)]) + '" style="fill:none;stroke:' + c + ';stroke-width:1.2"/>'; }
function at(x, y, s) { return '<g transform="translate(' + x + ' ' + y + ')">' + s + '</g>'; }

/* møbler */
function dSofa() {
  return box(1.45, .45, 0, 9, FAB) + box(1.45, .14, 9, 26, FAB, 0, -.31) + box(.13, .45, 9, 13, FAB, -1.32, 0) +
    box(1.18, .32, 9, 6, CUSH, 0, .06) + box(.2, .09, 15, 15, PIL, -.8, -.12) + box(.13, .45, 9, 13, FAB, 1.32, 0);
}
function dLenestol() {
  return box(.42, .42, 0, 9, CHAIR) + box(.42, .12, 9, 30, CHAIR, 0, -.3) + box(.1, .42, 9, 15, CHAIR, -.32, 0) +
    box(.22, .3, 9, 5, CHAIRS, 0, .04) + box(.1, .42, 9, 15, CHAIR, .32, 0);
}
function dBord() {
  var legs = '', p = [[-.8, -.3], [.8, -.3], [-.8, .3], [.8, .3]];
  p.sort(function (a, b) { return (a[0] + a[1]) - (b[0] + b[1]); });
  p.forEach(function (q) { legs += box(.05, .05, 0, 12, DARKL, q[0], q[1]); });
  return legs + box(.9, .4, 12, 3, WOODD) +
    at(-22, -15, cyl(.05, 0, 12, ['#f4eedd', '#d9cfb6']) + flame(-12)) + at(-13, -13, cyl(.05, 0, 8, ['#f4eedd', '#d9cfb6']) + flame(-8)) +
    at(16, -15, cyl(.2, 0, 5, ['#6b4a8f', '#553a73']) + '<circle cx="-4" cy="-6" r="2.4" style="fill:#f08a24"/><circle cx="2" cy="-7" r="2.4" style="fill:#4ea06b"/><circle cx="5" cy="-5" r="2" style="fill:#d9453b"/>');
}
function dHylle() {
  var s = box(.95, .26, 0, 72, WOODD) + fv(-.86, .86, .26, 4, 68, '#24180f');
  var bk = ['#6b4a8f', '#f08a24', '#3e7d4a', '#a33a3a', '#2b2b3a', '#c9a227', '#4a6fa0'];
  for (var r = 0; r < 3; r++) {
    var z = 6 + r * 21, u = -.8, i = 0;
    s += fv(-.9, .9, .26, z - 2, z, '#6b4c34');
    while (u < .72) {
      var w = .09 + ((r * 3 + i) % 3) * .03, h = 12 + ((i * 5 + r * 3) % 4) * 2;
      s += fv(u, u + w, .26, z, z + h, bk[(i + r * 2) % bk.length]); u += w + .01; i++;
    }
  }
  return s + fv(-.9, .9, .26, 65, 67, '#6b4c34');
}
function dTv() {
  return box(.95, .3, 0, 16, WOODD) + fv(-.85, -.05, .3, 3, 14, '#24180f') + fv(.05, .85, .3, 3, 14, '#24180f') +
    box(.12, .05, 16, 4, DARK) + box(.72, .05, 20, 34, DARK) +
    fv(-.64, .64, .1, 23, 51, '#23284f') + fv(-.64, .64, .1, 23, 30, '#3a2a4a') +
    poly([iso(.25, .1, 49), iso(.4, .1, 49), iso(.4, .1, 44), iso(.25, .1, 44)], '#f6e7a8') +
    poly([iso(-.3, .1, 40), iso(-.1, .1, 40), iso(-.1, .1, 30), iso(-.3, .1, 30)], '#f4f1f8');
}
function dLampe() {
  return cyl(.16, 0, 3, DARKL) + cyl(.025, 3, 48, ['#e3ad33', '#a8801c']) +
    '<path d="M-15,-58V-54Q-15,-49 0,-49Q15,-49 15,-54V-58" style="fill:none;stroke:#c9962a;stroke-width:2.6"/>' +
    at(-15, -58, '<rect x="-2" y="-9" width="4" height="9" style="fill:#f4eedd"/>' + flame(-9)) +
    at(15, -58, '<rect x="-2" y="-9" width="4" height="9" style="fill:#f4eedd"/>' + flame(-9)) +
    at(0, -51, '<rect x="-2" y="-12" width="4" height="12" style="fill:#f4eedd"/>' + flame(-12));
}
function dPlante() {
  function head(x, y, r) {
    return '<path d="M' + (x - 9) + ',' + y + 'A9,6 0 0 1 ' + (x + 9) + ',' + y + 'Z" transform="rotate(' + r + ' ' + x + ' ' + y + ')" style="fill:#3d8556"/>' +
      '<path d="M' + (x - 9) + ',' + (y + 1) + 'A9,6 0 0 0 ' + (x + 9) + ',' + (y + 1) + 'Z" transform="rotate(' + r + ' ' + x + ' ' + y + ')" style="fill:#c23a3a"/>' +
      '<path d="M' + (x - 6) + ',' + y + 'l1.5,2 1.5,-2 1.5,2 1.5,-2 1.5,2 1.5,-2 1.5,2 1.5,-2" transform="rotate(' + r + ' ' + x + ' ' + y + ')" style="fill:none;stroke:#f4f1f8;stroke-width:1"/>';
  }
  return cyl(.22, 0, 16, ['#6b4a8f', '#553a73']) +
    '<path d="M-2,-16C-6,-26 -12,-30 -14,-38M2,-16C4,-30 10,-36 12,-46M0,-16C0,-24 -1,-28 0,-30" style="fill:none;stroke:#3d8556;stroke-width:2.4"/>' +
    head(-14, -40, -20) + head(12, -48, 15) + head(0, -32, 0);
}
function dPuff() {
  return cyl(.32, 0, 14, ['#f6a04a', '#e07a1c']) + '<path d="M-7,-14V1.5M7,-14V1.5M-12,-12V-.5M12,-12V-.5" style="stroke:#c4661a;stroke-width:1.4"/>' +
    '<ellipse cx="0" cy="-14" rx="9" ry="4.5" style="fill:#fbbd78"/><path d="M0,-15q1,-5 5,-6" style="fill:none;stroke:#4a6b2a;stroke-width:2.6;stroke-linecap:round"/>';
}
function dTeppeA() {
  var s = rectF(1.5, 1, 1, '#2b2235') + rectF(1.36, .86, 1, '#3d3150'), c = iso(0, 0, 1), P = [];
  [[-1.36, -.86], [0, -.86], [1.36, -.86], [1.36, 0], [1.36, .86], [0, .86], [-1.36, .86], [-1.36, 0]].forEach(function (q) { P.push(iso(q[0], q[1], 1)); });
  s += '<path d="' + P.map(function (q) { return 'M' + c[0] + ',' + c[1] + 'L' + q[0].toFixed(1) + ',' + q[1].toFixed(1); }).join('') + '" style="stroke:#cfc6dc;stroke-width:1.1;fill:none"/>';
  [.3, .6, .9].forEach(function (k) { s += rectO(1.36 * k, .86 * k, 1, '#cfc6dc'); });
  return s;
}
function dTeppeB() {
  return '<ellipse cx="0" cy="0" rx="86" ry="43" style="fill:#2b2f5e"/><ellipse cx="0" cy="0" rx="78" ry="39" style="fill:#3a3f78"/>' +
    '<ellipse cx="-12" cy="0" rx="36" ry="18" style="fill:#f6e7a8"/><ellipse cx="0" cy="-3" rx="32" ry="16" style="fill:#3a3f78"/>' +
    '<circle cx="34" cy="-14" r="2.4" style="fill:#f6e7a8"/><circle cx="48" cy="6" r="1.8" style="fill:#f6e7a8"/><circle cx="22" cy="18" r="2" style="fill:#f6e7a8"/><circle cx="-44" cy="-20" r="1.6" style="fill:#f6e7a8"/>';
}
function dTeppeC() {
  var s = rectF(.45, 1.5, 1, '#5a3f7a');
  for (var i = 0; i < 5; i++) s += poly([iso(-.45, -1.5 + i * .6 + .1, 1), iso(.45, -1.5 + i * .6 + .1, 1), iso(.45, -1.5 + i * .6 + .3, 1), iso(-.45, -1.5 + i * .6 + .3, 1)], '#f08a24');
  return s;
}

/* trofeer: gulv */
function dGresskar() { return pk(0, -14, 20, 14, true); }
function dSvartkatt() {
  return '<path d="M9,-5c13,1 15,-14 6,-22" style="fill:none;stroke:#1e1a24;stroke-width:4;stroke-linecap:round"/>' +
    '<ellipse cx="0" cy="-14" rx="11" ry="14" style="fill:#1e1a24"/><circle cx="0" cy="-33" r="9" style="fill:#2a2433"/>' +
    '<path d="M-8.5,-36l.5,-11 6.5,5.5zM8.5,-36l-.5,-11 -6.5,5.5z" style="fill:#2a2433"/>' +
    '<ellipse cx="-3.6" cy="-34" rx="2.2" ry="2.8" style="fill:#f6d32a"/><ellipse cx="3.6" cy="-34" rx="2.2" ry="2.8" style="fill:#f6d32a"/>' +
    '<rect x="-4" y="-36.2" width=".9" height="4.4" style="fill:#1e1a24"/><rect x="3.2" y="-36.2" width=".9" height="4.4" style="fill:#1e1a24"/>' +
    '<path d="M-1.2,-30h2.4l-1.2,1.4z" style="fill:#e58aa0"/>';
}
function dKost() {
  return '<path d="M-14,-68L6,-18" style="stroke:#8a5a2b;stroke-width:3.6;stroke-linecap:round"/>' +
    '<path d="M2,-22L18,-2L8,3L-3,-15Z" style="fill:#c9a227"/><path d="M5,-14l9,10M2,-11l7,13M8,-16l9,8" style="stroke:#a8801c;stroke-width:1.2"/>' +
    '<path d="M0,-20l7,-4" style="stroke:#6b4a8f;stroke-width:3.4;stroke-linecap:round"/>';
}
function dLykt() {
  return box(.2, .2, 0, 4, DARKL) + cyl(.15, 4, 18, ['rgba(255,214,120,.95)', 'rgba(246,176,66,.92)']) +
    '<circle cx="0" cy="-13" r="3.6" style="fill:#fff2b0"/>' +
    '<path d="M-6.75,-4V-22M6.75,-4V-22M0,-1V-19" style="stroke:#2a2630;stroke-width:1.6"/>' +
    cone(.2, 22, 9, '#2a2630') + '<path d="M-3.5,-33a3.5,3.5 0 0 1 7,0" style="fill:none;stroke:#2a2630;stroke-width:2"/>';
}
function dSpokelse() {
  return '<path d="M-15,-8V-38a15,15 0 0 1 30,0V-8l-5,-4-5,4-5,-4-5,4-5,-4z" style="fill:#f4f1f8;stroke:#b9aed0;stroke-width:1.5;stroke-linejoin:round"/>' +
    '<path d="M-15,-28c-6,0 -9,-4 -9,-9M15,-28c6,0 9,-4 9,-9" style="fill:none;stroke:#f4f1f8;stroke-width:4;stroke-linecap:round"/>' +
    '<ellipse cx="-5" cy="-38" rx="2.4" ry="3.4" style="fill:#1e1a24"/><ellipse cx="5" cy="-38" rx="2.4" ry="3.4" style="fill:#1e1a24"/><ellipse cx="0" cy="-28" rx="3" ry="4" style="fill:#1e1a24"/>';
}
function dGravstein() {
  var sh = 'M-14,-4V-30a14,12 0 0 1 28,0V-4z';
  return box(.34, .16, 0, 4, STONED) + '<path d="' + sh + '" transform="translate(4 -2)" style="fill:#6f777e"/><path d="' + sh + '" style="fill:#9aa3ab"/>' +
    '<text x="0" y="-19" text-anchor="middle" style="font:700 8px Georgia,serif;fill:#5b6369">RIP</text>' +
    '<path d="M6,-34l-3,6 3,3-2,5" style="fill:none;stroke:#6f777e;stroke-width:1"/>' +
    '<path d="M-20,-1l2,-7 2,7M16,-1l2,-8 2,8" style="fill:none;stroke:#4a6b2a;stroke-width:1.6"/>';
}
function dUgle() {
  return cyl(.18, 0, 7, ['#a07a50', '#7a5a3a']) +
    '<ellipse cx="0" cy="-24" rx="12" ry="15" style="fill:#8a6440"/><ellipse cx="-10" cy="-21" rx="4" ry="10" style="fill:#6b4a2b"/><ellipse cx="10" cy="-21" rx="4" ry="10" style="fill:#6b4a2b"/>' +
    '<ellipse cx="0" cy="-19" rx="7" ry="9" style="fill:#c9a27a"/><path d="M-10,-35l-3,-9 8,4zM10,-35l3,-9 -8,4z" style="fill:#8a6440"/>' +
    '<circle cx="-5" cy="-31" r="5" style="fill:#fff"/><circle cx="5" cy="-31" r="5" style="fill:#fff"/><circle cx="-5" cy="-31" r="2.8" style="fill:#f08a24"/><circle cx="5" cy="-31" r="2.8" style="fill:#f08a24"/>' +
    '<circle cx="-5" cy="-31" r="1.3" style="fill:#1e1a24"/><circle cx="5" cy="-31" r="1.3" style="fill:#1e1a24"/><path d="M-2,-27h4l-2,4z" style="fill:#e3ad33"/>' +
    '<path d="M-5,-9v2M-3,-9v2M3,-9v2M5,-9v2" style="stroke:#e3ad33;stroke-width:1.6;stroke-linecap:round"/>';
}
function dBokstabel() {
  return box(.36, .24, 0, 6, ['#7a5aa6', '#5f4589', '#4b366e']) + box(.32, .22, 6, 6, ['#4ea06b', '#3d8556', '#2e6b43'], .03, 0) + box(.34, .2, 12, 5, ['#c45050', '#a33a3a', '#842d2d'], -.02, .01) +
    at(0, -17, '<path d="M-6,0a6,3 0 0 0 12,0z" style="fill:#e3ad33"/>' + cyl(.05, 0, 10, ['#f4eedd', '#d9cfb6']) + flame(-10) + '<path d="M2.2,-4v4" style="stroke:#f4eedd;stroke-width:1.6;stroke-linecap:round"/>');
}
function dGryte() {
  return '<path d="M-14,-4l-3,5M14,-4l3,5M0,-1v4" style="stroke:#1f1c24;stroke-width:3;stroke-linecap:round"/>' +
    '<ellipse cx="0" cy="-14" rx="20" ry="14" style="fill:#2a2630"/><path d="M-14,-18a14,10 0 0 0 6,10" style="fill:none;stroke:#4a4552;stroke-width:2;stroke-linecap:round"/>' +
    '<ellipse cx="0" cy="-24" rx="19" ry="6" style="fill:#3a3540"/><ellipse cx="0" cy="-24" rx="15" ry="4.2" style="fill:#6cc04a"/>' +
    '<circle cx="-5" cy="-26" r="2" style="fill:#9be27a"/><circle cx="4" cy="-30" r="2.6" style="fill:#9be27a"/><circle cx="9" cy="-36" r="1.6" style="fill:#9be27a"/>' +
    '<path d="M-2,-32c-4,-6 4,-8 0,-14M6,-40c-3,-4 3,-6 0,-10" style="fill:none;stroke:#b8e6a6;stroke-width:1.6;opacity:.7;stroke-linecap:round"/>';
}
function dKrystallkule() {
  return box(.24, .24, 0, 6, WOODD) + cyl(.12, 6, 3, GOLD) +
    '<circle cx="0" cy="-25" r="15" style="fill:rgba(150,110,215,.82)"/>' +
    '<path d="M-7,-22c1,-7 11,-8 11,-1s-9,5 -7,-1" style="fill:none;stroke:#efe4ff;stroke-width:1.6;stroke-linecap:round"/>' +
    '<ellipse cx="-6" cy="-32" rx="5" ry="2.6" transform="rotate(-30 -6 -32)" style="fill:#fff;opacity:.55"/>';
}
function dMaanelampe() {
  return cyl(.16, 0, 3, DARKL) + cyl(.025, 3, 34, ['#a3b0b9', '#6c7a85']) +
    '<circle cx="0" cy="-49" r="13" style="fill:#f6e7a8"/><circle cx="-4" cy="-52" r="2.6" style="fill:#e3d08a"/><circle cx="4" cy="-45" r="3.2" style="fill:#e3d08a"/><circle cx="5" cy="-55" r="1.6" style="fill:#e3d08a"/>';
}
function dKranie() {
  return box(.26, .2, 0, 8, STONED) +
    at(0, 9, '<path d="M-11,-27a11,11 0 1 1 22,0v5h-4v5h-14v-5h-4z" style="fill:#efe9dc"/>' +
      '<ellipse cx="-4.5" cy="-28" rx="3.2" ry="3.6" style="fill:#2a2433"/><ellipse cx="4.5" cy="-28" rx="3.2" ry="3.6" style="fill:#2a2433"/>' +
      '<path d="M0,-24l-1.6,3h3.2z" style="fill:#2a2433"/><path d="M-4,-20v3M0,-20v3M4,-20v3" style="stroke:#b9b09a;stroke-width:1"/>');
}
function dKiste() {
  return '<path d="M9,0L15,-46L19,-44L13,2Z" style="fill:#352016"/><path d="M-9,0L-15,-46L-7,-66H7L15,-46L9,0Z" style="fill:#4a2e22"/>' +
    '<path d="M-6,-4L-11,-45L-5,-61H5L11,-45L6,-4Z" style="fill:#5c3a2b"/><path d="M0,-52V-24M-6,-44H6" style="stroke:#c9a227;stroke-width:3;stroke-linecap:round"/>';
}
function dMumie() {
  return '<rect x="-18" y="-30" width="9" height="4.5" rx="2" style="fill:#e8e0cc"/><rect x="9" y="-30" width="9" height="4.5" rx="2" style="fill:#d9cfb6"/>' +
    '<path d="M-10,0V-40a10,10 0 0 1 20,0V0z" style="fill:#e8e0cc"/>' +
    '<path d="M-10,-6l20,-4M-10,-14l20,3M-10,-22l20,-4M-10,-30l20,2M-9,-44l18,3" style="stroke:#c9bea3;stroke-width:1.5"/>' +
    '<rect x="-6" y="-40" width="12" height="4.5" style="fill:#2a2433"/><circle cx="-3" cy="-37.8" r="1.3" style="fill:#f6d32a"/><circle cx="3" cy="-37.8" r="1.3" style="fill:#f6d32a"/>';
}
function dPokal() {
  return box(.4, .4, 0, 9, DARKL) + box(.26, .26, 9, 5, DARKL) +
    cyl(.17, 14, 4, GOLD) + cyl(.05, 18, 10, GOLD) +
    '<path d="M-17,-42c-11,0-12,10-5,14M17,-42c11,0 12,10 5,14" style="fill:none;stroke:#e3ad33;stroke-width:3;stroke-linecap:round"/>' +
    '<path d="M-17,-45C-17,-33 -9,-29 0,-27C9,-29 17,-33 17,-45Z" style="fill:#e3ad33"/>' +
    '<path d="M-17,-45C-17,-33 -9,-29 0,-27C-5,-33 -8,-38 -8,-45Z" style="fill:#c9962a"/>' +
    '<ellipse cx="0" cy="-45" rx="17" ry="5" style="fill:#ffe18f"/><ellipse cx="0" cy="-45" rx="12" ry="3" style="fill:#f4c65a"/>';
}
function dGpokal() { return dPokal() + '<g transform="translate(0 -47) scale(.5)">' + pk(0, -14, 20, 14, true) + '</g>'; }
function dGtarn() { return pk(0, -12, 22, 12, false) + pk(0, -31, 16, 10, false) + pk(0, -46, 11, 8, true); }

/* veggkunst og vegg-trofeer: tegnes flatt (1 rute = 64 enheter bred, origo øverst til venstre) */
function fr(W, H, inner, bg?) { return '<rect x="2" y="2" width="' + (W - 4) + '" height="' + (H - 4) + '" rx="2" style="fill:' + (bg || '#fff') + ';stroke:#4a3528;stroke-width:4"/>' + inner; }
function stars(a) { return a.map(function (q) { return '<circle cx="' + q[0] + '" cy="' + q[1] + '" r="' + (q[2] || 1) + '" style="fill:#f6e7a8"/>'; }).join(''); }
function dMane() {
  return fr(128, 60, stars([[14, 12], [30, 22, 1.2], [60, 10], [112, 40], [76, 30, .8]]) +
    '<circle cx="92" cy="24" r="13" style="fill:#f6e7a8"/><circle cx="88" cy="20" r="2.6" style="fill:#e3d08a"/><circle cx="96" cy="29" r="2" style="fill:#e3d08a"/>' +
    '<path d="M4,56V44c20,-8 40,-4 60,2s40,0 60,-6V56z" style="fill:#0f1229"/>' + bat(42, 22, .8) + bat(56, 15, .6), '#1c1f4a');
}
function dHus() {
  return fr(128, 56, '<circle cx="100" cy="14" r="7" style="fill:#f6e7a8"/>' + stars([[20, 12], [36, 8], [114, 30]]) +
    '<path d="M44,50V26L58,14L72,26V50zM70,50V20h10l-5,-10 -5,10h10V50z" style="fill:#1a1626"/><path d="M38,28L58,10L78,28" style="fill:none;stroke:#1a1626;stroke-width:3"/>' +
    '<rect x="50" y="30" width="5" height="6" style="fill:#ffd25a"/><rect x="61" y="30" width="5" height="6" style="fill:#ffd25a"/><rect x="73" y="26" width="4" height="5" style="fill:#f08a24"/><rect x="56" y="40" width="5" height="10" style="fill:#ffd25a"/>' +
    '<path d="M4,52V48c40,-4 80,-4 120,0V52z" style="fill:#1a1626"/>' + bat(24, 22, .7, '#1a1626'), '#4a3a6a');
}
function dPortrett() {
  return fr(64, 64, '<ellipse cx="32" cy="32" rx="22" ry="26" style="fill:#3b2f4a;stroke:#c9a227;stroke-width:2"/>' +
    '<path d="M22,50V30a10,10 0 0 1 20,0v20l-3.3,-3-3.3,3-3.4,-3-3.3,3-3.4,-3z" style="fill:#f4f1f8"/>' +
    '<ellipse cx="28" cy="30" rx="1.8" ry="2.6" style="fill:#1e1a24"/><ellipse cx="36" cy="30" rx="1.8" ry="2.6" style="fill:#1e1a24"/><ellipse cx="32" cy="38" rx="2" ry="2.6" style="fill:#1e1a24"/>', '#2b2235');
}
function dKirkegard() {
  return fr(128, 56, '<circle cx="22" cy="16" r="8" style="fill:#f6e7a8"/>' + stars([[50, 10], [80, 14], [108, 8]]) +
    '<path d="M102,40V18M102,26l-8,-6M102,22l7,-7M102,30l6,-3" style="stroke:#1a1626;stroke-width:2;stroke-linecap:round"/>' +
    '<path d="M4,52V38c30,-6 60,-4 120,0V52z" style="fill:#2d3a2d"/>' +
    '<path d="M30,44V33a7,7 0 0 1 14,0V44z" style="fill:#8f98a0"/><path d="M52,46V36a6,6 0 0 1 12,0v10z" style="fill:#7d868e"/>' +
    '<path d="M80,46V28M74,34H86" style="stroke:#8f98a0;stroke-width:4;stroke-linecap:round"/>', '#2b2f5e');
}
function dGirlander() {
  var s = '<path d="M4,6Q64,34 124,6" style="stroke:#6d5a46;stroke-width:2;fill:none"/>';
  for (var i = 0; i < 8; i++) {
    var x = 12 + i * 14, y = 6 + 28 * Math.sin(Math.PI * (x - 4) / 120) * .62 + 2;
    s += i % 2 ? bat(x, y + 6, .85) : '<path d="M' + (x - 6) + ',' + y.toFixed(1) + 'L' + (x + 6) + ',' + y.toFixed(1) + 'L' + x + ',' + (y + 14).toFixed(1) + 'z" style="fill:' + (i % 4 ? '#6b4a8f' : '#f08a24') + '"/>';
  }
  return s;
}
function dKlokke() {
  var t = '';
  for (var i = 0; i < 12; i++) t += '<path d="M32,9v4" transform="rotate(' + (i * 30) + ' 32 32)" style="stroke:#2a2433;stroke-width:' + (i % 3 ? 1.5 : 2.6) + '"/>';
  return '<circle cx="32" cy="32" r="28" style="fill:#f6e7a8;stroke:#4a3528;stroke-width:5"/>' + t +
    '<path d="M32,32V13M33,32V19" style="stroke:#2a2433;stroke-width:3;stroke-linecap:round"/>' + bat(32, 44, .7) + '<circle cx="32" cy="32" r="2.6" style="fill:#f08a24"/>';
}
function dEdderkopp() {
  var c = [32, 28], s = '', k, i;
  for (i = 0; i < 8; i++) { var a = i * Math.PI / 4; s += '<path d="M32,28L' + f1(32 + Math.cos(a) * 25) + ',' + f1(28 + Math.sin(a) * 25) + '" style="stroke:#cfc6dc;stroke-width:1"/>'; }
  [8, 15, 22].forEach(function (r) { var p = []; for (k = 0; k < 8; k++) { var a2 = k * Math.PI / 4; p.push(f1(c[0] + Math.cos(a2) * r) + ',' + f1(c[1] + Math.sin(a2) * r)); } s += '<polygon points="' + p.join(' ') + '" style="fill:none;stroke:#cfc6dc;stroke-width:1"/>'; });
  s += '<path d="M44,28V41" style="stroke:#cfc6dc;stroke-width:1"/><path d="M39,43l-4,-3M39,46l-5,1M39,49l-4,3M49,43l4,-3M49,46l5,1M49,49l4,3" style="stroke:#111;stroke-width:1.4;stroke-linecap:round"/>' +
    '<circle cx="44" cy="47" r="4.5" style="fill:#111"/><circle cx="44" cy="41.5" r="2.6" style="fill:#111"/><circle cx="43" cy="41" r=".6" style="fill:#f08a24"/><circle cx="45" cy="41" r=".6" style="fill:#f08a24"/>';
  return fr(64, 64, s, '#2b2235');
}
function dFlaggermus() { return fr(64, 64, '<circle cx="40" cy="22" r="13" style="fill:#f6e7a8"/>' + bat(30, 36, 2.1), '#2b2f5e'); }
function dMaske() {
  return '<path d="M54,38l5,20" style="stroke:#c9a227;stroke-width:3;stroke-linecap:round"/>' +
    '<path d="M44,18c4,-10 10,-14 15,-14c-2,7 -7,13 -15,14z" style="fill:#f08a24"/><path d="M40,18c1,-9 5,-14 9,-16c0,6 -3,12 -9,16z" style="fill:#4ea06b"/>' +
    '<path d="M6,26c6,-8 19,-10 26,-4c7,-6 20,-4 26,4c-2,12 -10,18 -18,16c-4,0 -6,-3 -8,-6c-2,3 -4,6 -8,6c-8,2 -16,-4 -18,-16z" style="fill:#6b4a8f;stroke:#c9a227;stroke-width:2"/>' +
    '<ellipse cx="20" cy="29" rx="6" ry="3.6" style="fill:#1e1a24"/><ellipse cx="44" cy="29" rx="6" ry="3.6" style="fill:#1e1a24"/>';
}
function dSpeil() {
  return '<circle cx="32" cy="4" r="3" style="fill:#c9a227"/><ellipse cx="32" cy="33" rx="24" ry="28" style="fill:#c9a227"/><ellipse cx="32" cy="33" rx="19" ry="23" style="fill:#cfd8e8"/>' +
    '<path d="M26,48V36a6,6 0 0 1 12,0v12l-2,-2-2,2-2,-2-2,2-2,-2z" style="fill:#fff;opacity:.55"/>' +
    '<path d="M20,24c2,-6 6,-9 10,-10" style="fill:none;stroke:#fff;stroke-width:2.4;stroke-linecap:round;opacity:.85"/>';
}
function dHeksehatt() {
  return '<path d="M33,2v6" style="stroke:#6d5a46;stroke-width:3"/>' +
    '<path d="M34,8C30,20 23,30 20,46H46C42,32 40,20 34,8z" style="fill:#2b2235"/><path d="M21,40H45L46,46H20Z" style="fill:#6b4a8f"/>' +
    '<rect x="29" y="39.5" width="8" height="6.5" style="fill:none;stroke:#c9a227;stroke-width:2"/><ellipse cx="33" cy="48" rx="28" ry="6" style="fill:#2b2235"/>';
}
function dUlv() {
  return fr(128, 60, stars([[16, 12], [40, 20], [60, 8], [118, 36]]) + '<circle cx="90" cy="20" r="12" style="fill:#f6e7a8"/>' +
    '<path d="M4,56V44c14,-4 26,-10 40,-8c16,2 22,8 40,8s28,-4 40,-2V56z" style="fill:#1a1626"/>' +
    '<path d="M40,40l2,-8 3,-6 1,-7 2,-6 3,-5 1,5 2,-3 1,5 -2,3 1,6 4,6 8,2 8,1 5,4 2,9 -3,0 -2,-5 -6,1 0,5 -3,0 -1,-5 -12,0 -1,5 -3,0 -1,-5 -4,1 -1,4z" style="fill:#1a1626"/>', '#2b2f5e');
}
function dHvitlok() {
  var s = '<path d="M32,2V60" style="stroke:#a89c80;stroke-width:2"/>';
  for (var i = 0; i < 5; i++) {
    var x = 32 + (i % 2 ? 7 : -7), y = 12 + i * 10;
    s += '<path d="M' + x + ',' + (y - 6) + 'c-1,3 -7,4 -7,9a7,6 0 0 0 14,0c0,-5 -6,-6 -7,-9z" style="fill:#f4efe2;stroke:#d8cfb8;stroke-width:1"/><path d="M' + x + ',' + (y - 1) + 'v8" style="stroke:#d8cfb8;stroke-width:1"/>';
  }
  return s;
}
function dMedalje() {
  return '<path d="M20,2L32,30" style="stroke:#6b4a8f;stroke-width:9;fill:none"/><path d="M44,2L32,30" style="stroke:#f08a24;stroke-width:9;fill:none"/><circle cx="32" cy="42" r="18" style="fill:#e3ad33;stroke:#c9962a;stroke-width:3"/>' +
    '<g transform="translate(32 47) scale(.48)">' + pk(0, -10, 20, 14, true) + '</g>';
}

export const ITEMS: Record<string, RoomItem> = {
  sofa: { n: 'Gotisk sofa', k: 'floor', w: 3, d: 1, f: dSofa, cat: 'mob', dsc: 'Her kan du hvile etter å ha pugget.' },
  lenestol: { n: 'Ørelappstol', k: 'floor', w: 1, d: 1, f: dLenestol, cat: 'mob', dsc: 'Plass til én som leser grøssere.' },
  bord: { n: 'Salongbord', k: 'floor', w: 2, d: 1, f: dBord, cat: 'mob', dsc: 'Med levende lys og en skål godteri.' },
  hylle: { n: 'Bokhylle', k: 'floor', w: 2, d: 1, f: dHylle, cat: 'mob', dsc: 'Full av gamle bøker. Snu den for å sette den mot en annen vegg.' },
  tv: { n: 'TV med skrekkfilm', k: 'floor', w: 2, d: 1, f: dTv, cat: 'mob', dsc: 'Snu den slik at skjermen vender mot sofaen.' },
  lampe: { n: 'Kandelaber', k: 'floor', w: 1, d: 1, f: dLampe, cat: 'mob', dsc: 'Tre lys som blafrer i trekken.' },
  plante: { n: 'Kjøttetende plante', k: 'floor', w: 1, d: 1, f: dPlante, cat: 'mob', dsc: 'Ikke stikk fingeren for nær.' },
  puff: { n: 'Gresskarpuff', k: 'floor', w: 1, d: 1, f: dPuff, cat: 'mob', dsc: 'Myk og oransje. Fin å sitte på.' },
  teppeA: { n: 'Edderkoppteppe', k: 'rug', w: 3, d: 2, f: dTeppeA, cat: 'rug', dsc: 'Et stort teppe med edderkoppnett.' },
  teppeB: { n: 'Måneteppe', k: 'rug', w: 2, d: 2, f: dTeppeB, cat: 'rug', dsc: 'Rundt teppe med månesigd og stjerner.' },
  teppeC: { n: 'Løper', k: 'rug', w: 1, d: 3, f: dTeppeC, cat: 'rug', dsc: 'Et langt teppe i lilla og oransje. Snu det for å legge det andre veien.' },
  mane: { n: 'Fullmåne', k: 'wall', w: 2, h: 60, f: dMane, cat: 'art', dsc: 'Natt, måne og flaggermus.' },
  hus: { n: 'Det hjemsøkte huset', k: 'wall', w: 2, h: 56, f: dHus, cat: 'art', dsc: 'Noen sier det spøker der. Men hvem startet egentlig ryktet?' },
  portrett: { n: 'Spøkelsesportrett', k: 'wall', w: 1, h: 64, f: dPortrett, cat: 'art', dsc: 'Øynene følger deg rundt i rommet. Eller gjør de det?' },
  kirkegard: { n: 'Kirkegården', k: 'wall', w: 2, h: 56, f: dKirkegard, cat: 'art', dsc: 'Stille og skummelt i månelyset.' },
  girlander: { n: 'Flaggermusgirlander', k: 'wall', w: 2, h: 56, f: dGirlander, cat: 'art', dsc: 'Flaggermus og vimpler på snor, klar til fest.' },
  klokke: { n: 'Midnattsklokka', k: 'wall', w: 1, h: 64, f: dKlokke, cat: 'art', dsc: 'Snart midnatt. Har du pugget nok?' },

  gresskar: { n: 'Gresskarlykta', k: 'floor', w: 1, d: 1, f: dGresskar, dsc: 'Ditt første trofé. Kritisk tenkning er som et lys i mørket: den hjelper deg å se tydeligere før du trekker en slutning.' },
  svartkatt: { n: 'Den svarte katten', k: 'floor', w: 1, d: 1, f: dSvartkatt, dsc: 'Bringer svarte katter ulykke? Sjekk om en påstand stemmer før du tror på den.' },
  edderkopp: { n: 'Edderkoppnettet', k: 'wall', w: 1, h: 64, f: dEdderkopp, dsc: 'Ikke la deg fange i nettet av rykter og usannheter i sosiale medier.' },
  kost: { n: 'Heksekosten', k: 'floor', w: 1, d: 1, f: dKost, dsc: 'Feie bort fordommer: tenk på andre som individer, ikke som en gruppe.' },
  lykt: { n: 'Lykta', k: 'floor', w: 1, d: 1, f: dLykt, dsc: 'Søk ny kunnskap, også når det er mørkt og vanskelig.' },
  flaggermus: { n: 'Flaggermusen', k: 'wall', w: 1, h: 64, f: dFlaggermus, dsc: 'Flaggermus «ser» med lyd. Det finnes mange måter å oppfatte verden på.' },
  spokelse: { n: 'Spøkelset', k: 'floor', w: 1, d: 1, f: dSpokelse, dsc: 'Finnes spøkelser? Skill mellom det du tror og det du vet.' },
  gravstein: { n: 'Gravsteinen', k: 'floor', w: 1, d: 1, f: dGravstein, dsc: 'Sokrates stilte så mange spørsmål at han ble dømt til å drikke giftbegeret.' },
  maske: { n: 'Masken', k: 'wall', w: 1, h: 64, f: dMaske, dsc: 'Hva skjuler seg bak? Spør deg selv: Hva blir ikke sagt?' },
  ugle: { n: 'Ugla', k: 'floor', w: 1, d: 1, f: dUgle, dsc: 'Kritisk tenkning handler om god vurderingsevne og dømmekraft.' },
  bokstabel: { n: 'Bokstabelen', k: 'floor', w: 1, d: 1, f: dBokstabel, dsc: 'Hvilke kilder kan gi deg pålitelig informasjon?' },
  speil: { n: 'Speilet', k: 'wall', w: 1, h: 64, f: dSpeil, dsc: 'Still kritiske spørsmål til deg selv også: Hvorfor mener jeg som jeg gjør?' },
  gryte: { n: 'Heksegryta', k: 'floor', w: 1, d: 1, f: dGryte, dsc: 'Ikke rør sammen fakta, meninger og fordommer. Skill dem fra hverandre.' },
  krystallkule: { n: 'Krystallkula', k: 'floor', w: 1, d: 1, f: dKrystallkule, dsc: 'Ingen kan spå framtiden. Undersøk fakta i stedet for å gjette.' },
  heksehatt: { n: 'Heksehatten', k: 'wall', w: 1, h: 64, f: dHeksehatt, dsc: 'Svart-hvitt-tenkning gjør det lett å sette folk i bås.' },
  maanelampe: { n: 'Månelampa', k: 'floor', w: 1, d: 1, f: dMaanelampe, dsc: 'Ting ser annerledes ut i ulikt lys. Det kommer an på ståstedet ditt.' },
  kranie: { n: 'Hodeskallen', k: 'floor', w: 1, d: 1, f: dKranie, dsc: '«Det eneste jeg vet, er at jeg ingenting vet.» Fortsett å stille spørsmål.' },
  ulv: { n: 'Ulvemaleriet', k: 'wall', w: 2, h: 60, f: dUlv, dsc: 'Når alle hyler i kor, er det lurt å stoppe opp og tenke selv.' },
  kiste: { n: 'Kista', k: 'floor', w: 1, d: 1, f: dKiste, dsc: 'Gamle ideer kan begraves når ny kunnskap kommer, slik Copernicus viste.' },
  mumie: { n: 'Mumien', k: 'floor', w: 1, d: 1, f: dMumie, dsc: 'Ikke pakk deg inn i dine egne meninger. Vær åpen for motforestillinger.' },
  hvitlok: { n: 'Hvitløksfletta', k: 'wall', w: 1, h: 64, f: dHvitlok, dsc: 'Hjelper hvitløk mot vampyrer? Er det sant? Er det godt? Er det nyttig?' },
  gpokal: { n: 'Gresskarpokalen', k: 'floor', w: 1, d: 1, f: dGpokal, dsc: 'Du har bygget et sterkt forsvarsverk mot å bli lurt.' },
  gtarn: { n: 'Gresskartårnet', k: 'floor', w: 1, d: 1, f: dGtarn, dsc: 'Sammen ser vi hele bildet, akkurat som de blinde mennene og elefanten.' },
  medalje: { n: 'Mestermedaljen', k: 'wall', w: 1, h: 64, f: dMedalje, dsc: 'Belønning for innsatsen din. Fortsett å stille spørsmål.' }
};

export const LEVELS: Level[] = [
  { n: 'Gresskarfrø', xp: 0, t: ['gresskar', 'svartkatt', 'edderkopp'] },
  { n: 'Flaggermus', xp: 25, t: ['kost', 'lykt', 'flaggermus'] },
  { n: 'Spøkelse', xp: 60, t: ['spokelse', 'gravstein', 'maske'] },
  { n: 'Ugle', xp: 100, t: ['ugle', 'bokstabel', 'speil'] },
  { n: 'Heks', xp: 150, t: ['gryte', 'krystallkule', 'heksehatt'] },
  { n: 'Varulv', xp: 210, t: ['maanelampe', 'kranie', 'ulv'] },
  { n: 'Vampyr', xp: 280, t: ['kiste', 'mumie', 'hvitlok'] },
  { n: 'Halloweenmester', xp: 360, t: ['gpokal', 'gtarn', 'medalje'] }
];

export const HOME: Record<string, Placement> = {
  sofa: { x: 2, y: 0, f: 0 }, hylle: { x: 0, y: 1, f: 1 }, tv: { x: 0, y: 3, f: 1 }, teppeA: { x: 2, y: 1, f: 0 }, bord: { x: 2, y: 2, f: 0 },
  lenestol: { x: 5, y: 1, f: 0 }, plante: { x: 6, y: 0, f: 0 }, lampe: { x: 0, y: 5, f: 0 }, puff: { x: 4, y: 4, f: 0 },
  mane: { wl: 'R', s: 0 }, girlander: { wl: 'R', s: 2 }, klokke: { wl: 'R', s: 6 }, hus: { wl: 'L', s: 0 }, kirkegard: { wl: 'L', s: 3 }
};
