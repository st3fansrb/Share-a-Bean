"use client";
import { useState } from "react";
import Link from "next/link";
import { ecoLevel, legumePoints } from "@/lib/cap-calc";
import type { CapData, CapProgramme } from "@/lib/contracts";
import { icons } from "@/components/Icons";
import { Synthetic } from "@/components/Tag";
import "./cap.css";

const num = (v: string) => { const n = parseFloat(v); return isNaN(n) || n < 0 ? 0 : n; };
const badge: Record<CapProgramme["status"], string> = { active: "Active now", next: "Coming next", proposed: "Proposed" };

function Programme({ p }: { p: CapProgramme }) {
  return (
    <li className="prog">
      <div className="proghead">
        <b>{p.title}</b>
        <span className={`chip ${p.status === "active" ? "" : "legume"}`}>{badge[p.status]}</span>
      </div>
      <p className="progamount">{p.amount}</p>
      <p className="note">{p.what}</p>
      <details>
        <summary>How to qualify</summary>
        <ul>{p.eligibility.map((x) => <li key={x}>{x}</li>)}</ul>
        {p.note && <p className="note">{p.note}</p>}
      </details>
    </li>
  );
}

export default function CapBenefits({ cap, areaHa, legumeHa, points }: { cap: CapData; areaHa: number; legumeHa: number; points: number }) {
  const [leg, setLeg] = useState(String(legumeHa));
  const [pts, setPts] = useState(String(points));
  const e = cap.ecoScheme;
  const l = Math.min(num(leg), areaHa || num(leg));
  const share = areaHa ? l / areaHa : 0;
  const add = legumePoints(share, l, e);
  const now = num(pts);
  const after = now + add;
  const lvl = ecoLevel(after, e);
  const group = (s: CapProgramme["status"][]) => cap.programmes.filter((p) => s.includes(p.status));

  return (
    <div className="cap">
      <section className="capsec" aria-label="Active now">
        <h2>Active now</h2>
        <ul className="progs">{group(["active"]).map((p) => <Programme key={p.id} p={p} />)}</ul>
      </section>

      <div className="capcol">
        <section className="card capcard" aria-label="Eco-scheme check" aria-live="polite">
          <h2>Eco-scheme check</h2>
          <label htmlFor="leg">Legumes you plan to grow (ha)</label>
          <input id="leg" type="number" min="0" inputMode="decimal" value={leg} onChange={(ev) => setLeg(ev.target.value)} />
          <label htmlFor="pts">Points you have today</label>
          <input id="pts" type="number" min="0" max={e.maxPts} inputMode="numeric" value={pts} onChange={(ev) => setPts(ev.target.value)} />
          <div className="segs" aria-hidden>
            {Array.from({ length: e.maxPts }, (_, i) => i + 1).map((i) => (
              <span key={i} className={i <= now ? "s now" : i <= after ? "s add" : "s"} style={i === e.basePts ? { marginLeft: 6 } : undefined} />
            ))}
          </div>
          <p className="note">
            {now} → {after} points. {lvl === "higher" ? "Higher level." : lvl === "base" ? "Base level." : `Base level needs ${e.basePts}.`}
          </p>
          <Link href="/calculator" className="link">See what it adds to your margin {icons.arrow}</Link>
        </section>

        <section className="capcard" aria-label="Coming next">
          <h2>Coming next</h2>
          <ul className="progs">{group(["next", "proposed"]).map((p) => <Programme key={p.id} p={p} />)}</ul>
        </section>
      </div>

      <p className="note capfoot">
        <Synthetic>estimate</Synthetic> Rates are from the 2023 to 2027 French plan and can change. Eco-scheme 2026 is provisional. Your TelePAC declaration is binding.
      </p>
    </div>
  );
}
