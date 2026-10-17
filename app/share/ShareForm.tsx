"use client";
import { useState } from "react";
import { farmData, offerData, cropLabel } from "@/lib/data";

export const LOG_KEY = "sab-contracts-log";

export default function ShareForm() {
  const [offer, setOffer] = useState(offerData[0].id);
  const [parcels, setParcels] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const toggle = (id: string) => setParcels((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  const save = () => {
    const o = offerData.find((x) => x.id === offer)!;
    try {
      const log = JSON.parse(localStorage.getItem(LOG_KEY) ?? "[]");
      log.unshift({ at: new Date().toISOString(), buyer: o.buyer, crop: o.crop, parcels });
      localStorage.setItem(LOG_KEY, JSON.stringify(log));
    } catch {}
    setDone(true);
  };
  return (
    <div className="card">
      <label>Share with</label>
      <select value={offer} onChange={(e) => { setOffer(e.target.value); setDone(false); }}>
        {offerData.map((o) => <option key={o.id} value={o.id}>{o.buyer} ({cropLabel(o.crop)})</option>)}
      </select>
      <h2 style={{ marginTop: 16 }}>Which parcels?</h2>
      {farmData.parcels.map((p) => (
        <div key={p.id}><label><input type="checkbox" checked={parcels.includes(p.id)} onChange={() => toggle(p.id)} /> Parcel {p.id}: {cropLabel(p.crop)}, {p.area} ha</label></div>
      ))}
      <p className="muted">Only the ticked parcels are shared, with this buyer only. You can see it afterwards under Contracts.</p>
      <button className="btn" disabled={!parcels.length} onClick={save}>Share</button>
      {done && <p>Shared. Logged under Contracts.</p>}
    </div>
  );
}
