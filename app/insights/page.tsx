import { cropData } from "@/lib/data";
import { Synthetic } from "@/components/Tag";

export default function Page() {
  const rows = Object.values(cropData);
  const max = Math.max(...rows.map((c) => c.yieldTHa));
  return (
    <>
      <h1>Yields <Synthetic>estimate</Synthetic></h1>
      <p className="lede">Tonnes per hectare, by crop.</p>
      <div className="card">
        {rows.map((c) => (
          <div key={c.label} className="bar">
            <span>{c.label}</span>
            <div style={{ width: `${(c.yieldTHa / max) * 100}%`, background: "var(--green, #3b7a3b)", height: 14 }} />
            <span>{c.yieldTHa} t/ha</span>
          </div>
        ))}
      </div>
    </>
  );
}
