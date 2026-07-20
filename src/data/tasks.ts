import type { ActiveTaskDef } from '../types';

// Passive production now comes directly from practicing SKILLS (see
// data/skills.ts), assigned to slots - matching Theory of Magic where skills
// themselves are the thing you spend time on. This is a small curated set of
// early "chore" style click actions for bootstrapping before slots open up,
// similar to the source game's earliest un-skilled actions.
export const ACTIVE_TASKS: ActiveTaskDef[] = [
  {
    id: 'beg',
    name: 'Faire la manche',
    description: 'Tendre la main aux passants dans les ruelles de la ville.',
    resource: 'gold',
    baseAmount: 3,
    cost: { energy: 4 },
    cooldown: 2,
    skill: '',
    require: '',
  },
  {
    id: 'errands',
    name: 'Faire des courses',
    description: "Rendre service en ville en échange de quelques recherches.",
    resource: 'research',
    baseAmount: 2,
    cost: { energy: 5 },
    cooldown: 2,
    skill: 'lore',
    require: '',
  },
  {
    id: 'forage',
    name: 'Cueillette vive',
    description: 'Ramasser en hâte quelques plantes au bord du chemin.',
    resource: 'herbs',
    baseAmount: 2.5,
    cost: { energy: 5 },
    cooldown: 2,
    skill: 'herbalism',
    require: 'g.apprentice>0',
  },
  {
    id: 'quick_study',
    name: 'Étude rapide',
    description: "Parcourir fébrilement un texte pour en tirer un fragment de savoir arcanique.",
    resource: 'arcana',
    baseAmount: 0.5,
    cost: { energy: 6 },
    cooldown: 3,
    skill: 'lore',
    require: 'g.neophyte>0',
  },
  {
    id: 'second_wind',
    name: 'Second souffle',
    description: 'Puiser dans son mana pour raviver son énergie.',
    resource: 'energy',
    baseAmount: 10,
    cost: { mana: 6 },
    cooldown: 8,
    skill: '',
    require: 'g.tier2>0',
  },
];
