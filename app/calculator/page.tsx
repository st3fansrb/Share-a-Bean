import Calculator from "./Calculator";
import { Synthetic } from "@/components/Tag";

export default async function Page({ searchParams }: { searchParams: Promise<{ crop?: string; price?: string }> }) {
  const q = await searchParams;
  return (
    <>
      <h1>Crop Calculator <Synthetic>placeholder assumptions</Synthetic></h1>
      <p className="lede">Gross margin per hectare including CAP support, and a multi-year rotation with the legume nitrogen credit.</p>
      <Calculator initialCrop={q.crop} initialPrice={q.price ? +q.price : undefined} />
    </>
  );
}
