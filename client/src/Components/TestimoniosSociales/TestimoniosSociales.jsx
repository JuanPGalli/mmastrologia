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

const TarjetaTestimonio = ({ t }) => {
  if (t.tipo === 'imagen') {
    return (
      <figure className='bg-white shadow-sm overflow-hidden'>
        <img src={t.imagen} alt={`Testimonio de ${t.nombre}`} className='w-full h-auto' loading='lazy' />
        <figcaption className='p-4 text-sm text-purple-800 text-center'>— {t.nombre}</figcaption>
      </figure>
    );
  }

  return (
    <blockquote className='bg-white p-8 shadow-sm text-left'>
      <p className='text-gray-700 italic mb-4'>“{t.texto}”</p>
      <footer className='text-sm text-purple-800'>
        — {t.nombre}
        {t.rol ? `, ${t.rol}` : ''}
      </footer>
    </blockquote>
  );
};

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

  // En desktop no hace falta carrusel: entran los tres lado a lado.
  if (isDesktop) {
    return (
      <div className='grid grid-cols-3 gap-6 items-start'>
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

  // Se renderiza SOLO el slide activo (no un riel con todos): así cada
  // tarjeta mide lo que le corresponde. Con un riel, todas las tarjetas
  // quedaban estiradas a la altura de la más alta (la cita escrita) y las
  // capturas se veían chicas y con un hueco blanco abajo.
  return (
    <div>
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
