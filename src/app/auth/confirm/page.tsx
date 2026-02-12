"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n-context";

export default function ConfirmPage() {
  const { resolvedTheme } = useTheme();
  const { t } = useI18n();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? resolvedTheme === "dark" : true;
  const logoSrc = isDark
    ? "/logos/logo-horizontal-white.png"
    : "/logos/logo-horizontal-blue.png";

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm text-center">
        <Image
          src={logoSrc}
          alt="SYNTALYS"
          width={160}
          height={40}
          className="mx-auto mb-8 h-10 w-auto"
        />

        <div className="mb-4 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
            <CheckCircle2 className="h-9 w-9 text-green-500" />
          </div>
        </div>

        <h1 className="mb-2 text-xl font-semibold text-foreground">
          {t("emailConfirmedTitle")}
        </h1>

        <p className="mb-8 text-sm text-muted-foreground">
          {t("emailConfirmedDesc")}
        </p>

        <a href="/">
          <Button className="w-full">
            {t("startChatting")}
          </Button>
        </a>
      </div>
    </div>
  );
}
