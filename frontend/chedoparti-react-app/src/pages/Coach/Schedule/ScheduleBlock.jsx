import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

/**
 * Schedule Block Component
 * Draggable block representing a scheduled class
 */
export default function ScheduleBlock({
  schedule,
  group,
  courts = [],
  onClick,
  isDraggable = false,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: schedule.id,
    disabled: !isDraggable,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  if (!group) return null;

  // Get court names
  const courtNames = courts
    .filter((c) => (schedule.courtIds || []).includes(c.id))
    .map((c) => c.name)
    .join(', ');

  // Calculate capacity
  const totalCapacity = courts
    .filter((c) => (schedule.courtIds || []).includes(c.id))
    .reduce((sum, court) => sum + (court.capacity || 4), 0);

  const studentsCount = group.studentIds?.length || 0;
  const capacityPercentage = totalCapacity > 0 ? (studentsCount / totalCapacity) * 100 : 0;

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        borderLeftColor: group.color,
        backgroundColor: `${group.color}15`,
      }}
      {...attributes}
      {...(isDraggable ? listeners : {})}
      onClick={() => onClick?.(schedule)}
      className={`relative rounded-lg p-3 border-l-4 transition-all ${
        isDraggable ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'
      } ${isDragging ? 'shadow-2xl ring-2 ring-navy dark:ring-gold z-50' : 'hover:shadow-md'}`}
    >
      {/* Group Name */}
      <div className="font-bold text-sm mb-1" style={{ color: group.color }}>
        {group.name}
      </div>

      {/* Time Range */}
      <div className="text-xs text-gray-700 dark:text-gray-300 mb-2">
        {schedule.startTime} - {schedule.endTime}
      </div>

      {/* Courts */}
      <div className="text-xs text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-1">
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
        <span className="truncate">{courtNames || 'Sin canchas'}</span>
      </div>

      {/* Capacity */}
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-gray-600 dark:text-gray-400">
              {studentsCount}/{totalCapacity}
            </span>
            <span className="text-gray-500 dark:text-gray-500">
              {Math.round(capacityPercentage)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full transition-all ${
                capacityPercentage > 100
                  ? 'bg-red-500'
                  : capacityPercentage >= 80
                    ? 'bg-amber-500'
                    : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(capacityPercentage, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Recurring Indicator */}
      {schedule.isRecurring && (
        <div className="absolute top-2 right-2">
          <svg
            className="w-4 h-4 text-gray-500 dark:text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            title="Clase recurrente"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </div>
      )}

      {/* Hover Tooltip */}
      <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-10 w-64 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded-lg p-3 shadow-lg">
        <div className="font-bold mb-2">{group.name}</div>
        <div className="space-y-1">
          <div>
            <strong>Horario:</strong> {schedule.startTime} - {schedule.endTime}
          </div>
          <div>
            <strong>Canchas:</strong> {courtNames}
          </div>
          <div>
            <strong>Alumnos:</strong> {studentsCount}/{totalCapacity}
          </div>
          {schedule.notes && (
            <div>
              <strong>Notas:</strong> {schedule.notes}
            </div>
          )}
        </div>
        {/* Arrow */}
        <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-100" />
      </div>
    </div>
  );
}
