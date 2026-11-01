import { achieve } from '../../achievements/engine';
import { $, esc, norm } from '../../lib/dom';
import { S, T, head, panel, save } from '../core';

/** Krav for achievementet «Filosof»: et ordentlig svar, ikke bare begrepene ramset opp. */
export const FILOSOF = { words: 40, sentences: 3, otherWords: 30, unique: 25 };

/** Sjekker om et svar holder til «Filosof». Returnerer tallene, så eleven kan se hva som mangler. */
export function judgeAnswer(text: string, keys: [string, string][]): { ok: boolean; words: number; sentences: number; keys: number } {
  const v = norm(text);
  // Ord med minst to bokstaver og en vokal. Tilfeldige tastetrykk som «sdfg» teller ikke.
  const words = text.toLowerCase().split(/[^a-zæøåéü0-9-]+/).filter((w) => w.length > 1 && /[aeiouyæøåé]/.test(w));
  const other = words.filter((w) => !keys.some((k) => w.indexOf(k[1].split(' ')[0]) > -1));
  // En setning må ha minst fire ord.
  const sentences = text.split(/[.!?]+/).filter((x) => x.trim().split(/\s+/).filter(Boolean).length >= 4).length;
  const nKeys = keys.filter((k) => v.indexOf(k[1]) > -1).length;
  const ok = keys.length > 0 && nKeys === keys.length && words.length >= FILOSOF.words && sentences >= FILOSOF.sentences &&
    other.length >= FILOSOF.otherWords && new Set(words).size >= FILOSOF.unique;
  return { ok, words: words.length, sentences, keys: nKeys };
}

export function renderThink(): void {
  const p = panel();
  p.innerHTML = head('tenk') + T.content.think.map((t) =>
    '<section class="think"><h3>' + esc(t.q) + '</h3><details><summary>Se hva teksten sier</summary><div class="cols">' +
    t.boxes.map((b) => '<div class="box"><h4>' + esc(b.h) + '</h4><ul>' + b.items.map((i) => '<li>' + esc(i) + '</li>').join('') + '</ul></div>').join('') +
    '</div></details><label class="lbl2" for="ta-' + t.id + '">Ditt svar</label><textarea id="ta-' + t.id + '" rows="5" maxlength="4000" placeholder="Skriv tre til fem setninger."></textarea><div class="keys" id="keys-' + t.id + '">' +
    t.keys.map((k) => '<span class="key">' + esc(k[0]) + '</span>').join('') + '</div><p class="keyhint">Begreper du bruker i svaret, lyser opp. Svaret lagres automatisk.</p><p class="keyhint filo" id="filo-' + t.id + '" aria-live="polite"></p></section>').join('');
  T.content.think.forEach((t) => {
    const ta = $('#ta-' + t.id);
    ta.value = S.notes[t.id] || '';
    const upd = () => {
      const v = norm(ta.value);
      $('#keys-' + t.id).querySelectorAll('.key').forEach((el: HTMLElement, i: number) => { el.classList.toggle('on', v.indexOf(t.keys[i][1]) > -1); });
      const j = judgeAnswer(ta.value, t.keys), f = $('#filo-' + t.id);
      if (j.ok) achieve('tenk_begreper');
      f.textContent = S.ach.has('tenk_begreper') || !S.achReady || !ta.value.trim() ? '' :
        'Achievementet «Filosof»: ' + Math.min(j.words, FILOSOF.words) + ' av ' + FILOSOF.words + ' ord, ' + Math.min(j.sentences, FILOSOF.sentences) + ' av ' + FILOSOF.sentences + ' setninger og ' + j.keys + ' av ' + t.keys.length + ' begreper.' +
        (j.words >= FILOSOF.words && j.sentences >= FILOSOF.sentences && j.keys === t.keys.length && !j.ok ? ' Forklar mer med egne ord.' : '');
    };
    ta.addEventListener('input', () => { S.notes[t.id] = ta.value; save(); upd(); });
    upd();
  });
}
