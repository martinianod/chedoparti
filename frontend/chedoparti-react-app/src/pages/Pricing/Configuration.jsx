import { useState } from 'react';
import { FiDollarSign, FiUser, FiCreditCard, FiPercent } from 'react-icons/fi';
import CourtPricing from '../../components/pricing/CourtPricing';
import CoachPricing from '../../components/pricing/CoachPricing';
import PaymentMethods from '../../components/pricing/PaymentMethods';
import DiscountsPromotions from '../../components/pricing/DiscountsPromotions';

export default function PricingConfiguration() {
  const [activeTab, setActiveTab] = useState('courts');

  const tabs = [
    {
      id: 'courts',
      label: 'Canchas',
      icon: <FiDollarSign className="w-5 h-5" />,
      component: <CourtPricing />,
    },
    {
      id: 'coaches',
      label: 'Entrenadores',
      icon: <FiUser className="w-5 h-5" />,
      component: <CoachPricing />,
    },
    {
      id: 'payments',
      label: 'Medios de Pago',
      icon: <FiCreditCard className="w-5 h-5" />,
      component: <PaymentMethods />,
    },
    {
      id: 'discounts',
      label: 'Descuentos',
      icon: <FiPercent className="w-5 h-5" />,
      component: <DiscountsPromotions />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <FiDollarSign className="text-navy dark:text-gold" />
            Configuración de Precios
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gestione todos los precios, métodos de pago y promociones del club.
          </p>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex overflow-x-auto" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 whitespace-nowrap transition-colors
                  ${
                    activeTab === tab.id
                      ? 'border-navy text-navy dark:border-gold dark:text-gold'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }
                `}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {tabs.find((tab) => tab.id === activeTab)?.component}
        </div>
      </div>
    </div>
  );
}
