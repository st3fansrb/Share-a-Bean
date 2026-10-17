"use client";
import { useCallback, useEffect, useState } from "react";
import type { Parcel } from "@/lib/contracts";
import { farmData } from "@/lib/data";

const KEY = "sab-farm-import";
export type FarmSource = { kind: "demo" } | { kind: "file"; name: string };

/** Parcels for the demo farm, or the ones imported in this browser (never uploaded). */
export function useParcels() {
  const demo = farmData.parcels as Parcel[];
  const [parcels, setParcels] = useState<Parcel[]>(demo);
  const [source, setSource] = useState<FarmSource>({ kind: "demo" });

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) ?? "null");
      if (saved?.parcels?.length) { setParcels(saved.parcels); setSource({ kind: "file", name: saved.name }); }
    } catch {}
  }, []);

  const load = useCallback((next: Parcel[], name: string) => {
    setParcels(next); setSource({ kind: "file", name });
    try { localStorage.setItem(KEY, JSON.stringify({ name, parcels: next })); } catch {}
  }, []);
  const reset = useCallback(() => {
    setParcels(demo); setSource({ kind: "demo" });
    try { localStorage.removeItem(KEY); } catch {}
  }, [demo]);

  return { parcels, source, load, reset };
}
