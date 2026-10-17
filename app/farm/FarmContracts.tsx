"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import type { FarmContract } from "@/lib/contracts";
import { cropLabel, cropData } from "@/lib/data";
import { parseParcelCsv, coverage } from "@/lib/farm";
import { useParcels } from "@/lib/useParcels";
import Log from "../contracts/Log";

const HARVEST = 2026;
const STATUS = { delivering: "Delivering", upcoming: "Upcoming", fulfilled: "Fulfilled" } as const;
const fmt = (iso: string) => new Date(iso + "T00:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const t = (n: number) => `${Math.round(n * 10) / 10} t`;

export default function FarmContracts({ contracts, yields }: { contracts: FarmContract[]; yields: Record<string, number> }) {
  const { parcels, source, load, reset } = useParcels();
  const [errors, setErrors] = useState<string[]>([]);
  const file = useRef<HTMLInputElement>(null);

  const onFile = async (f?: File) => {
    if (!f) return;
    const { parcels: ok, errors: bad } = parseParcelCsv(await f.text());
    setErrors(bad);
    if (ok.length) load(ok, f.name);
    if (file.current) file.current.value = "";
  };

  const ha = parcels.reduce((s, p) => s + p.area, 0);
  const legumeHa = parcels.filter((p) => cropData[p.crop as keyof typeof cropData]?.legume).reduce((s, p) => s + p.area, 0);
  const live = contracts.filter((c) => c.status !== "fulfilled");
  const committed = contracts.reduce((s, c) => s + c.committedT, 0);
  const delivered = contracts.reduce((s, c) => s + c.deliveredT, 0);
  const cover = coverage(parcels, contracts, yields, HARVEST);
  const order = { delivering: 0, upcoming: 1, fulfilled: 2 };

  const open = contracts.filter((c) => c.status !== "fulfilled");
  const toDeliver = open.reduce((s, c) => s + c.committedT - c.deliveredT, 0);
  const value = contracts.reduce((s, c) => s + c.committedT * c.priceEurT, 0);
  const over = cover.filter((c) => c.committedT > c.expectedT);
  const eur = (n: number) => `${Math.round(n).toLocaleString("en-GB")} €`;

  return (
    <>
      <div className="grid three reveal d1" style={{ marginBottom: 24 }}>
        <div className="card"><div className="eyebrow">Contract value</div><div className="big">{eur(value)}</div></div>
        <div className="card"><div className="eyebrow">Still to deliver</div><div className="big">{Math.round(toDeliver)} <small>t</small></div></div>
        <div className="card"><div className="eyebrow">Open contracts</div><div className="big">{open.length}</div></div>
      </div>

      <section id="contracts" className="reveal d2" style={{ marginBottom: 28 }}>
        <div className="cardhead">
          <h2>My contracts</h2>
          <Link className="link" href="/opportunities">Find buyers</Link>
        </div>
        {over.length > 0 && <p className="note" style={{ color: "var(--clay)", marginTop: 0 }}>You have promised more {over.map((c) => cropLabel(c.crop).toLowerCase()).join(" and ")} than your fields should give.</p>}
        <div className="grid">
          {[...contracts].sort((a, b) => order[a.status] - order[b.status]).map((c) => (
            <div key={c.id} className="card">
              <div className="row">
                <div style={{ flex: "2 1 180px" }}>
                  <h3 style={{ fontSize: 16 }}>{c.buyer} <span className="chip legume">{cropLabel(c.crop)}</span></h3>
                  <div className="muted">{STATUS[c.status]} · by {fmt(c.windowEnd)}</div>
                </div>
                <div><div className="big" style={{ fontSize: 28, margin: 0 }}>{eur(c.committedT * c.priceEurT)}</div><div className="muted">{c.priceEurT} €/t</div></div>
                <div style={{ flex: "2 1 180px" }}>
                  <label>{t(c.deliveredT)} of {t(c.committedT)} delivered</label>
                  <Bar value={c.deliveredT} max={c.committedT} tone={c.status === "fulfilled" ? "forest" : "ochre"} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="card reveal d3" id="parcels" style={{ marginBottom: 28 }}>
        <div className="cardhead">
          <div>
            <h2>My fields <span className="tag">estimate</span></h2>
            <p>{Math.round(ha * 10) / 10} ha{source.kind === "demo" ? " · demo farm" : ` · ${source.name}`}</p>
          </div>
          <div className="row" style={{ flex: "0 0 auto", gap: 8 }}>
            <input ref={file} type="file" accept=".csv,text/csv" hidden onChange={(e) => onFile(e.target.files?.[0])} />
            <button className="btn" onClick={() => file.current?.click()}>Import my fields</button>
            {source.kind === "file" && <button className="btn ghost" onClick={() => { reset(); setErrors([]); }}>Demo farm</button>}
          </div>
        </div>
        {errors.length > 0 && (
          <ul className="note" style={{ color: "var(--clay)", marginTop: 0 }}>{errors.slice(0, 3).map((e) => <li key={e}>{e}</li>)}{errors.length > 3 && <li>and {errors.length - 3} more</li>}</ul>
        )}
        <table>
          <thead><tr><th>Field</th><th>Crop</th><th className="num">ha</th><th className="num">Harvest</th></tr></thead>
          <tbody>
            {parcels.map((p) => {
              const c = cropData[p.crop as keyof typeof cropData];
              return (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td><span className={`chip ${c?.legume ? "legume" : ""}`}>{cropLabel(p.crop)}</span></td>
                  <td className="num">{p.area.toFixed(1)}</td>
                  <td className="num muted">{t(p.area * (yields[p.crop] ?? 0))}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <p className="note">Import a CSV: field, crop, ha. <a href="/sample-parcels.csv" download>Sample</a></p>
      </section>

      <section id="shared" className="reveal d4">
        <div className="cardhead">
          <h2>Data I shared</h2>
          <Link className="link" href="/share">Share data</Link>
        </div>
        <Log />
      </section>
    </>
  );
}

function Bar({ value, max, tone }: { value: number; max: number; tone: "forest" | "ochre" | "clay" }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100} style={{ height: 8, borderRadius: 999, background: "var(--line-soft)", overflow: "hidden" }}>
      <div style={{ width: `${pct}%`, height: "100%", background: `var(--${tone === "forest" ? "forest-2" : tone})` }} />
    </div>
  );
}
