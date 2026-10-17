// The only file that decides where data comes from. Today: JSON in /data.
// To plug in a derived extract, change the one function for that tab; the
// route, the contract and the UI stay as they are.
import knowledge from "@/data/knowledge.json";
import crops from "@/data/crops.json";
import cap from "@/data/cap.json";
import insights from "@/data/insights.json";
import offers from "@/data/offers.json";
import farm from "@/data/farm.json";
import type {
  Envelope, KnowledgeData, CalculatorData, CapData, InsightsData,
  OpportunitiesData, FarmData, CropId, CropAssumption,
} from "@/lib/contracts";

const placeholder = { provenance: "placeholder" as const };
const synthetic = { provenance: "synthetic" as const };

export const getKnowledge = (): Envelope<KnowledgeData> =>
  ({ meta: placeholder, data: { articles: knowledge.articles } });

export const getCap = (): Envelope<CapData> =>
  ({ meta: placeholder, data: { country: "FR", schemes: cap.schemes as CapData["schemes"] } });

export const getCalculator = (): Envelope<CalculatorData> => {
  const list: CropAssumption[] = Object.entries(crops.crops).map(([id, c]) => ({ id: id as CropId, ...c }));
  const protein = cap.schemes.find((s) => s.id === "coupled-protein")?.eurHa ?? 0;
  const supportEurHaByCrop = Object.fromEntries(list.filter((c) => c.legume).map((c) => [c.id, protein]));
  return {
    meta: placeholder,
    data: { crops: list, nitrogenCreditKgHa: crops.nitrogenCreditKgHa, nitrogenEurKg: crops.nitrogenEurKg, supportEurHaByCrop },
  };
};

export const getInsights = (): Envelope<InsightsData> =>
  ({ meta: placeholder, data: { rows: insights.rows as InsightsData["rows"] } });

export const getOpportunities = (): Envelope<OpportunitiesData> =>
  ({ meta: synthetic, data: { offers: offers.offers as OpportunitiesData["offers"] } });

export const getFarm = (): Envelope<FarmData> =>
  ({ meta: synthetic, data: { name: farm.name, region: farm.region, parcels: farm.parcels as FarmData["parcels"] } });
