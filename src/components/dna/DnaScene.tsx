'use client';

import { useEffect } from 'react';
import { DEFAULT_PAGE_SCENE, setDnaScene, type DnaSceneDescriptor } from '@/lib/dna/scene-store';

/** Rendered by a page to tell the site-wide DNA stage which shape to take there. Renders nothing. */
export function DnaScene(props: DnaSceneDescriptor) {
  const key = JSON.stringify(props);
  useEffect(() => {
    setDnaScene(JSON.parse(key) as DnaSceneDescriptor);
    return () => setDnaScene(DEFAULT_PAGE_SCENE);
  }, [key]);
  return null;
}
