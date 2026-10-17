import { getOpportunities, getFarm, getCalculator } from "@/lib/providers";
import { rankOffers, type AdvisorCrop } from "@/lib/advisor";
import crops from "@/data/crops.json";
import cap from "@/data/cap.json";

export function rankedForDemoFarm() {
  const calc = getCalculator().data;
  return rankOffers({
    offers: getOpportunities().data.offers,
    farm: getFarm().data,
    crops: crops.crops as Record<string, AdvisorCrop>,
    capEurHa: cap.schemes.find((s) => s.id === "coupled-protein")?.eurHa ?? 0,
    nitrogenEurHa: calc.nitrogenCreditKgHa * calc.nitrogenEurKg,
  });
}
