import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import { resetPassword } from '../../api/auth';
import Seo from '../../Components/Seo/Seo';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setLoading(true);

    try {
      await resetPassword({ email, token, password });
      Swal.fire({
        icon: 'success',
        title: 'Contraseña actualizada',
        text: 'Ya podés iniciar sesión con tu nueva contraseña.',
        confirmButtonColor: '#7c3aed',
      });
      navigate('/login');
    } catch (requestError) {
      setError(requestError.response?.data?.error || requestError.message);
    } finally {
      setLoading(false);
    }
  };

  if (!token || !email) {
    return (
      <main className='pt-36 min-h-screen bg-[#f7f3fb] flex items-start justify-center px-6'>
        <Seo title='Restablecer contraseña' noIndex />
        <section className='w-full max-w-md bg-white shadow-sm p-8 mt-10 text-center'>
          <p className='text-gray-600 mb-4'>Este link no es válido o ya venció.</p>
          <Link to='/forgot-password' className='text-purple-800 underline underline-offset-4'>
            Pedir un link nuevo
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className='pt-36 min-h-screen bg-[#f7f3fb] flex items-start justify-center px-6'>
      <Seo title='Restablecer contraseña' noIndex />
      <section className='w-full max-w-md bg-white shadow-sm p-8 mt-10'>
        <h1 className='text-2xl font-light text-purple-950 mb-6'>Nueva contraseña</h1>

        {error && <p className='mb-5 text-sm text-red-700'>{error}</p>}

        <form onSubmit={handleSubmit} className='space-y-5'>
          <label className='block'>
            <span className='text-sm text-gray-600'>Nueva contraseña</span>
            <input
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className='mt-1 w-full border border-gray-200 px-3 py-2'
              required
            />
          </label>

          <button
            type='submit'
            disabled={loading}
            className='w-full bg-purple-800 text-white px-6 py-3 text-sm uppercase tracking-widest hover:bg-purple-950 transition disabled:opacity-50'
          >
            {loading ? 'Guardando...' : 'Guardar nueva contraseña'}
          </button>
        </form>
      </section>
    </main>
  );
};

export default ResetPassword;
