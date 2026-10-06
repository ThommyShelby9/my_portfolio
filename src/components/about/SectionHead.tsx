/** Numbered kicker and display heading of an About section, revealed with its <Reveal> parent. */
export function SectionHead({ id, kicker, title }: { id: string; kicker: string; title: string }) {
  return (
    <>
      <p data-reveal className="font-mono text-xs font-medium uppercase tracking-[0.14em] text-signal">{kicker}</p>
      <h2 id={id} data-reveal className="mt-3.5 max-w-[22ch] font-display text-[clamp(34px,4vw,56px)] font-medium leading-[1.05]">
        {title}
      </h2>
    </>
  );
}
