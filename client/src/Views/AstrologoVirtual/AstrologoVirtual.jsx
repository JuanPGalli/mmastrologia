import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

const AstrologoVirtual = () => {
  const navigate = useNavigate();
  const [session] = useState(() => getStoredSession());
  const [form, setForm] = useState(estadoInicial);
  const [informe, setInforme] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!session) {
    navigate('/login');
    return null;
  }

  const actualizarCampo = (campo) => (event) => {
    const valor = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setForm((prev) => ({ ...prev, [campo]: valor }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

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
    } catch (requestError) {
      setError(requestError.response?.data?.error || requestError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Seo
        title='Astrólogo Virtual'
        description='Informe astrológico personalizado generado a partir de tu carta natal.'
        path='/astrologo-virtual'
        noIndex
      />
      <div className='max-w-2xl mx-auto px-6 py-32'>
        <h1 className='text-3xl md:text-4xl font-light text-purple-950 mb-2 text-center'>
          Astrólogo Virtual
        </h1>
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

          {error && <p className='text-sm text-red-600'>{error}</p>}

          <button
            type='submit'
            disabled={loading}
            className='w-full bg-purple-800 text-white py-3 rounded-full hover:bg-purple-900 transition disabled:opacity-60'
          >
            {loading ? 'Generando informe…' : 'Generar mi informe'}
          </button>
        </form>

        {informe && (
          <div className='bg-white shadow-lg p-8 mt-8 space-y-4'>
            <h2 className='text-xl text-purple-950 font-medium'>{informe.titulo}</h2>
            <p className='text-gray-700 whitespace-pre-line'>{informe.interpretacion}</p>
            <div>
              <h3 className='text-sm font-semibold text-purple-800 mb-1'>Consejo práctico</h3>
              <p className='text-gray-700 whitespace-pre-line'>{informe.consejo_practico}</p>
            </div>
            <p className='text-xs text-gray-400 border-t pt-4'>{informe.disclaimer}</p>
          </div>
        )}
      </div>
    </>
  );
};

export default AstrologoVirtual;
