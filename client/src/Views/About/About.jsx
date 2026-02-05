import React from 'react';

const About = () => {
  return (
    <main className='pt-32 bg-[#f7f3fb]'>
      {/* HERO */}
      <section className='max-w-5xl mx-auto px-6'>
        <div className='grid md:grid-cols-2 gap-12 items-center'>
          {/* Foto */}
          <div className='flex justify-center'>
            <img
              src='/images/about.png'
              alt='María Marta Galli – Astróloga y terapeuta holística'
              className='
                w-72 h-72
                rounded-full
                object-cover
                object-top
                shadow-lg
              '
            />
          </div>

          {/* Texto hero */}
          <div className='text-center md:text-left'>
            <h1 className='text-4xl md:text-5xl font-light text-purple-900 mb-6'>Sobre mí</h1>

            <p className='text-lg md:text-xl text-purple-800'>
              Acompaño procesos de autoconocimiento, transformación y búsqueda de sentido a través
              de la astrología y herramientas holísticas.
            </p>
          </div>
        </div>
      </section>

      {/* CONTENIDO */}
      <section className='max-w-4xl mx-auto px-6 mt-20 space-y-6 text-gray-700 text-lg'>
        <p>
          Soy <strong>María Marta Galli</strong>, astróloga y terapeuta holística. Desde hace años
          acompaño a personas que atraviesan momentos de cambio, crisis o búsqueda personal,
          ayudándolas a comprenderse mejor y tomar decisiones con mayor conciencia.
        </p>

        <p>
          Mi trabajo se basa en la astrología psicológica y evolutiva, entendida no como algo
          determinante, sino como un mapa simbólico que permite reconocer patrones, desafíos y
          potencialidades.
        </p>

        <p>
          Cada consulta es un espacio cuidado y personalizado. Integro la lectura astrológica, la
          escucha consciente y herramientas energéticas para brindar claridad y contención.
        </p>

        <p>
          Creo profundamente en la astrología como un camino de conciencia, crecimiento y
          transformación.
        </p>
      </section>

      {/* CTA */}
      <section className='mt-20 pb-20 text-center'>
        <h2 className='text-2xl text-purple-900 mb-4'>¿Querés una consulta personalizada?</h2>

        <p className='text-purple-700 mb-8'>Te invito a conocer las consultas disponibles.</p>

        <a
          href='/services'
          className='
            inline-block
            border border-purple-700
            text-purple-700
            px-8 py-3
            rounded-full
            hover:bg-purple-700
            hover:text-white
            transition
          '
        >
          Ver consultas disponibles
        </a>
      </section>
    </main>
  );
};

export default About;
