import type { Question, QuestionId } from '../types'

type AnyQuestion = { [K in QuestionId]: Question<K> }[QuestionId]

/** The questionnaire, in order. Pure data: edit the wording here, not in components. */
export const QUESTIONS: readonly AnyQuestion[] = [
  {
    id: 'hunger',
    title: 'How hungry is my gorgeous girl?',
    options: [
      { value: 'snack', label: 'Just a little snacky', emoji: '🍪', reply: "A snack, noted. Delicate." },
      { value: 'normal', label: 'Normal human hungry', emoji: '🍽️', reply: "Perfectly normal hungry. Respect." },
      { value: 'big', label: 'I could eat a horse', emoji: '🐴', reply: "Ooh, a horse. Understood." },
      { value: 'starving', label: 'Feed me immediately', emoji: '🚨', reply: "Emergency mode. On it." },
    ],
  },
  {
    id: 'mood',
    title: "What's the vibe today?",
    options: [
      { value: 'comfort', label: 'Comfort food, please', emoji: '🧸', reply: "Cozy mode: activated." },
      { value: 'fresh', label: 'Something fresh and light', emoji: '🥗', reply: "Fresh and light. How elegant." },
      { value: 'greasy', label: 'Something greasy and delicious', emoji: '🍟', reply: "Greasy and delicious. A woman of taste." },
      { value: 'surprise', label: 'Surprise me!', emoji: '✨', reply: "Ooh, I like a challenge." },
    ],
  },
  {
    id: 'craving',
    title: 'What sounds good?',
    options: [
      { value: 'meat', label: 'Meat, meat, meat', emoji: '🥩', reply: "Meat, meat, meat. Loud and clear." },
      { value: 'cheesy', label: 'Something cheesy', emoji: '🧀', reply: "Cheese. Always a good answer." },
      { value: 'crispy', label: 'Something crispy', emoji: '🍗', reply: "Crunch, noted." },
      { value: 'bread', label: 'Something with bread', emoji: '🥖', reply: "Bread is basically a love language." },
      { value: 'any', label: 'Honestly, I have no idea', emoji: '🤷‍♀️', reply: "Totally fair. That's what I'm here for." },
    ],
  },
  {
    id: 'method',
    title: "What's the plan, princess?",
    options: [
      { value: 'delivery', label: 'Delivery to my door', emoji: '🛵', reply: "The couch stays occupied. Smart." },
      { value: 'pickup', label: 'Pick it up', emoji: '🛍️', reply: "A little stroll for a reward. Love it." },
      { value: 'dine-in', label: "Let's go eat somewhere", emoji: '🍷', reply: "A proper outing, then. I like it." },
      { value: 'any', label: 'Anything works', emoji: '💞', reply: "So easy-going. I love that." },
    ],
  },
  {
    id: 'budget',
    title: 'How fancy are we feeling?',
    options: [
      { value: 'cheap', label: 'Keeping it cheap', emoji: '🪙', reply: "Smart and thrifty." },
      { value: 'normal', label: 'A normal meal', emoji: '💳', reply: "Sensible and charming." },
      { value: 'treat', label: 'Treat me!', emoji: '🎀', reply: "You deserve it, obviously." },
      { value: 'splurge', label: 'Money is imaginary', emoji: '💸', reply: "Love the energy." },
    ],
  },
  {
    id: 'style',
    title: 'How adventurous are we today?',
    options: [
      { value: 'favorites', label: 'Give me my favorites', emoji: '💗' },
      { value: 'familiar', label: 'Something familiar but different', emoji: '🔀' },
      { value: 'surprise', label: 'Surprise me, gorgeous', emoji: '🎲' },
    ],
  },
]
