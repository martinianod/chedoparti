import React from 'react';

export default function FilterChips({ filters, setFilters, t }) {
  return (
    <div className="flex flex-wrap gap-2 items-center justify-center flex-1">
      {Object.entries(filters).map(([key, value]) =>
        value ? (
          <span
            key={key}
            className="inline-flex items-center bg-brand/10 dark:bg-gold/20 text-brand dark:text-gold px-2 py-1 rounded text-xs font-semibold"
          >
            {t(`tournaments.${key}`)}: {value}
            <button
              className="ml-1 text-xs"
              onClick={() => setFilters((f) => ({ ...f, [key]: '' }))}
              title={t('common.remove', 'Quitar')}
            >
              &times;
            </button>
          </span>
        ) : null
      )}
    </div>
  );
}
