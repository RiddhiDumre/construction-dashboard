// ============================================================
// PAGE 1 — OVERVIEW (Executive Visual Cockpit)
// Zero-scroll single-viewport layout.
// Strictly numbers, visual representations & interactive drill-downs.
// No verbose text paragraphs anywhere.
// ============================================================

import React, { useState, useMemo } from 'react';
import {
  ArrowRight, ArrowUpRight, AlertTriangle, AlertCircle, TrendingDown, TrendingUp,
  Building2, Layers, CheckCircle2, Clock, ShieldAlert, Award, ExternalLink,
  ChevronRight, X, Search, DollarSign, PieChart, BarChart3, Activity
} from 'lucide-react';
import clsx from 'clsx';
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { useApp } from '../store/appStore';
import {
  getAllProjectMetrics, getOverviewPortfolioKPIs, getNeedsAttentionAlerts,
  getProgressCurveData, getHistoricalScoresForProjects,
  getCXOCommercialInventory, getPortfolioSlabMetrics,
} from '../data/calculations';
import { PROJECTS, TOWERS_DATA } from '../data/seedData';
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

export function PortfolioPage() {
  const {
    state,
    setFilter,
    selectProject,
    setTab,
    selectNC,
    selectContractor,
  } = useApp();

  const [inventoryModalOpen, setInventoryModalOpen] = useState(false);
  const [slabModalOpen, setSlabModalOpen] = useState(false);

  const activeCity = state.filters.city || 'All locations';

  // Dynamic Portfolio KPIs scoped to selected geographic scope
  const kpis = useMemo(
    () => getOverviewPortfolioKPIs(activeCity, state.weights, state.wirs, state.ncs),
    [activeCity, state.weights, state.wirs, state.ncs]
  );

  // All project metrics scoped to city
  const allMetrics = useMemo(
    () => getAllProjectMetrics(state.weights, state.wirs, state.ncs),
    [state.weights, state.wirs, state.ncs]
  );

  const scopedMetrics = useMemo(() => {
    if (activeCity === 'All locations' || activeCity === 'All Locations') return allMetrics;
    if (activeCity.toLowerCase() === 'mumbai') {
      return allMetrics.filter(m => m.project.city === 'Mumbai' || m.project.city === 'Navi Mumbai' || m.project.city === 'Thane');
    }
    return allMetrics.filter(m => m.project.city.toLowerCase() === activeCity.toLowerCase());
  }, [allMetrics, activeCity]);

  // CXO Commercial & Unit Inventory Metrics (Built vs Sold vs Left)
  const commercialData = useMemo(
    () => getCXOCommercialInventory(activeCity),
    [activeCity]
  );

  // Slab-Wise / Floor-Wise Construction Metrics
  const slabData = useMemo(
    () => getPortfolioSlabMetrics(activeCity),
    [activeCity]
  );

  // WIP S-Curve Cumulative Progress Graph Data
  const progressCurve = useMemo(
    () => getProgressCurveData(activeCity),
    [activeCity]
  );

  // Quality 6-Month Historical Progression Data
  const trendData = useMemo(
    () => getHistoricalScoresForProjects(['P004', 'P001', 'P002', 'P005', 'P007']),
    []
  );

  // Priority Operational Alerts
  const alerts = useMemo(
    () => getNeedsAttentionAlerts(activeCity, state.wirs, state.ncs, state.weights),
    [activeCity, state.wirs, state.ncs, state.weights]
  );
  const topAlert = alerts[0];

  return (
    <div className="h-full flex flex-col gap-2 overflow-hidden select-none">
      {/* ============================================================
          TOP BAR: GEOGRAPHIC CONTROLS & COMPACT METRIC STRIP (Height ~40px)
          ============================================================ */}
      <div className="flex items-center justify-between gap-3 bg-white border border-[#E2E8F0] px-3 py-1.5 rounded-xl shadow-2xs flex-shrink-0">
        {/* City Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
          {CITIES.map(city => {
            const active =
              activeCity.toLowerCase() === city.toLowerCase() ||
              (city === 'All locations' && (activeCity === 'All locations' || activeCity === 'All Locations' || !activeCity));
            return (
              <button
                key={city}
                onClick={() => setFilter('city', city)}
                className={clsx(
                  'px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all border',
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

        {/* 4 Ultra-Compact Visual Number Badges */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Milestone Variance */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
            <span className="text-[10px] uppercase font-mono text-[#64748B]">Schedule</span>
            <span
              className={clsx(
                'text-xs font-bold font-mono px-1.5 py-0.2 rounded',
                kpis.progressVariance >= 0
                  ? 'bg-emerald-50 text-[#16805D] border border-emerald-200'
                  : 'bg-rose-50 text-[#C63F43] border border-rose-200'
              )}
            >
              {kpis.progressVariance >= 0 ? `+${kpis.progressVariance}%` : `${kpis.progressVariance}%`}
            </span>
          </div>

          {/* Quality Score */}
          <div
            onClick={() => setTab('quality')}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] cursor-pointer hover:border-slate-300 transition-colors"
          >
            <span className="text-[10px] uppercase font-mono text-[#64748B]">Quality</span>
            <span className="text-xs font-bold font-mono text-[#0F172A]">
              {kpis.portfolioQualityScore}<span className="text-[10px] text-[#94A3B8]">/100</span>
            </span>
            <span
              className={clsx(
                'w-2 h-2 rounded-full',
                kpis.portfolioQualityScore >= 80
                  ? 'bg-[#16805D]'
                  : kpis.portfolioQualityScore >= 60
                  ? 'bg-[#B7791F]'
                  : 'bg-[#C63F43]'
              )}
            />
          </div>

          {/* Sold Inventory */}
          <div
            onClick={() => setInventoryModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] cursor-pointer hover:border-slate-300 transition-colors"
          >
            <span className="text-[10px] uppercase font-mono text-[#64748B]">Sold</span>
            <span className="text-xs font-bold font-mono text-[#0F172A]">
              {commercialData.soldPercent}%
            </span>
            <span className="text-[10px] font-mono text-[#64748B]">
              ({commercialData.soldUnits}/{commercialData.totalUnits})
            </span>
          </div>

          {/* Open Critical NCs */}
          <div
            onClick={() => setTab('nc')}
            className={clsx(
              'flex items-center gap-1.5 px-2.5 py-1 rounded-lg border cursor-pointer transition-colors',
              kpis.criticalNCs > 0
                ? 'bg-rose-50 border-rose-200 text-[#C63F43]'
                : 'bg-emerald-50 border-emerald-200 text-[#16805D]'
            )}
          >
            <AlertTriangle size={12} />
            <span className="text-xs font-bold font-mono">{kpis.criticalNCs} Critical NCs</span>
          </div>
        </div>
      </div>

      {/* ============================================================
          MAIN 3-COLUMN ZERO-SCROLL COCKPIT GRID (Height: Remaining)
          ============================================================ */}
      <div className="flex-1 min-h-0 grid grid-cols-12 gap-2.5">
        {/* ==========================================================
            COLUMN 1 (Left 4 cols): CXO COMMERCIAL INVENTORY & SLABS
            ========================================================== */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-2.5 min-h-0">
          {/* Card 1A: CXO Commercial & Unit Inventory */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-3 shadow-2xs flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between pb-1.5 border-b border-[#F1F5F9]">
              <div className="flex items-center gap-1.5">
                <DollarSign size={14} className="text-[#315EFB]" />
                <span className="text-xs font-bold text-[#0F172A] tracking-tight">
                  Inventory & Commercials
                </span>
              </div>
              <button
                onClick={() => setInventoryModalOpen(true)}
                className="text-[11px] font-semibold text-[#315EFB] hover:text-[#2748C0] flex items-center gap-0.5 hover:underline"
              >
                Breakdown <ArrowUpRight size={12} />
              </button>
            </div>

            {/* Big Numbers Strip */}
            <div className="grid grid-cols-3 gap-2 my-1 text-center bg-[#F8FAFC] p-2 rounded-lg border border-[#E2E8F0]">
              <div>
                <div className="text-sm font-bold font-mono text-[#0F172A]">
                  {commercialData.totalUnits}
                </div>
                <div className="text-[10px] text-[#64748B] font-medium">Total Units</div>
              </div>
              <div>
                <div className="text-sm font-bold font-mono text-[#16805D]">
                  ₹{commercialData.bookedValueCr}Cr
                </div>
                <div className="text-[10px] text-[#64748B] font-medium">Booked Revenue</div>
              </div>
              <div>
                <div className="text-sm font-bold font-mono text-[#C63F43]">
                  ₹{commercialData.unrealizedValueCr}Cr
                </div>
                <div className="text-[10px] text-[#64748B] font-medium">Unsold Value</div>
              </div>
            </div>

            {/* Visual Bar 1: Sold vs Left */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] font-medium">
                <span className="text-[#16805D] font-bold">
                  {commercialData.soldUnits} Sold ({commercialData.soldPercent}%)
                </span>
                <span className="text-[#64748B] font-bold">
                  {commercialData.leftUnits} Left ({commercialData.leftPercent}%)
                </span>
              </div>
              <div className="h-2 w-full bg-[#E2E8F0] rounded-full overflow-hidden flex">
                <div
                  className="bg-[#16805D] h-full transition-all duration-300"
                  style={{ width: `${commercialData.soldPercent}%` }}
                />
                <div
                  className="bg-slate-300 h-full transition-all duration-300"
                  style={{ width: `${commercialData.leftPercent}%` }}
                />
              </div>
            </div>

            {/* Visual Bar 2: Building vs Completed vs Upcoming */}
            <div className="space-y-1 pt-1">
              <div className="flex items-center justify-between text-[11px] font-medium text-[#64748B]">
                <span className="text-[#315EFB] font-bold">
                  {commercialData.underConstructionUnits} Building
                </span>
                <span className="text-[#16805D] font-bold">
                  {commercialData.completedUnits} Ready
                </span>
                <span className="text-slate-500 font-bold">
                  {commercialData.upcomingUnits} Upcoming
                </span>
              </div>
              <div className="h-2 w-full bg-[#E2E8F0] rounded-full overflow-hidden flex">
                <div
                  className="bg-[#315EFB] h-full"
                  style={{
                    width: `${Math.round((commercialData.underConstructionUnits / commercialData.totalUnits) * 100)}%`,
                  }}
                />
                <div
                  className="bg-[#16805D] h-full"
                  style={{
                    width: `${Math.round((commercialData.completedUnits / commercialData.totalUnits) * 100)}%`,
                  }}
                />
                <div
                  className="bg-slate-300 h-full"
                  style={{
                    width: `${Math.round((commercialData.upcomingUnits / commercialData.totalUnits) * 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Card 1B: Slab-Wise / Floor-Wise Construction Matrix */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-3 shadow-2xs flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between pb-1.5 border-b border-[#F1F5F9]">
              <div className="flex items-center gap-1.5">
                <Layers size={14} className="text-[#0F172A]" />
                <span className="text-xs font-bold text-[#0F172A] tracking-tight">
                  Slab-Wise Construction
                </span>
              </div>
              <button
                onClick={() => setSlabModalOpen(true)}
                className="text-[11px] font-semibold text-[#315EFB] hover:text-[#2748C0] flex items-center gap-0.5 hover:underline"
              >
                Inspect Towers <ArrowUpRight size={12} />
              </button>
            </div>

            {/* Slabs Big Number Metrics */}
            <div className="flex items-baseline justify-between my-1">
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-bold font-mono text-[#0F172A]">
                  {slabData.castSlabs}
                </span>
                <span className="text-xs font-mono text-[#64748B]">
                  / {slabData.totalSlabs} Slabs Cast
                </span>
              </div>
              <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-blue-50 text-[#315EFB] border border-blue-200">
                {slabData.castPercent}% Cast
              </span>
            </div>

            {/* Segmented Slabs Status Bar */}
            <div className="space-y-1">
              <div className="h-2.5 w-full bg-[#E2E8F0] rounded-full overflow-hidden flex">
                <div
                  className="bg-[#16805D] h-full transition-all"
                  style={{ width: `${slabData.castPercent}%` }}
                  title={`${slabData.castSlabs} Cast`}
                />
                <div
                  className="bg-[#B7791F] h-full transition-all"
                  style={{ width: `${slabData.activePercent}%` }}
                  title={`${slabData.activeSlabs} In Pour/Rebar`}
                />
                <div
                  className="bg-[#C63F43] h-full transition-all"
                  style={{
                    width: `${Math.round((slabData.delayedSlabs / slabData.totalSlabs) * 100)}%`,
                  }}
                  title={`${slabData.delayedSlabs} Delayed`}
                />
                <div
                  className="bg-slate-200 h-full transition-all"
                  style={{
                    width: `${Math.max(0, 100 - slabData.castPercent - slabData.activePercent)}%`,
                  }}
                  title={`${slabData.pendingSlabs} Pending`}
                />
              </div>

              {/* Legend with exact numbers */}
              <div className="flex items-center justify-between text-[10px] font-mono text-[#64748B] pt-0.5">
                <span className="flex items-center gap-1 text-[#16805D] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#16805D]" />
                  {slabData.castSlabs} Cast
                </span>
                <span className="flex items-center gap-1 text-[#B7791F] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B7791F]" />
                  {slabData.activeSlabs} Active
                </span>
                <span className="flex items-center gap-1 text-[#C63F43] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C63F43]" />
                  {slabData.delayedSlabs} Delayed
                </span>
                <span className="flex items-center gap-1 text-slate-400">
                  {slabData.pendingSlabs} Left
                </span>
              </div>
            </div>

            {/* Mini Visual Elevation Bars of 4 Key Towers */}
            <div className="grid grid-cols-4 gap-1.5 pt-1.5 border-t border-[#F1F5F9]">
              {slabData.towers.slice(0, 4).map(t => {
                const pct = Math.round((t.completedFloors / t.totalFloors) * 100);
                return (
                  <div
                    key={t.towerId}
                    onClick={() => {
                      setTab('wip');
                      setFilter('project', t.projectId);
                    }}
                    className="p-1.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] hover:border-blue-300 cursor-pointer transition-colors text-center"
                  >
                    <div className="text-[10px] font-bold text-[#0F172A] truncate">
                      {t.towerName}
                    </div>
                    <div className="text-[9px] font-mono text-[#64748B]">
                      {t.completedFloors}/{t.totalFloors} Fl
                    </div>
                    {/* Visual Vertical Stack */}
                    <div className="w-full h-1.5 bg-slate-200 rounded-full mt-1 overflow-hidden">
                      <div
                        className={clsx(
                          'h-full rounded-full',
                          t.status === 'Delayed'
                            ? 'bg-[#C63F43]'
                            : t.status === 'At Risk'
                            ? 'bg-[#B7791F]'
                            : 'bg-[#16805D]'
                        )}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ==========================================================
            COLUMN 2 (Center 4.5 cols): WIP S-CURVE & AUDIT TREND
            ========================================================== */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-2.5 min-h-0">
          {/* Card 2A: WIP S-Curve Graph Snippet */}
          <div
            onClick={() => setTab('wip')}
            className="bg-white border border-[#E2E8F0] rounded-xl p-3 shadow-2xs flex-1 flex flex-col justify-between cursor-pointer hover:border-[#315EFB] transition-colors group"
          >
            <div className="flex items-center justify-between pb-1 border-b border-[#F1F5F9]">
              <div className="flex items-center gap-1.5">
                <BarChart3 size={14} className="text-[#315EFB]" />
                <span className="text-xs font-bold text-[#0F172A] tracking-tight">
                  WIP Progress S-Curve
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-[#64748B]">
                  Plan vs Actual
                </span>
              </div>
              <span className="text-[11px] font-bold text-[#315EFB] group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                Full WIP <ArrowRight size={12} />
              </span>
            </div>

            {/* Prominent Numbers Bar */}
            <div className="flex items-baseline justify-between my-1">
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold font-mono text-[#0F172A]">
                  {kpis.overallProgress}%
                </span>
                <span className="text-xs font-mono text-[#64748B]">
                  Actual / {kpis.overallTargetProgress}% Plan
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold font-mono">
                <span
                  className={clsx(
                    'px-1.5 py-0.5 rounded border',
                    kpis.progressVariance >= 0
                      ? 'bg-emerald-50 text-[#16805D] border-emerald-200'
                      : 'bg-rose-50 text-[#C63F43] border-rose-200'
                  )}
                >
                  {kpis.progressVariance}% Variance
                </span>
              </div>
            </div>

            {/* Mini S-Curve Area Chart */}
            <div className="w-full flex-1 min-h-[90px] pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={progressCurve}
                  margin={{ top: 5, right: 10, left: -25, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#315EFB" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#315EFB" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 9, fill: '#94A3B8' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 9, fill: '#94A3B8' }}
                    axisLine={false}
                    tickLine={false}
                    ticks={[0, 50, 100]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderColor: '#1E293B',
                      borderRadius: '8px',
                      color: '#FFF',
                      fontSize: '11px',
                      padding: '4px 8px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="planned"
                    stroke="#94A3B8"
                    strokeDasharray="3 3"
                    strokeWidth={1.5}
                    fill="none"
                    name="Planned Target"
                  />
                  <Area
                    type="monotone"
                    dataKey="actual"
                    stroke="#315EFB"
                    strokeWidth={2.5}
                    fill="url(#actualGrad)"
                    name="Actual Physical"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Status pills */}
            <div className="flex items-center justify-between text-[10px] font-mono text-[#64748B] pt-1 border-t border-[#F1F5F9]">
              <span className="text-[#C63F43] font-bold">5 Delayed Packages</span>
              <span className="text-[#B7791F] font-bold">2 Path Blockers</span>
              <span className="text-[#16805D] font-bold">12 Active Towers</span>
            </div>
          </div>

          {/* Card 2B: Audit & Quality 6-Month Trend Snippet */}
          <div
            onClick={() => setTab('quality')}
            className="bg-white border border-[#E2E8F0] rounded-xl p-3 shadow-2xs flex-1 flex flex-col justify-between cursor-pointer hover:border-[#16805D] transition-colors group"
          >
            <div className="flex items-center justify-between pb-1 border-b border-[#F1F5F9]">
              <div className="flex items-center gap-1.5">
                <Award size={14} className="text-[#16805D]" />
                <span className="text-xs font-bold text-[#0F172A] tracking-tight">
                  Audit & Quality Score
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-[#64748B]">
                  6-Mo Trend
                </span>
              </div>
              <span className="text-[11px] font-bold text-[#16805D] group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                Full Audit <ArrowRight size={12} />
              </span>
            </div>

            {/* Prominent Numbers Bar */}
            <div className="flex items-baseline justify-between my-1">
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold font-mono text-[#0F172A]">
                  {kpis.portfolioQualityScore}
                </span>
                <span className="text-xs font-mono text-[#64748B]">/ 100 Index</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-mono">
                <span className="text-[#16805D] font-bold">
                  {kpis.portfolioWIRPassRate}% WIR
                </span>
                <span className="text-[#315EFB] font-bold">
                  85% NC
                </span>
                <span className="text-slate-600 font-bold">
                  72% Audit
                </span>
              </div>
            </div>

            {/* Mini Line Chart */}
            <div className="w-full flex-1 min-h-[90px] pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={trendData}
                  margin={{ top: 5, right: 10, left: -25, bottom: 0 }}
                >
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 9, fill: '#94A3B8' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[30, 100]}
                    tick={{ fontSize: 9, fill: '#94A3B8' }}
                    axisLine={false}
                    tickLine={false}
                    ticks={[40, 70, 100]}
                  />
                  <ReferenceLine y={80} stroke="#16805D" strokeDasharray="2 2" strokeOpacity={0.4} />
                  <ReferenceLine y={60} stroke="#C63F43" strokeDasharray="2 2" strokeOpacity={0.4} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderColor: '#1E293B',
                      borderRadius: '8px',
                      color: '#FFF',
                      fontSize: '11px',
                      padding: '4px 8px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="Riverstone Towers"
                    stroke="#C63F43"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="Meridian Heights"
                    stroke="#315EFB"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="Northgate Residences"
                    stroke="#16805D"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="Harbour Point"
                    stroke="#7C3AED"
                    strokeWidth={1.5}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Status note */}
            <div className="flex items-center justify-between text-[10px] font-mono pt-1 border-t border-[#F1F5F9]">
              <span className="text-[#C63F43] font-bold">Riverstone: 42 (Critical)</span>
              <span className="text-[#16805D] font-bold">Harbour Point: 86 (Leader)</span>
            </div>
          </div>
        </div>

        {/* ==========================================================
            COLUMN 3 (Right 3.5 cols): LIVE FLEET STATUS & DIAGNOSTICS
            ========================================================== */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-2.5 min-h-0">
          {/* Projects Live Status Strip */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-3 shadow-2xs flex-1 flex flex-col justify-between overflow-hidden">
            <div className="flex items-center justify-between pb-1.5 border-b border-[#F1F5F9]">
              <div className="flex items-center gap-1.5">
                <Building2 size={14} className="text-[#0F172A]" />
                <span className="text-xs font-bold text-[#0F172A] tracking-tight">
                  Portfolio Fleet Status
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-[#64748B]">
                  {scopedMetrics.length} Sites
                </span>
              </div>
              <span className="text-[10px] font-mono text-[#94A3B8]">
                Click row to diagnose
              </span>
            </div>

            {/* High-density Project Rows */}
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 divide-y divide-slate-100">
              {scopedMetrics.map(m => {
                const ragColor =
                  m.healthCategory === 'Critical'
                    ? 'text-[#C63F43] bg-rose-50 border-rose-200'
                    : m.healthCategory === 'At Risk'
                    ? 'text-[#B7791F] bg-amber-50 border-amber-200'
                    : 'text-[#16805D] bg-emerald-50 border-emerald-200';

                return (
                  <div
                    key={m.project.id}
                    onClick={() => selectProject(m.project.id)}
                    className="pt-1.5 first:pt-0 hover:bg-[#F8FAFC] p-1.5 rounded-lg cursor-pointer transition-colors group flex items-center justify-between gap-2"
                  >
                    {/* Left: Name & Location */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-[#0F172A] group-hover:text-[#315EFB] truncate">
                          {m.project.name}
                        </span>
                        <span className="text-[9px] font-mono text-[#64748B]">
                          {m.project.city}
                        </span>
                      </div>

                      {/* Dual Progress Bar: Physical Progress vs Target */}
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-24 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={clsx(
                              'h-full rounded-full',
                              m.progressVariance >= 0 ? 'bg-[#16805D]' : 'bg-[#C63F43]'
                            )}
                            style={{ width: `${m.project.progressPercentage}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-mono text-[#64748B]">
                          {m.project.progressPercentage}%
                        </span>
                        <span className="text-[9px] font-mono text-[#94A3B8]">
                          ({m.project.stage})
                        </span>
                      </div>
                    </div>

                    {/* Right: Numbers & Score Badge */}
                    <div className="flex items-center gap-2 flex-shrink-0 text-right">
                      {/* Sold % */}
                      <div className="text-right">
                        <div className="text-[11px] font-bold font-mono text-[#0F172A]">
                          {m.project.soldUnits ? Math.round((m.project.soldUnits / m.project.totalUnits) * 100) : 0}%
                        </div>
                        <div className="text-[8px] font-mono text-[#94A3B8]">Sold</div>
                      </div>

                      {/* Quality Score Pill */}
                      <div
                        className={clsx(
                          'text-xs font-bold font-mono px-2 py-0.5 rounded border',
                          ragColor
                        )}
                      >
                        {m.qualityScore}
                      </div>

                      <ChevronRight size={12} className="text-[#94A3B8] group-hover:text-[#0F172A]" />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Quick Action Pill: Top Urgent Finding */}
            {topAlert && (
              <div
                onClick={() => {
                  if (topAlert.linkType === 'nc') {
                    setTab('nc');
                    if (topAlert.ncId) selectNC(topAlert.ncId);
                  } else if (topAlert.linkType === 'contractor') {
                    setTab('contractors');
                    if (topAlert.contractorId) selectContractor(topAlert.contractorId);
                  } else {
                    selectProject(topAlert.projectId);
                  }
                }}
                className="mt-1 p-2 rounded-lg bg-rose-50 border border-rose-200 cursor-pointer hover:bg-rose-100 transition-colors flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <ShieldAlert size={14} className="text-[#C63F43] flex-shrink-0" />
                  <div className="min-w-0">
                    <span className="font-bold text-[#C63F43] truncate block">
                      {topAlert.title}
                    </span>
                    <span className="text-[10px] text-rose-800 font-mono truncate block">
                      {topAlert.projectName} · {topAlert.detail}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-[#C63F43] underline flex-shrink-0 ml-2">
                  Inspect →
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================
          INTERACTIVE DRILL-DOWN MODALS (Opened only on click)
          ============================================================ */}

      {/* 1. CXO Commercial Inventory Modal */}
      {inventoryModalOpen && (
        <InventoryModal
          data={commercialData}
          onClose={() => setInventoryModalOpen(false)}
        />
      )}

      {/* 2. Slab-Wise Construction Breakdown Modal */}
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
            <div className="text-xl font-bold font-mono text-[#0F172A]">{data.totalUnits}</div>
            <div className="text-xs text-[#64748B]">Total Portfolio Units</div>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
            <div className="text-xl font-bold font-mono text-[#16805D]">
              {data.soldUnits} ({data.soldPercent}%)
            </div>
            <div className="text-xs text-emerald-800">Units Sold</div>
          </div>
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-center">
            <div className="text-xl font-bold font-mono text-[#C63F43]">
              {data.leftUnits} ({data.leftPercent}%)
            </div>
            <div className="text-xs text-rose-800">Units Left / Unsold</div>
          </div>
          <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-center">
            <div className="text-xl font-bold font-mono text-[#315EFB]">
              ₹{data.bookedValueCr} Cr
            </div>
            <div className="text-xs text-blue-800">Booked Revenue of ₹{data.totalInventoryCr} Cr</div>
          </div>
        </div>

        {/* Project Breakdown Table */}
        <div className="flex-1 overflow-y-auto border border-[#E2E8F0] rounded-xl">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] font-semibold sticky top-0">
              <tr>
                <th className="px-3 py-2.5">Project</th>
                <th className="px-3 py-2.5">City</th>
                <th className="px-3 py-2.5 text-right">Total Units</th>
                <th className="px-3 py-2.5 text-right">Sold Units</th>
                <th className="px-3 py-2.5 text-right">Sold %</th>
                <th className="px-3 py-2.5 text-right">Units Left</th>
                <th className="px-3 py-2.5 text-right">Booked ₹</th>
                <th className="px-3 py-2.5 text-right">Inventory ₹</th>
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
            <div className="text-xl font-bold font-mono text-[#0F172A]">{data.totalSlabs}</div>
            <div className="text-xs text-[#64748B]">Total Slabs Planned</div>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
            <div className="text-xl font-bold font-mono text-[#16805D]">
              {data.castSlabs} ({data.castPercent}%)
            </div>
            <div className="text-xs text-emerald-800">Slabs Cast & Cured</div>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-center">
            <div className="text-xl font-bold font-mono text-[#B7791F]">
              {data.activeSlabs} Slabs
            </div>
            <div className="text-xs text-amber-800">Formwork & Rebar In Progress</div>
          </div>
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-center">
            <div className="text-xl font-bold font-mono text-[#C63F43]">
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
