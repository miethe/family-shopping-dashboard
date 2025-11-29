import React from 'react';
import { Gift, Lock, Star, Lightbulb, Filter, ArrowUpDown, Plus } from 'lucide-react';
import { ViewState } from '../types';

interface AllListsProps {
  setView: (view: ViewState) => void;
}

const AllLists: React.FC<AllListsProps> = ({ setView }) => {
  const lists = [
    { id: 1, title: "Peyton's Christmas Ideas", items: 8, type: 'Idea', status: 'Mustard', owner: 'Nick', ownerImg: 'https://picsum.photos/seed/nick/100', icon: Gift, color: 'bg-[#F2E8CF] text-[#BC8A5F]', statusColor: 'bg-[#C8A166] text-white', iconBg: 'bg-[#F5DEB3]' },
    { id: 2, title: "Parker's Wishlist", items: 12, type: 'Wishlist', status: 'Status', owner: 'Jaden', ownerImg: 'https://picsum.photos/seed/jaden/100', icon: Star, color: 'bg-[#E1E5F2] text-[#4A5D8A]', statusColor: 'bg-[#8DA9C4] text-white', iconBg: 'bg-[#BFD7EA]' },
    { id: 3, title: "Jaden's Surprise Gifts", items: 5, type: 'Hidden', status: 'Hidden', owner: 'Nick', ownerImg: 'https://picsum.photos/seed/nick/100', icon: Lock, color: 'bg-[#F4E3E1] text-[#A65D57]', statusColor: 'bg-[#C07E75] text-white', iconBg: 'bg-[#E6B8B3]' },
  ];

  const generalLists = [
    { id: 4, title: "General Idea Inbox", items: 15, type: 'Neutral', status: 'Neutral', icon: Lightbulb, color: 'bg-[#F0F0F0] text-[#555]', statusColor: 'bg-[#999] text-white', iconBg: 'bg-[#DDD]' },
    { id: 5, title: "Household Needs", items: 7, type: 'Sotus', status: 'Sotus', owner: 'Jaden', ownerImg: 'https://picsum.photos/seed/jaden/100', icon: HomeIcon, color: 'bg-[#E8F1E9] text-[#4A7C59]', statusColor: 'bg-[#84A98C] text-white', iconBg: 'bg-[#CDE3D0]' },
  ];

  function HomeIcon(props: any) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    )
  }

  return (
    <div className="p-8 max-w-7xl mx-auto h-full overflow-y-auto pb-20">
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-[#3D405B] mb-2">All Lists</h1>
          <p className="text-gray-500 font-medium">24 lists · 4 active occasions</p>
        </div>
        <div className="flex gap-3">
           <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-full text-gray-600 font-bold shadow-sm hover:shadow-md transition-all border border-transparent hover:border-gray-100">
             <Filter size={18} /> Filter
           </button>
           <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-full text-gray-600 font-bold shadow-sm hover:shadow-md transition-all border border-transparent hover:border-gray-100">
             <ArrowUpDown size={18} /> Sort
           </button>
           <button className="flex items-center gap-2 px-5 py-2 bg-salmon text-white rounded-full font-bold shadow-lg shadow-salmon/30 hover:bg-[#d66f56] transition-all">
             <Plus size={18} /> Create List
           </button>
        </div>
      </div>

      <div className="space-y-8">
        {/* Christmas 2026 Section */}
        <section className="bg-white/50 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-sm">
           <h2 className="text-2xl font-bold text-[#3D405B] mb-6 ml-2">Christmas 2026</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lists.map((list) => (
                <div 
                  key={list.id} 
                  onClick={() => setView(ViewState.SINGLE_LIST)}
                  className="bg-white rounded-[2rem] p-6 shadow-sm hover:shadow-lg transition-all cursor-pointer border border-transparent hover:border-salmon/20 group"
                >
                    <div className="flex justify-between items-start mb-4">
                       <div className={`w-12 h-12 rounded-full flex items-center justify-center ${list.iconBg} ${list.color.split(' ')[1]}`}>
                          <list.icon size={24} />
                       </div>
                       {list.owner && (
                         <div className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-full">
                            <img src={list.ownerImg} alt={list.owner} className="w-6 h-6 rounded-full" />
                            <span className="text-sm font-bold text-gray-600">{list.owner}</span>
                         </div>
                       )}
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-1 group-hover:text-salmon transition-colors">{list.title}</h3>
                    <p className="text-gray-500 text-sm font-medium mb-6">{list.items} items · {list.type}</p>
                    
                    <div className="flex justify-between items-center">
                       <span className="text-gray-400 font-bold text-sm">Status</span>
                       <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${list.statusColor}`}>
                          {list.status}
                       </span>
                    </div>
                </div>
              ))}
           </div>
        </section>

        {/* General & Other Section */}
        <section className="bg-white/50 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-sm">
           <h2 className="text-2xl font-bold text-[#3D405B] mb-6 ml-2">General & Other</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {generalLists.map((list) => (
                <div key={list.id} className="bg-white rounded-[2rem] p-6 shadow-sm hover:shadow-lg transition-all cursor-pointer">
                    <div className="flex justify-between items-start mb-4">
                       <div className={`w-12 h-12 rounded-full flex items-center justify-center ${list.iconBg} text-gray-600`}>
                          <list.icon size={24} />
                       </div>
                       {list.owner && (
                         <div className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-full">
                            <img src={list.ownerImg} alt={list.owner} className="w-6 h-6 rounded-full" />
                            <span className="text-sm font-bold text-gray-600">{list.owner}</span>
                         </div>
                       )}
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-1">{list.title}</h3>
                    <p className="text-gray-500 text-sm font-medium mb-6">{list.items} items</p>
                    
                    <div className="flex justify-between items-center">
                       <span className="text-gray-400 font-bold text-sm"></span>
                       <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase ${list.statusColor}`}>
                          {list.status}
                       </span>
                    </div>
                </div>
              ))}
           </div>
        </section>
      </div>
    </div>
  );
};

export default AllLists;