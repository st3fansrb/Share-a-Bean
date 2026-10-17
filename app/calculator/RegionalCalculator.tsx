"use client";
import { useEffect, useMemo, useState } from "react";
import { geoAzimuthalEqualArea, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import topoRaw from "@/data/eurostat/nuts2.topo.json";
import {
  CAP, CNAME, COMPS, CROPS, D, LEGS, calc, capOf, eur, fmt, initialState, legumeArea, nP, sgn, val,
  type CalcState, type CropKey, type Field,
} from "@/lib/regional-calc";

type Props = { id: string; n: string };
const topo = topoRaw as unknown as Topology;
const feats = (feature(topo, topo.objects.NUTS_RG_20M_2021_4326 as GeometryCollection<Props>) as unknown as GeoJSON.FeatureCollection<GeoJSON.Geometry, Props>).features;
const W = 800, H = 740;
const paths = (() => {
  const proj = geoAzimuthalEqualArea().rotate([-12, -52]).fitExtent([[8, 8], [W - 8, H - 8]], { type: "FeatureCollection", features: feats });
  const gp = geoPath(proj);
  return feats.map((f) => ({ id: f.properties.id, name: f.properties.n, d: gp(f) ?? "" }));
})();

// Diverging scale on the site palette: clay (legume loses) -> paper -> forest (legume wins).
const lerp = (a: number[], b: number[], t: number) => a.map((x, i) => Math.round(x + (b[i] - x) * t));
const ramp = (stops: number[][], t: number) => {
  const s = Math.min(stops.length - 1, Math.max(0, t) * (stops.length - 1)), i = Math.min(stops.length - 2, Math.floor(s));
  const c = lerp(stops[i], stops[i + 1], s - i);
  return `rgb(${c[0]},${c[1]},${c[2]})`;
};
const NEG = [[236, 230, 216], [214, 160, 130], [165, 72, 47], [96, 38, 25]];
const POS = [[236, 230, 216], [176, 205, 178], [74, 128, 92], [30, 74, 50], [16, 44, 29]];
const AREA = [[243, 227, 196], [222, 178, 104], [184, 118, 31], [110, 66, 12]];
const NO_DATA = "#e3dccb";

const STORE = "sab-region-calc";
const num = (v: string) => (v === "" ? undefined : +v);

export default function RegionalCalculator() {
  const [st, setSt] = useState<CalcState & { openA?: boolean }>(initialState);
  const [tip, setTip] = useState<{ x: number; y: number; id: string; name: string } | null>(null);
  useEffect(() => {
    try { const s = localStorage.getItem(STORE); if (s) setSt((o) => ({ ...o, ...JSON.parse(s) })); } catch {}
  }, []);
  const set = (patch: Partial<CalcState & { openA?: boolean }>) =>
    setSt((o) => { const n = { ...o, ...patch }; try { localStorage.setItem(STORE, JSON.stringify(n)); } catch {} return n; });

  const metricVals = useMemo(() => {
    const m: Record<string, number | null> = {};
    for (const p of paths) {
      if (st.metric === "area") m[p.id] = legumeArea(st, p.id);
      else if (D.regions[p.id]) { const r = calc(st, p.id, false); m[p.id] = st.metric === "adv" ? r.adv : r.y1; }
      else m[p.id] = null;
    }
    return m;
  }, [st.leg, st.comp, st.metric, st.ov, st.cap, st.capOv]); // eslint-disable-line react-hooks/exhaustive-deps

  const colour = (id: string) => {
    const v = metricVals[id];
    if (v == null) return NO_DATA;
    if (st.metric === "area") return v <= 0 ? NO_DATA : ramp(AREA, Math.min(1, Math.log10(v) / 5));
    const t = Math.max(-1, Math.min(1, v / 400));
    return t >= 0 ? ramp(POS, t) : ramp(NEG, -t);
  };
  const tipText = (id: string) => {
    const v = metricVals[id];
    if (st.metric === "area") return v == null ? "No area data" : `${CROPS[st.leg].label}: ${fmt(v)} ha`;
    return v == null ? "No data" : `${st.metric === "adv" ? "3-yr advantage" : "Year 1 advantage"} ${sgn(v)}/ha`;
  };

  const rid = st.region, region = D.regions[rid], cc = rid.slice(0, 2);
  const res = useMemo(() => calc(st, rid), [st, rid]);
  const L = CROPS[st.leg], C = CROPS[st.comp];
  const cap = res.cap, gaecOk = st.comp !== "wheat";
  const landLevel = !!region && Object.values(region.y).some((x) => x[2] === "R1");
  const win = res.adv >= 0;
  const maxPart = Math.max(50, ...res.parts.map((p) => Math.abs(p[1])));
  const selected = paths.find((p) => p.id === rid);

  const setField = (crop: string, f: string, raw: string) => {
    const k = `${crop}.${f}`, v = num(raw), regionBound = f === "y" || f === "p";
    const key = regionBound ? "rov" : "ov", next = { ...st[key] };
    if (v == null) delete next[k]; else next[k] = v;
    set({ [key]: next });
  };
  const cell = (crop: CropKey | "N", f: string, step: number) => {
    const v = crop === "N" ? nP(st, rid) : val(st, crop, f as Field, rid);
    return (
      <>
        <input className="rc-in num" type="number" step={step} value={Math.round(v.v * 100) / 100}
          onChange={(e) => setField(crop, f, e.target.value)} aria-label={`${crop} ${f}`} />
        <span className={`rc-src ${v.edited ? "edited" : ""}`}>{v.src}</span>
      </>
    );
  };
  const aRow = (lbl: string, f: Field, step: number, wheatToo = false) => (
    <tr key={f}>
      <td>{lbl}</td>
      <td className="r">{cell(st.leg, f, step)}</td>
      <td className="r">{cell(st.comp, f, step)}</td>
      <td className="r">{wheatToo ? (st.comp !== "wheat" ? cell("wheat", f, step) : <span className="muted">same as left</span>) : null}</td>
    </tr>
  );
  const capRow = (key: "biss" | "cg" | "eco", label: string, note: string, v: number, ovKey: "biss" | "cg" | "cf" | "eco" = key) => (
    <label className="rc-chk">
      <input type="checkbox" checked={st.cap[key]} onChange={(e) => set({ cap: { ...st.cap, [key]: e.target.checked } })} />
      <span className="grow">{label}<small>{note}</small></span>
      <input className="rc-in num" type="number" value={v} aria-label={`${label} rate`}
        onChange={(e) => set({ capOv: { ...st.capOv, [`${cc}.${ovKey}`]: +e.target.value } })} />
    </label>
  );
  const reset = () => set({ ov: {}, rov: {}, capOv: {}, cap: initialState.cap });
  const pick = (id: string) => { if (D.regions[id]) set({ region: id, rov: {} }); };

  return (
    <div className="rc">
      <div className="rc-controls card">
        <div>
          <label htmlFor="rc-leg">Legume</label>
          <select id="rc-leg" value={st.leg} onChange={(e) => set({ leg: e.target.value as CropKey })}>
            {LEGS.map((k) => <option key={k} value={k}>{CROPS[k].label}</option>)}
          </select>
        </div>
        <div>
          <label>Compared with</label>
          <div className="seg" role="radiogroup" aria-label="Compared with">
            {COMPS.map((k) => (
              <button key={k} role="radio" aria-checked={st.comp === k} className={st.comp === k ? "on" : ""} onClick={() => set({ comp: k })}>{CROPS[k].label}</button>
            ))}
          </div>
        </div>
        <div>
          <label>Map shows</label>
          <div className="seg" role="radiogroup" aria-label="Map shows">
            {([["adv", "3-yr advantage"], ["y1", "Year 1 only"], ["area", "Legume area"]] as const).map(([k, t]) => (
              <button key={k} role="radio" aria-checked={st.metric === k} className={st.metric === k ? "on" : ""} onClick={() => set({ metric: k })}>{t}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="rc-grid">
        <div className="card rc-map" onMouseLeave={() => setTip(null)}>
          <p className="note rc-hint">Click a region. Colour is the gross-margin advantage of the legume over three years, with the defaults and your edits.</p>
          <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="EU NUTS 2 regions coloured by legume margin advantage">
            {paths.filter((p) => p.id !== rid).map((p) => (
              <path key={p.id} d={p.d} className="reg" fill={colour(p.id)}
                onClick={() => pick(p.id)}
                onMouseMove={(e) => { const b = e.currentTarget.ownerSVGElement!.getBoundingClientRect(); setTip({ x: e.clientX - b.left, y: e.clientY - b.top, id: p.id, name: p.name }); }} />
            ))}
            {selected && <path d={selected.d} className="reg sel" fill={colour(rid)} />}
          </svg>
          {tip && <div className="rc-tip" style={{ left: Math.min(tip.x + 14, 420), top: tip.y + 14 }}><b>{tip.name}</b> · {tip.id}<br />{tipText(tip.id)}</div>}
          <div className="rc-legend">
            {st.metric === "area" ? (
              <><b>{L.label} area, latest year (ha)</b><div><span>10</span><i className="bar-area" /><span>100,000</span></div></>
            ) : (
              <><b>Legume advantage, €/ha{st.metric === "adv" ? " over 3 years" : ", year 1"}</b><div><span>−400</span><i className="bar-div" /><span>+400</span></div></>
            )}
          </div>
        </div>

        <div className="rc-panel">
          <section className="card rc-sec">
            <p className="eyebrow">{CNAME[cc] || cc} · {rid}{landLevel ? " · yields at Land level" : ""}</p>
            <h2>{region ? region.n : rid}</h2>
            <div className="rc-kpis">
              <div>
                <small>{L.label} instead of {C.label.toLowerCase()}, 3-year gross margin</small>
                <div className={`big ${win ? "pos" : "neg"}`}>{sgn(res.adv)}<span> /ha</span></div>
              </div>
              <div>
                <small>Year 1 only, incl. CAP</small>
                <div className="big sm">{sgn(res.y1)}<span> /ha</span></div>
                <small>Rotation effects in years 2–3 add {sgn(res.adv - res.y1)}</small>
              </div>
            </div>
          </section>

          <section className="card rc-sec">
            <p className="eyebrow">Where the difference comes from</p>
            {res.parts.map(([lbl, v]) => (
              <div key={lbl} className="rc-part">
                <span>{lbl}</span>
                <span className="track"><i className="axis" /><i className={v >= 0 ? "up" : "down"} style={{ width: `${(Math.abs(v) / maxPart) * 50}%` }} /></span>
                <span className="num v">{sgn(v)}</span>
              </div>
            ))}
            <div className="rc-total"><span>Total advantage</span><span className={`num ${win ? "pos" : "neg"}`}>{sgn(res.adv)}/ha</span></div>
          </section>

          <section className="card rc-sec">
            <p className="eyebrow">Rotation view · gross margin €/ha incl. CAP</p>
            <table>
              <thead><tr><th>Sequence</th><th className="r">Year 1</th><th className="r">Year 2</th><th className="r">Year 3</th><th className="r">Total</th></tr></thead>
              <tbody>
                {([[`${L.label} → wheat → wheat`, res.lg, win], [`${C.label} → wheat → wheat`, res.cg, !win]] as const).map(([lbl, a, strong]) => (
                  <tr key={lbl} className={strong ? "strong" : ""}>
                    <td>{lbl}</td>{a.map((x, i) => <td key={i} className="r num">{eur(x)}</td>)}<td className="r num">{eur(a[0] + a[1] + a[2])}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="rc-trio">
              <div><small>Wheat yield after {L.label.toLowerCase()}</small><b className="num">{fmt(res.l2.y, 2)} t</b><small className="num">vs {fmt(res.c2.y, 2)} t after {C.label.toLowerCase()}</small></div>
              <div><small>Fertiliser N in year 2</small><b className="num">{fmt(res.l2.n)} kg</b><small className="num">vs {fmt(res.c2.n)} kg · {fmt(res.c2.n - res.l2.n)} kg saved</small></div>
              <div><small>N price</small><b className="num">€{fmt(res.pn, 2)}/kg</b><small>{nP(st, rid).src}</small></div>
            </div>
          </section>

          <section className="card rc-sec">
            <p className="eyebrow">CAP payments · {CNAME[cc] || cc} · indicative 2023–27 rates</p>
            {capRow("biss", "Basic income support (BISS)", "Paid on both crops, so it does not change the difference.", cap.biss)}
            {capRow("cg", "Coupled income support, protein crops", L.forage ? "Forage-legume rate applies." : "Grain-legume rate applies.", L.forage ? cap.cf : cap.cg, L.forage ? "cf" : "cg")}
            {capRow("eco", "Eco-scheme (legume / crop diversification)", "Per hectare of legume.", cap.eco)}
            <label className="rc-chk">
              <input type="checkbox" checked={st.cap.aecm} onChange={(e) => set({ cap: { ...st.cap, aecm: e.target.checked } })} />
              <span className="grow">Agri-environment (Pillar II)<small>Regional measures vary; enter your contracted rate.</small></span>
              <input className="rc-in num" type="number" value={st.cap.aecmVal || 0} aria-label="Agri-environment rate"
                onChange={(e) => set({ cap: { ...st.cap, aecmVal: +e.target.value } })} />
            </label>
            <div className="rc-gaec">
              <span className={`chip ${gaecOk ? "" : "legume"}`}>GAEC 7</span>
              <span>
                {gaecOk
                  ? `Crop rotation condition: ${L.label.toLowerCase()} → wheat and ${C.label.toLowerCase()} → wheat both change crop each year.`
                  : "Wheat → wheat repeats the same crop. Check your national GAEC 7 rules; the legume sequence complies."}
                {" "}GAEC 7 is a condition for receiving payments, not a payment.
              </span>
            </div>
            <p className="note">Payment rates are not published by Eurostat. Defaults are approximate planned unit amounts from national CAP Strategic Plans; edit them to match your paying agency.</p>
          </section>

          <details className="card rc-sec" open={!!st.openA} onToggle={(e) => { const o = (e.currentTarget as HTMLDetailsElement).open; if (o !== !!st.openA) set({ openA: o }); }}>
            <summary><span className="eyebrow">Assumptions · all editable</span></summary>
            <div className="rc-scroll">
              <table className="rc-assump">
                <thead><tr><th>Per hectare</th><th className="r">{L.label}</th><th className="r">{C.label}</th><th className="r">Wheat (yr 2–3)</th></tr></thead>
                <tbody>
                  {aRow("Yield, t", "y", 0.01, true)}{aRow("Price, €/t", "p", 1, true)}{aRow("Mineral N, kg", "n", 1, true)}{aRow("Other variable costs, €", "cost", 5, true)}
                  <tr><td colSpan={4} className="eyebrow sub">Effect on following wheat</td></tr>
                  {aRow("Yield change, %", "eff", 1)}{aRow("N credit, kg", "credit", 1)}{aRow("Pest/disease saving, €", "pest", 1)}{aRow("Year-3 residual yield, %", "resid", 1)}
                  <tr><td>N fertiliser price, €/kg N</td><td className="r" colSpan={3}>{cell("N", "p", 0.01)}</td></tr>
                </tbody>
              </table>
            </div>
            <button className="btn ghost" onClick={reset}>Reset to Eurostat &amp; defaults</button>
            <p className="note">Yields: Eurostat apro_cpshr, production ÷ area, 3 most recent years (NUTS 2; German data at Land level). Lentil and chickpea share the “other dry pulses” yield. Prices: apri_ap_crpouta, national 3-year average, EU median where a country does not report. Lupin uses the pea price. Alfalfa is valued as hay. Costs and agronomic effects are indicative defaults, not statistics.</p>
          </details>
        </div>
      </div>
    </div>
  );
}
