<script setup lang="ts">
import { computed } from 'vue';
import { state, resolveEventChoice } from '../composables/useGame';
import { EVENT_MAP } from '../data/events';
import { RESOURCE_MAP } from '../data/resources';
import type { ResourceId } from '../types';

const event = computed(() => (state.activeEventId ? EVENT_MAP[state.activeEventId] : null));

function effectLabel(effect: Partial<Record<ResourceId, number>>): string {
  return (Object.entries(effect) as [ResourceId, number][])
    .map(([res, amt]) => `${amt > 0 ? '+' : ''}${amt} ${RESOURCE_MAP[res].symbol}`)
    .join('  ');
}
</script>

<template>
  <div v-if="event" class="modal-backdrop">
    <div class="modal-box">
      <h2>{{ event.title }}</h2>
      <p class="event-text">{{ event.text }}</p>
      <div class="event-choices">
        <button
          v-for="(choice, i) in event.choices"
          :key="i"
          class="btn"
          @click="resolveEventChoice(i)"
        >
          {{ choice.label }}
          <span v-if="effectLabel(choice.effect) || choice.virtueDelta || choice.evilDelta" class="badge" style="margin-left: 0.5em">
            {{ effectLabel(choice.effect) }}
            <template v-if="choice.virtueDelta">+{{ choice.virtueDelta }} vertu</template>
            <template v-if="choice.evilDelta">+{{ choice.evilDelta }} corruption</template>
          </span>
        </button>
      </div>
    </div>
  </div>
</template>
