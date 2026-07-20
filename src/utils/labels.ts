import { RESOURCE_MAP } from '../data/resources';
import { formatNumber, formatPercent } from './format';
import type { ResourceId, ShopItemDef } from '../types';

export function shopEffectLabel(item: ShopItemDef): string {
  const parts: string[] = [];
  for (const [res, amt] of Object.entries(item.effect.productionBonus ?? {}) as [ResourceId, number][]) {
    parts.push(`${RESOURCE_MAP[res]?.name ?? res} +${formatPercent(amt)}`);
  }
  if (item.effect.skillXpBonus) parts.push(`Apprentissage +${formatPercent(item.effect.skillXpBonus)}`);
  if (item.effect.eventSafety) parts.push(`Sécurité événementielle +${formatPercent(item.effect.eventSafety)}`);
  if (item.effect.energyCapBonus) parts.push(`Vigueur max +${formatNumber(item.effect.energyCapBonus)}`);
  for (const [res, amt] of Object.entries(item.effect.resourceCapBonus ?? {}) as [ResourceId, number][]) {
    parts.push(`${RESOURCE_MAP[res]?.name ?? res} max +${formatNumber(amt)}`);
  }
  if (item.effect.unlocksPrestige) parts.push('Débloque la Réincarnation Arcanique');
  return parts.length ? parts.join('  ·  ') : 'Aucun bonus direct';
}
