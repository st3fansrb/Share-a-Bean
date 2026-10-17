import ShareForm from "./ShareForm";
import { Synthetic } from "@/components/Tag";

export default function Page() {
  return (
    <>
      <h1>Your data, you decide <Synthetic /></h1>
      <p className="lede">Choose what a buyer sees. Nothing is shared without your tick.</p>
      <ShareForm />
    </>
  );
}
