import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import Dashboard from './components/Dashboard/Dashboard';
import Workflows from './components/Workflows/Workflows';
import DataSources from './components/DataSources/DataSources';
import Alerts from './components/Alerts/Alerts';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'workflows':
        return <Workflows />;
      case 'data-sources':
        return <DataSources />;
      case 'alerts':
        return <Alerts />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <AppProvider>
      <div className="flex h-screen bg-dark-bg text-dark-text">
        <Sidebar currentView={currentView} onViewChange={setCurrentView} />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          
          <main className="flex-1 overflow-auto">
            <div className="p-4 md:p-6 max-w-7xl mx-auto">
              {renderContent()}
            </div>
          </main>
        </div>
      </div>
    </AppProvider>
  );
}

export default App;