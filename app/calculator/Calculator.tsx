"use client";
import { useMemo, useState } from "react";
import { cropData, capSchemes, nitrogen } from "@/lib/data";
import { marginPerHa, rotationMargins, average } from "@/lib/calc";

type Id = keyof typeof cropData;
const ids = Object.keys(cropData) as Id[];
const support = (id: Id) =>
  cropData[id].legume ? capSchemes.find((s) => s.id === "coupled-protein")?.eurHa ?? 0 : 0;
const eur = (n: number) => `${Math.round(n)} €`;

export default function Calculator({ initialCrop, initialPrice }: { initialCrop?: string; initialPrice?: number }) {
  const start = (ids.includes(initialCrop as Id) ? initialCrop : "faba") as Id;
  const [crop, setCrop] = useState<Id>(start);
  const [yieldT, setYield] = useState(cropData[start].yieldTHa);
  const [price, setPrice] = useState(initialPrice ?? cropData[start].priceEurT);
  const [cost, setCost] = useState(cropData[start].costEurHa);
  const [area, setArea] = useState(10);
  const [rotation, setRotation] = useState<Id[]>(["wheat", "rapeseed", "faba"]);

  const pick = (id: Id) => {
    setCrop(id);
    setYield(cropData[id].yieldTHa);
    setPrice(cropData[id].priceEurT);
    setCost(cropData[id].costEurHa);
  };
  const m = marginPerHa({ yieldTHa: yieldT, priceEurT: price, costEurHa: cost, supportEurHa: support(crop) });
  const ref = marginPerHa({ ...cropData.wheat, supportEurHa: 0 });

  const rot = useMemo(() => {
    const years = rotation.map((id) => ({
      crop: id,
      legume: cropData[id].legume,
      input: { yieldTHa: cropData[id].yieldTHa, priceEurT: cropData[id].priceEurT, costEurHa: cropData[id].costEurHa, supportEurHa: support(id) },
    }));
    return rotationMargins(years, nitrogen.creditKgHa * nitrogen.eurKg);
  }, [rotation]);
  return (
    <>
      <div className="card">
        <h2>One crop</h2>
        <div className="row">
          <div><label>Crop</label>
            <select value={crop} onChange={(e) => pick(e.target.value as Id)}>
              {ids.map((id) => <option key={id} value={id}>{cropData[id].label}</option>)}
            </select></div>
          <div><label>Area (ha)</label><input type="number" value={area} onChange={(e) => setArea(+e.target.value)} /></div>
          <div><label>Yield (t/ha)</label><input type="number" step="0.1" value={yieldT} onChange={(e) => setYield(+e.target.value)} />{(cropData[crop] as { yieldSource?: string }).yieldSource && <small className="muted">Sourced: {(cropData[crop] as { yieldSource?: string }).yieldSource}</small>}</div>
          <div><label>Price (€/t)</label><input type="number" value={price} onChange={(e) => setPrice(+e.target.value)} /></div>
          <div><label>Costs (€/ha)</label><input type="number" value={cost} onChange={(e) => setCost(+e.target.value)} /></div>
        </div>
        <p className="big">{eur(m)} / ha <span className="muted"> ({eur(m * area)} on {area} ha)</span></p>
        <p className="muted">With CAP support of {eur(support(crop))}/ha. Wheat: {eur(ref)}/ha.</p>
      </div>

      <div className="card">
        <h2>3-year rotation</h2>
        <div className="row">
          {rotation.map((id, i) => (
            <div key={i}><label>Year {i + 1}</label>
              <select value={id} onChange={(e) => setRotation(rotation.map((r, j) => (j === i ? (e.target.value as Id) : r)))}>
                {ids.map((x) => <option key={x} value={x}>{cropData[x].label}</option>)}
              </select>
              <div className="muted">{eur(rot[i].margin)}/ha{rot[i].nCredit ? ` (incl. ${eur(rot[i].nCredit)} N credit)` : ""}</div>
            </div>
          ))}
        </div>
        <p className="big">Average {eur(average(rot.map((r) => r.margin)))} / ha / year</p>
        <p className="muted">Legumes save {nitrogen.creditKgHa} kg of fertiliser per ha for the next crop.</p>
      </div>
    </>
  );
}
