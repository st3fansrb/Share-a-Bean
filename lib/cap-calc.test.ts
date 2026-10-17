import { describe, it, expect } from "vitest";
import { capBenefit, ecoLevel } from "@/lib/cap-calc";
import { getCap } from "@/lib/providers";

const { ecoScheme: e } = getCap().data;

describe("capBenefit", () => {
  it("levels", () => {
    expect(ecoLevel(3, e)).toBeNull();
    expect(ecoLevel(4, e)).toBe("base");
    expect(ecoLevel(5, e)).toBe("higher");
  });
  it("10% legumes lifts 3 points to higher level on all hectares", () => {
    const r = capBenefit({ areaHa: 100, legumeHa: 10, pointsNow: 3 }, e, 100);
    expect(r.legumePts).toBe(3);
    expect(r.after).toBe("higher");
    expect(r.ecoGain).toBeCloseTo(62.05 * 100);
    expect(r.coupled).toBe(1000);
  });
  it("no legumes, no benefit", () => {
    expect(capBenefit({ areaHa: 100, legumeHa: 0, pointsNow: 3 }, e, 100).total).toBe(0);
  });
  it("legume area cannot exceed farm area", () => {
    expect(capBenefit({ areaHa: 10, legumeHa: 50, pointsNow: 0 }, e, 100).coupled).toBe(1000);
  });
});
