export const SERVICE_ORDER = [
  "process_automation",
  "data_bi",
  "ai_solutions",
] as const;

export type ServiceId = (typeof SERVICE_ORDER)[number];

export type ServiceDefinition = {
  images: string[];
  title_es: string;
  title_en: string;
  description_es: string;
  description_en: string;
  examples_es: string[];
  examples_en: string[];
};

export const SERVICES_DATA: Record<ServiceId, ServiceDefinition> = {
  process_automation: {
    images: ["/ejemplos/Automation.mp4"], // Mantener imagen representativa existente
    title_es: "Automatización de Procesos",
    title_en: "Process Automation",
    description_es:
      "Diseño e implemento flujos de trabajo que eliminan tareas repetitivas, conectan herramientas y optimizan la operación de tu empresa.",
    description_en:
      "I design and implement workflows that eliminate repetitive tasks, connect tools, and optimize your company's operations.",
    examples_es: [
      "Integración entre sistemas",
      "Automatización administrativa",
      "Recordatorios y notificaciones",
      "Gestión documental",
    ],
    examples_en: [
      "Systems integration",
      "Administrative automation",
      "Reminders and notifications",
      "Document management",
    ],
  },
  data_bi: {
    images: ["/ejemplos/BI.mp4"], // Mantener imagen representativa existente
    title_es: "Datos y Business Intelligence",
    title_en: "Data & Business Intelligence",
    description_es:
      "Transformo datos en información clara mediante dashboards e indicadores que facilitan la toma de decisiones.",
    description_en:
      "I transform data into clear information through dashboards and indicators that facilitate decision-making.",
    examples_es: [
      "Power BI",
      "KPIs",
      "Reportes automáticos",
      "Análisis comercial",
    ],
    examples_en: [
      "Power BI",
      "KPIs",
      "Automated reports",
      "Commercial analysis",
    ],
  },
  ai_solutions: {
    images: ["/ejemplos/AI.mp4"], // Mantener imagen representativa existente
    title_es: "Integraciones con IA",
    title_en: "AI Integrations",
    description_es:
      "Integro asistentes y automatizaciones con IA para mejorar procesos, potenciar equipos y ofrecer una mejor experiencia a clientes.",
    description_en:
      "I integrate AI assistants and automations to improve processes, empower teams, and deliver a better customer experience.",
    examples_es: [
      "Chatbots",
      "Agentes IA",
      "Atención de leads",
      "Clasificación automática",
      "Catálogos inteligentes",
    ],
    examples_en: [
      "Chatbots",
      "AI Agents",
      "Lead engagement",
      "Automatic classification",
      "Smart catalogs",
    ],
  },
};

