import React from 'react';

const Services = () => {
  let consultas = [
    'Astrologia',
    'Constelaciones familiares',
    'Registros Akashicos',
    'Reiki',
    'Lectura de Runas',
    'Lectura de Tarot',
  ];
  return (
    <ul>
      {consultas.map((element, index) => (
        <li key={index}>{element}</li>
      ))}
    </ul>
  );
};

export default Services;
