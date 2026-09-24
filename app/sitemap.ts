import type { MetadataRoute } from "next";
import { SITE_URL } from "@/src/constants/seo";

const LAST_CONTENT_UPDATE = new Date("2026-09-24T00:00:00.000Z");

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: LAST_CONTENT_UPDATE,
      changeFrequency: "weekly",
      priority: 1,
      images: [`${SITE_URL}/LogoET.png`],
    },
    {
      url: `${SITE_URL}/services`,
      lastModified: LAST_CONTENT_UPDATE,
      changeFrequency: "monthly",
      priority: 0.9,
      images: [
        `${SITE_URL}/se%C3%B1ales/a.jpg`,
        `${SITE_URL}/se%C3%B1ales/b.png`,
        `${SITE_URL}/se%C3%B1ales/c.png`,
      ],
    },
    {
      url: `${SITE_URL}/services/sistemas-internos`,
      lastModified: LAST_CONTENT_UPDATE,
      changeFrequency: "monthly",
      priority: 0.9,
      images: [`${SITE_URL}/se%C3%B1ales/a.jpg`],
    },
    {
      url: `${SITE_URL}/services/datos-y-tableros-de-gestion`,
      lastModified: LAST_CONTENT_UPDATE,
      changeFrequency: "monthly",
      priority: 0.9,
      images: [`${SITE_URL}/se%C3%B1ales/b.png`],
    },
    {
      url: `${SITE_URL}/services/sitios-web-para-empresas`,
      lastModified: LAST_CONTENT_UPDATE,
      changeFrequency: "monthly",
      priority: 0.9,
      images: [`${SITE_URL}/se%C3%B1ales/c.png`],
    },
    {
      url: `${SITE_URL}/projects`,
      lastModified: LAST_CONTENT_UPDATE,
      changeFrequency: "monthly",
      priority: 0.9,
      images: [
        `${SITE_URL}/projects/ProjectC.png`,
        `${SITE_URL}/projects/ProjectBB.png`,
        `${SITE_URL}/projects/ProjectB.png`,
        `${SITE_URL}/projects/ProjectAA.png`,
        `${SITE_URL}/projects/ProjectA.png`,
      ],
    },
    {
      url: `${SITE_URL}/about-me`,
      lastModified: LAST_CONTENT_UPDATE,
      changeFrequency: "monthly",
      priority: 0.7,
      images: [`${SITE_URL}/1_ext.webp`],
    },
  ];
}
