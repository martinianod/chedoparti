import React from 'react';

/**
 * Capacity Indicator Component
 * Shows used/total capacity with progress bar
 */
export default function CapacityIndicator({ used = 0, total = 12, className = '', showBar = true }) {
  const percentage = total > 0 ? (used / total) * 100 : 0;
  const isOverCapacity = used > total;
  const isNearCapacity = percentage >= 80 && !isOverCapacity;

  const getColor = () => {
    if (isOverCapacity) return 'text-red-600 dark:text-red-400';
    if (isNearCapacity) return 'text-amber-600 dark:text-amber-400';
    return 'text-gray-700 dark:text-gray-300';
  };

  const getBarColor = () => {
    if (isOverCapacity) return 'bg-red-500';
    if (isNearCapacity) return 'bg-amber-500';
    return 'bg-green-500';
  };

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <div className={`flex items-center gap-2 text-sm font-medium ${getColor()}`}>
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        <span>
          {used}/{total}
        </span>
        {isOverCapacity && (
          <span className="text-xs font-normal">(Sobre capacidad)</span>
        )}
      </div>
      
      {showBar && (
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${getBarColor()}`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      )}
    </div>
  );
}
