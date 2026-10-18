import Link from "next/link";
import { icons } from "@/components/Icons";
import { Synthetic } from "@/components/Tag";
import { offerData, cropData, capSchemes } from "@/lib/data";
import { marginPerHa } from "@/lib/calc";
import capNews from "@/data/cap-news.json";
import "./home.css";

type Id = keyof typeof cropData;
const coupled = capSchemes.find((s) => s.id === "coupled-protein")?.eurHa ?? 0;
const margin = (id: Id) => marginPerHa({ ...cropData[id], supportEurHa: cropData[id].legume ? coupled : 0 });
const eur = (n: number) => Math.round(n).toLocaleString("en-GB");

const steps = [
  { n: "1", title: "Know the buyer", text: "Who near you wants faba bean, pea or lupin, and at what price.", href: "/opportunities", cta: "See buyers" },
  { n: "2", title: "Know the money", text: "Legumes against wheat, per hectare, with EU support.", href: "/calculator", cta: "Check my margin" },
  { n: "3", title: "Keep your data", text: "You choose what a buyer sees. Take it back any time.", href: "/farm", cta: "Open my farm" },
];

export default function Home() {
  const ids = Object.keys(cropData) as Id[];
  const rows = ids.map((id) => ({ id, m: margin(id) })).sort((a, b) => b.m - a.m);
  const max = Math.max(...rows.map((r) => r.m));
  return (
    <div className="home">
      <section className="hero reveal d1">
        <div className="herotext">
          <div className="eyebrow">Share-a-Bean · France demo</div>
          <h1>Know before <em>you sow.</em></h1>
          <p className="lede">Farmers want to grow beans, peas and lupin but do not know who will buy them. Buyers cannot find regional supply. We put both on one page.</p>
          <div className="actions">
            <Link className="btn" href="/opportunities">See buyers {icons.arrow}</Link>
            <Link className="btn ghost" href="/calculator">Check my margin</Link>
          </div>
          <div className="pills"><span>For farmers</span><span>For buyers</span><span>{offerData.length} demo buyer offers</span></div>
        </div>
        <div className="chart card">
          <div className="charthead">
            <h2>Profit per hectare</h2>
            <Synthetic>estimate</Synthetic>
          </div>
          <div className="hbars">
            {rows.map(({ id, m }) => (
              <div key={id} className={cropData[id].legume ? "hb legume" : "hb"}>
                <span className="hl">{cropData[id].label}</span>
                <span className="track"><span className="fill" style={{ width: `${Math.max(4, (m / max) * 100)}%` }} /></span>
                <span className="hv">€{eur(m)}</span>
              </div>
            ))}
          </div>
          <p className="note"><i /> Legumes, with CAP support</p>
        </div>
      </section>

      <ol className="steps reveal d2">
        {steps.map((s) => (
          <li key={s.n} className="card step">
            <span className="num">{s.n}</span>
            <h3>{s.title}</h3>
            <p>{s.text}</p>
            <Link className="link" href={s.href}>{s.cta} {icons.arrow}</Link>
          </li>
        ))}
      </ol>

      <section className="news reveal d3" aria-label="Latest on CAP support">
        <h2>Latest on CAP support</h2>
        <ul>
          {capNews.items.map((n) => (
            <li key={n.id}><span className="dot" aria-hidden /><b>{n.title}</b> <Synthetic>{n.status}</Synthetic></li>
          ))}
        </ul>
        <Link className="link" href="/cap">Read more {icons.arrow}</Link>
      </section>
    </div>
  );
}
