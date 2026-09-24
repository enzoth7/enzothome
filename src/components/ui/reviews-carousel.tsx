"use client";

import Image from "next/image";
import { AU, ES, GB, US, UY } from "country-flag-icons/react/3x2";

export type ReviewCountryCode = "AU" | "ES" | "GB" | "US" | "UY";

export interface Review {
  author: string;
  body: string;
  company: string;
  companyLogo: string;
  country: string;
  countryCode: ReviewCountryCode;
  id: string | number;
  link: string;
  profileImage: string;
  role?: string;
}

interface ReviewsCarouselProps {
  className?: string;
  reviews: Review[];
}

const ExternalArrow = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-4 w-4"
    aria-hidden="true"
  >
    <path d="M7 17 17 7" />
    <path d="M8 7h9v9" />
  </svg>
);

const FLAG_ICONS = { AU, ES, GB, US, UY };

function ReviewIdentity({ review, large = false }: { review: Review; large?: boolean }) {
  const sizeClass = large ? "h-20 w-20" : "h-11 w-11";

  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-full border border-[#0F172A]/15 bg-[#FAF9F6] ${sizeClass}`}
    >
      <Image
        src={review.profileImage}
        alt={large ? review.author : ""}
        fill
        sizes={large ? "80px" : "44px"}
        className="object-cover"
      />
    </div>
  );
}

function CompanyLogo({ review, large = false }: { review: Review; large?: boolean }) {
  return (
    <div
      className={`relative shrink-0 ${large ? "h-24 w-24" : "h-11 w-11"}`}
    >
      <Image
        src={review.companyLogo}
        alt={review.company}
        fill
        sizes={large ? "96px" : "44px"}
        className="object-contain"
      />
    </div>
  );
}

function ReviewColumn({ review, reversed = false }: { review: Review; reversed?: boolean }) {
  const FlagIcon = FLAG_ICONS[review.countryCode];

  return (
    <article className={`flex w-[min(84vw,350px)] shrink-0 ${reversed ? "flex-col-reverse" : "flex-col"}`}>
      <figure className="flex h-[350px] flex-col justify-between rounded-2xl border border-[#0F172A]/15 bg-[#FAF9F6] p-6 shadow-[0_18px_55px_rgba(15,23,42,0.09)]">
        <div>
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <ReviewIdentity review={review} />
              <figcaption className="min-w-0">
                <p className="truncate font-bold text-[#111111]">{review.author}</p>
                <div className="mt-1 flex items-center gap-2">
                  <span role="img" aria-label={review.country} title={review.country} className="inline-flex shrink-0">
                    <FlagIcon className="h-3.5 w-5 rounded-[2px] shadow-[0_0_0_1px_rgba(15,23,42,0.12)]" aria-hidden="true" />
                  </span>
                  {review.role ? (
                    <p className="truncate text-sm font-medium text-[#0F172A]/70">{review.role}</p>
                  ) : null}
                </div>
              </figcaption>
            </div>
            <a
              href={review.link}
              target="_blank"
              rel="noreferrer"
              aria-label={`Ver perfil de ${review.author}`}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[#0F172A] transition-colors duration-200 hover:bg-[#0F172A] hover:text-[#FAF9F6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F172A]"
            >
              <ExternalArrow />
            </a>
          </div>

          <blockquote className="mt-6">
            <span className="font-display text-4xl leading-none text-[#0F172A]/20" aria-hidden="true">
              “
            </span>
            <p className="-mt-2 text-[1.04rem] leading-relaxed text-[#0F172A]">{review.body}</p>
          </blockquote>
        </div>
      </figure>

      <div className="relative isolate flex h-40 items-center justify-center overflow-hidden border-x border-[#0F172A]/12 p-6">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 opacity-[0.14]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #0F172A 1px, transparent 1px), linear-gradient(to bottom, #0F172A 1px, transparent 1px)",
            backgroundSize: "20px 20px",
            maskImage:
              "repeating-linear-gradient(to right, black 0px, black 3px, transparent 3px, transparent 8px), repeating-linear-gradient(to bottom, black 0px, black 3px, transparent 3px, transparent 8px)",
            WebkitMaskImage:
              "repeating-linear-gradient(to right, black 0px, black 3px, transparent 3px, transparent 8px), repeating-linear-gradient(to bottom, black 0px, black 3px, transparent 3px, transparent 8px)",
            maskComposite: "intersect",
            WebkitMaskComposite: "source-in",
          }}
        />
        <CompanyLogo review={review} large />
      </div>
    </article>
  );
}

export default function ReviewsCarousel({
  reviews,
  className = "",
}: ReviewsCarouselProps) {
  if (reviews.length === 0) return null;

  return (
    <div className={className}>
      <div
        role="region"
        aria-label="Testimonios de clientes"
        tabIndex={0}
        className="testimonials-marquee overflow-hidden border-y border-[#0F172A]/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0F172A]"
        style={{
          maskImage: "linear-gradient(to right, transparent, black 5%, black 95%, transparent)",
          WebkitMaskImage: "linear-gradient(to right, transparent, black 5%, black 95%, transparent)",
        }}
      >
        <div className="testimonials-marquee-track flex w-max items-stretch">
          {[...reviews, ...reviews].map((review, index) => {
            const isDuplicate = index >= reviews.length;
            const originalIndex = index % reviews.length;

            return (
              <div
                key={`${review.id}-${isDuplicate ? "duplicate" : "original"}`}
                aria-hidden={isDuplicate || undefined}
                className={isDuplicate ? "testimonials-marquee-duplicate" : undefined}
              >
                <ReviewColumn review={review} reversed={originalIndex % 2 === 1} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
