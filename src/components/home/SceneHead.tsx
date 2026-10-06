type Props = { id: string; kicker: string; title: string; intro?: string };

/** Numbered head shared by the home scenes 01 to 05 (kicker, display title, one-line intro). */
export function SceneHead({ id, kicker, title, intro }: Props) {
  return (
    <header className="max-w-[44rem]">
      <p data-reveal className="font-mono text-[11.5px] font-medium uppercase tracking-[0.16em] text-signal">{kicker}</p>
      <h2
        id={id}
        data-reveal
        className="mt-4 font-display text-[clamp(36px,5vw,72px)] font-extrabold uppercase leading-[0.95] tracking-[-0.03em]"
      >
        {title}
      </h2>
      {intro && <p data-reveal className="mt-6 max-w-[56ch] text-[16.5px] leading-[1.7] text-muted">{intro}</p>}
    </header>
  );
}
