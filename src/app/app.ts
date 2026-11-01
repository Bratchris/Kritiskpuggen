// Skallet rundt øvingsappen: en kompakt topp (poeng, nivå, profil, innstillinger), hovedmenyen,
// undermeny for spill, butikk og profil, og nivå-dialogen.
import { applyBackground } from '../avatar/backgrounds';
import { showEggFound, companionSVG } from '../pets/screen';
import { $, esc, toast } from '../lib/dom';
import type { Store } from '../lib/store';
import type { Theme } from '../themes/types';
import { S, T, MODES, LEVELS, ITEMS, streakNow, dayXp, setTheme, loadProgress, lvl, level, modeOf, hooks, save, stars, starText, topXp, mark, flushActivity } from './core';
import { PreviewStore } from '../lib/store';
import { renderKort } from './modes/kort';
import { renderQuiz } from './modes/quiz';
import { renderTf } from './modes/tf';
import { renderPar } from './modes/par';
import { renderMemo } from './modes/memo';
import { renderOrd } from './modes/ord';
import { renderSort } from './modes/sort';
import { renderHull } from './modes/hull';
import { renderFeil } from './modes/feil';
import { renderThink } from './modes/tenk';
import { renderShop } from './shop';
import { renderRoom, rm, hint, pv, fitPv, roomsAt } from './room/room';
import { renderTop, loadBoard } from './modes/top';
import { renderAvatar } from '../avatar/screen';
import { renderHome, setHomeName, heroStats, games } from './home';
import { renderSettings, setSettingsActions } from './settings';
import { icon } from './icons';
import { type Events, activeSeasons, seasonById } from '../seasons/catalog';
import { petName } from '../pets/catalog';
import { floatXP, confetti, celebrate, showCombo, countTo } from './juice';
import { getPrefs } from '../lib/prefs';
import { checkProgress, checkPets } from '../achievements/engine';
import { avatarSVG } from '../avatar/render';
import { cleanAvatar, defaultAvatar } from '../avatar/catalog';

const RENDER: Record<string, () => void> = {
  hjem: renderHome, innst: renderSettings,
  kort: renderKort, quiz: renderQuiz, tf: renderTf, par: renderPar, memo: renderMemo, ord: renderOrd, sort: renderSort,
  hull: renderHull, feil: renderFeil, tenk: renderThink, shop: renderShop, rom: renderRoom, top: renderTop, avatar: renderAvatar,
};

export interface MountOptions {
  who: string;
  preview?: boolean;
  onSwitchTheme?: () => void;
  onLogout?: () => void;
  onExit?: () => void;
  onReset?: () => void;
  /** Av når læreren har slått av topplisten for klassen. */
  leaderboard?: boolean;
  /** Sesonghendelsene læreren har satt for klassen (classes.events). */
  events?: Events;
}

/** Bygger øvingsappen i root for et tema. Fremgangen hentes fra store. */
export async function mountApp(root: HTMLElement, theme: Theme, store: Store, opts: MountOptions): Promise<void> {
  document.documentElement.dataset.tema = theme.id;
  setTheme(theme, store, { leaderboard: opts.leaderboard });
  S.events = (opts.events && typeof opts.events === 'object' ? opts.events : {}) as Events;
  S.seasons = activeSeasons(S.events);
  if (store instanceof PreviewStore) store.seasons = S.seasons;
  seasonDecor();
  root.innerHTML = '<div class="wrap"><p class="loading">Henter fremgangen din …</p></div>';
  let progress;
  try { progress = await store.load(theme.id); } catch (e) {
    root.innerHTML = '<div class="wrap"><div class="panel"><h2>Fikk ikke hentet fremgangen</h2><p>' + esc((e as Error).message || 'Ukjent feil') + '</p><button class="btn primary" id="retry" type="button">Prøv igjen</button></div></div>';
    $('#retry').onclick = () => mountApp(root, theme, store, opts);
    return;
  }
  loadProgress(progress);
  try {
    const av = await store.loadAvatar();
    S.owned = new Set(av.owned); S.avaReady = av.ready;
    S.avatar = av.cfg ? cleanAvatar(av.cfg, S.owned) : defaultAvatar();
  } catch { S.avaReady = false; S.avatar = defaultAvatar(); }
  applyBackground(S.avatar.bg);
  try {
    const pd = await store.loadPets();
    S.pets = pd.pets; S.petsReady = pd.ready; S.xpOther = Math.max(0, pd.total - S.points);
  } catch { S.pets = []; S.petsReady = false; S.xpOther = 0; }
  try { const ad = await store.loadAchievements(); S.ach = new Set(ad.ids); S.achReady = ad.ready; } catch { S.ach = new Set(); S.achReady = false; }
  if (!S.home) S.home = {};

  setHomeName(opts.who);
  root.innerHTML =
    '<div class="wrap">' +
    '<header class="apphead"><div class="hbar">' +
      '<button class="brandbtn" type="button" id="h-home" aria-label="Til startsiden"><span class="eyebrow">' + esc(theme.eyebrow) + '</span><span class="apptitle">' + esc(theme.title) + '</span></button>' +
      '<div class="hright">' +
        '<button class="hchip streak" type="button" id="h-streak"></button>' +
        '<button class="hchip" type="button" id="h-pts"></button>' +
        '<button class="hchip lvl" type="button" id="h-lvl"></button>' +
        '<button class="avabtn" id="ava-btn" type="button"></button>' +
        '<button class="hicon" type="button" id="h-set" aria-label="Innstillinger" title="Innstillinger">' + icon('innst') + '</button>' +
      '</div></div>' +
      (opts.preview ? '<div class="previewnote previewbar"><span>Forhåndsvisning for læreren. Alt lagres bare i denne nettleseren.</span>' + (opts.onExit ? '<button class="lnk" id="ex-prev" type="button">Tilbake til lærerrommet</button>' : '') + '</div>' : '') +
    '</header>' +
    '<nav class="mainnav" id="nav" aria-label="Hovedmeny"></nav>' +
    '<div class="subnav" id="subnav" hidden></div>' +
    '<main class="panel" id="panel"></main>' +
    '</div>' +
    '<div id="lvlup" class="lvlup" hidden role="dialog" aria-modal="true" aria-labelledby="lvl-t"></div>';

  const leave = (f: () => void) => async () => { await Promise.all([store.flush(), flushActivity()]); f(); };
  setSettingsActions({
    who: opts.who,
    switchTheme: opts.onSwitchTheme ? leave(opts.onSwitchTheme) : undefined,
    logout: opts.onLogout ? leave(opts.onLogout) : undefined,
    exitPreview: opts.onExit,
    // «Lås opp alt» finnes bare i lærerens forhåndsvisning, aldri for elever.
    unlockAll: opts.preview && store instanceof PreviewStore ? async () => {
      S.points = await store.setPoints(theme.id, topXp());
      S.seenLvl = lvl(S.points) - 1; save(); renderHeader(); renderNav();
    } : undefined,
    unlocked: () => S.points >= topXp(),
    reset: opts.onReset,
  });
  if (opts.onExit) $('#ex-prev').onclick = opts.onExit;

  $('#nav').addEventListener('click', (e: Event) => {
    const b = (e.target as HTMLElement).closest('button[data-nav]') as HTMLElement | null; if (!b) return;
    go(b.dataset.nav!);
  });
  $('#subnav').addEventListener('click', (e: Event) => {
    const t = e.target as HTMLElement;
    const sb = t.closest('button[data-sub]') as HTMLElement | null;
    if (sb) { const [m, tab] = sb.dataset.sub!.split(':'); hooks.open(m, tab); return; }
    const tp = t.closest('button[data-t]') as HTMLElement | null;
    if (tp) { S.topic = tp.dataset.t!; S.cur.kort = null; S.cur.quiz = null; S.cur.tf = null; S.cur.hull = null; S.cur.feil = null; render(); return; }
    if (t.closest('#go-home')) go('hjem');
  });
  $('#h-home').onclick = () => go('hjem');
  $('#h-pts').onclick = () => go('butikk');
  $('#h-streak').onclick = () => go('hjem');
  $('#h-lvl').onclick = () => hooks.open('rom');
  $('#h-set').onclick = () => { if (S.mode === 'innst') go('hjem'); else hooks.open('innst'); };
  $('#ava-btn').onclick = () => hooks.open('avatar', (S.cur.ava && S.cur.ava.part) || 'kropp');

  hooks.refresh = () => { renderHeader(); renderNav(); };
  hooks.onEgg = (p) => { showEggFound(p); checkPets(); if (S.mode === 'hjem') renderHome(); };
  hooks.open = (mode, tab) => {
    if (mode === 'butikk') { go('butikk'); return; }
    if (games().some((m) => m.id === mode)) S.last = mode;
    S.mode = mode;
    if (mode === 'avatar') {
      const a = S.cur.ava || (S.cur.ava = { tab: 'kropp', part: 'kropp', arm: null, msg: '', busy: false, open: null });
      a.tab = tab || a.tab || 'kropp'; a.msg = ''; a.open = null; a.arm = null;
      if (PARTS.includes(a.tab)) a.part = a.tab;
    }
    if (group() === 'butikk') navSub.butikk = mode === 'shop' ? 'shop' : 'avatar:' + S.cur.ava.tab;
    render(); window.scrollTo(0, 0);
  };
  let starsBefore = stars(S.points);
  hooks.onGoal = () => { const n = streakNow(); celebrate('Dagens mål er nådd!', n > 1 ? n + ' dager på rad. Kom tilbake i morgen for å holde rekka.' : 'Rekka di har startet. Kom tilbake i morgen for å holde den.'); renderHeader(); if (S.mode === 'hjem') renderHome(); };
  hooks.onCombo = (n) => showCombo(n);
  hooks.onPetLevel = (p, l) => {
    const name = petName(p.species, p.variant);
    if (l === 5 || l === 10) celebrate(name + ' har vokst!', 'Nivå ' + l + ': ' + (l === 10 ? 'Nå er den en mester, med krone og gyllen glans.' : 'Nå er den ung og har fått skjerf.'));
    else toast(name + ' nådde nivå ' + l);
    hooks.refresh();
  };
  hooks.onPoints = (before, after, n) => {
    renderHeader(); renderNav(); checkProgress();
    const st = stars(S.points);
    if (after > before) { toast('Nytt nivå: ' + LEVELS[after].n); showLevelUp(after); }
    else if (st > starsBefore) toast('Ny stjerne! Du har nå ★' + st);
    else floatXP(n);
    starsBefore = st;
  };
  render();
  setTimeout(checkProgress, 900);
  if (MODES.some((m) => m.id === 'top')) void loadBoard().then(() => { if (S.mode === 'hjem') renderHome(); });
}

// ---------- meny ----------
const PARTS = ['kropp', 'har', 'ansikt', 'sminke', 'klaer'];
const SHOP_TABS = ['kostymer', 'merch', 'bakgrunn', 'sesong'];
const navSub: Record<string, string> = { butikk: 'shop' };

/** Hvilken knapp i hovedmenyen som hører til skjermen eleven er på. */
function group(): string {
  if (S.mode === 'shop') return 'butikk';
  if (S.mode === 'avatar') return SHOP_TABS.includes(S.cur.ava?.tab) ? 'butikk' : 'profil';
  if (['kort', 'rom', 'top', 'innst'].includes(S.mode)) return S.mode;
  return 'hjem';
}
function go(id: string): void {
  if (id === 'butikk') { const [m, t] = navSub.butikk.split(':'); hooks.open(m, t); return; }
  hooks.open(id);
}

function renderNav(): void {
  const g = group(), hasTop = MODES.some((m) => m.id === 'top');
  const items: [string, string, string, string][] = [
    ['hjem', 'Øv', 'hjem', ''],
    ['kort', 'Kort', 'kort', ''],
    ['rom', 'Huset', 'rom', S.mode !== 'rom' && lvl(S.points) > S.seenLvl ? '<span class="newdot">Ny</span>' : ''],
    ['butikk', 'Butikk', 'butikk', ''],
  ];
  if (hasTop) items.push(['top', 'Topp', 'top', '']);
  $('#nav').innerHTML = items.map(([id, name, ic, extra]) =>
    '<button class="navbtn" type="button" data-nav="' + id + '"' + (g === id ? ' aria-current="page"' : '') + '>' + icon(ic) + '<span>' + name + '</span>' + extra + '</button>').join('');
}

function renderSub(): void {
  const el = $('#subnav'), g = group();
  let h = '';
  const tab = (sub: string, name: string, on: boolean, cls = '') => '<button class="subtab' + cls + '" type="button" data-sub="' + sub + '" aria-current="' + on + '">' + name + '</button>';
  if (g === 'butikk') {
    const shopName = modeOf('shop').name.replace(/butikken$/i, '');
    const t = S.mode === 'avatar' ? S.cur.ava.tab : '';
    h = '<div class="subtabs" role="tablist" aria-label="Butikken">' + tab('shop', esc(shopName || 'Gaver'), S.mode === 'shop') + tab('avatar:kostymer', 'Kostymer', t === 'kostymer') + tab('avatar:merch', 'CRISPY-G', t === 'merch', ' cgtab') + tab('avatar:bakgrunn', 'Bakgrunner', t === 'bakgrunn') + (S.seasons.length ? tab('avatar:sesong', esc(S.seasons.map((id) => seasonById(id)!.short).join(' og ')), t === 'sesong', ' seasontab') : '') + '</div>';
  } else if (g === 'profil') {
    const t = S.cur.ava.tab, part = S.cur.ava.part || 'kropp';
    h = '<div class="subtabs" role="tablist" aria-label="Profilen din">' + tab('avatar:' + part, 'Avatar', PARTS.includes(t)) + tab('avatar:garderobe', 'Garderobe', t === 'garderobe') + tab('avatar:dyr', 'Dyr og egg', t === 'dyr') + tab('avatar:ach', 'Achievements', t === 'ach') + '</div>';
  } else if (g === 'hjem' && S.mode !== 'hjem') {
    h = '<div class="gamebar"><button class="lnk back" type="button" id="go-home">' + icon('pil') + 'Alle spill</button></div>';
  }
  if ((g === 'hjem' && S.mode !== 'hjem') || g === 'kort') {
    const m = modeOf(S.mode);
    if (m.f) {
      const opts: [string, string][] = [['alle', 'Alle emner'] as [string, string]].concat(T.topics.map((t) => [t.k, t.name] as [string, string]));
      h += '<div class="filters" role="group" aria-label="Velg emne">' + opts.map((o) => '<button class="chip" type="button" data-t="' + o[0] + '" aria-pressed="' + (S.topic === o[0]) + '">' + esc(o[1]) + '</button>').join('') + '</div>';
    }
  }
  el.hidden = !h; el.innerHTML = h;
}

/** Snø over hele appen i juleuka. Slås av med rolige animasjoner. */
function seasonDecor(): void {
  document.getElementById('snow')?.remove();
  document.documentElement.dataset.season = S.seasons[0] || '';
  if (!S.seasons.includes('jul')) return;
  const el = document.createElement('div'); el.id = 'snow'; el.setAttribute('aria-hidden', 'true');
  document.body.appendChild(el);
}

let lastRendered = '';
function render(): void {
  // Avataren får en ny tilfeldig plass hver gang eleven går inn i troférommet.
  if (S.mode === 'rom' && lastRendered !== 'rom') rm().ava = null;
  lastRendered = S.mode;
  renderHeader(); renderNav(); renderSub();
  const w = document.querySelector('.wrap'); if (w) w.classList.toggle('wide', S.mode === 'rom');
  mark();
  RENDER[S.mode]();
}

function renderAvaBtn(): void {
  const b = $('#ava-btn'); if (!b) return;
  b.setAttribute('aria-current', String(group() === 'profil'));
  b.setAttribute('aria-label', S.avatar.made ? 'Profilen din: avatar, garderobe og dyr' : 'Lag avataren din');
  b.title = 'Profil';
  const pet = companionSVG('mini');
  b.classList.toggle('withpet', !!pet);
  b.innerHTML = '<span class="avahead">' + avatarSVG(S.avatar, { crop: 'head' }) + pet + '</span>';
}

function renderHeader(): void {
  renderAvaBtn();
  const bal = S.points - S.spent, h = heroStats();
  const sn = streakNow(), done = dayXp() >= getPrefs().goal, sk = $('#h-streak');
  sk.innerHTML = '<span class="flame' + (done ? '' : ' cold') + '" aria-hidden="true"></span><b>' + sn + '</b>';
  sk.setAttribute('aria-label', sn + ' dager på rad. ' + (done ? 'Dagens mål er nådd.' : 'Dagens mål er ikke nådd ennå.')); sk.title = 'Dager på rad';
  const pts = $('#h-pts');
  if (!pts.querySelector('b')) pts.innerHTML = icon('mynt') + '<b></b>';
  countTo(pts.querySelector('b')!, bal); pts.setAttribute('aria-label', bal + ' poeng å bruke. Åpne butikken'); pts.title = 'Poeng å bruke';
  const lv = $('#h-lvl');
  lv.innerHTML = '<span class="ring" style="--p:' + Math.round(h.pct * 100) + '"><b>' + (h.cur + 1) + '</b></span><span class="lvname">' + esc(level(S.points)) + starText(stars(S.points)) + '</span>';
  lv.setAttribute('aria-label', 'Nivå ' + (h.cur + 1) + ', ' + level(S.points) + ', ' + S.points + ' XP. Åpne troférommet'); lv.title = S.points + ' XP';
  $('#h-set').setAttribute('aria-current', String(S.mode === 'innst'));
}

function showLevelUp(i: number): void {
  const L = LEVELS[i], m = $('#lvlup');
  m.innerHTML = '<div class="lvlbox"><p class="eyebrow">Nytt nivå</p><h2 id="lvl-t">' + esc(L.n) + '</h2><p><b>Du låste opp ' + L.t.length + ' nye trofeer.</b> Velg hvilke du vil sette ut i huset.</p>' + roomsAt(i).map((r) => '<p class="fb ok"><strong>Nytt rom: ' + esc(r.name) + '</strong>Du har fått et nytt rom i huset, med møbler du kan flytte rundt på.</p>').join('') + '' +
    '<div class="lvlpv">' + L.t.map((id) => '<div class="lp pop">' + pv(id) + '<b>' + esc(ITEMS[id].n) + '</b></div>').join('') + '</div>' +
    '<div class="row"><button class="btn primary" id="lu-go" type="button">Gå til troférommet</button><button class="btn ghost" id="lu-x" type="button">Fortsett å øve</button></div></div>';
  m.hidden = false;
  confetti(3);
  fitPv(m);
  $('#lu-x').onclick = () => { m.hidden = true; };
  $('#lu-go').onclick = () => { m.hidden = true; S.mode = 'rom'; const nr = roomsAt(i)[0]; if (nr) rm().room = T.room.rooms.indexOf(nr); rm().sel = L.t[0]; rm().msg = hint(L.t[0]); render(); window.scrollTo(0, 0); };
  m.onclick = (e: Event) => { if (e.target === m) m.hidden = true; };
  setTimeout(() => { const b = $('#lu-go'); if (b && !m.hidden) b.focus(); }, 60);
}

document.addEventListener('keydown', (e) => { const m = $('#lvlup'); if (e.key === 'Escape' && m && !m.hidden) m.hidden = true; });

export { save };
