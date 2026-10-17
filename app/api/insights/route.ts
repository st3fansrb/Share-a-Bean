import { getInsights } from "@/lib/providers";

export const GET = () => Response.json(getInsights());
