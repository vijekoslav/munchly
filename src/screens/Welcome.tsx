import { Heart } from 'lucide-react'
import { motion } from 'motion/react'
import { Button, IconButton } from '../components/ui/Button'
import { Screen } from '../components/ui/Screen'
import { QUIPS } from '../data/copy'

interface WelcomeProps {
  favoriteCount: number
  hasLastAnswers: boolean
  onStart: () => void
  onSurprise: () => void
  onRepeatLast: () => void
  onOpenFavorites: () => void
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.11, delayChildren: 0.15 } },
}
const rise = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 140, damping: 18 } },
}

/** A little cluster of food around a big heart: the front-door illustration. */
function HeroIllustration() {
  const orbit = [
    { emoji: '🍟', className: 'left-1 top-9 text-4xl', delay: 0.5, rotate: -14 },
    { emoji: '🍕', className: 'right-0 top-14 text-[2.6rem]', delay: 0.62, rotate: 12 },
    { emoji: '🥙', className: 'left-5 bottom-3 text-[2.6rem]', delay: 0.74, rotate: -8 },
    { emoji: '🍩', className: 'right-4 bottom-1 text-3xl', delay: 0.86, rotate: 10 },
  ]
  return (
    <motion.div
      aria-hidden
      className="relative mx-auto size-52 sm:size-60"
      initial={{ opacity: 0, scale: 0.6, rotate: -8 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 120, damping: 14, delay: 0.05 }}
    >
      <div className="absolute inset-3 rounded-full bg-gradient-to-br from-white via-blush-100 to-blush-200 shadow-card ring-1 ring-white" />
      <motion.div
        className="absolute inset-0 flex items-center justify-center text-berry-400"
        animate={{ scale: [1, 1.06, 1] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Heart
          className="size-28 drop-shadow-[0_10px_14px_rgb(178_51_90_/_0.3)] sm:size-32"
          fill="currentColor"
          strokeWidth={0}
        />
        <span className="absolute -mt-2 text-6xl sm:text-7xl">🌯</span>
      </motion.div>
      {orbit.map((item) => (
        <motion.span
          key={item.emoji}
          className={`absolute drop-shadow-md ${item.className}`}
          initial={{ opacity: 0, scale: 0, rotate: 0 }}
          animate={{ opacity: 1, scale: 1, rotate: item.rotate }}
          transition={{ type: 'spring', stiffness: 200, damping: 12, delay: item.delay }}
        >
          {item.emoji}
        </motion.span>
      ))}
    </motion.div>
  )
}

export function Welcome({
  favoriteCount,
  hasLastAnswers,
  onStart,
  onSurprise,
  onRepeatLast,
  onOpenFavorites,
}: WelcomeProps) {
  return (
    <Screen label="Welcome">
      <header className="flex items-center justify-between">
        <div className="font-display flex items-center gap-1.5 text-xl font-bold text-berry-600">
          <Heart className="size-5" fill="currentColor" strokeWidth={0} aria-hidden />
          Munchly
        </div>
        <IconButton label={`Favorites (${favoriteCount})`} onClick={onOpenFavorites}>
          <Heart className="size-5" fill={favoriteCount ? 'currentColor' : 'none'} aria-hidden />
          {favoriteCount > 0 && (
            <span
              aria-hidden
              className="absolute -right-0.5 -top-0.5 flex size-5 items-center justify-center rounded-full bg-berry-500 text-[0.7rem] font-extrabold text-white"
            >
              {favoriteCount}
            </span>
          )}
        </IconButton>
      </header>

      <motion.div
        className="flex flex-1 flex-col justify-center gap-8 py-6"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <HeroIllustration />

        <div className="space-y-4 text-center">
          <motion.h1
            variants={rise}
            className="font-display text-[2.6rem] font-semibold leading-[1.06] tracking-tight text-cocoa-900 sm:text-5xl"
          >
            What are we eating, <em className="font-medium italic text-berry-500">gorgeous?</em>
          </motion.h1>
          <motion.p variants={rise} className="mx-auto max-w-sm text-lg leading-relaxed text-cocoa-700">
            Because apparently deciding what to eat is the hardest part of our day.
          </motion.p>
        </div>

        <motion.div variants={rise} className="space-y-3">
          <Button onClick={onStart}>Help me decide ♡</Button>
          <Button variant="secondary" onClick={onSurprise}>
            Fine, you pick!
          </Button>
          {hasLastAnswers && (
            <Button variant="ghost" onClick={onRepeatLast} className="min-h-12 text-base">
              Same answers as last time
            </Button>
          )}
        </motion.div>
      </motion.div>

      <p className="text-center text-sm font-semibold italic text-cocoa-500">{QUIPS.welcomeFooter}</p>
    </Screen>
  )
}
