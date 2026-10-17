"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", label: "Home" },
  { href: "/farm", label: "My Farm" },
  { href: "/opportunities", label: "Opportunities" },
  { href: "/contracts", label: "Contracts" },
  { href: "/calculator", label: "Crop Calculator" },
  { href: "/cap", label: "CAP Benefits" },
  { href: "/insights", label: "Market Insights" },
  { href: "/knowledge", label: "Knowledge Hub", later: true },
];

export function Sidebar() {
  const path = usePathname();
  return (
    <aside className="side">
      <div className="brand">
        share-a-byte
        <small>draft, France demo</small>
      </div>
      <nav className="nav">
        {items.map((i) => {
          const on = i.href === "/" ? path === "/" : path.startsWith(i.href);
          return (
            <Link key={i.href} href={i.href} className={`${on ? "on" : ""} ${i.later ? "later" : ""}`}>
              {i.label}
            </Link>
          );
        })}
      </nav>
      <div className="datacard">
        <b>Your data. You decide.</b>
        Share selected parcels and crops with a buyer, nothing else.
        <div style={{ marginTop: 10 }}>
          <Link href="/share" className="btn ghost">Manage data sharing</Link>
        </div>
      </div>
    </aside>
  );
}
