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

1. **Design in Claude Design, hand over a screen.** Designers do not need to know the contracts. Stefan wires the screen to its endpoint; if it shows something the contract lacks, we extend the contract and the mock data, not the screen.
2. **Data goes in `data/<tab>.json` or, later, a derived extract behind `lib/providers/index.ts`.** That file is the only place that knows where data comes from. Changing the source never changes the route or the screen.
3. **Provenance on everything.** Each response has `meta.provenance` (`placeholder`, `synthetic`, `derived`, `sourced`). `derived` and `sourced` need `meta.source`. The UI shows a tag until it is `sourced`.
4. **No raw hackathon data in the repo** (ToS 10.3). Only aggregates and synthetic values. Pulses have no yield in `crop_full_framework`: leave `yieldTHa: null`, do not guess.
5. **One owner per file.** Branch per tab (`tab/knowledge`, `tab/cap`, ...), small PRs into `main`. `main` auto-deploys, so keep it building: `npm test` and `npx tsc --noEmit` before merge.

## Maritina: what goes where

| Tab | Source in the hackathon data | What to extract (aggregates only) |
|---|---|---|
| Market Insights | `crop/crop_full_framework.csv` (CROP > Crop Full Framework) | France, NUTS3, 2017-2020: area, yield, nitrogen per crop group. Pulses (PULS) have no yield: leave null. Legume yields from Eurostat `apro_cpsh1` (public). |
| Crop Calculator | `market_price`, `transaction_sale`, farm input costs | €/t for the 7 products that have a price, cost per ha per crop. Legume prices and costs do not exist in the data: stay placeholder. |
| Opportunities | 40 buyers, contract types (spot, forward, cooperative), sales | Buyer type, product, price range, volume range, contract type. Stefan turns a few into simulated buyers. |
| My Farm / Contracts | parcel and crop files (IACS-like schema), region FRB06 | A handful of synthetic parcels: id, crop, area. |
| CAP Benefits | not from Maritina | Rates from the fact-check file; Alexander confirms. |

Deliver each as a small CSV or JSON in `data/` with the source named in the PR. Never commit raw rows (ToS 10.3).

## Check it works

`npm run dev`, then open `/api/opportunities` (or any endpoint above).
