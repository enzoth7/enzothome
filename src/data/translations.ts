import { SERVICES_DATA } from "@/src/constants/services";

export const translations = {
  es: {
    nav: {
      home: "Inicio",
      services: "Servicios",
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
        "DB-025": SERVICES_DATA["DB-025"].title_es,
        "AA-112": SERVICES_DATA["AA-112"].title_es,
        "WF-009": SERVICES_DATA["WF-009"].title_es,
        "AA-147": SERVICES_DATA["AA-147"].title_es,
        "AA-201": SERVICES_DATA["AA-201"].title_es,
        "WF-055": SERVICES_DATA["WF-055"].title_es,
        "CP-001": SERVICES_DATA["CP-001"].title_es,
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
      title: "Infraestructura técnica que trabaja por vos.",
      description:
        "Conecto y automatizo las herramientas que ya usás, eliminando la carga manual y construyendo soluciones a medida.",
      points: [
        "<b>Integración de Sistemas:</b> Conectá tu CRM, correos y bases de datos para que hablen entre sí.",
        "<b>Automatización Escalable:</b> Flujos de trabajo que se ejecutan solos, reduciendo tiempos y eliminando el error humano.",
        "<b>Dashboards Ejecutivos:</b> Visibilidad en tiempo real de toda la operación de tu empresa, automatizada y sin intervención manual.",
      ],
      footer: "Tu información ordenada y lista para la toma de decisiones.",
    },
    whoAmI: {
      subtitle: "Sobre mí",
      title1: "Visión y Criterio",
      desc1:
        "Soy Enzo, analista de datos y arquitecto de operaciones. Diseño e implemento sistemas que permiten a las empresas superar sus límites de crecimiento. A lo largo de mi trayectoria en los sectores público y privado, comprobé que la visibilidad de los datos y la automatización de procesos repetitivos no solo reducen la carga operativa, sino que tienen un impacto directo en la rentabilidad y la toma de decisiones estratégicas.",
      title2: "Arquitectura de Sistemas",
      desc2:
        "El nombre Workflow Waves nace de una convicción: los flujos de trabajo de una empresa deben comportarse como las olas, siendo fluidas, continuas y con la fuerza necesaria para modelar y estructurar la operación sin generar fricción. Diseño soluciones que eliminan tareas manuales e integran sistemas para que la información fluya. Mi objetivo es estructurar arquitecturas escalables para que los negocios dependan de sistemas eficientes, no de procesos manuales propensos a errores.",
    },
    testimonials: {
      subtitle: "Proyectos anteriores",
      title: "Opiniones de clientes",
      description: "Resultados reales en diversos proyectos, desde automatizar una pequeña operativa hasta desarrollar herramientas de alto impacto",
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
        "DB-025": SERVICES_DATA["DB-025"].title_en,
        "AA-112": SERVICES_DATA["AA-112"].title_en,
        "WF-009": SERVICES_DATA["WF-009"].title_en,
        "AA-147": SERVICES_DATA["AA-147"].title_en,
        "AA-201": SERVICES_DATA["AA-201"].title_en,
        "WF-055": SERVICES_DATA["WF-055"].title_en,
        "CP-001": SERVICES_DATA["CP-001"].title_en,
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
      title: "Technical infrastructure that works for you.",
      description:
        "I connect and automate the tools you already use, eliminating manual workload and building custom solutions.",
      points: [
        "<b>Systems Integration:</b> Connect your CRM, emails, and databases so they work together.",
        "<b>Scalable Automation:</b> Workflows that run on their own, reducing time and eliminating human error.",
        "<b>Executive Dashboards:</b> Real-time visibility into your entire operation, automated and free of manual intervention.",
      ],
      footer: "Your information, organized and ready for decision-making.",
    },
    whoAmI: {
      subtitle: "About me",
      title1: "Vision and Judgment",
      desc1:
        "I am Enzo, a data analyst and operations architect. I design and implement systems that enable businesses to overcome structural limits to growth. Throughout my career in both the public and private sectors, I have verified that data visibility and the automation of repetitive processes not only reduce operational load but also directly impact profitability and strategic decision-making.",
      title2: "Systems Architecture",
      desc2:
        "The name Workflow Waves stems from a conviction: a company's workflows should behave like waves, being fluid, continuous, and with the necessary force to shape and structure operations without friction. I design solutions that eliminate manual tasks and integrate systems so that information flows. My goal is to build scalable architectures so that businesses rely on efficient systems rather than error-prone manual processes.",
    },
    testimonials: {
      subtitle: "Previous Projects",
      title: "Client Feedback",
      description: "Real results across different projects, from automating a small operation to building high-impact tools.",
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
