import { getFood } from '../data/foods'
import { QUESTIONS } from '../data/questions'
import { RECENT_LIMIT } from '../engine/weights'
import type { Profile } from '../engine/recommend'
import type { Answers } from '../types'

export const STORAGE_KEY = 'munchly:v1'

/** Everything saved on this device. Nothing ever leaves it. */
export interface StoredState {
  version: 1
  /** Recently recommended ids, newest first. */
  recent: string[]
  /** Accepted count per food id. */
  accepted: Record<string, number>
  favorites: string[]
  /** Answers of the last completed questionnaire. */
  lastAnswers: Answers | null
  prefs: {
    /** The modest extra love for kebab, ćevapi and friends. */
    kebabBoost: boolean
  }
}

export const DEFAULT_STATE: StoredState = {
  version: 1,
  recent: [],
  accepted: {},
  favorites: [],
  lastAnswers: null,
  prefs: { kebabBoost: true },
}

export type Action =
  | { type: 'shown'; id: string }
  | { type: 'accepted'; id: string }
  | { type: 'toggleFavorite'; id: string }
  | { type: 'answered'; answers: Answers }
  | { type: 'setKebabBoost'; value: boolean }
  | { type: 'clear' }

const unique = <T>(items: readonly T[]) => [...new Set(items)]

export function reducer(state: StoredState, action: Action): StoredState {
  switch (action.type) {
    case 'shown':
      return {
        ...state,
        recent: [action.id, ...state.recent.filter((id) => id !== action.id)].slice(0, RECENT_LIMIT),
      }
    case 'accepted':
      return {
        ...state,
        accepted: { ...state.accepted, [action.id]: (state.accepted[action.id] ?? 0) + 1 },
      }
    case 'toggleFavorite':
      return {
        ...state,
        favorites: state.favorites.includes(action.id)
          ? state.favorites.filter((id) => id !== action.id)
          : [action.id, ...state.favorites],
      }
    case 'answered':
      return { ...state, lastAnswers: action.answers }
    case 'setKebabBoost':
      return { ...state, prefs: { ...state.prefs, kebabBoost: action.value } }
    case 'clear':
      return DEFAULT_STATE
  }
}

export const toProfile = (state: StoredState): Profile => ({
  recent: state.recent,
  accepted: state.accepted,
  favorites: state.favorites,
})

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const knownIds = (value: unknown): string[] =>
  Array.isArray(value)
    ? unique(value.filter((id): id is string => typeof id === 'string' && !!getFood(id)))
    : []

function sanitizeAnswers(value: unknown): Answers | null {
  if (!isRecord(value)) return null
  const result: Record<string, string> = {}
  for (const question of QUESTIONS) {
    const answer = value[question.id]
    if (!question.options.some((option) => option.value === answer)) return null
    result[question.id] = answer as string
  }
  return result as unknown as Answers
}

/** Turns whatever is in storage into a valid state: unknown foods and malformed fields are dropped. */
export function sanitizeState(raw: unknown): StoredState {
  if (!isRecord(raw)) return DEFAULT_STATE
  const accepted: Record<string, number> = {}
  if (isRecord(raw.accepted)) {
    for (const [id, count] of Object.entries(raw.accepted)) {
      if (getFood(id) && typeof count === 'number' && Number.isFinite(count) && count > 0) {
        accepted[id] = Math.floor(count)
      }
    }
  }
  const prefs = isRecord(raw.prefs) ? raw.prefs : {}
  return {
    version: 1,
    recent: knownIds(raw.recent).slice(0, RECENT_LIMIT),
    accepted,
    favorites: knownIds(raw.favorites),
    lastAnswers: sanitizeAnswers(raw.lastAnswers),
    prefs: { kebabBoost: typeof prefs.kebabBoost === 'boolean' ? prefs.kebabBoost : true },
  }
}

/** The bit of `Storage` we use, so tests (and private-mode browsers) can swap it. */
export type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

const defaultStorage = (): StorageLike | null => {
  try {
    return window.localStorage
  } catch {
    return null // Safari private mode, blocked storage, SSR…
  }
}

export function loadState(storage: StorageLike | null = defaultStorage()): StoredState {
  try {
    const text = storage?.getItem(STORAGE_KEY)
    return text ? sanitizeState(JSON.parse(text)) : DEFAULT_STATE
  } catch {
    return DEFAULT_STATE
  }
}

export function saveState(state: StoredState, storage: StorageLike | null = defaultStorage()): void {
  try {
    storage?.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Quota exceeded or storage unavailable: the app still works, it just forgets.
  }
}
