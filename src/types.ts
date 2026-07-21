// Resource/Skill/Class/Dungeon ids are plain strings (not literal unions) because
// this game imports the real class/skill/resource lists from Theory of Magic
// (~40 resources, ~50 skills, ~50 classes) - a literal union would be unwieldy
// to maintain and buys little safety since all definitions live in data/*.ts.
export type ResourceId = string;
export type SkillId = string;
export type ClassId = string;
export type ShopItemId = string;
export type DungeonId = string;
export type MonsterId = string;
export type EncounterId = string;

export type ResourceCategory =
  | 'currency'
  | 'attribute'
  | 'mana'
  | 'knowledge'
  | 'material'
  | 'gem'
  | 'rune'
  | 'necromancy';

export interface ResourceDef {
  id: ResourceId;
  name: string;
  symbol: string;
  category: ResourceCategory;
  /** Base cap before any .max modifiers. Most non-core resources start at 0
   *  and stay hidden in the UI until a skill/class grants a .max bonus -
   *  mirroring how Theory of Magic only reveals a resource once it is "unlocked". */
  baseCap: number;
  /** Inventory-style resources (materials, gems, runes, necromancy items, sp)
   *  are never capped in the source game - only "attribute-like" resources
   *  (research, mana pools, herbs, energy) have a real cap driven by .max
   *  mods. Uncapped resources reveal in the UI once first obtained instead
   *  of once their cap is raised. */
  uncapped?: boolean;
  color: string;
}

/** A dotted-path modifier map, adapted from Theory of Magic's mod system.
 *  Supported key shapes:
 *   - "<resourceId>.max"   -> flat bonus to that resource's cap
 *   - "<resourceId>.rate"  -> flat passive gain/loss of that resource, applied
 *                             once per second regardless of source (classes,
 *                             skills - scaled by level, homes, furniture -
 *                             scaled by copies owned); see passiveResourceRates()
 *   - "<skillId>.max"      -> flat bonus to that skill's effective level
 *   - "<skillId>.rate"     -> bonus to that skill's XP gain rate (fraction)
 *   - "virtue" / "evilamt" -> one-time permanent alignment delta on acquisition
 *  Values may be a number, or a percentage string like "10%" (parsed as 0.10).
 *  Deeper nested paths from the source game (e.g. skill-on-skill result mods)
 *  are intentionally not supported - documented simplification.
 */
export type ModMap = Record<string, number | string>;

export interface SkillDef {
  id: SkillId;
  name: string;
  school: string | null;
  description: string;
  flavor?: string;
  /** JS boolean expression over `g.*`, evaluated by evalExpr(). */
  require: string;
  /** One-time resource cost paid to unlock this skill for practice. */
  unlockCost: Partial<Record<ResourceId, number>>;
  /** Resource cost to practice this skill once (per tick when assigned). */
  cost: Partial<Record<ResourceId, number>>;
  /** Resources granted per practice, before multipliers. */
  result: Partial<Record<ResourceId, number>>;
  mod: ModMap;
}

export interface ActiveTaskDef {
  id: string;
  name: string;
  description: string;
  resource: ResourceId;
  baseAmount: number;
  cost: Partial<Record<ResourceId, number>>;
  cooldown: number; // seconds
  skill: SkillId;
  require: string;
  /** One-time alignment shift applied every time this task runs. */
  virtueDelta?: number;
  evilDelta?: number;
}

// 0 = Origine (Apprenti, métiers, Néophyte - the real game's pre-tier0 stage)
// 1..7 = the real game's tier0..tier6 (adept/magician/.../avatar)
export type ClassTier = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface ClassDef {
  id: ClassId;
  name: string;
  tier: ClassTier;
  description: string;
  flavor?: string;
  /** JS boolean expression over `g.*`, evaluated by evalExpr(). */
  require: string;
  requirementLabel: string;
  cost: Partial<Record<ResourceId, number>>;
  mod: ModMap;
  secret?: boolean;
}

/** Adapted from Theory of Magic's home/furniture systems (data/homes.json,
 *  data/furniture.json). Only one home is ever owned at a time - moving in
 *  replaces whichever home you had before, mirroring the source game's
 *  mutually-exclusive "disable" groups. `spaceMax` is the furniture capacity
 *  a home grants; furniture pieces each cost some of that capacity via
 *  `spaceCost`, gating how much you can furnish a given home with. */
export interface HomeDef {
  id: string;
  name: string;
  description: string;
  flavor?: string;
  require: string;
  requirementLabel: string;
  cost: Partial<Record<ResourceId, number>>;
  spaceMax: number;
  mod: ModMap;
}

export interface FurnitureDef {
  id: string;
  name: string;
  description: string;
  require: string;
  requirementLabel: string;
  cost: Partial<Record<ResourceId, number>>;
  spaceCost: number;
  /** Max copies ownable; unlimited (space/cost permitting) if omitted. */
  maxCount?: number;
  mod: ModMap;
}

export interface ShopItemDef {
  id: ShopItemId;
  name: string;
  description: string;
  cost: Partial<Record<ResourceId, number>>;
  effect: {
    productionBonus?: Partial<Record<ResourceId, number>>;
    skillXpBonus?: number;
    eventSafety?: number;
    energyCapBonus?: number;
    resourceCapBonus?: Partial<Record<ResourceId, number>>;
    unlocksPrestige?: boolean;
  };
}

export interface LootEntry {
  resource: ResourceId;
  min: number;
  max: number;
  chance?: number; // 0..1, defaults to 1 (always some amount when loot triggers)
}

export interface MonsterDef {
  id: MonsterId;
  name: string;
  level: number;
  kind: string;
  evil?: number;
  hp: number;
  defense: number;
  attackName: string;
  damageMin: number;
  damageMax: number;
  unique?: boolean;
  flavor?: string;
}

export interface EncounterDef {
  id: EncounterId;
  name: string;
  text: string;
  flavor?: string;
  loot?: LootEntry[];
  skillXp?: { skill: SkillId; amount: number }[];
}

export interface DungeonDef {
  id: DungeonId;
  name: string;
  description: string;
  flavor?: string;
  /** JS boolean expression over `g.*`, evaluated by evalExpr(). */
  require: string;
  requirementLabel: string;
  level: number;
  encountersRequired: number;
  barSeconds: number;
  energyCostPerSecond: number;
  loot: LootEntry[];
  encounterIds: EncounterId[];
  monsterIds: MonsterId[];
  bossId: MonsterId;
  reward: {
    productionBonus?: Partial<Record<ResourceId, number>>;
    essence?: number;
    label: string;
  };
}

export interface EventChoice {
  label: string;
  effect: Partial<Record<ResourceId, number>>;
  virtueDelta?: number;
  evilDelta?: number;
  resultText: string;
}

export interface GameEventDef {
  id: string;
  title: string;
  text: string;
  tone: 'positive' | 'neutral' | 'negative';
  unlock?: (state: { virtue: number; evilamt: number; classes: Record<string, boolean> }) => boolean;
  choices: EventChoice[];
}

export interface DungeonProgress {
  dungeonId: DungeonId | null;
  bar: number;
  encountersDone: number;
  inCombat: boolean;
  isBoss: boolean;
  monsterId: MonsterId | null;
  monsterHp: number;
  monsterMaxHp: number;
}

export interface JournalEntry {
  id: number;
  day: number;
  text: string;
}

export interface GameState {
  playerName: string;
  resources: Record<ResourceId, number>;
  skillXp: Record<SkillId, number>;
  skillsUnlocked: Partial<Record<SkillId, boolean>>;
  classesOwned: Partial<Record<ClassId, boolean>>;
  shopOwned: Partial<Record<ShopItemId, boolean>>;
  homeOwned: string | null;
  furnitureOwned: Record<string, number>;
  passiveAssignments: (string | null)[]; // slot -> skill id
  activeCooldowns: Record<string, number>; // task id -> seconds remaining
  /** Dual alignment meters, as in Theory of Magic (virtue vs evilamt), replacing
   *  a single -50..+50 slider - the real game tracks good and evil independently. */
  virtue: number;
  evilamt: number;
  essence: number;
  totalGoldEarnedThisLife: number;
  elapsedSeconds: number;
  dungeonsCompleted: Partial<Record<DungeonId, boolean>>;
  dungeonProgress: DungeonProgress;
  isExploring: boolean;
  journal: JournalEntry[];
  journalSeq: number;
  activeEventId: string | null;
  milestonesSeen: Partial<Record<string, boolean>>;
}
