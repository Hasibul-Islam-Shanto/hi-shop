import type { DecimalValue } from "@/features/products/schemas/types";

export const parseDecimal = (
  value: DecimalValue | number | undefined,
): number => {
  if (value === undefined || value === null) return 0;
  if (typeof value === "number") return value;
  if (!value.d || value.d.length === 0) return 0;

  const LOG_BASE = 7;
  let digitStr = value.d[0].toString();
  for (let i = 1; i < value.d.length; i++) {
    digitStr += value.d[i].toString().padStart(LOG_BASE, "0");
  }

  const intDigits = value.e + 1;
  let numStr: string;
  if (intDigits >= digitStr.length) {
    numStr = digitStr + "0".repeat(intDigits - digitStr.length);
  } else if (intDigits <= 0) {
    numStr = "0." + "0".repeat(-intDigits) + digitStr;
  } else {
    numStr = digitStr.slice(0, intDigits) + "." + digitStr.slice(intDigits);
  }

  return value.s * parseFloat(numStr);
};
