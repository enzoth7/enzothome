"use client";

import React from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/src/context/LanguageContext";

function SectionEyebrow({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-4">
      <span className="h-px w-10 bg-[#064e3b]/28" />
      <span className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
        {label}
      </span>
    </div>
  );
}

export default function QueHagoSection() {
  const { t } = useLanguage();

  return (
    <section id="que-hago" className="border-t border-neutral-200 py-24 sm:py-28">
      <div className="flex flex-col gap-12 sm:gap-16">
        
        {/* Cabecera de ancho completo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-none w-full space-y-8"
        >
          <SectionEyebrow label={t.whatIDo.subtitle} />
          <h2 className="font-sans text-4xl font-black tracking-tighter text-neutral-900 sm:text-5xl lg:text-6xl">
            {t.whatIDo.title}
          </h2>
          <p className="max-w-none text-lg sm:text-xl text-neutral-600 font-light leading-relaxed tracking-[0.04em]">
            {t.whatIDo.description}
          </p>
        </motion.div>

        {/* Listado Vertical de Beneficios */}
        <div className="w-full border-b border-neutral-200/80">
          {t.whatIDo.points.map((point: string, index: number) => {
            const [title, description] = point.split("|");

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
                className="group grid lg:grid-cols-[1fr_2fr] gap-6 lg:gap-12 border-t border-neutral-200 py-8 lg:py-10 hover:bg-slate-100/70 rounded-xl px-4 hover:border-[#064e3b]/30 transition-colors duration-300"
              >
                {/* Columna Izquierda (Beneficio) */}
                <div>
                  <h3 className="text-neutral-900 font-bold text-xl md:text-2xl leading-tight group-hover:translate-x-1.5 transition-transform duration-300">
                    {title}
                  </h3>
                </div>

                {/* Columna Derecha (Explicación sin tags) */}
                <div className="flex flex-col justify-start">
                  <p className="text-neutral-800 font-light text-lg md:text-xl leading-relaxed">
                    {description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

