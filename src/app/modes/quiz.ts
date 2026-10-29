import { $, esc, shuffle } from '../../lib/dom';
import { S, T, head, tag, inTopic, focusMain, panel, verdict, addPoints, track, mark } from '../core';

function start() {
  const qs = shuffle(T.content.quiz.filter(inTopic)).slice(0, 10).map((q) => { const opts = shuffle([q.a].concat(q.w)); return { t: q.t, q: q.q, e: q.e, opts, ci: opts.indexOf(q.a) }; });
  S.cur.quiz = { qs, i: 0, score: 0, pick: null };
}
export function renderQuiz(): void {
  if (!S.cur.quiz) start();
  const z = S.cur.quiz, p = panel();
  if (z.i >= z.qs.length) {
    p.innerHTML = head('quiz') + '<div class="result"><p class="big">' + z.score + ' av ' + z.qs.length + ' riktige</p><p>' + verdict(z.score, z.qs.length) + '</p><button class="btn primary" data-focus id="q-new" type="button">Ny runde</button></div>';
    $('#q-new').onclick = () => { start(); renderQuiz(); };
    focusMain(); return;
  }
  const q = z.qs[z.i], done = z.pick !== null;
  p.innerHTML = head('quiz') + '<div class="meta">' + tag(q.t) + '<span class="count">Spørsmål ' + (z.i + 1) + ' av ' + z.qs.length + '</span></div>' +
    '<p class="qtext">' + esc(q.q) + '</p><div class="opts">' +
    q.opts.map((o: string, j: number) => { let cls = 'opt'; if (done) { if (j === q.ci) cls += ' ok'; else if (j === z.pick) cls += ' bad'; } return '<button class="' + cls + '" data-j="' + j + '" type="button"' + (done ? ' disabled' : '') + '><span class="letter">' + 'ABCD'[j] + '</span><span>' + esc(o) + '</span></button>'; }).join('') + '</div>' +
    (done ? '<div class="fb ' + (z.pick === q.ci ? 'ok' : 'bad') + '"><strong>' + (z.pick === q.ci ? 'Riktig.' : 'Ikke helt.') + '</strong>' + esc(q.e) + '</div><div class="row"><button class="btn primary" data-focus id="q-next" type="button">' + (z.i + 1 >= z.qs.length ? 'Se resultat' : 'Neste') + '</button></div>' : '');
  if (!done) {
    mark();
    p.querySelectorAll('.opt').forEach((b: HTMLElement) => { b.onclick = () => { z.pick = +b.dataset.j!; track(z.pick === q.ci); if (z.pick === q.ci) { z.score++; addPoints(2); } renderQuiz(); }; });
  } else {
    $('#q-next').onclick = () => { z.i++; z.pick = null; renderQuiz(); };
    focusMain();
  }
}
