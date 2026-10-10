import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaMagic, FaSun } from 'react-icons/fa';
import { getStoredSession } from '../../api/auth';
import { generarInformeAstrologico } from '../../api/astro';
import { useConsultaDiaria } from '../../hooks/useConsultaDiaria';
import { formatearFechaCorta, formatearFechaLarga } from '../../utils/fechas';
import Seo from '../../Components/Seo/Seo';
import CartaNatalWheel from '../../Components/CartaNatalWheel/CartaNatalWheel';
import RequiereSuscripcion from '../../Components/RequiereSuscripcion/RequiereSuscripcion';

const estadoInicial = {
  fecha: '',
  hora: '',
  horaDesconocida: false,
  lugarNacimiento: '',
  pregunta: '',
};

const WHATSAPP_SOPORTE = 'https://wa.me/5491128933987';

const AVISO_IA = 'Este astrólogo virtual es una IA y puede cometer errores. Revisá/confirmá siempre las respuestas.';

// Resultado INTEGRAL de una consulta: carta calculada + gráfico + informe
// escrito + horóscopo del día, todo sobre la misma carta (la de este pedido).
const ResultadoInforme = ({ consulta }) => {
  const { entrada, resultado } = consulta;
  const { carta, rueda, horoscopo } = resultado;

  const hora = entrada.horaDesconocida
    ? 'hora no informada'
    : `${String(entrada.hour).padStart(2, '0')}:${String(entrada.minute).padStart(2, '0')}`;

  return (
    <article className='bg-white shadow-lg p-8 space-y-6 border-t-4 border-purple-400'>
      <div className='bg-purple-50 -mx-8 -mt-8 px-8 py-4 text-sm text-purple-900'>
        <p className='text-xs uppercase tracking-widest text-purple-500 mb-1'>
          Tu informe del {formatearFechaLarga(consulta.fecha)}
        </p>
        <p className='break-words'>
          Nacimiento: {formatearFechaCorta(entrada.year, entrada.month, entrada.day)} · {hora} ·{' '}
          {entrada.lugarNacimiento}
        </p>
        <p className='mt-1 break-words'>
          <span className='font-medium'>Tu pregunta:</span> {entrada.pregunta}
        </p>
      </div>

      <section>
        <h2 className='text-sm font-semibold text-purple-800 mb-1'>Tu carta calculada</h2>
        <p className='text-sm text-gray-700 mb-4'>
          Sol en {carta.solSigno} · Luna en {carta.lunaSigno}
          {carta.horaConocida && carta.ascendenteSigno ? ` · Ascendente en ${carta.ascendenteSigno}` : ''}
          {carta.horaConocida && carta.saturnoTransitandoCasa
            ? ` · Saturno transitando tu casa ${carta.saturnoTransitandoCasa}`
            : ''}
        </p>
        {!carta.horaConocida && (
          <p className='text-xs text-purple-600 mb-4'>Sin hora exacta no se calculan ascendente ni casas.</p>
        )}
        {rueda && <CartaNatalWheel rueda={rueda} />}
      </section>

      <section className='space-y-4'>
        <div className='flex items-start gap-2'>
          <FaMagic className='text-purple-400 text-xl shrink-0 mt-1' aria-hidden='true' />
          <h2 className='text-xl text-purple-950 font-medium'>{resultado.titulo}</h2>
        </div>
        <div className='space-y-3'>
          {resultado.interpretacion
            .split('\n\n')
            .filter((parrafo) => parrafo.trim())
            .map((parrafo, i) => (
              <p key={i} className='text-gray-700 whitespace-pre-line'>
                {parrafo}
              </p>
            ))}
        </div>
        <div>
          <h3 className='text-sm font-semibold text-purple-800 mb-2'>Consejo práctico</h3>
          <ul className='space-y-2'>
            {(Array.isArray(resultado.consejo_practico)
              ? resultado.consejo_practico
              : [resultado.consejo_practico]
            ).map((item, i) => (
              <li key={i} className='flex items-start gap-2 text-gray-700'>
                <span className='text-purple-400 mt-1'>✦</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {horoscopo && (
        <section className='bg-gradient-to-br from-purple-800 to-purple-950 text-white -mx-8 p-8'>
          <div className='flex items-center justify-between gap-2 mb-2'>
            <div className='flex items-center gap-2'>
              <FaSun className='text-yellow-300 text-xl' aria-hidden='true' />
              <p className='text-xs uppercase tracking-widest text-purple-200'>Tu horóscopo de hoy</p>
            </div>
            <p className='text-xs text-purple-300 capitalize'>{formatearFechaLarga(horoscopo.fecha)}</p>
          </div>
          <h3 className='text-lg font-medium mb-2'>{horoscopo.titulo}</h3>
          <div className='space-y-2'>
            {horoscopo.texto
              .split('\n')
              .filter((parrafo) => parrafo.trim())
              .map((parrafo, i) => (
                <p key={i} className='text-purple-100'>
                  {parrafo}
                </p>
              ))}
          </div>
        </section>
      )}

      <div className='space-y-1'>
        <p className='text-xs text-gray-400'>{resultado.disclaimer}</p>
        <p className='text-xs text-gray-400'>{AVISO_IA}</p>
      </div>

      <div className='bg-purple-50 -mx-8 -mb-8 p-6 text-center'>
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

const AstrologoVirtual = () => {
  const navigate = useNavigate();
  const [session] = useState(() => getStoredSession());
  const { consulta, setConsulta, cargando, generoHoy, sinAcceso, puedeGenerar, refrescarEstado } =
    useConsultaDiaria('informe', session);

  const [form, setForm] = useState(estadoInicial);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errorEsTecnico, setErrorEsTecnico] = useState(false);
  const [requiereSuscripcion, setRequiereSuscripcion] = useState(false);

  useEffect(() => {
    if (!session) navigate('/login');
  }, [session, navigate]);

  if (!session) return null;

  // Sin informe previo: formulario. Con informe: resultado, y el formulario
  // queda oculto detrás del botón "Generar un nuevo informe".
  const verFormulario = !consulta || mostrarFormulario;

  const actualizarCampo = (campo) => (event) => {
    const valor = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setForm((prev) => ({ ...prev, [campo]: valor }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (loading) return;
    setError('');
    setErrorEsTecnico(false);
    setRequiereSuscripcion(false);

    if (!form.fecha || !form.lugarNacimiento.trim() || !form.pregunta.trim()) {
      setError('Completá fecha de nacimiento, lugar de nacimiento y tu pregunta.');
      return;
    }
    if (!form.horaDesconocida && !form.hora) {
      setError('Ingresá la hora de nacimiento, o marcá que no la conocés.');
      return;
    }

    const [year, month, day] = form.fecha.split('-').map(Number);
    const [hour, minute] = form.horaDesconocida ? [undefined, undefined] : form.hora.split(':').map(Number);

    setLoading(true);
    try {
      const nueva = await generarInformeAstrologico({
        year,
        month,
        day,
        hour,
        minute,
        horaDesconocida: form.horaDesconocida,
        lugarNacimiento: form.lugarNacimiento.trim(),
        pregunta: form.pregunta.trim(),
      });
      setConsulta(nueva);
      setMostrarFormulario(false);
      setForm(estadoInicial);
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
        <div className='flex flex-col items-center justify-center gap-2 mb-2'>
          <video
            src='https://res.cloudinary.com/ydsjcgim/video/upload/v1790829084/bola_de_cristal.mp4'
            autoPlay
            loop
            muted
            playsInline
            className='w-20 h-20 rounded-full object-cover shadow-lg'
          />
          <h1 className='text-3xl md:text-4xl font-light text-purple-950 text-center'>Astrólogo Virtual</h1>
        </div>
        <p className='text-gray-600 text-center mb-2'>
          Tu carta natal, un informe a tu pregunta y tu horóscopo del día, todo en una sola consulta.
        </p>
        <p className='text-center text-sm mb-2'>
          <a href='/sinastria' className='text-purple-700 underline hover:text-purple-900'>
            ¿Querés ver compatibilidad con otra persona? Probá Sinastría →
          </a>
        </p>
        <p className='text-center text-xs text-gray-400 mb-10'>{AVISO_IA}</p>

        {cargando && <p className='text-center text-gray-500'>Cargando…</p>}

        {!cargando && !verFormulario && (
          <>
            <ResultadoInforme consulta={consulta} />

            <div className='mt-8 space-y-4 text-center'>
              {puedeGenerar && (
                <button
                  type='button'
                  onClick={() => setMostrarFormulario(true)}
                  className='bg-purple-800 text-white px-8 py-3 rounded-full hover:bg-purple-900 transition cursor-pointer'
                >
                  Generar un nuevo informe
                </button>
              )}
              {!puedeGenerar && generoHoy && !sinAcceso && (
                <p className='text-sm text-gray-600'>
                  Ya generaste tu informe de hoy. Mañana podés pedir uno nuevo.
                </p>
              )}
              {sinAcceso && (
                <RequiereSuscripcion mensaje='Usaste tu consulta de prueba gratis. Suscribite para recibir un informe nuevo cada día.' />
              )}
            </div>
          </>
        )}

        {!cargando && verFormulario && sinAcceso && !consulta && (
          <RequiereSuscripcion mensaje='Usaste tu consulta de prueba gratis. Suscribite para generar tus informes.' />
        )}

        {!cargando && verFormulario && !(sinAcceso && !consulta) && (
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
                  Sin hora exacta, el informe no va a incluir ascendente ni tránsitos por casas — solo Sol y
                  Luna.
                </p>
              )}
            </div>

            <div>
              <label htmlFor='lugarNacimiento' className='block text-sm font-medium text-gray-700 mb-1'>
                Lugar de nacimiento
              </label>
              <input
                id='lugarNacimiento'
                type='text'
                value={form.lugarNacimiento}
                onChange={actualizarCampo('lugarNacimiento')}
                placeholder='Ciudad, país (ej: Río de Janeiro, Brasil)'
                className='w-full border border-gray-300 rounded px-3 py-2'
                required
              />
              <p className='text-xs text-gray-500 mt-1'>Vale cualquier país — cuanto más específico, mejor.</p>
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

            {requiereSuscripcion && (
              <RequiereSuscripcion mensaje='Ya usaste tu consulta de prueba gratis. Suscribite para seguir generando informes.' />
            )}

            <button
              type='submit'
              disabled={loading}
              className='w-full bg-purple-800 text-white py-3 rounded-full hover:bg-purple-900 transition disabled:opacity-60'
            >
              {loading ? 'Generando informe…' : 'Generar mi informe'}
            </button>

            {consulta && (
              <button
                type='button'
                onClick={() => setMostrarFormulario(false)}
                className='w-full text-sm text-purple-700 underline hover:text-purple-900 cursor-pointer'
              >
                ← Volver a mi último informe
              </button>
            )}
          </form>
        )}
      </div>
    </>
  );
};

export default AstrologoVirtual;
