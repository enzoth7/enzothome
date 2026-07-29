"use client";

import { Fragment, useEffect, useRef } from "react";
import { useInView, useSpring } from "framer-motion";
import { useLanguage } from "@/src/context/LanguageContext";
import TiltCard from "@/src/components/TiltCard";

function SectionEyebrow({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-4 mb-8">
      <span className="h-px w-10 bg-[#064e3b]/28" />
      <span className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
        {label}
      </span>
    </div>
  );
}

function AnimatedCounter({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const match = value.match(/^([^0-9]*)([0-9]+)(.*)$/);
  const prefix = match ? match[1] : "";
  const numericVal = match ? parseInt(match[2], 10) : 0;
  const suffix = match ? match[3] : value;

  const spring = useSpring(0, {
    stiffness: 60,
    damping: 20,
    restDelta: 0.01,
  });

  useEffect(() => {
    if (isInView && match) {
      spring.set(numericVal);
    }
  }, [isInView, numericVal, spring, match]);

  useEffect(() => {
    return spring.on("change", (latest) => {
      if (ref.current && match) {
        ref.current.textContent = `${prefix}${Math.round(latest)}${suffix}`;
      }
    });
  }, [spring, prefix, suffix, match]);

  return <span ref={ref}>{value}</span>;
}

export default function MetricasSection() {
  const { t } = useLanguage();

  const metrics = [
    {
      id: "uptime",
      value: "20+",
      label: t.precisionMetrics.uptimeLabel,
    },
    {
      id: "tasks",
      value: "5k",
      label: t.precisionMetrics.tasksLabel,
    },
    {
      id: "turnaround",
      value: "x3",
      label: t.precisionMetrics.turnaroundLabel,
    },
    {
      id: "hours-saved",
      value: "50h+",
      label: t.precisionMetrics.hoursSavedLabel,
    },
  ];

  return (
    <section aria-label="Metricas de precision" className="py-24 sm:py-28 border-t border-neutral-200">
      <div className="flex flex-col">
        <SectionEyebrow label={t.precisionMetrics.eyebrow} />
        <div className="grid grid-cols-2 gap-x-4 gap-y-12 xl:flex xl:flex-row xl:items-center xl:gap-8">
          {metrics.map((metric, index) => (
            <Fragment key={metric.id}>
              <div className="flex flex-1 items-center justify-center perspective-1000">
                <TiltCard
                  maxTilt={25}
                  whileHover={{ y: -4 }}
                  className="flex flex-col items-center text-center bg-transparent hover:bg-black/[0.025] border border-transparent hover:border-black/5 shadow-none hover:shadow-2xl rounded-2xl p-6 md:p-8 cursor-pointer transition-shadow duration-150 transition-colors duration-150 w-full"
                >
                  <div style={{ transform: "translateZ(40px)", transformStyle: "preserve-3d" }} className="flex flex-col items-center">
                    <p className="font-sans text-4xl font-black tracking-tighter text-neutral-900 sm:text-6xl">
                      <AnimatedCounter value={metric.value} />
                    </p>
                    <p className="mt-4 text-[10px] font-light uppercase tracking-widest leading-5 text-slate-600 sm:text-xs sm:leading-6">
                      {metric.label}
                    </p>
                  </div>
                </TiltCard>
              </div>
              {index < metrics.length - 1 ? (
                <div
                  aria-hidden="true"
                  className="hidden h-20 w-[1px] shrink-0 self-center bg-neutral-200 xl:block"
                />
              ) : null}
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}

