import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchServiceBySlug } from '../../api/services';

const Detail = () => {
  const { id } = useParams();
  const [loadedService, setLoadedService] = useState({
    slug: '',
    service: undefined,
  });

  useEffect(() => {
    fetchServiceBySlug(id).then((result) => {
      setLoadedService({ slug: id, service: result });
    });
  }, [id]);

  const service = loadedService.slug === id ? loadedService.service : undefined;

  if (!service && loadedService.slug !== id) {
    return (
      <div className='pt-32 text-center'>
        <p className='text-gray-600'>Cargando consulta...</p>
      </div>
    );
  }

  if (!service) {
    return (
      <div className='pt-32 text-center'>
        <h2 className='text-2xl'>Servicio no encontrado</h2>
        <Link to='/services' className='text-purple-700 underline'>
          Volver a consultas
        </Link>
      </div>
    );
  }

  return (
    <main className='pt-32'>
      <section className='max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-12'>
        <img
          src={service.image}
          alt={service.title}
          fetchPriority='high'
          decoding='async'
          className='rounded-lg shadow'
        />

        <div>
          <h1 className='text-4xl font-light text-purple-900 mb-4'>{service.title}</h1>

          <p className='text-lg text-purple-700 mb-6'>{service.subtitle}</p>

          <p className='text-gray-700 leading-relaxed mb-6'>{service.description}</p>

          <ul className='space-y-2 mb-6'>
            {service.includes?.map((item, index) => (
              <li key={index} className='text-gray-600'>
                • {item}
              </li>
            ))}
          </ul>

          <p className='text-sm text-gray-500'>⏱ Duración: {service.duration}</p>
          <p className='text-sm text-gray-500'>💻 Modalidad: {service.modality}</p>

          <a
            href='/contact'
            className='inline-block mt-8 bg-purple-700 text-white px-8 py-3 uppercase tracking-widest text-sm hover:bg-purple-900 transition'
          >
            Reservar consulta
          </a>
        </div>
      </section>
    </main>
  );
};

export default Detail;
