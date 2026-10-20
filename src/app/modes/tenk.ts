import { $, esc, norm } from '../../lib/dom';
import { S, T, head, panel, save } from '../core';

export function renderThink(): void {
  const p = panel();
  p.innerHTML = head('tenk') + T.content.think.map((t) =>
    '<section class="think"><h3>' + esc(t.q) + '</h3><details><summary>Se hva teksten sier</summary><div class="cols">' +
    t.boxes.map((b) => '<div class="box"><h4>' + esc(b.h) + '</h4><ul>' + b.items.map((i) => '<li>' + esc(i) + '</li>').join('') + '</ul></div>').join('') +
    '</div></details><label class="lbl2" for="ta-' + t.id + '">Ditt svar</label><textarea id="ta-' + t.id + '" rows="5" maxlength="4000" placeholder="Skriv tre til fem setninger."></textarea><div class="keys" id="keys-' + t.id + '">' +
    t.keys.map((k) => '<span class="key">' + esc(k[0]) + '</span>').join('') + '</div><p class="keyhint">Begreper du bruker i svaret, lyser opp. Svaret lagres automatisk.</p></section>').join('');
  T.content.think.forEach((t) => {
    const ta = $('#ta-' + t.id);
    ta.value = S.notes[t.id] || '';
    const upd = () => { const v = norm(ta.value); $('#keys-' + t.id).querySelectorAll('.key').forEach((el: HTMLElement, i: number) => { el.classList.toggle('on', v.indexOf(t.keys[i][1]) > -1); }); };
    ta.addEventListener('input', () => { S.notes[t.id] = ta.value; save(); upd(); });
    upd();
  });
}
