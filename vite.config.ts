/// <reference types="vitest/config" />
import { createHash } from 'node:crypto'
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

/**
 * Stamps the service worker with the list of built files so the whole app is
 * cached on first visit (and therefore works offline), and with a content hash
 * so a new deploy invalidates the old cache.
 */
function serviceWorkerManifest(): Plugin {
  let outDir = 'dist'
  const walk = (dir: string): string[] =>
    readdirSync(dir).flatMap((name) => {
      const full = join(dir, name)
      return statSync(full).isDirectory() ? walk(full) : [full]
    })

  return {
    name: 'munchly-sw-manifest',
    apply: 'build',
    configResolved(config) {
      outDir = config.build.outDir
    },
    closeBundle() {
      const swPath = join(outDir, 'sw.js')
      const files = walk(outDir)
        .map((file) => relative(outDir, file).split(sep).join('/'))
        // Only the latin subsets of the fonts are ever used; skip the rest.
        .filter((file) => !/\.woff2$/.test(file) || /-latin(-ext)?-/.test(file))
        .filter((file) => file !== 'sw.js' && !file.endsWith('.map'))
      const hash = createHash('sha1')
      for (const file of files) hash.update(file).update(readFileSync(join(outDir, file)))
      const sw = readFileSync(swPath, 'utf8')
        .replace('__PRECACHE_FILES__', JSON.stringify(files))
        .replace('__CACHE_VERSION__', hash.digest('hex').slice(0, 10))
      writeFileSync(swPath, sw)
    },
  }
}

export default defineConfig({
  // Relative base: works on https://<user>.github.io/<repo>/ without knowing the
  // repo name. Override with VITE_BASE=/<repo>/ if you prefer absolute paths.
  base: process.env.VITE_BASE ?? './',
  plugins: [react(), tailwindcss(), serviceWorkerManifest()],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
