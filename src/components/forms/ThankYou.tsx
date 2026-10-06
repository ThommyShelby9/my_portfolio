import type { CSSProperties } from 'react';
import { ButtonLink } from '@/components/site/ButtonLink';

type Props = { kicker: string; title: string; text: string; home: string; work: string };

const hero = (i: number) => ({ '--hero-i': i }) as CSSProperties;

/** Confirmation after a brief or a message: what happens next, then a way back into the site. */
export function ThankYou({ kicker, title, text, home, work }: Props) {
  return (
    <section className="mx-auto flex min-h-[70svh] max-w-[1280px] flex-col justify-center px-5 py-[12vh] md:px-10">
      <p data-hero style={hero(0)} className="flex items-center gap-3 font-mono text-xs font-medium uppercase tracking-[0.14em] text-signal">
        <span aria-hidden="true" className="size-[7px] bg-signal" />
        {kicker}
      </p>
      <h1 data-hero style={hero(1)} className="mt-5 max-w-[18ch] font-display text-[clamp(44px,6vw,88px)] font-extrabold uppercase leading-[0.96] tracking-[-0.025em]">
        {title}
      </h1>
      <p data-hero style={hero(2)} className="mt-6 max-w-[48ch] text-[16.5px] leading-[1.7] text-muted">{text}</p>
      <div data-hero style={hero(3)} className="mt-10 flex flex-wrap gap-3.5 border-t border-line pt-10">
        <ButtonLink href="/realisations" variant="primary" arrow>{work}</ButtonLink>
        <ButtonLink href="/" variant="ghost">{home}</ButtonLink>
      </div>
    </section>
  );
}
