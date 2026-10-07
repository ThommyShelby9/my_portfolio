import { describe, expect, it, vi } from 'vitest';
import { DEFAULT_PAGE_SCENE, getDnaScene, setDnaScene, subscribeDnaScene } from '@/lib/dna/scene-store';

describe('DNA scene store', () => {
  it('starts on the calm helix and notifies subscribers of every change', () => {
    expect(getDnaScene()).toEqual(DEFAULT_PAGE_SCENE);
    const listener = vi.fn();
    const off = subscribeDnaScene(listener);
    setDnaScene({ mode: 'page', state: 3, signatures: [['engineering', 'product']] });
    expect(listener).toHaveBeenCalledTimes(1);
    expect(getDnaScene()).toEqual({ mode: 'page', state: 3, signatures: [['engineering', 'product']] });
    off();
    setDnaScene(DEFAULT_PAGE_SCENE);
    expect(listener).toHaveBeenCalledTimes(1);
  });
});
