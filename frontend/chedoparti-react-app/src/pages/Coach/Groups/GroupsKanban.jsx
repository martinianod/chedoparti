import React, { useState } from 'react';
import { DndContext, closestCorners, PointerSensor, useSensor, useSensors, DragOverlay, useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Card from '../../../components/ui/Card';
import GroupHeader from './GroupHeader'; // This will be removed or modified later, but for now keep it.
import GroupFormModal from './GroupFormModal';
import StudentCard from '../Students/StudentCard';
import StudentFilters from '../Students/StudentFilters';
import ConfirmDialog from '../../../components/ui/ConfirmDialog';
import useAuth from '../../../hooks/useAuth';
import useGroups from '../../../hooks/useGroups';
import useStudents from '../../../hooks/useStudents';
import { useSchedulesByGroup } from '../../../hooks/useCoachSchedules';
import { useCoachStore } from '../../../store/coachStore';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Group Card Component
 */
function GroupCard({ group, students, allGroups, onEdit, onDuplicate, onArchive, onRemoveStudent, isOver, scheduleInfo }) {
  const [isExpanded, setIsExpanded] = useState(true); // Default to expanded

  return (
    <div
      className={`bg-white dark:bg-navy-light rounded-lg border-2 transition-all ${
        isOver ? 'border-gold shadow-lg' : 'border-gray-200 dark:border-gray-700'
      }`}
    >
      {/* Header */}
      <div
        className="p-4 border-b border-gray-200 dark:border-gray-700"
        style={{
          backgroundColor: `${group.color}10`,
        }}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: group.color }}
              />
              <h3 className="font-bold text-gray-900 dark:text-gray-100">
                {group.name}
              </h3>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-2 py-0.5 bg-gray-100 dark:bg-navy rounded-full text-gray-700 dark:text-gray-300">
                {group.sport}
              </span>
              <span className="px-2 py-0.5 bg-gray-100 dark:bg-navy rounded-full text-gray-700 dark:text-gray-300">
                {group.level}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onEdit(group)}
              className="p-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-navy rounded transition-colors"
              title="Editar"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => onDuplicate(group)}
              className="p-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-navy rounded transition-colors"
              title="Duplicar"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => onArchive(group)}
              className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
              title="Archivar"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </button>
          </div>
        </div>

        {/* Schedule Info */}
        {scheduleInfo && scheduleInfo.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 space-y-1">
            <div className="flex items-center gap-1 mb-1">
              <svg className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Horarios:</span>
            </div>
            {scheduleInfo}
          </div>
        )}
      </div>

      {/* Toggle Button */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-2 bg-gray-50 dark:bg-navy hover:bg-gray-100 dark:hover:bg-navy-dark transition-colors flex items-center justify-between text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        <span>{students.length} alumno{students.length !== 1 ? 's' : ''}</span>
        <svg
          className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Students List */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto">
              {students.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
                  <p>No hay alumnos en este grupo</p>
                </div>
              ) : (
                students.map((student) => (
                  <div key={student.id} className="relative group">
                    <StudentCard
                      student={student}
                      groups={allGroups}
                      onEdit={() => {}}
                      onDelete={() => {}}
                      isDraggable={false}
                    />
                    <button
                      type="button"
                      onClick={() => onRemoveStudent(student.id, group.id)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remover del grupo"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Draggable Student Item for the list
 */
function DraggableStudentItem({ student, groups, onEdit, onDelete }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: student.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <StudentCard
        student={student}
        groups={groups}
        onEdit={onEdit}
        onDelete={onDelete}
        isDraggable={true}
      />
    </div>
  );
}

/**
 * Droppable Group Wrapper
 */
function DroppableGroup({ group, students, allGroups, onEdit, onDuplicate, onArchive, onRemoveStudent, activeId }) {
  const { setNodeRef, isOver } = useDroppable({
    id: group.id,
  });

  // Fetch schedules for this group
  const { data: groupSchedules = [] } = useSchedulesByGroup(group.id);

  // Format schedule info
  const formatScheduleInfo = () => {
    if (groupSchedules.length === 0) return null;

    const dayNames = {
      0: 'Dom',
      1: 'Lun',
      2: 'Mar',
      3: 'Mié',
      4: 'Jue',
      5: 'Vie',
      6: 'Sáb',
    };

    return groupSchedules.map((schedule, index) => {
      const days = schedule.isRecurring && schedule.recurringDays
        ? schedule.recurringDays.map(d => dayNames[d]).join(', ')
        : 'Una vez';
      
      return (
        <div key={index} className="text-xs text-gray-600 dark:text-gray-400">
          <span className="font-medium">{days}</span>
          {' • '}
          <span>{schedule.startTime} - {schedule.endTime}</span>
        </div>
      );
    });
  };

  return (
    <div
      ref={setNodeRef}
      className={`transition-all ${
        isOver && activeId ? 'ring-2 ring-gold dark:ring-gold scale-105' : ''
      }`}
    >
      <GroupCard
        group={group}
        students={students}
        allGroups={allGroups}
        onEdit={onEdit}
        onDuplicate={onDuplicate}
        onArchive={onArchive}
        onRemoveStudent={onRemoveStudent}
        isOver={isOver && activeId}
        scheduleInfo={formatScheduleInfo()}
      />
    </div>
  );
}

/**
 * Groups Kanban Board - Redesigned with two-column layout
 * Left: List of all students (draggable)
 * Right: Groups (drop zones)
 */
export default function GroupsKanban() {
  const { user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [groupToArchive, setGroupToArchive] = useState(null);
  const [activeStudent, setActiveStudent] = useState(null);

  const { getGroupStudents, showArchivedGroups, toggleShowArchivedGroups, getFilteredStudents } = useCoachStore();

  // Fetch data
  const {
    groups: allGroups,
    isLoading: groupsLoading,
    createGroupAsync,
    updateGroupAsync,
    archiveGroupAsync,
    duplicateGroupAsync,
    addStudentAsync,
    removeStudentAsync,
  } = useGroups(user?.id, { includeArchived: showArchivedGroups });

  const {
    students: allStudents,
    isLoading: studentsLoading,
    updateStudentAsync,
    deleteStudentAsync,
    refetch: refetchStudents,
  } = useStudents(user?.id);

  // Filter active groups
  const activeGroups = allGroups.filter((g) => !g.isArchived);
  const displayGroups = showArchivedGroups ? allGroups : activeGroups;

  // Get filtered students
  const filteredStudents = getFilteredStudents();

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event) => {
    const { active } = event;
    const student = allStudents.find((s) => s.id === active.id);
    setActiveStudent(student);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveStudent(null);

    if (!over) return;

    const studentId = active.id;
    const targetGroupId = over.id;

    // Check if dropping on a group
    const targetGroup = allGroups.find((g) => g.id === targetGroupId);
    if (targetGroup) {
      // Check if student is already in the group
      const groupStudents = getGroupStudents(targetGroupId);
      const isAlreadyInGroup = groupStudents.some((s) => s.id === studentId);
      
      if (!isAlreadyInGroup) {
        try {
          await addStudentAsync({ groupId: targetGroupId, studentId });
        } catch (error) {
          console.error('Error adding student to group:', error);
        }
      }
    }
  };

  const handleCreateGroup = () => {
    setSelectedGroup(null);
    setModalOpen(true);
  };

  const handleEditGroup = (group) => {
    setSelectedGroup(group);
    setModalOpen(true);
  };

  const handleDuplicateGroup = async (group) => {
    try {
      await duplicateGroupAsync(group.id);
    } catch (error) {
      console.error('Error duplicating group:', error);
    }
  };

  const handleArchiveGroup = (group) => {
    setGroupToArchive(group);
    setArchiveDialogOpen(true);
  };

  const confirmArchive = async () => {
    if (groupToArchive) {
      try {
        await archiveGroupAsync(groupToArchive.id);
        setArchiveDialogOpen(false);
        setGroupToArchive(null);
      } catch (error) {
        console.error('Error archiving group:', error);
      }
    }
  };

  const handleRemoveStudentFromGroup = async (studentId, groupId) => {
    try {
      await removeStudentAsync({ groupId, studentId });
    } catch (error) {
      console.error('Error removing student from group:', error);
    }
  };

  const handleEditStudent = (student) => {
    // This will be handled by the parent component or a modal
    console.log('Edit student:', student);
  };

  const handleDeleteStudent = async (student) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar a ${student.name}?`)) {
      try {
        await deleteStudentAsync(student.id);
      } catch (error) {
        console.error('Error deleting student:', error);
      }
    }
  };

  const handleSubmit = async (formData) => {
    try {
      const payload = {
        ...formData,
        coachId: user?.id,
        institutionId: user?.institutionId,
      };

      if (selectedGroup?.id) {
        await updateGroupAsync({ id: selectedGroup.id, data: payload });
      } else {
        await createGroupAsync(payload);
      }
      setModalOpen(false);
      setSelectedGroup(null);
    } catch (error) {
      console.error('Error saving group:', error);
    }
  };

  const isLoading = groupsLoading || studentsLoading;

  if (isLoading && allGroups.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy dark:border-gold" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-navy dark:text-gold mb-1">
              Mis Grupos
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Gestiona tus grupos, alumnos y horarios de clases
            </p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={toggleShowArchivedGroups}
              className="btn btn-outline"
            >
              {showArchivedGroups ? 'Ocultar archivados' : 'Mostrar archivados'}
            </button>
            <button
              type="button"
              onClick={handleCreateGroup}
              className="btn btn-primary"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Crear Grupo
            </button>
          </div>
        </div>
      </Card>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {displayGroups.length === 0 ? (
          <Card className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
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
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
              No hay grupos
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Comienza creando tu primer grupo.
            </p>
            <div className="mt-6">
              <button
                type="button"
                onClick={handleCreateGroup}
                className="btn btn-primary"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Crear Grupo
              </button>
            </div>
          </Card>
        ) : (
          <SortableContext
            items={displayGroups.map((g) => g.id)}
            strategy={verticalListSortingStrategy}
          >
            {/* Responsive Grid for Groups */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {displayGroups.map((group) => {
                const groupStudents = getGroupStudents(group.id);
                
                return (
                  <DroppableGroup
                    key={group.id}
                    group={group}
                    students={groupStudents}
                    allGroups={allGroups}
                    onEdit={handleEditGroup}
                    onDuplicate={handleDuplicateGroup}
                    onArchive={handleArchiveGroup}
                    onRemoveStudent={handleRemoveStudentFromGroup}
                    activeId={activeStudent?.id}
                  />
                );
              })}
            </div>
          </SortableContext>
        )}

        <DragOverlay>
          {activeStudent ? (
            <div className="opacity-90 rotate-3 scale-105">
              <StudentCard
                student={activeStudent}
                groups={allGroups}
                onEdit={() => {}}
                onDelete={() => {}}
                isDraggable={false}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Modals */}
      <GroupFormModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedGroup(null);
        }}
        onSubmit={handleSubmit}
        initialData={selectedGroup}
      />

      <ConfirmDialog
        open={archiveDialogOpen}
        onClose={() => {
          setArchiveDialogOpen(false);
          setGroupToArchive(null);
        }}
        onConfirm={confirmArchive}
        title="Archivar Grupo"
        message={`¿Estás seguro de que deseas archivar el grupo "${groupToArchive?.name}"? Los alumnos no serán eliminados.`}
        confirmText="Archivar"
        cancelText="Cancelar"
        variant="warning"
      />
    </div>
  );
}
