import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import Card from '../../components/ui/Card';
import ClassCard from '../../components/student/ClassCard';
import ReservationCard from '../../components/student/ReservationCard';
import DashboardFilters from '../../components/student/DashboardFilters';
import ReservationFormModalNew from '../../components/ui/ReservationFormModalNew';
import useAuth from '../../hooks/useAuth';
import { useStudentClasses, useAttendanceConfirmation } from '../../hooks/useStudentClasses';
import { useReservationsByDate, useCancelReservation } from '../../hooks/useReservationSync';
import { getArgentinaDate, addDaysArgentina } from '../../utils/dateUtils';
import { useAppNotifications } from '../../hooks/useAppNotifications';

/**
 * Enhanced Student Dashboard
 * Shows classes and reservations with clear visual separation
 */
export default function EnhancedStudentDashboard() {
  const { user } = useAuth();
  const { reservation: notifications } = useAppNotifications();
  
  // View state
  const [dateRange, setDateRange] = useState({
    start: getArgentinaDate(),
    end: addDaysArgentina(getArgentinaDate(), 7)
  });
  const [viewMode, setViewMode] = useState('weekly'); // weekly | daily
  const [filterType, setFilterType] = useState('all'); // all | classes | reservations
  const [showClasses, setShowClasses] = useState(true);
  const [showReservations, setShowReservations] = useState(true);
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);

  // Fetch data
  const { classes, isLoading: classesLoading } = useStudentClasses(
    user?.id,
    dateRange.start,
    dateRange.end
  );

  const { reservations, isLoading: reservationsLoading } = useReservationsByDate(
    dateRange.start
  );

  // Mutations
  const { confirmAttendance } = useAttendanceConfirmation();
  const cancelReservationMutation = useCancelReservation();

  // Filter data
  const filteredClasses = useMemo(() => {
    if (filterType === 'reservations') return [];
    return classes || [];
  }, [classes, filterType]);

  const filteredReservations = useMemo(() => {
    if (filterType === 'classes') return [];
    return (reservations || []).filter(r => 
      r.status !== 'cancelled' && r.status !== 'deleted'
    );
  }, [reservations, filterType]);

  // Handlers
  const handleConfirmAttendance = async (classId) => {
    confirmAttendance(classId, 'confirmed');
  };

  const handleDeclineAttendance = async (classId) => {
    confirmAttendance(classId, 'declined');
  };

  const handleCancelReservation = async (reservation) => {
    try {
      await cancelReservationMutation.mutateAsync({ 
        id: reservation.id,
        reason: 'Cancelado por el usuario desde el dashboard'
      });
      notifications.cancelSuccess();
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      notifications.cancelError(error.message);
    }
  };

  const handleClassDetail = (classData) => {
    // TODO: Open class detail modal
    console.log('Class detail:', classData);
  };

  const handleReservationDetail = (reservation) => {
    setModalData(reservation);
    setModalOpen(true);
  };

  const isLoading = classesLoading || reservationsLoading;

  if (isLoading && !classes && !reservations) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy dark:border-gold" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Header */}
      <Card className="rounded-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-navy dark:text-gold mb-1">
              ¡Hola, {user?.name}!
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Aquí están tus clases y reservas
            </p>
          </div>

          {/* Quick Stats */}
          <div className="flex gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {filteredClasses.length}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Clases</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {filteredReservations.length}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Reservas</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Filters */}
      <DashboardFilters
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        filterType={filterType}
        onFilterTypeChange={setFilterType}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
      />

      {/* Classes Section */}
      {filteredClasses.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              <h2 className="text-xl font-bold text-navy dark:text-gold">
                Mis Clases ({filteredClasses.length})
              </h2>
            </div>
            <button
              onClick={() => setShowClasses(!showClasses)}
              className="btn btn-ghost flex items-center gap-1 text-sm"
            >
              {showClasses ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              {showClasses ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>

          <AnimatePresence>
            {showClasses && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-4 overflow-hidden"
              >
                {filteredClasses.map(classData => (
                  <ClassCard
                    key={classData.id}
                    classData={classData}
                    onConfirm={handleConfirmAttendance}
                    onDecline={handleDeclineAttendance}
                    onDetailClick={handleClassDetail}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Reservations Section */}
      {filteredReservations.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-6 h-6 text-green-600 dark:text-green-400" />
              <h2 className="text-xl font-bold text-navy dark:text-gold">
                Mis Reservas ({filteredReservations.length})
              </h2>
            </div>
            <button
              onClick={() => setShowReservations(!showReservations)}
              className="btn btn-ghost flex items-center gap-1 text-sm"
            >
              {showReservations ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              {showReservations ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>

          <AnimatePresence>
            {showReservations && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-4 overflow-hidden"
              >
                {filteredReservations.map(reservation => (
                  <ReservationCard
                    key={reservation.id}
                    reservation={reservation}
                    onCancel={handleCancelReservation}
                    onDetailClick={handleReservationDetail}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Empty State */}
      {filteredClasses.length === 0 && filteredReservations.length === 0 && (
        <Card className="text-center py-12 rounded-xl">
          <div className="flex flex-col items-center gap-4">
            <div className="text-6xl">📅</div>
            <div>
              <h3 className="text-xl font-bold text-navy dark:text-gold mb-2">
                No hay actividades programadas
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                No tienes clases ni reservas para este período
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Reservation Modal */}
      <ReservationFormModalNew
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setModalData(null);
        }}
        onCancel={handleCancelReservation}
        initialData={modalData}
        reservations={filteredReservations}
        courts={[]}
      />
    </div>
  );
}
