import React from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import useAuth from '../../hooks/useAuth';
import useStudents from '../../hooks/useStudents';
import useGroups from '../../hooks/useGroups';

/**
 * Coach Dashboard - KPI Hub
 * Main dashboard with navigation cards and key metrics
 */
export default function CoachDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch data for KPIs
  const { students = [], isLoading: studentsLoading } = useStudents(user?.id);
  const { groups = [], isLoading: groupsLoading } = useGroups(user?.id);

  const activeGroups = groups.filter((g) => !g.isArchived);
  const totalStudents = students.length;
  const totalGroups = activeGroups.length;

  // Navigation cards configuration
  const navigationCards = [
    {
      title: 'Alumnos',
      description: 'Gestiona tus alumnos',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      path: '/coach/students',
      color: 'blue',
      stat: totalStudents,
      statLabel: 'alumnos',
    },
    {
      title: 'Grupos',
      description: 'Organiza en grupos',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      path: '/coach/groups',
      color: 'green',
      stat: totalGroups,
      statLabel: 'grupos activos',
    },
    {
      title: 'Horarios',
      description: 'Programa tus clases',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      path: '/coach/schedule',
      color: 'purple',
      stat: '0',
      statLabel: 'clases esta semana',
    },
    {
      title: 'Asistencia',
      description: 'Control de presentismo',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      path: '/coach/attendance',
      color: 'green',
      stat: '95%',
      statLabel: 'asistencia promedio',
    },
  ];

  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    amber: 'bg-amber-500',
  };

  const isLoading = studentsLoading || groupsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy dark:border-gold" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <Card className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-navy dark:text-gold mb-2">
          ¡Hola, {user?.name}!
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Bienvenido a tu panel de entrenador. Gestiona tus alumnos, grupos y clases.
        </p>
      </Card>

      {/* Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {navigationCards.map((card) => (
          <button
            key={card.path}
            onClick={() => navigate(card.path)}
            className="group relative bg-white dark:bg-navy-light border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:border-navy dark:hover:border-gold hover:shadow-lg transition-all duration-200 text-left"
          >
            <div className={`inline-flex p-3 rounded-lg ${colorClasses[card.color]} bg-opacity-10 mb-4`}>
              <div className={`text-${card.color}-600 dark:text-${card.color}-400`}>
                {card.icon}
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
              {card.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {card.description}
            </p>

            {/* Stat */}
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-navy dark:text-gold">
                {card.stat}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {card.statLabel}
              </span>
            </div>

            {/* Arrow */}
            <div className="absolute top-6 right-6 text-gray-400 group-hover:text-navy dark:group-hover:text-gold transition-colors">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <h2 className="text-xl font-bold text-navy dark:text-gold mb-4">
          Acciones Rápidas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/coach/students')}
            className="btn btn-primary justify-center"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Agregar Alumno
          </button>
          <button
            onClick={() => navigate('/coach/groups')}
            className="btn btn-primary justify-center"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Crear Grupo
          </button>
          <button
            onClick={() => navigate('/coach/schedule')}
            className="btn btn-primary justify-center"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Programar Clase
          </button>
        </div>
      </Card>
    </div>
  );
}
