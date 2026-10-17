import { capSchemes } from "@/lib/data";
import { Synthetic } from "@/components/Tag";

export default function Page() {
  return (
    <>
      <h1>CAP support <Synthetic>rates to confirm</Synthetic></h1>
      <p className="lede">Payments you can get for growing legumes.</p>
      <div className="card"><table>
        <thead><tr><th>Payment</th><th>€ per ha</th></tr></thead>
        <tbody>{capSchemes.map((s) => <tr key={s.id}><td>{s.label}</td><td>{s.eurHa}</td></tr>)}</tbody>
      </table></div>
    </>
  );
}
