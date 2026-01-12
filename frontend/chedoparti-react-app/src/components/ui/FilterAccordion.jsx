import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SortDropdown from './SortDropdown';
import Button from './Button';

export default function FilterAccordion({
  show,
  filters,
  setFilters,
  sportOptions,
  categoryOptions,
  genderOptions,
  ageOptions,
  statusOptions,
  inscriptionOptions,
  t,
  sort,
  setSort,
}) {
  const [open, setOpen] = useState(show);
  const panelRef = useRef(null);
  const buttonRef = useRef(null);

  // Cerrar al hacer clic fuera del panel o del botón
  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e) {
      const outsidePanel = panelRef.current && !panelRef.current.contains(e.target);
      const outsideButton = buttonRef.current && !buttonRef.current.contains(e.target);
      if (outsidePanel && outsideButton) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const sortOptions = [
    { value: 'popular', label: t('tournaments.sort_popular', 'Más popular') },
    { value: 'rating', label: t('tournaments.sort_rating', 'Mejor puntuación') },
    { value: 'newest', label: t('tournaments.sort_newest', 'Más reciente') },
  ];

  const activeCount = [
    filters.sport,
    filters.category,
    filters.gender,
    filters.ageRange,
    filters.status,
    filters.inscription,
  ].filter(Boolean).length;

  const clearAll = () => setFilters({});

  const filterGroups = [
    { title: t('tournaments.sport'), key: 'sport', options: sportOptions },
    { title: t('tournaments.category'), key: 'category', options: categoryOptions },
    { title: t('tournaments.gender'), key: 'gender', options: genderOptions },
    { title: t('tournaments.ageRange'), key: 'ageRange', options: ageOptions },
    { title: t('tournaments.status'), key: 'status', options: statusOptions },
    { title: t('tournaments.inscription'), key: 'inscription', options: inscriptionOptions },
  ];

  return (
    <section aria-labelledby="filter-heading" className="w-full mb-2">
      <h2 id="filter-heading" className="sr-only">
        {t('tournaments.filters', 'Filtros')}
      </h2>

      {/* Header */}
      <div className="flex items-center gap-2 mb-2 w-full">
        <button
          ref={buttonRef}
          type="button"
          className="bg-yellow-400 hover:bg-yellow-500 text-white font-semibold rounded-lg px-4 py-2 shadow flex items-center gap-2 text-sm transition-colors duration-150"
          aria-expanded={open}
          aria-controls="filter-panel"
          onClick={() => setOpen((prev) => !prev)}
        >
          <motion.svg
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
            className="w-5 h-5"
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <path d="M2.628 1.601C5.028 1.206 7.49 1 10 1s4.973.206 7.372.601a.75.75 0 0 1 .628.74v2.288a2.25 2.25 0 0 1-.659 1.59l-4.682 4.683a2.25 2.25 0 0 0-.659 1.59v3.037c0 .684-.31 1.33-.844 1.757l-1.937 1.55A.75.75 0 0 1 8 18.25v-5.757a2.25 2.25 0 0 0-.659-1.591L2.659 6.22A2.25 2.25 0 0 1 2 4.629V2.34a.75.75 0 0 1 .628-.74Z" />
          </motion.svg>
          {activeCount} {t('tournaments.filters', 'Filtros')}
        </button>

        <Button type="button" variant="secondary" size="sm" onClick={clearAll}>
          {t('tournaments.clear_all', 'Limpiar todo')}
        </Button>

        <div className="ml-auto">
          <SortDropdown options={sortOptions} value={sort} onChange={setSort} t={t} />
        </div>
      </div>

      {/* Panel con animación */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id="filter-panel"
            ref={panelRef}
            key="filters"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="w-full bg-white dark:bg-navy rounded-lg shadow-lg p-4 flex flex-row gap-6 overflow-x-auto border border-yellow-100">
              {filterGroups.map(({ title, key, options }) => (
                <div key={key} className="min-w-[140px] flex flex-col items-center">
                  <div className="font-semibold mb-2 text-center">{title}</div>
                  {options.map((opt) => (
                    <label key={opt} className="flex items-center gap-2 mb-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters[key] === opt}
                        onChange={() =>
                          setFilters((f) => ({ ...f, [key]: f[key] === opt ? '' : opt }))
                        }
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
