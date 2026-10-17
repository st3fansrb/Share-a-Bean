import farm from "@/data/farm.json";
import offers from "@/data/offers.json";
import crops from "@/data/crops.json";
import cap from "@/data/cap.json";

export type CropId = keyof typeof crops.crops;

export const farmData = farm;
export const offerData = offers.offers;
export const cropData = crops.crops;
export const capSchemes = cap.schemes;
export const nitrogen = {
  creditKgHa: crops.nitrogenCreditKgHa,
  eurKg: crops.nitrogenEurKg,
};

export const cropLabel = (id: string) =>
  (cropData as Record<string, { label: string }>)[id]?.label ?? id;
