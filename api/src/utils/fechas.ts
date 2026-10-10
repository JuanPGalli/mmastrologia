// Fecha de hoy (YYYY-MM-DD) en huso horario Argentina, no UTC — así el "día"
// de cada consulta cambia a la medianoche real de Buenos Aires y no a las
// 21:00 (UTC-3).
export const fechaDeHoyArgentina = (): string =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "America/Argentina/Buenos_Aires" }).format(new Date());
