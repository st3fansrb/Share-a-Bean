import { farmData, cropData } from "@/lib/data";
import { getFarm } from "@/lib/providers";
import { Synthetic } from "@/components/Tag";
import FarmContracts from "./FarmContracts";

export default function Farm() {
  const { data } = getFarm();
  const yields = Object.fromEntries(Object.entries(cropData).map(([k, v]) => [k, v.yieldTHa]));
  return (
    <>
      <h1>My Farm &amp; Contracts <Synthetic /></h1>
      <p className="lede">{farmData.name}</p>
      <FarmContracts contracts={data.contracts} yields={yields} />
    </>
  );
}
