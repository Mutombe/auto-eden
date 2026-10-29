// Progressive priority loading helpers shared by the public site and the admin console.
import { useEffect, useRef, useState } from "react";

// Run low-priority work (prefetching the next page, warming chunks) when the browser is idle.
export function whenIdle(fn, timeout = 1500) {
  if (typeof window === "undefined") return () => {};
  if ("requestIdleCallback" in window) {
    const id = window.requestIdleCallback(fn, { timeout });
    return () => window.cancelIdleCallback(id);
  }
  const id = setTimeout(fn, 200);
  return () => clearTimeout(id);
}

/**
 * Chronological rendering: on a genuine first load, reveal items top-to-bottom one at a
 * time so skeletons are replaced in reading order. Returns how many items to show as real
 * content; the rest keep rendering as skeletons.
 *
 * Only the first arrival is staggered. Later updates (paging, filtering, optimistic edits)
 * return `count` immediately because previous data was on screen the whole time.
 */
export function useProgressiveReveal(count, ready, { step = 28 } = {}) {
  const [shown, setShown] = useState(0);
  const done = useRef(false);

  useEffect(() => {
    if (!ready || done.current) return;
    if (count === 0) {
      done.current = true;
      return;
    }
    let n = 1;
    setShown(1);
    const id = setInterval(() => {
      n += 1;
      setShown(n);
      if (n >= count) {
        clearInterval(id);
        done.current = true;
      }
    }, step);
    return () => clearInterval(id);
  }, [ready, count, step]);

  return done.current ? count : Math.min(shown, count);
}

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const num = new Intl.NumberFormat("en-US");

// The API returns decimals as strings ("10500.00"), so always coerce before formatting.
export const formatPrice = (v) => (v === null || v === undefined || v === "" || isNaN(Number(v)) ? "Price on request" : usd.format(Number(v)));
export const formatNumber = (v) => (v === null || v === undefined || v === "" || isNaN(Number(v)) ? "—" : num.format(Number(v)));
