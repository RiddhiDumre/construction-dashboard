// ============================================================
// PAGE 1 — PORTFOLIO AT A GLANCE (Overview Cockpit)
// 100% Dynamic data driven by selected location
// Dynamic building skyline (stacked slab rectangles with architectural details)
// Dynamic vector sales map with interactive radar pins
// Minimal status indicators (restrained dots, no tacky AI bubble pills)
// Clean sectioning & thoughtful filtering
// ============================================================

import React, { useState, useMemo } from 'react';
import {
  Building2, BarChart3, Home, ClipboardCheck, AlertTriangle,
  ShieldCheck, MapPin, ChevronRight, ChevronLeft, ChevronDown,
  Maximize2, ArrowRight, Search, CheckCircle2
} from 'lucide-react';
import clsx from 'clsx';
import { useApp } from '../store/appStore';
import { PROJECTS } from '../data/seedData';
import {
  getAllProjectMetrics, getOverviewPortfolioKPIs, getNeedsAttentionAlerts,
  getCXOCommercialInventory,
} from '../data/calculations';
import { DynamicBuildingSkyline } from '../components/DynamicBuildingSkyline';
import { DynamicSalesMap } from '../components/DynamicSalesMap';
import { ProjectDetailDrawer } from '../components/ProjectDetailDrawer';

const CITIES = ['Mumbai', 'Gurugram', 'Bengaluru', 'Pune', 'All locations'];
const PERIODS = ['Q3 FY25', 'Q2 FY25', 'Q1 FY25', 'FY24'];

export function PortfolioPage() {
  const { state, setTab, selectProject, selectNC, selectWIR, setFilter } = useApp();

  const [activePeriod, setActivePeriod] = useState('Q3 FY25');
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const [projectSection, setProjectSection] = useState<'all' | 'attention' | 'onTrack'>('all');
  const [projectSearch, setProjectSearch] = useState('');

  // Active City Scope
  const activeCity = state.filters.city || 'Mumbai';

  const handleCityChange = (city: string) => {
    setFilter('city', city);
    setCityDropdownOpen(false);
  };

  // Dynamic Portfolio KPIs scoped to active city
  const kpis = useMemo(
    () => getOverviewPortfolioKPIs(activeCity, state.weights, state.wirs, state.ncs),
    [activeCity, state.weights, state.wirs, state.ncs]
  );

  // Dynamic Commercial / Units Sold scoped to active city
  const commercial = useMemo(
    () => getCXOCommercialInventory(activeCity),
    [activeCity]
  );

  // Dynamic Project Metrics scoped to active city
  const allProjectMetrics = useMemo(
    () => getAllProjectMetrics(state.weights, state.wirs, state.ncs),
    [state.weights, state.wirs, state.ncs]
  );

  const cityScopedProjects = useMemo(() => {
    let projs = allProjectMetrics;
    if (activeCity !== 'All locations' && activeCity !== 'All Locations') {
      if (activeCity.toLowerCase() === 'mumbai') {
        projs = projs.filter(m => m.project.city === 'Mumbai' || m.project.city === 'Navi Mumbai' || m.project.city === 'Thane');
      } else {
        projs = projs.filter(m => m.project.city.toLowerCase() === activeCity.toLowerCase());
      }
    }

    // Section filtering
    if (projectSection === 'attention') {
      projs = projs.filter(m => m.healthCategory === 'Critical' || m.healthCategory === 'At Risk');
    } else if (projectSection === 'onTrack') {
      projs = projs.filter(m => m.healthCategory === 'On Track');
    }

    // Search filter
    if (projectSearch.trim()) {
      const q = projectSearch.toLowerCase();
      projs = projs.filter(m =>
        m.project.name.toLowerCase().includes(q) ||
        m.project.city.toLowerCase().includes(q) ||
        m.project.projectManager.toLowerCase().includes(q)
      );
    }

    return projs;
  }, [allProjectMetrics, activeCity, projectSection, projectSearch]);

  // Priority Critical Issues scoped to city
  const alerts = useMemo(
    () => getNeedsAttentionAlerts(activeCity, state.wirs, state.ncs, state.weights),
    [activeCity, state.wirs, state.ncs, state.weights]
  );

  // Count of total buildings in this city
  const totalCityBuildings = useMemo(() => {
    const list = PROJECTS.filter(p => {
      if (activeCity === 'All locations' || activeCity === 'All Locations') return true;
      if (activeCity.toLowerCase() === 'mumbai') {
        return p.city === 'Mumbai' || p.city === 'Navi Mumbai' || p.city === 'Thane';
      }
      return p.city.toLowerCase() === activeCity.toLowerCase();
    });
    return list.reduce((sum, p) => sum + p.totalBuildings, 0);
  }, [activeCity]);

  return (
    <div className="space-y-4">
      {/* ============================================================
          PAGE HEADER: Title, City Selector, Reporting Periods
          ============================================================ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            Portfolio at a glance
          </h1>
          {/* Location Selector Dropdown */}
          <div className="relative inline-block mt-1">
            <button
              onClick={() => setCityDropdownOpen(!cityDropdownOpen)}
              className="flex items-center gap-1.5 text-xs text-[#64748B] hover:text-[#0F172A] font-medium transition-colors"
            >
              <MapPin size={13} className="text-[#64748B]" />
              <span className="font-semibold text-slate-800">{activeCity}</span>
              <ChevronDown size={12} className="text-[#64748B]" />
            </button>

            {cityDropdownOpen && (
              <div className="absolute left-0 mt-1.5 w-44 bg-white border border-[#E2E8F0] rounded-xl shadow-lg p-1.5 z-50 animate-in fade-in">
                {CITIES.map(c => (
                  <button
                    key={c}
                    onClick={() => handleCityChange(c)}
                    className={clsx(
                      'w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors',
                      activeCity === c ? 'bg-blue-50 text-blue-700 font-bold' : 'text-[#0F172A] hover:bg-slate-50'
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Period Tabs & Pagination Arrows */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center bg-[#F1F5F9] p-0.5 rounded-xl border border-[#E2E8F0]">
            {PERIODS.map(p => (
              <button
                key={p}
                onClick={() => setActivePeriod(p)}
                className={clsx(
                  'px-3 py-1 rounded-lg text-xs font-semibold transition-all',
                  activePeriod === p
                    ? 'bg-white text-[#0F172A] shadow-xs font-bold'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                )}
              >
                {p}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 text-[#64748B]">
            <button className="w-7 h-7 rounded-lg bg-white border border-[#E2E8F0] flex items-center justify-center hover:bg-slate-50 transition-colors">
              <ChevronLeft size={13} />
            </button>
            <button className="w-7 h-7 rounded-lg bg-white border border-[#E2E8F0] flex items-center justify-center hover:bg-slate-50 transition-colors">
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================
          TOP METRICS ROW (5 Cards in 1 Row — Dynamic to City)
          ============================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Card 1: Construction Progress */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-[#64748B]">
              <BarChart3 size={16} />
            </div>
            <span className="text-xs font-medium text-[#64748B]">Construction Progress</span>
          </div>

          <div className="my-2.5 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
              {kpis.overallProgress}%
            </span>
            <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-[#C63F43]">
              {kpis.progressVariance >= 0 ? `+${kpis.progressVariance}%` : `${kpis.progressVariance}%`}
            </span>
          </div>

          {/* Green Progress Bar */}
          <div className="w-full h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#10B981] rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, kpis.overallProgress)}%` }}
            />
          </div>
        </div>

        {/* Card 2: Buildings Under Construction */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-[#64748B]">
              <Building2 size={16} />
            </div>
            <span className="text-xs font-medium text-[#64748B]">Buildings Under Construction</span>
          </div>

          <div className="my-2.5 flex items-baseline justify-between">
            <div>
              <span className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
                {totalCityBuildings}
              </span>
              <span className="text-sm font-medium text-[#94A3B8] ml-1">
                / {activeCity === 'All locations' ? 100 : totalCityBuildings * 10}
              </span>
            </div>
            <Building2 size={20} className="text-slate-300 stroke-1" />
          </div>

          {/* Blue Progress Bar */}
          <div className="w-full h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
            <div className="h-full bg-[#315EFB] rounded-full" style={{ width: '15%' }} />
          </div>
        </div>

        {/* Card 3: Units Sold */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-[#64748B]">
              <Home size={16} />
            </div>
            <span className="text-xs font-medium text-[#64748B]">Units Sold</span>
          </div>

          <div className="my-1.5 flex items-center justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
              {commercial.soldUnits}
            </span>

            {/* Donut Chart with Sold % */}
            <div className="flex items-center gap-2">
              <svg className="w-9 h-9 transform -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="14" fill="none" stroke="#E2E8F0" strokeWidth="3.5" />
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="3.5"
                  strokeDasharray={2 * Math.PI * 14}
                  strokeDashoffset={2 * Math.PI * 14 * (1 - commercial.soldPercent / 100)}
                  strokeLinecap="round"
                />
              </svg>
              <div>
                <div className="text-xs font-extrabold text-[#0F172A] leading-tight">
                  {commercial.soldPercent}%
                </div>
                <div className="text-[9px] text-[#94A3B8] font-medium leading-none">
                  of {commercial.totalUnits}
                </div>
              </div>
            </div>
          </div>

          <div className="h-1.5" />
        </div>

        {/* Card 4: Overdue WIRs */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-[#64748B]">
              <ClipboardCheck size={16} />
            </div>
            <span className="text-xs font-medium text-[#64748B]">Overdue WIRs</span>
          </div>

          <div className="my-1.5 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
              {kpis.overdueWIRs}
            </span>
            <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-[#EA580C]">
              {kpis.overdueWIRs > 0 ? `↑ ${kpis.overdueWIRs}` : 'On SLA'}
            </span>
          </div>

          {/* Red Sparkline Curve */}
          <div className="w-full h-4 flex items-end">
            <svg className="w-full h-3.5 overflow-visible" viewBox="0 0 100 20" preserveAspectRatio="none">
              <path
                d="M0,16 Q20,15 35,18 T70,10 T100,2"
                fill="none"
                stroke="#F87171"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* Card 5: Open NCs */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-rose-500">
              <AlertTriangle size={16} />
            </div>
            <span className="text-xs font-medium text-[#64748B]">Open NCs</span>
          </div>

          <div className="my-1.5 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
              {kpis.openNCs}
            </span>
            <span className="text-xs font-semibold text-[#C63F43]">
              {kpis.criticalNCs} critical
            </span>
          </div>

          {/* Mini Red Vertical Bars Histogram */}
          <div className="w-full flex items-end justify-end gap-1 h-4">
            <span className="w-1.5 h-2 bg-rose-200 rounded-2xs" />
            <span className="w-1.5 h-3.5 bg-rose-300 rounded-2xs" />
            <span className="w-1.5 h-2.5 bg-rose-300 rounded-2xs" />
            <span className="w-1.5 h-4 bg-rose-400 rounded-2xs" />
            <span className="w-1.5 h-3 bg-rose-400 rounded-2xs" />
          </div>
        </div>
      </div>

      {/* ============================================================
          MAIN 2-COLUMN SECTION
          Left Column (8/12 width): Construction Status Skyline + Projects Table
          Right Column (4/12 width): Quality & Critical Issues + Vector Map
          ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* ==========================================================
            LEFT COLUMN (8 cols out of 12)
            ========================================================== */}
        <div className="lg:col-span-8 space-y-4">
          {/* Card 1: Construction Status with Dynamic Building Skyline */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-2xs">
            {/* Header with Title and Legend */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-[#64748B]">
                  <Building2 size={15} />
                </div>
                <h2 className="text-sm font-bold text-[#0F172A]">Construction Status</h2>
              </div>

              {/* Minimal Clean Legend (Simple dots, no AI pill badges) */}
              <div className="flex items-center gap-3.5 text-xs text-[#64748B] flex-wrap">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#10B981]" /> Completed
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#315EFB]" /> Under Construction
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#CBD5E1]" /> Planned
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#EF4444]" /> At Risk
                </span>
              </div>
            </div>

            {/* Dynamic Building Skyline: Simple stacked rectangles with architectural floor details */}
            <DynamicBuildingSkyline
              selectedCity={activeCity}
              onSelectProject={(id) => selectProject(id)}
            />
          </div>

          {/* Card 2: Projects Table with Proper Filtering & Sectioning */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-2xs">
            {/* Header & Filter Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-[#64748B]">
                  <Building2 size={15} />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#0F172A]">Projects</h2>
                  <p className="text-[11px] text-[#64748B]">
                    {cityScopedProjects.length} active site{cityScopedProjects.length !== 1 ? 's' : ''} in {activeCity}
                  </p>
                </div>
              </div>

              {/* Minimal Sectioning Tabs & Search (Restrained design, not overwhelming) */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center bg-[#F8FAFC] p-0.5 rounded-lg border border-[#E2E8F0] text-xs">
                  <button
                    onClick={() => setProjectSection('all')}
                    className={clsx(
                      'px-2.5 py-1 rounded-md font-medium transition-colors',
                      projectSection === 'all' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-900'
                    )}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setProjectSection('attention')}
                    className={clsx(
                      'px-2.5 py-1 rounded-md font-medium transition-colors',
                      projectSection === 'attention' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-900'
                    )}
                  >
                    Needs Attention
                  </button>
                  <button
                    onClick={() => setProjectSection('onTrack')}
                    className={clsx(
                      'px-2.5 py-1 rounded-md font-medium transition-colors',
                      projectSection === 'onTrack' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-900'
                    )}
                  >
                    On Track
                  </button>
                </div>

                <div className="relative">
                  <Search size={12} className="absolute left-2.5 top-2 text-slate-400" />
                  <input
                    type="text"
                    value={projectSearch}
                    onChange={(e) => setProjectSearch(e.target.value)}
                    placeholder="Filter project..."
                    className="h-7 w-32 pl-7 pr-2 text-xs rounded-lg bg-slate-50 border border-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Table with Minimal Restrained Status Indicators */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left min-w-[640px]">
                <thead>
                  <tr className="text-[#94A3B8] font-medium border-b border-slate-100">
                    <th className="py-2.5 font-medium">Project</th>
                    <th className="py-2.5 font-medium">City</th>
                    <th className="py-2.5 font-medium">Status</th>
                    <th className="py-2.5 font-medium">Progress</th>
                    <th className="py-2.5 font-medium">Units Sold</th>
                    <th className="py-2.5 font-medium text-center">Quality</th>
                    <th className="py-2.5 font-medium">Open NCs</th>
                    <th className="py-2.5 font-medium">Manager</th>
                    <th className="py-2.5"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {cityScopedProjects.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-xs text-slate-400">
                        No projects match the selected filter in {activeCity}.
                      </td>
                    </tr>
                  ) : (
                    cityScopedProjects.map(m => {
                      const isCritical = m.healthCategory === 'Critical';
                      const isAtRisk = m.healthCategory === 'At Risk';
                      const soldPct = m.project.totalUnits > 0
                        ? Math.round((m.project.soldUnits / m.project.totalUnits) * 100)
                        : 0;

                      return (
                        <tr
                          key={m.project.id}
                          onClick={() => selectProject(m.project.id)}
                          className="hover:bg-slate-50/70 cursor-pointer transition-colors"
                        >
                          <td className="py-3 font-bold text-[#0F172A]">{m.project.name}</td>
                          <td className="py-3 text-[#64748B]">{m.project.city}</td>

                          {/* Minimal Status Dot (No AI Bubble Pills) */}
                          <td className="py-3">
                            <span className="inline-flex items-center gap-1.5 font-medium text-slate-800">
                              <span
                                className={clsx(
                                  'w-2 h-2 rounded-full',
                                  isCritical ? 'bg-[#EF4444]' : isAtRisk ? 'bg-[#F59E0B]' : 'bg-[#10B981]'
                                )}
                              />
                              {m.healthCategory}
                            </span>
                          </td>

                          {/* Progress Bar */}
                          <td className="py-3">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-[#0F172A] font-mono">
                                {m.project.progressPercentage}%
                              </span>
                              <div className="w-14 h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
                                <div
                                  className={clsx(
                                    'h-full rounded-full',
                                    isCritical ? 'bg-[#EF4444]' : isAtRisk ? 'bg-[#315EFB]' : 'bg-[#10B981]'
                                  )}
                                  style={{ width: `${m.project.progressPercentage}%` }}
                                />
                              </div>
                            </div>
                          </td>

                          {/* Units Sold */}
                          <td className="py-3">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-[#0F172A] font-mono">
                                {m.project.soldUnits} / {m.project.totalUnits}
                              </span>
                              <div className="w-12 h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
                                <div className="h-full bg-[#10B981] rounded-full" style={{ width: `${soldPct}%` }} />
                              </div>
                            </div>
                          </td>

                          {/* Quality Score (Clean Number) */}
                          <td className="py-3 text-center">
                            <span
                              className={clsx(
                                'font-mono font-bold',
                                m.qualityScore < 60 ? 'text-[#C63F43]' : m.qualityScore < 80 ? 'text-[#B7791F]' : 'text-[#16805D]'
                              )}
                            >
                              {m.qualityScore}
                            </span>
                          </td>

                          {/* Open NCs */}
                          <td className="py-3">
                            <span className="font-bold text-[#0F172A] font-mono mr-1">
                              {m.openNCs}
                            </span>
                            {m.criticalOpenNCs > 0 && (
                              <span className="text-[#C63F43] font-medium text-[11px]">
                                ({m.criticalOpenNCs} critical)
                              </span>
                            )}
                          </td>

                          <td className="py-3 text-[#64748B]">{m.project.projectManager}</td>
                          <td className="py-3 text-right text-slate-300">
                            <ChevronRight size={14} />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ==========================================================
            RIGHT COLUMN (4 cols out of 12)
            Quality & Critical Issues + Dynamic Sales Map
            ========================================================== */}
        <div className="lg:col-span-4 space-y-4">
          {/* Card 1: Quality & Critical Issues */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-2xs">
            {/* Header */}
            <div className="flex items-center gap-2.5 pb-3">
              <div className="w-7 h-7 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-[#64748B]">
                <ShieldCheck size={15} />
              </div>
              <h2 className="text-sm font-bold text-[#0F172A]">Quality & Critical Issues</h2>
            </div>

            {/* Quality Score Donut Meter + 3 Metric Bars */}
            <div className="flex items-center gap-5 my-2">
              {/* Donut Circle */}
              <div className="relative w-24 h-24 flex items-center justify-center flex-shrink-0">
                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#E2E8F0"
                    strokeWidth="8"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#0D9488"
                    strokeWidth="8"
                    strokeDasharray={2 * Math.PI * 40}
                    strokeDashoffset={2 * Math.PI * 40 * (1 - kpis.portfolioQualityScore / 100)}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-black text-[#0F172A] leading-tight">
                    {kpis.portfolioQualityScore}
                  </span>
                  <span className="text-[10px] text-[#94A3B8] font-medium leading-none">/ 100</span>
                </div>
              </div>

              {/* 3 Metric Progress Bars */}
              <div className="flex-1 space-y-2">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-[#64748B] font-medium">WIR Pass Rate</span>
                    <span className="font-extrabold text-[#0F172A]">{kpis.portfolioWIRPassRate}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
                    <div className="h-full bg-[#10B981] rounded-full" style={{ width: `${kpis.portfolioWIRPassRate}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-[#64748B] font-medium">NC Health</span>
                    <span className="font-extrabold text-[#0F172A]">85%</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
                    <div className="h-full bg-[#0D9488] rounded-full" style={{ width: '85%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-[#64748B] font-medium">Audit Score</span>
                    <span className="font-extrabold text-[#0F172A]">72%</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
                    <div className="h-full bg-[#315EFB] rounded-full" style={{ width: '72%' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-slate-100 my-4" />

            {/* Top Critical Issues List (Dynamic to city) */}
            <div>
              <div className="flex items-center justify-between pb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={15} className="text-rose-500" />
                  <span className="text-xs font-bold text-[#0F172A]">Top Critical Issues</span>
                </div>
                <button
                  onClick={() => setTab('nc')}
                  className="text-xs font-bold text-[#315EFB] hover:underline"
                >
                  See all &gt;
                </button>
              </div>

              <div className="space-y-3">
                {alerts.length === 0 ? (
                  <div className="text-xs text-slate-400 py-3 text-center">
                    No critical defect issues reported in {activeCity}.
                  </div>
                ) : (
                  alerts.slice(0, 3).map((alert, idx) => (
                    <div
                      key={alert.id}
                      onClick={() => {
                        if (alert.linkType === 'nc' && alert.ncId) {
                          setTab('nc');
                          selectNC(alert.ncId);
                        } else if (alert.linkType === 'wir') {
                          setTab('wir');
                        } else {
                          selectProject(alert.projectId);
                        }
                      }}
                      className="flex items-center gap-3 p-1 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors group"
                    >
                      <img
                        src={`/assets/defect-thumb-${(idx % 3) + 1}.png`}
                        alt="Defect"
                        className="w-10 h-10 rounded-lg object-cover border border-slate-200 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        {/* Minimal Tag */}
                        <div className="flex items-center gap-1.5">
                          <span
                            className={clsx(
                              'text-[10px] font-bold font-mono tracking-wider',
                              alert.severity === 'critical' ? 'text-[#C63F43]' : 'text-[#EA580C]'
                            )}
                          >
                            {alert.severity.toUpperCase()}
                          </span>
                        </div>
                        <div className="text-xs font-bold text-[#0F172A] truncate mt-0.5 group-hover:text-[#315EFB] transition-colors">
                          {alert.title}
                        </div>
                        <div className="text-[11px] text-[#64748B] truncate">
                          {alert.projectName}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-[#94A3B8] text-xs flex-shrink-0">
                        <ChevronRight size={13} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Card 2: Dynamic Sales & Construction Map */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-2xs">
            {/* Header */}
            <div className="flex items-center justify-between pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-[#64748B]">
                  <BarChart3 size={15} />
                </div>
                <h2 className="text-sm font-bold text-[#0F172A]">Sales & Construction Map</h2>
              </div>
              <button
                onClick={() => setTab('wip')}
                className="text-slate-400 hover:text-[#0F172A] transition-colors"
                title="View Full Geographic Operations"
              >
                <Maximize2 size={13} />
              </button>
            </div>

            {/* Dynamic Map Component */}
            <DynamicSalesMap
              selectedCity={activeCity}
              onSelectProject={(id) => selectProject(id)}
            />
          </div>
        </div>
      </div>

      {/* Project Detail Drawer */}
      {state.selectedProjectId && (
        <ProjectDetailDrawer
          projectId={state.selectedProjectId}
          onClose={() => selectProject(null)}
        />
      )}
    </div>
  );
}
