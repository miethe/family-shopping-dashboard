import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { Modal } from '../components/Modal';

interface Recipient {
    id: number;
    name: string;
    group: string;
    avatar: string;
    upcoming?: string;
}

export const Recipients: React.FC = () => {
    const [selectedRecipient, setSelectedRecipient] = useState<Recipient | null>(null);

    const recipients: Recipient[] = [
        { id: 1, name: "Sarah", group: "Household", avatar: "https://i.pravatar.cc/150?img=32", upcoming: "Birthday Tomorrow" },
        { id: 2, name: "Mike", group: "Household", avatar: "https://i.pravatar.cc/150?img=12" },
        { id: 3, name: "Emma", group: "Household", avatar: "https://i.pravatar.cc/150?img=44" },
        { id: 4, name: "David", group: "Household", avatar: "https://i.pravatar.cc/150?img=68" },
        { id: 5, name: "Mom", group: "Family", avatar: "https://i.pravatar.cc/150?img=49" },
        { id: 6, name: "Dad", group: "Family", avatar: "https://i.pravatar.cc/150?img=53" },
    ];

    return (
        <Layout>
             <header className="mb-8">
                <h1 className="text-4xl font-bold text-slate-900">All Recipients</h1>
                <p className="text-slate-500 mt-1">16 Recipients, organized in 4 groups</p>
            </header>

            <div className="grid grid-cols-12 gap-8">
                <div className="col-span-12 lg:col-span-8 space-y-8">
                    
                    {/* Occasions Horizontal Scroll */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-bold text-slate-800">Upcoming Occasions</h2>
                        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                            <div className="flex-shrink-0 w-64 bg-white p-5 rounded-3xl shadow-card text-center relative overflow-hidden group hover:-translate-y-1 transition-transform cursor-pointer">
                                <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>
                                <p className="font-bold text-slate-800 text-lg">Sarah's Birthday</p>
                                <p className="text-sm text-primary font-bold">Tomorrow</p>
                                <div className="flex justify-center -space-x-2 mt-4">
                                     <img className="w-10 h-10 rounded-full border-2 border-white" src="https://i.pravatar.cc/150?img=32" alt="Sarah" />
                                </div>
                            </div>
                            <div className="flex-shrink-0 w-64 bg-white p-5 rounded-3xl shadow-card text-center relative overflow-hidden group hover:-translate-y-1 transition-transform cursor-pointer">
                                <div className="absolute top-0 left-0 w-full h-1 bg-teal-500"></div>
                                <p className="font-bold text-slate-800 text-lg">Family Christmas</p>
                                <p className="text-sm text-slate-400 font-bold">in 2 weeks</p>
                                <div className="flex justify-center -space-x-2 mt-4">
                                     <img className="w-10 h-10 rounded-full border-2 border-white" src="https://i.pravatar.cc/150?img=12" alt="" />
                                     <img className="w-10 h-10 rounded-full border-2 border-white" src="https://i.pravatar.cc/150?img=44" alt="" />
                                     <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">+2</div>
                                </div>
                            </div>
                             <div className="flex-shrink-0 w-64 bg-white p-5 rounded-3xl shadow-card text-center relative overflow-hidden group hover:-translate-y-1 transition-transform cursor-pointer">
                                <div className="absolute top-0 left-0 w-full h-1 bg-purple-500"></div>
                                <p className="font-bold text-slate-800 text-lg">Mike's Anniversary</p>
                                <p className="text-sm text-slate-400 font-bold">in 3 weeks</p>
                                <div className="flex justify-center -space-x-2 mt-4">
                                     <img className="w-10 h-10 rounded-full border-2 border-white" src="https://i.pravatar.cc/150?img=12" alt="" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filter Bar */}
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="flex items-center bg-white p-1 rounded-full shadow-sm">
                            <button className="px-6 py-2 rounded-full bg-primary text-white font-bold text-sm shadow-md">Household</button>
                            <button className="px-6 py-2 rounded-full text-slate-500 hover:bg-slate-50 font-semibold text-sm transition-colors">Family</button>
                            <button className="px-6 py-2 rounded-full text-slate-500 hover:bg-slate-50 font-semibold text-sm transition-colors">Friends</button>
                            <button className="px-6 py-2 rounded-full text-slate-500 hover:bg-slate-50 font-semibold text-sm transition-colors">Other</button>
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <div className="relative w-full sm:w-auto">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                                <input type="text" placeholder="Search..." className="w-full sm:w-48 pl-10 pr-4 py-2 bg-white border-none rounded-full shadow-sm focus:ring-2 focus:ring-primary" />
                            </div>
                        </div>
                    </div>

                    {/* Recipients Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                        {recipients.map(r => (
                            <div 
                                key={r.id} 
                                onClick={() => setSelectedRecipient(r)}
                                className="bg-white p-6 rounded-3xl text-center shadow-card hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-pointer group"
                            >
                                <div className="relative inline-block">
                                    <img src={r.avatar} alt={r.name} className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-transparent group-hover:border-primary/20 transition-all" />
                                    {r.upcoming && <div className="absolute bottom-0 right-0 w-5 h-5 bg-red-500 border-2 border-white rounded-full"></div>}
                                </div>
                                <h3 className="mt-4 font-bold text-slate-800 text-lg">{r.name}</h3>
                                <span className="inline-block mt-2 px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full">
                                    {r.group}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Panel: Recent Activity */}
                <div className="col-span-12 lg:col-span-4">
                     <div className="bg-white p-8 rounded-[2rem] shadow-soft h-full">
                        <h2 className="text-xl font-bold mb-8 text-slate-800">Recent Updates</h2>
                        <ul className="space-y-6">
                             <li className="flex gap-4 items-start">
                                 <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-xl">👤</div>
                                 <div>
                                     <p className="text-sm text-slate-600"><span className="font-bold text-slate-900">You</span> added David to Household.</p>
                                     <p className="text-xs text-slate-400 mt-1">2 hours ago</p>
                                 </div>
                             </li>
                             <li className="flex gap-4 items-start">
                                 <img src="https://i.pravatar.cc/150?img=12" className="w-10 h-10 rounded-full" alt="Mike" />
                                 <div>
                                     <p className="text-sm text-slate-600"><span className="font-bold text-slate-900">Mike</span> added a gift for Emma.</p>
                                     <p className="text-xs text-slate-400 mt-1">5 hours ago</p>
                                 </div>
                             </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Recipient Details Modal */}
            <Modal isOpen={!!selectedRecipient} onClose={() => setSelectedRecipient(null)}>
                <div className="relative">
                    {/* Header with Background Color */}
                    <div className="bg-background-light p-8 rounded-t-3xl text-center relative z-0">
                        <button onClick={() => setSelectedRecipient(null)} className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-200 transition">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                        <div className="relative inline-block -mb-16">
                            <img src={selectedRecipient?.avatar || ''} className="w-32 h-32 rounded-full border-8 border-white shadow-xl" alt="" />
                        </div>
                    </div>
                    
                    {/* Content */}
                    <div className="bg-white pt-20 px-8 pb-10 rounded-b-3xl -mt-8 relative z-10">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-slate-900">{selectedRecipient?.name}</h2>
                            <span className="inline-block mt-2 px-4 py-1.5 bg-blue-50 text-blue-600 text-sm font-bold rounded-full">
                                {selectedRecipient?.group}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <h3 className="text-lg font-bold text-slate-800">Personal Info</h3>
                                <div className="bg-slate-50 p-6 rounded-2xl space-y-3">
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-primary">cake</span>
                                        <div><span className="font-bold text-slate-700">Birthday:</span> <span className="text-slate-600">May 15th</span></div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-primary">favorite</span>
                                        <div><span className="font-bold text-slate-700">Anniversary:</span> <span className="text-slate-600">Oct 22nd</span></div>
                                    </div>
                                </div>

                                <div className="bg-slate-50 p-6 rounded-2xl">
                                    <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary text-sm">straighten</span> Sizes
                                    </h4>
                                    <div className="space-y-2 text-sm text-slate-600">
                                        <div className="flex justify-between"><span>Shirt</span><span className="font-bold">M (Womens)</span></div>
                                        <div className="flex justify-between"><span>Pants</span><span className="font-bold">8 (Womens)</span></div>
                                        <div className="flex justify-between"><span>Shoe</span><span className="font-bold">7 (Womens)</span></div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h3 className="text-lg font-bold text-slate-800">Gifting History</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl">
                                        <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-green-600">
                                            <span className="material-symbols-outlined">check_circle</span>
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800">Noise Cancelling Headphones</p>
                                            <p className="text-xs text-slate-500">Dec 2023 • Purchased by you</p>
                                        </div>
                                    </div>
                                     <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl">
                                        <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center text-yellow-600">
                                            <span className="material-symbols-outlined">arrow_downward</span>
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800">Cookbook</p>
                                            <p className="text-xs text-slate-500">May 2023 • Received from Mike</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>
        </Layout>
    );
};
