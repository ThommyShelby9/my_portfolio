import 'server-only';
import { dayKey } from './stats';

/** Recorded hits a whole process accepts per Porto-Novo day. */
export const HIT_DAILY_CAP = 5000;

export interface DailyCap {
  /** True and counted while today's total is under the cap; false (nothing counted) beyond it. */
  take(now?: Date): boolean;
}

/** A per-process counter that starts again at each Porto-Novo midnight. */
export function createDailyCap(max: number): DailyCap {
  let day = '';
  let count = 0;
  return {
    take(now = new Date()) {
      const today = dayKey(now);
      if (today !== day) {
        day = today;
        count = 0;
      }
      if (count >= max) return false;
      count++;
      return true;
    },
  };
}

export const hitCap = createDailyCap(HIT_DAILY_CAP);
