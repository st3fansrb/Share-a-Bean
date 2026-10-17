"use client";
import { useState } from "react";
import Link from "next/link";
import { icons } from "@/components/Icons";
import { Synthetic } from "@/components/Tag";
import type { CropAssumption, CropPerformance } from "@/lib/contracts";
import "./insights.css";

const eur = (v: number) => "€" + Math.round(v).toLocaleString("en-GB");
const num = (v: string) => { const n = parseFloat(v); return isNaN(n) || n < 0 ? 0 : n; };

type Props = { legumes: CropAssumption[]; wheat: CropAssumption; nitrogenCreditKgHa: number; nitrogenEurKg: number; rows: CropPerformance[] };

export default function MarketInsights({ legumes, wheat, nitrogenCreditKgHa, nitrogenEurKg, rows }: Props) {
  const [id, setId] = useState(legumes[0].id);
  const cur = legumes.find((c) => c.id === id)!;
  const [ly, setLy] = useState(String(cur.yieldTHa));
  const [lp, setLp] = useState(String(cur.priceEurT));
  const [wy, setWy] = useState(String(wheat.yieldTHa));
  const [wp, setWp] = useState(String(wheat.priceEurT));
  const pick = (c: CropAssumption) => { setId(c.id); setLy(String(c.yieldTHa)); setLp(String(c.priceEurT)); };

  const legRev = num(ly) * num(lp);
  const wRev = num(wy) * num(wp);
  const max = Math.max(legRev, wRev, 1);
  const gap = legRev - wRev;
  const n = nitrogenCreditKgHa * nitrogenEurKg;
  const nMax = Math.max(...rows.map((r) => r.nitrogenKgHa ?? 0), 1);

  return (
    <div className="mi">
      <div className="pills" role="group" aria-label="Legume crop">
        {legumes.map((c) => <button key={c.id} type="button" aria-pressed={c.id === id} onClick={() => pick(c)}>{c.label}</button>)}
      </div>

      <section className="card reveal d1" aria-label="Prices">
        <div className="cardhead"><div><h2>Price per tonne</h2><p>What a collector pays, delivered.</p></div><Synthetic>estimate</Synthetic></div>
        <div className="pcards">
          {legumes.map((c) => (
            <div key={c.id} className={c.id === id ? "pcard on" : "pcard"}>
              <span className="muted">{c.label}</span>
              <b className="num">{eur(c.priceEurT)}</b>
            </div>
          ))}
          <div className="pcard ref"><span className="muted">{wheat.label}</span><b className="num">{eur(wheat.priceEurT)}</b></div>
        </div>
        <p className="note">Monthly price history needs a live feed (FranceAgriMer). Not connected yet.</p>
      </section>

      <div className="mrow">
        <section className="card mwide reveal d2" aria-label="Money per hectare">
          <div className="cardhead"><div><h2>Money per hectare</h2><p>{cur.label} against {wheat.label.toLowerCase()}, before support.</p></div><Synthetic>estimate</Synthetic></div>
          <div className="mgrid">
            <div className="inputs">
              <span /><span className="eyebrow">{cur.label}</span><span className="eyebrow">{wheat.label}</span>
              <label htmlFor="ly">Yield (t/ha)</label>
              <input id="ly" type="number" step="0.1" min="0" value={ly} onChange={(e) => setLy(e.target.value)} />
              <input aria-label="Wheat yield (t/ha)" type="number" step="0.1" min="0" value={wy} onChange={(e) => setWy(e.target.value)} />
              <label htmlFor="lp">Price (€/t)</label>
              <input id="lp" type="number" step="5" min="0" value={lp} onChange={(e) => setLp(e.target.value)} />
              <input aria-label="Wheat price (€/t)" type="number" step="5" min="0" value={wp} onChange={(e) => setWp(e.target.value)} />
            </div>
            <div className="bars">
              <div><div className="bl"><span>{cur.label}</span><b className="num">{eur(legRev)}</b></div><div className="track"><div className="fill leg" style={{ width: `${(legRev / max) * 100}%` }} /></div></div>
              <div><div className="bl"><span>{wheat.label}</span><b className="num">{eur(wRev)}</b></div><div className="track"><div className="fill ref" style={{ width: `${(wRev / max) * 100}%` }} /></div></div>
            </div>
          </div>
          <div className={gap >= 0 ? "verdict good" : "verdict warn"}>
            {gap >= 0
              ? `${cur.label} earns ${eur(gap)}/ha more than wheat at these prices.`
              : `${cur.label} earns ${eur(-gap)}/ha less than wheat. Support and saved fertiliser can close part of the gap.`}
          </div>
          <div className="cta">
            <span className="note">Saved fertiliser: about {nitrogenCreditKgHa} kg N/ha, around {eur(n)}/ha.</span>
            <Link href="/cap" className="btn ghost">Add CAP support {icons.arrow}</Link>
          </div>
        </section>

        <section className="card reveal d3" aria-label="Where to sell">
          <h2>Where to sell</h2>
          <ul className="outlets">
            <li><i style={{ background: "var(--sky)" }} /><div><b>Feed companies</b><span>Largest outlet. Price follows feed protein.</span></div></li>
            <li><i style={{ background: "var(--forest-2)" }} /><div><b>Food processors</b><span>Better price for food grade. Agree quality and contract before sowing.</span></div></li>
            <li><i style={{ background: "var(--ochre)" }} /><div><b>Cooperatives</b><span>Collect and market pulses for you. Often the easiest start.</span></div></li>
          </ul>
          <Link href="/opportunities" className="link">See buyers {icons.arrow}</Link>
        </section>
      </div>

      <section className="card reveal d4" aria-label="Fertiliser use in your region">
        <div className="cardhead"><div><h2>Fertiliser in your region</h2><p>Nitrogen applied, kg per hectare ({rows[0]?.year}).</p></div><Synthetic>estimate</Synthetic></div>
        {rows.map((r) => (
          <div key={r.crop} className="nrow">
            <span>{r.crop === "pulses" ? "Legumes" : r.crop[0].toUpperCase() + r.crop.slice(1)}</span>
            <div className="track"><div className={r.crop === "pulses" ? "fill leg" : "fill ref"} style={{ width: `${((r.nitrogenKgHa ?? 0) / nMax) * 100}%` }} /></div>
            <b className="num">{r.nitrogenKgHa ?? "–"} kg</b>
          </div>
        ))}
      </section>
    </div>
  );
}
