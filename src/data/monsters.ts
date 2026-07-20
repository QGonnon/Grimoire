import type { MonsterDef } from '../types';

// Adapted from Theory of Magic's data/monsters.json. Real ids/levels/hp/
// defense/attack ranges are kept; damage-over-time, resistances and loot
// tables are simplified away (loot instead comes from the dungeon's own
// loot table, matching how the source game layers zone loot on top of
// individual monster drops).
export const MONSTERS: MonsterDef[] = [
  { id: 'newt', name: 'triton', level: 1, kind: 'bête', hp: 2, defense: 1, attackName: 'petite morsure', damageMin: 1, damageMax: 2 },
  { id: 'lgmouse', name: 'grande souris', level: 1, kind: 'bête', hp: 4, defense: 2, attackName: 'grignotage', damageMin: 1, damageMax: 2 },
  { id: 'gremlin', name: 'gremlin', level: 1, kind: 'gobelinoïde', hp: 5, defense: 2, attackName: 'griffes', damageMin: 1, damageMax: 2 },
  { id: 'homunculus', name: 'homoncule', level: 1, kind: 'construct', hp: 10, defense: 5, attackName: 'morsure vicieuse', damageMin: 1, damageMax: 3 },
  { id: 'jackal', name: 'chacal', level: 1, kind: 'bête', hp: 11, defense: 8, attackName: 'morsure', damageMin: 1, damageMax: 3 },
  { id: 'lgrat', name: 'grand rat', level: 2, kind: 'bête', hp: 10, defense: 2, attackName: 'morsure', damageMin: 1, damageMax: 3 },
  { id: 'goblin', name: 'gobelin', level: 2, kind: 'humanoïde', hp: 6, defense: 5, attackName: 'dague', damageMin: 2, damageMax: 4 },
  { id: 'ratking', name: 'roi-rat', level: 3, kind: 'bête magique', hp: 12, defense: 4, attackName: 'morsure royale', damageMin: 2, damageMax: 5, unique: true },
  { id: 'zombie', name: 'zombie', level: 3, kind: 'mort-vivant', evil: 8, hp: 8, defense: 4, attackName: 'coup', damageMin: 3, damageMax: 8 },
  { id: 'orc', name: 'orc', level: 4, kind: 'humanoïde', hp: 14, defense: 8, attackName: 'lance', damageMin: 3, damageMax: 6 },
  { id: 'direbat', name: 'chauve-souris féroce', level: 4, kind: 'bête magique', hp: 8, defense: 10, attackName: 'morsure', damageMin: 3, damageMax: 7 },
  { id: 'ranger', name: 'rôdeur', level: 5, kind: 'humanoïde', evil: -5, hp: 20, defense: 19, attackName: 'arc long', damageMin: 3, damageMax: 6 },
  { id: 'giantspider', name: 'araignée géante', level: 5, kind: 'bête', hp: 12, defense: 5, attackName: 'morsure venimeuse', damageMin: 4, damageMax: 7 },
  { id: 'snek', name: 'serpent arcanique', level: 6, kind: 'bête magique', hp: 50, defense: 20, attackName: 'constriction', damageMin: 6, damageMax: 14 },
  { id: 'bear', name: 'ours', level: 7, kind: 'bête', hp: 55, defense: 30, attackName: 'griffes', damageMin: 5, damageMax: 14 },
  { id: 'gobchief', name: 'chef gobelin', level: 4, kind: 'humanoïde', hp: 25, defense: 12, attackName: 'hache', damageMin: 4, damageMax: 9, unique: true },
  { id: 'orcchief', name: 'chef orc', level: 7, kind: 'humanoïde', hp: 60, defense: 25, attackName: 'grande hache', damageMin: 6, damageMax: 15, unique: true },
  { id: 'banditlord', name: 'seigneur bandit', level: 5, kind: 'humanoïde', hp: 35, defense: 18, attackName: 'épée', damageMin: 4, damageMax: 10, unique: true },
  { id: 'ogre', name: 'ogre', level: 9, kind: 'géant', hp: 70, defense: 22, attackName: 'massue', damageMin: 8, damageMax: 18 },
  { id: 'troll', name: 'troll', level: 10, kind: 'géant', hp: 90, defense: 25, attackName: 'griffes', damageMin: 9, damageMax: 20 },
  { id: 'wraith', name: 'spectre', level: 9, kind: 'mort-vivant', evil: 15, hp: 60, defense: 28, attackName: 'toucher glacial', damageMin: 8, damageMax: 16 },
  { id: 'greendragon', name: 'dragon vert', level: 14, kind: 'dragon', hp: 145, defense: 55, attackName: 'souffle et griffes', damageMin: 10, damageMax: 20, unique: true },
  { id: 'reddragon', name: 'dragon rouge', level: 18, kind: 'dragon', hp: 220, defense: 70, attackName: 'souffle de feu', damageMin: 15, damageMax: 30, unique: true },
  { id: 'balrog', name: 'balrog', level: 20, kind: 'démon', evil: 30, hp: 300, defense: 90, attackName: 'fouet de feu', damageMin: 20, damageMax: 40, unique: true },
  { id: 'archon', name: 'archon', level: 17, kind: 'céleste', evil: -25, hp: 180, defense: 65, attackName: 'lame de lumière', damageMin: 14, damageMax: 28, unique: true },
  { id: 'cthulhu', name: 'Cthulhu', level: 25, kind: 'entité extérieure', evil: 30, hp: 1050, defense: 125, attackName: 'folie', damageMin: 70, damageMax: 125, unique: true },
];

export const MONSTER_MAP = Object.fromEntries(MONSTERS.map((m) => [m.id, m])) as Record<string, MonsterDef>;
