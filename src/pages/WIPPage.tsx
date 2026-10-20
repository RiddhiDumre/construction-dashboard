// ============================================================
// PAGE 2 — WIP: WORK IN PROGRESS (Central Operational Module)
// Highest Operational Priority: Physical construction tracking
// across projects, towers, floor slabs, and work packages.
// Features the signature interactive architectural building elevation.
// ============================================================

import React, { useState, useMemo } from 'react';
import {
  Layers, Building2, CheckCircle2, AlertTriangle, Clock,
  ArrowRight, ChevronRight, Search, Filter, ShieldAlert,
  HardHat, Calendar, ChevronDown
} from 'lucide-react';
import clsx from 'clsx';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line
} from 'recharts';
import { useApp } from '../store/appStore';
import {
  PROJECTS, CONTRACTORS, TOWERS_DATA, FLOORS_DATA,
  type TowerBuilding, type FloorProgress, type WIPActivity,
} from '../data/seedData';
import {
  getWIPSummaryMetrics, getProgressCurveData,
} from '../data/calculations';

// ── Palette ────────────────────────────────────────────────
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

const STAGES = ['All Stages', 'Foundation', 'Column casting', 'Slab casting', 'Masonry', 'Plastering', 'Painting', 'Finishing'];
const STATUSES = ['All Statuses', 'In Progress', 'Delayed', 'Blocked', 'Completed'];

export function WIPPage() {
  const { state, selectActivity, selectProject, selectWIR, selectNC, setTab } = useApp();

  // Active Project Selection (Default: Riverstone Towers P004)
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    state.selectedProjectId || 'P004'
  );

  // Active Tower Selection
  const [selectedTower, setSelectedTower] = useState<string>('Tower 1');

  // Active Floor Selection (for deep drill-down)
  const [selectedFloor, setSelectedFloor] = useState<string>('Floor 05');

  // Activity filters
  const [selectedStage, setSelectedStage] = useState('All Stages');
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');
  const [activitySearch, setActivitySearch] = useState('');

  // Slab hover tooltip
  const [hoveredSlab, setHoveredSlab] = useState<{
    x: number;
    y: number;
    towerName: string;
    floorNumber: number;
    stage: string;
    physicalPct: number;
    inspectedPct: number;
    status: string;
    isCritical: boolean;
    issueTitle?: string;
    varianceDays?: number;
    contractorName?: string;
    linkedWIRId?: string;
    linkedNCId?: string;
  } | null>(null);

  // Current Project
  const currentProject = useMemo(() => {
    return PROJECTS.find(p => p.id === selectedProjectId) || PROJECTS[0];
  }, [selectedProjectId]);

  // Project Towers
  const projectTowers = useMemo(() => {
    return TOWERS_DATA.filter(t => t.projectId === currentProject.id);
  }, [currentProject]);

  // Ensure active tower belongs to current project
  React.useEffect(() => {
    if (projectTowers.length > 0 && !projectTowers.some(t => t.name === selectedTower)) {
      setSelectedTower(projectTowers[0].name);
    }
  }, [projectTowers, selectedTower]);

  // Summary Metrics
  const summary = useMemo(
    () => getWIPSummaryMetrics(undefined, currentProject.id),
    [currentProject]
  );

  // Floors for active Tower
  const towerFloors = useMemo(() => {
    const activeTowerObj = projectTowers.find(t => t.name === selectedTower) || projectTowers[0];
    const towerName = activeTowerObj?.name || 'Tower 1';
    return FLOORS_DATA.filter(f => f.projectId === currentProject.id && f.tower === towerName);
  }, [currentProject, projectTowers, selectedTower]);

  // S-Curve timeline data
  const curveData = useMemo(
    () => getProgressCurveData(undefined, currentProject.id),
    [currentProject]
  );

  // Filtered Activities
  const filteredActivities = useMemo(() => {
    return state.wipActivities.filter(a => {
      if (a.projectId !== currentProject.id) return false;
      if (selectedTower && a.tower !== selectedTower) return false;
      if (selectedFloor && a.floor !== selectedFloor) return false;
      if (selectedStage !== 'All Stages' && a.stage !== selectedStage) return false;
      if (selectedStatus !== 'All Statuses' && a.status !== selectedStatus) return false;
      if (activitySearch.trim()) {
        const q = activitySearch.toLowerCase();
        if (!a.workPackage.toLowerCase().includes(q) && !a.id.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [state.wipActivities, currentProject.id, selectedTower, selectedFloor, selectedStage, selectedStatus, activitySearch]);

  // Active Floor Record
  const activeFloorRecord = useMemo(() => {
    return towerFloors.find(f => f.floorName === selectedFloor) || towerFloors[0];
  }, [towerFloors, selectedFloor]);

  return (
    <div className="space-y-4 pb-12">
      {/* ============================================================
          HEADER & PROJECT SWITCHER
          ============================================================ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5E7EB]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#17191D]">
              Work in Progress (WIP)
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#E6F4F1] text-[#00594F] border border-[#B3E0D8]">
              Physical Execution
            </span>
          </div>
          <p className="text-xs text-[#737B88] mt-0.5">
            Slab-by-slab structural execution, quality-inspected verification and contractor pacing.
          </p>
        </div>

        {/* Project Selector Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
          {PROJECTS.map(p => {
            const active = p.id === currentProject.id;
            const isCrit = p.id === 'P004';
            return (
              <button
                key={p.id}
                onClick={() => {
                  setSelectedProjectId(p.id);
                  selectProject(p.id);
                }}
                className={clsx(
                  'px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5',
                  active
                    ? 'bg-[#17191D] text-white shadow-xs'
                    : 'bg-white border border-[#E5E7EB] text-[#737B88] hover:text-[#17191D]'
                )}
              >
                <span>{p.name}</span>
                {isCrit && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626]" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ============================================================
          TOP KPI METRIC STRIP
          ============================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 shadow-2xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#737B88]">
            Superstructure Progress
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-[#17191D] tabular-nums">
              {currentProject.progressPercentage}%
            </span>
            <span className="text-xs text-[#737B88]">
              vs {currentProject.targetProgressPercentage}% planned
            </span>
          </div>
          <div className="w-full h-1.5 bg-[#F1F5F9] rounded-full mt-2.5 overflow-hidden">
            <div
              className={clsx(
                'h-full rounded-full',
                currentProject.progressPercentage < currentProject.targetProgressPercentage ? 'bg-[#D97706]' : 'bg-[#00594F]'
              )}
              style={{ width: `${currentProject.progressPercentage}%` }}
            />
          </div>
          <div className="text-[10px] text-[#737B88] mt-1.5 font-medium">
            {currentProject.progressPercentage < currentProject.targetProgressPercentage
              ? `${currentProject.targetProgressPercentage - currentProject.progressPercentage}% schedule delay on casting path`
              : 'On track with engineering baseline'}
          </div>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 shadow-2xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#737B88]">
            Active Buildings & Towers
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-3xl font-black text-[#17191D] tabular-nums">
              {projectTowers.length}
            </span>
            <span className="text-xs font-semibold text-[#737B88]">
              Towers ({currentProject.totalUnits} units)
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs mt-2.5 font-medium">
            <span className="text-[#16805D] flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#16805D]" />
              {projectTowers.filter(t => t.status === 'On Track').length} on pace
            </span>
            <span className="text-[#C63F43] flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#DC2626]" />
              {projectTowers.filter(t => t.status === 'Delayed').length} delayed
            </span>
          </div>
          <div className="text-[10px] text-[#737B88] mt-1 font-medium">
            Project Manager: <strong className="text-[#17191D]">{currentProject.projectManager}</strong>
          </div>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 shadow-2xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#737B88]">
            Slab Completion Ratio
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-[#00594F] tabular-nums">
              {projectTowers.reduce((acc, t) => acc + t.completedFloors, 0)}
            </span>
            <span className="text-sm font-semibold text-[#737B88]">
              / {projectTowers.reduce((acc, t) => acc + t.totalFloors, 0)} slabs cast
            </span>
          </div>
          <div className="w-full h-1.5 bg-[#F1F5F9] rounded-full mt-2.5 overflow-hidden">
            <div
              className="h-full bg-[#00594F] rounded-full"
              style={{
                width: `${Math.round(
                  (projectTowers.reduce((acc, t) => acc + t.completedFloors, 0) /
                    Math.max(1, projectTowers.reduce((acc, t) => acc + t.totalFloors, 0))) * 100
                )}%`,
              }}
            />
          </div>
          <div className="text-[10px] text-[#737B88] mt-1.5 font-medium">
            Current Focus: <strong className="text-[#17191D]">{selectedTower} · {selectedFloor}</strong>
          </div>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 shadow-2xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#737B88]">
            Quality Verification Gap
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className={clsx(
              'text-3xl font-black tabular-nums',
              currentProject.id === 'P004' ? 'text-[#C63F43]' : 'text-[#16805D]'
            )}>
              {currentProject.id === 'P004' ? '1 Hold' : '0 Holds'}
            </span>
            <span className="text-xs font-semibold text-[#737B88]">
              ({state.ncs.filter(n => n.projectId === currentProject.id && n.status !== 'Closed').length} open findings)
            </span>
          </div>
          <div className="text-xs text-[#737B88] mt-2.5 flex items-center gap-1 font-medium">
            <ShieldAlert size={14} className={currentProject.id === 'P004' ? 'text-[#DC2626]' : 'text-[#16805D]'} />
            <span className={currentProject.id === 'P004' ? 'text-[#C63F43] font-bold' : 'text-[#16805D] font-bold'}>
              {currentProject.id === 'P004' ? 'Floor 05 RCC Stop-Work' : 'Inspection Sign-Offs Clear'}
            </span>
          </div>
          <div className="text-[10px] text-[#737B88] mt-1">
            Quality Lead: <strong className="text-[#17191D]">{currentProject.qualityLead}</strong>
          </div>
        </div>
      </div>

      {/* ============================================================
          THE CENTERPIECE: INTERACTIVE ARCHITECTURAL BUILDING ELEVATION
          Shows all towers of the current project side-by-side.
          Every slab is clickable to filter floor details below.
          ============================================================ */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-2xs overflow-hidden">
        {/* Section Header */}
        <div className="px-5 py-3.5 border-b border-[#F1F5F9] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Layers size={16} className="text-[#00594F]" />
              <h2 className="text-sm font-bold text-[#17191D]">
                Architectural Elevation & Slab Progression: {currentProject.name}
              </h2>
            </div>
            <p className="text-xs text-[#737B88] mt-0.5">
              Click any tower or individual floor slab to inspect casting status, work packages, and inspection compliance.
            </p>
          </div>

          {/* Tower Selector Pills */}
          <div className="flex items-center gap-1">
            {projectTowers.map(t => {
              const active = t.name === selectedTower;
              return (
                <button
                  key={t.id}
                  onClick={() => setSelectedTower(t.name)}
                  className={clsx(
                    'px-2.5 py-1 rounded-md text-xs font-semibold transition-all',
                    active
                      ? 'bg-[#00594F] text-white shadow-xs'
                      : 'bg-[#F1F5F9] text-[#737B88] hover:text-[#17191D]'
                  )}
                >
                  {t.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Skyline Canvas */}
        <div className="p-6 bg-[#FAFBFB] flex items-end justify-center gap-10 overflow-x-auto min-h-[360px]">
          {projectTowers.map(tower => {
            const isSelectedTower = tower.name === selectedTower;
            const total = tower.totalFloors;
            const completed = tower.completedFloors;
            const active = completed + 1;
            const isTroubled = tower.projectId === 'P004' && tower.name === 'Tower 1';
            const criticalFloor = isTroubled ? 5 : undefined;

            const slabH = 8;
            const gap = 1.5;

            return (
              <div
                key={tower.id}
                onClick={() => setSelectedTower(tower.name)}
                className={clsx(
                  'flex flex-col items-center p-4 rounded-xl border transition-all cursor-pointer group',
                  isSelectedTower
                    ? 'border-[#00594F] bg-white shadow-md ring-2 ring-[#00594F]/10'
                    : 'border-slate-200 bg-white/70 hover:border-slate-300'
                )}
                style={{ width: 140 }}
              >
                {/* Tower Completion Badge */}
                <div className="w-full flex items-center justify-between text-xs mb-2">
                  <span className="font-bold text-[#17191D]">{tower.name}</span>
                  <span className={clsx(
                    'font-bold tabular-nums text-[11px]',
                    tower.status === 'Delayed' ? 'text-[#C63F43]' : 'text-[#00594F]'
                  )}>
                    {tower.actualProgress}%
                  </span>
                </div>

                {/* Slabs Stack */}
                <div
                  className="w-full flex flex-col-reverse relative group-hover:scale-[1.01] transition-transform"
                  style={{ gap: `${gap}px` }}
                >
                  {/* Penthouse / Elevator Shaft Roof */}
                  <div
                    className="w-full h-2.5 rounded-t-sm flex items-center justify-center text-[9px] font-bold text-white uppercase tracking-wider"
                    style={{
                      backgroundColor: tower.status === 'Delayed' ? '#DC2626' : '#17191D',
                    }}
                  >
                    Roof
                  </div>

                  {/* Slabs Loop */}
                  {Array.from({ length: total }).map((_, fIdx) => {
                    const floorNum = fIdx + 1;
                    const floorStr = `Floor ${String(floorNum).padStart(2, '0')}`;
                    const isCompleted = floorNum <= completed;
                    const isActive = floorNum === active;
                    const isCritical = criticalFloor === floorNum;
                    const isSelectedFloor = isSelectedTower && selectedFloor === floorStr;
                    const isDelayed = tower.status === 'Delayed' && floorNum > completed && floorNum <= completed + 2;

                    let bg = '#E2E8F0';
                    if (isCritical) bg = '#DC2626';
                    else if (isCompleted) bg = '#00594F';
                    else if (isActive) bg = '#0D9488';
                    else if (isDelayed) bg = '#D97706';

                    return (
                      <div
                        key={floorNum}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTower(tower.name);
                          setSelectedFloor(floorStr);
                        }}
                        onMouseEnter={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setHoveredSlab({
                            x: rect.right + 12,
                            y: rect.top - 20,
                            towerName: tower.name,
                            floorNumber: floorNum,
                            stage: isCompleted ? 'Completed Slab' : isActive ? tower.currentStage : 'Upcoming Package',
                            physicalPct: isCompleted ? 100 : isActive ? 75 : 0,
                            inspectedPct: isCompleted ? 100 : 0,
                            status: isCritical ? 'Critical Defect Hold' : isCompleted ? 'Inspection Passed' : isActive ? 'Active Pouring' : 'Upcoming',
                            isCritical: isCritical,
                            issueTitle: isCritical ? 'Concrete cube-test failure & honeycombing' : undefined,
                            varianceDays: tower.varianceDays,
                            contractorName: tower.contractorId === 'C001' ? 'ABC Civil Works' : 'Sharma Formwork',
                            linkedWIRId: isCritical ? 'WIR-0021' : undefined,
                            linkedNCId: isCritical ? 'NC-0001' : undefined,
                          });
                        }}
                        onMouseLeave={() => setHoveredSlab(null)}
                        className={clsx(
                          'w-full rounded-[1px] relative cursor-pointer transition-all flex items-center justify-between px-1.5',
                          isSelectedFloor ? 'ring-2 ring-black z-10' : 'hover:opacity-80'
                        )}
                        style={{
                          height: `${slabH}px`,
                          backgroundColor: bg,
                        }}
                      >
                        <span className="text-[7px] font-bold text-white/90 select-none">
                          {floorNum}
                        </span>
                        {isCritical && (
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        )}
                      </div>
                    );
                  })}

                  {/* Foundation Base */}
                  <div className="w-full h-2 bg-slate-400 rounded-b-sm flex items-center justify-center text-[8px] font-bold text-white uppercase tracking-wider">
                    Plinth
                  </div>
                </div>

                {/* Subtitle */}
                <div className="mt-3 text-center w-full">
                  <span className="text-[11px] font-bold text-[#17191D] block">
                    {tower.currentStage}
                  </span>
                  <span className="text-[10px] text-[#737B88] tabular-nums block mt-0.5">
                    {completed} of {total} slabs cast ({tower.varianceDays >= 0 ? 'On pace' : `${Math.abs(tower.varianceDays)}d behind`})
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="px-5 py-2.5 border-t border-[#F1F5F9] flex flex-wrap items-center justify-between text-xs text-[#737B88] gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-[11px]">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#00594F]" />
              Completed & Passed
            </span>
            <span className="flex items-center gap-1.5 text-[11px]">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#0D9488]" />
              In Progress Casting
            </span>
            <span className="flex items-center gap-1.5 text-[11px]">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#D97706]" />
              Delayed Superstructure
            </span>
            <span className="flex items-center gap-1.5 text-[11px]">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#DC2626]" />
              Critical Stop-Work Hold
            </span>
          </div>

          <span className="text-[11px] text-[#00594F] font-semibold">
            Active Selection: {selectedTower} · {selectedFloor}
          </span>
        </div>
      </div>

      {/* ============================================================
          TWO-COLUMN SECTION: S-CURVE TIMELINE & ACTIVE FLOOR DETAIL
          ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* LEFT: S-Curve Progress Timeline (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-[#E5E7EB] rounded-xl p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
              <div>
                <h3 className="text-sm font-bold text-[#17191D]">
                  S-Curve Cumulative Progress: {currentProject.name}
                </h3>
                <p className="text-xs text-[#737B88] mt-0.5">
                  Actual physical execution (green area) vs baseline engineering plan (slate dashed line)
                </p>
              </div>

              <span className={clsx(
                'text-[11px] font-bold px-2 py-0.5 rounded-full',
                currentProject.progressPercentage < currentProject.targetProgressPercentage
                  ? 'bg-rose-50 text-[#C63F43] border border-rose-200'
                  : 'bg-emerald-50 text-[#16805D] border border-emerald-200'
              )}>
                {currentProject.progressPercentage < currentProject.targetProgressPercentage
                  ? `-${currentProject.targetProgressPercentage - currentProject.progressPercentage}% Schedule Variance`
                  : 'On Schedule'}
              </span>
            </div>

            {/* Chart */}
            <div className="h-56 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={curveData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="wipActualGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00594F" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#00594F" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#64748B' }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748B' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#E2E8F0',
                      borderRadius: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="actual"
                    stroke="#00594F"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#wipActualGrad)"
                    name="Actual Execution %"
                  />
                  <Line
                    type="monotone"
                    dataKey="planned"
                    stroke="#94A3B8"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={{ r: 3, fill: '#94A3B8' }}
                    name="Planned Baseline %"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-[#737B88] pt-3 border-t border-[#F1F5F9] font-medium">
            <span>Project Baseline Target: {currentProject.targetCompletion}</span>
            <span>Forecast Completion: <strong>May 2027</strong></span>
          </div>
        </div>

        {/* RIGHT: Active Floor Deep-Dive Card (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-[#E5E7EB] rounded-xl p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#737B88] block">
                  Focused Floor Inspection
                </span>
                <h3 className="text-base font-bold text-[#17191D] mt-0.5">
                  {selectedTower} · {selectedFloor}
                </h3>
              </div>
              <span className={clsx(
                'text-xs font-bold px-2 py-0.5 rounded-full',
                selectedFloor === 'Floor 05' && currentProject.id === 'P004'
                  ? 'bg-rose-100 text-[#C63F43] border border-rose-300'
                  : 'bg-emerald-100 text-[#16805D]'
              )}>
                {selectedFloor === 'Floor 05' && currentProject.id === 'P004' ? 'Critical Hold' : 'In Progress'}
              </span>
            </div>

            {/* Execution vs Inspection Bars */}
            <div className="space-y-3.5 my-4">
              <div>
                <div className="flex justify-between text-xs font-medium mb-1 text-slate-700">
                  <span>Physical Execution (Concrete Poured)</span>
                  <span className="font-bold tabular-nums text-[#17191D]">
                    {activeFloorRecord?.physicalProgress ?? 80}%
                  </span>
                </div>
                <div className="w-full h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#00594F] rounded-full"
                    style={{ width: `${activeFloorRecord?.physicalProgress ?? 80}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium mb-1 text-slate-700">
                  <span>Quality Inspected (Signed Off)</span>
                  <span className="font-bold tabular-nums text-[#16805D]">
                    {activeFloorRecord?.inspectedProgress ?? 0}%
                  </span>
                </div>
                <div className="w-full h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#16805D] rounded-full"
                    style={{ width: `${activeFloorRecord?.inspectedProgress ?? 0}%` }}
                  />
                </div>
              </div>

              {/* Inspection Gap Alert */}
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-amber-900">
                  <AlertTriangle size={14} className="text-amber-700" />
                  <span>Unverified Physical Work Discrepancy</span>
                </div>
                <p className="text-[11px] text-amber-800 mt-1 leading-snug">
                  Concrete poured on columns Grid C12–C21, but WIR review is blocked pending core testing. Rebar spacing deviations recorded.
                </p>
              </div>

              {/* Linked WIR & NC Shortcuts */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => {
                    setTab('wir');
                    selectWIR('WIR-0021');
                  }}
                  className="p-2.5 rounded-lg border border-[#E5E7EB] hover:bg-slate-50 transition-colors text-left"
                >
                  <span className="text-[10px] text-[#737B88] font-semibold block">Linked WIR</span>
                  <span className="text-xs font-bold text-[#00594F] block mt-0.5">WIR-0021 →</span>
                  <span className="text-[10px] text-[#C63F43] font-medium block">Awaiting Review</span>
                </button>

                <button
                  onClick={() => {
                    setTab('nc');
                    selectNC('NC-0001');
                  }}
                  className="p-2.5 rounded-lg border border-red-200 bg-red-50/50 hover:bg-red-50 transition-colors text-left"
                >
                  <span className="text-[10px] text-red-700 font-semibold block">Linked NC Defect</span>
                  <span className="text-xs font-bold text-[#C63F43] block mt-0.5">NC-0001 →</span>
                  <span className="text-[10px] text-[#C63F43] font-medium block">Cube Test Failure</span>
                </button>
              </div>
            </div>
          </div>

          <div className="text-xs text-[#737B88] pt-3 border-t border-[#F1F5F9] flex items-center justify-between font-medium">
            <span>Assigned Contractor: <strong>ABC Civil Works</strong></span>
            <span>Due Date: <strong>10 Oct 2025</strong></span>
          </div>
        </div>
      </div>

      {/* ============================================================
          FLOOR-WISE CONSTRUCTION STAGES MATRIX
          ============================================================ */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-[#F1F5F9]">
          <div>
            <h3 className="text-sm font-bold text-[#17191D]">
              Floor-Wise Stage Register: {currentProject.name} — {selectedTower}
            </h3>
            <p className="text-xs text-[#737B88] mt-0.5">
              Tracks individual slab progression from Column casting to Slab casting and Finishing.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#737B88]">Total Floors:</span>
            <span className="font-bold text-[#17191D] bg-[#F1F5F9] px-2 py-0.5 rounded">
              {towerFloors.length} Levels
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {towerFloors.map(floor => {
            const isBlocked = floor.status === 'Delayed';
            const isSelected = selectedFloor === floor.floorName;

            return (
              <div
                key={floor.id}
                onClick={() => setSelectedFloor(floor.floorName)}
                className={clsx(
                  'p-3.5 rounded-xl border transition-all cursor-pointer',
                  isSelected
                    ? 'border-[#00594F] bg-teal-50/20 shadow-xs ring-1 ring-[#00594F]'
                    : isBlocked
                    ? 'border-red-200 bg-red-50/20 hover:border-red-300'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                )}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-xs text-[#17191D]">{floor.floorName}</span>
                  <span className={clsx(
                    'text-[10px] font-bold px-1.5 py-0.5 rounded',
                    floor.status === 'Completed' ? 'bg-emerald-100 text-[#16805D]' :
                    floor.status === 'Delayed' ? 'bg-rose-100 text-[#C63F43]' :
                    'bg-teal-100 text-[#00594F]'
                  )}>
                    {floor.status}
                  </span>
                </div>

                <div className="text-[11px] text-[#737B88] mb-2 font-medium">
                  Stage: <strong className="text-[#17191D]">{floor.stage}</strong>
                </div>

                {/* Bars */}
                <div className="space-y-1.5 text-[10px]">
                  <div>
                    <div className="flex justify-between text-[#737B88] mb-0.5 font-medium">
                      <span>Physical Execution</span>
                      <span className="font-bold text-[#17191D]">{floor.physicalProgress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-[#F1F5F9] rounded-full overflow-hidden">
                      <div className="h-full bg-[#00594F] rounded-full" style={{ width: `${floor.physicalProgress}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[#737B88] mb-0.5 font-medium">
                      <span>Quality Inspected</span>
                      <span className="font-bold text-[#16805D]">{floor.inspectedProgress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-[#F1F5F9] rounded-full overflow-hidden">
                      <div className="h-full bg-[#16805D] rounded-full" style={{ width: `${floor.inspectedProgress}%` }} />
                    </div>
                  </div>
                </div>

                {/* Footer notes */}
                {floor.linkedNCId && (
                  <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-[#C63F43] font-bold">
                    <span>Defect: {floor.linkedNCId}</span>
                    <span>Hold Active</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ============================================================
          WORK PACKAGES & ACTIVITY REGISTER (ACTIVITIES TABLE)
          ============================================================ */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-2xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#F1F5F9] flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-[#17191D]">
              Work Packages Register ({filteredActivities.length} Activities)
            </h3>
            <p className="text-xs text-[#737B88]">
              Detailed activity schedule, contractor assignments and quality inspection linkages.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                value={activitySearch}
                onChange={e => setActivitySearch(e.target.value)}
                placeholder="Search work packages…"
                className="h-8 pl-7 pr-3 text-xs bg-white border border-[#E5E7EB] rounded-lg outline-none text-[#17191D] w-40"
              />
            </div>

            <select
              value={selectedStage}
              onChange={e => setSelectedStage(e.target.value)}
              className="h-8 px-2 text-xs bg-white border border-[#E5E7EB] rounded-lg text-[#17191D] outline-none"
            >
              {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="h-8 px-2 text-xs bg-white border border-[#E5E7EB] rounded-lg text-[#17191D] outline-none"
            >
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left min-w-[800px]">
            <thead>
              <tr className="text-[#737B88] font-semibold border-b border-[#F1F5F9] bg-[#FAFBFB]">
                <th className="py-2.5 px-5">Work Package</th>
                <th className="py-2.5 px-3">Location</th>
                <th className="py-2.5 px-3">Stage</th>
                <th className="py-2.5 px-3">Progress</th>
                <th className="py-2.5 px-3">Variance</th>
                <th className="py-2.5 px-3">Contractor</th>
                <th className="py-2.5 px-5">Status</th>
                <th className="py-2.5 px-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {filteredActivities.map(act => {
                const isDelayed = act.status === 'Delayed' || act.status === 'Blocked';
                const contractor = CONTRACTORS.find(c => c.id === act.contractorId);

                return (
                  <tr
                    key={act.id}
                    onClick={() => selectActivity(act.id)}
                    className="hover:bg-[#FAFBFB] cursor-pointer transition-colors group"
                  >
                    <td className="py-3 px-5">
                      <div className="font-bold text-[#17191D] group-hover:text-[#00594F] transition-colors">
                        {act.workPackage}
                      </div>
                      <span className="text-[10px] text-[#737B88] font-mono">{act.id}</span>
                    </td>
                    <td className="py-3 px-3 text-[#737B88] font-medium">
                      {act.tower} · {act.floor}
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-700">{act.stage}</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2 tabular-nums">
                        <span className="font-bold text-[#17191D]">{act.actualProgress}%</span>
                        <div className="w-16 h-1 bg-[#F1F5F9] rounded-full overflow-hidden">
                          <div
                            className={clsx(
                              'h-full rounded-full',
                              isDelayed ? 'bg-[#DC2626]' : 'bg-[#00594F]'
                            )}
                            style={{ width: `${act.actualProgress}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 tabular-nums font-semibold">
                      <span className={act.varianceDays < 0 ? 'text-[#C63F43]' : 'text-[#16805D]'}>
                        {act.varianceDays < 0 ? `${act.varianceDays}d` : `+${act.varianceDays}d`}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-[#737B88] font-medium">
                      {contractor?.name || act.contractorId}
                    </td>
                    <td className="py-3 px-5">
                      <span className="flex items-center gap-1.5 font-bold text-xs">
                        <span
                          className={clsx(
                            'w-2 h-2 rounded-full',
                            act.status === 'Completed' ? 'bg-[#16805D]' :
                            isDelayed ? 'bg-[#DC2626]' : 'bg-[#00594F]'
                          )}
                        />
                        <span className={clsx(
                          act.status === 'Completed' ? 'text-[#16805D]' :
                          isDelayed ? 'text-[#C63F43]' : 'text-[#00594F]'
                        )}>
                          {act.status}
                        </span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-slate-300 group-hover:text-[#17191D] transition-colors">
                      <ChevronRight size={14} />
                    </td>
                  </tr>
                );
              })}

              {filteredActivities.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-xs text-[#737B88]">
                    No work packages match current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Floating Hover Tooltip for Slabs */}
      {hoveredSlab && (
        <div
          className="fixed z-50 bg-[#17191D] text-white rounded-xl p-3 shadow-2xl pointer-events-none text-xs border border-slate-700/60 max-w-xs animate-in fade-in duration-100"
          style={{
            top: Math.max(10, Math.min(window.innerHeight - 220, hoveredSlab.y)),
            left: Math.max(10, Math.min(window.innerWidth - 300, hoveredSlab.x)),
          }}
        >
          <div className="flex items-center justify-between border-b border-slate-700 pb-1.5 mb-2">
            <span className="font-bold text-white">
              {hoveredSlab.towerName}
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
              Floor {String(hoveredSlab.floorNumber).padStart(2, '0')}
            </span>
          </div>

          <div className="space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-400">Stage:</span>
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
            {hoveredSlab.contractorName && (
              <div className="flex justify-between text-slate-400 text-[10px] pt-1">
                <span>Contractor:</span>
                <span className="text-slate-300 font-medium">{hoveredSlab.contractorName}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
