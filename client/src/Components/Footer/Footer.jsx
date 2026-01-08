import React from 'react';
import { FaFacebook, FaFacebookF, FaInstagram, FaTiktok } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className='w-full bg-white border-t border-gray-200 py-16 px-6'>
      <div className='max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12'>
        {/* Contacto */}
        <div>
          <h3 className='text-3xl font-semibold text-purple-700 mb-4'>CONTACTO</h3>
          <br />
          <p className='text-gray-700 text-2xl'>contacto@mmgastrologia.com</p>
          <p className='text-gray-700 text-2xl'>WhatsApp: +54 9 11 5705-XXXX</p>
        </div>

        {/* Redes */}
        <div>
          <h3 className='text-3xl font-semibold text-purple-700 mb-4'>SIGA LAS REDES SOCIALES</h3>
          <br />
          <div className='flex gap-4 text-4xl text-gray-700'>
            <span>
              <FaFacebook />
            </span>
            <span>
              <FaInstagram />
            </span>
            <span>
              <FaTiktok />
            </span>
            <span>Youtube???</span>
          </div>
        </div>
      </div>

      {/* Links legales */}
      <div className='max-w-6xl mx-auto mt-12 text-sm text-purple-600 space-y-2'>
        <br />
        <p>Terminos e Condiciones Generales</p>
        <p>Política de Privacidad</p>
        <p>Protección de Datos Personales</p>
      </div>

      {/* Copyright */}
      <br />
      <div className='text-center text-xs text-gray-500 mt-10'>
        © 2026 Maria Marta Galli – Todos los direitos reservados
      </div>
    </footer>
  );
};

export default Footer;
