// Regional legume vs conventional crop margin model (EU NUTS 2). Pure functions;
// the UI keeps the overrides. Data: Eurostat snapshot in data/eurostat/legume.json.
import raw from "@/data/eurostat/legume.json";

type YieldRow = [number, string, string?];
type Region = { n: string; c: string; y: Record<string, YieldRow>; a: Record<string, [number, string]> };
export type EurostatData = {
  updated: string;
  regions: Record<string, Region>;
  nat: Record<string, Record<string, [number, string]>>;
  prices: Record<string, Record<string, [number, string]>>;
  euMed: Record<string, [number, number]>;
  nprice: Record<string, [number, string]>;
};
export const D = raw as unknown as EurostatData;

export type CropKey =
  | "pea" | "faba" | "soy" | "lupin" | "lentil" | "chickpea" | "alfalfa"
  | "wheat" | "barley" | "maize" | "rapeseed" | "sunflower";
export type Crop = {
  label: string; code: string; leg: boolean; n: number; cost: number;
  eff: number; credit: number; pest: number; resid: number;
  pricePx?: CropKey; forage?: boolean; yDef?: number; pDef?: number;
};

export const CROPS: Record<CropKey, Crop> = {
  pea: { label: "Field pea", code: "P1100", leg: true, n: 0, cost: 400, eff: 12, credit: 30, pest: 25, resid: 3 },
  faba: { label: "Faba bean", code: "P1200", leg: true, n: 0, cost: 420, eff: 15, credit: 40, pest: 25, resid: 3 },
  soy: { label: "Soybean", code: "I1130", leg: true, n: 0, cost: 480, eff: 8, credit: 20, pest: 20, resid: 2 },
  lupin: { label: "Lupin", code: "P1300", leg: true, n: 0, cost: 380, eff: 12, credit: 30, pest: 25, resid: 3, pricePx: "pea" },
  lentil: { label: "Lentil", code: "P9000", leg: true, n: 0, cost: 380, eff: 8, credit: 20, pest: 20, resid: 2 },
  chickpea: { label: "Chickpea", code: "P9000", leg: true, n: 0, cost: 400, eff: 8, credit: 20, pest: 20, resid: 2 },
  alfalfa: { label: "Alfalfa / clover", code: "G2100", leg: true, n: 0, cost: 350, eff: 15, credit: 60, pest: 35, resid: 5, forage: true, yDef: 9, pDef: 180 },
  wheat: { label: "Winter wheat", code: "C1111", leg: false, n: 170, cost: 480, eff: -8, credit: 0, pest: 0, resid: 0 },
  barley: { label: "Barley", code: "C1300", leg: false, n: 120, cost: 430, eff: -5, credit: 0, pest: 0, resid: 0 },
  maize: { label: "Maize (grain)", code: "C1500", leg: false, n: 160, cost: 700, eff: -3, credit: 0, pest: 0, resid: 0 },
  rapeseed: { label: "Rapeseed", code: "I1110", leg: false, n: 170, cost: 560, eff: 6, credit: 10, pest: 15, resid: 0 },
  sunflower: { label: "Sunflower", code: "I1120", leg: false, n: 50, cost: 420, eff: 3, credit: 0, pest: 15, resid: 0 },
};
export const LEGS: CropKey[] = ["pea", "faba", "soy", "lupin", "lentil", "chickpea", "alfalfa"];
export const COMPS: CropKey[] = ["wheat", "barley", "maize", "rapeseed", "sunflower"];

type CapRates = { biss: number; cg: number; cf: number; eco: number };
// Indicative CAP Strategic Plan 2023-27 unit amounts, EUR/ha. Verify with the national paying agency.
export const CAP: Record<string, CapRates> = {
  AT: { biss: 210, cg: 0, cf: 0, eco: 0 }, BE: { biss: 160, cg: 100, cf: 100, eco: 50 }, BG: { biss: 107, cg: 140, cf: 90, eco: 40 },
  CY: { biss: 147, cg: 0, cf: 0, eco: 0 }, CZ: { biss: 150, cg: 150, cf: 0, eco: 0 }, DE: { biss: 156, cg: 0, cf: 0, eco: 45 },
  DK: { biss: 197, cg: 0, cf: 0, eco: 0 }, EE: { biss: 117, cg: 60, cf: 0, eco: 0 }, EL: { biss: 135, cg: 140, cf: 0, eco: 0 },
  ES: { biss: 140, cg: 50, cf: 50, eco: 50 }, FI: { biss: 117, cg: 100, cf: 0, eco: 0 }, FR: { biss: 128, cg: 105, cf: 150, eco: 60 },
  HR: { biss: 133, cg: 130, cf: 100, eco: 30 }, HU: { biss: 140, cg: 140, cf: 80, eco: 40 }, IE: { biss: 175, cg: 350, cf: 0, eco: 0 },
  IT: { biss: 165, cg: 70, cf: 0, eco: 0 }, LT: { biss: 100, cg: 120, cf: 0, eco: 50 }, LU: { biss: 150, cg: 0, cf: 0, eco: 0 },
  LV: { biss: 95, cg: 100, cf: 0, eco: 30 }, MT: { biss: 200, cg: 0, cf: 0, eco: 0 }, NL: { biss: 210, cg: 0, cf: 0, eco: 0 },
  PL: { biss: 113, cg: 140, cf: 100, eco: 60 }, PT: { biss: 105, cg: 0, cf: 0, eco: 0 }, RO: { biss: 106, cg: 120, cf: 80, eco: 0 },
  SE: { biss: 125, cg: 0, cf: 0, eco: 0 }, SI: { biss: 215, cg: 100, cf: 0, eco: 0 }, SK: { biss: 100, cg: 120, cf: 0, eco: 0 },
};
export const CNAME: Record<string, string> = {
  AT: "Austria", BE: "Belgium", BG: "Bulgaria", CY: "Cyprus", CZ: "Czechia", DE: "Germany", DK: "Denmark", EE: "Estonia",
  EL: "Greece", ES: "Spain", FI: "Finland", FR: "France", HR: "Croatia", HU: "Hungary", IE: "Ireland", IT: "Italy",
  LT: "Lithuania", LU: "Luxembourg", LV: "Latvia", MT: "Malta", NL: "Netherlands", PL: "Poland", PT: "Portugal",
  RO: "Romania", SE: "Sweden", SI: "Slovenia", SK: "Slovakia",
};

export type CalcState = {
  leg: CropKey; comp: CropKey; region: string; metric: "adv" | "y1" | "area";
  ov: Record<string, number>;   // agronomic overrides, kept across regions
  rov: Record<string, number>;  // region-bound overrides (yield, price, N price), cleared on region change
  cap: { biss: boolean; cg: boolean; eco: boolean; aecm: boolean; aecmVal: number };
  capOv: Record<string, number>;
};
export const initialState: CalcState = {
  leg: "faba", comp: "wheat", region: "FRB0", metric: "adv", ov: {}, rov: {},
  cap: { biss: true, cg: true, eco: true, aecm: false, aecmVal: 0 }, capOv: {},
};

export type Sourced = { v: number; src: string; edited?: boolean; def?: number };

function yieldOf(crop: CropKey, rid: string): Sourced {
  const c = CROPS[crop], r = D.regions[rid], cc = rid.slice(0, 2);
  if (c.forage) {
    const n = D.nat[cc]?.G2100;
    if (n && n[0] >= 4 && n[0] <= 18) return { v: n[0], src: `Eurostat · national ${n[1]}` };
    return { v: c.yDef ?? 2, src: "Default (hay, DM)" };
  }
  const row = r?.y[c.code];
  if (row) return { v: row[0], src: `Eurostat · ${row[2] === "R1" ? "state " : "NUTS2 "}${row[1]}` };
  const n = D.nat[cc]?.[c.code];
  if (n) return { v: n[0], src: `Eurostat · national ${n[1]}` };
  const e = D.nat.EU?.[c.code];
  if (e) return { v: e[0], src: `Eurostat · EU ${e[1]}` };
  return { v: 2, src: "Default" };
}
function priceOf(crop: CropKey, rid: string): Sourced {
  const c = CROPS[crop], cc = rid.slice(0, 2), key = c.pricePx || crop;
  const p = D.prices[cc]?.[key];
  const px = c.pricePx ? " (pea proxy)" : "";
  if (p) { const ys = p[1].split(","); return { v: p[0], src: `Eurostat · ${cc} ${ys[0]}–${ys[ys.length - 1]}${px}` }; }
  const e = D.euMed[key];
  if (e && e[0]) return { v: e[0], src: `Eurostat · EU median (${e[1]} MS)${px}` };
  return { v: c.pDef || 300, src: "Default" };
}
function nPrice(rid: string): Sourced {
  const cc = rid.slice(0, 2), p = D.nprice[cc];
  if (p) { const ys = p[1].split(","); return { v: p[0], src: `Eurostat · ${cc} ${ys[0]}–${ys[ys.length - 1]}` }; }
  return { v: D.nprice.EU[0], src: "Eurostat · EU median" };
}

export type Field = "y" | "p" | "n" | "cost" | "eff" | "credit" | "pest" | "resid";
export function val(st: CalcState, crop: CropKey, f: Field, rid: string, useRov = true): Sourced {
  const regionBound = f === "y" || f === "p";
  const k = `${crop}.${f}`;
  const base: Sourced = f === "y" ? yieldOf(crop, rid) : f === "p" ? priceOf(crop, rid) : { v: CROPS[crop][f], src: "Default" };
  const o = regionBound ? (useRov ? st.rov[k] : undefined) : st.ov[k];
  return o != null ? { v: o, src: "Edited", edited: true, def: base.v } : base;
}
export function nP(st: CalcState, rid: string, useRov = true): Sourced {
  const b = nPrice(rid), o = useRov ? st.rov["N.p"] : undefined;
  return o != null ? { v: o, src: "Edited", edited: true } : b;
}
export function capOf(st: CalcState, rid: string): CapRates {
  const cc = rid.slice(0, 2), b = CAP[cc] || { biss: 0, cg: 0, cf: 0, eco: 0 };
  const r = { ...b };
  (Object.keys(b) as (keyof CapRates)[]).forEach((k) => { const o = st.capOv[`${cc}.${k}`]; if (o != null) r[k] = o; });
  return r;
}

export function calc(st: CalcState, rid: string, useRov = true) {
  const L = st.leg, C = st.comp, W: CropKey = "wheat";
  const g = (c: CropKey, f: Field) => val(st, c, f, rid, useRov).v;
  const pn = nP(st, rid, useRov).v, cap = capOf(st, rid);
  const biss = st.cap.biss ? cap.biss : 0;
  const legSup = (st.cap.cg ? (CROPS[L].forage ? cap.cf : cap.cg) : 0) + (st.cap.eco ? cap.eco : 0) + (st.cap.aecm ? +st.cap.aecmVal || 0 : 0);
  const yr1 = (c: CropKey) => { const rev = g(c, "y") * g(c, "p"), nc = g(c, "n") * pn, vc = g(c, "cost"); return { rev, nc, vc, mkt: rev - nc - vc, cap: 0 }; };
  const yW = g(W, "y"), pW = g(W, "p"), nW = g(W, "n"), cW = g(W, "cost");
  const yr2 = (c: CropKey) => { const y = yW * (1 + g(c, "eff") / 100), n = Math.max(0, nW - g(c, "credit")); const rev = y * pW, nc = n * pn, vc = cW - g(c, "pest"); return { y, n, rev, nc, vc, mkt: rev - nc - vc }; };
  const yr3 = (c: CropKey) => { const y = yW * (1 + g(c, "resid") / 100); const rev = y * pW; return { y, rev, mkt: rev - nW * pn - cW }; };
  const l1 = yr1(L), c1 = yr1(C), l2 = yr2(L), c2 = yr2(C), l3 = yr3(L), c3 = yr3(C);
  l1.cap = biss + legSup; c1.cap = biss;
  const gm = (a: { mkt: number; cap: number }, b: { mkt: number }, c: { mkt: number }) => [a.mkt + a.cap, b.mkt + biss, c.mkt + biss];
  const lg = gm(l1, l2, l3), cg = gm(c1, c2, c3);
  const parts: [string, number][] = [
    ["Year 1 market margin", l1.mkt - c1.mkt],
    ["Year 1 CAP support", legSup],
    ["Year 2 wheat yield effect", ((g(L, "eff") - g(C, "eff")) / 100) * yW * pW],
    ["Year 2 nitrogen saved", (Math.min(nW, g(L, "credit")) - Math.min(nW, g(C, "credit"))) * pn],
    ["Year 2 pest & disease break", g(L, "pest") - g(C, "pest")],
    ["Year 3 residual yield", ((g(L, "resid") - g(C, "resid")) / 100) * yW * pW],
  ];
  const adv = parts.reduce((s, p) => s + p[1], 0);
  return { l1, c1, l2, c2, l3, c3, lg, cg, parts, adv, y1: lg[0] - cg[0], pn, cap, legSup, biss, yW, pW, nW };
}

export function legumeArea(st: CalcState, id: string): number | null {
  const r = D.regions[id];
  return r?.a[CROPS[st.leg].code]?.[0] ?? null;
}

export const fmt = (v: number | null, d = 0) =>
  v == null || isNaN(v) ? "—" : v.toLocaleString("en-GB", { minimumFractionDigits: d, maximumFractionDigits: d });
export const eur = (v: number) => (v < 0 ? "−€" : "€") + fmt(Math.abs(v));
export const sgn = (v: number) => (v > 0 ? "+" : v < 0 ? "−" : "") + "€" + fmt(Math.abs(v));
