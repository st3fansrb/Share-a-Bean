"use client";
import { useState } from "react";
import { offerData, cropLabel } from "@/lib/data";
import { useParcels } from "@/lib/useParcels";

export const LOG_KEY = "sab-contracts-log";

export default function ShareForm() {
  const { parcels: farmParcels } = useParcels();
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
      {farmParcels.map((p) => (
        <div key={p.id}><label><input type="checkbox" checked={parcels.includes(p.id)} onChange={() => toggle(p.id)} /> Parcel {p.id}: {cropLabel(p.crop)}, {p.area} ha</label></div>
      ))}
      <p className="muted">Only ticked parcels, only this buyer.</p>
      <button className="btn" disabled={!parcels.length} onClick={save}>Share</button>
      {done && <p>Shared.</p>}
    </div>
  );
}
