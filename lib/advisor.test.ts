import { describe, it, expect } from "vitest";
import { rankedForDemoFarm } from "@/lib/advice";

describe("advisor", () => {
  const r = rankedForDemoFarm();
  it("ranks legume offers best margin gain first", () => {
    expect(r.length).toBeGreaterThan(0);
    for (let i = 1; i < r.length; i++) expect(r[i - 1].gainEurHa).toBeGreaterThanOrEqual(r[i].gainEurHa);
    expect(r[0].rank).toBe(1);
  });
  it("explains each offer in words", () => {
    for (const x of r) expect(x.reasons.length).toBeGreaterThan(0);
  });
});
