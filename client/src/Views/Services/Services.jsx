import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import CTASection from '../../Components/CTASection/CTASection';
import { fetchServices, getFallbackServices } from '../../api/services';
import { cloudinaryUrl } from '../../utils/cloudinary';

const Services = () => {
  const [services, setServices] = useState(getFallbackServices());

  useEffect(() => {
    fetchServices().then(setServices);
  }, []);

  return (
    <main className='pt-32 bg-[#f7f3fb] min-h-screen'>
      <section className='max-w-5xl mx-auto px-6 text-center mb-16'>
        <h1 className='text-4xl font-light text-purple-900 mb-6'>Consultas y acompañamientos</h1>
        <p className='text-lg text-gray-700'>
          Cada consulta es un espacio de escucha, guía y acompañamiento, adaptado a tu momento
          personal y proceso de vida.
        </p>
      </section>

      <section className='max-w-6xl mx-auto px-6 grid gap-10 md:grid-cols-2'>
        {services.map((service) => (
          <article
            key={service.slug}
            className='bg-white shadow-md overflow-hidden hover:shadow-xl transition'
          >
            <div className='aspect-video bg-purple-50'>
              <img
                src={cloudinaryUrl(service.image, 'f_auto,q_auto,w_600')}
                alt={service.title}
                loading='lazy'
                decoding='async'
                className='w-full h-full object-cover'
              />
            </div>

            <div className='p-6'>
              <h2 className='text-2xl text-purple-800 mb-3'>{service.title}</h2>

              <p className='text-gray-600 mb-6'>{service.shortDescription}</p>

              <Link
                to={`/services/${service.slug}`}
                className='inline-block border border-purple-800 px-6 py-2 text-sm uppercase tracking-widest text-purple-800 hover:bg-purple-800 hover:text-white transition'
              >
                Ver detalle
              </Link>
            </div>
          </article>
        ))}
      </section>

      <CTASection
        title='Acompañamiento consciente para tu proceso personal'
        description='Cada consulta es un espacio de escucha, claridad y transformación. Si sentís que algo se repite, podemos trabajarlo conjuntamente.'
        primaryText='Reservar una consulta'
        primaryLink='/agendar'
        secondaryText='¿No sabés qué consulta elegir?'
        secondaryLink='/contact'
      />
    </main>
  );
};

export default Services;
