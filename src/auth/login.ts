// Innlogging. Elever bruker klassekode + brukernavn + kode fra læreren.
// Lærere har en vanlig konto med e-post og passord.
import { $, esc } from '../lib/dom';
import { supabase, studentEmail, friendly, remembers, setRemember } from '../lib/supabase';
import { showPrivacy } from '../privacy';

const LAST = 'puggen-last-login';

export function renderLogin(root: HTMLElement, mode: 'elev' | 'laerer' | 'ny' | 'glemt' | 'nytt-passord' = 'elev', notice = ''): void {
  document.documentElement.dataset.tema = '';
  let last: { klasse?: string; bruker?: string } = {};
  try { if (remembers()) last = JSON.parse(localStorage.getItem(LAST) || '{}'); } catch { /* ingen */ }

  const tabs = mode === 'nytt-passord' ? '' :
    '<div class="authtabs" role="tablist"><button type="button" role="tab" class="atab" data-a="elev" aria-selected="' + (mode === 'elev') + '">Elev</button>' +
    '<button type="button" role="tab" class="atab" data-a="laerer" aria-selected="' + (mode !== 'elev') + '">Lærer</button></div>';

  let form = '';
  if (mode === 'elev') {
    form = '<form id="f" class="aform"><p class="ahelp">Du får klassekoden, brukernavnet og koden din av læreren.</p>' +
      field('klasse', 'Klassekode', 'text', last.klasse || '', 'characters', 'off', 'F.eks. K7RQ2M') +
      field('bruker', 'Brukernavn', 'text', last.bruker || '', 'none', 'username', '') +
      field('kode', 'Kode', 'password', '', 'none', 'current-password', 'F.eks. ugle-4821') + rememberBox() +
      '<button class="btn primary" type="submit">Logg inn</button></form>';
  } else if (mode === 'laerer') {
    form = '<form id="f" class="aform">' + field('epost', 'E-post', 'email', '', 'none', 'email', '') + field('pw', 'Passord', 'password', '', 'none', 'current-password', '') +
      rememberBox() + '<button class="btn primary" type="submit">Logg inn</button><div class="alinks"><button class="lnk" type="button" data-a="ny">Opprett lærerkonto</button><button class="lnk" type="button" data-a="glemt">Glemt passord?</button></div></form>';
  } else if (mode === 'ny') {
    form = '<form id="f" class="aform"><p class="ahelp">Lærerkontoen brukes til å lage klasser, elevkoder og se fremgang. Elever trenger ikke konto.</p>' +
      field('navn', 'Navnet ditt', 'text', '', 'words', 'name', '') + field('epost', 'E-post', 'email', '', 'none', 'email', '') + field('pw', 'Passord (minst 8 tegn)', 'password', '', 'none', 'new-password', '') +
      '<button class="btn primary" type="submit">Opprett konto</button><div class="alinks"><button class="lnk" type="button" data-a="laerer">Har du konto? Logg inn</button></div></form>';
  } else if (mode === 'glemt') {
    form = '<form id="f" class="aform"><p class="ahelp">Du får en e-post med lenke for å lage nytt passord.</p>' + field('epost', 'E-post', 'email', '', 'none', 'email', '') +
      '<button class="btn primary" type="submit">Send lenke</button><div class="alinks"><button class="lnk" type="button" data-a="laerer">Tilbake til innlogging</button></div></form>';
  } else {
    form = '<form id="f" class="aform"><p class="ahelp">Lag et nytt passord for lærerkontoen din.</p>' + field('pw', 'Nytt passord (minst 8 tegn)', 'password', '', 'none', 'new-password', '') +
      '<button class="btn primary" type="submit">Lagre passord</button></form>';
  }

  root.innerHTML = '<div class="wrap authwrap"><header class="authhead"><p class="eyebrow">Puggen</p><h1 class="brand">Logg inn og øv</h1>' +
    '<p class="lede">Klimapuggen og Kritiskpuggen samlet på ett sted. Fremgangen din lagres, så du kan fortsette der du slapp, på hvilken som helst enhet.</p></header>' +
    '<main class="panel authpanel">' + tabs + (notice ? '<p class="fb ok" role="status">' + esc(notice) + '</p>' : '') + form + '<p class="msg" id="amsg" role="alert"></p></main>' +
    '<p class="authfoot"><button class="lnk" type="button" id="priv">Personvern: hva lagres om deg?</button></p></div>';

  root.querySelectorAll<HTMLElement>('[data-a]').forEach((b) => { b.onclick = () => renderLogin(root, b.dataset.a as any); });
  $('#priv').onclick = () => showPrivacy();
  const f = $('#f') as HTMLFormElement, msg = $('#amsg');
  const remember = () => { const c = $('#remember') as HTMLInputElement | null; return c ? c.checked : true; };
  const btn = f.querySelector('button[type=submit]') as HTMLButtonElement;
  f.onsubmit = async (e) => {
    e.preventDefault();
    msg.textContent = ''; btn.disabled = true;
    const v = (id: string) => String(($('#' + id) as HTMLInputElement).value || '').trim();
    try {
      if (mode === 'elev') {
        const klasse = v('klasse').toUpperCase(), bruker = v('bruker').toLowerCase(), kode = v('kode').toLowerCase();
        if (!klasse || !bruker || !kode) throw new Error('Fyll ut alle tre feltene.');
        setRemember(remember());
        try { if (remember()) localStorage.setItem(LAST, JSON.stringify({ klasse, bruker })); else localStorage.removeItem(LAST); } catch { /* ignorer */ }
        const { error } = await supabase.auth.signInWithPassword({ email: studentEmail(bruker, klasse), password: kode });
        if (error) throw error;
      } else if (mode === 'laerer') {
        setRemember(remember());
        const { error } = await supabase.auth.signInWithPassword({ email: v('epost'), password: v('pw') });
        if (error) throw error;
      } else if (mode === 'ny') {
        if (v('pw').length < 8) throw new Error('Passordet må ha minst 8 tegn.');
        const { data, error } = await supabase.auth.signUp({ email: v('epost'), password: v('pw'), options: { data: { display_name: v('navn') }, emailRedirectTo: location.origin } });
        if (error) throw error;
        if (!data.session) { renderLogin(root, 'laerer', 'Kontoen er opprettet. Bekreft e-postadressen din via lenken vi sendte, og logg så inn.'); return; }
      } else if (mode === 'glemt') {
        const { error } = await supabase.auth.resetPasswordForEmail(v('epost'), { redirectTo: location.origin });
        if (error) throw error;
        renderLogin(root, 'laerer', 'Hvis det finnes en konto med denne adressen, har vi sendt en lenke for nytt passord.'); return;
      } else {
        if (v('pw').length < 8) throw new Error('Passordet må ha minst 8 tegn.');
        const { error } = await supabase.auth.updateUser({ password: v('pw') });
        if (error) throw error;
        location.reload(); return;
      }
    } catch (err) {
      msg.textContent = friendly(err);
      btn.disabled = false;
    }
  };
}

function rememberBox(): string {
  return '<label class="check remember"><input type="checkbox" id="remember"' + (remembers() ? ' checked' : '') + '><span><b>Husk meg på denne enheten</b><small>Ta bort haken på en PC som andre også bruker. Da logges du ut når nettleseren lukkes.</small></span></label>';
}

function field(id: string, label: string, type: string, value: string, cap: string, ac: string, ph: string): string {
  return '<label class="afield" for="' + id + '"><span>' + esc(label) + '</span><input id="' + id + '" type="' + type + '" value="' + esc(value) + '" autocapitalize="' + cap + '" autocomplete="' + ac + '" spellcheck="false"' + (ph ? ' placeholder="' + esc(ph) + '"' : '') + ' required></label>';
}
