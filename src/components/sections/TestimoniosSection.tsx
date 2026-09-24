"use client";

import ReviewsCarousel, { Review } from "@/src/components/ui/reviews-carousel";
import { useLanguage } from "@/src/context/LanguageContext";

type LocalizedReview = Omit<Review, "country"> & {
  country: { en: string; es: string };
};

const REVIEW_DATA: LocalizedReview[] = [
  {
    id: "cristian-payret",
    author: "Cristian Payret",
    company: "JaqueMate",
    country: { es: "Uruguay", en: "Uruguay" },
    countryCode: "UY",
    role: "Director",
    body: "Todo fue claro desde el primer momento. Trabajar con Enzo fue una experiencia excelente y clave para lograr exactamente el resultado que estaba buscando. Destaco especialmente su profesionalismo.",
    link: "https://www.instagram.com/cristianpayret/",
    profileImage: "/testimonials/Cristian Payret.jpg",
    companyLogo: "/testimonials/JaqueMate.jpg",
  },
  {
    id: "camilo-angari",
    author: "Camilo Angarita",
    company: "Tesla Motors",
    country: { es: "EE. UU.", en: "United States" },
    countryCode: "US",
    role: "Sales Manager",
    body: "Enzo is truly a visionary. He is able to adapt to your vision while asking the right questions. He doesn't just execute the project; he is able to evolve it and future-proof it.",
    link: "https://es.fiverr.com/enzoth98?public_mode=true",
    profileImage: "/testimonials/Camilo Angarita.jpg",
    companyLogo: "/testimonials/TeslaMotor.jpg",
  },
  {
    id: "pearl-connexions",
    author: "Joel Samuel",
    company: "Pearl Connexions",
    country: { es: "UK", en: "UK" },
    countryCode: "GB",
    role: "Director",
    body: "We are changing and improving all our organization thanks to Enzo. I'm really happy with the work he did for us.",
    link: "https://www.pearlconnexions.com/",
    profileImage: "/testimonials/noimage.avif",
    companyLogo: "/testimonials/PearlConnexions.png",
  },
  {
    id: "matearte",
    author: "Richard Ortiz",
    company: "MateArte",
    country: { es: "Uruguay", en: "Uruguay" },
    countryCode: "UY",
    role: "Director",
    body: "Está impecable lo que empezamos. La verdad estoy muy feliz de trabajar con Enzo, ya que hemos mejorado en todo sentido la empresa con él.",
    link: "https://www.instagram.com/matearteuruguay/",
    profileImage: "/testimonials/Richard Ortiz.jpg",
    companyLogo: "/testimonials/MateArte.jpg",
  },
  {
    id: "anita-barry",
    author: "Anita Barry",
    company: "Fiverr",
    country: { es: "Australia", en: "Australia" },
    countryCode: "AU",
    role: "Student",
    body: "Enzo understood what I requested very well and delivered exactly what I needed. He provided efficient and clear communication. I highly recommend Enzo and will return in the future.",
    link: "https://es.fiverr.com/enzoth98?public_mode=true",
    profileImage: "/testimonials/Anita Barry.webp",
    companyLogo: "/testimonials/Fiverr1.png",
  },
  {
    id: "oriol-ramos",
    author: "Oriol Ramos",
    company: "Fiverr",
    country: { es: "España", en: "Spain" },
    countryCode: "ES",
    role: "Financial Advisor",
    body: "Todo perfecto, un gran profesional, muy rápido, muy buen precio. Perfecta comunicación. Lo recomiendo.",
    link: "https://es.fiverr.com/enzoth98?public_mode=true",
    profileImage: "/testimonials/Oriol Ramos.jpg",
    companyLogo: "/testimonials/Fiverr1.png",
  },
  {
    id: "daphaneghw",
    author: "Daphane G.",
    company: "Fiverr",
    country: { es: "EE. UU.", en: "United States" },
    countryCode: "US",
    body: "Amazing job and exceeded expectations!",
    link: "https://es.fiverr.com/enzoth98?public_mode=true",
    profileImage: "/testimonials/noimage.avif",
    companyLogo: "/testimonials/Fiverr1.png",
  },
  {
    id: "tom-dallas",
    author: "Tom W. Dallas",
    company: "Fiverr",
    country: { es: "EE. UU.", en: "United States" },
    countryCode: "US",
    body: "Working with Enzo was great. Very good communicator and handled everything we needed with the Excel file.",
    link: "https://es.fiverr.com/enzoth98?public_mode=true",
    profileImage: "/testimonials/noimage.avif",
    companyLogo: "/testimonials/Fiverr1.png",
  },
  {
    id: "maverick-hauling",
    author: "Maverick Hauling",
    company: "Fiverr",
    country: { es: "EE. UU.", en: "United States" },
    countryCode: "US",
    body: "Grateful for people that know what they are doing.",
    link: "https://es.fiverr.com/enzoth98?public_mode=true",
    profileImage: "/testimonials/noimage.avif",
    companyLogo: "/testimonials/Fiverr1.png",
  },
];

export default function TestimoniosSection() {
  const { language } = useLanguage();
  const reviews: Review[] = REVIEW_DATA.map(({ country, ...review }) => ({
    ...review,
    country: country[language],
  }));

  return (
    <section id="casos" className="py-16 sm:py-24">
      <div>
        <ReviewsCarousel reviews={reviews} />
      </div>
    </section>
  );
}
