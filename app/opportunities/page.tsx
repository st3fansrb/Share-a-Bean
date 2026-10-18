import { Synthetic } from "@/components/Tag";
import { rankedForDemoFarm } from "@/lib/advice";
import OpportunitiesList, { type PackageInfo } from "./OpportunitiesList";

export default function Opportunities() {
  const packages: Record<string, PackageInfo> = {};
  for (const r of rankedForDemoFarm()) {
    packages[r.offer.id] = { eurHa: Math.round(r.packageEurHa), gainEurHa: Math.round(r.packageGainEurHa), coveredYears: r.coveredYears, rank: r.rank };
  }
  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1>Buyers <Synthetic>demo offers</Synthetic></h1>
          <p className="lede">One buyer for your legume, one for your other crops, so the whole rotation is sold.</p>
        </div>
      </div>
      <OpportunitiesList packages={packages} />
    </>
  );
}
