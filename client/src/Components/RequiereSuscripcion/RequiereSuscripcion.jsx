import { useState } from 'react';
import { crearSuscripcion } from '../../api/suscripcion';
import { getStoredSession } from '../../api/auth';

const RequiereSuscripcion = ({ mensaje }) => {
  // Mercado Pago valida que el email de la cuenta con la que se paga coincida
  // con el que le mandamos: si no coincide, rechaza el pago. Por eso se
  // pregunta (con el email de la cuenta del sitio como sugerencia).
  const [email, setEmail] = useState(() => getStoredSession()?.user?.email ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSuscribirse = async () => {
    if (loading) return;
    setLoading(true);
    setError('');
    try {
      const { initPoint } = await crearSuscripcion(email.trim());
      window.location.href = initPoint;
    } catch (requestError) {
      setError(requestError.response?.data?.error || requestError.message);
      setLoading(false);
    }
  };

  return (
    <div className='bg-purple-50 border border-purple-200 rounded p-6 text-center space-y-3'>
      <p className='text-purple-900'>{mensaje}</p>
      <div className='max-w-sm mx-auto text-left'>
        <label htmlFor='mp-email' className='block text-sm font-medium text-purple-900 mb-1'>
          Email de tu cuenta de Mercado Pago
        </label>
        <input
          id='mp-email'
          type='email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className='w-full border border-purple-200 bg-white rounded px-3 py-2 text-sm'
          placeholder='tu@email.com'
          required
        />
        <p className='text-xs text-gray-500 mt-1'>
          Tiene que ser el mismo con el que ingresás a Mercado Pago; si no coincide, el pago se rechaza.
        </p>
      </div>
      <button
        type='button'
        onClick={handleSuscribirse}
        disabled={loading || !email.trim()}
        className='bg-purple-800 text-white px-6 py-2 rounded-full text-sm hover:bg-purple-900 transition disabled:opacity-60 cursor-pointer'
      >
        {loading ? 'Redirigiendo a Mercado Pago…' : 'Suscribirme'}
      </button>
      {error && <p className='text-sm text-red-600'>{error}</p>}
    </div>
  );
};

export default RequiereSuscripcion;
