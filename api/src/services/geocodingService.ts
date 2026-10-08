// Geocoding con Nominatim (OpenStreetMap) — gratis, sin API key. Política de
// uso de Nominatim: requiere un User-Agent identificable (no uno genérico) y
// pide no mandar más de ~1 request/segundo, lo cual sobra para el volumen
// de esta app. Doc: https://operations.osmfoundation.org/policies/nominatim/
const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const USER_AGENT = "MMAstrologia/1.0 (contacto@mariamartagalli.com.ar)";

export type Coordenadas = { latitude: number; longitude: number };


export const geocodificarLugar = async (lugar: string): Promise<Coordenadas> => {
  const url = `${NOMINATIM_URL}?q=${encodeURIComponent(lugar)}&format=json&limit=1`;

  const response = await fetch(url, {
    headers: { "User-Agent": USER_AGENT },
  });

  if (!response.ok) {
    throw new Error("No pudimos verificar esa ciudad en este momento. Probá de nuevo en un rato.");
  }

  const resultados = (await response.json()) as { lat: string; lon: string }[];

  if (!resultados.length) {
    throw new Error(
      `No encontramos "${lugar}". Probá ser más específico (ej: "Río de Janeiro, Brasil" en vez de solo el barrio).`
    );
  }

  const { lat, lon } = resultados[0];
  return { latitude: parseFloat(lat), longitude: parseFloat(lon) };
};