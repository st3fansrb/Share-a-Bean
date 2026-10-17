"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { offerData, cropLabel } from "@/lib/data";
import { useParcels } from "@/lib/useParcels";
import { saveSharedRecord } from "@/lib/shares";
import type { ShareRecord, CropId } from "@/lib/contracts";

export const LOG_KEY = "sab-contracts-log";

export default function ShareForm() {
  const searchParams = useSearchParams();
  const initialOffer = searchParams.get("offer") ?? searchParams.get("offerId") ?? offerData[0].id;

  const { parcels: farmParcels } = useParcels();
  const [offer, setOffer] = useState(initialOffer);
  const [parcels, setParcels] = useState<string[]>([]);
  const [discloseCrop, setDiscloseCrop] = useState(true);
  const [discloseArea, setDiscloseArea] = useState(true);
  const [discloseEco, setDiscloseEco] = useState(true);
  const [discloseYield, setDiscloseYield] = useState(false);
  const [createdShare, setCreatedShare] = useState<ShareRecord | null>(null);

  useEffect(() => {
    if (initialOffer && offerData.some((o) => o.id === initialOffer)) {
      setOffer(initialOffer);
      // Automatically preselect parcels that match this offer's crop
      const o = offerData.find((x) => x.id === initialOffer);
      if (o) {
        const matching = farmParcels.filter((p) => p.crop === o.crop).map((p) => p.id);
        if (matching.length) setParcels(matching);
      }
    }
  }, [initialOffer, farmParcels]);

  const toggle = (id: string) => setParcels((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const save = () => {
    const o = offerData.find((x) => x.id === offer)!;
    const shareId = `share-${o.id}-${Date.now().toString(36)}`;
    const record: ShareRecord = {
      id: shareId,
      at: new Date().toISOString(),
      offerId: o.id,
      buyer: o.buyer,
      crop: o.crop as CropId,
      parcels,
      disclosedFields: {
        crop: discloseCrop,
        area: discloseArea,
        ecoScheme: discloseEco,
        yieldEstimate: discloseYield,
      },
      active: true,
    };

    saveSharedRecord(record);

    // Also update legacy log for backwards compatibility
    try {
      const log = JSON.parse(localStorage.getItem(LOG_KEY) ?? "[]");
      log.unshift({ at: record.at, buyer: o.buyer, crop: o.crop, parcels, shareId });
      localStorage.setItem(LOG_KEY, JSON.stringify(log));
    } catch {}

    setCreatedShare(record);
  };

  const selectedBuyerObj = offerData.find((x) => x.id === offer);

  return (
    <div className="card" style={{ maxWidth: 640 }}>
      <div style={{ marginBottom: 20 }}>
        <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }}>
          1. Buyer
        </label>
        <select
          value={offer}
          onChange={(e) => {
            setOffer(e.target.value);
            setCreatedShare(null);
          }}
          style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid var(--line)" }}
        >
          {offerData.map((o) => (
            <option key={o.id} value={o.id}>
              {o.buyer} — {o.type} ({cropLabel(o.crop)} · {o.distanceKm} km · {o.contract})
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
          <label style={{ fontSize: 13, fontWeight: 600 }}>
            2. Fields to share
          </label>
          <span style={{ fontSize: 12, color: "var(--text-soft)" }}>
            {parcels.length} of {farmParcels.length} fields selected
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: 12, background: "var(--bg, #fbf9f4)", borderRadius: 8 }}>
          {farmParcels.map((p) => {
            const isMatch = selectedBuyerObj && p.crop === selectedBuyerObj.crop;
            return (
              <label
                key={p.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  fontSize: 14,
                  cursor: "pointer",
                  padding: "6px 8px",
                  borderRadius: 6,
                  background: parcels.includes(p.id) ? "var(--card-bg, #fff)" : "transparent",
                }}
              >
                <input
                  type="checkbox"
                  checked={parcels.includes(p.id)}
                  onChange={() => {
                    toggle(p.id);
                    setCreatedShare(null);
                  }}
                  style={{ accentColor: "var(--forest-1)" }}
                />
                <span style={{ fontWeight: 600 }}>Field {p.id}:</span>
                <span>{cropLabel(p.crop)}</span>
                <span className="muted">({p.area} ha)</span>
                {p.ecoScheme && (
                  <span className="chip" style={{ fontSize: 10, background: "var(--line-soft)" }}>
                    {p.ecoScheme}
                  </span>
                )}
                {isMatch && (
                  <span className="chip legume" style={{ fontSize: 10, marginLeft: "auto" }}>
                    Buyer wants this
                  </span>
                )}
              </label>
            );
          })}
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 8 }}>
          3. What the buyer sees
        </label>
        <p className="muted" style={{ fontSize: 13, margin: "0 0 10px 0" }}>
          Unticked items stay with you.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 13 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input type="checkbox" checked={discloseCrop} onChange={(e) => setDiscloseCrop(e.target.checked)} />
            Crop
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input type="checkbox" checked={discloseArea} onChange={(e) => setDiscloseArea(e.target.checked)} />
            Area (ha)
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input type="checkbox" checked={discloseEco} onChange={(e) => setDiscloseEco(e.target.checked)} />
            CAP scheme
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input type="checkbox" checked={discloseYield} onChange={(e) => setDiscloseYield(e.target.checked)} />
            Expected yield
          </label>
        </div>
      </div>

      <div style={{ padding: "12px 14px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, marginBottom: 20, fontSize: 13, color: "#166534" }}>
        Your other {farmParcels.length - parcels.length} fields and your costs stay private. You can stop sharing any time.
      </div>

      <button
        className="btn"
        disabled={!parcels.length}
        onClick={save}
        style={{ width: "100%", padding: "12px 20px", fontSize: 15 }}
      >
        Share ({parcels.length} fields)
      </button>

      {createdShare && (
        <div
          style={{
            marginTop: 20,
            padding: 16,
            background: "var(--card-bg, #fff)",
            border: "2px solid var(--forest-1)",
            borderRadius: 8,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, color: "var(--forest-1)" }}>
            <span style={{ fontSize: 18 }}>✓</span>
            <b style={{ fontSize: 15 }}>Shared</b>
          </div>
          <p style={{ margin: "0 0 12px 0", fontSize: 13, color: "var(--text-soft)" }}>
            Demo: nothing leaves your browser. Shared with <b>{createdShare.buyer}</b>.
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            
            <Link
              href="/farm#shared"
              className="btn ghost"
              style={{ fontSize: 13, padding: "8px 14px", textDecoration: "none" }}
            >
              See in My Farm
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
