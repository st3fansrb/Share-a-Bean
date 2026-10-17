import { getFarm } from "@/lib/providers";

export const GET = () => Response.json(getFarm());
