import { describe, expect, it } from 'vitest'
import { RECENT_LIMIT } from '../engine/weights'
import {
  DEFAULT_STATE,
  STORAGE_KEY,
  loadState,
  reducer,
  sanitizeState,
  saveState,
  type StorageLike,
} from './store'

const memoryStorage = (initial?: string): StorageLike & { data: Map<string, string> } => {
  const data = new Map<string, string>(initial ? [[STORAGE_KEY, initial]] : [])
  return {
    data,
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => void data.set(key, value),
    removeItem: (key) => void data.delete(key),
  }
}

describe('reducer', () => {
  it('records shown foods newest-first without duplicates, capped', () => {
    let state = DEFAULT_STATE
    state = reducer(state, { type: 'shown', id: 'pomfrit' })
    state = reducer(state, { type: 'shown', id: 'hamburger' })
    state = reducer(state, { type: 'shown', id: 'pomfrit' })
    expect(state.recent).toEqual(['pomfrit', 'hamburger'])

    const ids = ['kebab-u-lepinji', 'kebab-box', 'pljeskavica', 'burrito', 'tacos', 'carbonara', 'lasagne',
      'bolognese', 'hot-dog', 'hamburger', 'cheeseburger', 'smash-burger', 'pomfrit', 'krafne']
    for (const id of ids) state = reducer(state, { type: 'shown', id })
    expect(state.recent).toHaveLength(RECENT_LIMIT)
    expect(state.recent[0]).toBe('krafne')
  })

  it('counts acceptances and toggles favourites', () => {
    let state = reducer(DEFAULT_STATE, { type: 'accepted', id: 'burrito' })
    state = reducer(state, { type: 'accepted', id: 'burrito' })
    expect(state.accepted.burrito).toBe(2)
    state = reducer(state, { type: 'toggleFavorite', id: 'burrito' })
    expect(state.favorites).toEqual(['burrito'])
    state = reducer(state, { type: 'toggleFavorite', id: 'burrito' })
    expect(state.favorites).toEqual([])
  })

  it('clears everything', () => {
    const state = reducer(reducer(DEFAULT_STATE, { type: 'toggleFavorite', id: 'tacos' }), { type: 'clear' })
    expect(state).toEqual(DEFAULT_STATE)
  })
})

describe('storage', () => {
  it('round-trips state', () => {
    const storage = memoryStorage()
    const state = reducer(
      reducer(DEFAULT_STATE, { type: 'toggleFavorite', id: 'cevapi-u-lepinji' }),
      { type: 'answered', answers: { hunger: 'big', mood: 'comfort', craving: 'meat', method: 'any', budget: 'normal', style: 'favorites' } },
    )
    saveState(state, storage)
    expect(loadState(storage)).toEqual(state)
  })

  it('survives corrupted or hostile data', () => {
    expect(loadState(memoryStorage('{not json'))).toEqual(DEFAULT_STATE)
    expect(loadState(memoryStorage('42'))).toEqual(DEFAULT_STATE)
    expect(loadState(null)).toEqual(DEFAULT_STATE)
  })

  it('drops unknown foods and invalid fields', () => {
    const state = sanitizeState({
      recent: ['pomfrit', 'sushi', 7],
      accepted: { burrito: 2, nope: 5, tacos: -1, hamburger: 'x' },
      favorites: ['tacos', 'tacos', 'ghost'],
      lastAnswers: { hunger: 'big' },
      prefs: { kebabBoost: 'yes' },
    })
    expect(state.recent).toEqual(['pomfrit'])
    expect(state.accepted).toEqual({ burrito: 2 })
    expect(state.favorites).toEqual(['tacos'])
    expect(state.lastAnswers).toBeNull()
    expect(state.prefs.kebabBoost).toBe(true)
  })

  it('does not throw when storage refuses writes', () => {
    const broken: StorageLike = {
      getItem: () => { throw new Error('denied') },
      setItem: () => { throw new Error('quota') },
      removeItem: () => {},
    }
    expect(() => saveState(DEFAULT_STATE, broken)).not.toThrow()
    expect(loadState(broken)).toEqual(DEFAULT_STATE)
  })
})
