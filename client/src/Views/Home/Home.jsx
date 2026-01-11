import React from 'react';
import './Home.css';

const Home = () => {
  return (
    <main>
      {/* HERO */}
      <section
        className='relative min-h-screen flex items-center bg-cover bg-center'
        style={{ backgroundImage: "url('/mapa_astral.png')" }}
      >
        {/* Overlay */}
        <div className='absolute inset-0 bg-gradient-to-b from-black/70 via-purple-900/60 to-black/80' />

        {/* Content */}
        <div className='relative z-10 max-w-4xl mx-auto px-6 text-center text-white'>
          <h1 className='text-4xl md:text-5xl font-light tracking-wide mb-6'>
            Astróloga y terapeuta holística
          </h1>

          <p className='text-lg md:text-xl mb-4 text-white/90'>
            María Marta Galli acompaña procesos de autoconocimiento y transformación personal a
            través de la astrología psicológica y herramientas energéticas.
          </p>

          <p className='text-base md:text-lg mb-8 text-white/80'>
            Un espacio de guía consciente para comprender los ciclos de vida y tomar decisiones con
            mayor claridad y conexión interior.
          </p>

          <a
            href='/about'
            className='inline-block border border-white px-8 py-3 uppercase tracking-widest text-sm hover:bg-white hover:text-purple-900 transition'
          >
            Conocé más sobre mí
          </a>
        </div>
      </section>

      {/* SERVICIOS */}
      <section className='bg-[#f7f3fb] py-20'>
        <div className='max-w-6xl mx-auto px-6'>
          <h2 className='text-3xl text-center mb-12 text-purple-900 font-light'>
            Consultas y acompañamientos
          </h2>

          <div className='grid gap-8 md:grid-cols-2 lg:grid-cols-4'>
            <div className='bg-white p-6 text-center shadow-sm'>
              <h3 className='text-lg mb-2 text-purple-800'>Astrología</h3>
              <p className='text-sm text-gray-600'>
                Carta natal, revolución solar y ciclos personales.
              </p>
            </div>

            <div className='bg-white p-6 text-center shadow-sm'>
              <h3 className='text-lg mb-2 text-purple-800'>Registros Akáshicos</h3>
              <p className='text-sm text-gray-600'>Lecturas del alma para claridad y sanación.</p>
            </div>

            <div className='bg-white p-6 text-center shadow-sm'>
              <h3 className='text-lg mb-2 text-purple-800'>Reiki</h3>
              <p className='text-sm text-gray-600'>Armonización energética integral.</p>
            </div>

            <div className='bg-white p-6 text-center shadow-sm'>
              <h3 className='text-lg mb-2 text-purple-800'>Tarot y Runas</h3>
              <p className='text-sm text-gray-600'>Orientación simbólica y espiritual.</p>
            </div>
          </div>

          <div className='text-center mt-12'>
            <a
              href='/services'
              className='inline-block text-purple-900 border border-purple-900 px-8 py-3 uppercase tracking-widest text-sm hover:bg-purple-900 hover:text-white transition'
            >
              Ver todas las consultas
            </a>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;
