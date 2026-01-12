import { useTranslation } from 'react-i18next';
import { FiClock, FiTrash2, FiCopy, FiAlertTriangle } from 'react-icons/fi';
import TimeSelector from '../ui/TimeSelector';
import DeleteButton from '../ui/DeleteButton';
import { validateTimeBlock } from '../../utils/timeBlockValidation';

/**
 * Componente para gestionar un bloque de tiempo individual dentro de una regla de precios
 */
export default function TimeBlock({
  block,
  index,
  onChange,
  onDelete,
  onDuplicate,
  hasConflict = false,
  conflictMessage = '',
}) {
  const { t } = useTranslation();

  const handleChange = (field, value) => {
    onChange({ ...block, [field]: value });
  };

  const validation = validateTimeBlock(block);

  // Colores según tipo de precio
  const priceTypeColors = {
    normal: 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700',
    nocturno: 'bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700',
    fin_semana: 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700',
    feriado: 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700',
    premium: 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700',
  };

  const colorClass = priceTypeColors[block.priceType] || priceTypeColors.normal;

  return (
    <div className={`rounded-lg border-2 p-4 ${colorClass} transition-all duration-200`}>
      {/* Header del bloque */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FiClock className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            {t('globalPricing.blockNumber', { number: index + 1 })}
          </span>
        </div>

        <div className="flex gap-2">
          {/* Botón duplicar */}
          <button
            onClick={onDuplicate}
            className="p-1.5 hover:bg-white/50 dark:hover:bg-gray-700/50 rounded transition-colors"
            title={t('globalPricing.duplicateTimeBlock')}
          >
            <FiCopy className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>

          {/* Botón eliminar */}
          <DeleteButton
            onClick={onDelete}
            className="p-1.5 text-sm"
            title={t('globalPricing.removeTimeBlock')}
          />
        </div>
      </div>

      {/* Campos del bloque */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Hora inicio */}
        <TimeSelector
          label={t('globalPricing.startTime')}
          value={block.start}
          onChange={(value) => handleChange('start', value)}
          placeholder="Hora inicio"
          className="w-full text-sm"
        />

        {/* Hora fin */}
        <TimeSelector
          label={t('globalPricing.endTime')}
          value={block.end}
          onChange={(value) => handleChange('end', value)}
          placeholder="Hora fin"
          className="w-full text-sm"
        />

        {/* Tipo de precio */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('globalPricing.priceType')}
          </label>
          <select
            className="input w-full text-sm"
            value={block.priceType || 'normal'}
            onChange={(e) => handleChange('priceType', e.target.value)}
          >
            <option value="normal">{t('globalPricing.priceTypeNormal')}</option>
            <option value="nocturno">{t('globalPricing.priceTypeNight')}</option>
            <option value="fin_semana">{t('globalPricing.priceTypeWeekend')}</option>
            <option value="feriado">{t('globalPricing.priceTypeHoliday')}</option>
            <option value="premium">{t('globalPricing.priceTypePremium')}</option>
          </select>
        </div>

        {/* Precio */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('globalPricing.pricePerHour')}
          </label>
          <input
            type="number"
            min="0"
            step="100"
            className="input w-full text-sm"
            placeholder={t('globalPricing.pricePlaceholder')}
            value={block.price}
            onChange={(e) => handleChange('price', e.target.value)}
          />
        </div>
      </div>

      {/* Mensajes de error o advertencia */}
      {(!validation.valid || hasConflict) && (
        <div className="mt-3 space-y-2">
          {/* Errores de validación */}
          {!validation.valid && validation.errors.length > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded p-2">
              {validation.errors.map((error, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-red-700 dark:text-red-300">
                  <FiAlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              ))}
            </div>
          )}

          {/* Advertencia de conflicto */}
          {hasConflict && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded p-2">
              <div className="flex items-start gap-2 text-xs text-amber-700 dark:text-amber-300">
                <FiAlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                <span>{conflictMessage || t('globalPricing.timeConflict')}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Barra visual del rango de tiempo */}
      <div className="mt-3 pt-3 border-t border-gray-300 dark:border-gray-600">
        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
          <FiClock className="w-3 h-3" />
          <span className="font-medium">
            {block.start} - {block.end}
          </span>
          {block.price && (
            <>
              <span className="text-gray-400 dark:text-gray-500">•</span>
              <span className="font-semibold text-gray-700 dark:text-gray-300">
                ${block.price}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
