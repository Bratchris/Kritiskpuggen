// Fanen «Achievements» i profilen: alle achievements, hva som er låst opp, og belønningene.
import { esc } from '../lib/dom';
import { S } from '../app/core';
import { ACHS, GROUPS, type Ach } from './catalog';
import { badgeSVG, rewardText, achProgress } from './engine';
import { avatarSVG } from '../avatar/render';
import { skinById } from '../avatar/catalog';
import { petSVG } from '../pets/render';
import type { Species } from '../pets/catalog';

function rewardArt(a: Ach): string {
  if (!a.reward) return '';
  if (a.reward.kind === 'pet') return petSVG(a.reward.species as Species, 'vanlig', 'rewart');
  const k = skinById(a.reward.id); if (!k) return '';
  return avatarSVG({ ...S.avatar, eq: { [k.slot]: k.id } }, { crop: k.slot === 'hat' || k.slot === 'face' ? 'head' : 'full', cls: 'rewart' });
}

export function achHTML(): string {
  if (!S.achReady) return '<p class="fb bad">Achievements er ikke klare ennå. Læreren må oppdatere databasen først.</p>';
  const n = ACHS.filter((a) => S.ach.has(a.id)).length;
  const card = (a: Ach) => {
    const on = S.ach.has(a.id), pr = on ? null : achProgress(a);
    return '<article class="achcard' + (on ? ' on' : '') + ' t' + a.tier + '">' + badgeSVG(a, !on) +
      '<div class="achbody"><h4>' + esc(a.name) + '</h4><p>' + esc(a.desc) + '</p>' +
      (pr !== null ? '<div class="eggbar" role="progressbar" aria-label="Fremdrift" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + Math.round(pr * 100) + '"><i style="width:' + Math.round(pr * 100) + '%"></i></div>' : '') +
      (a.reward ? '<div class="achreward' + (on ? '' : ' locked') + '">' + rewardArt(a) + '<span>' + (on ? 'Du fikk: ' : 'Belønning: ') + esc(rewardText(a)) + '</span></div>' : '') +
      (on ? '<span class="achdone">Låst opp</span>' : '') + '</div></article>';
  };
  return '<div class="achsum"><b>' + n + ' av ' + ACHS.length + '</b><span>achievements låst opp</span><div class="xpbar"><i style="width:' + Math.round((n / ACHS.length) * 100) + '%"></i></div></div>' +
    '<p class="keyhint">Noen achievements gir et kostyme eller et dyr som ikke kan kjøpes eller klekkes. Kostymene havner i garderoben, og dyrene i «Dyr og egg».</p>' +
    GROUPS.map((g) => '<h3 class="grp">' + esc(g.name) + '</h3><div class="achs">' + ACHS.filter((a) => a.group === g.id).map(card).join('') + '</div>').join('');
}
