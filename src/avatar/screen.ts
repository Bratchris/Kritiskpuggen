// Avatarskjermen: eleven lager karakteren sin og kjøper kostymer og CRISPY-G-merch for poeng.
import { $, esc, toast } from '../lib/dom';
import { friendly } from '../lib/supabase';
import { S, T, store, head, panel, hooks } from '../app/core';
import {
  AvatarCfg, ColorKey, Slot, Skin, GENDERS, SKIN_TONES, HAIR_STYLES, HAIR_COLORS, HEADWEAR, EYE_COLORS, LIP_COLORS, SHADOW_COLORS, BLUSH_COLORS,
  CLOTH_COLORS, TOPS, BOTTOMS, SHOES, EYES, MOUTHS, SKINS, SLOT_NAMES, skinById, isMerch, Swatch, Opt,
} from './catalog';
import { avatarSVG, tintOf } from './render';
import { BACKGROUNDS, BG_GROUPS, Background, bgById, bgImage, applyBackground } from './backgrounds';

type Tab = 'kropp' | 'har' | 'ansikt' | 'sminke' | 'klaer' | 'bakgrunn' | 'kostymer' | 'merch';
const TABS: [Tab, string][] = [['kropp', 'Kropp'], ['har', 'Hår'], ['ansikt', 'Ansikt'], ['sminke', 'Sminke'], ['klaer', 'Klær'], ['bakgrunn', 'Bakgrunn'], ['kostymer', 'Kostymer'], ['merch', 'CRISPY-G']];

interface AvaState { tab: Tab; arm: string | null; msg: string; busy: boolean; open: string | null }
function st(): AvaState {
  const s = S.cur.ava || (S.cur.ava = { tab: 'kropp', arm: null, msg: '', busy: false, open: null });
  if (s.open === undefined) s.open = null;
  return s;
}

/** Endrer avataren, lagrer og tegner på nytt. */
function set(patch: Partial<AvatarCfg>, focus?: string) {
  S.avatar = { ...S.avatar, ...patch, made: true };
  store.saveAvatar(S.avatar);
  if ('bg' in patch) applyBackground(S.avatar.bg);
  hooks.refresh();
  renderAvatar();
  if (focus) { const el = panel().querySelector(focus) as HTMLElement | null; if (el) el.focus({ preventScroll: true }); }
}

// ---------- farger ----------
// En farge er enten en av avatarens fargefelt (hairC, topC …) eller «tint:<kostyme-id>».
const getC = (ck: string): string => (ck.startsWith('tint:') ? tintOf(S.avatar, ck.slice(5)) : (S.avatar[ck as ColorKey] as string));
function patchC(ck: string, v: string): Partial<AvatarCfg> {
  return ck.startsWith('tint:') ? { tint: { ...S.avatar.tint, [ck.slice(5)]: v } } : ({ [ck]: v } as Partial<AvatarCfg>);
}
const rgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const toHex = (c: number[]) => '#' + c.map((v) => Math.max(0, Math.min(255, v | 0)).toString(16).padStart(2, '0')).join('');
const CH = ['Rød', 'Grønn', 'Blå'];

/** Ferdige farger og «Egen farge» som åpner tre glidebrytere for rødt, grønt og blått. */
function colorField(ck: string, list: Swatch[], label: string): string {
  const s = st(), cur = getC(ck).toLowerCase(), custom = !list.some((w) => w.c.toLowerCase() === cur), open = s.open === ck;
  const id = 'cf-' + ck.replace(/[^a-z0-9]/gi, '-');
  let h = '<div class="colorf" data-cf="' + ck + '"><div class="swatches" role="radiogroup" aria-label="' + esc(label) + '">' + list.map((w) =>
    '<button type="button" class="sw" role="radio" aria-checked="' + (w.c.toLowerCase() === cur) + '" aria-label="' + esc(w.name) + '" title="' + esc(w.name) + '" data-ck="' + ck + '" data-c="' + w.c + '" style="background:' + w.c + '"></button>').join('') +
    '<button type="button" class="sw custom" role="radio" aria-checked="' + custom + '" aria-expanded="' + open + '" aria-controls="' + id + '" data-open="' + ck + '" title="Egen farge" aria-label="Egen farge"' +
    (custom ? ' style="--own:' + cur + '"' : '') + '><span aria-hidden="true">+</span></button></div>';
  if (open) {
    const v = rgb(cur);
    h += '<div class="rgb" id="' + id + '"><div class="rgbhead"><span class="rgbswatch" style="background:' + cur + '"></span><code class="rgbhex">' + cur.toUpperCase() + '</code></div>' +
      v.map((n, i) => '<label class="rgbrow ch' + i + '"><span>' + CH[i] + '</span><input type="range" min="0" max="255" step="1" value="' + n + '" data-rgb="' + ck + '" data-ch="' + i + '" aria-label="' + esc(label) + ': ' + CH[i].toLowerCase() + '" style="--from:' + toHex(v.map((x, j) => (j === i ? 0 : x))) + ';--to:' + toHex(v.map((x, j) => (j === i ? 255 : x))) + '"><output>' + n + '</output></label>').join('') +
      '</div>';
  }
  return h + '</div>';
}

const chips = (key: keyof AvatarCfg, list: Opt[], label: string) =>
  '<div class="filters" role="radiogroup" aria-label="' + esc(label) + '">' + list.map((o) =>
    '<button type="button" class="chip" role="radio" aria-checked="' + (S.avatar[key] === o.id) + '" aria-pressed="' + (S.avatar[key] === o.id) + '" data-k="' + key + '" data-s="' + o.id + '">' + esc(o.name) + '</button>').join('') + '</div>';

type Flag = 'lashes' | 'blush' | 'lips' | 'shadow' | 'liner' | 'freckles';
const toggle = (key: Flag, label: string) =>
  '<label class="check avtoggle"><input type="checkbox" data-t="' + key + '"' + (S.avatar[key] ? ' checked' : '') + '><span><b>' + esc(label) + '</b></span></label>';

/** Små forhåndsvisninger av et valg, tegnet med elevens egen avatar. */
function tiles(key: 'hair' | 'top' | 'bottom' | 'shoes' | 'headwear', list: Opt[], crop: 'head' | 'full') {
  return '<div class="avtiles">' + list.map((o) => {
    const on = S.avatar[key] === o.id, bare = key === 'hair' || key === 'headwear';
    return '<button type="button" class="avtile' + (on ? ' on' : '') + '" aria-pressed="' + on + '" data-k="' + key + '" data-s="' + o.id + '">' +
      avatarSVG({ ...S.avatar, [key]: o.id, ...(key === 'hair' ? { headwear: 'ingen' } : {}), eq: bare ? {} : S.avatar.eq }, { crop }) + '<span>' + esc(o.name) + '</span></button>';
  }).join('') + '</div>';
}

function section(title: string, body: string) { return '<div class="avsec"><h3>' + esc(title) + '</h3>' + body + '</div>'; }

// ---------- butikkene ----------
function card(k: Skin): string {
  const s = st(), bal = S.points - S.spent;
  const own = S.owned.has(k.id), worn = S.avatar.eq[k.slot] === k.id, can = bal >= k.price, armed = s.arm === k.id, here = k.theme === T.id || isMerch(k);
  let btn: string;
  if (own) btn = '<button class="btn' + (worn ? '' : ' primary') + '" type="button" data-wear="' + k.id + '">' + (worn ? 'Ta av' : 'Ta på') + '</button>';
  else if (!here) btn = '';
  else btn = '<button class="btn' + (armed ? ' primary' : '') + '" type="button" data-buy="' + k.id + '"' + (can && !s.busy ? '' : ' disabled') + '>' + (can ? (armed ? 'Bekreft kjøp' : 'Kjøp') : 'Mangler ' + (k.price - bal) + ' poeng') + '</button>';
  const ck = 'tint:' + k.id, tintOpen = s.open === ck;
  const tintBtn = own && k.tint ? '<button class="btn ghost" type="button" data-open="' + ck + '" aria-expanded="' + tintOpen + '">' + (tintOpen ? 'Ferdig' : 'Endre farge') + '</button>' : '';
  return '<article class="skin' + (worn ? ' worn' : '') + (isMerch(k) ? ' merch' : '') + (tintOpen ? ' wide' : '') + '"><div class="skinart">' +
    avatarSVG({ ...S.avatar, eq: { [k.slot]: k.id } }, { crop: k.slot === 'hat' || k.slot === 'face' ? 'head' : 'full' }) + '</div><div class="skininfo">' +
    '<h4>' + esc(k.name) + '</h4><p>' + esc(k.desc) + '</p><div class="pfoot"><span class="price">' + (own ? 'Eies' : k.price + ' poeng') + '</span><span class="tsub">' + esc(SLOT_NAMES[k.slot]) + (k.tint ? ' · kan fargelegges' : '') + '</span></div>' +
    (tintOpen ? colorField(ck, CLOTH_COLORS, 'Farge på ' + k.name.toLowerCase()) : '') + btn + tintBtn + '</div></article>';
}

function balHTML(note: string): string {
  const s = st();
  return '<div class="bal"><b>' + (S.points - S.spent) + '</b><span>poeng å bruke</span></div><p class="keyhint">' + note + '</p><p class="msg" aria-live="polite">' + esc(s.msg) + '</p>';
}
const notReady = '<p class="fb bad">Butikken er ikke klar ennå. Læreren må oppdatere databasen først.</p>';

function shopHTML(): string {
  if (!S.avaReady) return notReady;
  const here = SKINS.filter((k) => k.theme === T.id), other = SKINS.filter((k) => k.theme !== T.id && !isMerch(k) && S.owned.has(k.id));
  return balHTML('Kostymene kjøpes med de samme poengene som i ' + esc((T.modes.find((m) => m.id === 'shop') || { name: 'butikken' }).name) + '. Et kostyme du har kjøpt, er ditt for godt.') +
    '<div class="skins">' + here.map(card).join('') + '</div>' +
    (other.length ? '<h3 class="grp">Kostymer fra andre temaer</h3><div class="skins">' + other.map(card).join('') + '</div>' : '');
}

function merchHTML(): string {
  if (!S.avaReady) return notReady;
  const items = SKINS.filter(isMerch);
  const grp = (t: string, slots: Slot[]) => { const l = items.filter((k) => slots.includes(k.slot)); return l.length ? '<h3 class="grp">' + t + '</h3><div class="skins">' + l.map(card).join('') + '</div>' : ''; };
  return '<div class="cgbanner" aria-hidden="true"><span class="cglogo">CG</span><div><b>CRISPY-G</b><span>Offisiell merch · drakter, tracksuits og mer</span></div></div>' +
    balHTML('CRISPY-G-butikken finnes i alle temaer. Du betaler med poengene fra temaet du er i nå. Varer merket «kan fargelegges» får egen farge etter at du har kjøpt dem.') +
    grp('Drakter', ['outfit']) + grp('Overdeler', ['top']) + grp('Hodeplagg', ['hat']) + grp('Sko og tilbehør', ['feet', 'back', 'neck', 'hand', 'face']);
}

const bgStyle = (b: Background) => 'background-color:' + b.color + ';background-image:' + bgImage(b).replace(/"/g, "'") + ';background-size:' + Math.round(b.size * 0.75) + 'px';

function bgHTML(): string {
  const s = st(), bal = S.points - S.spent, cur = S.avatar.bg || '';
  const card = (b: Background) => {
    const own = b.price === 0 || S.owned.has(b.id), on = cur === b.id, can = bal >= b.price, armed = s.arm === b.id;
    let btn: string;
    if (own) btn = '<button class="btn' + (on ? '' : ' primary') + '" type="button" data-bg="' + b.id + '"' + (on ? ' aria-pressed="true"' : '') + '>' + (on ? 'I bruk' : 'Bruk') + '</button>';
    else if (!S.avaReady) btn = '';
    else btn = '<button class="btn' + (armed ? ' primary' : '') + '" type="button" data-bgbuy="' + b.id + '"' + (can && !s.busy ? '' : ' disabled') + '>' + (can ? (armed ? 'Bekreft kjøp' : 'Kjøp') : 'Mangler ' + (b.price - bal) + ' poeng') + '</button>';
    return '<article class="bgcard' + (on ? ' on' : '') + '"><div class="bgprev" style="' + bgStyle(b) + '"></div><h4>' + esc(b.name) + '</h4><span class="price">' + (b.price === 0 ? 'Gratis' : own ? 'Eies' : b.price + ' poeng') + '</span>' + btn + '</article>';
  };
  return balHTML('Bakgrunnen vises bak hele appen, i alle temaer. Noen er gratis, resten kjøpes med poeng.') +
    '<div class="row"><button class="btn' + (cur ? '' : ' primary') + '" type="button" data-bg=""' + (cur ? '' : ' aria-pressed="true"') + '>' + (cur ? 'Bruk vanlig bakgrunn' : 'Vanlig bakgrunn er i bruk') + '</button></div>' +
    BG_GROUPS.map((g) => '<h3 class="grp">' + g.name + '</h3><div class="bgs">' + BACKGROUNDS.filter((b) => b.group === g.id).map(card).join('') + '</div>').join('');
}

// ---------- skjermen ----------
export function renderAvatar(): void {
  const s = st(), p = panel(), a = S.avatar;
  let body = '';
  if (s.tab === 'kropp') body = section('Kjønn', chips('g', GENDERS, 'Kjønn')) + section('Hudfarge', colorField('skinC', SKIN_TONES, 'Hudfarge'));
  if (s.tab === 'har') body = section('Frisyre', tiles('hair', HAIR_STYLES, 'head')) + section('Hårfarge', colorField('hairC', HAIR_COLORS, 'Hårfarge')) +
    section('Hodeplagg', tiles('headwear', HEADWEAR, 'head') + (a.headwear !== 'ingen' ? colorField('headC', CLOTH_COLORS, 'Farge på hodeplagget') : ''));
  if (s.tab === 'ansikt') body = section('Øyne', chips('eyes', EYES, 'Øyne') + toggle('lashes', 'Øyevipper')) +
    section('Øyenfarge', a.eyes === 'glad' ? '<p class="keyhint">Glade øyne er lukket. Velg runde eller store øyne for å se øyenfargen.</p>' + colorField('eyeC', EYE_COLORS, 'Øyenfarge') : colorField('eyeC', EYE_COLORS, 'Øyenfarge')) +
    section('Munn', chips('mouth', MOUTHS, 'Munn')) + section('Fregner', toggle('freckles', 'Fregner'));
  if (s.tab === 'sminke') body = section('Leppestift', toggle('lips', 'Leppestift') + (a.lips ? colorField('lipC', LIP_COLORS, 'Farge på leppestiften') : '')) +
    section('Øyenskygge', toggle('shadow', 'Øyenskygge') + (a.shadow ? colorField('shadowC', SHADOW_COLORS, 'Farge på øyenskyggen') : '')) +
    section('Eyeliner', toggle('liner', 'Eyeliner')) +
    section('Rouge', toggle('blush', 'Rouge på kinnene') + (a.blush ? colorField('blushC', BLUSH_COLORS, 'Farge på rougen') : ''));
  if (s.tab === 'klaer') body = section('Overdel', tiles('top', TOPS, 'full') + colorField('topC', CLOTH_COLORS, 'Farge på overdelen')) +
    section('Underdel', tiles('bottom', BOTTOMS, 'full') + colorField('bottomC', CLOTH_COLORS, 'Farge på underdelen')) +
    section('Sko', tiles('shoes', SHOES, 'full') + colorField('shoesC', CLOTH_COLORS, 'Farge på skoene')) +
    (a.eq.outfit || a.eq.top || a.eq.feet ? '<p class="keyhint">Du har på deg noe fra butikken som dekker klærne. Ta det av under «Kostymer» eller «CRISPY-G» for å se klærne dine.</p>' : '');
  if (s.tab === 'kostymer') body = shopHTML();
  if (s.tab === 'merch') body = merchHTML();
  if (s.tab === 'bakgrunn') body = bgHTML();
  const sbg = bgById(a.bg);

  const worn = (Object.keys(a.eq) as Slot[]).map((k) => skinById(a.eq[k]!)?.name).filter(Boolean);
  p.innerHTML = head('avatar') +
    '<div class="avagrid"><div class="avastage"><div class="avabig' + (sbg ? ' withbg' : '') + '"' + (sbg ? ' style="' + bgStyle(sbg) + '"' : '') + '>' + avatarSVG(a, { cls: 'big', title: 'Avataren din', ariaHidden: false }) + '</div>' +
    '<p class="keyhint">' + (worn.length ? 'På deg: ' + esc(worn.join(', ')) + '.' : 'Ingen kostymer på.') + '</p>' +
    '<div class="row"><button class="btn" type="button" id="av-rand">Tilfeldig utseende</button></div></div>' +
    '<div class="avaopts"><div class="tabs avtabs" role="tablist" aria-label="Deler av avataren">' + TABS.map(([id, n]) => '<button class="tab' + (id === 'merch' ? ' cgtab' : '') + '" type="button" role="tab" data-tab="' + id + '" aria-selected="' + (s.tab === id) + '" aria-current="' + (s.tab === id) + '">' + n + '</button>').join('') + '</div>' +
    body + '</div></div>' +
    (a.made ? '' : '<p class="keyhint">Avataren lagres automatisk når du endrer noe. Den vises øverst i appen og dukker opp i troférommet.</p>');
  wire(p, s);
}

function wire(p: ReturnType<typeof panel>, s: AvaState) {
  p.querySelectorAll('[data-tab]').forEach((b: HTMLElement) => { b.onclick = () => { s.tab = b.dataset.tab as Tab; s.msg = ''; s.open = null; renderAvatar(); const t = p.querySelector('[data-tab="' + s.tab + '"]') as HTMLElement | null; if (t) t.focus({ preventScroll: true }); }; });
  p.querySelectorAll('.sw[data-c]').forEach((b: HTMLElement) => { b.onclick = () => set(patchC(b.dataset.ck!, b.dataset.c!), '.sw[data-ck="' + b.dataset.ck + '"][data-c="' + b.dataset.c + '"]'); });
  p.querySelectorAll('[data-open]').forEach((b: HTMLElement) => {
    b.onclick = () => {
      const ck = b.dataset.open!; s.open = s.open === ck ? null : ck; renderAvatar();
      const f = p.querySelector(s.open ? 'input[data-rgb="' + ck + '"]' : '[data-open="' + ck + '"]') as HTMLElement | null; if (f) f.focus({ preventScroll: true });
    };
  });
  p.querySelectorAll('input[data-rgb]').forEach((i: HTMLInputElement) => {
    const ck = i.dataset.rgb!, box: any = i.closest('.rgb');
    const read = () => toHex([0, 1, 2].map((n) => +(box.querySelector('input[data-ch="' + n + '"]') as HTMLInputElement).value));
    // Mens eleven drar: tegn bare forhåndsvisningen på nytt, så glidebryteren ikke mister grepet.
    i.oninput = () => {
      const h = read(), v = rgb(h);
      S.avatar = { ...S.avatar, ...patchC(ck, h), made: true };
      box.querySelector('.rgbswatch')!.setAttribute('style', 'background:' + h);
      box.querySelector('.rgbhex')!.textContent = h.toUpperCase();
      (box.querySelectorAll('input[data-ch]') as NodeListOf<HTMLInputElement>).forEach((r) => {
        const n = +r.dataset.ch!; (r.nextElementSibling as HTMLElement).textContent = String(v[n]);
        r.style.setProperty('--from', toHex(v.map((x, j) => (j === n ? 0 : x)))); r.style.setProperty('--to', toHex(v.map((x, j) => (j === n ? 255 : x))));
      });
      const own = p.querySelector('[data-cf="' + ck + '"] .sw.custom') as HTMLElement | null;
      if (own) { own.style.setProperty('--own', h); p.querySelectorAll('[data-cf="' + ck + '"] .sw').forEach((w: HTMLElement) => w.setAttribute('aria-checked', String(w === own))); }
      const big = p.querySelector('.avabig'); if (big) big.innerHTML = avatarSVG(S.avatar, { cls: 'big', title: 'Avataren din', ariaHidden: false });
      const art = box.closest('.skin')?.querySelector('.skinart'); const k = ck.startsWith('tint:') ? skinById(ck.slice(5)) : null;
      if (art && k) art.innerHTML = avatarSVG({ ...S.avatar, eq: { [k.slot]: k.id } }, { crop: k.slot === 'hat' || k.slot === 'face' ? 'head' : 'full' });
      hooks.refresh();
    };
    i.onchange = () => set(patchC(ck, read()), 'input[data-rgb="' + ck + '"][data-ch="' + i.dataset.ch + '"]');
  });
  p.querySelectorAll('[data-s]').forEach((b: HTMLElement) => { b.onclick = () => set({ [b.dataset.k!]: b.dataset.s } as Partial<AvatarCfg>, '[data-k="' + b.dataset.k + '"][data-s="' + b.dataset.s + '"]'); });
  p.querySelectorAll('input[data-t]').forEach((i: HTMLInputElement) => { i.onchange = () => set({ [i.dataset.t!]: i.checked } as Partial<AvatarCfg>, 'input[data-t="' + i.dataset.t + '"]'); });
  $('#av-rand').onclick = () => {
    const r = (n: number) => Math.floor(Math.random() * n), pick = <X>(l: X[]) => l[r(l.length)];
    set({ skinC: pick(SKIN_TONES).c, hair: pick(HAIR_STYLES).id, hairC: pick(HAIR_COLORS).c, eyes: pick(EYES).id as AvatarCfg['eyes'], eyeC: pick(EYE_COLORS).c, mouth: pick(MOUTHS).id as AvatarCfg['mouth'],
      top: pick(TOPS).id, topC: pick(CLOTH_COLORS).c, bottom: pick(BOTTOMS).id, bottomC: pick(CLOTH_COLORS).c, shoes: pick(SHOES).id, shoesC: pick(CLOTH_COLORS).c, freckles: Math.random() < 0.25 }, '#av-rand');
  };
  p.querySelectorAll('[data-wear]').forEach((b: HTMLElement) => {
    b.onclick = () => {
      const k = skinById(b.dataset.wear!)!, eq = { ...S.avatar.eq };
      if (eq[k.slot] === k.id) delete eq[k.slot]; else eq[k.slot] = k.id;
      set({ eq }, '[data-wear="' + k.id + '"]');
    };
  });
  p.querySelectorAll('[data-bg]').forEach((b: HTMLElement) => { b.onclick = () => set({ bg: b.dataset.bg || undefined }, '[data-bg="' + b.dataset.bg + '"]'); });
  let armTimer: number | undefined;
  p.querySelectorAll('[data-bgbuy]').forEach((b: HTMLElement) => {
    b.onclick = async () => {
      const k = bgById(b.dataset.bgbuy)!;
      if (s.busy || S.points - S.spent < k.price) return;
      clearTimeout(armTimer);
      if (s.arm !== k.id) {
        s.arm = k.id; s.msg = 'Trykk «Bekreft kjøp» for å bruke ' + k.price + ' poeng på bakgrunnen ' + k.name.toLowerCase() + '.';
        renderAvatar(); const a2 = p.querySelector('[data-bgbuy="' + k.id + '"]') as HTMLElement | null; if (a2) a2.focus({ preventScroll: true });
        armTimer = window.setTimeout(() => { if (S.mode === 'avatar' && s.arm === k.id) { s.arm = null; s.msg = ''; renderAvatar(); } }, 6000);
        return;
      }
      s.arm = null; s.busy = true; s.msg = 'Kjøper …'; renderAvatar();
      try {
        S.spent = await store.buySkin(T.id, k.id, k.price);
        S.owned.add(k.id);
        s.busy = false; s.msg = 'Bakgrunnen ' + k.name.toLowerCase() + ' er kjøpt og tatt i bruk.';
        set({ bg: k.id }, '[data-bg="' + k.id + '"]');
        toast(k.name + ' er kjøpt');
      } catch (e) {
        s.busy = false; s.msg = 'Kjøpet gikk ikke: ' + friendly(e); renderAvatar();
      }
    };
  });
  p.querySelectorAll('[data-buy]').forEach((b: HTMLElement) => {
    b.onclick = async () => {
      const k = skinById(b.dataset.buy!)!;
      if (s.busy || S.points - S.spent < k.price) return;
      clearTimeout(armTimer);
      if (s.arm !== k.id) {
        s.arm = k.id; s.msg = 'Trykk «Bekreft kjøp» for å bruke ' + k.price + ' poeng på ' + k.name + '.';
        renderAvatar(); const a2 = p.querySelector('[data-buy="' + k.id + '"]') as HTMLElement | null; if (a2) a2.focus({ preventScroll: true });
        armTimer = window.setTimeout(() => { if (S.mode === 'avatar' && s.arm === k.id) { s.arm = null; s.msg = ''; renderAvatar(); } }, 6000);
        return;
      }
      s.arm = null; s.busy = true; s.msg = 'Kjøper …'; renderAvatar();
      try {
        S.spent = await store.buySkin(T.id, k.id, k.price);
        S.owned.add(k.id);
        s.busy = false; s.msg = k.name + ' er kjøpt og tatt på.' + (k.tint ? ' Trykk «Endre farge» for å velge din egen farge.' : '');
        set({ eq: { ...S.avatar.eq, [k.slot]: k.id } }, '[data-wear="' + k.id + '"]');
        toast(k.name + ' er kjøpt');
      } catch (e) {
        s.busy = false; s.msg = 'Kjøpet gikk ikke: ' + friendly(e); renderAvatar();
      }
    };
  });
}
