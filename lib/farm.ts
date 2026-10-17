// Demo import of an IACS-style parcel file (CSV), parsed in the browser. Nothing is uploaded.
import type { CropId, FarmContract, Parcel } from "@/lib/contracts";

const CROP_WORDS: Record<CropId, string[]> = {
  faba: ["faba", "faba bean", "fava", "field bean", "feverole", "féverole", "haricot"],
  lupin: ["lupin", "lupine", "lupins"],
  pea: ["pea", "peas", "field pea", "pois", "pois proteagineux", "pois protéagineux"],
  wheat: ["wheat", "winter wheat", "ble", "blé", "ble tendre", "blé tendre", "soft wheat"],
  rapeseed: ["rapeseed", "oilseed rape", "canola", "colza"],
  sunflower: ["sunflower", "tournesol"],
};

const norm = (s: string) => s.trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

export function cropFromText(raw: string): CropId | null {
  const t = norm(raw);
  for (const [id, words] of Object.entries(CROP_WORDS) as [CropId, string[]][]) {
    if (words.some((w) => norm(w) === t)) return id;
  }
  return null;
}

const HEADERS = {
  id: ["id", "parcel", "parcel_id", "parcelid", "ilot", "num_ilot", "field", "field_id"],
  crop: ["crop", "culture", "crop_name", "crop_code", "product", "cultivation"],
  area: ["area", "area_ha", "ha", "surface", "surface_ha", "size", "hectares"],
  ecoScheme: ["ecoscheme", "eco_scheme", "eco", "schemes", "scheme", "certification", "mesure_agro"],
};

export type ImportResult = { parcels: Parcel[]; errors: string[] };

export function parseParcelCsv(text: string): ImportResult {
  const lines = text.replace(/^﻿/, "").split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return { parcels: [], errors: ["The file needs a header row and at least one parcel."] };
  const sep = (lines[0].match(/;/g)?.length ?? 0) > (lines[0].match(/,/g)?.length ?? 0) ? ";" : ",";
  const split = (l: string) => l.split(sep).map((c) => c.trim().replace(/^"|"$/g, ""));
  const head = split(lines[0]).map(norm);
  const col = Object.fromEntries(
    Object.entries(HEADERS).map(([k, names]) => [k, head.findIndex((h) => names.includes(h))]),
  ) as Record<keyof typeof HEADERS, number>;
  const missing = (["id", "crop", "area"] as const).filter((k) => col[k] < 0);
  if (missing.length) return { parcels: [], errors: [`Missing column: ${missing.join(", ")}. Expected parcel id, crop, area in ha.`] };

  const parcels: Parcel[] = [];
  const errors: string[] = [];
  const seen = new Set<string>();
  lines.slice(1).forEach((line, i) => {
    const c = split(line);
    const n = i + 2;
    const id = c[col.id];
    const crop = cropFromText(c[col.crop] ?? "");
    const area = Number((c[col.area] ?? "").replace(",", "."));
    const ecoScheme = col.ecoScheme >= 0 && c[col.ecoScheme]?.trim() ? c[col.ecoScheme].trim() : undefined;
    if (!id) return void errors.push(`Row ${n}: no parcel id.`);
    if (seen.has(id)) return void errors.push(`Row ${n}: parcel ${id} appears twice.`);
    if (!crop) return void errors.push(`Row ${n}: crop "${c[col.crop] ?? ""}" is not one we track yet.`);
    if (!Number.isFinite(area) || area <= 0) return void errors.push(`Row ${n}: area must be a positive number of ha.`);
    seen.add(id);
    parcels.push({ id, crop, area, ...(ecoScheme ? { ecoScheme } : {}) });
  });
  return { parcels, errors };
}

export type Coverage = { crop: CropId; expectedT: number; committedT: number };

/** Expected harvest per crop vs. volume committed in non-future-harvest contracts. */
export function coverage(
  parcels: Parcel[],
  contracts: FarmContract[],
  yieldTHa: Record<string, number>,
  harvest: number,
): Coverage[] {
  const crops = [...new Set(contracts.filter((c) => c.harvest === harvest).map((c) => c.crop))];
  return crops.map((crop) => ({
    crop,
    expectedT: parcels.filter((p) => p.crop === crop).reduce((s, p) => s + p.area * (yieldTHa[crop] ?? 0), 0),
    committedT: contracts.filter((c) => c.harvest === harvest && c.crop === crop).reduce((s, c) => s + c.committedT, 0),
  }));
}
