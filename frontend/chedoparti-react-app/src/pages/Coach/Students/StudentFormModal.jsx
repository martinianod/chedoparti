import React, { useState, useEffect } from 'react';
import AccessibleModal from '../../../components/ui/AccessibleModal';
import MemberSearchInput from '../../../components/coach/MemberSearchInput';
import useAuth from '../../../hooks/useAuth';

/**
 * Student Form Modal
 * Create or edit student
 */
export default function StudentFormModal({ open, onClose, onSubmit, initialData = null }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    isMember: false,
    memberNumber: '',
    sport: 'Padel',
    level: 'Beginner',
    notes: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        isMember: initialData.isMember || false,
        memberNumber: initialData.memberNumber || '',
        sport: initialData.sport || 'Padel',
        level: initialData.level || 'Beginner',
        notes: initialData.notes || '',
      });
    } else {
      // Reset form for new student
      setFormData({
        name: '',
        email: '',
        phone: '',
        isMember: false,
        memberNumber: '',
        sport: 'Padel',
        level: 'Beginner',
        notes: '',
      });
    }
  }, [initialData, open]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSelectMember = (member) => {
    setFormData({
      ...formData,
      name: `${member.firstName} ${member.lastName}`,
      email: member.email || '',
      phone: member.phone || '',
      isMember: member.isMember || true,
      memberNumber: member.memberNumber || '',
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const payload = {
      ...formData,
      coachId: user?.id,
      institutionId: user?.institutionId,
    };

    if (initialData?.id) {
      payload.id = initialData.id;
    }

    onSubmit(payload);
  };


  const isEditMode = !!initialData?.id;
  const isMemberData = formData.isMember; // If the student is a member

  return (
    <AccessibleModal
      open={open}
      onClose={onClose}
      title={isEditMode ? 'Editar Alumno' : 'Agregar Alumno'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Member Search Section */}
        {!isEditMode && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
              Buscar socio existente
            </h3>
            <MemberSearchInput 
              onSelect={handleSelectMember}
              className="w-full"
            />
            <p className="mt-2 text-xs text-blue-700 dark:text-blue-400">
              Si el alumno es socio, búscalo aquí para autocompletar sus datos.
            </p>
          </div>
        )}

        {/* Warning for editing members */}
        {isEditMode && isMemberData && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-300 mb-1">
                  Alumno asociado a socio
                </h3>
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  Los datos personales de este alumno están vinculados a su registro de socio y no pueden ser modificados desde aquí. Solo puedes gestionar su deporte, nivel y notas para las clases.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Name */}
        <div>
          <label htmlFor="name" className="label">
            Nombre *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            disabled={isEditMode && isMemberData}
            className={`input ${isEditMode && isMemberData ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed' : ''}`}
          />
        </div>

        {/* Email & Phone */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="email" className="label">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={isEditMode && isMemberData}
              className={`input ${isEditMode && isMemberData ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed' : ''}`}
            />
          </div>
          <div>
            <label htmlFor="phone" className="label">
              Teléfono
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              disabled={isEditMode && isMemberData}
              className={`input ${isEditMode && isMemberData ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed' : ''}`}
            />
          </div>
        </div>

        {/* Member Status */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isMember"
            name="isMember"
            checked={formData.isMember}
            onChange={handleChange}
            disabled={isEditMode}
            className={`w-4 h-4 text-navy focus:ring-gold border-gray-300 rounded ${isEditMode ? 'cursor-not-allowed opacity-50' : ''}`}
          />
          <label htmlFor="isMember" className={`text-sm font-medium text-gray-700 dark:text-gray-300 ${isEditMode ? 'opacity-50' : ''}`}>
            Es socio de la institución
          </label>
        </div>

        {/* Member Number (if member) */}
        {formData.isMember && (
          <div>
            <label htmlFor="memberNumber" className="label">
              Número de socio
            </label>
            <input
              type="text"
              id="memberNumber"
              name="memberNumber"
              value={formData.memberNumber}
              onChange={handleChange}
              disabled={isEditMode}
              className={`input ${isEditMode ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed' : ''}`}
            />
          </div>
        )}

        {/* Sport & Level */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="sport" className="label">
              Deporte *
            </label>
            <select
              id="sport"
              name="sport"
              value={formData.sport}
              onChange={handleChange}
              required
              className="input"
            >
              <option value="Padel">Padel</option>
              <option value="Tenis">Tenis</option>
              <option value="Fútbol">Fútbol</option>
              <option value="Basquet">Basquet</option>
            </select>
          </div>
          <div>
            <label htmlFor="level" className="label">
              Nivel *
            </label>
            <select
              id="level"
              name="level"
              value={formData.level}
              onChange={handleChange}
              required
              className="input"
            >
              <option value="Beginner">Principiante</option>
              <option value="Intermediate">Intermedio</option>
              <option value="Advanced">Avanzado</option>
              <option value="Pro">Profesional</option>
            </select>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="notes" className="label">
            Notas
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            className="input"
            placeholder="Información adicional sobre el alumno..."
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-outline"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn btn-primary"
          >
            {isEditMode ? 'Guardar cambios' : 'Crear alumno'}
          </button>
        </div>
      </form>
    </AccessibleModal>
  );
}
