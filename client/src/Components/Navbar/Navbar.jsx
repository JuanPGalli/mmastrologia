import React, { useEffect, useState } from 'react';
const logoNav = '/logo_transparente.png';
import { FaBars, FaTimes } from 'react-icons/fa';
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

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
      className={`fixed top-0 left-0 w-full z-50 transition-colors duration-300 ${
        scrolled ? 'bg-[rgb(147,116,192)]' : 'bg-transparent'
      } `}
    >
      <div className='mx-auto flex max-w-7xl items-center justify-between px-6 py-3'>
        {/* Logo */}
        <a href='/' aria-label='Inicio'>
          <img src={logoNav} alt='logo_navbar' className='h-15 w-auto' />
        </a>

        {/* Botón hamburguesa (mobile) */}
        <button
          className='md:hidden'
          onClick={() => setIsOpen(!isOpen)}
          aria-label='Abrir menú'
          aria-expanded={isOpen}
        >
          {!isOpen ? <FaBars color='white' size={30} /> : <FaTimes color='white' size={30} />}
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
            <a className='nav-link' href='/login'>
              Log In
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
