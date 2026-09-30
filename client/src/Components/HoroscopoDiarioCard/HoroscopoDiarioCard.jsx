import { useEffect, useState } from 'react';
import { FaSun } from 'react-icons/fa';
import { obtenerHoroscopoDiario } from '../../api/astro';

// Muestra el horóscopo del día si la persona ya tiene una carta guardada
// (se guarda sola la primera vez que genera un informe más abajo en esta
// misma página). Si todavía no la tiene, no molesta con un error — solo no
// muestra nada, ya que el formulario de abajo la va a generar.
const HoroscopoDiarioCard = () => {
  const [horoscopo, setHoroscopo] = useState(null);
  const [estado, setEstado] = useState('cargando'); // cargando | listo | sin-carta | error

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
        if (requestError.response?.status === 400) {
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
