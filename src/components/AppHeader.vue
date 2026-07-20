<script setup lang="ts">
import { computed } from 'vue';
import { state, tierMax, currentDay, playerLevel } from '../composables/useGame';
import { CLASS_MAP, TIER_LABELS } from '../data/classes';
import type { ClassId } from '../types';

const tierName = computed(() => {
  const owned = (Object.keys(state.classesOwned) as ClassId[]).filter((id) => state.classesOwned[id]);
  const max = tierMax();
  const atMax = owned.find((id) => CLASS_MAP[id].tier === max);
  if (atMax) return CLASS_MAP[atMax].name;
  return TIER_LABELS[0];
});
</script>

<template>
  <header class="app-header">
    <svg class="sigil" width="56" height="56" viewBox="0 0 100 100">
      <g class="sigil-ring">
        <circle cx="50" cy="50" r="44" fill="none" stroke="#9179d9" stroke-width="1.2" opacity="0.6" />
        <circle cx="50" cy="50" r="36" fill="none" stroke="#c9a24b" stroke-width="0.8" opacity="0.5" />
        <g stroke="#9179d9" stroke-width="1" opacity="0.7">
          <line x1="50" y1="6" x2="50" y2="18" />
          <line x1="50" y1="82" x2="50" y2="94" />
          <line x1="6" y1="50" x2="18" y2="50" />
          <line x1="82" y1="50" x2="94" y2="50" />
          <line x1="18.5" y1="18.5" x2="26" y2="26" />
          <line x1="74" y1="74" x2="81.5" y2="81.5" />
          <line x1="81.5" y1="18.5" x2="74" y2="26" />
          <line x1="26" y1="74" x2="18.5" y2="81.5" />
        </g>
      </g>
      <circle class="sigil-core" cx="50" cy="50" r="10" fill="#9179d9" opacity="0.85" />
    </svg>
    <div class="header-titles">
      <h1>Grimoire — L'ascension d'un mage</h1>
      <div class="subtitle">{{ state.playerName ? `${state.playerName}, ${tierName.toLowerCase()}` : 'De palefrenier à archimage' }}</div>
    </div>
    <div class="header-meta">
      <span class="tier-badge">{{ tierName }}</span>
      <span class="day-counter">Niveau {{ playerLevel() }} · Jour {{ currentDay() }}</span>
    </div>
  </header>
</template>
