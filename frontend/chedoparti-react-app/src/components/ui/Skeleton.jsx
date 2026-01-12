import React from 'react';

/**
 * Componente de Loading Skeleton para mejorar la UX durante la carga
 * 
 * @param {Object} props - Props del componente
 * @param {string} props.variant - Tipo de skeleton: 'text', 'circular', 'rectangular'
 * @param {string} props.width - Ancho del skeleton
 * @param {string} props.height - Alto del skeleton
 * @param {string} props.className - Clases adicionales
 * @param {number} props.count - Número de skeletons a renderizar (para variant='text')
 */
export default function Skeleton({
  variant = 'rectangular',
  width,
  height,
  className = '',
  count = 1,
}) {
  const baseClasses = 'animate-pulse bg-gray-200 dark:bg-gray-700';

  const variantClasses = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: 'rounded',
  };

  const style = {
    width: width || (variant === 'text' ? '100%' : undefined),
    height: height || (variant === 'text' ? undefined : '100%'),
  };

  if (variant === 'text' && count > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className={`${baseClasses} ${variantClasses[variant]} ${className}`}
            style={style}
            aria-hidden="true"
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
      aria-hidden="true"
      role="status"
      aria-label="Cargando..."
    />
  );
}

/**
 * Skeleton para tarjetas de reserva
 */
export function ReservationCardSkeleton() {
  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton variant="text" width="120px" />
        <Skeleton variant="circular" width="40px" height="40px" />
      </div>
      <Skeleton variant="text" count={3} />
      <div className="flex gap-2">
        <Skeleton variant="rectangular" width="80px" height="32px" />
        <Skeleton variant="rectangular" width="80px" height="32px" />
      </div>
    </div>
  );
}

/**
 * Skeleton para tabla de calendario
 */
export function CalendarGridSkeleton({ rows = 10, cols = 4 }) {
  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex gap-2">
        <Skeleton variant="rectangular" width="70px" height="40px" />
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} variant="rectangular" className="flex-1" height="40px" />
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-2">
          <Skeleton variant="rectangular" width="70px" height="60px" />
          {Array.from({ length: cols }).map((_, colIndex) => (
            <Skeleton key={colIndex} variant="rectangular" className="flex-1" height="60px" />
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton para lista de items
 */
export function ListSkeleton({ count = 5 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="flex items-center gap-3 p-3 border rounded">
          <Skeleton variant="circular" width="48px" height="48px" />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" width="60%" />
            <Skeleton variant="text" width="40%" />
          </div>
        </div>
      ))}
    </div>
  );
}
