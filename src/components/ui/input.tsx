"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-11 sm:h-10 w-full rounded-xl sm:rounded-lg border border-input bg-background px-3 py-2 text-[16px] sm:text-sm",
        "placeholder:text-muted-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "transition-colors duration-150",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});

Input.displayName = "Input";
export { Input };
