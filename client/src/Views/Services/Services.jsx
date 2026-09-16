import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import CTASection from '../../Components/CTASection/CTASection';
import Seo from '../../Components/Seo/Seo';
import { fetchServices, getFallbackServices } from '../../api/services';
import { cloudinaryUrl } from '../../utils/cloudinary';
import { formatARS } from '../../utils/currency';
import { useFavorites } from '../../hooks/useFavorites';
import FavoriteButton from '../../Components/FavoriteButton/FavoriteButton';

const Services = () => {
  const [services, setServices] = useState(getFallbackServices());
  const { loggedIn, isFavorited, toggleFavorite } = useFavorites();

  useEffect(() => {
    fetchServices().then(setServices);
  }, []);

  return (
    <main className='pt-36 bg-[#f7f3fb] min-h-screen'>
      <Seo
        title='Consultas y Servicios'
        description='Carta natal, revolución solar, Reiki, tarot, runas y constelaciones familiares con María Marta Galli.'
        path='/services'
      />
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
            <div className='relative aspect-video bg-purple-50'>
              <img
                src={cloudinaryUrl(service.image, 'f_auto,q_auto,w_600')}
                alt={service.title}
                loading='lazy'
                decoding='async'
                className='w-full h-full object-cover'
              />
              <FavoriteButton
                active={isFavorited('service', service._id)}
                loggedIn={loggedIn}
                onToggle={() => toggleFavorite('service', service._id)}
                className='absolute top-3 right-3'
              />
            </div>

            <div className='p-6'>
              <h2 className='text-2xl text-purple-800 mb-3'>{service.title}</h2>

              <p className='text-gray-600 mb-3'>{service.shortDescription}</p>

              {service.price > 0 && (
                <p className='text-purple-900 font-medium mb-4'>{formatARS(service.price)}</p>
              )}

              <div className='flex flex-wrap gap-3'>
                <Link
                  to={`/services/${service.slug}`}
                  className='inline-block border border-purple-800 px-6 py-2 text-sm uppercase tracking-widest text-purple-800 hover:bg-purple-800 hover:text-white transition'
                >
                  Ver detalle
                </Link>

                {service.price > 0 && (
                  <Link
                    to={`/agendar?service=${service.slug}`}
                    className='inline-block bg-purple-800 px-6 py-2 text-sm uppercase tracking-widest text-white hover:bg-purple-900 transition'
                  >
                    Reservar
                  </Link>
                )}
              </div>
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
