import React, { useState } from 'react';
const logoNav = '/logo_mmgastrologia.jpeg';
import { FaBars, FaTimes } from 'react-icons/fa';
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className='fixed w-full border-b shadow'>
      <div className='mx-auto flex max-w-7xl items-center justify-between px-4 py-3'>
        {/* Logo */}
        <a href='/' aria-label='Inicio'>
          <img src={logoNav} alt='logo_navbar' className='h-10 w-auto' />
        </a>

        {/* Botón hamburguesa (mobile) */}
        <button
          className='md:hidden'
          onClick={() => setIsOpen(!isOpen)}
          aria-label='Abrir menú'
          aria-expanded={isOpen}
        >
          ${!isOpen ? <FaBars /> : <FaTimes />}
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
