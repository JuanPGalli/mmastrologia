import { CartaResumen } from "./astrologyService";

// Modelo elegido tras comparar calidad y costo con Claude (ver decisiones
// del proyecto): tiene tier gratuito confirmado. Al ser un modelo "preview",
// Google puede reemplazarlo — si eso pasa, este es el único lugar que hay
// que tocar.
const GEMINI_MODEL = "gemini-3-flash-preview";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

export type InformeAstrologico = {
  titulo: string;
  interpretacion: string;
  consejo_practico: string;
  disclaimer: string;
};

const DISCLAIMER_LEGAL =
  "Aviso Legal: Esta aplicación ha sido creada exclusivamente con fines de entretenimiento y autoconocimiento. " +
  "El informe astrológico virtual y las respuestas de la Inteligencia Artificial se basan en interpretaciones " +
  "simbólicas y no constituyen, bajo ninguna circunstancia, asesoramiento médico, psicológico, financiero, legal " +
  "o profesional. Los creadores y propietarios de esta aplicación no se hacen responsables de las decisiones " +
  "tomadas por el usuario basadas en la información provista. El uso de la app queda bajo la total " +
  "responsabilidad del usuario.";

const SYSTEM_INSTRUCTION =
  "Sos un astrólogo profesional que redacta informes personalizados en español rioplatense, cálido pero " +
  "profesional, sin promesas categóricas. Recibís datos de carta natal YA CALCULADOS (no los calcules vos) y " +
  "una pregunta del usuario. Si el ascendente o el tránsito de Saturno no están disponibles (hora de " +
  "nacimiento desconocida), no los menciones ni los inventes: basá la interpretación en lo que sí tenés.";

const RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    titulo: { type: "STRING" },
    interpretacion: { type: "STRING" },
    consejo_practico: { type: "STRING" },
  },
  required: ["titulo", "interpretacion", "consejo_practico"],
};

const construirPromptUsuario = (carta: CartaResumen, pregunta: string): string => {
  const lineas = [
    `- Sol en ${carta.solSigno}`,
    `- Luna en ${carta.lunaSigno}`,
  ];

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
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY no está configurada.");
  }

  const body = {
    systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
    contents: [{ role: "user", parts: [{ text: construirPromptUsuario(carta, pregunta) }] }],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: RESPONSE_SCHEMA,
    },
  };

  const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const detalle = await response.text();
    throw new Error(`Gemini respondió con error (${response.status}): ${detalle}`);
  }

  const data = (await response.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };

  const texto = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!texto) {
    throw new Error("Gemini no devolvió contenido interpretable.");
  }

  const parcial = JSON.parse(texto) as Omit<InformeAstrologico, "disclaimer">;

  // El disclaimer legal se agrega siempre acá, del lado del servidor — no
  // depende de que el modelo lo reproduzca fiel palabra por palabra.
  return { ...parcial, disclaimer: DISCLAIMER_LEGAL };
};
