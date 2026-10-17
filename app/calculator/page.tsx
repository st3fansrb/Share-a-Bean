import Calculator from "./Calculator";
import RegionalCalculator from "./RegionalCalculator";
import { offerData } from "@/lib/data";
import { CROPS, LEGS, type CropKey } from "@/lib/regional-calc";
import farm from "@/data/farm.json";
import { Synthetic } from "@/components/Tag";
import "./regional.css";

export default async function Page({ searchParams }: { searchParams: Promise<{ crop?: string; price?: string; offer?: string }> }) {
  const q = await searchParams;
  const offer = offerData.find((o) => o.id === q.offer);
  const crop = (offer?.crop ?? q.crop) as CropKey;
  const price = q.price ? +q.price : offer ? Math.round((offer.priceEurT[0] + offer.priceEurT[1]) / 2) : undefined;
  // The farm's own region (Centre-Val de Loire = FRB0) is where the offer would be delivered.
  const prefill = LEGS.includes(crop) && crop in CROPS
    ? { crop, price, region: farm.region.startsWith("Centre") ? "FRB0" : undefined, label: offer ? offer.buyer : "Selected crop", offerId: offer?.id }
    : undefined;
  return (
    <>
      <h1>Calculator <Synthetic>estimate</Synthetic></h1>
      <p className="lede">Would a legume beat your usual crop?</p>
      <RegionalCalculator prefill={prefill} />
      <h2 style={{ marginTop: 40 }}>Try your own numbers</h2>
      <Calculator initialCrop={q.crop} initialPrice={q.price ? +q.price : undefined} />
    </>
  );
}
