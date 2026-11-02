// Lekser i lærerrommet: gi klassen et emne å mestre innen en dato, og se hvem som er ferdige.
// Fremgangen regnes ut fra progress.state (known og qok), med samme regel som elevene ser.
import { esc } from '../lib/dom';
import { supabase, friendly } from '../lib/supabase';
import { THEMES, themeName } from '../themes';
import { topicProgress, type HwProgress } from '../lib/homework';

export interface HwRow { id: string; class_id: string; theme: string; topic: string; due: string; created_at: string }
interface Ctx {
  classId: string;
  themes: string[];
  students: { id: string; display_name: string }[];
  progress: { student_id: string; theme: string; state: any }[];
}

let rows: HwRow[] | null = null, loadedFor = '', msg = '', open: string | null = null, formTheme = '';

export async function loadHomework(classId: string): Promise<void> {
  const { data, error } = await supabase.from('homework').select('id, class_id, theme, topic, due, created_at').eq('class_id', classId).order('due', { ascending: false });
  rows = error ? null : (data as HwRow[]); loadedFor = classId;
  msg = error && !/homework|relation|schema cache/i.test(error.message || '') ? friendly(error) : '';
}
const iso = (d: Date) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
const plus = (days: number) => { const d = new Date(); d.setDate(d.getDate() + days); return iso(d); };
const topicName = (theme: string, k: string) => THEMES[theme]?.topics.find((t) => t.k === k)?.name || k;
const dateNo = (d: string) => new Date(d + 'T12:00:00').toLocaleDateString('nb-NO', { weekday: 'short', day: 'numeric', month: 'short' });

function stats(h: HwRow, c: Ctx): { s: { id: string; display_name: string }; p: HwProgress }[] {
  const T = THEMES[h.theme];
  return c.students.map((s) => {
    const st = c.progress.find((x) => x.student_id === s.id && x.theme === h.theme)?.state || {};
    return { s, p: topicProgress(T, h.topic, st.known || {}, Array.isArray(st.qok) ? st.qok : []) };
  });
}

export function homeworkHTML(c: Ctx): string {
  if (loadedFor !== c.classId) return '<section class="panel" id="hw"><h2>Lekser</h2><p class="loading">Henter lekser …</p></section>';
  if (rows === null) return '<section class="panel" id="hw"><h2>Lekser</h2><p class="muted">Kjør databaseoppdateringen for live og lekser (20261102400000_live_homework.sql) for å kunne gi lekser.</p></section>';
  if (!c.themes.includes(formTheme)) formTheme = c.themes[0];
  const T = THEMES[formTheme], today = iso(new Date());
  const form = '<form id="hw-form" class="tform hwform">' +
    (c.themes.length > 1 ? '<label class="afield" for="hw-theme"><span>Tema</span><select id="hw-theme">' + c.themes.map((t) => '<option value="' + t + '"' + (t === formTheme ? ' selected' : '') + '>' + esc(themeName(t)) + '</option>').join('') + '</select></label>' : '') +
    '<label class="afield" for="hw-topic"><span>Emne</span><select id="hw-topic">' + T.topics.map((t) => '<option value="' + t.k + '">' + esc(t.name) + ' (' + T.content.cards.filter((x) => x.t === t.k).length + ' kort, ' + T.content.quiz.filter((x) => x.t === t.k).length + ' quiz)</option>').join('') + '</select></label>' +
    '<label class="afield" for="hw-due"><span>Frist</span><input id="hw-due" type="date" min="' + today + '" value="' + plus(7) + '" required></label>' +
    '<div class="hwquick" role="group" aria-label="Snarveier for frist">' + [[1, 'I morgen'], [3, 'Om 3 dager'], [7, 'Om en uke'], [14, 'Om to uker']].map(([n, l]) => '<button class="chip" type="button" data-due="' + n + '">' + l + '</button>').join('') + '</div>' +
    '<div class="row"><button class="btn primary" type="submit">Gi lekse</button></div></form>';

  const list = rows.map((h) => {
    const st = stats(h, c), n = st.length || 1;
    const done = st.filter((x) => x.p.done).length, going = st.filter((x) => !x.p.done && x.p.started).length, none = st.length - done - going;
    const avg = Math.round(st.reduce((a, x) => a + x.p.pct, 0) / n * 100), late = h.due < today;
    const seg = (k: number, cls: string) => k ? '<i class="' + cls + '" style="flex:' + k + '"></i>' : '';
    const detail = open === h.id ? '<div class="tscroll"><table class="gtab"><thead><tr><th scope="col">Elev</th><th scope="col">Fremgang</th><th scope="col" class="num">Kort</th><th scope="col" class="num">Quiz</th><th scope="col">Status</th></tr></thead><tbody>' +
      st.sort((a, b) => b.p.pct - a.p.pct || a.s.display_name.localeCompare(b.s.display_name, 'nb')).map(({ s, p }) => {
        const pc = Math.round(p.pct * 100);
        return '<tr><th scope="row">' + esc(s.display_name) + '</th><td><span class="minibar" aria-hidden="true"><i style="width:' + pc + '%"></i></span> ' + pc + ' %</td><td class="num">' + p.cards + '/' + p.cardsOf + '</td><td class="num">' + p.quiz + '/' + p.quizOf + '</td><td>' + (p.done ? '<span class="hwst ok">Fullført</span>' : p.started ? '<span class="hwst mid">I gang</span>' : '<span class="hwst no">Ikke startet</span>') + '</td></tr>';
      }).join('') + '</tbody></table></div>' +
      '<div class="row"><button class="btn ghost" type="button" data-hwdel="' + h.id + '">Slett leksen</button></div>' : '';
    return '<article class="hwrow' + (late ? ' late' : '') + '"><button class="hwhead" type="button" data-hwopen="' + h.id + '" aria-expanded="' + (open === h.id) + '">' +
      '<span class="hwname"><b>' + esc(topicName(h.theme, h.topic)) + '</b><small>' + esc(themeName(h.theme)) + ' · frist ' + esc(dateNo(h.due)) + (late ? ' (gått ut)' : '') + '</small></span>' +
      '<span class="hwkpi"><b>' + done + '/' + st.length + '</b><small>fullført</small></span><span class="hwkpi"><b>' + avg + ' %</b><small>snitt</small></span>' +
      '<span class="hwstack" role="img" aria-label="' + done + ' fullført, ' + going + ' i gang, ' + none + ' ikke startet">' + seg(done, 'ok') + seg(going, 'mid') + seg(none, 'no') + '</span></button>' + detail + '</article>';
  }).join('');

  return '<section class="panel" id="hw"><h2>Lekser</h2><p class="muted">Gi klassen et emne å mestre. Eleven er ferdig når hen kan alle kortene i emnet og har svart riktig på hvert quizspørsmål minst én gang. Elevene ser leksen på startsiden.</p>' +
    form + (msg ? '<p class="msg" aria-live="polite">' + esc(msg) + '</p>' : '') +
    (rows.length ? '<div class="hwlegend"><span><i class="ok"></i>Fullført</span><span><i class="mid"></i>I gang</span><span><i class="no"></i>Ikke startet</span></div><div class="hwrows">' + list + '</div>' : '<p class="muted">Ingen lekser ennå.</p>') + '</section>';
}

export function wireHomework(root: HTMLElement, c: Ctx, redraw: () => void): void {
  const f = root.querySelector('#hw-form') as HTMLFormElement | null;
  if (!f) return;
  const th = root.querySelector('#hw-theme') as HTMLSelectElement | null;
  if (th) th.onchange = () => { formTheme = th.value; redraw(); };
  root.querySelectorAll<HTMLElement>('[data-due]').forEach((b) => { b.onclick = () => { (root.querySelector('#hw-due') as HTMLInputElement).value = plus(+b.dataset.due!); }; });
  f.onsubmit = async (e) => {
    e.preventDefault();
    const topic = (root.querySelector('#hw-topic') as HTMLSelectElement).value, due = (root.querySelector('#hw-due') as HTMLInputElement).value;
    if (!due) return;
    const { error } = await supabase.from('homework').insert({ class_id: c.classId, theme: formTheme, topic, due });
    msg = error ? friendly(error) : 'Leksen er gitt: ' + topicName(formTheme, topic) + ', frist ' + dateNo(due) + '.';
    await loadHomework(c.classId); redraw();
  };
  root.querySelectorAll<HTMLElement>('[data-hwopen]').forEach((b) => { b.onclick = () => { open = open === b.dataset.hwopen ? null : b.dataset.hwopen!; redraw(); }; });
  root.querySelectorAll<HTMLElement>('[data-hwdel]').forEach((b) => {
    b.onclick = async () => {
      if (b.dataset.sure !== '1') { b.dataset.sure = '1'; b.textContent = 'Trykk igjen for å slette'; return; }
      const { error } = await supabase.from('homework').delete().eq('id', b.dataset.hwdel!);
      msg = error ? friendly(error) : 'Leksen er slettet.'; open = null;
      await loadHomework(c.classId); redraw();
    };
  });
}
