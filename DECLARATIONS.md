# Declarations

- Third-party libraries: next, react, react-dom, typescript, vitest, d3-geo, topojson-client (all open source).
- AI: none in this draft. Planned: Claude API to explain computed numbers only.
- Data: synthetic demo data in `data/`. Crop and cost numbers are placeholders. No hackathon raw data is in this repo.
- Datasets used: DG AGRI hackathon synthetic sales (`synthetic_transaction_sale`), aggregates only (contract-type mix, lot-size percentiles); no rows are in this repo.
- Public sources for the simulated buyers: [FranceAgriMer, Fiche filière protéagineux 2026](https://www.franceagrimer.fr/sites/default/files/2026-02/19_FICHE_FILIERE_PROTEAGINEUX_2026.pdf) (collector mix, outlets, export, July to June campaign). Price bands in `data/offers.json` are indicative guesses, not sourced quotes: replace them with a sourced series before the pitch.
- Public data: `data/eurostat/legume.json` and `nuts2.topo.json` are a Eurostat snapshot (apro_cpshr, apri_ap_crpouta, apri_ap_ina; NUTS 2 boundaries from GISCO) used by the Crop Calculator. CAP rates there are indicative national plan amounts. Knowledge Hub yields are Agreste and Terres Inovia published figures (sources listed in the app); its zone entries and discussion threads are demo content. Designs by Alexa (Claude Design).
- CAP support and Market insights screens follow Alexander's Claude Design ("Legume Support Check France"). Eco-scheme 2026 values (45.46 / 62.05 €/ha, points rules) come from his design and are provisional; prices and yields on Market insights are the placeholder assumptions in `data/crops.json`.
