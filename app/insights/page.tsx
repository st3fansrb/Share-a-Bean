import MarketInsights from "./MarketInsights";
import { getCalculator, getInsights } from "@/lib/providers";

export default function Page() {
  const calc = getCalculator().data;
  const legumes = calc.crops.filter((c) => c.legume);
  const wheat = calc.crops.find((c) => c.id === "wheat")!;
  return (
    <>
      <h1>Market insights</h1>
      <p className="lede">Prices, money per hectare and where to sell.</p>
      <MarketInsights
        legumes={legumes} wheat={wheat}
        nitrogenCreditKgHa={calc.nitrogenCreditKgHa} nitrogenEurKg={calc.nitrogenEurKg}
        rows={getInsights().data.rows}
      />
    </>
  );
}
