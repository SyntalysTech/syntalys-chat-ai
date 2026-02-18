"use client";

import { useI18n } from "@/lib/i18n-context";
import { useAuth } from "@/lib/auth-context";
import { useChat } from "@/lib/chat-context";
import { MODELS } from "@/lib/models";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/utils";
import type { TranslationKey } from "@/lib/translations";
import {
  Zap,
  Brain,
  FlaskConical,
  Heart,
  Mail,
  FileText,
  Code2,
  Languages,
  Lightbulb,
  GraduationCap,
  Lock,
  ArrowRight,
} from "lucide-react";

interface ExploreModalProps {
  open: boolean;
  onClose: () => void;
  onOpenAuth: () => void;
}

const modelIconMap: Record<string, typeof Zap> = {
  "talys-2.0": Zap,
  "talys-2.5": Brain,
  "talys-3.0": FlaskConical,
  "milo": Heart,
};

const useCases = [
  { titleKey: "exploreUseCase1", descKey: "exploreUseCase1Desc", icon: Mail },
  { titleKey: "exploreUseCase2", descKey: "exploreUseCase2Desc", icon: FileText },
  { titleKey: "exploreUseCase3", descKey: "exploreUseCase3Desc", icon: Code2 },
  { titleKey: "exploreUseCase4", descKey: "exploreUseCase4Desc", icon: Languages },
  { titleKey: "exploreUseCase5", descKey: "exploreUseCase5Desc", icon: Lightbulb },
  { titleKey: "exploreUseCase6", descKey: "exploreUseCase6Desc", icon: GraduationCap },
];

export function ExploreModal({ open, onClose, onOpenAuth }: ExploreModalProps) {
  const { t } = useI18n();
  const { user } = useAuth();
  const { setSelectedModel, clearCurrentThread } = useChat();

  const handleTryModel = (modelId: string, requiresAuth: boolean) => {
    if (requiresAuth && !user) {
      onClose();
      onOpenAuth();
      return;
    }
    setSelectedModel(modelId);
    clearCurrentThread();
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t("exploreTitle") as string}
      className="sm:max-w-lg"
    >
      <div className="space-y-5 sm:space-y-6">
        <p className="text-sm text-muted-foreground">
          {t("exploreSubtitle")}
        </p>

        {/* Models */}
        <div>
          <h3 className="text-sm font-semibold text-card-foreground mb-3">
            {t("exploreModelsTitle")}
          </h3>
          <div className="space-y-2">
            {MODELS.map((model) => {
              const Icon = modelIconMap[model.id] || Zap;
              return (
                <div
                  key={model.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-accent/50"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-syntalys-blue/10 flex-shrink-0">
                      <Icon className="h-4 w-4 text-syntalys-blue" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-card-foreground truncate">
                          {model.name}
                        </p>
                        {model.badge && (
                          <span
                            className={cn(
                              "rounded-full px-2 py-0.5 text-[10px] font-semibold flex-shrink-0",
                              model.badge === "Beta"
                                ? "bg-syntalys-gold/15 text-syntalys-gold-dark dark:text-syntalys-gold"
                                : "bg-syntalys-blue/10 text-syntalys-blue dark:bg-[#4a8fd4]/15 dark:text-[#4a8fd4]"
                            )}
                          >
                            {model.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {t(model.descriptionKey as TranslationKey) as string}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleTryModel(model.id, model.requiresAuth)}
                    className="flex items-center justify-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-syntalys-blue hover:bg-syntalys-blue/10 transition-colors flex-shrink-0 w-full sm:w-auto border border-syntalys-blue/20 sm:border-0"
                  >
                    {model.requiresAuth && !user ? (
                      <>
                        <Lock className="h-3 w-3" />
                        {t("exploreRequiresAuth")}
                      </>
                    ) : (
                      <>
                        {t("exploreTryNow")}
                        <ArrowRight className="h-3 w-3" />
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Use Cases */}
        <div>
          <h3 className="text-sm font-semibold text-card-foreground mb-3">
            {t("exploreUseCasesTitle")}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {useCases.map((uc) => {
              const Icon = uc.icon;
              return (
                <div
                  key={uc.titleKey}
                  className="rounded-lg border border-border p-3 transition-colors hover:bg-accent/50"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <Icon className="h-4 w-4 text-syntalys-gold flex-shrink-0" />
                    <p className="text-xs font-medium text-card-foreground">
                      {t(uc.titleKey as TranslationKey)}
                    </p>
                  </div>
                  <p className="text-[11px] leading-relaxed text-muted-foreground">
                    {t(uc.descKey as TranslationKey)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Modal>
  );
}
