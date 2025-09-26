import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        primary: "isolate group relative text-white font-semibold bg-[radial-gradient(at_50%_75%,theme(colors.blue.300),theme(colors.blue.500),theme(colors.blue.600))] hover:bg-[radial-gradient(at_50%_75%,theme(colors.blue.400),theme(colors.blue.600),theme(colors.blue.700))] shadow-[0px_2px_2px_-1px_rgba(28,57,142,0.25),0px_4px_4px_-2px_rgba(28,57,142,0.25),0px_4px_8px_1px_rgba(28,57,142,0.25)_inset,0px_-2px_2px_0px_rgba(28,57,142,0.25)_inset] border border-blue-600 rounded-full hover:shadow-[0px_4px_4px_-2px_rgba(28,57,142,0.25),0px_8px_8px_-4px_rgba(28,57,142,0.25),0px_4px_8px_1px_rgba(28,57,142,0.25)_inset,0px_-2px_2px_0px_rgba(28,57,142,0.25)_inset] active:shadow-[0px_4px_4px_-2px_rgba(28,57,142,0.25),0px_8px_8px_-4px_rgba(28,57,142,0.0),0px_4px_8px_1px_rgba(28,57,142,0.25)_inset,0px_-2px_2px_0px_rgba(28,57,142,0.25)_inset] active:bg-[radial-gradient(at_50%_75%,theme(colors.blue.300),theme(colors.blue.500),theme(colors.blue.600))] transition-all duration-300 overflow-hidden",
        back: "group relative rounded-full text-stone-500 border border-stone-400 bg-[radial-gradient(at_50%_75%,theme(colors.stone.100),theme(colors.stone.200),theme(colors.stone.300))] shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(10,10,10,0.15)_inset,0px_-2px_2px_0px_rgba(10,10,10,0.15)_inset] hover:text-amber-900 hover:bg-[radial-gradient(at_50%_75%,theme(colors.amber.300),theme(colors.amber.500),theme(colors.amber.400))] hover:shadow-[0px_2px_2px_-1px_rgba(193,0,7,0.25),0px_4px_8px_1px_rgba(193,0,7,0.25)_inset,0px_-2px_2px_0px_rgba(193,0,7,0.25)_inset] hover:border-amber-700 active:scale-95 transition-all duration-300 cursor-pointer",
        iconPrimary: "group relative rounded-full text-stone-500 border border-stone-400 bg-[radial-gradient(at_50%_75%,theme(colors.stone.100),theme(colors.stone.200),theme(colors.stone.300))] shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(10,10,10,0.15)_inset,0px_-2px_2px_0px_rgba(10,10,10,0.15)_inset] hover:text-white hover:bg-[radial-gradient(at_50%_75%,theme(colors.blue.300),theme(colors.blue.500),theme(colors.blue.400))] hover:shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(10,10,10,0.15)_inset,0px_-2px_2px_0px_rgba(10,10,10,0.15)_inset] hover:border-blue-700 active:scale-95 transition-all duration-300 cursor-pointer",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        dashworksprimary: "bg-[#4F0D52] text-white hover:bg-[#4F0D52]/90",
        dashworkssecondary: "bg-[#F5F5F5] text-[#4F0D52] hover:bg-[#F5F5F5]/90",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-10 rounded-md px-3",
        lg: "h-10 rounded-md px-8",
        icon: "h-10 w-10",
        iconSm: "p-1",
        iconXs: "p-0.5",
        project: "md:w-[200px] w-fit h-[36px] md:px-6 px-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  showHighlight?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, showHighlight = false, children, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      >
        {children}
        {showHighlight && variant === "primary" && (
          <div className="absolute inset-2 top-0.5 h-1/2 rounded-t-[12px] rounded-b-[4px] bg-gradient-to-b from-white/70 to-white/20 group-active:from-white/50 z-10" />
        )}
        {showHighlight && variant === "back" && (
          <div className="absolute bg-gradient-to-b from-white/90 to-white/5 rounded-b-[4px] rounded-t-[12px] group-hover:from-stone-100/70 group-hover:to-stone-100/20 inset-x-[3px] top-0.5 h-1/2 transition-all duration-300" />
        )}
        {showHighlight && variant === "iconPrimary" && (
          <div className="absolute bg-gradient-to-b from-white/90 to-white/5 rounded-b-[4px] rounded-t-[12px] group-hover:from-gray-100/70 group-hover:to-gray-100/20 inset-x-[3px] top-0.5 h-1/2 transition-all duration-300" />
        )}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };