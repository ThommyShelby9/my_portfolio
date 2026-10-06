'use client';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, type RefObject } from 'react';

interface Props {
  stage: RefObject<HTMLDivElement | null>;
  /** Helix state in [1, 5], read every frame by DnaCanvas. */
  state: RefObject<number>;
  /** Highlighted group, -1 for none. */
  focus: RefObject<number>;
}

/**
 * Maps the home's scenes to helix states (spec §4.1, §3.6). It never pins or hijacks the scroll:
 * each scene that reaches the middle of the viewport starts a short tween of the state, and blocks
 * marked `data-dna-focus` (or an opened « Séquencer ») light their group. Lives in the 3D chunk.
 */
export default function DnaTrajectory({ stage, state, focus }: Props) {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const proxy = { v: state.current };
    const mark = (target: number) => {
      if (stage.current) stage.current.dataset.dnaScene = String(target);
    };
    const go = (target: number) => {
      mark(target);
      gsap.to(proxy, {
        v: target,
        duration: 1.1,
        ease: 'power2.inOut',
        overwrite: true,
        onUpdate: () => { state.current = proxy.v; },
      });
    };

    const triggers: ScrollTrigger[] = [];
    for (const el of document.querySelectorAll<HTMLElement>('[data-dna-scene][data-dna-state]')) {
      const target = Number(el.dataset.dnaState);
      triggers.push(
        ScrollTrigger.create({
          trigger: el,
          start: 'top 55%',
          end: 'bottom 55%',
          onToggle: (self) => {
            if (!self.isActive) return;
            focus.current = -1;
            go(target);
          },
        }),
      );
    }
    for (const el of document.querySelectorAll<HTMLElement>('[data-dna-focus]')) {
      const n = Number(el.dataset.dnaFocus);
      triggers.push(
        ScrollTrigger.create({
          trigger: el,
          start: 'top 62%',
          end: 'bottom 38%',
          onToggle: (self) => {
            if (self.isActive) focus.current = n;
            else if (focus.current === n) focus.current = -1;
          },
        }),
      );
    }

    // « Séquencer » is a native <details>: opening one lights its pair.
    const onToggle = (e: Event) => {
      const details = e.target as HTMLDetailsElement;
      const host = details.closest<HTMLElement>('[data-dna-focus]');
      if (host && details.open) focus.current = Number(host.dataset.dnaFocus);
    };
    document.addEventListener('toggle', onToggle, true);

    mark(state.current);
    ScrollTrigger.refresh();
    return () => {
      document.removeEventListener('toggle', onToggle, true);
      triggers.forEach((t) => t.kill());
      gsap.killTweensOf(proxy);
    };
  }, [stage, state, focus]);
  return null;
}
