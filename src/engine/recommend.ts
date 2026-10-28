import { FOODS } from '../data/foods'
import type { Rng } from '../lib/random'
import type { Answers, BudgetChoice, BudgetTier, Food, Hunger } from '../types'
import { buildReason } from './reasons'
import { MIN_POOL, WEIGHTS } from './weights'

/** Everything the engine knows about her taste. Lives in localStorage (see src/state). */
export interface Profile {
  /** Recently recommended food ids, newest first. */
  recent: readonly string[]
  /** How many times each food was accepted. */
  accepted: Readonly<Record<string, number>>
  favorites: readonly string[]
}

export const EMPTY_PROFILE: Profile = { recent: [], accepted: {}, favorites: [] }

export interface RecommendOptions {
  foods?: readonly Food[]
  rng?: Rng
  /** Never recommend these (e.g. what was already shown in this session). */
  exclude?: readonly string[]
  /** Extra weight for the kebab / ćevapi family. On by default. */
  kebabBoost?: boolean
}

/** Which answers a food satisfied; used for the personalised explanation. */
export type MatchKey = 'mood' | 'craving' | 'method' | 'budget'

export interface Recommendation {
  food: Food
  /** Two more good options, never the primary. */
  alternatives: Food[]
  /** English explanation of why this fits the answers. */
  reason: string
  matches: readonly MatchKey[]
  /** True when the strict filters left too few options and hunger was loosened. */
  relaxed: boolean
  /** True for the "Fine, you pick!" path. */
  surprise: boolean
}

export interface ScoreResult {
  score: number
  matches: MatchKey[]
  /** Whether the personal kebab bonus was applied. */
  affinityApplied: boolean
}

const HUNGER_ORDER: readonly Hunger[] = ['snack', 'normal', 'big', 'starving']

/** Budget answer → the tier it asks for. Foods above it are filtered out. */
export const BUDGET_TIER: Record<BudgetChoice, BudgetTier> = {
  cheap: 1,
  normal: 2,
  treat: 3,
  splurge: 4,
}

/** How loosely the hunger answer is applied when too few foods match. */
type HungerSlack = 0 | 1 | 'any'

const hungerFits = (food: Food, hunger: Hunger, slack: HungerSlack): boolean => {
  if (slack === 'any') return true
  const level = HUNGER_ORDER.indexOf(hunger)
  return food.hunger.some((h) => Math.abs(HUNGER_ORDER.indexOf(h) - level) <= slack)
}

/**
 * Hard restrictions. Eating method and budget are never relaxed: a pizza slice is
 * never suggested for delivery, and "keeping it cheap" never gets a platter.
 */
export function satisfiesRestrictions(
  food: Food,
  answers: Answers,
  hungerSlack: HungerSlack = 0,
): boolean {
  if (answers.method !== 'any' && !food.methods.includes(answers.method)) return false
  if (food.budget > BUDGET_TIER[answers.budget]) return false
  return hungerFits(food, answers.hunger, hungerSlack)
}

/** Foods that pass the hard filters, loosening only hunger if the pool would be too thin. */
export function filterFoods(
  foods: readonly Food[],
  answers: Answers,
  exclude: ReadonlySet<string> = new Set(),
): { foods: Food[]; relaxed: boolean } {
  const slacks: HungerSlack[] = [0, 1, 'any']
  let best: Food[] = []
  let bestSlack: HungerSlack = 0
  for (const slack of slacks) {
    const found = foods.filter(
      (food) => !exclude.has(food.id) && satisfiesRestrictions(food, answers, slack),
    )
    best = found
    bestSlack = slack
    if (found.length >= MIN_POOL) break
  }
  return { foods: best, relaxed: bestSlack !== 0 }
}

/** Bonus for being a favourite or a past "yes". `answers === null` is the surprise path. */
function personalBonus(food: Food, profile: Profile, answers: Answers | null): number {
  const favorite = profile.favorites.includes(food.id) ? WEIGHTS.favorite : 0
  const accepted = Math.min(profile.accepted[food.id] ?? 0, WEIGHTS.acceptedCap) * WEIGHTS.accepted
  const multiplier = answers?.style === 'favorites' ? WEIGHTS.favoritesStyleMultiplier : 1
  return (favorite + accepted) * multiplier
}

function styleBonus(food: Food, style: Answers['style'], profile: Profile): number {
  switch (style) {
    case 'favorites':
      return food.adventure === 'classic' ? WEIGHTS.classicForFavorites : 0
    case 'familiar':
      return food.adventure === 'twist'
        ? WEIGHTS.twistForFamiliar
        : food.adventure === 'classic'
          ? WEIGHTS.classicForFamiliar
          : 0
    case 'surprise': {
      const unseen = !profile.favorites.includes(food.id) && !(profile.accepted[food.id] ?? 0)
      return (
        (food.adventure === 'twist' ? WEIGHTS.twistForSurprise : 0) +
        (food.adventure === 'wild' ? WEIGHTS.wildForSurprise : 0) +
        (unseen ? WEIGHTS.unseenForSurprise : 0)
      )
    }
  }
}

function recentPenalty(food: Food, profile: Profile): number {
  const index = profile.recent.indexOf(food.id)
  if (index < 0) return 0
  return Math.max(0, WEIGHTS.recentBase - index * WEIGHTS.recentDecay)
}

/** Scores one food. Pure and deterministic: randomness is added later, at selection time. */
export function scoreFood(
  food: Food,
  answers: Answers | null,
  profile: Profile,
  kebabBoost = true,
): ScoreResult {
  const matches: MatchKey[] = []
  let score = 0
  let expressedPreference = false

  if (answers) {
    if (answers.mood !== 'surprise') {
      expressedPreference = true
      if (food.moods.includes(answers.mood)) {
        score += WEIGHTS.mood
        matches.push('mood')
      }
    }

    if (answers.craving !== 'any') {
      expressedPreference = true
      if (food.traits.includes(answers.craving)) {
        score += WEIGHTS.craving
        matches.push('craving')
      } else {
        score += WEIGHTS.cravingMiss
      }
    }

    if (answers.method !== 'any') matches.push('method')

    const target = BUDGET_TIER[answers.budget]
    score -= Math.abs(target - food.budget) * WEIGHTS.budgetDistance
    if (food.budget === target || (target >= 3 && food.budget >= 3)) matches.push('budget')

    score += styleBonus(food, answers.style, profile)
  }

  score += personalBonus(food, profile, answers)

  // The kebab family gets a modest bonus when it matched something she asked for,
  // or when she hasn't asked for anything in particular.
  const matchedPreference = matches.includes('mood') || matches.includes('craving')
  const affinityApplied =
    kebabBoost && !!food.affinity && (matchedPreference || !expressedPreference)
  if (affinityApplied) score += answers ? WEIGHTS.affinity : WEIGHTS.surpriseAffinity

  score -= recentPenalty(food, profile)

  return { score, matches, affinityApplied }
}

interface Scored {
  food: Food
  result: ScoreResult
}

/** Weighted lucky draw among the best-scoring candidates. */
function drawFrom(sorted: readonly Scored[], rng: Rng, wide: boolean): Scored {
  const top = sorted[0]
  if (!top) throw new Error('No candidates to draw from')
  const margin = wide ? WEIGHTS.surprisePoolMargin : WEIGHTS.poolMargin
  const size = wide ? WEIGHTS.surprisePoolSize : WEIGHTS.poolSize
  const temperature = wide ? WEIGHTS.surpriseTemperature : WEIGHTS.temperature
  const pool = sorted.filter((s) => s.result.score >= top.result.score - margin).slice(0, size)
  const weights = pool.map((s) => Math.exp((s.result.score - top.result.score) / temperature))
  let roll = rng() * weights.reduce((sum, w) => sum + w, 0)
  for (let i = 0; i < pool.length; i++) {
    roll -= weights[i] ?? 0
    if (roll <= 0) return pool[i] as Scored
  }
  return pool[pool.length - 1] as Scored
}

/** Next-best options, preferring a different kind of food from the primary and from each other. */
function pickAlternatives(sorted: readonly Scored[], primary: Food, count = 2): Food[] {
  const rest = sorted.filter((s) => s.food.id !== primary.id)
  const chosen: Food[] = []
  const categories = new Set([primary.category])
  for (const { food } of rest) {
    if (chosen.length >= count) break
    if (!categories.has(food.category)) {
      chosen.push(food)
      categories.add(food.category)
    }
  }
  for (const { food } of rest) {
    if (chosen.length >= count) break
    if (!chosen.includes(food)) chosen.push(food)
  }
  return chosen
}

/**
 * The recommendation engine.
 *
 * 1. Hard filters: eating method, budget cap, and hunger (hunger alone is loosened if too few foods remain).
 * 2. Weighted scoring: mood, craving, budget fit, adventure style, favourites, past "yes" answers,
 *    the modest kebab-family bonus, and a penalty for anything recommended recently.
 * 3. A softmax lucky draw among the top scorers, so the answer is never identical twice.
 *
 * Pass `answers = null` for "Fine, you pick!": no questions, just her taste profile and a bit of luck.
 */
export function recommend(
  answers: Answers | null,
  profile: Profile = EMPTY_PROFILE,
  options: RecommendOptions = {},
): Recommendation {
  const foods = options.foods ?? FOODS
  const rng = options.rng ?? Math.random
  const kebabBoost = options.kebabBoost ?? true
  const exclude = new Set(options.exclude ?? [])

  const pickCandidates = (skip: ReadonlySet<string>) =>
    answers
      ? filterFoods(foods, answers, skip)
      : // Surprise: a proper meal, not dessert. Everything else is fair game.
        { foods: foods.filter((f) => f.category !== 'sweet' && !skip.has(f.id)), relaxed: false }

  let { foods: candidates, relaxed } = pickCandidates(exclude)
  // Everything has been shown already: allow repeats rather than returning nothing.
  if (candidates.length === 0) ({ foods: candidates, relaxed } = pickCandidates(new Set()))
  if (candidates.length === 0) throw new Error('No foods satisfy the restrictions')

  const sorted: Scored[] = candidates
    .map((food) => ({ food, result: scoreFood(food, answers, profile, kebabBoost) }))
    .sort((a, b) => b.result.score - a.result.score)

  const chosen = drawFrom(sorted, rng, answers === null)
  const reason = buildReason({
    food: chosen.food,
    answers,
    matches: chosen.result.matches,
    affinityApplied: chosen.result.affinityApplied,
    favorite: profile.favorites.includes(chosen.food.id),
    acceptedCount: profile.accepted[chosen.food.id] ?? 0,
    rng,
  })

  return {
    food: chosen.food,
    alternatives: pickAlternatives(sorted, chosen.food),
    reason,
    matches: chosen.result.matches,
    relaxed,
    surprise: answers === null,
  }
}

/**
 * Re-targets a recommendation at a specific food, e.g. when she taps one of the
 * alternatives. Keeps the other suggestions and swaps the old primary into the list.
 */
export function promote(
  current: Recommendation,
  food: Food,
  answers: Answers | null,
  profile: Profile = EMPTY_PROFILE,
  options: Pick<RecommendOptions, 'rng' | 'kebabBoost'> = {},
): Recommendation {
  const result = scoreFood(food, answers, profile, options.kebabBoost ?? true)
  return {
    ...current,
    food,
    alternatives: current.alternatives.map((alt) => (alt.id === food.id ? current.food : alt)),
    matches: result.matches,
    reason: buildReason({
      food,
      answers,
      matches: result.matches,
      affinityApplied: result.affinityApplied,
      favorite: profile.favorites.includes(food.id),
      acceptedCount: profile.accepted[food.id] ?? 0,
      rng: options.rng ?? Math.random,
    }),
  }
}
