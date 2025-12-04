import React from 'react';
import { Home, Heart, Users, List, Settings, Gift } from 'lucide-react';
import { ViewState } from '../types';

interface SidebarProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView }) => {
  const navItems = [
    { id: ViewState.DASHBOARD, icon: Home, label: 'Home' },
    { id: 'LIKED', icon: Heart, label: 'Liked' }, // Placeholder view
    { id: 'PEOPLE', icon: Users, label: 'People' }, // Placeholder view
    { id: ViewState.ALL_LISTS, icon: List, label: 'Lists' },
    { id: 'SETTINGS', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="w-20 lg:w-24 flex-shrink-0 flex flex-col items-center py-8 h-screen fixed left-0 top-0 z-50 bg-white/40 backdrop-blur-xl border-r border-white/50">
      {/* Brand Icon */}
      <div className="mb-12 p-3 bg-gradient-to-br from-orange-300 to-yellow-300 rounded-2xl shadow-lg shadow-orange-100 cursor-pointer" onClick={() => setView(ViewState.DASHBOARD)}>
        <Gift className="text-white w-6 h-6" />
      </div>

      {/* Navigation */}
      <div className="flex flex-col gap-8 w-full items-center">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.label}
              onClick={() => {
                if (item.id === ViewState.DASHBOARD || item.id === ViewState.ALL_LISTS) {
                  setView(item.id as ViewState);
                }
              }}
              className={`p-3 rounded-2xl transition-all duration-300 group relative ${
                isActive 
                  ? 'bg-salmon text-white shadow-lg shadow-salmon/30' 
                  : 'text-gray-400 hover:bg-white/50 hover:text-salmon'
              }`}
            >
              <item.icon className={`w-6 h-6 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
              
              {/* Tooltipish thing for active state or hover */}
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-salmon rounded-r-full -ml-4 lg:-ml-6" />
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-auto">
        <button className="p-3 text-gray-400 hover:text-gray-600 transition-colors">
          <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden ring-2 ring-white">
             <img src="https://picsum.photos/100/100" alt="Profile" className="w-full h-full object-cover" />
          </div>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;