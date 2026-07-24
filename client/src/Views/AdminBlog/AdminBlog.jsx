import { useEffect, useMemo, useState } from 'react';
import { FaPlus, FaPowerOff, FaSave, FaSearch, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { clearSession, getStoredSession } from '../../api/auth';
import {
  createAdminPost,
  deleteAdminComment,
  deleteAdminPost,
  fetchAdminPosts,
  updateAdminPost,
} from '../../api/posts';

const emptyForm = {
  _id: '',
  title: '',
  slug: '',
  category: '',
  image: '',
  author: 'María Marta Galli',
  excerpt: '',
  content: '',
  tags: '',
  published: true,
  order: 0,
  seoDescription: '',
  comments: [],
};

const toPostForm = (post) => ({
  _id: post._id || '',
  title: post.title || '',
  slug: post.slug || '',
  category: post.category || '',
  image: post.image || '',
  author: post.author || 'María Marta Galli',
  excerpt: post.excerpt || '',
  content: post.content || '',
  tags: post.tags?.join(', ') || '',
  published: post.published !== false,
  order: post.order || 0,
  seoDescription: post.seo?.description || '',
  comments: post.comments || [],
});

const slugify = (value) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const AdminBlog = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const loadPosts = () =>
    fetchAdminPosts()
      .then((result) => {
        setPosts(result);
        return result;
      })
      .catch((requestError) => {
        setError(requestError.response?.data?.error || requestError.message);
        return [];
      });

  useEffect(() => {
    const session = getStoredSession();

    if (!session) {
      navigate('/login');
      return;
    }

    loadPosts();
  }, [navigate]);

  const filteredPosts = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return posts;

    return posts.filter((post) =>
      [post.title, post.slug, post.category]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(search))
    );
  }, [query, posts]);

  const selectPost = (post) => {
    setSelectedId(post._id);
    setStatus('');
    setError('');
    setForm(toPostForm(post));
  };

  const startNewPost = () => {
    setSelectedId('');
    setStatus('');
    setError('');
    setForm(emptyForm);
  };

  const updateField = (event) => {
    const { name, type, checked, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
      ...(name === 'title' && !current._id && !current.slug
        ? { slug: slugify(value) }
        : {}),
    }));
  };

  const buildPayload = () => ({
    title: form.title,
    slug: form.slug || slugify(form.title),
    category: form.category,
    image: form.image,
    author: form.author,
    excerpt: form.excerpt,
    content: form.content,
    tags: form.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean),
    published: form.published,
    order: Number(form.order) || 0,
    seo: {
      description: form.seoDescription,
    },
  });

  const savePost = async (event) => {
    event.preventDefault();
    setStatus('');
    setError('');
    setSaving(true);

    try {
      if (selectedId) {
        const updatedPost = await updateAdminPost(selectedId, buildPayload());
        setPosts((current) =>
          current.map((post) => (post._id === updatedPost._id ? updatedPost : post))
        );
        selectPost(updatedPost);
        setStatus('Artículo actualizado.');
      } else {
        const createdPost = await createAdminPost(buildPayload());
        const refreshed = await loadPosts();
        const match = refreshed.find((post) => post._id === createdPost._id) || createdPost;
        selectPost(match);
        setStatus('Artículo creado.');
      }
    } catch (requestError) {
      setError(requestError.response?.data?.error || requestError.message);
    } finally {
      setSaving(false);
    }
  };

  const removePost = async () => {
    if (!selectedId) return;

    const confirmation = await Swal.fire({
      title: '¿Eliminar artículo?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#6b21a8',
    });

    if (!confirmation.isConfirmed) return;

    try {
      await deleteAdminPost(selectedId);
      const refreshed = await loadPosts();
      startNewPost();
      if (refreshed[0]) selectPost(refreshed[0]);
      setStatus('Artículo eliminado.');
    } catch (requestError) {
      setError(requestError.response?.data?.error || requestError.message);
    }
  };

  const removeComment = async (commentId) => {
    if (!selectedId) return;

    try {
      const updatedPost = await deleteAdminComment(selectedId, commentId);
      setForm((current) => ({ ...current, comments: updatedPost.comments }));
      setPosts((current) =>
        current.map((post) => (post._id === updatedPost._id ? updatedPost : post))
      );
    } catch (requestError) {
      setError(requestError.response?.data?.error || requestError.message);
    }
  };

  const signOut = () => {
    clearSession();
    navigate('/login');
  };

  return (
    <main className='pt-28 min-h-screen bg-[#f7f3fb]'>
      <section className='max-w-7xl mx-auto px-6 pb-16'>
        <div className='flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8'>
          <div>
            <h1 className='text-3xl font-light text-purple-950'>Administrar blog</h1>
            <p className='text-gray-600 mt-2'>
              Creá, editá y publicá artículos, y moderá los comentarios recibidos.
            </p>
          </div>

          <div className='flex items-center gap-3'>
            <button
              type='button'
              onClick={() => navigate('/admin')}
              className='text-sm text-purple-900 underline underline-offset-4 hover:text-purple-950'
            >
              ← Panel admin
            </button>
            <button
              type='button'
              onClick={signOut}
              className='inline-flex items-center justify-center gap-2 border border-purple-900 px-4 py-2 text-sm uppercase tracking-widest text-purple-900 hover:bg-purple-900 hover:text-white transition'
            >
              <FaPowerOff aria-hidden='true' />
              Salir
            </button>
          </div>
        </div>

        <div className='grid lg:grid-cols-[320px_1fr] gap-8'>
          <aside className='bg-white shadow-sm p-5'>
            <button
              type='button'
              onClick={startNewPost}
              className='w-full flex items-center justify-center gap-2 border border-purple-800 text-purple-800 px-3 py-2 mb-4 text-sm uppercase tracking-widest hover:bg-purple-800 hover:text-white transition'
            >
              <FaPlus aria-hidden='true' />
              Nuevo artículo
            </button>

            <label className='flex items-center gap-3 border border-purple-100 px-3 py-2 mb-5'>
              <FaSearch className='text-purple-800' aria-hidden='true' />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className='w-full outline-none text-sm'
                placeholder='Buscar artículo'
              />
            </label>

            <div className='space-y-2'>
              {filteredPosts.map((post) => (
                <button
                  key={post._id}
                  type='button'
                  onClick={() => selectPost(post)}
                  className={`w-full text-left px-4 py-3 border transition ${
                    selectedId === post._id
                      ? 'border-purple-800 bg-purple-50 text-purple-950'
                      : 'border-gray-100 hover:border-purple-200'
                  }`}
                >
                  <span className='block font-medium'>{post.title}</span>
                  <span className='block text-xs text-gray-500 mt-1'>
                    {post.slug} {!post.published && '· borrador'}
                  </span>
                </button>
              ))}
            </div>
          </aside>

          <form onSubmit={savePost} className='bg-white shadow-sm p-6'>
            {error && <p className='mb-5 text-sm text-red-700'>{error}</p>}
            {status && <p className='mb-5 text-sm text-green-700'>{status}</p>}

            <div className='grid md:grid-cols-2 gap-5'>
              <label className='block md:col-span-2'>
                <span className='text-sm text-gray-600'>Título</span>
                <input
                  name='title'
                  value={form.title}
                  onChange={updateField}
                  className='mt-1 w-full border border-gray-200 px-3 py-2'
                  required
                />
              </label>

              <label className='block'>
                <span className='text-sm text-gray-600'>Slug</span>
                <input
                  name='slug'
                  value={form.slug}
                  onChange={updateField}
                  className='mt-1 w-full border border-gray-200 px-3 py-2'
                  required
                />
              </label>

              <label className='block'>
                <span className='text-sm text-gray-600'>Categoría</span>
                <input
                  name='category'
                  value={form.category}
                  onChange={updateField}
                  className='mt-1 w-full border border-gray-200 px-3 py-2'
                />
              </label>

              <label className='block'>
                <span className='text-sm text-gray-600'>Autor/a</span>
                <input
                  name='author'
                  value={form.author}
                  onChange={updateField}
                  className='mt-1 w-full border border-gray-200 px-3 py-2'
                />
              </label>

              <label className='block'>
                <span className='text-sm text-gray-600'>Tags (separados por coma)</span>
                <input
                  name='tags'
                  value={form.tags}
                  onChange={updateField}
                  className='mt-1 w-full border border-gray-200 px-3 py-2'
                  placeholder='carta natal, astrología'
                />
              </label>

              <label className='block md:col-span-2'>
                <span className='text-sm text-gray-600'>Imagen destacada (URL)</span>
                <input
                  name='image'
                  value={form.image}
                  onChange={updateField}
                  className='mt-1 w-full border border-gray-200 px-3 py-2'
                  placeholder='https://...'
                />
              </label>

              <label className='block md:col-span-2'>
                <span className='text-sm text-gray-600'>Resumen (excerpt)</span>
                <textarea
                  name='excerpt'
                  value={form.excerpt}
                  onChange={updateField}
                  rows={2}
                  className='mt-1 w-full border border-gray-200 px-3 py-2'
                />
              </label>

              <label className='block md:col-span-2'>
                <span className='text-sm text-gray-600'>Contenido</span>
                <textarea
                  name='content'
                  value={form.content}
                  onChange={updateField}
                  rows={12}
                  className='mt-1 w-full border border-gray-200 px-3 py-2'
                  required
                />
              </label>

              <label className='block md:col-span-2'>
                <span className='text-sm text-gray-600'>Meta descripción SEO</span>
                <textarea
                  name='seoDescription'
                  value={form.seoDescription}
                  onChange={updateField}
                  rows={2}
                  className='mt-1 w-full border border-gray-200 px-3 py-2'
                />
              </label>

              <label className='block'>
                <span className='text-sm text-gray-600'>Orden</span>
                <input
                  type='number'
                  name='order'
                  value={form.order}
                  onChange={updateField}
                  className='mt-1 w-full border border-gray-200 px-3 py-2'
                />
              </label>

              <label className='flex items-center gap-2 mt-6'>
                <input
                  type='checkbox'
                  name='published'
                  checked={form.published}
                  onChange={updateField}
                />
                <span className='text-sm text-gray-600'>Publicado</span>
              </label>
            </div>

            <div className='flex flex-wrap gap-3 mt-8'>
              <button
                type='submit'
                disabled={saving}
                className='inline-flex items-center gap-2 bg-purple-800 text-white px-6 py-2 text-sm uppercase tracking-widest hover:bg-purple-900 transition disabled:opacity-50'
              >
                <FaSave aria-hidden='true' />
                {saving ? 'Guardando...' : selectedId ? 'Guardar cambios' : 'Crear artículo'}
              </button>

              {selectedId && (
                <button
                  type='button'
                  onClick={removePost}
                  className='inline-flex items-center gap-2 border border-red-600 text-red-600 px-6 py-2 text-sm uppercase tracking-widest hover:bg-red-600 hover:text-white transition'
                >
                  <FaTrash aria-hidden='true' />
                  Eliminar
                </button>
              )}
            </div>

            {selectedId && (
              <div className='mt-10 border-t border-purple-100 pt-6'>
                <h2 className='text-lg text-purple-900 mb-4'>
                  Comentarios ({form.comments.length})
                </h2>

                {form.comments.length === 0 && (
                  <p className='text-sm text-gray-500'>Todavía no hay comentarios.</p>
                )}

                <ul className='space-y-3'>
                  {form.comments.map((comment) => (
                    <li
                      key={comment._id}
                      className='flex items-start justify-between gap-4 bg-gray-50 p-4 text-sm'
                    >
                      <div>
                        <p className='font-medium text-purple-800'>{comment.name}</p>
                        <p className='text-gray-600'>{comment.text}</p>
                      </div>

                      <button
                        type='button'
                        onClick={() => removeComment(comment._id)}
                        className='text-red-600 hover:text-red-800 shrink-0'
                        title='Eliminar comentario'
                      >
                        <FaTrash aria-hidden='true' />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </form>
        </div>
      </section>
    </main>
  );
};

export default AdminBlog;
