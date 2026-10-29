// Avatarskjermen: eleven lager karakteren sin og kjøper kostymer for poeng.
import { $, esc, toast } from '../lib/dom';
import { friendly } from '../lib/supabase';
import { S, T, store, head, panel, hooks } from '../app/core';
import {
  AvatarCfg, Slot, GENDERS, SKIN_TONES, HAIR_STYLES, HAIR_COLORS, CLOTH_COLORS, TOPS, BOTTOMS, SHOES, EYES, MOUTHS,
  SKINS, SLOT_NAMES, skinById, Swatch, Opt,
} from './catalog';
import { avatarSVG } from './render';

type Tab = 'kropp' | 'har' | 'ansikt' | 'klaer' | 'kostymer';
const TABS: [Tab, string][] = [['kropp', 'Kropp'], ['har', 'Hår'], ['ansikt', 'Ansikt'], ['klaer', 'Klær'], ['kostymer', 'Kostymer']];

function st(): { tab: Tab; arm: string | null; msg: string; busy: boolean } { return S.cur.ava || (S.cur.ava = { tab: 'kropp', arm: null, msg: '', busy: false }); }

/** Endrer avataren, lagrer og tegner på nytt. */
function set(patch: Partial<AvatarCfg>, focus?: string) {
  S.avatar = { ...S.avatar, ...patch, made: true };
  store.saveAvatar(S.avatar);
  hooks.refresh();
  renderAvatar();
  if (focus) { const el = panel().querySelector(focus) as HTMLElement | null; if (el) el.focus({ preventScroll: true }); }
}

const swatches = (key: keyof AvatarCfg, list: Swatch[], label: string) =>
  '<div class="swatches" role="radiogroup" aria-label="' + esc(label) + '">' + list.map((s, i) =>
    '<button type="button" class="sw" role="radio" aria-checked="' + (S.avatar[key] === i) + '" aria-label="' + esc(s.name) + '" title="' + esc(s.name) + '" data-k="' + key + '" data-v="' + i + '" style="background:' + s.c + '"></button>').join('') + '</div>';

const chips = (key: keyof AvatarCfg, list: Opt[] | { id: string; name: string }[], label: string) =>
  '<div class="filters" role="radiogroup" aria-label="' + esc(label) + '">' + list.map((o) =>
    '<button type="button" class="chip" role="radio" aria-checked="' + (S.avatar[key] === o.id) + '" aria-pressed="' + (S.avatar[key] === o.id) + '" data-k="' + key + '" data-s="' + o.id + '">' + esc(o.name) + '</button>').join('') + '</div>';

const toggle = (key: 'lashes' | 'blush', label: string) =>
  '<label class="check avtoggle"><input type="checkbox" data-t="' + key + '"' + (S.avatar[key] ? ' checked' : '') + '><span><b>' + esc(label) + '</b></span></label>';

/** Små forhåndsvisninger av et valg, tegnet med elevens egen avatar. */
function tiles(key: 'hair' | 'top' | 'bottom' | 'shoes', list: Opt[], crop: 'head' | 'full') {
  return '<div class="avtiles">' + list.map((o) => {
    const on = S.avatar[key] === o.id;
    return '<button type="button" class="avtile' + (on ? ' on' : '') + '" aria-pressed="' + on + '" data-k="' + key + '" data-s="' + o.id + '">' +
      avatarSVG({ ...S.avatar, [key]: o.id, eq: key === 'hair' ? {} : S.avatar.eq }, { crop }) + '<span>' + esc(o.name) + '</span></button>';
  }).join('') + '</div>';
}

function section(title: string, body: string) { return '<div class="avsec"><h3>' + esc(title) + '</h3>' + body + '</div>'; }

function shopHTML(): string {
  const s = st(), bal = S.points - S.spent;
  if (!S.avaReady) return '<p class="fb bad">Kostymebutikken er ikke klar ennå. Læreren må oppdatere databasen først.</p>';
  const here = SKINS.filter((k) => k.theme === T.id), other = SKINS.filter((k) => k.theme !== T.id && S.owned.has(k.id));
  const card = (k: typeof SKINS[number]) => {
    const own = S.owned.has(k.id), worn = S.avatar.eq[k.slot] === k.id, can = bal >= k.price, armed = s.arm === k.id, mine = k.theme === T.id;
    let btn: string;
    if (own) btn = '<button class="btn' + (worn ? '' : ' primary') + '" type="button" data-wear="' + k.id + '">' + (worn ? 'Ta av' : 'Ta på') + '</button>';
    else if (!mine) btn = '';
    else btn = '<button class="btn' + (armed ? ' primary' : '') + '" type="button" data-buy="' + k.id + '"' + (can && !s.busy ? '' : ' disabled') + '>' + (can ? (armed ? 'Bekreft kjøp' : 'Kjøp') : 'Mangler ' + (k.price - bal) + ' poeng') + '</button>';
    return '<article class="skin' + (worn ? ' worn' : '') + '">' + avatarSVG({ ...S.avatar, eq: { [k.slot]: k.id } }, { crop: k.slot === 'hat' || k.slot === 'face' ? 'head' : 'full' }) +
      '<h4>' + esc(k.name) + '</h4><p>' + esc(k.desc) + '</p><div class="pfoot"><span class="price">' + (own ? 'Eies' : k.price + ' poeng') + '</span><span class="tsub">' + esc(SLOT_NAMES[k.slot]) + '</span></div>' + btn + '</article>';
  };
  return '<div class="bal"><b>' + bal + '</b><span>poeng å bruke</span></div>' +
    '<p class="keyhint">Kostymene kjøpes med de samme poengene som i ' + esc((T.modes.find((m) => m.id === 'shop') || { name: 'butikken' }).name) + '. Et kostyme du har kjøpt, er ditt for godt.</p>' +
    '<p class="msg" aria-live="polite">' + esc(s.msg) + '</p>' +
    '<div class="skins">' + here.map(card).join('') + '</div>' +
    (other.length ? '<h3 class="grp">Kostymer fra andre temaer</h3><div class="skins">' + other.map(card).join('') + '</div>' : '');
}

export function renderAvatar(): void {
  const s = st(), p = panel(), a = S.avatar;
  let body = '';
  if (s.tab === 'kropp') body = section('Kjønn', chips('g', GENDERS, 'Kjønn')) + section('Hudfarge', swatches('skin', SKIN_TONES, 'Hudfarge'));
  if (s.tab === 'har') body = section('Frisyre', tiles('hair', HAIR_STYLES, 'head')) + section('Hårfarge', swatches('hairC', HAIR_COLORS, 'Hårfarge'));
  if (s.tab === 'ansikt') body = section('Øyne', chips('eyes', EYES, 'Øyne') + toggle('lashes', 'Øyevipper')) + section('Munn', chips('mouth', MOUTHS, 'Munn')) + section('Kinn', toggle('blush', 'Røde kinn'));
  if (s.tab === 'klaer') body = section('Overdel', tiles('top', TOPS, 'full') + swatches('topC', CLOTH_COLORS, 'Farge på overdelen')) +
    section('Underdel', tiles('bottom', BOTTOMS, 'full') + swatches('bottomC', CLOTH_COLORS, 'Farge på underdelen')) +
    section('Sko', tiles('shoes', SHOES, 'full') + swatches('shoesC', CLOTH_COLORS, 'Farge på skoene')) +
    (a.eq.outfit || a.eq.top ? '<p class="keyhint">Du har på deg et kostyme som dekker klærne. Ta det av under «Kostymer» for å se klærne dine.</p>' : '');
  if (s.tab === 'kostymer') body = shopHTML();

  const worn = (Object.keys(a.eq) as Slot[]).map((k) => skinById(a.eq[k]!)?.name).filter(Boolean);
  p.innerHTML = head('avatar') +
    '<div class="avagrid"><div class="avastage">' + avatarSVG(a, { cls: 'big', title: 'Avataren din', ariaHidden: false }) +
    '<p class="keyhint">' + (worn.length ? 'Kostymer: ' + esc(worn.join(', ')) + '.' : 'Ingen kostymer på.') + '</p>' +
    '<div class="row"><button class="btn" type="button" id="av-rand">Tilfeldig utseende</button></div></div>' +
    '<div class="avaopts"><div class="tabs avtabs" role="tablist" aria-label="Deler av avataren">' + TABS.map(([id, n]) => '<button class="tab" type="button" role="tab" data-tab="' + id + '" aria-selected="' + (s.tab === id) + '" aria-current="' + (s.tab === id) + '">' + n + '</button>').join('') + '</div>' +
    body + '</div></div>' +
    (a.made ? '' : '<p class="keyhint">Avataren lagres automatisk når du endrer noe. Den vises øverst i appen og dukker opp i troférommet.</p>');

  p.querySelectorAll('[data-tab]').forEach((b: HTMLElement) => { b.onclick = () => { s.tab = b.dataset.tab as Tab; s.msg = ''; renderAvatar(); const t = p.querySelector('[data-tab="' + s.tab + '"]') as HTMLElement | null; if (t) t.focus({ preventScroll: true }); }; });
  p.querySelectorAll('.sw').forEach((b: HTMLElement) => { b.onclick = () => set({ [b.dataset.k!]: +b.dataset.v! } as Partial<AvatarCfg>, '.sw[data-k="' + b.dataset.k + '"][data-v="' + b.dataset.v + '"]'); });
  p.querySelectorAll('[data-s]').forEach((b: HTMLElement) => { b.onclick = () => set({ [b.dataset.k!]: b.dataset.s } as Partial<AvatarCfg>, '[data-k="' + b.dataset.k + '"][data-s="' + b.dataset.s + '"]'); });
  p.querySelectorAll('input[data-t]').forEach((i: HTMLInputElement) => { i.onchange = () => set({ [i.dataset.t!]: i.checked } as Partial<AvatarCfg>, 'input[data-t="' + i.dataset.t + '"]'); });
  $('#av-rand').onclick = () => {
    const r = (n: number) => Math.floor(Math.random() * n);
    set({ skin: r(SKIN_TONES.length), hair: HAIR_STYLES[r(HAIR_STYLES.length)].id, hairC: r(HAIR_COLORS.length), eyes: EYES[r(2)].id as AvatarCfg['eyes'], mouth: MOUTHS[r(3)].id as AvatarCfg['mouth'],
      top: TOPS[r(TOPS.length)].id, topC: r(CLOTH_COLORS.length), bottom: BOTTOMS[r(BOTTOMS.length)].id, bottomC: r(CLOTH_COLORS.length), shoes: SHOES[r(2)].id, shoesC: r(CLOTH_COLORS.length), blush: Math.random() < 0.4 }, '#av-rand');
  };
  p.querySelectorAll('[data-wear]').forEach((b: HTMLElement) => {
    b.onclick = () => {
      const k = skinById(b.dataset.wear!)!, eq = { ...S.avatar.eq };
      if (eq[k.slot] === k.id) delete eq[k.slot]; else eq[k.slot] = k.id;
      set({ eq }, '[data-wear="' + k.id + '"]');
    };
  });
  let armTimer: number | undefined;
  p.querySelectorAll('[data-buy]').forEach((b: HTMLElement) => {
    b.onclick = async () => {
      const k = skinById(b.dataset.buy!)!;
      if (s.busy || S.points - S.spent < k.price) return;
      clearTimeout(armTimer);
      if (s.arm !== k.id) {
        s.arm = k.id; s.msg = 'Trykk «Bekreft kjøp» for å bruke ' + k.price + ' poeng på ' + k.name.toLowerCase() + '.';
        renderAvatar(); const a2 = p.querySelector('[data-buy="' + k.id + '"]') as HTMLElement | null; if (a2) a2.focus({ preventScroll: true });
        armTimer = window.setTimeout(() => { if (S.mode === 'avatar' && s.arm === k.id) { s.arm = null; s.msg = ''; renderAvatar(); } }, 6000);
        return;
      }
      s.arm = null; s.busy = true; s.msg = 'Kjøper …'; renderAvatar();
      try {
        S.spent = await store.buySkin(T.id, k.id, k.price);
        S.owned.add(k.id);
        s.busy = false; s.msg = k.name + ' er kjøpt og tatt på.';
        set({ eq: { ...S.avatar.eq, [k.slot]: k.id } }, '[data-wear="' + k.id + '"]');
        toast(k.name + ' er kjøpt');
      } catch (e) {
        s.busy = false; s.msg = 'Kjøpet gikk ikke: ' + friendly(e); renderAvatar();
      }
    };
  });
}
