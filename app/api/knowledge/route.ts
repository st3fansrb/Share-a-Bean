import { getKnowledge } from "@/lib/providers";

export const GET = () => Response.json(getKnowledge());
