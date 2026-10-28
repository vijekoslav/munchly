import type { Food } from '../../types'
import { FASTFOOD_FOODS } from './fastfood'
import { GRILL_FOODS } from './grill'
import { ITALIAN_FOODS } from './italian'
import { KEBAB_FOODS } from './kebab'
import { OTHER_FOODS } from './other'

/** The full catalogue. Add a dish in any of the files above and it is picked up automatically. */
export const FOODS: readonly Food[] = [
  ...KEBAB_FOODS,
  ...GRILL_FOODS,
  ...FASTFOOD_FOODS,
  ...ITALIAN_FOODS,
  ...OTHER_FOODS,
]

const BY_ID = new Map(FOODS.map((food) => [food.id, food]))

export const getFood = (id: string): Food | undefined => BY_ID.get(id)
