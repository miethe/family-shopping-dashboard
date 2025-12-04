import React from 'react';
import { Layout } from '../components/Layout';
import { useNavigate } from 'react-router-dom';

export const Dashboard: React.FC = () => {
    const navigate = useNavigate();

    return (
        <Layout>
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <h1 className="text-3xl md:text-5xl font-bold text-slate-900">
                    Tomorrow's Birthday <span className="text-primary">2025</span>
                </h1>
                <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium text-slate-500 hidden sm:block">People Needing Gifts</span>
                    <div className="flex -space-x-3 hover:space-x-1 transition-all duration-300">
                        {[1, 2, 3, 4].map((i) => (
                            <img 
                                key={i}
                                alt="User avatar" 
                                className="w-10 h-10 rounded-full border-2 border-white ring-2 ring-primary/20 object-cover cursor-pointer hover:scale-110 transition-transform z-10 hover:z-20" 
                                src={`https://i.pravatar.cc/150?img=${i + 10}`} 
                            />
                        ))}
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-12 gap-8">
                {/* Left Column */}
                <div className="col-span-12 lg:col-span-5 space-y-8">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-3 gap-4 md:gap-6">
                        <div className="bg-yellow-100 p-6 rounded-3xl text-center shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                            <p className="text-sm font-semibold text-yellow-700 uppercase tracking-wide">Ideas</p>
                            <p className="text-4xl md:text-5xl font-bold text-yellow-800 mt-2">12</p>
                        </div>
                        <div className="bg-primary/90 p-6 rounded-3xl text-center shadow-lg shadow-primary/20 hover:bg-primary transition-colors cursor-pointer">
                            <p className="text-sm font-semibold text-white/90 uppercase tracking-wide">To Buy</p>
                            <p className="text-4xl md:text-5xl font-bold text-white mt-2">0</p>
                        </div>
                        <div className="bg-teal-500/90 p-6 rounded-3xl text-center shadow-lg shadow-teal-500/20 hover:bg-teal-500 transition-colors cursor-pointer">
                            <p className="text-sm font-semibold text-white/90 uppercase tracking-wide">Purchased</p>
                            <p className="text-4xl md:text-5xl font-bold text-white mt-2">6</p>
                        </div>
                    </div>

                    <button 
                        onClick={() => navigate('/lists/1')}
                        className="w-full bg-primary text-white font-bold py-5 rounded-3xl shadow-xl shadow-primary/20 hover:shadow-2xl hover:bg-primary-dark hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2"
                    >
                        <span>View Occasion</span>
                        <span className="material-symbols-outlined">arrow_forward</span>
                    </button>

                    {/* Idea Inbox */}
                    <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-soft">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-slate-800">Idea Inbox</h2>
                            <button className="text-sm text-primary font-semibold hover:underline">View All</button>
                        </div>
                        <ul className="space-y-4">
                            {[
                                { name: "Wireless Headphones", icon: "headphones", bg: "bg-yellow-400" },
                                { name: "Smart Watch", icon: "watch", bg: "bg-slate-200" },
                                { name: "Coffee Maker", icon: "coffee_maker", bg: "bg-orange-700 text-white" }
                            ].map((item, idx) => (
                                <li key={idx} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-2xl transition-colors group">
                                    <div className="flex items-center space-x-4">
                                        <div className={`w-14 h-14 ${item.bg} rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform`}>
                                            <span className="material-symbols-outlined text-2xl">{item.icon}</span>
                                        </div>
                                        <span className="font-semibold text-lg text-slate-700">{item.name}</span>
                                    </div>
                                    <button className="bg-slate-100 text-slate-600 p-2 rounded-full hover:bg-primary hover:text-white transition-colors">
                                        <span className="material-symbols-outlined">add</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Right Column - Recent Activity */}
                <div className="col-span-12 lg:col-span-7">
                    <div className="bg-white p-8 rounded-[2rem] shadow-soft h-full">
                        <h2 className="text-xl font-bold mb-8 text-slate-800">Recent Activity</h2>
                        <div className="relative border-l-2 border-slate-100 ml-4 space-y-8 pb-4">
                             {[
                                { user: "Sarah", action: "marked", item: "Wireless Headphones", status: "Purchased", img: 32 },
                                { user: "Mike", action: "added", item: "Smart Watch", status: "Ideas", img: 12 },
                                { user: "Emma", action: "marked", item: "Coffee Maker", status: "To Buy", img: 44 },
                                { user: "Sarah", action: "commented on", item: "Wireless Headphones", status: "Great choice!", img: 32 },
                                { user: "Mike", action: "marked", item: "Board Game", status: "Purchased", img: 12 },
                            ].map((activity, idx) => (
                                <div key={idx} className="flex items-start pl-8 relative group">
                                    {/* Timeline dot */}
                                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-4 border-primary group-hover:scale-125 transition-transform"></div>
                                    
                                    <div className="flex items-start gap-4 w-full p-3 -mt-2 rounded-2xl hover:bg-slate-50 transition-colors">
                                        <img alt={activity.user} className="w-10 h-10 rounded-full object-cover" src={`https://i.pravatar.cc/150?img=${activity.img}`} />
                                        <div>
                                            <p className="text-slate-600 leading-relaxed">
                                                <strong className="text-slate-900">{activity.user}</strong> {activity.action} "{activity.item}" as <strong className="text-slate-900">{activity.status}</strong>.
                                            </p>
                                            <p className="text-xs text-slate-400 mt-1">2 hours ago</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};
