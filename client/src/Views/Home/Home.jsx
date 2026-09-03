import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Reveal from '../../Components/Reveal/Reveal';
import NovedadesSection from '../../Components/NovedadesSection/NovedadesSection';
import CTASection from '../../Components/CTASection/CTASection';
import { fetchPosts } from '../../api/posts';
import { cloudinaryUrl } from '../../utils/cloudinary';
import testimonials from '../../data/testimonials';

const steps = [
  {
    title: '1. Contame tu momento',
    text: 'Me escribís por WhatsApp o el formulario de contacto y coordinamos día y horario para tu consulta.',
  },
  {
    title: '2. Nos encontramos',
    text: 'En la consulta trabajamos tu carta natal o la herramienta elegida, con escucha y sin apuro.',
  },
  {
    title: '3. Te llevás claridad',
    text: 'Salís con una lectura concreta de tu momento y, si querés, materiales para seguir profundizando.',
  },
];

const trustPoints = [
  'Astrología psicológica y evolutiva',
  'Enfoque personalizado, no genérico',
  'Espacio seguro y confidencial',
];

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString('es-AR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

const HERO_IMAGE =
  'https://res.cloudinary.com/ydsjcgim/image/upload/f_auto,q_auto,w_1600/v1788280251/mapa_astral.png';

const Home = () => {
  const [latestPosts, setLatestPosts] = useState([]);

  useEffect(() => {
    // Precarga la imagen del hero solo mientras estamos en el Home (evita el
    // warning de "preloaded but not used" en el resto de las páginas, ya que
    // este link vivía antes en index.html y se aplicaba a todo el sitio).
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = HERO_IMAGE;
    link.fetchPriority = 'high';
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    fetchPosts({ limit: 3 }).then((data) => {
      if (!cancelled) setLatestPosts(data?.posts || []);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main>
      {/* HERO */}
      <section
        className='relative min-h-screen flex items-center bg-cover bg-center'
        style={{
          backgroundImage: `url('${HERO_IMAGE}')`,
        }}
      >
        <div className='absolute inset-0 bg-linear-to-b from-black/70 via-purple-900/60 to-black/80' />

        <div className='relative z-10 max-w-4xl mx-auto px-6 text-center text-white'>
          <h1 className='text-4xl md:text-5xl font-light tracking-wide mb-6'>
            Astróloga y terapeuta holística
          </h1>

          <p className='text-lg md:text-xl mb-4 text-white/90'>
            María Marta Galli acompaña procesos de autoconocimiento y transformación personal a
            través de la astrología psicológica y herramientas energéticas.
          </p>

          <p className='text-base md:text-lg mb-10 text-white/80'>
            Un espacio de guía consciente para comprender los ciclos de vida y tomar decisiones con
            mayor claridad y conexión interior.
          </p>

          <div className='flex flex-col sm:flex-row items-center justify-center gap-4'>
            <Link
              to='/agendar'
              className='inline-block bg-white text-purple-900 px-8 py-3 uppercase tracking-widest text-sm font-medium hover:bg-purple-100 transition shadow-lg'
            >
              Reservá tu consulta
            </Link>

            <Link
              to='/about'
              className='inline-block border border-white px-8 py-3 uppercase tracking-widest text-sm hover:bg-white hover:text-purple-900 transition'
            >
              Conocé más sobre mí
            </Link>
          </div>
        </div>
      </section>

      {/* FRANJA DE CONFIANZA */}
      <Reveal as='section' className='bg-white py-10 border-b border-purple-100'>
        <div className='max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12 text-center'>
          {trustPoints.map((point) => (
            <p key={point} className='text-sm md:text-base text-purple-800'>
              {point}
            </p>
          ))}
        </div>
      </Reveal>

      <NovedadesSection />

      {/* SERVICIOS */}
      <Reveal as='section' className='bg-[#f7f3fb] py-20'>
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
            <Link
              to='/services'
              className='inline-block text-purple-900 border border-purple-900 px-8 py-3 uppercase tracking-widest text-sm hover:bg-purple-900 hover:text-white transition'
            >
              Ver todas las consultas
            </Link>
          </div>
        </div>
      </Reveal>

      {/* CÓMO ES UNA CONSULTA */}
      <Reveal as='section' className='py-20 bg-white'>
        <div className='max-w-5xl mx-auto px-6'>
          <h2 className='text-3xl text-center mb-4 text-purple-900 font-light'>
            ¿Nunca hiciste una consulta? Así es el proceso
          </h2>
          <p className='text-center text-gray-600 mb-12 max-w-2xl mx-auto'>
            Sin protocolos rígidos ni tecnicismos: un espacio pensado para que te sientas acompañada
            desde el primer contacto.
          </p>

          <div className='grid gap-10 md:grid-cols-3'>
            {steps.map((step, index) => (
              <Reveal key={step.title} delay={index * 120}>
                <div className='text-center px-4'>
                  <h3 className='text-lg text-purple-800 mb-3'>{step.title}</h3>
                  <p className='text-sm text-gray-600'>{step.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </Reveal>

      {/* TESTIMONIOS — solo se muestra si hay contenido real cargado */}
      {testimonials.length > 0 && (
        <Reveal as='section' className='bg-[#f7f3fb] py-20'>
          <div className='max-w-4xl mx-auto px-6 text-center'>
            <h2 className='text-3xl mb-12 text-purple-900 font-light'>
              Lo que cuentan quienes ya vinieron
            </h2>

            <div className='grid gap-8 md:grid-cols-2'>
              {testimonials.map((testimonial) => (
                <blockquote key={testimonial.name} className='bg-white p-8 shadow-sm text-left'>
                  <p className='text-gray-700 italic mb-4'>“{testimonial.quote}”</p>
                  <footer className='text-sm text-purple-800'>
                    — {testimonial.name}
                    {testimonial.detail ? `, ${testimonial.detail}` : ''}
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>
        </Reveal>
      )}

      {/* ÚLTIMOS ARTÍCULOS DEL BLOG */}
      {latestPosts.length > 0 && (
        <Reveal as='section' className='py-20 bg-white'>
          <div className='max-w-6xl mx-auto px-6'>
            <div className='flex items-center justify-between mb-12'>
              <h2 className='text-3xl text-purple-900 font-light'>Del blog</h2>
              <Link
                to='/blog'
                className='text-sm text-purple-800 underline underline-offset-4 hover:text-purple-950'
              >
                Ver todos los artículos
              </Link>
            </div>

            <div className='grid gap-8 md:grid-cols-3'>
              {latestPosts.map((post, index) => (
                <Reveal key={post.slug} delay={index * 120}>
                  <article className='bg-[#f7f3fb] shadow-sm overflow-hidden hover:shadow-md transition flex flex-col h-full'>
                    {post.image && (
                      <div className='aspect-video bg-[#f7f3fb]'>
                        <img
                          src={cloudinaryUrl(post.image, 'f_auto,q_auto,w_400')}
                          alt={post.title}
                          loading='lazy'
                          decoding='async'
                          className='w-full h-full object-cover'
                        />
                      </div>
                    )}
                    <div className='p-6 flex flex-col flex-1'>
                      <p className='text-xs text-gray-400 mb-2'>{formatDate(post.publishedAt)}</p>
                      <h3 className='text-lg text-purple-800 mb-3'>{post.title}</h3>
                      <p className='text-sm text-gray-600 mb-4 flex-1'>{post.excerpt}</p>
                      <Link
                        to={`/blog/${post.slug}`}
                        className='text-sm text-purple-900 underline underline-offset-4 hover:text-purple-950 self-start'
                      >
                        Leer más
                      </Link>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </Reveal>
      )}

      <CTASection
        title='¿Sentís que es momento de tomar claridad?'
        description='Reservá tu consulta y demos el primer paso juntas, a tu ritmo.'
        primaryText='Reservar una consulta'
        primaryLink='/agendar'
        secondaryText='Ver todas las consultas disponibles'
        secondaryLink='/services'
      />
    </main>
  );
};

export default Home;
