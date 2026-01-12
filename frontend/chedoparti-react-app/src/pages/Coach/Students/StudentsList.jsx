import React, { useState } from 'react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import Card from '../../../components/ui/Card';
import StudentCard from './StudentCard';
import StudentFilters from './StudentFilters';
import StudentFormModal from './StudentFormModal';
import ConfirmDialog from '../../../components/ui/ConfirmDialog';
import AccessibleModal from '../../../components/ui/AccessibleModal';
import useAuth from '../../../hooks/useAuth';
import useStudents from '../../../hooks/useStudents';
import useGroups from '../../../hooks/useGroups';
import { useCoachStore } from '../../../store/coachStore';

/**
 * Students List View
 * Main view for managing students
 */
export default function StudentsList() {
  const { user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [bulkGroupModalOpen, setBulkGroupModalOpen] = useState(false);
  const [targetGroupId, setTargetGroupId] = useState('');

  const { getFilteredStudents } = useCoachStore();
  
  // Fetch students and groups
  const {
    students: allStudents,
    isLoading: studentsLoading,
    createStudentAsync,
    updateStudentAsync,
    deleteStudentAsync,
    refetch: refetchStudents,
  } = useStudents(user?.id);

  const {
    groups,
    isLoading: groupsLoading,
    addStudentAsync,
  } = useGroups(user?.id);

  // Get filtered students from store
  const filteredStudents = getFilteredStudents();

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required to start drag
      },
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (!over) return;
    
    // Handle drag to group (will be implemented when groups view is ready)
    console.log('Drag ended:', { active: active.id, over: over.id });
  };

  const handleAddStudent = () => {
    setSelectedStudent(null);
    setModalOpen(true);
  };

  const handleEditStudent = (student) => {
    setSelectedStudent(student);
    setModalOpen(true);
  };

  const handleDeleteStudent = (student) => {
    setStudentToDelete(student);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (studentToDelete) {
      try {
        await deleteStudentAsync(studentToDelete.id);
        setDeleteDialogOpen(false);
        setStudentToDelete(null);
      } catch (error) {
        console.error('Error deleting student:', error);
      }
    }
  };

  const handleSubmit = async (formData) => {
    try {
      if (selectedStudent?.id) {
        // Update existing student
        await updateStudentAsync({ id: selectedStudent.id, data: formData });
      } else {
        // Create new student
        await createStudentAsync(formData);
      }
      setModalOpen(false);
      setSelectedStudent(null);
    } catch (error) {
      console.error('Error saving student:', error);
    }
  };

  // Bulk selection handlers
  const handleToggleSelect = (studentId) => {
    setSelectedStudentIds(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSelectAll = () => {
    if (selectedStudentIds.length === filteredStudents.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(filteredStudents.map(s => s.id));
    }
  };

  const handleBulkAddToGroup = () => {
    if (selectedStudentIds.length > 0) {
      setBulkGroupModalOpen(true);
    }
  };

  const handleConfirmBulkAdd = async () => {
    if (!targetGroupId || selectedStudentIds.length === 0) return;

    try {
      // Add each selected student to the group
      for (const studentId of selectedStudentIds) {
        await addStudentAsync({ groupId: Number(targetGroupId), studentId });
      }
      
      // Reset selection
      setSelectedStudentIds([]);
      setBulkGroupModalOpen(false);
      setTargetGroupId('');
    } catch (error) {
      console.error('Error adding students to group:', error);
    }
  };


  const isLoading = studentsLoading || groupsLoading;

  if (isLoading && allStudents.length === 0) {
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
              Mis Alumnos
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Gestiona tus alumnos y asígnalos a grupos
            </p>
          </div>
          <button
            type="button"
            onClick={handleAddStudent}
            className="btn btn-primary"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Agregar Alumno
          </button>
        </div>
      </Card>

      {/* Filters */}
      <StudentFilters onFiltersChange={refetchStudents} />

      {/* Bulk Selection Toolbar */}
      {filteredStudents.length > 0 && (
        <Card className="mb-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={selectedStudentIds.length === filteredStudents.length && filteredStudents.length > 0}
                onChange={handleSelectAll}
                className="w-4 h-4 text-navy focus:ring-gold border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {selectedStudentIds.length > 0 
                  ? `${selectedStudentIds.length} alumno${selectedStudentIds.length > 1 ? 's' : ''} seleccionado${selectedStudentIds.length > 1 ? 's' : ''}`
                  : 'Seleccionar todos'
                }
              </span>
            </div>
            
            {selectedStudentIds.length > 0 && (
              <button
                type="button"
                onClick={handleBulkAddToGroup}
                className="btn btn-primary text-sm"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Agregar a grupo
              </button>
            )}
          </div>
        </Card>
      )}

      {/* Students Grid */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={filteredStudents.map((s) => s.id)}
          strategy={rectSortingStrategy}
        >
          {filteredStudents.length === 0 ? (
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
                No hay alumnos
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Comienza agregando tu primer alumno.
              </p>
              <div className="mt-6">
                <button
                  type="button"
                  onClick={handleAddStudent}
                  className="btn btn-primary"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Agregar Alumno
                </button>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredStudents.map((student) => (
                <div key={student.id} className="relative">
                  <div className="absolute top-2 left-2 z-10">
                    <input
                      type="checkbox"
                      checked={selectedStudentIds.includes(student.id)}
                      onChange={() => handleToggleSelect(student.id)}
                      className="w-5 h-5 text-navy focus:ring-gold border-gray-300 rounded shadow-sm"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <StudentCard
                    student={student}
                    groups={groups}
                    onEdit={handleEditStudent}
                    onDelete={handleDeleteStudent}
                    isDraggable={true}
                  />
                </div>
              ))}
            </div>
          )}
        </SortableContext>
      </DndContext>

      {/* Bulk Add to Group Modal */}
      <AccessibleModal
        open={bulkGroupModalOpen}
        onClose={() => {
          setBulkGroupModalOpen(false);
          setTargetGroupId('');
        }}
        title="Agregar alumnos a grupo"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Selecciona el grupo al que deseas agregar {selectedStudentIds.length} alumno{selectedStudentIds.length > 1 ? 's' : ''}:
          </p>
          
          <div>
            <label htmlFor="targetGroup" className="label">
              Grupo
            </label>
            <select
              id="targetGroup"
              value={targetGroupId}
              onChange={(e) => setTargetGroupId(e.target.value)}
              className="input"
            >
              <option value="">Seleccionar grupo...</option>
              {groups
                .filter((g) => !g.isArchived)
                .map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name} ({group.sport})
                  </option>
                ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => {
                setBulkGroupModalOpen(false);
                setTargetGroupId('');
              }}
              className="btn btn-outline"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirmBulkAdd}
              disabled={!targetGroupId}
              className="btn btn-primary"
            >
              Agregar a grupo
            </button>
          </div>
        </div>
      </AccessibleModal>

      {/* Modals */}
      <StudentFormModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedStudent(null);
        }}
        onSubmit={handleSubmit}
        initialData={selectedStudent}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setStudentToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Eliminar Alumno"
        message={`¿Estás seguro de que deseas eliminar a ${studentToDelete?.name}? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  );
}
