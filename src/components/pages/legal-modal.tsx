"use client";

import { useI18n } from "@/lib/i18n-context";
import { Modal } from "@/components/ui/modal";
import type { TranslationKey } from "@/lib/translations";
import {
  Building2,
  Globe,
  ShieldCheck,
  Bot,
  Cookie,
  Copyright,
} from "lucide-react";

interface LegalModalProps {
  open: boolean;
  onClose: () => void;
}

export function LegalModal({ open, onClose }: LegalModalProps) {
  const { t } = useI18n();

  const legalInfo: { labelKey: TranslationKey; value: string }[] = [
    { labelKey: "legalForm", value: t("legalFormValue") as string },
    { labelKey: "legalRepresentative", value: "Neftali Benedic Manzambi" },
    { labelKey: "legalAddress", value: "Route Principale 24, 2915 Bure – Jura, Suisse" },
    { labelKey: "legalEmail", value: "hello@syntalys.ch" },
    { labelKey: "legalVat", value: "CHE-365.557.918" },
  ];

  const contentSections: {
    icon: React.ElementType;
    titleKey: TranslationKey;
    contentKey: TranslationKey;
  }[] = [
    { icon: Globe, titleKey: "legalHostingTitle", contentKey: "legalHostingContent" },
    { icon: ShieldCheck, titleKey: "legalDataTitle", contentKey: "legalDataContent" },
    { icon: Bot, titleKey: "legalAiTitle", contentKey: "legalAiContent" },
    { icon: Cookie, titleKey: "legalCookiesTitle", contentKey: "legalCookiesContent" },
    { icon: Copyright, titleKey: "legalIpTitle", contentKey: "legalIpContent" },
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t("legalTitle") as string}
      className="sm:max-w-lg"
    >
      <div className="space-y-5 sm:space-y-6">
        {/* Legal Info */}
        <div className="rounded-lg border border-border p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-3">
            <Building2 className="h-4 w-4 text-syntalys-blue flex-shrink-0" />
            <h3 className="text-sm font-semibold text-card-foreground">
              {t("legalInfoTitle")}
            </h3>
          </div>
          <div className="space-y-2.5 sm:space-y-2">
            {legalInfo.map((item) => (
              <div key={item.labelKey} className="flex flex-col sm:flex-row sm:gap-2">
                <span className="text-[11px] sm:text-xs text-muted-foreground sm:min-w-[120px] flex-shrink-0">
                  {t(item.labelKey)}
                </span>
                <span className="text-xs font-medium text-card-foreground break-all">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Content Sections */}
        {contentSections.map((section) => {
          const Icon = section.icon;
          return (
            <div key={section.titleKey}>
              <div className="flex items-center gap-2 mb-2">
                <Icon className="h-4 w-4 text-syntalys-blue flex-shrink-0" />
                <h3 className="text-sm font-semibold text-card-foreground">
                  {t(section.titleKey)}
                </h3>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                {t(section.contentKey)}
              </p>
            </div>
          );
        })}

        {/* Copyright footer */}
        <div className="border-t border-border pt-4">
          <p className="text-[11px] text-muted-foreground/60 text-center">
            &copy; {new Date().getFullYear()} SYNTALYS TECH. {t("allRightsReserved")}
          </p>
        </div>
      </div>
    </Modal>
  );
}
