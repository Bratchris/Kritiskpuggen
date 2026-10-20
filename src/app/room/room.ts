// Troférommet: isometrisk stue der eleven setter ut møbler, kunst og trofeer.
// Portert fra den opprinnelige én-fil-appen; tegningene ligger i hvert tema.
import { $, esc } from '../../lib/dom';
import { iso, pts } from './iso';
import { S, T, ITEMS, LEVELS, lvl, save, head, panel, hooks, modeOf } from '../core';

const GRID = 7;
var WALL_TOP = 125, WALL_H = 150;
function isWall(id) { return ITEMS[id].k === 'wall'; }
function unlocked(id) { return ITEMS[id].lv <= lvl(S.points); }
function layerOf(id) { return ITEMS[id].k === 'rug' ? 'r' : 'f'; }
function fpOf(id, r) { var it = ITEMS[id]; return r.f ? [it.d, it.w] : [it.w, it.d]; }

export function defaultHome(): Record<string, any> { return JSON.parse(JSON.stringify(T.room.defaultHome)); }
function fits(id, x, y, f) {
  var it = ITEMS[id], fw = f ? it.d : it.w, fh = f ? it.w : it.d;
  if (x < 0 || y < 0 || x + fw > GRID || y + fh > GRID) return false;
  var ly = layerOf(id), ids = Object.keys(S.home);
  for (var i = 0; i < ids.length; i++) {
    var o = ids[i]; if (o === id || isWall(o) || layerOf(o) !== ly) continue;
    var r = S.home[o], p = fpOf(o, r);
    if (x < r.x + p[0] && r.x < x + fw && y < r.y + p[1] && r.y < y + fh) return false;
  }
  return true;
}
function wfits(id, wl, s) {
  var w = ITEMS[id].w;
  if (s < 0 || s + w > GRID) return false;
  if (wl === 'R' && s < 6 && s + w > 4) return false;
  var ids = Object.keys(S.home);
  for (var i = 0; i < ids.length; i++) {
    var o = ids[i]; if (o === id || !isWall(o)) continue;
    var r = S.home[o];
    if (r.wl === wl && s < r.s + ITEMS[o].w && r.s < s + w) return false;
  }
  return true;
}
export function cleanHome() {
  var old = S.home || {}, ids = Object.keys(old);
  S.home = {};
  ids.forEach(function (id) {
    var r = old[id], it = ITEMS[id];
    if (!r || !it || !unlocked(id)) return;
    if (it.k === 'wall') { if ((r.wl === 'L' || r.wl === 'R') && r.s === Math.floor(r.s) && wfits(id, r.wl, r.s)) S.home[id] = { wl: r.wl, s: r.s }; }
    else if (r.x === Math.floor(r.x) && r.y === Math.floor(r.y) && fits(id, r.x, r.y, r.f ? 1 : 0)) S.home[id] = { x: r.x, y: r.y, f: r.f ? 1 : 0 };
  });
}
function autoPlace(id) {
  var it = ITEMS[id], a, s, x, y;
  if (isWall(id)) { var ws = ['L', 'R']; for (a = 0; a < 2; a++) for (s = 0; s <= GRID - it.w; s++) if (wfits(id, ws[a], s)) return { wl: ws[a], s: s }; return null; }
  var best = null, bd = 999;
  for (y = 0; y < GRID; y++) for (x = 0; x < GRID; x++) if (fits(id, x, y, 0)) { var d = Math.abs(x + it.w / 2 - GRID / 2) + Math.abs(y + it.d / 2 - GRID / 2); if (d < bd) { bd = d; best = { x: x, y: y, f: 0 }; } }
  return best;
}
function occupantAt(x, y) {
  var ids = Object.keys(S.home), rug = null;
  for (var i = 0; i < ids.length; i++) {
    var o = ids[i]; if (isWall(o)) continue;
    var r = S.home[o], p = fpOf(o, r);
    if (x >= r.x && x < r.x + p[0] && y >= r.y && y < r.y + p[1]) { if (layerOf(o) === 'f') return o; rug = o; }
  }
  return rug;
}

function tileC(x, y) { return [(x - y) * 32, (x + y + 1) * 16]; }
function footC(x, y, fw, fh) { return [(x - y + (fw - fh) / 2) * 32, (x + y + (fw + fh) / 2) * 16]; }
function furnG(id, flip?) {
  var it = ITEMS[id], sh = it.k === 'rug' ? '' : '<ellipse cx="0" cy="3" rx="' + ((it.w + it.d) * 11) + '" ry="' + ((it.w + it.d) * 5) + '" style="fill:#000;opacity:.16"/>';
  var g = sh + it.f();
  return flip ? '<g transform="scale(-1 1)">' + g + '</g>' : g;
}
function wallG(id, wl, s) {
  var tx = wl === 'R' ? 32 * s : -32 * s, ty = 16 * s - WALL_TOP;
  return '<g class="furn" data-id="' + id + '" transform="matrix(' + (wl === 'R' ? '.5' : '-.5') + ' .25 0 1 ' + tx + ' ' + ty + ')"><title>' + esc(ITEMS[id].n) + '</title>' + ITEMS[id].f() + '</g>';
}
function wallPt(wl, s, z) { return wl === 'R' ? iso(s, 0, z) : iso(0, s, z); }
function tilePoly(x, y) { var c = tileC(x, y); return c[0] + ',' + (c[1] - 16) + ' ' + (c[0] + 32) + ',' + c[1] + ' ' + c[0] + ',' + (c[1] + 16) + ' ' + (c[0] - 32) + ',' + c[1]; }
function wallQuad(wl, s, w, z0, z1) { return pts([wallPt(wl, s, z0), wallPt(wl, s + w, z0), wallPt(wl, s + w, z1), wallPt(wl, s, z1)]); }

function roomSVG(selId) {
  var N = GRID, H = WALL_H, E = iso(0, N, 0), F = iso(N, 0, 0), B = iso(N, N, 0), x, y, i;
  var s = '<svg class="room' + (selId && isWall(selId) ? ' wallmode' : '') + '" viewBox="-230 -158 460 398" role="img" aria-label="' + esc(T.room.ariaLabel) + '">';
  s += '<polygon points="0,0 ' + E[0] + ',' + E[1] + ' ' + E[0] + ',' + (E[1] - H) + ' 0,' + (-H) + '" style="fill:var(--wall-l)"/><polygon points="0,0 ' + F[0] + ',' + F[1] + ' ' + F[0] + ',' + (F[1] - H) + ' 0,' + (-H) + '" style="fill:var(--wall-r)"/>';
  s += '<polygon points="0,0 ' + E[0] + ',' + E[1] + ' ' + E[0] + ',' + (E[1] - 9) + ' 0,-9" style="fill:var(--edge-l);opacity:.35"/><polygon points="0,0 ' + F[0] + ',' + F[1] + ' ' + F[0] + ',' + (F[1] - 9) + ' 0,-9" style="fill:var(--edge-r);opacity:.35"/>';
  s += '<g transform="matrix(.5 .25 0 1 128 ' + (64 - WALL_TOP) + ')"><rect x="6" y="10" width="116" height="56" style="fill:var(--sky);stroke:var(--frame);stroke-width:5"/><path d="M64,10V66M6,38H122" style="stroke:var(--frame);stroke-width:3"/>' + T.room.windowArt + '</g>';
  for (i = 0; i < N; i++) {
    s += '<polygon class="wslot" data-wl="L" data-s="' + i + '" points="' + wallQuad('L', i, 1, 30, 140) + '"/>';
    if (i < 4 || i > 5) s += '<polygon class="wslot" data-wl="R" data-s="' + i + '" points="' + wallQuad('R', i, 1, 30, 140) + '"/>';
  }
  Object.keys(S.home).forEach(function (id) { if (isWall(id)) s += wallG(id, S.home[id].wl, S.home[id].s); });
  s += '<polygon points="' + E[0] + ',' + E[1] + ' ' + B[0] + ',' + B[1] + ' ' + B[0] + ',' + (B[1] + 12) + ' ' + E[0] + ',' + (E[1] + 12) + '" style="fill:var(--edge-l)"/><polygon points="' + B[0] + ',' + B[1] + ' ' + F[0] + ',' + F[1] + ' ' + F[0] + ',' + (F[1] + 12) + ' ' + B[0] + ',' + (B[1] + 12) + '" style="fill:var(--edge-r)"/>';
  for (y = 0; y < N; y++) for (x = 0; x < N; x++) s += '<polygon class="tile" data-x="' + x + '" data-y="' + y + '" points="' + tilePoly(x, y) + '" style="fill:var(--floor-' + ((x + y) % 2 ? 'b' : 'a') + ')"/>';
  if (selId && S.home[selId] && !isWall(selId)) {
    var sr = S.home[selId], sp = fpOf(selId, sr);
    for (y = sr.y; y < sr.y + sp[1]; y++) for (x = sr.x; x < sr.x + sp[0]; x++) s += '<polygon points="' + tilePoly(x, y) + '" style="fill:var(--accent);fill-opacity:.3;stroke:var(--accent);stroke-width:2;pointer-events:none"/>';
  }
  if (selId && S.home[selId] && isWall(selId)) s += '<polygon points="' + wallQuad(S.home[selId].wl, S.home[selId].s, ITEMS[selId].w, WALL_TOP - ITEMS[selId].h - 4, WALL_TOP + 4) + '" style="fill:none;stroke:var(--accent);stroke-width:3;pointer-events:none"/>';
  var fl = Object.keys(S.home).filter(function (id) { return !isWall(id); });
  fl.sort(function (a, b) {
    var A = S.home[a], B2 = S.home[b], pa = fpOf(a, A), pb = fpOf(b, B2), la = layerOf(a) === 'r' ? 0 : 1, lb = layerOf(b) === 'r' ? 0 : 1;
    return la - lb || (A.x + pa[0] + A.y + pa[1]) - (B2.x + pb[0] + B2.y + pb[1]) || A.x - B2.x;
  });
  fl.forEach(function (id) {
    var r = S.home[id], p = fpOf(id, r), c = footC(r.x, r.y, p[0], p[1]);
    s += '<g class="furn' + (layerOf(id) === 'r' ? ' rug' : '') + '" data-id="' + id + '" transform="translate(' + c[0] + ' ' + c[1] + ')"><title>' + esc(ITEMS[id].n) + '</title>' + furnG(id, r.f) + '</g>';
  });
  return s + '</svg>';
}
export function pv(id) {
  var it = ITEMS[id];
  if (isWall(id)) return '<svg class="pv" viewBox="-2 -2 ' + (it.w * 64 + 4) + ' ' + (it.h + 4) + '" aria-hidden="true">' + it.f() + '</svg>';
  return '<svg class="pv fit" viewBox="-45 -90 90 112" aria-hidden="true"><g>' + furnG(id, 0) + '</g></svg>';
}
export function fitPv(root) {
  root.querySelectorAll('svg.fit').forEach(function (v) {
    try { var b = v.firstChild.getBBox(); if (b.width > 0) v.setAttribute('viewBox', (b.x - 4) + ' ' + (b.y - 4) + ' ' + (b.width + 8) + ' ' + (b.height + 8)); } catch (e) {}
  });
}

export function rm() { return S.cur.rom || (S.cur.rom = { sel: null, msg: '' }); }
export function hint(id) { return S.home[id] ? '' : (isWall(id) ? 'Trykk på et felt på veggen, eller bruk «Sett ut i rommet».' : 'Trykk på en tom rute i gulvet, eller bruk «Sett ut i rommet».'); }

export function renderRoom(): void {
  cleanHome();
  var p = panel(), st = rm(), cur = lvl(S.points), L = LEVELS[cur], nx = LEVELS[cur + 1];
  if (S.seenLvl !== cur) { S.seenLvl = cur; save(); hooks.refresh(); }
  if (st.sel && (!ITEMS[st.sel] || !unlocked(st.sel))) st.sel = null;
  var pct = nx ? Math.max(0, Math.min(100, Math.round((S.points - L.xp) / (nx.xp - L.xp) * 100))) : 100;
  var total = 0, got = 0;
  LEVELS.forEach(function (lv, i) { total += lv.t.length; if (i <= cur) got += lv.t.length; });
  var selHTML;
  if (st.sel) {
    var it = ITEMS[st.sel], r = S.home[st.sel], wall = isWall(st.sel), ctl;
    if (!r) ctl = '<button class="btn primary" id="r-place" type="button">Sett ut i rommet</button>';
    else if (wall) ctl = '<button class="btn" id="w-a" type="button">Mot hjørnet</button><button class="btn" id="w-b" type="button">Mot kanten</button><button class="btn" id="w-sw" type="button">Bytt vegg</button><button class="btn ghost" id="r-take" type="button">Ta ned</button>';
    else ctl = '<div class="dpad" role="group" aria-label="Flytt på gulvet">' +
      '<button class="mv" type="button" data-dx="-1" data-dy="0" aria-label="Flytt opp til venstre">↖</button><button class="mv" type="button" data-dx="0" data-dy="-1" aria-label="Flytt opp til høyre">↗</button>' +
      '<button class="mv" type="button" data-dx="0" data-dy="1" aria-label="Flytt ned til venstre">↙</button><button class="mv" type="button" data-dx="1" data-dy="0" aria-label="Flytt ned til høyre">↘</button></div>' +
      '<button class="btn" id="r-flip" type="button">Snu</button><button class="btn ghost" id="r-take" type="button">Ta ned</button>';
    selHTML = '<h3>' + esc(it.n) + '</h3><p>' + esc(it.dsc) + '</p><div class="selact">' + ctl + '</div>';
  } else {
    selHTML = '<p>Velg møbler, plakater eller trofeer fra samlingen under. Trykk så på en tom rute i gulvet (eller et felt på veggen) for å sette dem ut. Trykk på noe i rommet for å flytte det, snu det eller ta det ned.</p>';
  }
  function card(id) {
    var it = ITEMS[id], open = unlocked(id), placed = !!S.home[id], sel = st.sel === id;
    var sub = open ? (placed ? 'I rommet' : 'I skapet') : 'Nivå ' + esc(LEVELS[it.lv].n) + ' · ' + LEVELS[it.lv].xp + ' XP';
    return '<button type="button" class="tcard' + (open ? '' : ' locked') + (sel ? ' sel' : '') + '" data-t="' + id + '"' + (open ? ' aria-pressed="' + sel + '"' : ' disabled') + '>' + pv(id) +
      '<span class="tname">' + (open ? esc(it.n) : 'Låst') + '</span><span class="tsub">' + sub + '</span></button>';
  }
  var tray = '';
  T.room.groups.forEach(function (g) {
    var ids = Object.keys(ITEMS).filter(function (id) { return ITEMS[id].cat === g[0]; });
    tray += '<h3 class="grp">' + g[1] + '</h3><div class="tray">' + ids.map(card).join('') + '</div>';
  });
  tray += '<h3 class="grp">Trofeer fra nivåene</h3>';
  LEVELS.forEach(function (lv, i) {
    tray += '<h4 class="grp2">' + (i <= cur ? '' : '🔒 ') + 'Nivå ' + (i + 1) + ' · ' + esc(lv.n) + '</h4><div class="tray">' + lv.t.map(card).join('') + '</div>';
  });
  p.innerHTML = head('rom') +
    '<div class="lvlcard"><div class="lvlrow"><span class="lvlname">' + esc(L.n) + '</span><span class="count">Nivå ' + (cur + 1) + ' av ' + LEVELS.length + ' · ' + S.points + ' XP</span></div>' +
    '<div class="meter" role="progressbar" aria-label="Fremdrift mot neste nivå" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pct + '"><i style="width:' + pct + '%"></i></div>' +
    '<p class="keyhint" style="margin:0">' + (nx ? 'Neste nivå er ' + esc(nx.n) + ' ved ' + nx.xp + ' XP. Du mangler ' + (nx.xp - S.points) + ' XP for å låse opp tre nye trofeer. ' : 'Du har nådd øverste nivå. ') + 'Trofeer: ' + got + ' av ' + total + ' er låst opp.</p></div>' +
    '<div class="roomwrap">' + roomSVG(st.sel) + '</div>' +
    '<div class="selbar">' + selHTML + '<p class="msg" style="margin:8px 0 0" aria-live="polite">' + esc(st.msg) + '</p></div>' +
    tray +
    '<details style="margin-top:18px"><summary>Slik fungerer XP og nivåer</summary><ul class="earn"><li>XP er alle poengene du noen gang har tjent i øvelsene.</li><li>Å bruke poeng i ' + esc(modeOf('shop').name) + ' senker ikke XP-en din.</li><li>Hvert nivå låser opp tre nye trofeer. De er ekstra pynt som du kan sette ut i stua, sammen med møblene og kunsten du allerede har.</li></ul></details>';
  fitPv(p);

  function done(msg?, focusSel?) { st.msg = msg || ''; save(); renderRoom(); if (focusSel) { var a = p.querySelector(focusSel); if (a) a.focus({ preventScroll: true }); } }
  $('.roomwrap').onclick = function (e) {
    var f = e.target.closest('.furn');
    if (f) { st.sel = f.dataset.id; st.msg = ''; renderRoom(); return; }
    var sl = e.target.closest('.wslot');
    if (sl) {
      if (!st.sel) { st.msg = 'Velg først en plakett eller et bilde fra samlingen.'; renderRoom(); return; }
      if (!isWall(st.sel)) { st.msg = ITEMS[st.sel].n + ' skal stå på gulvet.'; renderRoom(); return; }
      var wl = sl.dataset.wl, s0 = Math.min(+sl.dataset.s, GRID - ITEMS[st.sel].w);
      if (wfits(st.sel, wl, s0)) { S.home[st.sel] = { wl: wl, s: s0 }; done(ITEMS[st.sel].n + ' henger nå på veggen.'); }
      else { st.msg = 'Det er ikke plass der på veggen.'; renderRoom(); }
      return;
    }
    var t = e.target.closest('.tile'); if (!t) return;
    var x = +t.dataset.x, y = +t.dataset.y, occ = occupantAt(x, y);
    if (!st.sel || isWall(st.sel)) {
      if (occ) { st.sel = occ; st.msg = ''; } else st.msg = st.sel ? ITEMS[st.sel].n + ' skal henge på veggen.' : 'Velg først noe fra samlingen.';
      renderRoom(); return;
    }
    var rec = S.home[st.sel], fl = rec ? rec.f : 0, it2 = ITEMS[st.sel], fw = fl ? it2.d : it2.w, fh = fl ? it2.w : it2.d;
    var x2 = Math.min(x, GRID - fw), y2 = Math.min(y, GRID - fh);
    if (fits(st.sel, x2, y2, fl)) { S.home[st.sel] = { x: x2, y: y2, f: fl }; done(it2.n + ' står nå i rommet.'); }
    else if (occ && occ !== st.sel) { st.sel = occ; st.msg = ''; renderRoom(); }
    else { st.msg = 'Det er ikke plass der.'; renderRoom(); }
  };
  p.querySelectorAll('.tcard:not(.locked)').forEach(function (b) {
    b.onclick = function () { st.sel = b.dataset.t; st.msg = hint(st.sel); renderRoom(); var a = p.querySelector('.tcard[data-t="' + st.sel + '"]'); if (a) a.focus({ preventScroll: true }); };
  });
  var pl = $('#r-place');
  if (pl) pl.onclick = function () { var q = autoPlace(st.sel); if (q) { S.home[st.sel] = q; done(ITEMS[st.sel].n + ' er satt ut.', '#r-take'); } else { st.msg = 'Det er ikke ledig plass. Ta ned noe først.'; renderRoom(); } };
  var tk = $('#r-take');
  if (tk) tk.onclick = function () { delete S.home[st.sel]; done(ITEMS[st.sel].n + ' ligger i skapet igjen.'); };
  var fp = $('#r-flip');
  if (fp) fp.onclick = function () {
    var r = S.home[st.sel], nf = r.f ? 0 : 1, it3 = ITEMS[st.sel], fw = nf ? it3.d : it3.w, fh = nf ? it3.w : it3.d;
    var x3 = Math.min(r.x, GRID - fw), y3 = Math.min(r.y, GRID - fh);
    if (fits(st.sel, x3, y3, nf)) { r.f = nf; r.x = x3; r.y = y3; done('', '#r-flip'); } else { st.msg = 'Det er ikke plass til å snu den her.'; renderRoom(); var a = $('#r-flip'); if (a) a.focus({ preventScroll: true }); }
  };
  function wmove(id, d) {
    var r = S.home[st.sel], n = r.s + d;
    if (wfits(st.sel, r.wl, n)) { r.s = n; done('', id); } else { st.msg = n < 0 || n + ITEMS[st.sel].w > GRID ? 'Der er enden av veggen.' : 'Det er opptatt der.'; renderRoom(); var a = $(id); if (a) a.focus({ preventScroll: true }); }
  }
  var wa = $('#w-a'); if (wa) wa.onclick = function () { wmove('#w-a', -1); };
  var wb = $('#w-b'); if (wb) wb.onclick = function () { wmove('#w-b', 1); };
  var ws = $('#w-sw');
  if (ws) ws.onclick = function () {
    var r = S.home[st.sel], nw: any = r.wl === "L" ? "R" : "L", w = ITEMS[st.sel].w, cand = [r.s];
    for (var k = 0; k <= GRID - w; k++) cand.push(k);
    for (var j = 0; j < cand.length; j++) if (wfits(st.sel, nw, cand[j])) { r.wl = nw; r.s = cand[j]; done('', '#w-sw'); return; }
    st.msg = 'Det er ikke plass på den andre veggen.'; renderRoom(); var a = $('#w-sw'); if (a) a.focus({ preventScroll: true });
  };
  p.querySelectorAll('.mv[data-dx]').forEach(function (b) {
    b.onclick = function () {
      var dx = +b.dataset.dx, dy = +b.dataset.dy, r = S.home[st.sel], it4 = ITEMS[st.sel], fw = r.f ? it4.d : it4.w, fh = r.f ? it4.w : it4.d, nx2 = r.x + dx, ny2 = r.y + dy;
      if (nx2 < 0 || ny2 < 0 || nx2 + fw > GRID || ny2 + fh > GRID) st.msg = 'Der er veggen.';
      else if (!fits(st.sel, nx2, ny2, r.f)) st.msg = 'Det er opptatt der.';
      else { r.x = nx2; r.y = ny2; st.msg = ''; save(); }
      renderRoom();
      var again = p.querySelector('.mv[data-dx="' + dx + '"][data-dy="' + dy + '"]'); if (again) again.focus({ preventScroll: true });
    };
  });
}

