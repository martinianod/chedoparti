import React from 'react';

/**
 * Loading Skeleton Component
 * Displays shimmer loading placeholders
 */
export default function LoadingSkeleton({ variant = 'card', count = 3 }) {
  const skeletons = {
    card: (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 animate-pulse">
        <div className="flex items-start gap-4">
          {/* Icon placeholder */}
          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg flex-shrink-0" />
          
          <div className="flex-1 space-y-3">
            {/* Title */}
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
            
            {/* Subtitle */}
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
            
            {/* Details */}
            <div className="flex gap-2">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20" />
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-24" />
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex gap-2">
            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </div>
      </div>
    ),
    
    stats: (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" />
          </div>
          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full" />
        </div>
      </div>
    ),
    
    list: (
      <div className="space-y-3">
        {/* Header */}
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 animate-pulse" />
        
        {/* Items */}
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      </div>
    ),
  };

  const SkeletonComponent = skeletons[variant] || skeletons.card;

  return (
    <div className="space-y-4">
      {[...Array(count)].map((_, index) => (
        <div key={index} style={{ animationDelay: `${index * 0.1}s` }}>
          {SkeletonComponent}
        </div>
      ))}
    </div>
  );
}
