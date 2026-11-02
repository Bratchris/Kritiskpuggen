// Tavla for live-quizen. Læreren velger tema, emne og tempo, viser spørsmålene på storskjerm og ser
// svarene komme inn i sanntid. Spørsmålene og fasiten sendes til databasen (live_start); elevene får
// aldri fasiten før læreren viser svaret.
import { esc, shuffle } from '../lib/dom';
import { supabase, friendly } from '../lib/supabase';
import { listenTicks } from '../lib/store';
import { THEMES, themeName } from '../themes';

interface Board {
  status: 'lobby' | 'question' | 'reveal' | 'end'; idx: number; total: number; time_limit: number; left_ms: number | null;
  counts: number[]; answered: number; players: number; names: string[]; top: { name: string; points: number }[];
}
interface LQ { q: string; opts: string[]; ci: number; e: string }

const LETTERS = ['A', 'B', 'C', 'D'];
let el: HTMLElement | null = null, sid = '', qs: LQ[] = [], b: Board | null = null, timer: number | undefined, unlisten: (() => void) | null = null;
let classId = '', classCode = '', themes: string[] = [], cfg = { theme: '', topic: 'alle', n: 10, secs: 20 }, err = '', sig = '', busy = false, deadline = 0;

/** Åpner tavla over lærerrommet. */
export function openLiveBoard(klass: { id: string; code: string; themes: string[] }): void {
  classId = klass.id; classCode = klass.code; themes = klass.themes; err = '';
  if (!themes.includes(cfg.theme)) { cfg.theme = themes[0]; cfg.topic = 'alle'; }
  el?.remove();
  el = document.createElement('div');
  el.className = 'liveboard'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-label', 'Live-quiz');
  document.body.appendChild(el); document.body.classList.add('noscroll');
  sid = ''; b = null; setup();
}

function close(): void {
  if (sid && b && b.status !== 'end') void supabase.rpc('live_set', { p_session: sid, p_status: 'end', p_idx: b.idx });
  stopLoop(); el?.remove(); el = null; document.body.classList.remove('noscroll');
  if (document.fullscreenElement) void document.exitFullscreen().catch(() => {});
}
function stopLoop(): void { if (timer) clearInterval(timer); timer = undefined; if (unlisten) unlisten(); unlisten = null; }

const pool = () => THEMES[cfg.theme].content.quiz.filter((q) => cfg.topic === 'alle' || q.t === cfg.topic);

function setup(): void {
  const T = THEMES[cfg.theme], max = pool().length;
  el!.innerHTML = '<div class="lbwrap lbsetup"><div class="lbtop"><span class="lbbrand"><i class="lbdot" aria-hidden="true"></i>Live</span><span class="lbtools"><button class="lbx" type="button" id="lb-x" aria-label="Lukk">✕</button></span></div>' +
    '<h2 class="lbbig">Ny live-quiz</h2><p class="muted">Elevene åpner Puggen og trykker <b>Live</b> (eller banneret på startsiden). Du viser tavla på storskjermen.</p>' +
    '<form id="lb-form" class="tform">' +
    (themes.length > 1 ? '<label class="afield"><span>Tema</span><select id="lb-theme">' + themes.map((t) => '<option value="' + t + '"' + (t === cfg.theme ? ' selected' : '') + '>' + esc(themeName(t)) + '</option>').join('') + '</select></label>' : '') +
    '<label class="afield"><span>Emne</span><select id="lb-topic"><option value="alle">Alle emner (' + T.content.quiz.length + ' spørsmål)</option>' + T.topics.map((t) => '<option value="' + t.k + '"' + (t.k === cfg.topic ? ' selected' : '') + '>' + esc(t.name) + ' (' + T.content.quiz.filter((q) => q.t === t.k).length + ' spørsmål)</option>').join('') + '</select></label>' +
    '<label class="afield"><span>Antall spørsmål</span><select id="lb-n">' + [5, 10, 15, 20].map((n) => '<option value="' + n + '"' + (n === cfg.n ? ' selected' : '') + (n > max && n !== 5 ? ' disabled' : '') + '>' + n + '</option>').join('') + '</select></label>' +
    '<label class="afield"><span>Tid per spørsmål</span><select id="lb-secs">' + [10, 20, 30, 45].map((n) => '<option value="' + n + '"' + (n === cfg.secs ? ' selected' : '') + '>' + n + ' sekunder</option>').join('') + '</select></label>' +
    '<div class="lbctl"><button class="lbgo" type="submit">Åpne lobbyen <span aria-hidden="true">→</span></button></div></form>' +
    (err ? '<p class="fb bad">' + esc(err) + '</p>' : '') + '</div>';
  el!.querySelector<HTMLElement>('#lb-x')!.onclick = close;
  const th = el!.querySelector('#lb-theme') as HTMLSelectElement | null;
  if (th) th.onchange = () => { cfg.theme = th.value; cfg.topic = 'alle'; setup(); };
  (el!.querySelector('#lb-topic') as HTMLSelectElement).onchange = (e) => { cfg.topic = (e.target as HTMLSelectElement).value; setup(); };
  (el!.querySelector('#lb-form') as HTMLFormElement).onsubmit = async (e) => {
    e.preventDefault();
    cfg.n = +(el!.querySelector('#lb-n') as HTMLSelectElement).value; cfg.secs = +(el!.querySelector('#lb-secs') as HTMLSelectElement).value;
    qs = shuffle(pool().slice()).slice(0, cfg.n).map((q) => {
      const opts = shuffle([q.a].concat(shuffle(q.w.slice()).slice(0, 3)));
      return { q: q.q, opts, ci: opts.indexOf(q.a), e: q.e };
    });
    if (!qs.length) { err = 'Fant ingen spørsmål i emnet.'; setup(); return; }
    const { data, error } = await supabase.rpc('live_start', { p_class: classId, p_theme: cfg.theme, p_questions: qs, p_time: cfg.secs });
    if (error) { err = /live_start|function/i.test(error.message || '') ? 'Kjør databaseoppdateringen for live og lekser først.' : friendly(error); setup(); return; }
    sid = String(data); err = ''; sig = '';
    stopLoop();
    timer = window.setInterval(() => { void tick(); }, 1000);
    unlisten = listenTicks(() => { void tick(); }, classId);
    void tick();
  };
}

async function set(status: Board['status'], idx: number): Promise<void> {
  const { error } = await supabase.rpc('live_set', { p_session: sid, p_status: status, p_idx: idx });
  if (error) { err = friendly(error); }
  sig = ''; await tick(true);
}

async function tick(force = false): Promise<void> {
  if (!el || !sid || (busy && !force)) return;
  busy = true;
  const { data, error } = await supabase.rpc('live_board', { p_session: sid });
  busy = false;
  if (error) { err = friendly(error); return; }
  b = data as Board;
  if (b.status === 'question') {
    deadline = Date.now() + (b.left_ms ?? 0);
    // Svaret vises av seg selv når tiden er ute eller alle har svart.
    if ((b.left_ms ?? 0) <= 0 || (b.players > 0 && b.answered >= b.players)) { void set('reveal', b.idx); return; }
  }
  draw();
}

function draw(): void {
  if (!el || !b) return;
  const key = [b.status, b.idx, b.answered, b.players, b.status === 'question' ? Math.ceil((deadline - Date.now()) / 1000) : '', err].join('|');
  if (key === sig) return; sig = key;
  const q = qs[b.idx], nn = (n: number) => String(n).padStart(2, '0');
  const head = '<div class="lbtop"><span class="lbbrand"><i class="lbdot" aria-hidden="true"></i>Live</span>' +
    '<span class="lbmeta">' + (b.idx >= 0 && b.status !== 'end' ? nn(b.idx + 1) + ' / ' + nn(b.total) : esc(themeName(cfg.theme))) + '</span><span class="lbmeta">' + b.players + ' med</span>' +
    '<span class="lbtools"><button class="lbx" type="button" id="lb-fs" aria-label="Fullskjerm" title="Fullskjerm">⤢</button><button class="lbx" type="button" id="lb-x" aria-label="Avslutt og lukk" title="Avslutt">✕</button></span></div>';
  const letter = (j: number) => '<span class="lbletter" aria-hidden="true">' + LETTERS[j] + '</span>';
  let h = '';
  if (b.status === 'lobby') {
    h = '<div class="lbcenter lblobby"><p class="lbkicker">Åpne Puggen og trykk Live</p><h2 class="lbbig">Bli med</h2>' +
      '<p class="lbcode"><span>Klassekode</span><b>' + esc(classCode) + '</b></p>' +
      '<div class="lbnames" aria-live="polite">' + (b.names.length ? b.names.map((n) => '<span>' + esc(n) + '</span>').join('') : '<span class="lbwait">Venter på elever</span>') + '</div>' +
      '<button class="lbgo" type="button" id="lb-next" data-focus>Start quizen <span aria-hidden="true">→</span></button></div>';
  } else if (b.status === 'question' && q) {
    const left = Math.max(0, deadline - Date.now()), secs = Math.ceil(left / 1000);
    h = '<div class="lbline" aria-hidden="true"><i style="width:' + (left / (b.time_limit * 1000) * 100).toFixed(2) + '%;transition-duration:' + left + 'ms"></i></div>' +
      '<div class="lbqrow"><p class="lbq">' + esc(q.q) + '</p><div class="lbstat"><b class="lbclock' + (secs <= 5 ? ' low' : '') + '">' + secs + '</b><span>sek</span><b class="lbcount">' + b.answered + '<small>/' + b.players + '</small></b><span>svar</span></div></div>' +
      '<ol class="lbopts">' + q.opts.map((o, j) => '<li>' + letter(j) + '<span>' + esc(o) + '</span></li>').join('') + '</ol>' +
      '<div class="lbctl"><button class="lbghost" type="button" id="lb-reveal">Vis svaret nå</button></div>';
  } else if (b.status === 'reveal' && q) {
    const tot = Math.max(1, b.counts.reduce((x, y) => x + y, 0));
    h = '<div class="lbqrow"><p class="lbq small">' + esc(q.q) + '</p></div>' +
      '<ol class="lbopts lbshow">' + q.opts.map((o, j) => { const c = b!.counts[j] || 0, pc = Math.round(c / tot * 100); return '<li class="' + (j === q.ci ? 'right' : 'wrong') + '"><i class="lbfill" style="width:' + pc + '%"></i>' + letter(j) + '<span>' + esc(o) + '</span><b class="lbn">' + c + '<small>' + pc + ' %</small></b></li>'; }).join('') + '</ol>' +
      '<div class="lbafter"><p class="lbexp">' + esc(q.e) + '</p>' + topList() + '</div>' +
      '<div class="lbctl"><button class="lbghost" type="button" id="lb-end">Avslutt</button><button class="lbgo" type="button" id="lb-next" data-focus>' + (b.idx + 1 >= b.total ? 'Se resultatet' : 'Neste spørsmål') + ' <span aria-hidden="true">→</span></button></div>';
  } else {
    const t = b.top;
    h = '<div class="lbcenter lbfinal"><p class="lbkicker">Resultat</p><h2 class="lbbig">' + (t[0] ? esc(t[0].name) : 'Ferdig') + '</h2>' +
      (t.length ? '<ol class="lbfinal-list">' + t.map((x, i) => '<li class="r' + (i + 1) + '"><span class="lbpos">' + nn(i + 1) + '</span><b>' + esc(x.name) + '</b><span class="lbpts">' + x.points + '</span></li>').join('') + '</ol>' : '<p class="lbwait">Ingen svarte.</p>') +
      '<div class="lbctl"><button class="lbghost" type="button" id="lb-close">Lukk tavla</button><button class="lbgo" type="button" id="lb-again">Ny quiz <span aria-hidden="true">→</span></button></div></div>';
    if (t.length) import('../app/juice').then((j) => j.confetti(2)).catch(() => {});
    stopLoop();
  }
  el.innerHTML = '<div class="lbwrap">' + head + h + (err ? '<p class="fb bad">' + esc(err) + '</p>' : '') + '</div>';
  const on = (id: string, f: () => void) => { const x = el!.querySelector<HTMLElement>('#' + id); if (x) x.onclick = f; };
  on('lb-x', close); on('lb-close', close);
  on('lb-fs', () => { if (document.fullscreenElement) void document.exitFullscreen(); else void el!.requestFullscreen?.().catch(() => {}); });
  on('lb-next', () => { void set(b!.status === 'reveal' && b!.idx + 1 >= b!.total ? 'end' : 'question', b!.status === 'reveal' && b!.idx + 1 >= b!.total ? b!.idx : b!.idx + 1); });
  on('lb-reveal', () => { void set('reveal', b!.idx); });
  on('lb-end', () => { void set('end', b!.idx); });
  on('lb-again', () => { sid = ''; b = null; setup(); });
  const line = el.querySelector<HTMLElement>('.lbline i');
  if (line) requestAnimationFrame(() => requestAnimationFrame(() => { line.style.width = '0%'; }));
  const f = el.querySelector<HTMLElement>('[data-focus]'); if (f) f.focus({ preventScroll: true });
}
function topList(): string {
  if (!b || !b.top.length) return '';
  return '<ol class="lbtop5" aria-label="Topp 5">' + b.top.map((x, i) => '<li><span class="lbpos">' + (i + 1) + '</span><b>' + esc(x.name) + '</b><span class="lbpts">' + x.points + '</span></li>').join('') + '</ol>';
}

document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && el && !document.fullscreenElement && (!sid || b?.status === 'end')) close(); });
