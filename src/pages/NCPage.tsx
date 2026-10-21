// ============================================================
// PILLAR 3B: NON-COMPLIANCE (NC) DEFECT INTELLIGENCE
// Clean, Standardized Architecture (Same Structure Across All 3 Tabs):
// 1. Side-by-side dropdown filter bar (City, Project, Category)
// 2. 6-Card Executive KPI Strip
// 3. Featured Dual-Gradient Defect Influx & Hold Area Chart
// 4. Critical Highlight Card (Positioned directly below the graph with photo proof)
// 5. Well-managed paginated records table (6 items per page)
// ============================================================

import React, { useState, useMemo, useEffect } from 'react';
import {
  ShieldAlert, AlertTriangle, CheckCircle2, Clock, Filter,
  Search, ArrowRight, ChevronRight, X, Camera, ExternalLink,
  Building2, HardHat, MapPin, Wrench, ChevronDown, ChevronLeft,
  Layers, PackageCheck, FileCheck, SlidersHorizontal, BarChart3, TrendingUp,
  AlertOctagon, Check, Calendar, RotateCcw
} from 'lucide-react';
import clsx from 'clsx';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend
} from 'recharts';
import { useApp } from '../store/appStore';
import { getNCSummaryMetrics, isProjectInCity } from '../data/calculations';
import {
  PROJECTS, CONTRACTORS, type NC, type NCStatus, type NCSeverity,
  type NCCategory
} from '../data/seedData';

const LOCALITY_MAP: Record<string, string> = {
  P001: 'Worli, Mumbai',
  P002: 'Hebbal, Bengaluru',
  P003: 'Kalyani Nagar, Pune',
  P004: 'Golf Course Rd, Gurugram',
  P005: 'CBD Belapur, Navi Mumbai',
  P006: 'Gachibowli, Hyderabad',
  P007: 'Ghodbunder, Thane',
};

const CITIES = ['All Locations', 'Mumbai', 'Thane', 'Navi Mumbai', 'Pune', 'Bengaluru', 'Gurugram', 'Hyderabad'];

const CATEGORIES: NCCategory[] = [
  'Material Quality',
  'Workmanship / Workforce',
  'Safety',
  'Regulatory / Approvals',
  'Process / Other',
];

// Monthly NC Trend Series (Target Max Ceiling vs Actual Open Defects)
const NC_TRAJECTORY_SERIES: Record<string, { month: string; targetMax: number; actualOpen: number; note?: string }[]> = {
  ALL: [
    { month: 'Apr', targetMax: 5, actualOpen: 4 },
    { month: 'May', targetMax: 5, actualOpen: 5 },
    { month: 'Jun', targetMax: 5, actualOpen: 7 },
    { month: 'Jul', targetMax: 5, actualOpen: 12, note: 'Riverstone & Meridian defects logged' },
    { month: 'Aug', targetMax: 5, actualOpen: 15 },
    { month: 'Sep', targetMax: 5, actualOpen: 18, note: 'Floor 05 cube test critical hold' },
  ],
  P004: [ // Riverstone Towers
    { month: 'Apr', targetMax: 3, actualOpen: 2 },
    { month: 'May', targetMax: 3, actualOpen: 3 },
    { month: 'Jun', targetMax: 3, actualOpen: 5 },
    { month: 'Jul', targetMax: 3, actualOpen: 8, note: 'Shear wall honeycombing' },
    { month: 'Aug', targetMax: 3, actualOpen: 11 },
    { month: 'Sep', targetMax: 3, actualOpen: 14, note: 'M35 cube compression test failure (18.2 MPa)' },
  ],
  P001: [ // Meridian Heights
    { month: 'Apr', targetMax: 3, actualOpen: 1 },
    { month: 'May', targetMax: 3, actualOpen: 2 },
    { month: 'Jun', targetMax: 3, actualOpen: 3 },
    { month: 'Jul', targetMax: 3, actualOpen: 4, note: 'Tower B shear wall NC-0003' },
    { month: 'Aug', targetMax: 3, actualOpen: 4 },
    { month: 'Sep', targetMax: 3, actualOpen: 5, note: 'Rebar tie spacing rectification' },
  ],
  P002: [ // Northgate Residences
    { month: 'Apr', targetMax: 3, actualOpen: 1 },
    { month: 'May', targetMax: 3, actualOpen: 1 },
    { month: 'Jun', targetMax: 3, actualOpen: 2 },
    { month: 'Jul', targetMax: 3, actualOpen: 2 },
    { month: 'Aug', targetMax: 3, actualOpen: 3 },
    { month: 'Sep', targetMax: 3, actualOpen: 2, note: 'Finishing snags rectified' },
  ],
  P003: [
    { month: 'Apr', targetMax: 3, actualOpen: 2 },
    { month: 'May', targetMax: 3, actualOpen: 3 },
    { month: 'Jun', targetMax: 3, actualOpen: 4 },
    { month: 'Jul', targetMax: 3, actualOpen: 5 },
    { month: 'Aug', targetMax: 3, actualOpen: 6 },
    { month: 'Sep', targetMax: 3, actualOpen: 6, note: 'Piling diameter deviation' },
  ],
  P005: [
    { month: 'Apr', targetMax: 3, actualOpen: 1 },
    { month: 'May', targetMax: 3, actualOpen: 1 },
    { month: 'Jun', targetMax: 3, actualOpen: 1 },
    { month: 'Jul', targetMax: 3, actualOpen: 2 },
    { month: 'Aug', targetMax: 3, actualOpen: 2 },
    { month: 'Sep', targetMax: 3, actualOpen: 2, note: 'All holds cleared' },
  ],
  P006: [
    { month: 'Apr', targetMax: 3, actualOpen: 2 },
    { month: 'May', targetMax: 3, actualOpen: 3 },
    { month: 'Jun', targetMax: 3, actualOpen: 3 },
    { month: 'Jul', targetMax: 3, actualOpen: 4 },
    { month: 'Aug', targetMax: 3, actualOpen: 5 },
    { month: 'Sep', targetMax: 3, actualOpen: 5 },
  ],
  P007: [
    { month: 'Apr', targetMax: 3, actualOpen: 1 },
    { month: 'May', targetMax: 3, actualOpen: 2 },
    { month: 'Jun', targetMax: 3, actualOpen: 2 },
    { month: 'Jul', targetMax: 3, actualOpen: 3 },
    { month: 'Aug', targetMax: 3, actualOpen: 3 },
    { month: 'Sep', targetMax: 3, actualOpen: 3 },
  ],
};

interface NCPageProps {
  isEmbedded?: boolean;
  selectedCity?: string;
  selectedProjectId?: string;
  onCityChange?: (city: string) => void;
  onProjectChange?: (projectId: string) => void;
}

export function NCPage({
  isEmbedded = false,
  selectedCity = 'All Locations',
  selectedProjectId = PROJECTS[0].id,
  onCityChange,
  onProjectChange,
}: NCPageProps) {
  const { state, setFilter, selectNC, selectProject, updateNCStatus, setTab } = useApp();

  const [localSearch, setLocalSearch] = useState(state.filters.search || '');
  const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('All Severities');
  const [selectedStatus, setSelectedStatus] = useState<string>('All Statuses');
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [chartMode, setChartMode] = useState<'breakdown' | 'trend'>('breakdown');

  // Pagination (6 items per page)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const { ncs } = state;
  const metrics = useMemo(() => getNCSummaryMetrics(ncs), [ncs]);
  const today = new Date();

  // Available projects based on selected city (supports Mumbai MMR, etc.)
  const availableProjects = useMemo(() => {
    return PROJECTS.filter(p => isProjectInCity(p.city, selectedCity));
  }, [selectedCity]);

  const activeProject = useMemo(() => {
    if (selectedProjectId === 'ALL') return null;
    return PROJECTS.find(p => p.id === selectedProjectId) || PROJECTS[0];
  }, [selectedProjectId]);

  // Active Project NCs (filtered by Project and City)
  const activeProjectNCs = useMemo(() => {
    return ncs.filter(nc => {
      if (selectedProjectId !== 'ALL' && nc.projectId !== selectedProjectId) return false;
      if (selectedProjectId === 'ALL' && selectedCity !== 'All Locations') {
        const proj = PROJECTS.find(p => p.id === nc.projectId);
        if (!proj || !isProjectInCity(proj.city, selectedCity)) return false;
      }
      return true;
    });
  }, [ncs, selectedProjectId, selectedCity]);

  // Root-cause category distribution data for the BarChart
  const categoryBreakdownData = useMemo(() => {
    return CATEGORIES.map(cat => {
      const catList = activeProjectNCs.filter(n => n.category === cat);
      const critical = catList.filter(n => n.severity === 'Critical' && n.status !== 'Closed').length;
      const high = catList.filter(n => n.severity === 'High' && n.status !== 'Closed').length;
      const mediumLow = catList.filter(n => (n.severity === 'Medium' || n.severity === 'Low') && n.status !== 'Closed').length;
      const closed = catList.filter(n => n.status === 'Closed').length;
      const total = catList.length;

      let shortLabel = 'Safety';
      if (cat === 'Material Quality') shortLabel = 'Material Quality';
      else if (cat === 'Workmanship / Workforce') shortLabel = 'Workmanship / Worker';
      else if (cat === 'Regulatory / Approvals') shortLabel = 'Regulatory';
      else if (cat === 'Process / Other') shortLabel = 'Process / QA';

      return {
        category: cat,
        name: shortLabel,
        critical,
        high,
        mediumLow,
        closed,
        total,
        openTotal: critical + high + mediumLow,
      };
    });
  }, [activeProjectNCs]);

  // Filtered NC rows
  const filteredNCs = useMemo(() => {
    return activeProjectNCs.filter(nc => {
      if (selectedCategory !== 'All Categories' && nc.category !== selectedCategory) return false;
      if (selectedSeverity !== 'All Severities' && nc.severity !== selectedSeverity) return false;
      if (selectedStatus !== 'All Statuses' && nc.status !== selectedStatus) return false;
      if (overdueOnly && (new Date(nc.dueDate) >= today || nc.status === 'Closed')) return false;

      if (localSearch.trim()) {
        const q = localSearch.toLowerCase();
        const proj = PROJECTS.find(p => p.id === nc.projectId);
        const contractor = CONTRACTORS.find(c => c.id === nc.contractorId);
        if (!nc.id.toLowerCase().includes(q) &&
            !nc.finding.toLowerCase().includes(q) &&
            !nc.owner.toLowerCase().includes(q) &&
            !proj?.name.toLowerCase().includes(q) &&
            !contractor?.name.toLowerCase().includes(q)) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      const order = { Critical: 0, High: 1, Medium: 2, Low: 3 };
      return order[a.severity] - order[b.severity];
    });
  }, [activeProjectNCs, selectedCategory, selectedSeverity, selectedStatus, overdueOnly, localSearch, today]);

  // Paginated NC rows
  const totalPages = Math.max(1, Math.ceil(filteredNCs.length / itemsPerPage));
  const paginatedNCs = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredNCs.slice(start, start + itemsPerPage);
  }, [filteredNCs, currentPage, itemsPerPage]);

  // Project-specific metrics for KPI strip
  const projectMetrics = useMemo(() => {
    const list = activeProjectNCs;
    const openList = list.filter(n => n.status !== 'Closed');
    const criticalCount = openList.filter(n => n.severity === 'Critical').length;
    const highCount = openList.filter(n => n.severity === 'High').length;
    const overdueCount = openList.filter(n => new Date(n.dueDate) < today).length;
    const closedCount = list.filter(n => n.status === 'Closed').length;
    const avgDays = Math.round(list.reduce((acc, n) => acc + n.age, 0) / Math.max(1, list.length));

    return {
      totalOpen: openList.length,
      criticalCount,
      highCount,
      overdueCount,
      closedCount,
      avgDays,
    };
  }, [activeProjectNCs, today]);

  // Pinned Critical & High Holds: 3 per stack with right arrow navigation
  const [pinnedStackIndex, setPinnedStackIndex] = useState(0);

  const pinnedNCs = useMemo(() => {
    return activeProjectNCs
      .filter(n => (n.severity === 'Critical' || n.severity === 'High') && n.status !== 'Closed')
      .sort((a, b) => {
        const order = { Critical: 0, High: 1, Medium: 2, Low: 3 };
        if (order[a.severity] !== order[b.severity]) return order[a.severity] - order[b.severity];
        return b.age - a.age; // Oldest open first
      });
  }, [activeProjectNCs]);

  // Reset pinned stack when scope changes
  useEffect(() => {
    setPinnedStackIndex(0);
  }, [selectedProjectId, selectedCity]);

  const pinnedPerStack = 3;
  const totalPinnedStacks = Math.max(1, Math.ceil(pinnedNCs.length / pinnedPerStack));
  const currentPinnedStack = useMemo(() => {
    const start = pinnedStackIndex * pinnedPerStack;
    return pinnedNCs.slice(start, start + pinnedPerStack);
  }, [pinnedNCs, pinnedStackIndex]);

  // Graph Trajectory Data
  const trajectoryData = useMemo(() => {
    return NC_TRAJECTORY_SERIES[selectedProjectId] || NC_TRAJECTORY_SERIES.P001;
  }, [selectedProjectId]);

  // Selected NC for Detail Drawer
  const selectedNC = useMemo(() => {
    return ncs.find(n => n.id === state.selectedNCId) || null;
  }, [ncs, state.selectedNCId]);

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* ============================================================
          SECTION 1: UNIFIED FILTER BAR & ROOT-CAUSE ANALYSIS
          ============================================================ */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 shadow-2xs space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F1F5F9]">
          <div>
            <div className="flex items-center gap-2">
              <ShieldAlert size={18} className="text-[#006B5B]" />
              <h2 className="text-base font-bold text-[#17191D]">
                Non-Compliance Defect Intelligence
              </h2>
            </div>
            <span className="text-[11px] text-[#6B7280] mt-0.5 block">
              Critical holds, corrective action SLA tracking, and defect root-cause analytics
            </span>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
            <div className="flex items-center gap-1.5 h-8.5 px-2.5 bg-[#F6F7F8] border border-[#E6E9ED] rounded-lg text-xs font-semibold text-[#17191D]">
              <Calendar size={13} className="text-[#6B7280]" />
              <span>Q3 FY25</span>
            </div>

            {(selectedCity !== 'All Locations' || selectedProjectId !== 'ALL' || selectedSeverity !== 'All Severities' || selectedStatus !== 'All Statuses' || selectedCategory !== 'All Categories' || overdueOnly || localSearch) && (
              <button
                onClick={() => {
                  if (onCityChange) onCityChange('All Locations');
                  if (onProjectChange) onProjectChange('ALL');
                  setSelectedSeverity('All Severities');
                  setSelectedStatus('All Statuses');
                  setSelectedCategory('All Categories');
                  setOverdueOnly(false);
                  setLocalSearch('');
                }}
                className="flex items-center gap-1 h-8.5 px-2.5 rounded-lg text-xs font-medium text-[#6B7280] hover:text-[#17191D] hover:bg-[#F1F3F5] transition-colors"
              >
                <RotateCcw size={12} />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* 2 SIDE-BY-SIDE DROPDOWNS: Location & Project */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* 1. City Dropdown */}
          <div className="relative">
            <label className="text-[11px] font-bold text-[#737B88] uppercase tracking-wider block mb-1">
              Location
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#1E3A8A]">
                <MapPin size={16} />
              </div>
              <select
                value={selectedCity}
                onChange={(e) => onCityChange && onCityChange(e.target.value)}
                className="h-10 w-full pl-9 pr-8 bg-white border border-slate-300 rounded-lg text-xs font-bold text-[#17191D] focus:outline-none focus:border-[#1E3A8A] shadow-2xs appearance-none cursor-pointer"
              >
                {CITIES.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
            </div>
          </div>

          {/* 2. Project Dropdown */}
          <div className="relative">
            <label className="text-[11px] font-bold text-[#737B88] uppercase tracking-wider block mb-1">
              Project
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#1E3A8A]">
                <Building2 size={16} />
              </div>
              <select
                value={selectedProjectId}
                onChange={(e) => onProjectChange && onProjectChange(e.target.value)}
                className="h-10 w-full pl-9 pr-8 bg-white border border-slate-300 rounded-lg text-xs font-bold text-[#17191D] focus:outline-none focus:border-[#1E3A8A] shadow-2xs appearance-none cursor-pointer"
              >
                <option value="ALL">All Projects ({availableProjects.length})</option>
                {availableProjects.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({LOCALITY_MAP[p.id] || p.city})
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================
          SECTION 2: 3 PINNED CRITICAL HOLDS (LEFT) + SMALLER GRAPH (RIGHT)
          "the pinned messages should be on the left of the graphs , and make the graphs smaller"
          "make it 3 and if there are more then an arrow to right to show next stack"
          ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* LEFT COLUMN: 3 PINNED DEFECT HOLDS WITH STACK NAVIGATION (5 COLS) */}
        <div className="lg:col-span-5 flex flex-col justify-between bg-white border border-[#E5E7EB] rounded-xl p-4 shadow-2xs space-y-3">
          {/* Header with Stack Navigation */}
          <div className="flex items-center justify-between pb-2 border-b border-[#F1F5F9]">
            <div className="flex items-center gap-2">
              <ShieldAlert size={16} className="text-[#DC2626] flex-shrink-0 animate-pulse" />
              <h4 className="text-xs font-bold text-[#17191D] uppercase tracking-wider">
                Pinned Critical Holds ({pinnedNCs.length})
              </h4>
            </div>

            {pinnedNCs.length > pinnedPerStack && (
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-semibold text-[#737B88] tabular-nums">
                  {pinnedStackIndex * pinnedPerStack + 1}–{Math.min(pinnedNCs.length, (pinnedStackIndex + 1) * pinnedPerStack)} of {pinnedNCs.length}
                </span>
                <div className="flex items-center gap-0.5">
                  <button
                    onClick={() => setPinnedStackIndex(prev => Math.max(0, prev - 1))}
                    disabled={pinnedStackIndex === 0}
                    className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-slate-600"
                    title="Previous stack"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    onClick={() => setPinnedStackIndex(prev => Math.min(totalPinnedStacks - 1, prev + 1))}
                    disabled={pinnedStackIndex >= totalPinnedStacks - 1}
                    className="p-1 rounded bg-[#1E3A8A] text-white hover:bg-blue-900 disabled:opacity-30 disabled:bg-slate-200 disabled:text-slate-400 transition-colors shadow-2xs"
                    title="Next stack"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 3 Pinned Cards Stack */}
          {pinnedNCs.length > 0 ? (
            <div className="flex-1 flex flex-col justify-between gap-2.5">
              {currentPinnedStack.map((nc) => {
                const proj = PROJECTS.find(p => p.id === nc.projectId);
                const contractor = CONTRACTORS.find(c => c.id === nc.contractorId);
                const isCritical = nc.severity === 'Critical';

                return (
                  <div
                    key={nc.id}
                    onClick={() => selectNC(nc.id)}
                    className={clsx(
                      'p-2.5 rounded-lg border transition-all cursor-pointer group flex flex-col justify-between gap-1.5',
                      isCritical
                        ? 'bg-red-50/70 border-red-200 hover:border-red-400'
                        : 'bg-amber-50/60 border-amber-200 hover:border-amber-400'
                    )}
                  >
                    <div className="flex items-center justify-between gap-2 min-w-0">
                      <div className="flex items-center gap-1.5 min-w-0 flex-1 overflow-hidden">
                        <span className={clsx(
                          'px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shrink-0',
                          isCritical ? 'bg-[#DC2626] text-white' : 'bg-[#D97706] text-white'
                        )}>
                          {nc.severity}
                        </span>
                        <span className="font-mono text-[11px] font-bold text-slate-700 shrink-0">
                          {nc.id}
                        </span>
                        <span className="text-[11px] text-slate-500 truncate" title={`${proj?.name} ${nc.tower ? `(${nc.tower})` : ''}`}>
                          · {proj?.name} {nc.tower ? `(${nc.tower})` : ''}
                        </span>
                      </div>

                      <span className={clsx(
                        'text-[10px] font-bold tabular-nums shrink-0',
                        isCritical ? 'text-[#DC2626]' : 'text-[#D97706]'
                      )}>
                        {nc.age}d open
                      </span>
                    </div>

                    <div className="flex items-start gap-2.5 my-0.5">
                      {nc.sitePhoto && (
                        <div className="w-11 h-11 rounded-md overflow-hidden bg-slate-900 border border-slate-200 shrink-0">
                          <img src={nc.sitePhoto.url} alt="Defect" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <p className="text-xs text-slate-800 font-medium line-clamp-2 flex-1 leading-snug break-words">
                        "{nc.finding}"
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1.5 border-t border-slate-200/60 min-w-0">
                      <span className="truncate pr-2 min-w-0 flex-1" title={contractor?.name}>
                        Vendor: <strong className="text-slate-700 font-semibold">{contractor?.name || 'Contractor'}</strong>
                      </span>
                      <span className="text-[#1E3A8A] font-bold group-hover:underline flex items-center gap-0.5 shrink-0 ml-2">
                        <span>Inspect</span>
                        <ArrowRight size={10} />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-5 flex flex-col justify-center items-center text-center flex-1 space-y-2 text-xs text-[#16805D]">
              <CheckCircle2 size={24} className="text-[#16805D]" />
              <strong className="text-sm font-bold text-slate-900">
                Zero Critical Stop-Work Holds
              </strong>
              <p className="text-slate-600 text-[11px] max-w-xs">
                All structural concrete and rebar works meet IS 456 specification for {activeProject?.name || 'selected scope'}.
              </p>
              <span className="px-2.5 py-0.5 rounded bg-emerald-100 text-[#16805D] font-bold text-[11px] mt-1">
                IS 456 Compliant
              </span>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: SMALLER GRAPH CARD (7 COLS) */}
        <div className="lg:col-span-7 bg-white border border-[#E5E7EB] rounded-xl p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-[#F1F5F9]">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#17191D]">
                {chartMode === 'breakdown' ? 'Root-Cause Distribution' : 'Monthly Trajectory'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* View Toggle */}
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[11px] font-semibold">
                <button
                  onClick={() => setChartMode('breakdown')}
                  className={clsx(
                    'px-2 py-0.5 rounded transition-all flex items-center gap-1',
                    chartMode === 'breakdown'
                      ? 'bg-white text-[#17191D] font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  )}
                >
                  <BarChart3 size={11} className="text-[#1E3A8A]" />
                  <span>Breakdown</span>
                </button>
                <button
                  onClick={() => setChartMode('trend')}
                  className={clsx(
                    'px-2 py-0.5 rounded transition-all flex items-center gap-1',
                    chartMode === 'trend'
                      ? 'bg-white text-[#17191D] font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  )}
                >
                  <TrendingUp size={11} className="text-[#16805D]" />
                  <span>Trend</span>
                </button>
              </div>

              {/* Compact Legend */}
              {chartMode === 'breakdown' ? (
                <div className="hidden sm:flex items-center gap-2 text-[11px] font-semibold pl-1">
                  <span className="flex items-center gap-1 text-[#DC2626]">
                    <span className="w-2 h-2 bg-[#DC2626] rounded-xs" />
                    <span>Crit</span>
                  </span>
                  <span className="flex items-center gap-1 text-[#EA580C]">
                    <span className="w-2 h-2 bg-[#EA580C] rounded-xs" />
                    <span>High</span>
                  </span>
                  <span className="flex items-center gap-1 text-[#2563EB]">
                    <span className="w-2 h-2 bg-[#2563EB] rounded-xs" />
                    <span>Med/Low</span>
                  </span>
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2 text-[11px] font-semibold pl-1">
                  <span className="flex items-center gap-1 text-[#16805D]">
                    <span className="w-2 h-0.5 bg-[#16805D] rounded" />
                    <span>Target</span>
                  </span>
                  <span className="flex items-center gap-1 text-[#2563EB]">
                    <span className="w-2 h-0.5 bg-[#2563EB] rounded" />
                    <span>Actual</span>
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Chart Container - Smaller height (h-44)! */}
          <div className="h-44 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              {chartMode === 'breakdown' ? (
                <BarChart
                  data={categoryBreakdownData}
                  margin={{ top: 8, right: 10, left: -25, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: '#64748B' }}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 10, fill: '#64748B' }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-[#17191D] text-white p-2.5 rounded-xl shadow-xl text-xs space-y-1 border border-slate-700 min-w-[180px]">
                            <div className="font-bold text-slate-200 border-b border-slate-700 pb-1 text-[11px]">
                              {data.category}
                            </div>
                            <div className="flex items-center justify-between text-rose-400 text-[11px]">
                              <span>Critical Holds:</span>
                              <strong className="font-mono">{data.critical}</strong>
                            </div>
                            <div className="flex items-center justify-between text-amber-400 text-[11px]">
                              <span>High Severity:</span>
                              <strong className="font-mono">{data.high}</strong>
                            </div>
                            <div className="flex items-center justify-between text-blue-400 text-[11px]">
                              <span>Medium / Minor:</span>
                              <strong className="font-mono">{data.mediumLow}</strong>
                            </div>
                            <div className="flex items-center justify-between text-emerald-400 pt-1 border-t border-slate-800 text-[11px]">
                              <span>Total:</span>
                              <strong className="font-mono">{data.total}</strong>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="critical"
                    name="Critical Holds"
                    stackId="a"
                    fill="#DC2626"
                    cursor="pointer"
                    onClick={(entry) => {
                      setSelectedCategory(entry.category);
                      setCurrentPage(1);
                    }}
                  />
                  <Bar
                    dataKey="high"
                    name="High Severity"
                    stackId="a"
                    fill="#EA580C"
                    cursor="pointer"
                    onClick={(entry) => {
                      setSelectedCategory(entry.category);
                      setCurrentPage(1);
                    }}
                  />
                  <Bar
                    dataKey="mediumLow"
                    name="Medium / Minor"
                    stackId="a"
                    fill="#2563EB"
                    radius={[5, 5, 0, 0]}
                    cursor="pointer"
                    onClick={(entry) => {
                      setSelectedCategory(entry.category);
                      setCurrentPage(1);
                    }}
                  />
                </BarChart>
              ) : (
                <AreaChart
                  data={trajectoryData}
                  margin={{ top: 8, right: 10, left: -25, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="ncGreen" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#16805D" stopOpacity={0.30} />
                      <stop offset="95%" stopColor="#16805D" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="ncBlue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.30} />
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748B' }} />
                  <YAxis domain={[0, 20]} tick={{ fontSize: 10, fill: '#64748B' }} />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const target = Number(payload[0]?.value) || 0;
                        const actual = Number(payload[1]?.value) || 0;

                        return (
                          <div className="bg-[#17191D] text-white p-2.5 rounded-xl shadow-xl text-xs space-y-1 border border-slate-700 min-w-[170px]">
                            <div className="font-bold text-slate-200 border-b border-slate-700 pb-1 text-[11px]">
                              {label} 2025
                            </div>
                            <div className="flex items-center justify-between text-emerald-400 text-[11px]">
                              <span>Target Ceiling:</span>
                              <strong className="font-mono">&le; {target}</strong>
                            </div>
                            <div className="flex items-center justify-between text-blue-400 text-[11px]">
                              <span>Open Defects:</span>
                              <strong className="font-mono">{actual}</strong>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />

                  <Area
                    type="monotone"
                    dataKey="targetMax"
                    stroke="#16805D"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#ncGreen)"
                    name="Target Ceiling"
                  />

                  <Area
                    type="monotone"
                    dataKey="actualOpen"
                    stroke="#2563EB"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#ncBlue)"
                    name="Open Defects"
                  />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ============================================================
          SECTION 3: 6-CARD EXECUTIVE KPI STRIP
          ============================================================ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#737B88] block mb-1">
            Total Open NCs
          </span>
          <span className="text-2xl font-black text-[#17191D] tabular-nums block">
            {projectMetrics.totalOpen}
          </span>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#737B88] block mb-1">
            Critical Holds
          </span>
          <span className="text-2xl font-black text-[#DC2626] tabular-nums block">
            {projectMetrics.criticalCount}
          </span>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#737B88] block mb-1">
            High Severity
          </span>
          <span className="text-2xl font-black text-[#EA580C] tabular-nums block">
            {projectMetrics.highCount}
          </span>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#737B88] block mb-1">
            Overdue Beyond SLA
          </span>
          <span className="text-2xl font-black text-[#D97706] tabular-nums block">
            {projectMetrics.overdueCount}
          </span>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#737B88] block mb-1">
            Verified Closed
          </span>
          <span className="text-2xl font-black text-[#16805D] tabular-nums block">
            {projectMetrics.closedCount}
          </span>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#737B88] block mb-1">
            Avg Days Open
          </span>
          <span className="text-2xl font-black text-[#17191D] tabular-nums block">
            {projectMetrics.avgDays}d
          </span>
        </div>
      </div>

      {/* ============================================================
          SECTION 5: WELL-MANAGED PAGINATED DEFECTS REGISTER
          Defect Category filter moved here closer to the list!
          ============================================================ */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-2xs overflow-hidden">
        {/* DEFECT CATEGORY FILTER STRIP (DIRECTLY ABOVE TABLE) */}
        <div className="px-5 py-3.5 border-b border-[#F1F5F9] bg-[#F8F9FA]/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#737B88]">
              Defect Category Filter:
            </span>
            <span className="text-xs text-[#737B88] font-medium hidden sm:inline">
              Filter records below by root-cause category
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {/* All Categories */}
            <button
              onClick={() => {
                setSelectedCategory('All Categories');
                setCurrentPage(1);
              }}
              className={clsx(
                'px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 border shadow-2xs',
                selectedCategory === 'All Categories'
                  ? 'bg-[#1E3A8A] text-white border-[#1E3A8A] ring-2 ring-[#1E3A8A]/20'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              )}
            >
              <Layers size={13} />
              <span>All Categories</span>
              <span className={clsx(
                'text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold',
                selectedCategory === 'All Categories' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
              )}>
                {activeProjectNCs.length}
              </span>
            </button>

            {/* Material Quality */}
            <button
              onClick={() => {
                setSelectedCategory('Material Quality');
                setCurrentPage(1);
              }}
              className={clsx(
                'px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 border shadow-2xs',
                selectedCategory === 'Material Quality'
                  ? 'bg-[#1E3A8A] text-white border-[#1E3A8A] ring-2 ring-[#1E3A8A]/20'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              )}
            >
              <PackageCheck size={13} className={selectedCategory === 'Material Quality' ? 'text-white' : 'text-[#2563EB]'} />
              <span>Material Quality</span>
              <span className={clsx(
                'text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold',
                selectedCategory === 'Material Quality' ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-700'
              )}>
                {activeProjectNCs.filter(n => n.category === 'Material Quality').length}
              </span>
            </button>

            {/* Workmanship / Workforce (Worker) */}
            <button
              onClick={() => {
                setSelectedCategory('Workmanship / Workforce');
                setCurrentPage(1);
              }}
              className={clsx(
                'px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 border shadow-2xs',
                selectedCategory === 'Workmanship / Workforce'
                  ? 'bg-[#1E3A8A] text-white border-[#1E3A8A] ring-2 ring-[#1E3A8A]/20'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              )}
            >
              <HardHat size={13} className={selectedCategory === 'Workmanship / Workforce' ? 'text-white' : 'text-[#EA580C]'} />
              <span>Workmanship / Worker</span>
              <span className={clsx(
                'text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold',
                selectedCategory === 'Workmanship / Workforce' ? 'bg-white/20 text-white' : 'bg-orange-50 text-orange-700'
              )}>
                {activeProjectNCs.filter(n => n.category === 'Workmanship / Workforce').length}
              </span>
            </button>

            {/* Safety */}
            <button
              onClick={() => {
                setSelectedCategory('Safety');
                setCurrentPage(1);
              }}
              className={clsx(
                'px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 border shadow-2xs',
                selectedCategory === 'Safety'
                  ? 'bg-[#1E3A8A] text-white border-[#1E3A8A] ring-2 ring-[#1E3A8A]/20'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              )}
            >
              <ShieldAlert size={13} className={selectedCategory === 'Safety' ? 'text-white' : 'text-[#DC2626]'} />
              <span>Safety</span>
              <span className={clsx(
                'text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold',
                selectedCategory === 'Safety' ? 'bg-white/20 text-white' : 'bg-red-50 text-red-700'
              )}>
                {activeProjectNCs.filter(n => n.category === 'Safety').length}
              </span>
            </button>

            {/* Regulatory / Approvals */}
            <button
              onClick={() => {
                setSelectedCategory('Regulatory / Approvals');
                setCurrentPage(1);
              }}
              className={clsx(
                'px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 border shadow-2xs',
                selectedCategory === 'Regulatory / Approvals'
                  ? 'bg-[#1E3A8A] text-white border-[#1E3A8A] ring-2 ring-[#1E3A8A]/20'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              )}
            >
              <FileCheck size={13} className={selectedCategory === 'Regulatory / Approvals' ? 'text-white' : 'text-[#7C3AED]'} />
              <span>Regulatory</span>
              <span className={clsx(
                'text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold',
                selectedCategory === 'Regulatory / Approvals' ? 'bg-white/20 text-white' : 'bg-purple-50 text-purple-700'
              )}>
                {activeProjectNCs.filter(n => n.category === 'Regulatory / Approvals').length}
              </span>
            </button>

            {/* Process / Other */}
            <button
              onClick={() => {
                setSelectedCategory('Process / Other');
                setCurrentPage(1);
              }}
              className={clsx(
                'px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 border shadow-2xs',
                selectedCategory === 'Process / Other'
                  ? 'bg-[#1E3A8A] text-white border-[#1E3A8A] ring-2 ring-[#1E3A8A]/20'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              )}
            >
              <SlidersHorizontal size={13} className={selectedCategory === 'Process / Other' ? 'text-white' : 'text-[#0D9488]'} />
              <span>Process / QA</span>
              <span className={clsx(
                'text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold',
                selectedCategory === 'Process / Other' ? 'bg-white/20 text-white' : 'bg-teal-50 text-teal-700'
              )}>
                {activeProjectNCs.filter(n => n.category === 'Process / Other').length}
              </span>
            </button>
          </div>
        </div>
        <div className="px-5 py-4 border-b border-[#F1F5F9] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-bold text-[#17191D]">
              Non-Compliance Records ({filteredNCs.length})
            </h3>
            <span className="text-xs text-[#737B88] font-medium hidden sm:inline">
              Page {currentPage} of {totalPages}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                value={localSearch}
                onChange={e => {
                  setLocalSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search finding or NC..."
                className="h-8 pl-7 pr-3 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none text-[#17191D] w-52 focus:bg-white focus:border-[#1E3A8A]"
              />
            </div>

            <button
              onClick={() => {
                setOverdueOnly(!overdueOnly);
                setCurrentPage(1);
              }}
              className={clsx(
                'h-8 px-2.5 rounded-lg text-xs font-bold border transition-colors flex items-center gap-1',
                overdueOnly
                  ? 'bg-[#DC2626] text-white border-red-700 shadow-2xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              )}
            >
              <Clock size={12} />
              <span>Overdue Only</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[700px]">
            <thead>
              <tr className="border-b border-[#F1F5F9] bg-[#FAFBFB] text-[#737B88] font-bold">
                <th className="py-3 px-4">NC ID</th>
                <th className="py-3 px-3">Project & Tower</th>
                <th className="py-3 px-3">Finding Description</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Severity</th>
                <th className="py-3 px-3">Contractor</th>
                <th className="py-3 px-3">Due Date</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {paginatedNCs.map(nc => {
                const proj = PROJECTS.find(p => p.id === nc.projectId);
                const contractor = CONTRACTORS.find(c => c.id === nc.contractorId);
                const isOverdue = new Date(nc.dueDate) < today && nc.status !== 'Closed';

                return (
                  <tr
                    key={nc.id}
                    onClick={() => selectNC(nc.id)}
                    className="hover:bg-[#FAFBFB] cursor-pointer transition-colors group"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        {nc.sitePhoto && (
                          <div className="w-8 h-8 rounded overflow-hidden bg-slate-900 border border-slate-200 flex-shrink-0">
                            <img src={nc.sitePhoto.url} alt="Photo" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <span className="font-mono font-bold text-slate-900 group-hover:text-[#1E3A8A]">
                          {nc.id}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <strong className="text-slate-900 block">{proj?.name}</strong>
                      <span className="text-[11px] text-slate-500">{nc.tower} · {nc.floor || ''}</span>
                    </td>

                    <td className="py-3.5 px-3 max-w-sm">
                      <p className="font-medium text-slate-800 line-clamp-1 leading-snug">
                        {nc.finding}
                      </p>
                    </td>

                    <td className="py-3.5 px-3 font-semibold text-slate-700">
                      {nc.category}
                    </td>

                    <td className="py-3.5 px-3">
                      <span className={clsx(
                        'px-2 py-0.5 rounded text-xs font-bold',
                        nc.severity === 'Critical' ? 'bg-rose-100 text-[#C63F43]' :
                        nc.severity === 'High' ? 'bg-amber-100 text-[#B7791F]' :
                        'bg-slate-100 text-slate-700'
                      )}>
                        {nc.severity}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 font-medium text-slate-700">
                      {contractor?.name ?? 'Contractor'}
                    </td>

                    <td className="py-3.5 px-3 tabular-nums font-mono">
                      <span className={isOverdue ? 'text-[#DC2626] font-bold' : 'text-slate-600'}>
                        {nc.dueDate}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          selectNC(nc.id);
                        }}
                        className="text-[#1E3A8A] font-bold text-xs hover:underline inline-flex items-center gap-1"
                      >
                        <span>Inspect</span>
                        <ArrowRight size={11} />
                      </button>
                    </td>
                  </tr>
                );
              })}

              {paginatedNCs.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No non-compliance records match the selected category or filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="px-5 py-3 border-t border-[#F1F5F9] bg-[#FAFBFB] flex items-center justify-between">
            <span className="text-xs text-[#737B88]">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredNCs.length)} of {filteredNCs.length} defects
            </span>

            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <ChevronLeft size={13} />
                <span>Previous</span>
              </button>

              <span className="text-xs font-bold text-slate-800 px-2">
                {currentPage} / {totalPages}
              </span>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <span>Next</span>
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* NC Detail Drawer (Enriched with All Sections from Reference Images) */}
      {selectedNC && (
        <div
          onClick={() => selectNC(null)}
          className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="w-full max-w-2xl bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-200 overflow-hidden"
          >
            {/* Header (Matching Reference Image) */}
            <div className="p-5 border-b border-slate-200 bg-slate-50/80">
              <div className="flex items-center justify-between pb-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold text-white bg-[#1E3A8A] px-2.5 py-0.5 rounded shadow-2xs">
                    {selectedNC.id}
                  </span>
                  <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                    {selectedNC.status}
                  </span>
                  {selectedNC.severity === 'Critical' && (
                    <span className="px-2 py-0.5 rounded text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                      <AlertOctagon size={12} className="text-[#DC2626]" />
                      <span>Blocking Pour / Hold</span>
                    </span>
                  )}
                </div>
                <button
                  onClick={() => selectNC(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <h3 className="text-base font-bold text-slate-900 leading-snug">
                Work Inspection: {selectedNC.finding}
              </h3>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                <span>{PROJECTS.find(p => p.id === selectedNC.projectId)?.name}</span>
                <span>•</span>
                <span>{selectedNC.tower || 'Block A'}</span>
                <span>•</span>
                <span className="font-medium text-slate-800">{selectedNC.floor || 'Level 5'}</span>
              </p>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* 1. LINKED WORK ACTIVITY */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                    LINKED WORK ACTIVITY
                  </span>
                  <strong className="text-xs font-bold text-slate-900 block">
                    {selectedNC.tower || 'Block A'} {selectedNC.floor || 'Level 5'} Column Casting & Shuttering
                  </strong>
                </div>
                <button
                  onClick={() => {
                    selectNC(null);
                    selectProject(selectedNC.projectId);
                    setTab('wip');
                  }}
                  className="text-xs font-semibold text-[#1E3A8A] hover:underline flex items-center gap-0.5 shrink-0"
                >
                  <span>View Activity</span>
                  <ChevronRight size={13} />
                </button>
              </div>

              {/* 2. INSPECTION WORKFLOW STAGE (STEPPER) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">Inspection Workflow Stage:</span>
                  <span className="font-bold text-[#1E3A8A]">{selectedNC.status}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-center">
                    <span className="text-[11px] font-bold text-slate-700 block">1. Contractor Raised</span>
                    <span className="text-[10px] text-slate-400">WIR Raised</span>
                  </div>
                  <div className="p-2.5 rounded-lg border-2 border-[#1E3A8A] bg-blue-50/50 text-center shadow-2xs">
                    <span className="text-[11px] font-bold text-[#1E3A8A] block">2. QA Field Check</span>
                    <span className="text-[10px] text-blue-700 font-semibold">Active Review</span>
                  </div>
                  <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-center opacity-70">
                    <span className="text-[11px] font-bold text-slate-500 block">3. Pour Cleared</span>
                    <span className="text-[10px] text-slate-400">Final Sign-off</span>
                  </div>
                </div>
              </div>

              {/* 3. SUBMITTED BY & ASSIGNED QA REVIEWER */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Submitted By
                  </span>
                  <strong className="text-xs font-bold text-slate-900 block truncate">
                    Ramesh Kulkarni ({CONTRACTORS.find(c => c.id === selectedNC.contractorId)?.name || 'Sterling Eng'})
                  </strong>
                  <span className="text-[11px] text-slate-500 font-mono block mt-0.5">
                    {selectedNC.dateRaised || '2026-10-03'}
                  </span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Assigned QA Reviewer
                  </span>
                  <strong className="text-xs font-bold text-slate-900 block truncate">
                    {selectedNC.owner || 'Rohan Mehra (Godrej QA Lead)'}
                  </strong>
                  <span className="text-[11px] text-amber-700 font-semibold block mt-0.5">
                    {selectedNC.age} days in queue
                  </span>
                </div>
              </div>

              {/* 4. NON-CONFORMANCE REASON (ALERT BOX FROM REFERENCE IMAGE) */}
              <div className="p-4 rounded-xl bg-rose-50/90 border border-rose-200 space-y-1.5 text-xs text-rose-950">
                <div className="flex items-center gap-1.5 font-bold text-rose-800">
                  <AlertOctagon size={15} className="text-[#DC2626] shrink-0" />
                  <span>Inspection Disapproved / Non-Conformance Reason</span>
                </div>
                <p className="text-slate-800 leading-relaxed text-xs">
                  {selectedNC.finding} Shutters out of plumb by 14mm (&gt;5mm allowable tolerance). Cover blocks absent along eastern face. Rebar touching plywood face.
                </p>
              </div>

              {/* 5. MANDATORY QUALITY INSPECTION CHECKLIST (FROM REFERENCE IMAGE) */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                  MANDATORY QUALITY INSPECTION CHECKLIST
                </span>
                <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-2.5 text-xs">
                  <div className="flex items-center gap-2.5 text-slate-700">
                    <span className="w-4 h-4 rounded-full border-2 border-slate-300 flex items-center justify-center shrink-0" />
                    <span>Verticality of column shutters using plumb bob / total station (&lt;5mm allowable)</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-slate-700">
                    <span className="w-4 h-4 rounded-full border-2 border-slate-300 flex items-center justify-center shrink-0" />
                    <span>Adequate cover block spacing (min 40mm) every 1m along rebar cage</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-emerald-800 font-medium">
                    <span className="w-4 h-4 rounded-full bg-emerald-100 border border-emerald-500 flex items-center justify-center text-emerald-700 shrink-0">
                      <Check size={11} strokeWidth={3} />
                    </span>
                    <span>Slurry tightness of formwork joints at kicker junction</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-slate-700">
                    <span className="w-4 h-4 rounded-full border-2 border-slate-300 flex items-center justify-center shrink-0" />
                    <span>Debris removal / air blowing inside column foot before concrete casting</span>
                  </div>
                </div>
              </div>

              {/* 6. QUALITY REVIEW NOTES (FROM REFERENCE IMAGE) */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                  QUALITY REVIEW NOTES
                </span>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed">
                  {selectedNC.rectificationNotes || 'Pour disallowed. Must strip shutter, re-align kicker and provide fiber-reinforced cover blocks before resubmission.'}
                </div>
              </div>

              {/* 7. SITE EVIDENCE PHOTO */}
              {selectedNC.sitePhoto && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                    SITE EVIDENCE PHOTO
                  </span>
                  <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-900">
                    <img
                      src={selectedNC.sitePhoto.url}
                      alt="Defect Proof"
                      className="w-full h-52 object-cover"
                    />
                    <div className="p-2.5 bg-[#17191D] text-white flex items-center justify-between text-xs">
                      <span className="text-slate-300">NABL / Site Audit Verification Proof</span>
                      <span className="text-slate-400 tabular-nums">{selectedNC.sitePhoto.timestamp || '14 Oct 2025'}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sticky Action Footer (Matching Reference Image) */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
              <span className="text-xs font-bold text-slate-700">
                Status: <strong className="text-amber-800">{selectedNC.status}</strong>
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => selectNC(null)}
                  className="px-4 py-2 rounded-lg border border-rose-300 bg-white hover:bg-rose-50 text-xs font-bold text-rose-700 transition-colors shadow-2xs"
                >
                  Reject WIR / Hold
                </button>

                <button
                  onClick={() => selectNC(null)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#18845B] hover:bg-[#136b49] text-xs font-bold text-white transition-colors shadow-2xs"
                >
                  <Check size={14} />
                  <span>Approve & Clear Pour</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
