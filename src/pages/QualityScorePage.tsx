// ============================================================
// PAGE 4 — AUDIT & QUALITY ASSURANCE
// Central Executive Assurance Layer:
// - Deterministic quality score derivation
// - Configurable scoring weights
// - 6-month historical compliance progression
// - Comprehensive Audit Register (Internal QA & Third-party: Bureau Veritas, TÜV, SGS)
// ============================================================

import React, { useState, useMemo } from 'react';
import {
  Award, Shield, SlidersHorizontal, ArrowLeftRight, Check,
  LineChart as LineChartIcon, Info, ExternalLink, Calendar,
  ChevronRight, Building2, User, Search, Filter, AlertTriangle,
  CheckCircle2, ShieldCheck, Clock
} from 'lucide-react';
import clsx from 'clsx';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { useApp } from '../store/appStore';
import {
  calcQualityScore, getRAGStatus, getHistoricalScoresForProjects,
  getAllProjectMetrics,
} from '../data/calculations';
import {
  PROJECTS, AUDIT_RECORDS, type Audit, type ScoreWeights, DEFAULT_WEIGHTS,
} from '../data/seedData';

const CHART_COLORS: Record<string, string> = {
  'Meridian Heights': '#00594F',
  'Northgate Residences': '#16805D',
  'Cedar Park': '#B7791F',
  'Riverstone Towers': '#DC2626',
  'Harbour Point': '#0D9488',
  'Summit Greens': '#4F46E5',
  'Vivanta Sereno': '#D97706',
};

export function QualityScorePage() {
  const { state, setWeightsModalOpen, selectProject, selectAudit } = useApp();

  const [auditTypeFilter, setAuditTypeFilter] = useState<'All' | 'Internal' | 'External'>('All');
  const [auditSearch, setAuditSearch] = useState('');
  const [trendProjects, setTrendProjects] = useState(['P004', 'P001', 'P002', 'P005', 'P007']);

  // All projects quality metrics
  const allMetrics = useMemo(
    () => getAllProjectMetrics(state.weights, state.wirs, state.ncs),
    [state.weights, state.wirs, state.ncs]
  );

  // Average quality score
  const avgScore = useMemo(() => {
    return Math.round(allMetrics.reduce((acc, m) => acc + m.qualityScore, 0) / allMetrics.length);
  }, [allMetrics]);

  // Average WIR pass rate
  const avgWIRPass = useMemo(() => {
    return Math.round(allMetrics.reduce((acc, m) => acc + m.wirPassRate, 0) / allMetrics.length);
  }, [allMetrics]);

  // Average NC health
  const avgNCHealth = useMemo(() => {
    return Math.round(allMetrics.reduce((acc, m) => acc + m.breakdown.ncComponent, 0) / allMetrics.length);
  }, [allMetrics]);

  // Historical trend data
  const trendData = useMemo(() => getHistoricalScoresForProjects(trendProjects), [trendProjects]);

  // Audit Register Filtered
  const filteredAudits = useMemo(() => {
    return AUDIT_RECORDS.filter(a => {
      if (auditTypeFilter !== 'All' && a.type !== auditTypeFilter) return false;
      if (auditSearch.trim()) {
        const q = auditSearch.toLowerCase();
        const proj = PROJECTS.find(p => p.id === a.projectId);
        if (!a.id.toLowerCase().includes(q) &&
            !a.auditor.toLowerCase().includes(q) &&
            !proj?.name.toLowerCase().includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [auditTypeFilter, auditSearch]);

  const completedAudits = AUDIT_RECORDS.filter(a => a.status === 'Completed');
  const scheduledAudits = AUDIT_RECORDS.filter(a => a.status === 'Scheduled');
  const totalFindings = completedAudits.reduce((acc, a) => acc + a.findingsRaised, 0);
  const openCAs = completedAudits.reduce((acc, a) => acc + a.outstandingCAs, 0);

  return (
    <div className="space-y-4 pb-12">
      {/* ============================================================
          PAGE HEADER & ACTIONS
          ============================================================ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5E7EB]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#17191D]">
              Audit & Quality Assurance
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#E6F4F1] text-[#00594F] border border-[#B3E0D8]">
              Assurance Layer
            </span>
          </div>
          <p className="text-xs text-[#737B88] mt-0.5">
            Transparent composite quality scoring derived deterministically from WIR pass rates, defect severity penalties & external audits.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setWeightsModalOpen(true)}
            className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-[#E5E7EB] bg-white hover:bg-slate-50 text-xs font-semibold text-[#17191D] transition-colors shadow-2xs"
          >
            <SlidersHorizontal size={13} className="text-[#00594F]" />
            <span>Configure Weights ({state.weights.wirPassRate}% / {state.weights.ncHealth}% / {state.weights.auditScore}%)</span>
          </button>
        </div>
      </div>

      {/* ============================================================
          TOP 6 QUALITY & AUDIT KPI METRIC CARDS
          ============================================================ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-3.5 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#737B88] block mb-1">
            Portfolio Quality Score
          </span>
          <div className="flex items-baseline gap-1">
            <span className={clsx(
              'text-2xl font-black tabular-nums tracking-tight',
              avgScore >= 80 ? 'text-[#16805D]' : avgScore >= 60 ? 'text-[#B7791F]' : 'text-[#C63F43]'
            )}>
              {avgScore}
            </span>
            <span className="text-xs text-[#737B88]">/100</span>
          </div>
          <p className="text-[10px] text-[#16805D] mt-0.5 font-semibold">
            Composite index
          </p>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-xl p-3.5 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#737B88] block mb-1">
            WIR 1st-Pass ({state.weights.wirPassRate}%)
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-[#00594F] tabular-nums tracking-tight">
              {avgWIRPass}%
            </span>
          </div>
          <p className="text-[10px] text-[#737B88] mt-0.5 font-medium">
            First-time signoff
          </p>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-xl p-3.5 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#737B88] block mb-1">
            NC Health ({state.weights.ncHealth}%)
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-[#17191D] tabular-nums tracking-tight">
              {avgNCHealth}
            </span>
            <span className="text-xs text-[#737B88]">/100</span>
          </div>
          <p className="text-[10px] text-[#737B88] mt-0.5 font-medium">
            Defect penalty score
          </p>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-xl p-3.5 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#737B88] block mb-1">
            Audits Completed
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-[#16805D] tabular-nums tracking-tight">
              {completedAudits.length}
            </span>
            <span className="text-xs text-[#737B88]">of {AUDIT_RECORDS.length}</span>
          </div>
          <p className="text-[10px] text-[#737B88] mt-0.5 font-medium">
            {scheduledAudits.length} Scheduled
          </p>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-xl p-3.5 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#737B88] block mb-1">
            Total Findings Raised
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-[#17191D] tabular-nums tracking-tight">
              {totalFindings}
            </span>
          </div>
          <p className="text-[10px] text-[#737B88] mt-0.5 font-medium">
            Internal & External
          </p>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-xl p-3.5 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#737B88] block mb-1">
            Outstanding CAs
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-[#C63F43] tabular-nums tracking-tight">
              {openCAs}
            </span>
          </div>
          <p className="text-[10px] text-[#C63F43] mt-0.5 font-semibold">
            Action plans pending
          </p>
        </div>
      </div>

      {/* ============================================================
          TRANSPARENT METHODOLOGY BANNER
          ============================================================ */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#E6F4F1] text-[#00594F] flex items-center justify-center flex-shrink-0 mt-0.5">
            <ShieldCheck size={16} />
          </div>
          <div className="text-xs">
            <p className="font-bold text-[#17191D]">
              Deterministic Quality Formula & Certification Integrity
            </p>
            <p className="text-[#737B88] mt-0.5 leading-relaxed">
              Calculated out of 100: <strong className="text-[#17191D]">{state.weights.wirPassRate}% WIR Pass Rate</strong> + <strong className="text-[#17191D]">{state.weights.ncHealth}% NC Resolution Health</strong> (deductions for critical severity & overdue weeks) + <strong className="text-[#17191D]">{state.weights.auditScore}% Latest Certified Audit Score</strong> (normalised). Never uses manual arbitrary ratings.
            </p>
          </div>
        </div>

        <button
          onClick={() => setWeightsModalOpen(true)}
          className="px-3.5 py-1.5 bg-[#17191D] hover:bg-black text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap self-start md:self-center shadow-2xs"
        >
          Adjust Scoring Weights
        </button>
      </div>

      {/* ============================================================
          TWO-COLUMN SECTION: PROJECT SCORE MATRIX & 6-MONTH TREND
          ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* LEFT: Project Quality Breakdown Matrix (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-[#E5E7EB] rounded-xl shadow-2xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="px-5 py-3.5 border-b border-[#F1F5F9] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#17191D]">
                  Project Quality Score Breakdown
                </h3>
                <p className="text-xs text-[#737B88]">
                  Component contributions across all portfolio projects
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#F1F5F9] bg-[#FAFBFB] text-[#737B88] font-semibold">
                    <th className="py-2.5 px-4">Project</th>
                    <th className="py-2.5 px-3">Score</th>
                    <th className="py-2.5 px-3">WIR Component</th>
                    <th className="py-2.5 px-3">NC Health</th>
                    <th className="py-2.5 px-3">Latest Audit</th>
                    <th className="py-2.5 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9]">
                  {allMetrics.map(m => {
                    const isCrit = m.ragStatus === 'red';
                    const isRisk = m.ragStatus === 'amber';

                    return (
                      <tr
                        key={m.project.id}
                        onClick={() => selectProject(m.project.id)}
                        className="hover:bg-[#FAFBFB] cursor-pointer transition-colors group"
                      >
                        <td className="py-3 px-4">
                          <span className="font-bold text-[#17191D] group-hover:text-[#00594F] transition-colors">
                            {m.project.name}
                          </span>
                          <p className="text-[11px] text-[#737B88]">{m.project.city}</p>
                        </td>

                        <td className="py-3 px-3">
                          <span className={clsx(
                            'font-bold tabular-nums text-xs',
                            isCrit ? 'text-[#C63F43]' : isRisk ? 'text-[#B7791F]' : 'text-[#16805D]'
                          )}>
                            {m.qualityScore}/100
                          </span>
                          {m.scoreDelta !== null && (
                            <span className={clsx(
                              'text-[10px] ml-1.5 font-medium',
                              m.scoreDelta >= 0 ? 'text-[#16805D]' : 'text-[#C63F43]'
                            )}>
                              {m.scoreDelta > 0 ? `+${m.scoreDelta}` : `${m.scoreDelta}`}
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1.5 tabular-nums">
                            <span className="font-semibold text-[#17191D]">{m.wirPassRate}%</span>
                            <div className="w-12 h-1 bg-[#F1F5F9] rounded-full overflow-hidden">
                              <div className="h-full bg-[#00594F] rounded-full" style={{ width: `${m.wirPassRate}%` }} />
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <span className="font-semibold tabular-nums text-[#17191D]">
                            {m.breakdown.ncComponent}/100
                          </span>
                        </td>

                        <td className="py-3 px-3">
                          {m.breakdown.auditComponent !== null ? (
                            <span className="font-semibold tabular-nums text-[#17191D]">
                              {m.breakdown.auditComponent}%
                            </span>
                          ) : (
                            <span className="text-[#B7791F] font-medium text-[11px]">Audit Pending</span>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <span className="flex items-center gap-1.5 font-semibold text-xs">
                            <span className={clsx(
                              'w-2 h-2 rounded-full',
                              isCrit ? 'bg-[#DC2626]' : isRisk ? 'bg-[#D97706]' : 'bg-[#16805D]'
                            )} />
                            <span className={clsx(
                              isCrit ? 'text-[#C63F43]' : isRisk ? 'text-[#B7791F]' : 'text-[#16805D]'
                            )}>
                              {isCrit ? 'Critical Risk' : isRisk ? 'At Risk' : 'Healthy'}
                            </span>
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT: 6-Month Quality Score Progression (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-[#E5E7EB] rounded-xl p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
              <div>
                <h3 className="text-sm font-bold text-[#17191D]">
                  6-Month Quality Trend
                </h3>
                <p className="text-xs text-[#737B88] mt-0.5">
                  Historical progression illustrating risk deterioration or recovery
                </p>
              </div>
            </div>

            {/* Project Filter Pills */}
            <div className="flex items-center gap-1.5 flex-wrap my-3">
              {PROJECTS.map(p => {
                const active = trendProjects.includes(p.id);
                const color = CHART_COLORS[p.name] ?? '#00594F';
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
                      'flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold border transition-all',
                      active
                        ? 'bg-[#17191D] text-white border-[#17191D]'
                        : 'bg-white text-[#737B88] border-[#E5E7EB] hover:bg-slate-50'
                    )}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                    <span>{p.name.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>

            {/* Line Chart */}
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748B' }} />
                  <YAxis domain={[30, 100]} tick={{ fontSize: 10, fill: '#64748B' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#E2E8F0',
                      borderRadius: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                      fontSize: '11px',
                    }}
                  />
                  {trendProjects.map(pid => {
                    const proj = PROJECTS.find(p => p.id === pid);
                    if (!proj) return null;
                    const color = CHART_COLORS[proj.name] ?? '#00594F';
                    return (
                      <Line
                        key={pid}
                        type="monotone"
                        dataKey={proj.name}
                        stroke={color}
                        strokeWidth={2}
                        dot={{ r: 2.5, fill: color }}
                        activeDot={{ r: 4 }}
                      />
                    );
                  })}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="text-[11px] text-[#737B88] pt-3 border-t border-[#F1F5F9]">
            Notice Riverstone's score drop from 70 to 42 following Floor 05 cube test failures.
          </div>
        </div>
      </div>

      {/* ============================================================
          FULL AUDIT ASSURANCE REGISTER
          Internal & Third-Party (Bureau Veritas, TÜV, SGS India)
          ============================================================ */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-2xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#F1F5F9] flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-[#17191D]">
              Certified Audit Register ({filteredAudits.length} Records)
            </h3>
            <p className="text-xs text-[#737B88]">
              Internal QA inspections and independent certification audits. Click any record to inspect findings.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                value={auditSearch}
                onChange={e => setAuditSearch(e.target.value)}
                placeholder="Search audits, agency or project…"
                className="h-8 pl-7 pr-3 text-xs bg-white border border-[#E5E7EB] rounded-lg outline-none text-[#17191D] w-48"
              />
            </div>

            <div className="flex border border-[#E5E7EB] rounded-lg overflow-hidden bg-white">
              {(['All', 'Internal', 'External'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setAuditTypeFilter(t)}
                  className={clsx(
                    'px-3 py-1 text-xs font-semibold transition-colors',
                    auditTypeFilter === t ? 'bg-[#17191D] text-white' : 'text-[#737B88] hover:bg-slate-50'
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[850px]">
            <thead>
              <tr className="border-b border-[#F1F5F9] bg-[#FAFBFB] text-[#737B88] font-semibold">
                <th className="py-2.5 px-5">Audit ID & Type</th>
                <th className="py-2.5 px-3">Project & Location</th>
                <th className="py-2.5 px-3">Auditing Agency</th>
                <th className="py-2.5 px-3">Audit Date</th>
                <th className="py-2.5 px-3">Percentage Score</th>
                <th className="py-2.5 px-3">Findings</th>
                <th className="py-2.5 px-3">Open CAs</th>
                <th className="py-2.5 px-5">Status</th>
                <th className="py-2.5 px-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {filteredAudits.map(audit => {
                const proj = PROJECTS.find(p => p.id === audit.projectId);
                return (
                  <tr
                    key={audit.id}
                    onClick={() => selectAudit(audit.id)}
                    className="hover:bg-[#FAFBFB] cursor-pointer transition-colors group"
                  >
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#17191D] group-hover:text-[#00594F]">
                          {audit.id}
                        </span>
                        <span className={clsx(
                          'text-[10px] font-semibold px-1.5 py-0.5 rounded',
                          audit.type === 'External' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                        )}>
                          {audit.type}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span className="font-bold text-[#17191D]">{proj?.name}</span>
                      <p className="text-[11px] text-[#737B88]">{proj?.city}</p>
                    </td>

                    <td className="py-3 px-3 font-medium text-[#17191D]">
                      {audit.auditor}
                    </td>

                    <td className="py-3 px-3 text-[#737B88] tabular-nums">
                      {audit.auditDate}
                    </td>

                    <td className="py-3 px-3">
                      {audit.status === 'Completed' ? (
                        <div className="flex items-baseline gap-1.5">
                          <span className={clsx(
                            'font-bold tabular-nums',
                            audit.percentageScore >= 80 ? 'text-[#16805D]' : audit.percentageScore >= 60 ? 'text-[#B7791F]' : 'text-[#C63F43]'
                          )}>
                            {audit.percentageScore}/100
                          </span>
                          <span className="text-[10px] text-[#737B88]">({audit.rating.toFixed(1)}★)</span>
                        </div>
                      ) : (
                        <span className="text-[#737B88] italic">Scheduled</span>
                      )}
                    </td>

                    <td className="py-3 px-3 tabular-nums font-medium text-[#17191D]">
                      {audit.findingsRaised}
                    </td>

                    <td className="py-3 px-3 tabular-nums font-bold">
                      <span className={audit.outstandingCAs > 0 ? 'text-[#C63F43]' : 'text-[#16805D]'}>
                        {audit.outstandingCAs}
                      </span>
                    </td>

                    <td className="py-3 px-5">
                      <span className="flex items-center gap-1.5 font-bold text-xs">
                        <span className={clsx(
                          'w-2 h-2 rounded-full',
                          audit.status === 'Completed' ? 'bg-[#16805D]' : 'bg-[#D97706]'
                        )} />
                        <span className={audit.status === 'Completed' ? 'text-[#16805D]' : 'text-[#B7791F]'}>
                          {audit.status}
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
    </div>
  );
}
