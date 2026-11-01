// Startsiden «Øv»: nivå og fremgang øverst, egg som er på vei, og alle spillene som store fliser.
import { esc } from '../lib/dom';
import { S, T, MODES, LEVELS, CARDS_KNOWN, lvl, level, stars, starText, topXp, STAR_XP, panel, hooks, xpTotal } from './core';
import { gradient } from './room/iso';
import { icon } from './icons';
import { myRankText } from './modes/top';
import { eggSVG } from '../pets/render';
import { eggProgress } from '../pets/catalog';

/** Kort undertittel på flisene. Spill som mangler her, får første setning av beskrivelsen. */
const TAG: Record<string, string> = {
  quiz: 'Flervalg med forklaring', tf: 'Sant eller løgn?', par: 'Koble begrep og forklaring', memo: 'Snu kort og finn parene',
  ord: 'Sett i riktig rekkefølge', sort: 'Sorter i riktig kurv', hull: 'Skriv ordet som mangler', feil: 'Finn feilen i teksten', tenk: 'Argumenter og se sammenhenger',
};
let firstName = '';
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
        (hasTop ? '<button type="button" class="hstat" data-go="top"><b>' + esc(myRankText()) + '</b><span>i klassen</span></button>' : '') +
      '</div>' +
      '<div id="stripes" class="stripes mini" role="img" aria-label="' + known + ' av ' + n + ' kort mestret">' + cards.map((c, i) => '<i class="' + (S.known[c.id] === 1 ? 'on' : '') + '" style="background:' + gradient(T.stripes, i / Math.max(1, n - 1)) + '"></i>').join('') + '</div>' +
    '</section>' +
    (eggs.length ? '<button type="button" class="eggstrip' + (ready ? ' ready' : '') + '" data-go="avatar:dyr"><span class="eggrow">' + eggs.slice(0, 5).map((x) => eggSVG(x.egg, eggProgress(x, xpTotal()), eggProgress(x, xpTotal()) >= 1 ? 'wobble' : '')).join('') + '</span>' +
      '<span><b>' + (ready ? (ready > 1 ? ready + ' egg er klare til å klekke!' : 'Et egg er klart til å klekke!') : eggs.length + ' egg på vei') + '</b><span>' + (ready ? 'Trykk for å klekke' : 'De klekker når du tjener XP') + '</span></span></button>' : '') +
    (lastGame ? '<button type="button" class="continue" data-go="' + lastGame.id + '">' + icon(lastGame.id) + '<span><span class="eyebrow">Fortsett</span><b>' + esc(lastGame.name) + '</b></span>' + icon('pil', 'flip') + '</button>' : '') +
    '<h2 class="gridtitle">Velg et spill</h2>' +
    '<div class="games">' + games().map((m, i) =>
      '<button type="button" class="game g' + (i % 6) + '" data-go="' + m.id + '"><span class="gicon">' + icon(m.id) + '</span><b>' + esc(m.name) + '</b><span>' + esc(TAG[m.id] || m.desc.split('. ')[0]) + '</span></button>').join('') + '</div>';

  p.querySelectorAll('[data-go]').forEach((b: HTMLElement) => {
    b.onclick = () => { const [mode, tab] = b.dataset.go!.split(':'); hooks.open(mode, tab); };
  });
}
