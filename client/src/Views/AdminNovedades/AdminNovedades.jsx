import { useEffect, useMemo, useState } from 'react';
import { FaPlus, FaPowerOff, FaSave, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import ImageUploadField from '../../Components/ImageUploadField/ImageUploadField';
import { clearSession, getStoredSession } from '../../api/auth';
import {
  createAdminNovedad,
  deleteAdminNovedad,
  fetchAdminNovedades,
  updateAdminNovedad,
} from '../../api/novedades';

const toDateInput = (value) => (value ? new Date(value).toISOString().slice(0, 10) : '');

const emptyForm = {
  _id: '',
  title: '',
  description: '',
  image: '',
  location: '',
  startDate: '',
  endDate: '',
  instagramUrl: '',
  ctaText: '',
  ctaLink: '',
  active: true,
  order: 0,
};

const toNovedadForm = (novedad) => ({
  _id: novedad._id || '',
  title: novedad.title || '',
  description: novedad.description || '',
  image: novedad.image || '',
  location: novedad.location || '',
  startDate: toDateInput(novedad.startDate),
  endDate: toDateInput(novedad.endDate),
  instagramUrl: novedad.instagramUrl || '',
  ctaText: novedad.ctaText || '',
  ctaLink: novedad.ctaLink || '',
  active: novedad.active !== false,
  order: novedad.order || 0,
});

const AdminNovedades = () => {
  const navigate = useNavigate();
  const [novedades, setNovedades] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const loadNovedades = () =>
    fetchAdminNovedades()
      .then((result) => {
        setNovedades(result);
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

    loadNovedades();
  }, [navigate]);

  const sortedNovedades = useMemo(
    () => [...novedades].sort((a, b) => (a.order || 0) - (b.order || 0)),
    [novedades]
  );

  const selectNovedad = (novedad) => {
    setSelectedId(novedad._id);
    setStatus('');
    setError('');
    setForm(toNovedadForm(novedad));
  };

  const startNewNovedad = () => {
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
    }));
  };

  const buildPayload = () => ({
    title: form.title,
    description: form.description,
    image: form.image,
    location: form.location,
    startDate: form.startDate || undefined,
    endDate: form.endDate || undefined,
    instagramUrl: form.instagramUrl,
    ctaText: form.ctaText,
    ctaLink: form.ctaLink,
    active: form.active,
    order: Number(form.order) || 0,
  });

  const saveNovedad = async (event) => {
    event.preventDefault();
    setStatus('');
    setError('');
    setSaving(true);

    try {
      if (selectedId) {
        const updated = await updateAdminNovedad(selectedId, buildPayload());
        setNovedades((current) =>
          current.map((novedad) => (novedad._id === updated._id ? updated : novedad))
        );
        selectNovedad(updated);
        setStatus('Novedad actualizada.');
      } else {
        const created = await createAdminNovedad(buildPayload());
        const refreshed = await loadNovedades();
        const match = refreshed.find((novedad) => novedad._id === created._id) || created;
        selectNovedad(match);
        setStatus('Novedad creada.');
      }
    } catch (requestError) {
      setError(requestError.response?.data?.error || requestError.message);
    } finally {
      setSaving(false);
    }
  };

  const removeNovedad = async () => {
    if (!selectedId) return;

    const confirmation = await Swal.fire({
      title: '¿Eliminar novedad?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#6b21a8',
    });

    if (!confirmation.isConfirmed) return;

    try {
      await deleteAdminNovedad(selectedId);
      const refreshed = await loadNovedades();
      startNewNovedad();
      if (refreshed[0]) selectNovedad(refreshed[0]);
      setStatus('Novedad eliminada.');
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
            <h1 className='text-3xl font-light text-purple-950'>Administrar novedades</h1>
            <p className='text-gray-600 mt-2'>
              Anuncios cortos: ferias, apariciones, eventos puntuales. Se muestran en el Home
              mientras estén activas y no hayan vencido.
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
              onClick={startNewNovedad}
              className='w-full flex items-center justify-center gap-2 border border-purple-800 text-purple-800 px-3 py-2 mb-4 text-sm uppercase tracking-widest hover:bg-purple-800 hover:text-white transition'
            >
              <FaPlus aria-hidden='true' />
              Nueva novedad
            </button>

            <div className='space-y-2'>
              {sortedNovedades.map((novedad) => (
                <button
                  key={novedad._id}
                  type='button'
                  onClick={() => selectNovedad(novedad)}
                  className={`w-full text-left px-4 py-3 border transition ${
                    selectedId === novedad._id
                      ? 'border-purple-800 bg-purple-50 text-purple-950'
                      : 'border-gray-100 hover:border-purple-200'
                  }`}
                >
                  <span className='block font-medium'>{novedad.title}</span>
                  <span className='block text-xs text-gray-500 mt-1'>
                    {novedad.location || 'Sin ubicación'} {!novedad.active && '· inactiva'}
                  </span>
                </button>
              ))}

              {sortedNovedades.length === 0 && (
                <p className='text-sm text-gray-500'>Todavía no hay novedades cargadas.</p>
              )}
            </div>
          </aside>

          <form onSubmit={saveNovedad} className='bg-white shadow-sm p-6'>
            {error && <p className='mb-5 text-sm text-red-700'>{error}</p>}
            {status && <p className='mb-5 text-sm text-green-700'>{status}</p>}

            <div className='grid md:grid-cols-2 gap-5'>
              <label className='block md:col-span-2'>
                <span className='text-sm text-gray-600'>Título</span>
                <input
                  name='title'
                  value={form.title}
                  onChange={updateField}
                  placeholder='Voy a estar en La Rural'
                  className='mt-1 w-full border border-gray-200 px-3 py-2'
                  required
                />
              </label>

              <label className='block md:col-span-2'>
                <span className='text-sm text-gray-600'>Descripción</span>
                <textarea
                  name='description'
                  value={form.description}
                  onChange={updateField}
                  rows={3}
                  placeholder='Contá brevemente de qué se trata y qué van a encontrar ahí.'
                  className='mt-1 w-full border border-gray-200 px-3 py-2'
                  required
                />
              </label>

              <ImageUploadField
                name='image'
                value={form.image}
                onChange={updateField}
                label='Imagen'
              />

              <label className='block'>
                <span className='text-sm text-gray-600'>Ubicación</span>
                <input
                  name='location'
                  value={form.location}
                  onChange={updateField}
                  placeholder='La Rural, CABA'
                  className='mt-1 w-full border border-gray-200 px-3 py-2'
                />
              </label>

              <label className='block'>
                <span className='text-sm text-gray-600'>Desde</span>
                <input
                  type='date'
                  name='startDate'
                  value={form.startDate}
                  onChange={updateField}
                  className='mt-1 w-full border border-gray-200 px-3 py-2'
                />
              </label>

              <label className='block'>
                <span className='text-sm text-gray-600'>Hasta (se oculta sola al vencer)</span>
                <input
                  type='date'
                  name='endDate'
                  value={form.endDate}
                  onChange={updateField}
                  className='mt-1 w-full border border-gray-200 px-3 py-2'
                />
              </label>

              <label className='block'>
                <span className='text-sm text-gray-600'>Link al posteo de Instagram (opcional)</span>
                <input
                  name='instagramUrl'
                  value={form.instagramUrl}
                  onChange={updateField}
                  placeholder='https://instagram.com/p/...'
                  className='mt-1 w-full border border-gray-200 px-3 py-2'
                />
              </label>

              <label className='block'>
                <span className='text-sm text-gray-600'>Texto del botón (opcional)</span>
                <input
                  name='ctaText'
                  value={form.ctaText}
                  onChange={updateField}
                  placeholder='Agendá tu consulta'
                  className='mt-1 w-full border border-gray-200 px-3 py-2'
                />
              </label>

              <label className='block'>
                <span className='text-sm text-gray-600'>Link del botón (opcional)</span>
                <input
                  name='ctaLink'
                  value={form.ctaLink}
                  onChange={updateField}
                  placeholder='/agendar'
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
                  name='active'
                  checked={form.active}
                  onChange={updateField}
                />
                <span className='text-sm text-gray-600'>Activa</span>
              </label>
            </div>

            <div className='flex flex-wrap gap-3 mt-8'>
              <button
                type='submit'
                disabled={saving}
                className='inline-flex items-center gap-2 bg-purple-800 text-white px-6 py-2 text-sm uppercase tracking-widest hover:bg-purple-900 transition disabled:opacity-50'
              >
                <FaSave aria-hidden='true' />
                {saving ? 'Guardando...' : selectedId ? 'Guardar cambios' : 'Crear novedad'}
              </button>

              {selectedId && (
                <button
                  type='button'
                  onClick={removeNovedad}
                  className='inline-flex items-center gap-2 border border-red-600 text-red-600 px-6 py-2 text-sm uppercase tracking-widest hover:bg-red-600 hover:text-white transition'
                >
                  <FaTrash aria-hidden='true' />
                  Eliminar
                </button>
              )}
            </div>
          </form>
        </div>
      </section>
    </main>
  );
};

export default AdminNovedades;
