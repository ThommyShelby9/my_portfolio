'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { RefObject } from 'react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

type Props = {
  stage: RefObject<HTMLDivElement | null>;
  progress: RefObject<number>;
  onFadedChange: (faded: boolean) => void;
};

/** Desktop scroll trajectory of the sculpture. Loaded only with the 3D scene (dynamic chunk). */
export default function SculptureTrajectory({ stage, progress, onFadedChange }: Props) {
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference) and (min-width: 1024px)', () => {
      const el = stage.current;
      if (!el) return;
      el.setAttribute('data-trajectory', 'on');
      gsap.to(el, {
        xPercent: 12, scale: 0.88, opacity: 0, ease: 'none',
        scrollTrigger: {
          start: 0, end: () => innerHeight * 1.2, scrub: true,
          onUpdate: (self) => {
            progress.current = self.progress;
            onFadedChange(self.progress >= 0.999);
          },
        },
      });
      return () => {
        el.removeAttribute('data-trajectory');
        onFadedChange(false);
        progress.current = 0;
      };
    });
    return () => mm.revert();
  });
  return null;
}
