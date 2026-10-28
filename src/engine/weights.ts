/**
 * Every tunable number of the recommendation engine lives here.
 * Scores are additive; a "typical" good match lands somewhere around 6–10.
 */
export const WEIGHTS = {
  /** Food's mood tags include the chosen mood. */
  mood: 3,
  /** Food has the craving trait. */
  craving: 3.5,
  /** Craving chosen, but the food doesn't have it: it can still win, just rarely. */
  cravingMiss: -2.5,
  /** Budget: points lost per tier of distance from the chosen tier. */
  budgetDistance: 1.1,
  /** Surprise-me mood gets a little extra random spice instead of a mood bonus. */
  surpriseSpice: 1.5,

  /** Modest bonus for the kebab / ćevapi family when something else already matched. */
  affinity: 1.4,
  /** Same bonus for "Fine, you pick!", where there are no answers to compete with it, so it stays gentle. */
  surpriseAffinity: 0.6,
  /** Favourite foods. */
  favorite: 1.2,
  /** Per previous acceptance, up to `acceptedCap` times. */
  accepted: 0.45,
  acceptedCap: 4,
  /** "Give me my favorites" multiplies the favourite/accepted bonuses and prefers classics. */
  favoritesStyleMultiplier: 2.2,
  classicForFavorites: 1,
  /** "Something familiar but different". */
  twistForFamiliar: 2,
  classicForFamiliar: 0.4,
  /** "Surprise me, gorgeous": nudge towards things she hasn't said yes to yet. */
  twistForSurprise: 1,
  wildForSurprise: 1.6,
  unseenForSurprise: 1,

  /** Recently recommended: penalty = recentBase - index * recentDecay (clamped at 0). */
  recentBase: 4.5,
  recentDecay: 0.4,

  /** Candidates whose score is within this distance of the best are in the "lucky draw". */
  poolMargin: 3,
  poolSize: 6,
  /** Softmax temperature: higher = flatter, more random. */
  temperature: 1.1,
  /** "Fine, you pick!" has no answers to narrow things down, so the lucky draw is wider. */
  surprisePoolMargin: 4,
  surprisePoolSize: 60,
  surpriseTemperature: 1.8,
} as const

/** Keep this many recent recommendations. */
export const RECENT_LIMIT = 12

/** If fewer candidates than this survive the strict filters, hunger is relaxed. */
export const MIN_POOL = 3
