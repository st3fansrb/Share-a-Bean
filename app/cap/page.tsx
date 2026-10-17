import CapBenefits from "./CapBenefits";
import { getCap } from "@/lib/providers";
import { farmData, cropData, type CropId } from "@/lib/data";

export default function Page() {
  const cap = getCap().data;
  const areaHa = farmData.parcels.reduce((a, p) => a + p.area, 0);
  const legumeHa = farmData.parcels.filter((p) => cropData[p.crop as CropId]?.legume).reduce((a, p) => a + p.area, 0);
  return (
    <>
      <h1>CAP support</h1>
      <p className="lede">Which rules apply to legumes, what is coming, and how to qualify.</p>
      <CapBenefits cap={cap} areaHa={areaHa} legumeHa={legumeHa || 10} points={3} />
    </>
  );
}
