import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCourts } from '../../hooks/useInstitutionSync';
import Card from '../../components/ui/Card';
import DeleteButton from '../../components/ui/DeleteButton';
import EditButton from '../../components/ui/EditButton';
import CourtFormModal from '../../components/ui/CourtFormModal';
import Button from '../../components/ui/Button';
import { FiPlus, FiEdit2, FiSearch } from 'react-icons/fi';

export default function CourtsList() {
  // Usar el hook global en lugar de estado local
  const { 
    courts: rows, 
    isLoading: loading, 
    error, 
    createCourt, 
    updateCourt, 
    deleteCourt 
  } = useCourts();

  // Estados de filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [sportFilter, setSportFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Estados del modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCourt, setSelectedCourt] = useState(null);

  const handleDelete = async (courtId) => {
    if (window.confirm('¿Estás seguro de eliminar esta cancha?')) {
      try {
        await deleteCourt(courtId);
      } catch (err) {
        console.error('Error deleting court:', err);
      }
    }
  };

  const handleCreateCourt = () => {
    setSelectedCourt(null);
    setModalOpen(true);
  };

  const handleEditCourt = (court) => {
    setSelectedCourt(court);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedCourt(null);
  };

  const handleSubmitCourt = async (courtData) => {
    try {
      if (selectedCourt) {
        // Editar cancha existente
        await updateCourt({ id: selectedCourt.id, data: courtData });
      } else {
        // Crear nueva cancha
        await createCourt(courtData);
      }
      handleCloseModal();
    } catch (error) {
      console.error('Error submitting court:', error);
      throw error; // Re-throw para que el modal maneje el estado de loading
    }
  };

  // Función para filtrar canchas
  const filteredRows = rows.filter((court) => {
    // Filtro de búsqueda
    const matchesSearch =
      (court.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (court.sport || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (court.surface || '').toLowerCase().includes(searchTerm.toLowerCase());

    // Filtro por deporte
    const matchesSport = sportFilter === 'all' || court.sport === sportFilter;

    // Filtro por estado
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && court.active) ||
      (statusFilter === 'inactive' && !court.active);

    return matchesSearch && matchesSport && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Canchas</h1>
            <p className="text-gray-600 dark:text-gray-400">Gestiona las canchas del club</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">

            <Button
              onClick={handleCreateCourt}
              className="inline-flex items-center px-3 py-1.5 bg-navy text-white hover:bg-navy/90 dark:bg-gold dark:text-navy dark:hover:bg-gold/80 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-navy/30 dark:focus:ring-gold/40"
            >
              <FiPlus className="mr-2 h-4 w-4" />
              Nueva Cancha
            </Button>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Búsqueda */}
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, deporte o superficie..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy/30 focus:border-navy dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:ring-gold/40 dark:focus:border-gold"
              />
            </div>
          </div>

          {/* Filtro por deporte */}
          <div className="lg:w-48">
            <select
              value={sportFilter}
              onChange={(e) => setSportFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy/30 focus:border-navy dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:ring-gold/40 dark:focus:border-gold"
            >
              <option value="all">Todos los deportes</option>
              <option value="Padel">Padel</option>
              <option value="Tenis">Tenis</option>
              <option value="Fútbol">Fútbol</option>
              <option value="Básquet">Básquet</option>
            </select>
          </div>

          {/* Filtro por estado */}
          <div className="lg:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy/30 focus:border-navy dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:ring-gold/40 dark:focus:border-gold"
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activas</option>
              <option value="inactive">Inactivas</option>
            </select>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
            <span>
              <strong>{filteredRows.length}</strong> canchas mostradas
            </span>
            <span>
              <strong>{rows.filter((c) => c.active).length}</strong> activas
            </span>
            <span>
              <strong>{rows.filter((c) => !c.active).length}</strong> inactivas
            </span>
          </div>
        </div>
      </Card>

      {/* Contenido principal */}
      <Card>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy dark:border-gold mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Cargando canchas...</p>
            </div>
          </div>
        ) : error ? (
          <div className="p-4 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            {error.message || 'No pudimos cargar las canchas.'}
          </div>
        ) : filteredRows.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-500 mb-4">
              <FiSearch className="mx-auto h-12 w-12" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {rows.length === 0 ? 'No hay canchas registradas' : 'No se encontraron canchas'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {rows.length === 0
                ? 'Crea la primera cancha para comenzar a gestionar las instalaciones.'
                : 'Intenta ajustar los filtros para encontrar las canchas que buscas.'}
            </p>
          </div>
        ) : (
          <>
            {/* Vista de tarjetas para móvil */}
            <div className="block sm:hidden space-y-3">
              {filteredRows.map((court) => (
                <div
                  key={court.id}
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-navy dark:text-gold text-lg">
                        {court.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">ID: {court.id}</p>
                    </div>
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                        court.active
                          ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                          : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                      }`}
                    >
                      {court.active ? 'Activa' : 'Inactiva'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Deporte:</span>
                      <span className="ml-2 font-medium text-navy dark:text-gold">
                        {court.sport || 'Padel'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Ubicación:</span>
                      <span className="ml-2">{court.indoor ? 'Indoor' : 'Outdoor'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Superficie:</span>
                      <span className="ml-2">{court.surface || '-'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Luces:</span>
                      <span className="ml-2">{court.lights ? 'Sí' : 'No'}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <EditButton
                      onClick={() => handleEditCourt(court)}
                      className="flex-1 justify-center"
                    />
                    <DeleteButton
                      onClick={() => handleDelete(court.id)}
                      className="flex-1 justify-center"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Vista de tabla con scroll horizontal para tablet */}
            <div className="hidden sm:block lg:hidden overflow-x-auto bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <table className="min-w-[700px] w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <th className="p-3 min-w-[50px] font-medium">ID</th>
                    <th className="p-3 min-w-[120px] font-medium">Nombre</th>
                    <th className="p-3 min-w-[80px] font-medium">Deporte</th>
                    <th className="p-3 min-w-[70px] font-medium">Indoor</th>
                    <th className="p-3 min-w-[90px] font-medium">Superficie</th>
                    <th className="p-3 min-w-[70px] font-medium">Luces</th>
                    <th className="p-3 min-w-[60px] font-medium">Activa</th>
                    <th className="p-3 min-w-[140px] font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((court) => (
                    <tr
                      key={court.id}
                      className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="p-3 font-mono text-gray-600 dark:text-gray-400">{court.id}</td>
                      <td className="p-3 font-semibold text-navy dark:text-gold">{court.name}</td>
                      <td className="p-3">
                        <span className="inline-block px-2 py-1 rounded-full bg-navy/10 dark:bg-gold/20 text-navy dark:text-gold text-xs font-semibold">
                          {court.sport || 'Padel'}
                        </span>
                      </td>
                      <td className="p-3">{court.indoor ? 'Sí' : 'No'}</td>
                      <td className="p-3">{court.surface || '-'}</td>
                      <td className="p-3">{court.lights ? 'Sí' : 'No'}</td>
                      <td className="p-3">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                            court.active
                              ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300'
                              : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300'
                          }`}
                        >
                          {court.active ? 'Activa' : 'Inactiva'}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-1">
                          <EditButton onClick={() => handleEditCourt(court)} />
                          <DeleteButton onClick={() => handleDelete(court.id)} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Vista de tabla completa para desktop */}
            <div className="hidden lg:block overflow-x-auto bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <th className="p-4 font-medium">ID</th>
                    <th className="p-4 font-medium">Nombre</th>
                    <th className="p-4 font-medium">Deporte</th>
                    <th className="p-4 font-medium">Ubicación</th>
                    <th className="p-4 font-medium">Superficie</th>
                    <th className="p-4 font-medium">Iluminación</th>
                    <th className="p-4 font-medium">Estado</th>
                    <th className="p-4 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((court) => (
                    <tr
                      key={court.id}
                      className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="p-4 font-mono text-gray-600 dark:text-gray-400">{court.id}</td>
                      <td className="p-4 font-semibold text-navy dark:text-gold">{court.name}</td>
                      <td className="p-4">
                        <span className="inline-block px-3 py-1 rounded-full bg-navy/10 dark:bg-gold/20 text-navy dark:text-gold text-xs font-semibold">
                          {court.sport || 'Padel'}
                        </span>
                      </td>
                      <td className="p-4">{court.indoor ? 'Indoor' : 'Outdoor'}</td>
                      <td className="p-4">{court.surface || '-'}</td>
                      <td className="p-4">{court.lights ? 'Sí' : 'No'}</td>
                      <td className="p-4">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                            court.active
                              ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300'
                              : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300'
                          }`}
                        >
                          {court.active ? 'Activa' : 'Inactiva'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex space-x-2">
                          <EditButton onClick={() => handleEditCourt(court)} />
                          <DeleteButton onClick={() => handleDelete(court.id)} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Card>

      {/* Modal de editar/crear cancha */}
      <CourtFormModal
        open={modalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitCourt}
        court={selectedCourt}
      />
    </div>
  );
}
