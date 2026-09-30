'use client';

import dynamic from 'next/dynamic';
import type { TerminalProps } from './Terminal';

// Client only (`ssr: false` must live in a client component): the shell has no server HTML,
// and its code loads with /terminal alone. Without JS, the page's <noscript> links stand in.
const Terminal = dynamic(() => import('./Terminal').then((m) => m.Terminal), { ssr: false });

export function TerminalLoader(props: TerminalProps) {
  return <Terminal {...props} />;
}
