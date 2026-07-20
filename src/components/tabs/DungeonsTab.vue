<script setup lang="ts">
import { computed, ref } from 'vue';
import {
  state,
  dungeonUnlocked,
  hasUnsavedDungeonProgress,
  switchDungeon,
  stopExploring,
  playerPower,
} from '../../composables/useGame';
import { DUNGEONS, DUNGEON_MAP } from '../../data/dungeons';
import { MONSTER_MAP } from '../../data/monsters';
import { RESOURCE_MAP } from '../../data/resources';
import ConfirmModal from '../ConfirmModal.vue';

const pendingDungeonId = ref<string | null>(null);

const activeDungeon = computed(() =>
  state.dungeonProgress.dungeonId ? DUNGEON_MAP[state.dungeonProgress.dungeonId] : null
);

const activeMonster = computed(() =>
  state.dungeonProgress.monsterId ? MONSTER_MAP[state.dungeonProgress.monsterId] : null
);

function lootLabel(def: (typeof DUNGEONS)[number]): string {
  return def.loot.map((l) => `${RESOURCE_MAP[l.resource]?.symbol ?? '?'} ${l.min}-${l.max}`).join('  ·  ');
}

function bossName(def: (typeof DUNGEONS)[number]): string {
  return MONSTER_MAP[def.bossId]?.name ?? def.bossId;
}

function onEnterDungeon(id: string) {
  if (hasUnsavedDungeonProgress(id)) {
    pendingDungeonId.value = id;
  } else {
    switchDungeon(id);
  }
}

function confirmSwitch() {
  if (pendingDungeonId.value) switchDungeon(pendingDungeonId.value);
  pendingDungeonId.value = null;
}
</script>

<template>
  <section class="tab-panel">
    <div v-if="activeDungeon" class="dungeon-active-panel">
      <h2>{{ activeDungeon.name }} <span class="badge">niveau {{ activeDungeon.level }}</span></h2>
      <p class="desc">{{ activeDungeon.description || activeDungeon.flavor }}</p>
      <div class="stats">
        <span>Rencontres : {{ state.dungeonProgress.encountersDone }} / {{ activeDungeon.encountersRequired }}</span>
        <span>Puissance : {{ playerPower().toFixed(1) }}</span>
        <span v-if="state.isExploring">Coût : {{ activeDungeon.energyCostPerSecond }} ⚡/s</span>
        <span v-else class="badge">En pause</span>
      </div>

      <template v-if="state.dungeonProgress.inCombat && activeMonster">
        <p class="desc">Un combat fait rage contre {{ activeMonster.name }} ({{ activeMonster.kind }}) !</p>
        <div class="monster-hp-track">
          <div :style="{ width: (state.dungeonProgress.monsterHp / state.dungeonProgress.monsterMaxHp) * 100 + '%' }"></div>
        </div>
        <p class="badge">PV : {{ Math.max(0, Math.ceil(state.dungeonProgress.monsterHp)) }} / {{ state.dungeonProgress.monsterMaxHp }} — {{ activeMonster.attackName }} ({{ activeMonster.damageMin }}-{{ activeMonster.damageMax }})</p>
      </template>
      <template v-else>
        <div class="bar-fill-track">
          <div :style="{ width: state.dungeonProgress.bar + '%' }"></div>
        </div>
      </template>

      <div class="card-footer" style="margin-top: 0.8rem">
        <span v-if="state.dungeonsCompleted[activeDungeon.id]" class="badge gold">Achevé — {{ activeDungeon.reward.label }}</span>
        <span v-else></span>
        <button v-if="state.isExploring" class="btn btn-small" @click="stopExploring">Faire une pause</button>
        <button v-else class="btn btn-small" @click="switchDungeon(activeDungeon.id)">Reprendre l'exploration</button>
      </div>
    </div>

    <div>
      <div class="section-title">
        <h2>Donjons</h2>
        <span class="hint">Explorez pour du butin et des rencontres ; le boss de zone garde la récompense de complétion.</span>
      </div>
      <div class="dungeon-grid">
        <div
          v-for="def in DUNGEONS"
          :key="def.id"
          class="card"
          :class="{ locked: !dungeonUnlocked(def), owned: state.dungeonsCompleted[def.id] }"
        >
          <h3>{{ def.name }} <span class="badge">niv. {{ def.level }}</span></h3>
          <p class="desc">{{ def.description || def.flavor }}</p>
          <div class="stats">
            <span>Rencontres requises : {{ def.encountersRequired }}</span>
            <span>Gardien : {{ bossName(def) }}</span>
            <span>Butin : {{ lootLabel(def) }}</span>
          </div>
          <div class="card-footer">
            <span class="badge">Requiert : {{ def.requirementLabel }}</span>
            <span v-if="state.dungeonsCompleted[def.id]" class="badge gold">Achevé</span>
          </div>
          <div class="card-footer" style="margin-top: 0.6rem">
            <span class="desc" style="margin: 0">{{ def.reward.label }}</span>
            <button
              class="btn btn-small"
              :disabled="!dungeonUnlocked(def)"
              @click="onEnterDungeon(def.id)"
            >
              {{ state.dungeonProgress.dungeonId === def.id ? 'Sélectionné' : 'Explorer' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <ConfirmModal
      v-if="pendingDungeonId"
      title="Changer de donjon ?"
      text="Votre progression actuelle dans ce donjon sera perdue si vous en explorez un autre. Continuer ?"
      confirm-label="Changer de donjon"
      @confirm="confirmSwitch"
      @cancel="pendingDungeonId = null"
    />
  </section>
</template>
