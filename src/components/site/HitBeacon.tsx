'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

// The referrer only describes how the visit started: client-side navigations keep
// document.referrer unchanged, so it is sent with the first hit only.
let firstHit = true;

/** Cookieless page counter: one sendBeacon per page view to /api/hit. Renders nothing, never throws. */
export function HitBeacon() {
  const pathname = usePathname();
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;
    try {
      if ((document.visibilityState as string) === 'prerender' || typeof navigator.sendBeacon !== 'function') return;
      const ref = firstHit ? document.referrer : '';
      firstHit = false;
      navigator.sendBeacon('/api/hit', JSON.stringify({ path: location.pathname, ref }));
    } catch {
      // Counting is best effort: never disturb the page.
    }
  }, [pathname]);
  return null;
}
