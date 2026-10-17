import { describe, it, expect } from "vitest";
import {
  getKnowledge, getCalculator, getCap, getInsights, getOpportunities, getFarm,
} from "@/lib/providers";

const all = { getKnowledge, getCalculator, getCap, getInsights, getOpportunities, getFarm };

describe("every provider returns an envelope", () => {
  for (const [name, fn] of Object.entries(all)) {
    it(name, () => {
      const r = fn();
      expect(["placeholder", "synthetic", "derived", "sourced"]).toContain(r.meta.provenance);
      if (r.meta.provenance === "derived" || r.meta.provenance === "sourced") expect(r.meta.source).toBeTruthy();
    });
  }
});

describe("mock data respects the contracts", () => {
  it("offers have ordered ranges and known crops", () => {
    const crops = getCalculator().data.crops.map((c) => c.id);
    for (const o of getOpportunities().data.offers) {
      expect(o.volumeT[0]).toBeLessThanOrEqual(o.volumeT[1]);
      expect(o.priceEurT[0]).toBeLessThanOrEqual(o.priceEurT[1]);
      expect(crops).toContain(o.crop);
    }
  });
  it("parcels use known crops", () => {
    const crops = getCalculator().data.crops.map((c) => c.id);
    for (const p of getFarm().data.parcels) expect(crops).toContain(p.crop);
  });
  it("calculator support only on legumes", () => {
    const { crops, supportEurHaByCrop } = getCalculator().data;
    for (const id of Object.keys(supportEurHaByCrop)) expect(crops.find((c) => c.id === id)?.legume).toBe(true);
  });
});
