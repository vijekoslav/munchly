import { Heart } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { useMemo } from 'react'

const COUNT = 18

/** A one-shot burst of hearts from the centre of its (relatively positioned) parent. */
export function HeartBurst() {
  const reduce = useReducedMotion()
  const pieces = useMemo(
    () =>
      Array.from({ length: COUNT }, (_, i) => {
        const angle = (i / COUNT) * Math.PI * 2 + Math.random() * 0.4
        const distance = 110 + Math.random() * 90
        return {
          x: Math.cos(angle) * distance,
          y: Math.sin(angle) * distance - 30,
          size: 12 + Math.random() * 16,
          delay: Math.random() * 0.12,
          rotate: (Math.random() - 0.5) * 90,
        }
      }),
    [],
  )
  if (reduce) return null

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
      {pieces.map((p, i) => (
        <motion.span
          key={i}
          className="absolute text-berry-400"
          initial={{ opacity: 1, x: 0, y: 0, scale: 0.3, rotate: 0 }}
          animate={{ opacity: 0, x: p.x, y: p.y + 60, scale: 1, rotate: p.rotate }}
          transition={{ duration: 1.3, delay: p.delay, ease: 'easeOut' }}
        >
          <Heart size={p.size} fill="currentColor" strokeWidth={0} />
        </motion.span>
      ))}
    </div>
  )
}
