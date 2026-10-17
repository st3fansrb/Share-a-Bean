// One typed contract per tab. The UI and the data sources only meet here.
// Designers (Claude Design) build against these shapes; data people fill them.
// Every payload carries `meta` so the UI can label placeholders honestly.

export type Provenance = "placeholder" | "synthetic" | "derived" | "sourced";

export type Meta = {
  provenance: Provenance;
  /** Where the numbers come from; required once provenance is "derived" or "sourced". */
  source?: string;
  asOf?: string;
};

export type Envelope<T> = { meta: Meta; data: T };

export type CropId = "faba" | "lupin" | "pea" | "wheat" | "rapeseed" | "sunflower";

// Owner: Alexa. GET /api/knowledge
export type KnowledgeArticle = {
  id: string;
  title: string;
  summary: string;
  body: string;
  tags: string[];
};
export type KnowledgeData = { articles: KnowledgeArticle[] };

// Owner: Alexa. GET /api/calculator
export type CropAssumption = {
  id: CropId;
  label: string;
  legume: boolean;
  yieldTHa: number;
  priceEurT: number;
  costEurHa: number;
};
export type CalculatorData = {
  crops: CropAssumption[];
  nitrogenCreditKgHa: number;
  nitrogenEurKg: number;
  /** CAP support per ha that applies automatically per crop id. */
  supportEurHaByCrop: Partial<Record<CropId, number>>;
};

// Owner: Alexander. GET /api/cap
export type CapScheme = {
  id: string;
  label: string;
  eurHa: number;
  appliesTo: "legume" | "fodder-legume" | "all";
  source: string;
};
export type CapData = { country: "FR"; schemes: CapScheme[] };

// Owner: Alexander. GET /api/insights
export type CropPerformance = {
  crop: CropId | "pulses";
  region: string; // NUTS3 or NUTS2 code
  year: number;
  areaHa: number | null;
  /** null where the source has none (pulses in crop_full_framework have no yield). */
  yieldTHa: number | null;
  nitrogenKgHa: number | null;
};
export type InsightsData = { rows: CropPerformance[] };

// Owner: Stefan. GET /api/opportunities
export type Offer = {
  id: string;
  buyer: string;
  type: "Food processor" | "Feed company" | "Biogas plant" | "Cooperative";
  crop: CropId;
  volumeT: [number, number];
  priceEurT: [number, number];
  contract: "Spot" | "Forward" | "Cooperative" | "Framework" | "Fixed or formula";
  delivery: string;
  distanceKm: number;
};
export type OpportunitiesData = { offers: Offer[] };

// Owner: Stefan. GET /api/farm
export type Parcel = { id: string; crop: CropId; area: number };
export type FarmData = { name: string; region: string; parcels: Parcel[] };
