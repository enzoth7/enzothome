import EditorialDetailPage, { type DetailPageCopy } from "@/src/components/EditorialDetailPage";

type ServiceKey = "internal-systems" | "data-dashboards" | "connected-websites";

const servicePages: Record<ServiceKey, { es: DetailPageCopy; en: DetailPageCopy; heroImage: string; heroAlt: { es: string; en: string } }> = {
  "internal-systems": {
    heroImage: "/projects/Project3.png",
    heroAlt: {
      es: "Flujo conectado entre una tienda web, los pedidos, la producción y el control interno",
      en: "Connected workflow between an online store, orders, production, and internal control",
    },
    es: {
      title: "La información de la empresa, ordenada para trabajar",
      lead: "Convierto planillas, archivos y registros aislados en una herramienta compartida que permite consultar, actualizar y seguir la operación desde un solo lugar.",
      blocks: [
        { title: "Demasiadas fuentes para una misma realidad", body: "Cuando cada área guarda su propia versión, responder una pregunta simple puede requerir revisar archivos, mensajes y sistemas distintos." },
        { title: "Una herramienta adaptada a la forma real de trabajar", body: "Diseño la estructura, las vistas y los permisos que necesita cada equipo. La tecnología se elige después de entender el uso cotidiano.", items: ["Paneles de gestión", "Portales internos", "Bases de datos centralizadas", "Indicadores y reportes", "Seguimiento de estados", "Importación de planillas existentes"] },
        { title: "Una fuente común para consultar y decidir", body: "La información deja de depender de archivos personales y pasa a estar disponible de forma consistente para quienes la necesitan." },
      ],
    },
    en: {
      title: "Company information, organized for everyday work",
      lead: "I turn isolated spreadsheets, files, and records into one shared tool for consulting, updating, and following the operation.",
      blocks: [
        { title: "Too many sources for the same reality", body: "When every area keeps its own version, answering a simple question can require checking several files, messages, and systems." },
        { title: "A tool adapted to how people actually work", body: "I design the structure, views, and permissions each team needs. The technology is chosen after understanding everyday use.", items: ["Management dashboards", "Internal portals", "Centralized databases", "Indicators and reports", "Status tracking", "Existing spreadsheet imports"] },
        { title: "One shared source for consulting and deciding", body: "Information stops depending on personal files and becomes consistently available to the people who need it." },
      ],
    },
  },
  "data-dashboards": {
    heroImage: "/projects/Project2.png",
    heroAlt: {
      es: "Tablero de datos con indicadores, gráficos y un mapa de Uruguay",
      en: "Data dashboard with indicators, charts, and a map of Uruguay",
    },
    es: {
      title: "Datos claros para decidir a tiempo",
      lead: "Reúno planillas y fuentes separadas en una vista que permite entender qué está pasando, detectar desvíos y seguir los indicadores que importan.",
      blocks: [
        { title: "Datos que existen, pero no conversan", body: "Cuando la información vive en archivos separados, armar un reporte depende de buscar, copiar y reconciliar versiones antes de poder sacar una conclusión." },
        { title: "Un tablero diseñado alrededor de la operación", body: "Organizo las fuentes, defino los indicadores relevantes y construyo una vista que ayude a cada persona a encontrar lo que necesita.", items: ["Tableros de gestión", "Indicadores operativos", "Reportes periódicos", "Vistas por área", "Seguimiento de objetivos", "Consolidación de planillas"] },
        { title: "Una lectura compartida del negocio", body: "Los equipos trabajan con la misma información y la dirección puede ver el estado de la operación sin esperar reportes armados a mano." },
      ],
    },
    en: {
      title: "Clear data for timely decisions",
      lead: "I bring separate spreadsheets and sources into one view that helps teams understand what is happening, spot deviations, and follow the indicators that matter.",
      blocks: [
        { title: "Data that exists but does not connect", body: "When information lives in separate files, preparing a report means finding, copying, and reconciling versions before reaching a conclusion." },
        { title: "A dashboard designed around the operation", body: "I organize the sources, define the relevant indicators, and build a view that helps each person find what they need.", items: ["Management dashboards", "Operational indicators", "Recurring reports", "Area-based views", "Goal tracking", "Spreadsheet consolidation"] },
        { title: "A shared view of the business", body: "Teams work from the same information, and leadership can see the operation without waiting for manually prepared reports." },
      ],
    },
  },
  "connected-websites": {
    heroImage: "/projects/Project4.png",
    heroAlt: {
      es: "Diagrama de un sitio web conectado con una landing, una tienda y la operación",
      en: "Diagram of a website connected to a landing page, an online store, and operations",
    },
    es: {
      title: "Una web que también forma parte de la operación",
      lead: "Diseño sitios institucionales, portales y tiendas que presentan bien a la empresa y conectan lo que ocurre hacia afuera con el trabajo interno.",
      blocks: [
        { title: "El sitio no debería terminar en un formulario", body: "Las consultas, registros, pagos y pedidos pueden quedar organizados desde el comienzo, en lugar de generar otro canal aislado que alguien debe ordenar después." },
        { title: "Diseño, desarrollo y conexiones necesarias", body: "Cada proyecto combina contenido claro, una experiencia cuidada y las funciones que necesita el negocio.", items: ["Sitios institucionales", "Landing pages", "Portales y catálogos", "Tiendas online", "Formularios conectados", "Pagos y registros"] },
        { title: "Construir solamente lo que aporta valor", body: "La estructura se define a partir del objetivo, el tipo de usuario y el recorrido que la empresa necesita sostener después de publicar." },
      ],
    },
    en: {
      title: "A website that is also part of the operation",
      lead: "I design company websites, portals, and stores that present the business clearly and connect external activity with internal work.",
      blocks: [
        { title: "A website should not end at a form", body: "Enquiries, registrations, payments, and orders can be organized from the start instead of creating another isolated channel someone must sort out later." },
        { title: "Design, development, and the connections the business needs", body: "Every project combines clear content, a considered experience, and the functions required by the business.", items: ["Company websites", "Landing pages", "Portals and catalogues", "Online stores", "Connected forms", "Payments and records"] },
        { title: "Build only what creates value", body: "The structure follows the objective, the user, and the journey the company needs to sustain after launch." },
      ],
    },
  },
};

export default function ServiceDetailPage({ service }: { service: ServiceKey }) {
  const copy = servicePages[service];
  return <EditorialDetailPage es={copy.es} en={copy.en} heroImage={copy.heroImage} heroAlt={copy.heroAlt} minimalChrome />;
}
