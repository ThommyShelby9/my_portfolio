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
    const send = () => {
      try {
        if (typeof navigator.sendBeacon !== 'function') return;
        const ref = firstHit ? document.referrer : '';
        firstHit = false;
        navigator.sendBeacon('/api/hit', JSON.stringify({ path: location.pathname, ref }));
      } catch {
        // Counting is best effort: never disturb the page.
      }
    };
    // A prerendered page is only a view once the visitor activates it.
    if ((document as { prerendering?: boolean }).prerendering) {
      document.addEventListener('prerenderingchange', send, { once: true });
      return () => document.removeEventListener('prerenderingchange', send);
    }
    send();
  }, [pathname]);
  return null;
}
