# Munchly ♡

A tiny, slightly cheeky food-decision app. Answer six questions (or tap **Fine, you pick!**), wait through a very serious loading screen, and get a restaurant/takeaway recommendation with a personalised reason.

- React + TypeScript (strict) + Vite + Tailwind CSS v4 + Motion + Lucide
- 100% client-side: no backend, accounts or external APIs. Everything is saved in `localStorage`.
- Installable PWA with offline support, tuned for iPhone (safe areas, 56 px tap targets).
- UI in English, food names in Croatian (Ćevapi u lepinji, Pohani sir, Palačinke…). No sushi, ever.

## Develop

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # unit tests for the recommendation engine + storage
npm run build      # type-check + production build into dist/
npm run preview    # serve the production build (service worker only runs here)
```

## Deploy to GitHub Pages

The build uses a relative base (`./`), so it works under `https://<user>.github.io/<repo>/` without configuration. The app is a single page with state-based navigation, so there are no routes to break on static hosting.

**Automatic (recommended)**

1. Push the project to a GitHub repository on the `main` branch.
2. In the repo go to **Settings → Pages → Build and deployment → Source** and choose **GitHub Actions**.
3. Push to `main`. [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) runs the tests, builds and publishes.

**Manual**: run `npm run build` and publish the contents of `dist/` to any static host. To use an absolute base path instead, build with `VITE_BASE=/<repo>/ npm run build`.

## Install on iPhone

Open the deployed URL in **Safari → Share → Add to Home Screen**. It then launches full-screen and works offline after the first visit.

After a new deploy the installed app picks up the update the next time it is opened twice (the new service worker activates immediately, but the page already open still runs the old code).

## How the recommendation works

All logic lives in [`src/engine`](src/engine), separate from the UI, and every tunable number is in [`weights.ts`](src/engine/weights.ts).

1. **Hard filters**: eating method (delivery / pickup / dine-in), budget cap and hunger level. A pizza slice is never suggested for delivery and "keeping it cheap" never gets a platter. Only hunger is loosened (±1 level, then ignored) if fewer than three foods survive.
2. **Weighted scoring**: mood, craving, closeness to the chosen budget, adventure style, favourites and past "yes" answers (capped so it never gets repetitive), and a modest **kebab-family bonus** that only applies when the food matched something she asked for.
3. **Repeat avoidance**: the last 12 recommendations are stored and penalised (newest most). "Something else?" also excludes everything already shown in the current round.
4. **Lucky draw**: a softmax draw among near-top scorers, so identical answers don't always give identical results.
5. **Fine, you pick!** skips the questions and scores only her taste profile (favourites, history, a gentle kebab lean), never dessert.

## Editing the content

| What | Where |
| --- | --- |
| Foods (add a dish by adding one object) | [`src/data/foods/`](src/data/foods) |
| Questions and answer wording | [`src/data/questions.ts`](src/data/questions.ts) |
| Loading messages, headlines, quips | [`src/data/copy.ts`](src/data/copy.ts) |
| Scoring weights | [`src/engine/weights.ts`](src/engine/weights.ts) |
| Colours and fonts | [`src/index.css`](src/index.css) (`@theme`) |

Foods carry: `id`, `name` (Croatian), English `description`, `category`, `hunger`, `moods`, `traits` (meat / cheesy / crispy / bread), `flavors`, `budget` tier (1–4, a rough tier, not a price), `methods`, `adventure` (classic / twist / wild), an optional `affinity` flag and an `emoji` or `image` (a file in `public/`). No restaurant names or prices are ever shown.

Food illustrations are emoji, so there are no image assets to host. To use real artwork, drop files into `public/` and set `image: 'foods/kebab.png'` (relative to the base path, e.g. via `import.meta.env.BASE_URL`).

## Icons

`npm run icons` regenerates the PWA and Apple touch icons from the SVG in [`scripts/generate-icons.mjs`](scripts/generate-icons.mjs).

## Privacy

Favourites, accepted picks, recent recommendations and the last answers are stored under the key `munchly:v1` in the browser's `localStorage`. "Forget my history" on the favourites screen wipes it.
