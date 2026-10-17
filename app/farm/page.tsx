import { farmData, cropLabel } from "@/lib/data";
import { Synthetic } from "@/components/Tag";

export default function Farm() {
  return (
    <>
      <h1>My Farm <Synthetic /></h1>
      <p className="lede">{farmData.name}. Parcels and crops (IACS-style demo data).</p>
      <div className="card">
        <table>
          <thead><tr><th>Parcel</th><th>Crop</th><th>Area (ha)</th></tr></thead>
          <tbody>
            {farmData.parcels.map((p) => (
              <tr key={p.id}><td>{p.id}</td><td>{cropLabel(p.crop)}</td><td>{p.area.toFixed(1)}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
