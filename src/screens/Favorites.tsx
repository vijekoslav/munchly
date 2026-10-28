import { ArrowLeft, Heart } from 'lucide-react'
import { motion } from 'motion/react'
import { useState } from 'react'
import { Button, IconButton } from '../components/ui/Button'
import { Screen } from '../components/ui/Screen'
import { QUIPS } from '../data/copy'
import { getFood } from '../data/foods'
import type { StoredState } from '../state/store'
import type { Food } from '../types'

interface FavoritesProps {
  state: StoredState
  onBack: () => void
  onToggleFavorite: (food: Food) => void
  onSetKebabBoost: (value: boolean) => void
  onClear: () => void
}

const toFoods = (ids: readonly string[]): Food[] =>
  ids.flatMap((id) => {
    const food = getFood(id)
    return food ? [food] : []
  })

export function Favorites({ state, onBack, onToggleFavorite, onSetKebabBoost, onClear }: FavoritesProps) {
  const [confirmClear, setConfirmClear] = useState(false)
  const favorites = toFoods(state.favorites)
  const recent = toFoods(state.recent).slice(0, 6)
  const boost = state.prefs.kebabBoost

  return (
    <Screen label="Favorites" className="gap-7">
      <header className="flex items-center gap-4">
        <IconButton label="Back" onClick={onBack}>
          <ArrowLeft className="size-5" aria-hidden />
        </IconButton>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-cocoa-900">Your favorites</h1>
      </header>

      <section aria-label="Favorite foods">
        {favorites.length === 0 ? (
          <div className="rounded-3xl bg-white/80 p-6 text-center shadow-soft ring-1 ring-inset ring-blush-200">
            <Heart className="mx-auto mb-3 size-9 text-blush-300" fill="currentColor" strokeWidth={0} aria-hidden />
            <p className="text-cocoa-700">{QUIPS.emptyFavorites}</p>
          </div>
        ) : (
          <ul className="grid gap-2.5">
            {favorites.map((food, i) => (
              <motion.li
                key={food.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex min-h-[4.5rem] items-center gap-3 rounded-3xl bg-white/90 py-2 pl-3 pr-2 shadow-soft ring-1 ring-inset ring-blush-200"
              >
                <span aria-hidden className="flex size-12 items-center justify-center rounded-2xl bg-blush-50 text-2xl">
                  {food.emoji}
                </span>
                <span className="flex-1 font-bold text-cocoa-900">{food.name}</span>
                <button
                  type="button"
                  aria-label={`Remove ${food.name} from favorites`}
                  onClick={() => onToggleFavorite(food)}
                  className="flex size-12 items-center justify-center rounded-full text-berry-500"
                >
                  <Heart className="size-6" fill="currentColor" aria-hidden />
                </button>
              </motion.li>
            ))}
          </ul>
        )}
      </section>

      {recent.length > 0 && (
        <section aria-labelledby="recent-title" className="space-y-3">
          <h2 id="recent-title" className="text-sm font-extrabold uppercase tracking-wider text-cocoa-500">
            Lately on the menu
          </h2>
          <ul className="flex flex-wrap gap-2">
            {recent.map((food) => (
              <li key={food.id} className="rounded-full bg-white/80 px-3 py-1.5 text-sm font-bold text-cocoa-700 ring-1 ring-inset ring-blush-200">
                <span aria-hidden>{food.emoji} </span>
                {food.name}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="prefs-title" className="space-y-3">
        <h2 id="prefs-title" className="text-sm font-extrabold uppercase tracking-wider text-cocoa-500">
          Preferences
        </h2>
        <label className="flex min-h-[4.5rem] cursor-pointer items-center gap-4 rounded-3xl bg-white/90 px-4 py-3 shadow-soft ring-1 ring-inset ring-blush-200">
          <span className="flex-1">
            <span className="block font-bold text-cocoa-900">Extra kebab energy</span>
            <span className="block text-sm text-cocoa-500">
              A tiny bonus for kebab, ćevapi and friends.
            </span>
          </span>
          <input
            type="checkbox"
            role="switch"
            checked={boost}
            onChange={(e) => onSetKebabBoost(e.target.checked)}
            className="peer sr-only"
          />
          <span
            aria-hidden
            className={`relative h-8 w-14 shrink-0 rounded-full transition-colors peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-berry-500 ${
              boost ? 'bg-berry-500' : 'bg-blush-200'
            }`}
          >
            <motion.span
              className="absolute left-1 top-1 size-6 rounded-full bg-white shadow"
              animate={{ x: boost ? 24 : 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          </span>
        </label>
        <p className="px-2 text-sm text-cocoa-500">
          Everything is saved only on this device. No accounts, no servers, no judgement.
        </p>
        <Button
          variant="ghost"
          className="min-h-12 text-base"
          onClick={() => {
            if (confirmClear) {
              onClear()
              setConfirmClear(false)
            } else {
              setConfirmClear(true)
            }
          }}
        >
          {confirmClear ? 'Tap again to forget everything' : 'Forget my history'}
        </Button>
      </section>
    </Screen>
  )
}
