import { Horoscope, Origin } from "circular-natal-horoscope-js";

export type DatosNacimiento = {
  year: number;
  month: number; // 1-12 (como lo manda el formulario), se convierte a 0-indexado acá adentro
  day: number;
  hour?: number;
  minute?: number;
  horaDesconocida: boolean;
  latitude: number;
  longitude: number;
};

type ArgsHoroscopio = {
  year: number;
  month: number; // 0-indexado, para pasarlo directo a Origin
  day: number;
  hour: number;
  minute: number;
  latitude: number;
  longitude: number;
};

export type HoroscopeHouse = {
  ChartPosition: {
    StartPosition: { Ecliptic: { DecimalDegrees: number } };
    EndPosition: { Ecliptic: { DecimalDegrees: number } };
  };
};

const construirHoroscopio = (args: ArgsHoroscopio) => {
  const origin = new Origin({
    year: args.year,
    month: args.month,
    date: args.day,
    hour: args.hour,
    minute: args.minute,
    latitude: args.latitude,
    longitude: args.longitude,
  });

  return new Horoscope({
    origin,
    houseSystem: "placidus",
    zodiac: "tropical",
    language: "en",
  });
};

// Busca en qué casa cae un grado eclíptico, manejando el caso de la casa que
// cruza 0°/360° (ej. casa 9 suele ir de ~330° a ~6°).
const casaQueContieneGrado = (houses: HoroscopeHouse[], grado: number): number | null => {
  for (let i = 0; i < houses.length; i++) {
    const start = houses[i].ChartPosition.StartPosition.Ecliptic.DecimalDegrees;
    const end = houses[i].ChartPosition.EndPosition.Ecliptic.DecimalDegrees;
    if (start < end) {
      if (grado >= start && grado < end) return i + 1;
    } else {
      if (grado >= start || grado < end) return i + 1;
    }
  }
  return null;
};

export type CartaResumen = {
  solSigno: string;
  lunaSigno: string;
  ascendenteSigno?: string;
  saturnoTransitandoCasa?: number | null;
  horaConocida: boolean;
};

export const calcularCartaResumen = (datos: DatosNacimiento): CartaResumen => {
  // Sin hora exacta no se puede calcular el ascendente ni las casas de forma
  // confiable — se usa mediodía solo como valor neutro para que Sol/Luna
  // salgan bien (su signo no depende de la hora exacta del día).
  const horaConocida = !datos.horaDesconocida;
  const hour = horaConocida ? (datos.hour ?? 12) : 12;
  const minute = horaConocida ? (datos.minute ?? 0) : 0;

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

  if (!horaConocida) {
    return { solSigno, lunaSigno, horaConocida: false };
  }

  const ascendenteSigno: string = natal.Angles.ascendant.Sign.label;

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

// ---- Horóscopo diario (tránsitos del día) ----

export type TransitosDia = {
  solSignoNatal: string;
  lunaSignoNatal: string;
  lunaTransitoSigno: string;
  lunaTransitandoCasa: number | null;
  solTransitandoCasa: number | null;
  saturnoTransitandoCasa: number | null;
  horaConocida: boolean;
};

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

// ---- Carta natal visual (datos para la rueda SVG) ----

export type PuntoRueda = { nombre: string; signo: string; grado: number };

export type DatosRueda = {
  ascendenteGrado: number | null;
  casas: number[] | null;
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

type CelestialBody = { Sign: { label: string }; ChartPosition: { Ecliptic: { DecimalDegrees: number } } };

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
  const ascendenteGrado = casas[0];

  return { ascendenteGrado, casas, planetas, horaConocida: true };
};

// ---- Sinastría (compatibilidad entre dos cartas) ----

export type PuntoSinastria = { cuerpo: string; signo: string; grado: number };
export type PersonaSinastria = { nombre: string; puntos: PuntoSinastria[]; horaConocida: boolean };

export type AspectoSinastria = {
  cuerpoA: string;
  cuerpoB: string;
  tipo: "conjunción" | "sextil" | "cuadratura" | "trígono" | "oposición";
  orbe: number;
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
const ORBE_MAXIMO = 6;

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

  return aspectos.sort((a, b) => a.orbe - b.orbe);
};
