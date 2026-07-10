import { useEffect, useMemo, useState } from 'react';
import { FaPowerOff, FaSave, FaSearch } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { clearSession, getStoredSession } from '../../api/auth';
import { fetchAdminServices, updateAdminService } from '../../api/services';

const emptySelection = {
  _id: '',
  title: '',
  subtitle: '',
  slug: '',
  category: '',
  image: '',
  duration: '',
  modality: '',
  description: '',
  includes: '',
  active: true,
  order: 0,
  seoDescription: '',
};

const toServiceForm = (service) => ({
  _id: service._id,
  title: service.title || '',
  subtitle: service.subtitle || '',
  slug: service.slug || '',
  category: service.category || '',
  image: service.image || '',
  duration: service.duration || '',
  modality: service.modality || '',
  description: service.description || '',
  includes: service.includes?.join('\n') || '',
  active: Boolean(service.active),
  order: service.order || 0,
  seoDescription: service.seo?.description || '',
});

const AdminServices = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [form, setForm] = useState(emptySelection);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const session = getStoredSession();

    if (!session) {
      navigate('/login');
      return;
    }

    fetchAdminServices()
      .then((result) => {
        setServices(result);
        const firstService = result[0];

        if (firstService) {
          setSelectedId(firstService._id);
          setForm(toServiceForm(firstService));
        }
      })
      .catch((requestError) => {
        setError(requestError.response?.data?.error || requestError.message);
      });
  }, [navigate]);

  const filteredServices = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return services;

    return services.filter((service) =>
      [service.title, service.subtitle, service.slug, service.category]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(search))
    );
  }, [query, services]);

  const selectService = (service) => {
    setSelectedId(service._id);
    setStatus('');
    setError('');
    setForm(toServiceForm(service));
  };

  const updateField = (event) => {
    const { name, type, checked, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const saveService = async (event) => {
    event.preventDefault();
    setStatus('');
    setError('');

    try {
      const updatedService = await updateAdminService(selectedId, {
        title: form.title,
        subtitle: form.subtitle,
        slug: form.slug,
        category: form.category,
        image: form.image,
        duration: form.duration,
        modality: form.modality,
        description: form.description,
        includes: form.includes
          .split('\n')
          .map((item) => item.trim())
          .filter(Boolean),
        active: form.active,
        order: Number(form.order),
        seo: {
          description: form.seoDescription,
        },
      });

      setServices((current) =>
        current.map((service) => (service._id === updatedService._id ? updatedService : service))
      );
      selectService(updatedService);
      setStatus('Servicio actualizado.');
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
            <h1 className='text-3xl font-light text-purple-950'>Administrar servicios</h1>
            <p className='text-gray-600 mt-2'>
              Editá textos, estado y metadata de las consultas publicadas.
            </p>
          </div>

          <button
            type='button'
            onClick={signOut}
            className='inline-flex items-center justify-center gap-2 border border-purple-900 px-4 py-2 text-sm uppercase tracking-widest text-purple-900 hover:bg-purple-900 hover:text-white transition'
          >
            <FaPowerOff aria-hidden='true' />
            Salir
          </button>
        </div>

        <div className='grid lg:grid-cols-[320px_1fr] gap-8'>
          <aside className='bg-white shadow-sm p-5'>
            <label className='flex items-center gap-3 border border-purple-100 px-3 py-2 mb-5'>
              <FaSearch className='text-purple-800' aria-hidden='true' />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className='w-full outline-none text-sm'
                placeholder='Buscar servicio'
              />
            </label>

            <div className='space-y-2'>
              {filteredServices.map((service) => (
                <button
                  key={service._id}
                  type='button'
                  onClick={() => selectService(service)}
                  className={`w-full text-left px-4 py-3 border transition ${
                    selectedId === service._id
                      ? 'border-purple-800 bg-purple-50 text-purple-950'
                      : 'border-gray-100 hover:border-purple-200'
                  }`}
                >
                  <span className='block font-medium'>{service.title}</span>
                  <span className='block text-xs text-gray-500 mt-1'>{service.slug}</span>
                </button>
              ))}
            </div>
          </aside>

          <form onSubmit={saveService} className='bg-white shadow-sm p-6'>
            {error && <p className='mb-5 text-sm text-red-700'>{error}</p>}
            {status && <p className='mb-5 text-sm text-green-700'>{status}</p>}

            <div className='grid md:grid-cols-2 gap-5'>
              <label className='block'>
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
                <span className='text-sm text-gray-600'>Subtítulo</span>
                <input
                  name='subtitle'
                  value={form.subtitle}
                  onChange={updateField}
                  className='mt-1 w-full border border-gray-200 px-3 py-2'
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
                <span className='text-sm text-gray-600'>Duración</span>
                <input
                  name='duration'
                  value={form.duration}
                  onChange={updateField}
                  className='mt-1 w-full border border-gray-200 px-3 py-2'
                />
              </label>

              <label className='block'>
                <span className='text-sm text-gray-600'>Modalidad</span>
                <input
                  name='modality'
                  value={form.modality}
                  onChange={updateField}
                  className='mt-1 w-full border border-gray-200 px-3 py-2'
                />
              </label>

              <label className='block md:col-span-2'>
                <span className='text-sm text-gray-600'>Imagen</span>
                <input
                  name='image'
                  value={form.image}
                  onChange={updateField}
                  className='mt-1 w-full border border-gray-200 px-3 py-2'
                />
              </label>

              <label className='block md:col-span-2'>
                <span className='text-sm text-gray-600'>Descripción</span>
                <textarea
                  name='description'
                  value={form.description}
                  onChange={updateField}
                  className='mt-1 w-full border border-gray-200 px-3 py-2 min-h-44'
                  required
                />
              </label>

              <label className='block md:col-span-2'>
                <span className='text-sm text-gray-600'>Incluye</span>
                <textarea
                  name='includes'
                  value={form.includes}
                  onChange={updateField}
                  className='mt-1 w-full border border-gray-200 px-3 py-2 min-h-28'
                />
              </label>

              <label className='block md:col-span-2'>
                <span className='text-sm text-gray-600'>Descripción SEO</span>
                <textarea
                  name='seoDescription'
                  value={form.seoDescription}
                  onChange={updateField}
                  className='mt-1 w-full border border-gray-200 px-3 py-2 min-h-20'
                />
              </label>

              <label className='block'>
                <span className='text-sm text-gray-600'>Orden</span>
                <input
                  name='order'
                  type='number'
                  value={form.order}
                  onChange={updateField}
                  className='mt-1 w-full border border-gray-200 px-3 py-2'
                />
              </label>

              <label className='flex items-center gap-3 pt-7'>
                <input
                  name='active'
                  type='checkbox'
                  checked={form.active}
                  onChange={updateField}
                  className='h-5 w-5 accent-purple-800'
                />
                <span className='text-sm text-gray-700'>Publicado</span>
              </label>
            </div>

            <div className='mt-8'>
              <button
                type='submit'
                disabled={!selectedId}
                className='inline-flex items-center justify-center gap-2 bg-purple-800 text-white px-6 py-3 text-sm uppercase tracking-widest hover:bg-purple-950 transition disabled:opacity-50'
              >
                <FaSave aria-hidden='true' />
                Guardar cambios
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
};

export default AdminServices;
