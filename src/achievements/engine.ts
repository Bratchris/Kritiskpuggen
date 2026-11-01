// Låser opp achievements, gir belønningen og viser et lite vindu når det skjer.
import { esc } from '../lib/dom';
import { S, T, store, hooks, xpTotal, stars, lvl } from '../app/core';
import { ICON_PATHS } from '../app/icons';
import { type Ach, achById } from './catalog';
import { skinById } from '../avatar/catalog';
import { petName } from '../pets/catalog';

const TIER = [['#c98a4b', '#8a5a2b'], ['#c8d0d8', '#7d8894'], ['#ffd25a', '#c08a1e']];
/** Medaljen for et achievement. Låste vises grå. */
export function badgeSVG(a: Ach, locked = false, cls = ''): string {
  const [c, d] = TIER[a.tier - 1];
  return '<svg class="badge ' + (locked ? 'locked ' : '') + cls + '" viewBox="0 0 64 64" aria-hidden="true">' +
    '<path d="M20 34 12 58l9-3 5 7 8-22z" fill="#d9453b"/><path d="M44 34l8 24-9-3-5 7-8-22z" fill="#2e86c1"/>' +
    '<circle cx="32" cy="27" r="22" fill="' + d + '"/><circle cx="32" cy="27" r="18.5" fill="' + c + '"/><circle cx="32" cy="27" r="15" fill="none" stroke="' + d + '" stroke-width="1.2" stroke-dasharray="2 2.4"/>' +
    '<svg x="20" y="15" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="' + d + '" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' + (ICON_PATHS[a.ic] || ICON_PATHS.stjerne) + '</svg>' +
    '<path d="M18 16a16 16 0 0 1 10-6" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".55" fill="none"/></svg>';
}

export function rewardText(a: Ach): string {
  if (!a.reward) return '';
  return a.reward.kind === 'skin' ? (skinById(a.reward.id)?.name || 'Kostyme') + ' (kostyme)' : petName(a.reward.species, 'vanlig') + ' (dyr)';
}

// ---------- vinduet ----------
const queue: Ach[] = [];
let showing = false;
function pump(): void {
  if (showing || !queue.length) return;
  showing = true;
  const list = queue.splice(0, queue.length > 2 ? queue.length : 1);
  const el = document.createElement('div');
  el.className = 'achpop'; el.setAttribute('role', 'status'); el.setAttribute('aria-live', 'polite');
  const one = list.length === 1 ? list[0] : null;
  el.innerHTML = one
    ? badgeSVG(one, false, 'pop') + '<div class="achtxt"><span class="eyebrow">Achievement låst opp!</span><b>' + esc(one.name) + '</b><span>' + esc(one.desc) + '</span>' + (one.reward ? '<span class="achrew">Belønning: ' + esc(rewardText(one)) + '</span>' : '') + '</div>'
    : '<div class="achstack">' + list.slice(0, 4).map((a) => badgeSVG(a, false, 'pop')).join('') + '</div><div class="achtxt"><span class="eyebrow">Achievements låst opp!</span><b>' + list.length + ' nye</b><span>' + esc(list.map((a) => a.name).join(', ')) + '</span></div>';
  el.innerHTML += '<button class="btn" type="button">Se</button><button class="achx" type="button" aria-label="Lukk">×</button>';
  document.body.appendChild(el);
  let gone = false;
  const close = () => { if (gone) return; gone = true; el.classList.add('out'); setTimeout(() => { el.remove(); showing = false; pump(); }, 260); };
  el.querySelector('.btn')!.addEventListener('click', () => { close(); hooks.open('avatar', 'ach'); });
  el.querySelector('.achx')!.addEventListener('click', close);
  setTimeout(close, one ? 6000 : 8000);
}

/** Låser opp et achievement. Gjør ingenting om det allerede er låst opp eller databasen mangler støtte. */
export function achieve(id: string): void {
  const a = achById(id);
  if (!a || !S.achReady || S.ach.has(id) || !T) return;
  S.ach.add(id);
  queue.push(a); pump();
  store.unlockAchievement(T.id, id).then((r) => {
    if (r.skin) S.owned.add(r.skin);
    if (r.pet && !S.pets.some((p) => p.id === r.pet!.id)) S.pets.push(r.pet);
    hooks.refresh();
  }, () => { S.ach.delete(id); });
}

/** Sjekker alle achievements som kan regnes ut fra fremgangen. Trygg å kalle ofte. */
export function checkProgress(): void {
  if (!S.achReady || !T) return;
  const xp = xpTotal();
  for (const [id, n] of [['xp_100', 100], ['xp_500', 500], ['xp_1000', 1000], ['xp_1800', 1800]] as [string, number][]) if (xp >= n) achieve(id);
  if (stars(S.points) >= 1) achieve('stjerne');
  const lastRoom = Math.max(...T.room.rooms.map((r) => r.lv));
  if (lvl(S.points) >= lastRoom) achieve('huseier');
  const need = T.modes.filter((m) => !m.g && m.id !== 'tenk' && (m.id !== 'feil' || T.content.feil.length > 0)).map((m) => m.id);
  if (need.length && need.every((m) => S.played.includes(m))) achieve('allsidig');
  if (T.content.cards.length && T.content.cards.every((c) => S.known[c.id] === 1)) achieve('kort_alle');
  checkPets();
}
export function checkPets(): void {
  if (!S.achReady || !S.petsReady) return;
  const own = S.pets.filter((p) => p.egg !== 'belonning');
  if (own.length) achieve('egg_forste');
  if (own.some((p) => p.hatched_at)) achieve('klekk_forste');
  if (own.some((p) => p.hatched_at && p.rarity === 4)) achieve('legendarisk');
  if (new Set(S.pets.filter((p) => p.hatched_at).map((p) => p.species + '/' + p.variant)).size >= 5) achieve('samler_5');
}

/** Fremdrift mot målet, for achievements som har et tall. */
export function achProgress(a: Ach): number | null {
  if (!a.goal) return null;
  if (a.id.startsWith('xp_')) return Math.min(1, xpTotal() / a.goal);
  if (a.id === 'samler_5') return Math.min(1, new Set(S.pets.filter((p) => p.hatched_at).map((p) => p.species + '/' + p.variant)).size / a.goal);
  return null;
}
