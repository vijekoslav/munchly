import { ArrowLeft, Check } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { IconButton } from '../components/ui/Button'
import { Screen } from '../components/ui/Screen'
import { QUIPS } from '../data/copy'
import { QUESTIONS } from '../data/questions'
import type { Answers } from '../types'

interface QuestionnaireProps {
  onComplete: (answers: Answers) => void
  onExit: () => void
}

/** Delay between tapping an answer and moving on, so the selection can be enjoyed. */
const ADVANCE_MS = 320

const slide = {
  enter: (direction: number) => ({ opacity: 0, x: direction * 48 }),
  center: { opacity: 1, x: 0 },
  exit: (direction: number) => ({ opacity: 0, x: direction * -48 }),
}

export function Questionnaire({ onComplete, onExit }: QuestionnaireProps) {
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)
  const [answers, setAnswers] = useState<Partial<Record<keyof Answers, string>>>({})
  const [locked, setLocked] = useState(false)
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const question = QUESTIONS[step]
  if (!question) return null
  const previous = QUESTIONS[step - 1]
  const previousReply = previous?.options.find((o) => o.value === answers[previous.id])?.reply
  const isLast = step === QUESTIONS.length - 1

  const go = (next: number, dir: number) => {
    setDirection(dir)
    setStep(next)
    window.scrollTo({ top: 0 })
  }

  const choose = (value: string) => {
    if (locked) return
    const next = { ...answers, [question.id]: value }
    setAnswers(next)
    setLocked(true)
    timer.current = window.setTimeout(() => {
      setLocked(false)
      if (isLast) onComplete(next as unknown as Answers)
      else go(step + 1, 1)
    }, ADVANCE_MS)
  }

  const back = () => {
    if (locked) return
    if (step === 0) onExit()
    else go(step - 1, -1)
  }

  return (
    <Screen label="Questionnaire">
      <header className="flex items-center gap-4">
        <IconButton label={step === 0 ? 'Back to start' : 'Previous question'} onClick={back}>
          <ArrowLeft className="size-5" aria-hidden />
        </IconButton>
        <div
          role="progressbar"
          aria-label="Questionnaire progress"
          aria-valuemin={1}
          aria-valuemax={QUESTIONS.length}
          aria-valuenow={step + 1}
          aria-valuetext={`Question ${step + 1} of ${QUESTIONS.length}`}
          className="h-2.5 flex-1 overflow-hidden rounded-full bg-white/80 ring-1 ring-inset ring-blush-200"
        >
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-blush-400 to-berry-500"
            initial={false}
            animate={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }}
            transition={{ type: 'spring', stiffness: 120, damping: 20 }}
          />
        </div>
        <span aria-hidden className="w-9 text-right text-sm font-bold tabular-nums text-cocoa-500">
          {step + 1}/{QUESTIONS.length}
        </span>
      </header>

      <div className="flex flex-1 flex-col justify-center py-6">
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.section
            key={question.id}
            custom={direction}
            variants={slide}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.28, ease: 'easeOut' }}
            aria-labelledby="question-title"
          >
            <div className="mb-6 min-h-[5.5rem] space-y-2">
              <p className="min-h-6 text-[0.95rem] font-semibold italic text-berry-600">
                {previousReply ?? (step === 0 ? QUIPS.quizTrust : '')}
              </p>
              <h2
                id="question-title"
                className="font-display text-[1.95rem] font-semibold leading-tight tracking-tight text-cocoa-900 sm:text-4xl"
              >
                {question.title}
              </h2>
            </div>

            <div role="group" aria-labelledby="question-title" className="grid gap-3">
              {question.options.map((option, index) => {
                const selected = answers[question.id] === option.value
                return (
                  <motion.button
                    key={option.value}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => choose(option.value)}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.06 + index * 0.05, type: 'spring', stiffness: 220, damping: 20 }}
                    whileTap={{ scale: 0.975 }}
                    className={`flex min-h-[4.5rem] w-full items-center gap-4 rounded-3xl px-4 py-3 text-left shadow-soft ring-1 ring-inset transition-colors ${
                      selected
                        ? 'bg-gradient-to-br from-blush-100 to-blush-200 ring-2 ring-berry-500'
                        : 'bg-white/90 ring-blush-200 hover:bg-white'
                    }`}
                  >
                    <span
                      aria-hidden
                      className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-blush-50 text-[1.65rem] ring-1 ring-inset ring-blush-100"
                    >
                      {option.emoji}
                    </span>
                    <span className="flex-1 text-[1.1rem] font-bold leading-snug text-cocoa-900">
                      {option.label}
                    </span>
                    <span
                      aria-hidden
                      className={`flex size-7 shrink-0 items-center justify-center rounded-full transition-colors ${
                        selected ? 'bg-berry-500 text-white' : 'ring-2 ring-inset ring-blush-300'
                      }`}
                    >
                      {selected && <Check className="size-4" strokeWidth={3} />}
                    </span>
                  </motion.button>
                )
              })}
            </div>
          </motion.section>
        </AnimatePresence>
      </div>
    </Screen>
  )
}
