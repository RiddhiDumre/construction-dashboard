// ============================================================
// PAGE 5 — NON-COMPLIANCE (Authoritative View of Quality Defects)
// Answers: What is broken, how serious, how long open, who fixes it?
// Lifecycle: Raised → Assigned → Rectification → Evidence → Verification → Closed
// ============================================================

import React, { useState, useMemo } from 'react';
import {
  AlertTriangle, ShieldAlert, CheckCircle2, Clock, X,
  Search, SlidersHorizontal, Filter, ChevronRight, ArrowRight,
  User, Building2, HardHat, Camera, FileText, Check, AlertCircle,
  FileCheck, Shield
} from 'lucide-react';
import clsx from 'clsx';
import { useApp } from '../store/appStore';
import { getNCSummaryMetrics } from '../data/calculations';
import {
  PROJECTS, CONTRACTORS,
  type NC, type NCStatus, type NCSeverity, type NCCategory,
} from '../data/seedData';

const CATEGORIES: NCCategory[] = [
  'Material Quality',
  'Workmanship / Workforce',
  'Safety',
  'Regulatory / Approvals',
  'Process / Other',
];

const SEVERITIES: NCSeverity[] = ['Critical', 'High', 'Medium', 'Low'];

const STATUSES: NCStatus[] = [
  'Open',
  'Assigned',
  'Rectification',
  'Evidence Submitted',
  'Verification',
  'Closed',
  'Rejected Verification',
];

export function NCPage() {
  const { state, setFilter, selectNC, updateNCStatus, setTab, selectWIR } = useApp();

  const [localSearch, setLocalSearch] = useState(state.filters.search || '');
  const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('All Severities');
  const [selectedStatus, setSelectedStatus] = useState<string>('All Statuses');
  const [selectedProject, setSelectedProject] = useState<string>(state.filters.project || '');
  const [selectedContractor, setSelectedContractor] = useState<string>(state.filters.contractor || '');
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [sortKey, setSortKey] = useState<string>('severity');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc'); // Critical first

  // Action modal for lifecycle transitions
  const [actionModal, setActionModal] = useState<{
    ncId: string;
    newStatus: NCStatus;
    note: string;
    title: string;
    actionLabel: string;
  } | null>(null);

  const { ncs } = state;
  const metrics = useMemo(() => getNCSummaryMetrics(ncs), [ncs]);
  const today = new Date();

  // Filtered NC rows
  const filteredNCs = useMemo(() => {
    return ncs.filter(nc => {
      // Global city filter
      if (state.filters.city && state.filters.city !== 'All locations' && state.filters.city !== 'All Locations') {
        const proj = PROJECTS.find(p => p.id === nc.projectId);
        if (!proj) return false;
        if (state.filters.city.toLowerCase() === 'mumbai') {
          if (proj.city !== 'Mumbai' && proj.city !== 'Navi Mumbai' && proj.city !== 'Thane') return false;
        } else if (proj.city.toLowerCase() !== state.filters.city.toLowerCase()) {
          return false;
        }
      }
      // Project filter
      if (selectedProject && nc.projectId !== selectedProject) return false;
      // Contractor filter
      if (selectedContractor && nc.contractorId !== selectedContractor) return false;
      // Category filter
      if (selectedCategory !== 'All Categories' && nc.category !== selectedCategory) return false;
      // Severity filter
      if (selectedSeverity !== 'All Severities' && nc.severity !== selectedSeverity) return false;
      // Status filter
      if (selectedStatus !== 'All Statuses' && nc.status !== selectedStatus) return false;
      // Overdue filter
      if (overdueOnly && (new Date(nc.dueDate) >= today || nc.status === 'Closed')) return false;
      // Search
      if (localSearch.trim()) {
        const q = localSearch.toLowerCase();
        const proj = PROJECTS.find(p => p.id === nc.projectId);
        const contractor = CONTRACTORS.find(c => c.id === nc.contractorId);
        if (!nc.id.toLowerCase().includes(q) &&
            !nc.finding.toLowerCase().includes(q) &&
            !nc.owner.toLowerCase().includes(q) &&
            !proj?.name.toLowerCase().includes(q) &&
            !contractor?.name.toLowerCase().includes(q)) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      if (sortKey === 'severity') {
        const order = { Critical: 0, High: 1, Medium: 2, Low: 3 };
        return sortDir === 'asc' ? order[a.severity] - order[b.severity] : order[b.severity] - order[a.severity];
      }
      if (sortKey === 'age') {
        return sortDir === 'asc' ? b.age - a.age : a.age - b.age;
      }
      if (sortKey === 'dateRaised') {
        return sortDir === 'asc' ? b.dateRaised.localeCompare(a.dateRaised) : a.dateRaised.localeCompare(b.dateRaised);
      }
      if (sortKey === 'id') {
        return sortDir === 'asc' ? a.id.localeCompare(b.id) : b.id.localeCompare(a.id);
      }
      return 0;
    });
  }, [ncs, state.filters.city, selectedProject, selectedContractor, selectedCategory, selectedSeverity, selectedStatus, overdueOnly, localSearch, sortKey, sortDir, today]);

  // Selected NC for Detail Drawer
  const selectedNC = useMemo(() => {
    return ncs.find(n => n.id === state.selectedNCId) || null;
  }, [ncs, state.selectedNCId]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const handleConfirmAction = () => {
    if (!actionModal) return;
    updateNCStatus(actionModal.ncId, actionModal.newStatus, actionModal.note, 'Quality Lead');
    setActionModal(null);
  };

  return (
    <div className="space-y-6">
      {/* ============================================================
          PAGE HEADER
          ============================================================ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#E5E7EB]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#20252D]">
              Non-Compliance (NC)
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-900 border border-rose-200">
              Defect Oversight
            </span>
          </div>
          <p className="text-xs text-[#697586] mt-0.5">
            Root-cause classification, contractor accountability, and strictly verified closure workflows.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-[#697586]">Closure Rule:</span>
          <span className="font-bold text-[#20252D] bg-white border border-[#E5E7EB] px-2.5 py-1 rounded-lg shadow-2xs">
            Requires Formal QA Verification
          </span>
        </div>
      </div>

      {/* ============================================================
          SECTION A: NC SUMMARY METRICS (5 Cards)
          ============================================================ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-3.5 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#697586] block mb-1">
            Total Open NCs
          </span>
          <span className="text-xl font-black text-[#20252D]">{metrics.totalOpen}</span>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Active across portfolio
          </p>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-xl p-3.5 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#697586] block mb-1">
            Critical & High Severity
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-black text-[#C63F43]">{metrics.criticalHighOpen}</span>
            <span className="text-xs text-rose-600 font-semibold">urgent</span>
          </div>
          <p className="text-[11px] text-[#C63F43] mt-0.5 font-medium">
            Affects structural integrity
          </p>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-xl p-3.5 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#697586] block mb-1">
            Overdue Beyond SLA
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-black text-[#B7791F]">{metrics.overdue}</span>
            <span className="text-xs text-amber-700 font-semibold">past due date</span>
          </div>
          <p className="text-[11px] text-[#B7791F] mt-0.5 font-medium">
            Accumulating score penalty
          </p>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-xl p-3.5 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#697586] block mb-1">
            Avg Days to Close
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-black text-[#20252D]">{metrics.avgDaysToClose}</span>
            <span className="text-xs text-slate-500">days</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            From raised to verified closed
          </p>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-xl p-3.5 shadow-2xs col-span-2 sm:col-span-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#697586] block mb-1">
            Repeat NCs
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-black text-purple-700">{metrics.repeatCount}</span>
            <span className="text-xs text-purple-600 font-semibold">recurring</span>
          </div>
          <p className="text-[11px] text-purple-700 mt-0.5 font-medium">
            Rebar tie spacing & cover laps
          </p>
        </div>
      </div>

      {/* ============================================================
          SECTION B: ROOT-CAUSE CATEGORIES & FILTERS BAR
          ============================================================ */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 shadow-2xs space-y-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#697586] mr-1 hidden sm:inline">
            Category:
          </span>
          <button
            onClick={() => setSelectedCategory('All Categories')}
            className={clsx(
              'px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border',
              selectedCategory === 'All Categories'
                ? 'bg-[#20252D] text-white border-[#20252D] shadow-xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            )}
          >
            All Categories
          </button>
          {CATEGORIES.map(cat => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={clsx(
                  'px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border',
                  active
                    ? 'bg-[#20252D] text-white border-[#20252D] shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                )}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Dropdowns Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-1 border-t border-slate-100">
          <div className="col-span-2 sm:col-span-1">
            <input
              type="text"
              value={localSearch}
              onChange={e => setLocalSearch(e.target.value)}
              placeholder="Search NC ID, finding…"
              className="w-full h-8 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none text-[#20252D]"
            />
          </div>

          <div>
            <select
              value={selectedProject}
              onChange={e => setSelectedProject(e.target.value)}
              className="w-full h-8 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 outline-none"
            >
              <option value="">All Projects</option>
              {PROJECTS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          <div>
            <select
              value={selectedContractor}
              onChange={e => setSelectedContractor(e.target.value)}
              className="w-full h-8 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 outline-none"
            >
              <option value="">All Contractors</option>
              {CONTRACTORS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <select
              value={selectedSeverity}
              onChange={e => setSelectedSeverity(e.target.value)}
              className="w-full h-8 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 outline-none"
            >
              <option value="All Severities">All Severities</option>
              {SEVERITIES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="w-full h-8 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 outline-none"
            >
              <option value="All Statuses">All Statuses</option>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <button
              onClick={() => setOverdueOnly(!overdueOnly)}
              className={`w-full h-8 px-2.5 rounded-lg text-xs font-bold border transition-colors flex items-center justify-center gap-1.5 ${
                overdueOnly
                  ? 'bg-rose-600 text-white border-rose-700 shadow-2xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Clock size={12} />
              <span>{overdueOnly ? 'Overdue Only (ON)' : 'Overdue Only'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================
          SECTION C: NC REGISTER TABLE
          ============================================================ */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-2xs overflow-hidden">
        <div className="px-5 py-3 border-b border-[#E5E7EB] bg-slate-50/50 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700">
            Showing {filteredNCs.length} Non-Compliances (Critical & overdue prioritised)
          </span>
          <span className="text-xs text-slate-400">
            Click any row to open defect photo evidence & verification lifecycle
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-slate-50/70 text-[#697586] font-semibold">
                <th
                  onClick={() => handleSort('id')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-900"
                >
                  NC ID
                </th>
                <th className="py-3 px-3">Project & Location</th>
                <th className="py-3 px-3">Finding Description</th>
                <th className="py-3 px-3">Category</th>
                <th
                  onClick={() => handleSort('severity')}
                  className="py-3 px-3 cursor-pointer hover:text-slate-900"
                >
                  Severity
                </th>
                <th className="py-3 px-3">Contractor</th>
                <th
                  onClick={() => handleSort('age')}
                  className="py-3 px-3 cursor-pointer hover:text-slate-900"
                >
                  Days Open
                </th>
                <th className="py-3 px-3">Due Date</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {filteredNCs.map(nc => {
                const proj = PROJECTS.find(p => p.id === nc.projectId);
                const contractor = CONTRACTORS.find(c => c.id === nc.contractorId);
                const isOverdue = new Date(nc.dueDate) < today && nc.status !== 'Closed';

                return (
                  <tr
                    key={nc.id}
                    onClick={() => selectNC(nc.id)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-slate-900 group-hover:text-blue-600">
                          {nc.id}
                        </span>
                        {nc.isRepeat && (
                          <span className="text-[9px] font-black uppercase px-1 py-0.2 bg-purple-100 text-purple-900 rounded">
                            Repeat
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <span className="font-bold text-slate-900">{proj?.name}</span>
                      <p className="text-[11px] text-slate-500">{nc.tower} · {nc.floor || ''}</p>
                    </td>

                    <td className="py-3.5 px-3 font-medium text-slate-900 max-w-sm">
                      <p className="line-clamp-1">{nc.finding}</p>
                    </td>

                    <td className="py-3.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                        {nc.category}
                      </span>
                    </td>

                    <td className="py-3.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-black ${
                        nc.severity === 'Critical' ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                        nc.severity === 'High' ? 'bg-amber-100 text-amber-800' :
                        nc.severity === 'Medium' ? 'bg-blue-100 text-blue-800' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {nc.severity}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-slate-700">
                      {contractor?.name ?? 'ABC Civil'}
                    </td>

                    <td className="py-3.5 px-3">
                      <span className={`font-bold ${nc.age > 30 ? 'text-rose-600' : 'text-slate-700'}`}>
                        {nc.age}d
                      </span>
                    </td>

                    <td className="py-3.5 px-3">
                      <span className={`text-xs ${isOverdue ? 'text-rose-600 font-bold' : 'text-slate-600'}`}>
                        {nc.dueDate} {isOverdue && '⚠️'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          nc.status === 'Closed' ? 'bg-emerald-100 text-emerald-800' :
                          nc.status === 'Open' ? 'bg-rose-100 text-rose-800' :
                          nc.status === 'Verification' ? 'bg-purple-100 text-purple-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {nc.status}
                        </span>
                        <ChevronRight size={13} className="text-slate-300 group-hover:text-slate-600" />
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredNCs.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No non-compliance records found matching the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============================================================
          SECTION D: NC DETAIL DRAWER
          ============================================================ */}
      {selectedNC && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-200 overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-slate-200 bg-slate-50/60 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="font-mono text-xs font-black text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded shadow-2xs">
                    {selectedNC.id}
                  </span>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    selectedNC.severity === 'Critical' ? 'bg-rose-100 text-rose-800' :
                    selectedNC.severity === 'High' ? 'bg-amber-100 text-amber-800' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {selectedNC.severity} Severity
                  </span>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    selectedNC.status === 'Closed' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {selectedNC.status}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {selectedNC.finding}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Category: <strong className="text-slate-700">{selectedNC.category}</strong> · {PROJECTS.find(p => p.id === selectedNC.projectId)?.name} · {selectedNC.tower}
                </p>
              </div>
              <button
                onClick={() => selectNC(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Site Defect Evidence & Lab Reports */}
              {selectedNC.sitePhoto && (
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                    Original Site Defect Evidence / Lab Test Report
                  </span>
                  <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-100">
                    <img
                      src={selectedNC.sitePhoto.url}
                      alt="Defect Evidence"
                      className="w-full h-52 object-cover"
                    />
                    <div className="p-3 bg-white text-xs">
                      <p className="font-semibold text-slate-900">{selectedNC.sitePhoto.caption}</p>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1 pt-1 border-t border-slate-100">
                        <span>{selectedNC.sitePhoto.locationGPS}</span>
                        <span>{selectedNC.sitePhoto.timestamp}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Specification Grid */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Responsible Trade & Dates
                </h5>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 text-[11px] block">Contractor</span>
                    <p className="font-bold text-slate-900 mt-0.5">
                      {CONTRACTORS.find(c => c.id === selectedNC.contractorId)?.name}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">Responsible QA Inspector</span>
                    <p className="font-bold text-slate-900 mt-0.5">{selectedNC.owner}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">Date Raised</span>
                    <p className="font-bold text-slate-900 mt-0.5">{selectedNC.dateRaised} ({selectedNC.age}d ago)</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">Resolution Due Date</span>
                    <p className={`font-bold mt-0.5 ${new Date(selectedNC.dueDate) < today ? 'text-rose-600' : 'text-slate-900'}`}>
                      {selectedNC.dueDate}
                    </p>
                  </div>
                </div>
              </div>

              {/* Corrective Action Plan */}
              <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Corrective Action Notes
                </h5>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {selectedNC.rectificationNotes || 'Contractor must submit structural engineer-approved method statement and non-destructive rebound hammer / core test results prior to verification.'}
                </p>
              </div>

              {/* Linked WIR */}
              {selectedNC.linkedWIR && (
                <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-600" />
                    <span className="text-blue-900 font-semibold">Originated from Work Inspection Request {selectedNC.linkedWIR}</span>
                  </div>
                  <button
                    onClick={() => {
                      setTab('wir');
                      selectWIR(selectedNC.linkedWIR!);
                    }}
                    className="font-bold text-blue-700 hover:underline flex items-center gap-1"
                  >
                    <span>View WIR</span>
                    <ArrowRight size={12} />
                  </button>
                </div>
              )}

              {/* Workflow Audit Trail */}
              <div className="space-y-2.5">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Resolution Lifecycle Timeline
                </h5>
                <div className="border-l-2 border-slate-200 ml-2.5 pl-4 space-y-3">
                  {selectedNC.history.map((h, i) => (
                    <div key={i} className="relative">
                      <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-slate-400 ring-4 ring-white" />
                      <div className="text-xs">
                        <span className="font-bold text-slate-900">{h.action}</span>
                        <span className="text-slate-400 ml-2">by {h.actor} · {h.date}</span>
                        {h.note && (
                          <p className="text-[11px] text-slate-600 mt-0.5 bg-slate-50 p-2 rounded-lg border border-slate-200">
                            {h.note}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer with Lifecycle Action Buttons */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
              <button
                onClick={() => selectNC(null)}
                className="px-3 py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                {selectedNC.status === 'Open' && (
                  <button
                    onClick={() => setActionModal({
                      ncId: selectedNC.id,
                      newStatus: 'Assigned',
                      note: 'Assigned to site contractor for method statement',
                      title: 'Assign Non-Compliance',
                      actionLabel: 'Assign to Contractor',
                    })}
                    className="px-3.5 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                  >
                    Assign to Contractor
                  </button>
                )}

                {selectedNC.status === 'Assigned' && (
                  <button
                    onClick={() => setActionModal({
                      ncId: selectedNC.id,
                      newStatus: 'Rectification',
                      note: 'Structural method statement approved; remedial grouting started',
                      title: 'Commence Rectification',
                      actionLabel: 'Start Rectification',
                    })}
                    className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                  >
                    Start Rectification
                  </button>
                )}

                {selectedNC.status === 'Rectification' && (
                  <button
                    onClick={() => setActionModal({
                      ncId: selectedNC.id,
                      newStatus: 'Evidence Submitted',
                      note: 'Post-grouting core test report and cube strength certificates uploaded',
                      title: 'Submit Corrective Evidence',
                      actionLabel: 'Submit Evidence',
                    })}
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                  >
                    Submit Evidence
                  </button>
                )}

                {selectedNC.status === 'Evidence Submitted' && (
                  <button
                    onClick={() => setActionModal({
                      ncId: selectedNC.id,
                      newStatus: 'Verification',
                      note: 'QA Inspector conducting physical site inspection of rectified work',
                      title: 'Initiate QA Verification',
                      actionLabel: 'Verify Rectification',
                    })}
                    className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                  >
                    Initiate QA Verification
                  </button>
                )}

                {selectedNC.status === 'Verification' && (
                  <>
                    <button
                      onClick={() => setActionModal({
                        ncId: selectedNC.id,
                        newStatus: 'Rejected Verification',
                        note: 'Re-inspection revealed residual void pocket. Additional micro-concrete grouting required.',
                        title: 'Reject Verification',
                        actionLabel: 'Reject Verification',
                      })}
                      className="px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                    >
                      Reject Verification
                    </button>
                    <button
                      onClick={() => setActionModal({
                        ncId: selectedNC.id,
                        newStatus: 'Closed',
                        note: 'Core compressive strength verified compliant with IS 516 specifications. Defect closed.',
                        title: 'Approve & Close Non-Compliance',
                        actionLabel: 'Close NC',
                      })}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                    >
                      Verify & Close NC
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Dialog */}
      {actionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-5 space-y-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900">{actionModal.title}</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Record official rectification notes and QA confirmation.
              </p>
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Action Notes & Verification Outcome *
              </label>
              <textarea
                rows={3}
                value={actionModal.note}
                onChange={e => setActionModal({ ...actionModal, note: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none text-slate-900"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setActionModal(null)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                className="px-4 py-1.5 text-xs font-bold rounded-xl bg-slate-900 hover:bg-black text-white transition-all shadow-xs"
              >
                {actionModal.actionLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
