import type { EcoScheme } from "@/lib/contracts";

export type EcoLevel = "higher" | "base" | null;

export const ecoLevel = (pts: number, e: EcoScheme): EcoLevel =>
  pts >= e.higherPts ? "higher" : pts >= e.basePts ? "base" : null;

const rate = (l: EcoLevel, e: EcoScheme) => (l === "higher" ? e.higherEurHa : l === "base" ? e.baseEurHa : 0);

/** Extra CAP money a legume plan brings: coupled support on legume ha, plus any eco-scheme level gained on all ha. */
export function capBenefit(
  input: { areaHa: number; legumeHa: number; pointsNow: number },
  e: EcoScheme,
  coupledEurHa: number,
) {
  const area = Math.max(0, input.areaHa);
  const leg = Math.min(Math.max(0, input.legumeHa), area);
  const share = area ? leg / area : 0;
  const legumePts = share >= 0.1 ? e.legumePtsAt10Pct : share >= 0.05 || leg > 5 ? e.legumePtsAt5Pct : 0;
  const pointsAfter = input.pointsNow + legumePts;
  const before = ecoLevel(input.pointsNow, e);
  const after = ecoLevel(pointsAfter, e);
  const ecoGain = (rate(after, e) - rate(before, e)) * area;
  const coupled = leg * coupledEurHa;
  const total = ecoGain + coupled;
  return { share, legumePts, pointsAfter, before, after, ecoGain, coupled, total, perLegumeHa: leg ? total / leg : 0 };
}
