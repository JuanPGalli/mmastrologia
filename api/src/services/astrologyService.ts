import { Horoscope, Origin } from "circular-natal-horoscope-js";

export type DatosNacimiento = {
  year: number;
  month: number; // 1-12, como lo ingresa el usuario
  day: number;
  hour?: number; // 0-23
  minute?: number; // 0-59
  horaDesconocida: boolean;
  latitude: number;
  longitude: number;
};

export type CartaResumen = {
  solSigno: string;
  lunaSigno: string;
  ascendenteSigno: string | null; // null si no se conoce la hora de nacimiento
  saturnoTransitandoCasa: number | null; // null si no hay casas calculadas (sin hora)
  horaConocida: boolean;
};

type HoroscopeHouse = {
  ChartPosition: {
    StartPosition: { Ecliptic: { DecimalDegrees: number } };
    EndPosition: { Ecliptic: { DecimalDegrees: number } };
  };
};

const construirHoroscopio = (input: {
  year: number;
  month: number; // 0-11, formato de la librería
  day: number;
  hour: number;
  minute: number;
  latitude: number;
  longitude: number;
}) => {
  const origin = new Origin({
    year: input.year,
    month: input.month,
    date: input.day,
    hour: input.hour,
    minute: input.minute,
    latitude: input.latitude,
    longitude: input.longitude,
  });

  return new Horoscope({
    origin,
    houseSystem: "placidus",
    zodiac: "tropical",
    aspectPoints: ["bodies", "points", "angles"],
    aspectWithPoints: ["bodies", "points", "angles"],
    aspectTypes: ["major"],
    customOrbs: {},
    language: "es",
  });
};

// Ubica un grado eclíptico (posición real en el zodíaco, no depende de la
// ubicación) dentro de las casas natales, manejando el caso en que el rango
// de una casa cruza los 0°/360°.
const casaQueContieneGrado = (houses: HoroscopeHouse[], grados: number): number | null => {
  for (let i = 0; i < houses.length; i++) {
    const start = houses[i].ChartPosition.StartPosition.Ecliptic.DecimalDegrees;
    const end = houses[i].ChartPosition.EndPosition.Ecliptic.DecimalDegrees;

    const dentroDelRango = start <= end ? grados >= start && grados < end : grados >= start || grados < end;

    if (dentroDelRango) return i + 1;
  }
  return null;
};

export type TransitosDia = {
  solSignoNatal: string;
  lunaSignoNatal: string;
  lunaTransitoSigno: string;
  lunaTransitandoCasa: number | null;
  solTransitandoCasa: number | null;
  saturnoTransitandoCasa: number | null;
  horaConocida: boolean;
};

// Tránsitos relevantes para un horóscopo del día: la Luna es la que más
// rápido se mueve (cambia de signo cada ~2.5 días) y es la que más define el
// "tono" de un día puntual; se suma el Sol y Saturno (ya calculado en
// calcularCartaResumen) como contexto de más largo plazo. No se recalculan
// aspectos completos acá para mantener el costo/latencia bajos — esto se
// llama una vez por usuario por día (ver HoroscopoDiario.ts).
export const calcularTransitosDelDia = (datos: DatosNacimiento): TransitosDia => {
  const hour = datos.horaDesconocida ? 12 : (datos.hour ?? 12);
  const minute = datos.horaDesconocida ? 0 : (datos.minute ?? 0);

  const natal = construirHoroscopio({
    year: datos.year,
    month: datos.month - 1,
    day: datos.day,
    hour,
    minute,
    latitude: datos.latitude,
    longitude: datos.longitude,
  });

  const solSignoNatal: string = natal.CelestialBodies.sun.Sign.label;
  const lunaSignoNatal: string = natal.CelestialBodies.moon.Sign.label;

  const ahora = new Date();
  const transito = construirHoroscopio({
    year: ahora.getUTCFullYear(),
    month: ahora.getUTCMonth(),
    day: ahora.getUTCDate(),
    hour: ahora.getUTCHours(),
    minute: ahora.getUTCMinutes(),
    latitude: datos.latitude,
    longitude: datos.longitude,
  });

  const lunaTransitoSigno: string = transito.CelestialBodies.moon.Sign.label;

  if (datos.horaDesconocida) {
    return {
      solSignoNatal,
      lunaSignoNatal,
      lunaTransitoSigno,
      lunaTransitandoCasa: null,
      solTransitandoCasa: null,
      saturnoTransitandoCasa: null,
      horaConocida: false,
    };
  }

  const houses = natal.Houses as HoroscopeHouse[];
  const lunaGrado: number = transito.CelestialBodies.moon.ChartPosition.Ecliptic.DecimalDegrees;
  const solGrado: number = transito.CelestialBodies.sun.ChartPosition.Ecliptic.DecimalDegrees;
  const saturnoGrado: number = transito.CelestialBodies.saturn.ChartPosition.Ecliptic.DecimalDegrees;

  return {
    solSignoNatal,
    lunaSignoNatal,
    lunaTransitoSigno,
    lunaTransitandoCasa: casaQueContieneGrado(houses, lunaGrado),
    solTransitandoCasa: casaQueContieneGrado(houses, solGrado),
    saturnoTransitandoCasa: casaQueContieneGrado(houses, saturnoGrado),
    horaConocida: true,
  };
};

export type PuntoRueda = {
  nombre: string; // 'sol' | 'luna' | 'mercurio' | ... — se usa para elegir el glifo en el frontend
  signo: string;
  grado: number; // 0-359.99, posición eclíptica absoluta (para ubicarlo en el círculo)
};

export type DatosRueda = {
  ascendenteGrado: number | null;
  casas: number[] | null; // 12 grados de inicio de cada casa, o null sin hora
  planetas: PuntoRueda[];
  horaConocida: boolean;
};

const CUERPOS_RUEDA = [
  "sun",
  "moon",
  "mercury",
  "venus",
  "mars",
  "jupiter",
  "saturn",
  "uranus",
  "neptune",
  "pluto",
] as const;

// Todo lo que necesita el frontend para dibujar la rueda como SVG: nada de
// esto pasa por la IA, es la misma matemática que ya usa calcularCartaResumen,
// solo que acá se expone la posición completa en vez de solo el resumen.
export const calcularDatosRueda = (datos: DatosNacimiento): DatosRueda => {
  const horaConocida = !datos.horaDesconocida;
  const hour = horaConocida ? (datos.hour ?? 12) : 12;
  const minute = horaConocida ? (datos.minute ?? 0) : 0;

  const horoscope = construirHoroscopio({
    year: datos.year,
    month: datos.month - 1,
    day: datos.day,
    hour,
    minute,
    latitude: datos.latitude,
    longitude: datos.longitude,
  });

  type CelestialBody = { Sign: { label: string }; ChartPosition: { Ecliptic: { DecimalDegrees: number } } };
  const cuerpos = horoscope.CelestialBodies as unknown as Record<string, CelestialBody>;

  const planetas: PuntoRueda[] = CUERPOS_RUEDA.map((nombre) => ({
    nombre,
    signo: cuerpos[nombre].Sign.label,
    grado: cuerpos[nombre].ChartPosition.Ecliptic.DecimalDegrees,
  }));

  if (!horaConocida) {
    return { ascendenteGrado: null, casas: null, planetas, horaConocida: false };
  }

  const houses = horoscope.Houses as HoroscopeHouse[];
  const casas = houses.map((h) => h.ChartPosition.StartPosition.Ecliptic.DecimalDegrees);
  const ascendenteGrado = casas[0]; // la cúspide de la casa 1 ES el ascendente

  return { ascendenteGrado, casas, planetas, horaConocida: true };
};

export const calcularCartaResumen = (datos: DatosNacimiento): CartaResumen => {
  // Sin hora exacta no se puede calcular el ascendente ni las casas de forma
  // confiable (cambian varios grados por hora) — usamos mediodía solo como
  // ancla neutra para el cálculo de Sol/Luna, y directamente omitimos
  // ascendente y tránsito por casa en vez de mostrar un dato inventado.
  const hour = datos.horaDesconocida ? 12 : (datos.hour ?? 12);
  const minute = datos.horaDesconocida ? 0 : (datos.minute ?? 0);

  const natal = construirHoroscopio({
    year: datos.year,
    month: datos.month - 1,
    day: datos.day,
    hour,
    minute,
    latitude: datos.latitude,
    longitude: datos.longitude,
  });

  const solSigno: string = natal.CelestialBodies.sun.Sign.label;
  const lunaSigno: string = natal.CelestialBodies.moon.Sign.label;

  if (datos.horaDesconocida) {
    return {
      solSigno,
      lunaSigno,
      ascendenteSigno: null,
      saturnoTransitandoCasa: null,
      horaConocida: false,
    };
  }

  const ascendenteSigno: string = natal.Ascendant.Sign.label;

  // Tránsito actual de Saturno: se calcula su posición real de HOY (la
  // ubicación no afecta la posición zodiacal del cuerpo, solo las casas) y
  // se ubica dentro de las casas natales ya calculadas arriba.
  const ahora = new Date();
  const transito = construirHoroscopio({
    year: ahora.getUTCFullYear(),
    month: ahora.getUTCMonth(),
    day: ahora.getUTCDate(),
    hour: ahora.getUTCHours(),
    minute: ahora.getUTCMinutes(),
    latitude: datos.latitude,
    longitude: datos.longitude,
  });

  const saturnoGradoActual: number = transito.CelestialBodies.saturn.ChartPosition.Ecliptic.DecimalDegrees;
  const saturnoTransitandoCasa = casaQueContieneGrado(natal.Houses as HoroscopeHouse[], saturnoGradoActual);

  return {
    solSigno,
    lunaSigno,
    ascendenteSigno,
    saturnoTransitandoCasa,
    horaConocida: true,
  };
};

// ---- Sinastría (compatibilidad entre dos cartas) ----

export type PuntoSinastria = { cuerpo: string; signo: string; grado: number };
export type PersonaSinastria = { nombre: string; puntos: PuntoSinastria[]; horaConocida: boolean };

export type AspectoSinastria = {
  cuerpoA: string;
  cuerpoB: string;
  tipo: "conjunción" | "sextil" | "cuadratura" | "trígono" | "oposición";
  orbe: number; // diferencia en grados respecto del aspecto exacto
};

const CUERPOS_SINASTRIA = ["sun", "moon", "venus", "mars"] as const;

const NOMBRE_ES: Record<string, string> = {
  sun: "Sol",
  moon: "Luna",
  venus: "Venus",
  mars: "Marte",
  ascendant: "Ascendente",
};

const ANGULOS_ASPECTOS: { tipo: AspectoSinastria["tipo"]; angulo: number }[] = [
  { tipo: "conjunción", angulo: 0 },
  { tipo: "sextil", angulo: 60 },
  { tipo: "cuadratura", angulo: 90 },
  { tipo: "trígono", angulo: 120 },
  { tipo: "oposición", angulo: 180 },
];
const ORBE_MAXIMO = 6; // grados de tolerancia — valor estándar para planetas personales

// Puntos de una persona relevantes para sinastría: Sol/Luna/Venus/Marte
// siempre, y Ascendente si se conoce la hora. Sin hora, la sinastría igual
// funciona (es común en la práctica astrológica), solo que sin ese punto.
export const calcularPuntosSinastria = (datos: DatosNacimiento, nombre: string): PersonaSinastria => {
  const horaConocida = !datos.horaDesconocida;
  const hour = horaConocida ? (datos.hour ?? 12) : 12;
  const minute = horaConocida ? (datos.minute ?? 0) : 0;

  const horoscope = construirHoroscopio({
    year: datos.year,
    month: datos.month - 1,
    day: datos.day,
    hour,
    minute,
    latitude: datos.latitude,
    longitude: datos.longitude,
  });

  type CelestialBody = { Sign: { label: string }; ChartPosition: { Ecliptic: { DecimalDegrees: number } } };
  const cuerpos = horoscope.CelestialBodies as unknown as Record<string, CelestialBody>;

  const puntos: PuntoSinastria[] = CUERPOS_SINASTRIA.map((cuerpo) => ({
    cuerpo: NOMBRE_ES[cuerpo],
    signo: cuerpos[cuerpo].Sign.label,
    grado: cuerpos[cuerpo].ChartPosition.Ecliptic.DecimalDegrees,
  }));

  if (horaConocida) {
    const houses = horoscope.Houses as HoroscopeHouse[];
    const ascGrado = houses[0].ChartPosition.StartPosition.Ecliptic.DecimalDegrees;
    const asc = horoscope.Angles as unknown as { ascendant: CelestialBody };
    puntos.push({ cuerpo: NOMBRE_ES.ascendant, signo: asc.ascendant.Sign.label, grado: ascGrado });
  }

  return { nombre, puntos, horaConocida };
};

const diferenciaAngular = (a: number, b: number): number => {
  const diff = Math.abs(a - b) % 360;
  return diff > 180 ? 360 - diff : diff;
};

// Compara cada punto de A contra cada punto de B y se queda con los
// aspectos mayores que caen dentro del orbe — es la tabla clásica de
// sinastría (Sol-Luna, Venus-Marte, etc. entre dos cartas).
export const calcularAspectosSinastria = (
  personaA: PersonaSinastria,
  personaB: PersonaSinastria
): AspectoSinastria[] => {
  const aspectos: AspectoSinastria[] = [];

  for (const puntoA of personaA.puntos) {
    for (const puntoB of personaB.puntos) {
      const diferencia = diferenciaAngular(puntoA.grado, puntoB.grado);

      let mejor: { tipo: AspectoSinastria["tipo"]; orbe: number } | null = null;
      for (const { tipo, angulo } of ANGULOS_ASPECTOS) {
        const orbe = Math.abs(diferencia - angulo);
        if (orbe <= ORBE_MAXIMO && (!mejor || orbe < mejor.orbe)) {
          mejor = { tipo, orbe };
        }
      }
      if (mejor) {
        aspectos.push({ cuerpoA: puntoA.cuerpo, cuerpoB: puntoB.cuerpo, ...mejor });
      }
    }
  }

  // Los aspectos más exactos (orbe chico) son los más significativos.
  return aspectos.sort((a, b) => a.orbe - b.orbe);
};
