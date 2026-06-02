import { IService } from "../models/Service";

export type InitialService = Pick<
  IService,
  | "title"
  | "subtitle"
  | "slug"
  | "description"
  | "image"
  | "category"
  | "includes"
  | "duration"
  | "modality"
  | "active"
  | "order"
  | "seo"
>;

export const initialServices: InitialService[] = [
  {
    title: "Astrología",
    subtitle: "Carta Natal",
    slug: "astrologia-carta-natal",
    image: "/images/carta-natal.png",
    category: "Astrología",
    description: `La astrología es una herramienta profunda de autoconocimiento que permite comprender tu personalidad, tus talentos, desafíos y los ciclos que estás atravesando.

A través de la carta natal y la revolución solar, se obtiene claridad para tomar decisiones alineadas con tu proceso vital.

En esta sesión te guío en un viaje profundo a través de tu carta natal, para conectar con las energías disponibles, tus potencialidades, luces y sombras, y las distintas áreas de tu vida.

Exploramos patrones inconscientes, talentos y desafíos, con el objetivo de tomar conciencia de tus energías y comprender cómo potenciarlas para tu crecimiento personal.`,
    includes: [
      "Lectura completa de carta natal",
      "Análisis de tu ADN cósmico, talentos innatos y propósito de vida",
    ],
    duration: "60 a 90 minutos",
    modality: "Online",
    active: true,
    order: 10,
    seo: {
      title: "Carta Natal",
      description:
        "Descubre tu potencial personal y desactiva patrones repetitivos inconscientes.",
      keywords: ["astrología", "carta natal", "autoconocimiento"],
    },
  },
  {
    title: "Astrología",
    subtitle: "Revolución Solar",
    slug: "astrologia-revolucion-solar",
    image: "/images/revolucion-solar.png",
    category: "Astrología",
    description: `La astrología es una herramienta profunda de autoconocimiento que permite comprender tu personalidad, tus talentos, desafíos y los ciclos que estás atravesando.

A través de la carta natal y la revolución solar, se obtiene claridad para tomar decisiones alineadas con tu proceso vital.

En esta sesión analizamos las energías disponibles desde tu cumpleaños actual hasta el próximo. La Revolución Solar pone el foco en determinadas áreas de tu carta natal que la vida te invita a mirar, integrar y trabajar durante ese año.

Al observar tu Revolución Solar año tras año, se revela una coherencia profunda en tu camino de vida y en los aprendizajes que se presentan a través de situaciones, vínculos y experiencias.`,
    includes: [
      "Tu hoja de ruta anual y los temas principales de tu próximo cumpleaños.",
    ],
    duration: "60 a 90 minutos",
    modality: "Online",
    active: true,
    order: 20,
    seo: {
      title: "Revolución Solar",
      description:
        "Identifica las oportunidades y retos específicos que marcarán tu año astral.",
      keywords: ["astrología", "revolución solar", "ciclos personales"],
    },
  },
  {
    title: "Astrología",
    subtitle: "Ciclos Personales",
    slug: "astrologia-ciclos-personales",
    image: "/images/ciclos-personales.png",
    category: "Astrología",
    description: `En esta sesión te acompaño a conectar con los tránsitos astrológicos activos en el momento de la consulta. Analizamos cómo estas energías influyen en tu presente y, si es pertinente, también en períodos cercanos pasados o futuros.

Cada lectura requiere un análisis previo, ya que la astrología, los tránsitos y la Revolución Solar trabajan en conjunto para brindar una comprensión más profunda de tu proceso personal.`,
    includes: [
      "Guía de tiempos y tránsitos actuales para la toma de decisiones estratégicas",
    ],
    duration: "60 a 90 minutos",
    modality: "Online",
    active: true,
    order: 30,
    seo: {
      title: "Ciclos Personales",
      description:
        "Conoce el mejor momento para actuar, esperar o transformar tus proyectos.",
      keywords: ["astrología", "tránsitos", "ciclos personales"],
    },
  },
  {
    title: "Constelaciones Familiares",
    subtitle: "Sanación de vínculos y patrones inconscientes",
    slug: "constelaciones-familiares",
    image: "/images/constelaciones-familiares.png",
    category: "Terapias holísticas",
    description: `Las constelaciones familiares permiten observar y ordenar dinámicas ocultas que se repiten a lo largo del sistema familiar. A través de este trabajo, es posible liberar cargas, comprender conflictos y abrir espacio a una nueva mirada.

En esta sesión te acompaño a conectar con los tránsitos astrológicos activos en el momento de la consulta. Analizamos cómo estas energías influyen en tu presente y, si es pertinente, también en períodos cercanos pasados o futuros.

Cada lectura requiere un análisis previo, ya que la astrología, los tránsitos y la Revolución Solar trabajan en conjunto para brindar una comprensión más profunda de tu proceso personal.`,
    includes: [
      "Abordaje sistémico del conflicto",
      "Identificación de patrones repetitivos",
      "Movimiento hacia el orden y la integración",
    ],
    duration: "60 minutos",
    modality: "Online",
    active: true,
    order: 40,
    seo: {
      title: "Constelaciones Familiares",
      description:
        "Un abordaje terapéutico para comprender y sanar dinámicas familiares profundas.",
      keywords: ["constelaciones familiares", "terapia holística"],
    },
  },
  {
    title: "Registros Akáshicos",
    subtitle: "Lectura del alma y guía espiritual",
    slug: "registros-akashicos",
    image: "/images/registros-akashicos.png",
    category: "Terapias holísticas",
    description: `La lectura de Registros Akáshicos permite acceder a la información del alma para obtener claridad, comprensión y orientación en momentos de duda o cambio. Es un espacio de escucha profunda y conexión espiritual.

En esta sesión realizamos la apertura de tus Registros Akáshicos, los consultamos y los cerramos al finalizar. Previamente preparás unas siete preguntas relacionadas con temas que se repiten, situaciones que no encontrás cómo resolver o aspectos de tu vida que deseas comprender desde una nueva mirada.

Más allá de la información que puedas recibir, el enfoque de la lectura es profundo: recuperar tu poder personal, tomar conciencia y decidir qué hacer con lo que emerge.

La información es una guía; el verdadero proceso continúa en vos.

Será un gusto acompañarte en este camino.`,
    includes: [
      "Lectura personalizada",
      "Respuestas a preguntas conscientes",
      "Acompañamiento energético",
    ],
    duration: "60 minutos",
    modality: "Online",
    active: true,
    order: 50,
    seo: {
      title: "Registros Akáshicos",
      description:
        "Lecturas del alma que brindan claridad, comprensión y orientación espiritual.",
      keywords: ["registros akáshicos", "lectura del alma", "guía espiritual"],
    },
  },
  {
    title: "Reiki",
    subtitle: "Armonización energética integral",
    slug: "reiki",
    image: "/images/reiki.png",
    category: "Terapias holísticas",
    description: `El Reiki es una técnica de canalización de energía que promueve la relajación, el equilibrio emocional y el bienestar general. La sesión ayuda a liberar bloqueos y restaurar la armonía energética.`,
    includes: [
      "Sesión energética personalizada",
      "Liberación de tensiones",
      "Sensación de calma y bienestar",
    ],
    duration: "60 minutos",
    modality: "Online / Presencial",
    active: true,
    order: 60,
    seo: {
      title: "Reiki",
      description:
        "Armonización energética para equilibrar cuerpo, mente y emociones.",
      keywords: ["reiki", "energía", "armonización"],
    },
  },
  {
    title: "Lectura de Runas",
    subtitle: "Orientación simbólica ancestral",
    slug: "lectura-de-runas",
    image: "/images/runas.png",
    category: "Oráculos",
    description: `La lectura de runas brinda una mirada simbólica y profunda sobre situaciones actuales. A través de este lenguaje ancestral, se obtiene orientación para comprender procesos y tomar decisiones con mayor conciencia.`,
    includes: [
      "Lectura personalizada",
      "Interpretación simbólica",
      "Orientación para el momento presente",
    ],
    duration: "45 a 60 minutos",
    modality: "Online",
    active: true,
    order: 70,
    seo: {
      title: "Lectura de Runas",
      description:
        "Orientación simbólica ancestral para guiarte en procesos de decisión y cambio.",
      keywords: ["runas", "oráculo", "orientación"],
    },
  },
  {
    title: "Lectura de Tarot",
    subtitle: "Claridad y orientación consciente",
    slug: "lectura-de-tarot",
    image: "/images/tarot.png",
    category: "Oráculos",
    description: `El tarot es una herramienta de guía que permite explorar situaciones, emociones y caminos posibles. La lectura se enfoca en brindar claridad, no en predicciones cerradas, acompañando el proceso personal.`,
    includes: [
      "Lectura personalizada",
      "Análisis del momento actual",
      "Orientación práctica",
    ],
    duration: "45 a 60 minutos",
    modality: "Online",
    active: true,
    order: 80,
    seo: {
      title: "Lectura de Tarot",
      description:
        "Una mirada profunda sobre el presente para tomar decisiones conscientes.",
      keywords: ["tarot", "lectura de tarot", "orientación"],
    },
  },
];
