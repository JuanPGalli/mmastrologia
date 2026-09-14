import { Helmet } from 'react-helmet-async';

const SITE_NAME = 'María Marta Galli | Astróloga y terapeuta holística';
const SITE_URL = 'https://mariamartagalli.com.ar';
const DEFAULT_DESCRIPTION =
  'Astrología psicológica y evolutiva. Consultas personalizadas para el autoconocimiento y bienestar emocional.';
const DEFAULT_IMAGE = 'https://res.cloudinary.com/ydsjcgim/image/upload/v1788280251/mapa_astral.png';

/**
 * Inyecta <title> y metatags por página. Google lee estas etiquetas para
 * armar el resultado de búsqueda (título azul + descripción gris), y como
 * es una SPA necesitan cambiar en cada navegación — sin esto, todas las
 * páginas comparten el mismo título/descripción del index.html.
 *
 * Uso: <Seo title="Blog" description="..." /> dentro de cualquier vista.
 */
const Seo = ({ title, description, image, path, noIndex }) => {
  const fullTitle = title ? `${title} | María Marta Galli` : SITE_NAME;
  const finalDescription = description || DEFAULT_DESCRIPTION;
  const url = path ? `${SITE_URL}${path}` : SITE_URL;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name='description' content={finalDescription} />
      <link rel='canonical' href={url} />
      {noIndex && <meta name='robots' content='noindex, nofollow' />}

      <meta property='og:type' content='website' />
      <meta property='og:site_name' content='María Marta Galli' />
      <meta property='og:title' content={fullTitle} />
      <meta property='og:description' content={finalDescription} />
      <meta property='og:url' content={url} />
      <meta property='og:image' content={image || DEFAULT_IMAGE} />

      <meta name='twitter:card' content='summary_large_image' />
      <meta name='twitter:title' content={fullTitle} />
      <meta name='twitter:description' content={finalDescription} />
      <meta name='twitter:image' content={image || DEFAULT_IMAGE} />
    </Helmet>
  );
};

export default Seo;
