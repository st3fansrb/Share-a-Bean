import { Suspense } from "react";
import ShareForm from "./ShareForm";
import { Synthetic } from "@/components/Tag";

export default function Page() {
  return (
    <>
      <h1>Your Data, You Decide <Synthetic>selective disclosure</Synthetic></h1>
      <p className="lede">
        Pick the fields a buyer sees. The rest stays with you.
      </p>
      <Suspense fallback={<div className="card muted">Loading sharing form...</div>}>
        <ShareForm />
      </Suspense>
    </>
  );
}
