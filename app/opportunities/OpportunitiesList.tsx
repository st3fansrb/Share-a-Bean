"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { offerData, cropLabel, cropData } from "@/lib/data";
import type { Offer } from "@/lib/contracts";
import { BuyerMap, TYPE_COLOR } from "@/components/BuyerMap";
import { BestOffer } from "@/components/BestOffer";
import { ExplainOffer } from "@/components/ExplainOffer";
import { icons } from "@/components/Icons";

export default function OpportunitiesList() {
  const [cropFilter, setCropFilter] = useState<string>("all");
  const [contractFilter, setContractFilter] = useState<string>("all");
  const [maxDistance, setMaxDistance] = useState<number>(100);
  const [selectedBuyer, setSelectedBuyer] = useState<string | null>(null);

  const filteredOffers = useMemo(() => {
    return (offerData as Offer[]).filter((o) => {
      if (cropFilter !== "all" && o.crop !== cropFilter) return false;
      if (contractFilter !== "all" && o.contract !== contractFilter) return false;
      if (o.distanceKm > maxDistance) return false;
      return true;
    });
  }, [cropFilter, contractFilter, maxDistance]);

  const crops = ["all", "faba", "pea", "lupin"];
  const contracts = ["all", "Forward", "Spot", "Cooperative"];

  return (
    <div className="opportunities-view">
      <BestOffer />

      {/* Map & Filters Combined Header */}
      <div className="card" style={{ marginBottom: 24, padding: 20 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 24, alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h2 style={{ fontSize: 18, margin: "0 0 6px 0" }}>Local Demand Map</h2>
            <p className="muted" style={{ margin: 0, fontSize: 14 }}>
              10 buyers around Centre-Val de Loire. Click a buyer to filter or view terms.
            </p>
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", fontSize: 12 }}>
            {Object.entries(TYPE_COLOR).map(([type, color]) => (
              <span key={type} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: color }} />
                {type}
              </span>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, marginTop: 16, alignItems: "center" }}>
          <div style={{ maxWidth: 340, margin: "0 auto" }}>
            <BuyerMap />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, display: "block", marginBottom: 6, color: "var(--text-soft)" }}>
                Filter by Crop
              </label>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {crops.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCropFilter(c)}
                    className="btn"
                    style={{
                      padding: "4px 10px",
                      fontSize: 12,
                      background: cropFilter === c ? "var(--forest-1)" : "var(--card-bg, #fff)",
                      color: cropFilter === c ? "#fff" : "var(--text)",
                      border: "1px solid var(--line)",
                    }}
                  >
                    {c === "all" ? "All crops" : cropLabel(c)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, display: "block", marginBottom: 6, color: "var(--text-soft)" }}>
                Contract Type
              </label>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {contracts.map((ct) => (
                  <button
                    key={ct}
                    type="button"
                    onClick={() => setContractFilter(ct)}
                    className="btn"
                    style={{
                      padding: "4px 10px",
                      fontSize: 12,
                      background: contractFilter === ct ? "var(--forest-1)" : "var(--card-bg, #fff)",
                      color: contractFilter === ct ? "#fff" : "var(--text)",
                      border: "1px solid var(--line)",
                    }}
                  >
                    {ct === "all" ? "All contracts" : ct}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                <span style={{ fontWeight: 600, color: "var(--text-soft)" }}>Maximum Distance</span>
                <b>{maxDistance >= 100 ? "Any distance (up to 100 km)" : `Within ${maxDistance} km`}</b>
              </div>
              <input
                type="range"
                min="20"
                max="100"
                step="10"
                value={maxDistance}
                onChange={(e) => setMaxDistance(Number(e.target.value))}
                style={{ width: "100%", accentColor: "var(--forest-1)" }}
              />
            </div>

            <div style={{ fontSize: 13, color: "var(--text-soft)", paddingTop: 4, borderTop: "1px solid var(--line-soft)" }}>
              Showing <b>{filteredOffers.length}</b> simulated buyers match.
            </div>
          </div>
        </div>
      </div>

      {/* Offer Cards */}
      <div className="grid">
        {filteredOffers.map((o) => {
          const avgPrice = Math.round((o.priceEurT[0] + o.priceEurT[1]) / 2);
          return (
            <div
              key={o.id}
              className="card"
              style={{
                borderLeft: `4px solid ${TYPE_COLOR[o.type] ?? "var(--forest-1)"}`,
                transition: "transform 0.15s ease",
              }}
            >
              <div className="row" style={{ alignItems: "flex-start", gap: 16 }}>
                <div style={{ flex: "2 1 220px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                    <h2 style={{ margin: 0, fontSize: 18 }}>{o.buyer}</h2>
                    <span className="chip legume" style={{ fontSize: 11 }}>{cropLabel(o.crop)}</span>
                    <span className="chip" style={{ fontSize: 11 }}>simulated</span>
                  </div>
                  <div className="muted" style={{ fontSize: 13 }}>
                    {o.type} · <b>{o.distanceKm} km</b> away · Delivery: <b>{o.delivery}</b>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-soft)", display: "block" }}>
                    Volume
                  </label>
                  <span style={{ fontSize: 15, fontWeight: 600 }}>{o.volumeT[0]}–{o.volumeT[1]} t</span>
                </div>

                <div>
                  <label style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-soft)", display: "block" }}>
                    Indicative Price
                  </label>
                  <span style={{ fontSize: 16, fontWeight: 700, color: "var(--forest-2)" }}>
                    €{o.priceEurT[0]}–{o.priceEurT[1]}<small style={{ fontSize: 11, fontWeight: 400 }}>/t</small>
                  </span>
                </div>

                <div>
                  <label style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-soft)", display: "block" }}>
                    Contract
                  </label>
                  <span className="chip" style={{ fontSize: 12 }}>{o.contract}</span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: "0 0 auto" }}>
                  <Link
                    className="btn"
                    style={{ fontSize: 13, padding: "8px 14px", textAlign: "center" }}
                    href={`/calculator?offer=${o.id}&crop=${o.crop}&price=${avgPrice}`}
                  >
                    What would I earn?
                  </Link>
                  <Link
                    className="btn ghost"
                    style={{ fontSize: 12, padding: "6px 12px", textAlign: "center" }}
                    href={`/share?offer=${o.id}`}
                  >
                    Share fields with this buyer {icons.arrow}
                  </Link>
                </div>
              </div>

              <ExplainOffer offerId={o.id} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
