import { SITE_URL } from "@/src/constants/seo";

const content = `# Enzo Thome

> Sistemas internos, paneles de gestión, centralización de datos y desarrollo web para empresas.

Enzo Thome trabaja desde Montevideo, Uruguay, con empresas locales e internacionales. Diseña herramientas alrededor de la operación de cada empresa: sistemas internos, tableros de gestión, dashboards, portales y sitios web conectados.

## Páginas principales

- [Inicio](${SITE_URL}): presentación general, servicios, proyectos y contacto.
- [Servicios](${SITE_URL}/services): resumen de las áreas de trabajo.
- [Proyectos](${SITE_URL}/projects): proyectos de los sistemas construidos.
- [Sobre Enzo](${SITE_URL}/about-me): perfil profesional y forma de trabajo.

## Servicios

- [Sistemas internos y control operativo](${SITE_URL}/services/sistemas-internos)
- [Datos y tableros de gestión](${SITE_URL}/services/datos-y-tableros-de-gestion)
- [Sitios web y portales conectados](${SITE_URL}/services/sitios-web-para-empresas)

## Contacto

- Email: enzothome1@gmail.com
- Sitio canónico: ${SITE_URL}
- Ubicación: Montevideo, Uruguay
`;

export function GET() {
  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
