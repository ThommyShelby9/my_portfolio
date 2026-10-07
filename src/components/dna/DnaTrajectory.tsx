'use client';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, type RefObject } from 'react';
import { traversal } from '@/lib/dna/traversal';

interface Props {
  stage: RefObject<HTMLDivElement | null>;
  /** Helix state in [1, 5], read every frame by DnaCanvas. */
  state: RefObject<number>;
  /** Highlighted group, -1 for none. */
  focus: RefObject<number>;
  /** Traversal mix and depth, scrubbed by the scroll through `[data-dna-traverse]`. */
  tunnel: RefObject<{ mix: number; z: number }>;
}


/**
 * Maps the home's scenes to helix states (spec §4.1, §3.6). It never pins or hijacks the scroll:
 * each scene that reaches the middle of the viewport starts a short tween of the state, and blocks
 * marked `data-dna-focus` (or an opened « Séquencer ») light their group. Lives in the 3D chunk.
 */
export default function DnaTrajectory({ stage, state, focus, tunnel }: Props) {
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

    // The traversal is scrubbed: the flight follows the scroll position exactly, both ways.
    const space = document.querySelector<HTMLElement>('div[data-dna-traverse]');
    if (space) {
      triggers.push(
        ScrollTrigger.create({
          trigger: space,
          start: 'top bottom',
          // Done as soon as the next scene enters: its text never sits over the tunnel.
          end: 'bottom 80%',
          onUpdate: (self) => {
            tunnel.current = traversal(self.progress);
            if (stage.current) {
              stage.current.dataset.dnaTunnel = tunnel.current.mix.toFixed(2);
              // No text over the traversal: the faded phone stage can light up fully meanwhile.
              stage.current.dataset.dnaFlying = String(tunnel.current.mix > 0.05);
            }
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
  }, [stage, state, focus, tunnel]);
  return null;
}
