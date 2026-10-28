import type { EatMethod, Hunger } from '../../types'

/**
 * Handy presets so the food files stay short and easy to edit.
 *
 * Budget tiers are rough, not prices: 1 cheap · 2 normal meal · 3 treat · 4 money is imaginary.
 */

/** Just a nibble. */
export const SNACK: readonly Hunger[] = ['snack']
/** Snack or a lightish bite. */
export const LIGHT: readonly Hunger[] = ['snack', 'normal']
/** A proper meal, not a feast. */
export const MEAL: readonly Hunger[] = ['normal', 'big']
/** Fine for anyone from normal-hungry up. */
export const HEARTY: readonly Hunger[] = ['normal', 'big', 'starving']
/** Substantial: only for big appetites. */
export const FEAST: readonly Hunger[] = ['big', 'starving']

export const ANYWHERE: readonly EatMethod[] = ['delivery', 'pickup', 'dine-in']
/** Best fresh from the counter: no delivery. */
export const COUNTER: readonly EatMethod[] = ['pickup', 'dine-in']
