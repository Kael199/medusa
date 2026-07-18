"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Play,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

export interface FeaturedMangaSlide {
  _id: string;
  slug: string;
  title: string;
  bannerImage: string;
  coverImage: string;
  description: string;
  author: string;
  status: string;
  type: string;
  rating: number;
}

interface FeaturedMangaSliderProps {
  slides: FeaturedMangaSlide[];
}

const AUTOPLAY_MS = 7000;

export function FeaturedMangaSlider({ slides }: FeaturedMangaSliderProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const carouselRef = useRef<HTMLElement>(null);

  // Track reduced-motion preference so we can swap the ken-burns + progress
  // animation for a static treatment without breaking transitions.
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener?.("change", update);
    return () => query.removeEventListener?.("change", update);
  }, []);

  const goTo = useCallback(
    (index: number) => {
      if (!slides.length) return;
      setActiveIndex(((index % slides.length) + slides.length) % slides.length);
    },
    [slides.length],
  );

  const next = useCallback(() => goTo(activeIndex + 1), [goTo, activeIndex]);
  const prev = useCallback(() => goTo(activeIndex - 1), [goTo, activeIndex]);

  // Autoplay. Pauses on hover/focus-within, resets on manual navigation
  // (handled because activeIndex is a dep).
  useEffect(() => {
    if (slides.length < 2 || paused) return;
    const timer = window.setTimeout(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, AUTOPLAY_MS);
    return () => window.clearTimeout(timer);
  }, [paused, slides.length, activeIndex]);

  // Keyboard navigation when the carousel region is focused.
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLElement>) => {
      if (slides.length < 2) return;
      if (event.key === "ArrowRight") {
        event.preventDefault();
        next();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        prev();
      }
    },
    [next, prev, slides.length],
  );

  if (!slides.length) return null;

  const active = slides[activeIndex];

  return (
    <section
      ref={carouselRef}
      aria-label="Featured series"
      aria-roledescription="carousel"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setPaused(false);
        }
      }}
      className={cn(
        "reader-public-shell group/carousel relative isolate mb-12 overflow-hidden rounded-xl border border-[hsl(var(--reader-border))] outline-none",
        "shadow-[0_32px_70px_-38px_rgb(0_0_0/0.95)] focus-visible:ring-2 focus-visible:ring-[hsl(var(--reader-cyan))]/60",
      )}
    >
      {/* Stage */}
      <div className="relative min-h-[31rem] sm:min-h-[34rem] lg:min-h-[38rem]">
        {slides.map((slide, index) => {
          const image = slide.bannerImage || slide.coverImage;
          const isActive = index === activeIndex;

          return (
            <article
              key={slide._id}
              aria-hidden={!isActive}
              aria-label={`${index + 1} of ${slides.length}: ${slide.title}`}
              className={cn(
                "absolute inset-0",
                "transition-[opacity,transform] duration-700 ease-out",
                "motion-reduce:duration-200",
                isActive
                  ? "pointer-events-auto translate-x-0 opacity-100"
                  : "pointer-events-none translate-x-4 opacity-0",
              )}
            >
              {/* Background image — Ken-Burns slow zoom when active */}
              {image ? (
                <div className="absolute inset-0 overflow-hidden">
                  <div
                    key={isActive ? "ken-on" : "ken-off"}
                    className={cn(
                      "absolute inset-0",
                      isActive && !reducedMotion
                        ? "animate-ken-burns"
                        : "scale-100",
                    )}
                  >
                    <Image
                      src={image}
                      alt=""
                      fill
                      priority={index === 0}
                      sizes="(max-width: 1280px) 100vw, 1280px"
                      className="object-cover"
                    />
                  </div>
                </div>
              ) : (
                <div
                  className={cn(
                    "absolute inset-0",
                    isActive && !reducedMotion ? "animate-ken-burns" : "",
                  )}
                  style={{
                    backgroundImage: [
                      "radial-gradient(circle at 80% 15%, hsl(322 92% 60% / 0.55), transparent 35%)",
                      "radial-gradient(circle at 15% 85%, hsl(188 95% 60% / 0.45), transparent 45%)",
                      "radial-gradient(circle at 50% 100%, hsl(264 90% 70% / 0.45), transparent 50%)",
                      "linear-gradient(120deg, hsl(232 30% 4%), hsl(232 26% 10%))",
                    ].join(", "),
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
              )}

              {/* Triple-layer gradient overlay: L→R dark, bottom dark, radial neon accent */}
              <div
                aria-hidden
                className="absolute inset-0 bg-[linear-gradient(90deg,rgb(6_8_16/0.98)_0%,rgb(6_8_16/0.88)_38%,rgb(6_8_16/0.42)_70%,rgb(6_8_16/0.12)_100%)]"
              />
              <div
                aria-hidden
                className="absolute inset-0 bg-[linear-gradient(0deg,rgb(6_8_16/0.88)_0%,rgb(6_8_16/0.45)_30%,transparent_60%)]"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-80"
                style={{
                  backgroundImage: [
                    "radial-gradient(60rem 36rem at 90% 110%, hsl(var(--neon-magenta) / 0.28), transparent 60%)",
                    "radial-gradient(48rem 30rem at 100% 0%, hsl(var(--neon-cyan) / 0.18), transparent 65%)",
                  ].join(", "),
                }}
              />

              {/* Subtle grid wash */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 reader-grid-bg opacity-25"
              />

              {/* Content */}
              <div
                className={cn(
                  "relative flex min-h-[31rem] max-w-3xl flex-col justify-end px-6 pb-24 pt-20 sm:min-h-[34rem] sm:px-10 sm:pb-24 lg:min-h-[38rem] lg:px-14",
                )}
              >
                <div className="mb-4 flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[0.18em]">
                  <span className="inline-flex items-center gap-2 rounded border border-[hsl(var(--reader-cyan)/0.45)] bg-[hsl(var(--reader-cyan)/0.12)] px-3 py-1.5 text-[hsl(var(--reader-cyan))] backdrop-blur">
                    <span
                      aria-hidden
                      className="inline-block h-1.5 w-1.5 rounded-full bg-[hsl(var(--reader-cyan))] shadow-[0_0_8px_hsl(var(--reader-cyan))]"
                    />
                    Spotlight · {slide.title}
                  </span>
                  <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-slate-100 backdrop-blur">
                    {slide.status}
                  </span>
                </div>

                <h1 className="max-w-2xl text-balance text-4xl font-black tracking-[-0.045em] text-[hsl(var(--reader-text))] drop-shadow-[0_2px_24px_rgb(0_0_0/0.55)] sm:text-5xl lg:text-6xl">
                  <span className="text-neon-gradient">{slide.title}</span>
                </h1>

                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-200">
                  {slide.author && (
                    <span className="text-[hsl(var(--reader-muted))]">
                      By {slide.author}
                    </span>
                  )}
                  <span className="capitalize text-[hsl(var(--reader-violet))]">
                    {slide.type}
                  </span>
                  {slide.rating > 0 && (
                    <span className="inline-flex items-center gap-1 font-semibold text-[hsl(var(--neon-cyan))]">
                      <Star className="h-4 w-4 fill-current" />{" "}
                      {slide.rating.toFixed(1)}
                    </span>
                  )}
                </div>

                {slide.description && (
                  <p className="mt-4 max-w-xl text-pretty text-sm leading-6 text-[hsl(var(--reader-text))]/85 sm:text-base sm:leading-7">
                    {slide.description}
                  </p>
                )}

                <div className="mt-7 flex flex-wrap gap-3">
                  <Button
                    asChild
                    size="lg"
                    className={cn(
                      "border border-[hsl(var(--neon-magenta)/0.55)] text-white shadow-[var(--glow-neon)]",
                      "bg-[linear-gradient(115deg,hsl(var(--neon-magenta)),hsl(var(--neon-violet))_55%,hsl(var(--neon-cyan)))]",
                      "hover:brightness-110",
                    )}
                  >
                    <Link
                      href={`/manga/${slide.slug}`}
                      tabIndex={isActive ? 0 : -1}
                      aria-hidden={!isActive}
                    >
                      <Play className="h-4 w-4 fill-current" /> Start reading
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="border-white/25 bg-white/10 text-white backdrop-blur hover:border-[hsl(var(--neon-cyan)/0.7)] hover:bg-white/15 hover:text-white"
                  >
                    <Link
                      href={`/manga/${slide.slug}`}
                      tabIndex={isActive ? 0 : -1}
                      aria-hidden={!isActive}
                    >
                      Details <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Animated neon progress bar — wraps with key={slide._id} so the
                  bar resets per slide change. Skips animation when reduced. */}
              <div
                key={`progress-${slide._id}-${isActive ? "on" : "off"}`}
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 h-[3px] bg-white/5"
              >
                <div
                  className={cn(
                    "h-full origin-left",
                    isActive && !reducedMotion
                      ? "animate-progress-fill"
                      : isActive
                        ? "scale-x-1"
                        : "scale-x-0",
                  )}
                  style={{
                    backgroundImage:
                      "linear-gradient(90deg, hsl(var(--neon-magenta)), hsl(var(--neon-violet)) 50%, hsl(var(--neon-cyan)))",
                    boxShadow:
                      "0 0 12px hsl(var(--neon-magenta) / 0.55), 0 0 24px hsl(var(--neon-cyan) / 0.35)",
                    animationDuration: reducedMotion
                      ? undefined
                      : `${AUTOPLAY_MS}ms`,
                  }}
                />
              </div>
            </article>
          );
        })}
      </div>

      {slides.length > 1 && (
        <>
          {/* Vertical thumbnail rail (lg+) */}
          <div
            role="tablist"
            aria-label="Featured series thumbnails"
            className="absolute right-3 top-1/2 z-10 hidden -translate-y-1/2 flex-col items-center gap-2 rounded-xl border border-white/10 bg-slate-950/40 p-2 backdrop-blur-xl lg:flex"
          >
            {slides.map((slide, index) => {
              const isActive = index === activeIndex;
              return (
                <button
                  key={slide._id}
                  type="button"
                  role="tab"
                  aria-label={`Show ${slide.title}`}
                  aria-selected={isActive}
                  aria-current={isActive ? "true" : undefined}
                  onClick={() => goTo(index)}
                  className={cn(
                    "relative h-[84px] w-[60px] overflow-hidden rounded-md border transition-all duration-300 ease-out",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--neon-cyan))]/70",
                    isActive
                      ? "scale-[1.04] border-transparent shadow-[0_0_0_1.5px_hsl(var(--neon-cyan)),0_8px_28px_-6px_hsl(var(--neon-cyan)/0.65)]"
                      : "border-white/15 opacity-70 hover:scale-[1.03] hover:opacity-100",
                  )}
                >
                  {slide.coverImage || slide.bannerImage ? (
                    <Image
                      src={slide.coverImage || slide.bannerImage}
                      alt=""
                      fill
                      sizes="60px"
                      className="object-cover"
                    />
                  ) : (
                    <div
                      aria-hidden
                      className="absolute inset-0 bg-[linear-gradient(135deg,hsl(var(--neon-magenta)/0.55),hsl(var(--neon-violet)/0.55),hsl(var(--neon-cyan)/0.55))]"
                    />
                  )}
                  <span
                    aria-hidden
                    className={cn(
                      "pointer-events-none absolute inset-0 transition-opacity duration-300",
                      isActive
                        ? "opacity-0"
                        : "bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-100",
                    )}
                  />
                </button>
              );
            })}
          </div>

          {/* Dot indicators + counter (bottom-left) */}
          <div className="absolute bottom-6 left-6 z-10 flex items-center gap-3 sm:left-10 lg:left-14">
            <div className="flex items-center gap-2">
              {slides.map((slide, index) => {
                const isActive = index === activeIndex;
                return (
                  <button
                    key={slide._id}
                    type="button"
                    aria-label={`Show ${slide.title}`}
                    aria-current={isActive ? "true" : undefined}
                    onClick={() => goTo(index)}
                    className={cn(
                      "group/dot relative h-2 rounded-full transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--neon-cyan))]/70",
                      isActive
                        ? "w-10 shadow-[0_0_12px_hsl(var(--neon-cyan)/0.55)]"
                        : "w-2 bg-white/40 hover:bg-white/70",
                    )}
                  >
                    {isActive && (
                      <span
                        aria-hidden
                        className="absolute inset-0 rounded-full"
                        style={{
                          backgroundImage:
                            "linear-gradient(90deg, hsl(var(--neon-magenta)), hsl(var(--neon-violet)) 50%, hsl(var(--neon-cyan)))",
                        }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
            <span className="rounded-md border border-white/10 bg-slate-950/55 px-2.5 py-1 text-[11px] font-semibold tabular-nums tracking-[0.18em] text-[hsl(var(--reader-text))]/80 backdrop-blur">
              {String(activeIndex + 1).padStart(2, "0")}
              <span className="mx-1 text-[hsl(var(--reader-muted))]">/</span>
              {String(slides.length).padStart(2, "0")}
            </span>
          </div>

          {/* Prev / Next buttons (bottom-right) */}
          <div className="absolute bottom-6 right-6 z-10 flex gap-2 sm:right-10 lg:right-[5.75rem]">
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Previous featured series"
              onClick={prev}
              className={cn(
                "h-10 w-10 border-white/20 bg-slate-950/45 text-white backdrop-blur-xl",
                "hover:border-[hsl(var(--neon-cyan)/0.7)] hover:bg-slate-950/65 hover:text-[hsl(var(--neon-cyan))]",
                "hover:shadow-[0_0_18px_-2px_hsl(var(--neon-cyan)/0.55)]",
              )}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Next featured series"
              onClick={next}
              className={cn(
                "h-10 w-10 border-white/20 bg-slate-950/45 text-white backdrop-blur-xl",
                "hover:border-[hsl(var(--neon-magenta)/0.7)] hover:bg-slate-950/65 hover:text-[hsl(var(--neon-magenta))]",
                "hover:shadow-[0_0_18px_-2px_hsl(var(--neon-magenta)/0.55)]",
              )}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </>
      )}
    </section>
  );
}

export default FeaturedMangaSlider;
