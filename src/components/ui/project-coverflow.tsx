"use client";

import { Children, type ReactNode, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import type { Swiper as SwiperInstance } from "swiper";
import { A11y, EffectCoverflow } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/effect-coverflow";
import "./project-coverflow.css";

// Adapted from Skiper UI's Skiper49 / Carousel_003 — https://skiper-ui.com
export default function ProjectCoverflow({ children, language }: { children: ReactNode; language: "es" | "en" }) {
  const reducedMotion = useReducedMotion();
  const swiper = useRef<SwiperInstance | null>(null);
  const [active, setActive] = useState(0);
  const cards = Children.toArray(children);
  const spanish = language === "es";

  return (
    <div className="project-coverflow -mx-4 mt-8 sm:mx-0 sm:mt-12" role="region" aria-roledescription={spanish ? "carrusel" : "carousel"} aria-label={spanish ? "Otros proyectos" : "Other projects"}>
      <Swiper
        key={reducedMotion ? "static" : "coverflow"}
        modules={[EffectCoverflow, A11y]}
        onSwiper={(instance) => { swiper.current = instance; }}
        onSlideChange={(instance) => setActive(instance.realIndex)}
        effect={reducedMotion ? "slide" : "coverflow"}
        coverflowEffect={{ rotate: 18, stretch: 0, depth: 60, modifier: 1, slideShadows: false }}
        breakpoints={{ 1024: { coverflowEffect: { rotate: 40, stretch: 0, depth: 100, modifier: 1, slideShadows: false } } }}
        slidesPerView="auto"
        centeredSlides
        grabCursor
        loop
        speed={reducedMotion ? 0 : 450}
        a11y={{ slideLabelMessage: "{{index}} / {{slidesLength}}" }}
      >
        {cards.map((card, index) => (
          <SwiperSlide key={index} inert={active !== index}>
            {card}
          </SwiperSlide>
        ))}
      </Swiper>
      <div className="mt-3 flex items-center justify-center gap-2 sm:mt-6 sm:gap-6">
        <button type="button" className="project-coverflow-arrow" aria-label={spanish ? "Proyecto anterior" : "Previous project"} onClick={() => swiper.current?.slidePrev()}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m14 6-6 6 6 6" /></svg>
        </button>
        <div className="flex gap-1">
          {cards.map((_, index) => <button key={index} type="button" className="flex h-11 w-7 items-center justify-center rounded focus-visible:outline-2 focus-visible:outline-offset-2 sm:w-9" aria-label={`${spanish ? "Ver proyecto" : "View project"} ${index + 1}`} aria-current={active === index ? "true" : undefined} onClick={() => swiper.current?.slideToLoop(index)}><span className={`h-1.5 rounded-full bg-[#0F172A] transition-all motion-reduce:transition-none ${active === index ? "w-6" : "w-1.5 opacity-30"}`} /></button>)}
        </div>
        <button type="button" className="project-coverflow-arrow" aria-label={spanish ? "Proyecto siguiente" : "Next project"} onClick={() => swiper.current?.slideNext()}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m10 6 6 6-6 6" /></svg>
        </button>
      </div>
    </div>
  );
}
