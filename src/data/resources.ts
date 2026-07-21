import type { ResourceDef } from '../types';

// Adapted from Theory of Magic's data/resources.json. The full source game
// defines ~50 resources across many more categories (fundamental manas,
// per-school runes, crafting intermediates); this is a substantial but
// pragmatic subset covering every resource referenced by the imported
// classes, skills, dungeons and encounters. "Attribute-like" resources
// (research, mana pools, herbs, energy, arcana, elemental manas) have a real
// cap driven by .max mods and stay hidden until that cap is raised above 0;
// everything else (materials, gems, runes, necromancy items, skill points)
// is inventory-style and uncapped, revealing once first obtained.
export const RESOURCES: ResourceDef[] = [
  // Currency
  { id: 'gold', name: 'Or', symbol: '☉', category: 'currency', baseCap: 300, color: '#c9a24b' },
  { id: 'research', name: 'Recherche', symbol: '✦', category: 'currency', baseCap: 150, color: '#9179d9' },
  { id: 'arcana', name: 'Arcana', symbol: '❖', category: 'currency', baseCap: 0, color: '#c9a24b' },
  { id: 'sp', name: 'Points de compétence', symbol: '☆', category: 'currency', baseCap: 0, uncapped: true, color: '#e0bd6a' },

  // Attributes
  { id: 'energy', name: 'Vigueur', symbol: '⚡', category: 'attribute', baseCap: 20, color: '#7fb3c9' },

  // Manas
  { id: 'mana', name: 'Mana', symbol: '☾', category: 'mana', baseCap: 150, color: '#7fb3c9' },
  { id: 'fire', name: 'Feu', symbol: '🜂', category: 'mana', baseCap: 0, color: '#c1603c' },
  { id: 'water', name: "Eau", symbol: '🜄', category: 'mana', baseCap: 0, color: '#5a9bc7' },
  { id: 'air', name: "Air", symbol: '🜁', category: 'mana', baseCap: 0, color: '#b7d3d9' },
  { id: 'earth', name: 'Terre', symbol: '🜃', category: 'mana', baseCap: 0, color: '#8a6f4b' },
  { id: 'nature', name: 'Nature', symbol: '❦', category: 'mana', baseCap: 0, color: '#7fa25c' },
  { id: 'shadow', name: "Ombre", symbol: '☠', category: 'mana', baseCap: 0, color: '#6a5a8c' },
  { id: 'light', name: 'Lumière', symbol: '☀', category: 'mana', baseCap: 0, color: '#e8d98a' },
  { id: 'spirit', name: "Esprit", symbol: '☯', category: 'mana', baseCap: 0, color: '#a99fc0' },

  // Knowledge / books
  { id: 'scrolls', name: 'Parchemins', symbol: '📜', category: 'knowledge', baseCap: 0, uncapped: true, color: '#c9a24b' },
  { id: 'codices', name: 'Codex', symbol: '📖', category: 'knowledge', baseCap: 0, uncapped: true, color: '#9179d9' },
  { id: 'tomes', name: 'Tomes', symbol: '📚', category: 'knowledge', baseCap: 0, uncapped: true, color: '#9179d9' },
  { id: 'tapestries', name: 'Tapisseries', symbol: '🧵', category: 'knowledge', baseCap: 0, uncapped: true, color: '#c9a24b' },
  { id: 'starcharts', name: 'Cartes stellaires', symbol: '✵', category: 'knowledge', baseCap: 0, uncapped: true, color: '#7fb3c9' },

  // Materials
  { id: 'herbs', name: 'Herbes', symbol: '⚘', category: 'material', baseCap: 200, color: '#7fa25c' },
  { id: 'ichor', name: 'Ichor', symbol: '🩸', category: 'material', baseCap: 0, uncapped: true, color: '#c1603c' },
  { id: 'sindel', name: "Éclat d'étoile", symbol: '✧', category: 'material', baseCap: 0, uncapped: true, color: '#e8d98a' },

  // Necromancy
  { id: 'bones', name: 'Ossements', symbol: '☓', category: 'necromancy', baseCap: 0, uncapped: true, color: '#a99fc0' },
  { id: 'bodies', name: 'Cadavres', symbol: '☠', category: 'necromancy', baseCap: 0, uncapped: true, color: '#746a8c' },
  { id: 'bonedust', name: "Poussière d'os", symbol: '⁘', category: 'necromancy', baseCap: 0, uncapped: true, color: '#a99fc0' },
  { id: 'souls', name: 'Âmes', symbol: '✟', category: 'necromancy', baseCap: 0, uncapped: true, color: '#6a5a8c' },

  // Gems
  { id: 'gems', name: 'Gemmes', symbol: '◆', category: 'gem', baseCap: 0, uncapped: true, color: '#9179d9' },
  { id: 'managem', name: 'Gemmes arcanes', symbol: '◈', category: 'gem', baseCap: 0, uncapped: true, color: '#9179d9' },
  { id: 'firegem', name: 'Gemmes de feu', symbol: '◆', category: 'gem', baseCap: 0, uncapped: true, color: '#c1603c' },
  { id: 'watergem', name: "Gemmes d'eau", symbol: '◆', category: 'gem', baseCap: 0, uncapped: true, color: '#5a9bc7' },
  { id: 'airgem', name: "Gemmes d'air", symbol: '◆', category: 'gem', baseCap: 0, uncapped: true, color: '#b7d3d9' },
  { id: 'earthgem', name: 'Gemmes de terre', symbol: '◆', category: 'gem', baseCap: 0, uncapped: true, color: '#8a6f4b' },
  { id: 'naturegem', name: 'Gemmes de nature', symbol: '◆', category: 'gem', baseCap: 0, uncapped: true, color: '#7fa25c' },
  { id: 'spiritgem', name: "Gemmes d'esprit", symbol: '◆', category: 'gem', baseCap: 0, uncapped: true, color: '#a99fc0' },
  { id: 'shadowgem', name: "Gemmes d'ombre", symbol: '◆', category: 'gem', baseCap: 0, uncapped: true, color: '#6a5a8c' },
  { id: 'bloodgem', name: 'Gemmes de sang', symbol: '◆', category: 'gem', baseCap: 0, uncapped: true, color: '#8c2f2f' },

  // Runes
  { id: 'runestones', name: 'Pierres runiques', symbol: 'ᛝ', category: 'rune', baseCap: 0, uncapped: true, color: '#c9a24b' },
  { id: 'firerune', name: 'Runes de feu', symbol: 'ᛃ', category: 'rune', baseCap: 0, uncapped: true, color: '#c1603c' },
  { id: 'waterrune', name: "Runes d'eau", symbol: 'ᛁ', category: 'rune', baseCap: 0, uncapped: true, color: '#5a9bc7' },
  { id: 'earthrune', name: 'Runes de terre', symbol: 'ᚢ', category: 'rune', baseCap: 0, uncapped: true, color: '#8a6f4b' },
];

export const RESOURCE_MAP = Object.fromEntries(RESOURCES.map((r) => [r.id, r])) as Record<string, ResourceDef>;
export const RESOURCE_IDS = new Set(RESOURCES.map((r) => r.id));
