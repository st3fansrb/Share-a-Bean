import Link from "next/link";
import { farmData, offerData, cropData, capSchemes, cropLabel } from "@/lib/data";
import { marginPerHa } from "@/lib/calc";
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
  const gap = margin("faba") - margin("wheat");
  return (
    <div className="home">
      <header className="topbar reveal d1">
        <span className="place">{icons.pin} {farmData.region}, France</span>
        <span className="avatar" title={farmData.name}>DF</span>
      </header>

      <section className="hero reveal d2">
        <div>
          <div className="eyebrow">Season 2027</div>
          <h1>Will legumes pay <em>on your farm?</em></h1>
          <p className="lede">Find buyers near you and see what you would earn per hectare.</p>
          <div className="actions">
            <Link className="btn" href="/opportunities">See buyers {icons.arrow}</Link>
            <Link className="btn ghost" href="/calculator">Check my margin</Link>
          </div>
        </div>
        <dl className="ledger">
          <div><dt>Buyers within 60 km</dt><dd>{offerData.filter((o) => o.distanceKm <= 60).length}</dd><span>legume offers</span></div>
          <div><dt>Faba bean vs wheat</dt><dd className="pos">+{eur(gap)} <small>€/ha</small></dd><span>per hectare, with CAP support</span></div>
          <div><dt>Your farm</dt><dd>{area} <small>ha</small></dd><span>{farmData.parcels.length} parcels</span></div>
        </dl>
      </section>

      <section className="card opps reveal d3">
        <div className="cardhead">
          <div><h2>Buyers near you <Synthetic>demo</Synthetic></h2></div>
          <Link className="link" href="/opportunities">See all {offerData.length} {icons.arrow}</Link>
        </div>
        <div className="opps-body">
          <div className="mapwrap">
            <BuyerMap />
            <ul className="legend">
              {Object.entries(TYPE_COLOR).map(([t, c]) => <li key={t}><i style={{ background: c }} />{t}</li>)}
            </ul>
          </div>
          <ol className="offers">
            {offerData.slice(0, 5).map((o) => (
              <li key={o.id}>
                <Link href={`/calculator?offer=${o.id}&crop=${o.crop}&price=${Math.round((o.priceEurT[0] + o.priceEurT[1]) / 2)}`} style={{ borderLeftColor: TYPE_COLOR[o.type] }}>
                  <span className="swatch" style={{ background: TYPE_COLOR[o.type] }} />
                  <div className="who">
                    <h3>{o.buyer} <span className="chip legume">{cropLabel(o.crop)}</span></h3>
                    <span className="muted">{o.distanceKm} km away</span>
                  </div>
                  <div className="fact"><span>Volume</span>{eur(o.volumeT[0])}–{eur(o.volumeT[1])} t</div>
                  <div className="fact"><span>Price</span>€{o.priceEurT[0]}–{o.priceEurT[1]}/t</div>
                  <div className="fact"><span>Contract</span>{o.contract}</div>
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
            <div><h2>Profit per hectare <Synthetic>estimate</Synthetic></h2></div>
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
          <p className="note">Legumes in ochre.</p>
        </section>

        <section className="card reveal d5">
          <div className="cardhead">
            <div><h2>CAP support for legumes</h2></div>
          </div>
          <ul className="schemes">
            {capSchemes.map((s) => (
              <li key={s.id}>
                <span className="tick">✓</span>
                <div><b>{s.label}</b></div>
                <span className="amt">€{s.eurHa}<small>/ha</small></span>
              </li>
            ))}
          </ul>
          <Link className="link" href="/cap">Details {icons.arrow}</Link>
        </section>
      </div>
    </div>
  );
}
