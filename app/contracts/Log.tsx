"use client";
import { useEffect, useState } from "react";
import { cropLabel } from "@/lib/data";
import { LOG_KEY } from "../share/ShareForm";

type Entry = { at: string; buyer: string; crop: string; parcels: string[] };

export default function Log() {
  const [log, setLog] = useState<Entry[]>([]);
  useEffect(() => { try { setLog(JSON.parse(localStorage.getItem(LOG_KEY) ?? "[]")); } catch {} }, []);
  if (!log.length) return <div className="card muted">Nothing shared yet.</div>;
  return (
    <div className="card"><table>
      <thead><tr><th>When</th><th>Buyer</th><th>Crop</th><th>Parcels</th></tr></thead>
      <tbody>{log.map((e, i) => <tr key={i}><td>{e.at.slice(0, 16).replace("T", " ")}</td><td>{e.buyer}</td><td>{cropLabel(e.crop)}</td><td>{e.parcels.join(", ")}</td></tr>)}</tbody>
    </table></div>
  );
}
