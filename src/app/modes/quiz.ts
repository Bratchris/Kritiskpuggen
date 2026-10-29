import { $, esc, shuffle } from '../../lib/dom';
import { S, T, head, tag, inTopic, focusMain, panel, verdict, track, mark, earnOnce, earnedToday, readLock } from '../core';

const XP = 2;
const key = (idx: number) => 'quiz:' + idx;

function start() {
  // Spørsmål som ikke har gitt poeng i dag, kommer først. Rekkefølgen innenfor hver gruppe er tilfeldig.
  const pool = shuffle(T.content.quiz.map((q, idx) => ({ q, idx })).filter((x) => inTopic(x.q)));
  pool.sort((a, b) => Number(earnedToday(key(a.idx))) - Number(earnedToday(key(b.idx))));
  const qs = pool.slice(0, 10).map(({ q, idx }) => { const opts = shuffle([q.a].concat(q.w)); return { idx, t: q.t, q: q.q, e: q.e, opts, ci: opts.indexOf(q.a), got: 0 }; });
  S.cur.quiz = { qs, i: 0, score: 0, pts: 0, pick: null };
}

/** Hvor mange spørsmål i utvalget som fortsatt kan gi poeng i dag. */
function leftToday(): { left: number; total: number } {
  const all = T.content.quiz.map((q, idx) => ({ q, idx })).filter((x) => inTopic(x.q));
  return { left: all.filter((x) => !earnedToday(key(x.idx))).length, total: all.length };
}

export function renderQuiz(): void {
  if (!S.cur.quiz) start();
  const z = S.cur.quiz, p = panel();
  if (z.i >= z.qs.length) {
    const { left } = leftToday();
    const note = left === 0
      ? '<p class="fb">Du har fått poeng for alle quizspørsmålene ' + (S.topic === 'alle' ? '' : 'i dette emnet ') + 'i dag. Øv gjerne videre, men nye poeng får du i morgen' + (S.topic === 'alle' ? '' : ', i andre emner') + ' eller i de andre spillene.</p>'
      : '<p class="keyhint">' + left + ' quizspørsmål kan fortsatt gi poeng i dag.</p>';
    p.innerHTML = head('quiz') + '<div class="result"><p class="big">' + z.score + ' av ' + z.qs.length + ' riktige</p><p>' + verdict(z.score, z.qs.length) + ' Du fikk ' + z.pts + ' poeng.</p>' + note +
      '<button class="btn primary" data-focus id="q-new" type="button">Ny runde</button></div>';
    $('#q-new').onclick = () => { start(); renderQuiz(); };
    focusMain(); return;
  }
  const q = z.qs[z.i], done = z.pick !== null, ok = done && z.pick === q.ci;
  const fbHead = !done ? '' : ok ? (q.got ? 'Riktig. +' + q.got + ' poeng.' : 'Riktig. Du har allerede fått poeng for dette spørsmålet i dag.') : 'Ikke helt.';
  const repeat = !done && earnedToday(key(q.idx)) ? '<span class="count repeat">Gir ikke poeng i dag</span>' : '';
  p.innerHTML = head('quiz') + '<div class="meta">' + tag(q.t) + '<span class="count">Spørsmål ' + (z.i + 1) + ' av ' + z.qs.length + '</span></div>' +
    '<p class="qtext">' + esc(q.q) + '</p>' + (repeat ? '<p class="meta" style="margin:-8px 0 10px">' + repeat + '</p>' : '') + '<div class="opts">' +
    q.opts.map((o: string, j: number) => { let cls = 'opt'; if (done) { if (j === q.ci) cls += ' ok'; else if (j === z.pick) cls += ' bad'; } return '<button class="' + cls + '" data-j="' + j + '" type="button"' + (done ? ' disabled' : '') + '><span class="letter">' + 'ABCD'[j] + '</span><span>' + esc(o) + '</span></button>'; }).join('') + '</div>' +
    (done ? '<div class="fb ' + (ok ? 'ok' : 'bad') + '"><strong>' + fbHead + '</strong>' + esc(q.e) + '</div><div class="row"><button class="btn primary" data-focus id="q-next" type="button">' + (z.i + 1 >= z.qs.length ? 'Se resultat' : 'Neste') + '</button></div>' : '');
  if (!done) {
    mark();
    readLock('.opt', q);
    p.querySelectorAll('.opt').forEach((b: HTMLElement) => {
      b.onclick = () => {
        if ((b as HTMLButtonElement).disabled) return;
        z.pick = +b.dataset.j!;
        track(z.pick === q.ci);
        if (z.pick === q.ci) { z.score++; q.got = earnOnce(key(q.idx), XP); z.pts += q.got; }
        renderQuiz();
      };
    });
  } else {
    $('#q-next').onclick = () => { z.i++; z.pick = null; renderQuiz(); };
    focusMain();
  }
}
