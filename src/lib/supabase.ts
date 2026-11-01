import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const configured = Boolean(url && key);

// «Husk meg»: på egen enhet lagres innloggingen til brukeren logger ut (localStorage).
// På delte maskiner lagres den bare til nettleservinduet lukkes (sessionStorage).
const REMEMBER = 'puggen-remember';
export function remembers(): boolean { try { return localStorage.getItem(REMEMBER) !== '0'; } catch { return false; } }
export function setRemember(on: boolean): void {
  try {
    localStorage.setItem(REMEMBER, on ? '1' : '0');
    // Rydd bort en gammel innlogging fra det andre lageret.
    (on ? sessionStorage : localStorage).removeItem('puggen-auth');
  } catch { /* lagring er blokkert */ }
}
const mem: Record<string, string> = {};
function pick(): Storage | null { try { return remembers() ? localStorage : sessionStorage; } catch { return null; } }
const authStorage = {
  getItem: (k: string) => { const st = pick(); try { return st ? st.getItem(k) : mem[k] ?? null; } catch { return mem[k] ?? null; } },
  setItem: (k: string, v: string) => { const st = pick(); try { if (st) st.setItem(k, v); else mem[k] = v; } catch { mem[k] = v; } },
  removeItem: (k: string) => { delete mem[k]; try { localStorage.removeItem(k); sessionStorage.removeItem(k); } catch { /* ignorer */ } },
};

export const supabase = createClient(url || 'http://localhost', key || 'mangler', {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, storageKey: 'puggen-auth', storage: authStorage },
});

const DOMAIN = import.meta.env.VITE_STUDENT_EMAIL_DOMAIN || 'elev.puggen.invalid';
/** Må være lik STUDENT_EMAIL_DOMAIN i edge-funksjonen manage-students. */
export function studentEmail(username: string, classCode: string): string {
  return `${username.trim().toLowerCase()}.${classCode.trim().toLowerCase()}@${DOMAIN}`;
}

/** Sant for de interne adressene elevkontoene får. Brukes for å holde elever unna lærerrommet. */
export function isStudentEmail(email: string | undefined | null): boolean {
  return !!email && email.toLowerCase().endsWith('@' + DOMAIN.toLowerCase());
}

/** Gjør Supabase-feil om til en setning læreren eller eleven forstår. */
export function friendly(err: unknown): string {
  const m = String((err as { message?: string })?.message ?? err ?? '');
  if (/Invalid login credentials/i.test(m)) return 'Feil brukernavn, klassekode eller kode. Sjekk og prøv igjen.';
  if (/Email not confirmed/i.test(m)) return 'Bekreft e-postadressen din først. Se etter en e-post fra Supabase.';
  if (/User already registered/i.test(m)) return 'Det finnes allerede en konto med denne e-postadressen. Logg inn i stedet.';
  if (/Password should be/i.test(m)) return 'Passordet må ha minst 6 tegn.';
  if (/Failed to fetch|NetworkError/i.test(m)) return 'Får ikke kontakt med serveren. Sjekk nettet og prøv igjen.';
  return m || 'Noe gikk galt. Prøv igjen.';
}
