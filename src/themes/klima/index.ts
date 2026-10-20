import type { Theme } from '../types';
import * as C from './content';
import { ICONS, PRODUCTS } from './shop';
import { ITEMS, LEVELS, HOME } from './room';

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
    levels: LEVELS, items: ITEMS, defaultHome: HOME,
    windowArt: '<circle cx="96" cy="26" r="6" style="fill:#ffd25a"/>',
    groups: [['mob', 'Møbler'], ['rug', 'Tepper'], ['art', 'Plakater og kunst']],
    ariaLabel: 'Isometrisk stue med møbler, veggkunst og trofeer',
  },
};
