import { Heart } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'

interface Spec {
  left: string
  top: string
  size: number
  delay: number
  duration: number
  opacity: number
}

const HEARTS: readonly Spec[] = [
  { left: '8%', top: '12%', size: 18, delay: 0, duration: 7, opacity: 0.5 },
  { left: '86%', top: '9%', size: 26, delay: 1.2, duration: 8, opacity: 0.4 },
  { left: '92%', top: '38%', size: 14, delay: 0.6, duration: 6, opacity: 0.45 },
  { left: '4%', top: '46%', size: 24, delay: 2, duration: 9, opacity: 0.35 },
  { left: '80%', top: '70%', size: 20, delay: 0.3, duration: 7.5, opacity: 0.4 },
  { left: '14%', top: '80%', size: 16, delay: 1.6, duration: 6.5, opacity: 0.45 },
  { left: '48%', top: '93%', size: 22, delay: 2.4, duration: 8.5, opacity: 0.3 },
]

/** Soft decorative hearts drifting in the background. Static when motion is reduced. */
export function FloatingHearts() {
  const reduce = useReducedMotion()
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {HEARTS.map((h, i) => (
        <motion.span
          key={i}
          className="absolute text-blush-300"
          style={{ left: h.left, top: h.top, opacity: h.opacity }}
          animate={reduce ? undefined : { y: [0, -14, 0], rotate: [-6, 6, -6] }}
          transition={{ duration: h.duration, delay: h.delay, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Heart size={h.size} fill="currentColor" strokeWidth={0} />
        </motion.span>
      ))}
    </div>
  )
}
