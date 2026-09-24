import type { Metadata } from "next";
import { IBM_Plex_Sans, Newsreader } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import Script from "next/script";
import WhatsAppButton from "@/components/WhatsAppButton";
import { INSTAGRAM_URL, SITE_URL } from "@/src/constants/seo";
import "./globals.css";


const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const SEO_DESCRIPTION =
  "Centralizo datos y operaciones dispersas en sistemas internos, paneles y sitios web conectados. Trabajo con empresas uruguayas y de distintos países.";


export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Enzo Thome | Sistemas internos, datos y desarrollo web",
    template: "Enzo Thome | %s",
  },
  description: SEO_DESCRIPTION,
  applicationName: "Enzo Thome",
  authors: [{ name: "Enzo Thome", url: SITE_URL }],
  creator: "Enzo Thome",
  publisher: "Enzo Thome",
  category: "Technology consulting",
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  keywords: [
    "Enzo Thome",
    "sistemas de gestión a medida",
    "paneles internos para empresas",
    "centralización de datos empresariales",
    "dashboards operativos",
    "desarrollo web para empresas",
    "Uruguay",
    "Enzo Thome Uruguay",
    "sistemas internos Uruguay",
    "dashboards Uruguay",
  ],
  openGraph: {
    title: "Enzo Thome | Sistemas internos, datos y desarrollo web",
    description: SEO_DESCRIPTION,
    url: SITE_URL,
    siteName: "Enzo Thome",
    locale: "es_UY",
    type: "website",
    images: [{ url: "/LogoET.png", alt: "Enzo Thome" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Enzo Thome | Sistemas internos, datos y desarrollo web",
    description: SEO_DESCRIPTION,
    images: [{ url: "/LogoET.png", alt: "Enzo Thome" }],
  },
  alternates: {
    canonical: SITE_URL,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        {/* Google Analytics (gtag.js) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-FB5W87CZBB"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-FB5W87CZBB');
          `}
        </Script>
      </head>
      <body className={`${plexSans.variable} ${newsreader.variable} antialiased`}>
        <a
          href="#main-content"
          className="fixed left-4 top-4 z-[200] -translate-y-24 bg-[#FAF9F6] px-4 py-3 font-semibold text-[#0F172A] transition focus:translate-y-0 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-[#0F172A]"
        >
          Ir al contenido
        </a>
        {children}
        <Analytics />
        <WhatsAppButton />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Person",
                  "@id": `${SITE_URL}/#person`,
                  name: "Enzo Thome",
                  jobTitle: "Consultor y desarrollador de sistemas",
                  url: SITE_URL,
                  image: `${SITE_URL}/1_ext.webp`,
                  email: "mailto:enzothome1@gmail.com",
                  description: SEO_DESCRIPTION,
                  address: {
                    "@type": "PostalAddress",
                    addressCountry: "UY",
                    addressLocality: "Montevideo",
                  },
                  knowsLanguage: ["es", "en"],
                  knowsAbout: [
                    "Sistemas internos",
                    "Paneles de gestión",
                    "Centralización de datos",
                    "Análisis de datos",
                    "Desarrollo web",
                    "Integración de sistemas",
                  ],
                  sameAs: [
                    INSTAGRAM_URL,
                    "https://www.linkedin.com/in/enzothome/",
                    "https://github.com/enzoth7",
                    "https://es.fiverr.com/enzoth98",
                  ],
                },
                {
                  "@type": "ProfessionalService",
                  "@id": `${SITE_URL}/#business`,
                  name: "Enzo Thome",
                  url: SITE_URL,
                  logo: `${SITE_URL}/LogoET.png`,
                  image: `${SITE_URL}/LogoET.png`,
                  founder: { "@id": `${SITE_URL}/#person` },
                  areaServed: [
                    { "@type": "Country", name: "Uruguay" },
                    { "@type": "Place", name: "International" },
                  ],
                  contactPoint: {
                    "@type": "ContactPoint",
                    email: "enzothome1@gmail.com",
                    contactType: "sales",
                    availableLanguage: ["Spanish", "English"],
                  },
                  hasOfferCatalog: {
                    "@type": "OfferCatalog",
                    name: "Servicios de sistemas, datos y desarrollo web",
                    itemListElement: [
                      {
                        "@type": "Offer",
                        itemOffered: {
                          "@type": "Service",
                          name: "Sistemas internos y control operativo",
                          url: `${SITE_URL}/services/sistemas-internos`,
                        },
                      },
                      {
                        "@type": "Offer",
                        itemOffered: {
                          "@type": "Service",
                          name: "Datos y tableros de gestión",
                          url: `${SITE_URL}/services/datos-y-tableros-de-gestion`,
                        },
                      },
                      {
                        "@type": "Offer",
                        itemOffered: {
                          "@type": "Service",
                          name: "Sitios web y portales conectados",
                          url: `${SITE_URL}/services/sitios-web-para-empresas`,
                        },
                      },
                    ],
                  },
                },
                {
                  "@type": "WebSite",
                  "@id": `${SITE_URL}/#website`,
                  name: "Enzo Thome",
                  url: SITE_URL,
                  description: SEO_DESCRIPTION,
                  inLanguage: ["es", "en"],
                  publisher: { "@id": `${SITE_URL}/#business` },
                },
                {
                  "@type": "WebPage",
                  "@id": `${SITE_URL}/#webpage`,
                  url: SITE_URL,
                  name: "Enzo Thome | Sistemas internos, datos y desarrollo web",
                  isPartOf: { "@id": `${SITE_URL}/#website` },
                  about: { "@id": `${SITE_URL}/#person` },
                  mainEntity: { "@id": `${SITE_URL}/#business` },
                  inLanguage: "es",
                },
              ],
            })
          }}
        />
      </body>


    </html>
  );
}
