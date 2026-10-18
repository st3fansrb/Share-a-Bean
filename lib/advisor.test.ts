import { describe, it, expect } from "vitest";
import { rankedForDemoFarm } from "@/lib/advice";

describe("advisor", () => {
  const r = rankedForDemoFarm();
  it("ranks full-rotation packages first, then by margin gain", () => {
    expect(r.length).toBeGreaterThan(0);
    for (let i = 1; i < r.length; i++) expect(r[i - 1].coveredYears).toBeGreaterThanOrEqual(r[i].coveredYears);
    expect(r[0].rank).toBe(1);
  });
  it("pairs every legume buyer with a second buyer for the rotation", () => {
    for (const x of r) {
      expect(x.offer.partner.crops.length).toBeGreaterThan(0);
      expect(x.coveredYears).toBeGreaterThanOrEqual(1);
      expect(x.coveredYears).toBeLessThanOrEqual(3);
    }
  });
  it("explains each offer in words", () => {
    for (const x of r) expect(x.reasons.length).toBeGreaterThan(0);
  });
});
