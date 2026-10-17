"use client";
import "./assist.css";
import { useAssist, SourceTag } from "./useAssist";

export function ExplainOffer({ offerId, label = "Explain simply" }: { offerId: string; label?: string }) {
  const { reply, busy, run } = useAssist();
  return (
    <div>
      <button className="btn ghost" disabled={busy} onClick={() => run({ kind: "offer", offerId })}>{busy ? "Thinking…" : label}</button>
      {reply && <p className="ai-answer">{reply.text}<SourceTag source={reply.source} /></p>}
    </div>
  );
}
