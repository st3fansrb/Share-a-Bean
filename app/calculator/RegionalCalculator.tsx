"use client";
import { useEffect, useMemo, useState } from "react";
import { geoAzimuthalEqualArea, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import topoRaw from "@/data/eurostat/nuts2.topo.json";
import Link from "next/link";
import { ZoomableSvg, type View } from "@/components/ZoomableSvg";
import { useParcels } from "@/lib/useParcels";
import { cropLabel } from "@/lib/data";
import {
  CAP, CNAME, COMPS, CROPS, D, LEGS, calc, eur, fmt, initialState, legumeArea, nP, sgn,
  type CalcState, type CropKey,
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

// Framing that makes metropolitan France fill the map (overseas regions left out).
const FRANCE_VIEW: View = (() => {
  const proj = geoAzimuthalEqualArea().rotate([-12, -52]).fitExtent([[8, 8], [W - 8, H - 8]], { type: "FeatureCollection", features: feats });
  const gp = geoPath(proj);
  const fr = feats.filter((f) => /^FR[^Y]/.test(f.properties.id));
  const xs: number[] = [], ys: number[] = [];
  for (const f of fr) { const [[x0, y0], [x1, y1]] = gp.bounds(f); xs.push(x0, x1); ys.push(y0, y1); }
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  const k = Math.min((W - 40) / (x1 - x0), (H - 40) / (y1 - y0));
  return { k, x: W / 2 - k * (x0 + x1) / 2, y: H / 2 - k * (y0 + y1) / 2 };
})();
const EU_VIEW: View = { k: 1, x: 0, y: 0 };

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

export type Prefill = { crop: CropKey; price?: number; region?: string; label: string; offerId?: string };

export default function RegionalCalculator({ prefill }: { prefill?: Prefill }) {
  const [st, setSt] = useState<CalcState & { openA?: boolean }>(initialState);
  const [offer, setOffer] = useState(prefill);
  const [scope, setScope] = useState<"FR" | "EU">("FR");
  const { parcels: farmParcels } = useParcels();
  const [selectedParcelId, setSelectedParcelId] = useState<string>("B");
  const [tip, setTip] = useState<{ x: number; y: number; id: string; name: string } | null>(null);

  const selectedParcel = farmParcels.find((p) => p.id === selectedParcelId) ?? farmParcels[0];

  useEffect(() => {
    let saved: Partial<CalcState> = {};
    try { const s = localStorage.getItem(STORE); if (s) saved = JSON.parse(s); } catch {}
    // A link from an offer wins over the remembered state: show exactly that crop, region and price.
    setSt((o) => {
      const base = { ...o, ...saved };
      if (!prefill) return base;
      return {
        ...base, leg: prefill.crop, region: prefill.region ?? base.region, metric: "adv",
        rov: prefill.price != null ? { [`${prefill.crop}.p`]: prefill.price } : {},
      };
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
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
    if (scope === "FR" && !id.startsWith("FR")) return "#ece8df";
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
  const cap = res.cap;
  const landLevel = !!region && Object.values(region.y).some((x) => x[2] === "R1");
  const win = res.adv >= 0;
  const maxPart = Math.max(50, ...res.parts.map((p) => Math.abs(p[1])));
  const selected = paths.find((p) => p.id === rid);

  const pick = (id: string) => { if (D.regions[id]) { setOffer(undefined); set({ region: id, rov: {} }); } };

  return (
    <div className="rc">
      {offer && (
        <div className="rc-offer">
          <span className="chip legume">From an offer</span>
          <span><b>{offer.label}</b>: {CROPS[offer.crop].label}{offer.price != null ? ` at €${offer.price}/t` : ""}. About <b>{sgn(res.adv)}/ha</b> over 3 years.</span>
          <Link href={`/share?offer=${offer.offerId ?? "o1"}`} className="btn">Share fields →</Link>
          <button className="btn ghost" onClick={() => setOffer(undefined)}>Dismiss</button>
        </div>
      )}
      <div className="rc-controls card">
        <div>
          <label htmlFor="rc-leg">Legume</label>
          <select id="rc-leg" value={st.leg} onChange={(e) => set({ leg: e.target.value as CropKey })}>
            {LEGS.map((k) => <option key={k} value={k}>{CROPS[k].label}</option>)}
          </select>
        </div>
        <div>
          <label>Instead of</label>
          <div className="seg" role="radiogroup" aria-label="Compared with">
            {COMPS.map((k) => (
              <button key={k} role="radio" aria-checked={st.comp === k} className={st.comp === k ? "on" : ""} onClick={() => set({ comp: k })}>{CROPS[k].label}</button>
            ))}
          </div>
        </div>
        <div>
          <label>Scope</label>
          <div className="seg" role="radiogroup" aria-label="Map scope">
            <button role="radio" aria-checked={scope === "FR"} className={scope === "FR" ? "on" : ""} onClick={() => { setScope("FR"); set({ region: "FRB0" }); }}>France</button>
            <button role="radio" aria-checked={scope === "EU"} className={scope === "EU" ? "on" : ""} onClick={() => setScope("EU")}>All Europe</button>
          </div>
        </div>
        <div>
          <label>Metric</label>
          <div className="seg" role="radiogroup" aria-label="Map shows">
            {([["adv", "3-yr gain"], ["y1", "Year 1"], ["area", "Area"]] as const).map(([k, t]) => (
              <button key={k} role="radio" aria-checked={st.metric === k} className={st.metric === k ? "on" : ""} onClick={() => set({ metric: k })}>{t}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="rc-grid">
        <div className="card rc-map" onMouseLeave={() => setTip(null)}>
          <p className="note rc-hint">{scope === "FR" ? "France regions focused. Tap a region to view; scroll or use + / − to zoom." : "Tap an EU region; scroll or use + / − to zoom. Green means legume earns more."}</p>
          <ZoomableSvg w={W} h={H} home={scope === "FR" ? FRANCE_VIEW : EU_VIEW} resetKey={scope} label="EU NUTS 2 regions coloured by legume margin advantage. Scroll or use the buttons to zoom, drag to move.">
            {paths.filter((p) => p.id !== rid).map((p) => {
              const isDimmed = scope === "FR" && !p.id.startsWith("FR");
              return (
                <path key={p.id} d={p.d} className="reg" fill={colour(p.id)} opacity={isDimmed ? 0.3 : 1}
                  onClick={() => pick(p.id)}
                  onMouseMove={(e) => { const b = e.currentTarget.ownerSVGElement!.getBoundingClientRect(); setTip({ x: e.clientX - b.left, y: e.clientY - b.top, id: p.id, name: p.name }); }} />
              );
            })}
            {selected && <path d={selected.d} className="reg sel" fill={colour(rid)} />}
          </ZoomableSvg>
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
                <small>{L.label} instead of {C.label.toLowerCase()}, over 3 years</small>
                <div className={`big ${win ? "pos" : "neg"}`}>{sgn(res.adv)}<span> /ha</span></div>
              </div>
              <div>
                <small>This year, with CAP</small>
                <div className="big sm">{sgn(res.y1)}<span> /ha</span></div>
                <small>Next 2 years add {sgn(res.adv - res.y1)}</small>
              </div>
            </div>
          </section>

          {/* Farm-Level Conversion Widget */}
          {selectedParcel && (
            <section className="card rc-sec" style={{ borderLeft: "4px solid var(--forest-1, #1e4a32)" }}>
              <p className="eyebrow">Farm-Level Conversion</p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                <h3 style={{ margin: 0, fontSize: 16 }}>Impact on Field {selectedParcel.id}</h3>
                <select
                  value={selectedParcelId}
                  onChange={(e) => setSelectedParcelId(e.target.value)}
                  style={{ fontSize: 12, padding: "3px 8px", borderRadius: 6, border: "1px solid var(--line)" }}
                >
                  {farmParcels.map((p) => (
                    <option key={p.id} value={p.id}>
                      Field {p.id} ({p.area} ha · {cropLabel(p.crop)})
                    </option>
                  ))}
                </select>
              </div>
              <p style={{ fontSize: 13, color: "var(--text-soft)", margin: "0 0 10px 0" }}>
                Converting Field {selectedParcel.id} ({selectedParcel.area} ha) from {cropLabel(selectedParcel.crop)} to {L.label}:
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, background: "var(--line-soft)", padding: 10, borderRadius: 8 }}>
                <div>
                  <small style={{ fontSize: 11, color: "var(--text-soft)" }}>Total 3-yr Upside</small>
                  <div style={{ fontSize: 18, fontWeight: 700 }} className={win ? "pos" : "neg"}>
                    {sgn(Math.round(selectedParcel.area * res.adv))}
                  </div>
                </div>
                <div>
                  <small style={{ fontSize: 11, color: "var(--text-soft)" }}>Coupled Protein Aid</small>
                  <div style={{ fontSize: 18, fontWeight: 700, color: "var(--forest-1)" }}>
                    +{eur(Math.round(selectedParcel.area * (L.forage ? cap.cf : cap.cg)))}
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>

      <div className="rc-wide">
        <section className="card rc-sec">
          <p className="eyebrow">Where the gain comes from</p>
          {res.parts.map(([lbl, v]) => (
            <div key={lbl} className="rc-part">
              <span>{lbl}</span>
              <span className="track"><i className="axis" /><i className={v >= 0 ? "up" : "down"} style={{ width: `${(Math.abs(v) / maxPart) * 50}%` }} /></span>
              <span className="num v">{sgn(v)}</span>
            </div>
          ))}
          <div className="rc-total"><span>Total gain</span><span className={`num ${win ? "pos" : "neg"}`}>{sgn(res.adv)}/ha</span></div>
        </section>

        <details className="card rc-sec">
          <summary><span className="eyebrow">Year by year</span></summary>
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
        </details>
      </div>
    </div>
  );
}
