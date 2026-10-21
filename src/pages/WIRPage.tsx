// ============================================================
// PILLAR 3C: WORK INSPECTION REQUESTS (WIR) INTELLIGENCE
// Clean, Standardized Architecture (Same Structure Across All 3 Tabs):
// 1. Side-by-side dropdown filter bar (City, Project, Trade Package)
// 2. 6-Card Executive KPI Strip
// 3. Featured Dual-Gradient Pass Rate Trajectory Area Chart
// 4. Critical SLA Bottleneck Card (Positioned directly below the graph)
// 5. Well-managed paginated records table (6 items per page)
// ============================================================

import React, { useState, useMemo, useEffect } from 'react';
import {
  ClipboardCheck, AlertTriangle, CheckCircle2, Clock, Filter,
  Search, ArrowRight, ChevronRight, X, Camera, ExternalLink,
  Building2, HardHat, MapPin, Layers, ChevronDown, ChevronLeft,
  User, Check, AlertCircle, BarChart3, TrendingUp, AlertOctagon,
  Calendar, RotateCcw
} from 'lucide-react';
import clsx from 'clsx';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { useApp } from '../store/appStore';
import { getWIRSummaryMetrics, isProjectInCity } from '../data/calculations';
import {
  PROJECTS, CONTRACTORS, SLA_DAYS, type WIR, type WIRStatus
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

const TRADES = [
  'All Trades',
  'Slab casting',
  'Column casting',
  'Rebar tying',
  'Formwork stripping',
  'Waterproofing',
  'Masonry',
];

// Monthly WIR Trajectory Series (Target Pass Rate % vs Certified Actual Pass Rate %)
const WIR_TRAJECTORY_SERIES: Record<string, { month: string; targetRate: number; actualRate: number; note?: string }[]> = {
  ALL: [
    { month: 'Apr', targetRate: 90, actualRate: 88 },
    { month: 'May', targetRate: 90, actualRate: 89 },
    { month: 'Jun', targetRate: 90, actualRate: 87 },
    { month: 'Jul', targetRate: 90, actualRate: 91, note: 'Pre-pour checks standard applied' },
    { month: 'Aug', targetRate: 90, actualRate: 89 },
    { month: 'Sep', targetRate: 90, actualRate: 92, note: '91.4% portfolio first-time pass' },
  ],
  P001: [ // Meridian Heights
    { month: 'Apr', targetRate: 90, actualRate: 89 },
    { month: 'May', targetRate: 90, actualRate: 91 },
    { month: 'Jun', targetRate: 90, actualRate: 92 },
    { month: 'Jul', targetRate: 90, actualRate: 90, note: 'Tower B shear wall pre-pour' },
    { month: 'Aug', targetRate: 90, actualRate: 93 },
    { month: 'Sep', targetRate: 90, actualRate: 94, note: 'Floor 18 slab certified' },
  ],
  P002: [ // Northgate Residences
    { month: 'Apr', targetRate: 90, actualRate: 92 },
    { month: 'May', targetRate: 90, actualRate: 93 },
    { month: 'Jun', targetRate: 90, actualRate: 94 },
    { month: 'Jul', targetRate: 90, actualRate: 95 },
    { month: 'Aug', targetRate: 90, actualRate: 96 },
    { month: 'Sep', targetRate: 90, actualRate: 96, note: 'Tower 2 finishes clear' },
  ],
  P003: [ // Cedar Park
    { month: 'Apr', targetRate: 90, actualRate: 86 },
    { month: 'May', targetRate: 90, actualRate: 88 },
    { month: 'Jun', targetRate: 90, actualRate: 87 },
    { month: 'Jul', targetRate: 90, actualRate: 89 },
    { month: 'Aug', targetRate: 90, actualRate: 90 },
    { month: 'Sep', targetRate: 90, actualRate: 91, note: 'Basement foundation casting' },
  ],
  P004: [ // Riverstone Towers
    { month: 'Apr', targetRate: 90, actualRate: 85 },
    { month: 'May', targetRate: 90, actualRate: 82 },
    { month: 'Jun', targetRate: 90, actualRate: 79 },
    { month: 'Jul', targetRate: 90, actualRate: 76, note: 'Rebar spacing rework hold' },
    { month: 'Aug', targetRate: 90, actualRate: 74 },
    { month: 'Sep', targetRate: 90, actualRate: 72, note: 'Floor 05 cube failure impact' },
  ],
  P005: [ // Harbour Point
    { month: 'Apr', targetRate: 90, actualRate: 91 },
    { month: 'May', targetRate: 90, actualRate: 92 },
    { month: 'Jun', targetRate: 90, actualRate: 94 },
    { month: 'Jul', targetRate: 90, actualRate: 93 },
    { month: 'Aug', targetRate: 90, actualRate: 95 },
    { month: 'Sep', targetRate: 90, actualRate: 96, note: 'Structural package on track' },
  ],
  P006: [ // Summit Greens
    { month: 'Apr', targetRate: 90, actualRate: 88 },
    { month: 'May', targetRate: 90, actualRate: 89 },
    { month: 'Jun', targetRate: 90, actualRate: 90 },
    { month: 'Jul', targetRate: 90, actualRate: 91 },
    { month: 'Aug', targetRate: 90, actualRate: 92 },
    { month: 'Sep', targetRate: 90, actualRate: 93 },
  ],
  P007: [ // Lodha Bellissimo
    { month: 'Apr', targetRate: 90, actualRate: 90 },
    { month: 'May', targetRate: 90, actualRate: 91 },
    { month: 'Jun', targetRate: 90, actualRate: 92 },
    { month: 'Jul', targetRate: 90, actualRate: 92 },
    { month: 'Aug', targetRate: 90, actualRate: 93 },
    { month: 'Sep', targetRate: 90, actualRate: 94 },
  ],
};

interface WIRPageProps {
  isEmbedded?: boolean;
  selectedCity?: string;
  selectedProjectId?: string;
  onCityChange?: (city: string) => void;
  onProjectChange?: (projectId: string) => void;
}

export function WIRPage({
  isEmbedded = false,
  selectedCity = 'All Locations',
  selectedProjectId = PROJECTS[0].id,
  onCityChange,
  onProjectChange,
}: WIRPageProps) {
  const { state, setFilter, selectWIR, selectProject, updateWIRStatus, setTab, selectNC } = useApp();

  const [localSearch, setLocalSearch] = useState(state.filters.search || '');
  const [selectedTrade, setSelectedTrade] = useState<string>('All Trades');
  const [selectedStatus, setSelectedStatus] = useState<string>('All Statuses');
  const [slaOnly, setSlaOnly] = useState(false);

  // Pagination (6 items per page)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [chartMode, setChartMode] = useState<'breakdown' | 'trend'>('breakdown');

  // Modal for workflow action
  const [actionModal, setActionModal] = useState<{
    wirId: string;
    newStatus: WIRStatus;
    note: string;
    requiresNote: boolean;
  } | null>(null);

  const { wirs } = state;
  const metrics = useMemo(() => getWIRSummaryMetrics(wirs), [wirs]);

  // Available projects based on selected city (supports Mumbai MMR, etc.)
  const availableProjects = useMemo(() => {
    return PROJECTS.filter(p => isProjectInCity(p.city, selectedCity));
  }, [selectedCity]);

  const activeProject = useMemo(() => {
    if (selectedProjectId === 'ALL') return null;
    return PROJECTS.find(p => p.id === selectedProjectId) || PROJECTS[0];
  }, [selectedProjectId]);

  // Active Project WIRs (filtered by Project and City)
  const activeProjectWIRs = useMemo(() => {
    return wirs.filter(w => {
      if (selectedProjectId !== 'ALL' && w.projectId !== selectedProjectId) return false;
      if (selectedProjectId === 'ALL' && selectedCity !== 'All Locations') {
        const proj = PROJECTS.find(p => p.id === w.projectId);
        if (!proj || !isProjectInCity(proj.city, selectedCity)) return false;
      }
      return true;
    });
  }, [wirs, selectedProjectId, selectedCity]);

  // Trade breakdown data for BarChart
  const tradeBreakdownData = useMemo(() => {
    return TRADES.filter(t => t !== 'All Trades').map(trade => {
      const tradeList = activeProjectWIRs.filter(w => w.activity.toLowerCase().includes(trade.toLowerCase()));
      const approved = tradeList.filter(w => w.status === 'Approved').length;
      const awaiting = tradeList.filter(w => w.status === 'Submitted' || w.status === 'Awaiting Review' || w.status === 'Resubmitted').length;
      const rejectedSla = tradeList.filter(w => w.status === 'Rejected' || (w.slaBreach && w.status !== 'Approved')).length;
      const total = tradeList.length;

      const shortName = trade.replace(' casting', '').replace(' stripping', '').replace(' tying', '');

      return {
        trade,
        name: shortName,
        approved,
        awaiting,
        rejectedSla,
        total,
      };
    });
  }, [activeProjectWIRs]);

  // Project-specific metrics for KPI strip
  const projectMetrics = useMemo(() => {
    const list = activeProjectWIRs;
    const total = list.length;
    const approved = list.filter(w => w.status === 'Approved').length;
    const rejected = list.filter(w => w.status === 'Rejected' || w.status === 'Rectification In Progress').length;
    const awaiting = list.filter(w => w.status === 'Submitted' || w.status === 'Awaiting Review' || w.status === 'Resubmitted').length;
    const pendingSla = list.filter(w => w.slaBreach && w.status !== 'Approved').length;
    const passRate = total > 0 ? Math.round((approved / Math.max(1, approved + rejected)) * 100) : 92;
    const avgTurnaround = list.length > 0 ? (list.reduce((acc, w) => acc + w.daysAwaiting, 0) / list.length).toFixed(1) : '2.1';

    return {
      total,
      passRate,
      awaiting,
      pendingSla,
      rejected,
      avgTurnaround,
    };
  }, [activeProjectWIRs]);

  // Pinned Inspection Holds / SLA Bottlenecks (3 per stack with right arrow navigation)
  const [pinnedStackIndex, setPinnedStackIndex] = useState(0);

  const pinnedWIRs = useMemo(() => {
    return activeProjectWIRs
      .filter(w => (w.slaBreach || w.status === 'Rejected' || w.status === 'Awaiting Review') && w.status !== 'Approved')
      .sort((a, b) => {
        if (a.slaBreach && !b.slaBreach) return -1;
        if (!a.slaBreach && b.slaBreach) return 1;
        return b.daysAwaiting - a.daysAwaiting;
      });
  }, [activeProjectWIRs]);

  // Reset pinned stack when scope changes
  useEffect(() => {
    setPinnedStackIndex(0);
  }, [selectedProjectId, selectedCity]);

  const pinnedPerStack = 3;
  const totalPinnedStacks = Math.max(1, Math.ceil(pinnedWIRs.length / pinnedPerStack));
  const currentPinnedStack = useMemo(() => {
    const start = pinnedStackIndex * pinnedPerStack;
    return pinnedWIRs.slice(start, start + pinnedPerStack);
  }, [pinnedWIRs, pinnedStackIndex]);

  // Graph Trajectory Data
  const trajectoryData = useMemo(() => {
    return WIR_TRAJECTORY_SERIES[selectedProjectId] || WIR_TRAJECTORY_SERIES.P001;
  }, [selectedProjectId]);

  // Filtered WIR rows
  const filteredWIRs = useMemo(() => {
    return activeProjectWIRs.filter(w => {
      if (selectedTrade !== 'All Trades' && !w.activity.toLowerCase().includes(selectedTrade.toLowerCase())) return false;
      if (selectedStatus !== 'All Statuses' && w.status !== selectedStatus) return false;
      if (slaOnly && (!w.slaBreach || w.status === 'Approved')) return false;

      if (localSearch.trim()) {
        const q = localSearch.toLowerCase();
        const proj = PROJECTS.find(p => p.id === w.projectId);
        const contractor = CONTRACTORS.find(c => c.id === w.contractorId);
        if (!w.id.toLowerCase().includes(q) &&
            !w.activity.toLowerCase().includes(q) &&
            !w.reviewer.toLowerCase().includes(q) &&
            !proj?.name.toLowerCase().includes(q) &&
            !contractor?.name.toLowerCase().includes(q)) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => b.submittedDate.localeCompare(a.submittedDate));
  }, [activeProjectWIRs, selectedTrade, selectedStatus, slaOnly, localSearch]);

  // Paginated WIR rows
  const totalPages = Math.max(1, Math.ceil(filteredWIRs.length / itemsPerPage));
  const paginatedWIRs = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredWIRs.slice(start, start + itemsPerPage);
  }, [filteredWIRs, currentPage, itemsPerPage]);

  // Selected WIR for Detail Drawer
  const selectedWIR = useMemo(() => {
    return wirs.find(w => w.id === state.selectedWIRId) || null;
  }, [wirs, state.selectedWIRId]);

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* ============================================================
          SECTION 1: UNIFIED FILTER BAR & TRADE PERFORMANCE
          ============================================================ */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 shadow-2xs space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F1F5F9]">
          <div>
            <div className="flex items-center gap-2">
              <ClipboardCheck size={18} className="text-[#006B5B]" />
              <h2 className="text-base font-bold text-[#17191D]">
                Work Inspection Requests (WIR) Intelligence
              </h2>
            </div>
            <span className="text-[11px] text-[#6B7280] mt-0.5 block">
              First-pass approval rates, trade package quality compliance, and inspection SLA controls
            </span>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
            <div className="flex items-center gap-1.5 h-8.5 px-2.5 bg-[#F6F7F8] border border-[#E6E9ED] rounded-lg text-xs font-semibold text-[#17191D]">
              <Calendar size={13} className="text-[#6B7280]" />
              <span>Q3 FY25</span>
            </div>

            {(selectedCity !== 'All Locations' || selectedProjectId !== 'ALL' || selectedTrade !== 'All Trades' || selectedStatus !== 'All Statuses' || slaOnly || localSearch) && (
              <button
                onClick={() => {
                  if (onCityChange) onCityChange('All Locations');
                  if (onProjectChange) onProjectChange('ALL');
                  setSelectedTrade('All Trades');
                  setSelectedStatus('All Statuses');
                  setSlaOnly(false);
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
          SECTION 2: 3 PINNED SLA BOTTLENECK HOLDS (LEFT) + SMALLER GRAPH (RIGHT)
          ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* LEFT COLUMN: 3 PINNED SLA BOTTLENECKS WITH STACK NAVIGATION (5 COLS) */}
        <div className="lg:col-span-5 flex flex-col justify-between bg-white border border-[#E5E7EB] rounded-xl p-4 shadow-2xs space-y-3">
          {/* Header with Stack Navigation */}
          <div className="flex items-center justify-between pb-2 border-b border-[#F1F5F9]">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-[#D97706] flex-shrink-0 animate-pulse" />
              <h4 className="text-xs font-bold text-[#17191D] uppercase tracking-wider">
                Pinned SLA Bottlenecks ({pinnedWIRs.length})
              </h4>
            </div>

            {pinnedWIRs.length > pinnedPerStack && (
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-semibold text-[#737B88] tabular-nums">
                  {pinnedStackIndex * pinnedPerStack + 1}–{Math.min(pinnedWIRs.length, (pinnedStackIndex + 1) * pinnedPerStack)} of {pinnedWIRs.length}
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
          {pinnedWIRs.length > 0 ? (
            <div className="flex-1 flex flex-col justify-between gap-2.5">
              {currentPinnedStack.map((wir) => {
                const proj = PROJECTS.find(p => p.id === wir.projectId);
                const contractor = CONTRACTORS.find(c => c.id === wir.contractorId);
                const isOverdue = wir.slaBreach;

                return (
                  <div
                    key={wir.id}
                    onClick={() => selectWIR(wir.id)}
                    className={clsx(
                      'p-2.5 rounded-lg border transition-all cursor-pointer group flex flex-col justify-between gap-1.5',
                      isOverdue
                        ? 'bg-amber-50/70 border-amber-300 hover:border-amber-400'
                        : 'bg-slate-50/80 border-slate-200 hover:border-slate-300'
                    )}
                  >
                    <div className="flex items-center justify-between gap-2 min-w-0">
                      <div className="flex items-center gap-1.5 min-w-0 flex-1 overflow-hidden">
                        <span className={clsx(
                          'px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shrink-0',
                          isOverdue ? 'bg-[#D97706] text-white' : 'bg-slate-700 text-white'
                        )}>
                          {isOverdue ? 'SLA Breach' : wir.status}
                        </span>
                        <span className="font-mono text-[11px] font-bold text-slate-700 shrink-0">
                          {wir.id}
                        </span>
                        <span className="text-[11px] text-slate-500 truncate" title={`${proj?.name} (${wir.tower || 'Site'})`}>
                          · {proj?.name} ({wir.tower || 'Site'})
                        </span>
                      </div>

                      <span className="text-[10px] font-bold text-[#D97706] tabular-nums shrink-0">
                        {wir.daysAwaiting}d waiting
                      </span>
                    </div>

                    <p className="text-xs text-slate-800 font-medium line-clamp-1 my-0.5 break-words">
                      {wir.activity} {wir.floor ? `· ${wir.floor}` : ''}
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1.5 border-t border-slate-200/60 min-w-0">
                      <span className="truncate pr-2 min-w-0 flex-1" title={contractor?.name}>
                        Vendor: <strong className="text-slate-700 font-semibold">{contractor?.name || 'Contractor'}</strong>
                      </span>
                      <span className="text-[#1E3A8A] font-bold group-hover:underline flex items-center gap-0.5 shrink-0 ml-2">
                        <span>Review</span>
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
                Zero Pending Inspection SLA Breaches
              </strong>
              <p className="text-slate-600 text-[11px] max-w-xs">
                All pre-pour and structural inspection clearances are within the 3-day turnaround SLA for {activeProject?.name || 'selected scope'}.
              </p>
              <span className="px-2.5 py-0.5 rounded bg-emerald-100 text-[#16805D] font-bold text-[11px] mt-1">
                Turnaround Within 3-Day SLA
              </span>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: SMALLER GRAPH CARD (7 COLS) */}
        <div className="lg:col-span-7 bg-white border border-[#E5E7EB] rounded-xl p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-[#F1F5F9]">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#17191D]">
                {chartMode === 'breakdown' ? 'Trade Package Distribution' : 'Pass Rate Trajectory'}
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
                  <span>Trades</span>
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
                  <span>Pass Rate</span>
                </button>
              </div>

              {/* Compact Legend */}
              {chartMode === 'breakdown' ? (
                <div className="hidden sm:flex items-center gap-2 text-[11px] font-semibold pl-1">
                  <span className="flex items-center gap-1 text-[#16805D]">
                    <span className="w-2 h-2 bg-[#16805D] rounded-xs" />
                    <span>Pass</span>
                  </span>
                  <span className="flex items-center gap-1 text-[#2563EB]">
                    <span className="w-2 h-2 bg-[#2563EB] rounded-xs" />
                    <span>Review</span>
                  </span>
                  <span className="flex items-center gap-1 text-[#DC2626]">
                    <span className="w-2 h-2 bg-[#DC2626] rounded-xs" />
                    <span>Hold</span>
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
                  data={tradeBreakdownData}
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
                              {data.trade}
                            </div>
                            <div className="flex items-center justify-between text-emerald-400 text-[11px]">
                              <span>Approved:</span>
                              <strong className="font-mono">{data.approved}</strong>
                            </div>
                            <div className="flex items-center justify-between text-blue-400 text-[11px]">
                              <span>Review:</span>
                              <strong className="font-mono">{data.awaiting}</strong>
                            </div>
                            <div className="flex items-center justify-between text-rose-400 text-[11px]">
                              <span>SLA Hold:</span>
                              <strong className="font-mono">{data.rejectedSla}</strong>
                            </div>
                            <div className="flex items-center justify-between text-slate-300 pt-1 border-t border-slate-800 text-[11px]">
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
                    dataKey="approved"
                    name="Approved First-Time"
                    stackId="a"
                    fill="#16805D"
                    cursor="pointer"
                    onClick={(entry) => {
                      setSelectedTrade(entry.trade);
                      setCurrentPage(1);
                    }}
                  />
                  <Bar
                    dataKey="awaiting"
                    name="Awaiting Review"
                    stackId="a"
                    fill="#2563EB"
                    cursor="pointer"
                    onClick={(entry) => {
                      setSelectedTrade(entry.trade);
                      setCurrentPage(1);
                    }}
                  />
                  <Bar
                    dataKey="rejectedSla"
                    name="SLA Hold / Rejected"
                    stackId="a"
                    fill="#DC2626"
                    radius={[5, 5, 0, 0]}
                    cursor="pointer"
                    onClick={(entry) => {
                      setSelectedTrade(entry.trade);
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
                    <linearGradient id="wirGreen" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#16805D" stopOpacity={0.30} />
                      <stop offset="95%" stopColor="#16805D" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="wirBlue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.30} />
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748B' }} />
                  <YAxis domain={[60, 100]} tick={{ fontSize: 10, fill: '#64748B' }} unit="%" />
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
                              <span>Target:</span>
                              <strong className="font-mono">&ge; {target}%</strong>
                            </div>
                            <div className="flex items-center justify-between text-blue-400 text-[11px]">
                              <span>Certified:</span>
                              <strong className="font-mono">{actual}%</strong>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />

                  <Area
                    type="monotone"
                    dataKey="targetRate"
                    stroke="#16805D"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#wirGreen)"
                    name="Target Pass Rate"
                  />

                  <Area
                    type="monotone"
                    dataKey="actualRate"
                    stroke="#2563EB"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#wirBlue)"
                    name="Certified Pass Rate"
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
            Total WIRs
          </span>
          <span className="text-2xl font-black text-[#17191D] tabular-nums block">
            {projectMetrics.total}
          </span>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#737B88] block mb-1">
            First-Time Pass
          </span>
          <span className="text-2xl font-black text-[#16805D] tabular-nums block">
            {projectMetrics.passRate}%
          </span>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#737B88] block mb-1">
            Awaiting Review
          </span>
          <span className="text-2xl font-black text-[#2563EB] tabular-nums block">
            {projectMetrics.awaiting}
          </span>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#737B88] block mb-1">
            Pending Beyond SLA
          </span>
          <span className="text-2xl font-black text-[#D97706] tabular-nums block">
            {projectMetrics.pendingSla}
          </span>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#737B88] block mb-1">
            Rejected Rework
          </span>
          <span className="text-2xl font-black text-[#DC2626] tabular-nums block">
            {projectMetrics.rejected}
          </span>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#737B88] block mb-1">
            Avg Turnaround
          </span>
          <span className="text-2xl font-black text-[#17191D] tabular-nums block">
            {projectMetrics.avgTurnaround}d
          </span>
        </div>
      </div>

      {/* ============================================================
          SECTION 5: WELL-MANAGED PAGINATED WIR REGISTER
          Trade & Work Package filter moved here closer to the list!
          ============================================================ */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-2xs overflow-hidden">
        {/* TRADE & WORK PACKAGE FILTER STRIP (DIRECTLY ABOVE TABLE) */}
        <div className="px-5 py-3.5 border-b border-[#F1F5F9] bg-[#F8F9FA]/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#737B88]">
              Trade & Work Package Filter:
            </span>
            <span className="text-xs text-[#737B88] font-medium hidden sm:inline">
              Filter inspection requests below by trade
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {TRADES.map(t => {
              const isSelected = selectedTrade === t;
              const count = t === 'All Trades'
                ? activeProjectWIRs.length
                : activeProjectWIRs.filter(w => w.activity.toLowerCase().includes(t.toLowerCase())).length;

              return (
                <button
                  key={t}
                  onClick={() => {
                    setSelectedTrade(t);
                    setCurrentPage(1);
                  }}
                  className={clsx(
                    'px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 border shadow-2xs',
                    isSelected
                      ? 'bg-[#1E3A8A] text-white border-[#1E3A8A] ring-2 ring-[#1E3A8A]/20'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  )}
                >
                  <Layers size={13} className={isSelected ? 'text-white' : 'text-[#1E3A8A]'} />
                  <span>{t}</span>
                  <span className={clsx(
                    'text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold',
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                  )}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
        <div className="px-5 py-4 border-b border-[#F1F5F9] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-bold text-[#17191D]">
              Inspection Requests ({filteredWIRs.length})
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
                placeholder="Search activity or WIR..."
                className="h-8 pl-7 pr-3 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none text-[#17191D] w-52 focus:bg-white focus:border-[#1E3A8A]"
              />
            </div>

            <button
              onClick={() => {
                setSlaOnly(!slaOnly);
                setCurrentPage(1);
              }}
              className={clsx(
                'h-8 px-2.5 rounded-lg text-xs font-bold border transition-colors flex items-center gap-1',
                slaOnly
                  ? 'bg-[#D97706] text-white border-amber-700 shadow-2xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              )}
            >
              <Clock size={12} />
              <span>SLA Overdue Only</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[700px]">
            <thead>
              <tr className="border-b border-[#F1F5F9] bg-[#FAFBFB] text-[#737B88] font-bold">
                <th className="py-3 px-4">WIR ID</th>
                <th className="py-3 px-3">Project & Tower</th>
                <th className="py-3 px-3">Work Package Inspected</th>
                <th className="py-3 px-3">Contractor</th>
                <th className="py-3 px-3">Waiting Time</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {paginatedWIRs.map(wir => {
                const proj = PROJECTS.find(p => p.id === wir.projectId);
                const contractor = CONTRACTORS.find(c => c.id === wir.contractorId);

                return (
                  <tr
                    key={wir.id}
                    onClick={() => selectWIR(wir.id)}
                    className="hover:bg-[#FAFBFB] cursor-pointer transition-colors group"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 group-hover:text-[#1E3A8A]">
                      {wir.id}
                    </td>

                    <td className="py-3.5 px-3">
                      <strong className="text-slate-900 block">{proj?.name}</strong>
                      <span className="text-[11px] text-slate-500">{wir.tower} · {wir.floor || 'Level'}</span>
                    </td>

                    <td className="py-3.5 px-3 max-w-sm">
                      <p className="font-semibold text-slate-800 line-clamp-1 leading-snug">
                        {wir.activity}
                      </p>
                    </td>

                    <td className="py-3.5 px-3 font-medium text-slate-700">
                      {contractor?.name ?? 'Contractor'}
                    </td>

                    <td className="py-3.5 px-3 tabular-nums font-semibold">
                      <span className={wir.slaBreach ? 'text-[#DC2626] font-bold' : 'text-slate-700'}>
                        {wir.daysAwaiting}d {wir.slaBreach && '⚠️'}
                      </span>
                    </td>

                    <td className="py-3.5 px-3">
                      <span className={clsx(
                        'px-2 py-0.5 rounded text-xs font-bold',
                        wir.status === 'Approved' ? 'bg-emerald-100 text-[#16805D]' :
                        wir.status === 'Rejected' ? 'bg-rose-100 text-[#C63F43]' :
                        'bg-amber-100 text-[#B7791F]'
                      )}>
                        {wir.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          selectWIR(wir.id);
                        }}
                        className="text-[#1E3A8A] font-bold text-xs hover:underline inline-flex items-center gap-1"
                      >
                        <span>Checklist</span>
                        <ArrowRight size={11} />
                      </button>
                    </td>
                  </tr>
                );
              })}

              {paginatedWIRs.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No inspection requests match the selected trade package or filters.
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
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredWIRs.length)} of {filteredWIRs.length} inspections
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

      {/* WIR Detail Drawer (Enriched with All Sections from Reference Images) */}
      {selectedWIR && (
        <div
          onClick={() => selectWIR(null)}
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
                    {selectedWIR.id}
                  </span>
                  <span className={clsx(
                    'px-2 py-0.5 rounded text-xs font-semibold border',
                    selectedWIR.status === 'Approved' ? 'bg-emerald-100 text-[#16805D] border-emerald-200' :
                    selectedWIR.status === 'Rejected' ? 'bg-rose-100 text-[#C63F43] border-rose-200' :
                    'bg-amber-100 text-amber-800 border-amber-200'
                  )}>
                    {selectedWIR.status}
                  </span>
                  {selectedWIR.slaBreach && (
                    <span className="px-2 py-0.5 rounded text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                      <AlertOctagon size={12} className="text-[#DC2626]" />
                      <span>Blocking Pour</span>
                    </span>
                  )}
                </div>
                <button
                  onClick={() => selectWIR(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <h3 className="text-base font-bold text-slate-900 leading-snug">
                Work Inspection: {selectedWIR.activity}
              </h3>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                <span>{PROJECTS.find(p => p.id === selectedWIR.projectId)?.name}</span>
                <span>•</span>
                <span>{selectedWIR.tower || 'Block 2 Core & Shell'}</span>
                <span>•</span>
                <span className="font-medium text-slate-800">{selectedWIR.floor || 'Level 8'}</span>
              </p>
            </div>

            {/* Body with All Sections from Reference Image */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* 1. LINKED WORK ACTIVITY */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                    LINKED WORK ACTIVITY
                  </span>
                  <strong className="text-xs font-bold text-slate-900 block">
                    {selectedWIR.tower || 'Block 2'} {selectedWIR.floor || 'Level 8'} {selectedWIR.activity}
                  </strong>
                </div>
                <button
                  onClick={() => {
                    selectWIR(null);
                    selectProject(selectedWIR.projectId);
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
                  <span className="font-bold text-[#1E3A8A]">{selectedWIR.status}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-center">
                    <span className="text-[11px] font-bold text-slate-700 block">1. Contractor Raised</span>
                    <span className="text-[10px] text-slate-400">Checklist Signed</span>
                  </div>
                  <div className="p-2.5 rounded-lg border-2 border-[#1E3A8A] bg-blue-50/50 text-center shadow-2xs">
                    <span className="text-[11px] font-bold text-[#1E3A8A] block">2. QA Field Check</span>
                    <span className="text-[10px] text-blue-700 font-semibold">Active Review</span>
                  </div>
                  <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-center opacity-70">
                    <span className="text-[11px] font-bold text-slate-500 block">3. Pour Cleared</span>
                    <span className="text-[10px] text-slate-400">Final Clearance</span>
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
                    Kishore Kumar ({CONTRACTORS.find(c => c.id === selectedWIR.contractorId)?.name || 'Sterling Eng'})
                  </strong>
                  <span className="text-[11px] text-slate-500 font-mono block mt-0.5">
                    {selectedWIR.submittedDate}
                  </span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Assigned QA Reviewer
                  </span>
                  <strong className="text-xs font-bold text-slate-900 block truncate">
                    {selectedWIR.reviewer || 'Rohan Mehra (Godrej QA Lead)'}
                  </strong>
                  <span className="text-[11px] text-amber-700 font-semibold block mt-0.5">
                    {selectedWIR.daysAwaiting} days in queue
                  </span>
                </div>
              </div>

              {/* 4. NON-CONFORMANCE / REJECTION REASON (IF REJECTED OR PENDING SLA) */}
              {(selectedWIR.rejectionReason || selectedWIR.slaBreach) && (
                <div className="p-4 rounded-xl bg-rose-50/90 border border-rose-200 space-y-1.5 text-xs text-rose-950">
                  <div className="flex items-center gap-1.5 font-bold text-rose-800">
                    <AlertOctagon size={15} className="text-[#DC2626] shrink-0" />
                    <span>Inspection Disapproved / Non-Conformance Reason</span>
                  </div>
                  <p className="text-slate-800 leading-relaxed text-xs">
                    {selectedWIR.rejectionReason || 'Column C12 and C14 shutters out of plumb by 14mm (>5mm allowable tolerance). Cover blocks absent along eastern face. Rebar touching plywood face.'}
                  </p>
                </div>
              )}

              {/* 5. MANDATORY QUALITY INSPECTION CHECKLIST (FROM REFERENCE IMAGE) */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                  MANDATORY QUALITY INSPECTION CHECKLIST
                </span>
                <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-2.5 text-xs">
                  <div className="flex items-center gap-2.5 text-slate-700">
                    <span className="w-4 h-4 rounded-full border-2 border-slate-300 flex items-center justify-center shrink-0" />
                    <span>Verticality of column shutters using plumb bob / total station</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-slate-700">
                    <span className="w-4 h-4 rounded-full border-2 border-slate-300 flex items-center justify-center shrink-0" />
                    <span>Adequate cover block spacing (min 40mm) every 1m</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-emerald-800 font-medium">
                    <span className="w-4 h-4 rounded-full bg-emerald-100 border border-emerald-500 flex items-center justify-center text-emerald-700 shrink-0">
                      <Check size={11} strokeWidth={3} />
                    </span>
                    <span>Slurry tightness of formwork joints at kicker junction</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-slate-700">
                    <span className="w-4 h-4 rounded-full border-2 border-slate-300 flex items-center justify-center shrink-0" />
                    <span>Debris removal / air blowing inside column foot</span>
                  </div>
                </div>
              </div>

              {/* 6. QUALITY REVIEW NOTES (FROM REFERENCE IMAGE) */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                  QUALITY REVIEW NOTES
                </span>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed">
                  {selectedWIR.inspectionNotes || 'Pour disallowed. Must strip shutter, re-align kicker and provide fiber-reinforced cover blocks before resubmission.'}
                </div>
              </div>

              {/* 7. SITE EVIDENCE PHOTO */}
              {selectedWIR.sitePhoto && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                    INSPECTION EVIDENCE PHOTO
                  </span>
                  <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-900">
                    <img
                      src={selectedWIR.sitePhoto.url}
                      alt={selectedWIR.sitePhoto.caption}
                      className="w-full h-52 object-cover"
                    />
                    <div className="p-2.5 bg-[#17191D] text-white flex items-center justify-between text-xs">
                      <span className="text-slate-300">{selectedWIR.sitePhoto.caption}</span>
                      <span className="text-slate-400 tabular-nums">{selectedWIR.sitePhoto.timestamp}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sticky Action Footer (Matching Reference Image) */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
              <span className="text-xs font-bold text-slate-700">
                Status: <strong className="text-amber-800">{selectedWIR.status}</strong>
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    updateWIRStatus(selectedWIR.id, 'Rejected', 'Defect identified during rebar inspection');
                    selectWIR(null);
                  }}
                  className="px-4 py-2 rounded-lg border border-rose-300 bg-white hover:bg-rose-50 text-xs font-bold text-rose-700 transition-colors shadow-2xs"
                >
                  Reject WIR
                </button>

                <button
                  onClick={() => {
                    updateWIRStatus(selectedWIR.id, 'Approved');
                    selectWIR(null);
                  }}
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
