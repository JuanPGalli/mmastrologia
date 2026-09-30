import {
  calcularCartaResumen,
  calcularDatosRueda,
  calcularTransitosDelDia,
  CartaResumen,
  DatosNacimiento,
  DatosRueda,
} from "../services/astrologyService";
import {
  generarHoroscopoDiarioConGemini,
  generarInformeConGemini,
  InformeAstrologico,
} from "../services/geminiService";
import { ValidationError } from "../utils/errors";
import { User } from "../models/User";
import { HoroscopoDiario } from "../models/HoroscopoDiario";

export type InformePayload = {
  year?: unknown;
  month?: unknown;
  day?: unknown;
  hour?: unknown;
  minute?: unknown;
  horaDesconocida?: unknown;
  latitude?: unknown;
  longitude?: unknown;
  pregunta?: unknown;
};

const numeroValido = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

export const validarDatosNacimiento = (payload: InformePayload): DatosNacimiento => {
  const { year, month, day, hour, minute, latitude, longitude, pregunta } = payload;
  const horaDesconocida = payload.horaDesconocida === true;

  if (!numeroValido(year) || !numeroValido(month) || !numeroValido(day)) {
    throw new ValidationError("Faltan la fecha de nacimiento (año, mes y día).");
  }
  if (!numeroValido(latitude) || !numeroValido(longitude)) {
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
    latitude,
    longitude,
  };
};

export const generarInformeAstrologico = async (
  payload: InformePayload
): Promise<InformeAstrologico & { carta: CartaResumen; rueda: DatosRueda }> => {
  const datosNacimiento = validarDatosNacimiento(payload);
  const pregunta = (payload.pregunta as string).trim();

  const carta = calcularCartaResumen(datosNacimiento);
  const rueda = calcularDatosRueda(datosNacimiento);
  const informe = await generarInformeConGemini(carta, pregunta);
  return { ...informe, carta, rueda };
};

// Fecha de hoy en huso horario Argentina (no UTC), para que el horóscopo
// cambie a la medianoche real de Buenos Aires y no a las 21:00 (UTC-3).
const fechaDeHoyArgentina = (): string =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "America/Argentina/Buenos_Aires" }).format(new Date());

export const obtenerHoroscopoDiario = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user?.birthData) {
    throw new ValidationError(
      "Todavía no tenemos tu fecha de nacimiento guardada — generá primero un informe en el Astrólogo Virtual."
    );
  }

  const fecha = fechaDeHoyArgentina();

  const existente = await HoroscopoDiario.findOne({ userId, fecha });
  if (existente) {
    return {
      titulo: existente.titulo,
      texto: existente.texto,
      disclaimer: existente.disclaimer,
    };
  }

  const transitos = calcularTransitosDelDia(user.birthData);
  const horoscopo = await generarHoroscopoDiarioConGemini(transitos);

  await HoroscopoDiario.create({
    userId,
    fecha,
    titulo: horoscopo.titulo,
    texto: horoscopo.texto,
    disclaimer: horoscopo.disclaimer,
  });

  return horoscopo;
};
