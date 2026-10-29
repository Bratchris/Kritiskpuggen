// Spilloversikten i lærerrommet: hvilke spill brukes mest og minst, og tegn på «grinding».
import { esc } from '../lib/dom';
import { THEMES } from '../themes';

export interface ActRow { student_id: string; theme: string; mode: string; day: string; answers: number; correct: number; xp: number; timed: number; ms_total: number; fast: number }
interface Agg { answers: number; correct: number; xp: number; timed: number; ms: number; fast: number; players: Set<string> }

/** Spill som ikke gir svar å telle, holdes utenfor. */
const SKIP = new Set(['shop', 'rom', 'top', 'tenk']);
/** Svargrense i sekunder per spill, for forklaringen. Må stemme med FAST_MS i app/core.ts. */
const FAST_S: Record<string, number> = { quiz: 3, tf: 2, hull: 2.5, sort: 2, kort: 1.5, feil: 1.2 };
const MIN_ANSWERS = 20;

const empty = (): Agg => ({ answers: 0, correct: 0, xp: 0, timed: 0, ms: 0, fast: 0, players: new Set() });
function add(a: Agg, r: ActRow) { a.answers += r.answers; a.correct += r.correct; a.xp += r.xp; a.timed += r.timed; a.ms += Number(r.ms_total); a.fast += r.fast; if (r.answers || r.xp) a.players.add(r.student_id); }
const pct = (n: number) => Math.round(n * 100) + ' %';

/** Treffsikkerhet ved ren gjetting, der det gir mening å regne den ut. */
function guessRate(theme: string, mode: string): number | null {
  const T = THEMES[theme];
  if (mode === 'tf') return 0.5;
  if (mode === 'sort') return 1 / Math.max(2, T.buckets.length);
  if (mode === 'quiz') { const q = T.content.quiz; return q.reduce((s, x) => s + 1 / (1 + x.w.length), 0) / Math.max(1, q.length); }
  return null;
}

function flags(theme: string, mode: string, a: Agg) {
  const out: { cls: string; t: string }[] = [];
  const fastRate = a.timed ? a.fast / a.timed : 0, acc = a.answers ? a.correct / a.answers : 0, g = guessRate(theme, mode);
  if (a.timed >= MIN_ANSWERS && FAST_S[mode] && fastRate >= 0.4) out.push({ cls: 'warn', t: 'Mange raske svar' });
  if (g !== null && a.answers >= MIN_ANSWERS && acc < g + 0.15) out.push({ cls: 'warn', t: 'Treffer nær gjetting' });
  return out;
}

export function activityHTML(rows: ActRow[] | null, err: string, theme: string, days: number, names: Record<string, string>): string {
  const T = THEMES[theme];
  const periods: [number, string][] = [[7, 'Siste 7 dager'], [30, 'Siste 30 dager'], [0, 'Alt']];
  const chips = '<div class="filters" role="group" aria-label="Periode"><span class="flabel">Periode</span>' +
    periods.map(([d, l]) => '<button class="chip" type="button" data-days="' + d + '" aria-pressed="' + (d === days) + '">' + l + '</button>').join('') + '</div>';
  const headHTML = '<section class="panel" id="act"><h2>Spilloversikt</h2>';
  if (err) return headHTML + '<p class="muted">' + esc(err) + '</p></section>';
  if (!rows) return headHTML + '<p class="loading">Henter aktivitet …</p></section>';

  const since = days ? new Date(Date.now() - (days - 1) * 864e5).toISOString().slice(0, 10) : '';
  const R = rows.filter((r) => r.theme === theme && (!since || r.day >= since));
  const modes = T.modes.filter((m) => !SKIP.has(m.id) && (m.id !== 'feil' || T.content.feil.length));
  const by: Record<string, Agg> = {}; modes.forEach((m) => { by[m.id] = empty(); });
  R.forEach((r) => { if (by[r.mode]) add(by[r.mode], r); });
  const totalXp = modes.reduce((s, m) => s + by[m.id].xp, 0), totalAns = modes.reduce((s, m) => s + by[m.id].answers, 0);

  if (!totalAns && !totalXp) {
    return headHTML + chips + '<p class="muted">Ingen aktivitet registrert i ' + esc(T.title) + ' i denne perioden. Oversikten fylles opp når elevene spiller.</p>' + explain(theme) + '</section>';
  }

  const sorted = modes.slice().sort((a, b) => by[b.id].xp - by[a.id].xp || by[b.id].answers - by[a.id].answers);
  const used = sorted.filter((m) => by[m.id].answers || by[m.id].xp), unused = sorted.filter((m) => !by[m.id].answers && !by[m.id].xp);
  const top = used[0], least = used.length > 1 ? used[used.length - 1] : null;
  const lead = '<p class="actlead"><b>Mest brukt:</b> ' + esc(top.name) + ' (' + pct(totalXp ? by[top.id].xp / totalXp : by[top.id].answers / totalAns) + ' av ' + (totalXp ? 'XP-en' : 'svarene') + ').' +
    (least ? ' <b>Minst brukt:</b> ' + esc(least.name) + '.' : '') + (unused.length ? ' <b>Ikke brukt:</b> ' + unused.map((m) => esc(m.name)).join(', ') + '.' : '') + '</p>';

  const maxShare = Math.max(...used.map((m) => (totalXp ? by[m.id].xp / totalXp : 0)), 0.01);
  const trs = sorted.map((m) => {
    const a = by[m.id], share = totalXp ? a.xp / totalXp : 0, f = flags(theme, m.id, a);
    if (!a.answers && !a.xp) return '<tr class="idle"><th scope="row">' + esc(m.name) + '</th><td colspan="7" class="muted">Ikke brukt i perioden</td><td><span class="tchip mute">Ikke brukt</span></td></tr>';
    return '<tr><th scope="row">' + esc(m.name) + '</th>' +
      '<td><span class="sharebar" aria-hidden="true"><i style="width:' + Math.round(share / maxShare * 100) + '%"></i></span> ' + pct(share) + '</td>' +
      '<td class="num">' + a.xp + '</td><td class="num">' + a.answers + '</td>' +
      '<td class="num">' + (a.answers ? pct(a.correct / a.answers) : '–') + '</td>' +
      '<td class="num">' + (a.timed ? (a.ms / a.timed / 1000).toFixed(1).replace('.', ',') : '–') + '</td>' +
      '<td class="num">' + (FAST_S[m.id] && a.timed ? pct(a.fast / a.timed) : '–') + '</td>' +
      '<td class="num">' + a.players.size + '</td>' +
      '<td>' + (f.length ? f.map((x) => '<span class="tchip ' + x.cls + '">' + x.t + '</span>').join(' ') : (a.answers < MIN_ANSWERS ? '<span class="tchip mute">For lite data</span>' : '<span class="tchip ok">Ser greit ut</span>')) + '</td></tr>';
  }).join('');
  const table = '<div class="tscroll"><table class="gtab acttab"><thead><tr><th scope="col">Spill</th><th scope="col">Andel av XP</th><th scope="col" class="num">XP</th><th scope="col" class="num">Svar</th><th scope="col" class="num">Riktig</th><th scope="col" class="num">Sek. per svar</th><th scope="col" class="num">Raske svar</th><th scope="col" class="num">Elever</th><th scope="col">Vurdering</th></tr></thead><tbody>' + trs + '</tbody></table></div>';

  // Elever som får det meste av XP-en fra ett spill, særlig med raske svar eller treff nær gjetting.
  const per: Record<string, Record<string, Agg>> = {};
  R.forEach((r) => { if (!by[r.mode]) return; const s = per[r.student_id] || (per[r.student_id] = {}); add(s[r.mode] || (s[r.mode] = empty()), r); });
  const watch = Object.keys(per).map((sid) => {
    const ms = per[sid], xp = Object.values(ms).reduce((s, a) => s + a.xp, 0);
    const topMode = Object.keys(ms).sort((a, b) => ms[b].xp - ms[a].xp)[0], a = ms[topMode], share = xp ? a.xp / xp : 0;
    const reasons: string[] = [];
    if (xp >= 30 && share >= 0.7) reasons.push(pct(share) + ' av XP-en fra ett spill');
    flags(theme, topMode, a).forEach((f) => reasons.push(f.t.toLowerCase()));
    return { sid, xp, topMode, a, share, reasons };
  }).filter((w) => w.xp >= 30 && w.reasons.length > 0)
    .sort((x, y) => y.reasons.length - x.reasons.length || y.xp - x.xp);
  const mname = (id: string) => (T.modes.find((m) => m.id === id)?.name ?? id);
  const watchHTML = '<h3 class="acth3">Elever å se nærmere på</h3>' + (watch.length
    ? '<div class="tscroll"><table class="gtab acttab"><thead><tr><th scope="col">Elev</th><th scope="col">Mest brukte spill</th><th scope="col" class="num">XP i perioden</th><th scope="col" class="num">Riktig</th><th scope="col" class="num">Raske svar</th><th scope="col">Hvorfor</th></tr></thead><tbody>' +
      watch.map((w) => '<tr><th scope="row">' + esc(names[w.sid] ?? 'Slettet elev') + '</th><td>' + esc(mname(w.topMode)) + '</td><td class="num">' + w.xp + '</td><td class="num">' + (w.a.answers ? pct(w.a.correct / w.a.answers) : '–') + '</td><td class="num">' + (FAST_S[w.topMode] && w.a.timed ? pct(w.a.fast / w.a.timed) : '–') + '</td><td>' + esc(w.reasons.join(', ')) + '</td></tr>').join('') +
      '</tbody></table></div>'
    : '<p class="muted">Ingen elever skiller seg ut i denne perioden.</p>');

  return headHTML + chips + lead + table + watchHTML + explain(theme) + '</section>';
}

function explain(theme: string): string {
  const T = THEMES[theme], name = (id: string) => T.modes.find((m) => m.id === id)?.name ?? id;
  return '<details><summary>Slik leses oversikten</summary><ul class="earn">' +
    '<li><b>Andel av XP</b> viser hvilke spill elevene tjener poengene sine i. Et spill som står for mye av XP-en, kan være populært, men det kan også bety at det er lett å samle poeng der.</li>' +
    '<li><b>Raske svar</b> er svar som kommer så fort at eleven neppe har lest spørsmålet: ' + Object.keys(FAST_S).filter((m) => T.modes.some((x) => x.id === m)).map((m) => esc(name(m)) + ' under ' + String(FAST_S[m]).replace('.', ',') + ' s').join(', ') + '. Over 40 % raske svar gir merknaden «Mange raske svar».</li>' +
    '<li><b>Treffer nær gjetting</b> betyr at andelen riktige er under 15 prosentpoeng over det man ville fått ved å gjette, for eksempel 50 % i Sant eller usant.</li>' +
    '<li>Spill med færre enn ' + MIN_ANSWERS + ' svar får ingen vurdering. Kortstokken gir ikke XP, men raske «Kan den»-trykk vises likevel.</li>' +
    '<li>Aktiviteten registreres fra og med oppdateringen 29. oktober 2026. Bare tall lagres, ikke hva eleven svarte.</li></ul></details>';
}
