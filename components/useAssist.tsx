"use client";
import { useState } from "react";

export type AssistReply = { text: string; source: "ai" | "rules" };
type Req = { kind: "page" | "offer" | "ask"; path?: string; offerId?: string; question?: string };

export function useAssist() {
  const [reply, setReply] = useState<AssistReply | null>(null);
  const [busy, setBusy] = useState(false);
  const run = async (req: Req) => {
    setBusy(true);
    try {
      const r = await fetch("/api/assist", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(req) });
      const j = await r.json();
      setReply(r.ok ? j : { text: "Sorry, I could not answer that right now.", source: "rules" });
    } catch {
      setReply({ text: "Sorry, I could not answer that right now.", source: "rules" });
    } finally {
      setBusy(false);
    }
  };
  return { reply, busy, run };
}

export const SourceTag = ({ source }: { source: "ai" | "rules" }) => (
  <span className={`ai-tag${source === "ai" ? " live" : ""}`}>{source === "ai" ? "AI" : "built-in"}</span>
);
