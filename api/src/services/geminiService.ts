import { AspectoSinastria, CartaResumen, PersonaSinastria, TransitosDia } from "./astrologyService";

// Historial de esta constante (para no repetir la misma sorpresa):
// - gemini-3-flash-preview: devolvía 503 "high demand" seguido, por ser
//   modelo preview.
// - gemini-2.5-flash: Google lo discontinuó para API keys nuevas
//   ("no longer available to new users") — confirmado por el 404 real
//   que devolvió la API el 28/09/2026.
// - gemini-3.7-flash: funcionaba, pero con saturación frecuente (503) aun
//   con muy poco uso — es un modelo nuevo/muy pedido.
// - gemini-3.5-flash-lite como principal: estable (GA) y confiable, pero
//   el modelo "lite" sacrifica calidad de redacción (errores de
//   ortografía notados en producción el 02/10/2026).
// Se pasó gemini-3.6-flash a PRINCIPAL (también GA/estable, pero sin el
// recorte de calidad de la versión "lite") y gemini-3.5-flash-lite quedó
// como RESPALDO — da lo mejor de los dos mundos: mejor redacción cuando
// el principal responde, y igual hay red de seguridad si se satura.
const GEMINI_MODEL_PRINCIPAL = "gemini-3.6-flash";
const GEMINI_MODEL_RESPALDO = "gemini-3.5-flash-lite";

const urlModelo = (modelo: string) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent`;

export type InformeAstrologico = {
  titulo: string;
  interpretacion: string;
  consejo_practico: string[];
  disclaimer: string;
};

export type HoroscopoDiarioTexto = {
  titulo: string;
  texto: string;
  disclaimer: string;
};

export type SinastriaTexto = {
  titulo: string;
  texto: string;
  disclaimer: string;
};

const DISCLAIMER_LEGAL =
  "Aviso Legal: Esta aplicación ha sido creada exclusivamente con fines de entretenimiento y autoconocimiento. " +
  "El informe astrológico virtual y las respuestas de la Inteligencia Artificial se basan en interpretaciones " +
  "simbólicas y no constituyen, bajo ninguna circunstancia, asesoramiento médico, psicológico, financiero, legal " +
  "o profesional. Los creadores y propietarios de esta aplicación no se hacen responsables de las decisiones " +
  "tomadas por el usuario basadas en la información provista. El uso de la app queda bajo la total " +
  "responsabilidad del usuario.";

const esperar = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

type ErrorTemporal = { temporal: true; status: number };

// Un único intento contra un modelo puntual. No reintenta ni hace fallback
// acá adentro — eso lo maneja llamarGemini.
const intentarLlamada = async <T>(
  modelo: string,
  systemInstruction: string,
  userPrompt: string,
  responseSchema: object
): Promise<T | ErrorTemporal> => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY no está configurada.");
  }

  const body = {
    systemInstruction: { parts: [{ text: systemInstruction }] },
    contents: [{ role: "user", parts: [{ text: userPrompt }] }],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema,
    },
  };

  const response = await fetch(`${urlModelo(modelo)}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const detalle = await response.text();
    console.error(`[geminiService] ${modelo} respondió ${response.status}:`, detalle);

    if (response.status === 503 || response.status === 429) {
      return { temporal: true, status: response.status };
    }
    throw new Error("No pudimos generar el contenido en este momento. Probá de nuevo más tarde.");
  }

  const data = (await response.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };

  const texto = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!texto) {
    throw new Error("Gemini no devolvió contenido interpretable.");
  }

  return JSON.parse(texto) as T;
};

const esErrorTemporal = (valor: unknown): valor is ErrorTemporal =>
  typeof valor === "object" && valor !== null && (valor as ErrorTemporal).temporal === true;

// Reintenta el modelo PRINCIPAL hasta 3 veces con backoff exponencial
// (1s, 2s, 4s) ante 503/429 — la mayoría de las saturaciones de Gemini son
// transitorias y un segundo intento unos segundos después suele andar. Si
// se agotan los reintentos, prueba UNA vez con el modelo de RESPALDO antes
// de rendirse.
const llamarGemini = async <T>(
  systemInstruction: string,
  userPrompt: string,
  responseSchema: object
): Promise<T> => {
  const ESPERAS_MS = [1000, 2000, 4000];

  for (let intento = 0; intento <= ESPERAS_MS.length; intento++) {
    const resultado = await intentarLlamada<T>(
      GEMINI_MODEL_PRINCIPAL,
      systemInstruction,
      userPrompt,
      responseSchema
    );
    if (!esErrorTemporal(resultado)) return resultado;
    if (intento < ESPERAS_MS.length) await esperar(ESPERAS_MS[intento]);
  }

  console.error(
    `[geminiService] ${GEMINI_MODEL_PRINCIPAL} siguió saturado tras los reintentos, probando respaldo ${GEMINI_MODEL_RESPALDO}`
  );

  const resultadoRespaldo = await intentarLlamada<T>(
    GEMINI_MODEL_RESPALDO,
    systemInstruction,
    userPrompt,
    responseSchema
  );
  if (!esErrorTemporal(resultadoRespaldo)) return resultadoRespaldo;

  throw new Error("El servicio de IA está con mucha demanda en este momento. Probá de nuevo en un minuto.");
};

const SYSTEM_INSTRUCTION_INFORME =
  "Sos un astrólogo profesional que redacta informes personalizados en español rioplatense, cálido pero " +
  "profesional, sin promesas categóricas. Recibís datos de carta natal YA CALCULADOS (no los calcules vos) y " +
  "una pregunta del usuario. Si el ascendente o el tránsito de Saturno no están disponibles (hora de " +
  "nacimiento desconocida), no los menciones ni los inventes: basá la interpretación en lo que sí tenés. " +
  "Escribí 'interpretacion' en 2 o 3 párrafos cortos (separados por un salto de línea doble), no un solo " +
  "bloque largo — tiene que ser fácil de leer de un vistazo. 'consejo_practico' va en 2 o 3 ítems concretos y " +
  "accionables, cada uno una frase corta, sin numerarlos vos (el formato de lista lo pone el frontend).";

const RESPONSE_SCHEMA_INFORME = {
  type: "OBJECT",
  properties: {
    titulo: { type: "STRING" },
    interpretacion: { type: "STRING" },
    consejo_practico: { type: "ARRAY", items: { type: "STRING" } },
  },
  required: ["titulo", "interpretacion", "consejo_practico"],
};

const construirPromptUsuario = (carta: CartaResumen, pregunta: string): string => {
  const lineas = [`- Sol en ${carta.solSigno}`, `- Luna en ${carta.lunaSigno}`];

  if (carta.horaConocida && carta.ascendenteSigno) {
    lineas.push(`- Ascendente en ${carta.ascendenteSigno}`);
  }
  if (carta.horaConocida && carta.saturnoTransitandoCasa) {
    lineas.push(`- Tránsito actual relevante: Saturno transitando la casa ${carta.saturnoTransitandoCasa}`);
  }
  if (!carta.horaConocida) {
    lineas.push("- (Hora de nacimiento no provista: no hay ascendente ni casas disponibles)");
  }

  return `Datos de carta natal:\n${lineas.join("\n")}\n\nPregunta del usuario: "${pregunta}"`;
};

export const generarInformeConGemini = async (
  carta: CartaResumen,
  pregunta: string
): Promise<InformeAstrologico> => {
  const parcial = await llamarGemini<Omit<InformeAstrologico, "disclaimer">>(
    SYSTEM_INSTRUCTION_INFORME,
    construirPromptUsuario(carta, pregunta),
    RESPONSE_SCHEMA_INFORME
  );

  return { ...parcial, disclaimer: DISCLAIMER_LEGAL };
};

const SYSTEM_INSTRUCTION_HOROSCOPO =
  "Sos un astrólogo profesional que escribe horóscopos diarios breves y personalizados en español " +
  "rioplatense, cálidos, concretos y sin promesas categóricas. Recibís datos de carta natal y tránsitos de " +
  "HOY ya calculados (no los calcules vos). El texto tiene que sentirse específico de esta persona y de este " +
  "día puntual, no un horóscopo genérico de diario. Máximo 3 párrafos cortos.";

const RESPONSE_SCHEMA_HOROSCOPO = {
  type: "OBJECT",
  properties: {
    titulo: { type: "STRING" },
    texto: { type: "STRING" },
  },
  required: ["titulo", "texto"],
};

const construirPromptHoroscopo = (t: TransitosDia): string => {
  const lineas = [
    `- Sol natal en ${t.solSignoNatal}, Luna natal en ${t.lunaSignoNatal}`,
    `- Luna de hoy en ${t.lunaTransitoSigno}`,
  ];

  if (t.horaConocida) {
    if (t.lunaTransitandoCasa) lineas.push(`- La Luna de hoy transita la casa ${t.lunaTransitandoCasa}`);
    if (t.solTransitandoCasa) lineas.push(`- El Sol de hoy transita la casa ${t.solTransitandoCasa}`);
    if (t.saturnoTransitandoCasa) lineas.push(`- Saturno transita la casa ${t.saturnoTransitandoCasa}`);
  } else {
    lineas.push("- (Hora de nacimiento no provista: no hay casas disponibles, basate solo en signos)");
  }

  return `Tránsitos de hoy:\n${lineas.join("\n")}`;
};

export const generarHoroscopoDiarioConGemini = async (
  transitos: TransitosDia
): Promise<HoroscopoDiarioTexto> => {
  const parcial = await llamarGemini<Omit<HoroscopoDiarioTexto, "disclaimer">>(
    SYSTEM_INSTRUCTION_HOROSCOPO,
    construirPromptHoroscopo(transitos),
    RESPONSE_SCHEMA_HOROSCOPO
  );

  return { ...parcial, disclaimer: DISCLAIMER_LEGAL };
};

const SYSTEM_INSTRUCTION_SINASTRIA =
  "Sos un astrólogo profesional que interpreta sinastría (compatibilidad astrológica entre dos personas) en " +
  "español rioplatense, cálido y honesto — ni todo color de rosa ni alarmista. Recibís los signos de Sol, Luna, " +
  "Venus, Marte (y Ascendente si está disponible) de dos personas, y los aspectos astrológicos YA CALCULADOS " +
  "entre ambas cartas (no los calcules vos). Explicá qué dice la combinación sobre la dinámica entre ellos: " +
  "puntos de conexión natural y también tensiones a trabajar. No asumas que es una pareja romántica salvo que " +
  "se indique — puede ser cualquier tipo de vínculo.";

const RESPONSE_SCHEMA_SINASTRIA = {
  type: "OBJECT",
  properties: {
    titulo: { type: "STRING" },
    texto: { type: "STRING" },
  },
  required: ["titulo", "texto"],
};

const construirPromptSinastria = (
  personaA: PersonaSinastria,
  personaB: PersonaSinastria,
  aspectos: AspectoSinastria[]
): string => {
  const describirPersona = (p: PersonaSinastria) =>
    p.puntos.map((punto) => `${punto.cuerpo} en ${punto.signo}`).join(", ");

  const lineasAspectos =
    aspectos.length > 0
      ? aspectos
          .slice(0, 8)
          .map((a) => `- ${a.cuerpoA} (${personaA.nombre}) en ${a.tipo} con ${a.cuerpoB} (${personaB.nombre})`)
          .join("\n")
      : "- No hay aspectos mayores dentro del orbe estándar entre estos puntos.";

  return (
    `${personaA.nombre}: ${describirPersona(personaA)}\n` +
    `${personaB.nombre}: ${describirPersona(personaB)}\n\n` +
    `Aspectos entre ambas cartas:\n${lineasAspectos}`
  );
};

export const generarSinastriaConGemini = async (
  personaA: PersonaSinastria,
  personaB: PersonaSinastria,
  aspectos: AspectoSinastria[]
): Promise<SinastriaTexto> => {
  const parcial = await llamarGemini<Omit<SinastriaTexto, "disclaimer">>(
    SYSTEM_INSTRUCTION_SINASTRIA,
    construirPromptSinastria(personaA, personaB, aspectos),
    RESPONSE_SCHEMA_SINASTRIA
  );

  return { ...parcial, disclaimer: DISCLAIMER_LEGAL };
};