import { useEffect, useState } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa6';

const TESTIMONIOS = [
  {
    tipo: 'imagen',
    nombre: 'Belu',
    imagen: 'https://res.cloudinary.com/ydsjcgim/image/upload/f_auto,q_auto/v1791392604/belu.jpg',
  },
  {
    tipo: 'imagen',
    nombre: 'Flori',
    imagen: 'https://res.cloudinary.com/ydsjcgim/image/upload/f_auto,q_auto/v1791392604/flori.jpg',
  },
  {
    tipo: 'texto',
    nombre: 'Paula C.',
    rol: 'Consultante Holística',
    texto:
      'Trabajar con Marie a través de las constelaciones, runas, tarot y reiki ha sido un antes y un ' +
      'después. Llegué en un momento muy complejo, cargando con mucha angustia y bloqueos profundos. En ' +
      'las sesiones logré aliviar tensiones físicas inmediatas, pero lo más hermoso fue el trabajo ' +
      'energético: me ayudó a restaurar mis proyectos, a soltar dinámicas del pasado vinculadas a mi clan ' +
      'familiar y a recuperar la calma. Es una guía maravillosa que te acompaña a encontrar resultados ' +
      'tangibles y alinearte en tu camino individual.',
  },
];

// TODAS las tarjetas comparten la misma proporción (9:16). Antes cada una
// medía lo que le pedía su contenido (las capturas una altura, la cita
// escrita otra), y al pasar de una a otra el carrusel "saltaba". Con una
// proporción fija, el alto es idéntico en desktop y mobile y no hay
// desprolijidad al deslizar.
const TarjetaTestimonio = ({ t }) => (
  <div className='aspect-9/16 w-full bg-white shadow-sm overflow-hidden flex flex-col'>
    {t.tipo === 'imagen' ? (
      <>
        <img
          src={t.imagen}
          alt={`Testimonio de ${t.nombre}`}
          className='flex-1 min-h-0 w-full object-cover object-top'
          loading='lazy'
        />
        <p className='shrink-0 p-3 text-sm text-purple-800 text-center'>— {t.nombre}</p>
      </>
    ) : (
      <blockquote className='flex-1 min-h-0 overflow-y-auto p-6 text-left flex flex-col'>
        <div className='my-auto'>
          <p className='text-gray-700 italic text-sm leading-relaxed mb-4'>“{t.texto}”</p>
          <footer className='text-sm text-purple-800'>
            — {t.nombre}
            {t.rol ? `, ${t.rol}` : ''}
          </footer>
        </div>
      </blockquote>
    )}
  </div>
);

const TestimoniosSociales = () => {
  const [index, setIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState(null);
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== 'undefined' && window.innerWidth >= 768
  );

  useEffect(() => {
    const mql = window.matchMedia('(min-width: 768px)');
    const handleChange = (e) => setIsDesktop(e.matches);
    mql.addEventListener('change', handleChange);
    return () => mql.removeEventListener('change', handleChange);
  }, []);

  const total = TESTIMONIOS.length;
  const siguiente = () => setIndex((i) => (i + 1) % total);
  const anterior = () => setIndex((i) => (i - 1 + total) % total);

  // Desktop: las tres tarjetas lado a lado, todas del mismo tamaño.
  if (isDesktop) {
    return (
      <div className='grid grid-cols-3 gap-6'>
        {TESTIMONIOS.map((t) => (
          <TarjetaTestimonio key={t.nombre} t={t} />
        ))}
      </div>
    );
  }

  // Swipe táctil: deslizar más de 50px cambia de testimonio.
  const handleTouchEnd = (e) => {
    if (touchStartX === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX;
    if (delta > 50) anterior();
    if (delta < -50) siguiente();
    setTouchStartX(null);
  };

  // Mobile: una tarjeta por vez. max-w-sm evita que en pantallas anchas
  // (tablets) la tarjeta 9:16 se vuelva gigante.
  return (
    <div className='max-w-sm mx-auto'>
      <div
        key={index}
        className='testimonio-fade'
        onTouchStart={(e) => setTouchStartX(e.touches[0].clientX)}
        onTouchEnd={handleTouchEnd}
      >
        <TarjetaTestimonio t={TESTIMONIOS[index]} />
      </div>

      <div className='flex items-center justify-center gap-4 mt-6'>
        <button
          type='button'
          onClick={anterior}
          aria-label='Testimonio anterior'
          className='bg-white shadow rounded-full p-2.5 text-purple-800 hover:bg-purple-50 cursor-pointer'
        >
          <FaChevronLeft size={14} />
        </button>

        <div className='flex gap-2'>
          {TESTIMONIOS.map((t, i) => (
            <button
              key={t.nombre}
              type='button'
              onClick={() => setIndex(i)}
              aria-label={`Ir al testimonio ${i + 1}`}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                i === index ? 'w-6 bg-purple-800' : 'w-2 bg-purple-200'
              }`}
            />
          ))}
        </div>

        <button
          type='button'
          onClick={siguiente}
          aria-label='Siguiente testimonio'
          className='bg-white shadow rounded-full p-2.5 text-purple-800 hover:bg-purple-50 cursor-pointer'
        >
          <FaChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};

export default TestimoniosSociales;
