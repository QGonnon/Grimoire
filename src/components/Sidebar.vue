<script setup lang="ts">
import { computed } from 'vue';
import {
  state,
  resourceCap,
  resourceUnlocked,
  productionMultiplier,
  slotsAvailable,
  ownedClassIds,
  alignmentLabel,
} from '../composables/useGame';
import { RESOURCES } from '../data/resources';
import { SKILL_MAP } from '../data/skills';
import { CLASS_MAP } from '../data/classes';
import type { ResourceCategory, ResourceId } from '../types';

const CATEGORY_LABELS: Record<ResourceCategory, string> = {
  currency: 'Monnaies',
  attribute: 'Attributs',
  mana: 'Manas',
  knowledge: 'Savoir',
  material: 'Matériaux',
  necromancy: 'Nécromancie',
  gem: 'Gemmes',
  rune: 'Runes',
};

const CATEGORY_ORDER: ResourceCategory[] = ['currency', 'attribute', 'mana', 'knowledge', 'material', 'necromancy', 'gem', 'rune'];

const passiveRates = computed(() => {
  const rates: Partial<Record<ResourceId, number>> = {};
  for (const skillId of state.passiveAssignments) {
    if (!skillId) continue;
    const def = SKILL_MAP[skillId];
    if (!def) continue;
    for (const [res, amt] of Object.entries(def.result) as [ResourceId, number][]) {
      rates[res] = (rates[res] ?? 0) + amt * productionMultiplier(res, skillId);
    }
  }
  return rates;
});

const groupedResources = computed(() =>
  CATEGORY_ORDER.map((cat) => ({
    category: cat,
    label: CATEGORY_LABELS[cat],
    resources: RESOURCES.filter((r) => r.category === cat && resourceUnlocked(r.id)),
  })).filter((g) => g.resources.length > 0)
);

const usedSlots = computed(() => state.passiveAssignments.filter((t) => t !== null).length);

const virtuePercent = computed(() => Math.min(100, (state.virtue / 300) * 100));
const evilPercent = computed(() => Math.min(100, (state.evilamt / 300) * 100));

const ownedClasses = computed(() =>
  ownedClassIds()
    .map((id) => CLASS_MAP[id])
    .sort((a, b) => a.tier - b.tier)
);
</script>

<template>
  <aside class="sidebar">
    <div class="card">
      <h3>Ressources</h3>
      <template v-for="group in groupedResources" :key="group.category">
        <div class="resource-group-label" v-if="groupedResources.length > 1">{{ group.label }}</div>
        <div v-for="r in group.resources" :key="r.id" class="resource-row">
          <span class="r-name">{{ r.symbol }} {{ r.name }}</span>
          <span class="r-values">
            {{ Math.floor(state.resources[r.id]) }} / {{ Math.floor(resourceCap(r.id)) }}
            <span v-if="(passiveRates[r.id] ?? 0) > 0" class="r-rate">+{{ (passiveRates[r.id] ?? 0).toFixed(2) }}/s</span>
          </span>
        </div>
      </template>
    </div>

    <div class="card">
      <h3>Alignement — {{ alignmentLabel() }}</h3>
      <div class="align-row">
        <span class="align-label virtue">Vertu</span>
        <div class="progress-bar align-bar"><div :style="{ width: virtuePercent + '%' }"></div></div>
        <span class="mono align-value">{{ Math.floor(state.virtue) }}</span>
      </div>
      <div class="align-row">
        <span class="align-label evil">Corruption</span>
        <div class="progress-bar align-bar evil"><div :style="{ width: evilPercent + '%' }"></div></div>
        <span class="mono align-value">{{ Math.floor(state.evilamt) }}</span>
      </div>
      <div v-if="state.essence > 0" class="essence-line" style="margin-top: 0.6rem">
        ✧ Essence Arcanique : {{ state.essence }}
      </div>
    </div>

    <div class="card">
      <h3>Classes acquises</h3>
      <div class="class-tags">
        <span v-if="ownedClasses.length === 0" class="badge">Origine — Apprentissage</span>
        <span v-for="c in ownedClasses" :key="c.id" class="class-tag">{{ c.name }}</span>
      </div>
      <div class="slots-line" style="margin-top: 0.7rem">
        <span>Emplacements de compétences</span>
        <span class="mono">{{ usedSlots }} / {{ slotsAvailable() }}</span>
      </div>
    </div>
  </aside>
</template>
