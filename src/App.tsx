import React from 'react';
import { AppProvider, useApp } from './store/appStore';
import { AppShell } from './components/AppShell';
import { PortfolioPage } from './pages/PortfolioPage';
import { WIRPage } from './pages/WIRPage';
import { NCPage } from './pages/NCPage';
import { QualityScorePage } from './pages/QualityScorePage';
import { ContractorsPage } from './pages/ContractorsPage';

function AppContent() {
  const { state } = useApp();

  return (
    <AppShell>
      {state.activeTab === 'portfolio' && <PortfolioPage />}
      {state.activeTab === 'wir' && <WIRPage />}
      {state.activeTab === 'nc' && <NCPage />}
      {state.activeTab === 'quality' && <QualityScorePage />}
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
