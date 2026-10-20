// Felles tegnehjelpere for det isometriske rommet. 1 rute = 64 x 32 piksler.
export type Pt = [number, number];

export const COL: Record<string, string[]> = {
  wood: ['#d9b47a', '#b08850', '#8a6735'],
  stone: ['#e3e9ec', '#b7c3cb', '#8f9ca6'],
  ice: ['rgba(226,247,255,.95)', 'rgba(153,215,240,.92)', 'rgba(104,186,223,.94)'],
  water: ['rgba(205,241,255,.6)', 'rgba(125,202,236,.55)', 'rgba(84,172,216,.62)'],
};

export function iso(u: number, v: number, z: number): Pt { return [(u - v) * 32, (u + v) * 16 - z]; }
export function pts(a: Pt[]): string { return a.map((q) => q[0].toFixed(1) + ',' + q[1].toFixed(1)).join(' '); }
export function poly(a: Pt[], c: string): string { return '<polygon points="' + pts(a) + '" style="fill:' + c + '"/>'; }

export function box(a: number, b: number, z0: number, h: number, c: string[], cu = 0, cv = 0): string {
  const t1 = iso(cu - a, cv - b, z0 + h), t2 = iso(cu + a, cv - b, z0 + h), t3 = iso(cu + a, cv + b, z0 + h), t4 = iso(cu - a, cv + b, z0 + h);
  const b2 = iso(cu + a, cv - b, z0), b3 = iso(cu + a, cv + b, z0), b4 = iso(cu - a, cv + b, z0);
  return poly([t4, t3, b3, b4], c[1]) + poly([t3, t2, b2, b3], c[2]) + poly([t1, t2, t3, t4], c[0]);
}
export function cyl(r: number, z0: number, h: number, c: string[]): string {
  const rx = r * 45, ry = r * 22.5, y0 = -z0, y1 = -z0 - h;
  return '<path d="M' + (-rx) + ',' + y1 + 'V' + y0 + 'A' + rx + ',' + ry + ' 0 0 0 ' + rx + ',' + y0 + 'V' + y1 + 'Z" style="fill:' + c[1] + '"/><ellipse cx="0" cy="' + y1 + '" rx="' + rx + '" ry="' + ry + '" style="fill:' + c[0] + '"/>';
}
export function cone(r: number, z0: number, h: number, c: string): string {
  const rx = r * 45, ry = r * 22.5, y0 = -z0, y1 = -z0 - h;
  return '<path d="M' + (-rx) + ',' + y0 + 'A' + rx + ',' + ry + ' 0 0 0 ' + rx + ',' + y0 + 'L0,' + y1 + 'Z" style="fill:' + c + '"/>';
}

function hex(h: string) { return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; }
/** Farge langs en palett, t fra 0 til 1. */
export function gradient(palette: string[], t: number): string {
  const x = t * (palette.length - 1), i = Math.min(Math.floor(x), palette.length - 2), f = x - i;
  const a = hex(palette[i]), b = hex(palette[i + 1]);
  return 'rgb(' + a.map((v, k) => Math.round(v + (b[k] - v) * f)).join(',') + ')';
}
