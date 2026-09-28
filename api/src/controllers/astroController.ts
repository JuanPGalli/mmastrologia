import { calcularCartaResumen, DatosNacimiento } from "../services/astrologyService";
import { generarInformeConGemini, InformeAstrologico } from "../services/geminiService";
import { ValidationError } from "../utils/errors";

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

const validarDatosNacimiento = (payload: InformePayload): DatosNacimiento => {
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
): Promise<InformeAstrologico> => {
  const datosNacimiento = validarDatosNacimiento(payload);
  const pregunta = (payload.pregunta as string).trim();

  const carta = calcularCartaResumen(datosNacimiento);
  return generarInformeConGemini(carta, pregunta);
};
