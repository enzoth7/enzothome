"use client";

import Image from "next/image";

const WHATSAPP_NUMBER = "59898633186";
const WHATSAPP_MESSAGE = encodeURIComponent(
  "Hola Enzo, te escribo desde tu web. Me gustaría saber más sobre tus servicios."
);
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`;

export default function WhatsAppButton() {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contactar por WhatsApp"
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

