"use client";

import LanguageToggle from "@/src/components/LanguageToggle";

export default function MobileLanguageToggle() {
  return (
    <div className="fixed bottom-8 left-8 z-[150] block md:hidden">
      <LanguageToggle inline dark />
    </div>
  );
}
