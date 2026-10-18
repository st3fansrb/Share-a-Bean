import Link from "next/link";
import { icons } from "@/components/Icons";
import "./home.css";

const steps = [
  { n: "1", title: "Know the buyer", text: "See who near you wants beans, peas or lupin, and at what price.", href: "/opportunities", cta: "See buyers" },
  { n: "2", title: "Know the money", text: "Compare legumes with wheat per hectare, support included.", href: "/calculator", cta: "Check my margin" },
  { n: "3", title: "Keep your data", text: "Add your fields. You choose what a buyer sees, and you can take it back.", href: "/farm", cta: "Open my farm" },
];

const more = [
  { href: "/cap", label: "CAP support", text: "What the EU pays for legumes" },
  { href: "/insights", label: "Market insights", text: "Prices and yields in France" },
  { href: "/knowledge", label: "Farmer advice", text: "Tips from other farmers" },
];

export default function Home() {
  return (
    <div className="home">
      <section className="entrance reveal d1">
        <div className="eyebrow">Share-a-Bean · France demo</div>
        <h1>Know before <em>you sow.</em></h1>
        <p className="lede">Share-a-Bean connects farmers who want to grow faba bean, field pea or lupin with buyers who need them.</p>
        <div className="actions">
          <Link className="btn" href="/opportunities">See buyers {icons.arrow}</Link>
          <Link className="btn ghost" href="/calculator">Check my margin</Link>
        </div>
      </section>

      <section className="reveal d2">
        <h2 className="sec">Who it is for</h2>
        <div className="who2">
          <div className="card">
            <h3>Farmers</h3>
            <p>Thinking about legumes but unsure who will buy them, or if they pay.</p>
          </div>
          <div className="card">
            <h3>Buyers</h3>
            <p>Mills, feed makers and biogas plants that need steady legume supply nearby.</p>
          </div>
        </div>
      </section>

      <section className="reveal d3">
        <h2 className="sec">How it helps</h2>
        <ol className="steps">
          {steps.map((s) => (
            <li key={s.n} className="card step">
              <span className="num">{s.n}</span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
              <Link className="link" href={s.href}>{s.cta} {icons.arrow}</Link>
            </li>
          ))}
        </ol>
      </section>

      <section className="reveal d4">
        <h2 className="sec">Also here</h2>
        <div className="more">
          {more.map((m) => (
            <Link key={m.href} href={m.href} className="card morelink">
              <b>{m.label}</b>
              <span className="muted">{m.text}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
