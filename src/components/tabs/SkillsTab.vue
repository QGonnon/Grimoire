<script setup lang="ts">
import { computed } from 'vue';
import {
  state,
  effectiveSkillLevel,
  skillUnlocked,
  skillRequirementMet,
  canUnlockSkill,
  unlockSkill,
} from '../../composables/useGame';
import { SKILLS, xpForLevel, skillLevel } from '../../data/skills';
import { RESOURCE_MAP } from '../../data/resources';
import { formatNumber } from '../../utils/format';
import type { ResourceId } from '../../types';

function progressPercent(id: string): number {
  const level = effectiveSkillLevel(id);
  const xp = state.skillXp[id] ?? 0;
  const currentFloor = xpForLevel(skillLevel(xp));
  const nextFloor = xpForLevel(skillLevel(xp) + 1);
  const span = nextFloor - currentFloor;
  if (span <= 0) return 0;
  void level;
  return Math.min(100, ((xp - currentFloor) / span) * 100);
}

function costLabel(cost: Partial<Record<ResourceId, number>>): string {
  const entries = Object.entries(cost) as [ResourceId, number][];
  if (entries.length === 0) return 'Gratuit';
  return entries.map(([res, amt]) => `${RESOURCE_MAP[res]?.symbol ?? ''} ${formatNumber(amt)}`).join('  ·  ');
}

const visibleSkills = computed(() => SKILLS.filter((s) => skillUnlocked(s.id) || skillRequirementMet(s.id)));
const lockedCount = computed(() => SKILLS.length - visibleSkills.value.length);
</script>

<template>
  <section class="tab-panel">
    <div class="section-title">
      <h2>Compétences</h2>
      <span class="hint">Débloquez une compétence puis assignez-la à un emplacement dans l'onglet Tâches pour la pratiquer.</span>
    </div>
    <div class="task-grid">
      <div v-for="skill in visibleSkills" :key="skill.id" class="card" :class="{ owned: skillUnlocked(skill.id) }">
        <h3>{{ skill.name }}</h3>
        <p class="desc">{{ skill.description }}</p>
        <template v-if="skillUnlocked(skill.id)">
          <div class="progress-bar">
            <div :style="{ width: progressPercent(skill.id) + '%' }"></div>
          </div>
          <div class="card-footer" style="margin-top: 0.5rem">
            <span class="badge gold">Niveau {{ effectiveSkillLevel(skill.id) }}</span>
            <span v-if="skill.school" class="badge">École : {{ skill.school }}</span>
          </div>
        </template>
        <template v-else>
          <div class="card-footer">
            <span class="badge">{{ costLabel(skill.unlockCost) }}</span>
            <button class="btn btn-small" :disabled="!canUnlockSkill(skill.id)" @click="unlockSkill(skill.id)">
              Apprendre
            </button>
          </div>
        </template>
      </div>
    </div>
    <p v-if="lockedCount > 0" class="section-title hint" style="margin-top: 0">
      {{ lockedCount }} compétence(s) supplémentaire(s) attendent d'être révélées par votre progression.
    </p>
  </section>
</template>
