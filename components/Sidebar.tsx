"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { icons, BeanMark } from "./Icons";

const items = [
  { href: "/", label: "Home", icon: icons.home },
  { href: "/farm", label: "My Farm", icon: icons.farm },
  { href: "/opportunities", label: "Opportunities", icon: icons.opportunities },
  { href: "/contracts", label: "Contracts", icon: icons.contracts },
  { href: "/calculator", label: "Crop Calculator", icon: icons.calculator },
  { href: "/cap", label: "CAP Benefits", icon: icons.cap },
  { href: "/insights", label: "Market Insights", icon: icons.insights },
  { href: "/knowledge", label: "Knowledge Hub", icon: icons.knowledge, later: true },
];

export function Sidebar() {
  const path = usePathname();
  return (
    <aside className="side">
      <Link href="/" className="brand">
        <BeanMark />
        <div>
          <div className="brand-name">share-a-<i>byte</i></div>
          <small>Draft · France demo</small>
        </div>
      </Link>
      <nav className="nav">
        {items.map((i) => {
          const on = i.href === "/" ? path === "/" : path.startsWith(i.href);
          return (
            <Link key={i.href} href={i.href} className={`${on ? "on" : ""} ${i.later ? "later" : ""}`}>
              {i.icon}
              {i.label}
            </Link>
          );
        })}
      </nav>
      <div className="datacard">
        <b>Your data.<br />You decide.</b>
        Share chosen parcels and crops with one buyer at a time. Nothing else leaves your farm.
        <div><Link href="/share">Manage data sharing {icons.arrow}</Link></div>
      </div>
    </aside>
  );
}
