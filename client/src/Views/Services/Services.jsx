/* import React from 'react';

 const Services = () => {
  let consultas = [
    'Astrologia',
    'Constelaciones familiares',
    'Registros Akashicos',
    'Reiki',
    'Lectura de Runas',
    'Lectura de Tarot',
  ];
  return (
    <ul className='pt-20'>
      {consultas.map((element, index) => (
        <li key={index}>{element}</li>
      ))}
    </ul>
  );
};

export default Services; */

import React from 'react';

const services = [
  {
    id: 'carta-natal',
    title: 'Carta Natal',
    description: 'Un mapa profundo de tu personalidad, potenciales y desafíos de vida.',
    image: '/services/carta-natal.jpg',
  },
  {
    id: 'revolucion-solar',
    title: 'Revolución Solar',
    description: 'Análisis del año personal que comienza en tu cumpleaños.',
    image: '/services/revolucion-solar.jpg',
  },
  {
    id: 'registros-akashicos',
    title: 'Registros Akáshicos',
    description: 'Lectura del alma para obtener claridad y sanación.',
    image: '/services/registros.jpg',
  },
  {
    id: 'reiki',
    title: 'Reiki',
    description: 'Armonización energética para cuerpo, mente y espíritu.',
    image: '/services/reiki.jpg',
  },
];

const Services = () => {
  return (
    <main className='pt-32 bg-[#f7f3fb]'>
      {/* Intro */}
      <section className='max-w-5xl mx-auto px-6 text-center mb-16'>
        <h1 className='text-4xl text-purple-900 font-light mb-6'>Consultas y acompañamientos</h1>
        <p className='text-gray-700 text-lg'>
          Cada consulta es un espacio personalizado de guía, autoconocimiento y transformación.
        </p>
      </section>

      {/* Grid */}
      <section className='max-w-6xl mx-auto px-6 grid gap-10 md:grid-cols-2'>
        {services.map((service) => (
          <article
            key={service.id}
            className='bg-white shadow-md overflow-hidden hover:shadow-xl transition'
          >
            <img src={service.image} alt={service.title} className='w-full h-56 object-cover' />

            <div className='p-6'>
              <h2 className='text-2xl text-purple-800 mb-3'>{service.title}</h2>
              <p className='text-gray-600 mb-6'>{service.description}</p>

              <a
                href={`/detail/${service.id}`}
                className='inline-block text-sm uppercase tracking-widest border border-purple-800 px-6 py-2 text-purple-800 hover:bg-purple-800 hover:text-white transition'
              >
                Ver detalle
              </a>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
};

export default Services;
