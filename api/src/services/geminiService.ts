import { CartaResumen } from "./astrologyService";

// Historial de esta constante (para no repetir la misma sorpresa):
// - gemini-3-flash-preview: devolvía 503 "high demand" seguido, por ser
//   modelo preview.
// - gemini-2.5-flash: Google lo discontinuó para API keys nuevas
//   ("no longer available to new users") — confirmado por el 404 real
//   que devolvió la API el 28/09/2026.
// Se pasó a gemini-3.7-flash: es el modelo que el propio mensaje de error
// de Google recomienda para reemplazar 2.5, y es la opción que Google
// describe como la elegida para cargas de trabajo "cost-first" en vez de
// gemini-3.8-flash (pensado para agentes de código de largo horizonte,
// no para generar un informe de texto corto).
// OJO: al momento de este cambio, Google viene recortando fuerte los
// límites del free tier (algunos modelos bajaron de ~1500 a 20
// requests/día sin aviso) y ya no publica los números en la
// documentación. Si esto se vuelve a romper, lo más robusto no es cambiar
// el modelo de nuevo sino activar facturación (billing) en el proyecto de
// Google Cloud vinculado a la API key — el costo real por informe sigue
// siendo una fracción de centavo, muy por debajo del riesgo de que el
// free tier se corte sin aviso otra vez.
const GEMINI_MODEL = "gemini-3.7-flash";
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
    // El detalle crudo de Gemini queda en los logs del servidor para
    // debug, pero al usuario final no le sirve ver un JSON de Google.
    console.error(`[geminiService] Gemini respondió ${response.status}:`, detalle);

    if (response.status === 503 || response.status === 429) {
      throw new Error(
        "El servicio de IA está con mucha demanda en este momento. Probá de nuevo en un minuto."
      );
    }
    throw new Error("No pudimos generar tu informe en este momento. Probá de nuevo más tarde.");
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
