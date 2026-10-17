import { rankedForDemoFarm } from "@/lib/advice";

export const GET = () => Response.json({ meta: { provenance: "derived", source: "rules on placeholder crop numbers" }, data: { ranked: rankedForDemoFarm() } });
