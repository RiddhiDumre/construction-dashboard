import React from 'react';
import { AppProvider, useApp } from './store/appStore';
import { AppShell } from './components/AppShell';
import { PortfolioPage } from './pages/PortfolioPage';
import { WIPPage } from './pages/WIPPage';
import { UnifiedQualityPage } from './pages/UnifiedQualityPage';
import { UnifiedCommercialPage } from './pages/UnifiedCommercialPage';

function AppContent() {
  const { state } = useApp();

  const isOverview = state.activeTab === 'overview' || state.activeTab === 'portfolio';
  const isWIP = state.activeTab === 'wip';
  const isQuality = ['quality', 'nc', 'wir', 'compliance', 'contractors'].includes(state.activeTab);
  const isCommercial = ['commercial', 'sales'].includes(state.activeTab);

  return (
    <AppShell>
      {isOverview && <PortfolioPage />}
      {isWIP && <WIPPage />}
      {isQuality && <UnifiedQualityPage />}
      {isCommercial && <UnifiedCommercialPage />}
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
