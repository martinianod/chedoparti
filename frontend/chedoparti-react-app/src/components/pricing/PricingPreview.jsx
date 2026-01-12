import { useState } from 'react';
import {
  FiCalendar,
  FiClock,
  FiDollarSign,
  FiTrendingUp,
  FiInfo,
  FiCheckCircle,
  FiAlertCircle,
} from 'react-icons/fi';
import Card from '../ui/Card';

/**
 * Componente de vista previa de precios en tiempo real
 * Simula cálculos basados en configuraciones y muestra ejemplos prácticos
 */
export default function PricingPreview({
  globalPricing = [],
  courtSpecificPricing = {},
  specialDatesPricing = [],
  courts = [],
}) {
  const [previewDate, setPreviewDate] = useState(new Date().toISOString().split('T')[0]);
  const [previewTime, setPreviewTime] = useState('14:00');
  const [selectedCourtId, setSelectedCourtId] = useState(1);
  const [duration, setDuration] = useState('1h');

  // Mock de precios base por deporte
  const basePrices = {
    Padel: 2500,
    Tenis: 1800,
    Fútbol: 3000,
  };

  // Simular cálculo de precio complejo
  const calculatePrice = () => {
    try {
      // 1. Obtener precio base
      const selectedCourt = courts.find((c) => c.id === selectedCourtId);
      const basePricePerHour = basePrices[selectedCourt?.sport] || 2000;

      // 2. Convertir duración a horas
      const durationInHours = parseFloat(duration.replace('h', ''));
      let basePrice = basePricePerHour * durationInHours;

      // 3. Verificar si hay fecha especial
      const specialDate = specialDatesPricing.find(
        (sd) =>
          sd.date === previewDate &&
          sd.startTime <= previewTime &&
          sd.endTime >= previewTime &&
          (sd.courtIds.length === 0 || sd.courtIds.includes(selectedCourtId))
      );

      let finalPrice = basePrice;
      let appliedRules = [];

      if (specialDate) {
        // Aplicar regla de fecha especial
        switch (specialDate.strategy) {
          case 'multiplier':
            finalPrice = basePrice * specialDate.value;
            appliedRules.push({
              type: 'special_date',
              name: specialDate.name,
              description: `Multiplicador ${specialDate.value}x`,
              adjustment: finalPrice - basePrice,
            });
            break;
          case 'fixed':
            finalPrice = specialDate.value * durationInHours;
            appliedRules.push({
              type: 'special_date',
              name: specialDate.name,
              description: `Precio fijo $${specialDate.value}/h`,
              adjustment: finalPrice - basePrice,
            });
            break;
          case 'percentage':
            const percentageIncrease = basePrice * (specialDate.value / 100);
            finalPrice = basePrice + percentageIncrease;
            appliedRules.push({
              type: 'special_date',
              name: specialDate.name,
              description: `+${specialDate.value}%`,
              adjustment: percentageIncrease,
            });
            break;
        }
      } else {
        // Aplicar reglas globales o específicas de cancha
        const courtSpecific = courtSpecificPricing[selectedCourtId] || [];
        const rulesToCheck = courtSpecific.length > 0 ? courtSpecific : globalPricing;

        // Obtener día de la semana
        const date = new Date(previewDate);
        const dayName = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][
          date.getDay()
        ];

        // Buscar regla aplicable (soporta tanto formato antiguo como nuevo)
        let applicableBlock = null;
        let applicableRule = null;

        for (const rule of rulesToCheck) {
          if (!rule.days.includes(dayName)) continue;
          if (!rule.durations.includes(duration)) continue;

          // Nuevo formato: buscar en timeBlocks
          if (rule.timeBlocks && Array.isArray(rule.timeBlocks)) {
            const block = rule.timeBlocks.find(
              (b) => b.start <= previewTime && b.end >= previewTime
            );
            if (block) {
              applicableBlock = block;
              applicableRule = rule;
              break;
            }
          }
          // Formato antiguo: verificar start/end en la raíz
          else if (rule.start <= previewTime && rule.end >= previewTime) {
            applicableBlock = {
              start: rule.start,
              end: rule.end,
              price: rule.price,
              priceType: rule.priceType,
            };
            applicableRule = rule;
            break;
          }
        }

        if (applicableBlock && applicableBlock.price) {
          finalPrice = parseFloat(applicableBlock.price) * durationInHours;
          appliedRules.push({
            type: courtSpecific.length > 0 ? 'court_specific' : 'global',
            name: applicableBlock.priceType || 'Regla personalizada',
            description: `$${applicableBlock.price}/h - ${applicableBlock.start} a ${applicableBlock.end}`,
            adjustment: finalPrice - basePrice,
          });
        }

        // Aplicar ajustes adicionales por horario (simulados)
        const hour = parseInt(previewTime.split(':')[0]);
        if (hour >= 18 && !applicableRule) {
          // Tarifa nocturna
          const nightSurcharge = basePrice * 0.25;
          finalPrice += nightSurcharge;
          appliedRules.push({
            type: 'automatic',
            name: 'Tarifa Nocturna',
            description: '+25% después de 18:00',
            adjustment: nightSurcharge,
          });
        }

        // Fin de semana
        if ((date.getDay() === 0 || date.getDay() === 6) && !applicableRule) {
          const weekendSurcharge = basePrice * 0.3;
          finalPrice += weekendSurcharge;
          appliedRules.push({
            type: 'automatic',
            name: 'Fin de Semana',
            description: '+30% sábados y domingos',
            adjustment: weekendSurcharge,
          });
        }
      }

      return {
        basePrice,
        finalPrice: Math.round(finalPrice / 100) * 100, // Redondear a centenas
        appliedRules,
        breakdown: {
          basePricePerHour: basePricePerHour,
          duration: durationInHours,
          totalAdjustments: finalPrice - basePrice,
        },
      };
    } catch (error) {
      console.error('Error calculating price:', error);
      return {
        basePrice: 2000,
        finalPrice: 2000,
        appliedRules: [],
        breakdown: { basePricePerHour: 2000, duration: 1, totalAdjustments: 0 },
      };
    }
  };

  const priceCalculation = calculatePrice();

  // Validar configuración
  const validateConfiguration = () => {
    const issues = [];

    // Verificar días sin cobertura en global
    const allDays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    const coveredDays = [...new Set(globalPricing.flatMap((rule) => rule.days))];
    const uncoveredDays = allDays.filter((day) => !coveredDays.includes(day));

    if (uncoveredDays.length > 0) {
      issues.push({
        type: 'warning',
        message: `Días sin configuración global: ${uncoveredDays.join(', ')}`,
      });
    }

    // Verificar solapamientos horarios (soporta nuevo formato)
    globalPricing.forEach((rule, index) => {
      rule.days.forEach((day) => {
        // Obtener bloques de tiempo de esta regla
        const blocks1 = rule.timeBlocks || [
          { start: rule.start, end: rule.end, price: rule.price },
        ];

        globalPricing.forEach((otherRule, otherIndex) => {
          if (index !== otherIndex && otherRule.days.includes(day)) {
            // Obtener bloques de tiempo de la otra regla
            const blocks2 = otherRule.timeBlocks || [
              { start: otherRule.start, end: otherRule.end, price: otherRule.price },
            ];

            // Verificar solapamientos entre bloques
            blocks1.forEach((block1) => {
              blocks2.forEach((block2) => {
                const overlap = !(block1.end <= block2.start || block1.start >= block2.end);
                if (overlap) {
                  issues.push({
                    type: 'error',
                    message: `Solapamiento horario en ${day}: ${block1.start}-${block1.end} y ${block2.start}-${block2.end}`,
                  });
                }
              });
            });
          }
        });
      });
    });

    return issues;
  };

  const configIssues = validateConfiguration();

  return (
    <div className="space-y-6">
      {/* Simulador de precios */}
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-700">
        <div className="flex items-center gap-3 mb-6">
          <FiTrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-200">
            Simulador de Precios
          </h3>
        </div>

        {/* Controles del simulador */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <FiCalendar className="w-4 h-4 inline mr-1" />
              Fecha
            </label>
            <input
              type="date"
              className="input w-full text-sm"
              value={previewDate}
              onChange={(e) => setPreviewDate(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <FiClock className="w-4 h-4 inline mr-1" />
              Hora
            </label>
            <input
              type="time"
              className="input w-full text-sm"
              value={previewTime}
              onChange={(e) => setPreviewTime(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Cancha
            </label>
            <select
              className="input w-full text-sm"
              value={selectedCourtId}
              onChange={(e) => setSelectedCourtId(parseInt(e.target.value))}
            >
              {courts.map((court) => (
                <option key={court.id} value={court.id}>
                  {court.name} ({court.sport})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Duración
            </label>
            <select
              className="input w-full text-sm"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            >
              <option value="1h">1 hora</option>
              <option value="1.5h">1.5 horas</option>
              <option value="2h">2 horas</option>
              <option value="2.5h">2.5 horas</option>
              <option value="3h">3 horas</option>
            </select>
          </div>
        </div>

        {/* Resultado del cálculo */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
          <div className="text-center mb-4">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
              ${priceCalculation.finalPrice.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Total por {duration.replace('h', ' hora')}
              {duration !== '1h' ? 's' : ''}
            </div>
          </div>

          {/* Desglose del cálculo */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-600">
              <span className="text-gray-600 dark:text-gray-300">Precio base:</span>
              <span className="font-medium">${priceCalculation.basePrice.toLocaleString()}</span>
            </div>

            {priceCalculation.appliedRules.map((rule, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300">
                  {rule.name}:
                  <span className="text-xs text-gray-500 ml-1">({rule.description})</span>
                </span>
                <span
                  className={`font-medium ${rule.adjustment >= 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}
                >
                  {rule.adjustment >= 0 ? '+' : ''}${rule.adjustment.toLocaleString()}
                </span>
              </div>
            ))}

            {priceCalculation.appliedRules.length === 0 && (
              <div className="text-center text-gray-500 dark:text-gray-400 py-2">
                <FiInfo className="w-4 h-4 inline mr-1" />
                Sin ajustes aplicados
              </div>
            )}
          </div>
        </div>

        {/* Información adicional */}
        <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 space-y-1">
          <div>
            Precio base por hora: ${priceCalculation.breakdown.basePricePerHour.toLocaleString()}
          </div>
          <div>
            Duración: {priceCalculation.breakdown.duration} hora
            {priceCalculation.breakdown.duration !== 1 ? 's' : ''}
          </div>
          <div>
            Día de la semana:{' '}
            {new Date(previewDate).toLocaleDateString('es-ES', { weekday: 'long' })}
          </div>
        </div>
      </Card>

      {/* Validación de configuración */}
      {configIssues.length > 0 && (
        <Card className="p-4 border border-yellow-200 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/20">
          <div className="flex items-start gap-3">
            <FiAlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-yellow-900 dark:text-yellow-200 mb-2">
                Problemas de Configuración Detectados
              </h4>
              <ul className="space-y-1">
                {configIssues.map((issue, index) => (
                  <li
                    key={index}
                    className={`text-sm flex items-start gap-2 ${
                      issue.type === 'error'
                        ? 'text-red-700 dark:text-red-300'
                        : 'text-yellow-700 dark:text-yellow-300'
                    }`}
                  >
                    <span className="font-mono text-xs mt-0.5">
                      {issue.type === 'error' ? '❌' : '⚠️'}
                    </span>
                    {issue.message}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
            {globalPricing.length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300">Reglas Globales</div>
        </Card>

        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
            {Object.keys(courtSpecificPricing).length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300">Canchas Específicas</div>
        </Card>

        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
            {specialDatesPricing.length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300">Fechas Especiales</div>
        </Card>
      </div>

      {/* Ejemplos comunes */}
      <Card className="p-4">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <FiCheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
          Ejemplos de Precios Comunes
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="font-medium text-gray-700 dark:text-gray-300">Horarios Populares:</div>
            {['09:00', '14:00', '19:00', '21:00'].map((time) => {
              const selectedCourt = courts.find((c) => c.id === selectedCourtId);
              const testPrice = (() => {
                const basePricePerHour = basePrices[selectedCourt?.sport] || 2000;
                const hour = parseInt(time.split(':')[0]);
                let price = basePricePerHour;

                if (hour >= 18) price *= 1.25; // Nocturno
                const date = new Date(previewDate);
                if (date.getDay() === 0 || date.getDay() === 6) price *= 1.3; // Fin de semana

                return Math.round(price / 100) * 100;
              })();

              return (
                <div key={time} className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">{time}:</span>
                  <span className="font-medium">${testPrice.toLocaleString()}/h</span>
                </div>
              );
            })}
          </div>

          <div className="space-y-2">
            <div className="font-medium text-gray-700 dark:text-gray-300">Por Duración:</div>
            {['1h', '1.5h', '2h'].map((dur) => {
              const selectedCourt = courts.find((c) => c.id === selectedCourtId);
              const basePricePerHour = basePrices[selectedCourt?.sport] || 2000;
              const durationHours = parseFloat(dur.replace('h', ''));
              const totalPrice = Math.round((basePricePerHour * durationHours) / 100) * 100;

              return (
                <div key={dur} className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">{dur}:</span>
                  <span className="font-medium">${totalPrice.toLocaleString()}</span>
                </div>
              );
            })}
          </div>
        </div>
      </Card>
    </div>
  );
}
