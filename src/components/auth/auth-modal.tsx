"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n-context";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { Loader2, AlertCircle } from "lucide-react";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  isDark: boolean;
}

export function AuthModal({ open, onClose, isDark }: AuthModalProps) {
  const { signIn, signUp } = useAuth();
  const { t } = useI18n();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "login") {
        const result = await signIn(email, password);
        if (result.error) {
          setError(result.error);
          return;
        }
      } else {
        if (password.length < 6) {
          setError(t("passwordTooShort") as string);
          return;
        }
        const result = await signUp(email, password, displayName || undefined);
        if (result.error) {
          setError(result.error);
          return;
        }
      }
      onClose();
      resetForm();
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setDisplayName("");
    setError("");
  };

  const toggleMode = () => {
    setMode((m) => (m === "login" ? "register" : "login"));
    setError("");
  };

  return (
    <Modal open={open} onClose={onClose} className="max-w-sm">
      <div className="flex flex-col items-center">
        {/* Logo */}
        <Image
          src={
            isDark
              ? "/logos/logo-horizontal-white.png"
              : "/logos/logo-horizontal-blue.png"
          }
          alt="SYNTALYS"
          width={160}
          height={40}
          className="mb-6 h-10 w-auto"
        />

        <h2 className="mb-1 text-lg font-semibold text-card-foreground">
          {mode === "login" ? t("welcomeBack") : t("createAccount")}
        </h2>
        <p className="mb-6 text-sm text-muted-foreground">
          {mode === "login" ? t("signInSubtitle") : t("registerSubtitle")}
        </p>

        {error && (
          <div className="mb-4 flex w-full items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full space-y-3">
          {mode === "register" && (
            <div>
              <label
                htmlFor="displayName"
                className="mb-1 block text-sm font-medium text-card-foreground"
              >
                {t("nameOptional")}
              </label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder={t("yourName") as string}
                autoComplete="name"
              />
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium text-card-foreground"
            >
              {t("email")}
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium text-card-foreground"
            >
              {t("password")}
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={
                mode === "register"
                  ? (t("minChars") as string)
                  : (t("yourPassword") as string)
              }
              required
              minLength={6}
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : mode === "login" ? (
              t("signIn")
            ) : (
              t("createAccount")
            )}
          </Button>
        </form>

        <div className="mt-4 w-full border-t border-border pt-4">
          <p className="text-center text-sm text-muted-foreground">
            {mode === "login" ? t("noAccount") : t("hasAccount")}{" "}
            <button
              onClick={toggleMode}
              className="font-medium text-syntalys-blue hover:underline"
            >
              {mode === "login" ? t("register") : t("signIn")}
            </button>
          </p>
        </div>
      </div>
    </Modal>
  );
}
