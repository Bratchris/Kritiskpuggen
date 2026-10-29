// Troférommet: et hus med flere isometriske rom. Eleven setter ut møbler, kunst og trofeer.
//
// Nøkler i S.home:
//  - Trofeer finnes én gang og har nøkkel = id. Placement.r sier hvilket rom de står i.
//  - Møbler, tepper og kunst finnes i hvert rom: nøkkel = id i første rom, id~r i rom r.
import { companionG } from '../../pets/screen';
import { $, esc } from '../../lib/dom';
import { iso, pts } from './iso';
import { S, T, ITEMS, LEVELS, lvl, save, head, panel, hooks, modeOf, stars, starText, topXp, STAR_XP } from '../core';
import type { Placement, HouseRoom, RoomItem } from '../../themes/types';
import { avatarG } from '../../avatar/render';

const GRID = 8;
const WALL_TOP = 125, WALL_H = 150;
const WIN_S = 4, WIN_W = 2; // vinduet står på høyre vegg, felt 4–5

// ---------- nøkler og oppslag ----------
const baseOf = (key: string) => key.split('~')[0];
const IT = (key: string): RoomItem => ITEMS[baseOf(key)];
const unique = (id: string) => ITEMS[id].cat === 'tro';
export function keyFor(id: string, room: number): string { return unique(id) || room === 0 ? id : id + '~' + room; }
const roomOf = (key: string) => (S.home[key]?.r ?? 0);
const isWall = (key: string) => IT(key).k === 'wall';
const layerOf = (key: string) => (IT(key).k === 'rug' ? 'r' : 'f');
const unlocked = (key: string) => (IT(key).lv ?? -1) <= lvl(S.points);
function fp(key: string, r: Placement): [number, number] { const it = IT(key); return r.f ? [it.d!, it.w] : [it.w, it.d!]; }

const ROOMS = (): HouseRoom[] => T.room.rooms;
const roomOpen = (i: number) => !!ROOMS()[i] && ROOMS()[i].lv <= lvl(S.points);
const hasWindow = (i: number) => ROOMS()[i]?.window !== false;
/** Rom som åpnes på nivå i. Brukes i nivå-dialogen. */
export function roomsAt(levelIndex: number): HouseRoom[] { return ROOMS().filter((r) => r.lv === levelIndex && r.lv > 0); }

export function rm(): { sel: string | null; msg: string; room: number; ava: { room: number; x: number; y: number } | null } { return S.cur.rom || (S.cur.rom = { sel: null, msg: '', room: 0, ava: null }); }

/** Tilfeldig ledig rute for avataren i rommet. Tepper kan avataren stå på. */
function avatarTile(room: number): { x: number; y: number } | null {
  const st = rm();
  if (st.ava && st.ava.room === room && !occupantFloor(st.ava.x, st.ava.y, room)) return st.ava;
  const free: [number, number][] = [];
  for (let y = 0; y < GRID; y++) for (let x = 0; x < GRID; x++) if (!occupantFloor(x, y, room)) free.push([x, y]);
  if (!free.length) { st.ava = null; return null; }
  const [x, y] = free[Math.floor(Math.random() * free.length)];
  st.ava = { room, x, y };
  return st.ava;
}
function occupantFloor(x: number, y: number, room: number): boolean {
  const o = occupantAt(x, y, room);
  return !!o && layerOf(o) === 'f';
}
function avatarSprite(x: number, y: number): string {
  const c = tileC(x, y), k = 0.42, pet = companionG();
  return '<g class="ava" transform="translate(' + c[0] + ' ' + c[1] + ')"><title>Avataren din</title><ellipse cx="0" cy="2" rx="13" ry="5" style="fill:#000;opacity:.18"/>' +
    '<g class="ava-b"><g transform="translate(' + (-60 * k) + ' ' + (-154 * k) + ') scale(' + k + ')">' + avatarG(S.avatar) + '</g></g>' +
    (pet ? '<g class="ava-pet" transform="translate(14 -26) scale(.3)"><title>Dyret ditt</title>' + pet + '</g>' : '') + '</g>';
}

// ---------- plass ----------
function fits(key: string, x: number, y: number, f: number, room: number, home = S.home): boolean {
  const it = IT(key), fw = f ? it.d! : it.w, fh = f ? it.w : it.d!;
  if (x < 0 || y < 0 || x + fw > GRID || y + fh > GRID) return false;
  const ly = layerOf(key);
  for (const o of Object.keys(home)) {
    if (o === key || isWall(o) || layerOf(o) !== ly || (home[o].r ?? 0) !== room) continue;
    const r = home[o], p = fp(o, r);
    if (x < r.x! + p[0] && r.x! < x + fw && y < r.y! + p[1] && r.y! < y + fh) return false;
  }
  return true;
}
function wfits(key: string, wl: 'L' | 'R', s: number, room: number, home = S.home): boolean {
  const w = IT(key).w;
  if (s < 0 || s + w > GRID) return false;
  if (wl === 'R' && hasWindow(room) && s < WIN_S + WIN_W && s + w > WIN_S) return false;
  for (const o of Object.keys(home)) {
    if (o === key || !isWall(o) || (home[o].r ?? 0) !== room) continue;
    const r = home[o];
    if (r.wl === wl && s < r.s! + IT(o).w && r.s! < s + w) return false;
  }
  return true;
}
function autoPlace(key: string, room: number): Placement | null {
  const it = IT(key);
  if (isWall(key)) {
    for (const wl of ['L', 'R'] as const) for (let s = 0; s <= GRID - it.w; s++) if (wfits(key, wl, s, room)) return { wl, s, r: room };
    return null;
  }
  let best: Placement | null = null, bd = 999;
  for (let y = 0; y < GRID; y++) for (let x = 0; x < GRID; x++) if (fits(key, x, y, 0, room)) {
    const d = Math.abs(x + it.w / 2 - GRID / 2) + Math.abs(y + it.d! / 2 - GRID / 2);
    if (d < bd) { bd = d; best = { x, y, f: 0, r: room }; }
  }
  return best;
}
function occupantAt(x: number, y: number, room: number): string | null {
  let rug: string | null = null;
  for (const o of Object.keys(S.home)) {
    if (isWall(o) || roomOf(o) !== room) continue;
    const r = S.home[o], p = fp(o, r);
    if (x >= r.x! && x < r.x! + p[0] && y >= r.y! && y < r.y! + p[1]) { if (layerOf(o) === 'f') return o; rug = o; }
  }
  return rug;
}

/** Fjerner ugyldige plasseringer og gir nye rom startmøblene sine. */
export function cleanHome(): void {
  const old = S.home || {}, kept: Record<string, Placement> = {};
  for (const key of Object.keys(old)) {
    const r = old[key], base = baseOf(key);
    if (!r || !ITEMS[base] || !unlocked(key)) continue;
    const room = r.r ?? 0;
    if (!roomOpen(room) || key !== keyFor(base, room)) continue;
    if (IT(key).k === 'wall') {
      if ((r.wl === 'L' || r.wl === 'R') && Number.isInteger(r.s) && wfits(key, r.wl, r.s!, room, kept)) kept[key] = { wl: r.wl, s: r.s, r: room };
    } else if (Number.isInteger(r.x) && Number.isInteger(r.y) && fits(key, r.x!, r.y!, r.f ? 1 : 0, room, kept)) kept[key] = { x: r.x, y: r.y, f: r.f ? 1 : 0, r: room };
  }
  S.home = kept;
  let changed = false;
  ROOMS().forEach((R, i) => {
    if (!roomOpen(i) || S.seeded.indexOf(i) > -1) return;
    for (const id of Object.keys(R.home)) {
      if (!ITEMS[id] || unique(id)) continue;
      const key = keyFor(id, i), p = R.home[id];
      if (S.home[key]) continue;
      const ok = ITEMS[id].k === 'wall' ? wfits(key, p.wl!, p.s!, i) : fits(key, p.x!, p.y!, p.f ? 1 : 0, i);
      if (ok) S.home[key] = { ...p, r: i };
    }
    S.seeded.push(i); changed = true;
  });
  if (changed) save();
}

// ---------- tegning ----------
function tileC(x: number, y: number) { return [(x - y) * 32, (x + y + 1) * 16]; }
function footC(x: number, y: number, fw: number, fh: number) { return [(x - y + (fw - fh) / 2) * 32, (x + y + (fw + fh) / 2) * 16]; }
function furnG(key: string, flip?: number) {
  const it = IT(key), sh = it.k === 'rug' ? '' : '<ellipse cx="0" cy="3" rx="' + ((it.w + it.d!) * 11) + '" ry="' + ((it.w + it.d!) * 5) + '" style="fill:#000;opacity:.16"/>';
  const g = sh + it.f();
  return flip ? '<g transform="scale(-1 1)">' + g + '</g>' : g;
}
function wallG(key: string, wl: 'L' | 'R', s: number) {
  const it = IT(key), tx = wl === 'R' ? 32 * s : -32 * s, ty = 16 * s - WALL_TOP;
  // Venstre vegg speiles av matrisen, så tegningen speiles tilbake for at tekst skal leses riktig.
  const art = wl === 'R' ? it.f() : '<g transform="translate(' + it.w * 64 + ' 0) scale(-1 1)">' + it.f() + '</g>';
  return '<g class="furn" data-id="' + key + '" transform="matrix(' + (wl === 'R' ? '.5' : '-.5') + ' .25 0 1 ' + tx + ' ' + ty + ')"><title>' + esc(it.n) + '</title>' + art + '</g>';
}
function wallPt(wl: string, s: number, z: number) { return wl === 'R' ? iso(s, 0, z) : iso(0, s, z); }
function tilePoly(x: number, y: number) { const c = tileC(x, y); return c[0] + ',' + (c[1] - 16) + ' ' + (c[0] + 32) + ',' + c[1] + ' ' + c[0] + ',' + (c[1] + 16) + ' ' + (c[0] - 32) + ',' + c[1]; }
function wallQuad(wl: string, s: number, w: number, z0: number, z1: number) { return pts([wallPt(wl, s, z0), wallPt(wl, s + w, z0), wallPt(wl, s + w, z1), wallPt(wl, s, z1)]); }

function roomSVG(selKey: string | null, room: number): string {
  const N = GRID, H = WALL_H, E = iso(0, N, 0), F = iso(N, 0, 0), B = iso(N, N, 0), R = ROOMS()[room];
  const vw = N * 64 + 12, vh = H + 8 + N * 32 + 16;
  const inRoom = (k: string) => roomOf(k) === room;
  let s = '<svg class="room ' + (R.cls || '') + (selKey && isWall(selKey) && inRoom(selKey) ? ' wallmode' : '') + '" viewBox="' + (-N * 32 - 6) + ' ' + (-H - 8) + ' ' + vw + ' ' + vh + '" role="img" aria-label="' + esc(R.name + '. ' + T.room.ariaLabel) + '">';
  s += '<polygon points="0,0 ' + E[0] + ',' + E[1] + ' ' + E[0] + ',' + (E[1] - H) + ' 0,' + (-H) + '" style="fill:var(--wall-l)"/><polygon points="0,0 ' + F[0] + ',' + F[1] + ' ' + F[0] + ',' + (F[1] - H) + ' 0,' + (-H) + '" style="fill:var(--wall-r)"/>';
  s += '<polygon points="0,0 ' + E[0] + ',' + E[1] + ' ' + E[0] + ',' + (E[1] - 9) + ' 0,-9" style="fill:var(--edge-l);opacity:.35"/><polygon points="0,0 ' + F[0] + ',' + F[1] + ' ' + F[0] + ',' + (F[1] - 9) + ' 0,-9" style="fill:var(--edge-r);opacity:.35"/>';
  if (hasWindow(room)) s += '<g transform="matrix(.5 .25 0 1 ' + 32 * WIN_S + ' ' + (16 * WIN_S - WALL_TOP) + ')"><rect x="6" y="10" width="116" height="56" style="fill:var(--sky);stroke:var(--frame);stroke-width:5"/><path d="M64,10V66M6,38H122" style="stroke:var(--frame);stroke-width:3"/>' + T.room.windowArt + '</g>';
  for (let i = 0; i < N; i++) {
    s += '<polygon class="wslot" data-wl="L" data-s="' + i + '" points="' + wallQuad('L', i, 1, 30, 140) + '"/>';
    if (!hasWindow(room) || i < WIN_S || i >= WIN_S + WIN_W) s += '<polygon class="wslot" data-wl="R" data-s="' + i + '" points="' + wallQuad('R', i, 1, 30, 140) + '"/>';
  }
  Object.keys(S.home).forEach((k) => { if (isWall(k) && inRoom(k)) s += wallG(k, S.home[k].wl!, S.home[k].s!); });
  s += '<polygon points="' + E[0] + ',' + E[1] + ' ' + B[0] + ',' + B[1] + ' ' + B[0] + ',' + (B[1] + 12) + ' ' + E[0] + ',' + (E[1] + 12) + '" style="fill:var(--edge-l)"/><polygon points="' + B[0] + ',' + B[1] + ' ' + F[0] + ',' + F[1] + ' ' + F[0] + ',' + (F[1] + 12) + ' ' + B[0] + ',' + (B[1] + 12) + '" style="fill:var(--edge-r)"/>';
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) s += '<polygon class="tile" data-x="' + x + '" data-y="' + y + '" points="' + tilePoly(x, y) + '" style="fill:var(--floor-' + ((x + y) % 2 ? 'b' : 'a') + ')"/>';
  if (selKey && S.home[selKey] && inRoom(selKey)) {
    const sr = S.home[selKey];
    if (!isWall(selKey)) {
      const sp = fp(selKey, sr);
      for (let y = sr.y!; y < sr.y! + sp[1]; y++) for (let x = sr.x!; x < sr.x! + sp[0]; x++) s += '<polygon points="' + tilePoly(x, y) + '" style="fill:var(--accent);fill-opacity:.3;stroke:var(--accent);stroke-width:2;pointer-events:none"/>';
    } else s += '<polygon points="' + wallQuad(sr.wl!, sr.s!, IT(selKey).w, WALL_TOP - IT(selKey).h! - 4, WALL_TOP + 4) + '" style="fill:none;stroke:var(--accent);stroke-width:3;pointer-events:none"/>';
  }
  const fl = Object.keys(S.home).filter((k) => !isWall(k) && inRoom(k));
  fl.sort((a, b) => {
    const A = S.home[a], B2 = S.home[b], pa = fp(a, A), pb = fp(b, B2), la = layerOf(a) === 'r' ? 0 : 1, lb = layerOf(b) === 'r' ? 0 : 1;
    return la - lb || (A.x! + pa[0] + A.y! + pa[1]) - (B2.x! + pb[0] + B2.y! + pb[1]) || A.x! - B2.x!;
  });
  // Avataren tegnes etter teppene og foran møbler som står lenger bak.
  const at = avatarTile(room), aDepth = at ? at.x + at.y + 2 : 0;
  let avaDone = !at;
  fl.forEach((k) => {
    const r = S.home[k], p = fp(k, r), c = footC(r.x!, r.y!, p[0], p[1]);
    if (!avaDone && layerOf(k) === 'f' && r.x! + p[0] + r.y! + p[1] > aDepth) { s += avatarSprite(at!.x, at!.y); avaDone = true; }
    s += '<g class="furn' + (layerOf(k) === 'r' ? ' rug' : '') + '" data-id="' + k + '" transform="translate(' + c[0] + ' ' + c[1] + ')"><title>' + esc(IT(k).n) + '</title>' + furnG(k, r.f) + '</g>';
  });
  if (!avaDone && at) s += avatarSprite(at.x, at.y);
  return s + '</svg>';
}

/** Huset sett forfra. Hvert rom er en knapp; låste rom viser nivået som trengs. */
function houseSVG(cur: number): string {
  const box: Record<string, [number, number, number, number]> = { loft: [104, 50, 112, 36], g1: [30, 96, 128, 70], g2: [162, 96, 128, 70], base: [30, 184, 260, 50] };
  let s = '<svg class="house" viewBox="0 0 320 250" role="group" aria-label="Rommene i huset">' +
    '<path d="M236,48V22h20v42" style="fill:var(--surface);stroke:var(--ink);stroke-width:2.4"/>' +
    '<path d="M14,92L160,10L306,92Z" style="fill:var(--surface);stroke:var(--ink);stroke-width:2.6;stroke-linejoin:round"/>' +
    '<rect x="24" y="90" width="272" height="82" style="fill:var(--surface);stroke:var(--ink);stroke-width:2.6"/>' +
    '<path d="M6,174H314" style="stroke:var(--leaf);stroke-width:5;stroke-linecap:round"/>' +
    '<rect x="24" y="178" width="272" height="62" rx="2" style="fill:var(--bg);stroke:var(--ink);stroke-width:2;stroke-dasharray:5 3"/>';
  ROOMS().forEach((R, i) => {
    const [x, y, w, h] = box[R.pos], open = roomOpen(i), on = i === cur;
    const fill = on ? 'var(--sand)' : open ? 'var(--ans-bg)' : 'var(--bg)', ink = on ? 'var(--sand-ink)' : open ? 'var(--ink)' : 'var(--muted)';
    const label = open ? R.name + (on ? ', valgt' : '') : R.name + ', låst til nivå ' + (R.lv + 1);
    s += '<g class="hroom' + (open ? '' : ' locked') + (on ? ' on' : '') + '" data-room="' + i + '" role="button" tabindex="' + (open ? 0 : -1) + '" aria-label="' + esc(label) + '"' + (open ? '' : ' aria-disabled="true"') + (on ? ' aria-current="true"' : '') + '>' +
      '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="6" style="fill:' + fill + ';stroke:' + (on ? 'var(--sand)' : 'var(--line)') + ';stroke-width:2' + (open ? '' : ';stroke-dasharray:4 3') + '"/>' +
      '<text x="' + (x + w / 2) + '" y="' + (y + h / 2 + (open ? 5 : 0)) + '" text-anchor="middle" style="font:700 15px var(--font-body);fill:' + ink + '">' + esc(R.name) + '</text>' +
      (open ? '' : '<text x="' + (x + w / 2) + '" y="' + (y + h / 2 + 17) + '" text-anchor="middle" style="font:500 10px var(--font-mono);fill:var(--muted)">Nivå ' + (R.lv + 1) + ' · ' + LEVELS[R.lv].xp + ' XP</text>') +
      '</g>';
  });
  return s + '</svg>';
}

export function pv(id: string): string {
  const it = ITEMS[id];
  if (it.k === 'wall') return '<svg class="pv" viewBox="-2 -2 ' + (it.w * 64 + 4) + ' ' + (it.h! + 4) + '" aria-hidden="true">' + it.f() + '</svg>';
  return '<svg class="pv fit" viewBox="-45 -90 90 112" aria-hidden="true"><g>' + furnG(id, 0) + '</g></svg>';
}
export function fitPv(root: ParentNode): void {
  root.querySelectorAll('svg.fit').forEach((v) => {
    try { const b = (v.firstChild as SVGGraphicsElement).getBBox(); if (b.width > 0) v.setAttribute('viewBox', (b.x - 4) + ' ' + (b.y - 4) + ' ' + (b.width + 8) + ' ' + (b.height + 8)); } catch { /* ikke tegnet ennå */ }
  });
}
export function hint(key: string): string {
  const r = S.home[key];
  if (r && roomOf(key) !== rm().room) return '';
  return r ? '' : (isWall(key) ? 'Trykk på et felt på veggen, eller bruk «Sett ut i rommet».' : 'Trykk på en tom rute i gulvet, eller bruk «Sett ut i rommet».');
}

// ---------- visning ----------
export function renderRoom(): void {
  const st = rm();
  if (!roomOpen(st.room)) st.room = 0;
  cleanHome();
  const p = panel(), room = st.room, R = ROOMS()[room], cur = lvl(S.points), L = LEVELS[cur], nx = LEVELS[cur + 1];
  if (S.seenLvl !== cur) { S.seenLvl = cur; save(); hooks.refresh(); }
  if (st.sel && (!ITEMS[baseOf(st.sel)] || !unlocked(st.sel))) st.sel = null;
  if (st.sel && !unique(baseOf(st.sel))) st.sel = keyFor(baseOf(st.sel), room);
  const pct = nx ? Math.max(0, Math.min(100, Math.round((S.points - L.xp) / (nx.xp - L.xp) * 100))) : 100;
  let total = 0, got = 0;
  LEVELS.forEach((lv, i) => { total += lv.t.length; if (i <= cur) got += lv.t.length; });
  const openRooms = ROOMS().filter((_, i) => roomOpen(i)).length, nextRoom = ROOMS().find((_, i) => !roomOpen(i));

  let selHTML: string;
  if (st.sel) {
    const key = st.sel, it = IT(key), r = S.home[key], wall = isWall(key);
    let ctl: string;
    if (r && roomOf(key) !== room) {
      ctl = '<p style="margin:0 0 8px">Står i ' + esc(ROOMS()[roomOf(key)].name) + '.</p><button class="btn primary" id="r-here" type="button">Flytt hit</button><button class="btn" id="r-goto" type="button">Gå til ' + esc(ROOMS()[roomOf(key)].name) + '</button><button class="btn ghost" id="r-take" type="button">Ta ned</button>';
    } else if (!r) ctl = '<button class="btn primary" id="r-place" type="button">Sett ut i ' + esc(R.name.toLowerCase()) + '</button>';
    else if (wall) ctl = '<button class="btn" id="w-a" type="button">Mot hjørnet</button><button class="btn" id="w-b" type="button">Mot kanten</button><button class="btn" id="w-sw" type="button">Bytt vegg</button><button class="btn ghost" id="r-take" type="button">Ta ned</button>';
    else ctl = '<div class="dpad" role="group" aria-label="Flytt på gulvet">' +
      '<button class="mv" type="button" data-dx="-1" data-dy="0" aria-label="Flytt opp til venstre">↖</button><button class="mv" type="button" data-dx="0" data-dy="-1" aria-label="Flytt opp til høyre">↗</button>' +
      '<button class="mv" type="button" data-dx="0" data-dy="1" aria-label="Flytt ned til venstre">↙</button><button class="mv" type="button" data-dx="1" data-dy="0" aria-label="Flytt ned til høyre">↘</button></div>' +
      '<button class="btn" id="r-flip" type="button">Snu</button><button class="btn ghost" id="r-take" type="button">Ta ned</button>';
    selHTML = '<h3>' + esc(it.n) + '</h3><p>' + esc(it.dsc) + '</p><div class="selact">' + ctl + '</div>';
  } else {
    selHTML = '<p>Velg møbler, malerier eller trofeer fra samlingen under. Trykk så på en tom rute i gulvet (eller et felt på veggen) for å sette dem ut. Trykk på noe i rommet for å flytte det, snu det eller ta det ned. Møblene finnes i hvert rom, mens hvert trofé kan stå ett sted i huset.</p>';
  }

  const card = (id: string) => {
    const it = ITEMS[id], open = unlocked(id), key = keyFor(id, room), r = S.home[key], sel = st.sel === key;
    const sub = !open ? 'Nivå ' + esc(LEVELS[it.lv!].n) + ' · ' + LEVELS[it.lv!].xp + ' XP'
      : r ? (roomOf(key) === room ? 'I rommet' : 'I ' + esc(ROOMS()[roomOf(key)].name.toLowerCase())) : (unique(id) ? 'I skapet' : 'Ikke i bruk her');
    return '<button type="button" class="tcard' + (open ? '' : ' locked') + (sel ? ' sel' : '') + '" data-t="' + id + '"' + (open ? ' aria-pressed="' + sel + '"' : ' disabled') + '>' + pv(id) +
      '<span class="tname">' + (open ? esc(it.n) : 'Låst') + '</span><span class="tsub">' + sub + '</span></button>';
  };
  let tray = '';
  T.room.groups.forEach((g) => {
    const ids = Object.keys(ITEMS).filter((id) => ITEMS[id].cat === g[0]);
    tray += '<h3 class="grp">' + g[1] + '</h3><div class="tray">' + ids.map(card).join('') + '</div>';
  });
  tray += '<h3 class="grp">Trofeer fra nivåene</h3>';
  LEVELS.forEach((lv, i) => {
    tray += '<h4 class="grp2">' + (i <= cur ? '' : '🔒 ') + 'Nivå ' + (i + 1) + ' · ' + esc(lv.n) + '</h4><div class="tray">' + lv.t.map(card).join('') + '</div>';
  });

  p.innerHTML = head('rom') +
    '<div class="househead">' +
    '<div class="lvlcard"><div class="lvlrow"><span class="lvlname">' + esc(L.n) + '</span><span class="count">Nivå ' + (cur + 1) + ' av ' + LEVELS.length + starText(stars(S.points)) + ' · ' + S.points + ' XP</span></div>' +
    '<div class="meter" role="progressbar" aria-label="Fremdrift mot neste nivå" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pct + '"><i style="width:' + pct + '%"></i></div>' +
    '<p class="keyhint" style="margin:0">' + (nx ? 'Neste nivå er ' + esc(nx.n) + ' ved ' + nx.xp + ' XP. Du mangler ' + (nx.xp - S.points) + ' XP for å låse opp ' + nx.t.length + ' nye trofeer. ' : 'Du har nådd øverste nivå. Neste stjerne får du om ' + (STAR_XP - (S.points - topXp()) % STAR_XP) + ' XP. ') + 'Trofeer: ' + got + ' av ' + total + ' er låst opp.</p>' +
    '<p class="keyhint" style="margin:0">Rom: ' + openRooms + ' av ' + ROOMS().length + ' er åpne.' + (nextRoom ? ' ' + esc(nextRoom.name) + ' åpner på nivå ' + (nextRoom.lv + 1) + '.' : '') + '</p></div>' +
    '<div class="housewrap">' + houseSVG(room) + '</div></div>' +
    '<h3 class="roomtitle">' + esc(R.name) + '</h3>' +
    '<div class="roomwrap">' + roomSVG(st.sel, room) + '</div>' +
    '<div class="selbar">' + selHTML + '<p class="msg" style="margin:8px 0 0" aria-live="polite">' + esc(st.msg) + '</p></div>' +
    tray +
    '<details style="margin-top:18px"><summary>Slik fungerer XP, nivåer og rom</summary><ul class="earn"><li>XP er alle poengene du noen gang har tjent i øvelsene.</li><li>Å bruke poeng i ' + esc(modeOf('shop').name) + ' senker ikke XP-en din.</li><li>Hvert nivå låser opp nye trofeer. De er ekstra pynt som du kan sette ut i huset, sammen med møblene og kunsten.</li><li>Huset har ' + ROOMS().length + ' rom. Nye rom åpner seg på nivå ' + ROOMS().slice(1).map((r) => r.lv + 1).join(', ') + '.</li><li>Etter øverste nivå får du en stjerne for hver ' + STAR_XP + ' XP, så du kan fortsette å samle.</li></ul></details>';
  fitPv(p);

  const done = (msg?: string, focusSel?: string) => { st.msg = msg || ''; save(); renderRoom(); if (focusSel) { const a = p.querySelector(focusSel) as HTMLElement | null; if (a) a.focus({ preventScroll: true }); } };
  const go = (i: number) => { if (!roomOpen(i) || i === st.room) return; st.room = i; st.msg = ''; st.ava = null; if (st.sel && !unique(baseOf(st.sel))) st.sel = null; renderRoom(); const h = p.querySelector('.hroom[data-room="' + i + '"]') as HTMLElement | null; if (h) h.focus({ preventScroll: true }); };
  p.querySelectorAll('.hroom').forEach((g: HTMLElement) => {
    g.onclick = () => go(+g.dataset.room!);
    g.onkeydown = (e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(+g.dataset.room!); } };
  });

  $('.roomwrap').onclick = (e: Event) => {
    const tg = e.target as HTMLElement, f = tg.closest('.furn') as HTMLElement | null;
    if (f) { st.sel = f.dataset.id!; st.msg = ''; renderRoom(); return; }
    const sl = tg.closest('.wslot') as HTMLElement | null;
    if (sl) {
      if (!st.sel) { st.msg = 'Velg først et maleri eller et veggtrofé fra samlingen.'; renderRoom(); return; }
      if (!isWall(st.sel)) { st.msg = IT(st.sel).n + ' skal stå på gulvet.'; renderRoom(); return; }
      const wl = sl.dataset.wl as 'L' | 'R', s0 = Math.min(+sl.dataset.s!, GRID - IT(st.sel).w);
      if (wfits(st.sel, wl, s0, room)) { S.home[st.sel] = { wl, s: s0, r: room }; done(IT(st.sel).n + ' henger nå på veggen.'); }
      else { st.msg = 'Det er ikke plass der på veggen.'; renderRoom(); }
      return;
    }
    const t = tg.closest('.tile') as HTMLElement | null; if (!t) return;
    const x = +t.dataset.x!, y = +t.dataset.y!, occ = occupantAt(x, y, room);
    if (!st.sel || isWall(st.sel)) {
      if (occ) { st.sel = occ; st.msg = ''; } else st.msg = st.sel ? IT(st.sel).n + ' skal henge på veggen.' : 'Velg først noe fra samlingen.';
      renderRoom(); return;
    }
    const rec = S.home[st.sel], here = rec && roomOf(st.sel) === room, fl = here ? rec.f || 0 : 0, it2 = IT(st.sel), fw = fl ? it2.d! : it2.w, fh = fl ? it2.w : it2.d!;
    const x2 = Math.min(x, GRID - fw), y2 = Math.min(y, GRID - fh);
    if (fits(st.sel, x2, y2, fl, room)) { S.home[st.sel] = { x: x2, y: y2, f: fl, r: room }; done(it2.n + ' står nå i ' + R.name.toLowerCase() + '.'); }
    else if (occ && occ !== st.sel) { st.sel = occ; st.msg = ''; renderRoom(); }
    else { st.msg = 'Det er ikke plass der.'; renderRoom(); }
  };
  p.querySelectorAll('.tcard:not(.locked)').forEach((b: HTMLElement) => {
    b.onclick = () => { st.sel = keyFor(b.dataset.t!, room); st.msg = hint(st.sel); renderRoom(); const a = p.querySelector('.tcard[data-t="' + b.dataset.t + '"]') as HTMLElement | null; if (a) a.focus({ preventScroll: true }); };
  });
  const place = (successFocus: string) => {
    const q = autoPlace(st.sel!, room);
    if (q) { S.home[st.sel!] = q; done(IT(st.sel!).n + ' er satt ut i ' + R.name.toLowerCase() + '.', successFocus); }
    else { st.msg = 'Det er ikke ledig plass i ' + R.name.toLowerCase() + '. Ta ned noe først.'; renderRoom(); }
  };
  const pl = $('#r-place'); if (pl) pl.onclick = () => place('#r-take');
  const rh = $('#r-here'); if (rh) rh.onclick = () => { const old = S.home[st.sel!]; delete S.home[st.sel!]; const q = autoPlace(st.sel!, room); if (q) { S.home[st.sel!] = q; done(IT(st.sel!).n + ' er flyttet til ' + R.name.toLowerCase() + '.', '#r-take'); } else { S.home[st.sel!] = old; st.msg = 'Det er ikke ledig plass i ' + R.name.toLowerCase() + '. Ta ned noe først.'; renderRoom(); } };
  const rg = $('#r-goto'); if (rg) rg.onclick = () => go(roomOf(st.sel!));
  const tk = $('#r-take'); if (tk) tk.onclick = () => { const n = IT(st.sel!).n; delete S.home[st.sel!]; done(n + (unique(baseOf(st.sel!)) ? ' ligger i skapet igjen.' : ' er fjernet fra ' + R.name.toLowerCase() + '.')); };
  const fpb = $('#r-flip');
  if (fpb) fpb.onclick = () => {
    const r = S.home[st.sel!], nf = r.f ? 0 : 1, it3 = IT(st.sel!), fw = nf ? it3.d! : it3.w, fh = nf ? it3.w : it3.d!;
    const x3 = Math.min(r.x!, GRID - fw), y3 = Math.min(r.y!, GRID - fh);
    if (fits(st.sel!, x3, y3, nf, room)) { r.f = nf; r.x = x3; r.y = y3; done('', '#r-flip'); } else { st.msg = 'Det er ikke plass til å snu den her.'; renderRoom(); const a = $('#r-flip'); if (a) a.focus({ preventScroll: true }); }
  };
  const wmove = (id: string, d: number) => {
    const r = S.home[st.sel!], n = r.s! + d;
    if (wfits(st.sel!, r.wl!, n, room)) { r.s = n; done('', id); } else { st.msg = n < 0 || n + IT(st.sel!).w > GRID ? 'Der er enden av veggen.' : 'Det er opptatt der.'; renderRoom(); const a = $(id); if (a) a.focus({ preventScroll: true }); }
  };
  const wa = $('#w-a'); if (wa) wa.onclick = () => wmove('#w-a', -1);
  const wb = $('#w-b'); if (wb) wb.onclick = () => wmove('#w-b', 1);
  const ws = $('#w-sw');
  if (ws) ws.onclick = () => {
    const r = S.home[st.sel!], nw: 'L' | 'R' = r.wl === 'L' ? 'R' : 'L', w = IT(st.sel!).w, cand = [r.s!];
    for (let k = 0; k <= GRID - w; k++) cand.push(k);
    for (const c of cand) if (wfits(st.sel!, nw, c, room)) { r.wl = nw; r.s = c; done('', '#w-sw'); return; }
    st.msg = 'Det er ikke plass på den andre veggen.'; renderRoom(); const a = $('#w-sw'); if (a) a.focus({ preventScroll: true });
  };
  p.querySelectorAll('.mv[data-dx]').forEach((b: HTMLElement) => {
    b.onclick = () => {
      const dx = +b.dataset.dx!, dy = +b.dataset.dy!, r = S.home[st.sel!], it4 = IT(st.sel!), fw = r.f ? it4.d! : it4.w, fh = r.f ? it4.w : it4.d!, nx2 = r.x! + dx, ny2 = r.y! + dy;
      if (nx2 < 0 || ny2 < 0 || nx2 + fw > GRID || ny2 + fh > GRID) st.msg = 'Der er veggen.';
      else if (!fits(st.sel!, nx2, ny2, r.f || 0, room)) st.msg = 'Det er opptatt der.';
      else { r.x = nx2; r.y = ny2; st.msg = ''; save(); }
      renderRoom();
      const again = p.querySelector('.mv[data-dx="' + dx + '"][data-dy="' + dy + '"]') as HTMLElement | null; if (again) again.focus({ preventScroll: true });
    };
  });
}
