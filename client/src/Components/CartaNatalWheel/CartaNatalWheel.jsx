// Rueda de carta natal en SVG puro — nada de esto depende de la IA, son
// ángulos calculados a partir de los grados que ya devuelve el backend
// (astrologyService.calcularDatosRueda). Convención astrológica: 0° Aries
// se dibuja en el borde izquierdo (9 en punto) y los grados avanzan en
// sentido ANTIHORARIO alrededor del círculo — así es como se dibuja una
// carta natal tradicionalmente.

const SIGNOS = [
  { simbolo: '♈', nombre: 'Aries' },
  { simbolo: '♉', nombre: 'Tauro' },
  { simbolo: '♊', nombre: 'Géminis' },
  { simbolo: '♋', nombre: 'Cáncer' },
  { simbolo: '♌', nombre: 'Leo' },
  { simbolo: '♍', nombre: 'Virgo' },
  { simbolo: '♎', nombre: 'Libra' },
  { simbolo: '♏', nombre: 'Escorpio' },
  { simbolo: '♐', nombre: 'Sagitario' },
  { simbolo: '♑', nombre: 'Capricornio' },
  { simbolo: '♒', nombre: 'Acuario' },
  { simbolo: '♓', nombre: 'Piscis' },
];

const GLIFOS_PLANETAS = {
  sun: '☉',
  moon: '☽',
  mercury: '☿',
  venus: '♀',
  mars: '♂',
  jupiter: '♃',
  saturn: '♄',
  uranus: '♅',
  neptune: '♆',
  pluto: '♇',
};

const SIZE = 340;
const CENTER = SIZE / 2;
const R_OUTER = 160;
const R_SIGNS = 140;
const R_PLANETS = 108;
const R_INNER = 92;

// grado eclíptico -> radianes de dibujo (0° a la izquierda, antihorario)
const gradoARadianes = (grado) => Math.PI - (grado * Math.PI) / 180;

const punto = (grado, radio) => ({
  x: CENTER + radio * Math.cos(gradoARadianes(grado)),
  y: CENTER - radio * Math.sin(gradoARadianes(grado)),
});

const CartaNatalWheel = ({ rueda }) => {
  if (!rueda) return null;

  // Agrupa planetas que caen muy cerca en grado para no superponer los
  // glifos (ej. Sol y Mercurio suelen estar a pocos grados de distancia).
  const planetasOrdenados = [...rueda.planetas].sort((a, b) => a.grado - b.grado);
  const posicionesPlanetas = [];
  planetasOrdenados.forEach((p) => {
    let radio = R_PLANETS;
    const cercano = posicionesPlanetas.find((otro) => {
      const diff = Math.min(Math.abs(otro.grado - p.grado), 360 - Math.abs(otro.grado - p.grado));
      return diff < 6 && otro.radio === radio;
    });
    if (cercano) radio -= 20;
    posicionesPlanetas.push({ ...p, radio });
  });

  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className='w-full max-w-xs mx-auto' role='img' aria-label='Carta natal'>
      {/* Anillo del zodíaco */}
      <circle cx={CENTER} cy={CENTER} r={R_OUTER} fill='none' stroke='#c4b5fd' strokeWidth='1' />
      <circle cx={CENTER} cy={CENTER} r={R_INNER} fill='none' stroke='#c4b5fd' strokeWidth='1' />

      {/* 12 divisiones de 30° + símbolo de cada signo */}
      {SIGNOS.map((signo, i) => {
        const gradoInicio = i * 30;
        const borde = punto(gradoInicio, R_OUTER);
        const centroSigno = punto(gradoInicio + 15, R_SIGNS);
        return (
          <g key={signo.nombre}>
            <line x1={CENTER} y1={CENTER} x2={borde.x} y2={borde.y} stroke='#e9d5ff' strokeWidth='1' />
            <text
              x={centroSigno.x}
              y={centroSigno.y}
              textAnchor='middle'
              dominantBaseline='middle'
              fontSize='14'
              fill='#7c3aed'
            >
              {signo.simbolo}
            </text>
          </g>
        );
      })}

      {/* Cúspides de las 12 casas (solo si se conoce la hora) */}
      {rueda.horaConocida &&
        rueda.casas?.map((grado, i) => {
          const extremo = punto(grado, R_INNER);
          const numero = punto(grado + 10, R_INNER - 16);
          return (
            <g key={`casa-${i}`}>
              <line
                x1={CENTER}
                y1={CENTER}
                x2={extremo.x}
                y2={extremo.y}
                stroke='#a78bfa'
                strokeWidth={i === 0 ? 2 : 0.75}
              />
              <text x={numero.x} y={numero.y} textAnchor='middle' fontSize='9' fill='#a78bfa'>
                {i + 1}
              </text>
            </g>
          );
        })}

      {/* Planetas */}
      {posicionesPlanetas.map((p) => {
        const pos = punto(p.grado, p.radio);
        return (
          <text
            key={p.nombre}
            x={pos.x}
            y={pos.y}
            textAnchor='middle'
            dominantBaseline='middle'
            fontSize='16'
            fill='#581c87'
          >
            {GLIFOS_PLANETAS[p.nombre] || '•'}
          </text>
        );
      })}
    </svg>
  );
};

export default CartaNatalWheel;
