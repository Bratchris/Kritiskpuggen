// Enkle strekikoner (24 × 24) til menyen og spillflisene. Tegnet med currentColor.
export const ICON_PATHS: Record<string, string> = {
  hjem: '<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v10h5v-6h3v6h5V10"/>',
  kort: '<rect x="3.5" y="6" width="11" height="15" rx="2"/><path d="M9 3.5h9.5a2 2 0 0 1 2 2V18"/><path d="M7 11h4M7 14.5h4"/>',
  rom: '<path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 6H5.5a2.5 2.5 0 0 0 2.6 4M16 6h2.5a2.5 2.5 0 0 1-2.6 4"/><path d="M12 13v4M8.5 20.5h7M10 17h4v3.5h-4z"/>',
  butikk: '<path d="M4.5 8.5h15l-1.2 12h-12.6z"/><path d="M9 8.5V7a3 3 0 0 1 6 0v1.5"/>',
  top: '<path d="M3 20.5h18"/><path d="M4.5 20.5v-6h4.5v6M9.5 20.5V8.5h5v12M15 20.5v-8.5h4.5v8.5"/><path d="m12 3.5.7 1.5 1.6.2-1.2 1.1.3 1.6-1.4-.8-1.4.8.3-1.6-1.2-1.1 1.6-.2z"/>',
  innst: '<circle cx="12" cy="12" r="7.6" stroke-width="3.4" stroke-dasharray="2.6 3.36"/><circle cx="12" cy="12" r="5.6"/><circle cx="12" cy="12" r="2"/>',
  mynt: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="5.5"/><path d="M12 9.2v5.6"/>',
  stjerne: '<path d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"/>',
  quiz: '<path d="M4 4.5h16v11.5H10l-4.5 4v-4H4z"/><path d="M9.8 8.4a2.2 2.2 0 1 1 3.3 1.9c-.7.4-1.1.8-1.1 1.6M12 13.6v.1"/>',
  tf: '<path d="m3.5 12 3 3 5-6.5"/><path d="m14.5 8.5 6 6M20.5 8.5l-6 6"/>',
  par: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  memo: '<rect x="3" y="6.5" width="8.5" height="12" rx="1.6"/><rect x="12.5" y="5.5" width="8.5" height="12" rx="1.6"/><path d="M7.2 11.2v.1M16.8 10.2v.1"/>',
  ord: '<path d="M10 6.5h10M10 12h10M10 17.5h10"/><path d="M4 5.5 5.2 4.6v3.8M3.8 11.2a1 1 0 0 1 1.9.4L3.8 13.6h2M3.9 16.3h1.8l-1 1.2a1 1 0 1 1-.9 1.5"/>',
  sort: '<path d="M3.5 10.5h17l-2.2 9.5H5.7z"/><path d="m8 10.5 3-5.5M16 10.5l-3-5.5M9 14v2.5M12 14v2.5M15 14v2.5"/>',
  hull: '<path d="M4 6.5h16M4 12h4.5M15.5 12H20M4 17.5h10"/><rect x="9.6" y="10" width="4.8" height="4" rx="1" stroke-dasharray="1.6 1.2"/>',
  feil: '<circle cx="10.5" cy="10.5" r="6.2"/><path d="m15.2 15.2 5.3 5.3M8.5 8.5l4 4M12.5 8.5l-4 4"/>',
  tenk: '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0 0 12 3z"/>',
  dyr: '<ellipse cx="12" cy="13" rx="6.5" ry="8"/><path d="M9 11.5v.1M15 11.5v.1M10.5 15c.9.6 2.1.6 3 0"/>',
  person: '<circle cx="12" cy="8" r="4"/><path d="M4.5 20.5a7.5 7.5 0 0 1 15 0"/>',
  medalje: '<circle cx="12" cy="14.5" r="5.5"/><path d="M8.5 10 6 3.5h4l2 4.5M15.5 10 18 3.5h-4l-2 4.5"/>',
  pil: '<path d="M14.5 5 7.5 12l7 7"/>',
  lys: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/>',
  mork: '<path d="M19.5 14.5A8 8 0 1 1 9.5 4.5a6.5 6.5 0 0 0 10 10z"/>',
  auto: '<circle cx="12" cy="12" r="8.5"/><path d="M12 3.5v17a8.5 8.5 0 0 0 0-17z" fill="currentColor" stroke="none"/>',
};

export function icon(name: string, cls = ''): string {
  return '<svg class="ic ' + cls + '" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + (ICON_PATHS[name] || ICON_PATHS.quiz) + '</svg>';
}
