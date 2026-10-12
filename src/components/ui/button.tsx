import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// `primary`, `back` and `iconPrimary` are the aqua pill from globals.css; each
// one only picks the colour it rests in and the colour it lights up in.
const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        primary: "aqua aqua-blue group rounded-full font-semibold",
        back: "aqua aqua-to-amber group rounded-full",
        iconPrimary: "aqua aqua-round aqua-to-blue group rounded-full",
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

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
