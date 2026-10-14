// The frame and controls the Cameo demos share

export const pill = 'aqua shrink-0 h-8 px-3 text-sm font-medium';
export const resting = `${pill} aqua-to-blue [--aqua-ink:var(--color-stone-600)]`;
export const lit = `${pill} aqua-blue`;

// One line of a demo's panel: what it is on the left, the controls or readout beside it
export function Row({ name, note, children }: { name: string; note: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
      <div className="md:w-40 shrink-0">
        <p className="text-subheader mx-0">{name}</p>
        <p className="text-sm text-stone-500">{note}</p>
      </div>
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">{children}</div>
    </div>
  );
}
