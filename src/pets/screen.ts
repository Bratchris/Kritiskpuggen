// Egg og kjæledyr: fanen «Dyr og egg» i avatarskjermen, vinduet når eleven finner et egg,
// klekkingen og dyret som står ved siden av avataren.
import { esc, toast } from '../lib/dom';
import { friendly } from '../lib/supabase';
import { S, T, store, hooks, xpTotal } from '../app/core';
import { type Pet, type EggKind, SPECIES, VARIANTS, RARITIES, EGGS, CHANCE, petName, eggProgress } from './catalog';
import { petSVG, petG, eggSVG, eggG } from './render';
import type { PreviewStore } from '../lib/store';

const chosen = (): Pet | undefined => S.pets.find((p) => p.id === S.avatar.pet);
const hatched = () => S.pets.filter((p) => p.hatched_at && p.species && p.variant);
const eggs = () => S.pets.filter((p) => !p.hatched_at);
const rar = (n: number | null) => '<span class="rar r' + (n ?? 0) + '">' + RARITIES[n ?? 0] + '</span>';
const fmtDate = (d: string) => new Date(d).toLocaleDateString('nb-NO', { day: 'numeric', month: 'short' });

/** Dyret eller egget ved siden av avataren, som SVG. Tomt hvis eleven ikke har valgt noe. */
export function companionSVG(cls = ''): string {
  const p = chosen(); if (!p) return '';
  return p.hatched_at && p.species && p.variant ? petSVG(p.species, p.variant, 'companion ' + cls) : eggSVG(p.egg, eggProgress(p, xpTotal()), 'companion ' + cls);
}
/** Samme tegning uten svg-element, til troférommet. */
export function companionG(): string {
  const p = chosen(); if (!p) return '';
  return p.hatched_at && p.species && p.variant ? petG(p.species, p.variant) : eggG(p.egg, eggProgress(p, xpTotal()));
}

function choose(id: string | undefined): void {
  S.avatar = { ...S.avatar, pet: id };
  store.saveAvatar(S.avatar);
  hooks.refresh();
}

// ---------- vinduer ----------
function modal(html: string, label: string): { el: HTMLElement; close: () => void } {
  const back = document.activeElement as HTMLElement | null;
  const el = document.createElement('div');
  el.className = 'petpop'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-label', label);
  el.innerHTML = '<div class="petbox">' + html + '</div>';
  document.body.appendChild(el);
  const close = () => { el.remove(); document.removeEventListener('keydown', key); if (back && back.isConnected) back.focus({ preventScroll: true }); };
  const key = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
  document.addEventListener('keydown', key);
  el.addEventListener('click', (e) => { if (e.target === el) close(); });
  return { el, close };
}

/** Vises når eleven finner et egg. */
export function showEggFound(p: Pet): void {
  const myth = p.egg === 'mytisk';
  const m = modal('<div class="eggdrop' + (myth ? ' myth' : '') + '">' + eggSVG(p.egg, 0, 'pop') + '</div>' +
    '<p class="eyebrow">' + (myth ? 'Svært sjeldent funn' : 'Funn') + '</p><h2>' + (myth ? 'Du fant et mytisk egg!' : 'Du fant et egg!') + '</h2>' +
    '<p>' + esc(EGGS[p.egg].desc) + ' Det klekker når du har tjent <b>' + p.xp_need + ' XP</b> til, i hvilket som helst tema.</p>' +
    '<div class="row"><button class="btn primary" type="button" data-x="vis">Vis ved avataren</button><button class="btn" type="button" data-x="se">Se eggene dine</button><button class="btn ghost" type="button" data-x="lukk">Fortsett</button></div>', myth ? 'Du fant et mytisk egg' : 'Du fant et egg');
  (m.el.querySelector('[data-x="vis"]') as HTMLElement).focus();
  m.el.querySelector('[data-x="vis"]')!.addEventListener('click', () => { choose(p.id); m.close(); toast('Egget står ved avataren din'); if (S.mode === 'avatar') hooks.open('avatar', 'dyr'); });
  m.el.querySelector('[data-x="se"]')!.addEventListener('click', () => { m.close(); hooks.open('avatar', 'dyr'); });
  m.el.querySelector('[data-x="lukk"]')!.addEventListener('click', () => m.close());
}

function petCard(p: Pet, big = false): string {
  const on = S.avatar.pet === p.id;
  return '<article class="petcard rr' + p.rarity + (on ? ' on' : '') + (big ? ' big' : '') + '">' + petSVG(p.species!, p.variant!) +
    '<h4>' + esc(petName(p.species, p.variant)) + '</h4>' + rar(p.rarity) +
    '<p class="keyhint">' + (p.egg === 'mytisk' ? 'Fra et mytisk egg · ' : '') + 'Klekket ' + fmtDate(p.hatched_at!) + '</p>' +
    (big ? '' : '<button class="btn' + (on ? '' : ' primary') + '" type="button" data-show="' + p.id + '">' + (on ? 'Ta bort fra avataren' : 'Vis ved avataren') + '</button>') + '</article>';
}

async function hatch(id: string, rerender: () => void): Promise<void> {
  const p = S.pets.find((x) => x.id === id); if (!p) return;
  const m = modal('<div class="hatching">' + eggSVG(p.egg, 1, 'shake') + '</div><h2>Egget klekker …</h2><p class="keyhint" aria-live="polite">Hold pusten.</p>', 'Egget klekker');
  const wait = new Promise((r) => setTimeout(r, 2200));
  try {
    const [res] = await Promise.all([store.hatchEgg(id), wait]);
    Object.assign(p, res);
    const box = m.el.querySelector('.petbox')!;
    box.innerHTML = '<div class="reveal rr' + p.rarity + '"><div class="burst" aria-hidden="true"></div>' + petSVG(p.species!, p.variant!, 'born') + '</div>' +
      '<p class="eyebrow">Det klekket!</p><h2>' + esc(petName(p.species, p.variant)) + '</h2><p class="rarline">' + rar(p.rarity) + '</p>' +
      '<p>' + (p.rarity! >= 3 ? 'Dette er et skikkelig sjeldent dyr. ' : '') + 'Dyret er ditt for godt og ligger i samlingen din.</p>' +
      '<div class="row"><button class="btn primary" type="button" data-x="vis">Vis ved avataren</button><button class="btn ghost" type="button" data-x="lukk">Lukk</button></div>';
    (box.querySelector('[data-x="vis"]') as HTMLElement).focus();
    box.querySelector('[data-x="vis"]')!.addEventListener('click', () => { choose(p.id); m.close(); rerender(); });
    box.querySelector('[data-x="lukk"]')!.addEventListener('click', () => { m.close(); rerender(); });
    hooks.refresh();
  } catch (e) {
    await wait;
    m.el.querySelector('.petbox')!.innerHTML = '<h2>Egget ville ikke klekke</h2><p>' + esc(friendly(e)) + '</p><div class="row"><button class="btn" type="button" data-x="lukk">Lukk</button></div>';
    m.el.querySelector('[data-x="lukk"]')!.addEventListener('click', () => m.close());
  }
}

// ---------- fanen ----------
function dexHTML(): string {
  const found = new Set(hatched().map((p) => p.species + '/' + p.variant));
  return SPECIES.map((s) => '<div class="dexrow"><span class="dexname">' + esc(s.name) + (s.egg === 'mytisk' ? ' <small>(mytisk egg)</small>' : '') + '</span><div class="dexcells">' +
    VARIANTS.map((v) => { const k = s.id + '/' + v.id, has = found.has(k); return '<span class="dexcell' + (has ? ' has' : '') + '" title="' + esc(has ? petName(s.id, v.id) : 'Ikke funnet ennå') + '">' + petSVG(s.id, v.id, has ? '' : 'unknown') + '<i>' + esc(v.name) + '</i></span>'; }).join('') + '</div></div>').join('');
}

export function petsHTML(): string {
  if (!S.petsReady) return '<p class="fb bad">Dyrene er ikke klare ennå. Læreren må oppdatere databasen først.</p>';
  const tot = xpTotal(), E = eggs(), H = hatched().slice().reverse();
  const nFound = new Set(hatched().map((p) => p.species + '/' + p.variant)).size, nAll = SPECIES.length * VARIANTS.length;
  const eggCard = (p: Pet) => {
    const pr = eggProgress(p, tot), ready = pr >= 1, on = S.avatar.pet === p.id, got = Math.min(p.xp_need, Math.max(0, tot - p.xp_start));
    return '<article class="eggcard' + (on ? ' on' : '') + (p.egg === 'mytisk' ? ' myth' : '') + '">' + eggSVG(p.egg, pr, ready ? 'wobble' : '') +
      '<h4>' + esc(EGGS[p.egg].name) + '</h4><div class="eggbar" role="progressbar" aria-valuemin="0" aria-valuemax="' + p.xp_need + '" aria-valuenow="' + got + '" aria-label="Fram til klekking"><i style="width:' + Math.round(pr * 100) + '%"></i></div>' +
      '<p class="keyhint">' + (ready ? 'Klar til å klekke!' : got + ' av ' + p.xp_need + ' XP') + '</p>' +
      (ready ? '<button class="btn primary" type="button" data-hatch="' + p.id + '">Klekk egget</button>' : '') +
      '<button class="btn' + (on ? '' : ' ghost') + '" type="button" data-show="' + p.id + '">' + (on ? 'Ta bort fra avataren' : 'Vis ved avataren') + '</button></article>';
  };
  const prev = store.kind === 'preview' ? '<div class="previewnote"><span>Forhåndsvisning: prøv klekkingen uten å vente på flaksen.</span><span class="row"><button class="btn" type="button" data-give="vanlig">Gi et egg</button><button class="btn" type="button" data-give="mytisk">Gi et mytisk egg</button>' + (E.some((x) => eggProgress(x, tot) < 1) ? '<button class="btn" type="button" id="pv-ready">Gjør eggene klare</button>' : '') + '</span></div>' : '';
  return prev + '<p class="keyhint">Når et svar gir XP, er det en liten sjanse for å finne et egg (omtrent 1 av ' + Math.round(1 / CHANCE.vanlig) + '). Et mytisk egg med en drage inni er mye sjeldnere. Eggene klekker når du har tjent nok XP etter at du fant dem. Du kan ha ' + CHANCE.maxEggs + ' egg om gangen og finne høyst ' + CHANCE.perDay + ' om dagen.</p>' +
    '<div class="avsec"><h3>Eggene dine</h3>' + (E.length ? '<div class="eggs">' + E.map(eggCard).join('') + '</div>' : '<p class="keyhint">Ingen egg ennå. Fortsett å øve, så dukker det kanskje opp et.</p>') + '</div>' +
    '<div class="avsec"><h3>Dyrene dine</h3>' + (H.length ? '<div class="pets">' + H.map((p) => petCard(p)).join('') + '</div>' : '<p class="keyhint">Ingen dyr ennå. Klekk et egg for å få ditt første.</p>') + '</div>' +
    '<details class="dex"><summary>Dyreboka: ' + nFound + ' av ' + nAll + ' funnet</summary><div class="dexbody"></div></details>' +
    '<div class="avsec"><h3>Sjeldenhet</h3><p class="rarlegend">' + RARITIES.map((_, i) => rar(i)).join(' ') + '</p><p class="keyhint">Arten og fargen avgjør hvor sjeldent dyret er. Stripete og bronse er litt sjeldne, sølv mer, smaragd og neon svært sjeldne, og gull nesten aldri. Enhjørning og minigris er sjeldnere enn de andre, og dragen finnes bare i mytiske egg.</p></div>';
}

export function wirePets(p: HTMLElement, rerender: () => void): void {
  p.querySelectorAll<HTMLElement>('[data-show]').forEach((b) => { b.onclick = () => { const id = b.dataset.show!; choose(S.avatar.pet === id ? undefined : id); rerender(); const f = p.querySelector('[data-show="' + id + '"]') as HTMLElement | null; if (f) f.focus({ preventScroll: true }); }; });
  p.querySelectorAll<HTMLElement>('[data-hatch]').forEach((b) => { b.onclick = () => { void hatch(b.dataset.hatch!, rerender); }; });
  p.querySelectorAll<HTMLElement>('[data-give]').forEach((b) => {
    b.onclick = async () => { const egg = await (store as PreviewStore).giveEgg(T.id, b.dataset.give as EggKind); S.pets.push(egg); rerender(); showEggFound(egg); };
  });
  const rd = p.querySelector('#pv-ready') as HTMLElement | null;
  if (rd) rd.onclick = () => { S.pets = (store as PreviewStore).readyEggs(); rerender(); };
  const d = p.querySelector('details.dex') as HTMLDetailsElement | null;
  if (d) d.addEventListener('toggle', () => { const body = d.querySelector('.dexbody')!; if (d.open && !body.innerHTML) body.innerHTML = dexHTML(); });
}

