"use client";
import { useState } from "react";
import Link from "next/link";
import type { CapData, CapProgramme } from "@/lib/contracts";
import { icons } from "@/components/Icons";
import { Synthetic } from "@/components/Tag";
import "./cap.css";

function Row({ p }: { p: CapProgramme }) {
  return (
    <li className="prog">
      <details>
        <summary>
          <span className="progt"><b>{p.title}</b><span>{p.what}</span></span>
          <span className="progamount">{p.amount}</span>
        </summary>
        <p className="note">How to qualify</p>
        <ul>{p.eligibility.map((x) => <li key={x}>{x}</li>)}</ul>
        {p.note && <p className="note">{p.note}</p>}
      </details>
    </li>
  );
}

export default function CapBenefits({ cap }: { cap: CapData }) {
  const [more, setMore] = useState(false);
  const now = cap.programmes.filter((p) => p.status === "active");
  const next = cap.programmes.filter((p) => p.status !== "active");
  return (
    <div className="cap">
      <section aria-label="Active now">
        <h2>Active now</h2>
        <ul className="progs">{now.map((p) => <Row key={p.id} p={p} />)}</ul>
      </section>
      <section aria-label="Coming next">
        <button className="link morebtn" onClick={() => setMore(!more)} aria-expanded={more}>
          {more ? "Hide what is coming" : "Show what is coming next"} {icons.arrow}
        </button>
        {more && <ul className="progs">{next.map((p) => <Row key={p.id} p={p} />)}</ul>}
      </section>
      <p className="note"><Link href="/calculator" className="link">See what it adds to your margin {icons.arrow}</Link></p>
      <p className="note capfoot"><Synthetic>estimate</Synthetic> Rates are from the 2023 to 2027 French plan and can change.</p>
    </div>
  );
}
