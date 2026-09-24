import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/project",
        destination: "/projects",
        permanent: true,
      },
      {
        source: "/about-us",
        destination: "/about-me",
        permanent: true,
      },
      {
        source: "/sistemas-internos",
        destination: "/services/sistemas-internos",
        permanent: true,
      },
      {
        source: "/sitios-web-para-empresas",
        destination: "/services/sitios-web-para-empresas",
        permanent: true,
      },
      {
        source: "/casos/pearl-connexions",
        destination: "/projects#pearl-connexions",
        permanent: true,
      },
      {
        source: "/casos/operacion-centralizada",
        destination: "/projects#operacion-centralizada",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "enzothome.com" }],
        destination: "https://www.enzothome.com/:path*",
        permanent: true,
      },
    ];
  },
  /* Al habilitar esta configuración permitimos que Next.js pida imágenes de mayor ancho 
     para densidades Retina y controlamos mejor la compresión. */
  images: {
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    formats: ['image/webp'],
    qualities: [75, 90, 92, 100],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async headers() {
    const immutableMediaCache = [
      {
        key: "Cache-Control",
        value: "public, max-age=31536000, immutable",
      },
    ];

    return [
      {
        source: "/VideoBackground.web.v1.mp4",
        headers: immutableMediaCache,
      },
      {
        source: "/VideoBackground.mobile.v1.mp4",
        headers: immutableMediaCache,
      },
      {
        source: "/VideoBackground.web.v1.poster.webp",
        headers: immutableMediaCache,
      },
      {
        source: "/VideoBackground.mobile.v1.poster.webp",
        headers: immutableMediaCache,
      },
    ];
  },
};

export default nextConfig;
