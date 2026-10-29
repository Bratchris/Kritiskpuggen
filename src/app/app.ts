// Skallet rundt øvingsappen: topp, fast linje (kortstokk, butikk, rom), faner, filter og nivå-dialog.
import { applyBackground } from '../avatar/backgrounds';
import { $, esc, toast } from '../lib/dom';
import type { Store } from '../lib/store';
import type { Theme } from '../themes/types';
import { gradient } from './room/iso';
import { S, T, MODES, LEVELS, ITEMS, CARDS_KNOWN, setTheme, loadProgress, lvl, level, modeOf, isGlobal, hooks, save, stars, starText, topXp, mark, flushActivity } from './core';
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
import { renderTop, loadBoard, myRankText } from './modes/top';
import { renderAvatar } from '../avatar/screen';
import { avatarSVG } from '../avatar/render';
import { cleanAvatar, defaultAvatar } from '../avatar/catalog';

const RENDER: Record<string, () => void> = {
  kort: renderKort, quiz: renderQuiz, tf: renderTf, par: renderPar, memo: renderMemo, ord: renderOrd, sort: renderSort,
  hull: renderHull, feil: renderFeil, tenk: renderThink, shop: renderShop, rom: renderRoom, top: renderTop, avatar: renderAvatar,
};
const SHORT: Record<string, string> = { kort: 'Kort­stokken', shop: '', rom: 'Trofé­rommet', top: 'Topp­listen' };

export interface MountOptions {
  who: string;
  preview?: boolean;
  onSwitchTheme?: () => void;
  onLogout?: () => void;
  onExit?: () => void;
  onReset?: () => void;
  /** Av når læreren har slått av topplisten for klassen. */
  leaderboard?: boolean;
}

/** Bygger øvingsappen i root for et tema. Fremgangen hentes fra store. */
export async function mountApp(root: HTMLElement, theme: Theme, store: Store, opts: MountOptions): Promise<void> {
  document.documentElement.dataset.tema = theme.id;
  setTheme(theme, store, { leaderboard: opts.leaderboard });
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
  if (!S.home) S.home = {};

  root.innerHTML =
    '<div class="wrap">' +
    '<header class="apphead">' +
    '<div class="topbar"><p class="eyebrow">' + esc(theme.eyebrow) + '</p><div class="who"><span>' + esc(opts.who) + '</span>' +
    (opts.onSwitchTheme ? '<button class="lnk" id="sw-theme" type="button">Bytt tema</button>' : '') +
    (opts.onExit ? '<button class="lnk" id="ex-prev" type="button">Tilbake til lærerrommet</button>' : '') +
    (opts.onLogout ? '<button class="lnk" id="logout" type="button">Logg ut</button>' : '') + '</div></div>' +
    '<div class="titlerow"><h1 class="apptitle">' + esc(theme.title) + '</h1><button class="avabtn" id="ava-btn" type="button"></button></div>' +
    (opts.preview ? '<div class="previewnote previewbar"><span>Forhåndsvisning for læreren. Poeng og gaver lagres bare i denne nettleseren.</span><span id="unlock-slot"></span></div>' : '') +
    '<div id="stripes" class="stripes" role="img" aria-label="Fremdrift"></div><p class="stat" id="stat"></p></header>' +
    '<nav class="dock" id="dock" aria-label="Alltid tilgjengelig"></nav>' +
    '<nav class="tabs" id="tabs" aria-label="Øvingsformer"></nav>' +
    '<div class="backrow" id="backrow" hidden></div>' +
    '<div class="filters" id="filters" role="group" aria-label="Velg emne"></div>' +
    '<main class="panel" id="panel"></main>' +
    '<footer class="appfoot"><p>' + esc(theme.sources) + '</p>' +
    (opts.onReset ? '<div class="resetrow"><button class="btn ghost" id="r-ask" type="button">Nullstill forhåndsvisningen</button></div>' : '') +
    '</footer></div>' +
    '<div id="lvlup" class="lvlup" hidden role="dialog" aria-modal="true" aria-labelledby="lvl-t"></div>';

  if (opts.onSwitchTheme) $('#sw-theme').onclick = async () => { await Promise.all([store.flush(), flushActivity()]); opts.onSwitchTheme!(); };
  if (opts.onExit) $('#ex-prev').onclick = opts.onExit;
  // «Lås opp alt» finnes bare i lærerens forhåndsvisning, aldri for elever.
  const drawUnlock = () => {
    const slot = $('#unlock-slot'); if (!slot) return;
    if (S.points >= topXp()) { slot.innerHTML = '<span class="unlocked">Alt er låst opp</span>'; return; }
    slot.innerHTML = '<button class="btn" id="unlock-all" type="button">Lås opp alt</button>';
    $('#unlock-all').onclick = async () => {
      if (!(store instanceof PreviewStore)) return;
      S.points = await store.setPoints(theme.id, topXp());
      S.seenLvl = lvl(S.points) - 1; save();
      drawUnlock(); render();
      toast('Alle nivåer, trofeer og rom er låst opp i forhåndsvisningen.');
    };
  };
  if (opts.preview && store instanceof PreviewStore) drawUnlock();
  if (opts.onLogout) $('#logout').onclick = async () => { await Promise.all([store.flush(), flushActivity()]); opts.onLogout!(); };
  if (opts.onReset) $('#r-ask').onclick = () => {
    const el = $('#r-ask').parentElement;
    el.innerHTML = '<span>Slette poeng, gaver og rom i forhåndsvisningen?</span><button class="btn" id="r-yes" type="button">Ja, nullstill</button><button class="btn ghost" id="r-no" type="button">Avbryt</button>';
    $('#r-yes').onclick = opts.onReset; $('#r-no').onclick = () => mountApp(root, theme, store, opts);
  };

  $('#tabs').addEventListener('click', (e: Event) => {
    const b = (e.target as HTMLElement).closest('button[data-m]') as HTMLElement | null; if (!b) return;
    S.mode = S.last = b.dataset.m!; render();
  });
  $('#dock').addEventListener('click', (e: Event) => {
    const b = (e.target as HTMLElement).closest('button[data-g]') as HTMLElement | null; if (!b) return;
    if (S.mode === b.dataset.g) { S.mode = S.last; render(); return; }
    if (!isGlobal(S.mode)) S.last = S.mode;
    S.mode = b.dataset.g!; render();
    const d = $('#dock'); if (d.getBoundingClientRect().top <= 1) window.scrollTo(0, $('#backrow').offsetTop - d.offsetHeight - 8);
  });
  $('#filters').addEventListener('click', (e: Event) => {
    const b = (e.target as HTMLElement).closest('button[data-t]') as HTMLElement | null; if (!b) return;
    S.topic = b.dataset.t!; S.cur.kort = null; S.cur.quiz = null; S.cur.tf = null; S.cur.hull = null; S.cur.feil = null; render();
  });

  $('#ava-btn').onclick = () => {
    if (S.mode === 'avatar') { S.mode = S.last; render(); return; }
    if (!isGlobal(S.mode)) S.last = S.mode;
    S.mode = 'avatar'; render();
  };
  hooks.refresh = () => { renderHeader(); renderTabs(); };
  let starsBefore = stars(S.points);
  hooks.onPoints = (before, after, n) => {
    renderHeader(); renderTabs();
    const st = stars(S.points);
    if (after > before) { toast('Nytt nivå: ' + LEVELS[after].n); showLevelUp(after); }
    else if (st > starsBefore) toast('Ny stjerne! Du har nå ★' + st);
    else toast('+' + n + ' poeng');
    starsBefore = st;
  };
  render();
  if (MODES.some((m) => m.id === 'top')) void loadBoard();
}

let lastRendered = '';
function render(): void {
  // Avataren får en ny tilfeldig plass hver gang eleven går inn i troférommet.
  if (S.mode === 'rom' && lastRendered !== 'rom') rm().ava = null;
  lastRendered = S.mode;
  renderTabs(); renderFilters(); renderHeader();
  const w = document.querySelector('.wrap'); if (w) w.classList.toggle('wide', S.mode === 'rom');
  mark();
  RENDER[S.mode]();
}

function renderAvaBtn(): void {
  const b = $('#ava-btn'); if (!b) return;
  b.setAttribute('aria-pressed', String(S.mode === 'avatar'));
  b.setAttribute('aria-label', S.avatar.made ? 'Endre avataren din' : 'Lag avataren din');
  b.innerHTML = avatarSVG(S.avatar, { crop: 'head' }) + '<span>' + (S.avatar.made ? 'Avatar' : 'Lag avatar') + '</span>';
}

function renderHeader(): void {
  renderAvaBtn();
  const cards = T.content.cards, n = cards.length, known = CARDS_KNOWN();
  $('#stripes').innerHTML = cards.map((c, i) => '<i class="' + (S.known[c.id] === 1 ? 'on' : '') + '" style="background:' + gradient(T.stripes, i / Math.max(1, n - 1)) + '"></i>').join('');
  $('#stripes').setAttribute('aria-label', known + ' av ' + n + ' kort mestret');
  $('#stat').innerHTML = '<span><b>' + known + '</b> av ' + n + ' kort mestret</span><span>Poeng <b>' + (S.points - S.spent) + '</b></span><span>Nivå <b>' + esc(level(S.points)) + '</b>' + starText(stars(S.points)) + ' · ' + S.points + ' XP</span>';
  renderDock();
}

function renderDock(): void {
  const sub: Record<string, string> = { kort: CARDS_KNOWN() + ' av ' + T.content.cards.length + ' kan', shop: (S.points - S.spent) + ' poeng', rom: 'Nivå ' + (lvl(S.points) + 1) + starText(stars(S.points)), top: myRankText() };
  const g = MODES.filter((m) => m.g === 1).length;
  $('#dock').style.gridTemplateColumns = 'repeat(' + g + ', minmax(0, 1fr))';
  $('#dock').innerHTML = MODES.filter((m) => m.g === 1).map((m) =>
    '<button class="dk" type="button" data-g="' + m.id + '" aria-current="' + (S.mode === m.id) + '"><b>' + (SHORT[m.id] || m.name.replace(/butikken$/, '­butikken')) +
    (m.id === 'rom' && S.mode !== 'rom' && lvl(S.points) > S.seenLvl ? '<span class="newdot">Ny</span>' : '') + '</b><span>' + esc(sub[m.id] || '') + '</span></button>').join('');
}

function renderTabs(): void {
  $('#tabs').innerHTML = MODES.filter((m) => !m.g).map((m) => '<button class="tab" type="button" data-m="' + m.id + '" aria-current="' + (S.mode === m.id) + '">' + esc(m.name) + '</button>').join('');
  renderDock();
  const br = $('#backrow'), g = isGlobal(S.mode);
  br.hidden = !g;
  br.innerHTML = g ? '<button class="lnk back" type="button" id="go-back">← Tilbake til ' + esc(modeOf(S.last).name) + '</button>' : '';
  if (g) $('#go-back').onclick = () => { S.mode = S.last; render(); };
}

function renderFilters(): void {
  const el = $('#filters'), m = modeOf(S.mode);
  el.hidden = !m.f;
  if (!m.f) return;
  const opts: [string, string][] = [['alle', 'Alle emner']].concat(T.topics.map((t) => [t.k, t.name])) as [string, string][];
  el.innerHTML = '<span class="flabel">Emne</span>' + opts.map((o) => '<button class="chip" type="button" data-t="' + o[0] + '" aria-pressed="' + (S.topic === o[0]) + '">' + esc(o[1]) + '</button>').join('');
}

function showLevelUp(i: number): void {
  const L = LEVELS[i], m = $('#lvlup');
  m.innerHTML = '<div class="lvlbox"><p class="eyebrow">Nytt nivå</p><h2 id="lvl-t">' + esc(L.n) + '</h2><p><b>Du låste opp ' + L.t.length + ' nye trofeer.</b> Velg hvilke du vil sette ut i huset.</p>' + roomsAt(i).map((r) => '<p class="fb ok"><strong>Nytt rom: ' + esc(r.name) + '</strong>Du har fått et nytt rom i huset, med møbler du kan flytte rundt på.</p>').join('') + '' +
    '<div class="lvlpv">' + L.t.map((id) => '<div class="lp pop">' + pv(id) + '<b>' + esc(ITEMS[id].n) + '</b></div>').join('') + '</div>' +
    '<div class="row"><button class="btn primary" id="lu-go" type="button">Gå til troférommet</button><button class="btn ghost" id="lu-x" type="button">Fortsett å øve</button></div></div>';
  m.hidden = false;
  fitPv(m);
  $('#lu-x').onclick = () => { m.hidden = true; };
  $('#lu-go').onclick = () => { m.hidden = true; if (!isGlobal(S.mode)) S.last = S.mode; S.mode = 'rom'; const nr = roomsAt(i)[0]; if (nr) rm().room = T.room.rooms.indexOf(nr); rm().sel = L.t[0]; rm().msg = hint(L.t[0]); render(); window.scrollTo(0, 0); };
  m.onclick = (e: Event) => { if (e.target === m) m.hidden = true; };
  setTimeout(() => { const b = $('#lu-go'); if (b && !m.hidden) b.focus(); }, 60);
}

document.addEventListener('keydown', (e) => { const m = $('#lvlup'); if (e.key === 'Escape' && m && !m.hidden) m.hidden = true; });

export { save };
