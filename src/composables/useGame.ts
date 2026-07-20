import { reactive } from 'vue';
import type {
  ClassId,
  DungeonDef,
  GameState,
  ResourceId,
  ShopItemId,
  SkillId,
} from '../types';
import { RESOURCE_MAP, RESOURCE_IDS } from '../data/resources';
import { SKILLS, SKILL_MAP, SKILL_IDS, skillLevel } from '../data/skills';
import { ACTIVE_TASKS } from '../data/tasks';
import { CLASSES, CLASS_MAP, CLASS_IDS } from '../data/classes';
import { SHOP_ITEMS, SHOP_MAP } from '../data/shop';
import { DUNGEONS, DUNGEON_MAP } from '../data/dungeons';
import { EVENTS, EVENT_MAP } from '../data/events';
import { MONSTER_MAP } from '../data/monsters';
import { ENCOUNTER_MAP } from '../data/encounters';
import { evalExpr, parseMods, type ParsedMods } from '../engine/expr';
import { formatNumber } from '../utils/format';

const SAVE_KEY = 'grimoire_save_v2';

function createInitialState(): GameState {
  const resources = {} as Record<ResourceId, number>;
  for (const id of RESOURCE_IDS) resources[id] = 0;
  resources.gold = 15;
  resources.energy = 20;

  const skillXp = {} as Record<SkillId, number>;
  for (const id of SKILL_IDS) skillXp[id] = 0;

  return {
    playerName: 'Oz',
    resources,
    skillXp,
    skillsUnlocked: {},
    classesOwned: {},
    shopOwned: {},
    passiveAssignments: [null],
    activeCooldowns: {},
    virtue: 0,
    evilamt: 0,
    essence: 0,
    totalGoldEarnedThisLife: 0,
    elapsedSeconds: 0,
    dungeonsCompleted: {},
    dungeonProgress: {
      dungeonId: null,
      bar: 0,
      encountersDone: 0,
      inCombat: false,
      isBoss: false,
      monsterId: null,
      monsterHp: 0,
      monsterMaxHp: 0,
    },
    isExploring: false,
    journal: [],
    journalSeq: 1,
    activeEventId: null,
    milestonesSeen: {},
  };
}

export const state = reactive<GameState>(createInitialState());

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

// ---------- Requirement engine (`g.*` lookup) ----------

export function ownedClassIds(): ClassId[] {
  return (Object.keys(state.classesOwned) as ClassId[]).filter((id) => state.classesOwned[id]);
}

export function tierMax(): number {
  let max = 0;
  for (const id of ownedClassIds()) max = Math.max(max, CLASS_MAP[id].tier);
  return max;
}

const LEVELS_PER_SKILL_POINT = 5;

/** Sum of every skill's current level - the underlying "experience" pool the
 *  player level and its progress bar are derived from. */
export function totalSkillLevels(): number {
  let sum = 0;
  for (const id of SKILL_IDS) sum += skillLevel(state.skillXp[id] ?? 0);
  return sum;
}

export function playerLevel(): number {
  return 1 + Math.floor(totalSkillLevels() / LEVELS_PER_SKILL_POINT);
}

/** Progress toward the next player level, for an XP bar. */
export function levelProgress(): { current: number; needed: number; percent: number } {
  const total = totalSkillLevels();
  const level = playerLevel();
  const floor = (level - 1) * LEVELS_PER_SKILL_POINT;
  const current = total - floor;
  return {
    current,
    needed: LEVELS_PER_SKILL_POINT,
    percent: Math.min(100, (current / LEVELS_PER_SKILL_POINT) * 100),
  };
}

export function setPlayerName(name: string) {
  state.playerName = name.trim().slice(0, 30);
}

function buildG(): Record<string, unknown> {
  const g: Record<string, unknown> = {};
  for (const id of CLASS_IDS) g[id] = state.classesOwned[id] ? 1 : 0;
  for (const id of SKILL_IDS) g[id] = effectiveSkillLevel(id);
  for (const d of DUNGEONS) g[d.id] = state.dungeonsCompleted[d.id] ? 1 : 0;
  for (let t = 0; t <= 7; t++) g[`tier${t}`] = ownedClassIds().some((id) => CLASS_MAP[id].tier === t) ? 1 : 0;
  g.virtue = state.virtue;
  g.evilamt = state.evilamt;
  g.evil1 = state.evilamt >= 50 ? 1 : 0;
  g.evil2 = state.evilamt >= 150 ? 1 : 0;
  g.evil3 = state.evilamt >= 300 ? 1 : 0;
  g.good1 = state.virtue >= 50 ? 1 : 0;
  g.good2 = state.virtue >= 150 ? 1 : 0;
  g.good3 = state.virtue >= 300 ? 1 : 0;
  g.player = { level: playerLevel() };
  for (const id of RESOURCE_IDS) g[id] = state.resources[id] ?? 0;
  return g;
}

/** Alignment label for UI, derived from the dual virtue/evilamt meters. */
export function alignmentLabel(): string {
  if (state.evilamt >= 300) return 'Déchu';
  if (state.evilamt >= 150) return 'Corrompu';
  if (state.evilamt >= 50) return 'Trouble';
  if (state.virtue >= 300) return 'Saint';
  if (state.virtue >= 150) return 'Vertueux';
  if (state.virtue >= 50) return 'Bienveillant';
  return 'Neutre';
}

// ---------- Modifier aggregation (.max / .rate) ----------

function mergeMods(into: ParsedMods, from: ParsedMods) {
  for (const k in from.resourceMax) into.resourceMax[k] = (into.resourceMax[k] ?? 0) + from.resourceMax[k];
  for (const k in from.resourceRate) into.resourceRate[k] = (into.resourceRate[k] ?? 0) + from.resourceRate[k];
  for (const k in from.skillMax) into.skillMax[k] = (into.skillMax[k] ?? 0) + from.skillMax[k];
  for (const k in from.skillRate) into.skillRate[k] = (into.skillRate[k] ?? 0) + from.skillRate[k];
}

function scaleMods(mods: ParsedMods, factor: number): ParsedMods {
  const scale = (rec: Record<string, number>) =>
    Object.fromEntries(Object.entries(rec).map(([k, v]) => [k, v * factor]));
  return {
    resourceMax: scale(mods.resourceMax),
    resourceRate: scale(mods.resourceRate),
    skillMax: scale(mods.skillMax),
    skillRate: scale(mods.skillRate),
    virtue: mods.virtue * factor,
    evilamt: mods.evilamt * factor,
  };
}

function getAggregatedMods(): ParsedMods {
  const combined: ParsedMods = { resourceMax: {}, resourceRate: {}, skillMax: {}, skillRate: {}, virtue: 0, evilamt: 0 };
  // Class mods are flat - classes don't have levels, just owned/not owned.
  for (const id of ownedClassIds()) mergeMods(combined, parseMods(CLASS_MAP[id].mod, RESOURCE_IDS, SKILL_IDS));
  // Skill mods scale with the skill's own current level, applied retroactively:
  // as a skill levels up, its contribution to caps/rates grows immediately,
  // it isn't frozen at whatever it was when the skill was first unlocked.
  // Uses the base (xp-derived) level, not effectiveSkillLevel, to avoid a
  // circular dependency (effectiveSkillLevel reads this function's output).
  for (const id of Object.keys(state.skillsUnlocked) as SkillId[]) {
    if (!state.skillsUnlocked[id]) continue;
    const def = SKILL_MAP[id];
    if (!def) continue;
    const level = skillLevel(state.skillXp[id] ?? 0);
    mergeMods(combined, scaleMods(parseMods(def.mod, RESOURCE_IDS, SKILL_IDS), level));
  }
  return combined;
}

export function effectiveSkillLevel(id: SkillId): number {
  const base = skillLevel(state.skillXp[id] ?? 0);
  const bonus = getAggregatedMods().skillMax[id] ?? 0;
  return Math.max(0, base + bonus);
}

export function energyCap(): number {
  const mods = getAggregatedMods();
  let cap = RESOURCE_MAP.energy.baseCap + (mods.resourceMax.energy ?? 0) + shopCapBonusFor('energy');
  if (state.shopOwned.stamina_reserve) cap += 20;
  return Math.max(0, cap);
}

export function resourceCap(id: ResourceId): number {
  if (id === 'energy') return energyCap();
  const def = RESOURCE_MAP[id];
  if (!def) return 0;
  if (def.uncapped) return Number.MAX_SAFE_INTEGER;
  const mods = getAggregatedMods();
  return Math.max(0, def.baseCap + (mods.resourceMax[id] ?? 0) + shopCapBonusFor(id));
}

/** Uncapped (inventory-style) resources reveal once first obtained; capped
 *  ("attribute-like") resources reveal once their cap is raised above 0. */
export function resourceUnlocked(id: ResourceId): boolean {
  const def = RESOURCE_MAP[id];
  if (def?.uncapped) return state.resources[id] > 0;
  return resourceCap(id) > 0 || state.resources[id] > 0;
}

function shopCapBonusFor(resource: ResourceId): number {
  let total = 0;
  for (const id of Object.keys(state.shopOwned) as ShopItemId[]) {
    if (!state.shopOwned[id]) continue;
    total += SHOP_MAP[id]?.effect.resourceCapBonus?.[resource] ?? 0;
  }
  return total;
}

function shopBonusFor(resource: ResourceId): number {
  let total = 0;
  for (const id of Object.keys(state.shopOwned) as ShopItemId[]) {
    if (!state.shopOwned[id]) continue;
    total += SHOP_MAP[id]?.effect.productionBonus?.[resource] ?? 0;
  }
  return total;
}

function dungeonBonusFor(resource: ResourceId): number {
  let total = 0;
  for (const id of Object.keys(state.dungeonsCompleted)) {
    if (!state.dungeonsCompleted[id]) continue;
    total += DUNGEON_MAP[id]?.reward.productionBonus?.[resource] ?? 0;
  }
  return total;
}

export function eventSafetyBonus(): number {
  return clamp(state.shopOwned.boots ? 0.2 : 0, 0, 0.6);
}

export function productionMultiplier(resource: ResourceId, skillId: SkillId | ''): number {
  const mods = getAggregatedMods();
  const lvl = skillId ? effectiveSkillLevel(skillId) : 0;
  return 1 + lvl * 0.02 + (mods.resourceRate[resource] ?? 0) + shopBonusFor(resource) + dungeonBonusFor(resource) + state.essence * 0.05;
}

function skillXpMultiplier(skillId: SkillId): number {
  const mods = getAggregatedMods();
  return 1 + (mods.skillRate[skillId] ?? 0) + (state.shopOwned.amulet ? 0.15 : 0);
}

export function addResource(id: ResourceId, amount: number) {
  const cap = resourceCap(id);
  state.resources[id] = clamp((state.resources[id] ?? 0) + amount, 0, cap);
  if (id === 'gold' && amount > 0) state.totalGoldEarnedThisLife += amount;
}

function addSkillXp(skill: SkillId, baseAmount: number) {
  if (!skill) return;
  state.skillXp[skill] = (state.skillXp[skill] ?? 0) + Math.abs(baseAmount) * skillXpMultiplier(skill);
}

export function currentDay(): number {
  return Math.floor(state.elapsedSeconds / 60) + 1;
}

export function addJournal(text: string) {
  state.journal.unshift({ id: state.journalSeq++, day: currentDay(), text });
  if (state.journal.length > 200) state.journal.length = 200;
}

/** Formats resource deltas as a parenthesized suffix, e.g. " (+15 ☉, -5 ⚡)". */
function gainsLabel(gains: Partial<Record<ResourceId, number>>): string {
  const entries = (Object.entries(gains) as [ResourceId, number][]).filter(([, amt]) => Math.abs(amt) >= 0.005);
  if (entries.length === 0) return '';
  const parts = entries.map(([res, amt]) => `${amt >= 0 ? '+' : ''}${formatNumber(amt)} ${RESOURCE_MAP[res]?.symbol ?? res}`);
  return ` (${parts.join(', ')})`;
}

function canAfford(cost: Partial<Record<ResourceId, number>>): boolean {
  return (Object.entries(cost) as [ResourceId, number][]).every(([res, amt]) => (state.resources[res] ?? 0) >= amt);
}

function spend(cost: Partial<Record<ResourceId, number>>) {
  (Object.entries(cost) as [ResourceId, number][]).forEach(([res, amt]) => {
    state.resources[res] = Math.max(0, (state.resources[res] ?? 0) - amt);
  });
}

function applyAlignmentDeltas(mods: ParsedMods) {
  if (mods.virtue) state.virtue = clamp(state.virtue + mods.virtue, 0, 999);
  if (mods.evilamt) state.evilamt = clamp(state.evilamt + mods.evilamt, 0, 999);
}

// ---------- Skills (unlock + practice) ----------

export function skillUnlocked(id: SkillId): boolean {
  return !!state.skillsUnlocked[id];
}

export function skillRequirementMet(id: SkillId): boolean {
  const def = SKILL_MAP[id];
  if (!def) return false;
  return evalExpr(def.require, buildG());
}

export function canUnlockSkill(id: SkillId): boolean {
  const def = SKILL_MAP[id];
  if (!def || skillUnlocked(id)) return false;
  return skillRequirementMet(id) && canAfford(def.unlockCost);
}

export function unlockSkill(id: SkillId) {
  const def = SKILL_MAP[id];
  if (!def || !canUnlockSkill(id)) return;
  spend(def.unlockCost);
  state.skillsUnlocked[id] = true;
  addJournal(`Vous apprenez les rudiments de : ${def.name}.`);
}

export function slotsAvailable(): number {
  return tierMax() + 1;
}

export function assignSkillSlot(slot: number, skillId: SkillId | null) {
  if (slot < 0 || slot >= state.passiveAssignments.length) return;
  if (skillId) {
    if (!skillUnlocked(skillId)) return;
    const existingSlot = state.passiveAssignments.indexOf(skillId);
    if (existingSlot !== -1) state.passiveAssignments[existingSlot] = null;
  }
  state.passiveAssignments[slot] = skillId;
}

function syncPassiveSlots() {
  const wanted = slotsAvailable();
  while (state.passiveAssignments.length < wanted) state.passiveAssignments.push(null);
  while (state.passiveAssignments.length > wanted) state.passiveAssignments.pop();
}

// ---------- Active tasks ----------

export function activeTaskUnlocked(taskId: string): boolean {
  const task = ACTIVE_TASKS.find((t) => t.id === taskId);
  if (!task) return false;
  return evalExpr(task.require, buildG());
}

export function activeTaskCooldown(taskId: string): number {
  return state.activeCooldowns[taskId] ?? 0;
}

export function canRunActiveTask(taskId: string): boolean {
  const task = ACTIVE_TASKS.find((t) => t.id === taskId);
  if (!task) return false;
  return activeTaskUnlocked(taskId) && activeTaskCooldown(taskId) <= 0 && canAfford(task.cost);
}

export function runActiveTask(taskId: string) {
  const task = ACTIVE_TASKS.find((t) => t.id === taskId);
  if (!task || !canRunActiveTask(taskId)) return;
  spend(task.cost);
  const mult = productionMultiplier(task.resource, task.skill as SkillId | '');
  addResource(task.resource, task.baseAmount * mult);
  if (task.skill) addSkillXp(task.skill, 1);
  if (task.virtueDelta) state.virtue = clamp(state.virtue + task.virtueDelta, 0, 999);
  if (task.evilDelta) state.evilamt = clamp(state.evilamt + task.evilDelta, 0, 999);
  state.activeCooldowns[taskId] = task.cooldown;
}

// ---------- Classes ----------

export function classRequirementMet(id: ClassId): boolean {
  const def = CLASS_MAP[id];
  if (!def) return false;
  return evalExpr(def.require, buildG());
}

export function classCanBuy(id: ClassId): boolean {
  const def = CLASS_MAP[id];
  if (!def || state.classesOwned[id]) return false;
  return classRequirementMet(id) && canAfford(def.cost);
}

export function buyClass(id: ClassId) {
  const def = CLASS_MAP[id];
  if (!def || !classCanBuy(id)) return;
  spend(def.cost);
  state.classesOwned[id] = true;
  applyAlignmentDeltas(parseMods(def.mod, RESOURCE_IDS, SKILL_IDS));
  syncPassiveSlots();
  addJournal(`Vous embrassez la voie de : ${def.name}.`);
}

// ---------- Shop ----------

export function shopCanBuy(id: ShopItemId): boolean {
  const def = SHOP_MAP[id];
  if (!def || state.shopOwned[id]) return false;
  return canAfford(def.cost);
}

export function buyShopItem(id: ShopItemId) {
  const def = SHOP_MAP[id];
  if (!def || !shopCanBuy(id)) return;
  spend(def.cost);
  state.shopOwned[id] = true;
  addJournal(`Vous acquérez : ${def.name}.`);
}

// ---------- Dungeons ----------

export function dungeonUnlocked(def: DungeonDef): boolean {
  return evalExpr(def.require, buildG());
}

export function hasUnsavedDungeonProgress(id: string): boolean {
  const prog = state.dungeonProgress;
  return prog.dungeonId !== null && prog.dungeonId !== id && (prog.bar > 0 || prog.encountersDone > 0);
}

export function switchDungeon(id: string) {
  if (state.dungeonProgress.dungeonId !== id) {
    state.dungeonProgress = {
      dungeonId: id,
      bar: 0,
      encountersDone: 0,
      inCombat: false,
      isBoss: false,
      monsterId: null,
      monsterHp: 0,
      monsterMaxHp: 0,
    };
  }
  state.isExploring = true;
}

export function stopExploring() {
  state.isExploring = false;
}

export function playerPower(): number {
  let skillSum = 0;
  for (const id of SKILL_IDS) skillSum += effectiveSkillLevel(id);
  return 8 + skillSum * 1.5 + tierMax() * 6;
}

function checkDungeonCompletion(def: DungeonDef) {
  const prog = state.dungeonProgress;
  if (prog.encountersDone < def.encountersRequired) return;

  // One-time reward grant, only the first time this dungeon is cleared.
  if (!state.dungeonsCompleted[def.id]) {
    state.dungeonsCompleted[def.id] = true;
    if (def.reward.essence) state.essence += def.reward.essence;
    addJournal(`Vous achevez ${def.name} ! Récompense : ${def.reward.label}`);
  }

  // Leaving the dungeon and resetting progress happens every time the
  // required encounter count is reached, including repeat farming runs.
  addJournal(`Vous quittez ${def.name}, votre objectif accompli.`);
  state.isExploring = false;
  state.dungeonProgress = {
    dungeonId: null,
    bar: 0,
    encountersDone: 0,
    inCombat: false,
    isBoss: false,
    monsterId: null,
    monsterHp: 0,
    monsterMaxHp: 0,
  };
}

function resolveEncounter(def: DungeonDef) {
  const prog = state.dungeonProgress;
  const isBossFight = !state.dungeonsCompleted[def.id] && prog.encountersDone + 1 === def.encountersRequired;
  if (isBossFight || Math.random() < 0.45) {
    const monsterId = isBossFight ? def.bossId : def.monsterIds[Math.floor(Math.random() * def.monsterIds.length)];
    const monster = MONSTER_MAP[monsterId];
    if (!monster) {
      prog.encountersDone++;
      prog.bar = 0;
      checkDungeonCompletion(def);
      return;
    }
    const hp = isBossFight ? Math.round(monster.hp * 1.5) : monster.hp;
    prog.inCombat = true;
    prog.isBoss = isBossFight;
    prog.monsterId = monsterId;
    prog.monsterMaxHp = hp;
    prog.monsterHp = hp;
    addJournal(`${isBossFight ? 'Un gardien' : 'Une créature'} surgit dans ${def.name} : ${monster.name} !`);
  } else if (Math.random() < 0.5 && def.encounterIds.length > 0) {
    const enc = ENCOUNTER_MAP[def.encounterIds[Math.floor(Math.random() * def.encounterIds.length)]];
    const gained: Partial<Record<ResourceId, number>> = {};
    for (const loot of enc.loot ?? []) {
      if (Math.random() <= (loot.chance ?? 1)) {
        const amount = loot.min + Math.random() * (loot.max - loot.min);
        addResource(loot.resource, amount);
        gained[loot.resource] = (gained[loot.resource] ?? 0) + amount;
      }
    }
    for (const sx of enc.skillXp ?? []) addSkillXp(sx.skill, sx.amount);
    addJournal(`${enc.name} — ${enc.text}${gainsLabel(gained)}`);
    prog.encountersDone++;
    prog.bar = 0;
    checkDungeonCompletion(def);
  } else {
    const entry = def.loot[Math.floor(Math.random() * def.loot.length)];
    const amount = entry.min + Math.random() * (entry.max - entry.min);
    addResource(entry.resource, amount);
    addJournal(`Vous découvrez du butin dans ${def.name}.${gainsLabel({ [entry.resource]: amount })}`);
    prog.encountersDone++;
    prog.bar = 0;
    checkDungeonCompletion(def);
  }
}

function tickDungeon() {
  if (!state.isExploring || !state.dungeonProgress.dungeonId) return;
  const def = DUNGEON_MAP[state.dungeonProgress.dungeonId];
  const prog = state.dungeonProgress;
  if (!def) return;
  if (prog.inCombat) {
    prog.monsterHp -= playerPower();
    if (prog.monsterHp <= 0) {
      const monster = prog.monsterId ? MONSTER_MAP[prog.monsterId] : null;
      const rolls = prog.isBoss ? 2 : 1;
      const gained: Partial<Record<ResourceId, number>> = {};
      for (let i = 0; i < rolls && def.loot.length > 0; i++) {
        const entry = def.loot[Math.floor(Math.random() * def.loot.length)];
        const amount = entry.min + Math.random() * (entry.max - entry.min);
        addResource(entry.resource, amount);
        gained[entry.resource] = (gained[entry.resource] ?? 0) + amount;
      }
      prog.inCombat = false;
      prog.isBoss = false;
      prog.monsterId = null;
      prog.encountersDone++;
      prog.bar = 0;
      addJournal(`Vous triomphez de ${monster?.name ?? 'la créature'} dans ${def.name}.${gainsLabel(gained)}`);
      checkDungeonCompletion(def);
    }
    return;
  }
  const cost = def.energyCostPerSecond;
  if (state.resources.energy < cost) {
    state.isExploring = false;
    addJournal(`Épuisé, vous quittez ${def.name} — votre progression est conservée.`);
    return;
  }
  state.resources.energy = clamp(state.resources.energy - cost, 0, energyCap());
  prog.bar += 100 / def.barSeconds;
  if (prog.bar >= 100) {
    prog.bar = 100;
    resolveEncounter(def);
  }
}

// ---------- Events ----------

function triggerRandomEvent() {
  const eligible = EVENTS.filter(
    (e) => !e.unlock || e.unlock({ virtue: state.virtue, evilamt: state.evilamt, classes: state.classesOwned as Record<string, boolean> })
  );
  if (eligible.length === 0) return;
  const chosen = eligible[Math.floor(Math.random() * eligible.length)];
  state.activeEventId = chosen.id;
}

export function resolveEventChoice(choiceIndex: number) {
  if (!state.activeEventId) return;
  const event = EVENT_MAP[state.activeEventId];
  const choice = event.choices[choiceIndex];
  if (!choice) return;
  (Object.entries(choice.effect) as [ResourceId, number][]).forEach(([res, amt]) => addResource(res, amt));
  if (choice.virtueDelta) state.virtue = clamp(state.virtue + choice.virtueDelta, 0, 999);
  if (choice.evilDelta) state.evilamt = clamp(state.evilamt + choice.evilDelta, 0, 999);
  addJournal(`${event.title} — ${choice.resultText}${gainsLabel(choice.effect)}`);
  state.activeEventId = null;
}

function tickEvents() {
  if (state.isExploring || state.activeEventId) return;
  const chance = 0.0006 * (1 - eventSafetyBonus());
  if (Math.random() < chance) triggerRandomEvent();
}

// ---------- Prestige ----------

export function canPrestige(): boolean {
  return !!state.shopOwned.ritual_circle;
}

export function essenceOnPrestige(): number {
  return Math.floor(Math.sqrt(state.totalGoldEarnedThisLife / 500));
}

export function doPrestige() {
  if (!canPrestige()) return;
  const gained = essenceOnPrestige();
  const newEssence = state.essence + gained;
  const fresh = createInitialState();
  fresh.playerName = state.playerName;
  fresh.essence = newEssence;
  fresh.virtue = state.virtue;
  fresh.evilamt = state.evilamt;
  fresh.journal = state.journal;
  fresh.journalSeq = state.journalSeq;
  Object.assign(state, fresh);
  addJournal(`Réincarnation Arcanique : vous renaissez avec ${gained} Essence Arcanique supplémentaire (total : ${newEssence}).`);
}

// ---------- Save / Load ----------

export function exportSave(): string {
  return btoa(unescape(encodeURIComponent(JSON.stringify(state))));
}

export function importSave(code: string): boolean {
  try {
    const json = decodeURIComponent(escape(atob(code.trim())));
    const data = JSON.parse(json);
    Object.assign(state, data);
    syncPassiveSlots();
    return true;
  } catch {
    return false;
  }
}

export function resetGame() {
  Object.assign(state, createInitialState());
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch {
    /* ignore */
  }
}

export function loadFromStorage() {
  try {
    const saved = localStorage.getItem(SAVE_KEY);
    if (saved) importSave(saved);
  } catch {
    /* ignore */
  }
}

function autosave() {
  try {
    localStorage.setItem(SAVE_KEY, exportSave());
  } catch {
    /* ignore */
  }
}

// ---------- Main tick ----------

export function tick() {
  state.elapsedSeconds++;

  // Baseline energy regeneration - always trickles in, so a cold start never
  // soft-locks on "no energy, no way to earn energy".
  addResource('energy', 0.6 * (1 + state.essence * 0.05));

  for (const skillId of state.passiveAssignments) {
    if (!skillId) continue;
    const def = SKILL_MAP[skillId];
    if (!def || !state.skillsUnlocked[skillId]) continue;
    if (!canAfford(def.cost)) continue;
    spend(def.cost);
    for (const [res, amt] of Object.entries(def.result) as [ResourceId, number][]) {
      addResource(res, amt * productionMultiplier(res, skillId));
    }
    addSkillXp(skillId, 1);
  }

  for (const id of Object.keys(state.activeCooldowns)) {
    if (state.activeCooldowns[id] > 0) state.activeCooldowns[id] = Math.max(0, state.activeCooldowns[id] - 1);
  }

  tickDungeon();
  tickEvents();

  if (state.elapsedSeconds % 5 === 0) autosave();
}

let loopHandle: ReturnType<typeof setInterval> | null = null;

export function startGameLoop() {
  if (loopHandle) return;
  loadFromStorage();
  syncPassiveSlots();
  loopHandle = setInterval(tick, 1000);
}

export function stopGameLoop() {
  if (loopHandle) clearInterval(loopHandle);
  loopHandle = null;
}

export { SKILLS, ACTIVE_TASKS, CLASSES, SHOP_ITEMS, DUNGEONS, EVENT_MAP, MONSTER_MAP, ENCOUNTER_MAP };
