'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

// The referrer only describes how the visit started: client-side navigations keep
// document.referrer unchanged, so it is sent with the first hit only.
let firstHit = true;

const SID_KEY = 'rv-sid';
const VISITS_KEY = 'rv-visits';
const ME_KEY = 'rv-me';

type VisitFields = { me: true } | { sid: string; n: number; lang?: string; scr?: string; src?: string };

/**
 * What the owner's visit notice needs, kept on the device only: a random visit id for this tab
 * (sessionStorage, gone when the tab closes) and how many visits this browser made (localStorage).
 * `?moi=1` marks the owner's own browser so his visits are never announced; `?moi=0` undoes it.
 */
function visitFields(first: boolean): VisitFields | null {
  try {
    const params = new URLSearchParams(location.search);
    const me = params.get('moi');
    if (me === '1') localStorage.setItem(ME_KEY, '1');
    if (me === '0') localStorage.removeItem(ME_KEY);
    if (localStorage.getItem(ME_KEY) === '1') return { me: true };
    let sid = sessionStorage.getItem(SID_KEY);
    let n = Number(localStorage.getItem(VISITS_KEY)) || 0;
    if (!sid) {
      sid = typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`;
      sessionStorage.setItem(SID_KEY, sid);
      n += 1;
      localStorage.setItem(VISITS_KEY, String(n));
    }
    if (!first) return { sid, n: Math.max(n, 1) };
    const src = params.get('utm_source') ?? undefined;
    return { sid, n: Math.max(n, 1), lang: navigator.language, scr: `${screen.width}x${screen.height}`, src };
  } catch {
    // Storage blocked (private mode, strict settings): the view is still counted, just not announced.
    return null;
  }
}

/** Cookieless page counter: one sendBeacon per page view to /api/hit. Renders nothing, never throws. */
export function HitBeacon() {
  const pathname = usePathname();
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;
    const send = () => {
      try {
        if (typeof navigator.sendBeacon !== 'function') return;
        const first = firstHit;
        const ref = first ? document.referrer : '';
        firstHit = false;
        navigator.sendBeacon('/api/hit', JSON.stringify({ path: location.pathname, ref, ...visitFields(first) }));
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
