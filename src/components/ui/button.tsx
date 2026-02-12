"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "default"
    | "secondary"
    | "ghost"
    | "outline"
    | "destructive"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-xl sm:rounded-lg font-medium transition-all duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
          {
            "bg-primary text-primary-foreground hover:bg-syntalys-blue-light shadow-sm":
              variant === "default",
            "bg-secondary text-secondary-foreground hover:bg-accent":
              variant === "secondary",
            "hover:bg-accent hover:text-accent-foreground":
              variant === "ghost",
            "border border-input bg-background hover:bg-accent hover:text-accent-foreground":
              variant === "outline",
            "bg-destructive text-white hover:bg-destructive/90":
              variant === "destructive",
            "text-primary underline-offset-4 hover:underline":
              variant === "link",
          },
          {
            "h-11 sm:h-10 px-4 py-2 text-sm": size === "default",
            "h-9 sm:h-8 px-3 text-xs": size === "sm",
            "h-12 sm:h-11 px-8 text-base": size === "lg",
            "h-11 w-11 sm:h-9 sm:w-9 p-0": size === "icon",
          },
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
export { Button };
