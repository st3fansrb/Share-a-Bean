import type { ShareRecord } from "@/lib/contracts";

export const SHARED_STORAGE_KEY = "sab-shared-records-v1";

export function getSharedRecords(): ShareRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SHARED_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ShareRecord[]) : [];
  } catch {
    return [];
  }
}

export function saveSharedRecord(record: ShareRecord): void {
  if (typeof window === "undefined") return;
  const list = getSharedRecords().filter((r) => r.id !== record.id);
  list.unshift(record);
  try {
    localStorage.setItem(SHARED_STORAGE_KEY, JSON.stringify(list));
  } catch {}
}

export function revokeSharedRecord(id: string): void {
  const r = getSharedRecords().find((x) => x.id === id);
  if (r) saveSharedRecord({ ...r, active: false });
}
