import type { Theme } from '../types';
import * as C from './content';
import { ICONS, PRODUCTS } from './shop';
import { ITEMS, LEVELS, HOME } from './room';
import { EXTRA_ITEMS, EXTRA_LEVELS } from './room-extra';

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
    levels: [...LEVELS, ...EXTRA_LEVELS], items: { ...ITEMS, ...EXTRA_ITEMS }, defaultHome: HOME,
    windowArt: '<circle cx="96" cy="26" r="8" style="fill:#f6e7a8"/><circle cx="100" cy="23" r="7" style="fill:var(--sky)"/><circle cx="24" cy="22" r="1.2" style="fill:#f6e7a8"/><circle cx="44" cy="54" r="1" style="fill:#f6e7a8"/><circle cx="80" cy="52" r="1.2" style="fill:#f6e7a8"/><circle cx="110" cy="50" r="1" style="fill:#f6e7a8"/>',
    groups: [['mob', 'Møbler'], ['rug', 'Tepper'], ['art', 'Malerier og pynt']],
    rooms: [
      { name: 'Stua', pos: 'g1', lv: 0, cls: '', home: HOME },
      { name: 'Biblioteket', pos: 'g2', lv: 4, cls: 'rm-b', home: {
        hylle: { x: 0, y: 1, f: 1 }, lenestol: { x: 3, y: 2, f: 0 }, lampe: { x: 0, y: 4, f: 0 }, teppeB: { x: 3, y: 3, f: 0 }, bord: { x: 6, y: 4, f: 1 }, plante: { x: 7, y: 0, f: 0 },
        portrett: { wl: 'L', s: 3 }, kirkegard: { wl: 'L', s: 5 }, klokke: { wl: 'R', s: 1 } } },
      { name: 'Kjelleren', pos: 'base', lv: 8, cls: 'rm-k', window: false, home: {
        tv: { x: 0, y: 2, f: 1 }, sofa: { x: 3, y: 0, f: 0 }, teppeA: { x: 3, y: 2, f: 0 }, puff: { x: 4, y: 5, f: 0 }, lampe: { x: 7, y: 0, f: 0 },
        hus: { wl: 'L', s: 2 }, girlander: { wl: 'R', s: 2 }, mane: { wl: 'R', s: 5 } } },
      { name: 'Loftet', pos: 'loft', lv: 12, cls: 'rm-l', home: {
        lenestol: { x: 1, y: 1, f: 0 }, lampe: { x: 0, y: 0, f: 0 }, teppeC: { x: 5, y: 1, f: 0 }, puff: { x: 2, y: 3, f: 0 }, hylle: { x: 3, y: 7, f: 0 },
        klokke: { wl: 'L', s: 4 }, mane: { wl: 'R', s: 6 } } },
    ],
    ariaLabel: 'Isometrisk halloweenstue med møbler, veggkunst og trofeer',
  },
};
