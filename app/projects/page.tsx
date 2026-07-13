"use client";

import React, { useRef } from "react";
import MobileLanguageToggle from "@/components/MobileLanguageToggle";
import Navbar from "@/components/Navbar";
import SocialRail from "@/components/SocialRail";
import Background from "@/src/components/sections/Background";
import ComputerMockup3D from "@/components/ComputerMockup3D";
import { LanguageProvider, useLanguage } from "@/src/context/LanguageContext";

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

function ProyectosContent() {
  const { t } = useLanguage();
  const project1Ref = useRef<HTMLDivElement>(null);
  const project2Ref = useRef<HTMLDivElement>(null);
  const project3Ref = useRef<HTMLDivElement>(null);

  // Arreglos de prueba para el carrusel de los mockups
  const project1Media = ["/projects/Project1.png"];
  const project2Media = ["/projects/Project2.png"];
  const project3Media = ["/projects/Project3.png"];

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#0f172a] text-[#171717]">
      <div className="absolute inset-0 z-0">
        <Background variant="wallpaper" />
      </div>

      <div className="relative z-40">
        <SocialRail />
      </div>

      <div className="relative z-50">
        <Navbar />
      </div>

      <MobileLanguageToggle />

      <div className="relative z-20 px-3 py-24 sm:px-5 sm:py-28 lg:px-8">
        {/* Cambiado de overflow-x-clip a overflow-visible para evitar el recorte lateral del 3D */}
        <main className="relative z-30 mx-auto max-w-[1400px] overflow-visible bg-[#FAF9F6] shadow-[0_0_80px_rgba(0,0,0,0.4)]">

          {/* Cabecera de la página */}
          <section className="px-6 py-16 sm:px-10 lg:px-12 lg:py-24">
            <div className="max-w-none space-y-8">
              <SectionEyebrow label={t.projects.subtitle} />
              <h1 className="font-sans text-4xl font-black tracking-tighter text-neutral-900 sm:text-5xl lg:text-6xl">
                {t.projects.title}
              </h1>
              <p className="max-w-none text-lg sm:text-xl text-neutral-600 font-light leading-relaxed tracking-[0.04em]">
                {t.projects.lead}
              </p>
            </div>
          </section>

          {/* Proyecto 1: Asimétrico derecha (cambiado a overflow-visible) */}
          <section
            ref={project1Ref}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center border-t border-neutral-200 py-16 lg:py-24 px-6 sm:px-10 lg:px-12 overflow-visible"
          >
            {/* Columna Izquierda (Textos) */}
            <div className="space-y-6">
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 leading-tight">
                {t.projects.project1.title}
              </h2>
              <p className="text-neutral-600 font-light text-base sm:text-lg leading-relaxed">
                {t.projects.project1.description}
              </p>
              <div className="pt-2">
                <a
                  href="https://github.com/enzoth7/data_and_automation/tree/main/09_ai_agent_car_dealership"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block rounded-none bg-[#0f172a] hover:bg-[#1e293b] px-6 py-3 text-sm font-semibold tracking-wide text-white transition-all duration-300 hover:scale-[1.02] shadow-[0_10px_30px_rgba(15,23,42,0.15)]"
                >
                  {t.projects.cta}
                </a>
              </div>
            </div>

            {/* Columna Derecha (ComputerMockup3D que sobresale) */}
            <div className="w-[85vw] sm:w-[70vw] lg:w-[48vw] xl:w-[50vw] -translate-x-[2%] sm:-translate-x-[4%] lg:-translate-x-[6%] xl:-translate-x-[7%] select-none">
              <ComputerMockup3D
                mediaItems={project1Media}
                direction="right"
                containerRef={project1Ref}
              />
            </div>
          </section>

          {/* Proyecto 2: Asimétrico izquierda (cambiado a overflow-visible) */}
          <section
            ref={project2Ref}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center border-t border-neutral-200 py-16 lg:py-24 px-6 sm:px-10 lg:px-12 overflow-visible"
          >
            {/* Columna Izquierda (ComputerMockup3D que sobresale) - En mobile se apila abajo */}
            <div className="w-[85vw] sm:w-[70vw] lg:w-[48vw] xl:w-[50vw] -translate-x-[2%] sm:-translate-x-[5%] lg:-translate-x-[26%] xl:-translate-x-[28%] select-none order-last lg:order-first">
              <ComputerMockup3D
                mediaItems={project2Media}
                direction="left"
                containerRef={project2Ref}
              />
            </div>

            {/* Columna Derecha (Textos) */}
            <div className="space-y-6 order-first lg:order-last">
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 leading-tight">
                {t.projects.project2.title}
              </h2>
              <p className="text-neutral-600 font-light text-base sm:text-lg leading-relaxed">
                {t.projects.project2.description}
              </p>
              <div className="pt-2">
                <a
                  href="https://github.com/enzoth7/data_and_automation/tree/main/01_uruguay_tourism_dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block rounded-none bg-[#0f172a] hover:bg-[#1e293b] px-6 py-3 text-sm font-semibold tracking-wide text-white transition-all duration-300 hover:scale-[1.02] shadow-[0_10px_30px_rgba(15,23,42,0.15)]"
                >
                  {t.projects.cta}
                </a>
              </div>
            </div>
          </section>

          {/* Proyecto 3: Asimétrico derecha (cambiado a overflow-visible) */}
          <section
            ref={project3Ref}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center border-t border-neutral-200 py-16 lg:py-24 px-6 sm:px-10 lg:px-12 overflow-visible"
          >
            {/* Columna Izquierda (Textos) */}
            <div className="space-y-6">
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 leading-tight">
                {t.projects.project3.title}
              </h2>
              <p className="text-neutral-600 font-light text-base sm:text-lg leading-relaxed">
                {t.projects.project3.description}
              </p>
              <div className="pt-2">
                <a
                  href="https://github.com/enzoth7/mate-customizer"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block rounded-none bg-[#0f172a] hover:bg-[#1e293b] px-6 py-3 text-sm font-semibold tracking-wide text-white transition-all duration-300 hover:scale-[1.02] shadow-[0_10px_30px_rgba(15,23,42,0.15)]"
                >
                  {t.projects.cta}
                </a>
              </div>
            </div>

            {/* Columna Derecha (ComputerMockup3D que sobresale) */}
            <div className="w-[85vw] sm:w-[70vw] lg:w-[48vw] xl:w-[50vw] -translate-x-[2%] sm:-translate-x-[4%] lg:-translate-x-[6%] xl:-translate-x-[7%] select-none">
              <ComputerMockup3D
                mediaItems={project3Media}
                direction="right"
                containerRef={project3Ref}
              />
            </div>
          </section>



        </main>
      </div>
    </div>
  );
}

export default function ProyectosPage() {
  return (
    <LanguageProvider>
      <ProyectosContent />
    </LanguageProvider>
  );
}
