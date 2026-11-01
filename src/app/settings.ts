// Innstillinger: fargemodus, bakgrunn, tekststørrelse, animasjoner, bytte fag og logge ut.
import { esc, toast } from '../lib/dom';
import { S, T, store, panel, hooks } from './core';
import { getPrefs, setPrefs, GOALS, type Prefs } from '../lib/prefs';
import { icon } from './icons';
import { showPrivacy, downloadJSON, exportMine } from '../privacy';
import { BACKGROUNDS, bgById, bgImage, bgFit, applyBackground, type Background } from '../avatar/backgrounds';

export interface SettingsActions {
  who: string;
  switchTheme?: () => void;
  logout?: () => void;
  exitPreview?: () => void;
  /** Bare i lærerens forhåndsvisning. */
  unlockAll?: () => Promise<void> | void;
  unlocked?: () => boolean;
  reset?: () => void;
}
let A: SettingsActions = { who: '' };
export function setSettingsActions(a: SettingsActions): void { A = a; }

const seg = <K extends keyof Prefs>(key: K, label: string, opts: [Prefs[K], string, string?][]) => {
  const cur = getPrefs()[key];
  return '<div class="setrow"><span class="setlabel">' + esc(label) + '</span><div class="seg" role="radiogroup" aria-label="' + esc(label) + '">' + opts.map(([v, n, ic]) =>
    '<button type="button" role="radio" aria-checked="' + (cur === v) + '" data-pref="' + key + '" data-v="' + v + '">' + (ic ? icon(ic) : '') + esc(n) + '</button>').join('') + '</div></div>';
};

function bgThumb(b: Background | null): string {
  if (!b) return '<span class="bgthumb plain" aria-hidden="true"></span>';
  const f = bgFit(b, 0.4);
  return '<span class="bgthumb" aria-hidden="true" style="background-color:' + b.color + ';background-image:' + bgImage(b).replace(/"/g, "'") + ';background-size:' + f.size + ';background-repeat:' + f.repeat + ';background-position:' + f.pos + (b.pixel ? ';image-rendering:pixelated' : '') + '"></span>';
}

export function renderSettings(): void {
  const p = panel(), cur = S.avatar.bg || '';
  const mine = BACKGROUNDS.filter((b) => b.price === 0 || S.owned.has(b.id));
  const shopName = (T.modes.find((m) => m.id === 'shop') || { name: 'butikken' }).name;
  p.innerHTML = '<div class="phead"><h2>Innstillinger</h2><p>' + esc(A.who) + '</p></div>' +
    '<section class="setsec"><h3>Utseende</h3>' +
      seg('mode', 'Fargemodus', [['auto', 'Automatisk', 'auto'], ['lys', 'Lys', 'lys'], ['mork', 'Mørk', 'mork']]) +
      seg('text', 'Tekststørrelse', [['normal', 'Normal'], ['stor', 'Stor']]) +
      seg('motion', 'Animasjoner', [['full', 'På'], ['rolig', 'Rolig']]) +
    '</section>' +
    '<section class="setsec"><h3>Dagens mål</h3><p class="keyhint">Når du når målet, vokser rekka di med én dag.</p>' + seg('goal', 'XP per dag', GOALS.map((g, i) => [g, ['Lett', 'Vanlig', 'Seriøs', 'Intens'][i] + ' ' + g] as [number, string])) + '</section>' +
    '<section class="setsec"><h3>Bakgrunn</h3><p class="keyhint">Bakgrunnene du eier. Flere finnes i butikken.</p><div class="bgpick">' +
      '<button type="button" class="bgopt' + (cur ? '' : ' on') + '" data-setbg="" aria-pressed="' + !cur + '">' + bgThumb(null) + '<span>Vanlig</span></button>' +
      mine.map((b) => '<button type="button" class="bgopt' + (cur === b.id ? ' on' : '') + '" data-setbg="' + b.id + '" aria-pressed="' + (cur === b.id) + '">' + bgThumb(b) + '<span>' + esc(b.name) + '</span></button>').join('') +
    '</div><div class="row"><button class="btn" type="button" data-go="avatar:bakgrunn">' + icon('butikk') + 'Kjøp flere bakgrunner</button></div></section>' +
    '<section class="setsec"><h3>Profil</h3><div class="setlinks">' +
      '<button type="button" class="setlink" data-go="avatar:kropp">' + icon('person') + '<span><b>Endre avataren</b><span>Kropp, hår, ansikt, sminke og klær</span></span></button>' +
      '<button type="button" class="setlink" data-go="avatar:garderobe">' + icon('butikk') + '<span><b>Garderoben</b><span>Kostymer og merch du eier</span></span></button>' +
      '<button type="button" class="setlink" data-go="avatar:dyr">' + icon('dyr') + '<span><b>Dyr og egg</b><span>Klekk egg og velg dyret ved avataren</span></span></button>' +
    '</div></section>' +
    '<section class="setsec"><h3>Personvern og data</h3><p class="keyhint">Se hva som lagres om deg, og last ned alt sammen som en fil.</p><div class="row"><button class="btn" type="button" id="set-priv">Les om personvern</button><button class="btn" type="button" id="set-export">Last ned dataene mine</button></div><p class="msg" id="set-exmsg" aria-live="polite"></p></section>' +
    '<section class="setsec"><h3>Konto</h3><div class="row">' +
      (A.switchTheme ? '<button class="btn" type="button" id="set-theme">Bytt fag</button>' : '') +
      (A.exitPreview ? '<button class="btn" type="button" id="set-exit">Tilbake til lærerrommet</button>' : '') +
      (A.logout ? '<button class="btn" type="button" id="set-out">Logg ut</button>' : '') +
    '</div></section>' +
    (A.unlockAll || A.reset ? '<section class="setsec preview"><h3>Forhåndsvisning for læreren</h3><p class="keyhint">Poeng, gaver og dyr lagres bare i denne nettleseren.</p><div class="row">' +
      (A.unlockAll ? (A.unlocked && A.unlocked() ? '<span class="unlocked">Alt er låst opp</span>' : '<button class="btn" type="button" id="set-unlock">Lås opp alt</button>') : '') +
      (A.reset ? '<span id="reset-slot"><button class="btn ghost" type="button" id="set-reset">Nullstill forhåndsvisningen</button></span>' : '') +
    '</div></section>' : '') +
    '<section class="setsec about"><h3>Om innholdet</h3><p class="keyhint">' + esc(T.sources) + '</p><p class="keyhint">Godteriet og gavene i ' + esc(shopName.toLowerCase()) + ' er digitale og går til læreren din.</p></section>';

  p.querySelectorAll('[data-pref]').forEach((b: HTMLElement) => {
    b.onclick = () => { const k = b.dataset.pref!, v = k === 'goal' ? Number(b.dataset.v) : b.dataset.v; setPrefs({ [k]: v } as Partial<Prefs>); hooks.refresh(); renderSettings(); (panel().querySelector('[data-pref="' + b.dataset.pref + '"][data-v="' + b.dataset.v + '"]') as HTMLElement | null)?.focus({ preventScroll: true }); };
  });
  p.querySelectorAll('[data-setbg]').forEach((b: HTMLElement) => {
    b.onclick = () => {
      const id = b.dataset.setbg || undefined;
      if (id && !bgById(id)) return;
      S.avatar = { ...S.avatar, bg: id };
      store.saveAvatar(S.avatar); applyBackground(id); hooks.refresh(); renderSettings();
      (panel().querySelector('[data-setbg="' + (id || '') + '"]') as HTMLElement | null)?.focus({ preventScroll: true });
    };
  });
  p.querySelectorAll('[data-go]').forEach((b: HTMLElement) => { b.onclick = () => { const [m, t] = b.dataset.go!.split(':'); hooks.open(m, t); }; });
  const on = (id: string, f?: () => void) => { const b = p.querySelector('#' + id) as HTMLElement | null; if (b && f) b.onclick = f; };
  on('set-priv', () => showPrivacy());
  on('set-export', async () => {
    const m = p.querySelector('#set-exmsg') as HTMLElement; m.textContent = 'Henter …';
    try { downloadJSON('puggen-mine-data.json', await exportMine(store.kind === 'preview')); m.textContent = 'Filen er lastet ned.'; }
    catch { m.textContent = 'Fikk ikke hentet dataene. Prøv igjen.'; }
  });
  on('set-theme', A.switchTheme); on('set-exit', A.exitPreview); on('set-out', A.logout);
  on('set-unlock', A.unlockAll ? async () => { await A.unlockAll!(); toast('Alle nivåer, trofeer og rom er låst opp i forhåndsvisningen.'); renderSettings(); } : undefined);
  on('set-reset', A.reset ? () => {
    const slot = p.querySelector('#reset-slot')!;
    slot.innerHTML = '<span>Slette poeng, gaver og rom?</span> <button class="btn" type="button" id="r-yes">Ja, nullstill</button> <button class="btn ghost" type="button" id="r-no">Avbryt</button>';
    (slot.querySelector('#r-yes') as HTMLElement).onclick = A.reset!;
    (slot.querySelector('#r-no') as HTMLElement).onclick = () => renderSettings();
  } : undefined);
}
