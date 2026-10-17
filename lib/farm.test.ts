import { describe, it, expect } from "vitest";
import { parseParcelCsv, cropFromText, coverage } from "@/lib/farm";
import { getFarm } from "@/lib/providers";

describe("parseParcelCsv", () => {
  it("reads English headers", () => {
    const r = parseParcelCsv("parcel_id,crop,area_ha\nA,wheat,12.5\nB,Faba bean,4");
    expect(r.errors).toEqual([]);
    expect(r.parcels).toEqual([{ id: "A", crop: "wheat", area: 12.5 }, { id: "B", crop: "faba", area: 4 }]);
  });
  it("reads French headers, semicolons and decimal commas", () => {
    const r = parseParcelCsv("num_ilot;culture;surface\n1;Blé tendre;9,5\n2;féverole;3,25");
    expect(r.errors).toEqual([]);
    expect(r.parcels.map((p) => [p.crop, p.area])).toEqual([["wheat", 9.5], ["faba", 3.25]]);
  });
  it("reports bad rows and keeps good ones", () => {
    const r = parseParcelCsv("id,crop,area\nA,wheat,5\nB,potato,3\nC,pea,-1\nA,pea,2");
    expect(r.parcels).toHaveLength(1);
    expect(r.errors).toHaveLength(3);
  });
  it("reports a missing column", () => {
    expect(parseParcelCsv("id,crop\nA,wheat").errors[0]).toMatch(/area/);
  });
});

describe("cropFromText", () => {
  it("is accent and case insensitive", () => expect(cropFromText(" COLZA ")).toBe("rapeseed"));
  it("returns null for unknown crops", () => expect(cropFromText("potato")).toBeNull());
});

describe("demo farm contracts", () => {
  const { parcels, contracts } = getFarm().data;
  it("refer to known offers and never over-deliver", async () => {
    const offers = (await import("@/data/offers.json")).default.offers.map((o) => o.id);
    for (const c of contracts) {
      expect(offers).toContain(c.offerId);
      expect(c.deliveredT).toBeLessThanOrEqual(c.committedT);
      expect(c.windowStart <= c.windowEnd).toBe(true);
    }
  });
  it("do not commit more than the parcels are expected to yield", async () => {
    const crops = (await import("@/data/crops.json")).default.crops;
    const y = Object.fromEntries(Object.entries(crops).map(([k, v]) => [k, v.yieldTHa]));
    for (const c of coverage(parcels, contracts, y, 2026)) expect(c.committedT).toBeLessThanOrEqual(c.expectedT);
  });
});
