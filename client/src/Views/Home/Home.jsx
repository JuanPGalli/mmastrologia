import React from 'react';
import './Home.css';

const Home = () => {
  return (
    <div className='pt-20'>
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
    </div>
  );
};

export default Home;
