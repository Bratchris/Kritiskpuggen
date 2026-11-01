// Innstillinger som bare gjelder denne enheten: fargemodus, tekststørrelse og animasjoner.
// De lagres i nettleseren. Går lagringen ikke, brukes standardvalgene.

export type ColorMode = 'auto' | 'lys' | 'mork';
export interface Prefs { mode: ColorMode; text: 'normal' | 'stor'; motion: 'full' | 'rolig' }
const KEY = 'puggen-prefs';
const DEFAULTS: Prefs = { mode: 'auto', text: 'normal', motion: 'full' };

export function getPrefs(): Prefs {
  try {
    const r = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (r && typeof r === 'object') return {
      mode: ['auto', 'lys', 'mork'].includes(r.mode) ? r.mode : 'auto',
      text: r.text === 'stor' ? 'stor' : 'normal',
      motion: r.motion === 'rolig' ? 'rolig' : 'full',
    };
  } catch { /* bruker standard */ }
  return { ...DEFAULTS };
}

export function setPrefs(patch: Partial<Prefs>): Prefs {
  const p = { ...getPrefs(), ...patch };
  try { localStorage.setItem(KEY, JSON.stringify(p)); } catch { /* gjelder bare til siden lukkes */ }
  applyPrefs(p);
  return p;
}

/** Setter data-mode, data-text og data-motion på <html>. CSS-en leser dem. */
export function applyPrefs(p: Prefs = getPrefs()): void {
  const d = document.documentElement.dataset;
  if (p.mode === 'auto') delete d.mode; else d.mode = p.mode === 'mork' ? 'dark' : 'light';
  if (p.text === 'stor') d.text = 'stor'; else delete d.text;
  if (p.motion === 'rolig') d.motion = 'rolig'; else delete d.motion;
}
