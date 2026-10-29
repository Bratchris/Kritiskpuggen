import { $, esc, toast } from '../lib/dom';
import { friendly } from '../lib/supabase';
import { S, T, store, head, panel, owned, MODES, hooks } from './core';

export function icon(k: string): string {
  return '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (T.shop.icons[k] || '') + '</svg>';
}

let armTimer: number | undefined;
export function renderShop(): void {
  const sh = S.cur.shop || (S.cur.shop = { arm: null, msg: '', busy: false });
  const p = panel(), P = T.shop.products, bal = S.points - S.spent, own = owned(), gold = T.shop.goldId;
  const nxt = P.find((x) => x.price > bal) || null;
  const pct = nxt ? Math.min(100, Math.round(bal / nxt.price * 100)) : 100;
  let given = 0, shelf = '';
  P.forEach((x) => {
    const n = own[x.id] || 0;
    if (n) { given += n * x.price; shelf += '<div class="sitem' + (x.id === gold ? ' gold' : '') + '">' + icon(x.ic) + '<span>' + esc(x.name) + (n > 1 ? ' ×' + n : '') + '</span></div>'; }
  });
  const cards = P.map((x) => {
    const can = bal >= x.price, n = own[x.id] || 0, armed = sh.arm === x.id;
    return '<article class="prod"><div class="pic' + (x.id === gold ? ' gold' : '') + '">' + icon(x.ic) + '</div><h3>' + esc(x.name) + '</h3><p>' + esc(x.desc) + '</p><div class="pfoot"><span class="price">' + x.price + ' poeng</span>' + (n ? '<span class="own">Gitt ×' + n + '</span>' : '') + '</div>' +
      '<button class="btn' + (armed ? ' primary' : '') + '" data-buy="' + x.id + '" type="button"' + (can && !sh.busy ? '' : ' disabled') + '>' + (can ? (armed ? 'Bekreft gave' : 'Gi til læreren') : 'Mangler ' + (x.price - bal) + ' poeng') + '</button></article>';
  }).join('');
  const has = (id: string) => MODES.some((m) => m.id === id);
  p.innerHTML = head('shop') +
    '<div class="bal"><b>' + bal + '</b><span>poeng å bruke</span><span class="count">Opptjent totalt: ' + S.points + '</span></div>' +
    '<div class="meter" role="progressbar" aria-label="Fremdrift mot neste gave" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pct + '"><i style="width:' + pct + '%"></i></div>' +
    '<p class="keyhint" style="margin:0">' + (nxt ? 'Neste mål: ' + esc(nxt.name) + ', ' + (nxt.price - bal) + ' poeng til.' : 'Du har råd til alt i butikken.') + '</p>' +
    '<p class="msg" aria-live="polite">' + esc(sh.msg) + '</p>' +
    '<div class="shop">' + cards + '</div>' +
    '<section class="shelf"><h3>' + esc(T.shop.shelfTitle) + '</h3>' +
    (store.kind === 'preview' ? '<p class="keyhint">Forhåndsvisning: gavene lagres bare i denne nettleseren og sendes ikke til noen.</p>' : '<p class="keyhint">Gavene havner rett hos læreren når du bekrefter dem.</p>') +
    (shelf ? '<div class="shelfitems">' + shelf + '</div><p class="keyhint">Samlet verdi: ' + given + ' poeng</p>' : '<p class="keyhint">' + esc(T.shop.emptyText) + '</p>') +
    '</section>' +
    '<details style="margin-top:18px"><summary>Slik tjener du poeng</summary><ul class="earn"><li>Kortstokken gir ingen poeng, siden du bare vurderer deg selv. Bruk den til å øve før du tar oppgavene som gir poeng.</li><li>Quiz, Sant eller usant, Kurvene og Hull i teksten gir poeng for hvert spørsmål bare første gang du svarer riktig samme dag. Varier mellom spillene for å samle mer.</li><li>Quiz: 2 poeng for hvert riktige svar</li><li>Sant eller usant: 1 poeng for hvert riktige svar</li><li>Hull i teksten: 2 poeng, eller 1 hvis du brukte hint</li><li>Parkoblingen: opptil 6 poeng, minus ett for hver feil</li><li>Memory: 3 poeng for å fullføre, pluss opptil 3 ekstra hvis du bruker få forsøk</li><li>Rekkefølgen: 3 poeng for hver løste oppgave</li><li>Kurvene: 1 poeng for hver riktige kurv</li>' + (has('feil') ? '<li>Finn feilen: 3 poeng på første forsøk, 2 på andre og 1 på tredje</li>' : '') + '</ul></details>';

  p.querySelectorAll('[data-buy]').forEach((b: HTMLElement) => {
    b.onclick = async () => {
      const x = P.find((y) => y.id === b.dataset.buy)!;
      if (S.points - S.spent < x.price || sh.busy) return;
      clearTimeout(armTimer);
      if (sh.arm !== x.id) {
        sh.arm = x.id; sh.msg = 'Trykk «Bekreft gave» for å bruke ' + x.price + ' poeng på ' + x.name.toLowerCase() + '.';
        armTimer = window.setTimeout(() => { if (S.mode === 'shop' && sh.arm) { sh.arm = null; sh.msg = ''; renderShop(); } }, 6000);
        renderShop(); refocus(x.id); return;
      }
      sh.arm = null; sh.busy = true; sh.msg = 'Sender gaven …'; renderShop();
      try {
        const spent = await store.buy(T.id, x.id, x.price);
        S.spent = spent; S.gifts.push({ item_id: x.id, created_at: new Date().toISOString() });
        sh.msg = x.name + ' er gitt til læreren. Du brukte ' + x.price + ' poeng.';
        hooks.refresh();
      } catch (e) {
        sh.msg = 'Gaven ble ikke sendt: ' + friendly(e); toast('Gaven ble ikke sendt');
      }
      sh.busy = false;
      if (S.mode === 'shop') { renderShop(); refocus(x.id); }
    };
  });
}
function refocus(id: string) { const a = $('[data-buy="' + id + '"]'); if (a) a.focus({ preventScroll: true }); }
