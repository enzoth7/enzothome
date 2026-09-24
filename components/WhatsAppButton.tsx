"use client";

import Image from "next/image";
import { trackEvent } from "@/src/lib/analytics";

const WHATSAPP_NUMBER = "59898633186";
const WHATSAPP_MESSAGE = encodeURIComponent(
  "Hola Enzo, te escribo desde tu web. Me gustaría contarte una situación que queremos ordenar en la empresa."
);
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`;

export default function WhatsAppButton() {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contactar por WhatsApp"
      onClick={() => trackEvent("whatsapp_click", { location: "floating_button" })}
      className="whatsapp-float"
    >
      <Image
        src="/logos/whatsapp.png"
        alt="WhatsApp"
        width={32}
        height={32}
        priority
      />
    </a>
  );
}
