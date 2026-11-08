/**
 * Compensation & Stipend Normalizer Utility
 * Normalizes varied ATS compensation disclosures ($/mo, $/yr, ₹/mo, ₹LPA, $/hr)
 * into standardized monthly take-home and annualized CTC estimates for Indian remote candidates.
 */

export interface NormalizedCompensation {
  raw: string;
  currency: "INR" | "USD" | "OTHER";
  monthlyInrEstimated: number | null;
  displayFormatted: string;
  annualEstimateFormatted: string;
  taxNote: string;
}

const USD_TO_INR_RATE = 86.5;

export function normalizeCompensation(stipendStr?: string): NormalizedCompensation {
  if (!stipendStr || typeof stipendStr !== "string") {
    return {
      raw: "Competitive / Disclosed upon interview",
      currency: "OTHER",
      monthlyInrEstimated: null,
      displayFormatted: "Competitive",
      annualEstimateFormatted: "Disclosed upon interview",
      taxNote: "Standard global contractor agreement"
    };
  }

  const raw = stipendStr.trim();
  const isUsd = /\$|usd/i.test(raw);
  const isInr = /₹|rs|inr|lpa|lakh/i.test(raw);

  // Match numbers
  const cleaned = raw.replace(/,/g, "");
  const numMatches = cleaned.match(/\d+(\.\d+)?/g);

  if (!numMatches || numMatches.length === 0) {
    return {
      raw,
      currency: isUsd ? "USD" : isInr ? "INR" : "OTHER",
      monthlyInrEstimated: null,
      displayFormatted: raw,
      annualEstimateFormatted: "Market Competitive",
      taxNote: "Review direct requisition offer"
    };
  }

  const primaryValue = parseFloat(numMatches[0]);

  // Hourly case: e.g. $30/hr or $35 / hour (assumes 160 hrs/mo)
  if (/(\/hr|\/hour|per hour|\bhr\b)/i.test(raw)) {
    const monthlyVal = primaryValue * 160;
    const monthlyInr = isUsd ? Math.round(monthlyVal * USD_TO_INR_RATE) : Math.round(monthlyVal);
    return {
      raw,
      currency: isUsd ? "USD" : "INR",
      monthlyInrEstimated: monthlyInr,
      displayFormatted: isUsd
        ? `$${Math.round(monthlyVal).toLocaleString()}/mo (est. ₹${Math.round(monthlyInr / 1000)}k)`
        : `₹${Math.round(monthlyVal).toLocaleString()}/mo`,
      annualEstimateFormatted: isUsd
        ? `~$${Math.round(monthlyVal * 12 / 1000)}k / year`
        : `~₹${(monthlyVal * 12 / 100000).toFixed(1)} LPA`,
      taxNote: isUsd ? "Export of services (0% GST with LUT + FIRC certificate)" : "TDS applicable at source"
    };
  }

  // Monthly case explicitly: /mo, /month, per month, pm
  const isExplicitMonthly = /(\/mo|\/month|per month|\bpm\b)/i.test(raw);

  // Yearly / LPA case: e.g. $80,000/year, $90k/yr, 15 LPA, 15 Lakh
  if (!isExplicitMonthly && (/(\/yr|\/year|annual|lpa|lakh|k(\b|\/))/i.test(raw) || (!isInr && primaryValue >= 25000) || (isInr && primaryValue >= 300000))) {
    let annualVal = primaryValue;
    if (primaryValue < 100 && /lpa|lakh/i.test(raw)) {
      annualVal = primaryValue * 100000;
    } else if (primaryValue < 1000 && /k/i.test(raw)) {
      annualVal = primaryValue * 1000;
    }

    const monthlyVal = annualVal / 12;
    const monthlyInr = isUsd ? Math.round(monthlyVal * USD_TO_INR_RATE) : Math.round(monthlyVal);

    return {
      raw,
      currency: isUsd ? "USD" : "INR",
      monthlyInrEstimated: monthlyInr,
      displayFormatted: isUsd
        ? `$${Math.round(monthlyVal).toLocaleString()}/mo (~₹${Math.round(monthlyInr / 1000)}k/mo)`
        : `₹${Math.round(monthlyVal).toLocaleString()}/mo (~₹${(annualVal / 100000).toFixed(1)} LPA)`,
      annualEstimateFormatted: isUsd
        ? `$${Math.round(annualVal).toLocaleString()} / year`
        : `₹${(annualVal / 100000).toFixed(1)} LPA`,
      taxNote: isUsd
        ? "0% GST on foreign remittance under Section 44ADA presump. tax"
        : "Standard Indian payroll withholding"
    };
  }

  // Monthly case (default for college stipends e.g. ₹75,000/month or $4,000/month)
  const monthlyVal = primaryValue;
  const monthlyInr = isUsd ? Math.round(monthlyVal * USD_TO_INR_RATE) : Math.round(monthlyVal);

  return {
    raw,
    currency: isUsd ? "USD" : isInr ? "INR" : "OTHER",
    monthlyInrEstimated: monthlyInr,
    displayFormatted: isUsd
      ? `$${Math.round(monthlyVal).toLocaleString()}/mo (~₹${Math.round(monthlyInr / 1000)}k/mo)`
      : `₹${Math.round(monthlyVal).toLocaleString()}/month`,
    annualEstimateFormatted: isUsd
      ? `~$${Math.round((monthlyVal * 12) / 1000)}k / year`
      : `~₹${((monthlyVal * 12) / 100000).toFixed(1)} LPA`,
    taxNote: isUsd ? "FIRC/Inward Remittance via Deel/Remote.com" : "Direct bank wire"
  };
}
