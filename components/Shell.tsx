"use client";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";

export function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  if (path === "/") return <>{children}</>;
  return (
    <div className="shell">
      <Sidebar />
      <main className="main">{children}</main>
    </div>
  );
}
