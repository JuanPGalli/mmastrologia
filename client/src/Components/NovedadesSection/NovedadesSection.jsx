import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaInstagram, FaLocationDot, FaXmark } from 'react-icons/fa6';
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

const NovedadCard = ({ novedad, onExpand }) => {
  const range = formatRange(novedad.startDate, novedad.endDate);

  return (
    <article className='bg-white overflow-hidden shadow-lg'>
      {novedad.image && (
        <button
          type='button'
          onClick={() => onExpand(novedad)}
          className='block w-full aspect-video bg-purple-50 relative overflow-hidden'
        >
          <img
            src={cloudinaryUrl(novedad.image, 'f_auto,q_auto,w_100')}
            alt=''
            aria-hidden='true'
            className='absolute inset-0 w-full h-full object-cover scale-110 blur-xl opacity-70'
          />
          <img
            src={cloudinaryUrl(novedad.image, 'f_auto,q_auto,w_800')}
            alt={novedad.title}
            loading='lazy'
            decoding='async'
            className='relative w-full h-full object-contain'
          />
        </button>
      )}

      <div className='p-6'>
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
        <p className='text-sm text-gray-600 mb-2 whitespace-pre-line line-clamp-3'>
          {novedad.description}
        </p>
        <button
          type='button'
          onClick={() => onExpand(novedad)}
          className='text-sm text-purple-700 hover:text-purple-900 font-medium mb-4'
        >
          Ver más info
        </button>

        <div className='flex items-center gap-4'>
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
};

const NovedadModal = ({ novedad, onClose }) => {
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const range = formatRange(novedad.startDate, novedad.endDate);

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-purple-950/60 backdrop-blur-sm'
      onClick={onClose}
    >
      <div
        className='bg-white max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl relative'
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type='button'
          onClick={onClose}
          aria-label='Cerrar'
          className='absolute top-3 right-3 bg-white/90 rounded-full p-2 text-purple-950 hover:bg-white shadow'
        >
          <FaXmark aria-hidden='true' />
        </button>

        {novedad.image && (
          <img
            src={cloudinaryUrl(novedad.image, 'f_auto,q_auto,w_800')}
            alt={novedad.title}
            className='w-full max-h-[45vh] object-contain bg-purple-50'
          />
        )}

        <div className='p-6'>
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

          <h3 className='text-xl text-purple-950 font-medium mb-3'>{novedad.title}</h3>
          <p className='text-sm text-gray-700 whitespace-pre-line mb-4'>{novedad.description}</p>

          <div className='flex items-center gap-4'>
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
      </div>
    </div>
  );
};

const NovedadesSection = () => {
  const [novedades, setNovedades] = useState([]);
  const [expanded, setExpanded] = useState(null);

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

  return (
    <Reveal as='section' className='bg-purple-950 py-16'>
      <div className='max-w-2xl mx-auto px-6'>
        <h2 className='text-white text-3xl md:text-4xl font-light mb-10 text-center'>
          Novedades
        </h2>

        <div className='space-y-6'>
          {novedades.map((novedad) => (
            <NovedadCard key={novedad._id} novedad={novedad} onExpand={setExpanded} />
          ))}
        </div>
      </div>

      {expanded && <NovedadModal novedad={expanded} onClose={() => setExpanded(null)} />}
    </Reveal>
  );
};

export default NovedadesSection;
