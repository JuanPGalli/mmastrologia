import { useEffect, useRef, useState } from 'react';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Envuelve cualquier sección para que aparezca con un fade + slide sutil
 * cuando entra en el viewport, en vez de aparecer de golpe.
 *
 * No usa ninguna librería externa (IntersectionObserver nativo), así que
 * no suma peso al bundle. Respeta `prefers-reduced-motion`.
 *
 * Uso:
 *   <Reveal><section>...</section></Reveal>
 *   <Reveal as='section' delay={150} direction="left">...</Reveal>
 */
const Reveal = ({ children, as, delay = 0, direction = 'up', className = '', once = true }) => {
  const Tag = as || 'div';
  const ref = useRef(null);
  // Si el usuario prefiere menos movimiento, arranca visible directamente
  // (evita disparar un setState extra dentro del efecto).
  const [visible, setVisible] = useState(prefersReducedMotion);

  useEffect(() => {
    if (visible) return undefined;

    const node = ref.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (once) observer.unobserve(node);
        } else if (!once) {
          setVisible(false);
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [once, visible]);

  const offset =
    direction === 'up'
      ? 'translate-y-6'
      : direction === 'down'
        ? '-translate-y-6'
        : direction === 'left'
          ? 'translate-x-6'
          : direction === 'right'
            ? '-translate-x-6'
            : '';

  return (
    <Tag
      ref={ref}
      className={`transition-all duration-700 ease-out will-change-transform ${
        visible ? 'opacity-100 translate-x-0 translate-y-0' : `opacity-0 ${offset}`
      } ${className}`}
      style={{ transitionDelay: visible ? `${delay}ms` : '0ms' }}
    >
      {children}
    </Tag>
  );
};

export default Reveal;
