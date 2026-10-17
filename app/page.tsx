import Link from "next/link";
import { farmData, offerData } from "@/lib/data";
import { Synthetic } from "@/components/Tag";

export default function Home() {
  const area = farmData.parcels.reduce((s, p) => s + p.area, 0);
  return (
    <>
      <h1>Find out if legumes pay off. Then share what you choose.</h1>
      <p className="lede">
        {farmData.name}. This is a draft with synthetic data, built page by page.
      </p>
      <div className="grid three">
        <Link href="/opportunities" className="card">
          <h2>Opportunities</h2>
          <div className="big">{offerData.length}</div>
          <div className="muted">legume buyers near you <Synthetic /></div>
        </Link>
        <Link href="/farm" className="card">
          <h2>My Farm</h2>
          <div className="big">{area} ha</div>
          <div className="muted">{farmData.parcels.length} parcels <Synthetic /></div>
        </Link>
        <Link href="/calculator" className="card">
          <h2>Crop Calculator</h2>
          <div className="big">per ha</div>
          <div className="muted">margin and rotation, with support</div>
        </Link>
      </div>
    </>
  );
}
