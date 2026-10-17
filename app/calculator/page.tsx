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
    ? { crop, price, region: farm.region.startsWith("Centre") ? "FRB0" : undefined, label: offer ? offer.buyer : "Selected crop" }
    : undefined;
  return (
    <>
      <h1>Crop Calculator <Synthetic>indicative costs</Synthetic></h1>
      <p className="lede">Pick a region and a legume to see its gross margin against a conventional crop, with CAP support and the effect on the next two years of the rotation.</p>
      <RegionalCalculator prefill={prefill} />
      <h2 style={{ marginTop: 40 }}>Your own field</h2>
      <p className="lede">Enter your own yield, price and cost for a single crop.</p>
      <Calculator initialCrop={q.crop} initialPrice={q.price ? +q.price : undefined} />
    </>
  );
}
