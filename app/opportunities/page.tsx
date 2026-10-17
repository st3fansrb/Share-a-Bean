import Link from "next/link";
import { offerData, cropLabel } from "@/lib/data";
import { Synthetic } from "@/components/Tag";

export default function Opportunities() {
  return (
    <>
      <h1>Buyers <Synthetic>demo offers</Synthetic></h1>
      <p className="lede">Who wants legumes near you.</p>
      <div className="grid">
        {offerData.map((o) => (
          <div key={o.id} className="card">
            <div className="row">
              <div style={{ flex: "2 1 220px" }}>
                <h2 style={{ marginBottom: 2 }}>{o.buyer} <span className="chip">{cropLabel(o.crop)}</span></h2>
                <div className="muted">{o.type} · {o.distanceKm} km</div>
              </div>
              <div><label>Volume</label>{o.volumeT[0]} to {o.volumeT[1]} t</div>
              <div><label>Price</label>{o.priceEurT[0]} to {o.priceEurT[1]} €/t</div>
              <div><label>Contract</label>{o.contract}</div>
              <div style={{ flex: "0 0 auto" }}>
                <Link className="btn" href={`/calculator?offer=${o.id}&crop=${o.crop}&price=${Math.round((o.priceEurT[0] + o.priceEurT[1]) / 2)}`}>What would I earn?</Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
