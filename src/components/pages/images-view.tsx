"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useI18n } from "@/lib/i18n-context";
import { useAuth } from "@/lib/auth-context";
import type { GeneratedImage } from "@/lib/types";
import type { TranslationKey } from "@/lib/translations";
import { cn } from "@/lib/utils";
import {
  Palette,
  Loader2,
  Menu,
  Download,
  Trash2,
  X,
  ImagePlus,
  Sparkles,
} from "lucide-react";

interface ImagesViewProps {
  onMenuClick: () => void;
}

const IMAGES_PER_PAGE = 20;

export function ImagesView({ onMenuClick }: ImagesViewProps) {
  const { t } = useI18n();
  const { user } = useAuth();

  // Input state
  const [prompt, setPrompt] = useState("");
  const [refImages, setRefImages] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");

  // Gallery state
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loadingGallery, setLoadingGallery] = useState(true);
  const [hasMore, setHasMore] = useState(false);

  // Lightbox state
  const [lightboxImage, setLightboxImage] = useState<GeneratedImage | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Newly generated image (shown prominently)
  const [newImage, setNewImage] = useState<GeneratedImage | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Load gallery on mount and when page changes
  const fetchGallery = useCallback(async (pageNum: number, append = false) => {
    if (!user) return;
    try {
      setLoadingGallery(true);
      const res = await fetch(`/api/images?page=${pageNum}&limit=${IMAGES_PER_PAGE}`);
      if (!res.ok) return;
      const data = await res.json();
      setImages((prev) => append ? [...prev, ...data.images] : data.images);
      setTotal(data.total);
      setHasMore(data.hasMore);
    } catch {
      // Silently fail
    } finally {
      setLoadingGallery(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) fetchGallery(1);
  }, [user, fetchGallery]);

  const handleLoadMore = useCallback(() => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchGallery(nextPage, true);
  }, [page, fetchGallery]);

  // Handle reference image attachment
  const handleRefImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      if (refImages.length >= 5) return;

      const reader = new FileReader();
      reader.onload = () => {
        setRefImages((prev) => {
          if (prev.length >= 5) return prev;
          return [...prev, reader.result as string];
        });
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [refImages.length]);

  const removeRefImage = useCallback((index: number) => {
    setRefImages((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // Generate image
  const handleGenerate = useCallback(async () => {
    if (!prompt.trim() || isGenerating || !user) return;

    setIsGenerating(true);
    setError("");
    setNewImage(null);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/images/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.trim(),
          imageUrls: refImages.length > 0 ? refImages : undefined,
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Error generating image");
        return;
      }

      const data = await res.json();
      const generated: GeneratedImage = {
        id: data.id,
        user_id: user.id,
        prompt: data.prompt,
        revised_prompt: data.revised_prompt,
        image_url: data.image_url,
        storage_path: data.storage_path,
        size: data.size,
        created_at: data.created_at,
      };

      setNewImage(generated);
      setImages((prev) => [generated, ...prev]);
      setTotal((prev) => prev + 1);
      setPrompt("");
      setRefImages([]);
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setError("Error generating image");
      }
    } finally {
      setIsGenerating(false);
      abortRef.current = null;
    }
  }, [prompt, isGenerating, user, refImages]);

  // Delete image
  const handleDelete = useCallback(async (imageId: string) => {
    try {
      const res = await fetch(`/api/images?id=${imageId}`, { method: "DELETE" });
      if (!res.ok) return;

      setImages((prev) => prev.filter((img) => img.id !== imageId));
      setTotal((prev) => Math.max(0, prev - 1));
      if (lightboxImage?.id === imageId) setLightboxImage(null);
      if (newImage?.id === imageId) setNewImage(null);
      setDeleteConfirm(null);
    } catch {
      // Silently fail
    }
  }, [lightboxImage, newImage]);

  // Download image
  const handleDownload = useCallback(async (image: GeneratedImage) => {
    try {
      const res = await fetch(image.image_url);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `syntalys-image-${image.id.slice(0, 8)}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      // Fallback: open in new tab
      window.open(image.image_url, "_blank");
    }
  }, []);

  // Handle keyboard submit
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  }, [handleGenerate]);

  // Not logged in
  if (!user) {
    return (
      <div className="flex flex-1 flex-col min-h-0 overflow-hidden">
        <header className="sticky top-0 z-30 flex items-center border-b border-border/50 bg-background/80 backdrop-blur-md px-1.5 sm:px-4 py-1 sm:py-2">
          <div className="flex items-center gap-0.5 sm:gap-2">
            <button
              onClick={onMenuClick}
              className="flex h-11 w-11 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent active:bg-accent/80 transition-colors lg:hidden"
              aria-label={t("menu") as string}
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-syntalys-blue/10">
                <Palette className="h-4 w-4 text-syntalys-blue" />
              </div>
              <h1 className="text-sm font-semibold text-foreground">
                {t("imagesTitle" as TranslationKey)}
              </h1>
            </div>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center space-y-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-syntalys-blue/10 mx-auto">
              <Palette className="h-8 w-8 text-syntalys-blue" />
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              {t("imagesLoginRequired" as TranslationKey)}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col min-h-0 overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 z-30 flex items-center border-b border-border/50 bg-background/80 backdrop-blur-md px-1.5 sm:px-4 py-1 sm:py-2">
        <div className="flex items-center gap-0.5 sm:gap-2">
          <button
            onClick={onMenuClick}
            className="flex h-11 w-11 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent active:bg-accent/80 transition-colors lg:hidden"
            aria-label={t("menu") as string}
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-syntalys-blue/10">
              <Palette className="h-4 w-4 text-syntalys-blue" />
            </div>
            <h1 className="text-sm font-semibold text-foreground">
              {t("imagesTitle" as TranslationKey)}
            </h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin pl-safe pr-safe">
        <div className="mx-auto max-w-4xl px-3 sm:px-4 py-6 sm:py-10 space-y-6">
          {/* Subtitle */}
          <p className="text-[13px] sm:text-sm text-muted-foreground text-center max-w-md mx-auto">
            {t("imagesSubtitle" as TranslationKey)}
          </p>

          {/* Input Section */}
          <div className="space-y-3">
            {/* Reference images preview */}
            {refImages.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {refImages.map((img, i) => (
                  <div key={i} className="relative group">
                    <img
                      src={img}
                      alt={`Reference ${i + 1}`}
                      className="h-16 w-16 rounded-lg object-cover border border-border"
                    />
                    <button
                      onClick={() => removeRefImage(i)}
                      className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-destructive text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Input row */}
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t("imagesPlaceholder" as TranslationKey) as string}
                  rows={2}
                  className="w-full rounded-xl border border-border bg-card px-4 py-3 pr-12 text-[16px] sm:text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-syntalys-blue/40 focus:ring-1 focus:ring-syntalys-blue/20 transition-colors resize-none"
                  disabled={isGenerating}
                />
                {/* Attach reference image button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isGenerating || refImages.length >= 5}
                  className="absolute right-2 bottom-2 flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors disabled:opacity-30"
                  title={t("imagesAttachRef" as TranslationKey) as string}
                >
                  <ImagePlus className="h-4 w-4" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleRefImageSelect}
                />
              </div>

              <button
                onClick={isGenerating ? () => abortRef.current?.abort() : handleGenerate}
                disabled={!prompt.trim() && !isGenerating}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-medium transition-all active:scale-[0.98] self-end",
                  isGenerating
                    ? "bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/20"
                    : "bg-syntalys-blue text-white hover:bg-syntalys-blue-light disabled:opacity-40 disabled:cursor-not-allowed"
                )}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="hidden sm:inline">{t("imagesGenerating" as TranslationKey)}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span className="hidden sm:inline">{t("imagesGenerate" as TranslationKey)}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Newly generated image preview */}
          {newImage && (
            <div className="animate-fade-in">
              <div className="rounded-xl border border-syntalys-blue/20 bg-syntalys-blue/5 p-3 sm:p-4">
                <div className="flex gap-4">
                  <img
                    src={newImage.image_url}
                    alt={newImage.prompt}
                    className="h-32 w-32 sm:h-40 sm:w-40 rounded-lg object-cover flex-shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => setLightboxImage(newImage)}
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <p className="text-sm text-foreground line-clamp-3">
                      {newImage.prompt}
                    </p>
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleDownload(newImage)}
                        className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium bg-accent hover:bg-accent/80 text-foreground transition-colors"
                      >
                        <Download className="h-3.5 w-3.5" />
                        {t("imagesDownload" as TranslationKey)}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Gallery */}
          {(images.length > 0 || loadingGallery) && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("imagesGallery" as TranslationKey)}
                  {total > 0 && (
                    <span className="ml-1.5 text-muted-foreground/60">({total})</span>
                  )}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {images.map((image) => (
                  <div
                    key={image.id}
                    className="group relative rounded-xl overflow-hidden border border-border bg-card cursor-pointer hover:border-syntalys-blue/30 transition-colors"
                    onClick={() => setLightboxImage(image)}
                  >
                    <div className="aspect-square">
                      <img
                        src={image.image_url}
                        alt={image.prompt}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-0 left-0 right-0 p-2.5">
                        <p className="text-xs text-white line-clamp-2 leading-relaxed">
                          {image.prompt}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Loading skeleton */}
              {loadingGallery && images.length === 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="aspect-square rounded-xl bg-muted animate-pulse" />
                  ))}
                </div>
              )}

              {/* Load more */}
              {hasMore && !loadingGallery && (
                <div className="flex justify-center pt-2">
                  <button
                    onClick={handleLoadMore}
                    className="rounded-lg px-4 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                  >
                    {t("imagesLoadMore" as TranslationKey)}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Empty state */}
          {!loadingGallery && images.length === 0 && !newImage && !isGenerating && (
            <div className="text-center py-10 space-y-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mx-auto">
                <Palette className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                {t("imagesEmpty" as TranslationKey)}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => { setLightboxImage(null); setDeleteConfirm(null); }}
        >
          <div
            className="relative max-w-3xl w-full max-h-[90vh] flex flex-col bg-card rounded-2xl border border-border shadow-2xl overflow-hidden animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => { setLightboxImage(null); setDeleteConfirm(null); }}
              className="absolute top-3 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Image */}
            <div className="flex-1 min-h-0 flex items-center justify-center bg-black/5 dark:bg-black/20">
              <img
                src={lightboxImage.image_url}
                alt={lightboxImage.prompt}
                className="max-h-[60vh] w-auto max-w-full object-contain"
              />
            </div>

            {/* Info + Actions */}
            <div className="p-4 sm:p-5 border-t border-border space-y-3">
              <p className="text-sm text-foreground leading-relaxed">
                {lightboxImage.prompt}
              </p>
              {lightboxImage.revised_prompt && lightboxImage.revised_prompt !== lightboxImage.prompt && (
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <span className="font-medium">DALL-E:</span> {lightboxImage.revised_prompt}
                </p>
              )}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownload(lightboxImage)}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium bg-syntalys-blue text-white hover:bg-syntalys-blue-light transition-colors"
                >
                  <Download className="h-3.5 w-3.5" />
                  {t("imagesDownload" as TranslationKey)}
                </button>

                {deleteConfirm === lightboxImage.id ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-destructive">
                      {t("imagesDeleteConfirm" as TranslationKey)}
                    </span>
                    <button
                      onClick={() => handleDelete(lightboxImage.id)}
                      className="rounded-lg px-3 py-2 text-xs font-medium bg-destructive text-white hover:bg-destructive/90 transition-colors"
                    >
                      {t("imagesDelete" as TranslationKey)}
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="rounded-lg px-3 py-2 text-xs font-medium bg-accent text-foreground hover:bg-accent/80 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeleteConfirm(lightboxImage.id)}
                    className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    {t("imagesDelete" as TranslationKey)}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
