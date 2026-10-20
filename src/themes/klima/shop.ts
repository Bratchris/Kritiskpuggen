import type { Product } from '../types';

export const ICONS: Record<string, string> = {
  kopp: '<path d="M10 18h24v10a10 10 0 0 1-10 10h-4a10 10 0 0 1-10-10z"/><path d="M34 21h3a5 5 0 0 1 0 10h-4"/><path d="M17 8c-2 2 2 4 0 6M24 8c-2 2 2 4 0 6M31 8c-2 2 2 4 0 6"/>',
  filter: '<path d="M9 14h30l-7 24H16z"/><path d="M13 14v-4h22v4"/><path d="M19 24h10"/>',
  bonner: '<path d="M14 12h20l3 28H11z"/><path d="M14 12l-1-4h22l-1 4"/><ellipse cx="24" cy="28" rx="5" ry="7" transform="rotate(30 24 28)"/><path d="M21 22c4 3 2 9 6 12"/>',
  termos: '<path d="M16 8h16v7H16z"/><path d="M17 15h14l-1 25H18z"/><path d="M17.5 26h13"/>',
  kvern: '<path d="M12 20h24v19H12z"/><path d="M16 20v-6h16v6"/><path d="M32 14l6-4"/><circle cx="40" cy="9" r="2"/><path d="M20 31h8"/>',
  skummer: '<path d="M24 6v20"/><path d="M19 6h10"/><path d="M17 26a7 4 0 0 0 14 0M17 32a7 4 0 0 0 14 0M17 38a7 4 0 0 0 14 0"/>',
  presse: '<path d="M14 15h20v25H14z"/><path d="M14 15l2-5h16l2 5"/><path d="M24 4v6M20 4h8"/><path d="M34 21h4a4 4 0 0 1 0 12h-4"/>',
  maskin: '<path d="M7 10h34v30H7z"/><path d="M7 21h34"/><path d="M19 21v9h10v-9"/><path d="M21 34h6v6h-6z"/><circle cx="13" cy="15.5" r="2"/>',
  gull: '<path d="M16 8h16v10a8 8 0 0 1-16 0z"/><path d="M16 11h-5a5 5 0 0 0 5 8M32 11h5a5 5 0 0 1-5 8"/><path d="M24 26v8M20 34h8M17 40h14"/>'
};
export const PRODUCTS: Product[] = [
  { id: 'kopp', name: 'Kaffekopp', price: 15, ic: 'kopp', desc: 'Første kopp. Alle store lærere starter et sted.' },
  { id: 'filter', name: 'Kaffefilter', price: 20, ic: 'filter', desc: 'Pakke med 100 filter. Nok til hele rettebunken.' },
  { id: 'bonner', name: 'Kaffebønner', price: 30, ic: 'bonner', desc: 'Mørkbrente bønner til lange rettekvelder.' },
  { id: 'termos', name: 'Termokopp', price: 45, ic: 'termos', desc: 'Holder kaffen varm helt til siste time.' },
  { id: 'kvern', name: 'Kaffekvern', price: 60, ic: 'kvern', desc: 'Ferskmalt kaffe smaker bedre. Karakterene blir kanskje det også.' },
  { id: 'skummer', name: 'Melkeskummer', price: 75, ic: 'skummer', desc: 'For en cappuccino med litt ekstra luft i.' },
  { id: 'presse', name: 'Presskanne', price: 90, ic: 'presse', desc: 'Kaffe til hele lærerrommet på en gang.' },
  { id: 'maskin', name: 'Espressomaskin', price: 180, ic: 'maskin', desc: 'Det store kjøpet. Krever mange runder med øving.' },
  { id: 'gull', name: 'Gullkoppen', price: 300, ic: 'gull', desc: 'Premie til de mest utholdende. Skal vises frem.' }
];
