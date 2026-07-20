import type { ShopItemDef } from '../types';

export const SHOP_ITEMS: ShopItemDef[] = [
  {
    id: 'lantern',
    name: 'Lanterne enchantée',
    description: "Une douce lumière qui met en valeur votre commerce.",
    cost: { gold: 150 },
    effect: { productionBonus: { gold: 0.15 } },
  },
  {
    id: 'writing_desk',
    name: 'Écritoire de fortune',
    description: 'Un pupitre stable pour rédiger sans faiblir.',
    cost: { research: 80 },
    effect: { productionBonus: { research: 0.15 } },
  },
  {
    id: 'moonstone',
    name: 'Pierre de lune',
    description: 'Capte les flux lunaires pour amplifier votre mana.',
    cost: { mana: 80 },
    effect: { productionBonus: { mana: 0.15 } },
  },
  {
    id: 'basket',
    name: 'Panier tressé',
    description: 'Permet de récolter davantage sans rien abîmer.',
    cost: { herbs: 90 },
    effect: { productionBonus: { herbs: 0.15 } },
  },
  {
    id: 'amulet',
    name: 'Amulette de concentration',
    description: "Aiguise l'esprit et accélère l'apprentissage.",
    cost: { mana: 100 },
    effect: { skillXpBonus: 0.15 },
  },
  {
    id: 'boots',
    name: 'Bottes silencieuses',
    description: "Permettent d'éviter discrètement les mauvaises rencontres.",
    cost: { gold: 120 },
    effect: { eventSafety: 0.2 },
  },
  {
    id: 'stamina_reserve',
    name: "Réserve d'endurance",
    description: 'Un entraînement soutenu qui repousse vos limites.',
    cost: { gold: 130 },
    effect: { energyCapBonus: 20 },
  },
  {
    id: 'ritual_circle',
    name: 'Cercle de rituel',
    description: 'Un cercle antique qui permet la réincarnation arcanique.',
    cost: { research: 500 },
    effect: { unlocksPrestige: true },
  },
];

export const SHOP_MAP = Object.fromEntries(SHOP_ITEMS.map((s) => [s.id, s])) as Record<string, ShopItemDef>;
