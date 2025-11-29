import React from 'react';
import { ChevronRight, ChevronLeft, Plus, Check } from 'lucide-react';
import { ViewState, Person, ActivityLog } from '../types';

interface DashboardProps {
  setView: (view: ViewState) => void;
  people: Person[];
}

const Dashboard: React.FC<DashboardProps> = ({ setView, people }) => {
  
  const stats = [
    { label: 'Ideas', count: 14, color: 'bg-[#DDBEA9] text-[#7c5e47]' }, // Mustard-ish
    { label: 'To Buy', count: 6, color: 'bg-[#E07A5F] text-white' }, // Terra
    { label: 'Purchased', count: 5, color: 'bg-[#81B29A] text-white' }, // Sage
  ];

  const recentActivity: ActivityLog[] = [
    { id: '1', actor: 'Jaden', actorAvatar: 'https://picsum.photos/seed/jaden/100', action: 'marked', target: '"Wireless Headphones"', status: 'Purchased' },
    { id: '2', actor: 'Jaden', actorAvatar: 'https://picsum.photos/seed/jaden/100', action: 'marked', target: '"Wireless Bracoine"', status: 'Purchased' },
    { id: '3', actor: 'Jaden', actorAvatar: 'https://picsum.photos/seed/jaden/100', action: 'marked', target: '"Collab Headphones"', status: 'Purchased' },
  ];

  const ideaInbox = [
    { id: '1', name: 'Buauna Contates Headphones', img: 'https://picsum.photos/seed/headphone/100' },
    { id: '2', name: 'Shopping Lifetest Gift Ideas', img: 'https://picsum.photos/seed/gift/100' },
    { id: '3', name: 'Burging Gift Audio', img: 'https://picsum.photos/seed/audio/100' },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-[#3D405B] tracking-tight">
            Christmas <span className="text-salmon">2026</span>
          </h1>
        </div>
        
        {/* People Scroller - Simplified for demo */}
        <div className="flex items-center gap-4 bg-white/40 p-2 rounded-full pl-6 backdrop-blur-sm">
          <span className="text-sm font-bold text-gray-600 mr-2">People Needing Gifts</span>
          <button className="p-1 hover:bg-white rounded-full transition-colors text-gray-400"><ChevronLeft size={20}/></button>
          <div className="flex -space-x-2">
            {people.map((p) => (
              <div key={p.id} className="flex flex-col items-center group cursor-pointer relative">
                <div className={`p-[3px] rounded-full bg-white shadow-sm z-10 transition-transform group-hover:-translate-y-1`}>
                    <div className={`w-12 h-12 rounded-full p-[2px]`} style={{backgroundColor: p.colorRing}}>
                         <img src={p.avatar} alt={p.name} className="w-full h-full rounded-full object-cover border-2 border-white" />
                    </div>
                </div>
              </div>
            ))}
          </div>
          <button className="p-1 hover:bg-white rounded-full transition-colors text-gray-400"><ChevronRight size={20}/></button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Stats & Actions */}
        <div className="lg:col-span-5 flex flex-col gap-8">
          {/* Stats Row */}
          <div className="flex gap-4">
            {stats.map((stat) => (
              <div key={stat.label} className={`flex-1 ${stat.color} rounded-[2rem] p-6 flex flex-col items-center justify-center shadow-sm`}>
                <span className="text-sm opacity-80 font-semibold mb-1">{stat.label}:</span>
                <span className="text-4xl font-bold">{stat.count}</span>
              </div>
            ))}
          </div>

          {/* Big CTA */}
          <button 
            onClick={() => setView(ViewState.SINGLE_LIST)}
            className="w-full py-5 bg-salmon hover:bg-[#d66f56] text-white rounded-full text-xl font-bold shadow-xl shadow-salmon/20 transition-all transform hover:scale-[1.01] active:scale-[0.99]"
          >
            View Occasion
          </button>

          {/* Idea Inbox */}
          <div className="bg-white/60 backdrop-blur-md rounded-[2.5rem] p-6 shadow-sm flex-1">
             <h3 className="text-xl font-bold text-gray-700 mb-6 ml-2">Idea Inbox</h3>
             <div className="space-y-4">
                {ideaInbox.map((item) => (
                  <div key={item.id} className="flex items-center justify-between group p-2 hover:bg-white rounded-2xl transition-colors">
                    <div className="flex items-center gap-4">
                      <img src={item.img} alt="" className="w-12 h-12 rounded-xl object-cover" />
                      <span className="text-gray-700 font-semibold text-sm max-w-[140px] truncate">{item.name}</span>
                    </div>
                    <button className="px-4 py-2 bg-[#EFEFEF] text-gray-600 text-sm font-bold rounded-full hover:bg-gray-200 transition-colors">
                      Add to List
                    </button>
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* Right Column: Recent Activity */}
        <div className="lg:col-span-7">
          <div className="bg-white/60 backdrop-blur-md rounded-[2.5rem] p-8 h-full shadow-sm relative overflow-hidden">
             <h3 className="text-xl font-bold text-gray-700 mb-8">Recent Activity</h3>
             <div className="space-y-6 relative z-10">
                {recentActivity.map((log) => (
                  <div key={log.id} className="flex items-start gap-4">
                     <img src={log.actorAvatar} alt={log.actor} className="w-10 h-10 rounded-full border-2 border-white shadow-sm" />
                     <div className="pt-1">
                        <p className="text-gray-700 leading-relaxed">
                          <span className="font-bold">{log.actor}</span> {log.action} <span className="font-semibold text-gray-800">{log.target}</span> as {log.status}.
                        </p>
                     </div>
                  </div>
                ))}
                
                {/* Scrollbar Indicator mockup */}
                <div className="absolute right-6 top-20 bottom-20 w-1.5 bg-gray-200 rounded-full">
                   <div className="w-full h-1/3 bg-gray-400 rounded-full mt-4"></div>
                </div>
             </div>
             
             {/* Decorative Background Blur */}
             <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-sage/20 rounded-full blur-3xl pointer-events-none"></div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;