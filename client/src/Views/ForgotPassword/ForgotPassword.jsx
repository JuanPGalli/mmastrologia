import { useState } from 'react';
import { Link } from 'react-router-dom';
import { requestPasswordReset } from '../../api/auth';
import Seo from '../../Components/Seo/Seo';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      await requestPasswordReset(email);
    } finally {
      // Mostramos el mismo mensaje exista o no el email (por seguridad).
      setSent(true);
      setLoading(false);
    }
  };

  return (
    <main className='pt-36 min-h-screen bg-[#f7f3fb] flex items-start justify-center px-6'>
      <Seo title='Recuperar contraseña' noIndex />
      <section className='w-full max-w-md bg-white shadow-sm p-8 mt-10'>
        <h1 className='text-2xl font-light text-purple-950 mb-2'>Recuperar contraseña</h1>
        <p className='text-sm text-gray-600 mb-6'>
          Ingresá tu email y te mandamos un link para restablecerla.
        </p>

        {sent ? (
          <p className='text-sm text-green-700'>
            Si el email está registrado, vas a recibir un link para restablecer tu contraseña en
            los próximos minutos.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className='space-y-5'>
            <label className='block'>
              <span className='text-sm text-gray-600'>Email</span>
              <input
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className='mt-1 w-full border border-gray-200 px-3 py-2'
                required
              />
            </label>

            <button
              type='submit'
              disabled={loading}
              className='w-full bg-purple-800 text-white px-6 py-3 text-sm uppercase tracking-widest hover:bg-purple-950 transition disabled:opacity-50'
            >
              {loading ? 'Enviando...' : 'Enviar link de recuperación'}
            </button>
          </form>
        )}

        <p className='text-center text-sm text-gray-600 mt-6'>
          <Link to='/login' className='text-purple-800 underline underline-offset-4'>
            Volver a iniciar sesión
          </Link>
        </p>
      </section>
    </main>
  );
};

export default ForgotPassword;
