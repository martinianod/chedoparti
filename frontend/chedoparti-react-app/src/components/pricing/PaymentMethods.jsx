import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FiCreditCard, FiPlus, FiTrash2, FiEdit2, FiCheck, FiX } from 'react-icons/fi';
import Card from '../ui/Card';
import SaveButton from '../ui/SaveButton';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { useAppNotifications } from '../../hooks/useAppNotifications';
import { usePricing } from '../../hooks/useInstitutionSync';

const DEFAULT_PAYMENT_METHODS = [
  { id: 'cash', name: 'Efectivo', enabled: true, adjustment: 0, type: 'percentage' },
  { id: 'transfer', name: 'Transferencia', enabled: true, adjustment: 0, type: 'percentage' },
  { id: 'debit_card', name: 'Tarjeta de Débito', enabled: true, adjustment: 0, type: 'percentage' },
  { id: 'credit_card', name: 'Tarjeta de Crédito', enabled: true, adjustment: 10, type: 'percentage' },
  { id: 'mercadopago', name: 'Mercado Pago', enabled: true, adjustment: 0, type: 'percentage' },
];

export default function PaymentMethods() {
  const { t } = useTranslation();
  const { showSuccess, showError } = useAppNotifications();
  
  const { 
    prices: initialPrices, 
    isLoading: loadingPrices, 
    updatePrices, 
    isSaving: saving 
  } = usePricing();

  const [methods, setMethods] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    if (!loadingPrices && initialPrices) {
      const savedMethods = initialPrices.paymentMethods || [];
      // Merge saved methods with defaults to ensure all standard methods exist
      const mergedMethods = DEFAULT_PAYMENT_METHODS.map(defaultMethod => {
        const saved = savedMethods.find(m => m.id === defaultMethod.id);
        return saved ? { ...defaultMethod, ...saved } : defaultMethod;
      });
      
      // Add any custom methods that might have been saved but are not in defaults
      const customMethods = savedMethods.filter(
        saved => !DEFAULT_PAYMENT_METHODS.find(d => d.id === saved.id)
      );

      setMethods([...mergedMethods, ...customMethods]);
    } else if (!loadingPrices && !initialPrices?.paymentMethods) {
      setMethods(DEFAULT_PAYMENT_METHODS);
    }
  }, [loadingPrices, initialPrices]);

  const handleSave = async () => {
    try {
      const currentConfig = initialPrices || {};
      const newConfig = {
        ...currentConfig,
        paymentMethods: methods
      };

      await updatePrices(newConfig);
      showSuccess('Métodos de pago guardados exitosamente');
    } catch (error) {
      console.error('Error saving payment methods:', error);
      showError('Error al guardar los métodos de pago');
    }
  };

  const handleToggleEnabled = (id) => {
    setMethods(prev => prev.map(m => 
      m.id === id ? { ...m, enabled: !m.enabled } : m
    ));
  };

  const startEditing = (method) => {
    setEditingId(method.id);
    setEditForm({ ...method });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEditing = () => {
    setMethods(prev => prev.map(m => 
      m.id === editingId ? { ...editForm } : m
    ));
    setEditingId(null);
    setEditForm({});
  };

  const handleAdjustmentChange = (value) => {
    setEditForm(prev => ({ ...prev, adjustment: parseFloat(value) || 0 }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Medios de Pago</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Gestione los métodos de pago aceptados y sus recargos o descuentos.
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

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-800 dark:text-gray-400">
              <tr>
                <th className="px-6 py-3">Método</th>
                <th className="px-6 py-3">Estado</th>
                <th className="px-6 py-3">Ajuste (%)</th>
                <th className="px-6 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {methods.map((method) => (
                <tr key={method.id} className="bg-white border-b dark:bg-gray-900 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                    {method.name}
                  </td>
                  <td className="px-6 py-4">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer"
                        checked={method.enabled}
                        onChange={() => handleToggleEnabled(method.id)}
                        disabled={editingId === method.id}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                      <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                        {method.enabled ? 'Activo' : 'Inactivo'}
                      </span>
                    </label>
                  </td>
                  <td className="px-6 py-4">
                    {editingId === method.id ? (
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={editForm.adjustment}
                          onChange={(e) => handleAdjustmentChange(e.target.value)}
                          className="w-24 py-1"
                        />
                        <span className="text-gray-500">%</span>
                      </div>
                    ) : (
                      <span className={`${
                        method.adjustment > 0 ? 'text-red-600' : method.adjustment < 0 ? 'text-green-600' : 'text-gray-500'
                      }`}>
                        {method.adjustment > 0 ? `+${method.adjustment}%` : method.adjustment < 0 ? `${method.adjustment}%` : '0%'}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {editingId === method.id ? (
                      <div className="flex justify-end gap-2">
                        <button onClick={saveEditing} className="text-green-600 hover:text-green-800 p-1">
                          <FiCheck size={18} />
                        </button>
                        <button onClick={cancelEditing} className="text-red-600 hover:text-red-800 p-1">
                          <FiX size={18} />
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => startEditing(method)}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm flex items-center gap-1 ml-auto"
                      >
                        <FiEdit2 size={16} />
                        Editar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 text-xs text-gray-500 dark:text-gray-400">
          <p>• Los ajustes positivos (+) se cobrarán como recargo.</p>
          <p>• Los ajustes negativos (-) se aplicarán como descuento.</p>
        </div>
      </Card>
    </div>
  );
}
