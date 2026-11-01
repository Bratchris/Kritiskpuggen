// Achievements. Noen gir et kostyme eller et dyr som bare kan fås på denne måten.
// id-ene og belønningene må stemme med unlock_achievement i supabase/migrations/20261101000000_achievements.sql.

export type Reward = { kind: 'skin'; id: string } | { kind: 'pet'; species: string };
export interface Ach {
  id: string;
  name: string;
  desc: string;
  /** 1 = bronse, 2 = sølv, 3 = gull. */
  tier: 1 | 2 | 3;
  /** Ikon fra app/icons.ts. */
  ic: string;
  group: 'spill' | 'fremgang' | 'samling';
  reward?: Reward;
  /** Mål for fremdriftslinjen, regnet ut i engine.ts. */
  goal?: number;
}

export const ACHS: Ach[] = [
  // Mestre spillene
  { id: 'quiz_perfekt', group: 'spill', ic: 'quiz', tier: 2, name: 'Quizmester', desc: 'Få alle riktige i en quizrunde.', reward: { kind: 'skin', id: 'ach_krone' } },
  { id: 'tf_perfekt', group: 'spill', ic: 'tf', tier: 2, name: 'Løgnjeger', desc: 'Få alle riktige i en runde Sant eller usant.', reward: { kind: 'skin', id: 'ach_medalje' } },
  { id: 'par_feilfri', group: 'spill', ic: 'par', tier: 1, name: 'Feilfri kobling', desc: 'Koble alle parene uten en eneste feil.' },
  { id: 'memo_skarp', group: 'spill', ic: 'memo', tier: 2, name: 'Elefanthukommelse', desc: 'Finn alle parene i Memory på 8 forsøk eller færre.', reward: { kind: 'pet', species: 'elefant' } },
  { id: 'ord_forste', group: 'spill', ic: 'ord', tier: 1, name: 'Tidsreisende', desc: 'Sett en rekkefølge riktig på første forsøk.' },
  { id: 'sort_perfekt', group: 'spill', ic: 'sort', tier: 2, name: 'Kurvekonge', desc: 'Legg alle utsagnene i riktig kurv i en runde.', reward: { kind: 'pet', species: 'rev' } },
  { id: 'hull_perfekt', group: 'spill', ic: 'hull', tier: 2, name: 'Ordsmed', desc: 'Få alle riktige i en runde Hull i teksten.', reward: { kind: 'skin', id: 'ach_briller' } },
  { id: 'feil_perfekt', group: 'spill', ic: 'feil', tier: 2, name: 'Korrekturleser', desc: 'Finn alle feilene i en runde Finn feilen.', reward: { kind: 'skin', id: 'ach_detektiv' } },
  { id: 'tenk_begreper', group: 'spill', ic: 'tenk', tier: 1, name: 'Filosof', desc: 'Skriv et ordentlig svar i Tenk selv: minst tre setninger og 40 ord, med alle nøkkelbegrepene forklart med egne ord.', reward: { kind: 'skin', id: 'ach_bok' } },
  { id: 'kort_alle', group: 'spill', ic: 'kort', tier: 3, name: 'Kortmester', desc: 'Mestre alle kortene i kortstokken.', reward: { kind: 'skin', id: 'ach_doktorhatt' } },
  { id: 'allsidig', group: 'spill', ic: 'hjem', tier: 2, name: 'Allsidig', desc: 'Tjen XP i alle spillene som gir poeng.', reward: { kind: 'skin', id: 'ach_kappe' } },
  // Fremgang
  { id: 'xp_100', group: 'fremgang', ic: 'stjerne', tier: 1, name: 'Godt i gang', desc: 'Tjen 100 XP.', goal: 100 },
  { id: 'xp_500', group: 'fremgang', ic: 'stjerne', tier: 1, name: 'Pugger', desc: 'Tjen 500 XP.', goal: 500, reward: { kind: 'pet', species: 'ugle' } },
  { id: 'xp_1000', group: 'fremgang', ic: 'stjerne', tier: 2, name: 'Ekspert', desc: 'Tjen 1000 XP.', goal: 1000, reward: { kind: 'skin', id: 'ach_rustning' } },
  { id: 'xp_1800', group: 'fremgang', ic: 'stjerne', tier: 3, name: 'Legende', desc: 'Tjen 1800 XP.', goal: 1800, reward: { kind: 'pet', species: 'foniks' } },
  { id: 'huseier', group: 'fremgang', ic: 'rom', tier: 2, name: 'Huseier', desc: 'Lås opp alle rommene i huset.', reward: { kind: 'skin', id: 'ach_laurbaer' } },
  { id: 'stjerne', group: 'fremgang', ic: 'stjerne', tier: 3, name: 'Stjernesamler', desc: 'Få din første stjerne etter øverste nivå.' },
  // Samling
  { id: 'egg_forste', group: 'samling', ic: 'dyr', tier: 1, name: 'Eggfinner', desc: 'Finn ditt første egg.' },
  { id: 'klekk_forste', group: 'samling', ic: 'dyr', tier: 1, name: 'Det klekket!', desc: 'Klekk ditt første egg.' },
  { id: 'samler_5', group: 'samling', ic: 'dyr', tier: 2, name: 'Dyresamler', desc: 'Ha fem ulike dyr i samlingen.', goal: 5 },
  { id: 'legendarisk', group: 'samling', ic: 'dyr', tier: 3, name: 'Legendarisk funn', desc: 'Klekk et legendarisk dyr.' },
  { id: 'gave_forste', group: 'samling', ic: 'butikk', tier: 1, name: 'Gavmild', desc: 'Kjøp din første gave til læreren.' },
  { id: 'kostyme_forste', group: 'samling', ic: 'butikk', tier: 1, name: 'Stilikon', desc: 'Kjøp ditt første kostyme.' },
];
export const GROUPS: { id: Ach['group']; name: string }[] = [{ id: 'spill', name: 'Mestre spillene' }, { id: 'fremgang', name: 'Fremgang' }, { id: 'samling', name: 'Samling' }];
export const achById = (id: string) => ACHS.find((a) => a.id === id);
/** Achievementet som gir et bestemt kostyme eller dyr. */
export const achForSkin = (id: string) => ACHS.find((a) => a.reward?.kind === 'skin' && a.reward.id === id);
export const achForPet = (sp: string) => ACHS.find((a) => a.reward?.kind === 'pet' && a.reward.species === sp);
