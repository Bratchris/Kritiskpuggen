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

const SHAPES = ['▲', '◆', '●', '■'];
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
  el!.innerHTML = '<div class="lbwrap lbsetup"><div class="lbtop"><span class="livedot">LIVE</span><button class="lbx" type="button" id="lb-x" aria-label="Lukk">✕</button></div>' +
    '<h2>Start en live-quiz</h2><p class="muted">Elevene åpner Puggen og trykker <b>Live</b> (eller banneret på startsiden). Du viser tavla på storskjermen.</p>' +
    '<form id="lb-form" class="tform">' +
    (themes.length > 1 ? '<label class="afield"><span>Tema</span><select id="lb-theme">' + themes.map((t) => '<option value="' + t + '"' + (t === cfg.theme ? ' selected' : '') + '>' + esc(themeName(t)) + '</option>').join('') + '</select></label>' : '') +
    '<label class="afield"><span>Emne</span><select id="lb-topic"><option value="alle">Alle emner (' + T.content.quiz.length + ' spørsmål)</option>' + T.topics.map((t) => '<option value="' + t.k + '"' + (t.k === cfg.topic ? ' selected' : '') + '>' + esc(t.name) + ' (' + T.content.quiz.filter((q) => q.t === t.k).length + ' spørsmål)</option>').join('') + '</select></label>' +
    '<label class="afield"><span>Antall spørsmål</span><select id="lb-n">' + [5, 10, 15, 20].map((n) => '<option value="' + n + '"' + (n === cfg.n ? ' selected' : '') + (n > max && n !== 5 ? ' disabled' : '') + '>' + n + '</option>').join('') + '</select></label>' +
    '<label class="afield"><span>Tid per spørsmål</span><select id="lb-secs">' + [10, 20, 30, 45].map((n) => '<option value="' + n + '"' + (n === cfg.secs ? ' selected' : '') + '>' + n + ' sekunder</option>').join('') + '</select></label>' +
    '<div class="row"><button class="btn primary big" type="submit">Åpne lobbyen</button></div></form>' +
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
  const q = qs[b.idx], head = '<div class="lbtop"><span class="livedot">LIVE</span><span class="lbmeta">' + (b.idx >= 0 ? 'Spørsmål ' + (b.idx + 1) + ' av ' + b.total : esc(themeName(cfg.theme))) + '</span><span class="lbmeta">' + b.players + ' med</span>' +
    '<button class="lbx" type="button" id="lb-fs" aria-label="Fullskjerm">⛶</button><button class="lbx" type="button" id="lb-x" aria-label="Avslutt og lukk">✕</button></div>';
  let h = '';
  if (b.status === 'lobby') {
    h = '<div class="lbcenter"><p class="lbjoin">Åpne <b>Puggen</b> og trykk <b>Live</b></p><p class="lbcode">Klassekode <b>' + esc(classCode) + '</b></p>' +
      '<div class="lbnames">' + (b.names.length ? b.names.map((n) => '<span class="pop">' + esc(n) + '</span>').join('') : '<span class="muted">Venter på elever …</span>') + '</div>' +
      '<button class="btn primary big" type="button" id="lb-next" data-focus>Start quizen</button></div>';
  } else if (b.status === 'question' && q) {
    const secs = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
    h = '<p class="lbq">' + esc(q.q) + '</p><div class="lbmid"><span class="lbclock' + (secs <= 5 ? ' low' : '') + '">' + secs + '</span><span class="lbans"><b>' + b.answered + '</b> av ' + b.players + ' har svart</span></div>' +
      '<div class="lbopts">' + q.opts.map((o, j) => '<div class="lbopt lv' + j + '"><span class="shape">' + SHAPES[j] + '</span>' + esc(o) + '</div>').join('') + '</div>' +
      '<div class="row lbctl"><button class="btn" type="button" id="lb-reveal">Vis svaret nå</button></div>';
  } else if (b.status === 'reveal' && q) {
    const max = Math.max(1, ...b.counts);
    h = '<p class="lbq">' + esc(q.q) + '</p><div class="lbbars">' + q.opts.map((o, j) => '<div class="lbbar lv' + j + (j === q.ci ? ' right' : ' wrong') + '"><b>' + (b!.counts[j] || 0) + '</b><i style="height:' + Math.round((b!.counts[j] || 0) / max * 100) + '%"></i><span><span class="shape">' + SHAPES[j] + '</span>' + (j === q.ci ? '✓ ' : '') + esc(o) + '</span></div>').join('') + '</div>' +
      '<p class="lbexp">' + esc(q.e) + '</p>' + topList() +
      '<div class="row lbctl"><button class="btn primary big" type="button" id="lb-next" data-focus>' + (b.idx + 1 >= b.total ? 'Se pallen' : 'Neste spørsmål') + '</button><button class="btn ghost" type="button" id="lb-end">Avslutt</button></div>';
  } else {
    const t = b.top, pod = [1, 0, 2].filter((i) => t[i]).map((i) => '<div class="pod p' + (i + 1) + '"><b>' + esc(t[i].name) + '</b><span>' + t[i].points + '</span><i>' + (i + 1) + '</i></div>').join('');
    h = '<div class="lbcenter"><h2 class="lbend">Ferdig!</h2><div class="podium">' + (pod || '<p class="muted">Ingen svarte.</p>') + '</div>' + (t.length > 3 ? '<ol class="lbtoplist" start="4">' + t.slice(3).map((x) => '<li><b>' + esc(x.name) + '</b><span>' + x.points + '</span></li>').join('') + '</ol>' : '') +
      '<div class="row lbctl"><button class="btn primary" type="button" id="lb-again">Ny quiz</button><button class="btn ghost" type="button" id="lb-close">Lukk tavla</button></div></div>';
    if (pod) import('../app/juice').then((j) => j.confetti(3)).catch(() => {});
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
  const f = el.querySelector<HTMLElement>('[data-focus]'); if (f) f.focus({ preventScroll: true });
}
function topList(): string {
  if (!b || !b.top.length) return '';
  return '<ol class="lbtoplist">' + b.top.map((x) => '<li><b>' + esc(x.name) + '</b><span>' + x.points + '</span></li>').join('') + '</ol>';
}

document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && el && !document.fullscreenElement && (!sid || b?.status === 'end')) close(); });
