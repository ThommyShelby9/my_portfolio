/**
 * The helix as a quiet still at the top of every inner page (spec §4.2): no WebGL outside the home.
 * Hidden on the home, which has the live scene (see globals.css).
 */
export function HelixOrnament() {
  return (
    // Raw <img>: decorative, behind the content, never the LCP element.
    <img
      src="/dna/helix-desktop.webp"
      alt=""
      aria-hidden="true"
      data-helix-ornament
      loading="lazy"
      decoding="async"
      className="pointer-events-none absolute right-0 top-0 -z-10 h-[92vh] w-auto max-w-[46vw] object-contain object-right-top opacity-[0.16] max-md:max-w-[70vw] max-md:opacity-[0.1]"
    />
  );
}
