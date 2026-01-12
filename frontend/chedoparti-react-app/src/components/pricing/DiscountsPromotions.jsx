import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FiPercent, FiPlus, FiTrash2, FiTag } from 'react-icons/fi';
import Card from '../ui/Card';
import SaveButton from '../ui/SaveButton';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { useAppNotifications } from '../../hooks/useAppNotifications';
import { usePricing } from '../../hooks/useInstitutionSync';

export default function DiscountsPromotions() {
  const { t } = useTranslation();
  const { showSuccess, showError } = useAppNotifications();
  
  const { 
    prices: initialPrices, 
    isLoading: loadingPrices, 
    updatePrices, 
    isSaving: saving 
  } = usePricing();

  const [discounts, setDiscounts] = useState([]);
  const [newDiscount, setNewDiscount] = useState({
    name: '',
    value: '',
    type: 'percentage', // percentage | fixed
    active: true
  });

  useEffect(() => {
    if (!loadingPrices && initialPrices) {
      setDiscounts(initialPrices.discounts || []);
    }
  }, [loadingPrices, initialPrices]);

  const handleSave = async () => {
    try {
      const currentConfig = initialPrices || {};
      const newConfig = {
        ...currentConfig,
        discounts: discounts
      };

      await updatePrices(newConfig);
      showSuccess('Descuentos y promociones guardados exitosamente');
    } catch (error) {
      console.error('Error saving discounts:', error);
      showError('Error al guardar los descuentos');
    }
  };

  const handleAddDiscount = () => {
    if (!newDiscount.name || !newDiscount.value) {
      showError('Por favor complete el nombre y el valor del descuento');
      return;
    }

    const discountToAdd = {
      ...newDiscount,
      id: Date.now(), // Simple ID generation
      value: parseFloat(newDiscount.value)
    };

    setDiscounts([...discounts, discountToAdd]);
    setNewDiscount({
      name: '',
      value: '',
      type: 'percentage',
      active: true
    });
  };

  const handleRemoveDiscount = (id) => {
    setDiscounts(discounts.filter(d => d.id !== id));
  };

  const handleToggleActive = (id) => {
    setDiscounts(discounts.map(d => 
      d.id === id ? { ...d, active: !d.active } : d
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Descuentos y Promociones</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Configure descuentos automáticos y promociones especiales.
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create New Discount */}
        <div className="lg:col-span-1">
          <Card className="p-6 h-full">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FiPlus className="text-blue-600" />
              Nuevo Descuento
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nombre
                </label>
                <Input
                  placeholder="Ej: Descuento Socios"
                  value={newDiscount.name}
                  onChange={(e) => setNewDiscount({...newDiscount, name: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Valor
                  </label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={newDiscount.value}
                    onChange={(e) => setNewDiscount({...newDiscount, value: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tipo
                  </label>
                  <select
                    className="input w-full"
                    value={newDiscount.type}
                    onChange={(e) => setNewDiscount({...newDiscount, type: e.target.value})}
                  >
                    <option value="percentage">Porcentaje (%)</option>
                    <option value="fixed">Monto Fijo ($)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <Button 
                  onClick={handleAddDiscount}
                  className="w-full justify-center"
                >
                  Agregar Descuento
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* List of Discounts */}
        <div className="lg:col-span-2">
          <Card className="p-6 h-full">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FiTag className="text-purple-600" />
              Descuentos Activos
            </h3>

            {discounts.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
                <p>No hay descuentos configurados.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {discounts.map((discount) => (
                  <div 
                    key={discount.id} 
                    className={`
                      flex items-center justify-between p-4 rounded-lg border transition-all
                      ${discount.active 
                        ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm' 
                        : 'bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800 opacity-75'
                      }
                    `}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`
                        w-10 h-10 rounded-full flex items-center justify-center
                        ${discount.active 
                          ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' 
                          : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                        }
                      `}>
                        <FiPercent />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{discount.name}</h4>
                        <p className="text-sm text-gray-500">
                          {discount.type === 'percentage' ? `${discount.value}%` : `$${discount.value}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer"
                          checked={discount.active}
                          onChange={() => handleToggleActive(discount.id)}
                        />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                      </label>
                      
                      <button
                        onClick={() => handleRemoveDiscount(discount.id)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
