import { Heart } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { Screen } from '../components/ui/Screen'
import { LOADING_MESSAGES, LOADING_TITLE } from '../data/copy'

interface LoadingProps {
  onDone: () => void
  /** How long the loading screen stays, in ms. */
  duration?: number
}

const FOOD_CYCLE = ['🍔', '🍕', '🌯', '🍟', '🥞', '🍗']

/** Little hearts rising from the big one. */
const RISERS = [
  { x: -70, delay: 0, size: 16 },
  { x: -30, delay: 0.7, size: 12 },
  { x: 20, delay: 0.3, size: 18 },
  { x: 62, delay: 1.1, size: 13 },
  { x: -5, delay: 1.5, size: 10 },
  { x: 90, delay: 0.5, size: 11 },
]

/** The dedicated "One sec, gorgeous..." moment. Short on purpose: the answer is already computed. */
export function Loading({ onDone, duration = 2800 }: LoadingProps) {
  const reduce = useReducedMotion()
  const [message, setMessage] = useState(0)
  const [food, setFood] = useState(0)

  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone

  useEffect(() => {
    const done = window.setTimeout(() => onDoneRef.current(), duration)
    return () => window.clearTimeout(done)
  }, [duration])

  useEffect(() => {
    const messages = window.setInterval(() => setMessage((m) => (m + 1) % LOADING_MESSAGES.length), 1100)
    const foods = window.setInterval(() => setFood((f) => (f + 1) % FOOD_CYCLE.length), 650)
    return () => {
      window.clearInterval(messages)
      window.clearInterval(foods)
    }
  }, [])

  return (
    <Screen label="Loading" className="items-center justify-center text-center">
      <div className="flex flex-col items-center gap-10">
        <div aria-hidden className="relative flex size-56 items-center justify-center">
          {!reduce &&
            RISERS.map((r, i) => (
              <motion.span
                key={i}
                className="absolute bottom-24 text-blush-400"
                style={{ marginLeft: r.x }}
                initial={{ opacity: 0, y: 0, scale: 0.6 }}
                animate={{ opacity: [0, 0.9, 0], y: -120, scale: [0.6, 1, 0.8] }}
                transition={{ duration: 2.4, delay: r.delay, repeat: Infinity, ease: 'easeOut' }}
              >
                <Heart size={r.size} fill="currentColor" strokeWidth={0} />
              </motion.span>
            ))}

          <motion.div
            className="relative flex items-center justify-center text-berry-400"
            animate={reduce ? undefined : { scale: [1, 1.12, 1, 1.08, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Heart
              className="size-44 drop-shadow-[0_18px_22px_rgb(178_51_90_/_0.3)]"
              fill="currentColor"
              strokeWidth={0}
            />
            <AnimatePresence mode="popLayout">
              <motion.span
                key={food}
                className="absolute -mt-3 text-6xl"
                initial={{ opacity: 0, scale: 0.4, rotate: -20 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.4, rotate: 20 }}
                transition={{ type: 'spring', stiffness: 260, damping: 16 }}
              >
                {FOOD_CYCLE[food]}
              </motion.span>
            </AnimatePresence>
          </motion.div>
        </div>

        <div role="status" className="space-y-4">
          <motion.h1
            className="font-display text-[2.6rem] font-semibold leading-tight tracking-tight text-cocoa-900 sm:text-5xl"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {LOADING_TITLE}
          </motion.h1>

          <div aria-hidden className="relative h-7">
            <AnimatePresence mode="wait">
              <motion.p
                key={message}
                className="absolute inset-x-0 text-lg font-semibold italic text-berry-600"
                initial={{ opacity: 0, y: 8, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
                transition={{ duration: 0.3 }}
              >
                {LOADING_MESSAGES[message]}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </Screen>
  )
}
