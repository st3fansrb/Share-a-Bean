import { redirect } from "next/navigation";

// My Farm and Contracts are one tab.
export default function Page() {
  redirect("/farm#contracts");
}
