import { $, esc, shuffle } from '../../lib/dom';
import { S, T, head, tag, inTopic, focusMain, panel, save, hooks } from '../core';

function start() {
  const all = T.content.cards.filter(inTopic);
  S.cur.kort = { deck: shuffle(all.filter((c) => S.known[c.id] !== 1)), flip: false, total: all.length };
}
export function renderKort(): void {
  if (!S.cur.kort) start();
  const k = S.cur.kort, p = panel();
  if (!k.deck.length) {
    p.innerHTML = head('kort') + '<div class="result"><p class="big">Alle ' + k.total + ' kort i dette emnet er mestret.</p><p>Du kan fortsette å repetere. Kortene kommer i ny rekkefølge.</p><button class="btn primary" data-focus id="k-again" type="button">Repeter alle</button></div>';
    $('#k-again').onclick = () => { k.deck = shuffle(T.content.cards.filter(inTopic)); k.flip = false; renderKort(); };
    return;
  }
  const c = k.deck[0];
  p.innerHTML = head('kort') +
    '<div class="meta">' + tag(c.t) + '<span class="count">' + k.deck.length + ' igjen</span></div>' +
    '<button class="flash ' + (k.flip ? 'back' : '') + '" id="flash" type="button"><span class="lab">' + (k.flip ? 'Svar' : 'Spørsmål') + '</span><span class="txt">' + esc(k.flip ? c.a : c.q) + '</span>' + (k.flip ? '' : '<span class="tip">Trykk for å se svaret</span>') + '</button>' +
    '<div class="row">' + (k.flip ? '<button class="btn" id="k-more" type="button">Øv mer</button><button class="btn primary" data-focus id="k-ok" type="button">Kan den</button>' : '<button class="btn primary" data-focus id="k-show" type="button">Vis svar</button>') + '</div>';
  $('#flash').onclick = () => { k.flip = !k.flip; renderKort(); };
  if (k.flip) {
    $('#k-more').onclick = () => { k.deck.push(k.deck.shift()); k.flip = false; renderKort(); };
    $('#k-ok').onclick = () => { S.known[c.id] = 1; save(); k.deck.shift(); k.flip = false; hooks.refresh(); renderKort(); };
  } else {
    $('#k-show').onclick = () => { k.flip = true; renderKort(); };
  }
  focusMain();
}
