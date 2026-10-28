import { ChevronRight, Heart, RefreshCw, RotateCcw, Sparkles } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useMemo } from 'react'
import { HeartBurst } from '../components/HeartBurst'
import { Button } from '../components/ui/Button'
import { Screen } from '../components/ui/Screen'
import { headlineFor } from '../data/copy'
import type { Recommendation } from '../engine/recommend'
import type { Food } from '../types'

interface ResultProps {
  rec: Recommendation
  accepted: boolean
  acceptedQuip: string
  acceptedSubline: string
  isFavorite: boolean
  onAccept: () => void
  onRetry: () => void
  onRestart: () => void
  onUndoAccept: () => void
  onToggleFavorite: (food: Food) => void
  onPickAlternative: (food: Food) => void
}

export function FoodIllustration({ food, className = 'size-44 text-[5.5rem]' }: { food: Food; className?: string }) {
  return (
    <div
      aria-hidden
      className={`flex items-center justify-center rounded-full bg-gradient-to-br from-white via-blush-50 to-blush-200 shadow-card ring-4 ring-white ${className}`}
    >
      {food.image ? (
        <img src={food.image} alt="" className="size-3/4 object-contain" />
      ) : (
        <span className="drop-shadow-md">{food.emoji}</span>
      )}
    </div>
  )
}

export function Result({
  rec,
  accepted,
  acceptedQuip,
  acceptedSubline,
  isFavorite,
  onAccept,
  onRetry,
  onRestart,
  onUndoAccept,
  onToggleFavorite,
  onPickAlternative,
}: ResultProps) {
  const { food } = rec
  // A fresh headline per dish, but stable across re-renders of the same dish.
  const headline = useMemo(() => headlineFor(food), [food.id])

  return (
    <Screen label="Your recommendation" className="gap-6">
      <div className="sr-only" role="status">
        {`We are having ${food.name}. ${rec.reason}`}
      </div>

      <AnimatePresence mode="wait" initial>
        <motion.section
          key={food.id}
          className="space-y-5 pt-2 text-center"
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -16, scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 160, damping: 20 }}
        >
          <motion.p
            className="font-display pb-12 text-[1.65rem] font-medium italic leading-tight text-berry-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
          >
            {headline}
          </motion.p>

          <div className="relative rounded-[2rem] bg-white/90 px-5 pb-6 pt-24 shadow-card ring-1 ring-blush-100">
            {accepted && <HeartBurst />}

            <motion.div
              className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-12"
              initial={{ scale: 0.3, rotate: -18, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 170, damping: 11, delay: 0.1 }}
            >
              <FoodIllustration food={food} />
            </motion.div>

            <motion.button
              type="button"
              aria-pressed={isFavorite}
              aria-label={isFavorite ? `Remove ${food.name} from favorites` : `Save ${food.name} to favorites`}
              onClick={() => onToggleFavorite(food)}
              whileTap={{ scale: 0.85 }}
              className="absolute right-3 top-3 flex size-12 items-center justify-center rounded-full bg-blush-50 text-berry-500 ring-1 ring-inset ring-blush-200"
            >
              <Heart className="size-6" fill={isFavorite ? 'currentColor' : 'none'} aria-hidden />
            </motion.button>

            <div className="mt-8 space-y-3">
              <h1 className="font-display text-[2.2rem] font-semibold leading-[1.1] tracking-tight text-cocoa-900 sm:text-4xl">
                {food.name}
              </h1>
              <p className="mx-auto max-w-sm text-[1.05rem] leading-relaxed text-cocoa-700">
                {food.description}
              </p>
              <ul className="flex flex-wrap justify-center gap-2 pt-1" aria-label="Flavours">
                {food.flavors.slice(0, 3).map((flavor) => (
                  <li
                    key={flavor}
                    className="rounded-full bg-blush-100 px-3 py-1 text-sm font-bold capitalize text-berry-700"
                  >
                    {flavor}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-5 rounded-2xl bg-cream-50 p-4 text-left ring-1 ring-inset ring-blush-200">
              <p className="mb-1 flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-berry-600">
                <Sparkles className="size-3.5" aria-hidden />
                Why this one
              </p>
              <p className="leading-relaxed text-cocoa-700">{rec.reason}</p>
            </div>
          </div>
        </motion.section>
      </AnimatePresence>

      <div className="space-y-3">
        <AnimatePresence mode="wait" initial={false}>
          {accepted ? (
            <motion.div
              key="accepted"
              className="space-y-4 rounded-[2rem] bg-gradient-to-b from-blush-100 to-blush-200 p-5 text-center shadow-soft"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 16 }}
            >
              <div>
                <p className="font-display text-2xl font-semibold text-berry-700">{acceptedQuip}</p>
                <p className="mt-1 font-semibold text-cocoa-700">{acceptedSubline}</p>
              </div>
              <Button variant="secondary" onClick={onRestart} icon={<RotateCcw className="size-5" aria-hidden />}>
                Start over
              </Button>
              <Button variant="ghost" onClick={onUndoAccept} className="min-h-12 text-base">
                Actually, I changed my mind
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="actions"
              className="space-y-3"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.35 }}
            >
              <Button onClick={onAccept}>Okay, I&apos;m convinced ♡</Button>
              <Button variant="secondary" onClick={onRetry} icon={<RefreshCw className="size-5" aria-hidden />}>
                Hmm... something else?
              </Button>
              <Button variant="ghost" onClick={onRestart} className="min-h-12 text-base">
                Start over
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {!accepted && rec.alternatives.length > 0 && (
        <motion.section
          aria-labelledby="alternatives-title"
          className="space-y-3 pb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <h2 id="alternatives-title" className="text-center text-sm font-extrabold uppercase tracking-wider text-cocoa-500">
            Or, if you&apos;re feeling fickle
          </h2>
          <ul className="grid gap-2.5">
            {rec.alternatives.map((alt) => (
              <li key={alt.id}>
                <button
                  type="button"
                  onClick={() => onPickAlternative(alt)}
                  className="flex min-h-16 w-full items-center gap-3 rounded-2xl bg-white/70 px-3 py-2 text-left ring-1 ring-inset ring-blush-200 transition-colors active:bg-white"
                >
                  <span aria-hidden className="flex size-11 items-center justify-center rounded-xl bg-blush-50 text-2xl">
                    {alt.emoji}
                  </span>
                  <span className="flex-1 font-bold text-cocoa-900">{alt.name}</span>
                  <ChevronRight className="size-5 text-berry-400" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        </motion.section>
      )}
    </Screen>
  )
}
