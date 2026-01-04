//import React, { useState } from 'react';
const logoNav = '/logo_mmgastrologia.jpeg';

const Navbar = () => {
  //const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className='fixed w-full border-b bg-white shadow'>
      <div className='mx-auto flex max-w-7xl items-center justify-between px-4 py-3'>
        {/* Logo */}
        <a href='/' aria-label='Inicio'>
          <img src={logoNav} alt='logo_navbar' className='h-10 w-auto' />
        </a>
        <ul className='flex items-center justify-between'>
          <li>
            <a href='/'>Inicio</a>
          </li>
          <li>
            <a href='/services'>Consultas</a>
          </li>
          <li>
            <a href='/about'>Sobre Mi</a>
          </li>
          <li>
            <a href='/contact'>Contacto</a>
          </li>
          <li>
            <a href='/login'>Log In</a>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
