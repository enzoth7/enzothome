"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

type TabletMockup3DProps = {
  src: string;
  alt: string;
  priority?: boolean;
};

export default function TabletMockup3D({ src, alt, priority = false }: TabletMockup3DProps) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative w-full py-8 [perspective:1800px] sm:py-10 lg:py-6">
      <div
        aria-hidden="true"
        className="absolute bottom-2 left-[10%] h-[16%] w-[86%] rounded-[50%] bg-[#0F172A]/35 blur-3xl lg:bottom-5 lg:left-[16%]"
      />

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, x: 210, rotateX: 3, rotateY: -10, rotateZ: -2.5 }}
        whileInView={reduceMotion ? undefined : { opacity: 1, x: 0, rotateX: 0.5, rotateY: -2, rotateZ: -0.8 }}
        whileHover={reduceMotion ? undefined : { y: -5, rotateX: 0, rotateY: -1, rotateZ: -0.4 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        style={{ transformStyle: "preserve-3d", transformOrigin: "left center" }}
        className="relative w-full will-change-transform"
      >
        <div
          aria-hidden="true"
          className="absolute -bottom-[6px] left-7 right-2 h-3 rounded-b-[28px] bg-gradient-to-b from-[#292d35] via-[#111318] to-black shadow-[0_16px_26px_rgba(15,23,42,0.32)]"
          style={{ transform: "translateZ(-6px)" }}
        />
        <div
          aria-hidden="true"
          className="absolute -right-[7px] bottom-5 top-5 w-3 rounded-r-[24px] bg-gradient-to-r from-[#333842] via-[#15181e] to-black"
          style={{ transform: "translateZ(-5px)" }}
        />

        <div className="relative rounded-[26px] bg-gradient-to-br from-[#555b66] via-[#171a20] to-[#050607] p-[8px] shadow-[20px_32px_58px_rgba(15,23,42,0.38),inset_0_1px_1px_rgba(255,255,255,0.42)] sm:rounded-[32px] sm:p-[10px]">
          <div className="relative aspect-[7/4] overflow-hidden rounded-[18px] bg-black shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12),inset_0_0_28px_rgba(0,0,0,0.75)] sm:rounded-[22px]">
            <Image
              src={src}
              alt={alt}
              fill
              priority={priority}
              quality={92}
              sizes="(min-width: 1280px) 820px, (min-width: 1024px) 62vw, 100vw"
              className="object-cover"
            />

            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[linear-gradient(118deg,rgba(255,255,255,0.15)_0%,rgba(255,255,255,0.035)_19%,transparent_38%,transparent_72%,rgba(255,255,255,0.06)_100%)]"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 shadow-[inset_0_0_32px_rgba(0,0,0,0.5)]"
            />
          </div>

          <span
            aria-hidden="true"
            className="absolute left-1/2 top-[3px] h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-black shadow-[inset_0_0_0_1px_rgba(255,255,255,0.15)] sm:top-1 sm:h-2 sm:w-2"
          />
        </div>
      </motion.div>
    </div>
  );
}
