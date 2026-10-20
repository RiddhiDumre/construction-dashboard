// ============================================================
// PAGE 4 — AUDIT & QUALITY (Quality Score & Audit Assurance)
// Integrates Quality Score Calculation & Full Audit Register
// ============================================================

import React, { useState, useMemo } from 'react';
import {
  Award, Shield, SlidersHorizontal, ArrowLeftRight, Check,
  LineChart as LineChartIcon, Info, ExternalLink, Calendar,
  ChevronRight, Building2, User, Search, Filter, AlertTriangle
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
  'Meridian Heights': '#315EFB',
  'Northgate Residences': '#16805D',
  'Cedar Park': '#B7791F',
  'Riverstone Towers': '#C63F43',
  'Harbour Point': '#7C3AED',
  'Summit Greens': '#0891B2',
  'Vivanta Sereno': '#D97706',
};

export function QualityScorePage() {
  const { state, setWeightsModalOpen, selectProject, selectAudit } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'audits'>('overview');
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
  const totalFindings = completedAudits.reduce((acc, a) => acc + a.findingsRaised, 0);
  const openCAs = completedAudits.reduce((acc, a) => acc + a.outstandingCAs, 0);

  return (
    <div className="space-y-6">
      {/* ============================================================
          PAGE HEADER
          ============================================================ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#E5E7EB]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#20252D]">
              Audit & Quality
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-purple-100 text-purple-900 border border-purple-200">
              Assurance Layer
            </span>
          </div>
          <p className="text-xs text-[#697586] mt-0.5">
            Transparent quality index derivation from WIR first-pass, NC health & third-party audits.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setWeightsModalOpen(true)}
            className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-[#E5E7EB] bg-white hover:bg-slate-50 text-xs font-bold text-[#20252D] transition-colors shadow-2xs"
          >
            <SlidersHorizontal size={13} className="text-blue-600" />
            <span>Configure Weights ({state.weights.wirPassRate}% / {state.weights.ncHealth}% / {state.weights.auditScore}%)</span>
          </button>
        </div>
      </div>

      {/* ============================================================
          QUALITY & AUDIT SUMMARY KPI CARDS (6 Cards)
          ============================================================ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-3.5 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#697586] block mb-1">
            Portfolio Quality Score
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-black text-[#20252D]">{avgScore}</span>
            <span className="text-xs text-slate-400">/ 100</span>
          </div>
          <p className="text-[11px] text-[#16805D] mt-0.5 font-semibold">
            Composite index
          </p>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-xl p-3.5 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#697586] block mb-1">
            WIR Pass Rate ({state.weights.wirPassRate}%)
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-black text-blue-600">{avgWIRPass}%</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            First-time signoff
          </p>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-xl p-3.5 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#697586] block mb-1">
            NC Health ({state.weights.ncHealth}%)
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-black text-amber-600">{avgNCHealth}</span>
            <span className="text-xs text-slate-400">/ 100</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Defect penalty score
          </p>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-xl p-3.5 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#697586] block mb-1">
            Audits Completed
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-black text-[#16805D]">{completedAudits.length}</span>
            <span className="text-xs text-slate-400">of {AUDIT_RECORDS.length}</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            1 Scheduled
          </p>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-xl p-3.5 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#697586] block mb-1">
            Total Audit Findings
          </span>
          <span className="text-xl font-black text-[#20252D]">{totalFindings}</span>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Internal & External
          </p>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-xl p-3.5 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#697586] block mb-1">
            Outstanding CAs
          </span>
          <span className="text-xl font-black text-[#C63F43]">{openCAs}</span>
          <p className="text-[11px] text-[#C63F43] mt-0.5 font-semibold">
            Action plans pending
          </p>
        </div>
      </div>

      {/* ============================================================
          QUALITY SCORE METHODOLOGY EXPLANATION BANNER
          ============================================================ */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Info size={16} />
          </div>
          <div className="text-xs">
            <p className="font-bold text-[#20252D]">
              Quality Score Formula & Deterministic Derivation
            </p>
            <p className="text-[#697586] mt-0.5 leading-relaxed">
              Calculated out of 100: <strong className="text-slate-800">{state.weights.wirPassRate}% WIR Pass Rate</strong> + <strong className="text-slate-800">{state.weights.ncHealth}% NC Resolution Health</strong> (penalties for critical severity & overdue weeks) + <strong className="text-slate-800">{state.weights.auditScore}% Latest Audit Score</strong> (normalised). Never uses manual unexplained ratings.
            </p>
          </div>
        </div>

        <button
          onClick={() => setWeightsModalOpen(true)}
          className="px-3.5 py-1.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-lg transition-colors whitespace-nowrap self-start md:self-center shadow-2xs"
        >
          Adjust Scoring Weights
        </button>
      </div>

      {/* ============================================================
          6-MONTH QUALITY SCORE PROGRESSION CHART
          ============================================================ */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-[#20252D]">
              Quality Score 6-Month Progression
            </h3>
            <p className="text-xs text-[#697586]">
              Historical trend tracking compliance deterioration or recovery across projects
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

      {/* ============================================================
          PROJECT QUALITY COMPARISON TABLE
          ============================================================ */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-2xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#E5E7EB] bg-slate-50/50 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#20252D]">
              Project Quality Score Breakdown
            </h3>
            <p className="text-xs text-[#697586]">
              Detailed component contributions for all portfolio projects
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-slate-50/70 text-[#697586] font-semibold">
                <th className="py-3 px-4">Project & City</th>
                <th className="py-3 px-3">Quality Score</th>
                <th className="py-3 px-3">Prev Period</th>
                <th className="py-3 px-3">Delta</th>
                <th className="py-3 px-3">WIR Component ({state.weights.wirPassRate}%)</th>
                <th className="py-3 px-3">NC Component ({state.weights.ncHealth}%)</th>
                <th className="py-3 px-3">Latest Audit ({state.weights.auditScore}%)</th>
                <th className="py-3 px-4">Data Completeness</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {allMetrics.map(m => (
                <tr
                  key={m.project.id}
                  onClick={() => selectProject(m.project.id)}
                  className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                >
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-[#20252D] group-hover:text-blue-600 transition-colors">
                      {m.project.name}
                    </span>
                    <p className="text-[11px] text-[#697586]">{m.project.city}</p>
                  </td>

                  <td className="py-3.5 px-3">
                    <span className={clsx(
                      'font-black text-xs px-2 py-0.5 rounded-md border',
                      m.ragStatus === 'green' ? 'bg-emerald-50 text-[#16805D] border-emerald-200' :
                      m.ragStatus === 'amber' ? 'bg-amber-50 text-[#B7791F] border-amber-200' :
                      'bg-rose-50 text-[#C63F43] border-rose-200'
                    )}>
                      {m.qualityScore}/100
                    </span>
                  </td>

                  <td className="py-3.5 px-3 text-slate-600 font-mono">
                    {m.prevScore ? `${m.prevScore}/100` : '—'}
                  </td>

                  <td className="py-3.5 px-3 font-semibold">
                    {m.scoreDelta !== null ? (
                      <span className={m.scoreDelta >= 0 ? 'text-[#16805D]' : 'text-[#C63F43]'}>
                        {m.scoreDelta > 0 ? `+${m.scoreDelta}` : `${m.scoreDelta}`} pts
                      </span>
                    ) : '—'}
                  </td>

                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-800">{m.wirPassRate}%</span>
                      <span className="text-[10px] text-slate-400">pass rate</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-800">{m.breakdown.ncComponent}/100</span>
                      <span className="text-[10px] text-slate-400">health</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-3">
                    {m.breakdown.auditComponent !== null ? (
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-800">{m.breakdown.auditComponent}%</span>
                        <span className="text-[10px] text-slate-400">score</span>
                      </div>
                    ) : (
                      <span className="text-amber-600 font-medium text-[11px]">Audit Pending</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      m.breakdown.auditAvailable
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}>
                      {m.breakdown.auditAvailable ? '100% Complete' : 'Renormalised (No Audit)'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============================================================
          AUDIT REGISTER SECTION (Internal & External Audits)
          ============================================================ */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-2xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#E5E7EB] bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-[#20252D]">
              Audit Register ({filteredAudits.length} Audits)
            </h3>
            <p className="text-xs text-[#697586]">
              Internal QA inspections and third-party assessments (Bureau Veritas, SGS, TÜV)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                value={auditSearch}
                onChange={e => setAuditSearch(e.target.value)}
                placeholder="Search audits…"
                className="h-8 pl-7 pr-3 text-xs bg-white border border-[#E5E7EB] rounded-lg outline-none text-[#20252D] w-36 sm:w-44"
              />
            </div>

            <div className="flex border border-[#E5E7EB] rounded-lg overflow-hidden bg-white">
              {(['All', 'Internal', 'External'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setAuditTypeFilter(t)}
                  className={`px-3 py-1 text-xs font-semibold transition-colors ${
                    auditTypeFilter === t ? 'bg-[#20252D] text-white' : 'text-[#697586] hover:bg-slate-50'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-slate-50/70 text-[#697586] font-semibold">
                <th className="py-3 px-4">Audit ID & Type</th>
                <th className="py-3 px-3">Project & Location</th>
                <th className="py-3 px-3">Auditor / Agency</th>
                <th className="py-3 px-3">Audit Date</th>
                <th className="py-3 px-3">Rating Score</th>
                <th className="py-3 px-3">Findings Raised</th>
                <th className="py-3 px-3">Open CAs</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {filteredAudits.map(audit => {
                const proj = PROJECTS.find(p => p.id === audit.projectId);
                return (
                  <tr
                    key={audit.id}
                    onClick={() => selectAudit(audit.id)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900 group-hover:text-blue-600">
                          {audit.id}
                        </span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                          audit.type === 'External' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {audit.type}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span className="font-bold text-slate-800">{proj?.name}</span>
                      <p className="text-[11px] text-slate-500">{proj?.city}</p>
                    </td>

                    <td className="py-3 px-3 font-medium text-slate-700">
                      {audit.auditor}
                    </td>

                    <td className="py-3 px-3 text-slate-600">
                      {audit.auditDate}
                    </td>

                    <td className="py-3 px-3">
                      {audit.status === 'Completed' ? (
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-black text-slate-900">{audit.percentageScore}/100</span>
                          <span className="text-[10px] text-slate-400">({audit.rating.toFixed(1)}★)</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Scheduled</span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-slate-700 font-semibold">
                      {audit.findingsRaised}
                    </td>

                    <td className="py-3 px-3">
                      <span className={`font-bold ${audit.outstandingCAs > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                        {audit.outstandingCAs}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          audit.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {audit.status}
                        </span>
                        <ChevronRight size={13} className="text-slate-300 group-hover:text-slate-600" />
                      </div>
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
