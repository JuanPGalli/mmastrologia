import { useCallback, useEffect, useState } from 'react';
import { obtenerUltimaConsulta } from '../api/astro';
import { obtenerEstadoSuscripcion } from '../api/suscripcion';
import { hoyArgentina } from '../utils/fechas';

// Lógica común de Astrólogo Virtual y Sinastría: trae la última consulta
// guardada del tipo pedido y el estado de suscripción, y calcula si la
// persona puede generar una nueva (1 por día; admins sin límite; sin
// suscripción ni prueba gratis disponible, no).
export const useConsultaDiaria = (tipo, session) => {
  const [consulta, setConsulta] = useState(null);
  const [estado, setEstado] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (!session) return undefined;
    let cancelado = false;
    Promise.all([
      obtenerUltimaConsulta(tipo).catch(() => null),
      obtenerEstadoSuscripcion().catch(() => null),
    ]).then(([ultima, estadoSuscripcion]) => {
      if (cancelado) return;
      setConsulta(ultima);
      setEstado(estadoSuscripcion);
      setCargando(false);
    });
    return () => {
      cancelado = true;
    };
  }, [tipo, session]);

  const refrescarEstado = useCallback(() => {
    obtenerEstadoSuscripcion()
      .then(setEstado)
      .catch(() => {});
  }, []);

  const esAdmin = session?.user?.role === 'admin';
  const generoHoy = Boolean(consulta) && consulta.fecha === hoyArgentina();
  const sinAcceso = !esAdmin && Boolean(estado) && !estado.activa && estado.pruebaGratisUsada;
  const puedeGenerar = esAdmin || (!generoHoy && !sinAcceso);

  return { consulta, setConsulta, cargando, generoHoy, sinAcceso, puedeGenerar, refrescarEstado };
};
