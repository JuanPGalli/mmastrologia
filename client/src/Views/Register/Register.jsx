import { useState } from 'react';
import { FaUserPlus } from 'react-icons/fa6';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { login, register } from '../../api/auth';
import GoogleSignInButton from '../../Components/GoogleSignInButton/GoogleSignInButton';
import Seo from '../../Components/Seo/Seo';

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const updateField = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submitRegister = async (event) => {
    event.preventDefault();
    setError('');

    if (form.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setLoading(true);

    try {
      await register(form);
      await login({ email: form.email, password: form.password });
      navigate('/cuenta');
    } catch (requestError) {
      setError(requestError.response?.data?.error || requestError.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = () => navigate('/cuenta');

  const handleGoogleError = (err) => {
    Swal.fire({
      icon: 'error',
      title: 'No se pudo registrar con Google',
      text: err.message,
      confirmButtonColor: '#7c3aed',
    });
  };

  return (
    <main className='pt-36 min-h-screen bg-[#f7f3fb] flex items-start justify-center px-6'>
      <Seo title='Crear cuenta' noIndex />
      <section className='w-full max-w-md bg-white shadow-sm p-8 mt-10'>
        <div className='flex items-center gap-3 mb-6'>
          <span className='inline-flex h-10 w-10 items-center justify-center bg-purple-900 text-white'>
            <FaUserPlus aria-hidden='true' />
          </span>
          <div>
            <h1 className='text-2xl font-light text-purple-950'>Creá tu cuenta</h1>
            <p className='text-sm text-gray-600'>
              Vas a poder ver tus consultas reservadas y más adelante tus favoritos.
            </p>
          </div>
        </div>

        {error && <p className='mb-5 text-sm text-red-700'>{error}</p>}

        <form onSubmit={submitRegister} className='space-y-5'>
          <label className='block'>
            <span className='text-sm text-gray-600'>Nombre</span>
            <input
              name='name'
              value={form.name}
              onChange={updateField}
              className='mt-1 w-full border border-gray-200 px-3 py-2'
              required
            />
          </label>

          <label className='block'>
            <span className='text-sm text-gray-600'>Email</span>
            <input
              name='email'
              type='email'
              value={form.email}
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
              value={form.password}
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
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <div className='flex items-center gap-3 my-6'>
          <div className='h-px bg-gray-200 flex-1' />
          <span className='text-xs text-gray-400 uppercase'>o</span>
          <div className='h-px bg-gray-200 flex-1' />
        </div>

        <GoogleSignInButton onSuccess={handleGoogleSuccess} onError={handleGoogleError} />

        <p className='text-center text-sm text-gray-600 mt-6'>
          ¿Ya tenés cuenta?{' '}
          <Link
            to='/login'
            className='text-purple-800 underline underline-offset-4 hover:text-purple-950'
          >
            Iniciar sesión
          </Link>
        </p>
      </section>
    </main>
  );
};

export default Register;
