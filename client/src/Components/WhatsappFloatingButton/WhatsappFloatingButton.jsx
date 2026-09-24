import { useLocation } from 'react-router-dom';
import { FaWhatsapp } from 'react-icons/fa';

const WHATSAPP_URL = 'https://wa.me/5491128933987';

const WhatsappFloatingButton = () => {
  const { pathname } = useLocation();

  // No mostrar el botón en el panel de administración: es para
  // visitantes del sitio público, no para María Marta gestionando el back office.
  if (pathname.startsWith('/admin')) return null;

  return (
    <a
      href={WHATSAPP_URL}
      target='_blank'
      rel='noopener noreferrer'
      aria-label='Escribir por WhatsApp'
      className='fixed bottom-6 right-6 z-40 flex items-center justify-center w-14 h-14 md:w-20 md:h-20 rounded-full bg-[#25D366] text-white text-4xl md:text-6xl shadow-lg hover:scale-105 hover:shadow-xl transition-transform'
    >
      <FaWhatsapp />
    </a>
  );
};

export default WhatsappFloatingButton;
