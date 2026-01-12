import { useState, useMemo } from 'react';
import {
  FiMenu,
  FiX,
  FiHome,
  FiCalendar,
  FiSettings,
  FiBarChart2,
  FiChevronLeft,
  FiLayers,
  FiClock,
  FiAward,
  FiArchive,
  FiUser,
  FiUsers,
  FiLogOut,
  FiDollarSign,
} from 'react-icons/fi';
import { Link, useLocation } from 'react-router-dom';
import { useSidebar } from '../../context/UIContext.jsx';
import { useTranslation } from 'react-i18next';
import useAuth from '../../hooks/useAuth';
import usePermissions from '../../hooks/usePermissions';
import { PERMISSIONS } from '../../constants/roles';

export default function Sidebar() {
  const { collapsed, toggleSidebar } = useSidebar();
  const [isOpen, setIsOpen] = useState(false); // mobile
  const location = useLocation();
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { can, isSocio, role } = usePermissions();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const menuItems = useMemo(() => {
    const items = [
      {
        name: t('nav.dashboard'),
        icon: <FiHome />,
        path: '/',
        show: can(PERMISSIONS.VIEW_DASHBOARD) || can(PERMISSIONS.VIEW_COACH_DASHBOARD) || can(PERMISSIONS.VIEW_SOCIO_DASHBOARD),
      },
      {
        name: isSocio() ? t('nav.myReservations') : t('nav.reservations'),
        icon: <FiCalendar />,
        path: '/reservations',
        show: can(PERMISSIONS.VIEW_RESERVATIONS),
      },
      {
        name: t('nav.courts'),
        icon: <FiLayers />,
        path: '/courts',
        show: can(PERMISSIONS.VIEW_COURTS),
      },
      {
        name: t('nav.schedules'),
        icon: <FiClock />,
        path: '/schedules',
        show: can(PERMISSIONS.VIEW_SCHEDULE),
      },
      {
        name: 'Configuración de Precios',
        icon: <FiDollarSign />,
        path: '/pricing',
        show: can(PERMISSIONS.MANAGE_PRICING),
      },
      {
        name: 'Mi Disponibilidad', // TODO: Add to translations
        icon: <FiClock />,
        path: '/coach/availability',
        show: can(PERMISSIONS.MANAGE_OWN_AVAILABILITY),
      },
      {
        name: t('nav.tournaments'),
        icon: <FiAward />,
        path: '/tournaments',
        show: can(PERMISSIONS.VIEW_TOURNAMENTS),
      },
      {
        name: t('nav.stats'),
        icon: <FiBarChart2 />,
        path: '/stats',
        show: can(PERMISSIONS.VIEW_STATS) || can(PERMISSIONS.VIEW_REPORTS),
      },
      {
        name: t('nav.users'),
        icon: <FiUsers />,
        path: '/users',
        show: can(PERMISSIONS.VIEW_USERS),
      },
    ];

    return items.filter((item) => item.show);
  }, [t, can, isSocio]);

  return (
    <>
      {/* Botón hamburguesa en móvil */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-1 rounded-md transition-colors
          bg-navy/10 dark:bg-gold/20 text-navy dark:text-gold
          hover:bg-navy/20 dark:hover:bg-gold/30
          focus:outline-none focus:ring-2 focus:ring-navy/30 dark:focus:ring-gold/40"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <FiX size={20} /> : <FiMenu size={20} />}
      </button>

      {/* Overlay móvil */}
      <div
        className={`fixed inset-0 bg-navy bg-opacity-40 z-40 transition-opacity md:hidden ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full bg-background-secondary dark:bg-navy border-r border-navy dark:border-gold shadow-sm 
          transition-all duration-300 ease-in-out
          ${collapsed ? 'w-20' : 'w-64'}
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b-2 border-navy dark:border-gold">
          {collapsed ? (
            <img
              src="/escudo-01.png"
              alt="Escudo Club"
              className="inline-block w-8 h-8 align-middle mx-auto"
            />
          ) : (
            <h1 className="text-xl font-bold text-navy dark:text-gold transition-opacity duration-300 flex items-center">
              <img
                src="/escudo-01.png"
                alt={t('sidebar.logo_alt')}
                className="inline-block w-8 h-8 mr-2 align-middle"
              />
              {t('sidebar.title')}
            </h1>
          )}
          <button
            onClick={toggleSidebar}
            className="hidden md:flex items-center justify-center w-8 h-8 text-navy hover:text-gold transition-colors"
          >
            <FiChevronLeft
              className={`transform transition-transform ${collapsed ? 'rotate-180' : ''}`}
            />
          </button>
        </div>

        {/* Menú */}
        <nav className="mt-4 flex flex-col gap-1">
          {menuItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-all duration-200
                  ${
                    active
                      ? 'bg-gold text-navy dark:bg-gold/30 dark:text-navy'
                      : 'text-navy hover:bg-background-secondary dark:text-gold dark:hover:bg-navy-light'
                  }
                  ${collapsed ? 'justify-center' : ''}
                `}
              >
                <span className="text-lg">{item.icon}</span>
                {!collapsed && <span className="text-sm font-medium">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Menú de usuario fijo abajo */}
        <div
          className={`absolute bottom-0 left-0 w-full pb-2 px-2 transition-opacity duration-300 ${collapsed ? 'opacity-0' : 'opacity-100'}`}
        >
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setUserMenuOpen((v) => !v)}
          >
            <div className="w-10 h-10 rounded-full bg-gold/80 dark:bg-navy flex items-center justify-center overflow-hidden border-2 border-navy dark:border-gold">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <span className="text-sm font-bold text-navy dark:text-gold uppercase">
                  {(() => {
                    const name = user?.name || '';
                    const parts = name.trim().split(/\s+/);

                    if (parts.length >= 2) {
                      const initials = parts[0][0] + parts[parts.length - 1][0];

                      return initials;
                    }
                    const singleInitial = parts[0]?.[0] || '?';

                    return singleInitial;
                  })()}
                </span>
              )}
            </div>
            {!collapsed && (
              <div className="flex-1">
                <span className="block font-medium text-navy dark:text-gold">
                  {user?.name || 'Usuario'}
                </span>
                <span className="block text-xs text-navy/60 dark:text-gold/60">
                  {role ? t(`roles.${role}`) : ''}
                  {(isSocio() || role === 'SOCIO') &&
                    user?.membershipNumber && (
                      <span className="ml-1 font-mono">#{user.membershipNumber}</span>
                    )}
                </span>
              </div>
            )}
            <span className={`transition-transform ${userMenuOpen ? 'rotate-180' : ''}`}>
              <FiChevronLeft />
            </span>
          </div>
          {/* Dropdown hacia arriba con iconos y colores del club */}
          <div className="relative">
            {userMenuOpen && !collapsed && (
              <div className="absolute bottom-14 left-0 w-full bg-white dark:bg-navy rounded-xl shadow-lg border-2 border-gold dark:border-gold p-2 flex flex-col gap-1 z-50 animate-fade-in-up">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gold/20 dark:hover:bg-gold/30 text-navy dark:text-gold transition"
                >
                  <FiUser className="text-lg" />
                  <span>{t('sidebar.profile')}</span>
                </Link>
                <Link
                  to="/settings"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gold/20 dark:hover:bg-gold/30 text-navy dark:text-gold transition"
                >
                  <FiSettings className="text-lg" />
                  <span>{t('sidebar.settings')}</span>
                </Link>
                <button
                  onClick={logout}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900 text-red-700 dark:text-red-400 text-left transition"
                >
                  <FiLogOut className="text-lg" />
                  <span>{t('sidebar.logout')}</span>
                </button>
              </div>
            )}
          </div>
          <div className="w-full border-t border-navy dark:border-gold pt-2 text-center text-xs text-navy dark:text-gold">
            {t('sidebar.copyright')}
          </div>
        </div>
      </aside>
    </>
  );
}
