import React, { useEffect, useState } from 'react';
const logoNav = 'https://res.cloudinary.com/ydsjcgim/image/upload/v1788280204/Logo-MMA.png';

import { FaBars, FaTimes, FaUserCircle } from 'react-icons/fa';
import './Navbar.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { clearSession, getStoredSession } from '../../api/auth';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';
  // Lectura sincrónica: se recalcula solo en cada render (p. ej. al cambiar
  // de ruta), sin necesidad de sincronizarla con un efecto.
  const session = getStoredSession();
  const [prevPathname, setPrevPathname] = useState(location.pathname);

  // Cierra el menú de usuario al navegar a otra página (ajuste de estado
  // durante el render, evita el cascading-render de hacerlo en un efecto).
  if (location.pathname !== prevPathname) {
    setPrevPathname(location.pathname);
    setMenuOpen(false);
  }

  const handleLogout = () => {
    clearSession();
    setMenuOpen(false);
    navigate('/login');
  };

  useEffect(() => {
    const handleScroll = () => {
      if (scrollY > 0) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-colors duration-100 ${
        isOpen
          ? 'bg-[linear-gradient(90deg,#D4ACFB,#B84FCE)] text-white'
          : scrolled
            ? 'bg-[rgb(147,116,192)] text-white'
            : !scrolled && isHome
              ? 'bg-transparent text-white'
              : 'bg-transparent text-purple-700'
      } `}
    >
      <div className='mx-auto flex max-w-7xl items-center justify-between px-6 py-3'>
        {/* Logo */}
        <a href='/' aria-label='Inicio'>
          <img src={logoNav} alt='logo_navbar' className='hidden md:block md:h-30 md:w-auto' />
        </a>

        {/* Botón hamburguesa (mobile) */}
        <button
          className='md:hidden'
          onClick={() => setIsOpen(!isOpen)}
          aria-label='Abrir menú'
          aria-expanded={isOpen}
        >
          {!isOpen && isHome ? (
            <FaBars color='white' size={30} />
          ) : !isOpen && !isHome && !scrolled ? (
            <FaBars color='rgb(126 34 206)' size={30} />
          ) : !isOpen && !isHome && scrolled ? (
            <FaBars color='white' size={30} />
          ) : (
            <FaTimes color='white' size={30} />
          )}
        </button>

        {/* Links */}
        <ul
          className={`
            absolute left-0 top-full w-full bg-[linear-gradient(90deg,#D4ACFB,#B84FCE)] md:bg-none md:static md:flex md:w-auto
            ${isOpen ? 'block' : 'hidden'} md:block
          `}
        >
          <li>
            <a className='nav-link' href='/'>
              Inicio
            </a>
          </li>
          <li>
            <a className='nav-link' href='/services'>
              Consultas
            </a>
          </li>
          <li>
            <a className='nav-link' href='/blog'>
              Blog
            </a>
          </li>
          <li>
            <a className='nav-link' href='/about'>
              Sobre Mi
            </a>
          </li>
          <li>
            <a className='nav-link' href='/contact'>
              Contacto
            </a>
          </li>
          <li>
            <a
              href='/agendar'
              className='inline-block bg-purple-800 text-white px-4 py-2 rounded-full text-sm hover:bg-purple-900 transition'
            >
              Agendar
            </a>
          </li>
          <li className='relative'>
            {session ? (
              <>
                <button
                  type='button'
                  onClick={() => setMenuOpen((current) => !current)}
                  className='flex items-center gap-2'
                >
                  {session.user.picture ? (
                    <img
                      src={session.user.picture}
                      alt={session.user.name}
                      className='h-8 w-8 rounded-full object-cover border border-white/60'
                      referrerPolicy='no-referrer'
                    />
                  ) : (
                    <FaUserCircle className='h-8 w-8' aria-hidden='true' />
                  )}
                </button>

                {menuOpen && (
                  <div className='absolute right-0 mt-2 w-48 bg-white text-gray-800 shadow-lg rounded-lg overflow-hidden z-50'>
                    <p className='px-4 py-3 text-sm border-b border-gray-100 truncate'>
                      {session.user.name}
                    </p>
                    <a
                      href={session.user.role === 'admin' ? '/admin' : '/cuenta'}
                      className='block px-4 py-2 text-sm hover:bg-purple-50'
                    >
                      {session.user.role === 'admin' ? 'Panel admin' : 'Mi cuenta'}
                    </a>
                    <button
                      type='button'
                      onClick={handleLogout}
                      className='block w-full text-left px-4 py-2 text-sm hover:bg-purple-50 text-red-600'
                    >
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </>
            ) : (
              <a className='nav-link' href='/login'>
                Log In
              </a>
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
