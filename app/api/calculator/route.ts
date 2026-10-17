import { getCalculator } from "@/lib/providers";

export const GET = () => Response.json(getCalculator());
