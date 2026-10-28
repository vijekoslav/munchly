export type Hunger = 'snack' | 'normal' | 'big' | 'starving'
export type Mood = 'comfort' | 'fresh' | 'greasy' | 'surprise'
export type Craving = 'meat' | 'cheesy' | 'crispy' | 'bread' | 'any'
export type EatMethod = 'delivery' | 'pickup' | 'dine-in'
export type MethodChoice = EatMethod | 'any'
/** 1 = cheap, 2 = normal meal, 3 = a treat, 4 = money is imaginary. */
export type BudgetTier = 1 | 2 | 3 | 4
export type BudgetChoice = 'cheap' | 'normal' | 'treat' | 'splurge'
export type Style = 'favorites' | 'familiar' | 'surprise'
/** How far from the everyday classics a dish sits. */
export type Adventure = 'classic' | 'twist' | 'wild'

export type FoodCategory =
  | 'kebab'
  | 'grill'
  | 'fastfood'
  | 'pizza'
  | 'pasta'
  | 'restaurant'
  | 'bakery'
  | 'sweet'

export type Flavor =
  | 'juicy'
  | 'smoky'
  | 'spicy'
  | 'creamy'
  | 'sweet'
  | 'salty'
  | 'fresh'
  | 'crunchy'
  | 'melty'
  | 'saucy'
  | 'hearty'

export interface Food {
  id: string
  /** Name as people actually say it in Croatia (diacritics preserved). */
  name: string
  /** One playful line, in English. */
  description: string
  category: FoodCategory
  /** Hunger levels this food is a sensible answer to (hard filter). */
  hunger: readonly Hunger[]
  /** Moods it satisfies; `surprise` is never listed, it matches nothing in particular. */
  moods: readonly Exclude<Mood, 'surprise'>[]
  /** Which "what sounds good?" cravings it satisfies. */
  traits: readonly Exclude<Craving, 'any'>[]
  /** Extra taste/texture tags, shown as little pills on the result. */
  flavors: readonly Flavor[]
  /** Rough price tier (not a price!). Answers cap this (hard filter). */
  budget: BudgetTier
  /** Ways this can reasonably be enjoyed (hard filter). */
  methods: readonly EatMethod[]
  adventure: Adventure
  /** Kebab / döner / ćevapi family: gets the modest personal bonus. */
  affinity?: boolean
  /** Illustration: an emoji, or a URL to an image placed in /public. */
  emoji: string
  image?: string
}

export interface Answers {
  hunger: Hunger
  mood: Mood
  craving: Craving
  method: MethodChoice
  budget: BudgetChoice
  style: Style
}

export type QuestionId = keyof Answers

export interface QuestionOption<V extends string = string> {
  value: V
  label: string
  emoji: string
  /** A tiny in-character reaction shown above the next question. */
  reply?: string
}

export interface Question<K extends QuestionId = QuestionId> {
  id: K
  title: string
  /** A tiny conversational aside under the title. */
  hint?: string
  options: readonly QuestionOption<Answers[K]>[]
}
