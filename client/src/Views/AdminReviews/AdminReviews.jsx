import { useEffect, useState } from 'react';
import { FaCheck, FaPowerOff, FaTrash, FaXmark } from 'react-icons/fa6';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { clearSession, getStoredSession } from '../../api/auth';
import { deleteAdminReview, fetchAdminReviews, setReviewApproval } from '../../api/reviews';
import Seo from '../../Components/Seo/Seo';

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

const AdminReviews = () => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () =>
    fetchAdminReviews()
      .then(setReviews)
      .catch((requestError) => {
        setError(requestError.response?.data?.error || requestError.message);
      })
      .finally(() => setLoading(false));

  useEffect(() => {
    const session = getStoredSession();
    if (!session) {
      navigate('/login');
      return;
    }
    load();
  }, [navigate]);

  const toggleApproval = async (review) => {
    const updated = await setReviewApproval(review._id, !review.approved);
    setReviews((current) => current.map((r) => (r._id === updated._id ? updated : r)));
  };

  const remove = async (review) => {
    const confirmation = await Swal.fire({
      title: '¿Eliminar reseña?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#6b21a8',
    });
    if (!confirmation.isConfirmed) return;

    await deleteAdminReview(review._id);
    setReviews((current) => current.filter((r) => r._id !== review._id));
  };

  const signOut = () => {
    clearSession();
    navigate('/login');
  };

  return (
    <main className='pt-36 min-h-screen bg-[#f7f3fb]'>
      <Seo title='Administrar reseñas' noIndex />
      <section className='max-w-4xl mx-auto px-6 pb-16'>
        <div className='flex items-center justify-between mb-8'>
          <div>
            <h1 className='text-3xl font-light text-purple-950'>Reseñas</h1>
            <p className='text-gray-600 mt-2'>
              Las aprobadas se muestran en el Home. El resto queda oculto hasta que las revises.
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

        {error && <p className='text-sm text-red-700 mb-4'>{error}</p>}
        {loading && <p className='text-sm text-gray-500'>Cargando...</p>}

        {!loading && reviews.length === 0 && (
          <p className='text-sm text-gray-500'>Todavía no hay reseñas.</p>
        )}

        <div className='space-y-3'>
          {reviews.map((review) => (
            <div key={review._id} className='bg-white shadow-sm p-5'>
              <div className='flex items-start justify-between gap-4'>
                <div>
                  <p className='text-amber-500 text-sm mb-1'>{'★'.repeat(review.rating)}</p>
                  <p className='text-purple-950 font-medium'>
                    {review.name} — {review.serviceTitle}
                  </p>
                  <p className='text-xs text-gray-400 mb-2'>{formatDate(review.createdAt)}</p>
                  <p className='text-sm text-gray-700'>{review.text}</p>
                </div>

                <div className='flex items-center gap-2 shrink-0'>
                  <button
                    type='button'
                    onClick={() => toggleApproval(review)}
                    className={`h-9 w-9 inline-flex items-center justify-center rounded-full transition ${
                      review.approved
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-500 hover:bg-green-100 hover:text-green-700'
                    }`}
                    title={review.approved ? 'Aprobada (click para ocultar)' : 'Aprobar'}
                  >
                    <FaCheck aria-hidden='true' />
                  </button>
                  <button
                    type='button'
                    onClick={() => remove(review)}
                    className='h-9 w-9 inline-flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-red-100 hover:text-red-700 transition'
                    title='Eliminar'
                  >
                    <FaTrash aria-hidden='true' />
                  </button>
                </div>
              </div>

              {!review.approved && (
                <p className='text-xs text-amber-700 mt-2 flex items-center gap-1'>
                  <FaXmark aria-hidden='true' /> No visible en el Home todavía
                </p>
              )}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
};

export default AdminReviews;
