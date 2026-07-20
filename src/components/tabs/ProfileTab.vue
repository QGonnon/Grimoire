<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { state, playerLevel, levelProgress, setPlayerName, tierMax, currentDay, alignmentLabel } from '../../composables/useGame';
import { CLASS_MAP, TIER_LABELS } from '../../data/classes';
import { SHOP_ITEMS } from '../../data/shop';
import { formatNumber } from '../../utils/format';
import { shopEffectLabel } from '../../utils/labels';
import type { ClassId } from '../../types';

const ownedShopItems = computed(() => SHOP_ITEMS.filter((item) => state.shopOwned[item.id]));

const nameInput = ref(state.playerName);

// Keep the input in sync if the name changes elsewhere (e.g. loading a save).
watch(
  () => state.playerName,
  (name) => {
    if (name !== nameInput.value) nameInput.value = name;
  }
);

function saveName() {
  setPlayerName(nameInput.value);
  nameInput.value = state.playerName;
}

const tierName = () => {
  const owned = (Object.keys(state.classesOwned) as ClassId[]).filter((id) => state.classesOwned[id]);
  const max = tierMax();
  const atMax = owned.find((id) => CLASS_MAP[id].tier === max);
  return atMax ? CLASS_MAP[atMax].name : TIER_LABELS[0];
};
</script>

<template>
  <section class="tab-panel">
    <div class="section-title">
      <h2>Profil</h2>
      <span class="hint">Votre identité de mage, votre niveau et votre progression.</span>
    </div>

    <div class="card">
      <h3>Nom</h3>
      <p class="desc">Choisissez le nom sous lequel votre légende sera écrite.</p>
      <div class="profile-name-row">
        <input
          v-model="nameInput"
          class="profile-name-input"
          type="text"
          maxlength="30"
          placeholder="Sans nom"
          @keyup.enter="saveName"
          @blur="saveName"
        />
        <button class="btn btn-small" @click="saveName">Enregistrer</button>
      </div>
    </div>

    <div class="card">
      <h3>{{ state.playerName || 'Mage sans nom' }}</h3>
      <div class="stats" style="margin-bottom: 0.9rem">
        <span>{{ tierName() }}</span>
        <span>Alignement : {{ alignmentLabel() }}</span>
        <span>Jour {{ currentDay() }}</span>
      </div>

      <div class="level-row">
        <span class="level-badge">Niveau {{ playerLevel() }}</span>
        <div class="progress-bar level-bar">
          <div :style="{ width: levelProgress().percent + '%' }"></div>
        </div>
        <span class="mono level-value">{{ formatNumber(levelProgress().current) }} / {{ levelProgress().needed }}</span>
      </div>
      <p class="desc" style="margin-top: 0.5rem">
        L'expérience de votre personnage provient de la somme des niveaux de toutes vos compétences.
      </p>
    </div>

    <div class="card">
      <h3>Bonus acquis</h3>
      <p v-if="ownedShopItems.length === 0" class="desc">
        Aucun bonus de boutique acquis pour l'instant — direction l'onglet Tâches.
      </p>
      <ul v-else class="stats-list">
        <li v-for="item in ownedShopItems" :key="item.id">{{ item.name }} — {{ shopEffectLabel(item) }}</li>
      </ul>
    </div>
  </section>
</template>
