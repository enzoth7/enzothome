import type { Metadata } from "next";
import { IBM_Plex_Sans, Newsreader } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import Script from "next/script";
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
  "Desde Uruguay, Enzo Thome diseña sistemas a medida de automatización, datos y operaciones para empresas que quieren crecer con orden y control.";

export const metadata: Metadata = {
  metadataBase: new URL("https://enzothome.com"),
  title: "Enzo Thome | Data & Automation",
  description: SEO_DESCRIPTION,
  keywords: [
    "Enzo Thome",
    "automatización de procesos",
    "arquitectura de datos",
    "sistemas eficientes",
    "sistemas escalables",
    "n8n",
    "optimización de PYMES",
    "Uruguay",
    "España",
    "Enzo Thome Uruguay",
    "automatización de procesos Uruguay",
    "arquitectura de datos Uruguay",
    "n8n Uruguay",
    "Data & Automation Uruguay",
  ],
  openGraph: {
    title: "Enzo Thome | Data & Automation",
    description: SEO_DESCRIPTION,
    url: "https://enzothome.com",
    siteName: "Enzo Thome",
    locale: "es_UY",
    type: "website",
    images: ["/LogoET.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Enzo Thome | Data & Automation",
    images: ["/LogoET.png"],
  },
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
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
        {children}
        <Analytics />
      </body>
    </html>
  );
}
