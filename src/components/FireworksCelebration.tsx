import React, { useMemo } from 'react';

interface FireworksCelebrationProps {
  active: boolean;
}

const COLORS = ['#F59E0B', '#0EA5E9', '#10B981', '#EC4899', '#8B5CF6', '#F97316'];

export const FireworksCelebration: React.FC<FireworksCelebrationProps> = ({ active }) => {
  const particles = useMemo(() => {
    return Array.from({ length: 28 }).map((_, idx) => ({
      id: idx,
      left: `${5 + ((idx * 17) % 90)}%`,
      top: `${8 + ((idx * 23) % 72)}%`,
      color: COLORS[idx % COLORS.length],
      size: 8 + (idx % 4) * 4,
      delay: `${(idx % 7) * 0.14}s`,
      shape: idx % 3 === 0 ? '★' : idx % 3 === 1 ? '●' : '✦',
    }));
  }, []);

  if (!active) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-40 overflow-hidden"
    >
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute animate-sparkle select-none font-bold"
          style={{
            left: p.left,
            top: p.top,
            color: p.color,
            fontSize: `${p.size * 1.4}px`,
            animationDelay: p.delay,
          }}
        >
          {p.shape}
        </span>
      ))}
    </div>
  );
};
