import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import CTASection from '../../Components/CTASection/CTASection';
import { fetchPosts } from '../../api/posts';

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString('es-AR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

const Blog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get('page') || 1);
  const q = searchParams.get('q') || '';

  const [result, setResult] = useState(null);
  const [search, setSearch] = useState(q);

  useEffect(() => {
    let cancelled = false;

    fetchPosts({ page, q: q || undefined }).then((data) => {
      if (!cancelled) setResult(data);
    });

    return () => {
      cancelled = true;
    };
  }, [page, q]);

  const loading = result === null;
  const posts = result?.posts || [];
  const pagination = result?.pagination || { totalPages: 1 };

  const submitSearch = (event) => {
    event.preventDefault();
    setSearchParams(search.trim() ? { q: search.trim() } : {});
  };

  const goToPage = (nextPage) => {
    const params = {};
    if (q) params.q = q;
    if (nextPage > 1) params.page = String(nextPage);
    setSearchParams(params);
  };

  return (
    <main className='pt-32 bg-[#f7f3fb] min-h-screen'>
      <section className='max-w-5xl mx-auto px-6 text-center mb-12'>
        <h1 className='text-4xl font-light text-purple-900 mb-6'>Blog</h1>
        <p className='text-lg text-gray-700 mb-8'>
          Artículos sobre astrología, terapias holísticas y autoconocimiento para acompañar tu
          camino.
        </p>

        <form onSubmit={submitSearch} className='max-w-md mx-auto flex gap-2'>
          <input
            type='text'
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder='Buscar artículos...'
            className='flex-1 border border-purple-200 px-4 py-2 rounded focus:outline-none focus:border-purple-500'
          />
          <button
            type='submit'
            className='bg-purple-800 text-white px-6 py-2 rounded hover:bg-purple-900 transition'
          >
            Buscar
          </button>
        </form>
      </section>

      <section className='max-w-6xl mx-auto px-6'>
        {loading && <p className='text-center text-gray-500'>Cargando artículos...</p>}

        {!loading && posts.length === 0 && (
          <p className='text-center text-gray-500'>No encontramos artículos para tu búsqueda.</p>
        )}

        <div className='grid gap-10 md:grid-cols-3'>
          {posts.map((post) => (
            <article
              key={post.slug}
              className='bg-white shadow-md overflow-hidden hover:shadow-xl transition flex flex-col'
            >
              {post.image && (
                <img src={post.image} alt={post.title} className='w-full h-48 object-cover' />
              )}

              <div className='p-6 flex flex-col flex-1'>
                {post.category && (
                  <span className='text-xs uppercase tracking-widest text-purple-500 mb-2'>
                    {post.category}
                  </span>
                )}

                <h2 className='text-xl text-purple-800 mb-2'>{post.title}</h2>

                <p className='text-sm text-gray-400 mb-3'>{formatDate(post.publishedAt)}</p>

                <p className='text-gray-600 mb-6 flex-1'>{post.excerpt}</p>

                <Link
                  to={`/blog/${post.slug}`}
                  className='inline-block border border-purple-800 px-6 py-2 text-sm uppercase tracking-widest text-purple-800 hover:bg-purple-800 hover:text-white transition self-start'
                >
                  Leer más
                </Link>
              </div>
            </article>
          ))}
        </div>

        {pagination.totalPages > 1 && (
          <div className='flex justify-center items-center gap-4 mt-14'>
            <button
              type='button'
              disabled={page <= 1}
              onClick={() => goToPage(page - 1)}
              className='px-4 py-2 border border-purple-300 text-purple-800 disabled:opacity-30'
            >
              Anterior
            </button>

            <span className='text-gray-600 text-sm'>
              Página {pagination.page} de {pagination.totalPages}
            </span>

            <button
              type='button'
              disabled={page >= pagination.totalPages}
              onClick={() => goToPage(page + 1)}
              className='px-4 py-2 border border-purple-300 text-purple-800 disabled:opacity-30'
            >
              Siguiente
            </button>
          </div>
        )}
      </section>

      <CTASection
        title='¿Querés profundizar en tu propio proceso?'
        description='Cada consulta es un espacio de escucha, claridad y transformación personal.'
        primaryText='Reservar una consulta'
        primaryLink='/contact'
      />
    </main>
  );
};

export default Blog;
