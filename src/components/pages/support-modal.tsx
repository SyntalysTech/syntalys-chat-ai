"use client";

import { useI18n } from "@/lib/i18n-context";
import { Modal } from "@/components/ui/modal";
import { Mail, ExternalLink, BookOpen, HelpCircle, Bug } from "lucide-react";

interface SupportModalProps {
  open: boolean;
  onClose: () => void;
  onOpenDocumentation: () => void;
}

const SUPPORT_EMAIL = "hello@syntalys.ch";

export function SupportModal({ open, onClose, onOpenDocumentation }: SupportModalProps) {
  const { t } = useI18n();

  const handleOpenDoc = () => {
    onClose();
    onOpenDocumentation();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t("supportTitle") as string}
      className="sm:max-w-md"
    >
      <div className="space-y-5 sm:space-y-6">
        <p className="text-sm text-muted-foreground">
          {t("supportSubtitle")}
        </p>

        {/* Contact */}
        <div className="rounded-lg border border-border p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-2">
            <Mail className="h-4 w-4 text-syntalys-blue flex-shrink-0" />
            <h3 className="text-sm font-semibold text-card-foreground">
              {t("supportContactTitle")}
            </h3>
          </div>
          <p className="text-xs text-muted-foreground mb-3 sm:mb-4">
            {t("supportContactDesc")}
          </p>
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="flex items-center justify-center gap-2 w-full rounded-lg bg-syntalys-blue px-4 py-2.5 text-sm font-medium text-white hover:bg-syntalys-blue-light transition-colors active:scale-[0.98]"
          >
            <Mail className="h-4 w-4" />
            {t("supportSendEmail")}
            <ExternalLink className="h-3 w-3 ml-1 opacity-60" />
          </a>
          <p className="text-[11px] text-muted-foreground text-center mt-3">
            {t("supportResponseTime")}
          </p>
        </div>

        {/* Useful Links */}
        <div>
          <h3 className="text-sm font-semibold text-card-foreground mb-3">
            {t("supportUsefulLinks")}
          </h3>
          <div className="space-y-2">
            <button
              onClick={handleOpenDoc}
              className="flex w-full items-center gap-3 rounded-lg border border-border p-3 text-left hover:bg-accent/50 transition-colors active:scale-[0.98]"
            >
              <BookOpen className="h-4 w-4 text-syntalys-blue flex-shrink-0" />
              <span className="text-sm text-card-foreground">{t("supportViewDoc")}</span>
            </button>
            <button
              onClick={handleOpenDoc}
              className="flex w-full items-center gap-3 rounded-lg border border-border p-3 text-left hover:bg-accent/50 transition-colors active:scale-[0.98]"
            >
              <HelpCircle className="h-4 w-4 text-syntalys-blue flex-shrink-0" />
              <span className="text-sm text-card-foreground">{t("supportViewFaq")}</span>
            </button>
          </div>
        </div>

        {/* Report Bug */}
        <div className="rounded-lg border border-border/60 bg-accent/20 p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-2">
            <Bug className="h-4 w-4 text-syntalys-gold flex-shrink-0" />
            <h3 className="text-sm font-semibold text-card-foreground">
              {t("supportBugTitle")}
            </h3>
          </div>
          <p className="text-xs text-muted-foreground">
            {t("supportBugDesc")}
          </p>
        </div>
      </div>
    </Modal>
  );
}
