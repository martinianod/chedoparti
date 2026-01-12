import React from 'react';
import { motion } from 'framer-motion';
import ViewToggle from './ViewToggle';
import { getTimeOfDayGreeting } from '../../utils/dateFormatters';

/**
 * Dashboard Header Component
 * Displays welcome message, user info, and view toggle
 */
export default function DashboardHeader({ user }) {
  const greeting = getTimeOfDayGreeting();

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Welcome Section */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-navy dark:text-gold mb-1">
            {greeting}, {user?.name || 'Socio'}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {user?.membershipNumber 
              ? `Socio #${user.membershipNumber}` 
              : 'Panel de Socio'}
          </p>
        </div>

        {/* View Toggle */}
        <ViewToggle />
      </div>
    </motion.header>
  );
}
