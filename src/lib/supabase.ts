import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const configured = Boolean(url && key);

// persistSession + autoRefreshToken: innloggingen huskes på enheten til brukeren logger ut.
export const supabase = createClient(url || 'http://localhost', key || 'mangler', {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, storageKey: 'puggen-auth' },
});

const DOMAIN = import.meta.env.VITE_STUDENT_EMAIL_DOMAIN || 'elev.puggen.invalid';
/** Må være lik STUDENT_EMAIL_DOMAIN i edge-funksjonen manage-students. */
export function studentEmail(username: string, classCode: string): string {
  return `${username.trim().toLowerCase()}.${classCode.trim().toLowerCase()}@${DOMAIN}`;
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
