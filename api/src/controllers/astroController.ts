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
import { User } from "../models/User";
import { HoroscopoDiario } from "../models/HoroscopoDiario";

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

type DatosBase = Omit<DatosNacimiento, "latitude" | "longitude"> & { lugarNacimiento: string };

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
  };
};

// Valida los datos Y geocodifica el lugar (texto libre, cualquier país) a
// coordenadas reales — así ya no depende de una lista fija de ciudades
// argentinas. Es async porque geocodificarLugar llama a un servicio externo
// (Nominatim/OpenStreetMap).
export const resolverDatosNacimiento = async (payload: InformePayload): Promise<DatosNacimiento> => {
  const base = validarDatosBase(payload);
  const { lugarNacimiento, ...resto } = base;
  const coordenadas = await geocodificarLugar(lugarNacimiento);
  return { ...resto, ...coordenadas };
};

export const generarInformeAstrologico = async (
  payload: InformePayload
): Promise<InformeAstrologico & { carta: CartaResumen; rueda: DatosRueda; datosNacimiento: DatosNacimiento }> => {
  const datosNacimiento = await resolverDatosNacimiento(payload);
  const pregunta = (payload.pregunta as string).trim();

  const carta = calcularCartaResumen(datosNacimiento);
  const rueda = calcularDatosRueda(datosNacimiento);
  const informe = await generarInformeConGemini(carta, pregunta);
  return { ...informe, carta, rueda, datosNacimiento };
};

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
      fecha: existente.fecha,
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

  return { ...horoscopo, fecha };
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
  const datos = await resolverDatosNacimiento({ ...payload, pregunta: "sinastría" });
  return { datos, nombre };
};

export const generarSinastria = async (
  payload: SinastriaPayload
): Promise<SinastriaTexto & { personaA: string; personaB: string; aspectos: ReturnType<typeof calcularAspectosSinastria> }> => {
  const a = await validarPersonaSinastria(payload.personaA, "la primera persona");
  const b = await validarPersonaSinastria(payload.personaB, "la segunda persona");

  const puntosA = calcularPuntosSinastria(a.datos, a.nombre);
  const puntosB = calcularPuntosSinastria(b.datos, b.nombre);
  const aspectos = calcularAspectosSinastria(puntosA, puntosB);

  const interpretacion = await generarSinastriaConGemini(puntosA, puntosB, aspectos);

  return { ...interpretacion, personaA: a.nombre, personaB: b.nombre, aspectos };
};
