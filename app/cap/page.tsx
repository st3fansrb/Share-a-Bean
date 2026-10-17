import { capSchemes } from "@/lib/data";
import { Synthetic } from "@/components/Tag";

export default function Page() {
  return (
    <>
      <h1>CAP Benefits <Synthetic>rates to verify</Synthetic></h1>
      <p className="lede">Support that applies when you grow legumes. Sources still to be added.</p>
      <div className="card"><table>
        <thead><tr><th>Scheme</th><th>€/ha</th><th>Source</th></tr></thead>
        <tbody>{capSchemes.map((s) => <tr key={s.id}><td>{s.label}</td><td>{s.eurHa}</td><td className="muted">{s.source}</td></tr>)}</tbody>
      </table></div>
    </>
  );
}
