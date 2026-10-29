import type { Theme } from '../types';
import * as C from './content';
import { ICONS, PRODUCTS } from './shop';
import { ITEMS, LEVELS, HOME } from './room';
import { EXTRA_ITEMS, EXTRA_LEVELS } from './room-extra';

export const klima: Theme = {
  id: 'klima',
  title: 'Klimapuggen',
  eyebrow: 'Samfunnsfag · klima og bærekraft',
  sources: 'Alt innholdet er hentet fra tekstene «Samarbeid for framtiden», «Klimaendringer», «Bærekraftig utvikling» og «Klesindustriens kirkegård».',
  topics: [
    { k: 'k', name: 'Klima', color: 'leaf' },
    { k: 'b', name: 'Bærekraft', color: 'accent' },
    { k: 's', name: 'FN-samarbeid', color: 'sand' },
    { k: 'c', name: 'Klesfjellet', color: 'heat' },
  ],
  buckets: [
    { k: 'klima', name: 'Klima og miljø', color: 'leaf' },
    { k: 'sosial', name: 'Sosiale forhold', color: 'accent' },
    { k: 'okon', name: 'Økonomi', color: 'sand' },
    { k: 'alle', name: 'Alle tre', color: 'ink' },
  ],
  stripes: ['#08306b', '#2171b5', '#6baed6', '#c6dbef', '#fdd0b8', '#fc9272', '#ef3b2c', '#a50f15'],
  modes: C.MODES,
  content: { cards: C.CARDS, quiz: C.QUIZ, tf: C.TF, hull: C.HULL, pairs: C.PAIRS, order: C.ORDER, sort: C.SORT, think: C.THINK, feil: C.FEIL },
  shop: { products: PRODUCTS, icons: ICONS, shelfTitle: 'Lærerens kaffehjørne', emptyText: 'Hyllen er tom. Tjen poeng i øvelsene og velg den første gaven.', goldId: 'gull' },
  room: {
    levels: [...LEVELS, ...EXTRA_LEVELS], items: { ...ITEMS, ...EXTRA_ITEMS }, defaultHome: HOME,
    windowArt: '<circle cx="96" cy="26" r="6" style="fill:#ffd25a"/>',
    groups: [['mob', 'Møbler'], ['rug', 'Tepper'], ['art', 'Plakater og kunst']],
    rooms: [
      { name: 'Stua', pos: 'g1', lv: 0, cls: '', home: HOME },
      { name: 'Arbeidsrommet', pos: 'g2', lv: 4, cls: 'rm-b', home: {
        hylle: { x: 0, y: 1, f: 1 }, lenestol: { x: 3, y: 2, f: 0 }, lampe: { x: 0, y: 4, f: 0 }, teppeB: { x: 3, y: 3, f: 0 }, bord: { x: 6, y: 4, f: 1 }, plante: { x: 7, y: 0, f: 0 },
        venn: { wl: 'L', s: 3 }, kart: { wl: 'L', s: 5 }, klokke: { wl: 'R', s: 1 } } },
      { name: 'Verkstedet', pos: 'base', lv: 8, cls: 'rm-k', window: false, home: {
        tv: { x: 0, y: 2, f: 1 }, sofa: { x: 3, y: 0, f: 0 }, teppeA: { x: 3, y: 2, f: 0 }, puff: { x: 4, y: 5, f: 0 }, lampe: { x: 7, y: 0, f: 0 },
        temp: { wl: 'L', s: 2 }, stripes: { wl: 'R', s: 2 }, fjord: { wl: 'R', s: 5 } } },
      { name: 'Drivhuset', pos: 'loft', lv: 12, cls: 'rm-l', home: {
        lenestol: { x: 1, y: 1, f: 0 }, plante: { x: 0, y: 0, f: 0 }, teppeC: { x: 5, y: 1, f: 0 }, puff: { x: 2, y: 3, f: 0 }, hylle: { x: 3, y: 7, f: 0 },
        klokke: { wl: 'L', s: 4 }, fjord: { wl: 'R', s: 6 } } },
    ],
    ariaLabel: 'Isometrisk stue med møbler, veggkunst og trofeer',
  },
};
