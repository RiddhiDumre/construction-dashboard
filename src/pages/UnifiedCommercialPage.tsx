// ============================================================
// PILLAR 4: COMMERCIAL REALIZATION & D4U SALES OPERATIONS
// Unified Seamless Architecture (Same Pattern as Quality Pillar):
// - Standalone Title Bar with breathing room
// - Distinct 3-Tab Pill Navigation (Revenue & Absorption, D4U Buyer Pipeline, Brokerage Payouts)
//   Active tab has dark blue pill with number-only notification
// - Seamless Shared Filtering across all tabs (City & Project state preserved)
// ============================================================

import React, { useState, useEffect, useMemo } from 'react';
import {
  Building2, FileCheck, DollarSign
} from 'lucide-react';
import clsx from 'clsx';
import { useApp } from '../store/appStore';
import { CommercialUnitsPage } from './CommercialUnitsPage';
import { ComplianceAndCPPage } from './ComplianceAndCPPage';
import { CP_PAYOUTS, D4U_ENQUIRIES, PROJECTS } from '../data/seedData';
import { isProjectInCity } from '../data/calculations';

export type CommercialSubTab = 'revenue' | 'd4u' | 'payouts';

export function UnifiedCommercialPage() {
  const { state, selectProject } = useApp();
  const [activeSubTab, setActiveSubTab] = useState<CommercialSubTab>('revenue');

  // Synchronized Shared Filter State across all commercial tabs
  const defaultProjectId = state.selectedProjectId || 'ALL';
  const [selectedProjectId, setSelectedProjectId] = useState<string>(defaultProjectId);

  const [selectedCity, setSelectedCity] = useState<string>(() => {
    if (!defaultProjectId || defaultProjectId === 'ALL') return 'All Locations';
    const proj = PROJECTS.find(p => p.id === defaultProjectId);
    if (!proj) return 'All Locations';
    return ['Mumbai', 'Navi Mumbai', 'Thane'].includes(proj.city) ? 'Mumbai' : proj.city;
  });

  // Sync when state.selectedProjectId changes externally
  useEffect(() => {
    if (state.selectedProjectId && state.selectedProjectId !== selectedProjectId) {
      setSelectedProjectId(state.selectedProjectId);
      const proj = PROJECTS.find(p => p.id === state.selectedProjectId);
      if (proj) {
        setSelectedCity(['Mumbai', 'Navi Mumbai', 'Thane'].includes(proj.city) ? 'Mumbai' : proj.city);
      }
    }
  }, [state.selectedProjectId]);

  // Handle City Change: Always default to ALL projects in that city/area
  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    setSelectedProjectId('ALL');
    selectProject(null);
  };

  // Handle Project Change: If 'ALL' is selected, preserve the current city
  const handleProjectChange = (projectId: string) => {
    setSelectedProjectId(projectId);
    if (projectId === 'ALL') {
      selectProject(null);
    } else {
      const proj = PROJECTS.find(p => p.id === projectId);
      if (proj) {
        setSelectedCity(isProjectInCity(proj.city, 'Mumbai') ? 'Mumbai' : proj.city);
        selectProject(projectId);
      }
    }
  };

  // Notification Counts (Number-only badges)
  const totalEnquiries = D4U_ENQUIRIES.length;
  const pendingPayoutsCount = useMemo(
    () => CP_PAYOUTS.filter(c => c.status !== 'Payment Completed').length,
    []
  );

  return (
    <div className="space-y-5 pb-12 animate-in fade-in duration-200">
      {/* ============================================================
          PAGE TITLE BAR (STANDALONE, CLEAN, BREATHING ROOM)
          ============================================================ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#17191D]">
            Commercial
          </h1>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Portfolio commercial realization, inventory absorption, and buyer pipeline
          </p>
        </div>
      </div>

      {/* ============================================================
          SEPARATE 3-TAB PILL NAVIGATION SECTION BELOW TITLE
          - Selected tab has dark blue pill with white text
          - Section names only (no verbose explanations)
          - Number-only notifications with appropriate colors
          ============================================================ */}
      <div className="flex items-center gap-2 border-b border-[#E5E7EB] pb-3 overflow-x-auto scrollbar-none">
        {/* Tab 1: Revenue & Absorption */}
        <button
          onClick={() => setActiveSubTab('revenue')}
          className={clsx(
            'flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all shrink-0',
            activeSubTab === 'revenue'
              ? 'bg-[#1E3A8A] text-white shadow-sm ring-2 ring-[#1E3A8A]/20'
              : 'bg-white text-slate-700 border border-[#E5E7EB] hover:bg-slate-100'
          )}
        >
          <Building2 size={15} />
          <span>Revenue & Absorption</span>
          <span className={clsx(
            'px-2 py-0.5 rounded-full text-xs font-bold tabular-nums',
            activeSubTab === 'revenue' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
          )}>
            {PROJECTS.length}
          </span>
        </button>

        {/* Tab 2: D4U Buyer Pipeline */}
        <button
          onClick={() => setActiveSubTab('d4u')}
          className={clsx(
            'flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all shrink-0',
            activeSubTab === 'd4u'
              ? 'bg-[#1E3A8A] text-white shadow-sm ring-2 ring-[#1E3A8A]/20'
              : 'bg-white text-slate-700 border border-[#E5E7EB] hover:bg-slate-100'
          )}
        >
          <FileCheck size={15} />
          <span>D4U Buyer Pipeline</span>
          <span className={clsx(
            'px-2 py-0.5 rounded-full text-xs font-bold tabular-nums',
            activeSubTab === 'd4u' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
          )}>
            {totalEnquiries}
          </span>
        </button>

        {/* Tab 3: Brokerage Payouts */}
        <button
          onClick={() => setActiveSubTab('payouts')}
          className={clsx(
            'flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all shrink-0',
            activeSubTab === 'payouts'
              ? 'bg-[#1E3A8A] text-white shadow-sm ring-2 ring-[#1E3A8A]/20'
              : 'bg-white text-slate-700 border border-[#E5E7EB] hover:bg-slate-100'
          )}
        >
          <DollarSign size={15} />
          <span>Brokerage Payouts</span>
          <span className="px-2 py-0.5 rounded-full text-xs font-bold tabular-nums bg-[#D97706] text-white shadow-2xs">
            {pendingPayoutsCount}
          </span>
        </button>
      </div>

      {/* ============================================================
          CONTENT VIEW (SEAMLESS FILTERING PASSED TO SUB-VIEWS)
          ============================================================ */}
      <div className="transition-all duration-150">
        {activeSubTab === 'revenue' && (
          <CommercialUnitsPage
            initialSubTab="inventory"
            hideHeaderSwitcher={true}
            selectedCity={selectedCity}
            selectedProjectId={selectedProjectId}
            onCityChange={handleCityChange}
            onProjectChange={handleProjectChange}
          />
        )}
        {activeSubTab === 'd4u' && (
          <CommercialUnitsPage
            initialSubTab="d4u-workflow"
            hideHeaderSwitcher={true}
            selectedCity={selectedCity}
            selectedProjectId={selectedProjectId}
            onCityChange={handleCityChange}
            onProjectChange={handleProjectChange}
          />
        )}
        {activeSubTab === 'payouts' && (
          <ComplianceAndCPPage
            initialTab="cp"
            hideHeaderSwitcher={true}
            selectedCity={selectedCity}
            selectedProjectId={selectedProjectId}
            onCityChange={handleCityChange}
            onProjectChange={handleProjectChange}
          />
        )}
      </div>
    </div>
  );
}
