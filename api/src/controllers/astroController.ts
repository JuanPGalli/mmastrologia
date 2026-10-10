import {
  calcularAspectosSinastria,
  calcularCartaResumen,
  calcularDatosRueda,
  calcularPuntosSinastria,
  calcularTransitosDelDia,
  CartaResumen,
  DatosNacimiento,
  DatosRueda,
} from "../services/astrologyService";
import { geocodificarLugar } from "../services/geocodingService";
import {
  generarHoroscopoDiarioConGemini,
  generarInformeConGemini,
  generarSinastriaConGemini,
  InformeAstrologico,
  SinastriaTexto,
} from "../services/geminiService";
import { ValidationError } from "../utils/errors";

export type InformePayload = {
  year?: unknown;
  month?: unknown;
  day?: unknown;
  hour?: unknown;
  minute?: unknown;
  horaDesconocida?: unknown;
  lugarNacimiento?: unknown;
  pregunta?: unknown;
};

const numeroValido = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

type DatosBase = Omit<DatosNacimiento, "latitude" | "longitude"> & {
  lugarNacimiento: string;
  pregunta: string;
};

const validarDatosBase = (payload: InformePayload): DatosBase => {
  const { year, month, day, hour, minute, lugarNacimiento, pregunta } = payload;
  const horaDesconocida = payload.horaDesconocida === true;

  if (!numeroValido(year) || !numeroValido(month) || !numeroValido(day)) {
    throw new ValidationError("Faltan la fecha de nacimiento (año, mes y día).");
  }
  if (typeof lugarNacimiento !== "string" || !lugarNacimiento.trim()) {
    throw new ValidationError("Falta el lugar de nacimiento.");
  }
  if (typeof pregunta !== "string" || pregunta.trim().length < 5) {
    throw new ValidationError("Contanos tu pregunta con un poco más de detalle.");
  }
  if (!horaDesconocida && (!numeroValido(hour) || !numeroValido(minute))) {
    throw new ValidationError("Falta la hora de nacimiento (o marcá que no la conocés).");
  }

  return {
    year,
    month,
    day,
    hour: horaDesconocida ? undefined : (hour as number),
    minute: horaDesconocida ? undefined : (minute as number),
    horaDesconocida,
    lugarNacimiento: lugarNacimiento.trim(),
    pregunta: pregunta.trim(),
  };
};

// Valida los datos Y geocodifica el lugar (texto libre, cualquier país) a
// coordenadas reales vía Nominatim.
const resolverDatos = async (payload: InformePayload) => {
  const { lugarNacimiento, pregunta, ...resto } = validarDatosBase(payload);
  const coordenadas = await geocodificarLugar(lugarNacimiento);
  const datos: DatosNacimiento = { ...resto, ...coordenadas };
  return { datos, lugarNacimiento, pregunta };
};

// Lo que se guarda como "entrada" de la consulta: sirve para mostrarle a la
// persona de QUÉ carta es el informe que está viendo.
export type EntradaInforme = {
  pregunta: string;
  lugarNacimiento: string;
  year: number;
  month: number;
  day: number;
  hour?: number;
  minute?: number;
  horaDesconocida: boolean;
};

export type ResultadoInforme = InformeAstrologico & {
  carta: CartaResumen;
  rueda: DatosRueda;
  horoscopo: { titulo: string; texto: string; fecha: string };
};

// UNA sola consulta integral: informe escrito + carta calculada + gráfico +
// horóscopo del día, todos calculados sobre LA MISMA carta (la de este
// pedido). Los dos textos de Gemini se piden en paralelo.
export const generarInformeAstrologico = async (
  payload: InformePayload,
  fecha: string
): Promise<{ entrada: EntradaInforme; resultado: ResultadoInforme }> => {
  const { datos, lugarNacimiento, pregunta } = await resolverDatos(payload);

  const carta = calcularCartaResumen(datos);
  const rueda = calcularDatosRueda(datos);
  const transitos = calcularTransitosDelDia(datos);

  const [informe, horoscopo] = await Promise.all([
    generarInformeConGemini(carta, pregunta),
    generarHoroscopoDiarioConGemini(transitos),
  ]);

  return {
    entrada: {
      pregunta,
      lugarNacimiento,
      year: datos.year,
      month: datos.month,
      day: datos.day,
      hour: datos.hour,
      minute: datos.minute,
      horaDesconocida: datos.horaDesconocida,
    },
    resultado: {
      ...informe,
      carta,
      rueda,
      horoscopo: { titulo: horoscopo.titulo, texto: horoscopo.texto, fecha },
    },
  };
};

export type SinastriaPayload = {
  personaA?: InformePayload & { nombre?: unknown };
  personaB?: InformePayload & { nombre?: unknown };
};

const validarPersonaSinastria = async (
  payload: SinastriaPayload["personaA"],
  etiqueta: string
): Promise<{ datos: DatosNacimiento; nombre: string }> => {
  if (!payload) {
    throw new ValidationError(`Faltan los datos de nacimiento de ${etiqueta}.`);
  }
  const nombre = typeof payload.nombre === "string" && payload.nombre.trim() ? payload.nombre.trim() : etiqueta;
  const { datos } = await resolverDatos({ ...payload, pregunta: "sinastría" });
  return { datos, nombre };
};

export const generarSinastria = async (
  payload: SinastriaPayload
): Promise<{
  entrada: { personaA: string; personaB: string };
  resultado: SinastriaTexto & {
    personaA: string;
    personaB: string;
    aspectos: ReturnType<typeof calcularAspectosSinastria>;
  };
}> => {
  const a = await validarPersonaSinastria(payload.personaA, "la primera persona");
  const b = await validarPersonaSinastria(payload.personaB, "la segunda persona");

  const puntosA = calcularPuntosSinastria(a.datos, a.nombre);
  const puntosB = calcularPuntosSinastria(b.datos, b.nombre);
  const aspectos = calcularAspectosSinastria(puntosA, puntosB);

  const interpretacion = await generarSinastriaConGemini(puntosA, puntosB, aspectos);

  return {
    entrada: { personaA: a.nombre, personaB: b.nombre },
    resultado: { ...interpretacion, personaA: a.nombre, personaB: b.nombre, aspectos },
  };
};
