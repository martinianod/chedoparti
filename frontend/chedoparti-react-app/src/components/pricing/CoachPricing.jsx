import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FiUser, FiSave, FiPlus, FiTrash2, FiSearch } from 'react-icons/fi';
import Card from '../ui/Card';
import SaveButton from '../ui/SaveButton';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { useAppNotifications } from '../../hooks/useAppNotifications';
import { usePricing } from '../../hooks/useInstitutionSync';
import { usersApi } from '../../services/api';

export default function CoachPricing() {
  const { t } = useTranslation();
  const { showSuccess, showError } = useAppNotifications();
  
  // Global pricing hook
  const { 
    prices: initialPrices, 
    isLoading: loadingPrices, 
    updatePrices, 
    isSaving: saving 
  } = usePricing();

  // Local state
  const [defaultPrice, setDefaultPrice] = useState('');
  const [coachSpecificPrices, setCoachSpecificPrices] = useState({});
  const [coaches, setCoaches] = useState([]);
  const [loadingCoaches, setLoadingCoaches] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCoachId, setSelectedCoachId] = useState('');
  const [specificPriceInput, setSpecificPriceInput] = useState('');

  // Load initial data
  useEffect(() => {
    if (!loadingPrices && initialPrices) {
      const coachConfig = initialPrices.coachPricing || {};
      setDefaultPrice(coachConfig.defaultPrice || '');
      setCoachSpecificPrices(coachConfig.coachSpecific || {});
    }
  }, [loadingPrices, initialPrices]);

  // Load coaches
  useEffect(() => {
    const fetchCoaches = async () => {
      try {
        setLoadingCoaches(true);
        // Assuming there's a way to filter by role, or we fetch all and filter
        // Ideally: usersApi.list({ role: 'COACH' })
        // Fallback: fetch all and filter in frontend if API doesn't support filtering by role directly in list
        const response = await usersApi.list({ role: 'COACH' }); 
        // If the API returns a paginated response structure
        const users = Array.isArray(response.data) ? response.data : (response.data.content || []);
        // Filter just in case the API didn't filter
        const coachList = users.filter(u => u.role === 'COACH' || u.roles?.includes('COACH'));
        setCoaches(coachList);
      } catch (error) {
        console.error('Error loading coaches:', error);
        showError('Error al cargar la lista de entrenadores');
      } finally {
        setLoadingCoaches(false);
      }
    };

    fetchCoaches();
  }, []);

  const handleSave = async () => {
    try {
      const currentConfig = initialPrices || {};
      const newConfig = {
        ...currentConfig,
        coachPricing: {
          defaultPrice,
          coachSpecific: coachSpecificPrices
        }
      };

      await updatePrices(newConfig);
      showSuccess('Precios de entrenadores guardados exitosamente');
    } catch (error) {
      console.error('Error saving coach prices:', error);
      showError('Error al guardar los precios');
    }
  };

  const handleAddSpecificPrice = () => {
    if (!selectedCoachId || !specificPriceInput) return;

    setCoachSpecificPrices(prev => ({
      ...prev,
      [selectedCoachId]: specificPriceInput
    }));

    setSelectedCoachId('');
    setSpecificPriceInput('');
  };

  const handleRemoveSpecificPrice = (coachId) => {
    setCoachSpecificPrices(prev => {
      const newPrices = { ...prev };
      delete newPrices[coachId];
      return newPrices;
    });
  };

  const filteredCoaches = coaches.filter(coach => 
    coach.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Coaches available to add (not already in specific prices)
  const availableCoaches = filteredCoaches.filter(
    coach => !Object.keys(coachSpecificPrices).includes(String(coach.id))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Precios de Entrenadores</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Configure el valor base de las clases y excepciones por entrenador.
          </p>
        </div>
        <SaveButton
          onClick={handleSave}
          disabled={saving}
          className="py-2 px-4"
        >
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </SaveButton>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Default Price Section */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <FiUser className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Precio Base</h3>
          </div>
          
          <div className="max-w-md">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Valor por hora de clase (Default)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <Input
                type="number"
                min="0"
                placeholder="0.00"
                className="pl-7"
                value={defaultPrice}
                onChange={(e) => setDefaultPrice(e.target.value)}
              />
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Este precio se aplicará a todos los entrenadores que no tengan un precio específico configurado.
            </p>
          </div>
        </Card>

        {/* Specific Prices Section */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Precios Específicos</h3>
          </div>

          {/* Add New Specific Price */}
          <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg mb-6 border border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Agregar Excepción</h4>
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-6">
                <select
                  className="input w-full"
                  value={selectedCoachId}
                  onChange={(e) => setSelectedCoachId(e.target.value)}
                >
                  <option value="">Seleccionar Entrenador...</option>
                  {availableCoaches.map(coach => (
                    <option key={coach.id} value={coach.id}>{coach.name}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <Input
                    type="number"
                    min="0"
                    placeholder="Precio"
                    className="pl-7"
                    value={specificPriceInput}
                    onChange={(e) => setSpecificPriceInput(e.target.value)}
                  />
                </div>
              </div>
              <div className="sm:col-span-2">
                <Button 
                  onClick={handleAddSpecificPrice}
                  disabled={!selectedCoachId || !specificPriceInput}
                  className="w-full justify-center"
                >
                  <FiPlus />
                </Button>
              </div>
            </div>
          </div>

          {/* List of Specific Prices */}
          <div className="space-y-3">
            {Object.entries(coachSpecificPrices).length === 0 ? (
              <p className="text-center text-gray-500 py-4 text-sm">
                No hay precios específicos configurados.
              </p>
            ) : (
              Object.entries(coachSpecificPrices).map(([coachId, price]) => {
                const coach = coaches.find(c => String(c.id) === String(coachId));
                return (
                  <div key={coachId} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300">
                        {coach?.name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{coach?.name || 'Entrenador desconocido'}</p>
                        <p className="text-xs text-gray-500">ID: {coachId}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-semibold text-green-600 dark:text-green-400">
                        ${price}
                      </span>
                      <button
                        onClick={() => handleRemoveSpecificPrice(coachId)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
