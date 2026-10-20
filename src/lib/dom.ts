// Små DOM-hjelpere. $ returnerer any med vilje: sidene bygges med maler og hentes opp igjen med id.
export const $ = (s: string, el?: ParentNode): any => (el || document).querySelector(s);
export const $$ = (s: string, el?: ParentNode): HTMLElement[] => Array.from((el || document).querySelectorAll<HTMLElement>(s));
export function esc(s: unknown): string {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' } as Record<string, string>)[c]);
}
export function shuffle<T>(a: T[]): T[] {
  a = a.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; }
  return a;
}
export function norm(s: string): string { return String(s).toLowerCase().replace(/[«»"“”.,!?]/g, '').replace(/\s+/g, ' ').trim(); }
export function fmtDate(t: string | number): string {
  const d = new Date(t);
  return d.toLocaleDateString('nb-NO', { day: 'numeric', month: 'short' }) + ' kl. ' + d.toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' });
}
let toastT: number | undefined;
export function toast(msg: string): void {
  const el = $('#toast'); if (!el) return;
  el.textContent = msg; el.classList.add('show'); clearTimeout(toastT);
  toastT = window.setTimeout(() => el.classList.remove('show'), 2200);
}
