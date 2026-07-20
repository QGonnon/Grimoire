import type { ModMap } from '../types';

/**
 * Evaluates a Theory-of-Magic-style requirement string such as
 * "g.tier2>0&&g.lore>=15" or "g.evil1>0&&g.player.level>=9" against a `g`
 * lookup object. All expressions in this codebase are authored by us (game
 * data, not user input), so a constrained `Function` evaluator is safe here.
 * Any key not present on `g` reads as 0 via a Proxy fallback, so adapted
 * requirements referencing not-yet-implemented systems degrade gracefully
 * instead of throwing.
 */
export function evalExpr(expr: string, g: Record<string, unknown>): boolean {
  if (!expr || expr.trim() === '') return true;
  const proxied = wrapWithFallback(g);
  try {
    // eslint-disable-next-line no-new-func
    const fn = new Function('g', `return (${expr});`);
    return !!fn(proxied);
  } catch {
    return false;
  }
}

function wrapWithFallback(obj: Record<string, unknown>): Record<string, unknown> {
  return new Proxy(obj, {
    get(target, prop) {
      const value = (target as Record<string | symbol, unknown>)[prop];
      if (value === undefined) {
        // Nested access like g.player.level: return another fallback proxy
        // for anything under `player`, plain 0 for everything else.
        if (prop === 'player') return wrapWithFallback({});
        return 0;
      }
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        return wrapWithFallback(value as Record<string, unknown>);
      }
      return value;
    },
  });
}

/** Parses a mod value which may be a plain number or a percentage string like "10%". */
export function parseModValue(value: number | string): number {
  if (typeof value === 'number') return value;
  const trimmed = value.trim();
  if (trimmed.endsWith('%')) {
    const n = parseFloat(trimmed.slice(0, -1));
    return Number.isFinite(n) ? n / 100 : 0;
  }
  const n = parseFloat(trimmed);
  return Number.isFinite(n) ? n : 0;
}

export interface ParsedMods {
  /** id -> flat cap bonus */
  resourceMax: Record<string, number>;
  /** id -> fractional rate bonus */
  resourceRate: Record<string, number>;
  /** id -> flat level bonus */
  skillMax: Record<string, number>;
  /** id -> fractional xp-rate bonus */
  skillRate: Record<string, number>;
  /** one-time alignment deltas granted on acquisition */
  virtue: number;
  evilamt: number;
}

const TIER_FLAG = /^tier[0-6]$/;

/**
 * Splits a ModMap's dotted-path keys into buckets our production/cap system
 * understands. Keys with unsupported nesting (e.g. "a.mod.b.rate") are
 * skipped - a documented simplification vs. the source game's fully generic
 * modifier graph.
 */
export function parseMods(mod: ModMap | undefined, resourceIds: Set<string>, skillIds: Set<string>): ParsedMods {
  const result: ParsedMods = {
    resourceMax: {},
    resourceRate: {},
    skillMax: {},
    skillRate: {},
    virtue: 0,
    evilamt: 0,
  };
  if (!mod) return result;
  for (const [key, raw] of Object.entries(mod)) {
    if (TIER_FLAG.test(key)) continue;
    if (key === 'virtue') {
      result.virtue += parseModValue(raw);
      continue;
    }
    if (key === 'evilamt') {
      result.evilamt += parseModValue(raw);
      continue;
    }
    const parts = key.split('.');
    if (parts.length !== 2) continue; // deeper nesting unsupported, skip
    const [id, suffix] = parts;
    const value = parseModValue(raw);
    if (suffix === 'max') {
      if (resourceIds.has(id)) result.resourceMax[id] = (result.resourceMax[id] ?? 0) + value;
      else if (skillIds.has(id)) result.skillMax[id] = (result.skillMax[id] ?? 0) + value;
    } else if (suffix === 'rate') {
      if (resourceIds.has(id)) result.resourceRate[id] = (result.resourceRate[id] ?? 0) + value;
      else if (skillIds.has(id)) result.skillRate[id] = (result.skillRate[id] ?? 0) + value;
    }
  }
  return result;
}
