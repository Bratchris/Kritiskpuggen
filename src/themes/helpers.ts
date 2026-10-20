import type { Card, QuizItem, TfItem, HullItem, SortItem, FeilItem } from './types';

export function cards(rows: [string, string, string][]): Card[] {
  return rows.map((c, i) => ({ id: i, t: c[0], q: c[1], a: c[2] }));
}
export function Q(t: string, q: string, a: string, w: string[], e: string): QuizItem { return { t, q, a, w, e }; }
export function T(t: string, s: string, v: boolean, e?: string): TfItem { return { t, s, v, e: e || 'Dette stemmer med teksten.' }; }
export function H(t: string, s: string, a: string[]): HullItem { return { t, s, a }; }
export function SI(text: string, b: string, e: string): SortItem { return { text, b, e }; }
export function F(t: string, src: string, sec: string, text: string, fix: string, e: string): FeilItem { return { t, src, sec, text, fix, e }; }
