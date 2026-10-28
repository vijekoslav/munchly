import { useEffect, useMemo, useReducer } from 'react'
import { loadState, reducer, saveState, toProfile } from './store'

/** Persistent app state: a reducer that mirrors itself into localStorage. */
export function useMunchlyState() {
  const [state, dispatch] = useReducer(reducer, undefined, loadState)

  useEffect(() => saveState(state), [state])

  const profile = useMemo(() => toProfile(state), [state])

  return { state, profile, dispatch }
}
