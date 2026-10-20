import type { Product } from '../types';

export const ICONS: Record<string, string> = {
  laban: '<path d="M12 40V22a12 12 0 0 1 24 0v18l-4-3-4 3-4-3-4 3-4-3z"/><circle cx="19.5" cy="22" r="1.6"/><circle cx="28.5" cy="22" r="1.6"/><path d="M21 29c2 1.5 4 1.5 6 0"/>',
  seigmann: '<circle cx="24" cy="10" r="5"/><path d="M19 17h10l8 6-2 3-6-3v6l5 13h-4l-6-10-6 10h-4l5-13v-6l-6 3-2-3z"/>',
  bamse: '<circle cx="24" cy="28" r="12"/><circle cx="14" cy="17" r="4"/><circle cx="34" cy="17" r="4"/><circle cx="20" cy="26" r="1.4"/><circle cx="28" cy="26" r="1.4"/><path d="M21 32c2 2 4 2 6 0"/>',
  kvikk: '<path d="M7 16h34v16H7z"/><path d="M15.5 16v16M24 16v16M32.5 16v16"/><path d="M7 20l-3-2M7 28l-3 2M41 20l3-2M41 28l3 2"/>',
  smash: '<path d="M13 19h22L24 43z"/><path d="M13 19c0-6 5-10 11-10s11 4 11 10"/><path d="M18 26h12M21 33h6"/>',
  stratos: '<path d="M10 9h28v30H10z"/><circle cx="18" cy="18" r="3"/><circle cx="29" cy="19" r="2"/><circle cx="20" cy="30" r="2"/><circle cx="30" cy="30" r="3.5"/>',
  twist: '<ellipse cx="24" cy="24" rx="10" ry="7"/><path d="M14 24l-9-6v12zM34 24l9-6v12z"/><path d="M20 20l8 8"/>',
  pose: '<path d="M12 16h24l3 26H9z"/><path d="M12 16l2-6h20l2 6"/><circle cx="18" cy="32" r="2.5"/><circle cx="28" cy="35" r="2.5"/><circle cx="24" cy="26" r="2"/><path d="M30 25l3 3M15 37l3-2"/>',
  botte: '<path d="M10 21C10 7 38 7 38 21"/><path d="M8 21h32l-3 13a13 8 0 0 1-26 0z"/><path d="M17 26l3 3.5h-6zM31 26l-3 3.5h6zM17 34l3.5-2 3.5 2 3.5-2 3.5 2"/>'
};
export const PRODUCTS: Product[] = [
  { id: 'laban', name: 'Laban', price: 15, ic: 'laban', desc: 'Små spøkelser i gelé. Et forsiktig første skrekkøyeblikk.' },
  { id: 'seigmenn', name: 'Seigmenn', price: 20, ic: 'seigmann', desc: 'Bit av hodet først, akkurat som en ekte zombie.' },
  { id: 'bamsemums', name: 'Bamsemums', price: 30, ic: 'bamse', desc: 'Myke bjørner som holder læreren våken gjennom rettebunken.' },
  { id: 'kvikklunsj', name: 'Kvikk Lunsj', price: 45, ic: 'kvikk', desc: 'Turmat for læreren som går på spøkelsesjakt i mørket.' },
  { id: 'smash', name: 'Smash!', price: 60, ic: 'smash', desc: 'Salt og søtt på en gang. Ingen vet helt hvorfor det funker.' },
  { id: 'stratos', name: 'Stratos', price: 75, ic: 'stratos', desc: 'Luftig sjokolade. Som et spøkelse: mer luft enn innhold.' },
  { id: 'twist', name: 'Twist-pose', price: 90, ic: 'twist', desc: 'Nok til hele lærerrommet, og ingen krangel om favorittene.' },
  { id: 'smagodt', name: 'Kilo med smågodt', price: 180, ic: 'pose', desc: 'Det store kjøpet. Rekker til alle som ringer på og sier «knask eller knep».' },
  { id: 'gull', name: 'Den gylne gresskarbøtta', price: 300, ic: 'botte', desc: 'Fylt til randen. Premie til de mest utholdende.' }
];
