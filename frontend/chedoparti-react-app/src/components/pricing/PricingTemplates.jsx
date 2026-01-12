import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FiSettings, FiSun, FiMoon, FiCalendar, FiStar, FiCheck, FiInfo } from 'react-icons/fi';
import Card from '../ui/Card';

export default function PricingTemplates({ onApplyTemplate }) {
  const { t } = useTranslation();
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const templates = [
    {
      id: 'basic',
      name: 'Configuración Básica',
      description: 'Precio único para todos los días y horarios',
      icon: <FiSettings className="w-8 h-8" />,
      color: 'blue',
      features: [
        'Un solo precio para toda la semana',
        'Sin variaciones horarias',
        'Ideal para clubes pequeños',
        'Configuración simple y rápida',
      ],
      preview: {
        weekdays: '$2,000/hora',
        weekends: '$2,000/hora',
        nightTime: '$2,000/hora',
        specialDates: 'No configuradas',
      },
      config: {
        global: [
          {
            id: 1,
            dayOfWeek: 'all',
            startTime: '08:00',
            endTime: '23:00',
            price: 2000,
            isActive: true,
          },
        ],
        special: [],
        courts: {},
      },
    },
    {
      id: 'day-night',
      name: 'Día y Noche',
      description: 'Precios diferenciados para día y noche',
      icon: <FiSun className="w-8 h-8" />,
      color: 'orange',
      features: [
        'Precios de día (8:00-18:00)',
        'Precios de noche (18:00-23:00)',
        'Mismo precio toda la semana',
        'Ideal para iluminación artificial',
      ],
      preview: {
        weekdays: '$2,000/hora (día), $2,500/hora (noche)',
        weekends: '$2,000/hora (día), $2,500/hora (noche)',
        nightTime: '$2,500/hora',
        specialDates: 'No configuradas',
      },
      config: {
        global: [
          {
            id: 1,
            dayOfWeek: 'all',
            startTime: '08:00',
            endTime: '18:00',
            price: 2000,
            isActive: true,
          },
          {
            id: 2,
            dayOfWeek: 'all',
            startTime: '18:00',
            endTime: '23:00',
            price: 2500,
            isActive: true,
          },
        ],
        special: [],
        courts: {},
      },
    },
    {
      id: 'weekend-premium',
      name: 'Premium Fin de Semana',
      description: 'Precios especiales para sábados y domingos',
      icon: <FiCalendar className="w-8 h-8" />,
      color: 'green',
      features: [
        'Precios estándar lunes a viernes',
        'Precios premium sábados y domingos',
        'Diferenciación día/noche',
        'Maximiza ingresos en peak',
      ],
      preview: {
        weekdays: '$2,000/hora (día), $2,500/hora (noche)',
        weekends: '$3,000/hora (día), $3,500/hora (noche)',
        nightTime: 'Recargo nocturno incluido',
        specialDates: 'No configuradas',
      },
      config: {
        global: [
          // Lunes a Viernes - Día
          {
            id: 1,
            dayOfWeek: 'weekdays',
            startTime: '08:00',
            endTime: '18:00',
            price: 2000,
            isActive: true,
          },
          // Lunes a Viernes - Noche
          {
            id: 2,
            dayOfWeek: 'weekdays',
            startTime: '18:00',
            endTime: '23:00',
            price: 2500,
            isActive: true,
          },
          // Sábado y Domingo - Día
          {
            id: 3,
            dayOfWeek: 'weekends',
            startTime: '08:00',
            endTime: '18:00',
            price: 3000,
            isActive: true,
          },
          // Sábado y Domingo - Noche
          {
            id: 4,
            dayOfWeek: 'weekends',
            startTime: '18:00',
            endTime: '23:00',
            price: 3500,
            isActive: true,
          },
        ],
        special: [],
        courts: {},
      },
    },
    {
      id: 'complete',
      name: 'Configuración Completa',
      description: 'Sistema completo con todos los rangos horarios y fechas especiales',
      icon: <FiStar className="w-8 h-8" />,
      color: 'purple',
      features: [
        'Múltiples rangos horarios por día',
        'Diferenciación completa por días',
        'Fechas especiales preconfiguradas',
        'Máxima flexibilidad de precios',
      ],
      preview: {
        weekdays: 'Mañana: $1,800 | Tarde: $2,200 | Noche: $2,600',
        weekends: 'Mañana: $2,500 | Tarde: $3,200 | Noche: $3,800',
        nightTime: 'Recargos variables según día',
        specialDates: 'Navidad, Año Nuevo, etc.',
      },
      config: {
        global: [
          // Lunes a Viernes - Mañana
          {
            id: 1,
            dayOfWeek: 'weekdays',
            startTime: '08:00',
            endTime: '12:00',
            price: 1800,
            isActive: true,
          },
          // Lunes a Viernes - Tarde
          {
            id: 2,
            dayOfWeek: 'weekdays',
            startTime: '12:00',
            endTime: '18:00',
            price: 2200,
            isActive: true,
          },
          // Lunes a Viernes - Noche
          {
            id: 3,
            dayOfWeek: 'weekdays',
            startTime: '18:00',
            endTime: '23:00',
            price: 2600,
            isActive: true,
          },
          // Sábados - Mañana
          {
            id: 4,
            dayOfWeek: 'saturday',
            startTime: '08:00',
            endTime: '12:00',
            price: 2500,
            isActive: true,
          },
          // Sábados - Tarde
          {
            id: 5,
            dayOfWeek: 'saturday',
            startTime: '12:00',
            endTime: '18:00',
            price: 3200,
            isActive: true,
          },
          // Sábados - Noche
          {
            id: 6,
            dayOfWeek: 'saturday',
            startTime: '18:00',
            endTime: '23:00',
            price: 3800,
            isActive: true,
          },
          // Domingos - Mañana
          {
            id: 7,
            dayOfWeek: 'sunday',
            startTime: '08:00',
            endTime: '12:00',
            price: 2500,
            isActive: true,
          },
          // Domingos - Tarde
          {
            id: 8,
            dayOfWeek: 'sunday',
            startTime: '12:00',
            endTime: '18:00',
            price: 3200,
            isActive: true,
          },
          // Domingos - Noche
          {
            id: 9,
            dayOfWeek: 'sunday',
            startTime: '18:00',
            endTime: '23:00',
            price: 3800,
            isActive: true,
          },
        ],
        special: [
          {
            id: 1,
            name: 'Navidad',
            date: '2024-12-25',
            pricingStrategy: 'multiplier',
            multiplier: 2.0,
            startTime: '08:00',
            endTime: '23:00',
            appliesToAllCourts: true,
            courtIds: [],
            isActive: true,
          },
          {
            id: 2,
            name: 'Año Nuevo',
            date: '2025-01-01',
            pricingStrategy: 'multiplier',
            multiplier: 1.8,
            startTime: '08:00',
            endTime: '23:00',
            appliesToAllCourts: true,
            courtIds: [],
            isActive: true,
          },
          {
            id: 3,
            name: 'Día de la Independencia',
            date: '2024-07-09',
            pricingStrategy: 'multiplier',
            multiplier: 1.5,
            startTime: '08:00',
            endTime: '23:00',
            appliesToAllCourts: true,
            courtIds: [],
            isActive: true,
          },
        ],
        courts: {},
      },
    },
  ];

  const getColorClasses = (color, isSelected = false) => {
    const colorMap = {
      blue: {
        card: isSelected
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
          : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600',
        icon: 'text-blue-600 dark:text-blue-400',
        button: 'btn-primary',
        badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      },
      orange: {
        card: isSelected
          ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
          : 'border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-600',
        icon: 'text-orange-600 dark:text-orange-400',
        button: 'bg-orange-600 hover:bg-orange-700 text-white',
        badge: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      },
      green: {
        card: isSelected
          ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
          : 'border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600',
        icon: 'text-green-600 dark:text-green-400',
        button: 'bg-green-600 hover:bg-green-700 text-white',
        badge: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      },
      purple: {
        card: isSelected
          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
          : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600',
        icon: 'text-purple-600 dark:text-purple-400',
        button: 'bg-purple-600 hover:bg-purple-700 text-white',
        badge: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      },
    };
    return colorMap[color] || colorMap.blue;
  };

  const handleSelectTemplate = (template) => {
    setSelectedTemplate(selectedTemplate?.id === template.id ? null : template);
  };

  const handleApplyTemplate = (template) => {
    if (onApplyTemplate && template.config) {
      onApplyTemplate(template.id, template.config);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Plantillas de Configuración
        </h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm">
          Seleccione una plantilla predefinida para configurar los precios rápidamente. Puede
          personalizar los valores después de aplicar la plantilla.
        </p>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {templates.map((template) => {
          const colors = getColorClasses(template.color, selectedTemplate?.id === template.id);
          const isSelected = selectedTemplate?.id === template.id;

          return (
            <div key={template.id} className="space-y-3">
              {/* Template Card */}
              <Card
                className={`p-4 cursor-pointer border-2 transition-all duration-200 ${colors.card}`}
                onClick={() => handleSelectTemplate(template)}
              >
                <div className="flex items-start gap-3">
                  <div className={`${colors.icon} mt-1`}>{template.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {template.name}
                      </h4>
                      {isSelected && (
                        <FiCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                      {template.description}
                    </p>

                    {/* Features */}
                    <div className="space-y-1">
                      {template.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Apply Button */}
                <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleApplyTemplate(template);
                    }}
                    className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${colors.button}`}
                  >
                    Aplicar Plantilla
                  </button>
                </div>
              </Card>

              {/* Detailed Preview */}
              {isSelected && (
                <Card className="p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-3">
                    <FiInfo className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <h5 className="font-medium text-gray-900 dark:text-white">
                      Vista Previa de Precios
                    </h5>
                  </div>

                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          Lunes - Viernes:
                        </span>
                        <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">
                          {template.preview.weekdays}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          Fin de Semana:
                        </span>
                        <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">
                          {template.preview.weekends}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          Horario Nocturno:
                        </span>
                        <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">
                          {template.preview.nightTime}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          Fechas Especiales:
                        </span>
                        <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">
                          {template.preview.specialDates}
                        </p>
                      </div>
                    </div>

                    {/* Configuration Details */}
                    <div className="pt-3 border-t border-gray-200 dark:border-gray-600">
                      <div className="flex flex-wrap gap-2">
                        <span className={`text-xs px-2 py-1 rounded ${colors.badge}`}>
                          {template.config.global.length} reglas globales
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${colors.badge}`}>
                          {template.config.special.length} fechas especiales
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${colors.badge}`}>
                          {Object.keys(template.config.courts).length} configuraciones específicas
                        </span>
                      </div>
                    </div>

                    {/* Warning */}
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <FiInfo className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                        <div className="text-xs text-yellow-700 dark:text-yellow-300">
                          <strong>Nota:</strong> Al aplicar esta plantilla se sobrescribirá la
                          configuración actual. Los precios mostrados son ejemplos y pueden
                          personalizarse después.
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          );
        })}
      </div>

      {/* No Template Selected State */}
      {!selectedTemplate && (
        <Card className="p-8 text-center border-2 border-dashed border-gray-300 dark:border-gray-600">
          <FiSettings className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500 mb-3" />
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">
            Seleccione una Plantilla
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Haga clic en cualquier plantilla para ver más detalles y aplicar la configuración
          </p>
        </Card>
      )}
    </div>
  );
}
