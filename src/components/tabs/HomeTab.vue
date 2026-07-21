<script setup lang="ts">
import { computed } from 'vue';
import {
  state,
  homeSpaceMax,
  furnitureSpaceUsed,
  spaceAvailable,
  homeRequirementMet,
  homeCanBuy,
  buyHome,
  furnitureCount,
  furnitureRequirementMet,
  furnitureCanBuy,
  buyFurniture,
  canUninstallFurniture,
  uninstallFurniture,
} from '../../composables/useGame';
import { HOMES } from '../../data/homes';
import { FURNITURE } from '../../data/furniture';
import { RESOURCE_MAP, RESOURCE_IDS } from '../../data/resources';
import { SKILL_MAP, SKILL_IDS } from '../../data/skills';
import { parseMods } from '../../engine/expr';
import { formatNumber, formatPercent } from '../../utils/format';
import type { FurnitureDef, HomeDef, ResourceId } from '../../types';

function costLabel(cost: Partial<Record<ResourceId, number>>): string {
  const entries = Object.entries(cost) as [ResourceId, number][];
  if (entries.length === 0) return 'Gratuit';
  return entries.map(([res, amt]) => `${RESOURCE_MAP[res]?.symbol ?? '?'} ${RESOURCE_MAP[res]?.name ?? res} ${formatNumber(amt)}`).join('  ·  ');
}

// Unlike skills/classes, a home/furniture's resource ".rate" is a flat
// passive gain or loss applied every second (see passiveResourceRates() in
// useGame.ts), not a percentage bonus - displayed here as "+X/s" accordingly.
function bonusList(mod: Record<string, number | string>): string[] {
  const parsed = parseMods(mod, RESOURCE_IDS, SKILL_IDS);
  const parts: string[] = [];
  for (const [id, v] of Object.entries(parsed.resourceRate)) {
    parts.push(`${RESOURCE_MAP[id]?.symbol ?? ''} ${RESOURCE_MAP[id]?.name ?? id} ${v >= 0 ? '+' : ''}${formatNumber(v)}/s`);
  }
  for (const [id, v] of Object.entries(parsed.resourceMax)) parts.push(`${RESOURCE_MAP[id]?.name ?? id} max +${formatNumber(v)}`);
  for (const [id, v] of Object.entries(parsed.skillMax)) parts.push(`${SKILL_MAP[id]?.name ?? id} niveau +${formatNumber(v)}`);
  for (const [id, v] of Object.entries(parsed.skillRate)) parts.push(`${SKILL_MAP[id]?.name ?? id} apprentissage +${formatPercent(v)}`);
  if (parsed.virtue) parts.push(`Vertu +${formatNumber(parsed.virtue)}`);
  if (parsed.evilamt) parts.push(`Corruption +${formatNumber(parsed.evilamt)}`);
  return parts;
}

const visibleHomes = computed(() => HOMES.filter((h) => state.homeOwned === h.id || homeRequirementMet(h.id)));
const lockedHomeCount = computed(() => HOMES.length - visibleHomes.value.length);

const visibleFurniture = computed(() =>
  FURNITURE.filter((f) => furnitureCount(f.id) > 0 || furnitureRequirementMet(f.id))
);
const lockedFurnitureCount = computed(() => FURNITURE.length - visibleFurniture.value.length);

function spacePercent(): number {
  const max = homeSpaceMax();
  if (max <= 0) return 0;
  return Math.min(100, (furnitureSpaceUsed() / max) * 100);
}

function furnitureLimitLabel(def: FurnitureDef): string | null {
  if (def.maxCount === undefined) return null;
  return `${furnitureCount(def.id)} / ${def.maxCount}`;
}

function homeDef(id: string): HomeDef | undefined {
  return HOMES.find((h) => h.id === id);
}
</script>

<template>
  <section class="tab-panel">
    <div class="section-title">
      <h2>Logis</h2>
      <span class="hint">Votre logis détermine votre capacité de mobilier ; chaque meuble consomme une part de cette capacité.</span>
    </div>

    <div class="card">
      <h3>{{ state.homeOwned ? homeDef(state.homeOwned)?.name : 'Sans logis' }}</h3>
      <div class="stats">
        <span>Capacité utilisée : {{ formatNumber(furnitureSpaceUsed()) }} / {{ formatNumber(homeSpaceMax()) }}</span>
        <span>Libre : {{ formatNumber(spaceAvailable()) }}</span>
      </div>
      <div class="progress-bar">
        <div :style="{ width: spacePercent() + '%' }"></div>
      </div>
    </div>

    <div class="home-grid">
      <div
        v-for="home in visibleHomes"
        :key="home.id"
        class="card"
        :class="{ owned: state.homeOwned === home.id }"
      >
        <h3>{{ home.name }}</h3>
        <p class="desc">{{ home.description }}</p>
        <div v-if="bonusList(home.mod).length" class="stats-group">
          <span class="stats-label">Modificateurs</span>
          <ul class="stats-list">
            <li v-for="(b, i) in bonusList(home.mod)" :key="i">{{ b }}</li>
          </ul>
        </div>
        <div class="stats">
          <span>Capacité de mobilier : {{ formatNumber(home.spaceMax) }}</span>
        </div>
        <div class="card-footer">
          <span class="badge">Requiert : {{ home.requirementLabel }}</span>
          <span class="badge gold">{{ costLabel(home.cost) }}</span>
        </div>
        <div class="card-footer" style="margin-top: 0.6rem">
          <button
            class="btn btn-small"
            :disabled="state.homeOwned === home.id || !homeCanBuy(home.id)"
            @click="buyHome(home.id)"
          >
            {{ state.homeOwned === home.id ? 'Emménagé' : 'Emménager' }}
          </button>
        </div>
      </div>
    </div>
    <p v-if="lockedHomeCount > 0" class="section-title hint" style="margin-top: 0">
      {{ lockedHomeCount }} logis supplémentaire(s) attendent d'être révélés par votre progression.
    </p>

    <div class="section-title" style="margin-top: 1.2rem">
      <h2>Mobilier</h2>
      <span class="hint">Meublez votre logis pour renforcer votre production, dans la limite de sa capacité.</span>
    </div>

    <div class="furniture-grid">
      <div v-for="item in visibleFurniture" :key="item.id" class="card" :class="{ owned: furnitureCount(item.id) > 0 }">
        <h3>{{ item.name }}</h3>
        <p class="desc">{{ item.description }}</p>
        <div v-if="bonusList(item.mod).length" class="stats-group">
          <span class="stats-label">Modificateurs</span>
          <ul class="stats-list">
            <li v-for="(b, i) in bonusList(item.mod)" :key="i">{{ b }}</li>
          </ul>
        </div>
        <div class="stats">
          <span>Encombrement : {{ formatNumber(item.spaceCost) }}</span>
          <span v-if="furnitureLimitLabel(item)">Possédés : {{ furnitureLimitLabel(item) }}</span>
        </div>
        <div class="card-footer">
          <span class="badge">Requiert : {{ item.requirementLabel }}</span>
          <span class="badge gold">{{ costLabel(item.cost) }}</span>
        </div>
        <div class="card-footer" style="margin-top: 0.6rem">
          <button
            v-if="canUninstallFurniture(item.id)"
            class="btn btn-small btn-danger"
            @click="uninstallFurniture(item.id)"
          >
            Désinstaller
          </button>
          <button class="btn btn-small" :disabled="!furnitureCanBuy(item.id)" @click="buyFurniture(item.id)">
            Installer
          </button>
        </div>
      </div>
    </div>
    <p v-if="lockedFurnitureCount > 0" class="section-title hint" style="margin-top: 0">
      {{ lockedFurnitureCount }} meuble(s) supplémentaire(s) attendent d'être révélés par votre progression.
    </p>
  </section>
</template>
