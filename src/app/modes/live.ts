// Live for eleven: læreren styrer quizen fra tavla, eleven svarer her. Appen spør databasen jevnlig
// (og lytter på sanntid når det virker). Fasiten kommer først når læreren viser svaret.
import { esc, toast } from '../../lib/dom';
import type { LiveState } from '../../lib/store';
import { S, head, panel, store, earnOnce, focusMain, hooks } from '../core';
import { confetti } from '../juice';

const LETTERS = ['A', 'B', 'C', 'D'];
let timer: number | undefined, stopListen: (() => void) | null = null, busy = false, sig = '';
let st: LiveState | null = null, sent: { id: string; idx: number; choice: number } | null = null, failed = false;

function stop(): void {
  if (timer) { clearInterval(timer); timer = undefined; }
  if (stopListen) { stopListen(); stopListen = null; }
}
async function poll(): Promise<void> {
  if (S.mode !== 'live') { stop(); return; }
  if (busy) return; busy = true;
  try { st = await store.liveState(true); failed = false; } catch { failed = true; }
  busy = false;
  if (S.mode === 'live') draw();
}

export function renderLive(): void {
  sig = '';
  panel().innerHTML = head('live') + '<p class="loading">Ser etter en live-quiz …</p>';
  stop();
  void poll();
  timer = window.setInterval(() => { void poll(); }, 1500);
  stopListen = store.liveListen(() => { void poll(); });
}

function draw(): void {
  const s = st;
  const mine = s && sent && sent.id === s.id && sent.idx === s.idx ? sent.choice : s?.my_choice ?? null;
  const key = !s ? 'none' + failed : [s.id, s.status, s.idx, mine, s.status === 'lobby' ? s.players : '', s.my_correct].join('|');
  if (key === sig) return;
  sig = key;
  const p = panel();
  if (s && s.status !== 'end') S.cur.liveDone = false;
  if (!s) {
    p.innerHTML = head('live') + '<div class="result live-wait"><span class="livepulse" aria-hidden="true"></span><p class="big">Ingen live-quiz akkurat nå</p><p>' + (failed ? 'Fikk ikke kontakt. Prøver igjen …' : 'Når læreren starter en live-quiz, kommer den opp her av seg selv. La siden stå åpen.') + '</p></div>';
    return;
  }
  const top = '<div class="livebar"><span class="livedot"><i aria-hidden="true"></i>Live</span><span>' + (s.idx >= 0 ? String(s.idx + 1).padStart(2, '0') + ' / ' + String(s.total).padStart(2, '0') : s.total + ' spørsmål') + '</span><span>' + s.players + ' med</span></div>';
  if (s.status === 'lobby') {
    p.innerHTML = top + '<div class="result live-wait"><span class="livepulse" aria-hidden="true"></span><p class="big">Du er med!</p><p>Se på tavla. Quizen starter når læreren trykker start.</p></div>';
    return;
  }
  if (s.status === 'end') {
    p.innerHTML = top + '<div class="result"><p class="big">Ferdig!</p><p>Du fikk <b>' + (s.score ?? 0) + ' poeng</b> og kom på <b>' + (s.rank ?? '–') + '. plass</b> av ' + s.players + '.</p><p>Se resultatet på tavla.</p></div>';
    if ((s.rank ?? 99) <= 3) confetti(3);
    S.cur.liveDone = true; hooks.afterLive();
    stop(); timer = window.setInterval(() => { void poll(); }, 5000);
    return;
  }
  const opts = s.opts || [];
  if (s.status === 'question') {
    if (mine !== null) {
      p.innerHTML = top + '<div class="result live-wait"><span class="lvchoice">' + LETTERS[mine % 4] + '</span><p class="big">Svaret er sendt</p><p>Vent på at læreren viser svaret.</p></div>';
      return;
    }
    const left = Math.max(0, s.left_ms ?? 0), all = s.time_limit * 1000;
    p.innerHTML = top + '<p class="qtext liveq">' + esc(s.q || '') + '</p>' +
      '<div class="timeline" aria-hidden="true"><i style="width:' + (left / all * 100).toFixed(1) + '%;transition-duration:' + left + 'ms"></i></div>' +
      '<div class="liveopts">' + opts.map((o, j) => '<button type="button" class="lvopt" data-j="' + j + '"' + (j === 0 ? ' data-focus' : '') + '><span class="lvl" aria-hidden="true">' + LETTERS[j % 4] + '</span><span>' + esc(o) + '</span></button>').join('') + '</div>';
    requestAnimationFrame(() => { const i = p.querySelector('.timeline i') as HTMLElement | null; if (i) i.style.width = '0%'; });
    const id = s.id, idx = s.idx;
    p.querySelectorAll('.lvopt').forEach((b: HTMLElement) => {
      b.onclick = async () => {
        const choice = +b.dataset.j!;
        sent = { id, idx, choice }; draw();
        try { if (!(await store.liveAnswer(id, idx, choice))) toast('Svaret kom for sent.'); } catch { toast('Fikk ikke sendt svaret. Sjekk nettet.'); sent = null; sig = ''; draw(); }
      };
    });
    focusMain();
    return;
  }
  // reveal
  const ok = s.my_correct === true, none = mine === null;
  if (ok) {
    // Litt vanlig XP for riktig svar, én gang per spørsmål. Live-poengene er bare for tavla.
    earnOnce('live:' + s.id + ':' + s.idx, 2);
    confetti(1);
  }
  p.innerHTML = top + '<div class="result liveres ' + (ok ? 'ok' : 'bad') + '"><p class="big">' + (none ? 'Du svarte ikke' : ok ? 'Riktig!' : 'Feil') + '</p>' +
    (ok ? '<p class="livepts">+' + (s.my_points ?? 0) + '</p>' : '') +
    '<p>Riktig svar: <b>' + (s.ci !== null ? '<span class="lvl">' + LETTERS[s.ci % 4] + '</span> ' + esc(opts[s.ci] || '') : '') + '</b></p>' +
    (s.e ? '<p class="keyhint">' + esc(s.e) + '</p>' : '') +
    '<p>Du har <b>' + (s.score ?? 0) + ' poeng</b> og er på <b>' + (s.rank ?? '–') + '. plass</b>.</p></div>';
}

/** Sjekker om læreren har startet en live-quiz, uten å bli med. Til banneret på startsiden. */
export async function liveRunning(): Promise<boolean> {
  try { const s = await store.liveState(false); return !!s && s.status !== 'end'; } catch { return false; }
}
