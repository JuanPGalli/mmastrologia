import React, { useEffect, useState } from 'react';
const logoNav = '/Logo-MMA.png';

import { FaBars, FaTimes } from 'react-icons/fa';
import Swal from 'sweetalert2';
import './Navbar.css';
import { useLocation } from 'react-router-dom';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';

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

  const handleLoginClick = (e) => {
    e.preventDefault();

    Swal.fire({
      icon: 'info',
      title: '¡Sección en construcción!',
      text: 'Estamos trabajando para habilitar el inicio de sesión muy pronto.',
      confirmButtonText: 'Entendido',
    });
  };

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
          ) : !isOpen && !isHome ? (
            <FaBars color='rgb(126 34 206)' size={30} />
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
            <a className='nav-link' href='/login' onClick={handleLoginClick}>
              Log In
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
