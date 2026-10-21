// ============================================================
// PAGE 1 — PORTFOLIO OVERVIEW (v4.1)
// Apple-inspired executive dashboard for BombayDC leadership.
// WIP Skyline & Audit Assurance dominate the screen.
// Big bold numbers, proportionate architectural towers,
// and rich slab-level inspection hover tooltips.
// ============================================================

import React, { useState, useMemo } from 'react';
import { ChevronRight, ArrowUpRight, ShieldAlert, CheckCircle2, AlertTriangle, Layers, Award, MapPin, RotateCcw, Calendar, Building2, ChevronDown } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import clsx from 'clsx';
import { useApp } from '../store/appStore';
import {
  getAllProjectMetrics,
  getOverviewPortfolioKPIs,
  getCXOCommercialInventory,
  isProjectInCity,
} from '../data/calculations';
import { PROJECTS, TOWERS_DATA, FLOORS_DATA, NC_RECORDS, AUDIT_RECORDS } from '../data/seedData';
import { ProjectDetailDrawer } from '../components/ProjectDetailDrawer';

// ── Design Tokens ──────────────────────────────────────────
const C = {
  teal:   '#006B5B',
  tealLt: '#0D9488',
  red:    '#D92D20',
  redTx:  '#D92D20',
  amber:  '#B7791F',
  ambTx:  '#B7791F',
  text:   '#17191D',
  muted:  '#6B7280',
  pale:   '#F6F7F8',
  line:   '#E6E9ED',
  green:  '#18845B',
};

const CITIES = ['All Locations', 'Mumbai', 'Thane', 'Navi Mumbai', 'Pune', 'Bengaluru', 'Gurugram', 'Hyderabad'];

const AUDIT_OVERVIEW_SERIES = [
  { month: 'Apr', expected: 82, actual: 80 },
  { month: 'May', expected: 83, actual: 82 },
  { month: 'Jun', expected: 85, actual: 85 },
  { month: 'Jul', expected: 86, actual: 78 },
  { month: 'Aug', expected: 87, actual: 74 },
  { month: 'Sep', expected: 88, actual: 72 },
];

interface TowerElev {
  id: string;
  name: string;
  totalFloors: number;
  completedFloors: number;
  activeFloors: number;
  currentStage: string;
  status: 'On Track' | 'At Risk' | 'Delayed';
  varianceDays: number;
  actualProgress: number;
  criticalFloor?: number;
  criticalIssue?: string;
}

interface ProjectClusterData {
  projectId: string;
  name: string;
  city: string;
  overallProgress: number;
  healthCategory: 'Healthy' | 'At Risk' | 'Critical';
  qualityScore: number;
  openNCs: number;
  criticalNCs: number;
  towers: TowerElev[];
}

export function PortfolioPage() {
  const { state, setTab, selectProject, selectNC, setFilter } = useApp();
  const [selectedCity, setSelectedCity] = useState('All Locations');
  const [selectedProjectId, setSelectedProjectId] = useState('ALL');

  // Tooltip state for slab hover
  const [hoveredSlab, setHoveredSlab] = useState<{
    x: number;
    y: number;
    projectName: string;
    towerName: string;
    floorNumber: number;
    stage: string;
    physicalPct: number;
    inspectedPct: number;
    status: string;
    isCritical: boolean;
    issueTitle?: string;
    varianceDays?: number;
  } | null>(null);

  const allMetrics = useMemo(
    () => getAllProjectMetrics(state.weights, state.wirs, state.ncs),
    [state.weights, state.wirs, state.ncs]
  );

  const availableProjects = useMemo(() => {
    if (selectedCity === 'All Locations') return PROJECTS;
    return PROJECTS.filter(p => isProjectInCity(p.city, selectedCity));
  }, [selectedCity]);

  const kpis = useMemo(
    () => getOverviewPortfolioKPIs(selectedCity, state.weights, state.wirs, state.ncs),
    [selectedCity, state.weights, state.wirs, state.ncs]
  );

  const commercial = useMemo(
    () => getCXOCommercialInventory(selectedCity),
    [selectedCity]
  );

  // Group towers by Project for clean architectural clusters
  const projectClusters = useMemo<ProjectClusterData[]>(() => {
    let projs = PROJECTS;
    if (selectedCity !== 'All Locations') {
      projs = projs.filter(p => isProjectInCity(p.city, selectedCity));
    }
    if (selectedProjectId !== 'ALL') {
      projs = projs.filter(p => p.id === selectedProjectId);
    }

    return projs.map(proj => {
      const metric = allMetrics.find(m => m.project.id === proj.id);
      const projTowers = TOWERS_DATA.filter(t => t.projectId === proj.id);
      const projNCs = state.ncs.filter(n => n.projectId === proj.id && n.status !== 'Closed');
      const critNCs = projNCs.filter(n => n.severity === 'Critical');

      return {
        projectId: proj.id,
        name: proj.name,
        city: proj.city,
        overallProgress: proj.progressPercentage,
        healthCategory: (metric?.healthCategory || 'Healthy') as any,
        qualityScore: metric?.qualityScore || 80,
        openNCs: projNCs.length,
        criticalNCs: critNCs.length,
        towers: projTowers.map(t => {
          const isTroubled = t.projectId === 'P004' && t.name === 'Tower 1';
          return {
            id: t.id,
            name: t.name,
            totalFloors: t.totalFloors,
            completedFloors: t.completedFloors,
            activeFloors: t.activeFloors,
            currentStage: t.currentStage,
            status: t.status,
            varianceDays: t.varianceDays,
            actualProgress: t.actualProgress,
            criticalFloor: isTroubled ? 5 : undefined,
            criticalIssue: isTroubled ? 'Concrete cube-test fail & column honeycombing' : undefined,
          };
        }),
      };
    });
  }, [selectedCity, selectedProjectId, allMetrics, state.ncs]);

  // Health counts
  const healthStats = useMemo(() => {
    return {
      healthy: projectClusters.filter(c => c.healthCategory === 'Healthy').length,
      atRisk: projectClusters.filter(c => c.healthCategory === 'At Risk').length,
      critical: projectClusters.filter(c => c.healthCategory === 'Critical').length,
    };
  }, [projectClusters]);

  return (
    <div className="space-y-4 pb-6">
      {/* ============================================================
          PAGE HEADER & 2 SIDE-BY-SIDE DROPDOWNS: Location & Project
          Exactly like NC & Inspection throughout the app
          ============================================================ */}
      <div className="bg-white border border-[#E6E9ED] rounded-xl p-4 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#F1F5F9]">
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold text-[#17191D] uppercase tracking-wider">
              Portfolio Overview & Executive Assurance
            </h1>
            <span className="text-xs text-[#6B7280]">
              · {selectedCity} · {selectedProjectId === 'ALL' ? `All ${availableProjects.length} Projects` : PROJECTS.find(p => p.id === selectedProjectId)?.name}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-[#6B7280] font-medium">
            <span className="text-[11px] text-[#8B93A1] tabular-nums">
              Showing <strong className="text-[#17191D] font-semibold">{projectClusters.length}</strong> of {PROJECTS.length} active projects
            </span>
            <div className="h-4 w-px bg-[#E6E9ED]" />
            <div className="flex items-center gap-1 text-[#17191D] font-semibold">
              <Calendar size={13} className="text-[#006B5B]" />
              <span>Q3 FY25</span>
            </div>
            {(selectedCity !== 'All Locations' || selectedProjectId !== 'ALL') && (
              <>
                <div className="h-4 w-px bg-[#E6E9ED]" />
                <button
                  onClick={() => {
                    setSelectedCity('All Locations');
                    setSelectedProjectId('ALL');
                    setFilter('city', '');
                  }}
                  className="flex items-center gap-1 text-xs font-medium text-[#6B7280] hover:text-[#17191D] hover:bg-[#F1F3F5] px-2 py-1 rounded transition-colors"
                >
                  <RotateCcw size={12} />
                  <span>Reset</span>
                </button>
              </>
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
                onChange={(e) => {
                  const newCity = e.target.value;
                  setSelectedCity(newCity);
                  setFilter('city', newCity === 'All Locations' ? '' : newCity);
                  setSelectedProjectId('ALL');
                }}
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
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="h-10 w-full pl-9 pr-8 bg-white border border-slate-300 rounded-lg text-xs font-bold text-[#17191D] focus:outline-none focus:border-[#1E3A8A] shadow-2xs appearance-none cursor-pointer"
              >
                <option value="ALL">All Projects ({availableProjects.length})</option>
                {availableProjects.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.city})
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================
          TOP KPI ROW: CLEAN TYPOGRAPHY & RESTRAINED CARDS
          ============================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* KPI 1: Construction Progress */}
        <div className="bg-white border border-[#E6E9ED] rounded-xl p-4 shadow-2xs flex flex-col justify-between overflow-hidden">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">
              Portfolio Construction
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-[#17191D] tracking-tight tabular-nums">
                {kpis.overallProgress}
              </span>
              <span className="text-sm font-bold text-[#6B7280]">%</span>
            </div>
            <div className="text-xs text-[#6B7280] mt-1 flex items-center gap-1.5 font-medium">
              <span>{kpis.overallTargetProgress}% planned</span>
              <span>·</span>
              <span className={clsx(
                kpis.progressVariance < 0 ? 'text-[#B7791F] font-bold' : 'text-[#18845B] font-bold'
              )}>
                {kpis.progressVariance < 0
                  ? `${Math.abs(kpis.progressVariance)}% behind target`
                  : `${kpis.progressVariance}% on pace`}
              </span>
            </div>
          </div>
          {/* Progress bar */}
          <div className="w-full h-1.5 bg-[#F6F7F8] rounded-full mt-3 overflow-hidden border border-[#E6E9ED]">
            <div
              className="h-full bg-[#006B5B] rounded-full transition-all duration-500"
              style={{ width: `${kpis.overallProgress}%` }}
            />
          </div>
        </div>

        {/* KPI 2: Commercial Units Sold */}
        <div
          onClick={() => setTab('sales')}
          className="bg-white border border-[#E6E9ED] rounded-xl p-4 shadow-2xs flex flex-col justify-between cursor-pointer hover:border-slate-300 transition-colors group overflow-hidden"
        >
          <div>
            <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">
              <span>Inventory Sold & Booked</span>
              <ArrowUpRight size={13} className="text-[#006B5B] opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-[#17191D] tracking-tight tabular-nums">
                {commercial.soldUnits.toLocaleString('en-IN')}
              </span>
              <span className="text-xs font-semibold text-[#6B7280]">
                / {commercial.totalUnits.toLocaleString('en-IN')} units
              </span>
            </div>
            <div className="text-xs text-[#6B7280] mt-1 font-medium">
              <span className="text-[#006B5B] font-bold">{commercial.soldPercent}% booked</span>
              <span> · ₹{commercial.bookedValueCr.toLocaleString('en-IN')} Cr realized</span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-[#F6F7F8] flex items-center justify-between text-[11px] text-[#6B7280] font-medium">
            <span>{commercial.leftUnits} units remaining</span>
            <span className="text-[#006B5B] font-bold">View Inventory →</span>
          </div>
        </div>

        {/* KPI 3: Audit Assurance Score */}
        <div
          onClick={() => setTab('quality')}
          className="bg-white border border-[#E6E9ED] rounded-xl p-4 shadow-2xs flex flex-col justify-between cursor-pointer hover:border-slate-300 transition-colors group overflow-hidden"
        >
          <div>
            <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">
              <span>Audit Assurance Score</span>
              <ArrowUpRight size={13} className="text-[#006B5B] opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className={clsx(
                'text-3xl font-extrabold tracking-tight tabular-nums',
                kpis.portfolioQualityScore >= 80 ? 'text-[#18845B]' : kpis.portfolioQualityScore >= 60 ? 'text-[#B7791F]' : 'text-[#D92D20]'
              )}>
                {kpis.portfolioQualityScore}
              </span>
              <span className="text-xs font-bold text-[#6B7280]">/100</span>
            </div>
            <div className="text-xs text-[#6B7280] mt-1 flex items-center gap-1.5 font-medium">
              <span className={clsx(
                'w-2 h-2 rounded-full',
                kpis.portfolioQualityScore >= 80 ? 'bg-[#18845B]' : kpis.portfolioQualityScore >= 60 ? 'bg-[#B7791F]' : 'bg-[#D92D20]'
              )} />
              <span className="text-[#17191D] font-bold">
                {kpis.portfolioQualityScore >= 80 ? 'Optimal (IS 456 Compliant)' : kpis.portfolioQualityScore >= 60 ? 'Caution' : 'Critical'}
              </span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-[#F6F7F8] flex items-center justify-between text-[11px] text-[#6B7280] font-medium">
            <span>{kpis.portfolioWIRPassRate}% 1st-pass WIR rate</span>
            <span className="text-[#006B5B] font-bold">Audit Trajectory →</span>
          </div>
        </div>

        {/* KPI 4: Critical Holds & Stop-Works */}
        <div
          onClick={() => {
            setTab('nc');
            selectNC('NC-0001');
          }}
          className="bg-white border border-[#E6E9ED] rounded-xl p-4 shadow-2xs flex flex-col justify-between cursor-pointer hover:border-slate-300 transition-colors group overflow-hidden"
        >
          <div>
            <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">
              <span>Active Defect Holds</span>
              <ArrowUpRight size={13} className="text-[#D92D20] opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className={clsx(
                'text-3xl font-extrabold tracking-tight tabular-nums',
                kpis.criticalNCs > 0 ? 'text-[#D92D20]' : 'text-[#17191D]'
              )}>
                {kpis.criticalNCs}
              </span>
              <span className="text-xs font-bold text-[#6B7280]">Active Stop-Work</span>
            </div>
            <div className="text-xs text-[#6B7280] mt-1 flex items-center gap-1.5 font-medium">
              <span className={clsx(
                'w-2 h-2 rounded-full',
                kpis.criticalNCs > 0 ? 'bg-[#D92D20]' : 'bg-[#18845B]'
              )} />
              <span className="text-[#17191D] font-bold truncate">
                {kpis.criticalNCs > 0 ? 'Riverstone T1 · F05 Hold' : 'No active stop-works'}
              </span>
            </div>
          </div>
          <div className="text-[11px] text-[#6B7280] mt-3 pt-2 border-t border-[#F6F7F8] flex items-center justify-between font-medium">
            <span>{kpis.openNCs} total open findings</span>
            <span className="text-[#D92D20] font-bold">Inspect NC-0001 →</span>
          </div>
        </div>
      </div>

      {/* ============================================================
          MAIN BENTO: WIP SKYLINE (LEFT 65%) + AUDIT ASSURANCE (RIGHT 35%)
          ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* ── LEFT: WIP CONSTRUCTION SKYLINE (8 cols) ── */}
        <div className="lg:col-span-8 bg-white border border-[#E6E9ED] rounded-xl flex flex-col justify-between shadow-2xs overflow-hidden">
          {/* Header */}
          <div className="px-5 py-3.5 border-b border-[#E6E9ED] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers size={16} className="text-[#006B5B]" />
              <h2 className="text-sm font-bold text-[#17191D] tracking-tight">
                Work In Progress (WIP) — Slab-Level Skyline
              </h2>
              <span className="text-xs text-[#6B7280] hidden sm:inline">
                · Hover any floor slab for inspection status
              </span>
            </div>

            <button
              onClick={() => setTab('wip')}
              className="text-xs font-bold text-[#006B5B] hover:underline flex items-center gap-1"
            >
              Open Full WIP Page <ChevronRight size={13} />
            </button>
          </div>

          {/* Architectural Canvas: Proportionate Towers Grouped by Project */}
          <div className="relative p-5 bg-[#F6F7F8] flex-1 flex items-end justify-start gap-6 overflow-x-auto min-h-[300px]">
            {projectClusters.map(project => {
              const isCrit = project.healthCategory === 'Critical';
              const isRisk = project.healthCategory === 'At Risk';

              return (
                <div
                  key={project.projectId}
                  className={clsx(
                    'flex flex-col items-center p-3 rounded-xl border transition-all',
                    isCrit
                      ? 'border-red-200 bg-red-50/40'
                      : isRisk
                      ? 'border-amber-200 bg-amber-50/40'
                      : 'border-[#E6E9ED] bg-white'
                  )}
                  style={{ minWidth: project.towers.length * 64 + 24 }}
                >
                  {/* Project Towers Row */}
                  <div className="flex items-end justify-center gap-3 w-full">
                    {project.towers.map(tower => {
                      const total = tower.totalFloors;
                      const completed = tower.completedFloors;
                      const active = completed + 1;
                      const critical = tower.criticalFloor;

                      // Proportionate slab height
                      const slabH = 6;
                      const gap = 1;

                      return (
                        <div
                          key={tower.id}
                          className="flex flex-col items-center group cursor-pointer"
                          style={{ width: 44 }}
                          onClick={() => {
                            selectProject(project.projectId);
                            setTab('wip');
                          }}
                        >
                          {/* Tower Top Progress % */}
                          <span className={clsx(
                            'text-[10px] font-bold tabular-nums mb-1',
                            tower.status === 'Delayed' ? 'text-[#D92D20]' : 'text-[#006B5B]'
                          )}>
                            {tower.actualProgress}%
                          </span>

                          {/* Tower Slabs Stack */}
                          <div
                            className="w-full flex flex-col relative group-hover:scale-[1.02] transition-transform"
                            style={{ gap: `${gap}px` }}
                          >
                            {/* Rooftop Penthouse Cap (Neutral slate architectural cap) */}
                            <div
                              className="w-full h-1.5 rounded-t-sm bg-slate-800"
                            />

                            {/* Render Each Floor Slab - From Top Floor down to Ground Floor */}
                            {Array.from({ length: total }, (_, fIdx) => total - fIdx).map(floorNum => {
                              const isCompleted = floorNum <= completed;
                              const isActive = floorNum === active;
                              const isCriticalFloor = critical === floorNum;
                              const isDelayedFloor = tower.status === 'Delayed' && floorNum > completed && floorNum <= completed + 2;

                              let bg = '#E2E8F0';
                              if (isCriticalFloor) bg = '#D92D20';
                              else if (isCompleted) bg = '#006B5B';
                              else if (isActive) bg = '#2563EB'; // Vibrant Blue for Active Pouring (clearly distinct from completed teal)
                              else if (isDelayedFloor) bg = '#B7791F';

                              return (
                                <div
                                  key={floorNum}
                                  onMouseEnter={(e) => {
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    setHoveredSlab({
                                      x: rect.right + 12,
                                      y: rect.top - 20,
                                      projectName: project.name,
                                      towerName: tower.name,
                                      floorNumber: floorNum,
                                      stage: isCompleted ? 'Completed Slab' : isActive ? tower.currentStage : 'Upcoming Package',
                                      physicalPct: isCompleted ? 100 : isActive ? 75 : 0,
                                      inspectedPct: isCompleted ? 100 : 0,
                                      status: isCriticalFloor ? 'Critical Defect Hold' : isCompleted ? 'Inspection Passed' : isActive ? 'Active Pouring' : 'Scheduled',
                                      isCritical: isCriticalFloor,
                                      issueTitle: isCriticalFloor ? tower.criticalIssue : undefined,
                                      varianceDays: tower.varianceDays,
                                    });
                                  }}
                                  onMouseLeave={() => setHoveredSlab(null)}
                                  className="w-full rounded-[1px] relative cursor-crosshair transition-opacity hover:opacity-75"
                                  style={{
                                    height: `${slabH}px`,
                                    backgroundColor: bg,
                                  }}
                                >
                                  {isCriticalFloor && (
                                    <span className="absolute -right-1 -top-0.5 w-2 h-2 rounded-full bg-red-600 ring-2 ring-white animate-pulse" />
                                  )}
                                </div>
                              );
                            })}

                            {/* Foundation Beam */}
                            <div className="w-full h-1 bg-slate-300 rounded-b-sm" />
                          </div>

                          {/* Tower Name */}
                          <span className="text-[10px] font-semibold text-[#17191D] mt-1.5 truncate max-w-full">
                            {tower.name}
                          </span>
                          <span className="text-[9px] text-[#6B7280] tabular-nums">
                            {completed}/{total} fl
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Project Info Footer */}
                  <div className="mt-2.5 pt-2 border-t border-[#E6E9ED] w-full text-center">
                    <span className="text-xs font-bold text-[#17191D] block truncate">
                      {project.name}
                    </span>
                    <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#6B7280] mt-0.5">
                      <span>{project.city}</span>
                      <span>·</span>
                      <span className="font-semibold text-[#17191D]">{project.overallProgress}%</span>
                      {isCrit && (
                        <span className="text-[#D92D20] font-bold">· ⚠ Hold</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Canvas Legend */}
          <div className="px-5 py-2.5 border-t border-[#E6E9ED] flex flex-wrap items-center justify-between text-xs text-[#6B7280] gap-2">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-[11px]">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#006B5B]" />
                Completed & Passed
              </span>
              <span className="flex items-center gap-1.5 text-[11px]">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#2563EB]" />
                In Progress (Active Pouring)
              </span>
              <span className="flex items-center gap-1.5 text-[11px]">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#B7791F]" />
                Delayed Schedule
              </span>
              <span className="flex items-center gap-1.5 text-[11px]">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#D92D20]" />
                Critical Defect Hold
              </span>
            </div>

            <span className="text-[11px] text-[#006B5B] font-semibold">
              Click any project tower to inspect floor activities
            </span>
          </div>
        </div>

        {/* ── RIGHT: AUDIT & QUALITY ASSURANCE CENTER (4 cols) ── */}
        <div
          onClick={() => setTab('quality')}
          className="lg:col-span-4 bg-white border border-[#E6E9ED] rounded-xl p-5 shadow-2xs flex flex-col justify-between cursor-pointer hover:border-slate-300 transition-colors group"
        >
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#E6E9ED]">
              <div className="flex items-center gap-2">
                <Award size={16} className="text-[#006B5B]" />
                <h2 className="text-sm font-bold text-[#17191D] tracking-tight">
                  Audit Trajectory & Conformance
                </h2>
              </div>
              <span className="text-xs font-bold text-[#006B5B] group-hover:underline flex items-center gap-0.5">
                Audit Register <ChevronRight size={13} />
              </span>
            </div>

            {/* Quality Score Header & Dual Legend */}
            <div className="pt-3 pb-1 flex items-baseline justify-between">
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-black text-[#17191D] tabular-nums tracking-tight">
                    {kpis.portfolioQualityScore}
                  </span>
                  <span className="text-xs text-[#6B7280] font-bold">/ 100</span>
                </div>
                <span className="text-[11px] text-[#6B7280] font-medium block">
                  {kpis.portfolioQualityScore >= 80 ? 'Optimal (IS 456 Compliant)' : 'Caution — Action Required'}
                </span>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-3 text-[11px] font-semibold">
                <span className="flex items-center gap-1 text-[#18845B]">
                  <span className="w-2.5 h-0.5 bg-[#18845B] rounded-full" />
                  <span>Target</span>
                </span>
                <span className="flex items-center gap-1 text-[#3168D8]">
                  <span className="w-2.5 h-0.5 bg-[#3168D8] rounded-full" />
                  <span>Actual</span>
                </span>
              </div>
            </div>

            {/* Dual-Gradient Area Chart */}
            <div className="h-36 w-full my-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={AUDIT_OVERVIEW_SERIES} margin={{ top: 10, right: 8, left: -28, bottom: 0 }}>
                  <defs>
                    <linearGradient id="homeAuditGreen" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#18845B" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#18845B" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="homeAuditBlue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3168D8" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#3168D8" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" tick={{ fontSize: 9, fill: '#6B7280' }} />
                  <YAxis domain={[50, 100]} tick={{ fontSize: 9, fill: '#6B7280' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#E6E9ED',
                      borderRadius: '8px',
                      fontSize: '11px',
                      padding: '4px 8px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="expected"
                    stroke="#18845B"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#homeAuditGreen)"
                    name="Target"
                  />
                  <Area
                    type="monotone"
                    dataKey="actual"
                    stroke="#3168D8"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#homeAuditBlue)"
                    name="Actual"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Project Distribution Breakdown */}
            <div className="py-3 border-t border-[#E6E9ED] space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-[#6B7280]">Portfolio Distribution</span>
                <span className="text-[#17191D] tabular-nums font-bold">{projectClusters.length} Projects Total</span>
              </div>

              {/* Single cohesive segmented status bar */}
              <div className="w-full h-2 rounded-full overflow-hidden flex bg-[#F6F7F8]">
                <div
                  style={{ width: `${(healthStats.healthy / Math.max(1, projectClusters.length)) * 100}%` }}
                  className="bg-[#18845B] h-full"
                  title={`Healthy: ${healthStats.healthy}`}
                />
                <div
                  style={{ width: `${(healthStats.atRisk / Math.max(1, projectClusters.length)) * 100}%` }}
                  className="bg-[#B7791F] h-full"
                  title={`At Risk: ${healthStats.atRisk}`}
                />
                <div
                  style={{ width: `${(healthStats.critical / Math.max(1, projectClusters.length)) * 100}%` }}
                  className="bg-[#D92D20] h-full"
                  title={`Critical: ${healthStats.critical}`}
                />
              </div>

              {/* Status breakdown numbers */}
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="flex items-center gap-1.5 font-medium text-slate-700">
                  <span className="w-2 h-2 rounded-full bg-[#18845B]" />
                  <span>Healthy: <strong className="text-slate-900">{healthStats.healthy}</strong></span>
                </span>
                <span className="flex items-center gap-1.5 font-medium text-slate-700">
                  <span className="w-2 h-2 rounded-full bg-[#B7791F]" />
                  <span>At Risk: <strong className="text-[#B7791F]">{healthStats.atRisk}</strong></span>
                </span>
                <span className="flex items-center gap-1.5 font-medium text-slate-700">
                  <span className="w-2 h-2 rounded-full bg-[#D92D20]" />
                  <span>Critical: <strong className="text-[#D92D20]">{healthStats.critical}</strong></span>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[#E6E9ED]">
            <div className="p-2.5 rounded-lg bg-[#F6F7F8] border border-[#E6E9ED] text-center">
              <span className="text-xs text-[#6B7280] font-medium block">1st-Pass Pass Rate</span>
              <span className="text-base font-bold text-[#17191D] tabular-nums mt-0.5 block">
                {kpis.portfolioWIRPassRate}%
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-[#F6F7F8] border border-[#E6E9ED] text-center">
              <span className="text-xs text-[#6B7280] font-medium block">Open Audit CAs</span>
              <span className="text-base font-bold text-[#D92D20] tabular-nums mt-0.5 block">
                {state.ncs.filter(n => n.severity === 'Critical').length} holds
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================
          BOTTOM SECTION: PROJECTS REQUIRING ATTENTION TABLE
          Clear status dots, tabular numbers, direct drill-down
          ============================================================ */}
      <div className="bg-white border border-[#E6E9ED] rounded-xl shadow-2xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#E6E9ED] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-[#17191D]">
              Projects Requiring Management Attention
            </h3>
            <span className="text-xs text-[#6B7280]">
              · Ranked by risk severity & schedule delay
            </span>
          </div>

          <button
            onClick={() => setTab('wip')}
            className="text-xs font-bold text-[#006B5B] hover:underline flex items-center gap-1"
          >
            View all {projectClusters.length} projects in WIP <ChevronRight size={13} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left min-w-[760px]">
            <thead>
              <tr className="text-[#6B7280] font-semibold border-b border-[#E6E9ED] bg-[#F8FAFC]">
                <th className="py-2.5 px-5">Project Name</th>
                <th className="py-2.5 px-3">City</th>
                <th className="py-2.5 px-3">Progress</th>
                <th className="py-2.5 px-3 text-right">Units Sold</th>
                <th className="py-2.5 px-3 text-right">Quality Score</th>
                <th className="py-2.5 px-3 text-right">Open NCs</th>
                <th className="py-2.5 px-5">Health Status</th>
                <th className="py-2.5 px-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6E9ED]">
              {projectClusters
                .slice()
                .sort((a, b) => {
                  const weight = { Critical: 0, 'At Risk': 1, Healthy: 2 };
                  return weight[a.healthCategory] - weight[b.healthCategory];
                })
                .slice(0, 5)
                .map(p => {
                  const isCrit = p.healthCategory === 'Critical';
                  const isRisk = p.healthCategory === 'At Risk';

                  return (
                    <tr
                      key={p.projectId}
                      onClick={() => selectProject(p.projectId)}
                      className="hover:bg-[#F8FAFC] cursor-pointer transition-colors group"
                    >
                      <td className="py-3 px-5 font-bold text-[#17191D] group-hover:text-[#006B5B] transition-colors">
                        {p.name}
                      </td>
                      <td className="py-3 px-3 text-[#6B7280] font-medium">{p.city}</td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2 tabular-nums">
                          <span className="font-bold text-[#17191D]">{p.overallProgress}%</span>
                          <div className="w-16 h-1 bg-[#F6F7F8] rounded-full overflow-hidden border border-[#E6E9ED]">
                            <div
                              className={clsx(
                                'h-full rounded-full',
                                isCrit ? 'bg-[#D92D20]' : isRisk ? 'bg-[#B7791F]' : 'bg-[#006B5B]'
                              )}
                              style={{ width: `${p.overallProgress}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right tabular-nums text-[#6B7280] font-medium">
                        {commercial.projectBreakdown.find(b => b.projectId === p.projectId)?.soldUnits || 0} / {commercial.projectBreakdown.find(b => b.projectId === p.projectId)?.totalUnits || 0}
                      </td>
                      <td className="py-3 px-3 text-right font-bold tabular-nums text-[#17191D]">
                        {p.qualityScore}/100
                      </td>
                      <td className="py-3 px-3 text-right tabular-nums">
                        <span className={clsx(p.criticalNCs > 0 ? 'text-[#D92D20] font-bold' : 'text-[#6B7280] font-medium')}>
                          {p.openNCs} {p.criticalNCs > 0 ? `(${p.criticalNCs} crit)` : ''}
                        </span>
                      </td>
                      <td className="py-3 px-5">
                        <span className="flex items-center gap-1.5 font-bold text-xs">
                          <span
                            className={clsx(
                              'w-2 h-2 rounded-full',
                              isCrit ? 'bg-[#D92D20]' : isRisk ? 'bg-[#B7791F]' : 'bg-[#18845B]'
                            )}
                          />
                          <span className={clsx(
                            isCrit ? 'text-[#D92D20]' : isRisk ? 'text-[#B7791F]' : 'text-[#18845B]'
                          )}>
                            {isCrit ? 'Critical Hold' : isRisk ? 'Requires Attention' : 'On Track'}
                          </span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-slate-300 group-hover:text-[#17191D] transition-colors">
                        <ChevronRight size={14} />
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============================================================
          FLOATING SLAB HOVER TOOLTIP
          Appears right by the mouse / hovered slab
          ============================================================ */}
      {hoveredSlab && (
        <div
          className="fixed z-50 bg-[#17191D] text-white rounded-xl p-3 shadow-2xl pointer-events-none text-xs border border-slate-700/60 max-w-xs animate-in fade-in duration-100"
          style={{
            top: Math.max(10, Math.min(window.innerHeight - 200, hoveredSlab.y)),
            left: Math.max(10, Math.min(window.innerWidth - 300, hoveredSlab.x)),
          }}
        >
          <div className="flex items-center justify-between border-b border-slate-700 pb-1.5 mb-2">
            <span className="font-bold text-white">
              {hoveredSlab.projectName} · {hoveredSlab.towerName}
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
              Floor {String(hoveredSlab.floorNumber).padStart(2, '0')}
            </span>
          </div>

          <div className="space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-400">Construction Stage:</span>
              <span className="font-semibold text-slate-200">{hoveredSlab.stage}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Physical Poured:</span>
              <span className="font-semibold text-slate-200">{hoveredSlab.physicalPct}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Inspection Status:</span>
              <span className={clsx(
                'font-bold',
                hoveredSlab.isCritical ? 'text-rose-400' : hoveredSlab.inspectedPct === 100 ? 'text-emerald-400' : 'text-amber-400'
              )}>
                {hoveredSlab.status}
              </span>
            </div>
            {hoveredSlab.issueTitle && (
              <div className="mt-1.5 pt-1.5 border-t border-slate-700 text-rose-300 font-semibold leading-tight">
                ⚠ {hoveredSlab.issueTitle}
              </div>
            )}
            {hoveredSlab.varianceDays !== undefined && hoveredSlab.varianceDays < -7 && (
              <div className="text-amber-300 text-[10px]">
                {Math.abs(hoveredSlab.varianceDays)} days behind baseline engineering plan
              </div>
            )}
          </div>
        </div>
      )}

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
