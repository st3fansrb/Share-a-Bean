# Declarations
- Third-party libraries: next, react, react-dom, typescript, vitest (all open source).
- AI: none in this draft. Planned: Claude API to explain computed numbers only.
- Data: synthetic demo data in `data/`. Crop and cost numbers are placeholders. No hackathon raw data is in this repo.
- Datasets used: DG AGRI hackathon synthetic sales (`synthetic_transaction_sale`), aggregates only (contract-type mix, lot-size percentiles); no rows are in this repo.
- Public sources for the simulated buyers: [FranceAgriMer, Fiche filière protéagineux 2026](https://www.franceagrimer.fr/sites/default/files/2026-02/19_FICHE_FILIERE_PROTEAGINEUX_2026.pdf) (collector mix, outlets, export, July to June campaign). Price bands in `data/offers.json` are indicative guesses, not sourced quotes: replace them with a sourced series before the pitch.
