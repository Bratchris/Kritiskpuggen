// Lærerrommet: klasser, elevkoder, fremgang og gaver.
import { $, esc, fmtDate } from '../lib/dom';
import { supabase, friendly } from '../lib/supabase';
import { THEMES, THEME_IDS, themeName } from '../themes';
import { gradient } from '../app/room/iso';
import { activityHTML, type ActRow } from './activity';

interface Klass { id: string; name: string; code: string; themes: string[]; created_at: string; leaderboard?: boolean }
interface Student { id: string; display_name: string; username: string; last_seen: string | null; created_at: string }
interface Prog { student_id: string; theme: string; points: number; spent: number; state: any; updated_at: string }
interface GiftRow { id: number; student_id: string; theme: string; item_id: string; price: number; created_at: string }

interface View {
  me: { id: string; name: string };
  classes: Klass[];
  sel: string | null;
  theme: string;
  students: Student[];
  progress: Prog[];
  gifts: GiftRow[];
  newCodes: { name: string; username: string; code: string; error?: string }[] | null;
  rowAct: { id: string; kind: 'points' | 'reset' | 'delete' | 'code'; code?: string } | null;
  msg: string;
  creating: boolean;
  confirmDel: boolean;
  act: ActRow[] | null;
  actErr: string;
  actDays: number;
}

let V: View;
let root: HTMLElement;
let onPreview: (theme: string, classId: string) => void;

export async function mountTeacher(el: HTMLElement, me: { id: string; name: string }, preview: (theme: string, classId: string) => void): Promise<void> {
  root = el; onPreview = preview;
  document.documentElement.dataset.tema = '';
  V = V && V.me.id === me.id ? V : { me, classes: [], sel: null, theme: 'kritisk', students: [], progress: [], gifts: [], newCodes: null, rowAct: null, msg: '', creating: false, confirmDel: false, act: null, actErr: '', actDays: 7 };
  root.innerHTML = '<div class="wrap"><p class="loading">Henter klassene dine …</p></div>';
  await loadClasses();
  if (V.sel) await loadClass(); else draw();
}

async function loadClasses() {
  const { data, error } = await supabase.from('classes').select('*').order('created_at');
  if (error) { V.msg = friendly(error); return; }
  V.classes = data as Klass[];
  if (!V.sel || !V.classes.some((c) => c.id === V.sel)) V.sel = V.classes[0]?.id ?? null;
  V.creating = V.classes.length === 0;
}

async function loadClass() {
  const c = cls(); if (!c) { draw(); return; }
  V.act = null; V.actErr = '';
  if (!c.themes.includes(V.theme)) V.theme = c.themes[0];
  const [st, pr, gi] = await Promise.all([
    supabase.from('profiles').select('id, display_name, username, last_seen, created_at').eq('class_id', c.id).eq('role', 'student').order('display_name'),
    supabase.from('progress').select('student_id, theme, points, spent, state, updated_at'),
    supabase.from('gifts').select('id, student_id, theme, item_id, price, created_at').eq('class_id', c.id).order('created_at', { ascending: false }).limit(500),
  ]);
  const err = st.error || pr.error || gi.error;
  if (err) V.msg = friendly(err);
  V.students = (st.data ?? []) as Student[];
  const ids = new Set(V.students.map((s) => s.id));
  V.progress = ((pr.data ?? []) as Prog[]).filter((p) => ids.has(p.student_id));
  V.gifts = (gi.data ?? []) as GiftRow[];
  draw();
  // Spilloversikten hentes for seg, så resten av lærerrommet ikke venter på den.
  const ac = await supabase.from('activity').select('student_id, theme, mode, day, answers, correct, xp, timed, ms_total, fast').eq('class_id', c.id);
  if (ac.error) { V.act = []; V.actErr = /activity|relation|schema cache/i.test(ac.error.message || '') ? 'Spilloversikten er ikke klar ennå. Kjør databaseoppdateringen for aktivitet i Supabase.' : friendly(ac.error); }
  else { V.act = (ac.data ?? []) as ActRow[]; V.actErr = ''; }
  if (V.sel === c.id) draw();
}

const cls = () => V.classes.find((c) => c.id === V.sel) || null;
const prog = (sid: string) => V.progress.find((p) => p.student_id === sid && p.theme === V.theme);
function levelOf(theme: string, xp: number) { const L = THEMES[theme].room.levels; let k = 0; L.forEach((l, i) => { if (xp >= l.xp) k = i; }); return { i: k, n: L[k].n }; }
function starsOf(theme: string, xp: number) { const L = THEMES[theme].room.levels, top = L[L.length - 1].xp; const n = xp >= top ? Math.floor((xp - top) / 300) : 0; return n > 0 ? ' ★' + n : ''; }
function invoke(body: Record<string, unknown>) { return supabase.functions.invoke('manage-students', { body }); }
async function fnError(error: any): Promise<string> {
  try { const j = await error?.context?.json?.(); if (j?.error) return j.error; } catch { /* bruk standardtekst */ }
  return friendly(error);
}

function draw(): void {
  const c = cls();
  root.innerHTML =
    '<div class="wrap teacher">' +
    '<header class="apphead"><div class="topbar"><p class="eyebrow">Puggen · lærer</p><div class="who"><span>' + esc(V.me.name) + '</span><button class="lnk" id="logout" type="button">Logg ut</button></div></div>' +
    '<h1 class="brand">Lærerrommet</h1></header>' +
    (V.msg ? '<p class="fb bad" role="alert">' + esc(V.msg) + '</p>' : '') +
    '<nav class="classbar" aria-label="Klasser">' + V.classes.map((k) => '<button class="chip" type="button" data-c="' + k.id + '" aria-pressed="' + (k.id === V.sel && !V.creating) + '">' + esc(k.name) + '</button>').join('') +
    '<button class="chip add" type="button" id="new-class" aria-pressed="' + V.creating + '">+ Ny klasse</button></nav>' +
    (V.creating || !c ? newClassHTML() : classHTML(c)) +
    '</div><div id="toast" role="status" aria-live="polite"></div>';
  wire();
}

function themeChecks(sel: string[], name: string) {
  return '<div class="checks">' + THEME_IDS.map((id) => '<label class="check"><input type="checkbox" name="' + name + '" value="' + id + '"' + (sel.includes(id) ? ' checked' : '') + '><span><b>' + esc(THEMES[id].title) + '</b><small>' + esc(THEMES[id].eyebrow) + '</small></span></label>').join('') + '</div>';
}

function newClassHTML(): string {
  return '<section class="panel"><h2>Ny klasse</h2><p class="muted">Gi klassen et navn og velg hvilke puggere elevene skal ha. Du får en klassekode som elevene bruker når de logger inn.</p>' +
    '<form id="nc" class="tform"><label class="afield" for="nc-name"><span>Navn på klassen</span><input id="nc-name" maxlength="60" placeholder="F.eks. 10B KRLE" required></label>' +
    '<fieldset><legend>Temaer</legend>' + themeChecks(['kritisk'], 'nc-t') + '</fieldset>' +
    '<div class="row"><button class="btn primary" type="submit">Lag klassen</button>' + (V.classes.length ? '<button class="btn ghost" type="button" id="nc-x">Avbryt</button>' : '') + '</div></form></section>';
}

function classHTML(c: Klass): string {
  const T = THEMES[V.theme];
  const rows = V.students.map((s) => ({ s, p: prog(s.id) })).sort((a, b) => (b.p?.points ?? 0) - (a.p?.points ?? 0) || a.s.display_name.localeCompare(b.s.display_name, 'nb'));
  const nCards = T.content.cards.length;
  const giftsHere = V.gifts.filter((g) => g.theme === V.theme);
  const active7 = V.students.filter((s) => s.last_seen && Date.now() - new Date(s.last_seen).getTime() < 7 * 864e5).length;
  const totalXp = rows.reduce((a, r) => a + (r.p?.points ?? 0), 0);

  const table = rows.length ? '<div class="tscroll"><table class="gtab"><thead><tr><th scope="col">Elev</th><th scope="col">Nivå</th><th scope="col" class="num">XP</th><th scope="col" class="num">Poeng igjen</th><th scope="col">Kort mestret</th><th scope="col" class="num">Gaver</th><th scope="col">Sist aktiv</th><th scope="col"><span class="sr">Handlinger</span></th></tr></thead><tbody>' +
    rows.map(({ s, p }) => {
      const xp = p?.points ?? 0, lv = levelOf(V.theme, xp), known = p?.state?.known ? Object.keys(p.state.known).length : 0;
      const g = giftsHere.filter((x) => x.student_id === s.id).length;
      const pct = Math.round(known / nCards * 100);
      return '<tr><th scope="row"><b>' + esc(s.display_name) + '</b><small class="uname">' + esc(s.username) + '</small></th>' +
        '<td><span class="lvchip" style="--lc:' + gradient(T.stripes, lv.i / Math.max(1, T.room.levels.length - 1)) + '">' + (lv.i + 1) + ' · ' + esc(lv.n) + starsOf(V.theme, xp) + '</span></td>' +
        '<td class="num">' + xp + '</td><td class="num">' + (xp - (p?.spent ?? 0)) + '</td>' +
        '<td><span class="minibar" aria-hidden="true"><i style="width:' + pct + '%"></i></span> ' + known + ' av ' + nCards + '</td>' +
        '<td class="num">' + g + '</td><td class="when">' + (s.last_seen ? esc(fmtDate(s.last_seen)) : 'Aldri') + '</td>' +
        '<td class="acts"><div class="actbox">' + rowActions(s) + '</div></td></tr>';
    }).join('') + '</tbody></table></div>' : '<p class="muted">Ingen elever ennå. Legg dem til under.</p>';

  const own: Record<string, number> = {};
  giftsHere.forEach((g) => { own[g.item_id] = (own[g.item_id] || 0) + 1; });
  const bowl = T.shop.products.filter((x) => own[x.id]).map((x) => '<div class="sitem' + (x.id === T.shop.goldId ? ' gold' : '') + '"><svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + T.shop.icons[x.ic] + '</svg><span>' + esc(x.name) + ' ×' + own[x.id] + '</span></div>').join('');
  const name = (sid: string) => V.students.find((s) => s.id === sid)?.display_name ?? 'Slettet elev';
  const pname = (id: string) => T.shop.products.find((x) => x.id === id)?.name ?? id;
  const giftList = giftsHere.slice(0, 15).map((g) => '<tr><th scope="row">' + esc(name(g.student_id)) + '</th><td>' + esc(pname(g.item_id)) + '</td><td class="num">' + g.price + '</td><td class="when">' + esc(fmtDate(g.created_at)) + '</td></tr>').join('');

  return '<section class="panel classhead"><div class="chrow"><div><p class="eyebrow">Klasse</p><h2>' + esc(c.name) + '</h2></div>' +
    '<div class="codebox"><span class="lbl2">Klassekode</span><b class="code">' + esc(c.code) + '</b></div></div>' +
    '<p class="muted">Elevene logger inn med klassekoden, brukernavnet sitt og koden de får av deg.</p>' +
    '<div class="kpis"><div><b>' + V.students.length + '</b><span>elever</span></div><div><b>' + active7 + '</b><span>aktive siste 7 dager</span></div><div><b>' + totalXp + '</b><span>XP i ' + esc(T.title) + '</span></div><div><b>' + giftsHere.length + '</b><span>gaver</span></div></div>' +
    '<div class="row"><button class="btn" type="button" id="refresh">Oppdater</button>' + c.themes.map((t) => '<button class="btn ghost" type="button" data-prev="' + t + '">Prøv ' + esc(themeName(t)) + '</button>').join('') + '</div></section>' +

    (c.themes.length > 1 ? '<nav class="filters" aria-label="Tema"><span class="flabel">Tema</span>' + c.themes.map((t) => '<button class="chip" type="button" data-th="' + t + '" aria-pressed="' + (t === V.theme) + '">' + esc(themeName(t)) + '</button>').join('') + '</nav>' : '') +

    '<section class="panel"><h2>Elevene</h2>' + table + '</section>' +
    activityHTML(V.act, V.actErr, V.theme, V.actDays, Object.fromEntries(V.students.map((s) => [s.id, s.display_name]))) +

    '<section class="panel"><h2>' + esc(T.shop.shelfTitle) + '</h2>' +
    (bowl ? '<div class="shelfitems">' + bowl + '</div><p class="muted">Samlet verdi: ' + giftsHere.reduce((a, g) => a + g.price, 0) + ' poeng</p>' +
      '<details><summary>Siste gaver</summary><div class="tscroll"><table class="gtab"><thead><tr><th scope="col">Elev</th><th scope="col">Gave</th><th scope="col" class="num">Poeng</th><th scope="col">Tidspunkt</th></tr></thead><tbody>' + giftList + '</tbody></table></div></details>'
      : '<p class="muted">Ingen gaver ennå. Når elevene kjøper noe i butikken, dukker det opp her.</p>') + '</section>' +

    '<section class="panel"><h2>Legg til elever</h2><p class="muted">Skriv ett navn per linje. Bruk gjerne bare fornavn eller kallenavn, så lagres færrest mulig personopplysninger.</p>' +
    '<form id="add" class="tform"><label class="afield" for="add-names"><span>Navn</span><textarea id="add-names" rows="5" placeholder="Ola&#10;Kari&#10;Amir"></textarea></label><div class="row"><button class="btn primary" type="submit">Lag elevkoder</button></div></form>' +
    (V.newCodes ? codesHTML(c) : '') + '</section>' +

    '<section class="panel"><h2>Innstillinger for klassen</h2><form id="cset" class="tform"><label class="afield" for="cs-name"><span>Navn</span><input id="cs-name" maxlength="60" value="' + esc(c.name) + '"></label><fieldset><legend>Temaer</legend>' + themeChecks(c.themes, 'cs-t') + '</fieldset>' +
    ('leaderboard' in c ? '<label class="check"><input type="checkbox" id="cs-lb"' + (c.leaderboard ? ' checked' : '') + '><span><b>Vis topplisten for elevene</b><small>Elevene ser navn og XP for alle i klassen. Slå av hvis det ikke passer for klassen.</small></span></label>' : '<p class="muted">Kjør databaseoppdateringen for topplisten for å kunne slå den av og på.</p>') +
    '<div class="row"><button class="btn" type="submit">Lagre</button></div></form>' +
    '<div class="danger">' + (V.confirmDel ? '<span>Slette klassen og alle elevkontoene i den? Fremgang og gaver forsvinner.</span><button class="btn" id="del-yes" type="button">Ja, slett</button><button class="btn ghost" id="del-no" type="button">Avbryt</button>' : '<button class="btn ghost" id="del-ask" type="button">Slett klassen</button>') + '</div></section>';
}

function codesHTML(c: Klass): string {
  const ok = V.newCodes!.filter((s) => !s.error), bad = V.newCodes!.filter((s) => s.error);
  return '<div class="codes" id="codes"><h3>Nye elevkoder</h3><p class="muted">Kodene vises bare nå. Kopier eller skriv ut listen før du går videre. Du kan alltid lage en ny kode for en elev senere.</p>' +
    '<div class="tscroll"><table class="gtab"><thead><tr><th scope="col">Navn</th><th scope="col">Klassekode</th><th scope="col">Brukernavn</th><th scope="col">Kode</th></tr></thead><tbody>' +
    ok.map((s) => '<tr><th scope="row">' + esc(s.name) + '</th><td class="mono">' + esc(c.code) + '</td><td class="mono">' + esc(s.username) + '</td><td class="mono">' + esc(s.code) + '</td></tr>').join('') + '</tbody></table></div>' +
    (bad.length ? '<p class="fb bad">' + bad.length + ' elev(er) ble ikke opprettet: ' + esc(bad.map((s) => s.name + ' (' + s.error + ')').join(', ')) + '</p>' : '') +
    '<div class="row"><button class="btn" type="button" id="copy-codes">Kopier listen</button><button class="btn" type="button" id="print-codes">Skriv ut</button><button class="btn ghost" type="button" id="hide-codes">Skjul kodene</button></div></div>';
}

function rowActions(s: Student): string {
  const a = V.rowAct && V.rowAct.id === s.id ? V.rowAct : null;
  if (!a) return '<button class="lnk" data-act="points" data-s="' + s.id + '" type="button">Gi poeng</button><button class="lnk" data-act="reset" data-s="' + s.id + '" type="button">Ny kode</button><button class="lnk danger-lnk" data-act="delete" data-s="' + s.id + '" type="button">Slett</button>';
  if (a.kind === 'points') return '<form class="inl" data-pform="' + s.id + '"><label class="sr" for="pts-' + s.id + '">Poeng</label><input id="pts-' + s.id + '" type="number" step="1" min="-1000" max="1000" value="10"><button class="btn" type="submit">Gi</button><button class="lnk" type="button" data-act="cancel">Avbryt</button></form>';
  if (a.kind === 'reset') return '<span class="inl">Lage ny kode? Den gamle slutter å virke. <button class="btn" type="button" data-do="reset" data-s="' + s.id + '">Ja</button><button class="lnk" type="button" data-act="cancel">Avbryt</button></span>';
  if (a.kind === 'delete') return '<span class="inl">Slette eleven og all fremgang? <button class="btn" type="button" data-do="delete" data-s="' + s.id + '">Ja, slett</button><button class="lnk" type="button" data-act="cancel">Avbryt</button></span>';
  return '<span class="inl">Ny kode: <b class="mono">' + esc(a.code!) + '</b> <button class="lnk" type="button" data-act="cancel">Ferdig</button></span>';
}

function wire(): void {
  $('#logout').onclick = () => supabase.auth.signOut();
  root.querySelectorAll<HTMLElement>('[data-c]').forEach((b) => { b.onclick = () => { V.sel = b.dataset.c!; V.creating = false; V.newCodes = null; V.rowAct = null; V.confirmDel = false; V.msg = ''; void loadClass(); }; });
  $('#new-class').onclick = () => { V.creating = true; V.msg = ''; draw(); };

  const nc = $('#nc') as HTMLFormElement | null;
  if (nc) {
    const x = $('#nc-x'); if (x) x.onclick = () => { V.creating = false; draw(); };
    nc.onsubmit = async (e) => {
      e.preventDefault();
      const name = String($('#nc-name').value).trim(), themes = checked('nc-t');
      if (!name) return;
      if (!themes.length) { V.msg = 'Velg minst ett tema.'; draw(); return; }
      const { data, error } = await supabase.from('classes').insert({ teacher_id: V.me.id, name, themes }).select('id').single();
      if (error) { V.msg = friendly(error); draw(); return; }
      V.msg = ''; V.creating = false; V.sel = data.id; await loadClasses(); await loadClass();
    };
    return;
  }

  const r = $('#refresh'); if (r) r.onclick = () => { V.msg = ''; void loadClass(); };
  root.querySelectorAll<HTMLElement>('[data-prev]').forEach((b) => { b.onclick = () => onPreview(b.dataset.prev!, V.sel!); });
  root.querySelectorAll<HTMLElement>('[data-days]').forEach((b) => { b.onclick = () => { V.actDays = +b.dataset.days!; draw(); const a = $('#act'); if (a) a.scrollIntoView({ block: 'nearest' }); }; });
  root.querySelectorAll<HTMLElement>('[data-th]').forEach((b) => { b.onclick = () => { V.theme = b.dataset.th!; V.rowAct = null; draw(); }; });

  ($('#add') as HTMLFormElement).onsubmit = async (e) => {
    e.preventDefault();
    const names = String($('#add-names').value).split('\n').map((s) => s.trim()).filter(Boolean);
    if (!names.length) return;
    const btn = ($('#add') as HTMLFormElement).querySelector('button') as HTMLButtonElement; btn.disabled = true; btn.textContent = 'Lager koder …';
    const { data, error } = await invoke({ action: 'create', class_id: V.sel, names });
    if (error) { V.msg = await fnError(error); draw(); return; }
    V.msg = ''; V.newCodes = data.students; await loadClass();
    const cd = $('#codes'); if (cd) cd.scrollIntoView({ block: 'start' });
  };
  const cc = $('#copy-codes');
  if (cc) cc.onclick = async () => {
    const c = cls()!;
    const txt = 'Navn\tKlassekode\tBrukernavn\tKode\n' + V.newCodes!.filter((s) => !s.error).map((s) => [s.name, c.code, s.username, s.code].join('\t')).join('\n');
    try { await navigator.clipboard.writeText(txt); cc.textContent = 'Kopiert'; } catch { cc.textContent = 'Marker tabellen og kopier'; }
  };
  const pc = $('#print-codes'); if (pc) pc.onclick = () => { document.body.classList.add('printcodes'); window.print(); document.body.classList.remove('printcodes'); };
  const hc = $('#hide-codes'); if (hc) hc.onclick = () => { V.newCodes = null; draw(); };

  root.querySelectorAll<HTMLElement>('[data-act]').forEach((b) => {
    b.onclick = () => { const k = b.dataset.act!; V.rowAct = k === 'cancel' ? null : { id: b.dataset.s!, kind: k as any }; draw(); const i = $('#pts-' + (b.dataset.s || '')); if (i) i.select(); };
  });
  root.querySelectorAll<HTMLFormElement>('[data-pform]').forEach((f) => {
    f.onsubmit = async (e) => {
      e.preventDefault();
      const n = Math.round(Number((f.querySelector('input') as HTMLInputElement).value));
      const { error } = await supabase.rpc('grant_points', { p_student: f.dataset.pform, p_theme: V.theme, p_n: n });
      V.msg = error ? friendly(error) : ''; V.rowAct = null; await loadClass();
    };
  });
  root.querySelectorAll<HTMLElement>('[data-do]').forEach((b) => {
    b.onclick = async () => {
      b.setAttribute('disabled', '');
      const sid = b.dataset.s!;
      const { data, error } = await invoke({ action: b.dataset.do, student_id: sid });
      if (error) { V.msg = await fnError(error); V.rowAct = null; draw(); return; }
      V.msg = '';
      if (b.dataset.do === 'reset') { V.rowAct = { id: sid, kind: 'code', code: data.code }; draw(); }
      else { V.rowAct = null; await loadClass(); }
    };
  });

  ($('#cset') as HTMLFormElement).onsubmit = async (e) => {
    e.preventDefault();
    const name = String($('#cs-name').value).trim(), themes = checked('cs-t');
    if (!name || !themes.length) { V.msg = 'Klassen trenger et navn og minst ett tema.'; draw(); return; }
    const c = cls(), patch: Record<string, unknown> = { name, themes };
    if (c && 'leaderboard' in c) patch.leaderboard = !!($('#cs-lb') as HTMLInputElement)?.checked;
    const { error } = await supabase.from('classes').update(patch).eq('id', V.sel);
    V.msg = error ? friendly(error) : ''; await loadClasses(); await loadClass();
  };
  const da = $('#del-ask'); if (da) da.onclick = () => { V.confirmDel = true; draw(); };
  const dn = $('#del-no'); if (dn) dn.onclick = () => { V.confirmDel = false; draw(); };
  const dy = $('#del-yes');
  if (dy) dy.onclick = async () => {
    dy.disabled = true;
    const { error } = await invoke({ action: 'delete_class', class_id: V.sel });
    V.confirmDel = false;
    if (error) { V.msg = await fnError(error); draw(); return; }
    V.sel = null; V.msg = ''; await loadClasses(); if (V.sel) await loadClass(); else draw();
  };
}

function checked(name: string): string[] {
  return Array.from(root.querySelectorAll<HTMLInputElement>('input[name="' + name + '"]:checked')).map((i) => i.value);
}
