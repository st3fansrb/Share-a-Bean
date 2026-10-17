import { describe, expect, it } from "vitest";
import { average, marginPerHa, rotationMargins } from "./calc";

const wheat = { yieldTHa: 7, priceEurT: 200, costEurHa: 800, supportEurHa: 0 };
const faba = { yieldTHa: 4, priceEurT: 300, costEurHa: 200, supportEurHa: 100 };

describe("marginPerHa", () => {
  it("adds support and subtracts costs", () => {
    expect(marginPerHa(wheat)).toBe(600);
    expect(marginPerHa(faba)).toBe(1100);
  });
});

describe("rotationMargins", () => {
  it("gives the crop after a legume a nitrogen credit", () => {
    const years = [
      { crop: "wheat", legume: false, input: wheat },
      { crop: "faba", legume: true, input: faba },
      { crop: "wheat", legume: false, input: wheat },
    ];
    const out = rotationMargins(years, 30);
    expect(out.map((o) => o.nCredit)).toEqual([0, 0, 30]);
    expect(average(out.map((o) => o.margin))).toBeCloseTo((600 + 1100 + 630) / 3);
  });
});
