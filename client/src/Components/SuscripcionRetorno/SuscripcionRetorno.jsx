import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { sincronizarSuscripcion } from '../../api/suscripcion';

// Banner que aparece al volver de Mercado Pago (?suscripcion=ok). Consulta
// el estado real con el backend en vez de esperar al webhook, así la persona
// ve enseguida si quedó activa. Si el pago todavía no se acreditó, ofrece
// reintentar.
const SuscripcionRetorno = ({ onActualizado }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const vuelveDeMP = searchParams.get('suscripcion') === 'ok';
  const [fase, setFase] = useState(vuelveDeMP ? 'sincronizando' : null);

  useEffect(() => {
    if (!vuelveDeMP) return undefined;
    let cancelado = false;
    sincronizarSuscripcion()
      .then((estado) => {
        if (cancelado) return;
        setFase(estado.activa ? 'activa' : 'pendiente');
        if (estado.activa) setSearchParams({}, { replace: true });
        onActualizado?.();
      })
      .catch(() => {
        if (!cancelado) setFase('error');
      });
    return () => {
      cancelado = true;
    };
  }, [vuelveDeMP, onActualizado, setSearchParams]);

  const reintentar = () => {
    setFase('sincronizando');
    sincronizarSuscripcion()
      .then((estado) => {
        setFase(estado.activa ? 'activa' : 'pendiente');
        if (estado.activa) setSearchParams({}, { replace: true });
        onActualizado?.();
      })
      .catch(() => setFase('error'));
  };

  if (!fase) return null;

  const estilos = {
    sincronizando: 'bg-purple-50 border-purple-200 text-purple-900',
    activa: 'bg-green-50 border-green-200 text-green-900',
    pendiente: 'bg-amber-50 border-amber-200 text-amber-900',
    error: 'bg-red-50 border-red-200 text-red-800',
  };

  return (
    <div className={`border rounded p-4 mb-8 text-center text-sm space-y-2 ${estilos[fase]}`}>
      {fase === 'sincronizando' && <p>Confirmando tu suscripción con Mercado Pago…</p>}
      {fase === 'activa' && <p>¡Listo! Tu suscripción está activa. Ya podés generar tu informe diario.</p>}
      {fase === 'pendiente' && (
        <>
          <p>Todavía no vemos el pago confirmado. Mercado Pago puede demorar unos minutos en acreditarlo.</p>
          <button type='button' onClick={reintentar} className='underline cursor-pointer'>
            Actualizar estado
          </button>
        </>
      )}
      {fase === 'error' && (
        <>
          <p>No pudimos confirmar tu suscripción en este momento.</p>
          <button type='button' onClick={reintentar} className='underline cursor-pointer'>
            Probar de nuevo
          </button>
        </>
      )}
    </div>
  );
};

export default SuscripcionRetorno;
