import Link from "next/link";
import { cropData, cropLabel, farmData, nitrogen, offerData } from "@/lib/data";
import { marginPerHa } from "@/lib/calc";
import { Synthetic } from "@/components/Tag";

const compare = (["wheat", "rapeseed", "faba", "lupin"] as const).map((id) => {
  const c = cropData[id];
  return { id, label: cropLabel(id), legume: c.legume, margin: Math.round(marginPerHa({ ...c, supportEurHa: 0 })) };
});
const top = Math.max(...compare.map((c) => c.margin));
const nCredit = nitrogen.creditKgHa * nitrogen.eurKg;
const area = farmData.parcels.reduce((s, p) => s + p.area, 0);

const fmt = (n: number) => n.toLocaleString("en-GB");

export default function Home() {
  return (
    <div className="lp">
      <header className="lp-nav">
        <Link href="/" className="lp-logo">Share-a-Bean</Link>
        <nav aria-label="Main">
          <Link href="/opportunities">Buyers</Link>
          <Link href="/calculator">Calculator</Link>
          <Link href="/cap">CAP</Link>
          <Link href="/share">My data</Link>
        </nav>
        <Link href="/farm" className="lp-btn lp-btn-sm">Open my farm</Link>
      </header>

      <section className="lp-hero">
        <div className="lp-hero-copy">
          <h1>Find out if legumes pay off on your farm.</h1>
          <p>Compare margins per hectare, meet buyers nearby, and share only the data you choose.</p>
          <div className="lp-actions">
            <Link href="/calculator" className="lp-btn">Check my farm</Link>
            <Link href="/opportunities" className="lp-btn lp-btn-ghost">See buyers</Link>
          </div>
        </div>

        <figure className="lp-panel" aria-label="Margin per hectare, demo farm">
          <figcaption>
            <span>Margin per hectare before support</span>
            <Synthetic>demo values</Synthetic>
          </figcaption>
          <ul className="lp-bars">
            {compare.map((c) => (
              <li key={c.id} className={c.legume ? "is-legume" : ""}>
                <span className="lp-bar-label">{c.label}</span>
                <span className="lp-bar-track">
                  <span className="lp-bar" style={{ width: `${(c.margin / top) * 100}%` }} />
                </span>
                <span className="lp-bar-value">{fmt(c.margin)} €</span>
              </li>
            ))}
          </ul>
          <p className="lp-panel-note">
            A legume also leaves about {fmt(nCredit)} €/ha of nitrogen for the next crop. Assumptions are placeholders until sourced.
          </p>
        </figure>
      </section>

      <section className="lp-section lp-buyers">
        <h2>Buyers who want legumes near {farmData.region}</h2>
        <ul className="lp-offers">
          {offerData.map((o) => (
            <li key={o.id}>
              <div>
                <strong>{o.buyer}</strong>
                <span>{o.type}, {o.distanceKm} km</span>
              </div>
              <div>
                <strong>{cropLabel(o.crop)}</strong>
                <span>{fmt(o.volumeT[0])} to {fmt(o.volumeT[1])} t</span>
              </div>
              <div className="lp-price">
                <strong>{o.priceEurT[0]} to {o.priceEurT[1]} €/t</strong>
                <span>{o.contract}, {o.delivery}</span>
              </div>
              <Link
                href={`/calculator?crop=${o.crop}&price=${Math.round((o.priceEurT[0] + o.priceEurT[1]) / 2)}`}
                className="lp-link"
              >
                Does it pay for me?
              </Link>
            </li>
          ))}
        </ul>
        <p className="lp-foot"><Synthetic>synthetic offers</Synthetic> Real buyers replace these before the demo.</p>
      </section>

      <section className="lp-section lp-control">
        <div className="lp-control-head">
          <h2>You decide what leaves the farm.</h2>
          <p>Each buyer sees the parcels and crops you pick for them. Nothing else, and you can withdraw it.</p>
          <Link href="/share" className="lp-btn lp-btn-ghost">Manage data sharing</Link>
        </div>
        <div className="lp-split">
          <div>
            <h3>A buyer can see</h3>
            <ul>
              <li>Crop and area of the parcels you select</li>
              <li>Expected volume and delivery window</li>
              <li>The contact you choose</li>
            </ul>
          </div>
          <div>
            <h3>Stays with you</h3>
            <ul>
              <li>Yields, costs and margins</li>
              <li>Parcels you did not select</li>
              <li>Your subsidy applications</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="lp-section lp-steps">
        <h2>From parcels to a contract.</h2>
        <ol>
          <li><strong>Add your parcels</strong><span>{farmData.parcels.length} parcels, {area} ha in the demo farm.</span></li>
          <li><strong>Compare crops</strong><span>Margin per hectare and the rotation effect, with CAP support included.</span></li>
          <li><strong>Share and sign</strong><span>Send the selection to a buyer and keep every contract in one log.</span></li>
        </ol>
      </section>

      <footer className="lp-cta">
        <h2>Start with your own numbers.</h2>
        <Link href="/calculator" className="lp-btn lp-btn-light">Check my farm</Link>
      </footer>
    </div>
  );
}
