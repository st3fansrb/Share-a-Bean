import Hub from "./Hub";
import { Synthetic } from "@/components/Tag";
import "./knowledge.css";

export default function Page() {
  return (
    <>
      <h1>Knowledge Hub <Synthetic>sample discussions</Synthetic></h1>
      <p className="lede">Ask farms like yours, and compare your season with published French yields. Yield figures are sourced; zone entries and threads are demo content.</p>
      <Hub />
    </>
  );
}
