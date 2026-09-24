"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export type GalleryItem = {
  alt: string;
  credit?: string;
  creditUrl?: string;
  label: string;
  number: string;
  source?: string;
  src: string;
};

type ExpandableGalleryProps = {
  items: GalleryItem[];
  className?: string;
};

const Arrow = ({ direction }: { direction: "left" | "right" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`h-6 w-6 ${direction === "left" ? "rotate-180" : ""}`}
    aria-hidden="true"
  >
    <path d="M5 12h14" />
    <path d="m13 6 6 6-6 6" />
  </svg>
);

export default function ExpandableGallery({ items, className = "" }: ExpandableGalleryProps) {
  const reduceMotion = useReducedMotion();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (selectedIndex === null) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedIndex(null);
      if (event.key === "ArrowRight") {
        setSelectedIndex((index) => index === null ? null : (index + 1) % items.length);
      }
      if (event.key === "ArrowLeft") {
        setSelectedIndex((index) => index === null ? null : (index - 1 + items.length) % items.length);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [items.length, selectedIndex]);

  const transition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.38, ease: [0.22, 0.8, 0.36, 1] as const };

  const renderCardContent = (item: GalleryItem, index: number, compact = false) => (
    <>
      <Image
        src={item.src}
        alt={item.alt}
        fill
        sizes={compact ? "(max-width: 639px) 100vw, 50vw" : "(min-width: 1024px) 28vw, 100vw"}
        className="object-cover transition-transform duration-500 group-hover:scale-[1.035]"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.24)_0%,rgba(15,23,42,0.14)_35%,rgba(15,23,42,0.92)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
        <motion.p
          animate={{ opacity: compact || hoveredIndex === index ? 1 : 0 }}
          transition={transition}
          className="max-w-md text-left text-lg font-bold leading-snug text-[#FAF9F6] sm:text-xl"
        >
          {item.label}
        </motion.p>
      </div>
    </>
  );

  return (
    <div className={className}>
      <div className="grid gap-3 sm:grid-cols-2 lg:hidden">
        {items.map((item, index) => (
          <button
            key={item.number}
            type="button"
            onClick={() => setSelectedIndex(index)}
            aria-label={item.label}
            className={`group relative min-h-52 cursor-pointer overflow-hidden rounded-2xl text-left shadow-[0_16px_38px_rgba(15,23,42,0.16)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0F172A] ${index === items.length - 1 ? "sm:col-span-2" : ""}`}
          >
            {renderCardContent(item, index, true)}
          </button>
        ))}
      </div>

      <div className="hidden h-[31rem] w-full gap-2 lg:flex" onMouseLeave={() => setHoveredIndex(0)}>
        {items.map((item, index) => (
          <motion.button
            key={item.number}
            type="button"
            initial={false}
            animate={{ flex: hoveredIndex === null ? 1 : hoveredIndex === index ? 2.75 : 0.58 }}
            transition={transition}
            onMouseEnter={() => setHoveredIndex(index)}
            onFocus={() => setHoveredIndex(index)}
            onBlur={() => setHoveredIndex(0)}
            onClick={() => setSelectedIndex(index)}
            aria-label={item.label}
            className="group relative min-w-0 cursor-pointer overflow-hidden rounded-2xl text-left shadow-[0_18px_45px_rgba(15,23,42,0.17)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0F172A]"
          >
            {renderCardContent(item, index)}
          </motion.button>
        ))}
      </div>

      {typeof document !== "undefined" ? createPortal(
        <AnimatePresence>
          {selectedIndex !== null ? (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={items[selectedIndex].label}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.2 }}
            className="fixed inset-0 z-[10000] flex items-center justify-center bg-[#111111]/90 p-4 backdrop-blur-md sm:p-8"
            onClick={() => setSelectedIndex(null)}
          >
            <button
              type="button"
              autoFocus
              onClick={() => setSelectedIndex(null)}
              aria-label="Cerrar imagen"
              className="absolute right-4 top-4 z-10 flex h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-[#111111]/50 text-[#FAF9F6] transition hover:bg-[#FAF9F6] hover:text-[#111111] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:right-8 sm:top-8"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="h-6 w-6" aria-hidden="true">
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setSelectedIndex((selectedIndex - 1 + items.length) % items.length);
              }}
              aria-label="Imagen anterior"
              className="absolute left-3 z-10 flex h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-[#111111]/50 text-[#FAF9F6] transition hover:bg-[#FAF9F6] hover:text-[#111111] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:left-8"
            >
              <Arrow direction="left" />
            </button>

            <motion.figure
              key={items[selectedIndex].number}
              initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={transition}
              onClick={(event) => event.stopPropagation()}
              className="relative h-[72vh] w-full max-w-6xl overflow-hidden rounded-2xl bg-[#0F172A] shadow-2xl"
            >
              <Image
                src={items[selectedIndex].src}
                alt={items[selectedIndex].alt}
                fill
                priority
                sizes="(max-width: 1280px) 92vw, 1152px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_35%,rgba(15,23,42,0.9)_100%)]" />
              <figcaption className="absolute inset-x-0 bottom-0 p-6 text-[#FAF9F6] sm:p-10">
                <p className="max-w-3xl font-sans text-2xl font-semibold leading-tight sm:text-4xl">
                  {items[selectedIndex].label}
                </p>
                {items[selectedIndex].credit && items[selectedIndex].creditUrl ? (
                  <a
                    href={items[selectedIndex].creditUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex text-xs text-white/65 underline decoration-white/30 underline-offset-4 hover:text-white"
                  >
                    {items[selectedIndex].credit}
                    {items[selectedIndex].source ? ` · ${items[selectedIndex].source}` : ""}
                  </a>
                ) : null}
              </figcaption>
            </motion.figure>

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setSelectedIndex((selectedIndex + 1) % items.length);
              }}
              aria-label="Imagen siguiente"
              className="absolute right-3 z-10 flex h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-[#111111]/50 text-[#FAF9F6] transition hover:bg-[#FAF9F6] hover:text-[#111111] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:right-8"
            >
              <Arrow direction="right" />
            </button>
          </motion.div>
          ) : null}
        </AnimatePresence>,
        document.body,
      ) : null}
    </div>
  );
}
