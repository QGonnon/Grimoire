<script setup lang="ts">
import { computed } from 'vue';
import { state, classCanBuy, classRequirementMet, buyClass } from '../../composables/useGame';
import { CLASSES, TIER_LABELS } from '../../data/classes';
import { RESOURCE_MAP, RESOURCE_IDS } from '../../data/resources';
import { SKILL_MAP, SKILL_IDS } from '../../data/skills';
import { parseMods } from '../../engine/expr';
import type { ResourceId } from '../../types';

function costLabel(cost: Partial<Record<ResourceId, number>>): string {
  const entries = Object.entries(cost) as [ResourceId, number][];
  if (entries.length === 0) return 'Gratuit';
  return entries.map(([res, amt]) => `${RESOURCE_MAP[res]?.symbol ?? '?'} ${amt}`).join('  ·  ');
}

function bonusLabel(mod: Record<string, number | string>): string {
  const parsed = parseMods(mod, RESOURCE_IDS, SKILL_IDS);
  const parts: string[] = [];
  for (const [id, v] of Object.entries(parsed.resourceRate)) parts.push(`${RESOURCE_MAP[id]?.name ?? id} +${Math.round(v * 100)}%`);
  for (const [id, v] of Object.entries(parsed.resourceMax)) parts.push(`${RESOURCE_MAP[id]?.name ?? id} plafond +${v}`);
  for (const [id, v] of Object.entries(parsed.skillMax)) parts.push(`${SKILL_MAP[id]?.name ?? id} niveau +${v}`);
  for (const [id, v] of Object.entries(parsed.skillRate)) parts.push(`${SKILL_MAP[id]?.name ?? id} apprentissage +${Math.round(v * 100)}%`);
  return parts.length ? parts.join('  ·  ') : 'Aucun bonus direct';
}

function alignmentLabel(mod: Record<string, number | string>): string | null {
  const parsed = parseMods(mod, RESOURCE_IDS, SKILL_IDS);
  const parts: string[] = [];
  if (parsed.virtue) parts.push(`Vertu +${parsed.virtue}`);
  if (parsed.evilamt) parts.push(`Corruption +${parsed.evilamt}`);
  return parts.length ? parts.join('  ·  ') : null;
}

const byTier = computed(() => {
  const groups: Record<number, typeof CLASSES> = {};
  for (let t = 0; t <= 7; t++) groups[t] = [];
  for (const c of CLASSES) groups[c.tier].push(c);
  return groups;
});

// Secret classes stay hidden entirely until their requirement is met, mirroring
// the source game's hidden classes (only their existence is a surprise, not
// their eventual cost once discoverable).
function visible(c: (typeof CLASSES)[number]): boolean {
  if (!c.secret) return true;
  return !!state.classesOwned[c.id] || classRequirementMet(c.id);
}
</script>

<template>
  <section class="tab-panel">
    <div class="section-title">
      <h2>Classes</h2>
      <span class="hint">Le multiclassage est autorisé : cumulez les voies qui vous conviennent. Certaines classes secrètes ne se révèlent qu'une fois leurs conditions remplies.</span>
    </div>
    <div v-for="tier in [0, 1, 2, 3, 4, 5, 6, 7]" :key="tier">
      <template v-if="byTier[tier].some(visible)">
        <h3 style="font-size: 0.95rem; color: var(--text-dim); margin-bottom: 0.6rem">{{ TIER_LABELS[tier] }}</h3>
        <div class="class-grid">
          <div
            v-for="c in byTier[tier].filter(visible)"
            :key="c.id"
            class="card"
            :class="{ owned: state.classesOwned[c.id], locked: !state.classesOwned[c.id] && !classCanBuy(c.id) }"
          >
            <h3>{{ c.name }}<span v-if="c.secret" class="badge" style="margin-left: 0.5em">secrète</span></h3>
            <p class="desc">{{ c.description }}</p>
            <div class="stats">
              <span>{{ bonusLabel(c.mod) }}</span>
            </div>
            <p v-if="alignmentLabel(c.mod)" class="desc" style="color: var(--ember)">
              {{ alignmentLabel(c.mod) }} à l'adoption
            </p>
            <div class="card-footer">
              <span class="badge">Requiert : {{ c.requirementLabel }}</span>
              <span class="badge gold">{{ costLabel(c.cost) }}</span>
            </div>
            <div class="card-footer" style="margin-top: 0.6rem">
              <button
                class="btn btn-small"
                :disabled="!!state.classesOwned[c.id] || !classCanBuy(c.id)"
                @click="buyClass(c.id)"
              >
                {{ state.classesOwned[c.id] ? 'Acquise' : 'Adopter' }}
              </button>
            </div>
          </div>
        </div>
      </template>
    </div>
  </section>
</template>
