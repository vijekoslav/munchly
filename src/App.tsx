import { AnimatePresence } from 'motion/react'
import { useCallback, useState } from 'react'
import { Background } from './components/ui/Background'
import { QUIPS } from './data/copy'
import { promote, recommend, type Recommendation } from './engine/recommend'
import { pick } from './lib/random'
import { Favorites } from './screens/Favorites'
import { Loading } from './screens/Loading'
import { Questionnaire } from './screens/Questionnaire'
import { Result } from './screens/Result'
import { Welcome } from './screens/Welcome'
import { useMunchlyState } from './state/useMunchlyState'
import type { Answers, Food } from './types'

type View =
  | { name: 'welcome' }
  | { name: 'quiz' }
  | { name: 'favorites' }
  | { name: 'loading'; rec: Recommendation; answers: Answers | null }
  | {
      name: 'result'
      rec: Recommendation
      answers: Answers | null
      /** Everything already shown in this round, so "something else" never repeats. */
      seen: string[]
      accepted: { quip: string } | null
    }

export function App() {
  const { state, profile, dispatch } = useMunchlyState()
  const [view, setView] = useState<View>({ name: 'welcome' })

  const engineOptions = (exclude: string[] = []) => ({ kebabBoost: state.prefs.kebabBoost, exclude })

  /** answers === null is the "Fine, you pick!" path. */
  const startRound = (answers: Answers | null) => {
    if (answers) dispatch({ type: 'answered', answers })
    const rec = recommend(answers, profile, engineOptions())
    dispatch({ type: 'shown', id: rec.food.id })
    setView({ name: 'loading', rec, answers })
  }

  // Stable identity so the loading timer is never restarted by a re-render.
  const finishLoading = useCallback(() => {
    setView((current) =>
      current.name === 'loading'
        ? {
            name: 'result',
            rec: current.rec,
            answers: current.answers,
            seen: [current.rec.food.id],
            accepted: null,
          }
        : current,
    )
  }, [])

  const goHome = () => setView({ name: 'welcome' })

  const renderScreen = () => {
    switch (view.name) {
      case 'welcome':
        return (
          <Welcome
            key="welcome"
            favoriteCount={state.favorites.length}
            hasLastAnswers={state.lastAnswers !== null}
            onStart={() => setView({ name: 'quiz' })}
            onSurprise={() => startRound(null)}
            onRepeatLast={() => state.lastAnswers && startRound(state.lastAnswers)}
            onOpenFavorites={() => setView({ name: 'favorites' })}
          />
        )

      case 'quiz':
        return <Questionnaire key="quiz" onComplete={startRound} onExit={goHome} />

      case 'favorites':
        return (
          <Favorites
            key="favorites"
            state={state}
            onBack={goHome}
            onToggleFavorite={(food) => dispatch({ type: 'toggleFavorite', id: food.id })}
            onSetKebabBoost={(value) => dispatch({ type: 'setKebabBoost', value })}
            onClear={() => dispatch({ type: 'clear' })}
          />
        )

      case 'loading':
        return <Loading key="loading" onDone={finishLoading} />

      case 'result': {
        const { rec, answers, seen, accepted } = view
        const update = (patch: Partial<typeof view>) => setView({ ...view, ...patch })

        const retry = () => {
          const next = recommend(answers, profile, engineOptions(seen))
          dispatch({ type: 'shown', id: next.food.id })
          update({ rec: next, seen: [...seen, next.food.id], accepted: null })
        }

        const pickAlternative = (food: Food) => {
          dispatch({ type: 'shown', id: food.id })
          update({
            rec: promote(rec, food, answers, profile, { kebabBoost: state.prefs.kebabBoost }),
            seen: seen.includes(food.id) ? seen : [...seen, food.id],
          })
        }

        return (
          <Result
            key="result"
            rec={rec}
            accepted={accepted !== null}
            acceptedQuip={accepted?.quip ?? ''}
            acceptedSubline={QUIPS.acceptedSub}
            isFavorite={state.favorites.includes(rec.food.id)}
            onAccept={() => {
              dispatch({ type: 'accepted', id: rec.food.id })
              update({ accepted: { quip: pick(QUIPS.accepted) } })
            }}
            onUndoAccept={() => update({ accepted: null })}
            onRetry={retry}
            onRestart={goHome}
            onToggleFavorite={(food) => dispatch({ type: 'toggleFavorite', id: food.id })}
            onPickAlternative={pickAlternative}
          />
        )
      }
    }
  }

  return (
    <div className="relative isolate min-h-dvh">
      <Background />
      <AnimatePresence mode="wait" initial>
        {renderScreen()}
      </AnimatePresence>
    </div>
  )
}
