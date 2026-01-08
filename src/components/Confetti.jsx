import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

/**
 * Componente de Confetti
 * Exibe animação de confete ao quitar dívida
 */
const Confetti = ({ show, onComplete }) => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (!show) {
      setParticles([]);
      return;
    }

    // Gerar partículas de confete
    const newParticles = [];
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f7b731', '#5f27cd', '#00d2d3', '#ff9ff3'];
    const shapes = ['circle', 'square'];

    for (let i = 0; i < 50; i++) {
      const translateX = Math.random() * 100;
      const direction = Math.random() > 0.5 ? 1 : -1;
      
      newParticles.push({
        id: i,
        left: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        delay: Math.random() * 0.5,
        duration: 2 + Math.random() * 2,
        rotate: Math.random() * 360,
        translateX,
        direction,
      });
    }

    setParticles(newParticles);

    // Limpar após animação
    const timeout = setTimeout(() => {
      setParticles([]);
      if (onComplete) onComplete();
    }, 4000);

    return () => clearTimeout(timeout);
  }, [show, onComplete]);

  if (!show || particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute animate-confetti-fall"
          style={{
            left: `${particle.left}%`,
            top: '-10px',
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
            '--translate-x': `${particle.direction * particle.translateX}px`,
          }}
        >
          <div
            className={`w-3 h-3 ${
              particle.shape === 'circle' ? 'rounded-full' : 'rounded-sm'
            } animate-confetti-spin`}
            style={{
              backgroundColor: particle.color,
              animationDuration: `${particle.duration}s`,
              transform: `rotate(${particle.rotate}deg)`,
            }}
          />
        </div>
      ))}
      <style>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(0) translateX(0);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) translateX(var(--translate-x));
            opacity: 0;
          }
        }
        @keyframes confetti-spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(720deg);
          }
        }
        .animate-confetti-fall {
          animation: confetti-fall linear forwards;
        }
        .animate-confetti-spin {
          animation: confetti-spin linear infinite;
        }
      `}</style>
    </div>
  );
};

Confetti.propTypes = {
  show: PropTypes.bool.isRequired,
  onComplete: PropTypes.func,
};

export default Confetti;
