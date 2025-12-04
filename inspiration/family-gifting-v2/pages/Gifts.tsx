import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Modal } from '../components/Modal';
import { useSearchParams } from 'react-router-dom';

export const Gifts: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [viewGift, setViewGift] = useState<string | null>(null);
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    useEffect(() => {
        const action = searchParams.get('action');
        const view = searchParams.get('view');
        if (action === 'create') setIsCreateOpen(true);
        if (view) setViewGift(view);
    }, [searchParams]);

    const closeModals = () => {
        setSearchParams({});
        setIsCreateOpen(false);
        setViewGift(null);
    };

    return (
        <Layout>
            <header className="mb-8">
                <h1 className="text-4xl font-bold text-slate-900">All Gifts</h1>
                <p className="text-slate-500 mt-1">15 ideas, 10 purchased</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                     {/* Filter Bar */}
                     <div className="flex items-center space-x-3 mb-6 bg-white p-2 rounded-full shadow-sm">
                        <div className="relative flex-grow">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                            <input className="w-full pl-12 pr-4 py-2 bg-transparent border-none focus:ring-0 text-slate-700 placeholder-slate-400" placeholder="Search gifts..." type="text"/>
                        </div>
                        <div className="flex gap-2 pr-2">
                             <button className="p-2 rounded-full hover:bg-slate-100 text-slate-500"><span className="material-symbols-outlined">filter_list</span></button>
                             <button className="p-2 rounded-full hover:bg-slate-100 text-slate-500"><span className="material-symbols-outlined">swap_vert</span></button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Gift Item */}
                        <div onClick={() => setSearchParams({view: 'smart-watch'})} className="bg-white p-4 rounded-3xl shadow-card hover:shadow-lg transition-all cursor-pointer flex items-center space-x-4 group">
                            <img alt="Gift" className="w-20 h-20 rounded-2xl object-cover group-hover:scale-105 transition-transform" src="https://images.unsplash.com/photo-1544117519-31a4b719223d?w=200" />
                            <div className="flex-grow">
                                <h4 className="font-bold text-slate-800 text-lg">Smart Watch</h4>
                                <div className="flex items-center space-x-2 mt-1">
                                    <img alt="Dad" className="w-6 h-6 rounded-full" src="https://i.pravatar.cc/150?img=11" />
                                    <span className="text-sm text-slate-500">For Dad</span>
                                </div>
                            </div>
                            <span className="px-3 py-1 text-xs font-bold rounded-full bg-indigo-50 text-indigo-600">Idea</span>
                        </div>

                        {/* Gift Item */}
                        <div onClick={() => setSearchParams({view: 'lego'})} className="bg-white p-4 rounded-3xl shadow-card hover:shadow-lg transition-all cursor-pointer flex items-center space-x-4 group">
                             <img alt="Gift" className="w-20 h-20 rounded-2xl object-cover group-hover:scale-105 transition-transform" src="https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?w=200" />
                            <div className="flex-grow">
                                <h4 className="font-bold text-slate-800 text-lg">Lego Starship</h4>
                                <div className="flex items-center space-x-2 mt-1">
                                    <img alt="Leo" className="w-6 h-6 rounded-full" src="https://i.pravatar.cc/150?img=12" />
                                    <span className="text-sm text-slate-500">For Leo</span>
                                </div>
                            </div>
                            <span className="px-3 py-1 text-xs font-bold rounded-full bg-green-50 text-green-600">Purchased</span>
                        </div>

                         {/* Gift Item */}
                         <div className="bg-white p-4 rounded-3xl shadow-card hover:shadow-lg transition-all cursor-pointer flex items-center space-x-4 group opacity-70 hover:opacity-100">
                             <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                                <span className="material-symbols-outlined text-3xl">photo_camera</span>
                             </div>
                            <div className="flex-grow">
                                <h4 className="font-bold text-slate-800 text-lg">Spa Day Voucher</h4>
                                <div className="flex items-center space-x-2 mt-1">
                                    <img alt="Mom" className="w-6 h-6 rounded-full" src="https://i.pravatar.cc/150?img=49" />
                                    <span className="text-sm text-slate-500">For Mom</span>
                                </div>
                            </div>
                            <span className="px-3 py-1 text-xs font-bold rounded-full bg-red-50 text-red-600">To Buy</span>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-1 space-y-8 sticky top-8">
                     <div className="bg-white p-6 rounded-3xl shadow-soft">
                        <h2 className="text-xl font-bold mb-4 text-slate-800">Gift Idea Inbox</h2>
                        <div className="space-y-3">
                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                <p className="font-bold text-slate-800">Scented Candle Set</p>
                                <p className="text-xs text-slate-500 mt-1">From web clipper</p>
                            </div>
                             <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                <p className="font-bold text-slate-800">Brief History of Time</p>
                                <p className="text-xs text-slate-500 mt-1">Manually added</p>
                            </div>
                        </div>
                        <button onClick={() => setSearchParams({action: 'create'})} className="mt-4 w-full flex items-center justify-center space-x-2 px-4 py-3 bg-primary text-white rounded-full text-sm font-bold hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20">
                            <span className="material-symbols-outlined text-base">add</span>
                            <span>Add Idea</span>
                        </button>
                    </div>

                    <div className="bg-white p-6 rounded-3xl shadow-soft">
                        <h2 className="text-xl font-bold mb-4 text-slate-800">Auto-Recommendations</h2>
                        <div className="space-y-4">
                             <div className="flex items-center space-x-3">
                                <img alt="BBQ" className="w-12 h-12 rounded-xl object-cover" src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=150" />
                                <div>
                                    <p className="font-bold text-slate-800 text-sm">Grilling Tool Set</p>
                                    <p className="text-xs text-slate-500">For Dad (likes BBQ)</p>
                                </div>
                            </div>
                             <div className="flex items-center space-x-3">
                                <img alt="Gloves" className="w-12 h-12 rounded-xl object-cover" src="https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=150" />
                                <div>
                                    <p className="font-bold text-slate-800 text-sm">Gardening Gloves</p>
                                    <p className="text-xs text-slate-500">For Mom (likes Gardening)</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- Modals --- */}

            {/* Gift Details Modal */}
            <Modal isOpen={!!viewGift} onClose={closeModals}>
                <div className="flex flex-col h-full md:flex-row bg-white rounded-3xl overflow-hidden max-h-[90vh]">
                     {/* Main Details */}
                     <div className="flex-1 p-8 overflow-y-auto">
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex gap-6">
                                <img src="https://images.unsplash.com/photo-1544117519-31a4b719223d?w=300" className="w-32 h-32 rounded-3xl object-cover shadow-md" alt="Smart Watch" />
                                <div>
                                    <h2 className="text-3xl font-bold text-slate-900">Smart Watch</h2>
                                    <span className="inline-block mt-2 px-3 py-1 bg-indigo-50 text-indigo-600 text-sm font-bold rounded-full">Idea</span>
                                </div>
                            </div>
                            <button onClick={closeModals} className="p-2 hover:bg-slate-100 rounded-full"><span className="material-symbols-outlined">close</span></button>
                        </div>

                        {/* Tabs */}
                        <div className="border-b border-slate-200 mb-6">
                            <nav className="flex space-x-8">
                                <button className="border-b-2 border-primary text-primary font-bold py-3">Overview</button>
                                <button className="border-b-2 border-transparent text-slate-500 hover:text-slate-700 font-bold py-3">Linked Entities</button>
                                <button className="border-b-2 border-transparent text-slate-500 hover:text-slate-700 font-bold py-3">History</button>
                            </nav>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <h3 className="font-bold text-slate-900 mb-2">Description</h3>
                                <p className="text-slate-600 leading-relaxed">
                                    A sleek and modern smart watch with fitness tracking, heart rate monitoring, and notification display. Perfect for staying connected and active.
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-6 bg-slate-50 p-6 rounded-3xl">
                                <div>
                                    <h4 className="text-xs uppercase tracking-wide text-slate-500 font-bold mb-1">Price</h4>
                                    <p className="font-bold text-xl text-slate-900">$199.99</p>
                                </div>
                                <div>
                                    <h4 className="text-xs uppercase tracking-wide text-slate-500 font-bold mb-1">Added By</h4>
                                    <p className="font-bold text-xl text-slate-900">You</p>
                                </div>
                                <div>
                                    <h4 className="text-xs uppercase tracking-wide text-slate-500 font-bold mb-1">Date Added</h4>
                                    <p className="font-bold text-xl text-slate-900">Dec 15, 2025</p>
                                </div>
                            </div>
                        </div>
                     </div>

                     {/* Sidebar inside Modal */}
                     <div className="w-full md:w-80 bg-slate-50 border-l border-slate-100 p-8 overflow-y-auto">
                        <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-6">
                            <span className="material-symbols-outlined text-primary">auto_awesome</span> Smart Suggestions
                        </h3>
                        
                        <div className="space-y-6">
                            <div>
                                <h4 className="text-xs font-bold text-slate-400 mb-3 uppercase">Recipients</h4>
                                <div className="flex items-center justify-between bg-white p-3 rounded-xl shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <img src="https://i.pravatar.cc/150?img=11" className="w-8 h-8 rounded-full" alt="" />
                                        <div>
                                            <p className="font-bold text-sm text-slate-900">Dad</p>
                                            <p className="text-xs text-slate-500">Likes tech</p>
                                        </div>
                                    </div>
                                    <button className="text-primary"><span className="material-symbols-outlined">add_circle</span></button>
                                </div>
                            </div>
                             <div>
                                <h4 className="text-xs font-bold text-slate-400 mb-3 uppercase">Lists</h4>
                                <div className="flex items-center justify-between bg-white p-3 rounded-xl shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-red-500"><span className="material-symbols-outlined text-sm">celebration</span></div>
                                        <p className="font-bold text-sm text-slate-900">Dad's Birthday</p>
                                    </div>
                                    <button className="text-primary"><span className="material-symbols-outlined">add_circle</span></button>
                                </div>
                            </div>
                             <div>
                                <h4 className="text-xs font-bold text-slate-400 mb-3 uppercase">Detected Deals</h4>
                                <div className="bg-yellow-50 border border-yellow-100 p-3 rounded-xl">
                                    <p className="font-bold text-yellow-800 text-sm">15% off at TechStore</p>
                                    <p className="text-xs text-yellow-600 mt-1">Ends in 3 days</p>
                                </div>
                            </div>
                        </div>
                     </div>
                </div>
            </Modal>

            {/* Create Gift Modal */}
            <Modal isOpen={isCreateOpen} onClose={closeModals} maxWidth="max-w-2xl">
                 <div className="bg-white rounded-3xl overflow-hidden relative">
                    <div className="bg-background-light px-8 py-6 border-b border-slate-100 flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-slate-900">Add New Gift</h2>
                         <button onClick={closeModals} className="p-2 hover:bg-slate-200 rounded-full"><span className="material-symbols-outlined">close</span></button>
                    </div>

                    <div className="p-8 space-y-6 max-h-[75vh] overflow-y-auto">
                        <button className="w-full py-3 bg-slate-100 rounded-xl text-slate-600 font-bold hover:bg-slate-200 transition flex items-center justify-center gap-2">
                             Add From Library <span className="material-symbols-outlined">add</span>
                        </button>
                        
                        <div className="relative text-center">
                            <hr className="border-slate-200 absolute top-1/2 w-full" />
                            <span className="relative bg-white px-4 text-xs text-slate-400 font-bold uppercase">Or manually</span>
                        </div>

                        <form className="space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Gift Name</label>
                                <input type="text" className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary" placeholder="e.g., Smart Mug" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Description</label>
                                <textarea className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary h-24 resize-none" placeholder="Description..."></textarea>
                            </div>
                             <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Price</label>
                                    <input type="text" className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary" placeholder="$0.00" />
                                </div>
                                 <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">URL</label>
                                    <input type="text" className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary" placeholder="https://..." />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Tags</label>
                                <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-xl">
                                    <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">Tech <button>x</button></span>
                                    <input type="text" className="bg-transparent border-none p-0 text-sm focus:ring-0" placeholder="Add a tag..." />
                                </div>
                            </div>
                            
                            <div className="pt-4 border-t border-slate-100">
                                <label className="block text-sm font-bold text-slate-700 mb-3">Attach to Lists</label>
                                <div className="space-y-2">
                                     <label className="flex items-center p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100">
                                         <input type="checkbox" className="rounded text-primary focus:ring-primary border-slate-300 w-5 h-5 mr-3" />
                                         <div>
                                             <span className="block font-bold text-slate-800 text-sm">Christmas 2026</span>
                                             <span className="block text-xs text-slate-500">12 items, 3 recipients</span>
                                         </div>
                                     </label>
                                </div>
                            </div>
                        </form>
                    </div>

                    <div className="p-6 border-t border-slate-100 bg-white sticky bottom-0 z-10">
                        <button className="w-full py-4 bg-primary text-white rounded-full font-bold text-lg shadow-lg shadow-primary/30 hover:bg-primary-dark transition-colors">
                            Create Gift
                        </button>
                    </div>
                 </div>
            </Modal>
        </Layout>
    );
};
