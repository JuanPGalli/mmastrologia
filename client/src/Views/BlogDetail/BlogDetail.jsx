import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { addComment, fetchPostBySlug } from '../../api/posts';

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString('es-AR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

const emptyForm = { name: '', email: '', text: '' };

const BlogDetail = () => {
  const { slug } = useParams();
  const [loaded, setLoaded] = useState({ slug: '', post: undefined });
  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadPost = () => {
    fetchPostBySlug(slug).then((result) => {
      setLoaded({ slug, post: result });
    });
  };

  useEffect(() => {
    loadPost();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const post = loaded.slug === slug ? loaded.post : undefined;

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const submitComment = async (event) => {
    event.preventDefault();
    setStatus('');
    setError('');

    if (!form.name.trim() || !form.text.trim()) {
      setError('Completá tu nombre y el comentario.');
      return;
    }

    setSubmitting(true);
    try {
      await addComment(slug, form);
      setForm(emptyForm);
      setStatus('¡Gracias por tu comentario!');
      loadPost();
    } catch (requestError) {
      setError(requestError.response?.data?.error || requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!post && loaded.slug !== slug) {
    return (
      <div className='pt-32 text-center'>
        <p className='text-gray-600'>Cargando artículo...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className='pt-32 text-center'>
        <h2 className='text-2xl'>Artículo no encontrado</h2>
        <Link to='/blog' className='text-purple-700 underline'>
          Volver al blog
        </Link>
      </div>
    );
  }

  const comments = post.comments?.filter((comment) => comment.approved !== false) || [];

  return (
    <main className='pt-32 bg-[#f7f3fb] min-h-screen'>
      <article className='max-w-3xl mx-auto px-6'>
        {post.category && (
          <span className='text-xs uppercase tracking-widest text-purple-500'>
            {post.category}
          </span>
        )}

        <h1 className='text-4xl font-light text-purple-900 mt-2 mb-4'>{post.title}</h1>

        <p className='text-sm text-gray-500 mb-8'>
          {post.author} · {formatDate(post.publishedAt)}
        </p>

        {post.image && (
          <img
            src={post.image}
            alt={post.title}
            fetchPriority='high'
            decoding='async'
            className='w-full max-h-96 object-cover rounded-lg shadow mb-10'
          />
        )}

        <div className='prose prose-purple max-w-none text-gray-700 leading-relaxed whitespace-pre-line mb-10'>
          {post.content}
        </div>

        {post.tags?.length > 0 && (
          <div className='flex flex-wrap gap-2 mb-14'>
            {post.tags.map((tag) => (
              <span
                key={tag}
                className='text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full'
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        <section className='border-t border-purple-100 pt-10'>
          <h2 className='text-2xl text-purple-900 mb-6'>
            Comentarios {comments.length > 0 && `(${comments.length})`}
          </h2>

          {comments.length === 0 && (
            <p className='text-gray-500 mb-8'>Sé la primera persona en comentar.</p>
          )}

          <ul className='space-y-6 mb-10'>
            {comments.map((comment) => (
              <li key={comment._id} className='bg-white p-5 rounded shadow-sm'>
                <p className='font-medium text-purple-800'>{comment.name}</p>
                <p className='text-xs text-gray-400 mb-2'>{formatDate(comment.createdAt)}</p>
                <p className='text-gray-700'>{comment.text}</p>
              </li>
            ))}
          </ul>

          <form onSubmit={submitComment} className='bg-white p-6 rounded shadow-sm space-y-4'>
            <h3 className='text-lg text-purple-800'>Dejá tu comentario</h3>

            {error && <p className='text-red-600 text-sm'>{error}</p>}
            {status && <p className='text-green-600 text-sm'>{status}</p>}

            <div className='grid md:grid-cols-2 gap-4'>
              <input
                type='text'
                name='name'
                value={form.name}
                onChange={updateField}
                placeholder='Tu nombre'
                className='border border-purple-200 px-4 py-2 rounded focus:outline-none focus:border-purple-500'
              />
              <input
                type='email'
                name='email'
                value={form.email}
                onChange={updateField}
                placeholder='Tu email (opcional)'
                className='border border-purple-200 px-4 py-2 rounded focus:outline-none focus:border-purple-500'
              />
            </div>

            <textarea
              name='text'
              value={form.text}
              onChange={updateField}
              placeholder='Escribí tu comentario...'
              rows={4}
              className='w-full border border-purple-200 px-4 py-2 rounded focus:outline-none focus:border-purple-500'
            />

            <button
              type='submit'
              disabled={submitting}
              className='bg-purple-800 text-white px-6 py-2 rounded hover:bg-purple-900 transition disabled:opacity-50'
            >
              {submitting ? 'Enviando...' : 'Comentar'}
            </button>
          </form>
        </section>
      </article>
    </main>
  );
};

export default BlogDetail;
