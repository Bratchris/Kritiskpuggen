// Edge function: læreren oppretter elever, lager ny kode eller sletter en elev.
// Kjører med service-nøkkelen, men sjekker først at innlogget bruker eier klassen.
import { createClient } from 'npm:@supabase/supabase-js@2.45.4';

const DOMAIN = Deno.env.get('STUDENT_EMAIL_DOMAIN') ?? 'elev.puggen.invalid';
const WORDS = ['ugle', 'gresskar', 'fjell', 'bekk', 'elg', 'lykt', 'måne', 'stjerne', 'rev', 'ørn', 'skog', 'bølge', 'sopp', 'lyng', 'hare', 'tind', 'fjord', 'storm', 'ravn', 'gaupe'];
const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });
}
function newCode() {
  const a = new Uint32Array(2); crypto.getRandomValues(a);
  return WORDS[a[0] % WORDS.length] + '-' + String(100 + (a[1] % 900));
}
function slug(name: string) {
  const first = name.trim().split(/\s+/)[0] ?? 'elev';
  const s = first.toLowerCase().replace(/æ/g, 'ae').replace(/ø/g, 'o').replace(/å/g, 'a')
    .normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
  return (s || 'elev').slice(0, 16);
}
function studentEmail(username: string, classCode: string) {
  return `${username}.${classCode.toLowerCase()}@${DOMAIN}`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'Bruk POST' }, 405);

  const url = Deno.env.get('SUPABASE_URL')!;
  const auth = req.headers.get('Authorization') ?? '';
  const asUser = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: auth } } });
  const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } });

  const { data: who } = await asUser.auth.getUser();
  if (!who?.user) return json({ error: 'Du må være logget inn' }, 401);

  let body: any;
  try { body = await req.json(); } catch { return json({ error: 'Ugyldig forespørsel' }, 400); }

  // Klassen leses med lærerens egen tilgang: finnes den ikke, eier hen den ikke.
  async function ownClass(classId: string) {
    const { data } = await asUser.from('classes').select('id, code, teacher_id').eq('id', classId).maybeSingle();
    return data && data.teacher_id === who!.user!.id ? data : null;
  }
  async function studentInOwnClass(studentId: string) {
    const { data } = await admin.from('profiles').select('id, class_id, role').eq('id', studentId).maybeSingle();
    if (!data || data.role !== 'student') return null;
    return (await ownClass(data.class_id)) ? data : null;
  }

  if (body.action === 'create') {
    const cls = await ownClass(String(body.class_id ?? ''));
    if (!cls) return json({ error: 'Fant ikke klassen' }, 404);
    const names: string[] = (Array.isArray(body.names) ? body.names : [])
      .map((n: unknown) => String(n ?? '').trim().slice(0, 60)).filter(Boolean).slice(0, 60);
    if (!names.length) return json({ error: 'Skriv minst ett navn' }, 400);

    const { data: existing } = await admin.from('profiles').select('username').eq('class_id', cls.id);
    const taken = new Set((existing ?? []).map((r: { username: string }) => r.username));
    const out: { name: string; username: string; code: string; error?: string }[] = [];
    for (const name of names) {
      const base = slug(name);
      let username = base, k = 2;
      while (taken.has(username)) username = base + k++;
      taken.add(username);
      const code = newCode();
      const { error } = await admin.auth.admin.createUser({
        email: studentEmail(username, cls.code),
        password: code,
        email_confirm: true,
        app_metadata: { role: 'student', class_id: cls.id, username },
        user_metadata: { display_name: name },
      });
      out.push(error ? { name, username, code: '', error: error.message } : { name, username, code });
    }
    return json({ class_code: cls.code, students: out });
  }

  if (body.action === 'reset') {
    const st = await studentInOwnClass(String(body.student_id ?? ''));
    if (!st) return json({ error: 'Fant ikke eleven' }, 404);
    const code = newCode();
    const { error } = await admin.auth.admin.updateUserById(st.id, { password: code });
    if (error) return json({ error: error.message }, 500);
    return json({ code });
  }

  if (body.action === 'delete') {
    const st = await studentInOwnClass(String(body.student_id ?? ''));
    if (!st) return json({ error: 'Fant ikke eleven' }, 404);
    const { error } = await admin.auth.admin.deleteUser(st.id);
    if (error) return json({ error: error.message }, 500);
    return json({ ok: true });
  }

  if (body.action === 'delete_class') {
    // Sletter elevkontoene først, siden auth-brukere ikke slettes av databasen alene.
    const cls = await ownClass(String(body.class_id ?? ''));
    if (!cls) return json({ error: 'Fant ikke klassen' }, 404);
    const { data: studs } = await admin.from('profiles').select('id').eq('class_id', cls.id);
    for (const s of studs ?? []) await admin.auth.admin.deleteUser(s.id);
    const { error } = await admin.from('classes').delete().eq('id', cls.id);
    if (error) return json({ error: error.message }, 500);
    return json({ ok: true });
  }

  return json({ error: 'Ukjent handling' }, 400);
});
