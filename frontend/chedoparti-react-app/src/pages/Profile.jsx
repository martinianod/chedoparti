import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import useAuth from '../hooks/useAuth';
import Tabs from '../components/ui/Tabs';
import { FiUser, FiLock } from 'react-icons/fi';
import DeleteButton from '../components/ui/DeleteButton';
import SaveButton from '../components/ui/SaveButton';

export default function Profile() {
  const { t } = useTranslation();
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');

  // Mantener sincronización con el contexto de usuario
  // Si el usuario cambia en el contexto, actualizar los campos
  // Esto permite que Sidebar y Profile estén sincronizados
  useEffect(() => {
    setName(user?.name || '');
    setEmail(user?.email || '');
    setAvatar(user?.avatar || '');
  }, [user]);
  const [avatarFile, setAvatarFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.match(/^image\/(jpeg|png|gif)$/)) {
      setAvatarFile(file);
      setAvatar(URL.createObjectURL(file));
    }
  };

  const handleAvatarDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.match(/^image\/(jpeg|png|gif)$/)) {
      setAvatarFile(file);
      setAvatar(URL.createObjectURL(file));
    }
  };

  const handleAvatarDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleAvatarDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    // Simulate save logic, replace with actual API call
    await new Promise((r) => setTimeout(r, 1000));
    updateUser({ name, email, avatar });
    setSaving(false);
    setSuccessMsg(t('profile.success', '¡Cambios guardados correctamente!'));
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleDeleteAccount = () => setShowDeleteConfirm(true);
  const confirmDelete = () => {
    setShowDeleteConfirm(false);
    // lógica real de eliminación aquí
  };

  return (
    <div className="max-w-xl mx-auto mt-8 p-6 bg-white dark:bg-navy rounded-xl shadow-lg border border-gold dark:border-gold">
      <h2 className="text-2xl font-bold mb-6 text-navy dark:text-gold">
        {t('profile.title', 'Perfil de usuario')}
      </h2>
      <Tabs
        tabs={[
          { label: t('profile.tab_general', 'General'), icon: <FiUser /> },
          { label: t('profile.tab_security', 'Seguridad'), icon: <FiLock /> },
        ]}
      >
        {/* General Tab */}
        <form onSubmit={handleSave} className="flex flex-col gap-6">
          {successMsg && (
            <div className="mb-2 px-4 py-2 rounded bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 text-center font-semibold animate-fade-in">
              {successMsg}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-navy dark:text-gold mb-1">
              {t('profile.name', 'Nombre y Apellido')}
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 rounded border border-navy dark:border-gold bg-gray-50 dark:bg-navy-light text-navy dark:text-gold"
              value={name ?? ''}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {t(
                'profile.name_hint',
                'Will appear on receipts, invoices, and other communication.'
              )}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-navy dark:text-gold mb-1">
              {t('profile.email', 'Email')}
            </label>
            <input
              type="email"
              className="w-full px-4 py-2 rounded border border-navy dark:border-gold bg-gray-50 dark:bg-navy-light text-navy dark:text-gold"
              value={email ?? ''}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {t('profile.email_hint', 'Used to sign in, for email receipts and product updates.')}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-navy dark:text-gold mb-1">
              {t('profile.avatar', 'Avatar')}
            </label>
            <div
              className={`flex items-center gap-4 ${dragActive ? 'ring-2 ring-gold' : ''}`}
              onDragOver={handleAvatarDragOver}
              onDragLeave={handleAvatarDragLeave}
              onDrop={handleAvatarDrop}
            >
              <div
                className={`w-20 h-20 rounded-full bg-gray-200 dark:bg-navy flex items-center justify-center overflow-hidden border-2 border-navy dark:border-gold transition-all duration-200 ${dragActive ? 'ring-4 ring-gold' : ''}`}
              >
                {avatar ? (
                  <img
                    src={avatar}
                    alt="avatar"
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <span className="text-xl font-bold text-navy dark:text-gold uppercase">
                    {(() => {
                      const fullName = name || '';
                      const parts = fullName.trim().split(/\s+/);
                      if (parts.length >= 2) {
                        return parts[0][0] + parts[parts.length - 1][0];
                      }
                      return parts[0]?.[0] || '?';
                    })()}
                  </span>
                )}
              </div>
              <label className="btn btn-outline cursor-pointer">
                {t('profile.select_image', 'Seleccionar imagen')}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {t(
                'profile.avatar_hint',
                'JPG, GIF or PNG. Circle space like profile photo. Puedes arrastrar y soltar la imagen.'
              )}
            </p>
          </div>
          <SaveButton type="submit" className="w-full mt-4 justify-center" disabled={saving}>
            {saving ? t('common.save', 'Guardando...') : t('common.save', 'Guardar cambios')}
          </SaveButton>
        </form>
        {/* Security Tab */}
        <form
          className="flex flex-col gap-6"
          onSubmit={(e) => {
            e.preventDefault(); /* lógica de cambio de contraseña */
          }}
        >
          <div>
            <label className="block text-sm font-medium text-navy dark:text-gold mb-1">
              {t('profile.current_password', 'Contraseña actual')}
            </label>
            <input
              type="password"
              className="w-full px-4 py-2 rounded border border-navy dark:border-gold bg-gray-50 dark:bg-navy-light text-navy dark:text-gold mb-2"
              placeholder={t('profile.current_password', 'Contraseña actual')}
              autoComplete="current-password"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-navy dark:text-gold mb-1">
              {t('profile.new_password', 'Nueva contraseña')}
            </label>
            <input
              type="password"
              className="w-full px-4 py-2 rounded border border-navy dark:border-gold bg-gray-50 dark:bg-navy-light text-navy dark:text-gold mb-2"
              placeholder={t('profile.new_password', 'Nueva contraseña')}
              autoComplete="new-password"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-navy dark:text-gold mb-1">
              {t('profile.confirm_password', 'Confirmar nueva contraseña')}
            </label>
            <input
              type="password"
              className="w-full px-4 py-2 rounded border border-navy dark:border-gold bg-gray-50 dark:bg-navy-light text-navy dark:text-gold mb-2"
              placeholder={t('profile.confirm_password', 'Confirmar nueva contraseña')}
              autoComplete="new-password"
              required
            />
          </div>
          <SaveButton type="submit" className="w-full mt-2 justify-center">
            {t('profile.save_password', 'Guardar nueva contraseña')}
          </SaveButton>
          <div className="border-t border-gold dark:border-gold pt-6">
            <label className="block text-sm font-medium text-navy dark:text-gold mb-2">
              {t('profile.delete_account', 'Eliminar cuenta')}
            </label>
            <p className="text-xs text-red-600 dark:text-red-400 mb-2">
              {t(
                'profile.delete_account_warning',
                'Esta acción es irreversible. Todos tus datos y reservas serán eliminados. ¿Estás seguro?'
              )}
            </p>
            <DeleteButton className="w-full justify-center" onClick={handleDeleteAccount}>
              {t('profile.delete_account_btn', 'Eliminar mi cuenta')}
            </DeleteButton>
            {showDeleteConfirm && (
              <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
                <div className="bg-white dark:bg-navy rounded-xl shadow-lg p-6 border border-gold dark:border-gold max-w-sm w-full">
                  <h3 className="text-lg font-bold text-navy dark:text-gold mb-4">
                    {t('profile.confirm_delete_title', 'Confirmar eliminación')}
                  </h3>
                  <p className="text-sm text-navy dark:text-gold mb-6">
                    {t(
                      'profile.confirm_delete_msg',
                      '¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.'
                    )}
                  </p>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      className="btn btn-outline flex-1"
                      onClick={() => setShowDeleteConfirm(false)}
                    >
                      {t('common.cancel', 'Cancelar')}
                    </button>
                    <DeleteButton className="flex-1 justify-center" onClick={confirmDelete}>
                      {t('profile.confirm_delete_btn', 'Sí, eliminar')}
                    </DeleteButton>
                  </div>
                </div>
              </div>
            )}
          </div>
        </form>
      </Tabs>
    </div>
  );
}
