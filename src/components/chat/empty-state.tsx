"use client";

import Image from "next/image";
import { useI18n } from "@/lib/i18n-context";
import {
  Briefcase,
  Lightbulb,
  BarChart3,
  PenTool,
  Code2,
  Megaphone,
} from "lucide-react";
import type { TranslationKey } from "@/lib/translations";

const suggestions: {
  icon: typeof Code2;
  titleKey: TranslationKey;
  promptKey: TranslationKey;
  color: string;
}[] = [
  { icon: Briefcase, titleKey: "sugBusiness", promptKey: "sugBusinessPrompt", color: "text-blue-500" },
  { icon: Lightbulb, titleKey: "sugIdeas", promptKey: "sugIdeasPrompt", color: "text-amber-500" },
  { icon: BarChart3, titleKey: "sugAnalyze", promptKey: "sugAnalyzePrompt", color: "text-emerald-500" },
  { icon: PenTool, titleKey: "sugDraft", promptKey: "sugDraftPrompt", color: "text-violet-500" },
  { icon: Code2, titleKey: "sugWriteCode", promptKey: "sugWriteCodePrompt", color: "text-cyan-500" },
  { icon: Megaphone, titleKey: "sugMarketing", promptKey: "sugMarketingPrompt", color: "text-rose-500" },
];

interface EmptyStateProps {
  isDark: boolean;
  onSuggestionClick: (prompt: string) => void;
}

export function EmptyState({ isDark, onSuggestionClick }: EmptyStateProps) {
  const { t } = useI18n();

  return (
    <div className="flex flex-1 flex-col items-center justify-start sm:justify-center overflow-y-auto px-4 py-6 sm:py-16">
      <div className="mb-6 sm:mb-8">
        <Image
          src={
            isDark
              ? "/logos/logo-icono-solo-white.png"
              : "/logos/logo-icono-solo-blue.png"
          }
          alt="SYNTALYS AI"
          width={48}
          height={48}
          className="opacity-80"
        />
      </div>

      <h1 className="mb-2 text-xl sm:text-2xl font-semibold text-foreground">
        {t("emptyStateTitle")}
      </h1>
      <p className="mb-8 sm:mb-10 max-w-md text-center text-sm text-muted-foreground">
        {t("emptyStateSubtitle")}
      </p>

      <div className="grid w-full max-w-2xl grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-2.5">
        {suggestions.map((s) => {
          const title = t(s.titleKey) as string;
          const prompt = t(s.promptKey) as string;
          return (
            <button
              key={s.titleKey}
              onClick={() => onSuggestionClick(prompt)}
              className="group flex items-start gap-3 rounded-xl border border-border/60 bg-card p-3 sm:p-3.5 text-left transition-all duration-200 hover:border-syntalys-blue/30 hover:bg-accent hover:shadow-sm active:scale-[0.98]"
            >
              <div className="mt-0.5 flex h-8 w-8 sm:h-9 sm:w-9 flex-shrink-0 items-center justify-center rounded-lg bg-accent/50 group-hover:bg-syntalys-blue/10 transition-colors">
                <s.icon className={`h-4 w-4 sm:h-[18px] sm:w-[18px] ${s.color} transition-colors`} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-card-foreground">
                  {title}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {prompt}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
