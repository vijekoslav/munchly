import type { Food, FoodCategory } from '../types'
import type { Rng } from '../lib/random'
import { pick } from '../lib/random'

export const LOADING_TITLE = 'One sec, gorgeous...'

export const LOADING_MESSAGES = [
  'Consulting my very hungry brain...',
  'Analyzing your very serious cravings...',
  'Making an executive snack decision...',
  'This is extremely scientific, obviously.',
  'Almost done being a genius...',
] as const

/** Result-screen headline, by kind of food. */
const HEADLINES: Record<FoodCategory, readonly string[]> = {
  kebab: ["It's a kebab kind of night.", "Kebab o'clock, gorgeous."],
  grill: ['The grill has spoken.', "It's a ćevapi kind of day."],
  fastfood: ['Your stomach has spoken.', 'Fast, golden and delicious.'],
  pizza: ["It's a pizza kind of night.", 'Pizza. The council has decided.'],
  pasta: ['Carbs are a love language.', 'Pasta la vista, hunger.'],
  restaurant: ['A classic, done right.', 'Simple, golden, perfect.'],
  bakery: ['Fresh from the oven.', 'Flaky decisions only.'],
  sweet: ['Dessert, because we can.', 'Something sweet for someone sweet.'],
}

export const headlineFor = (food: Food, rng: Rng = Math.random): string =>
  food.id.startsWith('cevapi') || food.id.includes('cevapa')
    ? (HEADLINES.grill[1] as string)
    : pick(HEADLINES[food.category], rng)

/** Small affectionate lines, used sparingly (one per screen at most). */
export const QUIPS = {
  welcomeFooter: 'A very important decision.',
  quizTrust: 'Trust the process, princess.',
  retry: ['Fine, fine, round two.', 'The council reconvenes.', 'Plot twist incoming.'],
  accepted: ['The council has decided.', 'Certified delicious. By me.', 'Another crisis successfully avoided.'],
  acceptedSub: 'Enjoy every bite, gorgeous.',
  emptyFavorites: 'No favorites yet. Tap the heart on a result to save one for later.',
} as const
