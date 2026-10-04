import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHeart } from 'react-icons/fa';
import { getStoredSession } from '../../api/auth';
import { generarSinastria } from '../../api/astro';
import { ARGENTINA_CITIES } from '../../data/argentinaCities';
import PersonaNacimientoForm from '../../Components/PersonaNacimientoForm/PersonaNacimientoForm';
import RequiereSuscripcion from '../../Components/RequiereSuscripcion/RequiereSuscripcion';
import Seo from '../../Components/Seo/Seo';

const valoresIniciales = { nombre: '', fecha: '', hora: '', horaDesconocida: false, ciudadIndex: '' };

const construirPayload = (valores) => {
  const [year, month, day] = valores.fecha.split('-').map(Number);
  const [hour, minute] = valores.horaDesconocida ? [undefined, undefined] : valores.hora.split(':').map(Number);
  const ciudad = ARGENTINA_CITIES[Number(valores.ciudadIndex)];
  return {
    nombre: valores.nombre.trim(),
    year,
    month,
    day,
    hour,
    minute,
    horaDesconocida: valores.horaDesconocida,
    latitude: ciudad.latitude,
    longitude: ciudad.longitude,
  };
};

const formularioCompleto = (v) =>
  v.nombre.trim() && v.fecha && v.ciudadIndex !== '' && (v.horaDesconocida || v.hora);

const Sinastria = () => {
  const navigate = useNavigate();
  const [session] = useState(() => getStoredSession());
  const [personaA, setPersonaA] = useState(valoresIniciales);
  const [personaB, setPersonaB] = useState(valoresIniciales);
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errorEsTecnico, setErrorEsTecnico] = useState(false);
  const [requiereSuscripcion, setRequiereSuscripcion] = useState(false);

  useEffect(() => {
    if (!session) navigate('/login');
  }, [session, navigate]);

  if (!session) return null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (loading) return;
    setError('');
    setErrorEsTecnico(false);
    setRequiereSuscripcion(false);

    if (!formularioCompleto(personaA) || !formularioCompleto(personaB)) {
      setError('Completá nombre, fecha, ciudad (y hora, o marcá que no la conocés) de las dos personas.');
      return;
    }

    setLoading(true);
    setResultado(null);
    try {
      const data = await generarSinastria(construirPayload(personaA), construirPayload(personaB));
      setResultado(data);
    } catch (requestError) {
      const status = requestError.response?.status;
      if (status === 402) {
        setRequiereSuscripcion(true);
      } else {
        setError(requestError.response?.data?.error || requestError.message);
        setErrorEsTecnico(status >= 500);
      }
    } finally {
      setLoading(false);
    }
  };

  const mensajeSoporte = encodeURIComponent(`Hola! Tuve un error en Sinastría: "${error}"`);

  return (
    <>
      <Seo
        title='Sinastría'
        description='Compatibilidad astrológica entre dos personas, calculada con sus cartas natales reales.'
        path='/sinastria'
        noIndex
      />
      <div className='max-w-2xl mx-auto px-6 py-32'>
        <div className='flex items-center justify-center gap-2 mb-2'>
          <FaHeart className='text-purple-700 text-2xl' aria-hidden='true' />
          <h1 className='text-3xl md:text-4xl font-light text-purple-950 text-center'>Sinastría</h1>
        </div>
        <p className='text-gray-600 text-center mb-10'>
          Cargá los datos de nacimiento de las dos personas para ver qué dice la conexión entre sus cartas.
        </p>

        <form onSubmit={handleSubmit} className='bg-white shadow-lg p-8 space-y-6'>
          <PersonaNacimientoForm titulo='Persona 1' valores={personaA} onCambiar={setPersonaA} />
          <PersonaNacimientoForm titulo='Persona 2' valores={personaB} onCambiar={setPersonaB} />

          {error && (
            <div className='text-sm text-red-600'>
              <p>{error}</p>
              {errorEsTecnico && (
                <a
                  href={`https://wa.me/5491128933987?text=${mensajeSoporte}`}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='inline-block mt-2 text-purple-700 underline hover:text-purple-900'
                >
                  Avisanos este problema por WhatsApp →
                </a>
              )}
            </div>
          )}

          {requiereSuscripcion && (
            <RequiereSuscripcion mensaje='Ya usaste tu consulta de prueba gratis. Suscribite para seguir usando Sinastría.' />
          )}

          <button
            type='submit'
            disabled={loading}
            className='w-full bg-purple-800 text-white py-3 rounded-full hover:bg-purple-900 transition disabled:opacity-60'
          >
            {loading ? 'Calculando...' : 'Ver compatibilidad'}
          </button>
        </form>

        {resultado && (
          <div className='bg-white shadow-lg p-8 mt-8 space-y-4 border-t-4 border-purple-400'>
            <div className='bg-purple-50 -mx-8 -mt-8 px-8 py-4 mb-2 text-sm text-purple-900'>
              <p className='font-medium mb-1'>
                {resultado.personaA} & {resultado.personaB}
              </p>
              {resultado.aspectos.length > 0 ? (
                <p>
                  {resultado.aspectos.length} aspecto{resultado.aspectos.length !== 1 ? 's' : ''} mayor
                  {resultado.aspectos.length !== 1 ? 'es' : ''} encontrado{resultado.aspectos.length !== 1 ? 's' : ''}{' '}
                  entre ambas cartas.
                </p>
              ) : (
                <p>No se encontraron aspectos mayores exactos entre estas dos cartas.</p>
              )}
            </div>

            <h2 className='text-xl text-purple-950 font-medium'>{resultado.titulo}</h2>
            <p className='text-gray-700 whitespace-pre-line'>{resultado.texto}</p>
            <p className='text-xs text-gray-400 border-t pt-4'>{resultado.disclaimer}</p>

            <div className='bg-purple-50 -mx-8 -mb-8 mt-6 p-6 text-center'>
              <p className='text-purple-950 font-medium mb-3'>
                ¿Querés profundizar en esto con una lectura personal?
              </p>
              <a
                href='/services'
                className='inline-block bg-purple-800 text-white px-6 py-2 rounded-full text-sm hover:bg-purple-900 transition'
              >
                Ver consultas con María Marta →
              </a>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Sinastria;
