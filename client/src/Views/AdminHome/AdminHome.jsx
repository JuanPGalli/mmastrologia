import { useEffect } from 'react';
import { FaBook, FaGear, FaRightFromBracket } from 'react-icons/fa6';
import { useNavigate } from 'react-router-dom';
import { clearSession, getStoredSession } from '../../api/auth';

const AdminHome = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const session = getStoredSession();
    if (!session) {
      navigate('/login');
    }
  }, [navigate]);

  const logout = () => {
    clearSession();
    navigate('/login');
  };

  return (
    <main className='pt-28 min-h-screen bg-[#f7f3fb] px-6'>
      <section className='mx-auto max-w-3xl'>
        <div className='flex items-center justify-between mb-8'>
          <div>
            <h1 className='text-2xl font-light text-purple-950'>Panel de administración</h1>
            <p className='text-sm text-gray-600'>Elegí qué contenido querés gestionar.</p>
          </div>
          <button
            onClick={logout}
            className='inline-flex items-center gap-2 text-sm text-gray-600 hover:text-purple-900 transition'
          >
            <FaRightFromBracket aria-hidden='true' />
            Cerrar sesión
          </button>
        </div>

        <div className='grid gap-5 sm:grid-cols-2'>
          <button
            onClick={() => navigate('/admin/services')}
            className='flex flex-col items-start gap-3 bg-white p-6 text-left shadow-sm hover:shadow-md transition border border-transparent hover:border-purple-200'
          >
            <span className='inline-flex h-10 w-10 items-center justify-center bg-purple-900 text-white'>
              <FaGear aria-hidden='true' />
            </span>
            <span className='text-lg font-medium text-purple-950'>Servicios</span>
            <span className='text-sm text-gray-600'>
              Crear, editar y administrar las cartas natales, tarot, reiki y demás servicios.
            </span>
          </button>

          <button
            onClick={() => navigate('/admin/blog')}
            className='flex flex-col items-start gap-3 bg-white p-6 text-left shadow-sm hover:shadow-md transition border border-transparent hover:border-purple-200'
          >
            <span className='inline-flex h-10 w-10 items-center justify-center bg-purple-900 text-white'>
              <FaBook aria-hidden='true' />
            </span>
            <span className='text-lg font-medium text-purple-950'>Blog</span>
            <span className='text-sm text-gray-600'>
              Crear artículos, moderar comentarios y administrar el contenido del blog.
            </span>
          </button>
        </div>
      </section>
    </main>
  );
};

export default AdminHome;
