/**
 * Web Vitals report collector helper for client-side field data
 */
export interface WebVitalMetric {
  id: string;
  name: "FCP" | "LCP" | "CLS" | "FID" | "TTFB" | "INP";
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  delta: number;
}

export function reportWebVitals(metric: WebVitalMetric) {
  if (process.env.NODE_ENV === "development") {
    console.log(`[Web Vitals] ${metric.name}:`, metric.value, `(${metric.rating})`);
  }
}
