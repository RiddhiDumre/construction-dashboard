// ============================================================
// PAGE 1 — OVERVIEW (Executive Bento Cockpit — Apple-Inspired)
// Top: Numbers forced visible for CXO overview
// 1 Row, 2-Column Bento Grid:
//   Column 1: WIP Overview with Apple-style Building Elevation Infographic (slab-wise, with critical error on Floor 5)
//   Column 2: Audit Infographic (Apple Activity Rings) + Main Critical Issues + Flats Sold Infographic
// Zero vertical scrollbar, high-contrast bold numbers, minimal text.
// ============================================================

import React, { useState, useMemo } from 'react';
import {
  AlertTriangle, AlertCircle, TrendingDown, TrendingUp,
  Building2, Layers, CheckCircle2, Clock, ShieldAlert, Award,
  ChevronRight, X, DollarSign, ArrowRight, ArrowUpRight,
  Maximize2, Eye, Flame
} from 'lucide-react';
import clsx from 'clsx';
import { useApp } from '../store/appStore';
import {
  getAllProjectMetrics, getOverviewPortfolioKPIs, getNeedsAttentionAlerts,
  getCXOCommercialInventory, getPortfolioSlabMetrics,
} from '../data/calculations';
import { PROJECTS, TOWERS_DATA, FLOORS_DATA } from '../data/seedData';
import { ProjectDetailDrawer } from '../components/ProjectDetailDrawer';

const CITIES = [
  'All locations',
  'Mumbai',
  'Thane',
  'Navi Mumbai',
  'Pune',
  'Bengaluru',
  'Hyderabad',
  'Gurugram',
];

interface BuildingConfig {
  id: string;
  projectId: string;
  projectName: string;
  towerName: string;
  city: string;
  totalFloors: number;
  completedFloors: number;
  activeFloor: number;
  criticalFloor?: {
    floorNumber: number;
    issue: string;
    ncId: string;
    wirId: string;
    contractor: string;
  };
  delayDays: number;
  status: 'On Track' | 'Delayed' | 'At Risk';
}

export function PortfolioPage() {
  const {
    state,
    setFilter,
    selectProject,
    setTab,
    selectNC,
    selectWIR,
  } = useApp();

  const [selectedBuildingId, setSelectedBuildingId] = useState<string>('T010'); // Riverstone Tower 1 (Showcase)
  const [hoveredFloor, setHoveredFloor] = useState<{
    towerName: string;
    floorNumber: number;
    status: string;
    detail?: string;
  } | null>(null);

  const [inventoryModalOpen, setInventoryModalOpen] = useState(false);
  const [slabModalOpen, setSlabModalOpen] = useState(false);

  const activeCity = state.filters.city || 'All locations';

  // Dynamic Portfolio KPIs scoped to geographic selection
  const kpis = useMemo(
    () => getOverviewPortfolioKPIs(activeCity, state.weights, state.wirs, state.ncs),
    [activeCity, state.weights, state.wirs, state.ncs]
  );

  // Commercial / Flats Sold Metrics for CXO
  const commercialData = useMemo(
    () => getCXOCommercialInventory(activeCity),
    [activeCity]
  );

  // Slab Metrics
  const slabData = useMemo(
    () => getPortfolioSlabMetrics(activeCity),
    [activeCity]
  );

  // Priority Operational Critical Issues
  const alerts = useMemo(
    () => getNeedsAttentionAlerts(activeCity, state.wirs, state.ncs, state.weights),
    [activeCity, state.wirs, state.ncs, state.weights]
  );

  // Apple-style Skyline Buildings Data
  const skylineBuildings: BuildingConfig[] = useMemo(() => [
    {
      id: 'T010',
      projectId: 'P004',
      projectName: 'Riverstone Towers',
      towerName: 'Tower 1',
      city: 'Gurugram',
      totalFloors: 24,
      completedFloors: 4,
      activeFloor: 6,
      criticalFloor: {
        floorNumber: 5,
        issue: 'Cube test 28d failure & column honeycombing',
        ncId: 'NC-0001',
        wirId: 'WIR-0021',
        contractor: 'ABC Civil Works',
      },
      delayDays: -38,
      status: 'Delayed',
    },
    {
      id: 'T001',
      projectId: 'P001',
      projectName: 'Meridian Heights',
      towerName: 'Tower A',
      city: 'Mumbai',
      totalFloors: 18,
      completedFloors: 9,
      activeFloor: 10,
      delayDays: -3,
      status: 'On Track',
    },
    {
      id: 'T018',
      projectId: 'P007',
      projectName: 'Vivanta Sereno',
      towerName: 'Tower 1',
      city: 'Thane',
      totalFloors: 15,
      completedFloors: 9,
      activeFloor: 10,
      delayDays: 0,
      status: 'On Track',
    },
    {
      id: 'T004',
      projectId: 'P002',
      projectName: 'Northgate Residences',
      towerName: 'Block 1',
      city: 'Bengaluru',
      totalFloors: 12,
      completedFloors: 12,
      activeFloor: 12,
      delayDays: 3,
      status: 'On Track',
    },
  ], []);

  const activeBuilding = skylineBuildings.find(b => b.id === selectedBuildingId) || skylineBuildings[0];

  return (
    <div className="h-full flex flex-col gap-2.5 overflow-hidden select-none">
      {/* ============================================================
          TOP SECTION: MACRO NUMBERS FORCED VISIBLE (CXO OVERVIEW)
          Bold typography, high-impact cards with instant visibility
          ============================================================ */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-2.5 shadow-xs flex-shrink-0">
        <div className="flex items-center justify-between gap-3">
          {/* City Scope Pills */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none flex-shrink-0">
            {CITIES.map(city => {
              const active =
                activeCity.toLowerCase() === city.toLowerCase() ||
                (city === 'All locations' && (activeCity === 'All locations' || activeCity === 'All Locations' || !activeCity));
              return (
                <button
                  key={city}
                  onClick={() => setFilter('city', city)}
                  className={clsx(
                    'px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border',
                    active
                      ? 'bg-[#0F172A] text-white border-[#0F172A] shadow-xs'
                      : 'bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0] hover:text-[#0F172A] hover:bg-slate-100'
                  )}
                >
                  {city}
                </button>
              );
            })}
          </div>

          {/* 5 Macro Numbers Forced Visible */}
          <div className="flex items-center gap-2 flex-1 justify-end">
            {/* 1. Overall Progress */}
            <div className="px-3 py-1 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center gap-2">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-[#64748B]">
                  Progress
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-black font-mono text-[#0F172A]">
                    {kpis.overallProgress}%
                  </span>
                  <span className="text-[10px] font-mono text-[#94A3B8]">
                    / {kpis.overallTargetProgress}% Plan
                  </span>
                </div>
              </div>
              <span
                className={clsx(
                  'text-xs font-bold font-mono px-1.5 py-0.5 rounded',
                  kpis.progressVariance >= 0
                    ? 'bg-emerald-50 text-[#16805D] border border-emerald-200'
                    : 'bg-rose-50 text-[#C63F43] border border-rose-200'
                )}
              >
                {kpis.progressVariance}%
              </span>
            </div>

            {/* 2. Slabs Cast */}
            <div
              onClick={() => setSlabModalOpen(true)}
              className="px-3 py-1 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center gap-2 cursor-pointer hover:border-slate-300 transition-colors"
            >
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-[#64748B]">
                  Slabs Cast
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-black font-mono text-[#0F172A]">
                    {slabData.castSlabs}
                  </span>
                  <span className="text-[10px] font-mono text-[#94A3B8]">
                    / {slabData.totalSlabs}
                  </span>
                </div>
              </div>
              <span className="text-xs font-bold font-mono px-1.5 py-0.5 rounded bg-blue-50 text-[#315EFB] border border-blue-200">
                {slabData.castPercent}%
              </span>
            </div>

            {/* 3. Flats Sold */}
            <div
              onClick={() => setInventoryModalOpen(true)}
              className="px-3 py-1 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center gap-2 cursor-pointer hover:border-slate-300 transition-colors"
            >
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-[#64748B]">
                  Flats Sold
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-black font-mono text-[#16805D]">
                    {commercialData.soldUnits}
                  </span>
                  <span className="text-[10px] font-mono text-[#94A3B8]">
                    / {commercialData.totalUnits}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold font-mono text-[#16805D] block">
                  {commercialData.soldPercent}%
                </span>
                <span className="text-[9px] font-mono text-[#64748B] block">
                  ₹{commercialData.bookedValueCr}Cr
                </span>
              </div>
            </div>

            {/* 4. Quality Index */}
            <div
              onClick={() => setTab('quality')}
              className="px-3 py-1 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center gap-2 cursor-pointer hover:border-slate-300 transition-colors"
            >
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-[#64748B]">
                  Quality Score
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-black font-mono text-[#0F172A]">
                    {kpis.portfolioQualityScore}
                  </span>
                  <span className="text-[10px] font-mono text-[#94A3B8]">/100</span>
                </div>
              </div>
              <div
                className={clsx(
                  'w-3 h-3 rounded-full flex-shrink-0',
                  kpis.portfolioQualityScore >= 80
                    ? 'bg-[#16805D]'
                    : kpis.portfolioQualityScore >= 60
                    ? 'bg-[#B7791F]'
                    : 'bg-[#C63F43]'
                )}
              />
            </div>

            {/* 5. Critical Issues */}
            <div
              onClick={() => setTab('nc')}
              className={clsx(
                'px-3 py-1 rounded-xl border flex items-center gap-2 cursor-pointer transition-colors',
                kpis.criticalNCs > 0
                  ? 'bg-rose-50 border-rose-200 text-[#C63F43] hover:bg-rose-100'
                  : 'bg-emerald-50 border-emerald-200 text-[#16805D]'
              )}
            >
              <AlertTriangle size={16} />
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider font-bold">
                  Defect Holds
                </div>
                <div className="text-xl font-black font-mono leading-none">
                  {kpis.criticalNCs} <span className="text-xs font-semibold">Critical</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================
          MAIN 1-ROW, 2-COLUMN BENTO GRID (Zero-Scroll Viewport)
          Column 1 (Left): WIP Overview with Apple-Style Building Elevations
          Column 2 (Right): Audit Infographic + Critical Issues + Flats Sold
          ============================================================ */}
      <div className="flex-1 min-h-0 grid grid-cols-12 gap-3">
        {/* ==========================================================
            COLUMN 1 (Left 6 Cols): VIP / WIP OVERVIEW & BUILDING ELEVATION
            ========================================================== */}
        <div className="col-span-12 lg:col-span-6 bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-xs flex flex-col justify-between overflow-hidden">
          {/* Header Strip */}
          <div className="flex items-center justify-between pb-2 border-b border-[#F1F5F9] flex-shrink-0">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-[#0F172A] tracking-tight">
                  WIP Construction Skyline
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-[#64748B] font-bold">
                  Slab-Wise Elevations
                </span>
              </div>
              <p className="text-[11px] font-mono text-[#64748B] mt-0.5">
                Proportional tower elevations · Exact floor being cast · Defect pins
              </p>
            </div>

            <button
              onClick={() => setTab('wip')}
              className="text-xs font-bold text-[#315EFB] hover:text-[#2748C0] flex items-center gap-1 group bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-lg transition-colors"
            >
              Full WIP Module <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Building Switcher Pills */}
          <div className="flex items-center gap-1.5 py-1.5 flex-shrink-0">
            <span className="text-[10px] font-mono uppercase text-[#94A3B8] font-bold mr-1">
              Select Tower:
            </span>
            {skylineBuildings.map(b => (
              <button
                key={b.id}
                onClick={() => setSelectedBuildingId(b.id)}
                className={clsx(
                  'px-2.5 py-0.5 rounded-md text-xs font-mono font-bold transition-all border',
                  selectedBuildingId === b.id
                    ? 'bg-[#0F172A] text-white border-[#0F172A]'
                    : 'bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0] hover:text-[#0F172A]'
                )}
              >
                {b.projectName} ({b.totalFloors}F)
                {b.criticalFloor && (
                  <span className="ml-1 w-1.5 h-1.5 rounded-full bg-rose-500 inline-block align-middle" />
                )}
              </button>
            ))}
          </div>

          {/* Apple-style Building Elevation Infographic Area */}
          <div className="flex-1 min-h-0 flex items-end justify-around gap-4 px-4 py-2 bg-[#F8FAFC]/70 rounded-xl border border-[#F1F5F9] relative overflow-hidden">
            {/* Background Grid Lines */}
            <div className="absolute inset-0 pointer-events-none opacity-20 flex flex-col justify-between p-2">
              <div className="border-b border-dashed border-slate-400 w-full" />
              <div className="border-b border-dashed border-slate-400 w-full" />
              <div className="border-b border-dashed border-slate-400 w-full" />
              <div className="border-b border-dashed border-slate-400 w-full" />
            </div>

            {skylineBuildings.map(building => {
              const isSelected = building.id === selectedBuildingId;
              const completedCount = building.completedFloors;
              const total = building.totalFloors;

              return (
                <div
                  key={building.id}
                  onClick={() => setSelectedBuildingId(building.id)}
                  className={clsx(
                    'flex flex-col items-center cursor-pointer transition-all duration-200 relative group flex-1 max-w-[130px]',
                    isSelected ? 'opacity-100 scale-102' : 'opacity-70 hover:opacity-90'
                  )}
                >
                  {/* Rooftop Crane Illustration */}
                  <div className="flex flex-col items-center mb-0.5">
                    {/* Minimalist Crane Arm */}
                    <div className="w-12 h-2.5 border-t-2 border-r-2 border-slate-500 relative flex justify-end">
                      <div className="w-0.5 h-2 bg-rose-500 absolute -top-1 left-2" />
                      <div className="w-1.5 h-1 bg-slate-600 rounded-2xs" />
                    </div>
                    {/* Parapet Roof */}
                    <div className="w-16 h-1 bg-slate-700 rounded-t" />
                  </div>

                  {/* Tower Stack: Scaled by floor count (Top Floor down to Ground) */}
                  <div
                    className={clsx(
                      'w-16 bg-white border-2 rounded-t-sm flex flex-col-reverse p-0.5 gap-[2px] shadow-sm transition-all',
                      isSelected ? 'border-[#0F172A]' : 'border-slate-300'
                    )}
                    style={{ height: `${total * 9 + 10}px` }}
                  >
                    {Array.from({ length: total }, (_, i) => {
                      const floorNum = i + 1;
                      const isCompleted = floorNum <= completedCount;
                      const isCritical = building.criticalFloor?.floorNumber === floorNum;
                      const isActive = floorNum === building.activeFloor;

                      return (
                        <div
                          key={floorNum}
                          onMouseEnter={() =>
                            setHoveredFloor({
                              towerName: `${building.projectName} · ${building.towerName}`,
                              floorNumber: floorNum,
                              status: isCritical
                                ? 'CRITICAL DEFECT'
                                : isCompleted
                                ? 'Completed Slab'
                                : isActive
                                ? 'Currently Pouring'
                                : 'Upcoming',
                              detail: isCritical ? building.criticalFloor?.issue : undefined,
                            })
                          }
                          onMouseLeave={() => setHoveredFloor(null)}
                          className={clsx(
                            'h-[7px] w-full rounded-2xs transition-all relative',
                            isCritical
                              ? 'bg-[#EF4444] animate-pulse ring-1 ring-red-500'
                              : isCompleted
                              ? 'bg-[#0F172A]'
                              : isActive
                              ? 'bg-[#315EFB] ring-1 ring-blue-400'
                              : 'bg-slate-200/80'
                          )}
                        >
                          {/* Pin indicator on the Critical Error Floor */}
                          {isCritical && (
                            <span className="absolute -right-3 -top-1 w-2.5 h-2.5 rounded-full bg-rose-600 border border-white ring-2 ring-red-400 animate-ping flex items-center justify-center text-[7px] font-black text-white" />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Concrete Ground Anchor */}
                  <div className="w-20 h-1.5 bg-slate-400 rounded-b mt-0.5" />

                  {/* Tower Bottom Label */}
                  <div className="text-center mt-1.5 w-full">
                    <div className="text-xs font-black text-[#0F172A] truncate">
                      {building.towerName}
                    </div>
                    <div className="text-[10px] font-mono text-[#64748B]">
                      {completedCount}/{total} Fl ({Math.round((completedCount / total) * 100)}%)
                    </div>
                    {building.delayDays !== 0 && (
                      <span
                        className={clsx(
                          'text-[9px] font-mono font-bold px-1 rounded block mt-0.5',
                          building.delayDays < 0
                            ? 'text-[#C63F43] bg-rose-50'
                            : 'text-[#16805D] bg-emerald-50'
                        )}
                      >
                        {building.delayDays}d
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Floating Floor Inspection Tooltip */}
            {hoveredFloor && (
              <div className="absolute top-2 left-2 bg-[#0F172A] text-white px-3 py-1.5 rounded-lg shadow-xl text-xs z-30 pointer-events-none animate-in fade-in duration-150 border border-slate-700">
                <div className="font-bold font-mono">
                  {hoveredFloor.towerName} — Floor {hoveredFloor.floorNumber.toString().padStart(2, '0')}
                </div>
                <div className="text-[10px] text-slate-300 font-mono mt-0.5">
                  Status: <span className="font-bold text-white">{hoveredFloor.status}</span>
                </div>
                {hoveredFloor.detail && (
                  <div className="text-[10px] text-rose-300 font-mono mt-0.5 font-bold">
                    ⚠️ {hoveredFloor.detail}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Active Building Diagnostic Callout & Slabs Breakdown */}
          <div className="pt-2 border-t border-[#F1F5F9] flex items-center justify-between text-xs font-mono flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#0F172A]">
                {activeBuilding.projectName} ({activeBuilding.city})
              </span>
              {activeBuilding.criticalFloor && (
                <span
                  onClick={() => {
                    setTab('nc');
                    selectNC(activeBuilding.criticalFloor!.ncId);
                  }}
                  className="px-2 py-0.5 rounded bg-rose-50 border border-rose-200 text-[#C63F43] font-bold text-[10px] cursor-pointer hover:bg-rose-100 flex items-center gap-1"
                >
                  <AlertTriangle size={11} />
                  Floor 05: {activeBuilding.criticalFloor.issue} (Inspect)
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 text-[10px] text-[#64748B]">
              <span className="flex items-center gap-1 font-bold text-[#0F172A]">
                <span className="w-2 h-2 rounded-2xs bg-[#0F172A]" /> Cast
              </span>
              <span className="flex items-center gap-1 font-bold text-[#315EFB]">
                <span className="w-2 h-2 rounded-2xs bg-[#315EFB]" /> Pouring
              </span>
              <span className="flex items-center gap-1 font-bold text-[#EF4444]">
                <span className="w-2 h-2 rounded-2xs bg-[#EF4444]" /> Defect Hold
              </span>
              <span className="flex items-center gap-1 text-slate-400">
                <span className="w-2 h-2 rounded-2xs bg-slate-200" /> Upcoming
              </span>
            </div>
          </div>
        </div>

        {/* ==========================================================
            COLUMN 2 (Right 6 Cols): TWO STACKED BENTO BOXES
            Top: Audit Overview (Apple Rings) + Critical Issues
            Bottom: Flats Sold Infographic
            ========================================================== */}
        <div className="col-span-12 lg:col-span-6 flex flex-col gap-3 min-h-0">
          {/* Bento 2A (Top): Audit Infographic & Critical Issues */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-xs flex-1 flex flex-col justify-between overflow-hidden">
            <div className="flex items-center justify-between pb-1.5 border-b border-[#F1F5F9] flex-shrink-0">
              <div className="flex items-center gap-2">
                <Award size={15} className="text-[#16805D]" />
                <span className="text-sm font-black text-[#0F172A] tracking-tight">
                  Audit Quality & Critical Issues
                </span>
              </div>
              <button
                onClick={() => setTab('quality')}
                className="text-xs font-bold text-[#16805D] hover:underline flex items-center gap-1"
              >
                Full Audit →
              </button>
            </div>

            <div className="flex-1 min-h-0 grid grid-cols-12 gap-3 items-center py-1">
              {/* Left 5 Cols: Apple-style Concentric Activity Rings */}
              <div className="col-span-5 flex flex-col items-center justify-center relative">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                  {/* Ring 1: WIR Pass Rate (Outer - Radius 48) */}
                  <circle cx="60" cy="60" r="48" stroke="#E2E8F0" strokeWidth="8" fill="none" />
                  <circle
                    cx="60"
                    cy="60"
                    r="48"
                    stroke="#16805D"
                    strokeWidth="8"
                    strokeDasharray={2 * Math.PI * 48}
                    strokeDashoffset={2 * Math.PI * 48 * (1 - kpis.portfolioWIRPassRate / 100)}
                    strokeLinecap="round"
                    fill="none"
                  />

                  {/* Ring 2: NC Health (Middle - Radius 36) */}
                  <circle cx="60" cy="60" r="36" stroke="#E2E8F0" strokeWidth="8" fill="none" />
                  <circle
                    cx="60"
                    cy="60"
                    r="36"
                    stroke="#315EFB"
                    strokeWidth="8"
                    strokeDasharray={2 * Math.PI * 36}
                    strokeDashoffset={2 * Math.PI * 36 * (1 - 0.85)}
                    strokeLinecap="round"
                    fill="none"
                  />

                  {/* Ring 3: Audit Compliance (Inner - Radius 24) */}
                  <circle cx="60" cy="60" r="24" stroke="#E2E8F0" strokeWidth="8" fill="none" />
                  <circle
                    cx="60"
                    cy="60"
                    r="24"
                    stroke="#8B5CF6"
                    strokeWidth="8"
                    strokeDasharray={2 * Math.PI * 24}
                    strokeDashoffset={2 * Math.PI * 24 * (1 - 0.72)}
                    strokeLinecap="round"
                    fill="none"
                  />
                </svg>

                {/* Score in Center of Rings */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-black font-mono text-[#0F172A] leading-none">
                    {kpis.portfolioQualityScore}
                  </span>
                  <span className="text-[9px] font-mono font-bold text-[#64748B]">INDEX</span>
                </div>

                {/* Rings Legend */}
                <div className="flex items-center gap-2 text-[9px] font-mono mt-1">
                  <span className="text-[#16805D] font-bold">WIR {kpis.portfolioWIRPassRate}%</span>
                  <span className="text-[#315EFB] font-bold">NC 85%</span>
                  <span className="text-[#8B5CF6] font-bold">Audit 72%</span>
                </div>
              </div>

              {/* Right 7 Cols: Critical Live Issues */}
              <div className="col-span-7 flex flex-col justify-around h-full space-y-1.5 pl-2 border-l border-[#F1F5F9]">
                <div className="text-[10px] font-mono uppercase font-bold text-[#64748B] tracking-wider">
                  Main Critical Issues
                </div>

                {/* Issue 1: Honeycombing on Floor 5 */}
                <div
                  onClick={() => {
                    setTab('nc');
                    selectNC('NC-0001');
                  }}
                  className="p-1.5 rounded-lg bg-rose-50 border border-rose-200 cursor-pointer hover:bg-rose-100 transition-colors flex items-center justify-between"
                >
                  <div className="min-w-0 pr-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-mono font-black text-rose-800 bg-rose-200 px-1 rounded">
                        CRITICAL
                      </span>
                      <span className="text-xs font-bold text-rose-950 truncate">
                        Riverstone · Floor 05
                      </span>
                    </div>
                    <div className="text-[10px] text-rose-800 font-mono truncate">
                      Cube test failure & column honeycombing
                    </div>
                  </div>
                  <ChevronRight size={13} className="text-rose-500 flex-shrink-0" />
                </div>

                {/* Issue 2: WIR-0021 SLA Breach */}
                <div
                  onClick={() => {
                    setTab('wir');
                    selectWIR('WIR-0021');
                  }}
                  className="p-1.5 rounded-lg bg-amber-50 border border-amber-200 cursor-pointer hover:bg-amber-100 transition-colors flex items-center justify-between"
                >
                  <div className="min-w-0 pr-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-mono font-black text-amber-800 bg-amber-200 px-1 rounded">
                        SLA BREACH
                      </span>
                      <span className="text-xs font-bold text-amber-950 truncate">
                        WIR-0021 (Riverstone)
                      </span>
                    </div>
                    <div className="text-[10px] text-amber-800 font-mono truncate">
                      7d overdue review holding up concrete pour
                    </div>
                  </div>
                  <ChevronRight size={13} className="text-amber-500 flex-shrink-0" />
                </div>

                {/* Issue 3: Meridian Stirrups */}
                <div
                  onClick={() => {
                    setTab('nc');
                    selectNC('NC-0006');
                  }}
                  className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors flex items-center justify-between"
                >
                  <div className="min-w-0 pr-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-mono font-black text-slate-800 bg-slate-200 px-1 rounded">
                        WORKMANSHIP
                      </span>
                      <span className="text-xs font-bold text-slate-900 truncate">
                        Meridian · Tower B Fl 06
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-600 font-mono truncate">
                      Rebar stirrup spacing deviation (4d)
                    </div>
                  </div>
                  <ChevronRight size={13} className="text-slate-400 flex-shrink-0" />
                </div>
              </div>
            </div>
          </div>

          {/* Bento 2B (Bottom): Flats Sold Infographic */}
          <div
            onClick={() => setInventoryModalOpen(true)}
            className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-xs flex-1 flex flex-col justify-between cursor-pointer hover:border-slate-300 transition-colors group overflow-hidden"
          >
            <div className="flex items-center justify-between pb-1.5 border-b border-[#F1F5F9] flex-shrink-0">
              <div className="flex items-center gap-2">
                <DollarSign size={15} className="text-[#315EFB]" />
                <span className="text-sm font-black text-[#0F172A] tracking-tight">
                  Flats Sold & Commercial Velocity
                </span>
              </div>
              <span className="text-xs font-bold text-[#315EFB] group-hover:underline flex items-center gap-0.5">
                All Projects <ArrowUpRight size={12} />
              </span>
            </div>

            {/* Bold Numbers Banner */}
            <div className="grid grid-cols-3 gap-2 my-1 text-center bg-[#F8FAFC] p-2 rounded-xl border border-[#E2E8F0] flex-shrink-0">
              <div>
                <div className="text-xl font-black font-mono text-[#16805D]">
                  {commercialData.soldUnits}
                </div>
                <div className="text-[10px] text-[#64748B] font-mono font-bold">
                  Sold ({commercialData.soldPercent}%)
                </div>
              </div>
              <div>
                <div className="text-xl font-black font-mono text-[#0F172A]">
                  {commercialData.leftUnits}
                </div>
                <div className="text-[10px] text-[#64748B] font-mono font-bold">
                  Flats Left ({commercialData.leftPercent}%)
                </div>
              </div>
              <div>
                <div className="text-xl font-black font-mono text-[#315EFB]">
                  ₹{commercialData.bookedValueCr}Cr
                </div>
                <div className="text-[10px] text-[#64748B] font-mono font-bold">
                  Booked Revenue
                </div>
              </div>
            </div>

            {/* Apple-style Multi-Bar Flats Sold Graph */}
            <div className="space-y-1.5 flex-1 min-h-0 overflow-y-auto pr-1">
              {commercialData.projectBreakdown.slice(0, 4).map(p => (
                <div key={p.projectId} className="space-y-0.5">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="font-bold text-[#0F172A] truncate max-w-[150px]">
                      {p.projectName}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[#16805D] font-bold">
                        {p.soldUnits} sold ({p.soldPercent}%)
                      </span>
                      <span className="text-[#94A3B8]">
                        {p.leftUnits} left
                      </span>
                    </div>
                  </div>
                  {/* Sleek Progress Bar */}
                  <div className="h-2 w-full bg-[#E2E8F0] rounded-full overflow-hidden flex">
                    <div
                      className={clsx(
                        'h-full rounded-full transition-all duration-300',
                        p.soldPercent < 60 ? 'bg-[#F59E0B]' : 'bg-[#16805D]'
                      )}
                      style={{ width: `${p.soldPercent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Callout */}
            <div className="pt-1.5 border-t border-[#F1F5F9] flex items-center justify-between text-[10px] font-mono text-[#64748B] flex-shrink-0">
              <span className="text-[#F59E0B] font-bold">
                ⚠️ Riverstone lagging at 58% sold due to structural hold
              </span>
              <span className="font-bold text-[#16805D]">
                Harbour Point leading at 90%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================
          INTERACTIVE MODALS (Opened only on click)
          ============================================================ */}

      {/* 1. Commercial Flats Sold Modal */}
      {inventoryModalOpen && (
        <InventoryModal
          data={commercialData}
          onClose={() => setInventoryModalOpen(false)}
        />
      )}

      {/* 2. Slabs Construction Modal */}
      {slabModalOpen && (
        <SlabModal
          data={slabData}
          onClose={() => setSlabModalOpen(false)}
          onOpenWIP={(projId) => {
            setSlabModalOpen(false);
            setTab('wip');
            if (projId) setFilter('project', projId);
          }}
        />
      )}

      {/* 3. Project Detail Drawer */}
      {state.selectedProjectId && (
        <ProjectDetailDrawer
          projectId={state.selectedProjectId}
          onClose={() => selectProject(null)}
        />
      )}
    </div>
  );
}

// ── 1. CXO Commercial Inventory Modal ─────────────────────────
function InventoryModal({
  data,
  onClose,
}: {
  data: ReturnType<typeof getCXOCommercialInventory>;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-2xl max-w-4xl w-full p-6 animate-in fade-in zoom-in-95 duration-150 max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
          <div>
            <h2 className="text-base font-bold text-[#0F172A]">
              Commercial Real Estate Inventory & Sales Breakdown
            </h2>
            <p className="text-xs text-[#64748B] mt-0.5">
              Portfolio-wide units built, sold, under construction, and unsold valuation.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100"
          >
            <X size={16} />
          </button>
        </div>

        {/* Global Summary KPI Grid */}
        <div className="grid grid-cols-4 gap-3 my-4">
          <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-center">
            <div className="text-2xl font-black font-mono text-[#0F172A]">{data.totalUnits}</div>
            <div className="text-xs text-[#64748B]">Total Portfolio Flats</div>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
            <div className="text-2xl font-black font-mono text-[#16805D]">
              {data.soldUnits} ({data.soldPercent}%)
            </div>
            <div className="text-xs text-emerald-800">Flats Sold</div>
          </div>
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-center">
            <div className="text-2xl font-black font-mono text-[#C63F43]">
              {data.leftUnits} ({data.leftPercent}%)
            </div>
            <div className="text-xs text-rose-800">Flats Left / Available</div>
          </div>
          <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-center">
            <div className="text-2xl font-black font-mono text-[#315EFB]">
              ₹{data.bookedValueCr} Cr
            </div>
            <div className="text-xs text-blue-800">Booked of ₹{data.totalInventoryCr} Cr</div>
          </div>
        </div>

        {/* Project Breakdown Table */}
        <div className="flex-1 overflow-y-auto border border-[#E2E8F0] rounded-xl">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] font-semibold sticky top-0">
              <tr>
                <th className="px-3 py-2.5">Project</th>
                <th className="px-3 py-2.5">City</th>
                <th className="px-3 py-2.5 text-right">Total Flats</th>
                <th className="px-3 py-2.5 text-right">Sold Flats</th>
                <th className="px-3 py-2.5 text-right">Sold %</th>
                <th className="px-3 py-2.5 text-right">Flats Left</th>
                <th className="px-3 py-2.5 text-right">Booked ₹</th>
                <th className="px-3 py-2.5 text-right">Total Inventory ₹</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {data.projectBreakdown.map(p => (
                <tr key={p.projectId} className="hover:bg-slate-50">
                  <td className="px-3 py-2.5 font-bold text-[#0F172A]">{p.projectName}</td>
                  <td className="px-3 py-2.5 text-[#64748B]">{p.city}</td>
                  <td className="px-3 py-2.5 text-right font-mono">{p.totalUnits}</td>
                  <td className="px-3 py-2.5 text-right font-mono font-bold text-[#16805D]">{p.soldUnits}</td>
                  <td className="px-3 py-2.5 text-right">
                    <span className="font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-[#16805D]">
                      {p.soldPercent}%
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono text-[#C63F43]">{p.leftUnits}</td>
                  <td className="px-3 py-2.5 text-right font-mono text-[#0F172A]">₹{p.bookedValueCr} Cr</td>
                  <td className="px-3 py-2.5 text-right font-mono text-[#64748B]">₹{p.inventoryValueCr} Cr</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── 2. Slab-Wise Construction Breakdown Modal ───────────────────
function SlabModal({
  data,
  onClose,
  onOpenWIP,
}: {
  data: ReturnType<typeof getPortfolioSlabMetrics>;
  onClose: () => void;
  onOpenWIP: (projId?: string) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-2xl max-w-4xl w-full p-6 animate-in fade-in zoom-in-95 duration-150 max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
          <div>
            <h2 className="text-base font-bold text-[#0F172A]">
              Slab-Wise & Floor-Cycle Construction Matrix
            </h2>
            <p className="text-xs text-[#64748B] mt-0.5">
              Tower-by-tower structural casting progress and delay tracking across all projects.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100"
          >
            <X size={16} />
          </button>
        </div>

        {/* Global Summary */}
        <div className="grid grid-cols-4 gap-3 my-4">
          <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-center">
            <div className="text-2xl font-black font-mono text-[#0F172A]">{data.totalSlabs}</div>
            <div className="text-xs text-[#64748B]">Total Slabs Planned</div>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
            <div className="text-2xl font-black font-mono text-[#16805D]">
              {data.castSlabs} ({data.castPercent}%)
            </div>
            <div className="text-xs text-emerald-800">Slabs Cast & Cured</div>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-center">
            <div className="text-2xl font-black font-mono text-[#B7791F]">
              {data.activeSlabs} Slabs
            </div>
            <div className="text-xs text-amber-800">In Pour & Rebar</div>
          </div>
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-center">
            <div className="text-2xl font-black font-mono text-[#C63F43]">
              {data.delayedSlabs} Slabs
            </div>
            <div className="text-xs text-rose-800">Delayed Behind Schedule</div>
          </div>
        </div>

        {/* Towers Breakdown Table */}
        <div className="flex-1 overflow-y-auto border border-[#E2E8F0] rounded-xl">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] font-semibold sticky top-0">
              <tr>
                <th className="px-3 py-2.5">Tower Name</th>
                <th className="px-3 py-2.5">Project</th>
                <th className="px-3 py-2.5">City</th>
                <th className="px-3 py-2.5">Current Stage</th>
                <th className="px-3 py-2.5 text-right">Completed Slabs</th>
                <th className="px-3 py-2.5 text-right">Total Slabs</th>
                <th className="px-3 py-2.5 text-right">Progress</th>
                <th className="px-3 py-2.5 text-right">Status</th>
                <th className="px-3 py-2.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {data.towers.map(t => {
                const pct = Math.round((t.completedFloors / t.totalFloors) * 100);
                return (
                  <tr key={t.towerId} className="hover:bg-slate-50">
                    <td className="px-3 py-2.5 font-bold text-[#0F172A]">{t.towerName}</td>
                    <td className="px-3 py-2.5 text-[#0F172A]">{t.projectName}</td>
                    <td className="px-3 py-2.5 text-[#64748B]">{t.city}</td>
                    <td className="px-3 py-2.5 text-[#64748B]">{t.currentStage}</td>
                    <td className="px-3 py-2.5 text-right font-mono font-bold text-[#16805D]">{t.completedFloors}</td>
                    <td className="px-3 py-2.5 text-right font-mono">{t.totalFloors}</td>
                    <td className="px-3 py-2.5 text-right font-mono font-bold">{pct}%</td>
                    <td className="px-3 py-2.5 text-right">
                      <span
                        className={clsx(
                          'text-[10px] font-bold px-1.5 py-0.5 rounded border',
                          t.status === 'Delayed'
                            ? 'bg-rose-50 text-[#C63F43] border-rose-200'
                            : t.status === 'At Risk'
                            ? 'bg-amber-50 text-[#B7791F] border-amber-200'
                            : 'bg-emerald-50 text-[#16805D] border-emerald-200'
                        )}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <button
                        onClick={() => onOpenWIP(t.projectId)}
                        className="text-[#315EFB] hover:underline font-semibold"
                      >
                        View in WIP →
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
