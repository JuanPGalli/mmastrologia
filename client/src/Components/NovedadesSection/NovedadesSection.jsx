import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaInstagram, FaLocationDot } from 'react-icons/fa6';
import Reveal from '../Reveal/Reveal';
import { fetchNovedades } from '../../api/novedades';
import { cloudinaryUrl } from '../../utils/cloudinary';

const formatRange = (startDate, endDate) => {
  const opts = { day: 'numeric', month: 'long' };
  const start = startDate ? new Date(startDate).toLocaleDateString('es-AR', opts) : '';
  const end = endDate ? new Date(endDate).toLocaleDateString('es-AR', opts) : '';

  if (start && end && start !== end) return `${start} al ${end}`;
  return start || end || '';
};

const NovedadesSection = () => {
  const [novedades, setNovedades] = useState([]);

  useEffect(() => {
    let cancelled = false;

    fetchNovedades().then((data) => {
      if (!cancelled) setNovedades(data || []);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  if (novedades.length === 0) return null;

  const singleItem = novedades.length === 1;

  return (
    <Reveal as='section' className='bg-purple-950 py-16'>
      <div className='max-w-6xl mx-auto px-6'>
        <h2 className='text-white text-3xl md:text-4xl font-light mb-10 text-center'>
          Novedades
        </h2>

        <div className={`grid gap-6 ${singleItem ? 'max-w-3xl mx-auto' : 'lg:grid-cols-2'}`}>
          {novedades.map((novedad) => {
            const range = formatRange(novedad.startDate, novedad.endDate);

            return (
              <article
                key={novedad._id}
                className='bg-white overflow-hidden shadow-lg flex flex-col sm:flex-row'
              >
                {novedad.image && (
                  <div className='aspect-video sm:aspect-auto sm:w-2/5 sm:shrink-0 bg-purple-50'>
                    <img
                      src={cloudinaryUrl(novedad.image, 'f_auto,q_auto,w_500')}
                      alt={novedad.title}
                      loading='lazy'
                      decoding='async'
                      className='w-full h-full object-cover'
                    />
                  </div>
                )}

                <div className='p-6 flex flex-col flex-1'>
                  {(range || novedad.location) && (
                    <p className='text-xs uppercase tracking-widest text-purple-700 mb-2 flex items-center gap-1'>
                      {novedad.location && (
                        <>
                          <FaLocationDot aria-hidden='true' />
                          {novedad.location}
                        </>
                      )}
                      {range && novedad.location ? ' · ' : ''}
                      {range}
                    </p>
                  )}

                  <h3 className='text-xl text-purple-950 font-medium mb-2'>{novedad.title}</h3>
                  <p className='text-sm text-gray-600 mb-4 flex-1 whitespace-pre-line'>
                    {novedad.description}
                  </p>

                  <div className='flex items-center gap-4 mt-auto pt-2'>
                    {novedad.ctaText && novedad.ctaLink && (
                      <Link
                        to={novedad.ctaLink}
                        className='text-sm bg-purple-800 text-white px-4 py-2 rounded-full hover:bg-purple-900 transition'
                      >
                        {novedad.ctaText}
                      </Link>
                    )}

                    {novedad.instagramUrl && (
                      <a
                        href={novedad.instagramUrl}
                        target='_blank'
                        rel='noreferrer'
                        className='text-sm text-purple-700 hover:text-purple-900 inline-flex items-center gap-1'
                      >
                        <FaInstagram aria-hidden='true' />
                        Ver en Instagram
                      </a>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </Reveal>
  );
};

export default NovedadesSection;
