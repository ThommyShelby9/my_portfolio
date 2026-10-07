/**
 * The space the camera flies through the helix in (spec §4.1, prototype C), between scenes 00 and 01.
 * Empty on purpose: a purely visual moment. It only opens when the live helix can run (DnaStage sets
 * html[data-dna-flight]); without JS, WebGL or motion it takes no room at all.
 */
export function Traversal() {
  return <div data-dna-traverse aria-hidden="true" className="relative z-0" />;
}
