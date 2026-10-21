// ============================================================
// PILLAR 2: CONSTRUCTION (WIP) INTELLIGENCE
// Unified In-Place Architecture (Zero Page Reloads):
//
// Tier 1: All-Projects Overview
//   - Filter by City & Status
//   - Multi-Project Skyline with Hover Overviews (including site images)
//   - Compact, high-information project summary cards with explicit senior-friendly CTA buttons
//
// Tier 2: Selected Project View (In-Place Transition)
//   - Left Pane (1/3): Project's buildings expanding vertically with slab graphs & explicit focus buttons
//   - Right Pane (2/3): Structured overview of all buildings (Executive KPIs, Critical Holds, Building Matrix, Work Packages)
//
// Tier 3: Focused Building Deep-Dive (In-Place Transition)
//   - Other buildings shrink/collapse into a quick-toggle toolbar
//   - Focused building stands tall with full floor-by-floor slabs
//   - UNBUILT FLOORS GREYED OUT & DISABLED (cannot select unbuilt levels)
//   - Right Pane highlights CRITICAL & MAJOR INSPECTIONS on top, followed by scannable floor matrix
// ============================================================

import React, { useState, useMemo, useEffect } from 'react';
import {
  Building2, MapPin, RotateCcw, CheckCircle2, AlertTriangle, Clock,
  ArrowRight, Search, ShieldAlert,
  HardHat, Calendar, X, Camera, Upload, Check, ChevronDown,
  ChevronUp, ArrowLeft, Layers, Eye, Maximize2, Minimize2,
  FileText, ExternalLink, Filter, HelpCircle, ChevronRight,
  TrendingUp, TrendingDown
} from 'lucide-react';
import clsx from 'clsx';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, ReferenceLine
} from 'recharts';
import { useApp } from '../store/appStore';
import {
  PROJECTS, TOWERS_DATA, FLOORS_DATA, CONTRACTORS,
  type TowerBuilding, type FloorProgress, type WIPActivity, type Project,
} from '../data/seedData';
import {
  getWIPSummaryMetrics, getProgressCurveData, isProjectInCity
} from '../data/calculations';

// ── Locality Map ────────────────────────────────────────────
const LOCALITY_MAP: Record<string, string> = {
  P001: 'Worli, Mumbai',
  P002: 'Hebbal, Bengaluru',
  P003: 'Kalyani Nagar, Pune',
  P004: 'Golf Course Rd, Gurugram',
  P005: 'CBD Belapur, Navi Mumbai',
  P006: 'Gachibowli, Hyderabad',
  P007: 'Ghodbunder, Thane',
};

// ── Luxury Billboard Architectural Renders ──────────────────
const PROJECT_IMAGES: Record<string, string> = {
  P001: '/projects/billboards/meridian-billboard.jpg',
  P002: '/projects/billboards/northgate-billboard.jpg',
  P003: '/projects/billboards/cedar-park-billboard.jpg',
  P004: '/projects/billboards/riverstone-billboard.jpg',
  P005: '/projects/billboards/harbour-point-billboard.jpg',
  P006: '/projects/billboards/summit-greens-billboard.jpg',
  P007: '/projects/billboards/vivanta-sereno-billboard.jpg',
};

// ── Real Site Photo Evidence Map ───────────────────────────
interface DefectEvidence {
  ncId: string;
  image: string;
  statement: string;
  author: string;
  timestamp: string;
  severity: 'Critical' | 'Major' | 'Minor';
  floor: number;
}

const DEFECT_PHOTOS: Record<string, Record<string, DefectEvidence>> = {
  P004: {
    'Tower 1': {
      ncId: 'NC-0001',
      image: '/defects/nc-0001-cube-fail.jpg',
      statement: 'M35 RMC batch failing 28-day cube compression test (18.2 MPa). Heavy honeycombing observed at Grid C12–C21 column core.',
      author: 'T. Pillai (Site QA Lead)',
      timestamp: '14 Oct 2025, 11:42 AM',
      severity: 'Critical',
      floor: 5,
    },
  },
  P001: {
    'Tower B': {
      ncId: 'NC-0003',
      image: '/defects/nc-0002-honeycombing.jpg',
      statement: 'Surface honeycombing on shear wall junction post shuttering stripping. Shuttering vibrator under-utilization.',
      author: 'M. Joshi (Quality Inspector)',
      timestamp: '12 Oct 2025, 03:15 PM',
      severity: 'Major',
      floor: 6,
    },
  },
  P002: {
    'Block 2': {
      ncId: 'NC-0006',
      image: '/defects/nc-0006-rebar-spacing.jpg',
      statement: 'Column tie stirrup spacing 220mm against 150mm specified structural drawing. Re-tying required before casting.',
      author: 'D. Sen (Site Engineer)',
      timestamp: '10 Oct 2025, 09:30 AM',
      severity: 'Major',
      floor: 3,
    },
  },
};

const CITIES = ['All Locations', 'Mumbai', 'Thane', 'Navi Mumbai', 'Pune', 'Bengaluru', 'Gurugram', 'Hyderabad'];
const STATUS_FILTERS = ['All Statuses', 'Critical Holds', 'Schedule Delayed', 'On Track'];

// ── S-Curve Tooltip ──────────────────────────────────────────
const SCurveTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const planned = payload.find((p: any) => p.dataKey === 'planned')?.value;
    const actual = payload.find((p: any) => p.dataKey === 'actual')?.value;
    const diff = (actual !== undefined && planned !== undefined) ? actual - planned : null;
    return (
      <div className="bg-[#17191D] text-white p-3 rounded-lg shadow-xl text-xs space-y-1.5 border border-slate-700">
        <div className="font-bold text-slate-300 pb-1 border-b border-slate-700 flex items-center justify-between gap-3">
          <span>{label} Milestone</span>
          {diff !== null && (
            <span className={clsx('text-[10px] font-bold px-1.5 py-0.5 rounded', diff < 0 ? 'bg-rose-900 text-rose-200' : 'bg-teal-900 text-teal-200')}>
              {diff < 0 ? `${diff}% Behind Plan` : `+${diff}% Ahead`}
            </span>
          )}
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#006B5B]" />
              <span>Certified Actual:</span>
            </span>
            <span className="font-bold text-white tabular-nums">{actual !== undefined ? `${actual}%` : 'Pending'}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              <span>Planned Baseline:</span>
            </span>
            <span className="font-bold text-slate-300 tabular-nums">{planned}%</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export function WIPPage() {
  const { state, setTab, selectProject, selectWIR, selectNC } = useApp();

  // Tier 1 Filters
  const [selectedCity, setSelectedCity] = useState('All Locations');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All Statuses');
  const [searchQuery, setSearchQuery] = useState('');

  // Tier 2 & 3 Internal Progressive Drill-down State
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(state.selectedProjectId);
  const [focusedTowerName, setFocusedTowerName] = useState<string | null>(null);
  const [selectedFloorNumber, setSelectedFloorNumber] = useState<number | null>(null);
  const [expandedActivityId, setExpandedActivityId] = useState<string | null>(null);

  // Modals & Feedback
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadedToast, setUploadedToast] = useState(false);

  // Hover Popover State for Buildings (with Overview & Image)
  const [hoveredBuilding, setHoveredBuilding] = useState<{
    x: number;
    y: number;
    tower: TowerBuilding;
    project: Project;
    defect?: DefectEvidence;
    billboard?: string;
  } | null>(null);

  // Sync external selection if provided
  useEffect(() => {
    if (state.selectedProjectId && state.selectedProjectId !== selectedProjectId) {
      setSelectedProjectId(state.selectedProjectId);
      setFocusedTowerName(null);
      setSelectedFloorNumber(null);
    }
  }, [state.selectedProjectId]);

  // Filtered Projects for Tier 1
  const filteredProjects = useMemo(() => {
    return PROJECTS.filter(p => {
      if (selectedCity !== 'All Locations') {
        if (selectedCity.toLowerCase() === 'mumbai') {
          if (!['Mumbai', 'Navi Mumbai', 'Thane'].includes(p.city)) return false;
        } else if (p.city.toLowerCase() !== selectedCity.toLowerCase()) {
          return false;
        }
      }

      if (selectedStatusFilter === 'Critical Holds' && p.id !== 'P004') return false;
      if (selectedStatusFilter === 'Schedule Delayed' && p.delayedBuildings === 0) return false;
      if (selectedStatusFilter === 'On Track' && (p.id === 'P004' || p.delayedBuildings > 0)) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const loc = (LOCALITY_MAP[p.id] || '').toLowerCase();
        if (!p.name.toLowerCase().includes(q) && !p.city.toLowerCase().includes(q) && !loc.includes(q)) {
          return false;
        }
      }

      return true;
    });
  }, [selectedCity, selectedStatusFilter, searchQuery]);

  // Selected Project Object
  const currentProject = useMemo(() => {
    if (!selectedProjectId) return null;
    return PROJECTS.find(p => p.id === selectedProjectId) || null;
  }, [selectedProjectId]);

  // Towers for Selected Project
  const currentTowers = useMemo(() => {
    if (!selectedProjectId) return [];
    return TOWERS_DATA.filter(t => t.projectId === selectedProjectId);
  }, [selectedProjectId]);

  // Focused Tower Object (if in Tier 3)
  const focusedTower = useMemo(() => {
    if (!focusedTowerName || !currentTowers.length) return null;
    return currentTowers.find(t => t.name === focusedTowerName) || null;
  }, [focusedTowerName, currentTowers]);

  // Floors for focused project / tower
  const towerFloors = useMemo(() => {
    if (!selectedProjectId) return [];
    if (focusedTowerName) {
      return FLOORS_DATA.filter(f => f.projectId === selectedProjectId && f.tower === focusedTowerName);
    }
    return FLOORS_DATA.filter(f => f.projectId === selectedProjectId);
  }, [selectedProjectId, focusedTowerName]);

  // Activities for selected project / tower
  const projectActivities = useMemo(() => {
    if (!selectedProjectId) return [];
    const acts = state.wipActivities.filter(a => a.projectId === selectedProjectId);
    if (focusedTowerName) {
      return acts.filter(a => a.tower === focusedTowerName);
    }
    return acts;
  }, [selectedProjectId, focusedTowerName, state.wipActivities]);

  // Executive WIP Summary Metrics (Portfolio Planned vs Actual Progress & Delayed Counts)
  const summaryMetrics = useMemo(
    () => getWIPSummaryMetrics(selectedCity, selectedProjectId || undefined),
    [selectedCity, selectedProjectId]
  );

  // Portfolio-wide total & completed slabs count
  const portfolioTowers = useMemo(() => {
    if (selectedCity === 'All Locations') return TOWERS_DATA;
    const matchingProjIds = PROJECTS.filter(p => isProjectInCity(p.city, selectedCity)).map(p => p.id);
    return TOWERS_DATA.filter(t => matchingProjIds.includes(t.projectId));
  }, [selectedCity]);

  const portfolioTotalSlabs = useMemo(
    () => portfolioTowers.reduce((acc, t) => acc + t.totalFloors, 0),
    [portfolioTowers]
  );
  const portfolioCastSlabs = useMemo(
    () => portfolioTowers.reduce((acc, t) => acc + t.completedFloors, 0),
    [portfolioTowers]
  );

  // Dynamic Schedule Drift calculation reflecting active City & Project scope
  const scheduleDriftData = useMemo(() => {
    const activeProjectIds = selectedProjectId
      ? [selectedProjectId]
      : filteredProjects.map(p => p.id);

    const activeTowers = TOWERS_DATA.filter(t => activeProjectIds.includes(t.projectId));
    const delayedTowers = activeTowers.filter(t => t.varianceDays < 0 || t.status === 'Delayed');
    
    // Average variance days (lag) among delayed towers or overall active towers
    const avgLag = delayedTowers.length > 0
      ? Math.round(delayedTowers.reduce((acc, t) => acc + t.varianceDays, 0) / delayedTowers.length)
      : activeTowers.length > 0
      ? Math.round(activeTowers.reduce((acc, t) => acc + t.varianceDays, 0) / activeTowers.length)
      : 0;

    // Worst-lagged tower(s)
    const sortedLagged = [...activeTowers].sort((a, b) => a.varianceDays - b.varianceDays);
    const worstTowers = sortedLagged.filter(t => t.varianceDays < 0).slice(0, 2);

    const projs = selectedProjectId
      ? PROJECTS.filter(p => p.id === selectedProjectId)
      : filteredProjects;

    let baselineText = 'Q2 FY26';
    let forecastText = 'Q4 FY26';
    let delayMonthText = '';

    if (projs.length === 1) {
      const p = projs[0];
      const targetDate = new Date(p.targetCompletion);
      const targetMonth = targetDate.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
      const forecastDate = new Date(targetDate.getTime() - avgLag * 24 * 60 * 60 * 1000);
      const forecastMonth = forecastDate.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
      baselineText = targetMonth;
      forecastText = forecastMonth;
      if (avgLag < 0) {
        const months = (Math.abs(avgLag) / 30).toFixed(1);
        delayMonthText = ` (+${months} mo)`;
      }
    } else {
      if (avgLag < 0) {
        const months = (Math.abs(avgLag) / 30).toFixed(1);
        delayMonthText = ` (+${months} mo)`;
      }
    }

    let topCriticalText = '';
    if (worstTowers.length > 0) {
      topCriticalText = 'Top critical lag: ' + worstTowers.map(t => {
        const p = PROJECTS.find(prj => prj.id === t.projectId);
        return `${p ? p.name + ' ' : ''}${t.name} (${t.varianceDays}d)`;
      }).join(' & ');
    } else {
      topCriticalText = 'All towers currently tracking within baseline schedule';
    }

    return {
      delayedCount: delayedTowers.length,
      totalTowers: activeTowers.length,
      avgLag,
      baselineText,
      forecastText: `${forecastText}${delayMonthText}`,
      topCriticalText,
    };
  }, [selectedProjectId, filteredProjects]);

  // Helper to compute Planned vs Forecast completion dates and delay
  const getProjectCompletionData = (proj: Project) => {
    const towers = TOWERS_DATA.filter(t => t.projectId === proj.id);
    const minVariance = towers.length > 0 ? Math.min(...towers.map(t => t.varianceDays)) : 0;
    const targetDate = new Date(proj.targetCompletion);
    const targetFormatted = targetDate.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
    
    // Shift forecast date if delayed
    const forecastDate = new Date(targetDate.getTime() - minVariance * 24 * 60 * 60 * 1000);
    const forecastFormatted = forecastDate.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
    const isDelayed = minVariance < 0;
    const delayDays = Math.abs(minVariance);
    const variancePct = proj.progressPercentage - proj.targetProgressPercentage;

    return {
      targetFormatted,
      forecastFormatted,
      varianceDays: minVariance,
      isDelayed,
      delayDays,
      variancePct,
    };
  };

  // Handlers for in-place transitions
  const handleSelectProject = (projectId: string) => {
    setSelectedProjectId(projectId);
    setFocusedTowerName(null);
    setSelectedFloorNumber(null);
    selectProject(projectId);
  };

  const handleBackToAllProjects = () => {
    setSelectedProjectId(null);
    setFocusedTowerName(null);
    setSelectedFloorNumber(null);
    selectProject(null);
  };

  const handleFocusTower = (towerName: string) => {
    setFocusedTowerName(towerName);
    const tower = currentTowers.find(t => t.name === towerName);
    // Auto-select latest built/active floor or floor with critical hold
    if (tower) {
      const isP4T1 = selectedProjectId === 'P004' && towerName === 'Tower 1';
      setSelectedFloorNumber(isP4T1 ? 5 : Math.min(tower.completedFloors + 1, tower.totalFloors));
    }
  };

  const handleUnfocusTower = () => {
    setFocusedTowerName(null);
    setSelectedFloorNumber(null);
  };

  // Helper to get defect evidence for a tower
  const getTowerDefect = (projectId: string, towerName: string): DefectEvidence | undefined => {
    return DEFECT_PHOTOS[projectId]?.[towerName];
  };

  // ============================================================
  // RENDER: BUILDING OVERVIEW HOVER POPOVER
  // ============================================================
  const renderHoverPopover = () => {
    if (!hoveredBuilding) return null;
    const { tower, project, defect, billboard } = hoveredBuilding;
    const locality = LOCALITY_MAP[project.id] || project.city;
    const hasDefect = !!defect;

    return (
      <div
        className="fixed z-50 pointer-events-none -translate-x-1/2 -translate-y-full mb-3 bg-[#17191D] text-white p-3.5 rounded-xl shadow-2xl text-xs space-y-2.5 border border-slate-700 animate-in fade-in zoom-in-95 duration-150 max-w-[320px]"
        style={{ left: hoveredBuilding.x, top: hoveredBuilding.y - 10 }}
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-700/80 pb-2">
          <div>
            <div className="font-extrabold text-white text-sm flex items-center gap-1.5">
              <span>{tower.name}</span>
              <span className="text-[10px] text-teal-400 font-mono font-normal">({project.name})</span>
            </div>
            <span className="text-[10px] text-slate-400 block">{locality}</span>
          </div>
          <span className={clsx(
            'text-[10px] font-bold px-1.5 py-0.5 rounded',
            tower.status === 'Delayed' ? 'bg-rose-900/80 text-rose-200' : 'bg-teal-900/80 text-teal-200'
          )}>
            {tower.actualProgress}% Complete
          </span>
        </div>

        {/* Small Image Preview */}
        <div className="flex items-center gap-2.5">
          <div className="w-20 h-14 rounded-lg overflow-hidden bg-slate-800 flex-shrink-0 border border-slate-700">
            <img
              src={hasDefect ? defect.image : (billboard || '/projects/billboards/meridian-billboard.jpg')}
              alt={tower.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="space-y-0.5 flex-1 min-w-0">
            <div className="text-[11px] text-slate-300 font-medium">
              Stage: <strong className="text-white">{tower.currentStage}</strong>
            </div>
            <div className="text-[11px] text-slate-300">
              Slabs Cast: <strong className="text-teal-400 tabular-nums">{tower.completedFloors}</strong> of {tower.totalFloors}
            </div>
            <div className="text-[10px] text-slate-400">
              Contractor: <span className="font-mono text-slate-300">{tower.contractorId}</span>
            </div>
          </div>
        </div>

        {/* Status Callout */}
        {hasDefect ? (
          <div className="p-2 rounded bg-rose-950/80 border border-rose-800/80 space-y-1">
            <div className="flex items-center gap-1 text-[11px] font-bold text-rose-300">
              <ShieldAlert size={12} className="text-rose-400 flex-shrink-0" />
              <span>Floor {defect.floor} Critical Hold ({defect.ncId})</span>
            </div>
            <p className="text-[10px] text-rose-200/90 leading-tight line-clamp-2">
              {defect.statement}
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-400">
            <CheckCircle2 size={13} className="text-emerald-400" />
            <span>Pre-pour inspections cleared · On schedule</span>
          </div>
        )}

        <div className="text-[9px] text-slate-400 text-center pt-0.5 border-t border-slate-800">
          Click building to zoom into full floor-by-floor inspection
        </div>
      </div>
    );
  };

  // ============================================================
  // TIER 1: ALL-PROJECTS OVERVIEW
  // ============================================================
  if (!currentProject) {
    return (
      <div className="space-y-4 pb-12 animate-in fade-in duration-200">
        {/* 2 SIDE-BY-SIDE DROPDOWNS: Location & Project */}
        <div className="bg-white border border-[#E6E9ED] rounded-xl p-4 shadow-2xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#F1F5F9]">
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-[#17191D] uppercase tracking-wider">
                WIP Construction Intelligence
              </h1>
              <span className="text-xs text-[#6B7280]">
                · Multi-Project Building Skyline & Slab Progress
              </span>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <div className="relative">
                <Search size={13} className="absolute left-2.5 top-2.5 text-[#8B93A1]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search project, tower..."
                  className="h-8.5 pl-8 pr-3 text-xs bg-[#F6F7F8] hover:bg-[#F1F3F5] border border-[#E6E9ED] rounded-lg outline-none text-[#17191D] w-44 focus:bg-white focus:border-[#006B5B] transition-all"
                />
              </div>

              {(selectedCity !== 'All Locations' || selectedStatusFilter !== 'All Statuses' || searchQuery) && (
                <button
                  onClick={() => {
                    setSelectedCity('All Locations');
                    setSelectedStatusFilter('All Statuses');
                    setSearchQuery('');
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
              <label className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider block mb-1">
                Location
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#1E3A8A]">
                  <MapPin size={16} />
                </div>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
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
              <label className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider block mb-1">
                Project
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#1E3A8A]">
                  <Building2 size={16} />
                </div>
                <select
                  value={selectedProjectId || 'ALL'}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'ALL') {
                      handleBackToAllProjects();
                    } else {
                      handleSelectProject(val);
                    }
                  }}
                  className="h-10 w-full pl-9 pr-8 bg-white border border-slate-300 rounded-lg text-xs font-bold text-[#17191D] focus:outline-none focus:border-[#1E3A8A] shadow-2xs appearance-none cursor-pointer"
                >
                  <option value="ALL">All Projects ({filteredProjects.length})</option>
                  {filteredProjects.map(p => (
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
            1. 4-CARD EXECUTIVE KPI PLANNED VS ACTUAL COMPLETION STRIP
            - High-contrast 3xl bold typography for instant readability
            - Explicit Planned Target vs Actual Progress comparison
            - Schedule variance in days and portfolio handover drift
            ============================================================ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Card 1: Physical Execution Pace */}
          <div className="bg-white border border-[#E6E9ED] rounded-xl p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">
                Physical Execution Pace
              </span>
              <span className={clsx(
                'px-2 py-0.5 rounded text-[11px] font-bold tabular-nums',
                summaryMetrics.progressVariance < 0
                  ? 'bg-rose-50 text-[#D92D20] border border-rose-200'
                  : 'bg-teal-50 text-[#006B5B] border border-teal-200'
              )}>
                {summaryMetrics.progressVariance}% Variance
              </span>
            </div>
            <div className="mt-2.5 flex items-baseline gap-2">
              <span className="text-3xl font-black text-[#17191D] tabular-nums tracking-tight">
                {summaryMetrics.overallActualProgress}%
              </span>
              <span className="text-xs font-bold text-[#6B7280] tabular-nums">
                Planned: <strong className="text-slate-900 font-extrabold">{summaryMetrics.overallPlannedProgress}%</strong>
              </span>
            </div>
            {/* Dual Progress Bar with Planned Milestone Tick */}
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden mt-2.5 border border-slate-200 relative">
              <div
                className={clsx(
                  'h-full rounded-full transition-all',
                  summaryMetrics.progressVariance < 0 ? 'bg-[#006B5B]' : 'bg-[#18845B]'
                )}
                style={{ width: `${summaryMetrics.overallActualProgress}%` }}
              />
              <div
                className="absolute top-0 bottom-0 w-1 bg-slate-800 z-10 shadow-xs"
                style={{ left: `${summaryMetrics.overallPlannedProgress}%` }}
                title={`Planned Target: ${summaryMetrics.overallPlannedProgress}%`}
              />
            </div>
            <span className="text-[11px] text-[#6B7280] font-medium block mt-2">
              Novade certified physical progress across portfolio
            </span>
          </div>

          {/* Card 2: Portfolio / Project Schedule Drift */}
          <div className="bg-white border border-[#E6E9ED] rounded-xl p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">
                {selectedProjectId ? 'Project Schedule Drift' : 'Portfolio Schedule Drift'}
              </span>
              <span className={clsx(
                'px-2 py-0.5 rounded text-[11px] font-bold tabular-nums border',
                scheduleDriftData.delayedCount > 0
                  ? 'bg-rose-50 text-[#D92D20] border-rose-200'
                  : 'bg-emerald-50 text-[#18845B] border-emerald-200'
              )}>
                {scheduleDriftData.delayedCount > 0 ? `${scheduleDriftData.delayedCount} Delayed Towers` : 'All On Track'}
              </span>
            </div>
            <div className="mt-2.5 flex items-baseline gap-2">
              <span className={clsx(
                'text-3xl font-black tabular-nums tracking-tight',
                scheduleDriftData.avgLag < 0 ? 'text-[#D92D20]' : 'text-[#18845B]'
              )}>
                {scheduleDriftData.avgLag < 0 ? `${scheduleDriftData.avgLag} Days` : `+${scheduleDriftData.avgLag} Days`}
              </span>
              <span className="text-xs font-bold text-slate-500">
                {scheduleDriftData.avgLag < 0 ? 'Avg Schedule Lag' : 'Ahead of Schedule'}
              </span>
            </div>
            <div className="mt-2 text-xs font-semibold text-[#17191D]">
              Baseline: <strong className="text-slate-700">{scheduleDriftData.baselineText}</strong> · Forecast:{' '}
              <strong className={clsx('font-bold', scheduleDriftData.avgLag < 0 ? 'text-[#D92D20]' : 'text-[#18845B]')}>
                {scheduleDriftData.forecastText}
              </strong>
            </div>
            <span className="text-[11px] text-[#6B7280] font-medium block mt-1 truncate">
              {scheduleDriftData.topCriticalText}
            </span>
          </div>

          {/* Card 3: Superstructure Slabs Cast */}
          <div className="bg-white border border-[#E6E9ED] rounded-xl p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">
                Superstructure Slabs Cast
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-teal-50 text-[#006B5B] border border-teal-200 tabular-nums">
                {Math.round((portfolioCastSlabs / Math.max(1, portfolioTotalSlabs)) * 100)}% Cast
              </span>
            </div>
            <div className="mt-2.5 flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-[#006B5B] tabular-nums tracking-tight">
                {portfolioCastSlabs}
              </span>
              <span className="text-base font-bold text-slate-400 tabular-nums">
                / {portfolioTotalSlabs} Slabs
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden mt-2.5 border border-slate-200">
              <div
                className="h-full rounded-full transition-all bg-[#006B5B]"
                style={{ width: `${Math.round((portfolioCastSlabs / Math.max(1, portfolioTotalSlabs)) * 100)}%` }}
              />
            </div>
            <span className="text-[11px] text-[#6B7280] font-medium block mt-2">
              {summaryMetrics.buildingsUnderConstruction} Towers actively pouring concrete
            </span>
          </div>

          {/* Card 4: Milestone Delivery Status */}
          <div className="bg-white border border-[#E6E9ED] rounded-xl p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">
                Milestone Delivery Status
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-[#18845B] border border-emerald-200 tabular-nums">
                {summaryMetrics.totalBuildings - summaryMetrics.buildingsDelayed} On Milestone
              </span>
            </div>
            <div className="mt-2.5 flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-[#17191D] tabular-nums tracking-tight">
                {summaryMetrics.totalBuildings - summaryMetrics.buildingsDelayed}
              </span>
              <span className="text-base font-bold text-slate-400 tabular-nums">
                / {summaryMetrics.totalBuildings} Buildings
              </span>
            </div>
            <div className="mt-2 text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#18845B]" />
              <span>{summaryMetrics.buildingsCompleted} In Handover Phase</span>
              <span className="text-slate-300">·</span>
              <span className="text-[#D92D20] font-bold">1 Stop-Work Hold</span>
            </div>
            <span className="text-[11px] text-[#6B7280] font-medium block mt-1">
              IS 456 Structural compliance & pre-pour verification
            </span>
          </div>
        </div>

        {/* FULL-WIDTH SUPERSTRUCTURE SKYLINE (ALL PROJECTS) */}
        <div className="bg-white border border-[#E6E9ED] rounded-xl shadow-2xs overflow-hidden">
          <div className="px-5 py-3 border-b border-[#F1F5F9] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Building2 size={16} className="text-[#006B5B]" />
              <h2 className="text-sm font-bold text-[#17191D]">
                Multi-Project Building Skyline
              </h2>
              <span className="text-xs text-[#6B7280]">
                · Hover over any building for overview window & photo evidence
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs font-medium text-[#6B7280]">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#006B5B]" />
                <span className="text-[11px]">Cast Slabs</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#2563EB]" />
                <span className="text-[11px]">Active Pouring</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#D92D20]" />
                <span className="text-[11px]">Defect Hold</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-slate-200 border border-slate-300" />
                <span className="text-[11px]">Unbuilt</span>
              </span>
            </div>
          </div>

          {/* Architectural Skyline Canvas */}
          <div className="relative p-6 bg-[#FAFBFB] flex items-end justify-start gap-8 overflow-x-auto min-h-[300px]">
            {filteredProjects.map(project => {
              const towers = TOWERS_DATA.filter(t => t.projectId === project.id);
              const isCritHold = project.id === 'P004';
              const isDelayed = project.delayedBuildings > 0;
              const locality = LOCALITY_MAP[project.id] || project.city;

              return (
                <div
                  key={project.id}
                  onClick={() => handleSelectProject(project.id)}
                  className={clsx(
                    'flex flex-col items-center p-3 rounded-xl border transition-all cursor-pointer group hover:shadow-md hover:border-[#006B5B]/50',
                    isCritHold
                      ? 'border-red-200 bg-red-50/20'
                      : isDelayed
                      ? 'border-amber-200 bg-amber-50/20'
                      : 'border-slate-200 bg-white/80'
                  )}
                  style={{ minWidth: towers.length * 75 + 32 }}
                >
                  {/* Towers Group */}
                  <div className="flex items-end justify-center gap-3.5 w-full">
                    {towers.map(tower => {
                      const total = tower.totalFloors;
                      const completed = tower.completedFloors;
                      const active = completed + 1;
                      const defect = getTowerDefect(project.id, tower.name);
                      const isTroubled = !!defect;

                      return (
                        <div
                          key={tower.id}
                          className="flex flex-col items-center group/tower relative"
                          style={{ width: 50 }}
                          onMouseEnter={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setHoveredBuilding({
                              x: rect.left + rect.width / 2,
                              y: rect.top,
                              tower,
                              project,
                              defect,
                              billboard: PROJECT_IMAGES[project.id]
                            });
                          }}
                          onMouseLeave={() => setHoveredBuilding(null)}
                        >
                          <span className={clsx(
                            'text-xs font-black tabular-nums mb-1 tracking-tight',
                            tower.status === 'Delayed' ? 'text-[#D92D20]' : 'text-[#006B5B]'
                          )}>
                            {tower.actualProgress}%
                          </span>

                          {/* Slabs Stack */}
                          <div className="w-10 flex flex-col gap-0.5">
                            {/* Roof Parapet (Neutral architectural slate cap) */}
                            <div
                              className="w-full h-1.5 rounded-t-sm bg-slate-800"
                            />

                            {/* Stacked Floor Slabs - From Top Floor down to Ground Floor */}
                            {Array.from({ length: total }, (_, idx) => total - idx).map(fNum => {
                              const isCrit = isTroubled && defect?.floor === fNum;
                              const isDone = fNum <= completed;
                              const isCur = fNum === active;

                              let bg = '#E2E8F0'; // Unbuilt
                              if (isCrit) bg = '#D92D20';
                              else if (isDone) bg = '#006B5B';
                              else if (isCur) bg = '#2563EB'; // Vibrant Blue for Active Pouring

                              return (
                                <div
                                  key={fNum}
                                  className={clsx(
                                    'w-full h-1.5 rounded-[1px] transition-transform hover:scale-125 hover:z-20',
                                    isCrit && 'animate-pulse'
                                  )}
                                  style={{ backgroundColor: bg }}
                                />
                              );
                            })}

                            {/* Foundation */}
                            <div className="w-full h-1 bg-slate-500 rounded-b-sm" />
                          </div>

                          <span className="text-xs font-bold text-[#17191D] mt-1.5 truncate max-w-[60px]">
                            {tower.name.replace('Tower ', 'T')}
                          </span>
                          <span className="text-[10px] font-bold text-slate-500 tabular-nums">
                            {completed}/{total} fl
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Project Base Label */}
                  <div className="mt-2.5 pt-1.5 border-t border-slate-200/60 w-full text-center">
                    <span className="text-xs font-bold text-[#17191D] block truncate">
                      {project.name}
                    </span>
                    <span className="text-[10px] text-[#006B5B] font-semibold block">
                      {locality}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* OVERALL SUMMARY OF EACH PROJECT (EXECUTIVE ROWS TABLE) */}
        <div className="bg-white border border-[#E6E9ED] rounded-xl shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-[#E6E9ED] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <Building2 size={16} className="text-[#006B5B]" />
                <h2 className="text-sm font-bold text-[#17191D]">
                  Project Construction Portfolios — Planned vs Certified Actual Progress
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 tabular-nums">
                  {filteredProjects.length} Projects Tracked
                </span>
              </div>
              <p className="text-xs text-[#6B7280] mt-0.5">
                Comparing Primavera P6 baseline schedule against certified physical progress and handover forecast dates
              </p>
            </div>

            <span className="text-xs text-[#8B93A1]">
              Click any project row to open building-level inspection
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[950px]">
              <thead>
                <tr className="bg-[#F8F9FA] border-b border-[#E6E9ED] text-[#6B7280] font-semibold">
                  <th className="py-3 px-4">Project</th>
                  <th className="py-3 px-3">Stage</th>
                  <th className="py-3 px-3">Planned vs Actual Progress</th>
                  <th className="py-3 px-3">Handover Timeline</th>
                  <th className="py-3 px-3">Slabs Cast</th>
                  <th className="py-3 px-3">Buildings</th>
                  <th className="py-3 px-3">Site Leadership</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-3 text-center w-16"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6E9ED]">
                {filteredProjects.map(project => {
                  const towers = TOWERS_DATA.filter(t => t.projectId === project.id);
                  const totalFloors = towers.reduce((acc, t) => acc + t.totalFloors, 0);
                  const completedFloors = towers.reduce((acc, t) => acc + t.completedFloors, 0);
                  const pctFloors = Math.round((completedFloors / Math.max(1, totalFloors)) * 100);
                  const isCritHold = project.id === 'P004';
                  const locality = LOCALITY_MAP[project.id] || project.city;
                  const completionData = getProjectCompletionData(project);

                  return (
                    <tr
                      key={project.id}
                      onClick={() => handleSelectProject(project.id)}
                      className="hover:bg-[#F8F9FA] transition-colors cursor-pointer group"
                    >
                      {/* Project & Locality */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-sm text-[#17191D] group-hover:text-[#006B5B] transition-colors">
                          {project.name}
                        </div>
                        <div className="text-xs text-[#6B7280] flex items-center gap-1 mt-0.5">
                          <MapPin size={12} className="text-[#006B5B] shrink-0" />
                          <span>{locality}</span>
                        </div>
                      </td>

                      {/* Stage */}
                      <td className="py-3.5 px-3">
                        <span className="font-semibold text-slate-800 text-xs">{project.stage}</span>
                      </td>

                      {/* Planned vs Actual Progress (Big Bold Numbers & Dual Bar) */}
                      <td className="py-3.5 px-3">
                        <div className="space-y-1.5 min-w-[150px]">
                          <div className="flex items-baseline justify-between gap-2">
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-base font-black text-[#17191D] tabular-nums tracking-tight">
                                {project.progressPercentage}%
                              </span>
                              <span className="text-xs text-slate-500 font-semibold tabular-nums">
                                Target: {project.targetProgressPercentage}%
                              </span>
                            </div>
                            <span className={clsx(
                              'text-[10px] font-bold px-1.5 py-0.2 rounded tabular-nums',
                              completionData.variancePct < 0
                                ? 'bg-rose-50 text-[#D92D20] border border-rose-200'
                                : 'bg-teal-50 text-[#006B5B] border border-teal-200'
                            )}>
                              {completionData.variancePct < 0 ? `${completionData.variancePct}% Lag` : `+${completionData.variancePct}%`}
                            </span>
                          </div>
                          {/* Dual progress bar with target tick line */}
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200 relative">
                            <div
                              className={clsx(
                                'h-full rounded-full transition-all',
                                isCritHold ? 'bg-[#D92D20]' : completionData.variancePct < 0 ? 'bg-[#006B5B]' : 'bg-[#18845B]'
                              )}
                              style={{ width: `${project.progressPercentage}%` }}
                            />
                            <div
                              className="absolute top-0 bottom-0 w-1 bg-slate-800 z-10"
                              style={{ left: `${project.targetProgressPercentage}%` }}
                              title={`Planned Milestone: ${project.targetProgressPercentage}%`}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Handover Timeline (Target vs Forecast) */}
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-xs text-[#17191D]">
                          Target: {completionData.targetFormatted}
                        </div>
                        <div className={clsx(
                          'text-xs font-bold mt-0.5 flex items-center gap-1',
                          completionData.isDelayed ? 'text-[#D92D20]' : 'text-[#18845B]'
                        )}>
                          <span>Forecast: {completionData.forecastFormatted}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          {completionData.isDelayed ? `${completionData.delayDays}d Schedule Slippage` : 'On Milestone Schedule'}
                        </div>
                      </td>

                      {/* Slabs Completed (Big Bold Numbers) */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-baseline gap-1">
                          <span className="text-base font-black text-[#17191D] tabular-nums">
                            {completedFloors}
                          </span>
                          <span className="text-xs text-slate-500 font-semibold tabular-nums">
                            / {totalFloors} Slabs
                          </span>
                        </div>
                        <div className="text-xs font-bold text-[#006B5B] tabular-nums mt-0.5">
                          {pctFloors}% Cast & Inspected
                        </div>
                      </td>

                      {/* Buildings / Towers */}
                      <td className="py-3.5 px-3">
                        <div className="text-sm font-bold text-[#17191D] tabular-nums">
                          {towers.length} Buildings
                        </div>
                        <div className="text-xs mt-0.5">
                          {project.delayedBuildings > 0 ? (
                            <span className="text-[#D92D20] font-bold">
                              {project.delayedBuildings} Delayed
                            </span>
                          ) : (
                            <span className="text-[#18845B] font-medium">All On Track</span>
                          )}
                        </div>
                      </td>

                      {/* Site Leadership */}
                      <td className="py-3.5 px-3">
                        <div className="text-xs text-slate-800 font-semibold">
                          PM: <span className="font-bold">{project.projectManager}</span>
                        </div>
                        <div className="text-xs text-[#6B7280] mt-0.5">
                          QA: {project.qualityLead}
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-3 text-center">
                        {isCritHold ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#D92D20]/10 text-[#D92D20] border border-[#D92D20]/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#D92D20] animate-pulse" />
                            <span>Critical Hold</span>
                          </span>
                        ) : completionData.isDelayed ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#B7791F]/10 text-[#B7791F] border border-[#B7791F]/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#B7791F]" />
                            <span>Delayed</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#18845B]/10 text-[#18845B] border border-[#18845B]/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#18845B]" />
                            <span>On Track</span>
                          </span>
                        )}
                      </td>

                      {/* Action Chevron */}
                      <td className="py-3.5 px-3 text-center">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 group-hover:bg-[#006B5B] group-hover:text-white text-xs font-bold transition-all inline-flex items-center gap-1 shadow-2xs">
                          <span>Inspect</span>
                          <ChevronRight size={12} />
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Hover Popover */}
        {renderHoverPopover()}
      </div>
    );
  }

  // ============================================================
  // TIER 2 & TIER 3: SELECTED PROJECT VIEW
  // Left: Buildings Column (Expands to bottom, not scrollable)
  // Right: 2/3 width structured overview of all buildings OR focused building
  // ============================================================
  const isProjectCritical = currentProject.id === 'P004';
  const totalProjectFloors = currentTowers.reduce((a, b) => a + b.totalFloors, 0);
  const totalCompletedFloors = currentTowers.reduce((a, b) => a + b.completedFloors, 0);
  const currentCompletion = getProjectCompletionData(currentProject);
  const projectCurveData = getProgressCurveData(undefined, currentProject.id);

  return (
    <div className="space-y-4 pb-12 animate-in fade-in duration-200">
      {/* Top Breadcrumb & Project Header */}
      <div className="bg-white border border-[#E6E9ED] rounded-xl p-4 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Clear Senior-Friendly Back Button */}
            <button
              onClick={handleBackToAllProjects}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E6E9ED] bg-slate-50 hover:bg-slate-100 text-xs font-bold text-[#17191D] transition-colors shadow-2xs"
            >
              <ArrowLeft size={14} className="text-[#006B5B]" />
              <span>All Projects</span>
            </button>

            <div className="h-6 w-px bg-slate-200 hidden sm:block" />

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#17191D]">
                  {currentProject.name}
                </h1>
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-[#E6F4F1] text-[#006B5B] border border-[#B3E0D8]">
                  {LOCALITY_MAP[currentProject.id] || currentProject.city}
                </span>

                {focusedTowerName ? (
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-[#17191D] text-white flex items-center gap-1">
                    <Building2 size={12} />
                    <span>Focusing on {focusedTowerName}</span>
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-700">
                    All {currentTowers.length} Buildings Overview
                  </span>
                )}

                {isProjectCritical && (
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-rose-100 text-[#D92D20] border border-rose-300 flex items-center gap-1">
                    <ShieldAlert size={12} />
                    <span>Tower 1 Floor 05 Defect Hold</span>
                  </span>
                )}
              </div>

              {/* Planned vs Actual Completion Bar in Header */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs mt-1.5">
                <span className="text-[#6B7280]">
                  Stage: <strong className="text-[#17191D] font-bold">{currentProject.stage}</strong>
                </span>
                <span className="text-[#6B7280]">
                  Physical Progress: <strong className="text-sm font-black text-[#17191D] tabular-nums">{currentProject.progressPercentage}%</strong>
                  <span className="text-xs font-bold text-slate-500 ml-1">
                    (Target: {currentProject.targetProgressPercentage}% · {currentCompletion.variancePct}% variance)
                  </span>
                </span>
                <span className="text-[#6B7280]">
                  Milestone Handover: <strong className="text-xs font-bold text-[#17191D]">{currentCompletion.targetFormatted}</strong>
                  <span className={clsx('font-bold ml-1 text-xs', currentCompletion.isDelayed ? 'text-[#D92D20]' : 'text-[#18845B]')}>
                    (Forecast: {currentCompletion.forecastFormatted} {currentCompletion.isDelayed ? `· +${currentCompletion.delayDays}d delay` : '· On Track'})
                  </span>
                </span>
                <span className="text-[#6B7280]">
                  PM: <strong className="text-slate-800 font-semibold">{currentProject.projectManager}</strong> · QA: <strong className="text-slate-800 font-semibold">{currentProject.qualityLead}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setUploadModalOpen(true)}
              className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#006B5B] hover:bg-[#00473E] text-white text-xs font-bold transition-all shadow-xs"
            >
              <Camera size={13} />
              <span>Upload Site Photo</span>
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================
          MAIN 2-PANE WORKSPACE:
          LEFT (1/3 or ~32%): Buildings Column (Stacked/Slabs)
          RIGHT (2/3 or ~68%): All Buildings Overview OR Focused Tower Detail
          ============================================================ */}
      <div className="grid grid-cols-12 gap-5 items-start">
        {/* ── LEFT COLUMN: PROJECT BUILDINGS ───────────────────── */}
        <div className="col-span-12 lg:col-span-4 xl:col-span-4 space-y-3">
          <div className="bg-white border border-[#E6E9ED] rounded-xl p-4 shadow-2xs space-y-3">
            {/* Header with Tower Dropdown Selector */}
            <div className="flex items-center justify-between pb-2.5 border-b border-[#F1F5F9] gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <Building2 size={16} className="text-[#006B5B] shrink-0" />
                <h3 className="text-xs font-bold text-[#17191D] uppercase tracking-wider truncate">
                  {focusedTower ? focusedTower.name : `Project Buildings (${currentTowers.length})`}
                </h3>
              </div>

              {/* Tower Dropdown Selector */}
              <div className="relative shrink-0">
                <select
                  value={focusedTowerName || 'ALL'}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'ALL') {
                      handleUnfocusTower();
                    } else {
                      handleFocusTower(val);
                    }
                  }}
                  className="h-8 pl-2.5 pr-7 bg-white border border-slate-300 rounded-lg text-xs font-bold text-[#17191D] focus:outline-none focus:border-[#006B5B] shadow-2xs appearance-none cursor-pointer"
                >
                  <option value="ALL">All Buildings ({currentTowers.length})</option>
                  {currentTowers.map(t => (
                    <option key={t.id} value={t.name}>
                      {t.name} ({t.completedFloors}/{t.totalFloors} Slabs)
                    </option>
                  ))}
                </select>
                <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
              </div>
            </div>

            {/* Instruction Cue */}
            <div className="p-2 rounded-lg bg-teal-50/60 border border-teal-100 text-[11px] text-[#006B5B] flex items-center gap-1.5">
              <HelpCircle size={13} className="shrink-0" />
              <span>{focusedTower ? 'Click any slab below to inspect its pre-pour sign-offs.' : 'Click any building or use the dropdown to zoom into its slabs.'}</span>
            </div>

            {/* Content: Either All 3 Buildings Side-by-Side OR Just 1 Focused Building */}
            {focusedTower ? (
              /* SINGLE FOCUSED TOWER VIEW (REPLACES THE THREE) */
              (() => {
                const activeBuiltFloor = Math.min(
                  focusedTower.totalFloors,
                  focusedTower.completedFloors + (focusedTower.completedFloors < focusedTower.totalFloors ? 1 : 0)
                );
                const effectiveInspectFloor = selectedFloorNumber !== null && selectedFloorNumber <= activeBuiltFloor
                  ? selectedFloorNumber
                  : activeBuiltFloor;

                return (
                  <div className="space-y-3">
                    <div className="rounded-xl border border-[#006B5B] ring-2 ring-[#006B5B]/20 bg-teal-50/10 p-4 transition-all shadow-2xs">
                      {/* Tower Header */}
                      <div className="flex items-start justify-between pb-2 border-b border-[#F1F5F9]">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-sm font-bold text-[#17191D]">
                              {focusedTower.name}
                            </h4>
                            {getTowerDefect(currentProject.id, focusedTower.name) && (
                              <span className="w-2 h-2 rounded-full bg-[#D92D20] animate-pulse" />
                            )}
                          </div>
                          <span className="text-[11px] text-[#6B7280]">
                            {focusedTower.currentStage} · {focusedTower.totalFloors} Slabs Total
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="text-base font-extrabold text-[#17191D] tabular-nums block leading-tight">
                            {focusedTower.actualProgress}%
                          </span>
                          <span className={clsx(
                            'text-[9px] font-bold px-1.5 py-0.5 rounded',
                            focusedTower.status === 'Delayed' ? 'bg-rose-100 text-[#D92D20]' : 'bg-teal-50 text-[#006B5B]'
                          )}>
                            {focusedTower.completedFloors}/{focusedTower.totalFloors} Cast
                          </span>
                        </div>
                      </div>

                      {/* Tower Engineering Specifications */}
                      <div className="mt-2.5 pt-2 border-t border-slate-200/80 grid grid-cols-2 gap-1.5 text-[10px]">
                        <div className="p-1.5 rounded bg-white border border-slate-200">
                          <span className="text-[#6B7280] block text-[9px] uppercase font-bold">Contractor</span>
                          <span className="font-bold text-[#17191D] truncate block">
                            {CONTRACTORS.find(c => c.id === focusedTower.contractorId)?.name || 'Civil Works'}
                          </span>
                        </div>
                        <div className="p-1.5 rounded bg-white border border-slate-200">
                          <span className="text-[#6B7280] block text-[9px] uppercase font-bold">Formwork System</span>
                          <span className="font-bold text-[#17191D] truncate block">
                            Mivan Monolithic
                          </span>
                        </div>
                        <div className="p-1.5 rounded bg-white border border-slate-200">
                          <span className="text-[#6B7280] block text-[9px] uppercase font-bold">Cycle Speed</span>
                          <span className="font-bold text-[#17191D] block">
                            {focusedTower.status === 'Delayed' ? '12.4 d/slab' : '7.8 d/slab'}
                          </span>
                        </div>
                        <div className="p-1.5 rounded bg-white border border-slate-200">
                          <span className="text-[#6B7280] block text-[9px] uppercase font-bold">Concrete Cast</span>
                          <span className="font-bold text-[#17191D] block">
                            {(focusedTower.completedFloors * 380).toLocaleString('en-IN')} m³
                          </span>
                        </div>
                      </div>

                      {/* Defect alert or On Track Callout */}
                      {(() => {
                        const defect = getTowerDefect(currentProject.id, focusedTower.name);
                        const activeFloor = focusedTower.completedFloors + 1;
                        if (defect) {
                          return (
                            <div className="mt-2.5 p-2 rounded-lg bg-red-50 border border-red-200 text-xs text-[#D92D20]">
                              <div className="flex items-center justify-between font-bold text-[11px]">
                                <span className="flex items-center gap-1">
                                  <ShieldAlert size={12} className="text-[#D92D20]" />
                                  <span>Floor {defect.floor} Defect Hold ({defect.ncId})</span>
                                </span>
                              </div>
                            </div>
                          );
                        }
                        return (
                          <div className="mt-2.5 p-1.5 rounded bg-emerald-50/50 border border-emerald-100 text-[10px] text-[#18845B] flex items-center justify-between">
                            <span className="flex items-center gap-1">
                              <CheckCircle2 size={11} className="text-[#18845B]" />
                              <span>Pouring Level {activeFloor}</span>
                            </span>
                            <span className="font-bold">On Schedule</span>
                          </div>
                        );
                      })()}

                      {/* Slabs Graph with Interactive Clickable Built Floors */}
                      <div className="mt-3 p-3 rounded-lg bg-[#FAFBFB] border border-slate-100 flex flex-col items-center">
                        <div className="w-full max-w-[200px] flex flex-col gap-1">
                          {/* Roof */}
                          <div className="w-full h-2 bg-slate-900 rounded-t-xs" />

                          {/* Slabs Stack - From Top Floor down to Ground Floor */}
                          {Array.from({ length: focusedTower.totalFloors }, (_, idx) => focusedTower.totalFloors - idx).map(fNum => {
                            const isDone = fNum <= focusedTower.completedFloors;
                            const activeFloor = focusedTower.completedFloors + 1;
                            const isCur = fNum === activeFloor;
                            const defect = getTowerDefect(currentProject.id, focusedTower.name);
                            const isCrit = !!defect && defect.floor === fNum;
                            const isUnbuilt = fNum > activeFloor;
                            const isSelected = effectiveInspectFloor === fNum;

                            let bg = '#F1F5F9';
                            if (isCrit) bg = '#D92D20';
                            else if (isDone) bg = '#006B5B';
                            else if (isCur) bg = '#2563EB';

                            return (
                              <div
                                key={fNum}
                                onClick={(e) => {
                                  if (isUnbuilt) {
                                    e.stopPropagation();
                                    return;
                                  }
                                  e.stopPropagation();
                                  setSelectedFloorNumber(fNum);
                                }}
                                className={clsx(
                                  'w-full h-3 rounded-[2px] transition-all flex items-center justify-between px-1.5 text-[8px] font-bold select-none',
                                  isUnbuilt
                                    ? 'bg-slate-100 border border-dashed border-slate-300 text-slate-300 cursor-not-allowed opacity-50'
                                    : 'cursor-pointer text-white hover:brightness-110',
                                  isSelected && 'ring-2 ring-black scale-102 shadow-xs z-10',
                                  isCrit && 'animate-pulse'
                                )}
                                style={{ backgroundColor: isUnbuilt ? undefined : bg }}
                                title={isUnbuilt ? `Floor ${fNum}: Unbuilt (No inspection logs yet)` : `Floor ${fNum}: Built (Click to inspect)`}
                              >
                                <span>F{String(fNum).padStart(2, '0')}</span>
                                <span className="text-[7px] uppercase tracking-tight opacity-90">
                                  {isUnbuilt ? '' : isCrit ? 'HOLD' : isCur ? 'POUR' : 'DONE'}
                                </span>
                              </div>
                            );
                          })}

                          {/* Foundation */}
                          <div className="w-full h-2.5 bg-slate-700 rounded-b-xs flex items-center justify-center text-[8px] text-white font-bold">
                            RAFT FOUNDATION
                          </div>
                        </div>
                      </div>

                      {/* Return button */}
                      <div className="mt-3 pt-2 border-t border-slate-100">
                        <button
                          onClick={handleUnfocusTower}
                          className="w-full py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-[#006B5B] hover:text-white text-slate-800"
                        >
                          <ArrowLeft size={12} />
                          <span>View All {currentTowers.length} Buildings Side-by-Side</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()
            ) : (
              /* ALL TOWERS CLUBBED TOGETHER SIDE BY SIDE (JUST LIKE IN ALL LOCATIONS GRAPH) */
              <div className="p-4 bg-[#FAFBFB] rounded-xl border border-slate-200 flex flex-col items-center">
                <div className="w-full flex items-center justify-between text-[11px] text-[#6B7280] font-medium pb-2 mb-2 border-b border-slate-200/60">
                  <span>Superstructure Skyline</span>
                  <span className="text-[#006B5B] font-bold">Click building to focus</span>
                </div>

                {/* Side-by-side towers */}
                <div className="flex items-end justify-center gap-3 sm:gap-5 py-4 w-full">
                  {currentTowers.map(tower => {
                    const total = tower.totalFloors;
                    const completed = tower.completedFloors;
                    const active = completed + 1;
                    const defect = getTowerDefect(currentProject.id, tower.name);
                    const isTroubled = !!defect;

                    return (
                      <div
                        key={tower.id}
                        onClick={() => handleFocusTower(tower.name)}
                        className="flex flex-col items-center cursor-pointer group hover:scale-105 transition-all"
                      >
                        {/* Slabs Column */}
                        <div className="w-14 sm:w-16 flex flex-col gap-[1.5px] p-1 bg-white border border-slate-200 rounded-t shadow-xs group-hover:border-[#006B5B] group-hover:shadow-md transition-all">
                          {/* Roof */}
                          <div className="w-full h-1.5 bg-slate-800 rounded-t-xs" />

                          {/* Stacked Floor Slabs - From Top Floor down to Ground Floor */}
                          {Array.from({ length: total }, (_, idx) => total - idx).map(fNum => {
                            const isCrit = isTroubled && defect?.floor === fNum;
                            const isDone = fNum <= completed;
                            const isCur = fNum === active;

                            let bg = '#E2E8F0';
                            if (isCrit) bg = '#D92D20';
                            else if (isDone) bg = '#006B5B';
                            else if (isCur) bg = '#2563EB';

                            return (
                              <div
                                key={fNum}
                                className={clsx(
                                  'w-full h-1.5 rounded-[1px] transition-transform',
                                  isCrit && 'animate-pulse'
                                )}
                                style={{ backgroundColor: bg }}
                              />
                            );
                          })}

                          {/* Foundation */}
                          <div className="w-full h-1.5 bg-slate-600 rounded-b-xs" />
                        </div>

                        {/* Tower Label & Progress */}
                        <span className="text-xs font-bold text-[#17191D] mt-2 group-hover:text-[#006B5B] transition-colors">
                          {tower.name}
                        </span>
                        <span className="text-xs font-bold text-slate-800 tabular-nums">
                          {completed}/{total} Slabs
                        </span>
                        <span className="text-xs font-black text-[#006B5B] tabular-nums">
                          {tower.actualProgress}%
                        </span>
                        {isTroubled ? (
                          <span className="mt-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-[#D92D20] border border-rose-200">
                            Hold (F{defect.floor})
                          </span>
                        ) : (
                          <span className="mt-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-[#006B5B] border border-teal-200">
                            Pouring L{active}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="mt-3 pt-2.5 border-t border-slate-200/60 w-full flex items-center justify-center gap-3 text-[10px] font-semibold text-[#6B7280] flex-wrap">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-xs bg-[#006B5B]" />
                    <span>Cast Slabs</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-xs bg-[#2563EB]" />
                    <span>Active Pour</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-xs bg-[#D92D20]" />
                    <span>Defect Hold</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-xs bg-[#E2E8F0]" />
                    <span>Upcoming</span>
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT COLUMN (2/3 WIDTH): DETAILED SECTIONS ──────── */}
        <div className="col-span-12 lg:col-span-8 xl:col-span-8 space-y-4">
          {/* ======================================================
              STATE A: FOCUSED TOWER DEEP-DIVE (When a building is clicked)
              Highlights Critical & Major inspections on TOP,
              Followed by floor-by-floor inspection matrix.
              ====================================================== */}
          {focusedTower ? (
            (() => {
              const activeBuiltFloor = Math.min(
                focusedTower.totalFloors,
                focusedTower.completedFloors + (focusedTower.completedFloors < focusedTower.totalFloors ? 1 : 0)
              );
              const effectiveInspectFloor = selectedFloorNumber !== null && selectedFloorNumber <= activeBuiltFloor
                ? selectedFloorNumber
                : activeBuiltFloor;
              const contractor = CONTRACTORS.find(c => c.id === focusedTower.contractorId);

              return (
                <div className="space-y-4">
                  {/* Focused Tower Header Bar */}
                  <div className="bg-white border border-[#E6E9ED] rounded-xl p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-[#006B5B] text-white">
                          {focusedTower.name}
                        </span>
                        <h3 className="text-base font-bold text-[#17191D]">
                          Tower Superstructure & Floor Inspection Deep-Dive
                        </h3>
                      </div>
                      <p className="text-xs text-[#6B7280] mt-0.5">
                        {focusedTower.currentStage} · {activeBuiltFloor} of {focusedTower.totalFloors} floors cast · Lead Contractor: <strong>{contractor?.name || 'Civil Works'}</strong>
                      </p>
                    </div>

                    <button
                      onClick={handleUnfocusTower}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-colors self-start sm:self-auto"
                    >
                      <ArrowLeft size={12} />
                      <span>Back to All Buildings Overview</span>
                    </button>
                  </div>

                  {/* ── SECTION 1: TOWER EXECUTIVE PERFORMANCE KPIS ─────── */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {/* Metric 1: Cycle Time */}
                    <div className="bg-white border border-[#E6E9ED] rounded-xl p-3.5 shadow-2xs">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280] block mb-1">
                        Superstructure Velocity
                      </span>
                      <div className="flex items-baseline gap-1.5">
                        <span className={clsx(
                          'text-2xl font-black tabular-nums tracking-tight',
                          focusedTower.status === 'Delayed' ? 'text-[#D92D20]' : 'text-[#006B5B]'
                        )}>
                          {focusedTower.status === 'Delayed' ? '12.4' : '7.8'}
                        </span>
                        <span className="text-xs font-bold text-[#6B7280]">Days / Slab</span>
                      </div>
                      <p className="text-[10px] text-[#6B7280] mt-0.5">
                        Target: <strong>8.0 Days</strong> · Mivan Shuttering
                      </p>
                    </div>

                    {/* Metric 2: Material Telemetry */}
                    <div className="bg-white border border-[#E6E9ED] rounded-xl p-3.5 shadow-2xs">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280] block mb-1">
                        Concrete Cast Volume
                      </span>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-2xl font-black text-[#17191D] tabular-nums tracking-tight">
                          {(focusedTower.completedFloors * 380).toLocaleString('en-IN')}
                        </span>
                        <span className="text-xs font-bold text-[#6B7280]">m³ Cast</span>
                      </div>
                      <p className="text-[10px] text-[#6B7280] mt-0.5">
                        of {(focusedTower.totalFloors * 380).toLocaleString('en-IN')} m³ · M40 RMC
                      </p>
                    </div>

                    {/* Metric 3: Schedule Variance */}
                    <div className="bg-white border border-[#E6E9ED] rounded-xl p-3.5 shadow-2xs">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280] block mb-1">
                        Schedule Variance
                      </span>
                      <div className="flex items-baseline gap-1.5">
                        <span className={clsx(
                          'text-2xl font-black tabular-nums tracking-tight',
                          focusedTower.varianceDays < 0 ? 'text-[#D92D20]' : 'text-[#18845B]'
                        )}>
                          {focusedTower.varianceDays >= 0 ? `+${focusedTower.varianceDays}` : focusedTower.varianceDays}
                        </span>
                        <span className="text-xs font-bold text-[#6B7280]">Days Slippage</span>
                      </div>
                      <p className="text-[10px] text-[#6B7280] mt-0.5 truncate">
                        {focusedTower.varianceDays < 0 ? 'Driven by Cube Test Hold' : 'Tracking on Baseline'}
                      </p>
                    </div>

                    {/* Metric 4: Lead Contractor */}
                    <div className="bg-white border border-[#E6E9ED] rounded-xl p-3.5 shadow-2xs">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280] block mb-1">
                        Execution Contractor
                      </span>
                      <span className="text-sm font-bold text-[#17191D] block truncate">
                        {contractor?.name || 'Civil Works'}
                      </span>
                      <p className="text-[10px] text-[#6B7280] mt-0.5">
                        PM: {currentProject.projectManager} · QA: {currentProject.qualityLead}
                      </p>
                    </div>
                  </div>

                  {/* ── SECTION 2: CRITICAL STRUCTURAL HOLD OR COMPLIANCE CALLOUT ── */}
                  {(() => {
                    const defect = getTowerDefect(currentProject.id, focusedTower.name);
                    if (defect) {
                      return (
                        <div className="bg-red-50/80 border-2 border-red-300 rounded-xl p-4 shadow-xs space-y-3">
                          <div className="flex items-center justify-between pb-2 border-b border-red-200">
                            <div className="flex items-center gap-2">
                              <ShieldAlert size={18} className="text-[#D92D20] animate-pulse" />
                              <div>
                                <h4 className="text-xs font-extrabold text-[#D92D20] uppercase tracking-wider">
                                  Critical Structural Hold — Immediate Action Required
                                </h4>
                                <span className="text-[11px] text-slate-600">
                                  Logged on {defect.timestamp} by {defect.author}
                                </span>
                              </div>
                            </div>

                            <span className="px-2.5 py-1 rounded bg-[#D92D20] text-white text-[11px] font-bold">
                              Floor {defect.floor} Stop-Work
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                            {/* Defect Photo */}
                            <div className="relative rounded-lg overflow-hidden border border-red-200 aspect-[16/10] bg-slate-900">
                              <img
                                src={defect.image}
                                alt="Defect Evidence"
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute bottom-0 inset-x-0 bg-black/75 px-2 py-1 text-white text-[10px] flex items-center justify-between">
                                <span>Site Camera Upload</span>
                                <span className="font-mono">{defect.ncId}</span>
                              </div>
                            </div>

                            {/* Statement & Test Data */}
                            <div className="md:col-span-2 space-y-2">
                              <div className="p-3 bg-white rounded-lg border border-red-200 space-y-1">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                  Inspector Finding Statement:
                                </span>
                                <p className="text-xs font-semibold text-slate-800">
                                  "{defect.statement}"
                                </p>
                              </div>

                              <div className="flex flex-wrap items-center gap-2 pt-1">
                                <button
                                  onClick={() => {
                                    setTab('quality');
                                    selectNC(defect.ncId);
                                  }}
                                  className="px-3 py-1.5 rounded-lg bg-[#D92D20] text-white text-xs font-bold hover:bg-red-700 transition-colors flex items-center gap-1.5 shadow-2xs"
                                >
                                  <ShieldAlert size={13} />
                                  <span>Inspect Full NC Report ({defect.ncId})</span>
                                </button>

                                <button
                                  onClick={() => {
                                    setTab('quality');
                                  }}
                                  className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors flex items-center gap-1"
                                >
                                  <FileText size={13} />
                                  <span>View RMC Cube Test Logs</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 size={18} className="text-[#18845B]" />
                          <div>
                            <h4 className="text-xs font-bold text-[#18845B]">
                              All Structural & Concrete Inspections Cleared for {focusedTower.name}
                            </h4>
                            <span className="text-[11px] text-slate-600">
                              Zero critical holds. Cube test 28-day strengths compliant with IS 456 standards.
                            </span>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-[#18845B]">
                          Passed
                        </span>
                      </div>
                    );
                  })()}

                  {/* ── SECTION 3: ACTIVE BUILT FLOOR INSPECTION TELEMETRY ── */}
                  {(() => {
                    const floorRecord = towerFloors.find(f => f.floorNumber === effectiveInspectFloor);
                    const isCritHold = currentProject.id === 'P004' && focusedTower.name === 'Tower 1' && effectiveInspectFloor === 5;
                    const isCompleted = effectiveInspectFloor <= focusedTower.completedFloors;

                    return (
                      <div className={clsx(
                        'p-4 rounded-xl border transition-all shadow-2xs space-y-3',
                        isCritHold
                          ? 'bg-rose-50/60 border-rose-300'
                          : 'bg-white border-[#E6E9ED]'
                      )}>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[#F1F5F9]">
                          <div className="flex items-center gap-2">
                            <span className={clsx(
                              'px-2 py-0.5 rounded text-xs font-black font-mono',
                              isCritHold ? 'bg-[#D92D20] text-white' : isCompleted ? 'bg-[#006B5B] text-white' : 'bg-[#2563EB] text-white'
                            )}>
                              F{String(effectiveInspectFloor).padStart(2, '0')}
                            </span>
                            <div>
                              <h4 className="text-sm font-bold text-[#17191D] flex items-center gap-2 flex-wrap">
                                <span>Floor {String(effectiveInspectFloor).padStart(2, '0')} — {floorRecord?.stage || (isCompleted ? 'Slab Casting' : 'Active Concrete Pour')}</span>
                                <span className={clsx(
                                  'text-[10px] font-bold px-2 py-0.5 rounded-full',
                                  isCritHold ? 'bg-red-100 text-[#D92D20]' : isCompleted ? 'bg-emerald-100 text-[#18845B]' : 'bg-blue-100 text-[#2563EB]'
                                )}>
                                  {isCritHold ? 'Critical Defect Hold' : isCompleted ? 'Inspection Passed & Certified' : 'Active Concrete Pouring'}
                                </span>
                              </h4>
                              <span className="text-[11px] text-[#6B7280]">
                                Physical: <strong className="text-[#17191D]">{isCompleted ? 100 : floorRecord?.physicalProgress || 70}%</strong> · Inspected: <strong className="text-[#17191D]">{isCritHold ? 0 : isCompleted ? 100 : floorRecord?.inspectedProgress || 60}%</strong>
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-start sm:self-auto">
                            {floorRecord?.linkedWIRId && (
                              <button
                                onClick={() => {
                                  setTab('quality');
                                  selectWIR(floorRecord.linkedWIRId!);
                                }}
                                className="text-xs font-mono font-bold text-[#006B5B] hover:bg-teal-50 px-2 py-1 rounded border border-teal-200 transition-colors"
                              >
                                {floorRecord.linkedWIRId}
                              </button>
                            )}
                            {isCritHold && (
                              <button
                                onClick={() => {
                                  setTab('quality');
                                  selectNC('NC-0001');
                                }}
                                className="text-xs font-mono font-bold text-white bg-[#D92D20] hover:bg-red-700 px-2.5 py-1 rounded transition-colors shadow-2xs"
                              >
                                Inspect NC-0001
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Quality & Pre-Pour Checkpoints Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                          {/* Checkpoint 1: 28-Day Cube Compression */}
                          <div className="p-2.5 rounded-lg bg-[#FAFBFB] border border-slate-200">
                            <span className="text-[10px] font-bold uppercase text-[#6B7280] block">
                              28-Day Cube Strength
                            </span>
                            <div className="flex items-baseline gap-1 mt-0.5">
                              <span className={clsx(
                                'text-base font-black tabular-nums',
                                isCritHold ? 'text-[#D92D20]' : 'text-[#18845B]'
                              )}>
                                {isCritHold ? '18.4' : '34.8'}
                              </span>
                              <span className="text-[10px] font-bold text-[#6B7280]">/ 30.0 MPa</span>
                            </div>
                            <span className={clsx('text-[10px] font-bold block mt-0.5', isCritHold ? 'text-[#D92D20]' : 'text-[#18845B]')}>
                              {isCritHold ? 'FAILED (Core test pending)' : 'PASSED (IS 456 Compliant)'}
                            </span>
                          </div>

                          {/* Checkpoint 2: Cover Blocks & Spacing */}
                          <div className="p-2.5 rounded-lg bg-[#FAFBFB] border border-slate-200">
                            <span className="text-[10px] font-bold uppercase text-[#6B7280] block">
                              Cover Blocks & Rebar
                            </span>
                            <div className="flex items-center gap-1 mt-1 text-[#18845B] font-bold text-[11px]">
                              <CheckCircle2 size={13} />
                              <span>25mm Cover Verified</span>
                            </div>
                            <span className="text-[10px] text-[#6B7280] block mt-0.5">
                              150mm c/c mesh spacing
                            </span>
                          </div>

                          {/* Checkpoint 3: MEP Conduits & Plumbing Inserts */}
                          <div className="p-2.5 rounded-lg bg-[#FAFBFB] border border-slate-200">
                            <span className="text-[10px] font-bold uppercase text-[#6B7280] block">
                              MEP Embedments
                            </span>
                            <div className="flex items-center gap-1 mt-1 text-[#18845B] font-bold text-[11px]">
                              <CheckCircle2 size={13} />
                              <span>Conduits Passed</span>
                            </div>
                            <span className="text-[10px] text-[#6B7280] block mt-0.5">
                              MEP pre-pour clearance
                            </span>
                          </div>

                          {/* Checkpoint 4: Formwork De-shuttering */}
                          <div className="p-2.5 rounded-lg bg-[#FAFBFB] border border-slate-200">
                            <span className="text-[10px] font-bold uppercase text-[#6B7280] block">
                              Formwork De-shuttering
                            </span>
                            <span className="text-xs font-bold text-[#17191D] block mt-1">
                              {isCompleted ? 'De-shuttered (7d)' : isCritHold ? 'HOLD (Props in place)' : 'Props installed (L/4)'}
                            </span>
                            <span className="text-[10px] text-[#6B7280] block mt-0.5">
                              {isCompleted ? 'Clearance signed off' : 'IS 456 Table 5 compliance'}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* ── SECTION 4: FLOOR-BY-FLOOR INSPECTION MATRIX (BUILT FLOORS ONLY) ── */}
                  <div className="bg-white border border-[#E6E9ED] rounded-xl shadow-2xs overflow-hidden">
                    <div className="px-5 py-3 border-b border-[#F1F5F9] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-bold text-[#17191D]">
                          Floor-Wise Superstructure Register ({focusedTower.name})
                        </h4>
                        <p className="text-xs text-[#6B7280] mt-0.5">
                          Listing all {activeBuiltFloor} cast & active floors. Click any row to inspect pre-pour sign-offs.
                        </p>
                      </div>

                      {effectiveInspectFloor && (
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-teal-50 text-[#006B5B] border border-teal-200">
                          Active Floor: Floor {String(effectiveInspectFloor).padStart(2, '0')}
                        </span>
                      )}
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-[#E6E9ED] bg-slate-50/60 text-[#6B7280] font-bold">
                            <th className="py-2.5 px-4">Level</th>
                            <th className="py-2.5 px-3">Stage</th>
                            <th className="py-2.5 px-3">Physical Progress</th>
                            <th className="py-2.5 px-3">Inspected Progress</th>
                            <th className="py-2.5 px-3">Pre-Pour WIR</th>
                            <th className="py-2.5 px-3">Quality Hold</th>
                            <th className="py-2.5 px-3">Status</th>
                            <th className="py-2.5 px-4 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F1F5F9]">
                          {/* ONLY RENDER BUILT AND ACTIVELY POURING FLOORS - NO UNBUILT FLOORS */}
                          {Array.from({ length: activeBuiltFloor }, (_, idx) => activeBuiltFloor - idx).map(fNum => {
                            const floorRecord = towerFloors.find(f => f.floorNumber === fNum);
                            const isDone = fNum <= focusedTower.completedFloors;
                            const isCur = fNum === focusedTower.completedFloors + 1;
                            const isCrit = currentProject.id === 'P004' && focusedTower.name === 'Tower 1' && fNum === 5;
                            const isHighlighted = effectiveInspectFloor === fNum;

                            return (
                              <tr
                                key={fNum}
                                onClick={() => setSelectedFloorNumber(fNum)}
                                className={clsx(
                                  'cursor-pointer transition-colors',
                                  isHighlighted ? 'bg-teal-50/70 font-semibold' : 'hover:bg-slate-50',
                                  isCrit && 'bg-rose-50/70'
                                )}
                              >
                                <td className="py-2.5 px-4">
                                  <div className="flex items-center gap-1.5">
                                    <span className={clsx(
                                      'font-mono font-bold px-1.5 py-0.5 rounded text-[10px]',
                                      isCrit ? 'bg-red-200 text-red-900' : isDone ? 'bg-[#E6F4F1] text-[#006B5B]' : 'bg-blue-100 text-[#2563EB]'
                                    )}>
                                      F{String(fNum).padStart(2, '0')}
                                    </span>
                                    <span className="font-bold text-[#17191D]">
                                      Floor {String(fNum).padStart(2, '0')}
                                    </span>
                                  </div>
                                </td>

                                <td className="py-2.5 px-3 text-slate-700">
                                  {floorRecord?.stage || (isDone ? 'Slab casting' : 'Column casting')}
                                </td>

                                <td className="py-2.5 px-3">
                                  <div className="flex items-center gap-1.5">
                                    <div className="w-12 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                      <div
                                        className={clsx('h-full rounded-full', isCrit ? 'bg-red-500' : isDone ? 'bg-[#006B5B]' : 'bg-[#2563EB]')}
                                        style={{ width: `${isDone ? 100 : (floorRecord?.physicalProgress || 70)}%` }}
                                      />
                                    </div>
                                    <span className="font-mono text-[10px] tabular-nums font-bold">
                                      {isDone ? '100%' : `${floorRecord?.physicalProgress || 70}%`}
                                    </span>
                                  </div>
                                </td>

                                <td className="py-2.5 px-3">
                                  <div className="flex items-center gap-1.5">
                                    <div className="w-12 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                      <div
                                        className="h-full rounded-full bg-[#006B5B]"
                                        style={{ width: `${isCrit ? 0 : isDone ? 100 : (floorRecord?.inspectedProgress || 60)}%` }}
                                      />
                                    </div>
                                    <span className="font-mono text-[10px] tabular-nums">
                                      {isCrit ? '0%' : isDone ? '100%' : `${floorRecord?.inspectedProgress || 60}%`}
                                    </span>
                                  </div>
                                </td>

                                <td className="py-2.5 px-3">
                                  {floorRecord?.linkedWIRId ? (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setTab('quality');
                                        selectWIR(floorRecord.linkedWIRId!);
                                      }}
                                      className="text-[10px] font-mono font-bold text-[#006B5B] hover:underline"
                                    >
                                      {floorRecord.linkedWIRId}
                                    </button>
                                  ) : (
                                    <span className="text-slate-400 text-[10px] font-mono">WIR-PASSED</span>
                                  )}
                                </td>

                                <td className="py-2.5 px-3">
                                  {isCrit ? (
                                    <span className="text-[10px] font-bold text-[#D92D20] flex items-center gap-1">
                                      <ShieldAlert size={11} className="text-[#D92D20]" />
                                      <span>NC-0001 (Hold)</span>
                                    </span>
                                  ) : (
                                    <span className="text-[10px] font-medium text-[#18845B] flex items-center gap-1">
                                      <CheckCircle2 size={11} />
                                      <span>Clear</span>
                                    </span>
                                  )}
                                </td>

                                <td className="py-2.5 px-3">
                                  <span className={clsx(
                                    'px-2 py-0.5 rounded text-[10px] font-bold',
                                    isCrit ? 'bg-red-100 text-[#D92D20]' : isDone ? 'bg-emerald-50 text-[#18845B]' : 'bg-blue-50 text-[#2563EB]'
                                  )}>
                                    {isCrit ? 'Defect Hold' : isDone ? 'Completed' : 'Active Pour'}
                                  </span>
                                </td>

                                <td className="py-2.5 px-4 text-right">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedFloorNumber(fNum);
                                    }}
                                    className="text-[#006B5B] font-bold text-[11px] hover:underline"
                                  >
                                    {isHighlighted ? 'Selected' : 'Inspect'}
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Table Footer: Explaining hidden unbuilt floors */}
                    <div className="px-5 py-3 bg-[#FAFBFB] border-t border-[#F1F5F9] flex flex-col sm:flex-row sm:items-center justify-between text-xs text-[#6B7280] gap-2">
                      <span>
                        Showing all <strong className="text-[#17191D]">{activeBuiltFloor}</strong> cast and active superstructure levels.
                      </span>
                      <span className="text-[11px] font-medium text-slate-500">
                        {focusedTower.totalFloors - activeBuiltFloor} upcoming future floors pending formwork cycle initiation (hidden from inspection queue).
                      </span>
                    </div>
                  </div>
                </div>
              );
            })()
          ) : (
            /* ======================================================
               STATE B: OVERVIEW OF ALL BUILDINGS IN THIS PROJECT
               Divided into clean, organized executive sections:
               1. Key Metrics Strip
               2. Critical Holds & Defect Highlights
               3. Building Performance Matrix
               4. Active Work Packages
               ====================================================== */
            <div className="space-y-4">
              {/* ── SECTION 1: EXECUTIVE KPI SUMMARY STRIP (PROJECT PLANNED VS ACTUAL) ── */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Card 1: Physical Progress */}
                <div className="bg-white border border-[#E6E9ED] rounded-xl p-4 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#6B7280] font-bold uppercase tracking-wider block">
                      Physical Progress
                    </span>
                    <span className={clsx(
                      'text-[10px] font-bold px-1.5 py-0.2 rounded tabular-nums',
                      currentCompletion.variancePct < 0 ? 'bg-rose-50 text-[#D92D20] border border-rose-200' : 'bg-teal-50 text-[#006B5B] border border-teal-200'
                    )}>
                      {currentCompletion.variancePct}% Lag
                    </span>
                  </div>
                  <div className="mt-2 flex items-baseline gap-1.5">
                    <span className="text-3xl font-black text-[#17191D] tabular-nums tracking-tight">
                      {currentProject.progressPercentage}%
                    </span>
                    <span className="text-xs font-bold text-slate-500 tabular-nums">
                      Target: {currentProject.targetProgressPercentage}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mt-2 border border-slate-200 relative">
                    <div
                      className={clsx('h-full rounded-full transition-all', isProjectCritical ? 'bg-[#D92D20]' : 'bg-[#006B5B]')}
                      style={{ width: `${currentProject.progressPercentage}%` }}
                    />
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-slate-800 z-10"
                      style={{ left: `${currentProject.targetProgressPercentage}%` }}
                    />
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium mt-1.5 block">
                    Certified Novade site progress
                  </span>
                </div>

                {/* Card 2: Handover Milestone */}
                <div className="bg-white border border-[#E6E9ED] rounded-xl p-4 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#6B7280] font-bold uppercase tracking-wider block">
                      Handover Forecast
                    </span>
                    <span className={clsx(
                      'text-[10px] font-bold px-1.5 py-0.2 rounded tabular-nums',
                      currentCompletion.isDelayed ? 'bg-rose-50 text-[#D92D20] border border-rose-200' : 'bg-emerald-50 text-[#18845B] border border-emerald-200'
                    )}>
                      {currentCompletion.isDelayed ? `${currentCompletion.delayDays}d Lag` : 'On Track'}
                    </span>
                  </div>
                  <div className="mt-2 flex items-baseline gap-1.5">
                    <span className={clsx(
                      'text-2xl sm:text-3xl font-black tabular-nums tracking-tight truncate',
                      currentCompletion.isDelayed ? 'text-[#D92D20]' : 'text-[#17191D]'
                    )}>
                      {currentCompletion.forecastFormatted}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 font-semibold mt-1">
                    Target: <strong className="text-slate-800">{currentCompletion.targetFormatted}</strong>
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium mt-0.5 block">
                    {currentCompletion.isDelayed ? `Delayed due to ${currentProject.delayedBuildings} slow towers` : 'Milestone compliant'}
                  </span>
                </div>

                {/* Card 3: Slabs Cast */}
                <div className="bg-white border border-[#E6E9ED] rounded-xl p-4 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#6B7280] font-bold uppercase tracking-wider block">
                      Superstructure Slabs
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-teal-50 text-[#006B5B] border border-teal-200 tabular-nums">
                      {Math.round((totalCompletedFloors / Math.max(1, totalProjectFloors)) * 100)}% Cast
                    </span>
                  </div>
                  <div className="mt-2 flex items-baseline gap-1.5">
                    <span className="text-3xl font-black text-[#006B5B] tabular-nums tracking-tight">
                      {totalCompletedFloors}
                    </span>
                    <span className="text-base font-bold text-slate-400 tabular-nums">
                      / {totalProjectFloors} Slabs
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mt-2 border border-slate-200">
                    <div
                      className="h-full rounded-full transition-all bg-[#006B5B]"
                      style={{ width: `${Math.round((totalCompletedFloors / Math.max(1, totalProjectFloors)) * 100)}%` }}
                    />
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium mt-1.5 block">
                    Across {currentTowers.length} active towers
                  </span>
                </div>

                {/* Card 4: Quality Holds */}
                <div className="bg-white border border-[#E6E9ED] rounded-xl p-4 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#6B7280] font-bold uppercase tracking-wider block">
                      Structural Clearance
                    </span>
                    <span className={clsx(
                      'text-[10px] font-bold px-1.5 py-0.2 rounded tabular-nums',
                      isProjectCritical ? 'bg-rose-100 text-[#D92D20]' : 'bg-emerald-100 text-[#18845B]'
                    )}>
                      {isProjectCritical ? 'Hold Active' : 'Certified'}
                    </span>
                  </div>
                  <div className="mt-2 flex items-baseline gap-1.5">
                    <span className={clsx(
                      'text-3xl font-black tabular-nums tracking-tight',
                      isProjectCritical ? 'text-[#D92D20]' : 'text-[#18845B]'
                    )}>
                      {isProjectCritical ? '1 Hold' : '0 Holds'}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-slate-700 mt-1">
                    {isProjectCritical ? 'Tower 1 Floor 05' : 'IS 456 Compliant'}
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium mt-0.5 block">
                    {isProjectCritical ? 'M35 cube compression test' : 'Pre-pour checklists cleared'}
                  </span>
                </div>
              </div>

              {/* ── PROJECT S-CURVE TRAJECTORY: PLANNED VS CERTIFIED ACTUAL ── */}
              <div className="bg-white border border-[#E6E9ED] rounded-xl p-4 shadow-2xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <TrendingUp size={15} className="text-[#006B5B]" />
                    <h4 className="text-xs font-bold text-[#17191D] uppercase tracking-wider">
                      {currentProject.name} — Progress S-Curve (Planned vs Actual Trajectory)
                    </h4>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-semibold">
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-1 bg-[#006B5B] rounded-full" />
                      <span className="text-[#006B5B]">Certified Actual</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-0.5 border-t-2 border-dashed border-slate-500" />
                      <span className="text-slate-600">Planned Baseline</span>
                    </span>
                  </div>
                </div>

                <div className="h-48 sm:h-52 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={projectCurveData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                      <defs>
                        <linearGradient id="projectActualGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#006B5B" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#006B5B" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                      <XAxis dataKey="period" tick={{ fontSize: 10, fill: '#6B7280' }} tickLine={false} axisLine={{ stroke: '#E6E9ED' }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#6B7280' }} tickLine={false} axisLine={false} unit="%" />
                      <RechartsTooltip content={<SCurveTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="actual"
                        name="Certified Actual"
                        stroke="#006B5B"
                        strokeWidth={2.5}
                        fill="url(#projectActualGrad)"
                        dot={{ r: 3, fill: '#006B5B', strokeWidth: 1.5, stroke: '#FFFFFF' }}
                      />
                      <Area
                        type="monotone"
                        dataKey="planned"
                        name="Planned Target"
                        stroke="#64748B"
                        strokeWidth={1.5}
                        strokeDasharray="4 4"
                        fill="transparent"
                        dot={{ r: 2.5, fill: '#64748B' }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* ── SECTION 2: HIGH-PRIORITY ISSUES ACROSS BUILDINGS ─ */}
              {isProjectCritical ? (
                <div className="bg-red-50/80 border-2 border-red-300 rounded-xl p-4 shadow-xs space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-red-200">
                    <div className="flex items-center gap-2">
                      <ShieldAlert size={18} className="text-[#D92D20]" />
                      <h4 className="text-xs font-bold text-[#D92D20] uppercase tracking-wider">
                        High Priority Structural Issue (Tower 1)
                      </h4>
                    </div>
                    <span className="text-[10px] font-bold text-[#D92D20] bg-red-100 px-2 py-0.5 rounded">
                      M35 Cube Test Failure
                    </span>
                  </div>

                  <div className="flex flex-col md:flex-row gap-3 items-center justify-between text-xs">
                    <div className="space-y-1">
                      <p className="font-semibold text-slate-800">
                        Floor 05 column core M35 concrete compressive test achieved only 18.2 MPa (IS 456 threshold: 35.0 MPa). Stop-work hold active.
                      </p>
                      <span className="text-[11px] text-slate-500 block">
                        Assigned Contractor: <strong>L&T Heavy Civil (C001)</strong> · Re-coring scheduled for 22 Oct.
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleFocusTower('Tower 1')}
                        className="px-3 py-1.5 rounded-lg bg-[#D92D20] text-white text-xs font-bold hover:bg-red-700 transition-colors flex items-center gap-1 shadow-2xs"
                      >
                        <span>Focus on Tower 1</span>
                        <ArrowRight size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-3.5 flex items-center justify-between text-xs text-[#18845B]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-[#18845B]" />
                    <span className="font-semibold">
                      All buildings in {currentProject.name} have passed pre-pour inspection checklists.
                    </span>
                  </div>
                  <span className="text-[10px] font-bold bg-emerald-100 px-2 py-0.5 rounded">
                    Zero Holds
                  </span>
                </div>
              )}

              {/* ── SECTION 3: BUILDING COMPARISON MATRIX ──────────── */}
              <div className="bg-white border border-[#E6E9ED] rounded-xl shadow-2xs overflow-hidden">
                <div className="px-5 py-3.5 border-b border-[#F1F5F9] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-[#17191D]">
                      Buildings Execution & Casting Comparison — Planned vs Actual
                    </h4>
                    <p className="text-xs text-[#6B7280] mt-0.5">
                      Detailed structural performance and slab progress for each building in {currentProject.name}
                    </p>
                  </div>
                  <span className="text-xs text-[#8B93A1]">
                    Click any building row to zoom into floor-level checks
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#E6E9ED] bg-slate-50/70 text-[#6B7280] font-bold">
                        <th className="py-3 px-4">Building Name</th>
                        <th className="py-3 px-3">Current Stage</th>
                        <th className="py-3 px-3">Slabs Cast</th>
                        <th className="py-3 px-3">Planned vs Actual Progress</th>
                        <th className="py-3 px-3">Schedule Variance</th>
                        <th className="py-3 px-3">Contractor</th>
                        <th className="py-3 px-3">Status</th>
                        <th className="py-3 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F1F5F9]">
                      {currentTowers.map(tower => {
                        const defect = getTowerDefect(currentProject.id, tower.name);
                        const isTroubled = !!defect;
                        const variance = tower.actualProgress - tower.plannedProgress;

                        return (
                          <tr
                            key={tower.id}
                            onClick={() => handleFocusTower(tower.name)}
                            className="hover:bg-slate-50 cursor-pointer transition-colors"
                          >
                            {/* Building Name */}
                            <td className="py-3.5 px-4 font-bold text-sm text-[#17191D]">
                              <div className="flex items-center gap-1.5">
                                <span>{tower.name}</span>
                                {isTroubled && (
                                  <span className="w-2 h-2 rounded-full bg-[#D92D20] animate-pulse" />
                                )}
                              </div>
                            </td>

                            {/* Current Stage */}
                            <td className="py-3.5 px-3 text-slate-800 font-semibold text-xs">
                              {tower.currentStage}
                            </td>

                            {/* Slabs Cast */}
                            <td className="py-3.5 px-3">
                              <div className="flex items-baseline gap-1">
                                <span className="font-mono text-sm font-black text-[#17191D] tabular-nums">
                                  {tower.completedFloors}
                                </span>
                                <span className="text-xs text-slate-500 font-semibold tabular-nums">
                                  / {tower.totalFloors} Slabs
                                </span>
                              </div>
                              <div className="text-[10px] font-bold text-[#006B5B] tabular-nums mt-0.5">
                                {Math.round((tower.completedFloors / Math.max(1, tower.totalFloors)) * 100)}% Cast
                              </div>
                            </td>

                            {/* Planned vs Actual Progress */}
                            <td className="py-3.5 px-3">
                              <div className="space-y-1 min-w-[140px]">
                                <div className="flex items-baseline justify-between gap-1.5">
                                  <span className="text-sm font-black text-[#17191D] tabular-nums">
                                    {tower.actualProgress}%
                                  </span>
                                  <span className="text-xs font-semibold text-slate-500 tabular-nums">
                                    Target: {tower.plannedProgress}%
                                  </span>
                                </div>
                                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200 relative">
                                  <div
                                    className={clsx(
                                      'h-full rounded-full transition-all',
                                      isTroubled ? 'bg-[#D92D20]' : variance < 0 ? 'bg-[#006B5B]' : 'bg-[#18845B]'
                                    )}
                                    style={{ width: `${tower.actualProgress}%` }}
                                  />
                                  <div
                                    className="absolute top-0 bottom-0 w-0.5 bg-slate-800 z-10"
                                    style={{ left: `${tower.plannedProgress}%` }}
                                  />
                                </div>
                              </div>
                            </td>

                            {/* Schedule Variance */}
                            <td className="py-3.5 px-3">
                              <span className={clsx(
                                'text-xs font-bold px-2 py-0.5 rounded tabular-nums inline-block',
                                tower.varianceDays < 0
                                  ? 'bg-rose-100 text-[#D92D20] border border-rose-200'
                                  : 'bg-teal-50 text-[#006B5B] border border-teal-200'
                              )}>
                                {tower.varianceDays < 0 ? `${tower.varianceDays} Days Lag` : `+${tower.varianceDays} Days`}
                              </span>
                            </td>

                            {/* Contractor */}
                            <td className="py-3.5 px-3 font-semibold text-slate-700">
                              {tower.contractorId}
                            </td>

                            {/* Status */}
                            <td className="py-3.5 px-3">
                              <span className={clsx(
                                'text-xs font-bold px-2 py-0.5 rounded inline-block',
                                tower.status === 'Delayed' ? 'bg-rose-100 text-[#D92D20]' : 'bg-teal-50 text-[#006B5B]'
                              )}>
                                {tower.status}
                              </span>
                            </td>

                            {/* Action Button */}
                            <td className="py-3.5 px-4 text-right">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleFocusTower(tower.name);
                                }}
                                className="px-3 py-1.5 rounded-lg bg-[#006B5B] text-white font-bold text-xs hover:bg-[#00473E] inline-flex items-center gap-1 shadow-2xs transition-all"
                              >
                                <span>Focus</span>
                                <ArrowRight size={12} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ── SECTION 4: ACTIVE WORK PACKAGES REGISTER ───────── */}
              <div className="bg-white border border-[#E6E9ED] rounded-xl shadow-2xs overflow-hidden">
                <div className="px-5 py-3 border-b border-[#F1F5F9] flex items-center justify-between">
                  <h4 className="text-sm font-bold text-[#17191D]">
                    Active Construction Work Packages ({projectActivities.length})
                  </h4>
                  <span className="text-xs text-[#6B7280]">
                    Consolidated across all buildings
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#E6E9ED] bg-slate-50/60 text-[#6B7280] font-bold">
                        <th className="py-2.5 px-4">Activity</th>
                        <th className="py-2.5 px-3">Tower</th>
                        <th className="py-2.5 px-3">Floor</th>
                        <th className="py-2.5 px-3">Stage</th>
                        <th className="py-2.5 px-3">Contractor</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-4 text-right">Inspection Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F1F5F9]">
                      {projectActivities.slice(0, 5).map(act => {
                        const isBlocked = act.status === 'Blocked';

                        return (
                          <tr key={act.id} className={clsx('hover:bg-slate-50', isBlocked && 'bg-rose-50/40')}>
                            <td className="py-2.5 px-4 font-bold text-[#17191D]">
                              {act.workPackage}
                            </td>
                            <td className="py-2.5 px-3 font-semibold text-slate-700">
                              {act.tower}
                            </td>
                            <td className="py-2.5 px-3 font-semibold text-slate-700">
                              {act.floor}
                            </td>
                            <td className="py-2.5 px-3 text-[#6B7280]">
                              {act.stage}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">
                              {act.contractorId}
                            </td>
                            <td className="py-2.5 px-3">
                              <span className={clsx(
                                'text-[10px] font-bold px-1.5 py-0.5 rounded',
                                act.status === 'Blocked' ? 'bg-red-100 text-[#D92D20]' :
                                act.status === 'In Progress' ? 'bg-teal-50 text-[#006B5B]' : 'bg-slate-100 text-slate-700'
                              )}>
                                {act.status}
                              </span>
                            </td>
                            <td className="py-2.5 px-4 text-right">
                              {act.linkedNCId ? (
                                <button
                                  onClick={() => {
                                    setTab('quality');
                                    selectNC(act.linkedNCId!);
                                  }}
                                  className="text-[11px] font-bold text-[#D92D20] underline"
                                >
                                  View NC ({act.linkedNCId})
                                </button>
                              ) : act.linkedWIRId ? (
                                <button
                                  onClick={() => {
                                    setTab('quality');
                                    selectWIR(act.linkedWIRId!);
                                  }}
                                  className="text-[11px] font-bold text-[#006B5B] underline"
                                >
                                  WIR ({act.linkedWIRId})
                                </button>
                              ) : (
                                <span className="text-[11px] text-slate-400">Standard Check</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hover Popover */}
      {renderHoverPopover()}

      {/* Upload Simulation Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Camera size={18} className="text-[#006B5B]" />
                <h3 className="text-sm font-bold text-[#17191D]">
                  Upload Site Inspection Evidence
                </h3>
              </div>
              <button
                onClick={() => setUploadModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            </div>

            <div className="border-2 border-dashed border-teal-300 bg-teal-50/50 rounded-xl p-6 text-center space-y-2">
              <Upload size={28} className="mx-auto text-[#006B5B]" />
              <p className="text-xs font-bold text-slate-800">
                Select photo from mobile site camera
              </p>
              <p className="text-[11px] text-slate-500">
                Project: {currentProject.name}
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700">Inspector Observation Statement:</label>
              <textarea
                defaultValue="Surface finish post formwork stripping inspected. Concrete compaction verified compliant with IS 456 standards."
                rows={2}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-slate-50 outline-none focus:border-[#006B5B] focus:bg-white"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setUploadModalOpen(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setUploadModalOpen(false);
                  setUploadedToast(true);
                  setTimeout(() => setUploadedToast(false), 3000);
                }}
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-[#006B5B] text-white hover:bg-[#00473E] shadow-xs flex items-center gap-1.5"
              >
                <Check size={13} />
                <span>Sync to Quality API</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Success Toast */}
      {uploadedToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#17191D] text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-2xl animate-in slide-in-from-bottom-2">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>Site photo proof synced to Quality API successfully.</span>
        </div>
      )}
    </div>
  );
}
