interface SectionTitleProps {
  children: React.ReactNode;
  /** How many things follow, or which one this is when `total` is given */
  count: number;
  /** Turns the count into a place in a run: "02 / 04" */
  total?: number;
  transitionName?: string;
}

const twoDigits = (value: number) => String(value).padStart(2, "0");

// A section's title, ruled off like a heading in a notebook: a gel bead (the
// one that bullets the case study lists), the name, a dashed guide out to the
// column's edge (as on the pinned callouts) and how many things follow.
export default function SectionTitle({ children, count, total, transitionName }: SectionTitleProps) {
  return (
    <div className="text-subheader flex items-center gap-2.5 text-stone-400!">
      <span
        aria-hidden
        className="size-[7px] shrink-0 rounded-full bg-radial-[at_50%_80%] from-stone-200 to-stone-400 shadow-[0_0_0_1px_var(--color-stone-400),inset_0_1.5px_0.5px_rgba(255,255,255,0.85),0_1px_1px_rgba(0,0,0,0.15)]"
      />
      <span className="inline-block shrink-0" style={transitionName ? { viewTransitionName: transitionName } : undefined}>
        {children}
      </span>
      <span aria-hidden className="flex-1 border-t border-dashed border-stone-300/70" />
      <span className="shrink-0 tabular-nums" aria-label={total ? `${count} of ${total}` : `${count} items`}>
        {twoDigits(count)}
        {total ? ` / ${twoDigits(total)}` : ""}
      </span>
    </div>
  );
}
