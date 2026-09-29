'use client';

import { createElement, useEffect, useRef, type ReactNode } from 'react';

type Props = { children: ReactNode; className?: string; as?: 'div' | 'section' | 'ul' | 'article' };

/**
 * Reveal-once for below-the-fold content. CSS owns the motion: items are hidden only while
 * `html.js` is present, motion is allowed and the layout's safety timer has not fired
 * (see globals.css). This component only flags items as they enter the viewport.
 */
export function Reveal({ children, className, as = 'div' }: Props) {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    document.documentElement.classList.add('reveal-ready');
    const items = Array.from(el.querySelectorAll<HTMLElement>('[data-reveal]'));
    items.forEach((item, i) => item.style.setProperty('--reveal-i', String(i % 6)));
    const show = (item: Element) => item.setAttribute('data-revealed', '');
    if (
      document.documentElement.classList.contains('reveal-done') ||
      matchMedia('(prefers-reduced-motion: reduce)').matches ||
      !('IntersectionObserver' in window)
    ) {
      items.forEach(show);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) { show(entry.target); io.unobserve(entry.target); }
      }),
      { rootMargin: '0px 0px -12% 0px' },
    );
    items.forEach((item) => io.observe(item));
    return () => io.disconnect();
  }, []);

  return createElement(as, { ref: root, className }, children);
}
