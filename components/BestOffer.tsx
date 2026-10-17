import Link from "next/link";
import "./assist.css";
import { rankedForDemoFarm } from "@/lib/advice";
import { cropLabel } from "@/lib/data";
import { ExplainOffer } from "./ExplainOffer";

export function BestOffer() {
  const best = rankedForDemoFarm()[0];
  if (!best) return null;
  const o = best.offer;
  const gain = Math.round(best.gainEurHa);
  return (
    <div className="card best" style={{ marginBottom: 16 }}>
      <div className="eyebrow">Best match for your farm</div>
      <h2>{o.buyer}: {cropLabel(o.crop)}, {o.contract.toLowerCase()} contract</h2>
      <div className="gain">{gain >= 0 ? "+" : ""}{gain} €/ha <span className="muted" style={{ fontSize: 14 }}>vs. what you grow now (estimate)</span></div>
      <ul>
        {[...best.reasons, ...best.cautions].map((r) => <li key={r}>{r}</li>)}
      </ul>
      <div className="actions">
        <Link className="btn" href={`/calculator?offer=${o.id}&crop=${o.crop}&price=${Math.round(best.netPriceEurT)}`}>Check it in the calculator</Link>
      </div>
      <ExplainOffer offerId={o.id} label="Explain in simple words" />
    </div>
  );
}
