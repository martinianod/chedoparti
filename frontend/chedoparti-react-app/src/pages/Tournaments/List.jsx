import React, { useState, useRef, useEffect } from 'react';
import AddButton from '../../components/ui/AddButton';
import Card from '../../components/ui/Card';
import TournamentForm from '../../components/ui/TournamentForm';
import { useTranslation } from 'react-i18next';
import FilterAccordion from '../../components/ui/FilterAccordion';
import FilterChips from '../../components/ui/FilterChips';
import SortDropdown from '../../components/ui/SortDropdown';
import TournamentTable from '../../components/ui/TournamentTable';
import tournamentOptions from '../../config/tournamentOptions.json';
import ModalBackdrop from '../../components/ui/shared/ModalBackdrop';
import { FiPlus } from 'react-icons/fi';
import { tournamentsApi } from '../../services/api';

export default function TournamentsList() {
  const { t } = useTranslation();
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showFilterPopover, setShowFilterPopover] = useState(false);
  const filterPopoverRef = useRef(null);
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch tournaments from backend
  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const response = await tournamentsApi.list();
        setTournaments(response.data || []);
      } catch (error) {
        console.error('Error fetching tournaments:', error);
        setTournaments([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTournaments();
  }, []);

  // Filtros y orden
  const [filters, setFilters] = useState({
    sport: '',
    category: '',
    gender: '',
    ageRange: '',
    status: '',
    inscription: '',
  });

  const [sortField, setSortField] = useState('date');
  const [sortDir, setSortDir] = useState('asc');

  const {
    sportOptions,
    categoryOptions,
    genderOptions,
    ageOptions,
    statusOptions,
    inscriptionOptions,
  } = tournamentOptions;

  // Filtrar y ordenar torneos
  const filteredTournaments = tournaments
    .filter((t) => {
      if (filters.sport && t.sport !== filters.sport) return false;
      if (
        filters.category &&
        !(Array.isArray(t.category)
          ? t.category.includes(filters.category)
          : t.category === filters.category)
      )
        return false;
      if (
        filters.gender &&
        !(Array.isArray(t.gender) ? t.gender.includes(filters.gender) : t.gender === filters.gender)
      )
        return false;
      if (
        filters.ageRange &&
        !(Array.isArray(t.ageRange)
          ? t.ageRange.includes(filters.ageRange)
          : t.ageRange === filters.ageRange)
      )
        return false;
      if (filters.status && t.status !== filters.status) return false;
      if (filters.inscription && t.inscription !== filters.inscription) return false;
      return true;
    })
    .sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];

      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortDir === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortDir === 'asc' ? valA - valB : valB - valA;
      }
      return 0;
    });

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    id: null,
    name: '',
    sport: 'Padel',
    category: [],
    gender: [],
    ageRange: [],
    date: '',
    inscription: 'Abierta',
    status: 'Programado',
    participants: 0,
  });
  const [editing, setEditing] = useState(false);

  // Handlers
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOpenCreate = () => {
    setForm({
      id: null,
      name: '',
      sport: 'Padel',
      category: [],
      gender: [],
      ageRange: [],
      date: '',
      inscription: 'Abierta',
      status: 'Programado',
      participants: 0,
    });
    setEditing(false);
    setModalOpen(true);
  };

  const handleEdit = (tournament) => {
    setForm(tournament);
    setEditing(true);
    setModalOpen(true);
  };

  const handleDelete = (id) => {
    setTournaments((prev) => prev.filter((t) => t.id !== id));
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
    setShowSortDropdown(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('tournaments.title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">Gestiona los torneos del club</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center px-3 py-1.5 bg-navy text-white hover:bg-navy/90 dark:bg-gold dark:text-navy dark:hover:bg-gold/80 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-navy/30 dark:focus:ring-gold/40"
            >
              <FiPlus className="mr-2 h-4 w-4" />
              {t('tournaments.create')}
            </button>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <Card className="p-6">
        <section aria-labelledby="filter-heading" className="w-full">
          <h2 id="filter-heading" className="sr-only">
            {t('tournaments.filters', 'Filters')}
          </h2>

          <div className="flex flex-col gap-2 w-full">
            <div className="flex flex-col gap-2 w-full">
              <div className="w-full">
                <FilterAccordion
                  show={showFilterPopover}
                  filterPopoverRef={filterPopoverRef}
                  filters={filters}
                  setFilters={setFilters}
                  sportOptions={sportOptions}
                  categoryOptions={categoryOptions}
                  genderOptions={genderOptions}
                  ageOptions={ageOptions}
                  statusOptions={statusOptions}
                  inscriptionOptions={inscriptionOptions}
                  t={t}
                />
              </div>

              <FilterChips filters={filters} setFilters={setFilters} t={t} />
            </div>
          </div>
        </section>
      </Card>

      <Card>
        <div className="overflow-x-auto w-full">
          <TournamentTable
            tournaments={filteredTournaments}
            t={t}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
            mobile
          />
        </div>
      </Card>

      {/* Modal para crear/editar torneos */}
      {modalOpen && (
        <ModalBackdrop onClose={() => setModalOpen(false)}>
          <div
            className="bg-white dark:bg-navy rounded-lg shadow-lg p-4 w-full max-w-lg relative"
            onClick={(e) => e.stopPropagation()}
          >
            <TournamentForm
              form={form}
              onChange={handleFormChange}
              onSubmit={(e) => {
                e.preventDefault();
                if (editing) {
                  setTournaments((prev) => prev.map((t) => (t.id === form.id ? form : t)));
                } else {
                  setTournaments((prev) => [...prev, { ...form, id: Date.now() }]);
                }
                setModalOpen(false);
              }}
              onCancel={() => setModalOpen(false)}
              editing={editing}
              options={tournamentOptions}
            />
            <button
              className="absolute top-2 right-2 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              onClick={() => setModalOpen(false)}
              aria-label={t('common.close')}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </ModalBackdrop>
      )}
    </div>
  );
}
