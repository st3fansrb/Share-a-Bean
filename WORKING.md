# How we work in parallel

Each tab has one typed contract in `lib/contracts.ts` and one JSON endpoint under `app/api/<tab>`. Designers build against the contract, data people fill it, nobody edits the other's files.

| Tab | Design | Data | Endpoint | Contract type |
|---|---|---|---|---|
| Knowledge Hub | Alexa | Alexa | `/api/knowledge` | `KnowledgeData` |
| Crop Calculator | Alexa | Maritina (yields, costs) | `/api/calculator` | `CalculatorData` |
| CAP Benefits | Alexander | Alexander | `/api/cap` | `CapData` |
| Market Insights | Alexander | Maritina (extract) | `/api/insights` | `InsightsData` |
| Opportunities | Stefan | Stefan (simulated buyers) | `/api/opportunities` | `OpportunitiesData` |
| My Farm / Contracts | Stefan | Stefan | `/api/farm` | `FarmData` |

## Rules

1. **Design in Claude Design, hand over a screen.** Stefan wires it: the page fetches its endpoint and renders the contract fields. If a screen needs a field that is not in the contract, ask for it in the PR; do not invent it in the UI.
2. **Data goes in `data/<tab>.json` or, later, a derived extract behind `lib/providers/index.ts`.** That file is the only place that knows where data comes from. Changing the source never changes the route or the screen.
3. **Provenance on everything.** Each response has `meta.provenance` (`placeholder`, `synthetic`, `derived`, `sourced`). `derived` and `sourced` need `meta.source`. The UI shows a tag until it is `sourced`.
4. **No raw hackathon data in the repo** (ToS 10.3). Only aggregates and synthetic values. Pulses have no yield in `crop_full_framework`: leave `yieldTHa: null`, do not guess.
5. **One owner per file.** Branch per tab (`tab/knowledge`, `tab/cap`, ...), small PRs into `main`. `main` auto-deploys, so keep it building: `npm test` and `npx tsc --noEmit` before merge.

## Maritina: what to extract

Rows shaped like `CropPerformance` in `lib/contracts.ts` (crop, region, year, areaHa, yieldTHa, nitrogenKgHa), France only, as `data/insights.json`. Calculator inputs (yield, price, cost per crop) as `CropAssumption`. Name the source in the PR.

## Check it works

`npm run dev`, then open `/api/opportunities` (or any endpoint above).
