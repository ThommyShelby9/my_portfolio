import { Fragment } from 'react';
import type { Locale } from '@/i18n/routing';
import { periodParts, type Period } from '@/lib/profile/cv-data';

/** A cv-data period as text, each month bound in a <time>: "<time>juil. 2025</time> – aujourd’hui". */
export function PeriodTime({ period, locale }: { period: Period; locale: Locale }) {
  return periodParts(period, locale).map((part, i) => (
    <Fragment key={i}>
      {i > 0 && ' – '}
      {part.dateTime ? <time dateTime={part.dateTime}>{part.label}</time> : part.label}
    </Fragment>
  ));
}
