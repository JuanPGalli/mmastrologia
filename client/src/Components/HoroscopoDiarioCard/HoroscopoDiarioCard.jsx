import { useEffect, useState } from 'react';
import { FaSun } from 'react-icons/fa';
import { obtenerHoroscopoDiario } from '../../api/astro';
import RequiereSuscripcion from '../RequiereSuscripcion/RequiereSuscripcion';

// Estados: 'cargando' | 'listo' | 'sin-carta' (nunca generó un informe
// todavía, no hay nada que mostrar) | 'requiere-suscripcion' (ya usó la
// prueba gratis) | 'error' (falla técnica, no molestamos con esto acá)
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
      <div className='flex items-center gap-2 mb-2'>
        <FaSun className='text-yellow-300 text-xl' aria-hidden='true' />
        <p className='text-xs uppercase tracking-widest text-purple-200'>Tu horóscopo de hoy</p>
      </div>
      <h2 className='text-lg font-medium mb-2'>{horoscopo.titulo}</h2>
      <p className='text-purple-100 whitespace-pre-line'>{horoscopo.texto}</p>
    </div>
  );
};

export default HoroscopoDiarioCard;
