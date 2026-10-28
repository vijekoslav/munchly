import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { MotionConfig } from 'motion/react'
import './index.css'
import { App } from './App'
import { registerServiceWorker } from './lib/pwa'

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    {/* Honour the OS "reduce motion" setting: transform animations are switched off. */}
    <MotionConfig reducedMotion="user">
      <App />
    </MotionConfig>
  </StrictMode>,
)

registerServiceWorker()
