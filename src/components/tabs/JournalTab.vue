<script setup lang="ts">
import { state } from '../../composables/useGame';
</script>

<template>
  <section class="tab-panel">
    <div class="section-title">
      <h2>Journal</h2>
      <span class="hint">L'histoire de votre ascension, jour après jour.</span>
    </div>
    <div class="card">
      <p v-if="state.journal.length === 0" class="desc">Votre légende commence à peine à s'écrire...</p>
      <div v-for="entry in state.journal" :key="entry.id" class="journal-entry">
        <span class="journal-day">Jour {{ entry.day }}</span>{{ entry.text }}
      </div>
    </div>
  </section>
</template>
