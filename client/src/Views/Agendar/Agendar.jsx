import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const CALENDLY_URL = import.meta.env.VITE_CALENDLY_URL;
const CALENDLY_SCRIPT_SRC = 'https://assets.calendly.com/assets/external/widget.js';

const Agendar = () => {
  const [scriptReady, setScriptReady] = useState(
    () => typeof window !== 'undefined' && Boolean(window.Calendly)
  );

  useEffect(() => {
    if (!CALENDLY_URL || scriptReady) return undefined;

    const existing = document.querySelector(`script[src="${CALENDLY_SCRIPT_SRC}"]`);
    if (existing) {
      existing.addEventListener('load', () => setScriptReady(true));
      return undefined;
    }

    const script = document.createElement('script');
    script.src = CALENDLY_SCRIPT_SRC;
    script.async = true;
    script.onload = () => setScriptReady(true);
    document.body.appendChild(script);

    return () => {
      // Dejamos el script cacheado para si el usuario vuelve a entrar a /agendar
    };
  }, [scriptReady]);

  return (
    <main className='pt-28 min-h-screen bg-[#f7f3fb]'>
      <section className='max-w-5xl mx-auto px-6 pb-16'>
        <h1 className='text-4xl font-light text-purple-900 mb-4 text-center'>
          Agendá tu consulta
        </h1>
        <p className='text-center text-gray-600 mb-10 max-w-2xl mx-auto'>
          Elegí el día y horario que mejor te quede. Vas a recibir la confirmación por email al
          instante.
        </p>

        {CALENDLY_URL ? (
          <div
            className='calendly-inline-widget bg-white shadow-md rounded-xl overflow-hidden'
            data-url={CALENDLY_URL}
            style={{ minWidth: '280px', height: '700px' }}
          />
        ) : (
          <div className='bg-white shadow-md rounded-xl p-10 text-center'>
            <p className='text-gray-600 mb-6'>
              La agenda online todavía no está disponible. Mientras tanto, escribime por el
              formulario de contacto y coordinamos día y horario.
            </p>
            <Link
              to='/contact'
              className='inline-block bg-purple-700 text-white px-8 py-3 rounded-full hover:bg-purple-800 transition'
            >
              Ir a contacto
            </Link>
          </div>
        )}
      </section>
    </main>
  );
};

export default Agendar;
