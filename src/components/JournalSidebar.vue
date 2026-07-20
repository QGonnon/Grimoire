<script setup lang="ts">
import { state } from '../composables/useGame';
</script>

<template>
  <aside class="journal-sidebar">
    <div class="card">
      <h3>Journal</h3>
      <p class="desc" style="margin-bottom: 0.8rem">L'histoire de votre ascension, jour après jour.</p>
      <div class="journal-feed">
        <p v-if="state.journal.length === 0" class="desc">Votre légende commence à peine à s'écrire...</p>
        <div v-for="entry in state.journal" :key="entry.id" class="journal-entry">
          <span class="journal-day">Jour {{ entry.day }}</span>{{ entry.text }}
        </div>
      </div>
    </div>
  </aside>
</template>
