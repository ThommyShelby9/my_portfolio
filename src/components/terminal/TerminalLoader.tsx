'use client';

import dynamic from 'next/dynamic';
import type { TerminalProps } from './Terminal';

// Client only (`ssr: false` must live in a client component): the shell has no server HTML,
// and its code loads with /terminal alone. Without JS, the page's <noscript> links stand in.
const Terminal = dynamic(() => import('./Terminal').then((m) => m.Terminal), {
  ssr: false,
  // A quiet placeholder while the shell loads (no prompt text: it must stay out of the initial JS).
  loading: () => <p aria-hidden="true" className="px-4 py-4 font-mono text-[12.5px] text-faint sm:px-6 sm:py-5">…</p>,
});

export function TerminalLoader(props: TerminalProps) {
  return <Terminal {...props} />;
}
