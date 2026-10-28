import { FloatingHearts } from './FloatingHearts'

/** The shared blush-and-cream backdrop behind every screen. */
export function Background() {
  return (
    <div aria-hidden className="fixed inset-0 -z-10 overflow-hidden bg-cream-100">
      <div className="absolute inset-0 bg-[radial-gradient(120%_70%_at_50%_-10%,var(--color-blush-200)_0%,transparent_60%),radial-gradient(90%_60%_at_100%_100%,var(--color-blush-100)_0%,transparent_65%)]" />
      <FloatingHearts />
    </div>
  )
}
