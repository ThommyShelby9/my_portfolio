export interface ExtractedNumber { raw: string; key: string; isMetric: boolean }

// A number, optionally signed (+, -, U+2212), with optional thousands groups
// separated by comma, space, no-break space or narrow no-break space,
// an optional decimal part, an optional % and an optional trailing +.
const NUMBER =
  /(?<![\p{L}\p{N}.,])([+\-−])?(\d{1,3}(?:[,   ]\d{3})+|\d+)(?:\.(\d+))?(\s?%)?(\+)?/gu;

export function extractNumbers(text: string): ExtractedNumber[] {
  const found: ExtractedNumber[] = [];
  for (const m of text.matchAll(NUMBER)) {
    const [raw, sign, intPart, decimals, percent, plus] = m;
    const digits = intPart.replace(/[,   ]/g, '');
    const value = Number(decimals ? `${digits}.${decimals}` : digits);
    const grouped = digits !== intPart;
    const isYear = !grouped && !decimals && !percent && !plus && !sign && value >= 1900 && value <= 2100;
    const isMetric = Boolean(percent || sign || plus) || (value >= 100 && !isYear);
    const key = `${decimals ? `${digits}.${decimals}` : digits}${percent ? '%' : ''}`;
    found.push({ raw: raw.trim(), key, isMetric });
  }
  return found;
}

export function findUnsourcedMetrics(text: string, proofs: readonly { text: string }[]): string[] {
  const sourced = new Set(proofs.flatMap((p) => extractNumbers(p.text).map((n) => n.key)));
  const reported = new Set<string>();
  const result: string[] = [];
  for (const n of extractNumbers(text)) {
    if (!n.isMetric || sourced.has(n.key) || reported.has(n.key)) continue;
    reported.add(n.key);
    result.push(n.raw);
  }
  return result;
}
