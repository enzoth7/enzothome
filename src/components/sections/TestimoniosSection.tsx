"use client";

import { useState } from "react";
import Image from "next/image";
import { useLanguage } from "@/src/context/LanguageContext";

const testimonials = [
  {
    name: "cristian_payret",
    country: "UY",
    stars: 5,
    month: "Diciembre 2025",
    text:
      "Todo fue claro desde el primer momento. Trabajar con Enzo fue una experiencia excelente y clave para lograr exactamente el resultado que estaba buscando. Destaco especialmente su profesionalismo.",
    link: "https://www.instagram.com/cristianpayret/",
    avatar: "/testimonials/Cristian Payret.jpg",
  },
  {
    name: "oriolramos1",
    country: "ES",
    stars: 5,
    month: "Enero 2026",
    text:
      "Todo perfecto, un gran profesional, muy rápido, muy buen precio. Perfecta comunicación. LO RECOMIENDO!!!!!!",
    link: "https://es.fiverr.com/enzoth98?public_mode=true",
    avatar: "/testimonials/Fiverr1.png",
  },
  {
    name: "daphaneghw",
    country: "US",
    stars: 5,
    month: "Enero 2026",
    text: "Amazing job and exceeded expectations!",
    link: "https://es.fiverr.com/enzoth98?public_mode=true",
    avatar: "/testimonials/Fiverr1.png",
  },
  {
    name: "tomwdallas",
    country: "US",
    stars: 5,
    month: "Febrero 2026",
    text:
      "Working with Enzo was great. Very good communicator and handled everything we needed with the Excel file.",
    link: "https://es.fiverr.com/enzoth98?public_mode=true",
    avatar: "/testimonials/Fiverr1.png",
  },
  {
    name: "maverickhauling",
    country: "US",
    stars: 5,
    month: "Febrero 2026",
    text: "Grateful for people that know what they are doing",
    link: "https://es.fiverr.com/enzoth98?public_mode=true",
    avatar: "/testimonials/Fiverr1.png",
  },
  {
    name: "dmoskat",
    country: "US",
    stars: 5,
    month: "Febrero 2026",
    text: "Accomplished everything I needed at a fair price. Thank you!",
    link: "https://es.fiverr.com/enzoth98?public_mode=true",
    avatar: "/testimonials/Fiverr1.png",
  },
  {
    name: "anitabarry303",
    country: "AU",
    stars: 5,
    month: "Marzo 2026",
    text:
      "Enzo understood what I requested very well and delivered exactly what I needed. He provided efficient and clear communication & I'm so happy with the final result. I highly recommend Enzo and will return in the future. Thanks Enzo!!",
    link: "https://es.fiverr.com/enzoth98?public_mode=true",
    avatar: "/testimonials/Fiverr1.png",
  },
  {
    name: "camiloangari391",
    country: "US",
    stars: 5,
    month: "Mayo 2026",
    text:
      "Enzo is truly a visionary, he is able to adapt to your vision, while asking the right questions. He doesn’t execute take the project but he is able to evolve it and future proof it. Thank you, Enzo.",
    link: "https://es.fiverr.com/enzoth98?public_mode=true",
    avatar: "/testimonials/Fiverr1.png",
  },
  {
    name: "Pearl Connexions",
    country: "UK",
    stars: 5,
    month: "Junio 2026",
    text:
      "We are changing and improving all our organization thanks to Enzo.",
    link: "https://www.pearlconnexions.com/",
    avatar: "/testimonials/PearlConnexionss.jpg",
  },
  {
    name: "Matearte",
    country: "UY",
    stars: 5,
    month: "Julio 2026",
    text: "Está impecable lo que empezamos! La verdad muy conforme con todo!",
    link: "https://www.instagram.com/matearteuruguay/",
    avatar: "/testimonials/logoma.jpg",
  },
];

const MARQUEE_TESTIMONIALS = [...testimonials, ...testimonials];

const FlagIcon = ({ country }: { country: string }) => {
  const normalized = country.trim().toUpperCase();
  switch (normalized) {
    case "ES":
      return (
        <svg viewBox="0 0 640 480" className="h-full w-full object-cover">
          <path fill="#c60b1e" d="M0 0h640v480H0z" />
          <path fill="#ffc400" d="M0 120h640v240H0z" />
        </svg>
      );
    case "US":
      return (
        <svg viewBox="0 0 640 480" className="h-full w-full object-cover">
          <path fill="#bf0a30" d="M0 0h640v480H0z" />
          <path fill="#fff" d="M0 0h640v480H0z" />
          <g fill="#bf0a30">
            <rect width="640" height="37" y="0" />
            <rect width="640" height="37" y="74" />
            <rect width="640" height="37" y="148" />
            <rect width="640" height="37" y="222" />
            <rect width="640" height="37" y="296" />
            <rect width="640" height="37" y="370" />
            <rect width="640" height="37" y="444" />
          </g>
          <rect fill="#002868" width="296" height="259" />
          <g fill="#fff">
            <circle cx="25" cy="25" r="8" />
            <circle cx="150" cy="25" r="8" />
            <circle cx="270" cy="25" r="8" />
            <circle cx="85" cy="130" r="8" />
            <circle cx="205" cy="130" r="8" />
            <circle cx="25" cy="230" r="8" />
            <circle cx="150" cy="230" r="8" />
            <circle cx="270" cy="230" r="8" />
          </g>
        </svg>
      );
    case "UY":
      return (
        <svg viewBox="0 0 640 480" className="h-full w-full object-cover">
          <rect width="640" height="480" fill="#fff" />
          <g fill="#0038a8">
            <rect y="53.333" width="640" height="53.333" />
            <rect y="160" width="640" height="53.333" />
            <rect y="266.666" width="640" height="53.333" />
            <rect y="373.333" width="640" height="53.333" />
          </g>
          <rect width="240" height="266.666" fill="#fff" />
          <circle cx="120" cy="133.333" r="44" fill="#f7c948" />
          <circle cx="120" cy="133.333" r="30" fill="#f6b73c" />
        </svg>
      );
    case "AU":
    case "AUS":
      return (
        <svg viewBox="0 0 640 480" className="h-full w-full object-cover">
          <rect width="640" height="480" fill="#012169" />
          <g>
            <rect width="320" height="240" fill="#012169" />
            <path fill="#fff" d="M0 0h40l280 200v40h-40L0 40z" />
            <path fill="#fff" d="M320 0h-40L0 200v40h40l280-200z" />
            <path fill="#c8102e" d="M0 0h20l300 220v20h-20L0 20z" />
            <path fill="#c8102e" d="M320 0h-20L0 220v20h20L320 20z" />
            <rect x="130" width="60" height="240" fill="#fff" />
            <rect y="90" width="320" height="60" fill="#fff" />
            <rect x="145" width="30" height="240" fill="#c8102e" />
            <rect y="105" width="320" height="30" fill="#c8102e" />
          </g>
          <g fill="#fff">
            <path
              d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
              transform="translate(130 255) scale(3)"
            />
            <path
              d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
              transform="translate(455 95) scale(1.4)"
            />
            <path
              d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
              transform="translate(415 190) scale(1.4)"
            />
            <path
              d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
              transform="translate(545 200) scale(1.4)"
            />
            <path
              d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
              transform="translate(500 245) scale(1.1)"
            />
            <path
              d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
              transform="translate(485 330) scale(1.6)"
            />
          </g>
        </svg>
      );
    case "UK":
    case "GB":
      return (
        <svg viewBox="0 0 640 480" className="h-full w-full object-cover">
          <path fill="#012169" d="M0 0h640v480H0z" />
          <path fill="#fff" d="M0 0l640 480M640 0L0 480" stroke="#fff" strokeWidth="60" />
          <path fill="#c8102e" d="M0 0l640 480M640 0L0 480" stroke="#c8102e" strokeWidth="40" />
          <path fill="#fff" d="M320 0v480M0 240h640" stroke="#fff" strokeWidth="100" />
          <path fill="#c8102e" d="M320 0v480M0 240h640" stroke="#c8102e" strokeWidth="60" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 640 480" className="h-full w-full object-cover">
          <rect width="640" height="480" fill="#1f2937" />
        </svg>
      );
  }
};

const StarIcon = ({ className = "" }: { className?: string }) => (
  <svg
    viewBox="0 0 20 20"
    fill="currentColor"
    aria-hidden="true"
    className={`h-4 w-4 ${className}`}
  >
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

function SectionEyebrow({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-4">
      <span className="h-px w-10 bg-slate-400" />
      <span className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-600">
        {label}
      </span>
    </div>
  );
}

export default function TestimoniosSection() {
  const { t } = useLanguage();
  const [isPaused, setIsPaused] = useState(false);

  return (
    <section id="testimonios" className="py-10 sm:py-14">
      <div className="flex flex-col gap-6">
        <div className="text-left items-start flex flex-col">
          <SectionEyebrow label={t.testimonials.subtitle} />
          <h2 className="text-left font-sans text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter text-[#0f172a] mt-4">
            {t.testimonials.title}
          </h2>
          <p className="text-left max-w-3xl text-slate-800 font-normal text-base sm:text-lg leading-relaxed mt-4 mb-10">
            {t.testimonials.description}
          </p>
        </div>

        <div
          className="relative -mx-6 sm:-mx-10 lg:-mx-12 overflow-hidden py-4 [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onFocus={() => setIsPaused(true)}
          onBlur={() => setIsPaused(false)}
        >
          <div
            className="flex items-start w-max gap-8 sm:gap-12 animate-testimonial-marquee"
            style={{
              animationPlayState: isPaused ? "paused" : "running",
            }}
          >
            {MARQUEE_TESTIMONIALS.map((testimonial, index) => (
              <div
                key={`${testimonial.name}-${index}`}
                className="w-[320px] sm:w-[380px] md:w-[420px] shrink-0 flex flex-col items-center justify-start text-center h-full px-4"
              >
                <a
                  href={testimonial.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col items-center justify-center text-center w-full transition-transform duration-300 hover:scale-[1.02]"
                  aria-label={`Ver reseña de ${testimonial.name}`}
                >
                  <div className="relative h-16 w-16 sm:h-20 sm:w-20 rounded-full mx-auto shrink-0 shadow-md overflow-hidden bg-transparent mt-1">
                    <Image
                      src={testimonial.avatar}
                      alt={`Avatar de ${testimonial.name}`}
                      fill
                      sizes="80px"
                      className={`object-cover ${testimonial.avatar.includes("Fiverr") ? "scale-[1.22]" : ""}`}
                    />
                  </div>

                  <div className="text-[#0f172a] font-bold text-base sm:text-lg text-center mt-3 flex items-center justify-center gap-2">
                    <span>{testimonial.name}</span>
                    <span
                      className="relative block h-3.5 w-5 overflow-hidden rounded-sm border border-slate-200 shrink-0"
                      aria-label={testimonial.country}
                    >
                      <FlagIcon country={testimonial.country} />
                    </span>
                  </div>

                  <div className="text-slate-800 font-semibold text-xs text-center">
                    {testimonial.month}
                  </div>

                  <div className="flex justify-center text-[#f59e0b] my-2 gap-1">
                    {Array.from({ length: testimonial.stars }).map((_, starIndex) => (
                      <StarIcon key={starIndex} />
                    ))}
                  </div>

                  <p className="text-center italic text-[#334155] text-base leading-relaxed max-w-md mx-auto">
                    &ldquo;{testimonial.text}&rdquo;
                  </p>
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes testimonial-marquee {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-testimonial-marquee {
          animation: testimonial-marquee 45s linear infinite;
        }

        .animate-testimonial-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}
