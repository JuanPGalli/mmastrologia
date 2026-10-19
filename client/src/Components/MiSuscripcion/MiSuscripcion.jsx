import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { cancelarSuscripcion, obtenerEstadoSuscripcion } from '../../api/suscripcion';

const formatearFecha = (iso) =>
  new Date(iso).toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'America/Argentina/Buenos_Aires',
  });

// Estado de la suscripción del Astrólogo Virtual dentro de "Mi cuenta", con
// la posibilidad de darla de baja desde el sitio.
const MiSuscripcion = () => {
  const [estado, setEstado] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [cancelando, setCancelando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelado = false;
    obtenerEstadoSuscripcion()
      .then((data) => {
        if (!cancelado) setEstado(data);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelado) setCargando(false);
      });
    return () => {
      cancelado = true;
    };
  }, []);

  const handleCancelar = async () => {
    const { isConfirmed } = await Swal.fire({
      title: '¿Cancelar tu suscripción?',
      text: `Seguís teniendo acceso hasta el ${formatearFecha(estado.vigenteHasta)}, que es hasta donde ya está pago. Después no se te vuelve a cobrar.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'No, mantenerla',
    });
    if (!isConfirmed) return;

    setCancelando(true);
    setError('');
    try {
      setEstado(await cancelarSuscripcion());
    } catch (requestError) {
      setError(requestError.response?.data?.error || requestError.message);
    } finally {
      setCancelando(false);
    }
  };

  if (cargando) return null;

  return (
    <div className='bg-white shadow-sm p-6 mb-10'>
      <h2 className='text-lg text-purple-900 mb-3'>Astrólogo Virtual</h2>

      {estado?.activa && estado.renueva && (
        <>
          <p className='text-gray-700 mb-1'>
            Suscripción <span className='font-medium text-green-700'>activa</span>. Se renueva el{' '}
            {formatearFecha(estado.vigenteHasta)}.
          </p>
          <button
            type='button'
            onClick={handleCancelar}
            disabled={cancelando}
            className='text-sm text-red-600 underline hover:text-red-700 disabled:opacity-60 cursor-pointer'
          >
            {cancelando ? 'Cancelando…' : 'Cancelar suscripción'}
          </button>
        </>
      )}

      {estado?.activa && !estado.renueva && (
        <p className='text-gray-700'>
          Suscripción <span className='font-medium'>cancelada</span>. Tenés acceso hasta el{' '}
          {formatearFecha(estado.vigenteHasta)}; no se te va a volver a cobrar.
        </p>
      )}

      {!estado?.activa && estado?.status === 'paused' && (
        <p className='text-gray-700'>
          Tu suscripción está <span className='font-medium text-amber-700'>pausada</span> por un problema con el
          pago. Revisá tu medio de pago en Mercado Pago o volvé a suscribirte desde el{' '}
          <Link to='/astrologo-virtual' className='text-purple-700 underline'>
            Astrólogo Virtual
          </Link>
          .
        </p>
      )}

      {!estado?.activa && estado?.status !== 'paused' && (
        <p className='text-gray-700'>
          No tenés una suscripción activa.{' '}
          <Link to='/astrologo-virtual' className='text-purple-700 underline'>
            Conocé el Astrólogo Virtual →
          </Link>
        </p>
      )}

      {error && <p className='text-sm text-red-600 mt-2'>{error}</p>}
    </div>
  );
};

export default MiSuscripcion;
