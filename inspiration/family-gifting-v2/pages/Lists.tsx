import React from 'react';
import { Layout } from '../components/Layout';
import { useNavigate } from 'react-router-dom';

export const Lists: React.FC = () => {
    const navigate = useNavigate();

    return (
        <Layout>
            <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-bold text-slate-900">All Lists</h1>
                    <p className="text-slate-500 mt-1 font-medium">12 lists, 4 active occasions</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <button className="btn-secondary flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition font-semibold text-sm">
                        <span className="material-symbols-outlined text-lg">filter_list</span> Filter
                    </button>
                    <button className="btn-secondary flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition font-semibold text-sm">
                        <span className="material-symbols-outlined text-lg">swap_vert</span> Sort
                    </button>
                    <button className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-full text-sm font-bold hover:bg-primary-dark transition shadow-lg shadow-primary/25">
                        <span className="material-symbols-outlined text-lg">add</span> Create List
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2 space-y-10">
                    
                    {/* Section: Upcoming */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-slate-800">Upcoming Occasions</h2>
                        <div className="bg-white p-6 rounded-3xl shadow-card">
                            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <span className="w-2 h-6 bg-primary rounded-full"></span>
                                Christmas 2026
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Card 1 */}
                                <div onClick={() => navigate('/lists/christmas-kids')} className="bg-background-light p-6 rounded-2xl hover:bg-slate-100 transition-colors cursor-pointer group border border-transparent hover:border-slate-200">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="p-3 bg-red-100 rounded-xl group-hover:scale-110 transition-transform">
                                            <span className="material-symbols-outlined text-red-500 text-3xl">toys</span>
                                        </div>
                                        <span className="px-3 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-700">In Progress</span>
                                    </div>
                                    <h4 className="text-lg font-bold text-slate-800 mb-2">Kids' Wishlist</h4>
                                    <div className="flex items-center justify-between">
                                        <div className="flex -space-x-2">
                                            <img className="w-8 h-8 rounded-full ring-2 ring-white" src="https://i.pravatar.cc/150?img=12" alt="Kid 1" />
                                            <img className="w-8 h-8 rounded-full ring-2 ring-white" src="https://i.pravatar.cc/150?img=14" alt="Kid 2" />
                                        </div>
                                        <span className="text-sm font-semibold text-slate-400">12 items</span>
                                    </div>
                                </div>
                                {/* Card 2 */}
                                <div className="bg-background-light p-6 rounded-2xl hover:bg-slate-100 transition-colors cursor-pointer group border border-transparent hover:border-slate-200">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="p-3 bg-blue-100 rounded-xl group-hover:scale-110 transition-transform">
                                            <span className="material-symbols-outlined text-blue-500 text-3xl">devices</span>
                                        </div>
                                        <span className="px-3 py-1 text-xs font-bold rounded-full bg-purple-100 text-purple-700">Planning</span>
                                    </div>
                                    <h4 className="text-lg font-bold text-slate-800 mb-2">Parents & In-laws</h4>
                                    <div className="flex items-center justify-between">
                                        <div className="flex -space-x-2">
                                            <img className="w-8 h-8 rounded-full ring-2 ring-white" src="https://i.pravatar.cc/150?img=8" alt="Parent 1" />
                                            <img className="w-8 h-8 rounded-full ring-2 ring-white" src="https://i.pravatar.cc/150?img=5" alt="Parent 2" />
                                            <img className="w-8 h-8 rounded-full ring-2 ring-white" src="https://i.pravatar.cc/150?img=3" alt="Parent 3" />
                                        </div>
                                        <span className="text-sm font-semibold text-slate-400">4 items</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Section: Gift Lists */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-slate-800">Gift Lists</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {['Holiday Shopping', 'Client Appreciation'].map((title, i) => (
                                <div key={i} className="bg-white p-6 rounded-2xl shadow-card hover:-translate-y-1 transition-transform cursor-pointer">
                                    <div className="flex justify-between items-start mb-4">
                                         <span className="material-symbols-outlined text-slate-400">inventory_2</span>
                                         <span className="text-xs font-bold text-slate-300">LIST</span>
                                    </div>
                                    <h4 className="text-lg font-bold text-slate-800">{title}</h4>
                                    <p className="text-slate-500 text-sm mt-1">{i === 0 ? 15 : 8} items</p>
                                </div>
                            ))}
                            <button className="flex flex-col items-center justify-center p-6 rounded-2xl bg-white border-2 border-dashed border-slate-200 hover:border-primary hover:bg-red-50/50 text-slate-400 hover:text-primary transition-colors h-full min-h-[140px]">
                                <span className="material-symbols-outlined text-3xl mb-2">add_circle</span>
                                <span className="font-semibold text-sm">New Gift List</span>
                            </button>
                        </div>
                    </section>

                     {/* Section: Wish Lists */}
                     <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-slate-800">Wish Lists</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                             <div className="bg-white p-6 rounded-2xl shadow-card hover:-translate-y-1 transition-transform cursor-pointer relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-yellow-100 to-transparent rounded-bl-full -mr-8 -mt-8"></div>
                                <div className="flex justify-between items-start mb-4 relative">
                                         <span className="material-symbols-outlined text-yellow-500">cake</span>
                                </div>
                                <h4 className="text-lg font-bold text-slate-800">My Birthday</h4>
                                <p className="text-slate-500 text-sm mt-1">22 items</p>
                            </div>
                            <button className="flex flex-col items-center justify-center p-6 rounded-2xl bg-white border-2 border-dashed border-slate-200 hover:border-primary hover:bg-red-50/50 text-slate-400 hover:text-primary transition-colors h-full min-h-[140px]">
                                <span className="material-symbols-outlined text-3xl mb-2">add_circle</span>
                                <span className="font-semibold text-sm">New Wish List</span>
                            </button>
                        </div>
                    </section>

                </div>

                {/* Right Column: Activity Stream */}
                <div className="lg:col-span-1 sticky top-8">
                    <h2 className="text-2xl font-bold mb-4 text-slate-800">Recent List Activity</h2>
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-3xl shadow-soft relative overflow-hidden">
                             <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-green-100 rounded-xl">
                                    <span className="material-symbols-outlined text-green-600 text-2xl">celebration</span>
                                </div>
                                <span className="px-3 py-1 text-xs font-bold rounded-full bg-green-50 text-green-700 border border-green-100">Ongoing</span>
                            </div>
                            <h4 className="text-lg font-bold text-slate-800 mb-2">Birthdays 2027</h4>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="flex -space-x-2">
                                     <img className="w-8 h-8 rounded-full ring-2 ring-white" src="https://i.pravatar.cc/150?img=33" alt="" />
                                     <img className="w-8 h-8 rounded-full ring-2 ring-white" src="https://i.pravatar.cc/150?img=34" alt="" />
                                     <img className="w-8 h-8 rounded-full ring-2 ring-white" src="https://i.pravatar.cc/150?img=35" alt="" />
                                     <div className="w-8 h-8 rounded-full ring-2 ring-white bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">+5</div>
                                </div>
                                <span className="text-sm text-slate-500">24 items</span>
                            </div>
                            <div className="mt-4 pt-4 border-t border-slate-100 text-sm text-slate-500">
                                Updated <span className="text-slate-800 font-semibold">2 hours ago</span> by <span className="text-slate-800 font-semibold">Mom</span>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-3xl shadow-soft">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-purple-100 rounded-xl">
                                    <span className="material-symbols-outlined text-purple-600 text-2xl">home</span>
                                </div>
                                <span className="px-3 py-1 text-xs font-bold rounded-full bg-slate-100 text-slate-500">Archived</span>
                            </div>
                            <h4 className="text-lg font-bold text-slate-800 mb-2">Housewarming Ideas</h4>
                            <p className="text-sm text-slate-500">9 items • Last year</p>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};
