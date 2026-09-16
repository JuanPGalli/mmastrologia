import { FaHeart, FaRegHeart } from 'react-icons/fa6';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const FavoriteButton = ({ active, loggedIn, onToggle, className = '' }) => {
  const navigate = useNavigate();

  const handleClick = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!loggedIn) {
      const result = await Swal.fire({
        icon: 'info',
        title: 'Iniciá sesión',
        text: 'Creá una cuenta gratis para guardar tus favoritos.',
        showCancelButton: true,
        confirmButtonText: 'Iniciar sesión',
        cancelButtonText: 'Ahora no',
        confirmButtonColor: '#7c3aed',
      });
      if (result.isConfirmed) navigate('/login');
      return;
    }

    onToggle();
  };

  return (
    <button
      type='button'
      onClick={handleClick}
      aria-label={active ? 'Quitar de favoritos' : 'Agregar a favoritos'}
      className={`inline-flex items-center justify-center h-9 w-9 rounded-full bg-white/90 shadow hover:scale-110 transition ${className}`}
    >
      {active ? (
        <FaHeart className='text-red-500' aria-hidden='true' />
      ) : (
        <FaRegHeart className='text-gray-500' aria-hidden='true' />
      )}
    </button>
  );
};

export default FavoriteButton;
