"use client";

import React, { useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

interface ComputerMockup3DProps {
  mediaItems: string[];
  direction: "left" | "right";
  containerRef: React.RefObject<HTMLElement | null>;
}

export default function ComputerMockup3D({
  mediaItems,
  direction,
  containerRef,
}: ComputerMockup3DProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Rotación en Y dinámica en base al scroll
  const rotateY = useTransform(
    scrollYProgress,
    [0, 1],
    direction === "right" ? [-20, -5] : [20, 5]
  );

  // Leve rotación en X para dar inclinación natural
  const rotateX = useTransform(scrollYProgress, [0, 1], [10, 5]);

  // Efecto de paralaje horizontal sutil
  const translateX = useTransform(
    scrollYProgress,
    [0, 1],
    direction === "right" ? [30, -30] : [-30, 30]
  );

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? mediaItems.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === mediaItems.length - 1 ? 0 : prev + 1));
  };

  const currentItem = mediaItems[currentIndex] || "";
  const isVideo = currentItem.endsWith(".mp4");

  return (
    <div
      style={{
        perspective: 1200,
        transformStyle: "preserve-3d",
      }}
      className="relative flex h-full w-full items-center justify-center py-6"
    >
      <motion.div
        style={{
          rotateY,
          rotateX,
          x: translateX,
          transformStyle: "preserve-3d",
        }}
        transition={{ type: "spring", stiffness: 80, damping: 25 }}
        className="w-full relative transition-shadow duration-500"
      >
        {/* Cuerpo del Monitor (Bisel y Marco Metálico) */}
        <div className="relative rounded-[20px] bg-[#1e1e1e] p-2 sm:p-3 shadow-[0_30px_70px_rgba(0,0,0,0.6)] border border-neutral-700/50">
          
          {/* Pantalla Activa (16:10) */}
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg bg-black border border-neutral-800">
            {/* Contenido Multimedia */}
            {isVideo ? (
              <video
                key={currentItem}
                src={currentItem}
                autoPlay
                loop
                muted
                playsInline
                className="h-full w-full object-cover"
              />
            ) : (
              <img
                key={currentItem}
                src={currentItem}
                alt={`Diapositiva ${currentIndex + 1}`}
                className="h-full w-full object-cover"
              />
            )}

            {/* Controles del Carrusel (Flechas Flotantes) */}
            {mediaItems.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrev}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 z-30 flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-black/40 text-white/90 hover:bg-black/60 transition shadow-md backdrop-blur-sm"
                  aria-label="Diapositiva anterior"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 z-30 flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-black/40 text-white/90 hover:bg-black/60 transition shadow-md backdrop-blur-sm"
                  aria-label="Siguiente diapositiva"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}

            {/* Indicador de diapositiva (Puntos discretos en la parte inferior) */}
            {mediaItems.length > 1 && (
              <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-30 flex gap-1.5">
                {mediaItems.map((_, idx) => (
                  <span
                    key={idx}
                    className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${
                      idx === currentIndex ? "bg-white w-3" : "bg-white/40"
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Reflejo/Brillo de pantalla (Gradiente sutil en diagonal) */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-transparent via-white/5 to-white/10" />

            {/* Sombra interna para profundidad */}
            <div className="absolute inset-0 pointer-events-none shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)]" />
          </div>


        </div>


      </motion.div>
    </div>
  );
}
