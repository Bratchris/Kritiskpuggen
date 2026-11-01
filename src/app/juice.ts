// Små belønninger i grensesnittet: konfetti, «+XP» som flyr opp, rekke-teller og stjerner på resultatene.
// Alt slås av når eleven har valgt rolige animasjoner.
import { getPrefs } from '../lib/prefs';

const calm = () => getPrefs().motion === 'rolig' || (typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches);

// Husker hvor eleven sist trykket, så «+XP» kan fly opp derfra.
let lastX = -1, lastY = -1;
if (typeof document !== 'undefined') document.addEventListener('pointerdown', (e) => { lastX = e.clientX; lastY = e.clientY; }, true);

/** «+2 XP» som stiger opp fra der eleven trykket, og en liten puls på poengknappen. */
export function floatXP(n: number): void {
  const chip = document.getElementById('h-pts');
  if (chip) { chip.classList.remove('bump'); void chip.offsetWidth; chip.classList.add('bump'); }
  if (calm() || n <= 0) return;
  const el = document.createElement('div');
  el.className = 'xpfloat'; el.setAttribute('aria-hidden', 'true');
  el.textContent = '+' + n + ' XP';
  const x = lastX >= 0 ? lastX : innerWidth / 2, y = lastY >= 0 ? lastY : innerHeight / 2;
  el.style.left = x + 'px'; el.style.top = y + 'px';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1100);
}

/** Konfetti over hele skjermen. power 1 = liten feiring, 3 = stor. */
export function confetti(power = 2): void {
  if (calm()) return;
  const cv = document.createElement('canvas');
  cv.className = 'confetti'; cv.setAttribute('aria-hidden', 'true');
  const dpr = Math.min(2, devicePixelRatio || 1);
  cv.width = innerWidth * dpr; cv.height = innerHeight * dpr;
  document.body.appendChild(cv);
  const g = cv.getContext('2d'); if (!g) { cv.remove(); return; }
  g.scale(dpr, dpr);
  const colors = ['#ffd25a', '#ff6b6b', '#4fae6b', '#2e86c1', '#b06bff', '#ff9c4a', '#62f4ff'];
  const n = 50 * power, parts = Array.from({ length: n }, (_, i) => {
    const fromLeft = i % 2 === 0, a = (fromLeft ? -60 : -120) * Math.PI / 180 + (Math.random() - 0.5) * 0.9, v = 9 + Math.random() * 9;
    return { x: fromLeft ? 0 : innerWidth, y: innerHeight * 0.75, vx: Math.cos(a) * v, vy: Math.sin(a) * v, r: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.4, w: 6 + Math.random() * 6, h: 4 + Math.random() * 6, c: colors[i % colors.length] };
  });
  const t0 = performance.now();
  const step = (t: number) => {
    const dt = t - t0;
    g.clearRect(0, 0, innerWidth, innerHeight);
    for (const p of parts) {
      p.vy += 0.32; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.r += p.vr;
      g.save(); g.translate(p.x, p.y); g.rotate(p.r); g.globalAlpha = Math.max(0, 1 - dt / 2400); g.fillStyle = p.c; g.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); g.restore();
    }
    if (dt < 2400) requestAnimationFrame(step); else cv.remove();
  };
  requestAnimationFrame(step);
}

/** Én til tre stjerner for en runde. Tre stjerner = alt riktig. */
export function starsFor(score: number, total: number): number { const r = total ? score / total : 0; return r >= 1 ? 3 : r >= 0.7 ? 2 : r >= 0.4 ? 1 : 0; }
export function resultStars(score: number, total: number): string {
  const n = starsFor(score, total);
  if (n === 3) setTimeout(() => confetti(2), 250);
  const star = (on: boolean, i: number) => '<svg class="rstar' + (on ? ' on' : '') + '" style="animation-delay:' + (0.15 + i * 0.22) + 's" viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2.5 2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5-4.8-4.6 6.6-.9z"/></svg>';
  return '<div class="rstars" role="img" aria-label="' + n + ' av 3 stjerner">' + [0, 1, 2].map((i) => star(i < n, i)).join('') + '</div>';
}

/** Rekke-teller nederst på skjermen: vises fra tre riktige på rad. */
let comboT: number | undefined;
export function showCombo(n: number): void {
  let el = document.getElementById('combo');
  if (n < 3) { if (el) el.classList.add('gone'); return; }
  if (!el) { el = document.createElement('div'); el.id = 'combo'; el.setAttribute('role', 'status'); document.body.appendChild(el); }
  clearTimeout(comboT); comboT = window.setTimeout(() => el!.classList.add('gone'), 3500);
  el.className = 'combo' + (n >= 10 ? ' hot' : n >= 5 ? ' warm' : '');
  el.innerHTML = '<span class="flame" aria-hidden="true"></span><b>' + n + '</b> på rad';
  el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump');
  if (n === 5 || n === 10 || n === 20) confetti(n >= 10 ? 2 : 1);
}

/** Stort varsel med flamme, for dagens mål og lange rekker. */
export function celebrate(title: string, sub: string): void {
  confetti(3);
  const el = document.createElement('div');
  el.className = 'achpop goalpop'; el.setAttribute('role', 'status');
  el.innerHTML = '<span class="bigflame" aria-hidden="true"></span><div class="achtxt"><span class="eyebrow">Bra jobba!</span><b>' + title + '</b><span>' + sub + '</span></div><button class="achx" type="button" aria-label="Lukk">×</button>';
  document.body.appendChild(el);
  const close = () => { el.classList.add('out'); setTimeout(() => el.remove(), 260); };
  el.querySelector('.achx')!.addEventListener('click', close);
  setTimeout(close, 5000);
}

/** Teller et tall opp fra forrige verdi, så poengene «ruller». */
const shown = new WeakMap<Element, number>();
export function countTo(el: Element, to: number): void {
  const from = shown.get(el);
  shown.set(el, to);
  if (from === undefined || from === to || calm()) { el.textContent = String(to); return; }
  const t0 = performance.now(), d = 600;
  const step = (t: number) => { const k = Math.min(1, (t - t0) / d); el.textContent = String(Math.round(from + (to - from) * (1 - Math.pow(1 - k, 3)))); if (k < 1 && shown.get(el) === to) requestAnimationFrame(step); };
  requestAnimationFrame(step);
}
