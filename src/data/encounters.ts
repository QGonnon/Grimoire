import type { EncounterDef } from '../types';

// Adapted from Theory of Magic's data/encounters.json (137 entries in the
// source game). This is a representative slice of ~16 translated to French,
// used as the narrative flavor shown when a "loot" roll happens during
// dungeon exploration, instead of a single generic loot message.
export const ENCOUNTERS: EncounterDef[] = [
  {
    id: 'enc_primer1',
    name: 'abécédaire magique',
    text: "Une introduction à la théorie magique, oubliée sur une pierre.",
    loot: [{ resource: 'research', min: 1, max: 3 }, { resource: 'arcana', min: 0, max: 1 }],
    skillXp: [{ skill: 'lore', amount: 1 }],
  },
  {
    id: 'mysticwater',
    name: 'eaux mystiques',
    text: "De l'eau chargée d'enchantements sourd de la roche.",
    loot: [{ resource: 'watergem', min: 0, max: 1 }],
    skillXp: [{ skill: 'waterlore', amount: 1 }, { skill: 'naturelore', amount: 1 }],
  },
  {
    id: 'enc_chest3',
    name: 'coffre poussiéreux',
    text: "Un petit coffre solide, à moitié enfoui.",
    loot: [
      { resource: 'gold', min: 0, max: 50 },
      { resource: 'gems', min: 2, max: 5 },
      { resource: 'runestones', min: 0, max: 2 },
      { resource: 'codices', min: 0, max: 4 },
    ],
  },
  {
    id: 'enc_primer2',
    name: 'abécédaire avancé',
    text: 'Une théorie magique plus poussée, reliée de cuir usé.',
    loot: [{ resource: 'codices', min: 0, max: 1 }, { resource: 'research', min: 5, max: 10 }, { resource: 'arcana', min: 0, max: 1 }],
    skillXp: [{ skill: 'lore', amount: 2 }, { skill: 'languages', amount: 1 }],
  },
  {
    id: 'foggydale',
    name: 'vallon brumeux',
    text: "Le brouillard y est si épais qu'on ne voit plus ses propres mains.",
    skillXp: [{ skill: 'airlore', amount: 2 }, { skill: 'spiritlore', amount: 1 }],
  },
  {
    id: 'sarcophagus',
    name: 'sarcophage',
    text: 'Un antique cercueil marqué de runes effacées.',
    loot: [
      { resource: 'runestones', min: 0, max: 1 },
      { resource: 'shadowgem', min: 0, max: 1 },
      { resource: 'spiritgem', min: 0, max: 1 },
      { resource: 'bodies', min: 0, max: 1 },
    ],
    skillXp: [{ skill: 'reanimation', amount: 2 }, { skill: 'embalming', amount: 2 }],
  },
  {
    id: 'enc_pidwig',
    name: 'discussion avec Pidwig',
    text: 'Pidwig parle peu, mais a vu bien des mystères au fil de ses voyages.',
    loot: [{ resource: 'arcana', min: 0, max: 1 }],
    skillXp: [{ skill: 'history', amount: 2 }, { skill: 'astronomy', amount: 1 }, { skill: 'lore', amount: 1 }],
  },
  {
    id: 'enc_wyrd',
    name: 'sœur étrange',
    text: "La sœur Hécubah attend au bord du chemin, énigmatique.",
    flavor: 'Le vers blanc est difficile à interpréter.',
    skillXp: [{ skill: 'divination', amount: 1 }],
  },
  {
    id: 'e_cockatrice',
    name: 'cocatrice',
    text: "Un croisement contre-nature entre serpent et coq. Son regard serait mortel ; vous détournez les yeux.",
  },
  {
    id: 'oldscroll',
    name: 'vieux parchemin',
    text: "Un parchemin scellé à la cire, oublié dans une niche.",
    loot: [{ resource: 'scrolls', min: 1, max: 2 }],
    skillXp: [{ skill: 'lore', amount: 1 }],
  },
  {
    id: 'herbpatch',
    name: 'carré d\'herbes',
    text: 'Des herbes rares poussent ici, à l\'abri des regards.',
    loot: [{ resource: 'herbs', min: 5, max: 12 }],
    skillXp: [{ skill: 'herbalism', amount: 2 }],
  },
  {
    id: 'boneyard',
    name: 'ossuaire',
    text: 'Des ossements blanchis jonchent le sol.',
    loot: [{ resource: 'bones', min: 3, max: 8 }],
    skillXp: [{ skill: 'dissection', amount: 1 }],
  },
  {
    id: 'stargazer',
    name: 'clairière céleste',
    text: 'Une clairière dégagée offre une vue parfaite sur les étoiles.',
    loot: [{ resource: 'starcharts', min: 0, max: 1 }],
    skillXp: [{ skill: 'astronomy', amount: 2 }],
  },
  {
    id: 'lostgem',
    name: 'gemme perdue',
    text: "Un éclat de lumière attire votre regard entre les pierres.",
    loot: [{ resource: 'gems', min: 1, max: 4 }],
  },
  {
    id: 'ancienttome',
    name: 'tome ancien',
    text: 'Un tome relié de fer, lourd de savoir.',
    loot: [{ resource: 'tomes', min: 0, max: 1 }, { resource: 'research', min: 3, max: 8 }],
    skillXp: [{ skill: 'lore', amount: 2 }],
  },
  {
    id: 'brokenward',
    name: 'sceau brisé',
    text: "Un sceau de protection, brisé depuis longtemps, laisse fuir un peu de mana ambiant.",
    loot: [{ resource: 'mana', min: 3, max: 8 }],
  },
];

export const ENCOUNTER_MAP = Object.fromEntries(ENCOUNTERS.map((e) => [e.id, e])) as Record<string, EncounterDef>;
