import React from "react";

type GridBackgroundProps = {
  rows?: number;
  columns?: number;
  className?: string;
  color?: string;
};

export function GridBackground({
  rows = 32,
  columns = 32,
  className,
  color = "rgba(0, 0, 0, 0.18)",
}: GridBackgroundProps) {
  const combinedClassName = ["paper-grid pointer-events-none", className]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={combinedClassName}
      style={
        {
          "--grid-rows": rows,
          "--grid-columns": columns,
          "--grid-color": color,
        } as React.CSSProperties
      }
      aria-hidden
    >
      <div className="paper-grid-guides">
        {Array.from({ length: rows * columns }, (_, index) => {
          const x = (index % columns) + 1;
          const y = Math.floor(index / columns) + 1;

          return (
            <div
              key={`${x}-${y}`}
              className="paper-grid-guide"
              style={
                {
                  "--grid-x": x,
                  "--grid-y": y,
                } as React.CSSProperties
              }
            />
          );
        })}
      </div>
    </div>
  );
}
