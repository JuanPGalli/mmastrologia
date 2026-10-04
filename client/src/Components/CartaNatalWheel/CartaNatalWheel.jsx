import { useState } from 'react';
import { createPortal } from 'react-dom';
import { FaExpand, FaXmark } from 'react-icons/fa6';

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
const PASO_RADIO = 18; // cuánto se achica el radio por cada planeta apilado en el mismo sector

const gradoARadianes = (grado) => Math.PI - (grado * Math.PI) / 180;

const punto = (grado, radio) => ({
  x: CENTER + radio * Math.cos(gradoARadianes(grado)),
  y: CENTER - radio * Math.sin(gradoARadianes(grado)),
});

// Ordena los planetas por grado y, cuando dos (o más) quedan a menos de 6°
// de distancia, los va acomodando en radios cada vez más chicos en vez de
// comparar solo contra el primero — así tres o más planetas pegados no
// terminan todos en el mismo lugar.
const calcularPosiciones = (planetas) => {
  const ordenados = [...planetas].sort((a, b) => a.grado - b.grado);
  const posiciones = [];
  let gradoAnterior = null;
  let nivel = 0;

  ordenados.forEach((p) => {
    if (gradoAnterior !== null) {
      const diff = Math.min(Math.abs(p.grado - gradoAnterior), 360 - Math.abs(p.grado - gradoAnterior));
      nivel = diff < 6 ? nivel + 1 : 0;
    }
    posiciones.push({ ...p, radio: R_PLANETS - nivel * PASO_RADIO });
    gradoAnterior = p.grado;
  });

  return posiciones;
};

const DibujoRueda = ({ rueda }) => {
  const posicionesPlanetas = calcularPosiciones(rueda.planetas);

  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className='w-full h-full' role='img' aria-label='Carta natal'>
      <circle cx={CENTER} cy={CENTER} r={R_OUTER} fill='none' stroke='#c4b5fd' strokeWidth='1' />
      <circle cx={CENTER} cy={CENTER} r={R_INNER} fill='none' stroke='#c4b5fd' strokeWidth='1' />

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

const CartaNatalWheel = ({ rueda }) => {
  const [abierta, setAbierta] = useState(false);

  if (!rueda) return null;

  return (
    <>
      <button
        type='button'
        onClick={() => setAbierta(true)}
        className='relative w-full max-w-xs mx-auto block group'
        aria-label='Ver carta natal más grande'
      >
        <DibujoRueda rueda={rueda} />
        <span className='absolute bottom-1 right-1 bg-white/90 rounded-full p-1.5 text-purple-700 shadow group-hover:bg-white'>
          <FaExpand size={12} />
        </span>
      </button>

      {abierta &&
        createPortal(
          <div
            className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-purple-950/70 backdrop-blur-sm'
            onClick={() => setAbierta(false)}
          >
            <div
              className='bg-white rounded-lg shadow-2xl p-6 relative w-full max-w-lg'
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type='button'
                onClick={() => setAbierta(false)}
                aria-label='Cerrar'
                className='absolute top-3 right-3 bg-purple-50 rounded-full p-2 text-purple-950 hover:bg-purple-100'
              >
                <FaXmark aria-hidden='true' />
              </button>
              <DibujoRueda rueda={rueda} />
            </div>
          </div>,
          document.body
        )}
    </>
  );
};

export default CartaNatalWheel;
