import React, { useState } from 'react';

export default function SortDropdown({ sort, setSort, t }) {
  const [open, setOpen] = useState(false);
  const sortOptions = [
    { value: 'popular', label: t('tournaments.sort_popular', 'Más popular') },
    { value: 'rating', label: t('tournaments.sort_rating', 'Mejor puntuación') },
    { value: 'newest', label: t('tournaments.sort_newest', 'Más reciente') },
  ];

  return (
    <div className="relative inline-block">
      <button
        className="bg-yellow-400 hover:bg-yellow-500 text-white font-semibold rounded-lg px-4 py-2 shadow flex items-center gap-2 text-sm transition-colors duration-150"
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls="sort-menu"
        tabIndex={0}
        onClick={() => setOpen((v) => !v)}
      >
        {t('tournaments.sort', 'Ordenar')}
        <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="w-4 h-4">
          <path d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" />
        </svg>
      </button>
      {open && (
        <ul
          id="sort-menu"
          className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 border border-gray-200 rounded-lg shadow-lg z-10"
          role="listbox"
        >
          {sortOptions.map((opt) => (
            <li
              key={opt.value}
              role="option"
              aria-selected={sort === opt.value}
              className={`cursor-pointer px-4 py-2 text-sm ${sort === opt.value ? 'font-semibold text-yellow-600 bg-yellow-50' : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700'}`}
              onClick={() => {
                setSort(opt.value);
                setOpen(false);
              }}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
