import React from 'react';
import usePermissions from '../hooks/usePermissions';
import AdminDashboard from './Admin/Dashboard';
import CoachDashboard from './Coach/Dashboard';
import SocioDashboard from '../features/socio-dashboard';
import { useTranslation } from 'react-i18next';

export default function Dashboard() {
  const { isCoach, isSocio, isAdmin, isStaff, isViewer } = usePermissions();
  const { t } = useTranslation();

  if (isAdmin() || isStaff() || isViewer()) {
    return <AdminDashboard />;
  }

  if (isCoach()) {
    return <CoachDashboard />;
  }

  if (isSocio()) {
    return <SocioDashboard />;
  }

  // Fallback for unknown roles or unauthenticated (though ProtectedRoute should handle auth)
  return (
    <div className="p-8 text-center">
      <h1 className="text-2xl font-bold text-navy dark:text-gold mb-4">
        {t('app.title')}
      </h1>
      <p className="text-gray-600 dark:text-gray-400">
        Bienvenido. No tienes un rol asignado para ver un panel específico.
      </p>
    </div>
  );
}
