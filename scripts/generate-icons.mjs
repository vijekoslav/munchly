// Renders the PWA / Apple touch icons: the heart SVG on scripts/icon-background.png. Run: npm run icons
import { mkdirSync, writeFileSync } from 'node:fs'
import sharp from 'sharp'

const heart =
  'M256 410 C 120 318 84 246 84 188 C 84 138 122 104 168 104 C 207 104 238 126 256 158 C 274 126 305 104 344 104 C 390 104 428 138 428 188 C 428 246 392 318 256 410 Z'

/** `scale` shrinks the artwork inside the canvas (maskable icons need a safe zone). */
const svg = (scale = 1) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#ffd3dc"/>
      <stop offset="1" stop-color="#f58aa5"/>
    </linearGradient>
    <linearGradient id="heart" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fffaf5"/>
      <stop offset="1" stop-color="#ffe4e9"/>
    </linearGradient>
  </defs>
  <g transform="translate(256 256) scale(${scale}) translate(-256 -256)">
    <path d="${heart}" transform="translate(0 10)" fill="#000" opacity=".35"/>
    <path d="${heart}" fill="url(#heart)"/>
    <path d="M178 160 C 150 160 134 180 134 204" fill="none" stroke="#fff" stroke-width="14" stroke-linecap="round" opacity=".9"/>
    <g fill="#e0577c">
      <path d="M326 214 l8 18 l18 8 l-18 8 l-8 18 l-8 -18 l-18 -8 l18 -8 z"/>
    </g>
    <circle cx="200" cy="232" r="10" fill="#e0577c"/>
    <path d="M214 268 Q 256 306 298 268" fill="none" stroke="#e0577c" stroke-width="14" stroke-linecap="round"/>
  </g>
</svg>`

const outputs = [
  ['public/icons/icon-192.png', 192, 1],
  ['public/icons/icon-512.png', 512, 1],
  ['public/icons/icon-512-maskable.png', 512, 0.78],
  ['public/icons/apple-touch-icon.png', 180, 1],
]

mkdirSync('public/icons', { recursive: true })
for (const [file, size, scale] of outputs) {
  const heart = await sharp(Buffer.from(svg(scale))).resize(size, size).png().toBuffer()
  await sharp('scripts/icon-background.png')
    .resize(size, size, { fit: 'cover' })
    .composite([{ input: heart }])
    .png()
    .toFile(file)
  console.log('wrote', file)
}

// Favicon: same heart on a flat dark rounded square.
writeFileSync(
  'public/favicon.svg',
  svg(1).replace('<g transform', '<rect width="512" height="512" rx="112" fill="#232323"/><g transform'),
)
console.log('wrote public/favicon.svg')
