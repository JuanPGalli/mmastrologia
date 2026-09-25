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
