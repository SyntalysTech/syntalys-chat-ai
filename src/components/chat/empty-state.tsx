"use client";

import Image from "next/image";
import { useI18n } from "@/lib/i18n-context";
import {
  Code2,
  FileText,
  Lightbulb,
  Languages,
  BarChart3,
  PenTool,
} from "lucide-react";
import type { TranslationKey } from "@/lib/translations";

const suggestions: {
  icon: typeof Code2;
  titleKey: TranslationKey;
  promptKey: TranslationKey;
}[] = [
  { icon: Code2, titleKey: "sugWriteCode", promptKey: "sugWriteCodePrompt" },
  { icon: FileText, titleKey: "sugSummarize", promptKey: "sugSummarizePrompt" },
  { icon: Lightbulb, titleKey: "sugIdeas", promptKey: "sugIdeasPrompt" },
  { icon: Languages, titleKey: "sugTranslate", promptKey: "sugTranslatePrompt" },
  { icon: BarChart3, titleKey: "sugAnalyze", promptKey: "sugAnalyzePrompt" },
  { icon: PenTool, titleKey: "sugDraft", promptKey: "sugDraftPrompt" },
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

      <div className="grid w-full max-w-2xl grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3">
        {suggestions.map((s) => {
          const title = t(s.titleKey) as string;
          const prompt = t(s.promptKey) as string;
          return (
            <button
              key={s.titleKey}
              onClick={() => onSuggestionClick(prompt)}
              className="group flex items-start gap-3 rounded-xl border border-border/60 bg-card p-3.5 text-left transition-all duration-200 hover:border-syntalys-blue/30 hover:bg-accent hover:shadow-sm"
            >
              <s.icon className="mt-0.5 h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 text-syntalys-blue/70 group-hover:text-syntalys-blue transition-colors" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-card-foreground">
                  {title}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground truncate">
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
