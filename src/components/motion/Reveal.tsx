'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRef, type ReactNode } from 'react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function Reveal({ children, className }: { children: ReactNode; className?: string }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const items = gsap.utils.toArray<HTMLElement>('[data-reveal]', root.current);
      const html = document.documentElement;
      const markRevealed = (el: HTMLElement) => el.setAttribute('data-revealed', '');
      if (html.classList.contains('reveal-done')) {
        // Safety net already showed everything: do not animate late.
        items.forEach(markRevealed);
        return;
      }
      html.classList.add('reveal-ready');
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        // Before the trigger fires, CSS keeps items hidden (no inline styles written).
        const tl = gsap.timeline({
          scrollTrigger: { trigger: root.current, start: 'top 85%', once: true },
        });
        items.forEach((el, i) => {
          tl.fromTo(
            el,
            { opacity: 0, y: 18 },
            {
              opacity: 1,
              y: 0,
              duration: 0.9,
              ease: 'power3.out',
              immediateRender: false,
              clearProps: 'transform',
              onStart: () => markRevealed(el),
            },
            i * 0.09,
          );
        });
      });
      mm.add('(prefers-reduced-motion: reduce)', () => {
        items.forEach(markRevealed);
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <div ref={root} className={className}>
      {children}
    </div>
  );
}
