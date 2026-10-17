"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { cropLabel } from "@/lib/data";
import { getSharedRecords, revokeSharedRecord } from "@/lib/shares";
import type { ShareRecord } from "@/lib/contracts";

export default function Log() {
  const [records, setRecords] = useState<ShareRecord[]>([]);

  const load = () => {
    setRecords(getSharedRecords());
  };

  useEffect(() => {
    load();
  }, []);

  const onRevoke = (id: string) => {
    if (confirm("Are you sure you want to revoke this buyer's access to your data?")) {
      revokeSharedRecord(id);
      load();
    }
  };

  if (!records.length) {
    return (
      <div className="card muted" style={{ textAlign: "center", padding: 24 }}>
        <p style={{ margin: "0 0 8px 0" }}>No data has been shared with buyers yet.</p>
        <Link href="/share" className="btn ghost" style={{ fontSize: 13 }}>
          Create First Share
        </Link>
      </div>
    );
  }

  return (
    <div className="card">
      <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid var(--line)", textAlign: "left" }}>
            <th style={{ padding: "8px 6px" }}>Authorized</th>
            <th style={{ padding: "8px 6px" }}>Buyer</th>
            <th style={{ padding: "8px 6px" }}>Crop</th>
            <th style={{ padding: "8px 6px" }}>Fields</th>
            <th style={{ padding: "8px 6px" }}>Status</th>
            <th style={{ padding: "8px 6px", textAlign: "right" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {records.map((r) => {
            return (
              <tr key={r.id} style={{ borderBottom: "1px solid var(--line-soft)" }}>
                <td style={{ padding: "10px 6px", whiteSpace: "nowrap" }}>
                  {new Date(r.at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                </td>
                <td style={{ padding: "10px 6px", fontWeight: 600 }}>{r.buyer}</td>
                <td style={{ padding: "10px 6px" }}>
                  <span className="chip legume" style={{ fontSize: 11 }}>{cropLabel(r.crop)}</span>
                </td>
                <td style={{ padding: "10px 6px" }}>
                  Fields: <b>{r.parcels.join(", ")}</b>
                </td>
                <td style={{ padding: "10px 6px" }}>
                  {!r.active ? (
                    <span className="chip" style={{ background: "#fee2e2", color: "#991b1b", fontSize: 11 }}>
                      Revoked
                    </span>
                  ) : (
                    <span className="chip" style={{ background: "#dcfce7", color: "#166534", fontSize: 11 }}>
                      Active
                    </span>
                  )}
                </td>
                <td style={{ padding: "10px 6px", textAlign: "right", whiteSpace: "nowrap" }}>
                  <div style={{ display: "inline-flex", gap: 6 }}>
                    
                    {r.active && (
                      <button
                        onClick={() => onRevoke(r.id)}
                        className="btn ghost"
                        style={{ padding: "4px 8px", fontSize: 11, color: "#b91c1c", borderColor: "#fca5a5" }}
                      >
                        Revoke
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="note" style={{ marginTop: 12 }}>
        Revoke any time. This is a demo log kept in your browser.
      </p>
    </div>
  );
}
