import type { HomeDef } from '../types';

// Adapted from Theory of Magic's data/homes.json (~35 homes). Only one home
// is ever owned - moving into a new one always replaces the last, mirroring
// the source game's mutually-exclusive home groups (no partial refund, same
// as classes/shop items in this build). `require` strings use our own tier
// numbering (shifted by one vs. the source game, see data/classes.ts) and
// substitute unimplemented systems (minions, professions, distance, hp/stress)
// with the closest available analog or drop them; ".max" requirement clauses
// (e.g. "arcana.max>=8") become checks against the current resource amount,
// the closest analog available since this build doesn't track historical caps.
export const HOMES: HomeDef[] = [
  {
    id: 'alcove',
    name: 'Alcôve',
    description: "Un recoin sous l'escalier du domicile de votre maître.",
    flavor: 'Adieu, fenil.',
    require: '',
    requirementLabel: 'Aucun',
    cost: {},
    spaceMax: 5,
    mod: {},
  },
  {
    id: 'innroom',
    name: "Chambre d'auberge",
    description: 'Une chambre louée dans une auberge locale.',
    flavor: 'Vous perdez de précieuses pièces en loyer, mais au moins il y a un lit.',
    require: 'g.tier1>0',
    requirementLabel: 'Tier 1',
    cost: {},
    spaceMax: 12,
    mod: { 'gold.rate': -0.15 },
  },
  {
    id: 'hut',
    name: 'Hutte',
    description: "Une petite hutte à l'orée d'un village.",
    require: 'g.tier1>0',
    requirementLabel: 'Tier 1',
    cost: { gold: 300 },
    spaceMax: 15,
    mod: {},
  },
  {
    id: 'cottage',
    name: 'Cottage',
    description: 'Douillet et pittoresque.',
    require: 'g.tier1>0',
    requirementLabel: 'Tier 1',
    cost: { gold: 500, gems: 5 },
    spaceMax: 20,
    mod: {},
  },
  {
    id: 'house',
    name: 'Maison',
    description: 'Une modeste maison dans une petite ville.',
    require: 'g.tier1>0&&g.arcana>=8',
    requirementLabel: 'Tier 1, Arcana 8',
    cost: { gold: 900, gems: 10 },
    spaceMax: 30,
    mod: {},
  },
  {
    id: 'shop',
    name: 'Échoppe',
    description: 'Une petite échoppe dans une cité animée.',
    require: 'g.tier2>0&&g.crafting>=9',
    requirementLabel: 'Tier 2, Artisanat 9',
    cost: { gold: 850, gems: 9 },
    spaceMax: 25,
    mod: { 'gold.rate': 0.2, 'gold.max': 25 },
  },
  {
    id: 'lodge',
    name: 'Pavillon forestier',
    description: 'Un pavillon rustique dans les bois.',
    require: 'g.tier2>0&&g.naturelore>=7',
    requirementLabel: 'Tier 2, Science de la nature 7',
    cost: { gold: 950, gems: 5 },
    spaceMax: 30,
    mod: { 'nature.max': 1, 'nature.rate': 0.1 },
  },
  {
    id: 'gabledhouse',
    name: 'Manoir à pignons',
    description: 'Une vaste maison percée de nombreuses lucarnes.',
    require: 'g.tier2>0&&g.arcana>=10',
    requirementLabel: 'Tier 2, Arcana 10',
    cost: { gold: 2000, gems: 10 },
    spaceMax: 65,
    mod: {},
  },
  {
    id: 'cavern',
    name: 'Caverne',
    description: 'Une caverne vaste et béante, profondément enfouie sous la terre.',
    flavor: "Certains domaines d'étude s'y prêtent bien. D'autres, moins.",
    require: 'g.tier3>0&&g.earthlore>=10',
    requirementLabel: 'Tier 3, Géomancie 10',
    cost: { research: 500, gold: 3000, earthgem: 20 },
    spaceMax: 200,
    mod: { 'earth.rate': 0.2, 'shadow.max': 3, 'shadow.rate': 0.2, 'light.max': -3, 'light.rate': -0.1 },
  },
  {
    id: 'academy',
    name: 'Académie',
    description: 'Austère maison du savoir.',
    require: 'g.tier3>0&&g.research>=400',
    requirementLabel: 'Tier 3, Recherche 400',
    cost: { gold: 1000, research: 500 },
    spaceMax: 75,
    mod: { 'research.max': 50, 'research.rate': 0.4 },
  },
  {
    id: 'magetower',
    name: 'Tour archimagique',
    description: "Rien n'incarne mieux l'art que le mage dans sa tour.",
    require: 'g.tier5>0&&g.lore>=20',
    requirementLabel: 'Tier 5, Lore arcanique 20',
    cost: { gold: 7000, research: 5000, managem: 30, tomes: 10 },
    spaceMax: 420,
    mod: { 'mana.rate': 0.05, 'arcana.rate': 0.05 },
  },
  {
    id: 'castle',
    name: 'Château',
    description: 'Une vaste et pragmatique forteresse, pour le mage qui a des ennemis. Ou des cibles.',
    require: 'g.tier6>0',
    requirementLabel: 'Tier 6',
    cost: { gold: 10000, gems: 50 },
    spaceMax: 400,
    mod: { 'earth.rate': 0.1, 'gold.rate': 0.1 },
  },
];

export const HOME_MAP = Object.fromEntries(HOMES.map((h) => [h.id, h])) as Record<string, HomeDef>;
export const HOME_IDS = new Set(HOMES.map((h) => h.id));
