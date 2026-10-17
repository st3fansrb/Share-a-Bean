// Pure margin arithmetic. All inputs are labelled assumptions in the UI.

export type CropInput = {
  yieldTHa: number;
  priceEurT: number;
  costEurHa: number;
  supportEurHa: number;
};

export function marginPerHa(c: CropInput): number {
  return c.yieldTHa * c.priceEurT + c.supportEurHa - c.costEurHa;
}

export type RotationYear = {
  crop: string;
  legume: boolean;
  input: CropInput;
};

// A legume leaves a nitrogen credit for the crop that follows it.
export function rotationMargins(
  years: RotationYear[],
  nCreditEurHa: number,
): { margin: number; nCredit: number }[] {
  return years.map((y, i) => {
    const prev = years[(i - 1 + years.length) % years.length];
    const nCredit = prev.legume && !y.legume ? nCreditEurHa : 0;
    return { margin: marginPerHa(y.input) + nCredit, nCredit };
  });
}

export const average = (xs: number[]) =>
  xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0;
