"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

// How long the toolbar takes to fade, as in the original
const FADE_MS = 150;

const stroke = { stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round" } as const;

// The toolbar's own icons, drawn for it
const icons: Record<string, ReactNode> = {
  crop: (
    <path
      d="M2.29166 4.79166H13.5417C14.4622 4.79166 15.2083 5.53785 15.2083 6.45832V17.7083M4.79166 2.29166V13.5417C4.79166 14.4622 5.53785 15.2083 6.45832 15.2083H17.7083"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
    />
  ),
  color: (
    <path
      d="M3.95832 2.91666H8.54166V1.66666H3.95832V2.91666ZM9.58332 3.95832V13.75H10.8333V3.95832H9.58332ZM2.91666 13.75V3.95832H1.66666V13.75H2.91666ZM6.24999 17.0833C4.40904 17.0833 2.91666 15.5909 2.91666 13.75H1.66666C1.66666 16.2813 3.71868 18.3333 6.24999 18.3333V17.0833ZM9.58332 13.75C9.58332 15.5909 8.09094 17.0833 6.24999 17.0833V18.3333C8.78132 18.3333 10.8333 16.2813 10.8333 13.75H9.58332ZM3.95832 1.66666C2.69267 1.66666 1.66666 2.69267 1.66666 3.95832H2.91666C2.91666 3.38302 3.38302 2.91666 3.95832 2.91666V1.66666ZM9.68232 3.22222L13.6516 5.51389L14.2766 4.43136L10.3073 2.13969L9.68232 3.22222ZM14.0328 6.93683L9.13699 15.4167L10.2196 16.0417L15.1154 7.56183L14.0328 6.93683ZM14.4864 6.34868L16.7781 10.318L17.8606 9.69299L15.5689 5.72368L14.4864 6.34868ZM16.3968 11.7409L7.91695 16.6367L8.54199 17.7192L17.0218 12.8234L16.3968 11.7409ZM16.7781 10.318C17.0657 10.8162 16.895 11.4532 16.3968 11.7409L17.0218 12.8234C18.1179 12.1907 18.4934 10.7891 17.8606 9.69299L16.7781 10.318ZM10.3073 2.13969C9.99491 1.95932 9.65599 1.86042 9.31682 1.83756L9.23274 3.08474C9.38557 3.09503 9.53891 3.13941 9.68232 3.22222L10.3073 2.13969ZM8.54166 2.91666C8.70724 2.91666 8.86207 2.95482 8.99949 3.02226L9.55007 1.90004C9.24507 1.75039 8.90224 1.66666 8.54166 1.66666V2.91666ZM8.99949 3.02226C9.34657 3.19253 9.58332 3.54836 9.58332 3.95832H10.8333C10.8333 3.05346 10.3088 2.27229 9.55007 1.90004L8.99949 3.02226ZM15.5689 5.72368C15.3887 5.41138 15.1447 5.15635 14.8625 4.96701L14.166 6.00495C14.2932 6.09027 14.4036 6.20531 14.4864 6.34868L15.5689 5.72368ZM13.6516 5.51389C13.7949 5.59666 13.91 5.70714 13.9953 5.83427L15.0332 5.13768C14.8438 4.85556 14.5888 4.61165 14.2766 4.43136L13.6516 5.51389ZM13.9953 5.83427C14.2107 6.15526 14.2378 6.5818 14.0328 6.93683L15.1154 7.56183C15.5678 6.7782 15.5042 5.83942 15.0332 5.13768L13.9953 5.83427ZM7.08332 13.75C7.08332 14.2102 6.71022 14.5833 6.24999 14.5833V15.8333C7.40058 15.8333 8.33332 14.9006 8.33332 13.75H7.08332ZM6.24999 14.5833C5.78976 14.5833 5.41666 14.2102 5.41666 13.75H4.16666C4.16666 14.9006 5.0994 15.8333 6.24999 15.8333V14.5833ZM5.41666 13.75C5.41666 13.2897 5.78976 12.9167 6.24999 12.9167V11.6667C5.0994 11.6667 4.16666 12.5994 4.16666 13.75H5.41666ZM6.24999 12.9167C6.71022 12.9167 7.08332 13.2897 7.08332 13.75H8.33332C8.33332 12.5994 7.40058 11.6667 6.24999 11.6667V12.9167Z"
      fill="currentColor"
    />
  ),
  text: <path d="M3.125 5.20833V3.125H10M10 3.125H16.875V5.20833M10 3.125V16.875M10 16.875H8.125M10 16.875H11.875" {...stroke} />,
  menu: <path d="M2.29169 9.99999H17.7084M2.29169 4.79166H17.7084M2.29169 15.2083H17.7084" {...stroke} />,
  share: (
    <path
      d="M10 3.125V12.5M10 3.125L13.75 6.875M10 3.125L6.25 6.875M16.875 10.625V15.2083C16.875 16.1288 16.1288 16.875 15.2083 16.875H4.79167C3.87119 16.875 3.125 16.1288 3.125 15.2083V10.625"
      {...stroke}
    />
  ),
};

const labelled = [
  { id: "crop", label: "Crop" },
  { id: "color", label: "Color" },
  { id: "text", label: "Text" },
];
const iconOnly = [
  { id: "menu", label: "Menu" },
  { id: "share", label: "Share" },
];

const Icon = ({ id }: { id: string }) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
    {icons[id]}
  </svg>
);

const tool = "text-white font-medium text-sm rounded-[10px] hover:bg-[#B7FE05]/20 active:bg-[#B7FE05]/10 hover:text-[#B7FE05] transition-colors duration-150 ease-in";

// The right-click image toolbar, as it was first built (plain HTML and a
// script), brought into React with its looks untouched. Right-click anywhere
// in the tile and it appears at the pointer, opening away from whichever edges
// are too close; a click elsewhere in the tile puts it away. All of that stays
// inside the tile: nothing done on the rest of the page moves or hides it. It
// starts out shown, in the middle, so the tile isn't empty before anyone has
// tried it.
export default function ImageToolbar() {
  const tileRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  // Where it was asked for, or null while it sits in the middle
  const [place, setPlace] = useState<{ left: number; top: number } | null>(null);
  const [isShown, setIsShown] = useState(true);
  // Taken off the page once it has faded, as the original hides it
  const [isGone, setIsGone] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Puts the toolbar at a point in the tile, on whichever side of it has room
  const summon = (clientX: number, clientY: number) => {
    const tile = tileRef.current?.getBoundingClientRect();
    const toolbar = toolbarRef.current;
    if (!tile || !toolbar) return;
    const x = clientX - tile.left;
    const y = clientY - tile.top;
    const width = toolbar.offsetWidth;
    const height = toolbar.offsetHeight;

    const spaceRight = tile.width - x;
    const spaceBottom = tile.height - y;
    let left = x;
    let top = y;
    if (spaceRight < width && spaceBottom >= height) {
      // No space on the right, enough below
      left = x - width;
    } else if (spaceBottom < height) {
      // Not enough space below
      top = y - height;
      // Nor on the right either
      if (spaceRight < width) left = x - width;
    }
    // A tile is far smaller than the window the original had to itself, so it
    // is also kept from running off the tile's far edges
    left = Math.min(Math.max(8, left), tile.width - width - 8);
    top = Math.min(Math.max(8, top), tile.height - height - 8);

    clearTimeout(hideTimer.current);
    setPlace({ left, top });
    setIsGone(false);
    // Shown a frame later, so it fades in at the new place and not on the way to it
    setIsShown(false);
    requestAnimationFrame(() => requestAnimationFrame(() => setIsShown(true)));
  };

  // A click in the tile, anywhere but on the toolbar, puts it away. Clicks on
  // the rest of the page are none of its business: it stays as it was.
  const dismiss = (event: React.MouseEvent) => {
    if (toolbarRef.current?.contains(event.target as Node)) return;
    setIsShown(false);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setIsGone(true), FADE_MS);
  };
  useEffect(() => () => clearTimeout(hideTimer.current), []);

  return (
    <div
      ref={tileRef}
      onClick={dismiss}
      onContextMenu={(event) => {
        event.preventDefault();
        summon(event.clientX, event.clientY);
      }}
      // A touch screen has no right-click: a tap on the tile asks for it instead
      onPointerUp={(event) => {
        if (event.pointerType !== "touch" || toolbarRef.current?.contains(event.target as Node)) return;
        const { clientX, clientY } = event;
        // After the click this tap also makes, which would otherwise put it straight away
        setTimeout(() => summon(clientX, clientY), 0);
      }}
      className="absolute inset-0 overflow-hidden bg-[#f2f4f5] select-none"
    >
      <p className="absolute inset-x-0 bottom-4 text-center text-[13px] text-stone-400 pointer-events-none">
        <span className="[@media(hover:none)]:hidden">Right-click anywhere</span>
        <span className="hidden [@media(hover:none)]:inline">Tap anywhere</span>
      </p>

      <div
        ref={toolbarRef}
        role="toolbar"
        aria-label="Image tools"
        className={`absolute bg-[#202020]/90 p-1.5 gap-1.5 flex items-center rounded-2xl shadow-[0px_16px_32px_-8px_rgba(0,0,0,0.24),0px_2px_0px_0px_rgba(0,0,0,0.07)] transition-opacity duration-150 ease-in backdrop-blur-[2px] ${isShown ? "opacity-100" : "opacity-0"} ${isGone ? "invisible pointer-events-none" : ""}`}
        style={place ?? { left: "50%", top: "50%", transform: "translate(-50%, -50%)" }}
      >
        <div className="flex">
          {labelled.map(({ id, label }) => (
            <button key={id} type="button" className={`${tool} px-2 py-1.5 flex gap-1.5`}>
              <Icon id={id} />
              {label}
            </button>
          ))}
        </div>
        <div className="w-px h-6 bg-white/20" />
        <div className="flex">
          {iconOnly.map(({ id, label }) => (
            <button key={id} type="button" aria-label={label} className={`${tool} p-1.5`}>
              <Icon id={id} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
