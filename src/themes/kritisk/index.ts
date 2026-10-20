import type { Theme } from '../types';
import * as C from './content';
import { ICONS, PRODUCTS } from './shop';
import { ITEMS, LEVELS, HOME } from './room';

export const kritisk: Theme = {
  id: 'kritisk',
  title: 'Kritiskpuggen',
  eyebrow: 'KRLE · kritisk tenkning',
  sources: 'Alt innholdet er hentet fra tekstene «Å tro og å vite», «Å tenke kritisk», «Ulike perspektiver», «Sokrates’ metode», «Fakta, meninger og fordommer», «Kritisk blikk på religion» og «Religion og ytring».',
  topics: [
    { k: 'k', name: 'Tenke kritisk', color: 'accent' },
    { k: 'm', name: 'Metoder', color: 'leaf' },
    { k: 'r', name: 'Religionskritikk', color: 'sand' },
    { k: 'y', name: 'Ytringsfrihet', color: 'heat' },
  ],
  buckets: [
    { k: 'fakta', name: 'Fakta', color: 'leaf' },
    { k: 'mening', name: 'Mening', color: 'accent' },
    { k: 'fordom', name: 'Fordom', color: 'heat' },
  ],
  stripes: ['#2a1640', '#4b2470', '#7a3a9a', '#a855a8', '#d9733a', '#f08a24', '#f6b042', '#ffd77a'],
  modes: C.MODES,
  content: { cards: C.CARDS, quiz: C.QUIZ, tf: C.TF, hull: C.HULL, pairs: C.PAIRS, order: C.ORDER, sort: C.SORT, think: C.THINK, feil: C.FEIL },
  shop: { products: PRODUCTS, icons: ICONS, shelfTitle: 'Lærerens godteriskål', emptyText: 'Skålen er tom. Tjen poeng i øvelsene og velg det første godteriet.', goldId: 'gull' },
  room: {
    levels: LEVELS, items: ITEMS, defaultHome: HOME,
    windowArt: '<circle cx="96" cy="26" r="8" style="fill:#f6e7a8"/><circle cx="100" cy="23" r="7" style="fill:var(--sky)"/><circle cx="24" cy="22" r="1.2" style="fill:#f6e7a8"/><circle cx="44" cy="54" r="1" style="fill:#f6e7a8"/><circle cx="80" cy="52" r="1.2" style="fill:#f6e7a8"/><circle cx="110" cy="50" r="1" style="fill:#f6e7a8"/>',
    groups: [['mob', 'Møbler'], ['rug', 'Tepper'], ['art', 'Malerier og pynt']],
    ariaLabel: 'Isometrisk halloweenstue med møbler, veggkunst og trofeer',
  },
};
