// ============================================================
// CONTRACTORS PAGE — Cross-Project Accountability & Risk Ranking
// Linear-inspired design: restrained palette, clear risk hierarchy,
// 4 top summary metrics, cross-site defect tracking & detail drawer
// ============================================================

import React, { useState, useMemo } from 'react';
import clsx from 'clsx';
import {
  TrendingUp, TrendingDown, Minus, AlertTriangle, ExternalLink,
  Users, AlertOctagon, ArrowDownRight, Award, ShieldAlert,
  Download, FileWarning, CheckCircle2, ChevronRight, Search,
  MapPin, Building2, ChevronDown, RotateCcw
} from 'lucide-react';
import { useApp } from '../store/appStore';
import { getAllContractorMetrics, type ContractorMetrics } from '../data/calculations';
import { PROJECTS, CONTRACTORS, type WIR, type NC } from '../data/seedData';
import {
  SeverityBadge, StatusBadge, SortableTh, FilterSelect, SearchInput,
  EmptyState, Drawer, DrawerSection, FieldRow,
} from '../components/ui';

const REGION_OPTIONS = [...new Set(PROJECTS.map(p => p.region))].map(r => ({ value: r, label: r }));
const CITY_OPTIONS = [
  'Mumbai',
  'Thane',
  'Navi Mumbai',
  'Pune',
  'Bengaluru',
  'Hyderabad',
  'Gurugram',
].map(c => ({ value: c, label: c }));
const PROJECT_OPTIONS = PROJECTS.map(p => ({ value: p.id, label: p.name }));
const TRADE_OPTIONS = [...new Set(CONTRACTORS.map(c => c.type))].map(t => ({ value: t, label: t }));

export function ContractorsPage() {
  const { state, setFilter, resetFilters, selectContractor, setTab, selectWIR, selectNC } = useApp();
  const [sort, setSort] = useState<{ key: string; dir: 'asc' | 'desc' }>({ key: 'risk', dir: 'desc' });
  const [noticeToast, setNoticeToast] = useState<string | null>(null);

  const allMetrics = useMemo(() => getAllContractorMetrics(state.wirs, state.ncs), [state.wirs, state.ncs]);

  // Compute 4 Top Summary Metrics
  const summary = useMemo(() => {
    const totalActive = allMetrics.length;
    const withCritNCs = allMetrics.filter(m => m.criticalOpenNCs > 0).length;
    const declining = allMetrics.filter(m => m.trend === 'declining').length;
    
    // Lowest pass rate
    const sortedByPass = [...allMetrics].sort((a, b) => a.firstTimePassRate - b.firstTimePassRate);
    const lowest = sortedByPass[0];

    return {
      totalActive,
      withCritNCs,
      declining,
      lowestPassRate: lowest ? { name: lowest.contractor.name, rate: lowest.firstTimePassRate } : null,
    };
  }, [allMetrics]);

  // Filter
  const filtered = useMemo(() => {
    let rows = allMetrics;
    if (state.filters.project) {
      rows = rows.filter(m => m.projects.includes(state.filters.project));
    }
    if (state.filters.region) {
      const projectsInRegion = PROJECTS.filter(p => p.region === state.filters.region).map(p => p.id);
      rows = rows.filter(m => m.projects.some(pid => projectsInRegion.includes(pid)));
    }
    if (state.filters.city) {
      const projectsInCity = PROJECTS.filter(p => p.city === state.filters.city).map(p => p.id);
      rows = rows.filter(m => m.projects.some(pid => projectsInCity.includes(pid)));
    }
    if (state.filters.category) {
      rows = rows.filter(m => m.contractor.type === state.filters.category);
    }
    if (state.filters.search) {
      const q = state.filters.search.toLowerCase();
      rows = rows.filter(m =>
        m.contractor.name.toLowerCase().includes(q) ||
        m.contractor.type.toLowerCase().includes(q)
      );
    }
    return rows;
  }, [allMetrics, state.filters]);

  // Sort
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let av: number, bv: number;
      switch (sort.key) {
        case 'firstTimePassRate':
          av = a.firstTimePassRate; bv = b.firstTimePassRate; break;
        case 'openNCs':
          av = a.openNCs; bv = b.openNCs; break;
        case 'criticalOpenNCs':
          av = a.criticalOpenNCs; bv = b.criticalOpenNCs; break;
        case 'totalWIRs':
          av = a.totalWIRs; bv = b.totalWIRs; break;
        case 'avgNCClosureTime':
          av = a.avgNCClosureTime; bv = b.avgNCClosureTime; break;
        case 'name':
          return sort.dir === 'asc'
            ? a.contractor.name.localeCompare(b.contractor.name)
            : b.contractor.name.localeCompare(a.contractor.name);
        case 'risk':
        default:
          // Default risk ranking: critical NCs desc, then lowest pass rate asc
          if (a.criticalOpenNCs !== b.criticalOpenNCs) {
            return sort.dir === 'asc' ? a.criticalOpenNCs - b.criticalOpenNCs : b.criticalOpenNCs - a.criticalOpenNCs;
          }
          return sort.dir === 'asc' ? b.firstTimePassRate - a.firstTimePassRate : a.firstTimePassRate - b.firstTimePassRate;
      }
      return sort.dir === 'asc' ? av - bv : bv - av;
    });
  }, [filtered, sort]);

  function handleSort(key: string) {
    setSort(prev => prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' });
  }

  const selectedContractor = state.selectedContractorId
    ? allMetrics.find(m => m.contractor.id === state.selectedContractorId)
    : null;

  const hasFilters = Boolean(
    state.filters.region ||
    state.filters.city ||
    state.filters.project ||
    state.filters.category ||
    state.filters.search
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-[#F1F5F9] text-[#6B7280] font-semibold">
              Cross-Project Accountability
            </span>
            <span className="text-xs text-[#8B93A1]">· Multi-Site Quality Benchmark</span>
          </div>
          <h1 className="text-xl font-bold text-[#17191D] mt-1 tracking-tight">Contractors</h1>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Identify whether poor inspection pass rates and recurring defects stem from specific sites or systemic vendor deficiencies.
          </p>
        </div>

        {/* Global summary badge */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs font-medium text-[#6B7280]">Showing:</span>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-white border border-[#E6E9ED] text-[#17191D] shadow-2xs">
            {state.filters.city || 'All Cities'} · {filtered.length} Contractors
          </span>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Card 1: Total Active Contractors */}
        <div className="bg-white border border-[#E6E9ED] rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#6B7280]">Active Contractors</span>
            <span className="p-1.5 rounded-md bg-[#F8FAFC] text-[#6B7280] border border-[#E6E9ED]">
              <Users size={14} />
            </span>
          </div>
          <div className="text-2xl font-bold text-[#17191D] mt-2">
            {summary.totalActive}
          </div>
          <p className="text-[11px] text-[#6B7280] mt-1">
            Across 7 projects & 5 trade disciplines
          </p>
        </div>

        {/* Card 2: Contractors with Open Critical NCs */}
        <div className="bg-white border border-[#E6E9ED] rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#6B7280]">With Critical NCs</span>
            <span className={clsx('p-1.5 rounded-md border', summary.withCritNCs > 0 ? 'bg-rose-50 text-[#D92D20] border-rose-200' : 'bg-[#F8FAFC] text-[#6B7280] border-[#E6E9ED]')}>
              <AlertOctagon size={14} />
            </span>
          </div>
          <div className={clsx('text-2xl font-bold mt-2', summary.withCritNCs > 0 ? 'text-[#D92D20]' : 'text-[#17191D]')}>
            {summary.withCritNCs}
          </div>
          <p className="text-[11px] text-[#6B7280] mt-1">
            {summary.withCritNCs > 0 ? 'Mandatory stop-work / re-pour risk' : 'No critical safety breaches'}
          </p>
        </div>

        {/* Card 3: Contractors with Declining Pass Rate */}
        <div className="bg-white border border-[#E6E9ED] rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#6B7280]">Declining Quality Trend</span>
            <span className={clsx('p-1.5 rounded-md border', summary.declining > 0 ? 'bg-amber-50 text-[#B7791F] border-amber-200' : 'bg-[#F8FAFC] text-[#6B7280] border-[#E6E9ED]')}>
              <TrendingDown size={14} />
            </span>
          </div>
          <div className={clsx('text-2xl font-bold mt-2', summary.declining > 0 ? 'text-[#B7791F]' : 'text-[#17191D]')}>
            {summary.declining}
          </div>
          <p className="text-[11px] text-[#6B7280] mt-1">
            {summary.declining > 0 ? 'Consecutive pass-rate drop in Q3' : 'Stable or improving standards'}
          </p>
        </div>

        {/* Card 4: Lowest First-Time Pass Rate */}
        <div className="bg-white border border-[#E6E9ED] rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#6B7280]">Lowest 1st-Pass Rate</span>
            <span className="p-1.5 rounded-md bg-rose-50 text-[#D92D20] border border-rose-200">
              <ArrowDownRight size={14} />
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold text-[#D92D20]">
              {summary.lowestPassRate?.rate ?? 0}%
            </span>
            <span className="text-xs font-medium text-[#6B7280] truncate max-w-[120px]" title={summary.lowestPassRate?.name}>
              {summary.lowestPassRate?.name}
            </span>
          </div>
          <p className="text-[11px] text-[#6B7280] mt-1">
            High rework burden on site execution
          </p>
        </div>
      </div>

      {/* 2 SIDE-BY-SIDE DROPDOWNS: Location & Project (Unified across app) */}
      <div className="bg-white border border-[#E6E9ED] rounded-xl p-4 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#F1F5F9]">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-[#17191D] uppercase tracking-wider">
              Contractor Risk & Performance Filters
            </h2>
            <span className="text-xs text-[#6B7280]">
              · {state.filters.city || 'All Cities'} · {state.filters.project ? PROJECTS.find(p => p.id === state.filters.project)?.name : 'All Projects'}
            </span>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Search */}
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-2 text-[#8B93A1]" />
              <input
                type="text"
                value={state.filters.search}
                onChange={e => setFilter('search', e.target.value)}
                placeholder="Search contractor or trade…"
                className="h-8 pl-8 pr-3 text-xs bg-[#F6F7F8] hover:bg-[#F1F3F5] border border-[#E6E9ED] rounded-lg outline-none text-[#17191D] w-48 focus:bg-white focus:border-[#006B5B] transition-all"
              />
            </div>

            {hasFilters && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1 h-8 px-2.5 rounded-lg text-xs font-medium text-[#6B7280] hover:text-[#17191D] hover:bg-[#F1F3F5] transition-colors"
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
                value={state.filters.city || 'All Locations'}
                onChange={(e) => {
                  const val = e.target.value === 'All Locations' ? '' : e.target.value;
                  setFilter('city', val);
                  if (val && state.filters.project) {
                    const p = PROJECTS.find(proj => proj.id === state.filters.project);
                    if (p && p.city !== val) setFilter('project', '');
                  }
                }}
                className="h-10 w-full pl-9 pr-8 bg-white border border-slate-300 rounded-lg text-xs font-bold text-[#17191D] focus:outline-none focus:border-[#1E3A8A] shadow-2xs appearance-none cursor-pointer"
              >
                <option value="All Locations">All Locations</option>
                {CITY_OPTIONS.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
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
                value={state.filters.project || 'ALL'}
                onChange={(e) => setFilter('project', e.target.value === 'ALL' ? '' : e.target.value)}
                className="h-10 w-full pl-9 pr-8 bg-white border border-slate-300 rounded-lg text-xs font-bold text-[#17191D] focus:outline-none focus:border-[#1E3A8A] shadow-2xs appearance-none cursor-pointer"
              >
                <option value="ALL">All Projects</option>
                {(state.filters.city ? PROJECTS.filter(p => p.city === state.filters.city) : PROJECTS).map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.city})
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
            </div>
          </div>
        </div>

        {/* Trade Discipline Quick Filter strip */}
        <div className="flex items-center gap-1.5 pt-2 border-t border-[#F1F5F9] overflow-x-auto scrollbar-none">
          <span className="text-[11px] font-semibold text-[#6B7280] mr-1 shrink-0">Trade:</span>
          <button
            onClick={() => setFilter('category', '')}
            className={clsx(
              'px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors shrink-0',
              !state.filters.category ? 'bg-[#17191D] text-white shadow-2xs' : 'bg-[#F6F7F8] text-[#6B7280] hover:text-[#17191D]'
            )}
          >
            All Trades
          </button>
          {TRADE_OPTIONS.map(t => (
            <button
              key={t.value}
              onClick={() => setFilter('category', state.filters.category === t.value ? '' : t.value)}
              className={clsx(
                'px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors shrink-0',
                state.filters.category === t.value ? 'bg-[#006B5B] text-white shadow-2xs' : 'bg-[#F6F7F8] text-[#6B7280] hover:text-[#17191D]'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Contractors Table */}
      <div className="bg-white border border-[#E6E9ED] rounded-xl shadow-2xs overflow-hidden">
        <div className="px-5 py-4 border-b border-[#E6E9ED] flex items-center justify-between bg-[#FCFCFD]">
          <div>
            <h2 className="text-sm font-bold text-[#17191D]">Contractor Quality Ranking</h2>
            <p className="text-xs text-[#6B7280] mt-0.5">
              Ranked with highest quality risks and lowest first-time pass rates prioritized at the top.
            </p>
          </div>
          <span className="text-[11px] font-mono text-[#8B93A1]">
            Click row to view cross-project audit and linked defects
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[980px]">
            <thead>
              <tr className="border-b border-[#E6E9ED] bg-[#F8FAFC] text-[#6B7280] font-semibold uppercase tracking-wider text-[11px]">
                <SortableTh label="Contractor" sortKey="name" currentSort={sort} onSort={handleSort} className="pl-5 py-3" />
                <th className="px-3 py-3 font-semibold">Trade / Scope</th>
                <th className="px-3 py-3 font-semibold">Active Projects</th>
                <SortableTh label="Inspected WIRs" sortKey="totalWIRs" currentSort={sort} onSort={handleSort} />
                <SortableTh label="1st-Pass Rate" sortKey="firstTimePassRate" currentSort={sort} onSort={handleSort} />
                <SortableTh label="Open NCs" sortKey="openNCs" currentSort={sort} onSort={handleSort} />
                <SortableTh label="Crit. NCs" sortKey="criticalOpenNCs" currentSort={sort} onSort={handleSort} />
                <SortableTh label="Avg Close" sortKey="avgNCClosureTime" currentSort={sort} onSort={handleSort} />
                <th className="px-3 py-3 font-semibold">Repeat Defects</th>
                <th className="px-3 py-3 font-semibold">Trend</th>
                <th className="pr-5 py-3 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12">
                    <EmptyState
                      message="No contractors match the current filter selection. Try broadening your geographic location or clearing specific trade criteria."
                    />
                  </td>
                </tr>
              ) : (
                sorted.map(m => {
                  const projectList = m.projects.map(pid => PROJECTS.find(p => p.id === pid)).filter(Boolean);
                  const isHighRisk = m.criticalOpenNCs > 0 || m.firstTimePassRate < 60;

                  return (
                    <tr
                      key={m.contractor.id}
                      onClick={() => selectContractor(m.contractor.id)}
                      className={clsx(
                        'hover:bg-[#F8FAFC] cursor-pointer transition-colors',
                        isHighRisk && 'bg-rose-50/20'
                      )}
                    >
                      {/* Name & Evidence Badge */}
                      <td className="pl-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[#17191D] hover:text-[#006B5B] transition-colors">
                            {m.contractor.name}
                          </span>
                          {m.limitedEvidence && (
                            <span className="text-[10px] text-[#6B7280] bg-[#F1F5F9] px-1.5 py-0.5 rounded border border-[#E6E9ED]">
                              Limited data (&lt;5 WIRs)
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Trade */}
                      <td className="px-3 py-3.5 text-[#6B7280]">
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] bg-[#F8FAFC] border border-[#E6E9ED] text-[#475569]">
                          {m.contractor.type}
                        </span>
                      </td>

                      {/* Active Projects Pills */}
                      <td className="px-3 py-3.5">
                        <div className="flex items-center gap-1.5 flex-wrap max-w-[220px]">
                          {projectList.map(p => (
                            <span
                              key={p?.id}
                              className="text-[11px] font-medium text-[#17191D] bg-white border border-[#CBD5E1] px-1.5 py-0.5 rounded shadow-2xs"
                              title={`${p?.name} (${p?.city})`}
                            >
                              {p?.name}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Total WIRs */}
                      <td className="px-3 py-3.5 font-mono text-[#17191D] font-medium">
                        {m.totalWIRs}
                      </td>

                      {/* First-Time Pass Rate */}
                      <td className="px-3 py-3.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={clsx(
                              'text-xs font-bold px-2 py-0.5 rounded border',
                              m.firstTimePassRate >= 80
                                ? 'bg-emerald-50 text-[#16805D] border-emerald-200'
                                : m.firstTimePassRate >= 60
                                ? 'bg-amber-50 text-[#B7791F] border-amber-200'
                                : 'bg-rose-50 text-[#D92D20] border-rose-200'
                            )}
                          >
                            {m.firstTimePassRate}%
                          </span>
                        </div>
                      </td>

                      {/* Open NCs */}
                      <td className="px-3 py-3.5 font-mono font-medium text-[#17191D]">
                        {m.openNCs}
                      </td>

                      {/* Critical NCs */}
                      <td className="px-3 py-3.5">
                        {m.criticalOpenNCs > 0 ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#D92D20] bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                            <AlertTriangle size={11} /> {m.criticalOpenNCs} Critical
                          </span>
                        ) : (
                          <span className="text-[#8B93A1] font-mono">—</span>
                        )}
                      </td>

                      {/* Avg Closure Time */}
                      <td className="px-3 py-3.5 text-[#6B7280] font-mono">
                        {m.avgNCClosureTime > 0 ? `${m.avgNCClosureTime}d` : '—'}
                      </td>

                      {/* Repeat Defects */}
                      <td className="px-3 py-3.5">
                        {m.repeatNCCount > 0 ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#B7791F] bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                            {m.repeatNCCount} repeat
                          </span>
                        ) : (
                          <span className="text-[#8B93A1] font-mono">0</span>
                        )}
                      </td>

                      {/* Trend */}
                      <td className="px-3 py-3.5">
                        <TrendIcon trend={m.trend} />
                      </td>

                      {/* Chevron */}
                      <td className="pr-5 py-3.5 text-right text-[#8B93A1]">
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

      {/* Contractor Detail Drawer */}
      {selectedContractor && (
        <ContractorDetailDrawer
          metrics={selectedContractor}
          wirs={state.wirs}
          ncs={state.ncs}
          onClose={() => selectContractor(null)}
          onViewWIR={(wirId) => {
            selectContractor(null);
            setTab('wir');
            selectWIR(wirId);
          }}
          onViewNC={(ncId) => {
            selectContractor(null);
            setTab('nc');
            selectNC(ncId);
          }}
          onTriggerToast={(msg) => setNoticeToast(msg)}
        />
      )}

      {/* Floating Action Toast */}
      {noticeToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#17191D] text-white px-4 py-3 rounded-lg shadow-xl border border-slate-700 flex items-center gap-3 animate-in fade-in duration-200 text-xs">
          <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
          <span>{noticeToast}</span>
          <button
            onClick={() => setNoticeToast(null)}
            className="ml-2 text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

// ── Trend Indicator Component ─────────────────────────────────
function TrendIcon({ trend }: { trend: 'improving' | 'declining' | 'stable' }) {
  if (trend === 'improving') {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#16805D]">
        <TrendingUp size={12} /> Improving
      </span>
    );
  }
  if (trend === 'declining') {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#D92D20]">
        <TrendingDown size={12} /> Declining
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[11px] text-[#6B7280]">
      <Minus size={12} /> Stable
    </span>
  );
}

// ── Contractor Detail Drawer ──────────────────────────────────
function ContractorDetailDrawer({
  metrics: m,
  wirs,
  ncs,
  onClose,
  onViewWIR,
  onViewNC,
  onTriggerToast,
}: {
  metrics: ContractorMetrics;
  wirs: WIR[];
  ncs: NC[];
  onClose: () => void;
  onViewWIR: (id: string) => void;
  onViewNC: (id: string) => void;
  onTriggerToast: (msg: string) => void;
}) {
  const contractorWIRs = wirs.filter(w => w.contractorId === m.contractor.id);
  const contractorNCs = ncs.filter(n => n.contractorId === m.contractor.id);
  const openNCs = contractorNCs.filter(n => n.status !== 'Closed');

  // Repeat defect categories
  const repeatCategories = [...new Set(
    contractorNCs.filter(n => n.isRepeat && n.repeatCategory).map(n => n.repeatCategory!)
  )];

  const projectNames = m.projects
    .map(pid => PROJECTS.find(p => p.id === pid)?.name ?? '')
    .filter(Boolean);
  const isMultiProject = m.projects.length > 1;

  const handleIssueNotice = () => {
    onTriggerToast(`Formal Quality Performance Notice dispatched to ${m.contractor.name} Site Management.`);
  };

  const handleExportScorecard = () => {
    onTriggerToast(`Vendor Scorecard for ${m.contractor.name} downloaded as CSV.`);
  };

  return (
    <Drawer
      open
      onClose={onClose}
      title={m.contractor.name}
      subtitle={`${m.contractor.type} · ${isMultiProject ? 'Multi-Project Contractor' : 'Single Site Contractor'}`}
      width="640px"
    >
      <div className="space-y-6">
        {/* KPI Strip */}
        <div className="grid grid-cols-3 gap-3">
          <div className="border border-[#E6E9ED] rounded-xl p-3.5 text-center bg-[#F8FAFC]">
            <div
              className={clsx(
                'text-2xl font-bold font-mono',
                m.firstTimePassRate >= 80
                  ? 'text-[#16805D]'
                  : m.firstTimePassRate >= 60
                  ? 'text-[#B7791F]'
                  : 'text-[#D92D20]'
              )}
            >
              {m.firstTimePassRate}%
            </div>
            <div className="text-[11px] text-[#6B7280] font-medium mt-0.5">
              1st-Pass Approval Rate
            </div>
          </div>

          <div className="border border-[#E6E9ED] rounded-xl p-3.5 text-center bg-[#F8FAFC]">
            <div className={clsx('text-2xl font-bold font-mono', m.openNCs > 3 ? 'text-[#D92D20]' : 'text-[#17191D]')}>
              {m.openNCs}
            </div>
            <div className="text-[11px] text-[#6B7280] font-medium mt-0.5">
              Open Quality Findings
            </div>
          </div>

          <div className="border border-[#E6E9ED] rounded-xl p-3.5 text-center bg-[#F8FAFC]">
            <div className="text-2xl font-bold font-mono text-[#17191D]">
              {m.totalWIRs}
            </div>
            <div className="text-[11px] text-[#6B7280] font-medium mt-0.5">
              Total Inspected WIRs
            </div>
          </div>
        </div>

        {/* Portfolio Summary Metadata */}
        <DrawerSection title="Portfolio Quality Profile">
          <div className="border border-[#E6E9ED] rounded-xl overflow-hidden divide-y divide-[#F1F5F9] bg-white">
            <FieldRow label="Contractor Trade" value={m.contractor.type} />
            <FieldRow label="Active Footprint" value={projectNames.join(', ')} />
            <FieldRow label="Avg NC Resolution Time" value={m.avgNCClosureTime > 0 ? `${m.avgNCClosureTime} calendar days` : '—'} />
            <FieldRow
              label="Repeat Defect Patterns"
              value={
                m.repeatNCCount > 0 ? (
                  <span className="text-xs font-semibold text-[#B7791F] flex items-center gap-1">
                    <AlertTriangle size={12} />
                    {m.repeatNCCount} repeat issues ({repeatCategories.join(', ')})
                  </span>
                ) : (
                  <span className="text-xs text-[#16805D] flex items-center gap-1">
                    <CheckCircle2 size={12} /> No repeat patterns identified
                  </span>
                )
              }
            />
            <FieldRow label="Performance Trend" value={<TrendIcon trend={m.trend} />} />
          </div>
        </DrawerSection>

        {/* Cross-Project Accountability Breakdown */}
        {isMultiProject && (
          <DrawerSection title="Cross-Project Accountability">
            <div className="space-y-2 mb-3">
              {m.projects.map(pid => {
                const proj = PROJECTS.find(p => p.id === pid);
                const projWIRs = contractorWIRs.filter(w => w.projectId === pid);
                const projNCs = contractorNCs.filter(n => n.projectId === pid);
                const decided = projWIRs.filter(w => w.status === 'Approved' || w.status === 'Rejected');
                const passRate = decided.length > 0
                  ? Math.round((decided.filter(w => w.firstPassResult === 'Pass').length / decided.length) * 100)
                  : 0;
                const openProjNCs = projNCs.filter(n => n.status !== 'Closed').length;

                return (
                  <div
                    key={pid}
                    className="flex items-center justify-between p-3 border border-[#E6E9ED] rounded-xl bg-[#F8FAFC]"
                  >
                    <div className="flex items-center gap-2.5">
                      {proj?.image && (
                        <img
                          src={proj.image}
                          alt={proj.name}
                          className="w-8 h-8 rounded-lg object-cover border border-[#CBD5E1] flex-shrink-0"
                        />
                      )}
                      <div>
                        <span className="text-xs font-bold text-[#17191D]">{proj?.name}</span>
                        <span className="text-[11px] text-[#6B7280] ml-1.5 font-mono">({proj?.city})</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span
                        className={clsx(
                          'font-bold px-2 py-0.5 rounded border text-[11px]',
                          passRate >= 80
                            ? 'bg-emerald-50 text-[#16805D] border-emerald-200'
                            : passRate >= 60
                            ? 'bg-amber-50 text-[#B7791F] border-amber-200'
                            : 'bg-rose-50 text-[#D92D20] border-rose-200'
                        )}
                      >
                        {passRate}% pass
                      </span>
                      <span className="text-[#6B7280] font-mono">{projWIRs.length} WIRs</span>
                      <span
                        className={clsx(
                          'font-semibold text-[11px]',
                          openProjNCs > 0 ? 'text-[#D92D20]' : 'text-[#16805D]'
                        )}
                      >
                        {openProjNCs} open NCs
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Diagnostic Alert Callout */}
            <div
              className={clsx(
                'p-3.5 rounded-xl border text-xs flex items-start gap-2.5',
                m.firstTimePassRate < 60
                  ? 'bg-rose-50/70 border-rose-200 text-[#991B1B]'
                  : 'bg-emerald-50/70 border-emerald-200 text-[#065F46]'
              )}
            >
              <ShieldAlert size={16} className="flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">System Quality Finding: </span>
                <span>
                  {m.firstTimePassRate < 60
                    ? `Deficiencies are observed across ${m.projects.length} separate project sites simultaneously. This establishes that issues are rooted in contractor-wide batching/workmanship procedures rather than an isolated site supervisor.`
                    : `Contractor maintains consistent compliance across all ${m.projects.length} independent project teams.`}
                </span>
              </div>
            </div>
          </DrawerSection>
        )}

        {/* Open NCs with Jump Link */}
        {openNCs.length > 0 && (
          <DrawerSection title={`Open Non-Compliances (${openNCs.length})`}>
            <div className="space-y-2.5">
              {openNCs.map(nc => {
                const proj = PROJECTS.find(p => p.id === nc.projectId);
                return (
                  <div
                    key={nc.id}
                    className="border border-[#E6E9ED] rounded-xl p-3 bg-white hover:border-[#CBD5E1] transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono font-bold text-[#006B5B]">{nc.id}</span>
                        <SeverityBadge severity={nc.severity} />
                        <StatusBadge status={nc.status} />
                        {nc.isRepeat && (
                          <span className="text-[10px] bg-amber-50 border border-amber-200 text-[#B7791F] font-bold px-1.5 py-0.5 rounded">
                            REPEAT
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => onViewNC(nc.id)}
                        className="text-xs font-semibold text-[#006B5B] hover:underline flex items-center gap-1"
                      >
                        Inspect NC <ExternalLink size={11} />
                      </button>
                    </div>
                    <p className="text-xs text-[#17191D] font-medium mt-2 leading-relaxed">
                      {nc.finding}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-[#6B7280] mt-2 font-mono">
                      <span>{proj?.name}</span>
                      <span>·</span>
                      <span>{nc.tower}</span>
                      <span>·</span>
                      <span className={clsx(nc.age > 7 && 'text-[#D92D20] font-bold')}>
                        {nc.age} days open
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </DrawerSection>
        )}

        {/* Recent WIR Inspection Register */}
        <DrawerSection title="Recent Work Inspection Requests (WIR)">
          <div className="border border-[#E6E9ED] rounded-xl overflow-hidden bg-white">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E6E9ED] text-[#6B7280] font-semibold">
                  <th className="px-3 py-2 font-medium">WIR ID</th>
                  <th className="px-3 py-2 font-medium">Project</th>
                  <th className="px-3 py-2 font-medium">Activity</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium">1st Pass</th>
                  <th className="px-3 py-2 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {contractorWIRs.slice(0, 6).map(wir => {
                  const proj = PROJECTS.find(p => p.id === wir.projectId);
                  return (
                    <tr
                      key={wir.id}
                      className="hover:bg-[#F8FAFC] transition-colors"
                    >
                      <td className="px-3 py-2 font-mono font-bold text-[#006B5B]">
                        {wir.id}
                      </td>
                      <td className="px-3 py-2 text-[#6B7280] truncate max-w-[100px]">
                        {proj?.name}
                      </td>
                      <td className="px-3 py-2 text-[#17191D] max-w-[130px] truncate">
                        {wir.activity}
                      </td>
                      <td className="px-3 py-2">
                        <StatusBadge status={wir.status} />
                      </td>
                      <td className="px-3 py-2">
                        {wir.firstPassResult === 'Pass' && (
                          <span className="text-[11px] font-bold text-[#16805D]">Pass</span>
                        )}
                        {wir.firstPassResult === 'Fail' && (
                          <span className="text-[11px] font-bold text-[#D92D20]">Fail</span>
                        )}
                        {wir.firstPassResult === 'Pending' && (
                          <span className="text-[11px] text-[#8B93A1]">—</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <button
                          onClick={() => onViewWIR(wir.id)}
                          className="text-[11px] text-[#006B5B] hover:underline font-medium"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </DrawerSection>

        {/* Operational Actions */}
        <DrawerSection title="Operational Vendor Actions">
          <div className="flex items-center gap-3">
            <button
              onClick={handleIssueNotice}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-rose-50 border border-rose-200 text-[#D92D20] hover:bg-rose-100 text-xs font-semibold transition-colors"
            >
              <FileWarning size={13} />
              Issue Quality Warning Notice
            </button>
            <button
              onClick={handleExportScorecard}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#F8FAFC] border border-[#E6E9ED] text-[#17191D] hover:bg-slate-100 text-xs font-medium transition-colors"
            >
              <Download size={13} />
              Download Vendor Scorecard
            </button>
          </div>
        </DrawerSection>
      </div>
    </Drawer>
  );
}
