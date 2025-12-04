
import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { Modal } from '../components/Modal';
import { useNavigate, useParams } from 'react-router-dom';

type ViewMode = 'kanban' | 'list';
type ListType = 'Gift List' | 'Wish List';

interface GiftItem {
    id: string;
    title: string;
    recipient: { name: string; avatar: string };
    status: 'Idea' | 'To Buy' | 'Purchased' | 'Gifted';
    price: number;
    category: string;
    image: string;
    addedBy: string;
    dateAdded: string;
}

const MOCK_ITEMS: GiftItem[] = [
    { 
        id: '1', 
        title: 'LEGO Starship Set', 
        recipient: { name: 'Leo', avatar: 'https://i.pravatar.cc/150?img=12' }, 
        status: 'Idea', 
        price: 129.99, 
        category: 'Toys',
        image: 'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?w=500',
        addedBy: 'You',
        dateAdded: 'Dec 10, 2025'
    },
    { 
        id: '2', 
        title: 'Art Easel', 
        recipient: { name: 'Mia', avatar: 'https://i.pravatar.cc/150?img=5' }, 
        status: 'Idea', 
        price: 45.00, 
        category: 'Art',
        image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=500',
        addedBy: 'Mom',
        dateAdded: 'Dec 12, 2025'
    },
    { 
        id: '3', 
        title: 'RC Car', 
        recipient: { name: 'Leo', avatar: 'https://i.pravatar.cc/150?img=12' }, 
        status: 'Idea', 
        price: 89.99, 
        category: 'Toys',
        image: 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?w=500',
        addedBy: 'Dad',
        dateAdded: 'Dec 14, 2025'
    },
    { 
        id: '4', 
        title: 'Story Book Collection', 
        recipient: { name: 'Mia', avatar: 'https://i.pravatar.cc/150?img=5' }, 
        status: 'Purchased', 
        price: 34.50, 
        category: 'Books',
        image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500',
        addedBy: 'You',
        dateAdded: 'Nov 20, 2025'
    },
    { 
        id: '5', 
        title: 'Science Kit', 
        recipient: { name: 'Leo', avatar: 'https://i.pravatar.cc/150?img=12' }, 
        status: 'Purchased', 
        price: 29.99, 
        category: 'Education',
        image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=500',
        addedBy: 'Grandma',
        dateAdded: 'Nov 25, 2025'
    },
    { 
        id: '6', 
        title: 'First Bicycle', 
        recipient: { name: 'Mia', avatar: 'https://i.pravatar.cc/150?img=5' }, 
        status: 'Gifted', 
        price: 150.00, 
        category: 'Outdoor',
        image: 'https://images.unsplash.com/photo-1485965120184-e224f7a1db69?w=500',
        addedBy: 'You',
        dateAdded: 'Oct 15, 2025'
    },
];

const STATUS_CONFIG = {
    'Idea': { color: 'bg-yellow-100 text-yellow-800', border: 'border-yellow-200', icon: 'lightbulb' },
    'To Buy': { color: 'bg-red-100 text-red-800', border: 'border-red-200', icon: 'shopping_cart' },
    'Purchased': { color: 'bg-green-100 text-green-800', border: 'border-green-200', icon: 'check_circle' },
    'Gifted': { color: 'bg-purple-100 text-purple-800', border: 'border-purple-200', icon: 'volunteer_activism' },
};

export const ListDetails: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [viewMode, setViewMode] = useState<ViewMode>('kanban');
    const [selectedGift, setSelectedGift] = useState<GiftItem | null>(null);
    
    // Simulating list details based on ID or default
    const listTitle = "Christmas 2026";
    const listType: ListType = "Gift List"; 
    const totalItems = MOCK_ITEMS.length;
    const purchasedCount = MOCK_ITEMS.filter(i => i.status === 'Purchased').length;

    return (
        <Layout>
            <div className="flex flex-col gap-6 h-[calc(100vh-8rem)]">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
                                {listType}
                            </span>
                            <span className="text-slate-400 text-sm font-medium">Updated 2h ago</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight font-display">
                            {listTitle} <span className="text-slate-400 font-light hidden sm:inline">| Kids Gifts</span>
                        </h1>
                        <div className="flex items-center gap-2 mt-2 text-slate-500 font-medium">
                            <span>{totalItems} items</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                            <span>{purchasedCount} purchased</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                            <span>$479.47 est. total</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 self-end md:self-auto">
                        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                            <button 
                                onClick={() => setViewMode('kanban')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                                    viewMode === 'kanban' 
                                    ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' 
                                    : 'text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                <span className="material-symbols-outlined text-lg">view_kanban</span>
                                <span className="hidden sm:inline">Board</span>
                            </button>
                            <button 
                                onClick={() => setViewMode('list')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                                    viewMode === 'list' 
                                    ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' 
                                    : 'text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                <span className="material-symbols-outlined text-lg">table_rows</span>
                                <span className="hidden sm:inline">List</span>
                            </button>
                        </div>
                        <button 
                            onClick={() => setSelectedGift({ id: 'new', title: '', recipient: { name: '', avatar: '' }, status: 'Idea', price: 0, category: '', image: '', addedBy: '', dateAdded: '' } as GiftItem)}
                            className="flex items-center gap-2 px-5 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition shadow-lg shadow-slate-900/20"
                        >
                            <span className="material-symbols-outlined text-xl">add</span>
                            <span className="hidden sm:inline">Add Gift</span>
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-hidden relative">
                    {viewMode === 'kanban' ? (
                        <div className="flex h-full gap-6 overflow-x-auto pb-4 pt-2 snap-x">
                            <KanbanColumn 
                                title="Idea" 
                                count={MOCK_ITEMS.filter(i => i.status === 'Idea').length} 
                                items={MOCK_ITEMS.filter(i => i.status === 'Idea')}
                                onCardClick={setSelectedGift}
                            />
                            <KanbanColumn 
                                title="To Buy" 
                                count={MOCK_ITEMS.filter(i => i.status === 'To Buy').length} 
                                items={MOCK_ITEMS.filter(i => i.status === 'To Buy')}
                                onCardClick={setSelectedGift}
                                isPlaceholder
                            />
                            <KanbanColumn 
                                title="Purchased" 
                                count={MOCK_ITEMS.filter(i => i.status === 'Purchased').length} 
                                items={MOCK_ITEMS.filter(i => i.status === 'Purchased')}
                                onCardClick={setSelectedGift}
                            />
                            <KanbanColumn 
                                title="Gifted" 
                                count={MOCK_ITEMS.filter(i => i.status === 'Gifted').length} 
                                items={MOCK_ITEMS.filter(i => i.status === 'Gifted')}
                                onCardClick={setSelectedGift}
                            />
                        </div>
                    ) : (
                        <div className="h-full overflow-y-auto bg-white dark:bg-slate-800/50 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50 dark:bg-slate-800 sticky top-0 z-10 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">Gift Item</th>
                                        <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">Recipient</th>
                                        <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">Status</th>
                                        <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">Price</th>
                                        <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">Category</th>
                                        <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">Added By</th>
                                        <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                    {MOCK_ITEMS.map((item) => (
                                        <tr 
                                            key={item.id} 
                                            onClick={() => setSelectedGift(item)}
                                            className="hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors group"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-lg bg-slate-100 flex-shrink-0 overflow-hidden">
                                                        <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900 dark:text-white">{item.title}</p>
                                                        <p className="text-xs text-slate-400">Added {item.dateAdded}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <img src={item.recipient.avatar} alt={item.recipient.name} className="w-6 h-6 rounded-full" />
                                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{item.recipient.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${STATUS_CONFIG[item.status].color} ${STATUS_CONFIG[item.status].border}`}>
                                                    <span className="material-symbols-outlined text-[14px]">{STATUS_CONFIG[item.status].icon}</span>
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-semibold text-slate-900 dark:text-white">${item.price.toFixed(2)}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs font-medium text-slate-600 dark:text-slate-300">
                                                    {item.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-500">
                                                {item.addedBy}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="text-slate-400 hover:text-primary transition-colors p-2 hover:bg-slate-100 rounded-full">
                                                    <span className="material-symbols-outlined text-lg">more_horiz</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Integrated Gift Details Modal */}
            <Modal isOpen={!!selectedGift} onClose={() => setSelectedGift(null)}>
                {selectedGift && (
                     <div className="flex flex-col md:flex-row bg-background-light dark:bg-background-dark rounded-3xl overflow-hidden h-[85vh] md:h-[80vh]">
                     {/* Main Details */}
                     <div className="flex-1 p-6 md:p-10 overflow-y-auto custom-scrollbar">
                        <div className="flex justify-between items-start mb-8">
                            <div className="flex gap-6 items-start">
                                <div className="w-32 h-32 rounded-3xl overflow-hidden shadow-lg border-4 border-white dark:border-slate-700 flex-shrink-0 relative group">
                                     <img src={selectedGift.image || "https://placehold.co/400"} className="w-full h-full object-cover" alt={selectedGift.title} />
                                     <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                        <span className="material-symbols-outlined text-white">edit</span>
                                     </div>
                                </div>
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${STATUS_CONFIG[selectedGift.status]?.color || 'bg-gray-100'}`}>
                                            {selectedGift.status}
                                        </span>
                                        {selectedGift.category && <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">{selectedGift.category}</span>}
                                    </div>
                                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2 leading-tight">
                                        {selectedGift.id === 'new' ? 'New Gift Idea' : selectedGift.title}
                                    </h2>
                                    <div className="flex items-center gap-2 text-slate-500">
                                        <span>For</span>
                                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-200 dark:bg-slate-700 rounded-full text-sm font-bold text-slate-700 dark:text-slate-300">
                                            {selectedGift.recipient.avatar && <img src={selectedGift.recipient.avatar} className="w-5 h-5 rounded-full" alt="" />}
                                            {selectedGift.recipient.name || "Select Recipient"}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setSelectedGift(null)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">
                                <span className="material-symbols-outlined text-slate-500">close</span>
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="border-b border-slate-200 dark:border-slate-700 mb-8">
                            <nav className="flex space-x-8">
                                <button className="border-b-2 border-primary text-primary font-bold py-3 text-sm uppercase tracking-wide">Overview</button>
                                <button className="border-b-2 border-transparent text-slate-500 hover:text-slate-700 font-bold py-3 text-sm uppercase tracking-wide">Linked Entities</button>
                                <button className="border-b-2 border-transparent text-slate-500 hover:text-slate-700 font-bold py-3 text-sm uppercase tracking-wide">History</button>
                            </nav>
                        </div>

                        <div className="space-y-8">
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-slate-400">description</span> Description
                                </h3>
                                <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                                        A sleek and modern smart watch with fitness tracking, heart rate monitoring, and notification display. Perfect for staying connected and active.
                                    </p>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                                    <h4 className="text-xs uppercase tracking-wide text-slate-400 font-bold mb-1">Price</h4>
                                    <p className="font-bold text-xl text-slate-900 dark:text-white">${selectedGift.price ? selectedGift.price.toFixed(2) : '0.00'}</p>
                                </div>
                                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                                    <h4 className="text-xs uppercase tracking-wide text-slate-400 font-bold mb-1">Added By</h4>
                                    <p className="font-bold text-xl text-slate-900 dark:text-white">{selectedGift.addedBy || 'You'}</p>
                                </div>
                                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                                    <h4 className="text-xs uppercase tracking-wide text-slate-400 font-bold mb-1">Date Added</h4>
                                    <p className="font-bold text-xl text-slate-900 dark:text-white">{selectedGift.dateAdded || 'Today'}</p>
                                </div>
                                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex items-center justify-between">
                                    <div>
                                        <h4 className="text-xs uppercase tracking-wide text-slate-400 font-bold mb-1">Link</h4>
                                        <a href="#" className="font-bold text-primary hover:underline truncate block max-w-[100px]">amazon.com</a>
                                    </div>
                                    <span className="material-symbols-outlined text-slate-300">open_in_new</span>
                                </div>
                            </div>

                            <div className="pt-4 flex gap-4">
                                <button className="flex-1 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/30 hover:bg-primary-dark transition-all">
                                    Edit Gift
                                </button>
                                <button className="flex-1 py-3 bg-white border-2 border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-all">
                                    Mark as {selectedGift.status === 'Purchased' ? 'Idea' : 'Purchased'}
                                </button>
                            </div>
                        </div>
                     </div>

                     {/* Sidebar inside Modal */}
                     <div className="w-full md:w-80 bg-white dark:bg-slate-800 border-l border-slate-100 dark:border-slate-700 p-8 overflow-y-auto">
                        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
                            <span className="material-symbols-outlined text-amber-500">auto_awesome</span> Smart Suggestions
                        </h3>
                        
                        <div className="space-y-6">
                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-600">
                                <h4 className="text-xs font-bold text-slate-400 mb-2 uppercase">Similar Item Deal</h4>
                                <div className="flex gap-3">
                                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-green-600 font-bold shadow-sm">15%</div>
                                    <div>
                                        <p className="font-bold text-sm text-slate-800 dark:text-white">TechStore Sale</p>
                                        <p className="text-xs text-slate-500">Expires in 2 days</p>
                                    </div>
                                </div>
                            </div>
                             <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-600">
                                <h4 className="text-xs font-bold text-slate-400 mb-2 uppercase">Other Lists</h4>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary text-sm">celebration</span>
                                        <span className="font-bold text-sm text-slate-800 dark:text-white">Dad's Birthday</span>
                                    </div>
                                    <button className="text-primary hover:bg-primary/10 p-1 rounded"><span className="material-symbols-outlined text-lg">add</span></button>
                                </div>
                            </div>
                        </div>
                     </div>
                </div>
                )}
            </Modal>
        </Layout>
    );
};

// Sub-component for Kanban Column
const KanbanColumn: React.FC<{ title: string, count: number, items: GiftItem[], onCardClick: (item: GiftItem) => void, isPlaceholder?: boolean }> = ({ title, count, items, onCardClick, isPlaceholder }) => {
    return (
        <div className="flex flex-col gap-4 min-w-[280px] w-[280px] md:w-[320px] snap-center">
            <div className="flex items-center justify-between px-2 sticky top-0">
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">{title}</h2>
                <span className="flex items-center justify-center h-6 min-w-[1.5rem] px-2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold">
                    {count}
                </span>
            </div>
            
            <div className="flex flex-col gap-3 h-full overflow-y-auto pb-4 custom-scrollbar pr-2">
                {items.length > 0 ? (
                    items.map(item => (
                        <div 
                            key={item.id} 
                            onClick={() => onCardClick(item)}
                            className="bg-white dark:bg-slate-800 p-3 rounded-2xl shadow-card hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group border border-transparent hover:border-slate-200 dark:hover:border-slate-600"
                        >
                            <div className="aspect-[16/10] bg-slate-100 dark:bg-slate-700 rounded-xl mb-3 overflow-hidden relative">
                                <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/50 backdrop-blur-md rounded-full text-white text-[10px] font-bold">
                                    ${item.price.toFixed(0)}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <h3 className="font-bold text-slate-900 dark:text-white text-base leading-tight line-clamp-2">{item.title}</h3>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 dark:bg-slate-700 rounded-lg">
                                        <img src={item.recipient.avatar} className="w-4 h-4 rounded-full" alt={item.recipient.name} />
                                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{item.recipient.name}</span>
                                    </div>
                                    <span className={`w-2 h-2 rounded-full ${STATUS_CONFIG[item.status].color.split(' ')[0].replace('bg-', 'bg-')}-400`}></span>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    isPlaceholder ? (
                        <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-50 dark:bg-slate-800/30 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl min-h-[150px] text-slate-400">
                            <span className="material-symbols-outlined text-3xl mb-2 opacity-50">shopping_bag</span>
                            <p className="text-xs font-bold opacity-70">Drag items here</p>
                        </div>
                    ) : (
                        <div className="h-24"></div> 
                    )
                )}
            </div>
        </div>
    )
}
