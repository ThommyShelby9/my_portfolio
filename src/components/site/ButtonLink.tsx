import type { ComponentProps } from 'react';
import { Link } from '@/i18n/navigation';

type Props = ComponentProps<typeof Link> & { variant?: 'primary' | 'ghost'; arrow?: boolean };

const base =
  'group inline-flex items-center gap-2.5 whitespace-nowrap rounded-[2px] px-5 py-3.5 text-[13.5px] font-semibold no-underline transition-colors';
const variants = {
  primary: 'bg-ivory text-graphite hover:bg-signal',
  ghost: 'border border-[#3a3936] text-ivory hover:border-signal hover:text-signal',
};

export function buttonClassName(variant: 'primary' | 'ghost'): string {
  return `${base} ${variants[variant]}`;
}

export function ButtonLink({ variant = 'primary', arrow = false, className = '', children, ...rest }: Props) {
  return (
    <Link {...rest} data-button className={`${buttonClassName(variant)} ${className}`}>
      {children}
      {arrow && (
        <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" focusable="false"
             className="transition-transform group-hover:translate-x-0.5">
          <path d="M2 7h10M8 3l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      )}
    </Link>
  );
}
