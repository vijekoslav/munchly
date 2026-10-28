import type { ReactNode } from 'react'
import { motion } from 'motion/react'

/**
 * A full-height screen column: centred, max-width on desktop, padded for the notch
 * and home indicator. Scrolls naturally when content is taller than the viewport.
 */
export function Screen({
  children,
  className = '',
  label,
}: {
  children: ReactNode
  className?: string
  label?: string
}) {
  return (
    <motion.main
      aria-label={label}
      className={`relative mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 sm:max-w-lg sm:px-8 ${className}`}
      style={{
        paddingTop: 'max(1rem, var(--safe-top))',
        paddingBottom: 'max(1.5rem, calc(var(--safe-bottom) + 0.75rem))',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.main>
  )
}
