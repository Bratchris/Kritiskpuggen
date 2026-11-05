import type { Product } from '../types';

// Strektegninger, 48 x 48. Prisene må stemme med shop_items i databasen.
export const ICONS: Record<string, string> = {
  pepperkake: '<path d="M24 41C12 32 6 25 6 17a9 9 0 0 1 18-3 9 9 0 0 1 18 3c0 8-6 15-18 24z"/><path d="M12 18q3-4 6 0q3 4 6 0q3-4 6 0q3 4 6 0"/>',
  klementin: '<circle cx="24" cy="27" r="14"/><path d="M24 13c0-4 2-6 5-7M24 13c-4-3-9-2-11 1 4 2 8 2 11-1z"/><path d="M17 25h.01M29 31h.01M24 22h.01"/>',
  marsipan: '<ellipse cx="23" cy="28" rx="15" ry="10"/><circle cx="38" cy="27" r="4"/><path d="M37 27h.01M40 27h.01M14 19l-2-5 6 3M26 18l2-5 3 6M15 38v4M29 38v4"/><path d="M8 27c-3 0-4 3-2 4"/>',
  glogg: '<path d="M11 15h22v14a11 11 0 0 1-22 0z"/><path d="M33 19h3a5 5 0 0 1 0 10h-3"/><path d="M16 9c-2 2 2 3 0 5M23 7c-2 2 2 3 0 5M30 9c-2 2 2 3 0 5"/><path d="M16 22h12"/>',
  lys: '<path d="M17 18h14v24H17z"/><path d="M24 18v-4"/><path d="M24 4c-3 4-3 7 0 8 3-1 3-4 0-8z"/><path d="M12 42h24M20 26c2 1 6 1 8 0"/>',
  krystall: '<path d="M24 5l9 10-4 26h-10l-4-26z"/><path d="M15 15h18M24 5v36M10 25l5-6 3 22h-5zM38 25l-5-6-3 22h5z"/>',
  kaker: '<path d="M8 20h32v18a3 3 0 0 1-3 3H11a3 3 0 0 1-3-3z"/><path d="M6 14h36v6H6z"/><circle cx="16" cy="30" r="4"/><path d="M27 26h8l-4 8z"/><path d="M18 14c0-5 12-5 12 0"/>',
  pepperkakehus: '<path d="M8 22L24 8l16 14"/><path d="M11 20v20h26V20"/><path d="M20 40v-9h8v9"/><path d="M15 25h5v4h-5zM28 25h5v4h-5z"/><path d="M8 22q4 4 8 0q4 4 8 0q4 4 8 0q4 4 8 0"/>',
  stjerne: '<path d="M24 4l5.5 12.5L43 18l-10 9.5 2.6 13.5L24 34.5 12.4 41l2.6-13.5L5 18l13.5-1.5z"/><path d="M24 14v12M18 21h12"/>',
};
export const PRODUCTS: Product[] = [
  { id: 'pepperkake', name: 'Pepperkakehjerte', price: 15, ic: 'pepperkake', desc: 'Med hvit glasur. Et lite hjerte til en travel lærer.' },
  { id: 'klementin', name: 'Klementin', price: 20, ic: 'klementin', desc: 'Lukten av desember. Skrelles i ett stykke, for lykke.' },
  { id: 'marsipangris', name: 'Marsipangris', price: 30, ic: 'marsipan', desc: 'Prisen for mandelen i grøten.' },
  { id: 'glogg', name: 'Kopp gløgg', price: 45, ic: 'glogg', desc: 'Varm og krydret, med rosiner og mandler.' },
  { id: 'duftlys', name: 'Duftlys med kanel', price: 60, ic: 'lys', desc: 'Lys i mørketida. Til indre ro mellom rettebunkene.' },
  { id: 'krystall', name: 'Krystall', price: 75, ic: 'krystall', desc: 'Ifølge healere gir den energi. Ifølge kritikerne er den bare pen. Begge kan ha den i vinduskarmen.' },
  { id: 'syvslag', name: 'Sju slag kaker', price: 90, ic: 'kaker', desc: 'En hel boks. Nok til hele lærerrommet.' },
  { id: 'pepperkakehus', name: 'Pepperkakehus', price: 180, ic: 'pepperkakehus', desc: 'Det store kjøpet. Med melisglasur, sukkertøy og lys i vinduene.' },
  { id: 'gull', name: 'Den gylne julestjernen', price: 300, ic: 'stjerne', desc: 'Lyser på toppen av treet. Premie til de mest utholdende.' },
];
