import { useEffect, useState } from 'react';
import { FaSun } from 'react-icons/fa';
import { obtenerHoroscopoDiario } from '../../api/astro';
import RequiereSuscripcion from '../RequiereSuscripcion/RequiereSuscripcion';

const formatearFecha = (fechaISO) => {
  // fechaISO viene como YYYY-MM-DD (huso Argentina, ver astroController.ts)
  const [year, month, day] = fechaISO.split('-').map(Number);
  const fecha = new Date(year, month - 1, day);
  return fecha.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });
};

const HoroscopoDiarioCard = () => {
  const [horoscopo, setHoroscopo] = useState(null);
  const [estado, setEstado] = useState('cargando');

  useEffect(() => {
    let cancelado = false;
    obtenerHoroscopoDiario()
      .then((data) => {
        if (cancelado) return;
        setHoroscopo(data);
        setEstado('listo');
      })
      .catch((requestError) => {
        if (cancelado) return;
        const status = requestError.response?.status;
        if (status === 402) {
          setEstado('requiere-suscripcion');
        } else if (status === 400) {
          setEstado('sin-carta');
        } else {
          setEstado('error');
        }
      });
    return () => {
      cancelado = true;
    };
  }, []);

  if (estado === 'cargando' || estado === 'sin-carta' || estado === 'error') return null;

  if (estado === 'requiere-suscripcion') {
    return (
      <div className='mb-8'>
        <RequiereSuscripcion mensaje='Tu horóscopo diario personalizado está disponible con la suscripción mensual.' />
      </div>
    );
  }

  return (
    <div className='bg-gradient-to-br from-purple-800 to-purple-950 text-white shadow-lg p-6 mb-8'>
      <div className='flex items-center justify-between gap-2 mb-2'>
        <div className='flex items-center gap-2'>
          <FaSun className='text-yellow-300 text-xl' aria-hidden='true' />
          <p className='text-xs uppercase tracking-widest text-purple-200'>Tu horóscopo de hoy</p>
        </div>
        {horoscopo.fecha && (
          <p className='text-xs text-purple-300 capitalize'>{formatearFecha(horoscopo.fecha)}</p>
        )}
      </div>
      <h2 className='text-lg font-medium mb-2'>{horoscopo.titulo}</h2>
      <p className='text-purple-100 whitespace-pre-line'>{horoscopo.texto}</p>
    </div>
  );
};

export default HoroscopoDiarioCard;
