"use client";

import { useState, type ComponentType } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Crop, Export, List, Swatches, TextT, type IconProps } from "@phosphor-icons/react";

interface Tool {
  id: string;
  label: string;
  icon: ComponentType<IconProps>;
  /** Icon-only tools sit after the divider and keep their label for screen readers */
  iconOnly?: boolean;
}

const tools: Tool[] = [
  { id: "crop", label: "Crop", icon: Crop },
  { id: "color", label: "Color", icon: Swatches },
  { id: "text", label: "Text", icon: TextT },
  { id: "menu", label: "More", icon: List, iconOnly: true },
  { id: "share", label: "Share", icon: Export, iconOnly: true },
];

// The image toolbar, built rather than recorded: one highlight travels between
// the tools as the pointer does, and the tool under it turns lime.
export default function ImageToolbar() {
  const [active, setActive] = useState<string | null>(null);

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[#f2f4f5]">
      <div
        role="toolbar"
        aria-label="Image tools"
        onPointerLeave={() => setActive(null)}
        className="flex items-center gap-0.5 rounded-[14px] bg-[#333333] p-1.5 shadow-[0_1px_2px_rgba(20,24,40,0.2),0_18px_30px_-12px_rgba(40,48,80,0.45)] max-md:scale-90"
      >
        {tools.map((tool, index) => {
          const isActive = active === tool.id;
          const Icon = tool.icon;
          return (
            <div key={tool.id} className="flex items-center">
              {/* The divider before the first icon-only tool */}
              {tool.iconOnly && !tools[index - 1].iconOnly && <span aria-hidden className="mx-1.5 h-5 w-px bg-white/20" />}
              <button
                type="button"
                aria-label={tool.iconOnly ? tool.label : undefined}
                onPointerEnter={() => setActive(tool.id)}
                onFocus={() => setActive(tool.id)}
                onBlur={() => setActive(null)}
                className={`relative flex h-8 items-center gap-1.5 rounded-[10px] text-[15px] font-medium outline-none transition-[color,scale] duration-150 ease-out active:scale-[0.96] ${tool.iconOnly ? "px-2" : "px-2.5"} ${isActive ? "text-[#b7ff00]" : "text-white"}`}
              >
                <AnimatePresence>
                  {isActive && (
                    <motion.span
                      layoutId="image-toolbar-highlight"
                      className="absolute inset-0 rounded-[10px] bg-[#4c5830]"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ layout: { type: "spring", stiffness: 520, damping: 40, mass: 0.8 }, opacity: { duration: 0.12 } }}
                    />
                  )}
                </AnimatePresence>
                <Icon size={18} className="relative" />
                {!tool.iconOnly && <span className="relative">{tool.label}</span>}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
