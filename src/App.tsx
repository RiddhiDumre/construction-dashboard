import React from 'react';
import { AppProvider, useApp } from './store/appStore';
import { AppShell } from './components/AppShell';
import { PortfolioPage } from './pages/PortfolioPage';
import { WIPPage } from './pages/WIPPage';
import { WIRPage } from './pages/WIRPage';
import { NCPage } from './pages/NCPage';
import { QualityScorePage } from './pages/QualityScorePage';
import { ContractorsPage } from './pages/ContractorsPage';
import { CommercialUnitsPage } from './pages/CommercialUnitsPage';

function AppContent() {
  const { state } = useApp();

  return (
    <AppShell>
      {(state.activeTab === 'overview' || state.activeTab === 'portfolio') && <PortfolioPage />}
      {state.activeTab === 'wip' && <WIPPage />}
      {state.activeTab === 'sales' && <CommercialUnitsPage />}
      {state.activeTab === 'wir' && <WIRPage />}
      {state.activeTab === 'quality' && <QualityScorePage />}
      {state.activeTab === 'nc' && <NCPage />}
      {state.activeTab === 'contractors' && <ContractorsPage />}
    </AppShell>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
