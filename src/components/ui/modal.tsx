"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  className?: string;
}

export function Modal({ open, onClose, children, title, className }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [viewportHeight, setViewportHeight] = useState<number | null>(null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  // Track visual viewport for mobile keyboard handling
  useEffect(() => {
    if (!open || typeof window === "undefined") return;

    const vv = window.visualViewport;
    if (!vv) return;

    function handleResize() {
      if (!vv) return;
      setViewportHeight(vv.height);
    }

    handleResize();
    vv.addEventListener("resize", handleResize);
    vv.addEventListener("scroll", handleResize);
    return () => {
      vv.removeEventListener("resize", handleResize);
      vv.removeEventListener("scroll", handleResize);
      setViewportHeight(null);
    };
  }, [open]);

  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) {
      window.addEventListener("keydown", handleEsc);
      return () => window.removeEventListener("keydown", handleEsc);
    }
  }, [open, onClose]);

  if (!open) return null;

  // Calculate max height: use visual viewport when keyboard is open, otherwise CSS default
  const isKeyboardOpen = viewportHeight !== null && typeof window !== "undefined" && viewportHeight < window.innerHeight - 100;
  const maxHeight = isKeyboardOpen
    ? `${viewportHeight! - 16}px`
    : undefined;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div
        className={cn(
          "w-full sm:max-w-md rounded-t-2xl sm:rounded-xl bg-card border border-border shadow-2xl",
          "animate-slide-up sm:animate-fade-in",
          "max-h-[94dvh] sm:max-h-[85vh] flex flex-col",
          className
        )}
        style={maxHeight ? { maxHeight } : undefined}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        {/* Drag handle for mobile */}
        <div className="flex justify-center pt-2 pb-0 sm:hidden flex-shrink-0">
          <div className="h-1 w-10 rounded-full bg-border" />
        </div>

        {title && (
          <div className="flex items-center justify-between border-b border-border px-4 sm:px-6 py-3 sm:py-4 flex-shrink-0">
            <h2 className="text-base sm:text-lg font-semibold text-card-foreground pr-2">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="rounded-lg p-2.5 -mr-1.5 text-muted-foreground hover:bg-accent hover:text-foreground active:bg-accent/80 transition-colors flex-shrink-0"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
        <div className="p-4 sm:p-6 overflow-y-auto min-h-0 overscroll-contain scrollbar-thin">{children}</div>
      </div>
    </div>
  );
}
