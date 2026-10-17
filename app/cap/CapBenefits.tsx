"use client";
import { useState } from "react";
import Link from "next/link";
import { capBenefit } from "@/lib/cap-calc";
import type { CapData } from "@/lib/contracts";
import { icons } from "@/components/Icons";
import { Synthetic } from "@/components/Tag";
import "./cap.css";

const eur = (v: number) => "€" + Math.round(v).toLocaleString("en-GB");
const num = (v: string) => { const n = parseFloat(v); return isNaN(n) || n < 0 ? 0 : n; };

export default function CapBenefits({ cap, areaHa, legumeHa, points }: { cap: CapData; areaHa: number; legumeHa: number; points: number }) {
  const [leg, setLeg] = useState(String(legumeHa));
  const [pts, setPts] = useState(String(points));
  const e = cap.ecoScheme;
  const coupled = cap.schemes.find((s) => s.id === "coupled-protein")?.eurHa ?? 0;
  const fodder = cap.schemes.find((s) => s.id === "coupled-fodder-legume")?.eurHa ?? 0;
  const r = capBenefit({ areaHa, legumeHa: num(leg), pointsNow: num(pts) }, e, coupled);
  const p0 = num(pts);
  const levelName = r.after === "higher" ? "Higher level" : r.after === "base" ? "Base level" : "Not reached";

  return (
    <div className="cap">
      <section className="card capcard reveal d1" aria-label="Your plan">
        <h2>Your plan</h2>
        <label htmlFor="leg">Legumes you plan to grow (ha)</label>
        <input id="leg" className="capbig" type="number" min="0" inputMode="decimal" value={leg} onChange={(ev) => setLeg(ev.target.value)} />
        <p className="note">{areaHa ? `${Math.round(r.share * 100)}% of your ${areaHa} ha` : ""}</p>
        <label htmlFor="pts">Eco-scheme points today</label>
        <input id="pts" type="number" min="0" max={e.maxPts} inputMode="numeric" value={pts} onChange={(ev) => setPts(ev.target.value)} />
        <Link href="/farm" className="link">Edit in My Farm {icons.arrow}</Link>
      </section>

      <section className="card capcard capwide reveal d2" aria-label="What you can get">
        <div className="cardhead"><div><h2>What you can get</h2><p>Grain legumes may qualify for these.</p></div></div>
        <ul className="schemes">
          <li>
            <span className="sico eco">E</span>
            <div><b>Eco-scheme</b><span>Legumes add {r.legumePts} points</span></div>
            <b className="num">{r.ecoGain > 0 ? "+" + eur(r.ecoGain) : "€0"}</b>
          </li>
          <li>
            <span className="sico leg">C</span>
            <div><b>Coupled support, protein crops</b><span>Pea, faba bean, lupin, soy</span></div>
            <b className="num">{eur(coupled)}/ha</b>
          </li>
          <li>
            <span className="sico leg">C</span>
            <div><b>Coupled support, fodder legumes</b><span>Needs livestock or a livestock contract</span></div>
            <b className="num">{eur(fodder)}/ha</b>
          </li>
          {cap.rules.map((x) => (
            <li key={x.id}>
              <span className="sico rule">{x.id === "maec" ? "M" : "R"}</span>
              <div><b>{x.label}</b><span>{x.note}</span></div>
              <b className="num muted">{x.id === "maec" ? "Varies" : "Rule"}</b>
            </li>
          ))}
        </ul>
      </section>

      <div className="capcol reveal d3">
        <section className="card total" aria-label="Estimated extra support" aria-live="polite">
          <span className="eyebrow">Extra support per year</span>
          <div className="big">+{eur(r.total)}</div>
          <p className="note">{r.perLegumeHa ? `About ${eur(r.perLegumeHa)} per legume hectare` : "Enter the legume area"}</p>
        </section>
        <section className="card capcard" aria-label="Eco-scheme level">
          <div className="cardhead"><h3>Eco-scheme level</h3><span className={`chip ${r.after ? "" : "legume"}`}>{levelName}</span></div>
          <div className="segs" aria-hidden>
            {Array.from({ length: e.maxPts }, (_, i) => i + 1).map((i) => (
              <span key={i} className={i <= p0 ? "s now" : i <= r.pointsAfter ? "s add" : "s"} style={i === e.basePts ? { marginLeft: 6 } : undefined} />
            ))}
          </div>
          <p className="note">{p0} → {r.pointsAfter} points. Base {e.basePts}, higher {e.higherPts}.</p>
        </section>
      </div>

      <p className="note capfoot">
        <Synthetic>estimate</Synthetic> Eco-scheme 2026 is provisional: {e.baseEurHa} €/ha base, {e.higherEurHa} €/ha higher, paid on all eligible hectares. Your TelePAC declaration is binding.
      </p>
    </div>
  );
}
