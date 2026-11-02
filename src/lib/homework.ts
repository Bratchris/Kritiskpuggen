// Fremgang i en lekse. Brukes både i elevappen og i lærerrommet, så tallene blir like.
import type { Theme } from '../themes/types';

export interface HwProgress { cards: number; cardsOf: number; quiz: number; quizOf: number; pct: number; done: boolean; started: boolean }

/** Kortene eleven kan i emnet (known) og quizspørsmålene i emnet med minst ett riktig svar (qok). */
export function topicProgress(T: Theme, topic: string, known: Record<string, 1> = {}, qok: number[] = []): HwProgress {
  const C = T.content, cards = C.cards.filter((c) => c.t === topic), qi: number[] = [];
  C.quiz.forEach((q, i) => { if (q.t === topic) qi.push(i); });
  const k = cards.filter((c) => known[c.id] === 1).length, q = qi.filter((i) => qok.includes(i)).length;
  const all = cards.length + qi.length, pct = all ? (k + q) / all : 1;
  return { cards: k, cardsOf: cards.length, quiz: q, quizOf: qi.length, pct, done: pct >= 1, started: k + q > 0 };
}
