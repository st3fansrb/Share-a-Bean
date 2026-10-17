import Log from "./Log";
import { Synthetic } from "@/components/Tag";

export default function Page() {
  return (
    <>
      <h1>Contracts <Synthetic /></h1>
      <p className="lede">What you shared, with whom, and when. Stored in this browser only in the draft.</p>
      <Log />
    </>
  );
}
