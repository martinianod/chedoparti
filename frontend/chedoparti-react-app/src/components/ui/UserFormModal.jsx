import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FiUser, FiMail, FiPhone, FiLock, FiUserCheck, FiEye, FiEyeOff, FiCheck } from 'react-icons/fi';
import Button from './Button';
import Input from './Input';
import { courtsApi } from '../../services/api';

export default function UserFormModal({ open, onClose, onSubmit, user }) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [courts, setCourts] = useState([]);

  // Estado del formulario
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    roles: ['SOCIO'], // Roles múltiples
    primaryRole: 'SOCIO', // Rol principal
    specialties: [],
    certification: '',
    weeklyHourQuota: 0,
    assignedCourts: [],
  });

  // Errores de validación
  const [errors, setErrors] = useState({});

  // Especialidades disponibles para COACH
  const availableSpecialties = ['Padel', 'Tenis', 'Fútbol', 'Basquet'];

  // Inicializar formulario cuando cambie el usuario
  useEffect(() => {
    if (user) {
      // Modo edición
      setForm({
        name: user.name || '',
        email: user.email || '',
        password: '', // No mostrar password existente
        confirmPassword: '',
        phone: user.phone || '',
        roles: user.roles || [user.role || 'SOCIO'], // Compatibilidad con estructura antigua
        primaryRole: user.primaryRole || user.role || 'SOCIO',
        specialties: user.specialties || [],
        certification: user.certification || '',
        weeklyHourQuota: user.weeklyHourQuota || 0,
        assignedCourts: user.assignedCourts || [],
      });
    } else {
      // Modo creación
      setForm({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        roles: ['SOCIO'],
        primaryRole: 'SOCIO',
        specialties: [],
        certification: '',
        weeklyHourQuota: 0,
        assignedCourts: [],
      });
    }
    setError(null);
    setErrors({});
  }, [user, open]);

  // Cargar canchas disponibles
  useEffect(() => {
    if (open) {
      const loadCourts = async () => {
        try {
          const response = await courtsApi.list();
          setCourts(response.data);
        } catch (err) {
          console.error('Error loading courts:', err);
        }
      };
      loadCourts();
    }
  }, [open]);

  // Validar formulario
  const validateForm = () => {
    const newErrors = {};

    // Nombre requerido
    if (!form.name.trim()) {
      newErrors.name = t('users.form.name_required', 'El nombre es obligatorio');
    }

    // Email requerido y formato
    if (!form.email.trim()) {
      newErrors.email = t('users.form.email_required', 'El email es obligatorio');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = t('users.form.email_invalid', 'El formato del email es inválido');
    }

    // Password requerido solo para usuarios nuevos
    if (!user && !form.password) {
      newErrors.password = t('users.form.password_required', 'La contraseña es obligatoria');
    } else if (form.password && form.password.length < 6) {
      newErrors.password = t(
        'users.form.password_short',
        'La contraseña debe tener al menos 6 caracteres'
      );
    }

    // Confirmar password si se proporciona
    if (form.password && form.password !== form.confirmPassword) {
      newErrors.confirmPassword = t('users.form.password_mismatch', 'Las contraseñas no coinciden');
    }

    // Validar teléfono si se proporciona
    if (form.phone && !/^[\+]?[\d\s\-\(\)]+$/.test(form.phone)) {
      newErrors.phone = t('users.form.phone_invalid', 'El formato del teléfono es inválido');
    }

    // Validar roles
    if (form.roles.length === 0) {
      newErrors.roles = t('users.form.roles_required', 'Selecciona al menos un rol');
    }

    // Validar rol primario si hay múltiples roles
    if (form.roles.length > 1 && !form.primaryRole) {
      newErrors.primaryRole = t('users.form.primary_role_required', 'Selecciona el rol primario');
    }

    // Para COACH, validar especialidades
    if (form.roles.includes('COACH')) {
      if (form.specialties.length === 0) {
        newErrors.specialties = t(
          'users.form.specialties_required',
          'Selecciona al menos una especialidad'
        );
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar cambios en el formulario
  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));

    // Limpiar error del campo modificado
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  // Manejar cambios en especialidades
  const handleSpecialtyChange = (specialty) => {
    const newSpecialties = form.specialties.includes(specialty)
      ? form.specialties.filter((s) => s !== specialty)
      : [...form.specialties, specialty];

    handleChange('specialties', newSpecialties);
  };

  // Manejar toggle de canchas asignadas
  const handleCourtToggle = (courtId) => {
    const current = form.assignedCourts;
    const exists = current.includes(courtId);
    
    let newAssignedCourts;
    if (exists) {
      newAssignedCourts = current.filter(id => id !== courtId);
    } else {
      newAssignedCourts = [...current, courtId];
    }
    
    handleChange('assignedCourts', newAssignedCourts);
  };

  // Manejar submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Preparar datos para envío
      const userData = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim() || null,
        role: form.primaryRole, // Usar primaryRole como role por compatibilidad
        roles: form.roles,
        primaryRole: form.primaryRole,
      };

      // Agregar password solo si se proporcionó
      if (form.password) {
        userData.password = form.password;
      }

      // Agregar campos específicos del rol
      if (form.roles.includes('COACH')) {
        userData.specialties = form.specialties;
        userData.certification = form.certification.trim() || null;
        userData.weeklyHourQuota = Number(form.weeklyHourQuota);
        userData.assignedCourts = form.assignedCourts;
      }

      await onSubmit(userData);
    } catch (error) {
      console.error('❌ UserFormModal - Submit error:', error);
      setError(error.message || t('users.form.submit_error', 'Error al guardar el usuario'));
    } finally {
      setLoading(false);
    }
  };

  // No renderizar si no está abierto
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="inline-block w-full max-w-2xl p-6 my-8 text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-2xl">
          <form onSubmit={handleSubmit}>
            {/* Header */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <FiUser className="mr-2" />
                {user
                  ? t('users.form.edit_title', 'Editar Usuario')
                  : t('users.form.create_title', 'Crear Usuario')}
              </h3>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {user
                  ? t('users.form.edit_subtitle', 'Modifica los datos del usuario')
                  : t('users.form.create_subtitle', 'Completa los datos del nuevo usuario')}
              </p>
            </div>

            {/* Error general */}
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg dark:bg-red-900/20 dark:border-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            {/* Campos del formulario */}
            <div className="space-y-4">
              {/* Nombre */}
              <Input
                label={t('users.form.name', 'Nombre completo')}
                type="text"
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                error={errors.name}
                placeholder={t('users.form.name_placeholder', 'Ej: Juan Pérez')}
                icon={<FiUser />}
                required
              />

              {/* Email */}
              <Input
                label={t('users.form.email', 'Email')}
                type="email"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                error={errors.email}
                placeholder={t('users.form.email_placeholder', 'usuario@ejemplo.com')}
                icon={<FiMail />}
                required
              />

              {/* Teléfono */}
              <Input
                label={t('users.form.phone', 'Teléfono')}
                type="tel"
                value={form.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                error={errors.phone}
                placeholder={t('users.form.phone_placeholder', '+54 11 1234-5678')}
                icon={<FiPhone />}
              />

              {/* Rol */}
              {/* Roles */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('users.form.roles', 'Roles')} *
                </label>
                <div className="space-y-2">
                  {['INSTITUTION_ADMIN', 'COACH', 'SOCIO'].map((role) => (
                    <label key={role} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={form.roles.includes(role)}
                        onChange={(e) => {
                          const updatedRoles = e.target.checked
                            ? [...form.roles, role]
                            : form.roles.filter((r) => r !== role);

                          // Si se desselecciona el rol primario, cambiar a otro disponible
                          let updatedPrimaryRole = form.primaryRole;
                          if (!e.target.checked && form.primaryRole === role) {
                            updatedPrimaryRole = updatedRoles.length > 0 ? updatedRoles[0] : '';
                          }
                          // Si se selecciona el primer rol, hacerlo primario por defecto
                          if (e.target.checked && form.roles.length === 0) {
                            updatedPrimaryRole = role;
                          }

                          setForm({
                            ...form,
                            roles: updatedRoles,
                            primaryRole: updatedPrimaryRole,
                          });
                        }}
                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      />
                      <span className="text-gray-700 dark:text-gray-300">
                        {t(`roles.${role.toLowerCase()}`, role)}
                      </span>
                    </label>
                  ))}
                </div>
                {errors.roles && <p className="mt-1 text-sm text-red-600">{errors.roles}</p>}
              </div>

              {/* Rol Primario */}
              {form.roles.length > 1 && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('users.form.primary_role', 'Rol Primario')} *
                  </label>
                  <select
                    value={form.primaryRole}
                    onChange={(e) => setForm({ ...form, primaryRole: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  >
                    <option value="">
                      {t('users.form.select_primary_role', 'Seleccionar rol primario')}
                    </option>
                    {form.roles.map((role) => (
                      <option key={role} value={role}>
                        {t(`roles.${role.toLowerCase()}`, role)}
                      </option>
                    ))}
                  </select>
                  {errors.primaryRole && (
                    <p className="mt-1 text-sm text-red-600">{errors.primaryRole}</p>
                  )}
                </div>
              )}

              {/* Campos específicos para COACH */}
              {form.roles.includes('COACH') && (
                <>
                  {/* Especialidades */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('users.form.specialties', 'Especialidades')} *
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {['Padel', 'Tenis', 'Fútbol'].map((specialty) => (
                        <label
                          key={specialty}
                          className="flex items-center space-x-2 p-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
                        >
                          <input
                            type="checkbox"
                            checked={form.specialties.includes(specialty)}
                            onChange={() => handleSpecialtyChange(specialty)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {specialty}
                          </span>
                        </label>
                      ))}
                    </div>
                    {errors.specialties && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors.specialties}
                      </p>
                    )}
                  </div>

                  {/* Certificación */}
                  <Input
                    label={t('users.form.certification', 'Certificación')}
                    type="text"
                    value={form.certification}
                    onChange={(e) => handleChange('certification', e.target.value)}
                    placeholder={t(
                      'users.form.certification_placeholder',
                      'Ej: Instructor Nivel 3'
                    )}
                    icon={<FiUserCheck />}
                  />

                  <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                      Configuración de Entrenador
                    </h4>
                  
                  {/* Cuota Semanal */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Cuota Semanal de Horas
                    </label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="0"
                        value={form.weeklyHourQuota}
                        onChange={(e) => handleChange('weeklyHourQuota', e.target.value)}
                        className="w-32"
                      />
                      <span className="text-sm text-gray-500 dark:text-gray-400">horas por semana (0 = sin límite)</span>
                    </div>
                  </div>

                  {/* Canchas Asignadas */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Canchas Asignadas
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto p-2 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-900/50">
                      {courts
                        .filter(court => form.specialties.length === 0 || form.specialties.includes(court.sport))
                        .map(court => (
                        <div 
                          key={court.id}
                          onClick={() => handleCourtToggle(court.id)}
                          className={`
                            flex items-center justify-between p-3 rounded-md cursor-pointer border transition-all
                            ${form.assignedCourts.includes(court.id)
                              ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
                              : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }
                          `}
                        >
                          <div className="flex flex-col">
                            <span className="font-medium text-sm text-gray-900 dark:text-white">{court.name}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">{court.sport}</span>
                          </div>
                          {form.assignedCourts.includes(court.id) && (
                            <FiCheck className="text-blue-600 dark:text-blue-400" />
                          )}
                        </div>
                      ))}
                      {courts.filter(court => form.specialties.length === 0 || form.specialties.includes(court.sport)).length === 0 && (
                        <div className="col-span-2 text-center py-4 text-sm text-gray-500 dark:text-gray-400">
                          {form.specialties.length > 0 
                            ? 'No hay canchas disponibles para las especialidades seleccionadas'
                            : 'Selecciona especialidades para ver las canchas disponibles'
                          }
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      El entrenador solo podrá reservar en las canchas seleccionadas.
                    </p>
                  </div>
                </div>
                </>
              )}

              {/* Contraseña */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('users.form.password', 'Contraseña')} {!user && '*'}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    placeholder={
                      user
                        ? t(
                            'users.form.password_placeholder_edit',
                            'Dejar vacío para mantener la actual'
                          )
                        : t('users.form.password_placeholder', 'Mínimo 6 caracteres')
                    }
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                  <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>
                )}
              </div>

              {/* Confirmar contraseña */}
              {form.password && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('users.form.confirm_password', 'Confirmar contraseña')} *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={form.confirmPassword}
                      onChange={(e) => handleChange('confirmPassword', e.target.value)}
                      placeholder={t(
                        'users.form.confirm_password_placeholder',
                        'Repite la contraseña'
                      )}
                      className="w-full pl-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                    <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Botones */}
            <div className="mt-6 flex justify-end space-x-3">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                {t('common.cancel', 'Cancelar')}
              </Button>
              <Button type="submit" loading={loading} disabled={loading}>
                {user
                  ? t('users.form.update', 'Actualizar Usuario')
                  : t('users.form.create', 'Crear Usuario')}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
