import Link from "next/link";
import { farmData, offerData, cropData, capSchemes, nitrogen, cropLabel } from "@/lib/data";
import { marginPerHa, rotationMargins, average } from "@/lib/calc";
import { Synthetic } from "@/components/Tag";
import { BuyerMap, TYPE_COLOR } from "@/components/BuyerMap";
import { icons } from "@/components/Icons";
import "./home.css";

type Id = keyof typeof cropData;
const coupled = capSchemes.find((s) => s.id === "coupled-protein")?.eurHa ?? 0;
const support = (id: Id) => (cropData[id].legume ? coupled : 0);
const margin = (id: Id) => marginPerHa({ ...cropData[id], supportEurHa: support(id) });
const eur = (n: number) => Math.round(n).toLocaleString("en-GB");

export default function Home() {
  const area = farmData.parcels.reduce((s, p) => s + p.area, 0);
  const ids = Object.keys(cropData) as Id[];
  const margins = ids.map((id) => ({ id, m: margin(id) })).sort((a, b) => b.m - a.m);
  const max = Math.max(...margins.map((x) => x.m));
  const faba = cropData.faba;
  const gap = margin("faba") - margin("wheat");
  const rot = (["wheat", "rapeseed", "faba"] as Id[]).map((id) => ({
    crop: id, legume: cropData[id].legume, input: { ...cropData[id], supportEurHa: support(id) },
  }));
  const rotAvg = average(rotationMargins(rot, nitrogen.creditKgHa * nitrogen.eurKg).map((r) => r.margin));

  return (
    <div className="home">
      <header className="topbar reveal d1">
        <span className="place">{icons.pin} {farmData.region}, France</span>
        <span className="avatar" title={farmData.name}>DF</span>
      </header>

      <section className="hero reveal d2">
        <div>
          <div className="eyebrow">Season planning · 2027</div>
          <h1>Will legumes pay <em>on your farm?</em></h1>
          <p className="lede">See who wants faba bean, lupin and pea near you, what the margin looks like with CAP support, and share only the parcels you choose.</p>
          <div className="actions">
            <Link className="btn" href="/opportunities">See buyers {icons.arrow}</Link>
            <Link className="btn ghost" href="/calculator">Check my margin</Link>
          </div>
        </div>
        <dl className="ledger">
          <div><dt>Buyers within 60 km</dt><dd>{offerData.length}</dd><span>legume offers <Synthetic /></span></div>
          <div><dt>Faba bean vs wheat</dt><dd className="pos">+{eur(gap)} <small>€/ha</small></dd><span>incl. coupled support <Synthetic>placeholder</Synthetic></span></div>
          <div><dt>Your farm</dt><dd>{area} <small>ha</small></dd><span>{farmData.parcels.length} parcels, no legumes yet</span></div>
        </dl>
      </section>

      <section className="card opps reveal d3">
        <div className="cardhead">
          <div><h2>Contract opportunities <Synthetic>synthetic offers</Synthetic></h2><p>Demand from processors, feed companies and biogas plants around you.</p></div>
          <Link className="link" href="/opportunities">All opportunities {icons.arrow}</Link>
        </div>
        <div className="opps-body">
          <div className="mapwrap">
            <BuyerMap />
            <ul className="legend">
              {Object.entries(TYPE_COLOR).map(([t, c]) => <li key={t}><i style={{ background: c }} />{t}</li>)}
            </ul>
          </div>
          <ol className="offers">
            {offerData.map((o) => (
              <li key={o.id}>
                <Link href={`/calculator?offer=${o.id}&crop=${o.crop}&price=${Math.round((o.priceEurT[0] + o.priceEurT[1]) / 2)}`} style={{ borderLeftColor: TYPE_COLOR[o.type] }}>
                  <span className="swatch" style={{ background: TYPE_COLOR[o.type] }} />
                  <div className="who">
                    <h3>{o.buyer} <span className="chip legume">{cropLabel(o.crop)}</span></h3>
                    <span className="muted">{o.type} · {o.distanceKm} km</span>
                  </div>
                  <div className="fact"><span>Volume</span>{eur(o.volumeT[0])}–{eur(o.volumeT[1])} t</div>
                  <div className="fact"><span>Price</span>€{o.priceEurT[0]}–{o.priceEurT[1]}/t</div>
                  <div className="fact"><span>Contract</span>{o.contract}</div>
                  <div className="fact"><span>Delivery</span>{o.delivery}</div>
                  <span className="go">{icons.arrow}</span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <div className="trio">
        <section className="card reveal d4">
          <div className="cardhead">
            <div><h2>Margin by crop <Synthetic>placeholder</Synthetic></h2><p>Gross margin per hectare, with CAP support.</p></div>
          </div>
          <div className="hbars">
            {margins.map(({ id, m }) => (
              <div key={id} className={cropData[id].legume ? "hb legume" : "hb"}>
                <span className="hl">{cropData[id].label}</span>
                <span className="track"><span className="fill" style={{ width: `${(m / max) * 100}%` }} /></span>
                <span className="hv">€{eur(m)}</span>
              </div>
            ))}
          </div>
          <p className="note">Legumes in ochre. Yields, prices and costs are assumptions until sourced.</p>
        </section>

        <section className="card reveal d4">
          <div className="cardhead">
            <div><h2>Your crop calculator</h2><p>Faba bean on 10 ha, with the first offer's price.</p></div>
          </div>
          <table className="sheet">
            <tbody>
              <tr><td>Revenue <span className="muted">{faba.yieldTHa} t × €{faba.priceEurT}</span></td><td>€{eur(faba.yieldTHa * faba.priceEurT)}</td></tr>
              <tr><td>Costs</td><td>−€{eur(faba.costEurHa)}</td></tr>
              <tr><td>CAP coupled support</td><td className="pos">+€{coupled}</td></tr>
            </tbody>
          </table>
          <div className="result">
            <div><span className="eyebrow">Estimated margin</span><div className="big">€{eur(margin("faba"))}<small>/ha</small></div><span className="muted">≈ €{eur(margin("faba") * 10)} on 10 ha</span></div>
          </div>
          <div className="rotline">Rotation wheat → rapeseed → faba: <b>€{eur(rotAvg)}/ha/yr</b> with the N credit</div>
          <Link className="link" href="/calculator">Open the calculator {icons.arrow}</Link>
        </section>

        <section className="card reveal d5">
          <div className="cardhead">
            <div><h2>CAP eligibility</h2><p>Support linked to legumes in France, 2023–2027.</p></div>
          </div>
          <ul className="schemes">
            {capSchemes.map((s) => (
              <li key={s.id}>
                <span className="tick">✓</span>
                <div><b>{s.label}</b><span className="muted">{s.source}</span></div>
                <span className="amt">€{s.eurHa}<small>/ha</small></span>
              </li>
            ))}
          </ul>
          <p className="note">Rates still to be checked against France's CAP Strategic Plan.</p>
          <Link className="link" href="/cap">All schemes {icons.arrow}</Link>
        </section>
      </div>
    </div>
  );
}
