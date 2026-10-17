// Plain-language layer. Everything here works without an API key; the Claude
// API (app/api/assist) only rewords the same facts when a key is set.

export const pageExplainers: { prefix: string; text: string }[] = [
  { prefix: "/opportunities", text: "These are buyers who want to buy legumes. Each card shows how much they want, the price range and how you would be paid. Press \"Does it pay for me?\" to check your own numbers." },
  { prefix: "/calculator", text: "This compares a legume with wheat on your land: what you earn per hectare after costs, with the EU support included. Legumes also leave nitrogen in the soil, which saves fertiliser on the next crop." },
  { prefix: "/cap", text: "Extra EU money you can get for growing legumes. It is paid per hectare, on top of what you sell the crop for." },
  { prefix: "/insights", text: "How legumes and other crops did in your region in past years, so you can see if they suit your area." },
  { prefix: "/knowledge", text: "Short guides and yield figures on growing legumes, plus questions from other farmers." },
  { prefix: "/farm", text: "Your fields and what you grow on them. Everything else in the app starts from this." },
  { prefix: "/contracts", text: "Your running contracts with buyers, in one place." },
  { prefix: "/share", text: "You choose which fields and crops a buyer can see. You can switch it off at any time. Nothing else leaves your farm." },
  { prefix: "/", text: "Share-a-Bean helps you find buyers for faba bean, pea and lupin, check if they pay on your farm, and share only the data you choose." },
];

export const explainPage = (path: string) =>
  (pageExplainers.find((p) => p.prefix !== "/" && path.startsWith(p.prefix)) ?? pageExplainers[pageExplainers.length - 1]).text;

export const glossary: Record<string, string> = {
  spot: "Spot: you sell at today's price, no promise before harvest.",
  forward: "Forward: price agreed ahead of time, so you know your income early.",
  cooperative: "Cooperative: you deliver together with other farmers, good for small volumes.",
  cap: "CAP: EU farm support. Legumes get a payment per hectare.",
  "gross margin": "Gross margin: what you sell minus the direct costs, per hectare.",
  nitrogen: "Nitrogen credit: legumes feed the soil, so the next crop needs less fertiliser.",
  rotation: "Rotation: the order of crops on a field over the years.",
};

export const suggestedQuestions = [
  "Which offer is best for me?",
  "What does spot or forward mean?",
  "Why grow legumes at all?",
];

/** Keyword answer used when no API key is set. */
export function cannedAnswer(q: string): string | null {
  const s = q.toLowerCase();
  const hits = Object.entries(glossary).filter(([k]) => s.includes(k)).map(([, v]) => v);
  if (hits.length) return hits.join(" ");
  if (/why|benefit|worth/.test(s) && /legume|bean|pea|lupin/.test(s))
    return "Legumes need little fertiliser, leave nitrogen for the next crop, and get EU support per hectare. Costs are low, so they can match wheat on profit.";
  return null;
}

export const SYSTEM_PROMPT =
  "You help a French farmer understand a legume marketplace (faba bean, field pea, lupin). " +
  "Answer in plain words, at most three short sentences, no jargon, no markdown. " +
  "Use only the facts given. If a number is not in the facts, do not invent one. " +
  "Numbers are demo estimates; say 'about' when quoting them.";
