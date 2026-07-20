<script setup lang="ts">
import { computed, ref } from 'vue';
import {
  state,
  slotsAvailable,
  skillUnlocked,
  assignSkillSlot,
  productionMultiplier,
  activeTaskUnlocked,
  activeTaskCooldown,
  canRunActiveTask,
  runActiveTask,
  shopCanBuy,
  buyShopItem,
  canPrestige,
  essenceOnPrestige,
  doPrestige,
} from '../../composables/useGame';
import { SKILLS, SKILL_MAP } from '../../data/skills';
import { ACTIVE_TASKS } from '../../data/tasks';
import { SHOP_ITEMS } from '../../data/shop';
import { RESOURCE_MAP } from '../../data/resources';
import { formatNumber } from '../../utils/format';
import type { ResourceId, ShopItemDef } from '../../types';
import ConfirmModal from '../ConfirmModal.vue';

const slots = computed(() => Array.from({ length: slotsAvailable() }, (_, i) => i));
const showPrestigeConfirm = ref(false);

const availableSkills = computed(() => SKILLS.filter((s) => skillUnlocked(s.id)));
const visibleActiveTasks = computed(() => ACTIVE_TASKS.filter((t) => activeTaskUnlocked(t.id)));

function skillInOtherSlot(skillId: string, slot: number): boolean {
  return state.passiveAssignments.some((t, i) => t === skillId && i !== slot);
}

function onSlotChange(slot: number, event: Event) {
  const value = (event.target as HTMLSelectElement).value;
  assignSkillSlot(slot, value === '' ? null : value);
}

function resultLabel(skillId: string): string {
  const def = SKILL_MAP[skillId];
  if (!def) return '';
  const entries = Object.entries(def.result) as [ResourceId, number][];
  if (entries.length === 0) return '';
  return entries.map(([res, amt]) => `${RESOURCE_MAP[res]?.symbol ?? ''} +${formatNumber(amt * productionMultiplier(res, skillId))}/s`).join('  ');
}

function skillCostLabel(skillId: string): string {
  const def = SKILL_MAP[skillId];
  if (!def) return '';
  const entries = Object.entries(def.cost) as [ResourceId, number][];
  if (entries.length === 0) return '';
  return entries.map(([res, amt]) => `${RESOURCE_MAP[res]?.symbol ?? ''} -${formatNumber(amt)}/s`).join('  ');
}

function slotOptionLabel(skillId: string): string {
  const parts = [resultLabel(skillId), skillCostLabel(skillId)].filter(Boolean);
  return parts.length ? `(${parts.join('  ·  ')})` : '';
}

function costLabel(cost: Partial<Record<ResourceId, number>>): string {
  const entries = Object.entries(cost) as [ResourceId, number][];
  if (entries.length === 0) return 'Gratuit';
  return entries.map(([res, amt]) => `${RESOURCE_MAP[res]?.symbol ?? ''} ${formatNumber(amt)}`).join('  ·  ');
}

function shopEffectLabel(item: ShopItemDef): string {
  const parts: string[] = [];
  for (const [res, amt] of Object.entries(item.effect.productionBonus ?? {}) as [ResourceId, number][]) {
    parts.push(`${RESOURCE_MAP[res]?.name ?? res} +${Math.round(amt * 100)}%`);
  }
  if (item.effect.skillXpBonus) parts.push(`Apprentissage +${Math.round(item.effect.skillXpBonus * 100)}%`);
  if (item.effect.eventSafety) parts.push(`Sécurité événementielle +${Math.round(item.effect.eventSafety * 100)}%`);
  if (item.effect.energyCapBonus) parts.push(`Vigueur max +${formatNumber(item.effect.energyCapBonus)}`);
  if (item.effect.unlocksPrestige) parts.push('Débloque la Réincarnation Arcanique');
  return parts.length ? parts.join('  ·  ') : 'Aucun bonus direct';
}
</script>

<template>
  <section class="tab-panel">
    <div>
      <div class="section-title">
        <h2>Pratique des compétences</h2>
        <span class="hint">Assignez vos compétences débloquées (onglet Compétences) à un emplacement pour une pratique continue.</span>
      </div>
      <div class="slots-grid">
        <div v-for="slot in slots" :key="slot" class="card slot-card">
          <h3>Emplacement {{ slot + 1 }}</h3>
          <select :value="state.passiveAssignments[slot] ?? ''" @change="onSlotChange(slot, $event)">
            <option value="">— Inoccupé —</option>
            <option
              v-for="skill in availableSkills"
              :key="skill.id"
              :value="skill.id"
              :disabled="skillInOtherSlot(skill.id, slot)"
            >
              {{ skill.name }} {{ slotOptionLabel(skill.id) }}
            </option>
          </select>
          <template v-if="state.passiveAssignments[slot]">
            <p class="desc" style="margin-top: 0.5rem">
              {{ SKILL_MAP[state.passiveAssignments[slot] ?? '']?.description }}
            </p>
            <div class="stats">
              <span v-if="resultLabel(state.passiveAssignments[slot] ?? '')">{{ resultLabel(state.passiveAssignments[slot] ?? '') }}</span>
              <span v-if="skillCostLabel(state.passiveAssignments[slot] ?? '')" class="cost-negative">{{ skillCostLabel(state.passiveAssignments[slot] ?? '') }}</span>
            </div>
          </template>
          <p v-if="availableSkills.length === 0" class="desc" style="margin-top: 0.5rem">
            Aucune compétence débloquée pour l'instant — direction l'onglet Compétences.
          </p>
        </div>
      </div>
    </div>

    <div>
      <div class="section-title">
        <h2>Tâches actives</h2>
        <span class="hint">Cliquez pour agir manuellement, contre un coût et un temps de repos.</span>
      </div>
      <div class="task-grid">
        <div v-for="task in visibleActiveTasks" :key="task.id" class="card">
          <h3>{{ task.name }}</h3>
          <p class="desc">{{ task.description }}</p>
          <div class="stats">
            <span>Gain : {{ RESOURCE_MAP[task.resource]?.symbol }} +{{ formatNumber(task.baseAmount * productionMultiplier(task.resource, (task.skill || '') as any)) }}</span>
            <span class="cost-negative">Coût : {{ costLabel(task.cost) }}</span>
            <span>Repos : {{ task.cooldown }}s</span>
          </div>
          <div class="card-footer">
            <button class="btn" :disabled="!canRunActiveTask(task.id)" @click="runActiveTask(task.id)">
              {{ activeTaskCooldown(task.id) > 0 ? `Repos… ${activeTaskCooldown(task.id).toFixed(1)}s` : 'Agir' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div>
      <div class="section-title">
        <h2>Boutique</h2>
        <span class="hint">Achats uniques offrant un bonus permanent.</span>
      </div>
      <div class="shop-grid">
        <div
          v-for="item in SHOP_ITEMS"
          :key="item.id"
          class="card"
          :class="{ owned: state.shopOwned[item.id] }"
        >
          <h3>{{ item.name }}</h3>
          <p class="desc">{{ item.description }}</p>
          <div class="stats">
            <span>{{ shopEffectLabel(item) }}</span>
          </div>
          <div class="card-footer">
            <span class="badge gold">{{ costLabel(item.cost) }}</span>
            <button
              class="btn btn-small"
              :disabled="!!state.shopOwned[item.id] || !shopCanBuy(item.id)"
              @click="buyShopItem(item.id)"
            >
              {{ state.shopOwned[item.id] ? 'Acquis' : 'Acheter' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="canPrestige()">
      <div class="section-title">
        <h2>Réincarnation Arcanique</h2>
        <span class="hint">Le Cercle de rituel vous permet de renaître, plus puissant.</span>
      </div>
      <div class="card" style="border-color: var(--violet)">
        <p class="desc">
          Réinitialise vos ressources, classes, compétences débloquées, emplacements et donjons en échange
          d'Essence Arcanique, offrant un bonus de production permanent de +5% par point, cumulable entre
          les vies. Votre alignement (vertu/corruption) est conservé.
        </p>
        <div class="card-footer">
          <span class="essence-line">Essence gagnée à la réincarnation : +{{ formatNumber(essenceOnPrestige()) }}</span>
          <button class="btn btn-danger" @click="showPrestigeConfirm = true">Se réincarner</button>
        </div>
      </div>
    </div>

    <ConfirmModal
      v-if="showPrestigeConfirm"
      title="Réincarnation Arcanique"
      text="Vos ressources, classes, compétences, emplacements et donjons seront réinitialisés. Continuer ?"
      confirm-label="Se réincarner"
      @confirm="
        () => {
          doPrestige();
          showPrestigeConfirm = false;
        }
      "
      @cancel="showPrestigeConfirm = false"
    />
  </section>
</template>
