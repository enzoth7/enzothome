"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

export type ServiceInteractorItem = {
  number: string;
  title: string;
  description: string;
  items: string[];
  image: string;
  href: string;
};

type ServiceInteractorProps = {
  id: string;
  items: ServiceInteractorItem[];
  linkLabel: string;
  listLabel: string;
};

export function ConnoisseurStackInteractor({ id, items, linkLabel, listLabel }: ServiceInteractorProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const instanceId = id;
  const activeItem = items[activeIndex];
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const desktopQuery = window.matchMedia("(min-width: 1024px)");
    let animationFrame = 0;

    const updateFromScroll = () => {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(() => {
        if (!desktopQuery.matches) return;

        const containerRect = container.getBoundingClientRect();
        if (containerRect.top >= window.innerHeight || containerRect.bottom <= 0) return;

        const tabs = container.querySelectorAll<HTMLButtonElement>("[data-service-tab]");
        const readingLine = window.innerHeight * 0.45;
        let closestIndex = 0;
        let closestDistance = Number.POSITIVE_INFINITY;

        tabs.forEach((tab, index) => {
          const rect = tab.getBoundingClientRect();
          const distance = Math.abs(rect.top + rect.height / 2 - readingLine);

          if (distance < closestDistance) {
            closestDistance = distance;
            closestIndex = index;
          }
        });

        setActiveIndex((current) => (current === closestIndex ? current : closestIndex));
      });
    };

    updateFromScroll();
    window.addEventListener("scroll", updateFromScroll, { passive: true });
    window.addEventListener("resize", updateFromScroll);
    desktopQuery.addEventListener("change", updateFromScroll);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("scroll", updateFromScroll);
      window.removeEventListener("resize", updateFromScroll);
      desktopQuery.removeEventListener("change", updateFromScroll);
    };
  }, [items.length]);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const pieces = container.querySelectorAll<SVGGraphicsElement>(
      `[data-mask-index="${activeIndex}"] .service-mask-piece`,
    );
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const context = gsap.context(() => {
      gsap.killTweensOf(pieces);

      if (reducedMotion) {
        gsap.set(pieces, { clearProps: "all", opacity: 1, scale: 1 });
        return;
      }

      gsap.set(pieces, {
        opacity: 1,
        scale: 0.18,
        transformBox: "fill-box",
        transformOrigin: "50% 50%",
      });

      gsap
        .timeline()
        .to(pieces, {
          scale: 1,
          duration: 0.7,
          stagger: { amount: 0.32, from: "random" },
          ease: "expo.out",
        })
        .to(pieces, {
          scale: 1.025,
          duration: 1.15,
          stagger: { amount: 0.12, from: "center" },
          yoyo: true,
          repeat: 1,
          ease: "sine.inOut",
        });
    }, container);

    return () => context.revert();
  }, [activeIndex]);

  if (!activeItem) return null;

  const selectItem = (index: number) => {
    if (index !== activeIndex) setActiveIndex(index);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    const keys = ["ArrowDown", "ArrowRight", "ArrowUp", "ArrowLeft", "Home", "End"];
    if (!keys.includes(event.key)) return;

    event.preventDefault();
    let nextIndex = index;

    if (event.key === "ArrowDown" || event.key === "ArrowRight") nextIndex = (index + 1) % items.length;
    if (event.key === "ArrowUp" || event.key === "ArrowLeft") nextIndex = (index - 1 + items.length) % items.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = items.length - 1;

    selectItem(nextIndex);
    containerRef.current
      ?.querySelectorAll<HTMLButtonElement>("[data-service-tab]")
      [nextIndex]?.focus();
  };

  return (
    <div ref={containerRef} className="grid items-start gap-14 py-4 lg:grid-cols-[minmax(0,1fr)_minmax(380px,1fr)] lg:gap-16">
        <div role="tablist" aria-label={listLabel} aria-orientation="vertical">
          <div className="flex flex-col gap-9 sm:gap-11 lg:gap-0">
        {items.map((item, index) => {
          const isActive = index === activeIndex;

          return (
            <button
              key={item.number}
              id={`${instanceId}-service-${index}`}
              type="button"
              role="tab"
              data-service-tab
              aria-selected={isActive}
              aria-controls={`${instanceId}-service-panel`}
              tabIndex={isActive ? 0 : -1}
              onMouseEnter={() => selectItem(index)}
              onFocus={() => selectItem(index)}
              onClick={() => selectItem(index)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              className="group flex min-h-20 w-full cursor-pointer items-start gap-4 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-[#FAF9F6] sm:min-h-24 sm:gap-6 lg:min-h-[42vh] lg:items-center"
            >
              <span
                className={`mt-1 w-9 shrink-0 font-mono text-xl font-bold tracking-[-0.05em] transition-all duration-300 sm:mt-2 sm:w-12 sm:text-2xl ${
                  isActive ? "scale-110 text-[#FAF9F6]" : "text-[#FAF9F6]/35"
                }`}
              >
                {item.number}
              </span>
              <span
                className={`max-w-[11ch] font-sans text-[2.1rem] font-semibold uppercase leading-[0.9] tracking-[-0.055em] transition-all duration-400 sm:text-5xl lg:text-[3.35rem] xl:text-6xl ${
                  isActive
                    ? "translate-x-3 text-[#FAF9F6] opacity-100"
                    : "text-transparent opacity-45 [-webkit-text-stroke:1.2px_#FAF9F6] group-hover:opacity-65"
                }`}
              >
                {item.title}
              </span>
            </button>
          );
        })}
          </div>

          <div aria-hidden="true" className="mt-10 hidden items-center gap-2 lg:flex">
            {items.map((item, index) => (
              <span
                key={item.number}
                className={`h-px transition-all duration-500 ${
                  index === activeIndex ? "w-14 bg-[#FAF9F6]" : "w-6 bg-[#FAF9F6]/25"
                }`}
              />
            ))}
          </div>
        </div>

        <div
          id={`${instanceId}-service-panel`}
          role="tabpanel"
          aria-labelledby={`${instanceId}-service-${activeIndex}`}
          className="min-w-0 lg:sticky lg:top-24 lg:self-start lg:pt-2"
        >
          <div className="relative mx-auto aspect-square w-full max-w-[540px]">
          <div aria-hidden="true" className="absolute inset-[8%] rounded-full bg-[#FAF9F6]/[0.07] blur-[90px]" />
          <svg
            viewBox="0 0 500 500"
            className="relative h-full w-full drop-shadow-[0_30px_60px_rgba(17,17,17,0.55)]"
            role="img"
            aria-label={activeItem.title}
          >
            <defs>
              <clipPath id={`${instanceId}-mask-0`} data-mask-index="0">
                <path className="service-mask-piece" d="M481 235H19c-6 0-11-5-11-11v-9c0-6 5-11 11-11h462c6 0 11 5 11 11v9c0 6-5 11-11 11Z" />
                <path className="service-mask-piece" d="M483 362H17c-5 0-9-4-9-9s4-9 9-9h466c5 0 9 4 9 9s-4 9-9 9Z" />
                <path className="service-mask-piece" d="M460 336H40c-17 0-31-14-31-31v-31c0-17 14-31 31-31h420c17 0 31 14 31 31v31c0 17-14 31-31 31Z" />
                <path className="service-mask-piece" d="M459 196H41v-35c0-48 39-86 86-86h246c48 0 86 38 86 86v35Z" />
                <path className="service-mask-piece" d="M442 425H58c-10 0-17-8-17-17v-38h418v38c0 9-8 17-17 17Z" />
              </clipPath>

              <clipPath id={`${instanceId}-mask-1`} data-mask-index="1">
                <rect className="service-mask-piece" x="20" y="20" width="200" height="280" rx="12" />
                <rect className="service-mask-piece" x="20" y="320" width="200" height="160" rx="12" />
                <rect className="service-mask-piece" x="240" y="20" width="240" height="140" rx="12" />
                <rect className="service-mask-piece" x="240" y="180" width="110" height="160" rx="12" />
                <rect className="service-mask-piece" x="370" y="180" width="110" height="160" rx="12" />
                <rect className="service-mask-piece" x="240" y="360" width="240" height="120" rx="12" />
              </clipPath>

              <clipPath id={`${instanceId}-mask-2`} data-mask-index="2">
                {Array.from({ length: 9 }).map((_, index) => (
                  <rect
                    key={index}
                    className="service-mask-piece"
                    x={(index % 3) * 160 + 20}
                    y={Math.floor(index / 3) * 160 + 20}
                    width="140"
                    height="140"
                    rx="4"
                  />
                ))}
              </clipPath>
            </defs>

            <g clipPath={`url(#${instanceId}-mask-${activeIndex})`}>
              <rect width="500" height="500" fill="#FAF9F6" opacity="0.1" />
              <image
                key={activeItem.image}
                href={activeItem.image}
                width="500"
                height="500"
                preserveAspectRatio="xMidYMid slice"
                style={{ mixBlendMode: "screen" }}
              />
            </g>
          </svg>
          </div>

          <div className="mx-auto mt-2 max-w-[540px] border-t border-[#FAF9F6]/20 pt-5" aria-live="polite">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={activeItem.number}
                initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
                transition={{ duration: reduceMotion ? 0 : 0.38, ease: [0.22, 1, 0.36, 1] }}
              >
                <p className="text-base leading-relaxed text-[#FAF9F6]/75">{activeItem.description}</p>
                <Link
                  href={activeItem.href}
                  className="mt-5 inline-flex min-h-11 items-center border-b border-[#FAF9F6]/60 text-sm font-semibold text-[#FAF9F6] transition-colors hover:border-[#FAF9F6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FAF9F6]"
                >
                  {linkLabel}
                </Link>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
    </div>
  );
}
