"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n-context";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/utils";
import type { TranslationKey } from "@/lib/translations";
import {
  Rocket,
  Cpu,
  MessageSquare,
  UserCheck,
  Settings,
  Keyboard,
  ChevronDown,
  HelpCircle,
} from "lucide-react";

interface DocumentationModalProps {
  open: boolean;
  onClose: () => void;
}

interface DocSection {
  icon: React.ElementType;
  titleKey: TranslationKey;
  contentKey: TranslationKey;
  extra?: "models" | "shortcuts" | "faq";
}

const sections: DocSection[] = [
  { icon: Rocket, titleKey: "docGettingStarted", contentKey: "docGettingStartedContent" },
  { icon: Cpu, titleKey: "docModels", contentKey: "docModelsContent", extra: "models" },
  { icon: MessageSquare, titleKey: "docConversations", contentKey: "docConversationsContent" },
  { icon: UserCheck, titleKey: "docAnonymous", contentKey: "docAnonymousContent" },
  { icon: Settings, titleKey: "docSettings", contentKey: "docSettingsContent" },
  { icon: Keyboard, titleKey: "docShortcuts", contentKey: "docShortcutsContent", extra: "shortcuts" },
  { icon: HelpCircle, titleKey: "docFaqTitle", contentKey: "docFaqTitle", extra: "faq" },
];

const faqKeys: { q: TranslationKey; a: TranslationKey }[] = [
  { q: "docFaq1Q", a: "docFaq1A" },
  { q: "docFaq2Q", a: "docFaq2A" },
  { q: "docFaq3Q", a: "docFaq3A" },
];

export function DocumentationModal({ open, onClose }: DocumentationModalProps) {
  const { t } = useI18n();
  const [openSection, setOpenSection] = useState<number | null>(0);

  const toggle = (i: number) => {
    setOpenSection(openSection === i ? null : i);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t("docTitle") as string}
      className="sm:max-w-lg"
    >
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground mb-4">
          {t("docSubtitle")}
        </p>

        {sections.map((section, i) => {
          const Icon = section.icon;
          const isOpen = openSection === i;
          return (
            <div key={section.titleKey} className="border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => toggle(i)}
                className="flex w-full items-center gap-2.5 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 text-left hover:bg-accent/50 transition-colors"
              >
                <Icon className="h-4 w-4 text-syntalys-blue flex-shrink-0" />
                <span className="flex-1 text-xs sm:text-sm font-medium text-card-foreground">
                  {t(section.titleKey)}
                </span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-muted-foreground transition-transform duration-200 flex-shrink-0",
                    isOpen && "rotate-180"
                  )}
                />
              </button>
              <div
                className={cn(
                  "grid transition-all duration-200 ease-in-out",
                  isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                )}
              >
                <div className="overflow-hidden">
                  <div className="px-3 sm:px-4 pb-3 sm:pb-4 pt-1">
                    {/* Regular content */}
                    {section.extra !== "faq" && (
                      <p className="text-xs leading-relaxed text-muted-foreground">
                        {t(section.contentKey)}
                      </p>
                    )}

                    {/* Models extra */}
                    {section.extra === "models" && (
                      <div className="mt-3 space-y-2">
                        {[
                          { name: "SYNT A 1.0", descKey: "docModelBase" as TranslationKey, badge: null },
                          { name: "SYNT A 1.0 Reasoning", descKey: "docModelReasoning" as TranslationKey, badge: "Pro" },
                          { name: "SYNT A 1.5 Beta", descKey: "docModelBeta" as TranslationKey, badge: "Beta" },
                        ].map((m) => (
                          <div key={m.name} className="rounded-md bg-accent/30 p-2 sm:p-2.5">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="text-xs font-semibold text-card-foreground">{m.name}</span>
                              {m.badge && (
                                <span
                                  className={cn(
                                    "rounded-full px-1.5 py-0.5 text-[9px] font-semibold",
                                    m.badge === "Beta"
                                      ? "bg-syntalys-gold/15 text-syntalys-gold-dark dark:text-syntalys-gold"
                                      : "bg-syntalys-blue/10 text-syntalys-blue dark:bg-[#4a8fd4]/15 dark:text-[#4a8fd4]"
                                  )}
                                >
                                  {m.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-muted-foreground leading-relaxed">
                              {t(m.descKey)}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Shortcuts extra */}
                    {section.extra === "shortcuts" && (
                      <div className="mt-2 flex flex-col sm:flex-row gap-2">
                        <div className="flex items-center gap-2 rounded-md bg-accent/30 px-3 py-2">
                          <kbd className="rounded bg-background px-1.5 py-0.5 text-[10px] font-mono border border-border flex-shrink-0">Enter</kbd>
                          <span className="text-[11px] text-muted-foreground">{t("sendMessage")}</span>
                        </div>
                        <div className="flex items-center gap-2 rounded-md bg-accent/30 px-3 py-2">
                          <kbd className="rounded bg-background px-1.5 py-0.5 text-[10px] font-mono border border-border flex-shrink-0">Shift+Enter</kbd>
                          <span className="text-[11px] text-muted-foreground">
                            {t("docShortcutsContent").toString().split("|")[1]?.trim().split(":")[1]?.trim() || "New line"}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* FAQ extra */}
                    {section.extra === "faq" && (
                      <div className="space-y-3">
                        {faqKeys.map((faq) => (
                          <div key={faq.q}>
                            <p className="text-xs font-medium text-card-foreground mb-1">
                              {t(faq.q)}
                            </p>
                            <p className="text-[11px] text-muted-foreground leading-relaxed">
                              {t(faq.a)}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Modal>
  );
}
