import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FiDollarSign,
  FiClock,
  FiCalendar,
  FiSettings,
  FiEye,
  FiSave,
  FiCopy,
  FiLayers,
  FiTrendingUp,
} from 'react-icons/fi';
import Card from '../ui/Card';
import SaveButton from '../ui/SaveButton';
import { useAppNotifications } from '../../hooks/useAppNotifications';
import GlobalPricingRules from './GlobalPricingRules';
import SpecialDatesManager from './SpecialDatesManager';
import PricingPreview from './PricingPreview';
import PricingTemplates from './PricingTemplates';
import { usePricing, useCourts } from '../../hooks/useInstitutionSync';

export default function CourtPricing() {
  const { t } = useTranslation();
  const { showSuccess, showError } = useAppNotifications();
  const [activeTab, setActiveTab] = useState('rules');
  const [previewMode, setPreviewMode] = useState(false);

  // Usar hooks globales
  const { 
    prices: initialPrices, 
    isLoading: loadingPrices, 
    updatePrices, 
    isSaving: saving 
  } = usePricing();

  const { courts } = useCourts();

  // Estados para las diferentes configuraciones
  const [pricingRules, setPricingRules] = useState([]);
  const [specialDatesPricing, setSpecialDatesPricing] = useState([]);

  // Carga inicial de datos y migración
  useEffect(() => {
    if (!loadingPrices && initialPrices) {
      if (initialPrices.pricingRules) {
        // Si ya existe el formato nuevo, usarlo
        setPricingRules(initialPrices.pricingRules);
      } else if (initialPrices.global || initialPrices.courtSpecific) {
        // Migrar formato antiguo al nuevo unificado
        const migratedRules = [];
        
        // 1. Migrar reglas globales
        if (initialPrices.global) {
          initialPrices.global.forEach(rule => {
            migratedRules.push({
              ...rule,
              id: `global-${Date.now()}-${Math.random()}`,
              scope: { type: 'global', sport: '', courtIds: [] }
            });
          });
        }

        // 2. Migrar reglas específicas
        if (initialPrices.courtSpecific) {
          Object.entries(initialPrices.courtSpecific).forEach(([courtId, rules]) => {
            rules.forEach(rule => {
              migratedRules.push({
                ...rule,
                id: `specific-${courtId}-${Date.now()}-${Math.random()}`,
                scope: { type: 'courts', sport: '', courtIds: [parseInt(courtId)] }
              });
            });
          });
        }

        setPricingRules(migratedRules);
      } else {
        // Default inicial si no hay nada
        setPricingRules([
          {
            id: 'default-1',
            days: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'],
            timeBlocks: [{ start: '08:00', end: '23:00', price: '2500' }],
            durations: ['1h', '1.5h'],
            scope: { type: 'global', sport: '', courtIds: [] }
          }
        ]);
      }

      setSpecialDatesPricing(initialPrices.specialDates || []);
    }
  }, [loadingPrices, initialPrices]);

  const validateConfiguration = () => {
    for (const rule of pricingRules) {
      if (!rule.days || rule.days.length === 0) {
        showError('Una regla no tiene días seleccionados');
        return false;
      }

      const timeBlocks = rule.timeBlocks || [];
      for (const block of timeBlocks) {
        if (!block.start || !block.end) {
          showError('Un bloque no tiene horarios definidos');
          return false;
        }
        if (block.start >= block.end) {
          showError('Un bloque tiene un rango de horario inválido');
          return false;
        }
        if (!block.price || Number(block.price) < 0) {
          showError('Un bloque tiene un precio inválido');
          return false;
        }
      }
    }
    return true;
  };

  const handleSaveConfiguration = async () => {
    if (!validateConfiguration()) return;

    try {
      const newConfig = {
        pricingRules: pricingRules, // Guardamos el nuevo formato unificado
        specialDates: specialDatesPricing,
        lastUpdated: new Date().toISOString(),
        // Mantenemos compatibilidad hacia atrás por si acaso (opcional)
        global: pricingRules.filter(r => r.scope.type === 'global'),
        courtSpecific: {} // Ya no se usa de esta forma, pero para limpiar
      };

      await updatePrices(newConfig);
      showSuccess('Configuración de precios guardada exitosamente');
    } catch (error) {
      console.error('Error saving configuration:', error);
      showError('Error al guardar la configuración');
    }
  };

  const handleApplyTemplate = (templateId, config) => {
    if (config) {
      // Adaptar la plantilla al nuevo formato si es necesario
      // Por simplicidad asumimos que las plantillas vendrán actualizadas o se migrarán igual
      setPricingRules(config.pricingRules || []);
      setSpecialDatesPricing(config.special || []);
    }
  };

  const tabs = [
    {
      id: 'rules',
      label: 'Reglas de Precios',
      icon: <FiDollarSign className="w-4 h-4" />,
      description: 'Configure precios por día, horario y cancha',
    },
    {
      id: 'special',
      label: 'Fechas Especiales',
      icon: <FiCalendar className="w-4 h-4" />,
      description: 'Feriados, eventos y fechas especiales',
    },
    {
      id: 'templates',
      label: 'Plantillas',
      icon: <FiLayers className="w-4 h-4" />,
      description: 'Configuraciones predefinidas',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Precios de Canchas</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Configure los precios de las canchas de forma global o específica.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className={`btn font-semibold py-2 px-4 flex items-center gap-2 transition-colors ${
              previewMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'btn-secondary'
            }`}
          >
            <FiEye className="w-4 h-4" />
            <span className="hidden sm:inline">
              {previewMode ? 'Ocultar Preview' : 'Vista Previa'}
            </span>
          </button>

          <SaveButton
            onClick={handleSaveConfiguration}
            disabled={saving}
            className="py-2 px-4"
          >
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </SaveButton>
        </div>
      </div>

      <div className={`grid ${previewMode ? 'lg:grid-cols-3' : 'lg:grid-cols-1'} gap-6`}>
        {/* Configuration Panel */}
        <div className={previewMode ? 'lg:col-span-2' : 'lg:col-span-1'}>
          <Card className="p-4 sm:p-6">
            {/* Tabs Navigation */}
            <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
              <div className="flex flex-wrap gap-2 sm:gap-4">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 border-b-2 transition-colors text-sm sm:text-base ${
                      activeTab === tab.id
                        ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                    }`}
                  >
                    {tab.icon}
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">
              {activeTab === 'rules' && (
                <GlobalPricingRules 
                  pricing={pricingRules} 
                  onChange={setPricingRules} 
                  courts={courts}
                />
              )}

              {activeTab === 'special' && (
                <SpecialDatesManager
                  pricing={specialDatesPricing}
                  onChange={setSpecialDatesPricing}
                  courts={courts}
                />
              )}

              {activeTab === 'templates' && (
                <PricingTemplates onApplyTemplate={handleApplyTemplate} />
              )}
            </div>
          </Card>
        </div>

        {/* Preview Panel */}
        {previewMode && (
          <div className="lg:col-span-1">
            <Card className="p-4 sm:p-6 sticky top-6">
              <div className="flex items-center gap-2 mb-4">
                <FiTrendingUp className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Vista Previa
                </h3>
              </div>

              <PricingPreview
                // Adaptamos el preview para que entienda el nuevo formato si es necesario
                // O idealmente actualizamos PricingPreview también. 
                // Por ahora pasamos props compatibles si PricingPreview espera global/specific
                globalPricing={pricingRules.filter(r => r.scope.type === 'global')}
                courtSpecificPricing={
                  // Convertir reglas específicas a formato antiguo para el preview si no se actualiza
                  pricingRules.reduce((acc, rule) => {
                    if (rule.scope.type === 'courts') {
                      rule.scope.courtIds.forEach(id => {
                        if (!acc[id]) acc[id] = [];
                        acc[id].push(rule);
                      });
                    }
                    return acc;
                  }, {})
                }
                specialDatesPricing={specialDatesPricing}
              />
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
