/**
 * Performance Optimization Utilities
 * Utilidades para mejorar el rendimiento de la aplicación
 */

import { queryClient, reservationKeys } from '../store/queryClient';
import { addDaysArgentina } from './dateUtils';

/**
 * Prefetch de reservas para días adyacentes
 * Mejora la UX al navegar entre días
 * @param {string} currentDate - Fecha actual en formato YYYY-MM-DD
 * @param {Function} fetchFn - Función para obtener reservas
 */
export async function prefetchAdjacentDays(currentDate, fetchFn) {
  if (!currentDate || !fetchFn) return;

  try {
    // Prefetch día anterior
    const previousDay = addDaysArgentina(currentDate, -1);
    await queryClient.prefetchQuery({
      queryKey: reservationKeys.byDate(previousDay),
      queryFn: () => fetchFn(previousDay),
      staleTime: 1000 * 60 * 5, // 5 minutos
    });

    // Prefetch día siguiente
    const nextDay = addDaysArgentina(currentDate, 1);
    await queryClient.prefetchQuery({
      queryKey: reservationKeys.byDate(nextDay),
      queryFn: () => fetchFn(nextDay),
      staleTime: 1000 * 60 * 5,
    });
  } catch (error) {
    console.warn('Error prefetching adjacent days:', error);
  }
}

/**
 * Prefetch de semana completa
 * Para vista semanal
 * @param {string} startDate - Fecha de inicio de la semana
 * @param {Function} fetchFn - Función para obtener reservas
 */
export async function prefetchWeek(startDate, fetchFn) {
  if (!startDate || !fetchFn) return;

  const promises = [];

  for (let i = 0; i < 7; i++) {
    const date = addDaysArgentina(startDate, i);
    promises.push(
      queryClient.prefetchQuery({
        queryKey: reservationKeys.byDate(date),
        queryFn: () => fetchFn(date),
        staleTime: 1000 * 60 * 5,
      })
    );
  }

  try {
    await Promise.all(promises);
  } catch (error) {
    console.warn('Error prefetching week:', error);
  }
}

/**
 * Debounce function para optimizar búsquedas y filtros
 * @param {Function} func - Función a ejecutar
 * @param {number} wait - Tiempo de espera en ms
 * @returns {Function} Función debounced
 */
export function debounce(func, wait = 300) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function para limitar ejecuciones
 * @param {Function} func - Función a ejecutar
 * @param {number} limit - Tiempo mínimo entre ejecuciones en ms
 * @returns {Function} Función throttled
 */
export function throttle(func, limit = 300) {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Lazy load de componentes con retry
 * @param {Function} importFn - Función de import dinámico
 * @param {number} retries - Número de reintentos
 * @returns {Promise} Componente cargado
 */
export function lazyLoadWithRetry(importFn, retries = 3) {
  return new Promise((resolve, reject) => {
    importFn()
      .then(resolve)
      .catch((error) => {
        if (retries === 0) {
          reject(error);
          return;
        }

        setTimeout(() => {
          lazyLoadWithRetry(importFn, retries - 1)
            .then(resolve)
            .catch(reject);
        }, 1000);
      });
  });
}

/**
 * Memoización simple para funciones puras
 * @param {Function} fn - Función a memoizar
 * @returns {Function} Función memoizada
 */
export function memoize(fn) {
  const cache = new Map();

  return function memoized(...args) {
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = fn(...args);
    cache.set(key, result);

    // Limpiar cache si crece demasiado
    if (cache.size > 100) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }

    return result;
  };
}

/**
 * Batch de actualizaciones para reducir re-renders
 * @param {Function} callback - Función con actualizaciones
 */
export function batchUpdates(callback) {
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    window.requestIdleCallback(callback);
  } else {
    setTimeout(callback, 0);
  }
}

/**
 * Optimizar imágenes con lazy loading
 * @param {HTMLImageElement} img - Elemento de imagen
 */
export function optimizeImage(img) {
  if (!img) return;

  // Lazy loading nativo
  img.loading = 'lazy';

  // Decode async para no bloquear el thread principal
  if ('decode' in img) {
    img.decode().catch(() => {
      // Ignorar errores de decode
    });
  }
}

/**
 * Detectar si el usuario tiene conexión lenta
 * @returns {boolean} True si la conexión es lenta
 */
export function isSlowConnection() {
  if (typeof navigator === 'undefined' || !('connection' in navigator)) {
    return false;
  }

  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

  if (!connection) return false;

  // Considerar lenta si es 2G o saveData está activado
  return connection.effectiveType === '2g' || connection.saveData === true;
}

/**
 * Reducir calidad de datos en conexiones lentas
 * @param {Object} data - Datos originales
 * @returns {Object} Datos optimizados
 */
export function optimizeDataForSlowConnection(data) {
  if (!isSlowConnection()) return data;

  // Reducir cantidad de datos si la conexión es lenta
  if (Array.isArray(data)) {
    return data.slice(0, 50); // Limitar a 50 items
  }

  return data;
}

/**
 * Preload de recursos críticos
 * @param {string} url - URL del recurso
 * @param {string} as - Tipo de recurso ('script', 'style', 'image', etc.)
 */
export function preloadResource(url, as = 'script') {
  if (typeof document === 'undefined') return;

  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = as;
  link.href = url;
  document.head.appendChild(link);
}

/**
 * Limpiar cache de queries antiguas
 * @param {number} olderThanMs - Limpiar queries más antiguas que este tiempo (ms)
 */
export function cleanOldCache(olderThanMs = 1000 * 60 * 60) {
  // 1 hora por defecto
  queryClient.getQueryCache().findAll().forEach((query) => {
    const dataUpdatedAt = query.state.dataUpdatedAt;
    const now = Date.now();

    if (now - dataUpdatedAt > olderThanMs) {
      queryClient.removeQueries({ queryKey: query.queryKey });
    }
  });
}

/**
 * Monitorear performance de queries
 * @returns {Object} Estadísticas de queries
 */
export function getQueryStats() {
  const queries = queryClient.getQueryCache().findAll();

  return {
    total: queries.length,
    fetching: queries.filter((q) => q.state.isFetching).length,
    stale: queries.filter((q) => q.isStale()).length,
    inactive: queries.filter((q) => !q.getObserversCount()).length,
    cacheSize: queries.reduce((acc, q) => {
      const size = JSON.stringify(q.state.data).length;
      return acc + size;
    }, 0),
  };
}

/**
 * Hook helper para detectar si el componente está visible
 * Útil para lazy loading y optimizaciones
 */
export class IntersectionObserverHelper {
  constructor(callback, options = {}) {
    this.callback = callback;
    this.options = {
      root: null,
      rootMargin: '50px',
      threshold: 0.1,
      ...options,
    };
    this.observer = null;
  }

  observe(element) {
    if (!element || typeof IntersectionObserver === 'undefined') return;

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          this.callback(entry.target);
        }
      });
    }, this.options);

    this.observer.observe(element);
  }

  disconnect() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

export default {
  prefetchAdjacentDays,
  prefetchWeek,
  debounce,
  throttle,
  lazyLoadWithRetry,
  memoize,
  batchUpdates,
  optimizeImage,
  isSlowConnection,
  optimizeDataForSlowConnection,
  preloadResource,
  cleanOldCache,
  getQueryStats,
  IntersectionObserverHelper,
};
