import { NextRequest } from "next/server";
import { rankedForDemoFarm } from "@/lib/advice";
import { cannedAnswer, explainPage, SYSTEM_PROMPT } from "@/lib/explain";

type Body = { kind: "page" | "offer" | "ask"; path?: string; offerId?: string; question?: string };
type Ranked = ReturnType<typeof rankedForDemoFarm>[number];

// Server-side facts: the model only sees numbers we computed, never client claims.
function offerFacts(r: Ranked) {
  const o = r.offer;
  return `Offer ${o.buyer} (${o.type}), ${o.crop}, ${o.priceEurT[0]}-${o.priceEurT[1]} EUR/t, ${o.volumeT[0]}-${o.volumeT[1]} t, ${o.contract} contract for ${o.years} year(s), ${o.town}, ${o.distanceKm} km. Paired with ${o.partner.buyer} (${o.partner.town}) for ${o.partner.crops.join(" and ")}. ` +
    `Package over a 3-year rotation: ${Math.round(r.packageEurHa)} EUR/ha a year, ${Math.round(r.packageGainEurHa)} EUR/ha versus now, covering ${r.coveredYears} of 3 years. ` +
    `Rank ${r.rank} for this farm. Estimated margin ${Math.round(r.marginEurHa)} EUR/ha, ${Math.round(r.gainEurHa)} EUR/ha versus the farm's current crops. ` +
    `Reasons: ${r.reasons.join(" ")} ${r.cautions.length ? "Cautions: " + r.cautions.join(" ") : ""}`;
}

function rulesOfferText(r: Ranked) {
  const cmp = r.packageGainEurHa >= 0
    ? `about ${Math.round(r.packageGainEurHa)} € more per hectare each year than what you grow now`
    : `about ${Math.round(-r.packageGainEurHa)} € less per hectare each year than what you grow now`;
  return `${r.offer.buyer} would pay roughly ${Math.round(r.netPriceEurT)} €/t after transport, ${cmp}. ${r.cautions[0] ?? ""}`.trim();
}

// Free-tier Gemini (Google AI Studio key). Returns null on any problem so the built-in text is used.
async function askModel(prompt: string): Promise<string | null> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  const model = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: "POST",
      headers: { "x-goog-api-key": key, "content-type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 120, temperature: 0.3, thinkingConfig: { thinkingBudget: 0 } },
      }),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return null;
    const j = await res.json();
    const t = j.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? "").join("");
    return typeof t === "string" && t.trim() ? t.trim() : null;
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

  const ai = await askModel(`${facts}\n\n${task}`);
  return Response.json(ai ? { text: ai, source: "ai" } : { text: fallback, source: "rules" });
}
