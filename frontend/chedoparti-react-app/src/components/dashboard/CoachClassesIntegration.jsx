import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Users, Calendar, Clock } from 'lucide-react';
import Card from '../ui/Card';

/**
 * CoachClassesIntegration - Integración de clases de entrenadores en el dashboard
 * Muestra clases, alumnos, confirmaciones y lista de espera
 */
export default function CoachClassesIntegration({
  classes = [],
  onClassClick,
  showStudents = true,
}) {
  // Agrupar clases por coach
  const classesByCoach = useMemo(() => {
    const grouped = {};
    classes.forEach((classItem) => {
      const coachId = classItem.coachId || classItem.coach?.id;
      const coachName = classItem.coachName || classItem.coach?.name || 'Sin asignar';
      
      if (!grouped[coachId]) {
        grouped[coachId] = {
          coachId,
          coachName,
          classes: [],
        };
      }
      grouped[coachId].classes.push(classItem);
    });
    return Object.values(grouped);
  }, [classes]);

  if (classes.length === 0) {
    return (
      <Card className="p-8 text-center">
        <GraduationCap className="w-12 h-12 mx-auto mb-3 text-gray-400" />
        <p className="text-gray-500 dark:text-gray-400">No hay clases programadas</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {classesByCoach.map((coachGroup) => (
        <Card key={coachGroup.coachId} className="p-4">
          {/* Coach Header */}
          <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
            <div className="p-2 bg-teal-100 dark:bg-teal-900 rounded-lg">
              <GraduationCap className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            </div>
            <div>
              <h3 className="font-bold text-navy dark:text-gold">{coachGroup.coachName}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {coachGroup.classes.length} {coachGroup.classes.length === 1 ? 'clase' : 'clases'}
              </p>
            </div>
          </div>

          {/* Classes List */}
          <div className="space-y-3">
            {coachGroup.classes.map((classItem) => (
              <motion.div
                key={classItem.id}
                whileHover={{ scale: 1.01 }}
                className="p-3 bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg cursor-pointer"
                onClick={() => onClassClick && onClassClick(classItem)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    {/* Título y horario */}
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                      <span className="font-semibold text-navy dark:text-gold">
                        {classItem.name || classItem.title || 'Clase'}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{classItem.time || classItem.startTime}</span>
                      </div>
                      
                      {showStudents && (
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>
                            {classItem.confirmedStudents || classItem.students?.length || 0} / {classItem.maxStudents || classItem.capacity || '∞'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Cancha */}
                    {classItem.courtName && (
                      <div className="mt-2 text-xs text-gray-500">
                        📍 {classItem.courtName}
                      </div>
                    )}
                  </div>

                  {/* Estado */}
                  <div className="flex flex-col items-end gap-2">
                    {/* Badge de estado */}
                    {classItem.status && (
                      <span className={`text-xs px-2 py-1 rounded ${
                        classItem.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        classItem.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        classItem.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {classItem.status}
                      </span>
                    )}

                    {/* Lista de espera */}
                    {classItem.waitingList && classItem.waitingList > 0 && (
                      <span className="text-xs px-2 py-1 rounded bg-orange-100 text-orange-800">
                        {classItem.waitingList} en espera
                      </span>
                    )}
                  </div>
                </div>

                {/* Estudiantes (expandible) */}
                {showStudents && classItem.students && classItem.students.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-teal-200 dark:border-teal-800">
                    <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                      Alumnos confirmados:
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {classItem.students.slice(0, 5).map((student, index) => (
                        <span
                          key={index}
                          className="text-xs px-2 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded"
                        >
                          {student.name || student}
                        </span>
                      ))}
                      {classItem.students.length > 5 && (
                        <span className="text-xs px-2 py-1 text-gray-500">
                          +{classItem.students.length - 5} más
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}
