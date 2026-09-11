import { useEffect, useState } from 'react';
import { FaRightFromBracket } from 'react-icons/fa6';
import { useNavigate } from 'react-router-dom';
import { clearSession, getStoredSession } from '../../api/auth';
import { fetchMyPayments } from '../../api/payments';
import { formatARS } from '../../utils/currency';
import Seo from '../../Components/Seo/Seo';

const statusLabels = {
  approved: { text: 'Confirmada', className: 'bg-green-100 text-green-800' },
  pending: { text: 'Pendiente', className: 'bg-amber-100 text-amber-800' },
  rejected: { text: 'Rechazada', className: 'bg-red-100 text-red-800' },
  cancelled: { text: 'Cancelada', className: 'bg-gray-100 text-gray-700' },
};

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';

const MiCuenta = () => {
  const navigate = useNavigate();
  const [session] = useState(() => getStoredSession());
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!session) {
      navigate('/login');
      return;
    }

    fetchMyPayments()
      .then(setPayments)
      .catch((requestError) => {
        setError(requestError.response?.data?.error || requestError.message);
      })
      .finally(() => setLoading(false));
  }, [navigate, session]);

  const signOut = () => {
    clearSession();
    navigate('/login');
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
          <div className='bg-white shadow-sm p-8 text-center'>
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
          <div className='space-y-3'>
            {payments.map((payment) => {
              const status = statusLabels[payment.status] || {
                text: payment.status,
                className: 'bg-gray-100 text-gray-700',
              };

              return (
                <div
                  key={payment._id}
                  className='bg-white shadow-sm p-5 flex items-center justify-between'
                >
                  <div>
                    <p className='text-purple-950 font-medium'>{payment.serviceTitle}</p>
                    <p className='text-sm text-gray-500'>{formatDate(payment.createdAt)}</p>
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
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
};

export default MiCuenta;
