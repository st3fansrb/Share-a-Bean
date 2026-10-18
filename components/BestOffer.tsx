import Link from "next/link";
import "./assist.css";
import { rankedForDemoFarm } from "@/lib/advice";
import { cropLabel } from "@/lib/data";
import { ExplainOffer } from "./ExplainOffer";

export function BestOffer({ compact = false }: { compact?: boolean }) {
  const best = rankedForDemoFarm()[0];
  if (!best) return null;
  const o = best.offer;
  const p = o.partner;
  const gain = Math.round(best.packageGainEurHa);
  const full = best.coveredYears >= 3;
  return (
    <div className="card best" style={{ marginBottom: compact ? 0 : 16 }}>
      <div className="eyebrow">Our pick for your farm <span className="ai-tag">AI</span></div>
      <h2 style={compact ? { fontSize: 18 } : undefined}>Sell your {cropLabel(o.crop).toLowerCase()} to {o.buyer} and your {p.crops.map((c) => cropLabel(c).toLowerCase()).join(" and ")} to {p.buyer}</h2>
      <div className="gain">{gain >= 0 ? "+" : ""}{gain} €/ha <span className="muted" style={{ fontSize: 14 }}>a year, compared with your crops now</span></div>
      {!compact && <ul>
        <li>{full ? "Both buyers are signed for the full 3-year rotation." : `Both buyers cover ${best.coveredYears} of your 3 rotation years.`}</li>
        <li>{o.town === p.town ? `Both are in ${o.town}, ${o.distanceKm} km away.` : `${o.town} is ${o.distanceKm} km away; ${p.town} is ${p.distanceKm} km.`}</li>
      </ul>}
      <div className="actions">
        <Link className="btn" href={`/calculator?offer=${o.id}&crop=${o.crop}&price=${Math.round(best.netPriceEurT)}`}>What would I earn?</Link>
        <ExplainOffer offerId={o.id} label="Explain in plain words" />
      </div>
    </div>
  );
}
