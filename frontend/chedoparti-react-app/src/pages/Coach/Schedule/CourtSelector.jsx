import React from 'react';

/**
 * Court Selector Component
 * Multi-select checkboxes for selecting courts
 */
export default function CourtSelector({ courts = [], selectedCourtIds = [], onChange, sport = null, className = '' }) {
  // Filter courts by sport if provided
  const filteredCourts = sport 
    ? courts.filter((c) => c.sport === sport)
    : courts;

  const handleToggle = (courtId) => {
    const isSelected = selectedCourtIds.includes(courtId);
    
    if (isSelected) {
      // Remove court
      onChange(selectedCourtIds.filter((id) => id !== courtId));
    } else {
      // Add court
      onChange([...selectedCourtIds, courtId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedCourtIds.length === filteredCourts.length) {
      // Deselect all
      onChange([]);
    } else {
      // Select all
      onChange(filteredCourts.map((c) => c.id));
    }
  };

  // Calculate total capacity
  const totalCapacity = filteredCourts
    .filter((c) => selectedCourtIds.includes(c.id))
    .reduce((sum, court) => sum + (court.capacity || 4), 0);

  const allSelected = selectedCourtIds.length === filteredCourts.length && filteredCourts.length > 0;
  const someSelected = selectedCourtIds.length > 0 && selectedCourtIds.length < filteredCourts.length;

  if (filteredCourts.length === 0) {
    return (
      <div className={`text-center py-4 text-gray-500 dark:text-gray-400 ${className}`}>
        No hay canchas disponibles{sport ? ` para ${sport}` : ''}
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Select All */}
      {filteredCourts.length > 1 && (
        <div className="mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
          <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-navy p-2 rounded-lg transition-colors">
            <input
              type="checkbox"
              checked={allSelected}
              ref={(input) => {
                if (input) {
                  input.indeterminate = someSelected;
                }
              }}
              onChange={handleSelectAll}
              className="w-5 h-5 text-navy focus:ring-gold border-gray-300 rounded"
            />
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              {allSelected ? 'Deseleccionar todas' : 'Seleccionar todas'}
            </span>
          </label>
        </div>
      )}

      {/* Court List */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {filteredCourts.map((court) => {
          const isSelected = selectedCourtIds.includes(court.id);
          
          return (
            <label
              key={court.id}
              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                isSelected
                  ? 'bg-navy/10 dark:bg-gold/20 border-2 border-navy dark:border-gold'
                  : 'bg-gray-50 dark:bg-navy-light border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => handleToggle(court.id)}
                className="w-5 h-5 text-navy focus:ring-gold border-gray-300 rounded"
              />
              
              <div className="flex-1">
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  {court.name}
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Cap: {court.capacity || 4}
                  </span>
                  {court.indoor && (
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      Techada
                    </span>
                  )}
                </div>
              </div>

              {isSelected && (
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-navy dark:text-gold" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </label>
          );
        })}
      </div>

      {/* Summary */}
      {selectedCourtIds.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {selectedCourtIds.length} {selectedCourtIds.length === 1 ? 'cancha seleccionada' : 'canchas seleccionadas'}
            </span>
            <span className="font-bold text-navy dark:text-gold">
              Capacidad total: {totalCapacity}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
