import { motion, type HTMLMotionProps } from 'motion/react'
import type { ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost'

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-gradient-to-b from-berry-400 to-berry-500 text-white shadow-pill hover:from-berry-500 hover:to-berry-600',
  secondary:
    'bg-white/90 text-berry-600 ring-1 ring-inset ring-blush-300 shadow-soft hover:bg-white',
  ghost: 'bg-transparent text-cocoa-500 hover:text-berry-600',
}

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: Variant
  icon?: ReactNode
  children: ReactNode
}

/** Pill button with a comfortable 56px touch target. */
export function Button({ variant = 'primary', icon, children, className = '', ...rest }: ButtonProps) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.97 }}
      className={`inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-full px-7 text-[1.05rem] font-bold transition-colors ${VARIANTS[variant]} ${className}`}
      {...rest}
    >
      {icon}
      {children}
    </motion.button>
  )
}

/** Round icon-only button (back, favorites…). Always 48px square at minimum. */
export function IconButton({
  label,
  children,
  className = '',
  ...rest
}: Omit<HTMLMotionProps<'button'>, 'children' | 'aria-label'> & { label: string; children: ReactNode }) {
  return (
    <motion.button
      type="button"
      aria-label={label}
      whileTap={{ scale: 0.92 }}
      className={`relative inline-flex size-12 items-center justify-center rounded-full bg-white/80 text-berry-600 shadow-soft ring-1 ring-inset ring-blush-200 ${className}`}
      {...rest}
    >
      {children}
    </motion.button>
  )
}
