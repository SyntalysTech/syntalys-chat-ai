"use client";

import { memo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import { useI18n } from "@/lib/i18n-context";
import { Check, Copy } from "lucide-react";

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
      <div className="flex items-center justify-between bg-[#161622] px-4 py-2 text-xs">
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
          className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[#6c7086] hover:text-[#cdd6f4] hover:bg-white/5 transition-colors"
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

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer = memo(function MarkdownRenderer({
  content,
}: MarkdownRendererProps) {
  return (
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
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={src}
              alt={alt || ""}
              className="rounded-xl max-w-full shadow-md border border-border my-3"
              loading="lazy"
              {...props}
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
});
