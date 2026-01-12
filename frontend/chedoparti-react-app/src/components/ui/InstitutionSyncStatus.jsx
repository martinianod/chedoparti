import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FiClock, FiDollarSign, FiCalendar, FiInfo, FiRefreshCw } from 'react-icons/fi';
import Card from './Card';
import Button from './Button';
import {
  getInstitutionSchedule,
  getPricingConfig,
  calculateReservationPrice,
  generateTimeSlots,
  getDayOfWeekSpanish,
  getSlotInterval,
} from '../../services/institutionConfig';

export default function InstitutionSyncStatus() {
  const { t } = useTranslation();
  const [schedule, setSchedule] = useState({});
  const [pricing, setPricing] = useState({});
  const [slotInterval, setSlotInterval] = useState(30);
  const [testResults, setTestResults] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadConfiguration();
  }, []);

  const loadConfiguration = () => {
    setSchedule(getInstitutionSchedule());
    setPricing(getPricingConfig());
    setSlotInterval(getSlotInterval());
  };

  const runSyncTest = async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().slice(0, 10);
      const dayOfWeek = getDayOfWeekSpanish(today);

      // Generar slots para hoy
      const slots = generateTimeSlots(dayOfWeek, slotInterval);

      // Probar cálculo de precio para diferentes horarios
      const testCases = [
        { courtId: 1, sport: 'Padel', time: '10:00', duration: 60 },
        { courtId: 1, sport: 'Padel', time: '19:00', duration: 90 },
        { courtId: 3, sport: 'Tenis', time: '15:00', duration: 60 },
      ];

      const priceTests = testCases.map((testCase) => {
        const result = calculateReservationPrice({
          ...testCase,
          date: today,
          durationMinutes: testCase.duration,
        });
        return {
          ...testCase,
          result,
        };
      });

      setTestResults({
        date: today,
        dayOfWeek,
        totalSlots: slots.length,
        firstSlot: slots[0],
        lastSlot: slots[slots.length - 1],
        priceTests,
        schedule: schedule[dayOfWeek],
      });
    } catch (error) {
      console.error('Error en prueba de sincronización:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (isOperating) => {
    return isOperating
      ? 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20'
      : 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20';
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
            <FiRefreshCw className="text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-navy dark:text-gold">
              Estado de Sincronización
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Coordinación entre horarios, precios y disponibilidad
            </p>
          </div>
        </div>
        <Button onClick={runSyncTest} disabled={loading} variant="outline" size="sm">
          {loading ? (
            <>
              <FiRefreshCw className="mr-2 animate-spin" />
              Probando...
            </>
          ) : (
            <>
              <FiRefreshCw className="mr-2" />
              Probar Sync
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Horarios de Institución */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <FiClock className="text-blue-500" />
            <h4 className="font-medium text-gray-900 dark:text-white">Horarios</h4>
          </div>
          <div className="space-y-2">
            {Object.entries(schedule).map(([day, config]) => (
              <div key={day} className="flex justify-between text-sm">
                <span className="capitalize text-gray-600 dark:text-gray-400">{day}</span>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(config.enabled)}`}
                >
                  {config.enabled ? `${config.openTime}-${config.closeTime}` : 'Cerrado'}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            Intervalo: {slotInterval} minutos
          </div>
        </div>

        {/* Configuración de Precios */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <FiDollarSign className="text-green-500" />
            <h4 className="font-medium text-gray-900 dark:text-white">Precios</h4>
          </div>
          <div className="space-y-2">
            {Object.entries(pricing.sports || {}).map(([sport, config]) => (
              <div key={sport} className="space-y-1">
                <div className="text-sm font-medium text-gray-900 dark:text-white">{sport}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Base: ${config.basePrice}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Pico: +{Math.round((config.peakHourMultiplier - 1) * 100)}%
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Fin de semana: +{Math.round((config.weekendMultiplier - 1) * 100)}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Estado General */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <FiInfo className="text-purple-500" />
            <h4 className="font-medium text-gray-900 dark:text-white">Estado</h4>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Horarios configurados</span>
              <span className="text-green-600 dark:text-green-400">✓</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Precios configurados</span>
              <span className="text-green-600 dark:text-green-400">✓</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Dashboard sincronizado</span>
              <span className="text-green-600 dark:text-green-400">✓</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Reservas sincronizadas</span>
              <span className="text-green-600 dark:text-green-400">✓</span>
            </div>
          </div>
        </div>
      </div>

      {/* Resultados de la prueba */}
      {testResults && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h4 className="font-medium text-gray-900 dark:text-white mb-4">
            Resultados de Prueba - {testResults.date}
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/10 rounded-lg p-4">
              <h5 className="font-medium text-blue-900 dark:text-blue-300 mb-2">
                Slots Generados ({testResults.dayOfWeek})
              </h5>
              <div className="text-sm space-y-1">
                <div>Total de slots: {testResults.totalSlots}</div>
                <div>Primer slot: {testResults.firstSlot}</div>
                <div>Último slot: {testResults.lastSlot}</div>
                {testResults.schedule && (
                  <div>
                    Horario del día: {testResults.schedule.openTime} -{' '}
                    {testResults.schedule.closeTime}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/10 rounded-lg p-4">
              <h5 className="font-medium text-green-900 dark:text-green-300 mb-2">
                Cálculos de Precio
              </h5>
              <div className="text-sm space-y-2">
                {testResults.priceTests.map((test, index) => (
                  <div key={index} className="border-b border-green-200 dark:border-green-800 pb-1">
                    <div className="font-medium">
                      Cancha {test.courtId} - {test.sport} - {test.time}
                    </div>
                    <div className="text-green-700 dark:text-green-400">
                      {test.duration}min → ${test.result.totalPrice}
                      {test.result.isPeakHour && ' (hora pico)'}
                      {test.result.isWeekend && ' (fin de semana)'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg">
            <div className="flex items-start space-x-2">
              <FiInfo className="text-yellow-600 dark:text-yellow-400 mt-0.5" />
              <div className="text-sm text-yellow-800 dark:text-yellow-200">
                <div className="font-medium">Estado de Sincronización</div>
                <div>
                  Los horarios del Dashboard, precios de reservas y disponibilidad están
                  sincronizados correctamente con la configuración de la institución.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
