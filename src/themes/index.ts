import type { Theme, RoomDef } from './types';
import { kritisk } from './kritisk';
import { klima } from './klima';

function finalize(t: Theme): Theme {
  const r: RoomDef = t.room;
  Object.keys(r.items).forEach((id) => { r.items[id].lv = -1; });
  r.levels.forEach((L, i) => L.t.forEach((id) => { r.items[id].lv = i; r.items[id].cat = 'tro'; }));
  return t;
}

export const THEMES: Record<string, Theme> = {
  kritisk: finalize(kritisk),
  klima: finalize(klima),
};
export const THEME_IDS = Object.keys(THEMES);
export function themeName(id: string): string { return THEMES[id]?.title ?? id; }
