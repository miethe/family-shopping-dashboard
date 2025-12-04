import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import AllLists from './components/AllLists';
import SingleListView from './components/SingleListView';
import { ViewState, Person } from './types';

const App: React.FC = () => {
  const [currentView, setView] = useState<ViewState>(ViewState.DASHBOARD);

  // Mock Global State for People
  const people: Person[] = [
    { id: '1', name: 'Jaden', avatar: 'https://picsum.photos/seed/jaden/100', colorRing: '#AEC3B0' },
    { id: '2', name: 'Peyton', avatar: 'https://picsum.photos/seed/peyton/100', colorRing: '#E07A5F' },
    { id: '3', name: 'Alexa', avatar: 'https://picsum.photos/seed/alexa/100', colorRing: '#DDBEA9' },
    { id: '4', name: 'Oirites', avatar: 'https://picsum.photos/seed/oirites/100', colorRing: '#81B29A' },
  ];

  const renderView = () => {
    switch (currentView) {
      case ViewState.DASHBOARD:
        return <Dashboard setView={setView} people={people} />;
      case ViewState.ALL_LISTS:
        return <AllLists setView={setView} />;
      case ViewState.SINGLE_LIST:
        return <SingleListView onBack={() => setView(ViewState.ALL_LISTS)} />;
      default:
        return <Dashboard setView={setView} people={people} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-cream font-sans text-charcoal">
      <Sidebar currentView={currentView} setView={setView} />
      
      <main className="flex-1 ml-20 lg:ml-24 relative">
        {/* Decorative Background Blobs */}
        <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-orange-200/20 rounded-full blur-[100px]" />
          <div className="absolute bottom-[-10%] right-[10%] w-[600px] h-[600px] bg-green-200/20 rounded-full blur-[100px]" />
        </div>

        {renderView()}
      </main>
    </div>
  );
};

export default App;