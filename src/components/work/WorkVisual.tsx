import Image, { type StaticImageData } from 'next/image';

export type VisualImage = { src: string | StaticImageData; alt: string; width?: number; height?: number };

type Props = {
  image?: VisualImage;
  /** Shown on the typographic panel when there is no image. */
  name: string;
  sector?: string;
  note?: string;
  sizes: string;
  className?: string;
};

/**
 * A project's visual in a fixed 16:10 frame: its cover capture, or, when the project has
 * no public capture, a typographic panel (name in display type, sector in mono). The panel repeats
 * text that sits next to it, so it is hidden from assistive technologies.
 */
export function WorkVisual({ image, name, sector, note, sizes, className = '' }: Props) {
  return (
    <div className={`relative aspect-[16/10] overflow-hidden border border-line bg-graphite-2 ${className}`}>
      {image ? (
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes={sizes}
          className="object-cover object-top transition-transform duration-[1200ms] ease-[cubic-bezier(.2,.7,.2,1)] group-hover:scale-[1.035] motion-reduce:transition-none"
        />
      ) : (
        <div aria-hidden="true" className="absolute inset-0 flex flex-col justify-between p-[7%]">
          <span className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-faint">{sector}</span>
          <span>
            <span className={`block font-display font-extrabold uppercase leading-[0.95] tracking-[-0.025em] text-ivory transition-colors duration-500 group-hover:text-signal ${name.length > 14 ? 'text-[clamp(30px,3.4vw,46px)]' : 'text-[clamp(40px,6vw,76px)]'}`}>
              {name}
            </span>
            <span className="mt-5 flex items-center gap-3 font-mono text-[11px] text-faint">
              <span className="inline-block h-px w-7 bg-signal" />
              {note}
            </span>
          </span>
        </div>
      )}
    </div>
  );
}
