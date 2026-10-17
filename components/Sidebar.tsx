"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { icons, BeanMark } from "./Icons";

const items = [
  { href: "/", label: "Home", icon: icons.home },
  { href: "/farm", label: "My Farm", icon: icons.farm },
  { href: "/opportunities", label: "Buyers", icon: icons.opportunities },
  { href: "/contracts", label: "Contracts", icon: icons.contracts },
  { href: "/calculator", label: "Calculator", icon: icons.calculator },
  { href: "/cap", label: "CAP support", icon: icons.cap },
  { href: "/insights", label: "Yields", icon: icons.insights },
  { href: "/knowledge", label: "Farmer advice", icon: icons.knowledge },
];

export function Sidebar() {
  const path = usePathname();
  return (
    <aside className="side">
      <Link href="/" className="brand">
        <BeanMark />
        <div>
          <div className="brand-name">share-a-<i>byte</i></div>
          <small>France demo</small>
        </div>
      </Link>
      <nav className="nav">
        {items.map((i) => {
          const on = i.href === "/" ? path === "/" : path.startsWith(i.href);
          return (
            <Link key={i.href} href={i.href} className={on ? "on" : ""}>
              {i.icon}
              {i.label}
            </Link>
          );
        })}
      </nav>
      <div className="datacard">
        <b>Your data.<br />You decide.</b>
        You choose what a buyer sees.
        <div><Link href="/share">Sharing {icons.arrow}</Link></div>
      </div>
    </aside>
  );
}
