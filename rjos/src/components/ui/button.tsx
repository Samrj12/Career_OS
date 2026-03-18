import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full font-[family-name:var(--font-geist-mono)] text-[12px] uppercase tracking-[0.08em] transition-all active:translate-y-[1px] active:translate-x-[1px] disabled:opacity-50 disabled:pointer-events-none select-none whitespace-nowrap",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--ink)] text-[var(--paper)] shadow-[3px_3px_0px_var(--border-dark)] hover:shadow-[2px_2px_0px_var(--border-dark)] active:shadow-[1px_1px_0px_var(--border-dark)]",
        primary:
          "bg-[var(--amber)] text-white shadow-[3px_3px_0px_#92400E] hover:shadow-[2px_2px_0px_#92400E] active:shadow-[1px_1px_0px_#92400E]",
        outline:
          "bg-transparent text-[var(--ink)] border border-[var(--border-dark)] hover:bg-[var(--paper-alt)] shadow-none",
        ghost:
          "bg-transparent text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--paper-alt)] shadow-none",
      },
      size: {
        default: "px-5 py-2 h-9",
        sm: "px-3.5 py-1.5 h-7 text-[10px]",
        lg: "px-7 py-2.5 h-11 text-[13px]",
        icon: "h-9 w-9 p-0",
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
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
