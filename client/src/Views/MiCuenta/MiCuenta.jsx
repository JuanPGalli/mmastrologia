import { useEffect, useState } from 'react';
import { FaHeart, FaRightFromBracket, FaStar } from 'react-icons/fa6';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { clearSession, getStoredSession } from '../../api/auth';
import { fetchMyPayments } from '../../api/payments';
import { fetchMyFavorites, removeFavorite } from '../../api/favorites';
import { submitReview } from '../../api/reviews';
import { formatARS } from '../../utils/currency';
import Seo from '../../Components/Seo/Seo';

const statusLabels = {
  approved: { text: 'Confirmada', className: 'bg-green-100 text-green-800' },
  pending: { text: 'Pendiente', className: 'bg-amber-100 text-amber-800' },
  rejected: { text: 'Rechazada', className: 'bg-red-100 text-red-800' },
  cancelled: { text: 'Cancelada', className: 'bg-gray-100 text-gray-700' },
};

const favoriteLink = (favorite) =>
  favorite.itemType === 'service' ? `/services/${favorite.itemSlug}` : `/blog/${favorite.itemSlug}`;

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';

const formatDateTime = (value) =>
  value
    ? new Date(value).toLocaleString('es-AR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

const MiCuenta = () => {
  const navigate = useNavigate();
  const [session] = useState(() => getStoredSession());
  const [payments, setPayments] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!session) {
      navigate('/login');
      return;
    }

    Promise.all([fetchMyPayments(), fetchMyFavorites()])
      .then(([paymentsData, favoritesData]) => {
        setPayments(paymentsData);
        setFavorites(favoritesData);
      })
      .catch((requestError) => {
        setError(requestError.response?.data?.error || requestError.message);
      })
      .finally(() => setLoading(false));
  }, [navigate, session]);

  const signOut = () => {
    clearSession();
    navigate('/login');
  };

  const handleUnfavorite = async (favoriteId) => {
    await removeFavorite(favoriteId);
    setFavorites((current) => current.filter((f) => f._id !== favoriteId));
  };

  const handleLeaveReview = async (payment) => {
    const { value: formValues } = await Swal.fire({
      title: `Reseñar "${payment.serviceTitle}"`,
      html:
        '<select id="swal-rating" class="swal2-select" style="display:block;width:100%;">' +
        '<option value="5">★★★★★ Excelente</option>' +
        '<option value="4">★★★★ Muy bueno</option>' +
        '<option value="3">★★★ Bueno</option>' +
        '<option value="2">★★ Regular</option>' +
        '<option value="1">★ Malo</option>' +
        '</select>' +
        '<textarea id="swal-text" class="swal2-textarea" placeholder="Contá tu experiencia..."></textarea>',
      confirmButtonText: 'Enviar reseña',
      confirmButtonColor: '#7c3aed',
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const rating = document.getElementById('swal-rating').value;
        const text = document.getElementById('swal-text').value.trim();
        if (!text) {
          Swal.showValidationMessage('Escribí un breve comentario.');
          return false;
        }
        return { rating: Number(rating), text };
      },
    });

    if (!formValues) return;

    try {
      await submitReview({
        serviceId: payment.serviceId,
        rating: formValues.rating,
        text: formValues.text,
      });
      Swal.fire({
        icon: 'success',
        title: '¡Gracias por tu reseña!',
        text: 'Va a mostrarse en la web una vez que sea revisada.',
        confirmButtonColor: '#7c3aed',
      });
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'No se pudo enviar',
        text: err.message,
        confirmButtonColor: '#7c3aed',
      });
    }
  };

  return (
    <main className='pt-36 min-h-screen bg-[#f7f3fb]'>
      <Seo title='Mi cuenta' noIndex />
      <section className='max-w-3xl mx-auto px-6 pb-16'>
        <div className='flex items-center justify-between mb-8'>
          <div>
            <h1 className='text-3xl font-light text-purple-950'>Mi cuenta</h1>
            {session && <p className='text-gray-600 mt-1'>{session.user.name}</p>}
          </div>

          <button
            type='button'
            onClick={signOut}
            className='inline-flex items-center gap-2 text-sm text-gray-600 hover:text-purple-900 transition'
          >
            <FaRightFromBracket aria-hidden='true' />
            Cerrar sesión
          </button>
        </div>

        <h2 className='text-lg text-purple-900 mb-4'>Tus consultas</h2>

        {error && <p className='text-sm text-red-700 mb-4'>{error}</p>}
        {loading && <p className='text-sm text-gray-500'>Cargando...</p>}

        {!loading && payments.length === 0 && (
          <div className='bg-white shadow-sm p-8 text-center mb-10'>
            <p className='text-gray-600 mb-4'>Todavía no reservaste ninguna consulta.</p>
            <a
              href='/services'
              className='inline-block bg-purple-800 text-white px-6 py-3 text-sm uppercase tracking-widest hover:bg-purple-900 transition'
            >
              Ver consultas
            </a>
          </div>
        )}

        {!loading && payments.length > 0 && (
          <div className='space-y-3 mb-10'>
            {payments.map((payment) => {
              const status = statusLabels[payment.status] || {
                text: payment.status,
                className: 'bg-gray-100 text-gray-700',
              };

              return (
                <div key={payment._id} className='bg-white shadow-sm p-5'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='text-purple-950 font-medium'>{payment.serviceTitle}</p>
                      <p className='text-sm text-gray-500'>
                        Comprada el {formatDate(payment.createdAt)}
                      </p>
                      {payment.scheduledAt && (
                        <p className='text-sm text-purple-700 mt-1'>
                          📅 Turno: {formatDateTime(payment.scheduledAt)}
                        </p>
                      )}
                    </div>
                    <div className='text-right'>
                      <p className='text-purple-900 font-medium mb-1'>
                        {formatARS(payment.amount)}
                      </p>
                      <span className={`px-2 py-1 rounded-full text-xs ${status.className}`}>
                        {status.text}
                      </span>
                    </div>
                  </div>

                  {payment.status === 'approved' && (
                    <button
                      type='button'
                      onClick={() => handleLeaveReview(payment)}
                      className='inline-flex items-center gap-2 text-sm text-purple-700 hover:text-purple-950 mt-3'
                    >
                      <FaStar aria-hidden='true' />
                      Dejar una reseña
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <h2 className='text-lg text-purple-900 mb-4'>Tus favoritos</h2>

        {!loading && favorites.length === 0 && (
          <p className='text-sm text-gray-500'>
            Todavía no marcaste nada como favorito. Buscá el ícono de corazón en servicios y
            artículos del blog.
          </p>
        )}

        {!loading && favorites.length > 0 && (
          <div className='space-y-2'>
            {favorites.map((favorite) => (
              <div
                key={favorite._id}
                className='bg-white shadow-sm p-4 flex items-center justify-between'
              >
                <Link
                  to={favoriteLink(favorite)}
                  className='text-purple-900 hover:text-purple-950 font-medium'
                >
                  {favorite.itemTitle}
                </Link>
                <button
                  type='button'
                  onClick={() => handleUnfavorite(favorite._id)}
                  aria-label='Quitar de favoritos'
                  className='text-red-500 hover:text-red-700'
                >
                  <FaHeart aria-hidden='true' />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
};

export default MiCuenta;
