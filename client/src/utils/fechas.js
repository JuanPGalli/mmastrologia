// "Hoy" en huso horario Argentina (YYYY-MM-DD) — tiene que coincidir con el
// criterio del backend (api/src/utils/fechas.ts) para decidir si ya se usó
// la consulta del día.
export const hoyArgentina = () =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Argentina/Buenos_Aires' }).format(new Date());

// '2026-10-08' -> 'jueves, 8 de octubre'
export const formatearFechaLarga = (fechaISO) => {
  const [year, month, day] = fechaISO.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
};

export const formatearFechaCorta = (year, month, day) =>
  `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
