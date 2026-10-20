// ============================================================
// PAGE 1 — PORTFOLIO OVERVIEW (v4.1)
// Apple-inspired executive dashboard for BombayDC leadership.
// WIP Skyline & Audit Assurance dominate the screen.
// Big bold numbers, proportionate architectural towers,
// and rich slab-level inspection hover tooltips.
// ============================================================

import React, { useState, useMemo } from 'react';
import { ChevronRight, ArrowUpRight, ShieldAlert, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';
import clsx from 'clsx';
import { useApp } from '../store/appStore';
import {
  getAllProjectMetrics,
  getOverviewPortfolioKPIs,
  getCXOCommercialInventory,
} from '../data/calculations';
import { PROJECTS, TOWERS_DATA, FLOORS_DATA, NC_RECORDS, AUDIT_RECORDS } from '../data/seedData';
import { ProjectDetailDrawer } from '../components/ProjectDetailDrawer';

// ── Design Tokens ──────────────────────────────────────────
const C = {
  teal:   '#00594F',
  tealLt: '#0D9488',
  red:    '#DC2626',
  redTx:  '#C63F43',
  amber:  '#D97706',
  ambTx:  '#B7791F',
  text:   '#17191D',
  muted:  '#737B88',
  pale:   '#F1F5F9',
  line:   '#E5E7EB',
  green:  '#16805D',
};

const CITIES = ['All Locations', 'Mumbai', 'Pune', 'Bengaluru', 'Hyderabad', 'Gurugram'];

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
  const { state, setTab, selectProject, setFilter } = useApp();
  const [selectedCity, setSelectedCity] = useState('All Locations');

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
      if (selectedCity.toLowerCase() === 'mumbai') {
        projs = projs.filter(p => ['Mumbai', 'Navi Mumbai', 'Thane'].includes(p.city));
      } else {
        projs = projs.filter(p => p.city.toLowerCase() === selectedCity.toLowerCase());
      }
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
  }, [selectedCity, allMetrics, state.ncs]);

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
          TOP FILTER & CONTEXT STRIP
          ============================================================ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#E5E7EB]">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
          {CITIES.map(city => {
            const active = selectedCity === city;
            return (
              <button
                key={city}
                onClick={() => {
                  setSelectedCity(city);
                  setFilter('city', city === 'All Locations' ? '' : city);
                }}
                className={clsx(
                  'px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all',
                  active
                    ? 'bg-[#17191D] text-white shadow-xs'
                    : 'text-[#737B88] hover:text-[#17191D] hover:bg-white'
                )}
              >
                {city}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3 text-xs text-[#737B88] font-medium">
          <span className="tabular-nums font-semibold text-[#17191D]">{projectClusters.length}</span> Active Projects
          <span>·</span>
          <span>Reporting: <strong className="text-[#17191D]">Q3 FY25</strong></span>
        </div>
      </div>

      {/* ============================================================
          TOP KPI ROW: BOLD NUMBERS, RESTORED HIERARCHY
          ============================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* KPI 1: Construction Progress */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4.5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#737B88]">
              Portfolio Construction
            </div>
            <div className="mt-1.5 flex items-baseline gap-1">
              <span className="text-4xl sm:text-5xl font-black text-[#17191D] tracking-tight tabular-nums">
                {kpis.overallProgress}
              </span>
              <span className="text-xl font-bold text-[#737B88]">%</span>
            </div>
            <div className="text-xs text-[#737B88] mt-1 flex items-center gap-1.5 font-medium">
              <span>{kpis.overallTargetProgress}% planned</span>
              <span>·</span>
              <span className={clsx(
                kpis.progressVariance < 0 ? 'text-[#B7791F] font-bold' : 'text-[#16805D] font-bold'
              )}>
                {kpis.progressVariance < 0
                  ? `${Math.abs(kpis.progressVariance)}% behind target`
                  : `${kpis.progressVariance}% on pace`}
              </span>
            </div>
          </div>
          <div className="w-full h-1.5 bg-[#F1F5F9] rounded-full mt-3 overflow-hidden">
            <div
              className="h-full bg-[#00594F] rounded-full transition-all duration-500"
              style={{ width: `${kpis.overallProgress}%` }}
            />
          </div>
        </div>

        {/* KPI 2: Commercial Units Sold */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4.5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#737B88]">
              Inventory Sold & Booked
            </div>
            <div className="mt-1.5 flex items-baseline gap-1.5">
              <span className="text-4xl sm:text-5xl font-black text-[#17191D] tracking-tight tabular-nums">
                {commercial.soldUnits.toLocaleString('en-IN')}
              </span>
              <span className="text-sm font-semibold text-[#737B88]">
                / {commercial.totalUnits.toLocaleString('en-IN')} units
              </span>
            </div>
            <div className="text-xs text-[#737B88] mt-1 font-medium">
              <span className="text-[#00594F] font-bold">{commercial.soldPercent}% booked</span>
              <span> · ₹{commercial.bookedValueCr.toLocaleString('en-IN')} Cr realized</span>
            </div>
          </div>
          {/* Minimalist 20-block absorption strip */}
          <div className="mt-3 flex items-center gap-1">
            {Array.from({ length: 20 }).map((_, i) => {
              const filled = i < Math.round((commercial.soldPercent / 100) * 20);
              return (
                <div
                  key={i}
                  className={clsx(
                    'flex-1 h-1.5 rounded-full transition-colors',
                    filled ? 'bg-[#00594F]' : 'bg-[#E5E7EB]'
                  )}
                  title={`${commercial.soldPercent}% Sold`}
                />
              );
            })}
          </div>
        </div>

        {/* KPI 3: Quality Score */}
        <div
          onClick={() => setTab('quality')}
          className="bg-white border border-[#E5E7EB] rounded-xl p-4.5 shadow-2xs flex flex-col justify-between cursor-pointer hover:border-slate-300 transition-colors group"
        >
          <div>
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-[#737B88]">
              <span>Quality Assurance Index</span>
              <ArrowUpRight size={13} className="text-[#00594F] opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="mt-1.5 flex items-baseline gap-1">
              <span className={clsx(
                'text-4xl sm:text-5xl font-black tracking-tight tabular-nums',
                kpis.portfolioQualityScore >= 80 ? 'text-[#16805D]' : kpis.portfolioQualityScore >= 60 ? 'text-[#B7791F]' : 'text-[#C63F43]'
              )}>
                {kpis.portfolioQualityScore}
              </span>
              <span className="text-lg font-bold text-[#737B88]">/100</span>
            </div>
            <div className="text-xs text-[#737B88] mt-1 flex items-center gap-1.5 font-medium">
              <span className={clsx(
                'w-2 h-2 rounded-full',
                kpis.portfolioQualityScore >= 80 ? 'bg-[#16805D]' : kpis.portfolioQualityScore >= 60 ? 'bg-[#D97706]' : 'bg-[#DC2626]'
              )} />
              <span className="text-[#17191D] font-bold">
                {kpis.portfolioQualityScore >= 80 ? 'Optimal' : kpis.portfolioQualityScore >= 60 ? 'Caution' : 'Critical'}
              </span>
              <span>· {kpis.portfolioWIRPassRate}% 1st-pass WIR</span>
            </div>
          </div>
          <div className="w-full h-1.5 bg-[#F1F5F9] rounded-full mt-3 overflow-hidden">
            <div
              className={clsx(
                'h-full rounded-full transition-all duration-500',
                kpis.portfolioQualityScore >= 80 ? 'bg-[#16805D]' : kpis.portfolioQualityScore >= 60 ? 'bg-[#D97706]' : 'bg-[#DC2626]'
              )}
              style={{ width: `${kpis.portfolioQualityScore}%` }}
            />
          </div>
        </div>

        {/* KPI 4: Critical Holds & Stop-Works */}
        <div
          onClick={() => setTab('nc')}
          className="bg-white border border-[#E5E7EB] rounded-xl p-4.5 shadow-2xs flex flex-col justify-between cursor-pointer hover:border-slate-300 transition-colors group"
        >
          <div>
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-[#737B88]">
              <span>Active Defect Holds</span>
              <ArrowUpRight size={13} className="text-[#DC2626] opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="mt-1.5 flex items-baseline gap-1">
              <span className={clsx(
                'text-4xl sm:text-5xl font-black tracking-tight tabular-nums',
                kpis.criticalNCs > 0 ? 'text-[#C63F43]' : 'text-[#17191D]'
              )}>
                {kpis.criticalNCs}
              </span>
              <span className="text-xs font-bold text-[#737B88]">Critical</span>
            </div>
            <div className="text-xs text-[#737B88] mt-1 flex items-center gap-1.5 font-medium">
              <span className={clsx(
                'w-2 h-2 rounded-full',
                kpis.criticalNCs > 0 ? 'bg-[#DC2626]' : 'bg-[#16805D]'
              )} />
              <span className="text-[#17191D] font-bold">
                {kpis.criticalNCs > 0 ? 'Riverstone T1 · Stop-work' : 'No active stop-works'}
              </span>
            </div>
          </div>
          <div className="text-[11px] text-[#737B88] mt-3 pt-2 border-t border-[#F1F5F9] flex items-center justify-between font-medium">
            <span>{kpis.openNCs} total open findings</span>
            <span>{kpis.overdueWIRs} overdue WIRs</span>
          </div>
        </div>
      </div>

      {/* ============================================================
          MAIN BENTO: WIP SKYLINE (LEFT 65%) + AUDIT ASSURANCE (RIGHT 35%)
          Dominates the screen, high fidelity, proportionate towers
          ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* ── LEFT: WIP CONSTRUCTION SKYLINE (8 cols) ── */}
        <div className="lg:col-span-8 bg-white border border-[#E5E7EB] rounded-xl flex flex-col justify-between shadow-2xs overflow-hidden">
          {/* Header */}
          <div className="px-5 py-3.5 border-b border-[#F1F5F9] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers size={16} className="text-[#00594F]" />
              <h2 className="text-sm font-bold text-[#17191D] tracking-tight">
                Work In Progress (WIP) — Slab-Level Skyline
              </h2>
              <span className="text-xs text-[#737B88] hidden sm:inline">
                · Hover any floor slab for inspection status
              </span>
            </div>

            <button
              onClick={() => setTab('wip')}
              className="text-xs font-bold text-[#00594F] hover:underline flex items-center gap-1"
            >
              Open Full WIP Page <ChevronRight size={13} />
            </button>
          </div>

          {/* Architectural Canvas: Proportionate Towers Grouped by Project */}
          <div className="relative p-5 bg-[#FAFBFB] flex-1 flex items-end justify-start gap-6 overflow-x-auto min-h-[300px]">
            {projectClusters.map(project => {
              const isCrit = project.healthCategory === 'Critical';
              const isRisk = project.healthCategory === 'At Risk';

              return (
                <div
                  key={project.projectId}
                  className={clsx(
                    'flex flex-col items-center p-3 rounded-xl border transition-all',
                    isCrit
                      ? 'border-red-200/80 bg-red-50/20'
                      : isRisk
                      ? 'border-amber-200/80 bg-amber-50/20'
                      : 'border-slate-200/60 bg-white/70'
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
                            tower.status === 'Delayed' ? 'text-[#C63F43]' : 'text-[#00594F]'
                          )}>
                            {tower.actualProgress}%
                          </span>

                          {/* Tower Slabs Stack */}
                          <div
                            className="w-full flex flex-col-reverse relative group-hover:scale-[1.02] transition-transform"
                            style={{ gap: `${gap}px` }}
                          >
                            {/* Rooftop Penthouse Cap */}
                            <div
                              className="w-full h-1.5 rounded-t-sm"
                              style={{
                                backgroundColor: tower.status === 'Delayed' ? '#DC2626' : '#17191D',
                              }}
                            />

                            {/* Render Each Floor Slab */}
                            {Array.from({ length: total }).map((_, fIdx) => {
                              const floorNum = fIdx + 1;
                              const isCompleted = floorNum <= completed;
                              const isActive = floorNum === active;
                              const isCriticalFloor = critical === floorNum;
                              const isDelayedFloor = tower.status === 'Delayed' && floorNum > completed && floorNum <= completed + 2;

                              let bg = '#E2E8F0';
                              if (isCriticalFloor) bg = '#DC2626';
                              else if (isCompleted) bg = '#00594F';
                              else if (isActive) bg = '#0D9488';
                              else if (isDelayedFloor) bg = '#D97706';

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
                            <div className="w-full h-1 bg-slate-400 rounded-b-sm" />
                          </div>

                          {/* Tower Name */}
                          <span className="text-[10px] font-semibold text-[#17191D] mt-1.5 truncate max-w-full">
                            {tower.name}
                          </span>
                          <span className="text-[9px] text-[#737B88] tabular-nums">
                            {completed}/{total} fl
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Project Info Footer */}
                  <div className="mt-2.5 pt-2 border-t border-slate-200/60 w-full text-center">
                    <span className="text-xs font-bold text-[#17191D] block truncate">
                      {project.name}
                    </span>
                    <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#737B88] mt-0.5">
                      <span>{project.city}</span>
                      <span>·</span>
                      <span className="font-semibold">{project.overallProgress}%</span>
                      {isCrit && (
                        <span className="text-[#C63F43] font-bold">· ⚠ Hold</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Canvas Legend */}
          <div className="px-5 py-2.5 border-t border-[#F1F5F9] flex flex-wrap items-center justify-between text-xs text-[#737B88] gap-2">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-[11px]">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#00594F]" />
                Completed & Passed
              </span>
              <span className="flex items-center gap-1.5 text-[11px]">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#0D9488]" />
                In Progress (Active)
              </span>
              <span className="flex items-center gap-1.5 text-[11px]">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#D97706]" />
                Delayed Schedule
              </span>
              <span className="flex items-center gap-1.5 text-[11px]">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#DC2626]" />
                Critical Defect Hold
              </span>
            </div>

            <span className="text-[11px] text-[#00594F] font-semibold">
              Click any project tower to inspect floor activities
            </span>
          </div>
        </div>

        {/* ── RIGHT: AUDIT & QUALITY ASSURANCE CENTER (4 cols) ── */}
        <div
          onClick={() => setTab('quality')}
          className="lg:col-span-4 bg-white border border-[#E5E7EB] rounded-xl p-5 shadow-2xs flex flex-col justify-between cursor-pointer hover:border-slate-300 transition-colors group"
        >
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-[#16805D]" />
                <h2 className="text-sm font-bold text-[#17191D] tracking-tight">
                  Audit Assurance Health
                </h2>
              </div>
              <span className="text-xs font-bold text-[#00594F] group-hover:underline flex items-center gap-0.5">
                Full Register <ChevronRight size={13} />
              </span>
            </div>

            {/* Quality Donut Ring & Key Metrics */}
            <div className="py-5 flex flex-col items-center">
              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50" cy="50" r="40"
                    fill="none"
                    stroke="#F1F5F9"
                    strokeWidth="8"
                  />
                  <circle
                    cx="50" cy="50" r="40"
                    fill="none"
                    stroke={kpis.portfolioQualityScore >= 80 ? '#16805D' : kpis.portfolioQualityScore >= 60 ? '#D97706' : '#DC2626'}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${(kpis.portfolioQualityScore / 100) * 251.2} 251.2`}
                    className="transition-all duration-700"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-black text-[#17191D] tabular-nums tracking-tight">
                    {kpis.portfolioQualityScore}
                  </span>
                  <span className="text-[10px] font-bold text-[#737B88] uppercase tracking-wider">
                    Score / 100
                  </span>
                </div>
              </div>

              <div className="mt-2 text-center">
                <span className="text-xs font-bold text-[#17191D]">
                  {kpis.portfolioQualityScore >= 80
                    ? 'High Quality Conformance'
                    : kpis.portfolioQualityScore >= 60
                    ? 'Moderate Quality Risk'
                    : 'Critical Action Required'}
                </span>
                <p className="text-[11px] text-[#737B88] mt-0.5">
                  Derived deterministically from WIRs, NC penalties & audits
                </p>
              </div>
            </div>

            {/* Project Distribution Bars */}
            <div className="space-y-2 py-3 border-t border-[#F1F5F9]">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-medium text-slate-700">
                  <span className="w-2 h-2 rounded-full bg-[#16805D]" />
                  <span>Healthy Projects</span>
                </span>
                <span className="font-bold tabular-nums text-slate-900">{healthStats.healthy}</span>
              </div>
              <div className="w-full h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#16805D] rounded-full"
                  style={{ width: `${(healthStats.healthy / Math.max(1, projectClusters.length)) * 100}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="flex items-center gap-1.5 font-medium text-slate-700">
                  <span className="w-2 h-2 rounded-full bg-[#D97706]" />
                  <span>At Risk Projects</span>
                </span>
                <span className="font-bold tabular-nums text-[#B7791F]">{healthStats.atRisk}</span>
              </div>
              <div className="w-full h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#D97706] rounded-full"
                  style={{ width: `${(healthStats.atRisk / Math.max(1, projectClusters.length)) * 100}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="flex items-center gap-1.5 font-medium text-slate-700">
                  <span className="w-2 h-2 rounded-full bg-[#DC2626]" />
                  <span>Critical Projects</span>
                </span>
                <span className="font-bold tabular-nums text-[#C63F43]">{healthStats.critical}</span>
              </div>
              <div className="w-full h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#DC2626] rounded-full"
                  style={{ width: `${(healthStats.critical / Math.max(1, projectClusters.length)) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[#F1F5F9]">
            <div className="p-2.5 rounded-lg bg-[#FAFBFB] border border-[#F1F5F9] text-center">
              <span className="text-xs text-[#737B88] font-medium block">1st-Pass Pass Rate</span>
              <span className="text-base font-bold text-[#17191D] tabular-nums mt-0.5 block">
                {kpis.portfolioWIRPassRate}%
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-[#FAFBFB] border border-[#F1F5F9] text-center">
              <span className="text-xs text-[#737B88] font-medium block">Open Audit CAs</span>
              <span className="text-base font-bold text-[#C63F43] tabular-nums mt-0.5 block">
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
      <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-2xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#F1F5F9] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-[#17191D]">
              Projects Requiring Management Attention
            </h3>
            <span className="text-xs text-[#737B88]">
              · Ranked by risk severity & schedule delay
            </span>
          </div>

          <button
            onClick={() => setTab('wip')}
            className="text-xs font-bold text-[#00594F] hover:underline flex items-center gap-1"
          >
            View all {projectClusters.length} projects in WIP <ChevronRight size={13} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left min-w-[760px]">
            <thead>
              <tr className="text-[#737B88] font-semibold border-b border-[#F1F5F9] bg-[#FAFBFB]">
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
            <tbody className="divide-y divide-[#F1F5F9]">
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
                      className="hover:bg-[#FAFBFB] cursor-pointer transition-colors group"
                    >
                      <td className="py-3 px-5 font-bold text-[#17191D] group-hover:text-[#00594F] transition-colors">
                        {p.name}
                      </td>
                      <td className="py-3 px-3 text-[#737B88] font-medium">{p.city}</td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2 tabular-nums">
                          <span className="font-bold text-[#17191D]">{p.overallProgress}%</span>
                          <div className="w-16 h-1 bg-[#F1F5F9] rounded-full overflow-hidden">
                            <div
                              className={clsx(
                                'h-full rounded-full',
                                isCrit ? 'bg-[#DC2626]' : isRisk ? 'bg-[#D97706]' : 'bg-[#00594F]'
                              )}
                              style={{ width: `${p.overallProgress}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right tabular-nums text-[#737B88] font-medium">
                        {commercial.projectBreakdown.find(b => b.projectId === p.projectId)?.soldUnits || 0} / {commercial.projectBreakdown.find(b => b.projectId === p.projectId)?.totalUnits || 0}
                      </td>
                      <td className="py-3 px-3 text-right font-bold tabular-nums text-[#17191D]">
                        {p.qualityScore}/100
                      </td>
                      <td className="py-3 px-3 text-right tabular-nums">
                        <span className={clsx(p.criticalNCs > 0 ? 'text-[#C63F43] font-bold' : 'text-[#737B88] font-medium')}>
                          {p.openNCs} {p.criticalNCs > 0 ? `(${p.criticalNCs} crit)` : ''}
                        </span>
                      </td>
                      <td className="py-3 px-5">
                        <span className="flex items-center gap-1.5 font-bold text-xs">
                          <span
                            className={clsx(
                              'w-2 h-2 rounded-full',
                              isCrit ? 'bg-[#DC2626]' : isRisk ? 'bg-[#D97706]' : 'bg-[#16805D]'
                            )}
                          />
                          <span className={clsx(
                            isCrit ? 'text-[#C63F43]' : isRisk ? 'text-[#B7791F]' : 'text-[#16805D]'
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
