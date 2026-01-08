import React from 'react';
import './Home.css';
const img_transparent = '/logo_transparente.png';
const img_mapa_astral = '/mapa_astral.png';

const Home = () => {
  return (
    <div className='pt-20 bg-[linear-gradient(90deg,#D4ACFB,#B84FCE)]'>
      <h1>Astróloga y terapeuta holística</h1>
      <p>
        María Marta Galli es astróloga y terapeuta holística, especializada en astrología
        psicológica y evolutiva. Acompaña procesos de autoconocimiento, transformación personal y
        bienestar emocional, ayudando a comprender los ciclos de vida y a tomar decisiones con mayor
        claridad.
      </p>
      <p>
        A través de la interpretación de la carta natal y herramientas energéticas, ofrece un
        espacio de guía y escucha profunda para quienes buscan vivir con mayor conciencia y conexión
        con su esencia.
      </p>
      <a href='/about'>👉 Conocé más sobre mí</a>
      <img src={img_transparent} alt='' />
      <img src={img_mapa_astral} alt='' />
    </div>
  );
};

export default Home;
