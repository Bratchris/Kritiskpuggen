import type { Theme } from '../types';
import * as C from './content';
import { ICONS, PRODUCTS } from './shop';
import { ITEMS, LEVELS, HOME } from './room';
import { EXTRA_ITEMS, EXTRA_LEVELS } from './room-extra';

export const nyrel: Theme = {
  id: 'nyrel',
  title: 'Nyreligiøspuggen',
  eyebrow: 'KRLE · nyreligiøsitet',
  sources: 'Alt innholdet er hentet fra tekstene «Hva er nyreligiøsitet?» og «Nyreligiøse praksiser», og refleksjonsoppgavene «Tenk og skriv om nyreligiøse praksiser» og «Hvilket stjernetegn er du?».',
  topics: [
    { k: 'h', name: 'Nyreligiøsitet', color: 'accent' },
    { k: 'o', name: 'Opprinnelsen', color: 'sand' },
    { k: 'r', name: 'Retninger', color: 'leaf' },
    { k: 'p', name: 'Praksiser', color: 'heat' },
  ],
  buckets: [
    { k: 'antro', name: 'Antroposofi', color: 'sand' },
    { k: 'newage', name: 'New age', color: 'accent' },
    { k: 'sjaman', name: 'Nysjamanisme', color: 'leaf' },
    { k: 'wicca', name: 'Wicca', color: 'heat' },
  ],
  stripes: ['#0f3a26', '#1f5c3a', '#2e7d4f', '#7a9a3a', '#c9a227', '#e3ad33', '#d64b3c', '#a8242a'],
  modes: C.MODES,
  content: { cards: C.CARDS, quiz: C.QUIZ, tf: C.TF, hull: C.HULL, pairs: C.PAIRS, order: C.ORDER, sort: C.SORT, think: C.THINK, feil: C.FEIL },
  shop: { products: PRODUCTS, icons: ICONS, shelfTitle: 'Lærerens julekurv', emptyText: 'Kurven er tom. Tjen poeng i øvelsene og velg den første julegaven.', goldId: 'gull' },
  room: {
    levels: [...LEVELS, ...EXTRA_LEVELS], items: { ...ITEMS, ...EXTRA_ITEMS }, defaultHome: HOME,
    windowArt: '<circle cx="96" cy="24" r="8" style="fill:#f6e7a8"/><path d="M0,48q20,-8 40,-2t40,-2 48,0V56H0z" style="fill:#eef4fb"/>' +
      '<circle cx="20" cy="18" r="1.4" style="fill:#fff"/><circle cx="44" cy="30" r="1.2" style="fill:#fff"/><circle cx="70" cy="14" r="1.4" style="fill:#fff"/><circle cx="84" cy="40" r="1.1" style="fill:#fff"/><circle cx="112" cy="34" r="1.3" style="fill:#fff"/><circle cx="30" cy="40" r="1" style="fill:#fff"/>',
    groups: [['mob', 'Møbler'], ['rug', 'Tepper'], ['art', 'Bilder og julepynt']],
    rooms: [
      { name: 'Stua', pos: 'g1', lv: 0, cls: '', home: HOME },
      { name: 'Stjernerommet', pos: 'g2', lv: 4, cls: 'rm-b', home: {
        hylle: { x: 0, y: 1, f: 1 }, lenestol: { x: 3, y: 2, f: 0 }, lampe: { x: 0, y: 4, f: 0 }, teppeB: { x: 3, y: 3, f: 0 }, bord: { x: 6, y: 4, f: 1 }, plante: { x: 7, y: 0, f: 0 },
        stjernetegn: { wl: 'L', s: 2 }, drommefanger: { wl: 'R', s: 1 }, nordlys: { wl: 'R', s: 3 } } },
      { name: 'Meditasjonsrommet', pos: 'base', lv: 8, cls: 'rm-k', window: false, home: {
        meditasjon: { x: 3, y: 3, f: 0 }, teppeC: { x: 1, y: 2, f: 0 }, teppeB: { x: 4, y: 1, f: 0 }, plante: { x: 7, y: 0, f: 0 }, lampe: { x: 0, y: 0, f: 0 },
        drommefanger: { wl: 'L', s: 3 }, stjernetegn: { wl: 'R', s: 2 } } },
      { name: 'Loftet', pos: 'loft', lv: 12, cls: 'rm-l', home: {
        lenestol: { x: 1, y: 1, f: 0 }, juletre: { x: 0, y: 0, f: 0 }, teppeA: { x: 4, y: 1, f: 0 }, puff: { x: 2, y: 3, f: 0 }, hylle: { x: 3, y: 7, f: 0 },
        krans: { wl: 'L', s: 4 }, vinter: { wl: 'R', s: 4 } } },
    ],
    ariaLabel: 'Isometrisk julestue med møbler, julepynt og trofeer',
  },
};
