import React, { useState } from 'react';
import { Filter, ArrowUpDown, Plus, Sparkles, X, Check, MessageCircle } from 'lucide-react';
import { generateGiftIdeas } from '../services/geminiService';

interface SingleListViewProps {
  onBack: () => void;
}

const SingleListView: React.FC<SingleListViewProps> = ({ onBack }) => {
  const [showAIModal, setShowAIModal] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const [generatedIdeas, setGeneratedIdeas] = useState<any[]>([]);

  // Simple state for columns
  const [ideaItems, setIdeaItems] = useState([
    { id: 1, name: 'Science Experiment Box', type: 'Idea', assigned: 'Jaden', price: '$35', img: 'https://picsum.photos/seed/science/200' },
  ]);
  const [shortlisted, setShortlisted] = useState([
    { id: 2, name: 'Art Supply Kit Deluxe', type: 'Shortlisted', hasComments: true, img: 'https://picsum.photos/seed/art/200' },
  ]);
  const [purchased, setPurchased] = useState([
    { id: 3, name: 'LEGO Friends Botanical Garden', type: 'Purchased', assigned: 'Nick', img: 'https://picsum.photos/seed/lego/200' },
  ]);
  const [otherIdeas, setOtherIdeas] = useState([
      { id: 4, name: 'Adventure Book Series', img: 'https://picsum.photos/seed/book/200'}
  ])

  const handleGenerateIdeas = async () => {
    setLoadingAI(true);
    // Mock data input for the AI
    const ideas = await generateGiftIdeas("Peyton", "10", "science, art, and building things");
    setGeneratedIdeas(ideas);
    setLoadingAI(false);
  };

  const acceptIdea = (idea: any) => {
      const newItem = {
          id: Date.now(),
          name: idea.name,
          type: 'Idea',
          assigned: 'Unassigned',
          price: idea.estimatedPrice,
          img: `https://picsum.photos/seed/${idea.name.replace(/\s/g, '')}/200`
      };
      setIdeaItems([...ideaItems, newItem]);
      setGeneratedIdeas(generatedIdeas.filter(i => i.name !== idea.name));
  };

  return (
    <div className="p-8 max-w-7xl mx-auto h-full overflow-y-auto pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <button onClick={onBack} className="text-gray-400 hover:text-salmon font-bold text-sm mb-2 transition-colors">
             &larr; Back to Lists
          </button>
          <h1 className="text-4xl font-extrabold text-[#3D405B]">Peyton's Christmas Ideas</h1>
          <p className="text-gray-500 font-medium mt-1">8 items · 2 new</p>
        </div>
        
        <div className="flex gap-3">
           <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-full text-gray-600 font-bold shadow-sm hover:shadow-md transition-all border border-transparent hover:border-gray-100">
             <Filter size={18} /> Filter
           </button>
           <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-full text-gray-600 font-bold shadow-sm hover:shadow-md transition-all border border-transparent hover:border-gray-100">
             <ArrowUpDown size={18} /> Sort
           </button>
           
           {/* AI Button */}
           <button 
             onClick={() => setShowAIModal(true)}
             className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-purple-400 to-indigo-400 text-white rounded-full font-bold shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all"
           >
             <Sparkles size={18} /> AI Ideas
           </button>

           <button className="flex items-center gap-2 px-5 py-2 bg-salmon text-white rounded-full font-bold shadow-lg shadow-salmon/30 hover:bg-[#d66f56] transition-all">
             <Plus size={18} /> Add Gift
           </button>
        </div>
      </div>

      {/* Kanban Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Column 1: Idea */}
        <div className="flex flex-col gap-4">
          <div className="bg-[#DDBEA9] text-[#5e4b3e] text-center font-bold py-3 rounded-t-2xl">
            Idea
          </div>
          <div className="space-y-4">
             {ideaItems.map(item => (
                <div key={item.id} className="bg-white rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow relative group">
                    <div className="flex items-start gap-4 mb-4">
                        <img src={item.img} className="w-16 h-16 rounded-2xl object-cover bg-gray-100" alt={item.name} />
                        <div>
                             <h3 className="font-bold text-gray-800 leading-tight mb-1">{item.name}</h3>
                             <span className="inline-block px-3 py-1 bg-[#DDBEA9] text-[#5e4b3e] rounded-full text-xs font-bold">Idea</span>
                        </div>
                    </div>
                    <div className="border-t border-gray-100 pt-3 flex justify-between items-center text-sm font-medium text-gray-500">
                        <span className="bg-gray-100 px-3 py-1 rounded-full text-gray-600">Assigned to: {item.assigned}</span>
                        <span>Approx. {item.price}</span>
                    </div>
                </div>
             ))}

             {/* Stacked cards visual for "Other Ideas" */}
             <div className="relative mt-8">
                 <div className="bg-white rounded-3xl p-5 shadow-sm z-10 relative">
                     <div className="flex items-center gap-4">
                         <img src={otherIdeas[0].img} className="w-12 h-12 rounded-xl object-cover" alt="" />
                         <div>
                            <h3 className="font-bold text-gray-800">{otherIdeas[0].name}</h3>
                         </div>
                     </div>
                 </div>
                 <div className="absolute top-3 left-2 right-2 h-full bg-white/60 rounded-3xl -z-10 scale-[0.95]"></div>
             </div>
          </div>
        </div>

        {/* Column 2: Shortlisted */}
        <div className="flex flex-col gap-4">
          <div className="bg-[#D08C78] text-white text-center font-bold py-3 rounded-t-2xl">
            Shortlisted
          </div>
          <div className="space-y-4">
             {shortlisted.map(item => (
                <div key={item.id} className="bg-white rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-4 mb-4">
                        <img src={item.img} className="w-16 h-16 rounded-2xl object-cover bg-gray-100" alt={item.name} />
                        <div>
                             <h3 className="font-bold text-gray-800 leading-tight mb-1">{item.name}</h3>
                             <span className="inline-block px-3 py-1 bg-[#D08C78] text-white rounded-full text-xs font-bold">Shortlisted</span>
                        </div>
                    </div>
                    {item.hasComments && (
                        <div className="flex justify-end mt-2">
                             <MessageCircle size={20} className="text-gray-400 fill-gray-100" />
                        </div>
                    )}
                </div>
             ))}
          </div>
        </div>

        {/* Column 3: Purchased */}
        <div className="flex flex-col gap-4">
          <div className="bg-[#AEC3B0] text-[#3e5240] text-center font-bold py-3 rounded-t-2xl">
            Purchased
          </div>
          <div className="space-y-4">
             {purchased.map(item => (
                <div key={item.id} className="bg-white rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow opacity-75 hover:opacity-100">
                    <div className="flex items-start gap-4 mb-4">
                        <img src={item.img} className="w-16 h-16 rounded-2xl object-cover bg-gray-100" alt={item.name} />
                        <div>
                             <h3 className="font-bold text-gray-800 leading-tight mb-1">{item.name}</h3>
                             <span className="inline-block px-3 py-1 bg-[#AEC3B0] text-[#3e5240] rounded-full text-xs font-bold">Purchased</span>
                        </div>
                    </div>
                    <div className="border-t border-gray-100 pt-3 flex justify-between items-center text-sm font-medium text-gray-500">
                        <span className="bg-gray-100 px-3 py-1 rounded-full text-gray-600">Assigned to: {item.assigned}</span>
                        <Check size={20} className="text-gray-400" />
                    </div>
                </div>
             ))}
          </div>
        </div>

      </div>

      {/* AI Modal */}
      {showAIModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-cream rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-6 bg-gradient-to-r from-purple-100 to-indigo-100 border-b border-white/50 flex justify-between items-center">
               <h3 className="text-xl font-extrabold text-[#3D405B] flex items-center gap-2">
                 <Sparkles className="text-purple-500" /> Generate Ideas
               </h3>
               <button onClick={() => setShowAIModal(false)} className="p-2 hover:bg-white/50 rounded-full transition-colors">
                 <X size={20} className="text-gray-500" />
               </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
               {!generatedIdeas.length && !loadingAI && (
                 <div className="text-center py-8">
                   <p className="text-gray-600 mb-6">Need inspiration for Peyton? Use Gemini AI to find the perfect gift.</p>
                   <button 
                    onClick={handleGenerateIdeas}
                    className="bg-black text-white px-8 py-3 rounded-full font-bold hover:bg-gray-800 transition-all flex items-center gap-2 mx-auto"
                   >
                     <Sparkles size={16} /> Magic Generate
                   </button>
                 </div>
               )}

               {loadingAI && (
                 <div className="text-center py-12">
                   <div className="animate-spin w-10 h-10 border-4 border-purple-200 border-t-purple-500 rounded-full mx-auto mb-4"></div>
                   <p className="text-purple-700 font-bold animate-pulse">Consulting the elves...</p>
                 </div>
               )}

               {generatedIdeas.length > 0 && (
                 <div className="space-y-3">
                   {generatedIdeas.map((idea, idx) => (
                     <div key={idx} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-4">
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-800">{idea.name}</h4>
                          <p className="text-xs text-gray-500 mt-1 mb-2">{idea.description}</p>
                          <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-md">{idea.estimatedPrice}</span>
                        </div>
                        <button 
                          onClick={() => acceptIdea(idea)}
                          className="self-center p-2 bg-salmon/10 text-salmon hover:bg-salmon hover:text-white rounded-full transition-colors"
                        >
                          <Plus size={20} />
                        </button>
                     </div>
                   ))}
                   <div className="text-center pt-4">
                      <button onClick={handleGenerateIdeas} className="text-sm font-bold text-gray-400 hover:text-gray-600">Try again</button>
                   </div>
                 </div>
               )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default SingleListView;