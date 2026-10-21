// ============================================================
// PILLAR 3: QUALITY ASSURANCE
// Unified Seamless Architecture:
// - Title stands alone with breathing room
// - Distinct 3-Tab Pill Navigation (Audits, Non-Compliance, Inspection Requests)
//   Active tab has dark blue pill with number-only notification
// - Seamless Shared Filtering across all 3 tabs (City & Project state preserved)
// ============================================================

import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldAlert, Award, ClipboardCheck, SlidersHorizontal
} from 'lucide-react';
import clsx from 'clsx';
import { useApp } from '../store/appStore';
import { QualityScorePage } from './QualityScorePage';
import { NCPage } from './NCPage';
import { WIRPage } from './WIRPage';
import { PROJECTS } from '../data/seedData';
import { isProjectInCity } from '../data/calculations';

export type QualitySubTab = 'audits' | 'defects' | 'wirs';

export function UnifiedQualityPage() {
  const { state, setWeightsModalOpen, selectProject } = useApp();

  // Tab state (Defaults to Audits first!)
  const getSubTabFromActive = (): QualitySubTab => {
    if (state.activeTab === 'nc') return 'defects';
    if (state.activeTab === 'wir') return 'wirs';
    return 'audits';
  };

  const [activeSubTab, setActiveSubTab] = useState<QualitySubTab>(getSubTabFromActive);

  // Synchronized Shared Filter State across all three tabs
  // Mandated by Section 7: Default to All Locations and All Projects for portfolio-first visibility
  const defaultProjectId = state.selectedProjectId || 'ALL';
  const [selectedProjectId, setSelectedProjectId] = useState<string>(defaultProjectId);

  const [selectedCity, setSelectedCity] = useState<string>(() => {
    if (!defaultProjectId || defaultProjectId === 'ALL') return 'All Locations';
    const proj = PROJECTS.find(p => p.id === defaultProjectId);
    if (!proj) return 'All Locations';
    return ['Mumbai', 'Navi Mumbai', 'Thane'].includes(proj.city) ? 'Mumbai' : proj.city;
  });

  // Sync when activeTab changes externally
  useEffect(() => {
    setActiveSubTab(getSubTabFromActive());
  }, [state.activeTab]);

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

  // Handle City Change: Always default to ALL projects in that city/area!
  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    setSelectedProjectId('ALL');
    selectProject(null);
  };

  // Handle Project Change: If 'ALL' is selected, preserve the current city!
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

  // Notification Counts
  const openCritCount = useMemo(
    () => state.ncs.filter(n => n.severity === 'Critical' && n.status !== 'Closed').length,
    [state.ncs]
  );

  const totalOpenNCs = useMemo(
    () => state.ncs.filter(n => n.status !== 'Closed').length,
    [state.ncs]
  );

  const slaBreachCount = useMemo(
    () => state.wirs.filter(w => w.slaBreach && w.status !== 'Approved').length,
    [state.wirs]
  );

  const pendingWIRs = useMemo(
    () => state.wirs.filter(w => w.status === 'Awaiting Review' || w.status === 'Submitted' || w.status === 'Resubmitted').length,
    [state.wirs]
  );

  return (
    <div className="space-y-5 pb-12 animate-in fade-in duration-200">
      {/* ============================================================
          PAGE TITLE BAR (STANDALONE, CLEAN, BREATHING ROOM)
          ============================================================ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#17191D]">
            Quality
          </h1>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Portfolio quality performance and open risks
          </p>
        </div>

        <button
          onClick={() => setWeightsModalOpen(true)}
          className="flex items-center gap-2 h-9 px-3.5 rounded-lg border border-[#E5E7EB] bg-white hover:bg-slate-50 text-xs font-semibold text-[#17191D] transition-colors shadow-2xs self-start sm:self-auto"
        >
          <SlidersHorizontal size={14} className="text-[#006B5B]" />
          <span>Configure Weights</span>
        </button>
      </div>

      {/* ============================================================
          SEPARATE 3-TAB PILL NAVIGATION SECTION BELOW TITLE
          - Selected tab has dark blue pill with white text
          - Section names only (no verbose explanations)
          - Number-only notifications with appropriate colors
          ============================================================ */}
      <div className="flex items-center gap-2 border-b border-[#E5E7EB] pb-3 overflow-x-auto scrollbar-none">
        {/* Tab 1: Audits (FIRST!) */}
        <button
          onClick={() => setActiveSubTab('audits')}
          className={clsx(
            'flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all',
            activeSubTab === 'audits'
              ? 'bg-[#1E3A8A] text-white shadow-sm ring-2 ring-[#1E3A8A]/20'
              : 'bg-white text-slate-700 border border-[#E5E7EB] hover:bg-slate-100'
          )}
        >
          <Award size={15} />
          <span>Audits</span>
          <span className={clsx(
            'px-2 py-0.5 rounded-full text-xs font-bold tabular-nums',
            activeSubTab === 'audits' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
          )}>
            12
          </span>
        </button>

        {/* Tab 2: Non-Compliance */}
        <button
          onClick={() => setActiveSubTab('defects')}
          className={clsx(
            'flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all',
            activeSubTab === 'defects'
              ? 'bg-[#1E3A8A] text-white shadow-sm ring-2 ring-[#1E3A8A]/20'
              : 'bg-white text-slate-700 border border-[#E5E7EB] hover:bg-slate-100'
          )}
        >
          <ShieldAlert size={15} />
          <span>Non-Compliance</span>
          <span className="px-2 py-0.5 rounded-full text-xs font-bold tabular-nums bg-[#DC2626] text-white shadow-2xs">
            {openCritCount > 0 ? openCritCount : totalOpenNCs}
          </span>
        </button>

        {/* Tab 3: Inspection Requests */}
        <button
          onClick={() => setActiveSubTab('wirs')}
          className={clsx(
            'flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all',
            activeSubTab === 'wirs'
              ? 'bg-[#1E3A8A] text-white shadow-sm ring-2 ring-[#1E3A8A]/20'
              : 'bg-white text-slate-700 border border-[#E5E7EB] hover:bg-slate-100'
          )}
        >
          <ClipboardCheck size={15} />
          <span>Inspection Requests</span>
          <span className={clsx(
            'px-2 py-0.5 rounded-full text-xs font-bold tabular-nums shadow-2xs',
            slaBreachCount > 0 ? 'bg-[#D97706] text-white' : 'bg-slate-100 text-slate-700'
          )}>
            {slaBreachCount > 0 ? slaBreachCount : pendingWIRs}
          </span>
        </button>
      </div>

      {/* ============================================================
          CONTENT VIEW (SEAMLESS FILTERING PASSED TO ALL 3 TABS)
          All three tabs have the exact same structure!
          ============================================================ */}
      <div className="transition-all duration-150">
        {activeSubTab === 'audits' && (
          <QualityScorePage
            selectedCity={selectedCity}
            selectedProjectId={selectedProjectId}
            onCityChange={handleCityChange}
            onProjectChange={handleProjectChange}
            onNavigateToTab={(tab) => setActiveSubTab(tab)}
          />
        )}
        {activeSubTab === 'defects' && (
          <NCPage
            isEmbedded={true}
            selectedCity={selectedCity}
            selectedProjectId={selectedProjectId}
            onCityChange={handleCityChange}
            onProjectChange={handleProjectChange}
          />
        )}
        {activeSubTab === 'wirs' && (
          <WIRPage
            isEmbedded={true}
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
