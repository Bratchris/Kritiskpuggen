// Lekser: emner læreren har gitt klassen å mestre innen en dato. Fremgangen er kortene eleven kan i emnet
// og quizspørsmålene i emnet som er besvart riktig minst én gang. Samme utregning står i lærerrommet.
import { esc } from '../../lib/dom';
import { S, T, head, panel, focusMain, hooks, today, topicOf, type Homework } from '../core';
import { confetti } from '../juice';
import { topicProgress } from '../../lib/homework';

export const hwProgress = (h: Homework) => topicProgress(T, h.topic, S.known, S.qok);

/** Leksene i dette temaet, uten de som gikk ut for mer enn to uker siden. */
export function myHomework(): Homework[] {
  const old = new Date(); old.setDate(old.getDate() - 14);
  const cut = old.toISOString().slice(0, 10);
  return S.homework.filter((h) => h.theme === T.id && h.due >= cut && topicOf(h.topic)).sort((a, b) => a.due.localeCompare(b.due));
}
/** «i dag», «i morgen», «om 3 dager», «for 2 dager siden». */
export function dueText(due: string): string {
  const d = Math.round((Date.parse(due + 'T12:00:00') - Date.parse(today() + 'T12:00:00')) / 864e5);
  if (d === 0) return 'i dag';
  if (d === 1) return 'i morgen';
  if (d > 1) return 'om ' + d + ' dager';
  return d === -1 ? 'i går' : 'for ' + -d + ' dager siden';
}
const dateNo = (due: string) => new Date(due + 'T12:00:00').toLocaleDateString('nb-NO', { weekday: 'long', day: 'numeric', month: 'long' });

const SEEN = 'puggen-hw-done';
function celebrated(id: string): boolean {
  try { const r = JSON.parse(localStorage.getItem(SEEN) || '[]'); if (Array.isArray(r) && r.includes(id)) return true; localStorage.setItem(SEEN, JSON.stringify((Array.isArray(r) ? r : []).concat(id).slice(-50))); } catch { /* ignorer */ }
  return false;
}

function open(topic: string, mode: string): void {
  S.topic = topic; S.cur.kort = null; S.cur.quiz = null;
  hooks.open(mode);
}

export function renderLekser(): void {
  const p = panel(), list = myHomework();
  if (!list.length) {
    p.innerHTML = head('lekser') + '<div class="result"><p class="big">Ingen lekser</p><p>Når læreren gir klassen et emne å mestre, dukker det opp her med frist og fremdrift.</p></div>';
    return;
  }
  let party = false;
  p.innerHTML = head('lekser') + '<div class="hwlist">' + list.map((h) => {
    const pr = hwProgress(h), tp = topicOf(h.topic)!, late = !pr.done && h.due < today(), pc = Math.round(pr.pct * 100);
    if (pr.done && !celebrated(h.id)) party = true;
    return '<article class="hw' + (pr.done ? ' done' : '') + (late ? ' late' : '') + '">' +
      '<div class="hwtop"><div><span class="eyebrow">' + (pr.done ? 'Fullført' : late ? 'Fristen er gått ut' : 'Frist ' + esc(dueText(h.due))) + '</span><h3>' + esc(tp.name) + '</h3>' +
      '<span class="hwdue">' + esc(dateNo(h.due)) + '</span></div><span class="hwpct" aria-hidden="true">' + (pr.done ? '✓' : pc + '%') + '</span></div>' +
      '<div class="xpbar" role="progressbar" aria-label="' + esc(tp.name) + ': ' + pc + ' prosent" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pc + '"><i style="width:' + pc + '%"></i></div>' +
      '<div class="hwparts">' +
        '<button class="btn' + (pr.cards < pr.cardsOf ? ' primary' : '') + '" type="button" data-open="' + esc(h.topic) + ':kort"' + (pr.done ? '' : ' data-focus') + '>Kort ' + pr.cards + ' / ' + pr.cardsOf + '</button>' +
        '<button class="btn' + (pr.cards >= pr.cardsOf && pr.quiz < pr.quizOf ? ' primary' : '') + '" type="button" data-open="' + esc(h.topic) + ':quiz">Quiz ' + pr.quiz + ' / ' + pr.quizOf + '</button>' +
      '</div></article>';
  }).join('') + '</div><p class="keyhint">En lekse er fullført når du kan alle kortene i emnet og har svart riktig på hvert quizspørsmål minst én gang.</p>';
  p.querySelectorAll('[data-open]').forEach((b: HTMLElement) => { b.onclick = () => { const [t, m] = b.dataset.open!.split(':'); open(t, m); }; });
  if (party) confetti(3);
  focusMain();
}
