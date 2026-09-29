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
      const fadeOut = document.querySelector('[data-sculpture-fade-out]');
      const back = document.querySelector('[data-sculpture-return]');
      const out = gsap.timeline({
        scrollTrigger: {
          start: 0,
          endTrigger: fadeOut ?? undefined,
          end: fadeOut ? 'top 40%' : () => `+=${innerHeight * 1.2}`,
          scrub: true,
          onUpdate: (self) => { progress.current = self.progress; },
        },
      });
      out.to(el, { xPercent: 12, scale: 0.88, opacity: 0, ease: 'none' });

      if (back) {
        gsap.fromTo(
          el,
          { xPercent: 12, scale: 0.88, opacity: 0 },
          {
            xPercent: 0, scale: 0.8, opacity: 1, ease: 'none', immediateRender: false,
            scrollTrigger: { trigger: back, start: 'top 90%', end: 'top 40%', scrub: true },
          },
        );
      }

      // Hidden (fully faded) only between the end of the fade-out and the start of the return.
      ScrollTrigger.create({
        trigger: fadeOut ?? document.body,
        start: fadeOut ? 'top 40%' : 'top top',
        endTrigger: back ?? undefined,
        end: back ? 'top 90%' : 'max',
        onToggle: (self) => onFadedChange(self.isActive),
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
