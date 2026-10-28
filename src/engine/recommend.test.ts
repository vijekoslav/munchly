import { describe, expect, it } from 'vitest'
import { FOODS } from '../data/foods'
import { createRng } from '../lib/random'
import type { Answers, BudgetChoice, EatMethod, Food, Hunger } from '../types'
import {
  BUDGET_TIER,
  EMPTY_PROFILE,
  filterFoods,
  recommend,
  satisfiesRestrictions,
  scoreFood,
  type Profile,
} from './recommend'

const food = (id: string): Food => {
  const found = FOODS.find((f) => f.id === id)
  if (!found) throw new Error(`Unknown food ${id}`)
  return found
}

const base: Answers = {
  hunger: 'normal',
  mood: 'surprise',
  craving: 'any',
  method: 'any',
  budget: 'normal',
  style: 'familiar',
}
const ask = (overrides: Partial<Answers> = {}): Answers => ({ ...base, ...overrides })

const HUNGERS: Hunger[] = ['snack', 'normal', 'big', 'starving']
const METHODS: Answers['method'][] = ['delivery', 'pickup', 'dine-in', 'any']
const BUDGETS: BudgetChoice[] = ['cheap', 'normal', 'treat', 'splurge']

/** Runs the engine many times and tallies what comes out. */
const tally = (answers: Answers | null, runs: number, profile: Profile = EMPTY_PROFILE) => {
  const counts = new Map<string, number>()
  for (let seed = 1; seed <= runs; seed++) {
    const { food: f } = recommend(answers, profile, { rng: createRng(seed) })
    counts.set(f.id, (counts.get(f.id) ?? 0) + 1)
  }
  return counts
}

describe('data', () => {
  it('has unique ids and complete tags', () => {
    expect(new Set(FOODS.map((f) => f.id)).size).toBe(FOODS.length)
    for (const f of FOODS) {
      expect(f.hunger.length, f.id).toBeGreaterThan(0)
      expect(f.methods.length, f.id).toBeGreaterThan(0)
      expect(f.moods.length, f.id).toBeGreaterThan(0)
      expect(f.name.trim(), f.id).not.toBe('')
      expect(f.description.trim(), f.id).not.toBe('')
    }
  })

  it('never contains sushi', () => {
    const text = FOODS.map((f) => `${f.id} ${f.name} ${f.description}`).join(' ')
    expect(text).not.toMatch(/sushi|maki|nigiri|sashimi/i)
  })

  it('keeps Croatian names and diacritics intact', () => {
    const names = FOODS.map((f) => f.name)
    for (const name of [
      'Ćevapi u lepinji',
      'Gurmanska pljeskavica',
      'Miješano meso',
      'Pohani sir',
      'Palačinke s Nutellom',
      'Ražnjići',
      'Zagrebački odrezak',
    ]) {
      expect(names).toContain(name)
    }
  })
})

describe('hard filters', () => {
  it('respects the eating method', () => {
    for (const method of ['delivery', 'pickup', 'dine-in'] as EatMethod[]) {
      const { foods } = filterFoods(FOODS, ask({ method }))
      expect(foods.length).toBeGreaterThan(0)
      expect(foods.every((f) => f.methods.includes(method))).toBe(true)
    }
  })

  it('never offers a snack-only food to a starving person (unless nothing else exists)', () => {
    const { foods, relaxed } = filterFoods(FOODS, ask({ hunger: 'starving', budget: 'splurge' }))
    expect(relaxed).toBe(false)
    expect(foods.every((f) => f.hunger.includes('starving'))).toBe(true)
  })

  it('caps the budget', () => {
    const { foods } = filterFoods(FOODS, ask({ budget: 'cheap' }))
    expect(foods.every((f) => f.budget === 1)).toBe(true)
    expect(satisfiesRestrictions(food('grill-plata'), ask({ budget: 'treat' }))).toBe(false)
    expect(satisfiesRestrictions(food('grill-plata'), ask({ budget: 'splurge', hunger: 'big' }))).toBe(true)
  })

  it('does not deliver ice cream', () => {
    const { foods } = filterFoods(FOODS, ask({ hunger: 'snack', method: 'delivery' }))
    expect(foods.map((f) => f.id)).not.toContain('sladoled')
  })

  it('honours the exclusion list', () => {
    const { foods } = filterFoods(FOODS, ask(), new Set(['pizza-margherita']))
    expect(foods.map((f) => f.id)).not.toContain('pizza-margherita')
  })

  it('loosens hunger only when the pool is thin', () => {
    // Only two foods at all for this made-up catalogue → hunger gets relaxed, method never.
    const tiny = [food('pomfrit'), food('hot-dog'), food('kebab-u-lepinji')]
    const result = filterFoods(tiny, ask({ hunger: 'starving', method: 'delivery' }))
    expect(result.relaxed).toBe(true)
    expect(result.foods.every((f) => f.methods.includes('delivery'))).toBe(true)
  })
})

describe('every possible restriction combination', () => {
  it('always yields a recommendation that honours method and budget', () => {
    for (const hunger of HUNGERS) {
      for (const method of METHODS) {
        for (const budget of BUDGETS) {
          for (const craving of ['meat', 'cheesy', 'crispy', 'bread', 'any'] as const) {
            const answers = ask({ hunger, method, budget, craving, mood: 'fresh' })
            for (let seed = 1; seed <= 3; seed++) {
              const result = recommend(answers, EMPTY_PROFILE, { rng: createRng(seed) })
              const label = JSON.stringify(answers)
              if (method !== 'any') expect(result.food.methods, label).toContain(method)
              expect(result.food.budget, label).toBeLessThanOrEqual(BUDGET_TIER[budget])
              for (const alt of result.alternatives) {
                expect(alt.id).not.toBe(result.food.id)
                if (method !== 'any') expect(alt.methods, label).toContain(method)
                expect(alt.budget, label).toBeLessThanOrEqual(BUDGET_TIER[budget])
              }
            }
          }
        }
      }
    }
  })

  it('keeps the hunger match whenever any food can satisfy it', () => {
    for (const hunger of HUNGERS) {
      for (const method of METHODS) {
        for (const budget of BUDGETS) {
          const answers = ask({ hunger, method, budget })
          const strict = filterFoods(FOODS, answers)
          if (!strict.relaxed) {
            const { food: f } = recommend(answers, EMPTY_PROFILE, { rng: createRng(7) })
            expect(f.hunger).toContain(hunger)
          }
        }
      }
    }
  })
})

describe('scoring', () => {
  it('favours crispy foods when she wants crispy', () => {
    const counts = tally(ask({ craving: 'crispy', mood: 'greasy', hunger: 'normal' }), 100)
    const crispyShare =
      [...counts].filter(([id]) => food(id).traits.includes('crispy')).reduce((n, [, c]) => n + c, 0) / 100
    expect(crispyShare).toBeGreaterThan(0.85)
  })

  it('favours meat for a meat craving', () => {
    const counts = tally(ask({ craving: 'meat', hunger: 'big', budget: 'treat' }), 100)
    const meat = [...counts].filter(([id]) => food(id).traits.includes('meat')).reduce((n, [, c]) => n + c, 0)
    expect(meat).toBeGreaterThan(85)
  })

  it('gives very hungry people substantial meals', () => {
    for (let seed = 1; seed <= 40; seed++) {
      const { food: f } = recommend(ask({ hunger: 'starving', budget: 'treat' }), EMPTY_PROFILE, {
        rng: createRng(seed),
      })
      expect(f.hunger).toContain('starving')
    }
  })

  it('gives comfort-seekers comfort foods', () => {
    const counts = tally(ask({ mood: 'comfort', craving: 'any' }), 60)
    const comfort = [...counts].filter(([id]) => food(id).moods.includes('comfort')).reduce((n, [, c]) => n + c, 0)
    expect(comfort).toBeGreaterThan(55)
  })

  it('moves toward the chosen budget tier', () => {
    const cheap = scoreFood(food('kebab-u-lepinji'), ask({ budget: 'treat' }), EMPTY_PROFILE, false).score
    const treat = scoreFood(food('gurmanska-pljeskavica'), ask({ budget: 'treat' }), EMPTY_PROFILE, false).score
    expect(treat).toBeGreaterThan(cheap)
  })

  it('has a sensible fallback for conflicting answers', () => {
    // Fresh and light + meat + cheap + delivery has very few perfect matches, but still answers.
    const answers = ask({ mood: 'fresh', craving: 'meat', budget: 'cheap', method: 'delivery', hunger: 'starving' })
    const result = recommend(answers, EMPTY_PROFILE, { rng: createRng(3) })
    expect(result.food.methods).toContain('delivery')
    expect(result.food.budget).toBe(1)
  })

  it('shows more than one result for identical answers', () => {
    const counts = tally(ask({ hunger: 'big', mood: 'comfort', craving: 'any' }), 100)
    expect(counts.size).toBeGreaterThanOrEqual(4)
  })
})

describe('kebab bias', () => {
  const answers = ask({ hunger: 'big', mood: 'comfort', craving: 'any', budget: 'normal' })

  it('adds a bonus to the kebab family when something matched', () => {
    const withBoost = scoreFood(food('kebab-u-lepinji'), answers, EMPTY_PROFILE, true)
    const without = scoreFood(food('kebab-u-lepinji'), answers, EMPTY_PROFILE, false)
    expect(withBoost.score).toBeGreaterThan(without.score)
    expect(withBoost.affinityApplied).toBe(true)
  })

  it('does not apply when the kebab matches nothing she asked for', () => {
    // She wants cheesy, and falafel-style kebab doesn't qualify.
    const result = scoreFood(food('kebab-u-tortilji'), ask({ craving: 'cheesy', mood: 'fresh' }), EMPTY_PROFILE, true)
    expect(result.affinityApplied).toBe(false)
  })

  it('can be switched off', () => {
    expect(scoreFood(food('kebab-u-lepinji'), answers, EMPTY_PROFILE, false).affinityApplied).toBe(false)
  })

  it('leans kebab-ish without winning every time', () => {
    const counts = tally(answers, 300)
    const family = [...counts].filter(([id]) => food(id).affinity).reduce((n, [, c]) => n + c, 0) / 300
    expect(family).toBeGreaterThan(0.3)
    expect(family).toBeLessThan(0.8)
    expect(counts.size).toBeGreaterThanOrEqual(5)
  })
})

describe('repeat avoidance', () => {
  const answers = ask({ hunger: 'big', mood: 'greasy', craving: 'meat' })

  it('penalises recent recommendations, most recent most', () => {
    const subject = food('cheeseburger')
    const fresh = scoreFood(subject, answers, EMPTY_PROFILE).score
    const last = scoreFood(subject, answers, { ...EMPTY_PROFILE, recent: [subject.id] }).score
    const older = scoreFood(subject, answers, { ...EMPTY_PROFILE, recent: ['a', 'b', 'c', subject.id] }).score
    expect(last).toBeLessThan(older)
    expect(older).toBeLessThan(fresh)
  })

  it('recommends the just-shown food much less often', () => {
    const top = [...tally(answers, 200)].sort((a, b) => b[1] - a[1])[0]
    if (!top) throw new Error('no results')
    const [topId, before] = top
    const after = tally(answers, 200, { ...EMPTY_PROFILE, recent: [topId] }).get(topId) ?? 0
    expect(after).toBeLessThan(before / 2)
  })

  it('never repeats excluded foods while alternatives exist', () => {
    const shown: string[] = []
    for (let i = 0; i < 8; i++) {
      const { food: f } = recommend(answers, EMPTY_PROFILE, { rng: createRng(i + 1), exclude: shown })
      expect(shown).not.toContain(f.id)
      shown.push(f.id)
    }
  })

  it('still answers when everything has been excluded', () => {
    const all = FOODS.map((f) => f.id)
    expect(() => recommend(answers, EMPTY_PROFILE, { exclude: all })).not.toThrow()
  })
})

describe('personalization', () => {
  const answers = ask({ hunger: 'normal', mood: 'comfort', craving: 'any' })

  it('favours favourites and accepted foods slightly', () => {
    const subject = food('carbonara')
    const plain = scoreFood(subject, answers, EMPTY_PROFILE).score
    const fav = scoreFood(subject, answers, { ...EMPTY_PROFILE, favorites: [subject.id] }).score
    const accepted = scoreFood(subject, answers, { ...EMPTY_PROFILE, accepted: { [subject.id]: 3 } }).score
    expect(fav).toBeGreaterThan(plain)
    expect(accepted).toBeGreaterThan(plain)
  })

  it('caps the accepted bonus so it never becomes repetitive', () => {
    const subject = food('carbonara')
    const four = scoreFood(subject, answers, { ...EMPTY_PROFILE, accepted: { [subject.id]: 4 } }).score
    const forty = scoreFood(subject, answers, { ...EMPTY_PROFILE, accepted: { [subject.id]: 40 } }).score
    expect(forty).toBe(four)
  })

  it('weights favourites more when she asks for her favourites', () => {
    const subject = food('carbonara')
    const profile = { ...EMPTY_PROFILE, favorites: [subject.id] }
    const gain = (style: Answers['style']) =>
      scoreFood(subject, ask({ style }), profile).score - scoreFood(subject, ask({ style }), EMPTY_PROFILE).score
    expect(gain('favorites')).toBeGreaterThan(gain('familiar'))
  })
})

describe('surprise (“Fine, you pick!”)', () => {
  it('returns a proper meal with a reason, never dessert', () => {
    for (let seed = 1; seed <= 60; seed++) {
      const result = recommend(null, EMPTY_PROFILE, { rng: createRng(seed) })
      expect(result.surprise).toBe(true)
      expect(result.food.category).not.toBe('sweet')
      expect(result.reason).toContain('Fine, you pick!')
    }
  })

  it('has variety and still leans towards her taste', () => {
    const counts = tally(null, 200)
    expect(counts.size).toBeGreaterThanOrEqual(8)
    const family = [...counts].filter(([id]) => food(id).affinity).reduce((n, [, c]) => n + c, 0) / 200
    expect(family).toBeGreaterThan(0.3)
    expect(family).toBeLessThan(0.75)
  })
})

describe('alternatives and explanations', () => {
  it('offers two distinct alternatives, never the primary', () => {
    const result = recommend(ask({ hunger: 'big' }), EMPTY_PROFILE, { rng: createRng(5) })
    expect(result.alternatives).toHaveLength(2)
    expect(new Set([result.food.id, ...result.alternatives.map((a) => a.id)]).size).toBe(3)
  })

  it('writes an English explanation that mentions what she answered', () => {
    const result = recommend(
      ask({ hunger: 'starving', craving: 'crispy', mood: 'greasy', method: 'delivery' }),
      EMPTY_PROFILE,
      { rng: createRng(2) },
    )
    expect(result.reason).toMatch(/^You need feeding immediately/)
    expect(result.reason).toMatch(/crispy/)
  })
})
