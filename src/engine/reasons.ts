import { pick, type Rng } from '../lib/random'
import type { Answers, Craving, Food, Hunger, Mood } from '../types'
import type { MatchKey } from './recommend'

const HUNGER: Record<Hunger, string> = {
  snack: "you're feeling a little snacky",
  normal: "you're hungry in a perfectly normal way",
  big: 'you could eat a horse',
  starving: 'you need feeding immediately',
}

const MOOD: Record<Exclude<Mood, 'surprise'>, string> = {
  comfort: 'you want comfort food',
  fresh: 'you want something fresh and light',
  greasy: 'you want something greasy and delicious',
}

const CRAVING: Record<Exclude<Craving, 'any'>, string> = {
  meat: "you're in a meat, meat, meat mood",
  cheesy: 'you want something cheesy',
  crispy: 'you want something crispy',
  bread: 'you want something with bread',
}

const METHOD = {
  delivery: 'it travels beautifully to your door',
  pickup: "it's an easy grab-and-go",
  'dine-in': "it's made for a proper sit-down",
} as const

const FLOURISH = [
  'The math checks out.',
  'Trust the process, princess.',
  'Very scientific, obviously.',
  'The council has decided.',
]

export interface ReasonContext {
  food: Food
  answers: Answers | null
  matches: readonly MatchKey[]
  affinityApplied: boolean
  favorite: boolean
  acceptedCount: number
  rng: Rng
}

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1)

const joinClauses = (clauses: readonly string[]): string => {
  if (clauses.length <= 1) return clauses.join('')
  if (clauses.length === 2) return `${clauses[0]} and ${clauses[1]}`
  return `${clauses.slice(0, -1).join(', ')}, and ${clauses[clauses.length - 1]}`
}

function closing(ctx: ReasonContext, surprise: boolean): string {
  if (ctx.affinityApplied && ctx.food.affinity) {
    return surprise
      ? "And let's be real: it was always going to be something this delicious."
      : "And let's be real: it was always going to win."
  }
  if (ctx.favorite) return "Also, it's on your favorites list, so I know you'll love it."
  if (ctx.acceptedCount >= 2) return "You've said yes to this one before, so it's basically a tradition."
  return surprise ? 'Zero thinking required. You are welcome.' : pick(FLOURISH, ctx.rng)
}

/** A personalised, English explanation of why this food fits the answers. */
export function buildReason(ctx: ReasonContext): string {
  const { answers } = ctx
  if (!answers) {
    return `You said “Fine, you pick!”, so I picked. ${closing(ctx, true)}`
  }

  const clauses: string[] = [HUNGER[answers.hunger]]
  if (answers.mood !== 'surprise' && ctx.matches.includes('mood')) {
    clauses.push(MOOD[answers.mood])
  }
  if (answers.craving !== 'any' && ctx.matches.includes('craving')) {
    clauses.push(CRAVING[answers.craving])
  }
  if (clauses.length < 3 && answers.method !== 'any') {
    clauses.push(METHOD[answers.method])
  }
  if (clauses.length < 3 && ctx.food.budget >= 3 && ctx.matches.includes('budget')) {
    clauses.push(answers.budget === 'splurge' ? 'money is imaginary today' : "it's a proper treat")
  } else if (clauses.length < 3 && answers.budget === 'cheap') {
    clauses.push("it's kind to your wallet")
  }

  return `${capitalize(joinClauses(clauses))}. ${closing(ctx, false)}`
}
