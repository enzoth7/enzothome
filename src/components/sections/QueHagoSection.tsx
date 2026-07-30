"use client";

import React from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/src/context/LanguageContext";

function SectionEyebrow({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-4">
      <span className="h-px w-10 bg-slate-700" />
      <span className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">
        {label}
      </span>
    </div>
  );
}

export default function QueHagoSection() {
  const { t } = useLanguage();

  return (
    <section id="que-hago" className="py-10 sm:py-14">
      <div className="flex flex-col gap-12 sm:gap-16">
        {/* Cabecera */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-none w-full space-y-8"
        >
          <SectionEyebrow label={t.whatIDo.subtitle} />
          <h2 className="font-sans text-4xl font-black tracking-tighter text-[#ffffff] sm:text-5xl lg:text-6xl">
            {t.whatIDo.title}
          </h2>
          <p className="max-w-none text-lg sm:text-xl text-[#cbd5e1] font-light leading-relaxed tracking-[0.04em]">
            {t.whatIDo.description}
          </p>
        </motion.div>

        {/* Clean Editorial Vertical List */}
        <div className="flex flex-col border-t divide-y border-slate-700/40 divide-slate-700/40 w-full">
          {t.whatIDo.points.map((point: string, index: number) => {
            const [title, description] = point.split("|");

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
                className="grid lg:grid-cols-[300px_1fr] gap-6 lg:gap-12 py-8 px-6 sm:px-8 rounded-2xl hover:bg-white/[0.04] transition-all duration-300 group cursor-pointer"
              >
                <div>
                  <h3 className="text-[#ffffff] font-bold text-xl md:text-2xl leading-tight group-hover:translate-x-1.5 transition-transform duration-300">
                    {title}
                  </h3>
                </div>
                <p className="text-[#cbd5e1] font-light text-base md:text-lg leading-relaxed flex items-center">
                  {description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

