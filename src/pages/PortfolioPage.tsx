// ============================================================
// PAGE 1 — OVERVIEW (Executive Command Cockpit)
// Master Principle: Understand the whole business in 30 seconds.
// Centrepiece: Project Status Table near the top, NOT below charts.
// ============================================================

import React, { useState, useMemo } from 'react';
import {
  ArrowRight, AlertTriangle, AlertCircle, TrendingDown, TrendingUp,
  Building2, Search, SlidersHorizontal, Download, ChevronRight,
  MapPin, CheckCircle2, Clock, ShieldAlert, Award, Calendar,
  Activity, ExternalLink, Filter, Sparkles
} from 'lucide-react';
import clsx from 'clsx';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { useApp } from '../store/appStore';
import {
  getAllProjectMetrics, getOverviewPortfolioKPIs, getNeedsAttentionAlerts,
  getHistoricalScoresForProjects, type ProjectMetrics,
} from '../data/calculations';
import { PROJECTS, CONTRACTORS } from '../data/seedData';
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

const STAGES = ['All Stages', 'Foundation', 'Structure', 'Masonry', 'Finishing', 'Handover'];
const HEALTH_FILTERS = ['All Health', 'Critical', 'At Risk', 'On Track'];

const CHART_COLORS: Record<string, string> = {
  'Meridian Heights': '#315EFB',
  'Northgate Residences': '#16805D',
  'Cedar Park': '#B7791F',
  'Riverstone Towers': '#C63F43',
  'Harbour Point': '#7C3AED',
  'Summit Greens': '#0891B2',
  'Vivanta Sereno': '#D97706',
};

export function PortfolioPage() {
  const {
    state,
    setFilter,
    selectProject,
    setTab,
    selectNC,
    selectContractor,
  } = useApp();

  // Local table filtering & sorting states
  const [selectedStage, setSelectedStage] = useState('All Stages');
  const [selectedHealth, setSelectedHealth] = useState('All Health');
  const [tableSearch, setTableSearch] = useState('');
  const [sortKey, setSortKey] = useState<string>('health');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc'); // Default: worst projects first
  const [trendProjects, setTrendProjects] = useState(['P004', 'P001', 'P002', 'P005', 'P007']);

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

  // Filtered & Sorted Table Rows
  const filteredProjects = useMemo(() => {
    return scopedMetrics.filter(m => {
      // Stage filter
      if (selectedStage !== 'All Stages' && m.project.stage !== selectedStage) return false;
      // Health filter
      if (selectedHealth !== 'All Health' && m.healthCategory !== selectedHealth) return false;
      // Search
      if (tableSearch.trim()) {
        const q = tableSearch.toLowerCase();
        const matchesName = m.project.name.toLowerCase().includes(q);
        const matchesCity = m.project.city.toLowerCase().includes(q);
        const matchesPM = m.project.projectManager.toLowerCase().includes(q);
        if (!matchesName && !matchesCity && !matchesPM) return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortKey === 'health') {
        const rank = { Critical: 0, 'At Risk': 1, 'On Track': 2 };
        if (rank[a.healthCategory] !== rank[b.healthCategory]) {
          return sortDir === 'asc' ? rank[a.healthCategory] - rank[b.healthCategory] : rank[b.healthCategory] - rank[a.healthCategory];
        }
        return sortDir === 'asc' ? a.qualityScore - b.qualityScore : b.qualityScore - a.qualityScore;
      }
      if (sortKey === 'qualityScore') {
        return sortDir === 'asc' ? a.qualityScore - b.qualityScore : b.qualityScore - a.qualityScore;
      }
      if (sortKey === 'progress') {
        return sortDir === 'asc' ? a.project.progressPercentage - b.project.progressPercentage : b.project.progressPercentage - a.project.progressPercentage;
      }
      if (sortKey === 'wir') {
        return sortDir === 'asc' ? b.overdueWIRs - a.overdueWIRs : a.overdueWIRs - b.overdueWIRs;
      }
      if (sortKey === 'nc') {
        return sortDir === 'asc' ? b.openNCs - a.openNCs : a.openNCs - b.openNCs;
      }
      if (sortKey === 'name') {
        return sortDir === 'asc' ? a.project.name.localeCompare(b.project.name) : b.project.name.localeCompare(a.project.name);
      }
      return 0;
    });
  }, [scopedMetrics, selectedStage, selectedHealth, tableSearch, sortKey, sortDir]);

  // Needs Attention alerts scoped to city
  const alerts = useMemo(
    () => getNeedsAttentionAlerts(activeCity, state.wirs, state.ncs, state.weights),
    [activeCity, state.wirs, state.ncs, state.weights]
  );

  // Historical trend data
  const trendData = useMemo(() => getHistoricalScoresForProjects(trendProjects), [trendProjects]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  return (
    <div className="space-y-6">
      {/* ============================================================
          SECTION A: PAGE HEADER
          Minimal executive cockpit header. One line supporting text.
          ============================================================ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#E5E7EB]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#20252D]">
            Overview
          </h1>
          <p className="text-xs text-[#697586] mt-0.5">
            Construction progress and quality across your portfolio.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-[#697586]">Active Scope:</span>
          <span className="font-bold text-[#20252D] bg-white border border-[#E5E7EB] px-2.5 py-1 rounded-lg shadow-2xs">
            {activeCity}
          </span>
          <span className="text-[#697586] ml-2">Period:</span>
          <span className="font-semibold text-[#20252D] bg-white border border-[#E5E7EB] px-2.5 py-1 rounded-lg shadow-2xs">
            {state.filters.reportingPeriod || 'Q3 FY25'}
          </span>
        </div>
      </div>

      {/* ============================================================
          SECTION B: GEOGRAPHIC OVERVIEW PILLS
          Quick one-click city scoping without changing pages
          ============================================================ */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#697586] mr-1 hidden sm:inline">
          City:
        </span>
        {CITIES.map(city => {
          const active = activeCity.toLowerCase() === city.toLowerCase() ||
            (city === 'All locations' && (activeCity === 'All locations' || activeCity === 'All Locations' || !activeCity));
          return (
            <button
              key={city}
              onClick={() => setFilter('city', city)}
              className={clsx(
                'px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border',
                active
                  ? 'bg-[#20252D] text-white border-[#20252D] shadow-xs'
                  : 'bg-white text-[#697586] border-[#E5E7EB] hover:text-[#20252D] hover:bg-slate-50'
              )}
            >
              {city}
            </button>
          );
        })}
      </div>

      {/* ============================================================
          SECTION C: FOUR COMPACT OVERVIEW METRICS (Single Row)
          1. Overall Construction Progress (% vs plan)
          2. Projects at Risk
          3. Overdue WIRs
          4. Open NCs (Critical highlighted)
          ============================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Overall Construction Progress */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#697586]">
              Overall Construction Progress
            </span>
            <span className={clsx(
              'text-[11px] font-bold px-2 py-0.5 rounded-full',
              kpis.progressVariance >= 0
                ? 'bg-emerald-50 text-[#16805D] border border-emerald-200'
                : 'bg-rose-50 text-[#C63F43] border border-rose-200'
            )}>
              {kpis.progressVariance >= 0 ? `+${kpis.progressVariance}% vs plan` : `${kpis.progressVariance}% vs plan`}
            </span>
          </div>

          <div className="my-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-[#20252D]">
                {kpis.overallProgress}%
              </span>
              <span className="text-xs text-[#697586]">
                Target: {kpis.overallTargetProgress}%
              </span>
            </div>
            {/* Compact Progress Bar */}
            <div className="w-full h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
              <div
                className={clsx(
                  'h-full rounded-full transition-all duration-300',
                  kpis.progressVariance >= 0 ? 'bg-[#16805D]' : 'bg-[#C63F43]'
                )}
                style={{ width: `${Math.min(kpis.overallProgress, 100)}%` }}
              />
            </div>
          </div>

          <p className="text-[11px] text-[#697586]">
            Weighted physical milestone completion across {kpis.projectsTotal} project{kpis.projectsTotal > 1 ? 's' : ''}
          </p>
        </div>

        {/* Metric 2: Projects at Risk */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#697586]">
              Projects Health Status
            </span>
            <span className={clsx(
              'text-[11px] font-bold px-2 py-0.5 rounded-full',
              kpis.projectsCritical > 0
                ? 'bg-rose-50 text-[#C63F43] border border-rose-200'
                : 'bg-emerald-50 text-[#16805D] border border-emerald-200'
            )}>
              {kpis.projectsCritical > 0 ? `${kpis.projectsCritical} Critical` : '0 Critical'}
            </span>
          </div>

          <div className="my-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-[#20252D]">
              {kpis.projectsCritical + kpis.projectsAtRisk}
            </span>
            <span className="text-xs text-[#697586]">
              of {kpis.projectsTotal} projects at risk
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] font-semibold">
            <span className="flex items-center gap-1 text-[#C63F43]">
              <span className="w-2 h-2 rounded-full bg-[#C63F43]" />
              {kpis.projectsCritical} Critical
            </span>
            <span className="flex items-center gap-1 text-[#B7791F]">
              <span className="w-2 h-2 rounded-full bg-[#B7791F]" />
              {kpis.projectsAtRisk} At Risk
            </span>
            <span className="flex items-center gap-1 text-[#16805D]">
              <span className="w-2 h-2 rounded-full bg-[#16805D]" />
              {kpis.projectsOnTrack} On Track
            </span>
          </div>
        </div>

        {/* Metric 3: Overdue WIRs */}
        <div
          onClick={() => setTab('wir')}
          className="bg-white border border-[#E5E7EB] rounded-xl p-4 shadow-2xs flex flex-col justify-between cursor-pointer hover:border-slate-300 transition-colors group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#697586] group-hover:text-[#20252D]">
              Overdue WIRs (&gt;7d SLA)
            </span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-[#B7791F] border border-amber-200">
              SLA Breach
            </span>
          </div>

          <div className="my-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-[#B7791F]">
              {kpis.overdueWIRs}
            </span>
            <span className="text-xs text-[#697586]">
              inspections pending review
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#697586]">
            <span>Holding up concrete pour sign-offs</span>
            <ChevronRight size={13} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Metric 4: Open NCs */}
        <div
          onClick={() => setTab('nc')}
          className="bg-white border border-[#E5E7EB] rounded-xl p-4 shadow-2xs flex flex-col justify-between cursor-pointer hover:border-slate-300 transition-colors group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#697586] group-hover:text-[#20252D]">
              Open Non-Compliances
            </span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-[#C63F43] border border-rose-200">
              {kpis.criticalNCs} Critical
            </span>
          </div>

          <div className="my-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-[#20252D]">
              {kpis.openNCs}
            </span>
            <span className="text-xs text-[#C63F43] font-semibold">
              ({kpis.criticalNCs} critical severity)
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#697586]">
            <span>Average portfolio closure: 28 days</span>
            <ChevronRight size={13} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>

      {/* ============================================================
          SECTION D: PROJECT STATUS TABLE (Centrepiece of Overview)
          Visible near top. Sorted weakest/critical projects first.
          ============================================================ */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-2xs overflow-hidden">
        {/* Table Controls Bar */}
        <div className="px-5 py-3.5 border-b border-[#E5E7EB] bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-[#20252D]">
              Project Status Register
            </h3>
            <span className="text-xs font-semibold text-[#697586] bg-white border border-[#E5E7EB] px-2 py-0.5 rounded-md shadow-2xs">
              {filteredProjects.length} of {scopedMetrics.length} Projects
            </span>
          </div>

          {/* Quick Filters inside Table */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                value={tableSearch}
                onChange={e => setTableSearch(e.target.value)}
                placeholder="Filter projects…"
                className="h-8 pl-7 pr-3 text-xs bg-white border border-[#E5E7EB] rounded-lg outline-none text-[#20252D] placeholder:text-slate-400 focus:border-slate-400 transition-colors w-36 sm:w-44"
              />
              {tableSearch && (
                <button
                  onClick={() => setTableSearch('')}
                  className="absolute right-2 top-2 text-slate-400 hover:text-slate-700"
                >
                  <span className="text-xs">×</span>
                </button>
              )}
            </div>

            {/* Stage Selector */}
            <select
              value={selectedStage}
              onChange={e => setSelectedStage(e.target.value)}
              className="h-8 px-2.5 bg-white border border-[#E5E7EB] rounded-lg text-xs font-medium text-[#20252D] outline-none"
            >
              {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            {/* Health Selector */}
            <select
              value={selectedHealth}
              onChange={e => setSelectedHealth(e.target.value)}
              className="h-8 px-2.5 bg-white border border-[#E5E7EB] rounded-lg text-xs font-medium text-[#20252D] outline-none"
            >
              {HEALTH_FILTERS.map(h => <option key={h} value={h}>{h}</option>)}
            </select>
          </div>
        </div>

        {/* The Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-slate-50/70 text-[#697586] font-semibold select-none">
                <th
                  onClick={() => handleSort('name')}
                  className="py-3 px-4 cursor-pointer hover:text-[#20252D] transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Project & City</span>
                    {sortKey === 'name' && <span>{sortDir === 'asc' ? '↑' : '↓'}</span>}
                  </div>
                </th>
                <th className="py-3 px-3">Stage</th>
                <th
                  onClick={() => handleSort('health')}
                  className="py-3 px-3 cursor-pointer hover:text-[#20252D] transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Health Status</span>
                    {sortKey === 'health' && <span>{sortDir === 'asc' ? '↑' : '↓'}</span>}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('progress')}
                  className="py-3 px-3 cursor-pointer hover:text-[#20252D] transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Construction Progress</span>
                    {sortKey === 'progress' && <span>{sortDir === 'asc' ? '↑' : '↓'}</span>}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('qualityScore')}
                  className="py-3 px-3 cursor-pointer hover:text-[#20252D] transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Quality Score</span>
                    {sortKey === 'qualityScore' && <span>{sortDir === 'asc' ? '↑' : '↓'}</span>}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('wir')}
                  className="py-3 px-3 cursor-pointer hover:text-[#20252D] transition-colors text-center"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Overdue WIRs</span>
                    {sortKey === 'wir' && <span>{sortDir === 'asc' ? '↑' : '↓'}</span>}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('nc')}
                  className="py-3 px-3 cursor-pointer hover:text-[#20252D] transition-colors text-center"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Open NCs</span>
                    {sortKey === 'nc' && <span>{sortDir === 'asc' ? '↑' : '↓'}</span>}
                  </div>
                </th>
                <th className="py-3 px-4">Project Manager</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {filteredProjects.map(m => {
                const isCritical = m.healthCategory === 'Critical';
                const isAtRisk = m.healthCategory === 'At Risk';

                return (
                  <tr
                    key={m.project.id}
                    onClick={() => selectProject(m.project.id)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                  >
                    {/* Project & City */}
                    <td className="py-3.5 px-4">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-[#20252D] group-hover:text-blue-600 transition-colors">
                            {m.project.name}
                          </span>
                          <span className="text-[10px] font-mono font-medium text-slate-400">
                            ({m.project.id})
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-[#697586] mt-0.5">
                          <MapPin size={11} className="text-slate-400" />
                          <span>{m.project.city}</span>
                          <span>·</span>
                          <span>{m.project.towers.length} Towers / Buildings</span>
                        </div>
                      </div>
                    </td>

                    {/* Stage */}
                    <td className="py-3.5 px-3">
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-[#20252D] border border-slate-200">
                        {m.project.stage}
                      </span>
                    </td>

                    {/* Health Status */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-1.5">
                        <span className={clsx(
                          'w-2 h-2 rounded-full',
                          isCritical ? 'bg-[#C63F43]' : isAtRisk ? 'bg-[#B7791F]' : 'bg-[#16805D]'
                        )} />
                        <span className={clsx(
                          'font-bold text-xs',
                          isCritical ? 'text-[#C63F43]' : isAtRisk ? 'text-[#B7791F]' : 'text-[#16805D]'
                        )}>
                          {m.healthCategory}
                        </span>
                      </div>
                    </td>

                    {/* Construction Progress (Actual vs Target) */}
                    <td className="py-3.5 px-3">
                      <div className="w-36">
                        <div className="flex justify-between items-baseline mb-1 text-[11px]">
                          <span className="font-bold text-[#20252D]">
                            {m.project.progressPercentage}%
                          </span>
                          <span className="text-[#697586]">
                            Target: {m.project.targetProgressPercentage}%
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={clsx(
                              'h-full rounded-full',
                              m.progressVariance >= 0 ? 'bg-[#16805D]' : 'bg-[#C63F43]'
                            )}
                            style={{ width: `${m.project.progressPercentage}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Quality Score */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2">
                        <span className={clsx(
                          'font-black text-xs px-2 py-0.5 rounded-md border leading-none',
                          m.ragStatus === 'green' ? 'bg-emerald-50 text-[#16805D] border-emerald-200' :
                          m.ragStatus === 'amber' ? 'bg-amber-50 text-[#B7791F] border-amber-200' :
                          'bg-rose-50 text-[#C63F43] border-rose-200'
                        )}>
                          {m.qualityScore}/100
                        </span>
                        {m.scoreDelta !== null && m.scoreDelta !== 0 && (
                          <span className={clsx(
                            'text-[10px] font-bold',
                            m.scoreDelta > 0 ? 'text-[#16805D]' : 'text-[#C63F43]'
                          )}>
                            {m.scoreDelta > 0 ? `+${m.scoreDelta}` : `${m.scoreDelta}`}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Overdue WIRs (Clickable) */}
                    <td className="py-3.5 px-3 text-center">
                      {m.overdueWIRs > 0 ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setTab('wir');
                            setFilter('project', m.project.id);
                          }}
                          className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-[#B7791F] hover:bg-amber-200 transition-colors"
                          title="View overdue WIRs"
                        >
                          {m.overdueWIRs} overdue
                        </button>
                      ) : (
                        <span className="text-slate-400 font-mono">0</span>
                      )}
                    </td>

                    {/* Open NCs (Clickable) */}
                    <td className="py-3.5 px-3 text-center">
                      {m.openNCs > 0 ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setTab('nc');
                            setFilter('project', m.project.id);
                          }}
                          className={clsx(
                            'px-2 py-0.5 rounded-full text-xs font-bold transition-colors',
                            m.criticalOpenNCs > 0
                              ? 'bg-rose-100 text-[#C63F43] hover:bg-rose-200'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          )}
                          title="View open NCs"
                        >
                          {m.openNCs} open {m.criticalOpenNCs > 0 ? `(${m.criticalOpenNCs} crit)` : ''}
                        </button>
                      ) : (
                        <span className="text-slate-400 font-mono">0</span>
                      )}
                    </td>

                    {/* Project Manager */}
                    <td className="py-3.5 px-4 text-slate-700">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{m.project.projectManager}</span>
                        <ChevronRight size={13} className="text-slate-300 group-hover:text-slate-600 transition-colors" />
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredProjects.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No projects found matching the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============================================================
          SECTION E: NEEDS ATTENTION (Below the Project Table)
          Max 5 urgent items derived from live records
          ============================================================ */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-[#E5E7EB]">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-[#20252D]">
              Needs Immediate Attention
            </h3>
            <span className="text-[11px] font-bold bg-rose-50 text-[#C63F43] px-2 py-0.5 rounded-full border border-rose-200">
              {alerts.length} Action Items
            </span>
          </div>
          <span className="text-xs text-[#697586]">
            Sorted by business urgency & schedule criticality
          </span>
        </div>

        <div className="space-y-2.5">
          {alerts.map(a => (
            <div
              key={a.id}
              className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/40 hover:bg-white hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-start gap-3">
                <span className={clsx(
                  'w-2 h-2 rounded-full mt-1.5 flex-shrink-0',
                  a.severity === 'critical' ? 'bg-[#C63F43]' : 'bg-[#B7791F]'
                )} />
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-[#20252D]">
                      {a.title}
                    </span>
                    <span className="text-[11px] font-semibold text-[#697586]">
                      · {a.projectName}
                    </span>
                  </div>
                  <p className="text-xs text-[#697586] mt-0.5 leading-relaxed">
                    {a.detail}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Responsible Owner: <strong className="text-slate-600">{a.owner}</strong>
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  if (a.linkType === 'nc' && a.ncId) {
                    setTab('nc');
                    selectNC(a.ncId);
                  } else if (a.linkType === 'contractor' && a.contractorId) {
                    setTab('contractors');
                    selectContractor(a.contractorId);
                  } else if (a.linkType === 'wip') {
                    setTab('wip');
                    setFilter('project', a.projectId);
                  } else {
                    selectProject(a.projectId);
                  }
                }}
                className="px-3 py-1.5 bg-white border border-[#E5E7EB] hover:bg-slate-100 text-xs font-bold text-[#20252D] rounded-lg shadow-2xs flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap self-start sm:self-center"
              >
                <span>{a.actionText}</span>
                <ArrowRight size={12} className="text-slate-500" />
              </button>
            </div>
          ))}

          {alerts.length === 0 && (
            <div className="py-6 text-center text-xs text-slate-400">
              Zero critical alerts active for the selected location scope.
            </div>
          )}
        </div>
      </div>

      {/* ============================================================
          SECTION F: SECONDARY TREND (Quality Score Progression)
          Compact & readable below the main sections
          ============================================================ */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-[#20252D]">
              Quality Score 6-Month Progression
            </h3>
            <p className="text-xs text-[#697586]">
              Historical trend comparison across key portfolio projects
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {PROJECTS.map(p => {
              const active = trendProjects.includes(p.id);
              const color = CHART_COLORS[p.name] ?? '#315EFB';
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    if (active) {
                      if (trendProjects.length > 1) {
                        setTrendProjects(trendProjects.filter(id => id !== p.id));
                      }
                    } else {
                      setTrendProjects([...trendProjects, p.id]);
                    }
                  }}
                  className={clsx(
                    'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-all',
                    active
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  )}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                  <span>{p.name.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Chart */}
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} />
              <YAxis domain={[30, 100]} tick={{ fontSize: 11, fill: '#64748B' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E2E8F0',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                  fontSize: '12px',
                }}
              />
              {trendProjects.map(pid => {
                const proj = PROJECTS.find(p => p.id === pid);
                if (!proj) return null;
                const color = CHART_COLORS[proj.name] ?? '#315EFB';
                return (
                  <Line
                    key={pid}
                    type="monotone"
                    dataKey={proj.name}
                    stroke={color}
                    strokeWidth={2}
                    dot={{ r: 3, fill: color }}
                    activeDot={{ r: 5 }}
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
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
