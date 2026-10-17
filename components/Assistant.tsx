"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import "./assist.css";
import { useAssist, SourceTag } from "./useAssist";
import { suggestedQuestions } from "@/lib/explain";

export function Assistant() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const { reply, busy, run } = useAssist();
  const ask = (question: string) => { if (question.trim()) run({ kind: "ask", question }); };
  return (
    <>
      {open && (
        <div className="assist-panel" role="dialog" aria-label="Help">
          <h3>Help</h3>
          <button className="btn ghost" disabled={busy} onClick={() => run({ kind: "page", path })}>Explain this page</button>
          <div className="qs">
            {suggestedQuestions.map((s) => <button key={s} className="q" onClick={() => { setQ(s); ask(s); }}>{s}</button>)}
          </div>
          <form onSubmit={(e) => { e.preventDefault(); ask(q); }}>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ask in your own words" maxLength={300} />
            <button className="btn" disabled={busy}>Ask</button>
          </form>
          {busy && <p className="muted">Thinking…</p>}
          {reply && !busy && <p className="ai-answer">{reply.text}<SourceTag source={reply.source} /></p>}
        </div>
      )}
      <button className="btn assist-fab" onClick={() => setOpen(!open)} aria-expanded={open}>{open ? "Close" : "Help"}</button>
    </>
  );
}
