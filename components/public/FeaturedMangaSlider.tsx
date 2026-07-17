"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowRight,
  BookOpen,
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

  const goTo = useCallback(
    (index: number) => {
      setActiveIndex((index + slides.length) % slides.length);
    },
    [slides.length],
  );

  useEffect(() => {
    if (slides.length < 2 || paused) return;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, AUTOPLAY_MS);

    return () => window.clearInterval(timer);
  }, [paused, slides.length]);

  if (!slides.length) return null;

  return (
    <section
      aria-label="Featured series"
      aria-roledescription="carousel"
      className="relative isolate mb-12 overflow-hidden rounded-xl border border-white/10 bg-[#111520] shadow-[0_32px_70px_-38px_rgb(0_0_0/0.95)]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false);
      }}
    >
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
                "absolute inset-0 transition-[opacity,transform] duration-700 motion-reduce:transition-none",
                isActive
                  ? "pointer-events-auto translate-x-0 opacity-100"
                  : "pointer-events-none translate-x-3 opacity-0",
              )}
            >
              {image ? (
                <Image
                  src={image}
                  alt=""
                  fill
                  priority={index === 0}
                  sizes="(max-width: 1280px) 100vw, 1280px"
                  className={cn(
                    "object-cover transition-transform duration-[7000ms] ease-linear motion-reduce:transition-none",
                    isActive ? "scale-110" : "scale-100",
                  )}
                />
              ) : (
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_15%,hsl(24_95%_53%/0.85),transparent_35%),radial-gradient(circle_at_15%_85%,hsl(243_75%_59%/0.7),transparent_45%),linear-gradient(120deg,#090c1a,#1e1b4b)]" />
              )}
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgb(8_10_16/0.98)_0%,rgb(8_10_16/0.9)_42%,rgb(8_10_16/0.38)_72%,rgb(8_10_16/0.12)_100%)]" />
              <div className="absolute inset-0 bg-[linear-gradient(0deg,rgb(8_10_16/0.84)_0%,transparent_52%)]" />
              <div className="pointer-events-none absolute inset-0 reader-grid-bg opacity-25" />

              <div className="relative flex min-h-[31rem] max-w-3xl flex-col justify-end px-6 pb-16 pt-20 sm:min-h-[34rem] sm:px-10 sm:pb-20 lg:min-h-[38rem] lg:px-14">
                <div className="mb-4 flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-orange-200">
                  <span className="rounded border border-[hsl(var(--reader-accent)/0.45)] bg-[hsl(var(--reader-accent)/0.15)] px-3 py-1.5 text-[hsl(var(--reader-accent))] backdrop-blur">
                    Spotlight title
                  </span>
                  <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-slate-100 backdrop-blur">
                    {slide.status}
                  </span>
                </div>

                <h1 className="max-w-2xl text-balance text-4xl font-black tracking-[-0.045em] text-white drop-shadow-sm sm:text-5xl lg:text-6xl">
                  {slide.title}
                </h1>

                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-200">
                  {slide.author && <span>By {slide.author}</span>}
                  <span className="capitalize text-indigo-200">{slide.type}</span>
                  {slide.rating > 0 && (
                    <span className="inline-flex items-center gap-1 font-semibold text-amber-300">
                      <Star className="h-4 w-4 fill-current" /> {slide.rating.toFixed(1)}
                    </span>
                  )}
                </div>

                {slide.description && (
                  <p className="mt-4 max-w-xl text-pretty text-sm leading-6 text-slate-200 sm:text-base sm:leading-7">
                    {slide.description}
                  </p>
                )}

                <div className="mt-7 flex flex-wrap gap-3">
                  <Button asChild size="lg" className="bg-[hsl(var(--reader-accent))] text-white shadow-lg shadow-black/30 hover:bg-[hsl(var(--reader-accent-strong))]">
                    <Link href={`/manga/${slide.slug}`} tabIndex={isActive ? 0 : -1}>
                      <Play className="h-4 w-4 fill-current" /> Start reading
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="border-white/25 bg-white/10 text-white backdrop-blur hover:border-white/40 hover:bg-white/20 hover:text-white"
                  >
                    <Link href={`/manga/${slide.slug}`} tabIndex={isActive ? 0 : -1}>
                      Details <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {slides.length > 1 && (
        <>
          <div className="absolute bottom-6 left-6 z-10 flex items-center gap-2 sm:left-10 lg:left-14">
            {slides.map((slide, index) => (
              <button
                key={slide._id}
                type="button"
                aria-label={`Show ${slide.title}`}
                aria-current={index === activeIndex ? "true" : undefined}
                onClick={() => goTo(index)}
                className={cn(
                  "h-2 rounded-full transition-all focus-visible:ring-white",
                  index === activeIndex ? "w-8 bg-orange-400" : "w-2 bg-white/45 hover:bg-white/80",
                )}
              />
            ))}
            <span className="ml-2 text-xs font-medium tabular-nums text-white/70">
              {String(activeIndex + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
            </span>
          </div>
          <div className="absolute bottom-6 right-6 z-10 flex gap-2 sm:right-10 lg:right-14">
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Previous featured series"
              onClick={() => goTo(activeIndex - 1)}
              className="h-10 w-10 border-white/20 bg-slate-950/35 text-white backdrop-blur hover:bg-white/15 hover:text-white"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Next featured series"
              onClick={() => goTo(activeIndex + 1)}
              className="h-10 w-10 border-white/20 bg-slate-950/35 text-white backdrop-blur hover:bg-white/15 hover:text-white"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </>
      )}

      {!slides[activeIndex].bannerImage && !slides[activeIndex].coverImage && (
        <BookOpen className="absolute right-10 top-10 h-20 w-20 text-white/15 sm:right-16 sm:top-16" aria-hidden />
      )}
    </section>
  );
}
