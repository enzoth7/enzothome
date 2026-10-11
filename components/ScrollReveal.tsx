"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Animate editorial text, never page surfaces, sticky containers or controls. */
export default function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    if (/^\/(portal|ops|auth)(\/|$)/.test(pathname)) return;

    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const animations = new Set<Animation>();
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer.unobserve(entry.target);
        if (preference.matches) continue;
        const animation = entry.target.animate(
          [{ translate: "0 18px" }, { translate: "0 0" }],
          { duration: 650, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
        );
        animations.add(animation);
        animation.onfinish = () => animations.delete(animation);
      }
    }, { threshold: 0, rootMargin: "0px 0px -32px 0px" });

    // Existing masked headings already animate themselves. Content stays readable
    // before hydration, with reduced motion, and when jumping to an anchor.
    document.querySelectorAll("main h2:not([aria-label]), main p").forEach((node) => {
      if (node.getBoundingClientRect().top >= window.innerHeight) observer.observe(node);
    });

    const stop = () => {
      if (preference.matches) animations.forEach((animation) => animation.cancel());
    };
    preference.addEventListener("change", stop);
    return () => {
      observer.disconnect();
      animations.forEach((animation) => animation.cancel());
      preference.removeEventListener("change", stop);
    };
  }, [pathname]);

  return null;
}
