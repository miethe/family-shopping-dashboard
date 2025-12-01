import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();

  const navItems = [
    { icon: 'home', path: '/', label: 'Dashboard' },
    { icon: 'list_alt', path: '/lists', label: 'Lists' },
    { icon: 'groups', path: '/recipients', label: 'Recipients' },
    { icon: 'calendar_month', path: '/occasions', label: 'Occasions' }, // Placeholder path
    { icon: 'card_giftcard', path: '/gifts', label: 'Gifts' },
    { icon: 'bar_chart', path: '/stats', label: 'Stats' }, // Placeholder path
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-20 md:w-24 flex flex-col items-center py-6 bg-white/60 dark:bg-black/20 backdrop-blur-md border-r border-slate-200 dark:border-slate-800 z-40 transition-all duration-300">
      <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl text-yellow-600 dark:text-yellow-400 mb-8 shadow-sm">
        <span className="material-symbols-outlined">card_giftcard</span>
      </div>

      <nav className="flex flex-col items-center space-y-6 w-full px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `p-3 rounded-xl transition-all duration-200 group relative flex items-center justify-center ${
                isActive
                  ? 'bg-primary text-white shadow-lg shadow-primary/30'
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10 dark:text-slate-400'
              }`
            }
          >
            <span className={`material-symbols-outlined ${item.path === '/' ? '' : ''}`}>
              {item.icon}
            </span>
            {/* Tooltip */}
            <span className="absolute left-14 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
              {item.label}
            </span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto flex flex-col items-center space-y-6">
        <div className="w-10 h-10 rounded-full bg-pink-200 flex items-center justify-center text-pink-700 font-bold text-sm cursor-pointer hover:ring-2 ring-primary transition-all">
            M
        </div>
        <button onClick={() => navigate('/gifts?action=create')} className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center shadow-lg hover:bg-primary-dark hover:scale-105 transition-all duration-200">
          <span className="material-symbols-outlined text-2xl">add</span>
        </button>
      </div>
    </aside>
  );
};
