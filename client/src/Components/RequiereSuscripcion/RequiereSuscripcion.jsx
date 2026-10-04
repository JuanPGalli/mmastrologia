import { useState } from 'react';
import { crearSuscripcion } from '../../api/suscripcion';

const RequiereSuscripcion = ({ mensaje }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSuscribirse = async () => {
    setLoading(true);
    setError('');
    try {
      const { initPoint } = await crearSuscripcion();
      window.location.href = initPoint;
    } catch (requestError) {
      setError(requestError.response?.data?.error || requestError.message);
      setLoading(false);
    }
  };

  return (
    <div className='bg-purple-50 border border-purple-200 rounded p-6 text-center space-y-3'>
      <p className='text-purple-900'>{mensaje}</p>
      <button
        type='button'
        onClick={handleSuscribirse}
        disabled={loading}
        className='bg-purple-800 text-white px-6 py-2 rounded-full text-sm hover:bg-purple-900 transition disabled:opacity-60'
      >
        {loading ? 'Redirigiendo a Mercado Pago…' : 'Suscribirme'}
      </button>
      {error && <p className='text-sm text-red-600'>{error}</p>}
    </div>
  );
};

export default RequiereSuscripcion;
