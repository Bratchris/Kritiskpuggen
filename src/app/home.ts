// Startsiden «Øv»: nivå og fremgang øverst, egg som er på vei, og alle spillene som store fliser.
import { esc } from '../lib/dom';
import { S, T, MODES, LEVELS, CARDS_KNOWN, streakNow, dayXp, today, lvl, level, stars, starText, topXp, STAR_XP, panel, hooks, xpTotal } from './core';
import { gradient } from './room/iso';
import { icon } from './icons';
import { myRankText } from './modes/top';
import { eggSVG } from '../pets/render';
import { eggProgress } from '../pets/catalog';
import { ACHS } from '../achievements/catalog';
import { getPrefs } from '../lib/prefs';
import { seasonById, untilText } from '../seasons/catalog';
import { myHomework, hwProgress, dueText } from './modes/lekser';
import { bankKeys } from './modes/feilbank';

/** Kort undertittel på flisene. Spill som mangler her, får første setning av beskrivelsen. */
const TAG: Record<string, string> = {
  quiz: 'Flervalg med forklaring', tf: 'Sant eller løgn?', par: 'Koble begrep og forklaring', memo: 'Snu kort og finn parene',
  ord: 'Sett i riktig rekkefølge', sort: 'Sorter i riktig kurv', hull: 'Skriv ordet som mangler', feil: 'Finn feilen i teksten', tenk: 'Argumenter og se sammenhenger',
  live: 'Quiz på tavla med hele klassen', lekser: 'Emner læreren har gitt deg', feilbank: 'Øv på det du bommet på',
};
let firstName = '';
const DAYS = ['M', 'T', 'O', 'T', 'F', 'L', 'S'];

/** Banner for sesonghendelsene som pågår. */
function seasonBanner(): string {
  return S.seasons.map((id) => {
    const se = seasonById(id)!, ev = S.events[id]!, x = Math.round(Number(ev.xp) || 1);
    return '<button type="button" class="seasonbanner season-' + id + '" data-go="avatar:sesong"><span class="sbtxt"><span class="eyebrow">Pågår nå</span><b>' + esc(se.name) + '</b><span>Varer til ' + esc(untilText(ev.until)) + '</span></span>' +
      '<span class="sbtags">' + (x > 1 ? '<i>' + x + '× XP</i>' : '') + '<i>' + esc(se.egg.name) + '</i><i>Sesongvarer</i></span></button>';
  }).join('');
}

/** Live-quiz som pågår, og lekser som ikke er fullført. */
function liveAndHomework(): string {
  let h = '';
  if (S.cur.liveOn) h += '<button type="button" class="livebanner" data-go="live"><span class="livepulse" aria-hidden="true"></span><span><span class="eyebrow">Live nå</span><b>Læreren har startet en live-quiz</b><span>Trykk for å bli med</span></span>' + icon('pil', 'flip') + '</button>';
  const open = myHomework().filter((x) => !hwProgress(x).done);
  if (open.length) {
    const n = open[0], late = n.due < today(), pc = Math.round(hwProgress(n).pct * 100);
    h += '<button type="button" class="hwbanner' + (late ? ' late' : '') + '" data-go="lekser">' + icon('lekser') + '<span><span class="eyebrow">' + (open.length > 1 ? open.length + ' lekser' : 'Lekse') + '</span><b>' + esc(topicName(n.topic)) + ' · ' + pc + ' %</b><span>' + (late ? 'Fristen gikk ut ' : 'Frist ') + esc(dueText(n.due)) + '</span></span>' + icon('pil', 'flip') + '</button>';
  }
  return h;
}
const topicName = (k: string) => T.topics.find((t) => t.k === k)?.name || k;

/** Dagens mål som en ring, rekka med flamme, og denne uka. */
function goalHTML(): string {
  const goal = getPrefs().goal, xp = dayXp(), pct = Math.min(1, xp / goal), done = xp >= goal, sn = streakNow();
  const now = new Date(), mon = new Date(now); mon.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  const p = (n: number) => String(n).padStart(2, '0');
  const week = DAYS.map((d, i) => { const x = new Date(mon); x.setDate(mon.getDate() + i); const iso = x.getFullYear() + '-' + p(x.getMonth() + 1) + '-' + p(x.getDate()); const hit = S.streak.days.includes(iso); return '<span class="wday' + (hit ? ' hit' : '') + (iso === today() ? ' today' : '') + '" title="' + iso + '">' + (hit ? '<span class="flame mini" aria-hidden="true"></span>' : '') + '<i>' + d + '</i></span>'; }).join('');
  const r = 26, c = 2 * Math.PI * r;
  return '<section class="goalcard' + (done ? ' done' : '') + '">' +
    '<div class="goalring" role="img" aria-label="Dagens mål: ' + Math.min(xp, goal) + ' av ' + goal + ' XP"><svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="' + r + '" class="gr-bg"/><circle cx="32" cy="32" r="' + r + '" class="gr-fg" style="stroke-dasharray:' + c.toFixed(1) + ';stroke-dashoffset:' + (c * (1 - pct)).toFixed(1) + '"/></svg><b>' + (done ? '✓' : Math.round(pct * 100) + '%') + '</b></div>' +
    '<div class="goaltxt"><span class="eyebrow">Dagens mål</span><b>' + (done ? 'Nådd! ' + xp + ' XP i dag' : xp + ' av ' + goal + ' XP') + '</b><span>' + (done ? 'Alt du tjener nå, er bonus.' : (goal - xp) + ' XP igjen for å ' + (sn > 0 && S.streak.last !== today() ? 'holde rekka' : 'starte en rekke')) + '</span></div>' +
    '<div class="streakbox"><span class="flame big' + (done ? '' : ' cold') + '" aria-hidden="true"></span><b>' + sn + '</b><span>' + (sn === 1 ? 'dag' : 'dager') + ' på rad</span>' + (S.streak.best > 1 ? '<small>Beste: ' + S.streak.best + '</small>' : '') + '</div>' +
    '<div class="week" aria-label="Denne uka">' + week + '</div></section>';
}
/** Tall på flisene: spørsmål i feilbanken og lekser som gjenstår. */
function badge(id: string): string {
  const n = id === 'feilbank' ? bankKeys().length : id === 'lekser' ? myHomework().filter((x) => !hwProgress(x).done).length : 0;
  return n ? '<i class="gbadge">' + n + '</i>' : '';
}
export function setHomeName(who: string): void { firstName = who.split(' · ')[0].split(' ')[0]; }

/** Spillene som vises som fliser: alt som ikke har en egen plass i menyen. */
export const games = () => MODES.filter((m) => !m.g);

export function heroStats(): { cur: number; next: number | null; pct: number } {
  const i = lvl(S.points), top = topXp();
  if (S.points >= top) { const into = (S.points - top) % STAR_XP; return { cur: i, next: null, pct: into / STAR_XP }; }
  const a = LEVELS[i].xp, b = LEVELS[i + 1].xp;
  return { cur: i, next: b, pct: (S.points - a) / (b - a) };
}

export function renderHome(): void {
  const p = panel(), h = heroStats(), cards = T.content.cards, n = cards.length, known = CARDS_KNOWN();
  const left = h.next === null ? (STAR_XP - Math.round(h.pct * STAR_XP)) + ' XP til neste stjerne' : (h.next - S.points) + ' XP til neste nivå';
  const eggs = S.petsReady ? S.pets.filter((x) => !x.hatched_at) : [];
  const ready = eggs.filter((x) => eggProgress(x, xpTotal()) >= 1).length;
  const lastGame = games().find((m) => m.id === S.last);
  const hasTop = MODES.some((m) => m.id === 'top');

  p.innerHTML =
    '<section class="hero">' +
      '<div class="herotop"><div><p class="eyebrow">' + (firstName ? 'Hei, ' + esc(firstName) + '!' : 'Velkommen tilbake') + '</p>' +
      '<h2 class="herolvl">' + esc(level(S.points)) + '<span class="herostar">' + starText(stars(S.points)) + '</span></h2></div>' +
      '<span class="lvlbadge" aria-label="Nivå ' + (h.cur + 1) + '">' + (h.cur + 1) + '</span></div>' +
      '<div class="xpbar" role="progressbar" aria-label="' + esc(left) + '" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + Math.round(h.pct * 100) + '"><i style="width:' + Math.round(h.pct * 100) + '%"></i></div>' +
      '<p class="xptext"><b>' + S.points + ' XP</b> · ' + esc(left) + '</p>' +
      '<div class="herostats">' +
        '<button type="button" class="hstat" data-go="kort"><b>' + known + ' / ' + n + '</b><span>kort mestret</span></button>' +
        '<button type="button" class="hstat" data-go="shop"><b>' + (S.points - S.spent) + '</b><span>poeng å bruke</span></button>' +
        (S.achReady ? '<button type="button" class="hstat" data-go="avatar:ach"><b>' + ACHS.filter((a) => S.ach.has(a.id)).length + ' / ' + ACHS.length + '</b><span>achievements</span></button>' : '') +
        (hasTop ? '<button type="button" class="hstat" data-go="top"><b>' + esc(myRankText()) + '</b><span>i klassen</span></button>' : '') +
      '</div>' +
      '<div id="stripes" class="stripes mini" role="img" aria-label="' + known + ' av ' + n + ' kort mestret">' + cards.map((c, i) => '<i class="' + (S.known[c.id] === 1 ? 'on' : '') + '" style="background:' + gradient(T.stripes, i / Math.max(1, n - 1)) + '"></i>').join('') + '</div>' +
    '</section>' + liveAndHomework() + seasonBanner() + goalHTML() +
    (eggs.length ? '<button type="button" class="eggstrip' + (ready ? ' ready' : '') + '" data-go="avatar:dyr"><span class="eggrow">' + eggs.slice(0, 5).map((x) => eggSVG(x.egg, eggProgress(x, xpTotal()), eggProgress(x, xpTotal()) >= 1 ? 'wobble' : '')).join('') + '</span>' +
      '<span><b>' + (ready ? (ready > 1 ? ready + ' egg er klare til å klekke!' : 'Et egg er klart til å klekke!') : eggs.length + ' egg på vei') + '</b><span>' + (ready ? 'Trykk for å klekke' : 'De klekker når du tjener XP') + '</span></span></button>' : '') +
    (lastGame ? '<button type="button" class="continue" data-go="' + lastGame.id + '">' + icon(lastGame.id) + '<span><span class="eyebrow">Fortsett</span><b>' + esc(lastGame.name) + '</b></span>' + icon('pil', 'flip') + '</button>' : '') +
    '<h2 class="gridtitle">Velg et spill</h2>' +
    '<div class="games">' + games().map((m, i) =>
      '<button type="button" class="game g' + (i % 6) + '" data-go="' + m.id + '"><span class="gicon">' + icon(m.id) + '</span><b>' + esc(m.name) + '</b><span>' + esc(TAG[m.id] || m.desc.split('. ')[0]) + '</span>' + badge(m.id) + '</button>').join('') + '</div>';

  p.querySelectorAll('[data-go]').forEach((b: HTMLElement) => {
    b.onclick = () => { const [mode, tab] = b.dataset.go!.split(':'); hooks.open(mode, tab); };
  });
}
