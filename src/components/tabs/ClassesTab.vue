<script setup lang="ts">
import { computed } from 'vue';
import { state, classCanBuy, classRequirementMet, buyClass } from '../../composables/useGame';
import { CLASSES, TIER_LABELS } from '../../data/classes';
import { RESOURCE_MAP, RESOURCE_IDS } from '../../data/resources';
import { SKILL_MAP, SKILL_IDS } from '../../data/skills';
import { parseMods } from '../../engine/expr';
import { formatNumber, formatPercent } from '../../utils/format';
import type { ResourceId } from '../../types';

function costLabel(cost: Partial<Record<ResourceId, number>>): string {
  const entries = Object.entries(cost) as [ResourceId, number][];
  if (entries.length === 0) return 'Gratuit';
  return entries.map(([res, amt]) => `${RESOURCE_MAP[res]?.symbol ?? '?'} ${RESOURCE_MAP[res]?.name ?? res} ${formatNumber(amt)}`).join('  ·  ');
}

// A resource ".rate" mod is a flat passive gain/loss applied every second
// (see passiveResourceRates() in useGame.ts), not a percentage bonus -
// displayed here as "+X/s" accordingly.
function bonusList(mod: Record<string, number | string>): string[] {
  const parsed = parseMods(mod, RESOURCE_IDS, SKILL_IDS);
  const parts: string[] = [];
  for (const [id, v] of Object.entries(parsed.resourceRate)) {
    parts.push(`${RESOURCE_MAP[id]?.symbol ?? ''} ${RESOURCE_MAP[id]?.name ?? id} ${v >= 0 ? '+' : ''}${formatNumber(v)}/s`);
  }
  for (const [id, v] of Object.entries(parsed.resourceMax)) parts.push(`${RESOURCE_MAP[id]?.name ?? id} max +${formatNumber(v)}`);
  for (const [id, v] of Object.entries(parsed.skillMax)) parts.push(`${SKILL_MAP[id]?.name ?? id} niveau +${formatNumber(v)}`);
  for (const [id, v] of Object.entries(parsed.skillRate)) parts.push(`${SKILL_MAP[id]?.name ?? id} apprentissage +${formatPercent(v)}`);
  return parts;
}

function alignmentLabel(mod: Record<string, number | string>): string | null {
  const parsed = parseMods(mod, RESOURCE_IDS, SKILL_IDS);
  const parts: string[] = [];
  if (parsed.virtue) parts.push(`Vertu +${formatNumber(parsed.virtue)}`);
  if (parsed.evilamt) parts.push(`Corruption +${formatNumber(parsed.evilamt)}`);
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
            <div v-if="bonusList(c.mod).length" class="stats-group">
              <span class="stats-label">Modificateurs</span>
              <ul class="stats-list">
                <li v-for="(b, i) in bonusList(c.mod)" :key="i">{{ b }}</li>
              </ul>
            </div>
            <p v-else class="desc">Aucun bonus direct</p>
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
