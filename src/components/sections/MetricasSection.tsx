"use client";

import { Fragment, useEffect, useRef } from "react";
import { useInView, useSpring } from "framer-motion";
import { useLanguage } from "@/src/context/LanguageContext";
import TiltCard from "@/src/components/TiltCard";

function SectionEyebrow({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-4 mb-8">
      <span className="h-px w-10 bg-slate-300" />
      <span className="text-sm font-semibold uppercase tracking-[0.3em] text-[#475569]">
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
    stiffness: 140,
    damping: 14,
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
      value: "50+",
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
      value: "100h+",
      label: t.precisionMetrics.hoursSavedLabel,
    },
  ];

  return (
    <section aria-label="Metricas de precision" className="py-8 sm:py-12">
      <div className="flex flex-col">
        <SectionEyebrow label={t.precisionMetrics.eyebrow} />
        <div className="grid grid-cols-2 gap-x-4 gap-y-12 xl:flex xl:flex-row xl:items-center xl:gap-8">
          {metrics.map((metric, index) => (
            <Fragment key={metric.id}>
              <div className="flex flex-1 items-center justify-center perspective-1000">
                <TiltCard
                  maxTilt={25}
                  whileHover={{ y: -4 }}
                  className="bg-transparent border-none shadow-none p-4 cursor-pointer w-full flex flex-col items-center text-center"
                >
                  <div style={{ transform: "translateZ(30px)", transformStyle: "preserve-3d" }} className="flex flex-col items-center">
                    <p className="font-sans text-4xl font-black tracking-tighter text-[#0f172a] sm:text-6xl">
                      <AnimatedCounter value={metric.value} />
                    </p>
                    <p className="mt-4 text-[10px] font-semibold uppercase tracking-widest leading-5 text-[#475569] sm:text-xs sm:leading-6">
                      {metric.label}
                    </p>
                  </div>
                </TiltCard>
              </div>
              {index < metrics.length - 1 ? (
                <div
                  aria-hidden="true"
                  className="hidden h-20 w-[1px] shrink-0 self-center bg-slate-200 xl:block"
                />
              ) : null}
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}

