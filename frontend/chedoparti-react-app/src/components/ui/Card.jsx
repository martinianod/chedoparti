import React from 'react';
import { motion } from 'framer-motion';

/**
 * Card - Componente de tarjeta mejorado con variantes y animaciones
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Contenido de la card
 * @param {string} props.className - Clases CSS adicionales
 * @param {string} props.variant - Variante de estilo: 'default' | 'elevated' | 'outlined' | 'glass'
 * @param {boolean} props.hover - Habilitar efecto hover
 * @param {boolean} props.loading - Mostrar estado de carga
 * @param {Function} props.onClick - Handler de click
 * @param {boolean} props.animate - Habilitar animaciones de entrada
 */
export default function Card({ 
  children, 
  className = '', 
  variant = 'default',
  hover = false,
  loading = false,
  onClick,
  animate = false,
  ...props
}) {
  // Variantes de estilo
  const variants = {
    default: 'bg-white dark:bg-gray-800 shadow',
    elevated: 'bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl',
    outlined: 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700',
    glass: 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-lg',
  };

  const baseClasses = `rounded-2xl p-4 transition-all duration-300 ${variants[variant]}`;
  const hoverClasses = hover ? 'hover:scale-[1.02] cursor-pointer' : '';
  const clickableClasses = onClick ? 'cursor-pointer' : '';

  const Component = animate ? motion.div : 'div';
  const animationProps = animate ? {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 },
  } : {};

  if (loading) {
    return (
      <div className={`${baseClasses} ${className} animate-pulse`}>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <Component
      className={`${baseClasses} ${hoverClasses} ${clickableClasses} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      {...animationProps}
      {...props}
    >
      {children}
    </Component>
  );
}

/**
 * CardHeader - Header de card con título y acciones
 */
export function CardHeader({ title, subtitle, action, className = '' }) {
  return (
    <div className={`flex items-start justify-between mb-4 ${className}`}>
      <div>
        <h3 className="text-lg font-bold text-navy dark:text-gold">{title}</h3>
        {subtitle && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{subtitle}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

/**
 * CardBody - Cuerpo de card con padding opcional
 */
export function CardBody({ children, className = '', noPadding = false }) {
  return (
    <div className={`${noPadding ? '' : 'py-2'} ${className}`}>
      {children}
    </div>
  );
}

/**
 * CardFooter - Footer de card con acciones
 */
export function CardFooter({ children, className = '' }) {
  return (
    <div className={`flex items-center gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 ${className}`}>
      {children}
    </div>
  );
}
