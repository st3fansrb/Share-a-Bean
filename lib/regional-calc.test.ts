import { describe, expect, it } from "vitest";
import { calc, initialState, sgn } from "./regional-calc";

describe("regional calculator", () => {
  it("faba bean vs wheat in Centre-Val de Loire matches the design (+395 over 3 years, -125 in year 1)", () => {
    const r = calc(initialState, "FRB0");
    expect(Math.round(r.adv)).toBe(395);
    expect(Math.round(r.y1)).toBe(-125);
  });
  it("parts sum to the total advantage", () => {
    const r = calc({ ...initialState, leg: "soy", comp: "maize" }, "ES51");
    expect(r.parts.reduce((s, p) => s + p[1], 0)).toBeCloseTo(r.adv);
  });
  it("turning off CAP support removes the year-1 CAP line", () => {
    const r = calc({ ...initialState, cap: { ...initialState.cap, cg: false, eco: false } }, "FRB0");
    expect(r.parts[1][1]).toBe(0);
  });
  it("formats signed euros", () => expect(sgn(-125)).toBe("−€125"));
});
