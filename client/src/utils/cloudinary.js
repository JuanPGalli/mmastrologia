const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export const isCloudinaryConfigured = () => Boolean(CLOUD_NAME && UPLOAD_PRESET);

/**
 * Sube una imagen directo desde el navegador a Cloudinary (unsigned upload,
 * no requiere ningún secreto en el frontend). Devuelve la `secure_url` final.
 *
 * onProgress(percent) es opcional, para mostrar una barra de progreso.
 */
export const uploadImageToCloudinary = (file, onProgress) => {
  if (!isCloudinaryConfigured()) {
    return Promise.reject(
      new Error(
        'Cloudinary no está configurado. Definí VITE_CLOUDINARY_CLOUD_NAME y VITE_CLOUDINARY_UPLOAD_PRESET.'
      )
    );
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('folder', 'mmastrologia');

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`);

    xhr.upload.onprogress = (event) => {
      if (onProgress && event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300 && data.secure_url) {
          resolve(data.secure_url);
        } else {
          reject(new Error(data.error?.message || 'No se pudo subir la imagen.'));
        }
      } catch {
        reject(new Error('Respuesta inesperada de Cloudinary.'));
      }
    };

    xhr.onerror = () => reject(new Error('Error de red al subir la imagen.'));
    xhr.send(formData);
  });
};

/**
 * Dada una URL de imagen (de Cloudinary o externa) devuelve una versión
 * optimizada: formato automático (WebP/AVIF), calidad automática y ancho
 * fijo. Si la URL no es de Cloudinary, la devuelve intacta (para no romper
 * links externos ya cargados antes de esta migración).
 *
 * Ejemplo: cloudinaryUrl(url, 'w_400') -> miniatura liviana para una card.
 */
export const cloudinaryUrl = (url, transformations = 'f_auto,q_auto') => {
  if (!url || !url.includes('res.cloudinary.com') || !url.includes('/upload/')) {
    return url;
  }

  return url.replace('/upload/', `/upload/${transformations}/`);
};
