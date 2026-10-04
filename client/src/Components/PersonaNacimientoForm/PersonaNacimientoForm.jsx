import { ARGENTINA_CITIES } from '../../data/argentinaCities';

const PersonaNacimientoForm = ({ titulo, valores, onCambiar }) => {
  const actualizar = (campo) => (event) => {
    const valor = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    onCambiar({ ...valores, [campo]: valor });
  };

  return (
    <fieldset className='border border-gray-200 p-5 space-y-4'>
      <legend className='text-sm font-semibold text-purple-800 px-1'>{titulo}</legend>

      <div>
        <label className='block text-sm font-medium text-gray-700 mb-1'>Nombre</label>
        <input
          type='text'
          value={valores.nombre}
          onChange={actualizar('nombre')}
          className='w-full border border-gray-300 rounded px-3 py-2'
          placeholder='Para identificarla en el resultado'
          required
        />
      </div>

      <div>
        <label className='block text-sm font-medium text-gray-700 mb-1'>Fecha de nacimiento</label>
        <input
          type='date'
          value={valores.fecha}
          onChange={actualizar('fecha')}
          className='w-full border border-gray-300 rounded px-3 py-2'
          required
        />
      </div>

      <div>
        <label className='block text-sm font-medium text-gray-700 mb-1'>Hora de nacimiento</label>
        <input
          type='time'
          value={valores.hora}
          onChange={actualizar('hora')}
          disabled={valores.horaDesconocida}
          className='w-full border border-gray-300 rounded px-3 py-2 disabled:bg-gray-100'
        />
        <label className='flex items-center gap-2 mt-2 text-sm text-gray-600'>
          <input type='checkbox' checked={valores.horaDesconocida} onChange={actualizar('horaDesconocida')} />
          No sé la hora exacta
        </label>
      </div>

      <div>
        <label className='block text-sm font-medium text-gray-700 mb-1'>Ciudad de nacimiento</label>
        <select
          value={valores.ciudadIndex}
          onChange={actualizar('ciudadIndex')}
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
    </fieldset>
  );
};

export default PersonaNacimientoForm;
