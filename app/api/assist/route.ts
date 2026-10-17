import { NextRequest } from "next/server";
import { rankedForDemoFarm } from "@/lib/advice";
import { cannedAnswer, explainPage, SYSTEM_PROMPT } from "@/lib/explain";

type Body = { kind: "page" | "offer" | "ask"; path?: string; offerId?: string; question?: string };
type Ranked = ReturnType<typeof rankedForDemoFarm>[number];

// Server-side facts: the model only sees numbers we computed, never client claims.
function offerFacts(r: Ranked) {
  const o = r.offer;
  return `Offer ${o.buyer} (${o.type}), ${o.crop}, ${o.priceEurT[0]}-${o.priceEurT[1]} EUR/t, ${o.volumeT[0]}-${o.volumeT[1]} t, ${o.contract} contract, ${o.distanceKm} km. ` +
    `Rank ${r.rank} for this farm. Estimated margin ${Math.round(r.marginEurHa)} EUR/ha, ${Math.round(r.gainEurHa)} EUR/ha versus the farm's current crops. ` +
    `Reasons: ${r.reasons.join(" ")} ${r.cautions.length ? "Cautions: " + r.cautions.join(" ") : ""}`;
}

function rulesOfferText(r: Ranked) {
  const cmp = r.gainEurHa >= 0
    ? `about ${Math.round(r.gainEurHa)} € more per hectare than what you grow now`
    : `about ${Math.round(-r.gainEurHa)} € less per hectare than what you grow now`;
  return `${r.offer.buyer} would pay roughly ${Math.round(r.netPriceEurT)} €/t after transport, ${cmp}. ${r.cautions[0] ?? ""}`.trim();
}

async function askClaude(prompt: string): Promise<string | null> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL ?? "claude-haiku-5-5",
        max_tokens: 250,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: prompt }],
      }),
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) return null;
    const j = await res.json();
    const t = j.content?.find((c: { type: string }) => c.type === "text")?.text;
    return typeof t === "string" ? t.trim() : null;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const b = (await req.json().catch(() => ({}))) as Body;
  const list = rankedForDemoFarm();
  let facts = "", fallback = "", task = "";

  if (b.kind === "offer") {
    const r = list.find((x) => x.offer.id === b.offerId);
    if (!r) return Response.json({ error: "unknown offer" }, { status: 404 });
    facts = offerFacts(r);
    fallback = rulesOfferText(r);
    task = "Explain simply why this offer is or is not a good fit for the farmer, and the one thing to watch.";
  } else if (b.kind === "page") {
    fallback = explainPage(String(b.path ?? "/"));
    facts = `Page: ${b.path}. Description: ${fallback}`;
    task = "Explain what this page is for, in plain words, so a farmer does not get lost.";
  } else if (b.kind === "ask") {
    const q = String(b.question ?? "").slice(0, 300);
    if (!q) return Response.json({ error: "empty question" }, { status: 400 });
    fallback = /best|offer|which/i.test(q) && list[0]
      ? `The best match right now is ${list[0].offer.buyer}. ${rulesOfferText(list[0])}`
      : cannedAnswer(q) ?? "I can explain the offers, contract types, EU support and the calculator. Try one of the suggested questions.";
    facts = `Top offers for this farm:\n${list.slice(0, 3).map(offerFacts).join("\n")}`;
    task = `Question from the farmer: ${q}`;
  } else {
    return Response.json({ error: "bad kind" }, { status: 400 });
  }

  const ai = await askClaude(`${facts}\n\n${task}`);
  return Response.json(ai ? { text: ai, source: "ai" } : { text: fallback, source: "rules" });
}
