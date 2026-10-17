// Rule-based offer ranking for the demo farm. Pure arithmetic on the same
// placeholder numbers the calculator uses; the AI layer only words the result.
import { marginPerHa, average } from "@/lib/calc";
import type { Offer } from "@/lib/contracts";

export type AdvisorCrop = { label: string; legume: boolean; yieldTHa: number; priceEurT: number; costEurHa: number };
export type AdvisorFarm = { parcels: { crop: string; area: number }[] };
export type AdvisorInput = {
  offers: Offer[];
  farm: AdvisorFarm;
  crops: Record<string, AdvisorCrop>;
  /** CAP coupled support for protein crops, €/ha. */
  capEurHa: number;
  nitrogenEurHa: number;
};

export type RankedOffer = {
  offer: Offer;
  rank: number;
  /** Net price after a rough haulage cost, €/t. */
  netPriceEurT: number;
  marginEurHa: number;
  /** Gain per ha against what the farm's current crops earn on average. */
  gainEurHa: number;
  reasons: string[];
  cautions: string[];
};

// Rough road haulage, €/t per km. An assumption, shown as such.
export const HAUL_EUR_T_KM = 0.12;
// Share of the farm we suggest putting into a first legume crop.
export const LEGUME_SHARE = 0.25;

const contractNote: Record<Offer["contract"], string> = {
  Spot: "sold at today's price, no commitment",
  Forward: "price fixed ahead, so you know your income early",
  Cooperative: "pooled with neighbours, easier for a small farm",
  Framework: "a standing agreement, price set per delivery",
  "Fixed or formula": "price fixed or tied to a formula",
};

export function currentMargin(farm: AdvisorFarm, crops: Record<string, AdvisorCrop>): number {
  const total = farm.parcels.reduce((s, p) => s + p.area, 0);
  if (!total) return 0;
  return farm.parcels.reduce((s, p) => {
    const c = crops[p.crop];
    if (!c) return s;
    return s + (p.area / total) * marginPerHa({ ...c, supportEurHa: 0 });
  }, 0);
}

export function rankOffers(inp: AdvisorInput): RankedOffer[] {
  const now = currentMargin(inp.farm, inp.crops);
  const farmHa = inp.farm.parcels.reduce((s, p) => s + p.area, 0);
  const legumeHa = Math.round(farmHa * LEGUME_SHARE * 10) / 10;
  const scored = inp.offers
    .filter((o) => inp.crops[o.crop]?.legume)
    .map((o) => {
      const c = inp.crops[o.crop];
      const mid = average(o.priceEurT);
      const net = mid - HAUL_EUR_T_KM * o.distanceKm;
      const margin = marginPerHa({ ...c, priceEurT: net, supportEurHa: inp.capEurHa }) + inp.nitrogenEurHa;
      const gain = margin - now;
      const tonnes = Math.round(legumeHa * c.yieldTHa);
      const reasons = [
        `${c.label} at about ${Math.round(net)} €/t after transport earns roughly ${Math.round(margin)} €/ha, with CAP support and the nitrogen left for the next crop.`,
        `${o.distanceKm} km away; ${contractNote[o.contract]}.`,
      ];
      const cautions: string[] = [];
      if (tonnes < o.volumeT[0]) {
        cautions.push(`Your ${legumeHa} ha would give about ${tonnes} t; this buyer wants ${o.volumeT[0]} t or more, so pool with neighbours or a cooperative.`);
      }
      if (o.contract === "Spot") cautions.push("Spot means no price guarantee before harvest.");
      return { offer: o, netPriceEurT: net, marginEurHa: margin, gainEurHa: gain, reasons, cautions };
    })
    .sort((a, b) => b.gainEurHa - a.gainEurHa);
  return scored.map((s, i) => ({ ...s, rank: i + 1 }));
}
