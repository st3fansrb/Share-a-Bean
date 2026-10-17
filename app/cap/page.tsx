import CapBenefits from "./CapBenefits";
import { getCap } from "@/lib/providers";

export default function Page() {
  const cap = getCap().data;
  return (
    <>
      <h1>CAP support</h1>
      <p className="lede">Which rules apply to legumes, what is coming, and how to qualify.</p>
      <CapBenefits cap={cap} />
    </>
  );
}
