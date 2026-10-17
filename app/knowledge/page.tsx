import Hub from "./Hub";
import { Synthetic } from "@/components/Tag";
import "./knowledge.css";

export default function Page() {
  return (
    <>
      <h1>Farmer advice <Synthetic>demo content</Synthetic></h1>
      <p className="lede">Ask nearby farms and compare your yield.</p>
      <Hub />
    </>
  );
}
