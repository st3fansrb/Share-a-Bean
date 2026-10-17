import { Synthetic } from "@/components/Tag";
import OpportunitiesList from "./OpportunitiesList";

export default function Opportunities() {
  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1>Buyers <Synthetic>demo offers</Synthetic></h1>
          <p className="lede">Who wants legumes near you.</p>
        </div>
      </div>
      <OpportunitiesList />
    </>
  );
}
