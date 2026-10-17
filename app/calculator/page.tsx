import Calculator from "./Calculator";
import RegionalCalculator from "./RegionalCalculator";
import { Synthetic } from "@/components/Tag";
import "./regional.css";

export default async function Page({ searchParams }: { searchParams: Promise<{ crop?: string; price?: string }> }) {
  const q = await searchParams;
  return (
    <>
      <h1>Crop Calculator <Synthetic>indicative costs</Synthetic></h1>
      <p className="lede">Pick a region and a legume to see its gross margin against a conventional crop, with CAP support and the effect on the next two years of the rotation.</p>
      <RegionalCalculator />
      <h2 style={{ marginTop: 40 }}>Your own field</h2>
      <p className="lede">Enter your own yield, price and cost for a single crop.</p>
      <Calculator initialCrop={q.crop} initialPrice={q.price ? +q.price : undefined} />
    </>
  );
}
