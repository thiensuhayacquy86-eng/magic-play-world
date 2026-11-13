import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';

interface ResilientImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackTitle?: string;
  fallbackBg?: string;
}

export const ResilientImage: React.FC<ResilientImageProps> = ({
  src,
  alt,
  className = '',
  fallbackTitle,
  fallbackBg = 'linear-gradient(135deg, #E0F2FE 0%, #FEF3C7 100%)',
}) => {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div
        className={`flex flex-col items-center justify-center p-4 text-center ${className}`}
        style={{ background: fallbackBg }}
        role="img"
        aria-label={alt}
      >
        <Sparkles className="w-8 h-8 text-amber-500 mb-2" />
        {fallbackTitle && (
          <span className="font-display font-bold text-slate-700 text-sm">{fallbackTitle}</span>
        )}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
};
