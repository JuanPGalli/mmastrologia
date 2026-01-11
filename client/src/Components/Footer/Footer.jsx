import React from 'react';
import {
  FaFacebook,
  FaFacebookF,
  FaInstagram,
  FaTiktok,
  FaYoutube,
  FaYoutubeSquare,
} from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className='w-full bg-white border-t border-gray-200 py-16 px-6'>
      <div className='max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12'>
        {/* Contacto */}
        <div>
          <h3 className='text-2xl md:text-3xl font-semibold text-[#3D3456] mb-0'>CONTACTO</h3>
          <div className='w-45 border-t-[3px] border-[#D697B8] mt-1 mb-6 h-0 box-border'></div>
          <p className='text-gray-700 font-thin text-xl md:text-2xl'>contacto@mmastrologia.com</p>
          <p className='text-gray-700 font-thin text-xl md:text-2xl'>
            WhatsApp: +54 9 11 5705-XXXX
          </p>
        </div>

        {/* Redes */}
        <div>
          <h3 className='text-2xl md:text-3xl font-semibold text-[#3D3456] mb-0'>
            SIGA LAS REDES SOCIALES
          </h3>
          <div className='w-45 border-t-[3px] border-[#D697B8] mt-1 mb-6 h-0 box-border'></div>
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
            <span>
              <FaYoutube />
            </span>
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
