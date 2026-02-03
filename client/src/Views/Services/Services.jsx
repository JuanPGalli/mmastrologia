import React from 'react';

const services = [
  {
    id: 'astrologia',
    title: 'Astrología',
    shortDescription:
      'Carta Natal, Revolución Solar y análisis de ciclos personales para el autoconocimiento.',
    image: '/services/astrologia.jpg',
  },
  {
    id: 'constelaciones-familiares',
    title: 'Constelaciones Familiares',
    shortDescription:
      'Un abordaje terapéutico para comprender y sanar dinámicas familiares profundas.',
    image: '/services/constelaciones.jpg',
  },
  {
    id: 'registros-akashicos',
    title: 'Registros Akáshicos',
    shortDescription:
      'Lecturas del alma que brindan claridad, comprensión y orientación espiritual.',
    image: '/services/registros.jpg',
  },
  {
    id: 'reiki',
    title: 'Reiki',
    shortDescription: 'Armonización energética para equilibrar cuerpo, mente y emociones.',
    image: '/services/reiki.jpg',
  },
  {
    id: 'lectura-de-runas',
    title: 'Lectura de Runas',
    shortDescription: 'Orientación simbólica ancestral para procesos de decisión y cambio.',
    image: '/services/runas.jpg',
  },
  {
    id: 'lectura-de-tarot',
    title: 'Lectura de Tarot',
    shortDescription: 'Una mirada profunda sobre el presente para tomar decisiones conscientes.',
    image: '/services/tarot.jpg',
  },
];

const Services = () => {
  return (
    <main className='pt-32 bg-[#f7f3fb] min-h-screen'>
      {/* Intro */}
      <section className='max-w-5xl mx-auto px-6 text-center mb-16'>
        <h1 className='text-4xl font-light text-purple-900 mb-6'>Consultas y acompañamientos</h1>
        <p className='text-lg text-gray-700'>
          Cada consulta es un espacio de escucha, guía y acompañamiento, adaptado a tu momento
          personal y proceso de vida.
        </p>
      </section>

      {/* Servicios */}
      <section className='max-w-6xl mx-auto px-6 grid gap-10 md:grid-cols-2'>
        {services.map((service) => (
          <article
            key={service.id}
            className='bg-white shadow-md overflow-hidden hover:shadow-xl transition'
          >
            <img src={service.image} alt={service.title} className='w-full h-56 object-cover' />

            <div className='p-6'>
              <h2 className='text-2xl text-purple-800 mb-3'>{service.title}</h2>

              <p className='text-gray-600 mb-6'>{service.shortDescription}</p>

              <a
                href={`/detail/${service.id}`}
                className='inline-block border border-purple-800 px-6 py-2 text-sm uppercase tracking-widest text-purple-800 hover:bg-purple-800 hover:text-white transition'
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
