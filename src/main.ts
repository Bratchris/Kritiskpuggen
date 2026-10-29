import './styles/base.css';
import './styles/app.css';
import './styles/themes.css';
import './styles/teacher.css';
import { $, esc } from './lib/dom';
import { supabase, configured, friendly, isStudentEmail } from './lib/supabase';
import { RemoteStore, PreviewStore } from './lib/store';
import { THEMES } from './themes';
import { renderLogin } from './auth/login';
import { mountApp } from './app/app';
import { mountTeacher } from './teacher/teacher';

const root = $('#app') as HTMLElement;
const LAST_THEME = 'puggen-last-theme';
let current = '';

async function route(): Promise<void> {
  if (!configured) {
    root.innerHTML = '<div class="wrap"><section class="panel"><h1 class="brand">Puggen er ikke satt opp ennå</h1><p>Legg inn <code>VITE_SUPABASE_URL</code> og <code>VITE_SUPABASE_ANON_KEY</code> som miljøvariabler i Vercel (eller i <code>.env.local</code> lokalt), og bygg på nytt. Se README.md.</p></section></div>';
    return;
  }
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) { current = ''; renderLogin(root); return; }
  const uid = session.user.id;
  if (current === uid) return;
  current = uid;

  const { data: me, error } = await supabase.from('profiles').select('id, role, display_name, class_id').eq('id', uid).maybeSingle();
  if (error || !me) {
    root.innerHTML = '<div class="wrap"><section class="panel"><h2>Fant ikke profilen din</h2><p>' + esc(error ? friendly(error) : 'Kontoen mangler profil. Kontakt læreren din.') + '</p><button class="btn" id="out" type="button">Logg ut</button></section></div>';
    $('#out').onclick = () => supabase.auth.signOut();
    return;
  }

  if (me.role === 'teacher' && isStudentEmail(session.user.email)) {
    // En elevkonto som feilaktig står som lærer, skal aldri se lærerrommet.
    root.innerHTML = '<div class="wrap"><section class="panel"><h2>Kontoen din er ikke ferdig satt opp</h2><p>Si fra til læreren, så ordner hen det. Du kan prøve å logge inn igjen etterpå.</p><button class="btn" id="out" type="button">Logg ut</button></section></div>';
    $('#out').onclick = () => supabase.auth.signOut();
    return;
  }

  if (me.role === 'teacher') {
    const openTeacher = () => mountTeacher(root, { id: me.id, name: me.display_name }, (theme) => {
      const store = new PreviewStore();
      void mountApp(root, THEMES[theme], store, {
        who: me.display_name + ' · forhåndsvisning', preview: true,
        onExit: () => { void openTeacher(); },
        onReset: () => { store.reset(theme); void openTeacher(); },
      });
      window.scrollTo(0, 0);
    });
    await openTeacher();
    return;
  }

  const { data: klass } = await supabase.from('classes').select('name, themes').eq('id', me.class_id).maybeSingle();
  const themes = (klass?.themes ?? []).filter((t: string) => THEMES[t]);
  if (!themes.length) {
    root.innerHTML = '<div class="wrap"><section class="panel"><h2>Ingen puggere ennå</h2><p>Læreren har ikke valgt noe tema for klassen din.</p><button class="btn" id="out" type="button">Logg ut</button></section></div>';
    $('#out').onclick = () => supabase.auth.signOut();
    return;
  }
  const store = new RemoteStore();
  const who = me.display_name + (klass?.name ? ' · ' + klass.name : '');
  const open = (theme: string) => {
    try { localStorage.setItem(LAST_THEME, theme); } catch { /* ignorer */ }
    void mountApp(root, THEMES[theme], store, {
      who,
      onSwitchTheme: themes.length > 1 ? pick : undefined,
      onLogout: () => { void supabase.auth.signOut(); },
    });
  };
  function pick() {
    document.documentElement.dataset.tema = '';
    root.innerHTML = '<div class="wrap"><header class="apphead"><div class="topbar"><p class="eyebrow">' + esc(who) + '</p><div class="who"><button class="lnk" id="out" type="button">Logg ut</button></div></div><h1 class="brand">Hva vil du øve på?</h1></header>' +
      '<div class="themepick">' + themes.map((t: string) => '<button class="tpick" type="button" data-pick="' + t + '" data-tema-card="' + t + '"><span class="eyebrow">' + esc(THEMES[t].eyebrow) + '</span><b>' + esc(THEMES[t].title) + '</b><span>' + THEMES[t].content.cards.length + ' kort · ' + THEMES[t].room.levels.length + ' nivåer</span></button>').join('') + '</div></div>';
    $('#out').onclick = () => supabase.auth.signOut();
    root.querySelectorAll<HTMLElement>('[data-pick]').forEach((b) => { b.onclick = () => open(b.dataset.pick!); });
  }
  let last = '';
  try { last = localStorage.getItem(LAST_THEME) || ''; } catch { /* ignorer */ }
  if (themes.length === 1) open(themes[0]);
  else if (themes.includes(last)) open(last);
  else pick();
}

supabase.auth.onAuthStateChange((event) => {
  if (event === 'PASSWORD_RECOVERY') { current = ''; renderLogin(root, 'nytt-passord'); return; }
  if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') setTimeout(() => { void route(); }, 0);
});
void route();
