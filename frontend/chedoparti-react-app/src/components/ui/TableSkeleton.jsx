import React from 'react';

/**
 * TableSkeleton - Skeleton loader para la tabla de reservas
 * Muestra un placeholder animado mientras se cargan los datos
 * 
 * @param {Object} props
 * @param {number} props.rows - Número de filas a mostrar (default: 12)
 * @param {number} props.cols - Número de columnas a mostrar (default: 4)
 * @param {boolean} props.showHeader - Mostrar header skeleton (default: true)
 */
export default function TableSkeleton({ rows = 12, cols = 4, showHeader = true }) {
  return (
    <div className="w-full overflow-x-auto animate-pulse">
      <table className="border rounded-lg bg-background-secondary dark:bg-navy-light text-xs md:text-sm w-full">
        {showHeader && (
          <thead>
            <tr>
              <th className="bg-background-secondary dark:bg-navy-light border p-2">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
              </th>
              {Array.from({ length: cols }).map((_, i) => (
                <th key={i} className="p-2 border">
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-20 mx-auto"></div>
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex} className="bg-background-secondary dark:bg-navy-light">
              <td className="bg-background-secondary dark:bg-navy-light border p-3">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-12 mx-auto shimmer"></div>
              </td>
              {Array.from({ length: cols }).map((_, colIndex) => (
                <td key={colIndex} className="p-3 border">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded shimmer"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto shimmer"></div>
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      

    </div>
  );
}

/**
 * CardSkeleton - Skeleton loader para cards
 */
export function CardSkeleton({ count = 3 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md animate-pulse">
          <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-4 shimmer"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2 shimmer"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6 shimmer"></div>
        </div>
      ))}
    </div>
  );
}

/**
 * ListSkeleton - Skeleton loader para listas
 */
export function ListSkeleton({ count = 5 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm animate-pulse flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full shimmer"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/3 shimmer"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3 shimmer"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
