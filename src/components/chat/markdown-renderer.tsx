"use client";

import { useState, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import { useI18n } from "@/lib/i18n-context";
import { Check, Copy, Download, X } from "lucide-react";

function CodeBlock({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLElement> & { children?: React.ReactNode }) {
  const [copied, setCopied] = useState(false);
  const { t } = useI18n();
  const match = /language-(\w+)/.exec(className || "");
  const isBlock = match || (typeof children === "string" && children.includes("\n"));
  const language = match?.[1] || "";
  const codeString = String(children).replace(/\n$/, "");

  const handleCopy = async () => {
    await navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Inline code
  if (!isBlock) {
    return (
      <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono" {...props}>
        {children}
      </code>
    );
  }

  // Block code
  return (
    <div className="group relative my-4 rounded-xl overflow-hidden border border-[#2a2a3c]">
      <div className="flex items-center justify-between bg-[#161622] px-3 sm:px-4 py-2 text-xs">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          </div>
          <span className="text-[#6c7086] font-medium ml-1">{language || "code"}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded-md px-3 py-1.5 sm:px-2.5 sm:py-1 text-[#6c7086] hover:text-[#cdd6f4] hover:bg-white/5 transition-colors"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-green-400" />
              <span className="text-green-400">{t("copied")}</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              {t("copy")}
            </>
          )}
        </button>
      </div>
      <pre className="overflow-x-auto bg-[#1a1a2e] p-3 sm:p-4 m-0 -webkit-overflow-scrolling-touch">
        <code className={`text-[13px] leading-relaxed font-mono ${className || ""}`} {...props}>
          {children}
        </code>
      </pre>
    </div>
  );
}

/** Fullscreen image lightbox */
function ImageLightbox({ src, onClose }: { src: string; onClose: () => void }) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
      >
        <X className="h-5 w-5" />
      </button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  const closeLightbox = useCallback(() => setLightboxSrc(null), []);

  return (
    <>
      <div className="prose max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
          components={{
            code: CodeBlock,
            table: ({ children, ...props }) => (
              <div className="overflow-x-auto -mx-1">
                <table {...props}>{children}</table>
              </div>
            ),
            img: ({ src, alt, ...props }) => (
              <span className="relative group/img inline-block my-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={alt || ""}
                  className="rounded-xl max-w-full shadow-md border border-border cursor-pointer hover:opacity-90 transition-opacity block"
                  loading="lazy"
                  onClick={() => typeof src === "string" && setLightboxSrc(src)}
                  {...props}
                />
                {typeof src === "string" && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const a = document.createElement("a");
                      a.href = src;
                      a.download = `syntalys-image.png`;
                      a.target = "_blank";
                      a.rel = "noopener noreferrer";
                      // Try fetch+blob for same-origin, fallback to direct link
                      fetch(src)
                        .then((r) => r.blob())
                        .then((blob) => {
                          const url = URL.createObjectURL(blob);
                          a.href = url;
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                          URL.revokeObjectURL(url);
                        })
                        .catch(() => {
                          window.open(src, "_blank");
                        });
                    }}
                    className="absolute top-2.5 right-2.5 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white opacity-0 group-hover/img:opacity-100 hover:bg-black/70 transition-all"
                    title="Download"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                )}
              </span>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
      {lightboxSrc && <ImageLightbox src={lightboxSrc} onClose={closeLightbox} />}
    </>
  );
}
