"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { offerData, cropLabel } from "@/lib/data";
import type { Offer } from "@/lib/contracts";
import { BuyerMap, TYPE_COLOR } from "@/components/BuyerMap";
import { BestOffer } from "@/components/BestOffer";
import { ExplainOffer } from "@/components/ExplainOffer";
import { icons } from "@/components/Icons";
import "./buyers.css";

export type PackageInfo = { eurHa: number; gainEurHa: number; coveredYears: number; rank: number };

const yearsLabel = (n: number) => `${n} year${n === 1 ? "" : "s"}`;
const cropList = (ids: string[]) => ids.map((c) => cropLabel(c).toLowerCase()).join(" and ");

export default function OpportunitiesList({ packages }: { packages: Record<string, PackageInfo> }) {
  const [cropFilter, setCropFilter] = useState("all");
  const [contractFilter, setContractFilter] = useState("all");
  const [maxDistance, setMaxDistance] = useState(300);
  const [open, setOpen] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const filteredOffers = useMemo(
    () =>
      (offerData as Offer[]).filter(
        (o) => (cropFilter === "all" || o.crop === cropFilter) && (contractFilter === "all" || o.contract === contractFilter) && o.distanceKm <= maxDistance,
      ),
    [cropFilter, contractFilter, maxDistance],
  );

  // First few buyers by default; a marker tap on a hidden one opens the full list.
  const FIRST = 4;
  const openIdx = filteredOffers.findIndex((o) => o.id === open);
  const expanded = showAll || openIdx >= FIRST;
  const shown = expanded ? filteredOffers : filteredOffers.slice(0, FIRST);

  // Tapping a marker opens its row and brings it into view.
  const select = (id: string | null) => {
    setOpen(id);
    if (id) requestAnimationFrame(() => document.getElementById(`offer-${id}`)?.scrollIntoView({ block: "nearest", behavior: "smooth" }));
  };

  return (
    <div className="buyers-layout">
      <aside className="buyers-side">
        <BestOffer compact />
        <div className="card" style={{ padding: 12 }}>
          <BuyerMap selected={open} onSelect={select} visible={filteredOffers.map((o) => o.id)} />
          <div className="buyers-legend">
            <span><i style={{ borderRadius: "50%", background: "var(--forest)" }} /> Legume buyer</span>
            <span><i style={{ background: "#b8761f" }} /> Second buyer</span>
          </div>
        </div>
      </aside>

      <section className="buyers-main">
        <div className="buyers-filters">
          <label>Crop
            <select value={cropFilter} onChange={(e) => setCropFilter(e.target.value)}>
              {["all", "faba", "pea", "lupin"].map((c) => <option key={c} value={c}>{c === "all" ? "All crops" : cropLabel(c)}</option>)}
            </select>
          </label>
          <label>Contract
            <select value={contractFilter} onChange={(e) => setContractFilter(e.target.value)}>
              {["all", "Forward", "Spot", "Cooperative"].map((c) => <option key={c} value={c}>{c === "all" ? "All contracts" : c}</option>)}
            </select>
          </label>
          <label>Distance
            <select value={maxDistance} onChange={(e) => setMaxDistance(Number(e.target.value))}>
              {[100, 150, 200, 300].map((d) => <option key={d} value={d}>{d >= 300 ? "Any distance" : `Within ${d} km`}</option>)}
            </select>
          </label>
          <span className="muted buyers-count">{filteredOffers.length} of {offerData.length} buyers</span>
        </div>

        <div className="buyers-list">
          {filteredOffers.length === 0 && <p className="muted" style={{ padding: 16 }}>No buyer matches. Widen a filter.</p>}
          {shown.map((o) => {
            const avgPrice = Math.round((o.priceEurT[0] + o.priceEurT[1]) / 2);
            const pkg = packages[o.id];
            const p = o.partner;
            const isOpen = open === o.id;
            return (
              <div key={o.id} id={`offer-${o.id}`} className={`brow${isOpen ? " open" : ""}`} style={{ borderLeftColor: TYPE_COLOR[o.type] ?? "var(--forest)" }}>
                <button type="button" className="brow-head" aria-expanded={isOpen} onClick={() => select(isOpen ? null : o.id)}>
                  <span className="brow-who">
                    <b>{o.buyer}</b> <span className="chip legume">{cropLabel(o.crop)}</span>
                    <small>{o.town} · {o.distanceKm} km · {o.contract} · {yearsLabel(o.years)}</small>
                  </span>
                  <span className="brow-price">€{o.priceEurT[0]}–{o.priceEurT[1]}<small>/t</small></span>
                  <span className="brow-pkg">{pkg ? <>{pkg.eurHa} €/ha<small>a year</small></> : null}</span>
                  <span className="brow-caret" aria-hidden>{isOpen ? "−" : "+"}</span>
                </button>

                {isOpen && (
                  <div className="brow-body">
                    <div className="brow-facts">
                      <div><small>Volume</small><b>{o.volumeT[0]}–{o.volumeT[1]} t</b></div>
                      <div><small>Delivery</small><b>{o.delivery}</b></div>
                      <div><small>Type</small><b>{o.type}</b></div>
                      <span className="chip" style={{ fontSize: 11 }}>simulated</span>
                    </div>
                    <div className="brow-second">
                      <small>Second buyer, for your other crops</small>
                      <div><b>{p.buyer}</b> · {p.type} · {p.town}, {p.distanceKm} km</div>
                      <div>Buys {cropList(p.crops)} · {p.premiumPct === 0 ? "market price" : `market price ${p.premiumPct > 0 ? "+" : "−"}${Math.abs(p.premiumPct)}%`} · {p.contract.toLowerCase()}, {yearsLabel(p.years)}</div>
                      {pkg && (
                        <div className="muted" style={{ marginTop: 4 }}>
                          {pkg.coveredYears >= 3 ? "Sold for the full 3-year rotation" : `Sold for ${pkg.coveredYears} of 3 years`} · <span className="chip" style={{ fontSize: 10 }}>estimate</span>
                        </div>
                      )}
                    </div>
                    <div className="brow-actions">
                      <Link className="btn" href={`/calculator?offer=${o.id}&crop=${o.crop}&price=${avgPrice}`}>What would I earn?</Link>
                      <Link className="btn ghost" href={`/share?offer=${o.id}`}>Share fields with this buyer {icons.arrow}</Link>
                      <ExplainOffer offerId={o.id} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {filteredOffers.length > FIRST && (
            <button type="button" className="btn ghost buyers-more" onClick={() => { if (expanded) { setShowAll(false); setOpen(null); } else setShowAll(true); }}>
              {expanded ? "Show fewer" : `Show all ${filteredOffers.length} buyers`}
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
