import Image from 'next/image';
import type { ProjectImage } from '@/lib/content/load';

type Props = { images: ProjectImage[]; /** Number of the first image in the project (the cover is 01). */ start?: number };

const SIZES = '(min-width: 1280px) 560px, (min-width: 768px) 46vw, 92vw';
const SIZES_WIDE = '(min-width: 1280px) 1140px, 92vw';

/**
 * From 768 px, captures are mounted in identical 16:10 plates on a two-column grid, so phone
 * and desktop captures sit together without cropping (below, each shows at its own ratio).
 * With an odd count, the first landscape capture spans both columns. Plates unmask on entering the viewport (CSS, see globals.css).
 */
export function Gallery({ images, start = 2 }: Props) {
  const wide = images.length % 2 === 1 ? images.findIndex((img) => img.width / img.height >= 1.1) : -1;
  return (
    <ul className="grid gap-x-6 gap-y-12 md:grid-cols-2 lg:gap-x-8">
      {images.map((img, i) => (
        <li key={img.src} className={i === wide ? 'md:col-span-2' : ''}>
          <figure>
            <div
              data-reveal="mask"
              className="relative overflow-hidden border border-line bg-obsidian-2 md:flex md:aspect-[16/10] md:items-center md:justify-center md:p-[3.5%]"
            >
              <Image
                src={img.src}
                alt={img.alt}
                width={img.width}
                height={img.height}
                sizes={i === wide ? SIZES_WIDE : SIZES}
                className="mx-auto block h-auto max-w-full max-md:max-h-[78svh] md:h-full md:w-full md:object-contain"
              />
            </div>
            {/* Same words as the alt text: hidden from assistive technologies to avoid reading them twice. */}
            <figcaption aria-hidden="true" className="mt-3.5 flex gap-3 font-mono text-[11.5px] leading-[1.6] text-faint">
              <span className="shrink-0 text-champagne">{String(start + i).padStart(2, '0')}</span>
              {img.alt}
            </figcaption>
          </figure>
        </li>
      ))}
    </ul>
  );
}
