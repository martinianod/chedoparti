import { useState } from 'react';

export default function Tabs({ tabs, children }) {
  const [active, setActive] = useState(0);
  return (
    <div>
      <div className="flex gap-2 mb-6 border-b border-gold dark:border-gold">
        {tabs.map((tab, idx) => (
          <button
            key={tab.label}
            className={`flex items-center gap-2 px-4 py-2 font-medium rounded-t transition-colors duration-200
              ${active === idx ? 'bg-gold/20 dark:bg-gold/30 text-navy dark:text-gold border-b-2 border-gold dark:border-gold' : 'text-navy/70 dark:text-gold/70 hover:bg-gold/10 dark:hover:bg-gold/20'}`}
            onClick={() => setActive(idx)}
            type="button"
          >
            {tab.icon && <span className="text-lg">{tab.icon}</span>}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
      <div>{children[active]}</div>
    </div>
  );
}
