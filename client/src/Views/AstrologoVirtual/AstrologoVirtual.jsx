import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaMagic } from 'react-icons/fa';
import { GiCrystalBall } from 'react-icons/gi';
import { getStoredSession } from '../../api/auth';
import { generarInformeAstrologico } from '../../api/astro';
import { ARGENTINA_CITIES } from '../../data/argentinaCities';
import Seo from '../../Components/Seo/Seo';

const estadoInicial = {
  fecha: '',
  hora: '',
  horaDesconocida: false,
  ciudadIndex: '',
  pregunta: '',
};

const WHATSAPP_SOPORTE = 'https://wa.me/5491128933987';

// El informe se guarda en localStorage (no es información sensible, es solo
// una copia del último resultado para este navegador) para que, cuando más
// adelante el formulario quede bloqueado hasta el próximo período de
// suscripción, la persona igual pueda seguir viendo su último informe en
// vez de encontrarse con una pantalla vacía.
const STORAGE_KEY = 'mma_ultimo_informe_astrologico';

const guardarInformeLocal = (informe) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ informe, fecha: Date.now() }));
  } catch {
    // localStorage puede fallar (modo privado, cuota llena, etc.) — no es
    // crítico para el funcionamiento del formulario, así que se ignora.
  }
};

const leerInformeLocal = () => {
  try {
    const guardado = localStorage.getItem(STORAGE_KEY);
    return guardado ? JSON.parse(guardado).informe : null;
  } catch {
    return null;
  }
};

const AstrologoVirtual = () => {
  const navigate = useNavigate();
  const [session] = useState(() => getStoredSession());
  const [form, setForm] = useState(estadoInicial);
  const [informe, setInforme] = useState(() => leerInformeLocal());
  const [esInformeGuardado, setEsInformeGuardado] = useState(() => Boolean(leerInformeLocal()));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errorEsTecnico, setErrorEsTecnico] = useState(false);

  useEffect(() => {
    if (!session) navigate('/login');
  }, [session, navigate]);

  if (!session) return null;

  const actualizarCampo = (campo) => (event) => {
    const valor = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setForm((prev) => ({ ...prev, [campo]: valor }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (loading) return;
    setError('');
    setErrorEsTecnico(false);

    if (!form.fecha || form.ciudadIndex === '' || !form.pregunta.trim()) {
      setError('Completá fecha de nacimiento, ciudad y tu pregunta.');
      return;
    }
    if (!form.horaDesconocida && !form.hora) {
      setError('Ingresá la hora de nacimiento, o marcá que no la conocés.');
      return;
    }

    const [year, month, day] = form.fecha.split('-').map(Number);
    const [hour, minute] = form.horaDesconocida ? [undefined, undefined] : form.hora.split(':').map(Number);
    const ciudad = ARGENTINA_CITIES[Number(form.ciudadIndex)];

    setLoading(true);
    setInforme(null);
    try {
      const resultado = await generarInformeAstrologico({
        year,
        month,
        day,
        hour,
        minute,
        horaDesconocida: form.horaDesconocida,
        latitude: ciudad.latitude,
        longitude: ciudad.longitude,
        pregunta: form.pregunta.trim(),
      });
      setInforme(resultado);
      setEsInformeGuardado(false);
      guardarInformeLocal(resultado);
    } catch (requestError) {
      const status = requestError.response?.status;
      const mensaje = requestError.response?.data?.error || requestError.message;
      setError(mensaje);
      // 502 = falla técnica nuestra/de Gemini (ver astroHandlers.ts). Para
      // eso mostramos una vía de contacto directa; un 400 es simplemente
      // un dato mal cargado y la persona lo puede corregir sola.
      setErrorEsTecnico(status >= 500);
    } finally {
      setLoading(false);
    }
  };

  const mensajeSoporte = encodeURIComponent(
    `Hola! Tuve un error al generar mi informe del Astrólogo Virtual: "${error}"`
  );

  return (
    <>
      <Seo
        title='Astrólogo Virtual'
        description='Informe astrológico personalizado generado a partir de tu carta natal.'
        path='/astrologo-virtual'
        noIndex
      />
      <div className='max-w-2xl mx-auto px-6 py-32'>
        <div className='flex items-center justify-center gap-2 mb-2'>
          <GiCrystalBall className='text-purple-700 text-3xl' aria-hidden='true' />
          <h1 className='text-3xl md:text-4xl font-light text-purple-950 text-center'>
            Astrólogo Virtual
          </h1>
        </div>
        <p className='text-gray-600 text-center mb-10'>
          Contanos tu fecha, hora y lugar de nacimiento, y qué te gustaría consultar.
        </p>

        <form onSubmit={handleSubmit} className='bg-white shadow-lg p-8 space-y-6'>
          <div>
            <label htmlFor='fecha' className='block text-sm font-medium text-gray-700 mb-1'>
              Fecha de nacimiento
            </label>
            <input
              id='fecha'
              type='date'
              value={form.fecha}
              onChange={actualizarCampo('fecha')}
              className='w-full border border-gray-300 rounded px-3 py-2'
              required
            />
          </div>

          <div>
            <label htmlFor='hora' className='block text-sm font-medium text-gray-700 mb-1'>
              Hora de nacimiento
            </label>
            <input
              id='hora'
              type='time'
              value={form.hora}
              onChange={actualizarCampo('hora')}
              disabled={form.horaDesconocida}
              className='w-full border border-gray-300 rounded px-3 py-2 disabled:bg-gray-100'
            />
            <label className='flex items-center gap-2 mt-2 text-sm text-gray-600'>
              <input
                type='checkbox'
                checked={form.horaDesconocida}
                onChange={actualizarCampo('horaDesconocida')}
              />
              No sé mi hora exacta de nacimiento
            </label>
            {form.horaDesconocida && (
              <p className='text-xs text-gray-500 mt-1'>
                Sin hora exacta, el informe no va a incluir ascendente ni tránsitos por casas — solo
                Sol y Luna.
              </p>
            )}
          </div>

          <div>
            <label htmlFor='ciudad' className='block text-sm font-medium text-gray-700 mb-1'>
              Ciudad de nacimiento
            </label>
            <select
              id='ciudad'
              value={form.ciudadIndex}
              onChange={actualizarCampo('ciudadIndex')}
              className='w-full border border-gray-300 rounded px-3 py-2'
              required
            >
              <option value='' disabled>
                Elegí una ciudad
              </option>
              {ARGENTINA_CITIES.map((ciudad, index) => (
                <option key={ciudad.label} value={index}>
                  {ciudad.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor='pregunta' className='block text-sm font-medium text-gray-700 mb-1'>
              Tu pregunta
            </label>
            <textarea
              id='pregunta'
              value={form.pregunta}
              onChange={actualizarCampo('pregunta')}
              rows={4}
              className='w-full border border-gray-300 rounded px-3 py-2'
              placeholder='¿Qué te gustaría consultar?'
              required
            />
          </div>

          {error && (
            <div className='text-sm text-red-600'>
              <p>{error}</p>
              {errorEsTecnico && (
                <a
                  href={`${WHATSAPP_SOPORTE}?text=${mensajeSoporte}`}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='inline-block mt-2 text-purple-700 underline hover:text-purple-900'
                >
                  Avisanos este problema por WhatsApp →
                </a>
              )}
            </div>
          )}

          <button
            type='submit'
            disabled={loading}
            className='w-full bg-purple-800 text-white py-3 rounded-full hover:bg-purple-900 transition disabled:opacity-60'
          >
            {loading ? 'Generando informe…' : 'Generar mi informe'}
          </button>
        </form>

        {informe && (
          <div className='bg-white shadow-lg p-8 mt-8 space-y-4 border-t-4 border-purple-400'>
            {esInformeGuardado && (
              <p className='text-xs uppercase tracking-widest text-purple-500'>
                Tu último informe generado
              </p>
            )}
            <div className='flex items-start gap-2'>
              <FaMagic className='text-purple-400 text-xl shrink-0 mt-1' aria-hidden='true' />
              <h2 className='text-xl text-purple-950 font-medium'>{informe.titulo}</h2>
            </div>
            <p className='text-gray-700 whitespace-pre-line'>{informe.interpretacion}</p>
            <div>
              <h3 className='text-sm font-semibold text-purple-800 mb-1'>Consejo práctico</h3>
              <p className='text-gray-700 whitespace-pre-line'>{informe.consejo_practico}</p>
            </div>
            <p className='text-xs text-gray-400 border-t pt-4'>{informe.disclaimer}</p>

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

export default AstrologoVirtual;
