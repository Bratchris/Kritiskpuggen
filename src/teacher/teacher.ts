// Lærerrommet: klasser, elevkoder, fremgang og gaver.
import { showPrivacy, downloadJSON } from '../privacy';
import { SEASONS, SEASON_DAYS, activeSeasons, untilText, type Events, type SeasonId } from '../seasons/catalog';
import { $, esc, fmtDate } from '../lib/dom';
import { supabase, friendly } from '../lib/supabase';
import { THEMES, THEME_IDS, themeName } from '../themes';
import { gradient } from '../app/room/iso';
import { activityHTML, type ActRow } from './activity';

interface Klass { id: string; name: string; code: string; themes: string[]; created_at: string; leaderboard?: boolean; events?: Events }
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
  /** Invitasjoner til kolleger. null = databasen mangler støtte. */
  invites: Invite[] | null;
  newInvite: string | null;
  invMsg: string;
  /** Om denne læreren har lov til å invitere nye lærere. */
  canInvite: boolean;
}
interface Invite { code: string; note: string | null; created_at: string; expires_at: string; used_at: string | null }

let V: View;
let root: HTMLElement;
let onPreview: (theme: string, classId: string) => void;

export async function mountTeacher(el: HTMLElement, me: { id: string; name: string }, preview: (theme: string, classId: string) => void): Promise<void> {
  root = el; onPreview = preview;
  document.documentElement.dataset.tema = '';
  V = V && V.me.id === me.id ? V : { me, classes: [], sel: null, theme: 'kritisk', students: [], progress: [], gifts: [], newCodes: null, rowAct: null, msg: '', creating: false, confirmDel: false, act: null, actErr: '', actDays: 7, invites: null, newInvite: null, invMsg: '', canInvite: false };
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
  await loadInvites();
}
async function loadInvites() {
  const me = await supabase.from('profiles').select('can_invite').eq('id', V.me.id).maybeSingle();
  // Uten kolonnen can_invite (eldre database) kan alle lærere invitere.
  V.canInvite = me.error ? true : !!(me.data as { can_invite?: boolean } | null)?.can_invite;
  const { data, error } = await supabase.from('teacher_invites').select('code, note, created_at, expires_at, used_at').order('created_at', { ascending: false });
  V.invites = error ? null : (data as Invite[]);
}

const inviteLink = (code: string) => location.origin + '/?invitasjon=' + encodeURIComponent(code);
function invitesHTML(): string {
  if (!V.canInvite) return '';
  if (V.invites === null) return '<section class="panel"><h2>Kolleger</h2><p class="muted">Kjør databaseoppdateringen for lærerinvitasjoner for å kunne invitere kolleger.</p></section>';
  const now = Date.now();
  const status = (i: Invite) => i.used_at ? 'Brukt ' + fmtDate(i.used_at) : new Date(i.expires_at).getTime() < now ? 'Utløpt' : 'Gyldig til ' + new Date(i.expires_at).toLocaleDateString('nb-NO', { day: 'numeric', month: 'short' });
  return '<section class="panel"><h2>Kolleger</h2><p class="muted">Nye lærerkontoer krever en invitasjon fra deg. Lag en kode og send den til kollegaen din. Koden kan brukes én gang og varer i 14 dager. Kolleger du inviterer, kan ikke invitere videre.</p>' +
    '<form id="inv" class="tform invform"><label class="afield" for="inv-note"><span>Hvem er den til? (valgfritt)</span><input id="inv-note" maxlength="80" placeholder="F.eks. Kari, naturfag"></label><div class="row"><button class="btn primary" type="submit">Lag invitasjon</button></div></form>' +
    (V.newInvite ? '<div class="fb ok newinv"><strong>Invitasjonen er klar</strong>Send lenken til kollegaen din. Den åpner skjemaet for ny lærerkonto med koden fylt inn. Koden kan også skrives inn for hånd.<div class="invcode"><code>' + esc(V.newInvite) + '</code></div><div class="invlink"><input id="inv-link" readonly value="' + esc(inviteLink(V.newInvite)) + '" aria-label="Invitasjonslenke"><button class="btn" type="button" id="inv-copy">Kopier lenken</button></div></div>' : '') +
    (V.invMsg ? '<p class="msg" aria-live="polite">' + esc(V.invMsg) + '</p>' : '') +
    (V.invites.length ? '<table class="tbl invtbl"><thead><tr><th scope="col">Kode</th><th scope="col">Til</th><th scope="col">Status</th><th scope="col"><span class="sr">Handling</span></th></tr></thead><tbody>' +
      V.invites.slice(0, 15).map((i) => '<tr><td><code>' + esc(i.code) + '</code></td><td>' + esc(i.note || '–') + '</td><td>' + esc(status(i)) + '</td><td>' + (!i.used_at && new Date(i.expires_at).getTime() > now ? '<button class="lnk" type="button" data-revoke="' + esc(i.code) + '">Trekk tilbake</button>' : '') + '</td></tr>').join('') + '</tbody></table>' : '') +
    '</section>';
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
    (V.creating || !c ? newClassHTML() : classHTML(c)) + invitesHTML() +
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
    ('leaderboard' in c ? '<label class="check"><input type="checkbox" id="cs-lb"' + (c.leaderboard ? ' checked' : '') + '><span><b>Vis topplisten for elevene</b><small>Elevene ser navn og XP for topp 3 i klassen. Av som standard for nye klasser, av hensyn til personvernet. Slå på hvis klassen ønsker det.</small></span></label>' : '<p class="muted">Kjør databaseoppdateringen for topplisten for å kunne slå den av og på.</p>') +
    '<div class="row"><button class="btn" type="submit">Lagre</button></div></form>' +
    seasonsHTML(c) +
    '<div class="privrow"><h3>Personvern</h3><p class="muted">Last ned alt som er lagret om elevene i klassen, for eksempel når en elev eller forelder ber om innsyn. Aktivitet eldre enn 180 dager slettes automatisk.</p><div class="row"><button class="btn" type="button" id="cls-export">Last ned klassens data (JSON)</button><button class="btn ghost" type="button" id="cls-priv">Personvernerklæringen</button></div><p class="msg" id="cls-exmsg" aria-live="polite"></p></div>' +
    '<div class="danger">' + (V.confirmDel ? '<span>Slette klassen og alle elevkontoene i den? Fremgang og gaver forsvinner.</span><button class="btn" id="del-yes" type="button">Ja, slett</button><button class="btn ghost" id="del-no" type="button">Avbryt</button>' : '<button class="btn ghost" id="del-ask" type="button">Slett klassen</button>') + '</div></section>';
}

function seasonsHTML(c: Klass): string {
  if (!('events' in c)) return '<div class="privrow"><h3>Sesonghendelser</h3><p class="muted">Kjør databaseoppdateringen for sesonghendelser for å kunne slå dem på.</p></div>';
  const ev = c.events || {}, act = activeSeasons(ev);
  return '<div class="privrow seasons"><h3>Sesonghendelser</h3><p class="muted">Slå på en hendelse for klassen i 7 dager. Da kan elevene finne sesongegg, kjøpe sesongkostymer og -bakgrunner, og få mer XP hvis du velger det. XP-bonusen regnes ut i databasen.</p>' +
    SEASONS.map((se) => {
      const on = act.includes(se.id), e = ev[se.id], x = on ? Math.round(Number(e!.xp) || 1) : se.xp;
      return '<div class="seasonrow' + (on ? ' on' : '') + '"><div><b>' + esc(se.name) + '</b><small>' + esc(se.desc) + '</small>' + (on ? '<span class="sstatus">Pågår til ' + esc(untilText(e!.until)) + '</span>' : '') + '</div>' +
        '<label class="sxp"><span>XP</span><select data-sxp="' + se.id + '" aria-label="XP-bonus for ' + esc(se.name) + '">' + [1, 2, 3].map((n) => '<option value="' + n + '"' + (n === x ? ' selected' : '') + '>' + (n === 1 ? 'Vanlig' : n + '×') + '</option>').join('') + '</select></label>' +
        '<div class="row">' + (on ? '<button class="btn" type="button" data-season="' + se.id + '" data-act="extend">Forleng 7 dager</button><button class="btn ghost" type="button" data-season="' + se.id + '" data-act="off">Avslutt</button>' : '<button class="btn primary" type="button" data-season="' + se.id + '" data-act="on">Start i 7 dager</button>') + '</div></div>';
    }).join('') + '</div>';
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
  const inv = $('#inv') as HTMLFormElement | null;
  if (inv) inv.onsubmit = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase.rpc('create_teacher_invite', { p_note: String(($('#inv-note') as HTMLInputElement).value || '') });
    V.newInvite = error ? null : String(data); V.invMsg = error ? friendly(error) : '';
    await loadInvites(); draw();
  };
  const cp = $('#inv-copy');
  if (cp) cp.onclick = async () => { const i = $('#inv-link') as HTMLInputElement; try { await navigator.clipboard.writeText(i.value); cp.textContent = 'Kopiert'; } catch { i.select(); } };
  root.querySelectorAll<HTMLElement>('[data-revoke]').forEach((b) => {
    b.onclick = async () => { const { error } = await supabase.rpc('revoke_teacher_invite', { p_code: b.dataset.revoke }); V.invMsg = error ? friendly(error) : 'Invitasjonen er trukket tilbake.'; if (V.newInvite === b.dataset.revoke) V.newInvite = null; await loadInvites(); draw(); };
  });

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
  $('#cls-priv').onclick = () => showPrivacy();
  const saveEvents = async (ev: Events) => {
    const { error } = await supabase.from('classes').update({ events: ev }).eq('id', V.sel);
    V.msg = error ? friendly(error) : ''; await loadClasses(); draw();
  };
  root.querySelectorAll<HTMLElement>('[data-season]').forEach((b) => {
    b.onclick = async () => {
      const c = cls(); if (!c) return;
      const id = b.dataset.season as SeasonId, ev: Events = { ...(c.events || {}) };
      const xp = Number((root.querySelector('[data-sxp="' + id + '"]') as HTMLSelectElement)?.value) || 1;
      const base = b.dataset.act === 'extend' && ev[id] ? Math.max(Date.now(), new Date(ev[id]!.until).getTime()) : Date.now();
      if (b.dataset.act === 'off') delete ev[id];
      else ev[id] = { until: new Date(base + SEASON_DAYS * 864e5).toISOString(), xp };
      b.setAttribute('disabled', ''); await saveEvents(ev);
    };
  });
  root.querySelectorAll<HTMLSelectElement>('[data-sxp]').forEach((sel) => {
    sel.onchange = async () => {
      const c = cls(); if (!c) return;
      const id = sel.dataset.sxp as SeasonId, ev: Events = { ...(c.events || {}) };
      if (ev[id] && activeSeasons(ev).includes(id)) { ev[id] = { ...ev[id]!, xp: Number(sel.value) || 1 }; await saveEvents(ev); }
    };
  });
  $('#cls-export').onclick = async () => {
    const m = $('#cls-exmsg'); m.textContent = 'Henter …';
    try {
      const ids = V.students.map((s) => s.id), c = cls();
      const get = async (t: string, cols = '*') => { if (!ids.length) return []; const r = await supabase.from(t).select(cols).in('student_id', ids); return r.error ? 'Kunne ikke hentes (' + r.error.message + ')' : r.data; };
      const data = {
        laget: new Date().toISOString(), klasse: c ? { navn: c.name, kode: c.code, temaer: c.themes, opprettet: c.created_at } : null,
        elever: V.students.map((s) => ({ id: s.id, navn: s.display_name, brukernavn: s.username, opprettet: s.created_at, sist_innlogget: s.last_seen })),
        fremgang: await get('progress'), gaver: await get('gifts'), kostymer: await get('wardrobe'), egg_og_dyr: await get('pets'), achievements: await get('achievements'), aktivitet: await get('activity'),
      };
      downloadJSON('puggen-' + (c ? c.code : 'klasse') + '.json', data); m.textContent = 'Filen er lastet ned. Den inneholder personopplysninger, så lagre den trygt og slett den når du er ferdig.';
    } catch { m.textContent = 'Fikk ikke hentet dataene. Prøv igjen.'; }
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
