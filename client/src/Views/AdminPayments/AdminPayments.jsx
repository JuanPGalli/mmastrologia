import { useEffect, useMemo, useState } from 'react';
import { FaPowerOff } from 'react-icons/fa6';
import { useNavigate } from 'react-router-dom';
import { clearSession, getStoredSession } from '../../api/auth';
import { fetchAdminPayments } from '../../api/payments';

const statusLabels = {
  approved: { text: 'Aprobado', className: 'bg-green-100 text-green-800' },
  pending: { text: 'Pendiente', className: 'bg-amber-100 text-amber-800' },
  rejected: { text: 'Rechazado', className: 'bg-red-100 text-red-800' },
  cancelled: { text: 'Cancelado', className: 'bg-gray-100 text-gray-700' },
};

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleString('es-AR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

const formatAmount = (amount, currency) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: currency || 'ARS' }).format(
    amount || 0
  );

const AdminPayments = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = getStoredSession();

    if (!session) {
      navigate('/login');
      return;
    }

    fetchAdminPayments()
      .then(setPayments)
      .catch((requestError) => {
        setError(requestError.response?.data?.error || requestError.message);
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  const filteredPayments = useMemo(() => {
    if (statusFilter === 'all') return payments;
    return payments.filter((payment) => payment.status === statusFilter);
  }, [payments, statusFilter]);

  const approvedTotal = useMemo(
    () =>
      payments
        .filter((payment) => payment.status === 'approved')
        .reduce((sum, payment) => sum + (payment.amount || 0), 0),
    [payments]
  );

  const signOut = () => {
    clearSession();
    navigate('/login');
  };

  return (
    <main className='pt-28 min-h-screen bg-[#f7f3fb]'>
      <section className='max-w-6xl mx-auto px-6 pb-16'>
        <div className='flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8'>
          <div>
            <h1 className='text-3xl font-light text-purple-950'>Pagos</h1>
            <p className='text-gray-600 mt-2'>
              {payments.filter((p) => p.status === 'approved').length} pagos aprobados · Total:{' '}
              {formatAmount(approvedTotal, 'ARS')}
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

        <div className='flex gap-2 mb-5'>
          {['all', 'approved', 'pending', 'rejected', 'cancelled'].map((option) => (
            <button
              key={option}
              type='button'
              onClick={() => setStatusFilter(option)}
              className={`px-3 py-1.5 text-sm border transition ${
                statusFilter === option
                  ? 'border-purple-800 bg-purple-800 text-white'
                  : 'border-gray-200 text-gray-600 hover:border-purple-300'
              }`}
            >
              {option === 'all' ? 'Todos' : statusLabels[option]?.text || option}
            </button>
          ))}
        </div>

        {error && <p className='text-sm text-red-700 mb-4'>{error}</p>}
        {loading && <p className='text-sm text-gray-500'>Cargando...</p>}

        {!loading && filteredPayments.length === 0 && (
          <p className='text-sm text-gray-500'>No hay pagos para mostrar.</p>
        )}

        {!loading && filteredPayments.length > 0 && (
          <div className='bg-white shadow-sm overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead className='bg-purple-50 text-left text-purple-900'>
                <tr>
                  <th className='px-4 py-3'>Fecha</th>
                  <th className='px-4 py-3'>Nombre</th>
                  <th className='px-4 py-3'>Email</th>
                  <th className='px-4 py-3'>Monto</th>
                  <th className='px-4 py-3'>Estado</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => {
                  const status = statusLabels[payment.status] || {
                    text: payment.status,
                    className: 'bg-gray-100 text-gray-700',
                  };

                  return (
                    <tr key={payment._id} className='border-t border-gray-100'>
                      <td className='px-4 py-3 whitespace-nowrap'>
                        {formatDate(payment.createdAt)}
                      </td>
                      <td className='px-4 py-3'>{payment.name}</td>
                      <td className='px-4 py-3'>{payment.email}</td>
                      <td className='px-4 py-3 whitespace-nowrap'>
                        {formatAmount(payment.amount, payment.currency)}
                      </td>
                      <td className='px-4 py-3'>
                        <span className={`px-2 py-1 rounded-full text-xs ${status.className}`}>
                          {status.text}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
};

export default AdminPayments;
