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
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.fromTo(
          items,
          { opacity: 0, y: 18 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: 'power3.out',
            stagger: 0.09,
            scrollTrigger: { trigger: root.current, start: 'top 85%', once: true },
            onStart: () => items.forEach((el) => el.setAttribute('data-revealed', '')),
          },
        );
      });
      mm.add('(prefers-reduced-motion: reduce)', () => {
        items.forEach((el) => el.setAttribute('data-revealed', ''));
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
