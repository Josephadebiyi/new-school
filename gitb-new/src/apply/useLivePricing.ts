import { useEffect, useState } from "react";
import { fetchConfig, fetchCourses } from "../services/api";

export interface LivePricingData {
  courses: any[];
  applicationFee: number;
}

// Module-level cache: the Apply pages aren't nested under one layout route
// (each renders its own <ApplyShell>), so without this every navigation
// between /apply, /apply/courses and /apply/courses/:slug would re-fetch.
let cache: LivePricingData | null = null;
let inflight: Promise<LivePricingData> | null = null;

export function useLivePricing(): LivePricingData | null {
  const [data, setData] = useState<LivePricingData | null>(cache);

  useEffect(() => {
    if (cache) {
      setData(cache);
      return;
    }
    if (!inflight) {
      inflight = Promise.all([fetchCourses(), fetchConfig()])
        .then(([courses, config]) => {
          cache = { courses, applicationFee: Number((config as any).applicationFee) || 25 };
          return cache;
        })
        .catch(() => {
          cache = { courses: [], applicationFee: 25 };
          return cache;
        });
    }
    inflight.then(setData);
  }, []);

  return data;
}

export function findLiveCourse(data: LivePricingData | null, slug: string) {
  return data?.courses.find((c: any) => c.slug === slug);
}

/** A short tuition label from live course data, falling back to "On request" when no price is set yet. */
export function liveTuitionLabel(live: any | undefined): string {
  if (!live) return "On request — ask admissions";
  if (Array.isArray(live.pricing_tiers) && live.pricing_tiers.length > 0) {
    const prices = live.pricing_tiers.map((t: any) => Number(t.price_monthly) || 0).filter((n: number) => n > 0);
    if (prices.length > 0) return `from €${Math.min(...prices)} / month`;
  }
  const upfront = Number(live.price?.upfront) || 0;
  const monthly = Number(live.price?.monthly) || 0;
  if (upfront > 0) return `€${upfront}${monthly > 0 ? ` or €${monthly}/mo` : ""}`;
  if (monthly > 0) return `€${monthly} / month`;
  return "On request — ask admissions";
}
