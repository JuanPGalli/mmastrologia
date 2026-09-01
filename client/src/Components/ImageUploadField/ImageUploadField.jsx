import { useRef, useState } from 'react';
import { FaUpload } from 'react-icons/fa6';
import { cloudinaryUrl, isCloudinaryConfigured, uploadImageToCloudinary } from '../../utils/cloudinary';

/**
 * Se integra con el mismo patrón `updateField(event)` que ya usan los
 * formularios de admin: al terminar de subir, dispara
 * onChange({ target: { name, value: secure_url } }) como si fuera un
 * input de texto normal, así no hay que tocar la lógica del formulario.
 */
const ImageUploadField = ({ name, value, onChange, label = 'Imagen' }) => {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  const setValue = (url) => {
    onChange({ target: { name, value: url } });
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setError('');
    setUploading(true);
    setProgress(0);

    try {
      const url = await uploadImageToCloudinary(file, setProgress);
      setValue(url);
    } catch (err) {
      setError(err.message || 'No se pudo subir la imagen.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className='block md:col-span-2'>
      <span className='text-sm text-gray-600'>{label}</span>

      <div className='mt-1 flex flex-col sm:flex-row gap-3'>
        <input
          name={name}
          value={value}
          onChange={onChange}
          placeholder='https://... (o subí un archivo)'
          className='flex-1 border border-gray-200 px-3 py-2'
        />

        {isCloudinaryConfigured() && (
          <>
            <button
              type='button'
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className='inline-flex items-center justify-center gap-2 border border-purple-800 text-purple-800 px-4 py-2 text-sm whitespace-nowrap hover:bg-purple-800 hover:text-white transition disabled:opacity-50'
            >
              <FaUpload aria-hidden='true' />
              {uploading ? `Subiendo... ${progress}%` : 'Subir imagen'}
            </button>
            <input
              ref={fileInputRef}
              type='file'
              accept='image/*'
              onChange={handleFileChange}
              className='hidden'
            />
          </>
        )}
      </div>

      {error && <p className='text-sm text-red-600 mt-1'>{error}</p>}

      {value && (
        <img
          src={cloudinaryUrl(value, 'f_auto,q_auto,w_300')}
          alt=''
          className='mt-3 h-24 w-40 object-cover border border-gray-200'
        />
      )}
    </div>
  );
};

export default ImageUploadField;
