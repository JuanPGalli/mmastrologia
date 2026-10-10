import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHeart } from 'react-icons/fa';
import { getStoredSession } from '../../api/auth';
import { generarSinastria } from '../../api/astro';
import { useConsultaDiaria } from '../../hooks/useConsultaDiaria';
import { formatearFechaLarga } from '../../utils/fechas';
import PersonaNacimientoForm from '../../Components/PersonaNacimientoForm/PersonaNacimientoForm';
import RequiereSuscripcion from '../../Components/RequiereSuscripcion/RequiereSuscripcion';
import Seo from '../../Components/Seo/Seo';

const valoresIniciales = { nombre: '', fecha: '', hora: '', horaDesconocida: false, lugarNacimiento: '' };

const AVISO_IA = 'Este astrólogo virtual es una IA y puede cometer errores. Revisá/confirmá siempre las respuestas.';

const construirPayload = (valores) => {
  const [year, month, day] = valores.fecha.split('-').map(Number);
  const [hour, minute] = valores.horaDesconocida ? [undefined, undefined] : valores.hora.split(':').map(Number);
  return {
    nombre: valores.nombre.trim(),
    year,
    month,
    day,
    hour,
    minute,
    horaDesconocida: valores.horaDesconocida,
    lugarNacimiento: valores.lugarNacimiento.trim(),
  };
};

const formularioCompleto = (v) =>
  v.nombre.trim() && v.fecha && v.lugarNacimiento.trim() && (v.horaDesconocida || v.hora);

const ResultadoSinastria = ({ consulta }) => {
  const { resultado } = consulta;

  return (
    <article className='bg-white shadow-lg p-8 space-y-4 border-t-4 border-purple-400'>
      <div className='bg-purple-50 -mx-8 -mt-8 px-8 py-4 mb-2 text-sm text-purple-900'>
        <p className='text-xs uppercase tracking-widest text-purple-500 mb-1'>
          Tu sinastría del {formatearFechaLarga(consulta.fecha)}
        </p>
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
      <div className='space-y-3'>
        {resultado.texto
          .split('\n\n')
          .filter((parrafo) => parrafo.trim())
          .map((parrafo, i) => (
            <p key={i} className='text-gray-700 whitespace-pre-line'>
              {parrafo}
            </p>
          ))}
      </div>
      <p className='text-xs text-gray-400 border-t pt-4'>{resultado.disclaimer}</p>
      <p className='text-xs text-gray-400'>{AVISO_IA}</p>

      <div className='bg-purple-50 -mx-8 -mb-8 mt-6 p-6 text-center'>
        <p className='text-purple-950 font-medium mb-3'>¿Querés profundizar en esto con una lectura personal?</p>
        <a
          href='/services'
          className='inline-block bg-purple-800 text-white px-6 py-2 rounded-full text-sm hover:bg-purple-900 transition'
        >
          Ver consultas con María Marta →
        </a>
      </div>
    </article>
  );
};

const Sinastria = () => {
  const navigate = useNavigate();
  const [session] = useState(() => getStoredSession());
  const { consulta, setConsulta, cargando, generoHoy, sinAcceso, puedeGenerar, refrescarEstado } =
    useConsultaDiaria('sinastria', session);

  const [personaA, setPersonaA] = useState(valoresIniciales);
  const [personaB, setPersonaB] = useState(valoresIniciales);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errorEsTecnico, setErrorEsTecnico] = useState(false);
  const [requiereSuscripcion, setRequiereSuscripcion] = useState(false);

  useEffect(() => {
    if (!session) navigate('/login');
  }, [session, navigate]);

  if (!session) return null;

  const verFormulario = !consulta || mostrarFormulario;

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (loading) return;
    setError('');
    setErrorEsTecnico(false);
    setRequiereSuscripcion(false);

    if (!formularioCompleto(personaA) || !formularioCompleto(personaB)) {
      setError('Completá nombre, fecha, lugar (y hora, o marcá que no la conocés) de las dos personas.');
      return;
    }

    setLoading(true);
    try {
      const nueva = await generarSinastria(construirPayload(personaA), construirPayload(personaB));
      setConsulta(nueva);
      setMostrarFormulario(false);
      setPersonaA(valoresIniciales);
      setPersonaB(valoresIniciales);
      refrescarEstado();
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
        <p className='text-gray-600 text-center mb-2'>
          Cargá los datos de nacimiento de las dos personas para ver qué dice la conexión entre sus cartas.
        </p>
        <p className='text-center text-sm mb-2'>
          <a href='/astrologo-virtual' className='text-purple-700 underline hover:text-purple-900'>
            ← Volver al Astrólogo Virtual
          </a>
        </p>
        <p className='text-center text-xs text-gray-400 mb-10'>{AVISO_IA}</p>

        {cargando && <p className='text-center text-gray-500'>Cargando…</p>}

        {!cargando && !verFormulario && (
          <>
            <ResultadoSinastria consulta={consulta} />

            <div className='mt-8 space-y-4 text-center'>
              {puedeGenerar && (
                <button
                  type='button'
                  onClick={() => setMostrarFormulario(true)}
                  className='bg-purple-800 text-white px-8 py-3 rounded-full hover:bg-purple-900 transition cursor-pointer'
                >
                  Hacer una nueva sinastría
                </button>
              )}
              {!puedeGenerar && generoHoy && !sinAcceso && (
                <p className='text-sm text-gray-600'>
                  Ya hiciste tu sinastría de hoy. Mañana podés hacer una nueva.
                </p>
              )}
              {sinAcceso && (
                <RequiereSuscripcion mensaje='Usaste tu consulta de prueba gratis. Suscribite para seguir usando Sinastría.' />
              )}
            </div>
          </>
        )}

        {!cargando && verFormulario && sinAcceso && !consulta && (
          <RequiereSuscripcion mensaje='Usaste tu consulta de prueba gratis. Suscribite para usar Sinastría.' />
        )}

        {!cargando && verFormulario && !(sinAcceso && !consulta) && (
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

            {consulta && (
              <button
                type='button'
                onClick={() => setMostrarFormulario(false)}
                className='w-full text-sm text-purple-700 underline hover:text-purple-900 cursor-pointer'
              >
                ← Volver a mi última sinastría
              </button>
            )}
          </form>
        )}
      </div>
    </>
  );
};

export default Sinastria;
