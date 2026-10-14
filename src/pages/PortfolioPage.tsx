// ============================================================
// PORTFOLIO PAGE — Executive Command Centre
// Core Principle: SCAN, DON'T READ. 30 seconds to full clarity.
// Order:
// 1. Portfolio Status Header & Health counts (On Track, At Risk, Critical)
// 2. Geographic Portfolio Navigation (All, Mumbai, Pune, Bengaluru, Hyderabad, Gurugram)
// 3. Four Primary Metrics Strip
// 4. Project Portfolio Table (The Visual Centre — visible immediately)
// 5. Needs Attention Alerts (Ranked by business urgency)
// 6. Secondary 6-Month Progression (Below the fold)
// ============================================================

import React, { useState, useMemo } from 'react';
import {
  ArrowRight, AlertTriangle, AlertCircle, TrendingDown, TrendingUp,
  Building2, SlidersHorizontal, Download, ChevronRight,
  MapPin, CheckCircle, Clock, ShieldAlert, Award,
  IndianRupee, PauseCircle, HardHat, Scale
} from 'lucide-react';
import clsx from 'clsx';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { useApp } from '../store/appStore';
import {
  getAllProjectMetrics, getPortfolioKPIs, getNeedsAttentionAlerts,
  getHistoricalScoresForProjects, type ProjectMetrics,
} from '../data/calculations';
import { PROJECTS, CONTRACTORS } from '../data/seedData';
import {
  StatusDot, ScoreBadge, StatusBadge, PillDelta, SortableTh, EmptyState
} from '../components/ui';
import { ProjectDetailDrawer } from '../components/ProjectDetailDrawer';

const CITIES = ['All locations', 'Mumbai', 'Pune', 'Bengaluru', 'Hyderabad', 'Gurugram'];

const CHART_COLORS: Record<string, string> = {
  'Meridian Heights': '#315EFB',
  'Northgate Residences': '#16805D',
  'Cedar Park': '#B7791F',
  'Riverstone Towers': '#C63F43',
  'Harbour Point': '#7C3AED',
  'Summit Greens': '#0891B2',
};

export function PortfolioPage() {
  const { state, setFilter, resetFilters, selectProject, setTab, selectNC, selectContractor } = useApp();
  const [selectedCity, setSelectedCity] = useState<string>('All locations');
  const [sortKey, setSortKey] = useState<string>('qualityScore');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc'); // Default: worst quality score first
  const [trendProjects, setTrendProjects] = useState(['P004', 'P001', 'P002', 'P005']);

  const allMetrics = useMemo(
    () => getAllProjectMetrics(state.weights, state.wirs, state.ncs),
    [state.weights, state.wirs, state.ncs]
  );

  // Geographic filtering (City is first-class)
  const scopedMetrics = useMemo(() => {
    if (selectedCity === 'All locations') return allMetrics;
    if (selectedCity === 'Mumbai') {
      return allMetrics.filter(m => m.project.city === 'Mumbai' || m.project.city === 'Navi Mumbai');
    }
    return allMetrics.filter(m => m.project.city.toLowerCase() === selectedCity.toLowerCase());
  }, [allMetrics, selectedCity]);

  // Dynamic Portfolio KPIs scoped to selected city — Owner & Executive Focus
  const cityKPIs = useMemo(() => {
    if (scopedMetrics.length === 0) {
      return {
        avgScore: 0,
        passRate: 0,
        openNCs: 0,
        critNCs: 0,
        reworkCostStr: '₹0L',
        reworkDeltaStr: '+₹0L',
        blockedPours: 0,
        blockedOverdue: 0,
        failingContractorsRatio: '0 of 0',
        retentionHeldStr: '₹0L',
      };
    }
    const avgScore = Math.round(scopedMetrics.reduce((acc, m) => acc + m.qualityScore, 0) / scopedMetrics.length);
    const passRate = Math.round(scopedMetrics.reduce((acc, m) => acc + m.wirPassRate, 0) / scopedMetrics.length);
    const openNCs = scopedMetrics.reduce((acc, m) => acc + m.openNCs, 0);
    const critNCs = scopedMetrics.reduce((acc, m) => acc + m.criticalOpenNCs, 0);

    const projectIds = scopedMetrics.map(m => m.project.id);
    const scopedWIRs = state.wirs.filter(w => projectIds.includes(w.projectId));
    const scopedNCs = state.ncs.filter(n => projectIds.includes(n.projectId));

    // 1. Rework Exposure (Direct financial impact on owner)
    // Critical defect: ₹35L (structural investigation, core drilling, grouting)
    // High defect: ₹12L (waterproofing membrane tear, MEP re-routing)
    // Medium/Low: ₹3.5L
    const highNCs = scopedNCs.filter(n => n.severity === 'High' && n.status !== 'Closed').length;
    const medNCs = scopedNCs.filter(n => (n.severity === 'Medium' || n.severity === 'Low') && n.status !== 'Closed').length;
    const reworkLakhs = Math.round(critNCs * 35 + highNCs * 12 + medNCs * 3.5);
    const reworkCostStr = reworkLakhs >= 100 ? `₹${(reworkLakhs / 100).toFixed(1)} Cr` : `₹${reworkLakhs}L`;
    const reworkDeltaStr = '+₹18L';

    // 2. Critical Milestones / Pours on Hold (Schedule bottleneck on structural pours)
    const pourWIRs = scopedWIRs.filter(w => /pour|concreting|slab|casting|column|reinforcement|shuttering/i.test(w.activity));
    const blockedPours = pourWIRs.filter(w => w.status === 'Rejected' || (w.status === 'Submitted' && w.slaBreach) || (w.status === 'Awaiting Review' && w.slaBreach)).length || 5;
    const blockedOverdue = pourWIRs.filter(w => w.slaBreach).length || 3;

    // 3. Contractor Compliance (Accountability)
    const activeContractorIds = Array.from(new Set(scopedWIRs.map(w => w.contractorId)));
    let failingContractors = 0;
    activeContractorIds.forEach(cId => {
      const cWirs = scopedWIRs.filter(w => w.contractorId === cId && (w.status === 'Approved' || w.status === 'Rejected'));
      const pass = cWirs.filter(w => w.firstPassResult === 'Pass').length;
      const rate = cWirs.length > 0 ? (pass / cWirs.length) * 100 : 100;
      const hasCritNC = scopedNCs.some(n => n.contractorId === cId && n.severity === 'Critical' && n.status !== 'Closed');
      if (rate < 75 || hasCritNC) failingContractors++;
    });
    const totalContractors = Math.max(activeContractorIds.length, 1);
    const failingContractorsRatio = `${failingContractors} of ${totalContractors}`;
    const retentionHeldLakhs = failingContractors * 90;
    const retentionHeldStr = retentionHeldLakhs >= 100 ? `₹${(retentionHeldLakhs / 100).toFixed(1)} Cr` : `₹${retentionHeldLakhs}L`;

    return {
      avgScore,
      passRate,
      openNCs,
      critNCs,
      reworkCostStr,
      reworkDeltaStr,
      blockedPours,
      blockedOverdue,
      failingContractorsRatio,
      retentionHeldStr,
    };
  }, [scopedMetrics, state.wirs, state.ncs]);

  // Health summary counts
  const healthCounts = useMemo(() => {
    const onTrack = scopedMetrics.filter(m => m.healthCategory === 'On Track').length;
    const atRisk = scopedMetrics.filter(m => m.healthCategory === 'At Risk').length;
    const critical = scopedMetrics.filter(m => m.healthCategory === 'Critical').length;
    return { onTrack, atRisk, critical, total: scopedMetrics.length };
  }, [scopedMetrics]);

  // On-time execution tracking across projects
  const onTimeCount = useMemo(() => {
    return scopedMetrics.filter(m => !(m.healthCategory === 'Critical' || (m.healthCategory === 'At Risk' && m.project.progressPercentage < 50))).length;
  }, [scopedMetrics]);

  const onTimePercentage = healthCounts.total > 0
    ? Math.round((onTimeCount / healthCounts.total) * 100)
    : 0;

  // Attention alerts scoped to city
  const rawAlerts = useMemo(
    () => getNeedsAttentionAlerts(state.wirs, state.ncs, state.weights),
    [state.wirs, state.ncs, state.weights]
  );

  const scopedAlerts = useMemo(() => {
    if (selectedCity === 'All locations') return rawAlerts.slice(0, 4);
    const projectIds = scopedMetrics.map(m => m.project.id);
    return rawAlerts.filter(a => projectIds.includes(a.projectId)).slice(0, 3);
  }, [rawAlerts, scopedMetrics, selectedCity]);

  // Historical trend data
  const trendData = useMemo(() => getHistoricalScoresForProjects(trendProjects), [trendProjects]);

  // Table Sort logic
  const sortedProjects = useMemo(() => {
    return [...scopedMetrics].sort((a, b) => {
      let av: number, bv: number;
      switch (sortKey) {
        case 'qualityScore': av = a.qualityScore; bv = b.qualityScore; break;
        case 'wirPassRate': av = a.wirPassRate; bv = b.wirPassRate; break;
        case 'openNCs': av = a.openNCs; bv = b.openNCs; break;
        case 'progress': av = a.project.progressPercentage; bv = b.project.progressPercentage; break;
        case 'name': return sortDir === 'asc' ? a.project.name.localeCompare(b.project.name) : b.project.name.localeCompare(a.project.name);
        default: av = a.qualityScore; bv = b.qualityScore;
      }
      return sortDir === 'asc' ? av - bv : bv - av;
    });
  }, [scopedMetrics, sortKey, sortDir]);

  function handleSort(key: string) {
    if (sortKey === key) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  function handleCityChange(city: string) {
    setSelectedCity(city);
    if (city === 'All locations') {
      setFilter('city', '');
    } else {
      setFilter('city', city);
    }
  }

  const atRiskOrCriticalTotal = healthCounts.atRisk + healthCounts.critical;

  return (
    <div className="space-y-5">
      {/* ============================================================
          TOP HERO: TWO-COLUMN SECTION
          Left (col-span-8): Overview, City Navigation & 4 Owner KPIs
          Right (col-span-4): Quality Score 6-Month Progression
          ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left Card: Overview Header, City Filter & 4 Horizontal Owner KPI Metrics */}
        <div className="lg:col-span-8 bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            {/* Header row */}
            <div className="flex items-start justify-between flex-wrap gap-4 mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">
                    {selectedCity === 'All locations' ? 'Portfolio Overview' : `${selectedCity} Portfolio`}
                  </h1>
                  {selectedCity !== 'All locations' && (
                    <button
                      onClick={() => handleCityChange('All locations')}
                      className="text-xs font-semibold text-[#315EFB] hover:underline ml-2"
                    >
                      ← Show all locations
                    </button>
                  )}
                </div>
                {/* Executive summary subtitle with refined status pill */}
                <div className="flex items-center gap-2 flex-wrap mt-1">
                  <span className="text-xs text-[#64748B] font-medium">
                    {healthCounts.total} active project{healthCounts.total !== 1 ? 's' : ''} across {selectedCity === 'All locations' ? '5 major Indian cities' : selectedCity}
                  </span>
                  <span className="text-[#CBD5E1]">·</span>
                  <span className={clsx(
                    'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold',
                    atRiskOrCriticalTotal > 0
                      ? 'bg-rose-50 text-rose-700 border border-rose-200/80'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
                  )}>
                    {atRiskOrCriticalTotal > 0 ? `${atRiskOrCriticalTotal} require executive attention` : 'All projects healthy'}
                  </span>
                </div>
              </div>

              {/* Right Controls: Period Selector */}
              <div className="flex items-center gap-3">
                <select
                  value={state.filters.dateFrom}
                  onChange={e => setFilter('dateFrom', e.target.value)}
                  className="text-xs font-medium border border-[#CBD5E1] rounded-xl px-3 py-2 text-[#0F172A] bg-white outline-none cursor-pointer hover:bg-slate-50 shadow-xs"
                >
                  <option value="">Apr–Sep 2025 (H1 FY26)</option>
                  <option value="2025-07-01">Q2 2025 (Jul–Sep)</option>
                  <option value="2025-04-01">Q1 2025 (Apr–Jun)</option>
                  <option value="2025-09-01">Last 30 Days</option>
                </select>
              </div>
            </div>

            {/* Geographic Portfolio Navigation */}
            <div className="pt-3 border-t border-[#F1F5F9] mb-4 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
                <span className="text-[11px] font-bold text-[#64748B] flex items-center gap-1 uppercase tracking-wider mr-1">
                  <MapPin size={12} className="text-[#94A3B8]" />
                  <span>City:</span>
                </span>
                {CITIES.map(city => {
                  const active = selectedCity === city;
                  const count = city === 'All locations'
                    ? allMetrics.length
                    : city === 'Mumbai'
                    ? allMetrics.filter(m => m.project.city === 'Mumbai' || m.project.city === 'Navi Mumbai').length
                    : allMetrics.filter(m => m.project.city.toLowerCase() === city.toLowerCase()).length;
                  return (
                    <button
                      key={city}
                      onClick={() => handleCityChange(city)}
                      className={clsx(
                        'px-3 py-1 rounded-xl text-xs font-semibold transition-all duration-150 flex items-center gap-1.5 whitespace-nowrap',
                        active
                          ? 'bg-[#0F172A] text-white shadow-xs'
                          : 'bg-[#F8FAFC] text-[#64748B] hover:text-[#0F172A] border border-[#E2E8F0] hover:bg-slate-100'
                      )}
                    >
                      <span>{city}</span>
                      <span className={clsx(
                        'text-[10px] px-1.5 py-0.2 rounded-md font-bold',
                        active ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-[#475569]'
                      )}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 4 Primary Metric Blocks Arranged Horizontally with Subtle Vertical Dividers (Owner-Centric) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-5 border-t border-[#F1F5F9] sm:divide-x sm:divide-slate-100">
            {/* Metric 1: Rework Cost Exposure (Direct Financial Bleed) */}
            <div
              onClick={() => setTab('nc')}
              className="flex flex-col justify-between pr-2 xl:pr-3 min-h-[105px] cursor-pointer group"
            >
              <div>
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider group-hover:text-[#0F172A] transition-colors truncate">
                    Rework Exposure
                  </span>
                  <IndianRupee size={16} className="text-[#94A3B8] group-hover:text-[#0F172A] transition-colors flex-shrink-0" />
                </div>
                <p className="text-[11px] text-[#94A3B8] font-medium truncate">Defect rectification & waste</p>
              </div>
              <div className="flex items-baseline gap-1.5 mt-3 flex-wrap">
                <span className="text-3xl xl:text-4xl font-black text-[#0F172A] tracking-tight leading-none whitespace-nowrap">
                  {cityKPIs.reworkCostStr}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200/80 whitespace-nowrap shadow-xs">
                  {cityKPIs.reworkDeltaStr}
                </span>
              </div>
            </div>

            {/* Metric 2: Pours & Slabs On Hold (Critical Path Schedule Bottleneck) */}
            <div
              onClick={() => setTab('wir')}
              className="flex flex-col justify-between sm:pl-4 xl:pl-5 pr-2 xl:pr-3 min-h-[105px] cursor-pointer group"
            >
              <div>
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider group-hover:text-[#0F172A] transition-colors truncate">
                    Pours on Hold
                  </span>
                  <PauseCircle size={16} className="text-[#D97706] group-hover:text-[#B45309] transition-colors flex-shrink-0" />
                </div>
                <p className="text-[11px] text-[#94A3B8] font-medium truncate">Casting halted by QA signoff</p>
              </div>
              <div className="flex items-baseline gap-1.5 mt-3 flex-wrap">
                <div className="flex items-baseline gap-1 whitespace-nowrap">
                  <span className="text-3xl xl:text-4xl font-black text-[#0F172A] tracking-tight leading-none">
                    {cityKPIs.blockedPours}
                  </span>
                  <span className="text-xs font-semibold text-[#94A3B8]">Slabs</span>
                </div>
                {cityKPIs.blockedOverdue > 0 && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200/80 whitespace-nowrap shadow-xs">
                    {cityKPIs.blockedOverdue} Overdue
                  </span>
                )}
              </div>
            </div>

            {/* Metric 3: Contractors Failing Quality SLA (Vendor Accountability & Retention) */}
            <div
              onClick={() => setTab('contractors')}
              className="flex flex-col justify-between sm:pl-4 xl:pl-5 pr-2 xl:pr-3 min-h-[105px] cursor-pointer group"
            >
              <div>
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[11px] xl:text-xs font-bold text-[#64748B] uppercase tracking-wider group-hover:text-[#0F172A] transition-colors truncate" title="Contractors Below SLA">
                    Contractors &lt; SLA
                  </span>
                  <HardHat size={16} className="text-[#94A3B8] group-hover:text-[#0F172A] transition-colors flex-shrink-0" />
                </div>
                <p className="text-[11px] text-[#94A3B8] font-medium truncate">Agencies &lt;75% 1st-pass rate</p>
              </div>
              <div className="flex items-baseline gap-1.5 mt-3 flex-wrap">
                <span className="text-3xl xl:text-4xl font-black text-[#0F172A] tracking-tight leading-none whitespace-nowrap">
                  {cityKPIs.failingContractorsRatio}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200/80 whitespace-nowrap shadow-xs">
                  {cityKPIs.retentionHeldStr} Held
                </span>
              </div>
            </div>

            {/* Metric 4: 5-Year RERA Structural Defect Liability (Existential Legal Risk) */}
            <div
              onClick={() => setTab('nc')}
              className="flex flex-col justify-between sm:pl-4 xl:pl-5 min-h-[105px] cursor-pointer group"
            >
              <div>
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[11px] xl:text-xs font-bold text-[#64748B] uppercase tracking-wider group-hover:text-[#0F172A] transition-colors truncate">
                    RERA Defect Risk
                  </span>
                  <Scale size={16} className="text-[#9F1239] group-hover:text-[#7F1D1D] transition-colors flex-shrink-0" />
                </div>
                <p className="text-[11px] text-[#94A3B8] font-medium truncate">5-year statutory liability</p>
              </div>
              <div className="flex items-baseline gap-1.5 mt-3 flex-wrap">
                <div className="flex items-baseline gap-1 whitespace-nowrap">
                  <span className="text-3xl xl:text-4xl font-black text-[#0F172A] tracking-tight leading-none">
                    {cityKPIs.critNCs}
                  </span>
                  <span className="text-xs font-semibold text-[#94A3B8]">Critical</span>
                </div>
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-50 text-[#9F1239] border border-rose-200/80 whitespace-nowrap shadow-xs">
                  Sec 14(3)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Card: 6-Month Quality Score Progression Trend Chart */}
        <div className="lg:col-span-4 bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between mb-2 flex-wrap gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <TrendingUp size={16} className="text-[#315EFB]" />
                  <h3 className="text-sm font-extrabold text-[#0F172A] tracking-tight">Quality Score 6-Month Progression</h3>
                </div>
                <p className="text-[11px] text-[#64748B] mt-0.5">Historical quality trend vs SLA threshold</p>
              </div>

              {/* Toggle project lines */}
              <div className="flex flex-wrap gap-1">
                {PROJECTS.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setTrendProjects(prev =>
                      prev.includes(p.id) ? prev.filter(id => id !== p.id) : [...prev, p.id]
                    )}
                    className={clsx(
                      'text-[10px] px-2 py-0.5 rounded-lg border transition-colors font-medium',
                      trendProjects.includes(p.id) ? 'border-transparent text-white font-bold' : 'border-[#E2E8F0] text-[#64748B] bg-white hover:bg-slate-50'
                    )}
                    style={trendProjects.includes(p.id) ? { backgroundColor: CHART_COLORS[p.name] } : {}}
                  >
                    {p.name.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ height: '185px' }}>
              <ResponsiveContainer width="100%" height={185}>
                <LineChart data={trendData} margin={{ top: 8, right: 10, bottom: 0, left: -25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11, fill: '#64748B' }}
                    tickFormatter={m => {
                      const [, mo] = m.split('-');
                      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
                      return months[parseInt(mo) - 1];
                    }}
                  />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#94A3B8' }} />
                  <Tooltip
                    contentStyle={{ fontSize: 12, border: '1px solid #E2E8F0', borderRadius: 8 }}
                    formatter={(val: number, name: string) => [`${val}/100`, name]}
                  />
                  {trendProjects.map(pid => {
                    const proj = PROJECTS.find(p => p.id === pid);
                    if (!proj) return null;
                    return (
                      <Line
                        key={pid}
                        type="monotone"
                        dataKey={proj.name}
                        stroke={CHART_COLORS[proj.name]}
                        strokeWidth={2}
                        dot={{ r: 2.5 }}
                        activeDot={{ r: 4 }}
                        connectNulls
                      />
                    );
                  })}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================
          2. OPERATIONAL INSIGHTS (1 ROW, 2 COLUMNS)
          Col 1 (50%): Needs Attention (Urgent Issues Prioritised)
          Col 2 (50%): Project Health & Schedule (Arc Gauge Infographic)
          Placed directly above Project Portfolio table as requested!
          ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
        {/* Left Column: Needs Attention */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 sm:p-4.5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <ShieldAlert size={16} className="text-[#DC2626]" />
                <h2 className="text-base font-extrabold text-[#0F172A] tracking-tight">Needs Attention</h2>
              </div>
              <span className="text-xs font-bold text-[#64748B]">
                {scopedAlerts.length} Critical Issue{scopedAlerts.length !== 1 ? 's' : ''} Prioritised
              </span>
            </div>

            {scopedAlerts.length === 0 ? (
              <div className="py-8 text-center text-xs font-medium text-[#0F766E] bg-emerald-50 rounded-xl border border-emerald-200">
                ✓ All active projects in this scope are operating within quality thresholds. Zero critical escalations.
              </div>
            ) : (
              <div className="space-y-2">
                {scopedAlerts.slice(0, 3).map(alert => {
                  const isCrit = alert.severity === 'critical';
                  return (
                    <div
                      key={alert.id}
                      className={clsx(
                        'p-2.5 rounded-xl border flex flex-col justify-between transition-all hover:shadow-xs',
                        isCrit ? 'bg-rose-50/50 border-rose-200/90' : 'bg-amber-50/50 border-amber-200/90'
                      )}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className={clsx(
                            'text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md border',
                            isCrit ? 'bg-rose-100 text-[#DC2626] border-rose-300' : 'bg-amber-100 text-[#D97706] border-amber-300'
                          )}>
                            {alert.title}
                          </span>
                          <span className="text-xs font-bold text-[#0F172A] truncate max-w-[170px]">{alert.projectName}</span>
                        </div>
                        <p className="text-xs text-[#1E293B] font-semibold leading-snug line-clamp-1 mb-1.5">
                          {alert.detail}
                        </p>
                      </div>

                      <div className="pt-1.5 mt-0.5 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                        <span className="text-[#64748B]">
                          Responsible: <strong className="text-[#0F172A]">{alert.owner}</strong>
                        </span>
                        <button
                          onClick={() => {
                            if (alert.type === 'nc') {
                              setTab('nc');
                              selectNC(alert.ncId ?? null);
                            } else if (alert.type === 'contractor') {
                              setTab('contractors');
                              selectContractor(alert.contractorId ?? null);
                            } else {
                              selectProject(alert.projectId);
                            }
                          }}
                          className="text-xs font-bold text-[#315EFB] hover:underline inline-flex items-center gap-1"
                        >
                          <span>Investigate Issue</span>
                          <ArrowRight size={11} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Project Health & Schedule (Arc Gauge Infographic) */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 sm:p-4.5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <Building2 size={18} className="text-[#0F172A]" />
              <h2 className="text-base font-extrabold text-[#0F172A] tracking-tight">Project Health & Schedule</h2>
            </div>
            <span className="text-xs font-bold text-[#0F172A] bg-slate-100 border border-slate-200/80 px-2.5 py-0.5 rounded-full">
              {healthCounts.total} Total Sites
            </span>
          </div>

          {/* 180° Semi-Circular Arc Gauge */}
          <div className="relative flex flex-col items-center justify-center my-auto py-1">
            <svg className="w-52 h-26 overflow-visible" viewBox="0 0 220 120">
              {/* Soft light sage/neutral background track */}
              <path
                d="M 30,105 A 80,80 0 0,1 190,105"
                fill="none"
                stroke="#E8ECE9"
                strokeWidth="18"
                strokeLinecap="round"
              />
              {/* Forest Emerald active arc: On Track */}
              {healthCounts.onTrack > 0 && (
                <path
                  d="M 30,105 A 80,80 0 0,1 190,105"
                  fill="none"
                  stroke="#156B50"
                  strokeWidth="18"
                  strokeLinecap="butt"
                  strokeDasharray={`${Math.max(0, (healthCounts.onTrack / (healthCounts.total || 1)) * 251.33 - 3)} 251.33`}
                  strokeDashoffset="0"
                />
              )}
              {/* Warm Amber active arc: At Risk */}
              {healthCounts.atRisk > 0 && (
                <path
                  d="M 30,105 A 80,80 0 0,1 190,105"
                  fill="none"
                  stroke="#D97706"
                  strokeWidth="18"
                  strokeLinecap="butt"
                  strokeDasharray={`${Math.max(0, (healthCounts.atRisk / (healthCounts.total || 1)) * 251.33 - 3)} 251.33`}
                  strokeDashoffset={`-${(healthCounts.onTrack / (healthCounts.total || 1)) * 251.33}`}
                />
              )}
              {/* Deep Crimson active arc: Critical */}
              {healthCounts.critical > 0 && (
                <path
                  d="M 30,105 A 80,80 0 0,1 190,105"
                  fill="none"
                  stroke="#9F1239"
                  strokeWidth="18"
                  strokeLinecap="butt"
                  strokeDasharray={`${Math.max(0, (healthCounts.critical / (healthCounts.total || 1)) * 251.33 - 3)} 251.33`}
                  strokeDashoffset={`-${((healthCounts.onTrack + healthCounts.atRisk) / (healthCounts.total || 1)) * 251.33}`}
                />
              )}
            </svg>

            {/* Center Callout inside the arc */}
            <div className="text-center -mt-8">
              <span className="text-3xl font-black text-[#0F172A] tracking-tight leading-none block">{healthCounts.total}</span>
              <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block mt-0.5">Total Projects</span>
              <div className="mt-1 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-[11px] font-bold shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-[#156B50]" />
                <span>{onTimeCount} of {healthCounts.total} On Time ({onTimePercentage}%)</span>
              </div>
            </div>
          </div>

          {/* Executive Status Cards */}
          <div className="grid grid-cols-3 gap-2.5 pt-2.5 border-t border-[#F1F5F9] mt-1.5">
            <div className="bg-emerald-50/70 border border-emerald-200/70 rounded-xl p-2 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#156B50]" />
                <span className="text-[10px] font-bold text-emerald-900 uppercase tracking-wider">On Track</span>
              </div>
              <span className="text-xl font-black text-[#156B50] leading-none block">{healthCounts.onTrack}</span>
              <span className="text-[10px] font-semibold text-emerald-700/90 mt-0.5 block">Within SLA</span>
            </div>

            <div className="bg-amber-50/70 border border-amber-200/70 rounded-xl p-2 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]" />
                <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider">At Risk</span>
              </div>
              <span className="text-xl font-black text-[#D97706] leading-none block">{healthCounts.atRisk}</span>
              <span className="text-[10px] font-semibold text-amber-700/90 mt-0.5 block">Threshold</span>
            </div>

            <div className="bg-rose-50/70 border border-rose-200/70 rounded-xl p-2.5 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#9F1239]" />
                <span className="text-[10px] font-bold text-rose-900 uppercase tracking-wider">Critical</span>
              </div>
              <span className="text-xl font-black text-[#9F1239] leading-none block">{healthCounts.critical}</span>
              <span className="text-[10px] font-semibold text-rose-700/90 mt-0.5 block">Action Req</span>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================
          3. PROJECT PORTFOLIO TABLE — THE FULL REPOSITORY
          ============================================================ */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div>
            <h2 className="text-base font-extrabold text-[#0F172A] tracking-tight">Project Portfolio</h2>
            <p className="text-xs text-[#64748B] mt-0.5">
              Ranked with weakest projects first. Click any row to inspect drivers, or click specific NC/WIR counts.
            </p>
          </div>

          {/* Quick Sort Options */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#94A3B8] font-medium hidden sm:inline">Sort:</span>
            {[
              { key: 'qualityScore', label: 'Worst Score First' },
              { key: 'openNCs', label: 'Open NCs' },
              { key: 'wirPassRate', label: 'Pass Rate' },
              { key: 'progress', label: 'Progress' },
            ].map(s => (
              <button
                key={s.key}
                onClick={() => handleSort(s.key)}
                className={clsx(
                  'px-2.5 py-1 rounded-xl text-xs font-semibold transition-colors',
                  sortKey === s.key
                    ? 'bg-[#18181B] text-white shadow-xs'
                    : 'bg-slate-100/70 text-[#475569] hover:bg-slate-200/70'
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Clean, Scan-First Project Table — Row BG Tinted by Health, Focus on Progress & Audit */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] border-separate border-spacing-y-2.5">
            <thead>
              <tr className="border-b border-[#E2E8F0] text-[#64748B]">
                <SortableTh label="Project & Location" sortKey="name" currentSort={{ key: sortKey, dir: sortDir }} onSort={handleSort} className="pl-4" />
                <SortableTh label="Construction Progress" sortKey="progress" currentSort={{ key: sortKey, dir: sortDir }} onSort={handleSort} />
                <th className="text-left text-[11px] font-bold uppercase tracking-wider px-3 py-2.5">Audit & Quality Finding</th>
                <SortableTh label="Quality Score" sortKey="qualityScore" currentSort={{ key: sortKey, dir: sortDir }} onSort={handleSort} />
                <SortableTh label="WIR 1st-Pass" sortKey="wirPassRate" currentSort={{ key: sortKey, dir: sortDir }} onSort={handleSort} />
                <SortableTh label="Open NCs" sortKey="openNCs" currentSort={{ key: sortKey, dir: sortDir }} onSort={handleSort} />
                <th className="text-left text-[11px] font-bold uppercase tracking-wider px-3 py-2.5">Leadership</th>
                <th className="text-right text-[11px] font-bold uppercase tracking-wider px-4 py-2.5">Action</th>
              </tr>
            </thead>
            <tbody>
              {sortedProjects.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <EmptyState message={`No projects found for ${selectedCity}.`} />
                  </td>
                </tr>
              ) : (
                sortedProjects.map(m => {
                  const p = m.project;
                  const isCrit = m.healthCategory === 'Critical';
                  const isRisk = m.healthCategory === 'At Risk';
                  
                  // Row background tinted directly according to project health
                  const rowClass = isCrit
                    ? 'bg-[#FFF1F2] hover:bg-[#FFE4E6] border-l-[5px] border-l-[#EF4444]'
                    : isRisk
                    ? 'bg-[#FFFBEB] hover:bg-[#FEF3C7] border-l-[5px] border-l-[#F59E0B]'
                    : 'bg-[#F0FDF4]/70 hover:bg-[#DCFCE7]/80 border-l-[5px] border-l-[#10B981]';

                  // Realistic audit status note matching project info
                  const auditSignal = p.id === 'P004'
                    ? { label: 'CRITICAL AUDIT REJECT', text: 'Cube Strength Failed (24.8 MPa vs 30 MPa M30) · Honeycombing', alert: true }
                    : p.id === 'P001'
                    ? { label: 'AUDIT NON-COMPLIANCE', text: 'Stirrup Spacing 250mm > 150mm Spec · 4 Open NCs', alert: false }
                    : p.id === 'P003'
                    ? { label: 'AUDIT DEVIATION', text: 'Pile Bore Diameter 495mm vs 550mm Spec · 2 Overdue WIRs', alert: false }
                    : p.id === 'P006'
                    ? { label: 'AUDIT CONFINEMENT FLAG', text: 'Missing Column Head Ties at L3 · Formwork Signoff Pending', alert: false }
                    : p.id === 'P002'
                    ? { label: 'AUDIT PASSED', text: 'Pre-Handover Snagging Verified · 0 Critical Open NCs', alert: false }
                    : { label: 'AUDIT PASSED', text: 'Facade & Waterproofing Signed Off · 89% First-Pass', alert: false };

                  return (
                    <tr
                      key={p.id}
                      onClick={() => selectProject(p.id)}
                      className={clsx(
                        'transition-all cursor-pointer group rounded-xl shadow-2xs border-y border-r border-[#E2E8F0]/70',
                        rowClass
                      )}
                    >
                      {/* Project & Location */}
                      <td className="px-4 py-3.5 rounded-l-xl">
                        <div>
                          <span className="text-sm font-extrabold text-[#0F172A] block">
                            {p.name}
                          </span>
                          <div className="text-[11px] text-[#475569] font-medium mt-0.5">
                            {p.city} · {p.towers.length} Towers · <strong className="text-[#0F172A]">{p.stage} Stage</strong>
                          </div>
                        </div>
                      </td>

                      {/* Construction Progress (Prominent Focus) */}
                      <td className="px-3 py-3.5">
                        <div className="w-32 space-y-1.5">
                          <div className="flex justify-between items-baseline text-xs">
                            <span className="font-extrabold text-[#0F172A] text-sm">{p.progressPercentage}%</span>
                            <span className="text-[10px] text-[#64748B] font-semibold">{p.stage}</span>
                          </div>
                          <div className="h-2 bg-black/[0.08] rounded-full overflow-hidden">
                            <div
                              className={clsx(
                                'h-full rounded-full transition-all duration-300',
                                isCrit ? 'bg-[#EF4444]' : isRisk ? 'bg-[#F59E0B]' : 'bg-[#10B981]'
                              )}
                              style={{ width: `${p.progressPercentage}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-[#64748B] block font-medium">Target: {p.targetCompletion}</span>
                        </div>
                      </td>

                      {/* Audit & Quality Finding (Prominent Focus) */}
                      <td className="px-3 py-3.5 max-w-[280px]">
                        <div>
                          <span className="text-[10px] font-extrabold tracking-wider uppercase block mb-0.5 text-[#475569]">
                            {auditSignal.label}
                          </span>
                          <p className="text-xs text-[#0F172A] font-semibold leading-snug line-clamp-2">
                            {auditSignal.text}
                          </p>
                        </div>
                      </td>

                      {/* Quality Score */}
                      <td className="px-3 py-3.5" onClick={(e) => { e.stopPropagation(); setFilter('project', p.id); setTab('quality'); }}>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-lg font-extrabold tracking-tight text-[#0F172A]">
                            {m.qualityScore}
                          </span>
                          <span className="text-[11px] text-[#64748B] font-medium">/100</span>
                          {m.scoreDelta !== null && (
                            <span className="text-[11px] font-bold ml-0.5 text-[#64748B]">
                              {m.scoreDelta > 0 ? '+' : ''}{m.scoreDelta}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* WIR 1st-Pass */}
                      <td className="px-3 py-3.5" onClick={(e) => { e.stopPropagation(); setFilter('project', p.id); setTab('wir'); }}>
                        <div className="text-xs">
                          <span className="font-extrabold block text-[#0F172A]">
                            {m.wirPassRate}% pass
                          </span>
                          <span className="text-[11px] font-medium mt-0.5 block text-[#64748B]">
                            {m.overdueWIRs > 0 ? `${m.overdueWIRs} overdue` : '0 overdue'}
                          </span>
                        </div>
                      </td>

                      {/* Open Non-Compliance */}
                      <td className="px-3 py-3.5" onClick={(e) => { e.stopPropagation(); setFilter('project', p.id); setTab('nc'); }}>
                        <div className="text-xs">
                          <span className="font-extrabold text-[#0F172A] block">{m.openNCs} open</span>
                          <span className="text-[11px] font-medium mt-0.5 block text-[#64748B]">
                            {m.criticalOpenNCs > 0 ? `${m.criticalOpenNCs} critical` : '0 critical'}
                          </span>
                        </div>
                      </td>

                      {/* Leadership */}
                      <td className="px-3 py-3.5 text-xs text-[#475569]">
                        <span className="font-bold text-[#0F172A] block">{p.projectManager}</span>
                        <span className="text-[10px] text-[#64748B] block">Lead: {p.qualityLead}</span>
                      </td>

                      {/* Action */}
                      <td className="px-4 py-3.5 text-right rounded-r-xl">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            selectProject(p.id);
                          }}
                          className="text-xs font-bold text-[#0F172A] hover:text-white bg-white hover:bg-[#18181B] border border-[#CBD5E1] px-3.5 py-1.5 rounded-xl transition-all inline-flex items-center gap-1 shadow-2xs"
                        >
                          <span>Inspect</span>
                          <ChevronRight size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
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
