import { iso, pts, poly, box, cyl, cone, COL } from '../../app/room/iso';
import type { RoomItem, Level, Placement } from '../types';

import { gradient } from '../../app/room/iso';
const STRIPES = ['#08306b', '#2171b5', '#6baed6', '#c6dbef', '#fdd0b8', '#fc9272', '#ef3b2c', '#a50f15'];
function stripeColor(t: number) { return gradient(STRIPES, t); }

function dSnokule() {
  return box(.3, .3, 0, 10, COL.wood) + cyl(.17, 10, 5, ['#6b7f8a', '#4b5d68']) +
    '<circle cx="0" cy="-33" r="17" style="fill:rgba(190,226,245,.55);stroke:#eaf6fc;stroke-width:1.5"/>' +
    '<circle cx="0" cy="-23.5" r="7" style="fill:#fff"/><circle cx="0" cy="-34" r="4.6" style="fill:#fff"/>' +
    '<circle cx="-1.7" cy="-34.6" r=".9" style="fill:#13272b"/><circle cx="1.7" cy="-34.6" r=".9" style="fill:#13272b"/>' +
    '<path d="M0,-33.4l3.4,1-3.4,.4z" style="fill:#e8742a"/>' +
    '<circle cx="-9" cy="-41" r="1.2" style="fill:#fff"/><circle cx="9" cy="-27" r="1.2" style="fill:#fff"/><circle cx="7" cy="-43" r="1" style="fill:#fff"/><circle cx="-10" cy="-26" r="1" style="fill:#fff"/>' +
    '<path d="M-10,-42a14,14 0 0 1 8,-5" style="fill:none;stroke:#fff;stroke-width:2;stroke-linecap:round;opacity:.75"/>';
}
function cloudParts() {
  return '<ellipse cx="-10" cy="-48" rx="11" ry="8"/><ellipse cx="3" cy="-53" rx="14" ry="10"/><ellipse cx="16" cy="-47" rx="10" ry="7"/><rect x="-19" y="-48" width="44" height="7" rx="3.5"/>';
}
function dRegnsky() {
  return box(.28, .28, 0, 6, COL.stone) + cyl(.06, 6, 32, ['#a8bcc8', '#7f96a3']) +
    '<g style="fill:#7da0b6;stroke:#7da0b6;stroke-width:3">' + cloudParts() + '</g>' +
    '<g style="fill:#f1f7fb">' + cloudParts() + '</g>' +
    '<g style="fill:#3b9ad9"><ellipse cx="-12" cy="-34" rx="2" ry="3.4"/><ellipse cx="-2" cy="-27" rx="2" ry="3.4"/><ellipse cx="9" cy="-34" rx="2" ry="3.4"/><ellipse cx="19" cy="-28" rx="2" ry="3.4"/></g>';
}
function dAkvarium() {
  return box(.4, .3, 0, 12, COL.wood) + box(.36, .26, 12, 3, ['#7a8c97', '#5f717c', '#4a5963']) +
    box(.36, .26, 15, 22, COL.water) +
    '<g style="fill:#ff8a3d"><ellipse cx="-2" cy="-27" rx="6" ry="3.4"/><path d="M4,-27l7,-4.5v9z"/></g><circle cx="-5" cy="-28" r=".9" style="fill:#13272b"/>' +
    '<path d="M-15,-17c-2-6 2-10 0-15 5 4 4 10 5 15z" style="fill:#3f9a5a"/><path d="M12,-17c1-5 5-7 5-11 2 4 0 8-1 11z" style="fill:#3f9a5a"/>' +
    '<circle cx="3" cy="-34" r="1.4" style="fill:#fff;opacity:.8"/><circle cx="6" cy="-38" r="1" style="fill:#fff;opacity:.8"/>';
}
function dTre() {
  return cyl(.2, 0, 11, ['#7a3f2e', '#b9654a']) + cyl(.05, 11, 16, ['#6d4a2b', '#805634']) +
    cone(.34, 20, 20, '#2d7a47') + cone(.27, 32, 19, '#3a9459') + cone(.19, 44, 17, '#4fb36d');
}
function dIsblokk() {
  return box(.4, .34, 0, 15, COL.ice) + box(.24, .2, 15, 15, COL.ice, -.1, -.08) +
    '<path d="M-17,-6l4,-9M-9,-4l3,-7" style="stroke:#fff;stroke-width:1.6;stroke-linecap:round;opacity:.85;fill:none"/>' +
    '<path d="M-3,-27l5,-6" style="stroke:#fff;stroke-width:1.6;stroke-linecap:round;opacity:.85;fill:none"/>';
}
function dPalme() {
  var leaves = ['M3,-52C-6,-66 -20,-66 -30,-54C-18,-58 -8,-56 3,-52Z', 'M3,-52C12,-68 28,-66 36,-52C24,-58 12,-56 3,-52Z', 'M3,-52C-4,-72 6,-78 12,-76C6,-68 6,-60 3,-52Z', 'M3,-52C-14,-48 -26,-40 -28,-34C-18,-40 -8,-44 3,-52Z', 'M3,-52C20,-48 30,-40 32,-34C22,-40 12,-44 3,-52Z'];
  return cyl(.22, 0, 10, ['#4a3622', '#7a5a3a']) +
    '<path d="M0,-10C-2,-26 4,-40 3,-52" style="fill:none;stroke:#8a6637;stroke-width:5;stroke-linecap:round"/>' +
    leaves.map(function (d, i) { return '<path d="' + d + '" style="fill:' + (i % 2 ? '#4fb36d' : '#2d7a47') + '"/>'; }).join('') +
    '<circle cx="0" cy="-49" r="2.6" style="fill:#6b4a2b"/><circle cx="6" cy="-48" r="2.6" style="fill:#7d5733"/>';
}
function dGlobus() {
  return box(.28, .28, 0, 5, COL.wood) + cyl(.08, 5, 9, ['#a3b0b9', '#6c7a85']) +
    '<circle cx="0" cy="-34" r="20" style="fill:#2e86c1"/>' +
    '<path d="M-10,-44c4-6 12-6 14-1 2 5-4 6-6 10-3 4-9 1-8-9z" style="fill:#4fae6b"/>' +
    '<path d="M4,-30c5-2 11 0 11 6 0 5-4 9-8 11-3-4-6-9-3-17z" style="fill:#4fae6b"/>' +
    '<path d="M-15,-27c3 0 6 3 3 6-3 2-5-2-3-6z" style="fill:#4fae6b"/>' +
    '<ellipse cx="-7" cy="-43" rx="6" ry="3" style="fill:#fff;opacity:.3"/>' +
    '<ellipse cx="0" cy="-34" rx="23" ry="25" transform="rotate(20 0 -34)" style="fill:none;stroke:#c9962a;stroke-width:2"/>';
}
function dPokal() {
  return box(.4, .4, 0, 9, COL.stone) + box(.26, .26, 9, 5, COL.stone) +
    cyl(.17, 14, 4, ['#ffe18f', '#e3ad33']) + cyl(.05, 18, 10, ['#ffe18f', '#e3ad33']) +
    '<path d="M-17,-42c-11,0-12,10-5,14M17,-42c11,0 12,10 5,14" style="fill:none;stroke:#e3ad33;stroke-width:3;stroke-linecap:round"/>' +
    '<path d="M-17,-45C-17,-33 -9,-29 0,-27C9,-29 17,-33 17,-45Z" style="fill:#e3ad33"/>' +
    '<path d="M-17,-45C-17,-33 -9,-29 0,-27C-5,-33 -8,-38 -8,-45Z" style="fill:#c9962a"/>' +
    '<ellipse cx="0" cy="-45" rx="17" ry="5" style="fill:#ffe18f"/><ellipse cx="0" cy="-45" rx="12" ry="3" style="fill:#f4c65a"/>' +
    '<path d="M3,-40l1.8,3.8 4.2,.6-3,2.9 .7,4.1-3.7-2-3.7 2 .7-4.1-3-2.9 4.2-.6z" style="fill:#fff4c9"/>';
}
var FAB = ['#55a3a8', '#3f868b', '#306d72'], CUSH = ['#6bb7bc', '#4f9ca1', '#3f8287'], FAB2 = ['#efc460', '#d3a443', '#b78a30'],
  DARK = ['#47545e', '#333e47', '#262f37'], WOODD = ['#a47a45', '#82602f', '#67491f'], TERRA = ['#d98a63', '#b9654a', '#9c523a'], GREEN = ['#6cc08a', '#4ea06b', '#3d8556'], GREEND = ['#4ea06b', '#3d8556', '#2e6b43'];
function fv(u0, u1, v, z0, z1, c) { return poly([iso(u0, v, z1), iso(u1, v, z1), iso(u1, v, z0), iso(u0, v, z0)], c); }
function rectF(hw, hd, z, c) { return poly([iso(-hw, -hd, z), iso(hw, -hd, z), iso(hw, hd, z), iso(-hw, hd, z)], c); }
function at(x, y, s) { return '<g transform="translate(' + x + ' ' + y + ')">' + s + '</g>'; }

function dSofa() {
  return box(1.45, .45, 0, 9, FAB) + box(1.45, .14, 9, 26, FAB, 0, -.31) + box(.13, .45, 9, 13, FAB, -1.32, 0) +
    box(1.18, .32, 9, 6, CUSH, 0, .06) + box(.2, .09, 15, 15, FAB2, -.8, -.12) + box(.13, .45, 9, 13, FAB, 1.32, 0);
}
function dLenestol() {
  return box(.42, .42, 0, 9, FAB2) + box(.42, .12, 9, 26, FAB2, 0, -.3) + box(.1, .42, 9, 13, FAB2, -.32, 0) +
    box(.22, .3, 9, 5, ['#f6d684', '#dcb35a', '#bf9743'], 0, .04) + box(.1, .42, 9, 13, FAB2, .32, 0);
}
function dBord() {
  var legs = '', p = [[-.8, -.3], [.8, -.3], [-.8, .3], [.8, .3]];
  p.sort(function (a, b) { return (a[0] + a[1]) - (b[0] + b[1]); });
  p.forEach(function (q) { legs += box(.05, .05, 0, 12, WOODD, q[0], q[1]); });
  return legs + box(.9, .4, 12, 3, COL.wood) + box(.22, .16, 15, 3, ['#f4f6f6', '#dce2e4', '#c3cbce'], -.45, 0) + box(.16, .12, 18, 3, ['#7fb4d4', '#5e97ba', '#4a7fa0'], -.45, 0) +
    at(18, -15, cyl(.1, 0, 5, ['#fff', '#e8742a']));
}
function dHylle() {
  var s = box(.95, .26, 0, 72, COL.wood) + fv(-.86, .86, .26, 4, 68, '#5b4326');
  var bk = ['#d9534f', '#3b9ad9', '#e0b04a', '#4fae6b', '#7a5aa6', '#e8742a', '#2e6f93'];
  for (var r = 0; r < 3; r++) {
    var z = 6 + r * 21, u = -.8, i = 0;
    s += fv(-.9, .9, .26, z - 2, z, '#c9a468');
    while (u < .72) {
      var w = .09 + ((r * 3 + i) % 3) * .03, h = 12 + ((i * 5 + r * 3) % 4) * 2;
      s += fv(u, u + w, .26, z, z + h, bk[(i + r * 2) % bk.length]); u += w + .01; i++;
    }
  }
  return s + fv(-.9, .9, .26, 65, 67, '#c9a468');
}
function dTv() {
  return box(.95, .3, 0, 16, COL.wood) + fv(-.85, -.05, .3, 3, 14, '#8a6735') + fv(.05, .85, .3, 3, 14, '#8a6735') +
    box(.12, .05, 16, 4, DARK) + box(.72, .05, 20, 34, DARK) +
    fv(-.64, .64, .1, 23, 51, '#6fc3e0') + fv(-.64, .64, .1, 23, 33, '#4ea06b') + poly([iso(-.2, .1, 45), iso(.1, .1, 45), iso(.1, .1, 41), iso(-.2, .1, 41)], '#fff');
}
function dLampe() {
  return cyl(.14, 0, 3, ['#6c7a85', '#4a5963']) + cyl(.025, 3, 58, ['#a3b0b9', '#6c7a85']) + cyl(.2, 58, 16, ['#fff0b8', '#f2d98a']) +
    '<ellipse cx="0" cy="-74" rx="9" ry="4.5" style="fill:#fff8d8"/>';
}
function dPlante() {
  var L = '';
  [[-14, -34, -35], [12, -36, 38], [0, -48, 0], [-8, -26, -62], [10, -26, 62]].forEach(function (a, i) {
    L += '<ellipse cx="' + a[0] + '" cy="' + a[1] + '" rx="6" ry="14" transform="rotate(' + a[2] + ' ' + a[0] + ' ' + a[1] + ')" style="fill:' + (i % 2 ? '#4fb36d' : '#2d7a47') + '"/>';
  });
  return cyl(.22, 0, 16, ['#d98a63', '#b9654a']) + L;
}
function dPuff() { return cyl(.3, 0, 13, ['#f1b25a', '#cc8a34']) + '<ellipse cx="0" cy="-13" rx="9" ry="4.5" style="fill:#fbd392"/>'; }
function dTeppeA() { return rectF(1.5, 1, 1, '#3f8f9a') + rectF(1.32, .82, 1, '#d6ebe7') + rectF(1.1, .6, 1, '#3f8f9a') + rectF(.92, .42, 1, '#f1d28a'); }
function dTeppeB() {
  return '<ellipse cx="0" cy="0" rx="86" ry="43" style="fill:#c9573b"/><ellipse cx="0" cy="0" rx="70" ry="35" style="fill:#f4e3c0"/><ellipse cx="0" cy="0" rx="48" ry="24" style="fill:#4a8c5b"/><ellipse cx="0" cy="0" rx="26" ry="13" style="fill:#f4e3c0"/>';
}
function dTeppeC() {
  var s = rectF(.45, 1.5, 1, '#e8742a');
  for (var i = 0; i < 5; i++) s += poly([iso(-.45, -1.5 + i * .6 + .1, 1), iso(.45, -1.5 + i * .6 + .1, 1), iso(.45, -1.5 + i * .6 + .3, 1), iso(-.45, -1.5 + i * .6 + .3, 1)], '#fbe4cf');
  return s;
}

/* trofeer: gulv */
function dPingvin() {
  return '<ellipse cx="-6" cy="-3" rx="6" ry="3" style="fill:#f08a2c"/><ellipse cx="6" cy="-3" rx="6" ry="3" style="fill:#f08a2c"/>' +
    '<ellipse cx="0" cy="-22" rx="13" ry="20" style="fill:#2b3a47"/><ellipse cx="0" cy="-19" rx="8" ry="14" style="fill:#fff"/>' +
    '<path d="M-12,-30c-6,6-7,12-4,17c4-5 5-11 4-17zM12,-30c6,6 7,12 4,17c-4-5-5-11-4-17z" style="fill:#1f2b36"/>' +
    '<circle cx="-3.5" cy="-35" r="1.5" style="fill:#fff"/><circle cx="3.5" cy="-35" r="1.5" style="fill:#fff"/><circle cx="-3.5" cy="-35" r=".7" style="fill:#13272b"/><circle cx="3.5" cy="-35" r=".7" style="fill:#13272b"/>' +
    '<path d="M-3,-32h6l-3,4z" style="fill:#f08a2c"/>';
}
function boot() { return '<path d="M-8,-34h11v22l9,3v8h-20z" style="fill:#f2c230"/><path d="M-8,-12h20v3h-20z" style="fill:#3d4a54"/><path d="M-8,-34h11v5h-11z" style="fill:#e0a915"/>'; }
function dStovler() { return at(-9, 0, boot()) + at(11, 4, boot()); }
function dKanne() {
  return cyl(.28, 0, 22, ['#8fc6ea', '#3b86c4']) + '<path d="M11,-8L30,-26" style="stroke:#3b86c4;stroke-width:5;stroke-linecap:round;fill:none"/><ellipse cx="32" cy="-28" rx="5" ry="2.5" transform="rotate(-40 32 -28)" style="fill:#2b6aa0"/>' +
    '<path d="M-12,-8c-14,-2-14,-16 0,-18" style="stroke:#3b86c4;stroke-width:4;fill:none;stroke-linecap:round"/>' +
    '<ellipse cx="38" cy="-20" rx="1.6" ry="2.6" style="fill:#7fc4ee"/><ellipse cx="35" cy="-13" rx="1.6" ry="2.6" style="fill:#7fc4ee"/>';
}
function dSopp() {
  return cyl(.1, 0, 14, ['#f1e6d0', '#e3d3b2']) + '<path d="M-22,-13C-22,-42 22,-42 22,-13Z" style="fill:#d9453b"/><ellipse cx="0" cy="-13" rx="22" ry="5" style="fill:#c13a31"/>' +
    '<circle cx="-9" cy="-26" r="3.2" style="fill:#fff"/><circle cx="6" cy="-31" r="3" style="fill:#fff"/><circle cx="12" cy="-20" r="2.4" style="fill:#fff"/><circle cx="-14" cy="-18" r="2" style="fill:#fff"/>';
}
function dIsbjorn() {
  return '<ellipse cx="-3" cy="-14" rx="22" ry="13" style="fill:#f6fafc;stroke:#b9cfda;stroke-width:1.5"/>' +
    '<rect x="-20" y="-8" width="7" height="9" rx="3" style="fill:#f6fafc;stroke:#b9cfda;stroke-width:1.5"/><rect x="5" y="-8" width="7" height="9" rx="3" style="fill:#f6fafc;stroke:#b9cfda;stroke-width:1.5"/>' +
    '<circle cx="19" cy="-26" r="10" style="fill:#f6fafc;stroke:#b9cfda;stroke-width:1.5"/><circle cx="13" cy="-35" r="3.2" style="fill:#f6fafc;stroke:#b9cfda;stroke-width:1.5"/><circle cx="25" cy="-34" r="3.2" style="fill:#f6fafc;stroke:#b9cfda;stroke-width:1.5"/>' +
    '<ellipse cx="25" cy="-24" rx="4" ry="3.2" style="fill:#e7eff3"/><circle cx="27" cy="-25" r="1.6" style="fill:#13272b"/><circle cx="18" cy="-29" r="1.2" style="fill:#13272b"/>';
}
function dMonstera() {
  var L = '';
  [[-16, -30, -50], [16, -32, 50], [0, -44, 0], [-6, -20, -82], [8, -20, 82]].forEach(function (a, i) {
    L += '<g transform="rotate(' + a[2] + ' ' + a[0] + ' ' + a[1] + ')"><ellipse cx="' + a[0] + '" cy="' + a[1] + '" rx="11" ry="15" style="fill:' + (i % 2 ? '#3a9459' : '#2d7a47') + '"/><path d="M' + a[0] + ',' + (a[1] + 14) + 'V' + (a[1] - 12) + 'M' + (a[0] - 6) + ',' + (a[1] - 3) + 'l6,2M' + (a[0] + 6) + ',' + (a[1] - 3) + 'l-6,2" style="stroke:#9ad7ae;stroke-width:1.2;fill:none"/></g>';
  });
  return cyl(.24, 0, 14, ['#e8dccb', '#c9b69b']) + L;
}
function dResirk() {
  return box(.3, .3, 0, 26, GREEN) + box(.34, .34, 26, 4, GREEND) +
    '<path d="M-8,-12L-1,-24L6,-12zM-5,-15h8" style="fill:none;stroke:#fff;stroke-width:2.2;stroke-linejoin:round;stroke-linecap:round" transform="translate(-9 3) scale(.9)"/>';
}
function dVindmolle() {
  var b = '';
  for (var i = 0; i < 3; i++) b += '<path d="M0,0L-2.5,-24L2.5,-24Z" transform="translate(0 -62) rotate(' + (i * 120 + 20) + ')" style="fill:#f4f6f6;stroke:#c3cbce;stroke-width:.8"/>';
  return box(.2, .2, 0, 3, COL.stone) + '<path d="M-3,-3L-1.5,-60H1.5L3,-3Z" style="fill:#e8eef0"/>' + b + '<circle cx="0" cy="-62" r="3.2" style="fill:#c3cbce"/>';
}

/* veggkunst og vegg-trofeer: tegnes flatt i egne koordinater (1 rute = 64 enheter bred, origo øverst til venstre) */
function fr(W, H, inner, bg?) { return '<rect x="2" y="2" width="' + (W - 4) + '" height="' + (H - 4) + '" rx="2" style="fill:' + (bg || '#fff') + ';stroke:#6d5a46;stroke-width:4"/>' + inner; }
function dStriper() { var s = ''; for (var i = 0; i < 10; i++) s += '<rect x="' + (8 + i * 11.2) + '" y="8" width="11.4" height="44" style="fill:' + stripeColor(i / 9) + '"/>'; return fr(128, 60, s, '#fff'); }
function dKart() {
  return fr(128, 56, '<path d="M14,14c6-6 18-6 24-2 4 4 0 8-6 10-3 4-4 10-8 14-4 2-6-6-5-12-1-4-3-6-5-10z" style="fill:#4fae6b"/><path d="M62,12c8-4 18-2 22 4 6 2 10 0 14 4-2 6-8 6-10 10-2 8-8 14-14 10-4-6 0-8-2-14-6-2-12-6-10-14z" style="fill:#4fae6b"/><path d="M96,36c6-2 12 0 14 4-2 4-8 6-14 4z" style="fill:#4fae6b"/><path d="M40,36c3-2 6 0 6 4s-4 6-6 3z" style="fill:#4fae6b"/>', '#2e86c1');
}
function dVenn() {
  return fr(64, 64, '<circle cx="32" cy="23" r="15" style="fill:#4fae6b;fill-opacity:.75"/><circle cx="23" cy="39" r="15" style="fill:#3b9ad9;fill-opacity:.75"/><circle cx="41" cy="39" r="15" style="fill:#e0b04a;fill-opacity:.75"/>');
}
function dFjord() {
  return fr(128, 56, '<rect x="4" y="4" width="120" height="30" style="fill:#bfe3f2"/><path d="M4,34L30,12L48,26L70,8L96,28L124,14V34Z" style="fill:#4a6a78"/><path d="M70,8L64,15L70,13L75,16zM30,12L26,17L31,15z" style="fill:#fff"/><rect x="4" y="34" width="120" height="18" style="fill:#3c7fa6"/><path d="M24,42h18l-3,5h-12z" style="fill:#d9534f"/><path d="M33,42V34l7,7z" style="fill:#fff"/>');
}
function dTemp() {
  return fr(128, 56, '<path d="M14,10V44H116" style="stroke:#6c7a85;stroke-width:2;fill:none"/><path d="M16,40L32,38L48,34L62,35L78,26L94,22L112,12" style="stroke:#d9534f;stroke-width:3;fill:none;stroke-linejoin:round"/><circle cx="112" cy="12" r="3.6" style="fill:#d9534f"/><circle cx="62" cy="35" r="2.4" style="fill:#d9534f"/><circle cx="94" cy="22" r="2.4" style="fill:#d9534f"/>');
}
function dKlokke() {
  var t = '';
  for (var i = 0; i < 12; i++) t += '<path d="M32,9v4" transform="rotate(' + (i * 30) + ' 32 32)" style="stroke:#333e47;stroke-width:' + (i % 3 ? 1.5 : 2.6) + '"/>';
  return '<circle cx="32" cy="32" r="28" style="fill:#fff;stroke:#6d5a46;stroke-width:5"/>' + t + '<path d="M32,32V16M32,32L44,38" style="stroke:#333e47;stroke-width:3;stroke-linecap:round"/><circle cx="32" cy="32" r="2.6" style="fill:#d9534f"/>';
}
function dSnoflak() {
  var s = '';
  for (var i = 0; i < 3; i++) s += '<g transform="rotate(' + (i * 60) + ' 32 32)"><path d="M32,10V54M26,17L32,23L38,17M26,47L32,41L38,47" style="stroke:#2e6f93;stroke-width:3;fill:none;stroke-linecap:round;stroke-linejoin:round"/></g>';
  return '<circle cx="32" cy="32" r="29" style="fill:#d4ebf6;stroke:#8fc3de;stroke-width:3"/>' + s;
}
function dDrape() {
  return fr(64, 64, '<path d="M32,10C26,22 15,33 15,43a17,17 0 0 0 34,0C49,33 38,22 32,10z" style="fill:#3b9ad9"/><path d="M24,42a8,9 0 0 0 7,9" style="stroke:#fff;stroke-width:3;fill:none;stroke-linecap:round;opacity:.8"/>', '#e8f4fb');
}
function dFoss() {
  return fr(128, 60, '<rect x="4" y="4" width="120" height="52" style="fill:#bfe3f2"/><path d="M4,56V14L40,10L48,30V56zM124,56V12L88,10L80,32V56z" style="fill:#5a6b72"/><path d="M42,10L46,30V48H82V32L86,10z" style="fill:#e9f6fc"/><path d="M52,12V46M62,10V48M72,12V46" style="stroke:#8fc9e6;stroke-width:3"/><ellipse cx="64" cy="52" rx="24" ry="5" style="fill:#3c7fa6"/><path d="M10,24l5,-9l5,9zM14,34l6,-11l6,11z" style="fill:#2d7a47"/>');
}
function dFuglekasse() {
  return '<path d="M32,2V10" style="stroke:#8a6735;stroke-width:2"/><path d="M12,30L32,10L52,30Z" style="fill:#c9573b"/><rect x="16" y="30" width="32" height="28" style="fill:#d9b47a;stroke:#8a6735;stroke-width:2"/><circle cx="32" cy="42" r="6" style="fill:#3a2a1c"/><path d="M22,56h20" style="stroke:#8a6735;stroke-width:3;stroke-linecap:round"/><ellipse cx="41" cy="54" rx="3.4" ry="2.2" style="fill:#3b9ad9"/><circle cx="43" cy="52" r="2" style="fill:#3b9ad9"/>';
}
function dIsbre() {
  return fr(128, 60, '<rect x="4" y="4" width="120" height="52" style="fill:#d5ecf7"/><path d="M4,56L26,24L40,38L62,10L90,40L106,26L124,56Z" style="fill:#fff;stroke:#8fc3de;stroke-width:2;stroke-linejoin:round"/><path d="M62,10L50,30L58,26L64,38L72,28L80,30z" style="fill:#a8d6ea"/><path d="M4,56H124V46C100,52 80,44 60,50C40,56 24,48 4,52z" style="fill:#68baDF"/>');
}
function dPapegoye() {
  return fr(64, 64, '<path d="M32,10C20,12 14,24 18,38C20,46 28,54 34,54C44,50 50,36 44,22C42,14 38,10 32,10z" style="fill:#d9453b"/><path d="M40,26C48,32 48,46 38,52C42,42 42,34 40,26z" style="fill:#3b9ad9"/><circle cx="29" cy="22" r="5" style="fill:#fff"/><circle cx="29" cy="22" r="2" style="fill:#13272b"/><path d="M22,20C14,20 14,28 22,30C24,26 24,24 22,20z" style="fill:#f2c230"/>', '#cdebd4');
}
function dFlagg() {
  var c = ['#d9534f', '#f2c230', '#3b9ad9', '#4fae6b', '#e8742a', '#7a5aa6', '#d9534f', '#3b9ad9'], s = '<path d="M4,6Q64,34 124,6" style="stroke:#6d5a46;stroke-width:2;fill:none"/>';
  for (var i = 0; i < 8; i++) { var x = 12 + i * 14, y = 6 + 28 * Math.sin(Math.PI * (x - 4) / 120) * .62 + 2; s += '<path d="M' + (x - 6) + ',' + y.toFixed(1) + 'L' + (x + 6) + ',' + y.toFixed(1) + 'L' + x + ',' + (y + 15).toFixed(1) + 'z" style="fill:' + c[i] + '"/>'; }
  return s;
}
function dMedalje() {
  return '<path d="M20,2L32,30M44,2L32,30" style="stroke:#d9534f;stroke-width:9;fill:none"/><circle cx="32" cy="42" r="18" style="fill:#e3ad33;stroke:#c9962a;stroke-width:3"/><circle cx="32" cy="42" r="12" style="fill:#f4c65a"/><path d="M32,34l2.6,5.4 5.9,.8-4.3,4.1 1,5.8-5.2-2.8-5.2,2.8 1-5.8-4.3-4.1 5.9-.8z" style="fill:#fff4c9"/>';
}

export const ITEMS: Record<string, RoomItem> = {
  sofa: { n: 'Sofa', k: 'floor', w: 3, d: 1, f: dSofa, cat: 'mob', dsc: 'Her kan du hvile etter å ha pugget.' },
  lenestol: { n: 'Lenestol', k: 'floor', w: 1, d: 1, f: dLenestol, cat: 'mob', dsc: 'God plass til én som skal lese pensum.' },
  bord: { n: 'Salongbord', k: 'floor', w: 2, d: 1, f: dBord, cat: 'mob', dsc: 'Med bok og kaffekopp. Kanskje til læreren?' },
  hylle: { n: 'Bokhylle', k: 'floor', w: 2, d: 1, f: dHylle, cat: 'mob', dsc: 'Hyllen er full av bøker. Snu den for å sette den mot en annen vegg.' },
  tv: { n: 'TV-benk', k: 'floor', w: 2, d: 1, f: dTv, cat: 'mob', dsc: 'Snu den slik at skjermen vender mot sofaen.' },
  lampe: { n: 'Gulvlampe', k: 'floor', w: 1, d: 1, f: dLampe, cat: 'mob', dsc: 'Lys i stua. Strøm bør komme fra fornybare kilder.' },
  plante: { n: 'Stueplante', k: 'floor', w: 1, d: 1, f: dPlante, cat: 'mob', dsc: 'Planter gjør luften og stua friskere.' },
  puff: { n: 'Puff', k: 'floor', w: 1, d: 1, f: dPuff, cat: 'mob', dsc: 'Fin å sitte på eller å plassere føttene på.' },
  teppeA: { n: 'Stort teppe', k: 'rug', w: 3, d: 2, f: dTeppeA, cat: 'rug', dsc: 'Et mykt teppe under salongbordet.' },
  teppeB: { n: 'Rundt teppe', k: 'rug', w: 2, d: 2, f: dTeppeB, cat: 'rug', dsc: 'Rundt og fargerikt.' },
  teppeC: { n: 'Løper', k: 'rug', w: 1, d: 3, f: dTeppeC, cat: 'rug', dsc: 'Et langt, smalt teppe. Snu det for å legge det andre veien.' },
  stripes: { n: 'Klimastriper', k: 'wall', w: 2, h: 60, f: dStriper, cat: 'art', dsc: 'Hver stripe er ett år. Rødt betyr varmere enn gjennomsnittet.' },
  kart: { n: 'Verdenskart', k: 'wall', w: 2, h: 56, f: dKart, cat: 'art', dsc: 'Klimaendringer rammer hele kloden.' },
  venn: { n: 'Tre dimensjoner', k: 'wall', w: 1, h: 64, f: dVenn, cat: 'art', dsc: 'Bærekraftig utvikling: miljø, økonomi og samfunn må henge sammen.' },
  fjord: { n: 'Fjordmaleri', k: 'wall', w: 2, h: 56, f: dFjord, cat: 'art', dsc: 'Natur vi vil ta vare på for kommende generasjoner.' },
  temp: { n: 'Temperaturkurve', k: 'wall', w: 2, h: 56, f: dTemp, cat: 'art', dsc: 'Gjennomsnittstemperaturen på jorda stiger.' },
  klokke: { n: 'Veggklokke', k: 'wall', w: 1, h: 64, f: dKlokke, cat: 'art', dsc: 'Tiden går. Tiltak mot klimaendringer haster.' },

  snokule: { n: 'Snøkulen', k: 'floor', w: 1, d: 1, f: dSnokule, dsc: 'Ditt første trofé. Isen på polene smelter, så ta godt vare på snøen.' },
  pingvin: { n: 'Pingvinen', k: 'floor', w: 1, d: 1, f: dPingvin, dsc: 'Dyr som lever i kalde områder mister levestedet sitt når isen smelter.' },
  snoflak: { n: 'Snøkrystallen', k: 'wall', w: 1, h: 64, f: dSnoflak, dsc: 'Hvert snøfnugg er lite, men sammen gjør de en forskjell. Det gjelder også tiltak mot klimaendringer.' },
  regnsky: { n: 'Regnskylampen', k: 'floor', w: 1, d: 1, f: dRegnsky, dsc: 'Vær er det som skjer i dag. Klima er gjennomsnittet over tid.' },
  regnstovler: { n: 'Regnstøvlene', k: 'floor', w: 1, d: 1, f: dStovler, dsc: 'Ekstremvær er en av følgene av klimaendringene, så det lønner seg å være forberedt.' },
  drape: { n: 'Regndråpen', k: 'wall', w: 1, h: 64, f: dDrape, dsc: 'Vann går i kretsløp: det fordamper, blir til skyer og faller som regn.' },
  akvarium: { n: 'Akvariet', k: 'floor', w: 1, d: 1, f: dAkvarium, dsc: 'Korallrev dør i varmt hav, og hele økosystemer ødelegges.' },
  vannkanne: { n: 'Vannkannen', k: 'floor', w: 1, d: 1, f: dKanne, dsc: 'Vann er en verdifull ressurs som må forvaltes bærekraftig.' },
  foss: { n: 'Fossen', k: 'wall', w: 2, h: 60, f: dFoss, dsc: 'Rennende vann kan gi fornybar energi.' },
  tre: { n: 'Skogtreet', k: 'floor', w: 1, d: 1, f: dTre, dsc: 'Bærekraftig skogdrift tar vare på økosystemet og planter nye trær.' },
  sopp: { n: 'Fluesoppen', k: 'floor', w: 1, d: 1, f: dSopp, dsc: 'I skogen henger alt sammen: planter, dyr og sopp i ett økosystem.' },
  fuglekasse: { n: 'Fuglekassen', k: 'wall', w: 1, h: 64, f: dFuglekasse, dsc: 'Å ta vare på naturen er å ta vare på hjemmet til dyrene.' },
  isblokk: { n: 'Isblokken', k: 'floor', w: 1, d: 1, f: dIsblokk, dsc: 'Isen smelter på polene, men det er ikke for sent å handle.' },
  isbjorn: { n: 'Isbjørnen', k: 'floor', w: 1, d: 1, f: dIsbjorn, dsc: 'Isbjørnen trenger havis. Når isen smelter, mister den leveområdet sitt.' },
  isbre: { n: 'Isbreen', k: 'wall', w: 2, h: 60, f: dIsbre, dsc: 'Isbreer smelter når det blir varmere, og havnivået stiger.' },
  palme: { n: 'Regnskogpalmen', k: 'floor', w: 1, d: 1, f: dPalme, dsc: 'Regnskogen fanger karbon. Palmeolje tar plass fra orangutang og tiger.' },
  monstera: { n: 'Regnskogsplanten', k: 'floor', w: 1, d: 1, f: dMonstera, dsc: 'Regnskogen er hjem til utrolig mange arter, og den må vernes.' },
  papegoye: { n: 'Papegøyen', k: 'wall', w: 1, h: 64, f: dPapegoye, dsc: 'Når regnskog hogges, mister dyrene hjemmene sine.' },
  globus: { n: 'Globusen', k: 'floor', w: 1, d: 1, f: dGlobus, dsc: 'Parisavtalen i 2015: alle land må bidra, ikke bare de rikeste.' },
  resirk: { n: 'Gjenvinningsdunken', k: 'floor', w: 1, d: 1, f: dResirk, dsc: 'Å sortere og gjenbruke gir mindre avfall. Det gjelder også klær.' },
  flaggrekke: { n: 'Flaggrekken', k: 'wall', w: 2, h: 40, f: dFlagg, dsc: 'Klimaproblemene krever samarbeid på tvers av landegrenser.' },
  pokal: { n: 'Gullpokalen', k: 'floor', w: 1, d: 1, f: dPokal, dsc: 'Du kan klima og bærekraft. Hvert tiltak bidrar i kampen.' },
  vindmolle: { n: 'Vindmøllen', k: 'floor', w: 1, d: 1, f: dVindmolle, dsc: 'Fornybar energi som vind og sol kan erstatte fossil energi.' },
  medalje: { n: 'Klimamedaljen', k: 'wall', w: 1, h: 64, f: dMedalje, dsc: 'Belønning for innsatsen din. Små valg hver dag gjør en forskjell.' }
};

export const LEVELS: Level[] = [
  { n: 'Snøfnugg', xp: 0, t: ['snokule', 'pingvin', 'snoflak'] },
  { n: 'Regndråpe', xp: 25, t: ['regnsky', 'regnstovler', 'drape'] },
  { n: 'Bekk', xp: 60, t: ['akvarium', 'vannkanne', 'foss'] },
  { n: 'Skogvokter', xp: 100, t: ['tre', 'sopp', 'fuglekasse'] },
  { n: 'Isbre', xp: 150, t: ['isblokk', 'isbjorn', 'isbre'] },
  { n: 'Regnskog', xp: 210, t: ['palme', 'monstera', 'papegoye'] },
  { n: 'Verdensborger', xp: 280, t: ['globus', 'resirk', 'flaggrekke'] },
  { n: 'Klimahelt', xp: 360, t: ['pokal', 'vindmolle', 'medalje'] }
];

export const HOME: Record<string, Placement> = {
  sofa: { x: 2, y: 0, f: 0 }, hylle: { x: 0, y: 1, f: 1 }, tv: { x: 0, y: 3, f: 1 }, teppeA: { x: 2, y: 1, f: 0 }, bord: { x: 2, y: 2, f: 0 },
  lenestol: { x: 5, y: 1, f: 0 }, plante: { x: 6, y: 0, f: 0 }, lampe: { x: 0, y: 5, f: 0 }, puff: { x: 4, y: 4, f: 0 },
  stripes: { wl: 'R', s: 0 }, temp: { wl: 'R', s: 2 }, klokke: { wl: 'R', s: 6 }, kart: { wl: 'L', s: 0 }, fjord: { wl: 'L', s: 3 }
};

export { fv, rectF, at, fr, dPokal, WOODD, DARK, GREEN, GREEND };
