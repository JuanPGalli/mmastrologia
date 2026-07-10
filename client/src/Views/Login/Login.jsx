import { useState } from 'react';
import { FaLock, FaRightToBracket } from 'react-icons/fa6';
import { useNavigate } from 'react-router-dom';
import { login } from '../../api/auth';

const Login = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const updateField = (event) => {
    const { name, value } = event.target;
    setCredentials((current) => ({ ...current, [name]: value }));
  };

  const submitLogin = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(credentials);
      navigate('/admin/services');
    } catch (requestError) {
      setError(requestError.response?.data?.error || requestError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className='pt-28 min-h-screen bg-[#f7f3fb] flex items-start justify-center px-6'>
      <section className='w-full max-w-md bg-white shadow-sm p-8 mt-10'>
        <div className='flex items-center gap-3 mb-6'>
          <span className='inline-flex h-10 w-10 items-center justify-center bg-purple-900 text-white'>
            <FaLock aria-hidden='true' />
          </span>
          <div>
            <h1 className='text-2xl font-light text-purple-950'>Ingreso admin</h1>
            <p className='text-sm text-gray-600'>Acceso privado al panel de contenidos.</p>
          </div>
        </div>

        {error && <p className='mb-5 text-sm text-red-700'>{error}</p>}

        <form onSubmit={submitLogin} className='space-y-5'>
          <label className='block'>
            <span className='text-sm text-gray-600'>Email</span>
            <input
              name='email'
              type='email'
              value={credentials.email}
              onChange={updateField}
              className='mt-1 w-full border border-gray-200 px-3 py-2'
              required
            />
          </label>

          <label className='block'>
            <span className='text-sm text-gray-600'>Contraseña</span>
            <input
              name='password'
              type='password'
              value={credentials.password}
              onChange={updateField}
              className='mt-1 w-full border border-gray-200 px-3 py-2'
              required
            />
          </label>

          <button
            type='submit'
            disabled={loading}
            className='inline-flex w-full items-center justify-center gap-2 bg-purple-800 text-white px-6 py-3 text-sm uppercase tracking-widest hover:bg-purple-950 transition disabled:opacity-50'
          >
            <FaRightToBracket aria-hidden='true' />
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </section>
    </main>
  );
};

export default Login;
