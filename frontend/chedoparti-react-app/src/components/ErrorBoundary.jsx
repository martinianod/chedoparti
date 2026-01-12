import React from 'react';
import * as Sentry from '@sentry/react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import Button from './ui/Button';

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Algo salió mal
        </h2>
        
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Lo sentimos, ha ocurrido un error inesperado. Nuestro equipo ha sido notificado.
        </p>

        {import.meta.env.DEV && error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-left overflow-auto max-h-40">
            <p className="font-mono text-xs text-red-800 dark:text-red-200 break-all">
              {error.toString()}
            </p>
          </div>
        )}

        <div className="flex justify-center">
          <Button 
            onClick={resetErrorBoundary}
            variant="primary"
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Intentar de nuevo
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function AppErrorBoundary({ children }) {
  return (
    <Sentry.ErrorBoundary
      fallback={ErrorFallback}
      showDialog={false}
      beforeCapture={(scope) => {
        // Add extra context if needed
      }}
    >
      {children}
    </Sentry.ErrorBoundary>
  );
}
