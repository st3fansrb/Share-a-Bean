import { getOpportunities } from "@/lib/providers";

export const GET = () => Response.json(getOpportunities());
