import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/UIContext.jsx';
import { Sun, Moon } from 'lucide-react';
import useAuth from '../../hooks/useAuth.js';

export default function Topbar() {
  const { t, i18n } = useTranslation();
  const { theme, toggle } = useTheme();
  const { user } = useAuth();

  const changeLang = (lng) => {
    i18n.changeLanguage(lng);
    try {
      localStorage.setItem('i18nextLng', lng);
    } catch {}
  };

  // Función para obtener el primer nombre del usuario
  const getFirstName = () => {
    if (user?.name) {
      return user.name.split(' ')[0];
    }
    if (user?.fullName) {
      return user.fullName.split(' ')[0];
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'Usuario';
  };

  return (
    <header className="sticky top-0 z-10 h-16 bg-white/70 dark:bg-gray-900/70 backdrop-blur border-b-2 border-gray-200 dark:border-gray-800">
      <div className="mx-auto flex h-full max-w-screen-2xl items-center justify-between px-6 gap-4">
        {/* Área izquierda - Saludo personalizado */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {/* Espaciado para el botón hamburguesa en móvil */}
          <div className="w-10 md:w-0 flex-shrink-0"></div>
          <div className="font-medium text-navy dark:text-gold truncate">
            <span className="hidden sm:inline">
              {t('topbar.greeting', { name: getFirstName() })}
            </span>
            <span className="sm:hidden">{t('topbar.greetingShort', { name: getFirstName() })}</span>
          </div>
        </div>

        {/* Área derecha - Controles */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Selector de idioma - Solo desktop */}
          <div className="hidden lg:flex items-center text-sm">
            <button
              className="px-3 py-1.5 rounded-md text-xs font-semibold transition-colors
                bg-navy/10 dark:bg-gold/20 text-navy dark:text-gold
                hover:bg-navy/20 dark:hover:bg-gold/30
                focus:outline-none focus:ring-2 focus:ring-navy/30 dark:focus:ring-gold/40"
              onClick={() => changeLang(i18n.language === 'es' ? 'en' : 'es')}
            >
              {i18n.language === 'es' ? 'EN' : 'ES'}
            </button>
          </div>

          {/* Botón de tema */}
          <button
            className="p-2 rounded-md transition-colors
              bg-navy/10 dark:bg-gold/20 text-navy dark:text-gold
              hover:bg-navy/20 dark:hover:bg-gold/30
              focus:outline-none focus:ring-2 focus:ring-navy/30 dark:focus:ring-gold/40"
            onClick={toggle}
            aria-label={t('topbar.toggleTheme')}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </div>
    </header>
  );
}
