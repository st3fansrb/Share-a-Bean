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
  /** Set when yieldTHa comes from a cited source; otherwise it is a placeholder. */
  yieldSource?: string;
  /** Set when priceEurT is not a placeholder (e.g. synthetic hackathon data). */
  priceSource?: string;
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
export type EcoScheme = {
  baseEurHa: number; higherEurHa: number;
  basePts: number; higherPts: number; maxPts: number;
  /** Points a legume share earns: at least 10% of arable land, or at least 5%. */
  legumePtsAt10Pct: number; legumePtsAt5Pct: number;
  source: string;
};
export type CapProgramme = {
  id: string;
  status: "active" | "next" | "proposed";
  title: string;
  /** Short plain text, not for maths: money lives in the Calculator. */
  amount: string;
  what: string;
  eligibility: string[];
  note: string;
};
export type CapData = { country: "FR"; basicEurHa: number; schemes: CapScheme[]; ecoScheme: EcoScheme; programmes: CapProgramme[] };

// Owner: Alexander. GET /api/insights
export type CropPerformance = {
  crop: CropId | "pulses" | "cereals";
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
  type: "Food processor" | "Feed company" | "Biogas plant" | "Cooperative" | "Trader";
  crop: CropId;
  volumeT: [number, number];
  priceEurT: [number, number];
  contract: "Spot" | "Forward" | "Cooperative" | "Framework" | "Fixed or formula";
  delivery: string;
  /** Road distance from the demo farm, km. */
  distanceKm: number;
  town: string;
  lat: number;
  lon: number;
  /** Contract length in years (1 to 3). */
  years: number;
  /** Second buyer for the other crops in the rotation, so the whole cycle is covered. */
  partner: RotationBuyer;
};
export type RotationBuyer = {
  buyer: string;
  type: Offer["type"];
  town: string;
  lat: number;
  lon: number;
  distanceKm: number;
  crops: CropId[];
  /** Paid at the market price plus or minus this percentage. */
  premiumPct: number;
  contract: Offer["contract"];
  years: number;
};
export type OpportunitiesData = { offers: Offer[] };

// Owner: Stefan. GET /api/farm (My Farm and Contracts are one tab)
export type Parcel = { id: string; crop: CropId; area: number; ecoScheme?: string };

export type ShareRecord = {
  id: string;
  at: string;
  offerId: string;
  buyer: string;
  crop: CropId;
  parcels: string[];
  disclosedFields: {
    area: boolean;
    crop: boolean;
    ecoScheme: boolean;
    yieldEstimate?: boolean;
  };
  active: boolean;
};
/** A contract the farmer is fulfilling with a buyer from Opportunities (offerId matches Offer.id). Tracking only: status, committed vs delivered, delivery window. */
export type FarmContract = {
  id: string;
  offerId: string;
  buyer: string;
  crop: CropId;
  contract: Offer["contract"];
  /** Harvest year the volume comes from. */
  harvest: number;
  status: "upcoming" | "delivering" | "fulfilled";
  committedT: number;
  deliveredT: number;
  priceEurT: number;
  /** ISO dates, inclusive. */
  windowStart: string;
  windowEnd: string;
};
export type FarmData = { name: string; region: string; parcels: Parcel[]; contracts: FarmContract[] };
