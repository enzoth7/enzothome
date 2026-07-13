import { SERVICES_DATA } from "@/src/constants/services";

export const translations = {
  es: {
    nav: {
      home: "Inicio",
      services: "Servicios",
      projects: "Proyectos",
      about: "Sobre mí",
      cta: "Agendar Llamada",
    },
    hero: {
      ctaPrimary: "COMENZAR",
      subtext: "Mira cómo podrían mejorar tus procesos en tu empresa",
      titleLine1: "Arquitectura",
      titleLine2: "de",
      titleLine3: "sistemas",
      description:
        "Diseño de infraestructuras digitales para la escalabilidad y eficiencia de tus operaciones.",
    },
    onboarding: {
      subtitle: "Diagnóstico Operativo",
      title: "Mirá como podría optimizar tus operaciones.",
      description:
        "En este cuestionario voy a detectar cuellos de botella y recomendar una solución.",
      startCta: "Comenzar ahora",
      progressLabel: "Pregunta",
      progressConnector: "de",
      restart: "Reiniciar diagnóstico",
      analysisTitle: "Procesando tu información...",
      analysisMessages: [
        "Analizando tu infraestructura operativa...",
        "Detectando puntos de fricción...",
        "Definiendo la solución ideal...",
      ],
      matchLabel: "Diagnóstico Final",
      resultPrefix: "Tu empresa requiere",
      resultSuffix: "Ingresá tu correo y analizaré la información de tu diagnóstico, luego te enviaré un informe detallado.",
      successMessage: "¡Enviado con éxito!",
      emailPlaceholder: "tu@empresa.com",
      sendingCta: "Enviando...",
      finalCta: "Enviar diagnóstico por mail",
      backHome: "Volver al inicio",
      unanswered: "Sin respuesta",
      questions: [
        {
          id: "current-bottleneck",
          prompt: "¿Cuál es el mayor problema de tu empresa hoy?",
          options: [
            { value: "many_whatsapps", label: "💬 Muchos mensajes que no se responden" },
            { value: "messy_data", label: "📊 Datos desordenados" },
            { value: "manual_tasks", label: "⏳ Tareas manuales inproductivas" },
          ],
        },
        {
          id: "people-affected",
          prompt: "¿Cuántas personas pierden tiempo en tareas repetitivas?",
          options: [
            { value: "one_to_two_people", label: "👤 1-2 personas" },
            { value: "three_to_five_people", label: "👥 3-5 personas" },
            { value: "whole_team", label: "🏢 El equipo entero" },
          ],
        },
        {
          id: "stress-point",
          prompt: "¿Qué área se rompe primero cuando sube la demanda?",
          options: [
            { value: "sales_follow_up", label: "📥 Atención al cliente" },
            { value: "reporting_profitability", label: "📈 Reportes y rentabilidad" },
            { value: "internal_operations", label: "⚙️ Operaciones internas" },
          ],
        },
        {
          id: "integration-level",
          prompt: "¿Qué tan conectadas están hoy las herramientas que más usas?",
          options: [
            { value: "everything_isolated", label: "🔌 Todo está aislado" },
            { value: "manual_patches", label: "🩹 Hay parches manuales" },
            { value: "partial_integration", label: "🧩 Ya existe una integración parcial" },
          ],
        },
        {
          id: "priority-quarter",
          prompt: "Si pudiéramos intervenir este trimestre, ¿qué es lo que más impacto generaría?",
          options: [
            { value: "better_capture_close", label: "🚀 Captar y cerrar los leads mejor" },
            { value: "real_business_control", label: "🧭 Tener control en tiempo real del negocio" },
            { value: "remove_manual_work", label: "⚡ Sacar tareas manuales del equipo" },
          ],
        },
      ],
      categories: {
        process_automation: SERVICES_DATA["process_automation"].title_es,
        data_bi: SERVICES_DATA["data_bi"].title_es,
        ai_solutions: SERVICES_DATA["ai_solutions"].title_es,
      },
      emailSubject: "Diagnóstico operativo completado",
      emailIntro: "Nuevo diagnóstico",
      emailResultLabel: "Resultado sugerido",
      emailAnswersLabel: "Respuestas",
    },
    precisionMetrics: {
      eyebrow: "Métricas",
      uptimeLabel: "Proyectos completados",
      tasksLabel: "Tareas completadas de forma autónoma cada mes",
      turnaroundLabel: "La velocidad de resolución de operaciones rutinarias",
      hoursSavedLabel: "Tiempo ahorrado mensualmente por cliente",
    },
    whatIDo: {
      subtitle: "Propuesta",
      title: "Un sistema diseñado para darte el control",
      description:
        "Obtené una estructura operativa a tu medida para eliminar la carga manual de tu equipo, conectar tus herramientas y ganar el control absoluto de tu negocio.",
      points: [
        "Tiempo libre para hacer crecer tu negocio|Un sistema autónomo que hace que tu operación diaria funcione sin depender de tu presencia constante.",
        "Control de tus operaciones|Sabé en tiempo real cómo está tu negocio para no esperar a procesos manuales que son inexactos y toman tiempo.",
        "Tomar decisiones con datos, no con intuición|Ganá claridad absoluta sobre el rumbo de tu negocio para tomar decisiones estratégicas basadas en certezas, no en suposiciones."
      ],
      footer: "",
    },
    projects: {
      subtitle: "Proyectos",
      title: "Trabajos completados",
      lead: "Aquí se pueden ver conceptual y tecnicamente algunos de los proyectos que he desarrollado.",
      project1: {
        title: "Agente de ventas en WhatsApp",
        description: "Diseño e implementación de un flujo automatizado para conectar un Agente de IA al WhatsApp de la empresa para responder dudas y ofrecer productos. Conectado al catálogo y bases de datos, esto redujo el tiempo de respuesta a leads en un 90% y eliminó la duplicación manual de registros de ventas.",
      },
      project2: {
        title: "Visualización de Datos y Reportes",
        description: "Creación de un dashboard centralizado de KPIs operativos conectado a múltiples fuentes de datos. Permitió ver de forma clara la evolución del turismo y su impacto en las distintas ciudades. Esto permitió optimizar la toma de decisiones en las áreas más críticas.",
      },
      project3: {
        title: "Automatización de Órdenes de Producción",
        description: "Diseño y desarrollo de un flujo de trabajo integrado para sincronizar la Tienda web de una empresa con la base del datos de taller. Eliminó el registro manual en papel, automatizó la transferencia de especificaciones de diseño y optimizó la producción y los tiempos de ventas.",
      },
      cta: "Ver más",
    },
    whoAmI: {
      subtitle: "Sobre mí",
      title1: "Visión y Criterio",
      desc1:
        "Me llamo Enzo y me he desarrollado como analista de datos orientado a brindar soluciones para profesionales y empresas. Mi trayectoria en los sectores público y privado me ha permitido entender que las herramientas no son el fin, sino el medio. Brindar datos o automatizar procesos no sirve de nada si eso no se traduce en mejores decisiones o en un ahorro real de tiempo y dinero. Por eso, además de ofrecer un servicio, acompaño a mis clientes para que cada solución genere un beneficio concreto para su negocio.",
      title2: "Arquitectura de Sistemas",
      desc2:
        "Todo sistema bien diseñado debe ser fluido, continuo y capaz de adaptarse al crecimiento del negocio. Cuando los procesos están fragmentados, la información se pierde, las tareas se duplican y las decisiones llegan tarde. Pero si se eliminan las tareas manuales y se integran sistemas, la información fluye y los datos dejan de ser simples registros para convertirse en un activo estratégico. El dato se vuelve accionable, el conocimiento se convierte en decisión y el negocio adquiere la capacidad de escalar.",
    },
    testimonials: {
      subtitle: "Proyectos desarrollados",
      title: "Opiniones de clientes",
      description: "Resultados reales en diversos proyectos, desde automatizar una pequeña operativa hasta desarrollar soluciones de alto impacto.",
    },
    contact: {
      subtitle: "Contacto",
      otherProjects: "Otros proyectos",
      miAdmiLabel: "App de gestión de finanzas personales",
      description: "Si sentís que necesitás ordenar tu situación, escribime.",
      copy: "Copiar mail",
      copied: "Copiado",
    },
    social: {
      site: "Sitio",
    },
  },
  en: {
    nav: {
      home: "Home",
      services: "Services",
      projects: "Projects",
      about: "About me",
      cta: "Schedule a Call",
    },
    hero: {
      ctaPrimary: "START",
      subtext: "See how your company's processes could improve.",
      titleLine1: "Architecture",
      titleLine2: "of",
      titleLine3: "systems",
      description:
        "Digital infrastructure design for the scalability and efficiency of your operations.",
    },
    onboarding: {
      subtitle: "Operational Diagnosis",
      title: "See how I could optimize your operations.",
      description:
        "In this questionnaire, I'll identify bottlenecks and recommend a solution.",
      startCta: "Start now",
      progressLabel: "Question",
      progressConnector: "of",
      restart: "Restart diagnosis",
      analysisTitle: "Processing your information...",
      analysisMessages: [
        "Analyzing your operational infrastructure...",
        "Detecting friction points...",
        "Defining the ideal solution...",
      ],
      matchLabel: "Final Diagnosis",
      resultPrefix: "Your company needs a",
      resultSuffix:
        "Enter your email and I'll review the information from your diagnosis, then send you a detailed report.",
      successMessage: "Sent successfully!",
      emailPlaceholder: "you@company.com",
      sendingCta: "Sending...",
      finalCta: "Send diagnosis by email",
      backHome: "Back to home",
      unanswered: "No answer",
      questions: [
        {
          id: "current-bottleneck",
          prompt: "What is your company's biggest problem today?",
          options: [
            { value: "many_whatsapps", label: "💬 Too many unanswered messages" },
            { value: "messy_data", label: "📊 Disorganized data" },
            { value: "manual_tasks", label: "⏳ Unproductive manual tasks" },
          ],
        },
        {
          id: "people-affected",
          prompt: "How many people lose time on repetitive tasks?",
          options: [
            { value: "one_to_two_people", label: "👤 1-2 people" },
            { value: "three_to_five_people", label: "👥 3-5 people" },
            { value: "whole_team", label: "🏢 The entire team" },
          ],
        },
        {
          id: "stress-point",
          prompt: "Which area breaks first when demand increases?",
          options: [
            { value: "sales_follow_up", label: "📥 Customer service" },
            { value: "reporting_profitability", label: "📈 Reporting and profitability" },
            { value: "internal_operations", label: "⚙️ Internal operations" },
          ],
        },
        {
          id: "integration-level",
          prompt: "How connected are the tools you use most today?",
          options: [
            { value: "everything_isolated", label: "🔌 Everything is isolated" },
            { value: "manual_patches", label: "🩹 There are manual patches" },
            { value: "partial_integration", label: "🧩 A partial integration already exists" },
          ],
        },
        {
          id: "priority-quarter",
          prompt: "If we could intervene this quarter, what would generate the greatest impact?",
          options: [
            { value: "better_capture_close", label: "🚀 Capture and close leads better" },
            { value: "real_business_control", label: "🧭 Have real-time control of the business" },
            { value: "remove_manual_work", label: "⚡ Remove manual tasks from the team" },
          ],
        },
      ],
      categories: {
        process_automation: SERVICES_DATA["process_automation"].title_en,
        data_bi: SERVICES_DATA["data_bi"].title_en,
        ai_solutions: SERVICES_DATA["ai_solutions"].title_en,
      },
      emailSubject: "Operational diagnostic completed",
      emailIntro: "New diagnosis",
      emailResultLabel: "Suggested result",
      emailAnswersLabel: "Answers",
    },
    precisionMetrics: {
      eyebrow: "Metrics",
      uptimeLabel: "Completed projects",
      tasksLabel: "Tasks completed autonomously each month",
      turnaroundLabel: "Resolution speed for routine operations",
      hoursSavedLabel: "Time saved per client each month",
    },
    whatIDo: {
      subtitle: "Proposal",
      title: "A system designed to give you control",
      description:
        "Get a tailored operational structure to eliminate your team's manual workload, connect your tools, and gain absolute control over your business.",
      points: [
        "Free time to grow your business|An autonomous system that keeps your daily operations running without relying on your constant presence.",
        "Control over your operations|Know in real time how your business is doing, instead of waiting for manual processes that are slow and inaccurate.",
        "Make decisions with data, not intuition|Gain absolute clarity on your business direction to make strategic decisions based on facts, not assumptions."
      ],
      footer: "",
    },
    projects: {
      subtitle: "Projects",
      title: "Completed Projects",
      lead: "Here you can see some of the projects I've developed, both conceptually and technically.",
      project1: {
        title: "WhatsApp Sales Agent",
        description: "Design and implementation of an automated workflow to connect an AI agent to the company's WhatsApp account to answer questions and offer products. Connected to the product catalog and databases, this reduced response time to leads by 90% and eliminated the manual duplication of sales records.",
      },
      project2: {
        title: "Data Visualization and Reporting",
        description: "Creation of a centralized dashboard of operational KPIs connected to multiple data sources. It provided a clear view of tourism trends and their impact on different cities. This enabled optimized decision-making in the most critical areas.",
      },
      project3: {
        title: "Production Order Automation",
        description: "Design and development of an integrated workflow to synchronize a company's online store with its workshop database. This eliminated manual paper-based record-keeping, automated the transfer of design specifications, and optimized production and sales lead times.",
      },
      cta: "See more",
    },
    whoAmI: {
      subtitle: "About me",
      title1: "Vision and Judgment",
      desc1:
        "My name is Enzo, and I have developed my career as a data analyst focused on providing solutions for professionals and companies. My experience in both the public and private sectors has taught me that tools are not the end goal, but rather the means to an end. Providing data or automating processes is useless if it doesn’t lead to better decisions or real savings in time and money. That’s why, in addition to offering a service, I work closely with my clients to ensure that every solution delivers a tangible benefit for their business.",
      title2: "Systems Architecture",
      desc2:
        "Every well-designed system must be seamless, continuous, and capable of adapting to business growth. When processes are fragmented, information is lost, tasks are duplicated, and decisions are delayed. But if manual tasks are eliminated and systems are integrated, information flows freely, and data ceases to be mere records and becomes a strategic asset. Data becomes actionable, knowledge turns into decisions, and the business gains the ability to scale.",
    },
    testimonials: {
      subtitle: "Projects developed",
      title: "Client Feedback",
      description: "Real results across different projects, from automating a small operation to building high-impact solutions.",
    },
    contact: {
      subtitle: "Contact",
      otherProjects: "Other projects",
      miAdmiLabel: "Personal finance management app",
      description: "If you feel you need to get organized, write to me.",
      copy: "Copy email",
      copied: "Copied",
    },
    social: {
      site: "Website",
    },
  },
};
