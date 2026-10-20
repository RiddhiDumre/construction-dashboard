// ============================================================
// PAGE 3 — WIR: WORK INSPECTION REQUESTS
// Tracks first-time pass rates, pending approvals, and SLA breaches
// ============================================================

import React, { useState, useMemo } from 'react';
import {
  ClipboardCheck, AlertTriangle, CheckCircle2, Clock, X,
  Search, SlidersHorizontal, Filter, ChevronRight, ArrowRight,
  User, Building2, HardHat, Camera, FileText, Check, AlertCircle
} from 'lucide-react';
import clsx from 'clsx';
import { useApp } from '../store/appStore';
import { getWIRSummaryMetrics } from '../data/calculations';
import { PROJECTS, CONTRACTORS, SLA_DAYS, type WIR, type WIRStatus } from '../data/seedData';

const STATUS_OPTIONS: string[] = [
  'All Statuses',
  'Draft',
  'Submitted',
  'Awaiting Review',
  'Rejected',
  'Rectification In Progress',
  'Resubmitted',
  'Approved',
];

const VALID_TRANSITIONS: Record<WIRStatus, WIRStatus[]> = {
  Draft: ['Submitted'],
  Submitted: ['Awaiting Review', 'Approved', 'Rejected'],
  'Awaiting Review': ['Approved', 'Rejected'],
  Rejected: ['Rectification In Progress'],
  'Rectification In Progress': ['Resubmitted'],
  Resubmitted: ['Awaiting Review', 'Approved', 'Rejected'],
  Approved: [],
};

export function WIRPage() {
  const { state, setFilter, selectWIR, updateWIRStatus, setTab, selectNC } = useApp();

  const [localSearch, setLocalSearch] = useState(state.filters.search || '');
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');
  const [selectedProject, setSelectedProject] = useState(state.filters.project || '');
  const [selectedContractor, setSelectedContractor] = useState(state.filters.contractor || '');
  const [selectedReviewer, setSelectedReviewer] = useState('');
  const [slaOnly, setSlaOnly] = useState(false);
  const [sortKey, setSortKey] = useState<string>('submittedDate');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // Modal for workflow action
  const [actionModal, setActionModal] = useState<{
    wirId: string;
    newStatus: WIRStatus;
    note: string;
    requiresNote: boolean;
  } | null>(null);

  const { wirs } = state;
  const metrics = useMemo(() => getWIRSummaryMetrics(wirs), [wirs]);

  // Reviewers list
  const reviewers = useMemo(() => {
    return [...new Set(wirs.map(w => w.reviewer))];
  }, [wirs]);

  // Filtered rows
  const filteredWIRs = useMemo(() => {
    return wirs.filter(w => {
      // Global city filter
      if (state.filters.city && state.filters.city !== 'All locations' && state.filters.city !== 'All Locations') {
        const proj = PROJECTS.find(p => p.id === w.projectId);
        if (!proj) return false;
        if (state.filters.city.toLowerCase() === 'mumbai') {
          if (proj.city !== 'Mumbai' && proj.city !== 'Navi Mumbai' && proj.city !== 'Thane') return false;
        } else if (proj.city.toLowerCase() !== state.filters.city.toLowerCase()) {
          return false;
        }
      }
      // Project filter
      if (selectedProject && w.projectId !== selectedProject) return false;
      // Contractor filter
      if (selectedContractor && w.contractorId !== selectedContractor) return false;
      // Status filter
      if (selectedStatus !== 'All Statuses' && w.status !== selectedStatus) return false;
      // Reviewer filter
      if (selectedReviewer && w.reviewer !== selectedReviewer) return false;
      // SLA Only filter
      if (slaOnly && (!w.slaBreach || w.status === 'Approved')) return false;
      // Search
      if (localSearch.trim()) {
        const q = localSearch.toLowerCase();
        const proj = PROJECTS.find(p => p.id === w.projectId);
        const contractor = CONTRACTORS.find(c => c.id === w.contractorId);
        if (!w.id.toLowerCase().includes(q) &&
            !w.activity.toLowerCase().includes(q) &&
            !w.reviewer.toLowerCase().includes(q) &&
            !proj?.name.toLowerCase().includes(q) &&
            !contractor?.name.toLowerCase().includes(q)) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      if (sortKey === 'submittedDate') {
        return sortDir === 'asc' ? a.submittedDate.localeCompare(b.submittedDate) : b.submittedDate.localeCompare(a.submittedDate);
      }
      if (sortKey === 'daysAwaiting') {
        return sortDir === 'asc' ? a.daysAwaiting - b.daysAwaiting : b.daysAwaiting - a.daysAwaiting;
      }
      if (sortKey === 'id') {
        return sortDir === 'asc' ? a.id.localeCompare(b.id) : b.id.localeCompare(a.id);
      }
      return 0;
    });
  }, [wirs, state.filters.city, selectedProject, selectedContractor, selectedStatus, selectedReviewer, slaOnly, localSearch, sortKey, sortDir]);

  // Selected WIR for Drawer
  const selectedWIR = useMemo(() => {
    return wirs.find(w => w.id === state.selectedWIRId) || null;
  }, [wirs, state.selectedWIRId]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const handleExecuteAction = () => {
    if (!actionModal) return;
    if (actionModal.requiresNote && !actionModal.note.trim()) return;

    updateWIRStatus(actionModal.wirId, actionModal.newStatus, actionModal.note, 'Quality Inspector');
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
              Work Inspection Requests (WIR)
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
              Inspection Register
            </span>
          </div>
          <p className="text-xs text-[#697586] mt-0.5">
            Real-time quality signoffs, first-time pass rates, and SLA bottleneck tracking (SLA: {SLA_DAYS} days).
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-[#697586]">Inspection Turnaround SLA:</span>
          <span className="font-bold text-[#20252D] bg-white border border-[#E5E7EB] px-2.5 py-1 rounded-lg shadow-2xs">
            {SLA_DAYS} Working Days
          </span>
        </div>
      </div>

      {/* ============================================================
          SECTION A: WIR 5 COMPACT SUMMARY MEASURES
          ============================================================ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-3.5 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#697586] block mb-1">
            First-Time Pass Rate
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-black text-blue-600">{metrics.firstTimePassRate}%</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Approved on first decision
          </p>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-xl p-3.5 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#697586] block mb-1">
            Total WIRs Submitted
          </span>
          <span className="text-xl font-black text-[#20252D]">{metrics.total}</span>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Across portfolio
          </p>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-xl p-3.5 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#697586] block mb-1">
            Pending Beyond SLA ({SLA_DAYS}d)
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-black text-[#B7791F]">{metrics.pendingBeyondSLA}</span>
            <span className="text-xs text-amber-700 font-semibold">overdue</span>
          </div>
          <p className="text-[11px] text-[#B7791F] mt-0.5 font-medium">
            Bottleneck on pour clearance
          </p>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-xl p-3.5 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#697586] block mb-1">
            Rejected Awaiting Rectification
          </span>
          <span className="text-xl font-black text-[#C63F43]">
            {metrics.rejectedAwaitingResubmission}
          </span>
          <p className="text-[11px] text-[#C63F43] mt-0.5 font-medium">
            Requires contractor rework
          </p>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-xl p-3.5 shadow-2xs col-span-2 sm:col-span-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#697586] block mb-1">
            Avg Turnaround Time
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-black text-[#20252D]">
              {metrics.avgTurnaroundDays}
            </span>
            <span className="text-xs text-slate-500">days</span>
          </div>
          <p className="text-[11px] text-emerald-700 mt-0.5 font-semibold">
            Target SLA: ≤ 7.0 days
          </p>
        </div>
      </div>

      {/* ============================================================
          SECTION B: FILTERS BAR
          ============================================================ */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 shadow-2xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-blue-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Filter Inspection Register
            </span>
          </div>
          <button
            onClick={() => {
              setSelectedProject('');
              setSelectedContractor('');
              setSelectedStatus('All Statuses');
              setSelectedReviewer('');
              setSlaOnly(false);
              setLocalSearch('');
            }}
            className="text-xs font-semibold text-blue-600 hover:underline"
          >
            Reset Filters
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {/* Search */}
          <div className="col-span-2 sm:col-span-1">
            <input
              type="text"
              value={localSearch}
              onChange={e => setLocalSearch(e.target.value)}
              placeholder="Search WIR ID, activity…"
              className="w-full h-8 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none text-[#20252D]"
            />
          </div>

          {/* Project */}
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

          {/* Contractor */}
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

          {/* Status */}
          <div>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="w-full h-8 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 outline-none"
            >
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Reviewer */}
          <div>
            <select
              value={selectedReviewer}
              onChange={e => setSelectedReviewer(e.target.value)}
              className="w-full h-8 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 outline-none"
            >
              <option value="">All Inspectors</option>
              {reviewers.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          {/* SLA Breach Toggle */}
          <div>
            <button
              onClick={() => setSlaOnly(!slaOnly)}
              className={`w-full h-8 px-2.5 rounded-lg text-xs font-bold border transition-colors flex items-center justify-center gap-1.5 ${
                slaOnly
                  ? 'bg-amber-500 text-white border-amber-600 shadow-2xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Clock size={12} />
              <span>{slaOnly ? 'Overdue Only (ON)' : 'SLA Breaches'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================
          SECTION C: WIR REGISTER TABLE
          ============================================================ */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-2xs overflow-hidden">
        <div className="px-5 py-3 border-b border-[#E5E7EB] bg-slate-50/50 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700">
            Showing {filteredWIRs.length} Inspection Requests
          </span>
          <span className="text-xs text-slate-400">
            Click any row to open full inspection checklist, photo evidence & approve/reject actions
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
                  WIR ID
                </th>
                <th className="py-3 px-3">Project & Location</th>
                <th className="py-3 px-3">Work Package Inspected</th>
                <th className="py-3 px-3">Contractor</th>
                <th
                  onClick={() => handleSort('submittedDate')}
                  className="py-3 px-3 cursor-pointer hover:text-slate-900"
                >
                  Submitted Date
                </th>
                <th className="py-3 px-3">Inspector</th>
                <th
                  onClick={() => handleSort('daysAwaiting')}
                  className="py-3 px-3 cursor-pointer hover:text-slate-900"
                >
                  Waiting Time
                </th>
                <th className="py-3 px-3">First-Time Result</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {filteredWIRs.map(wir => {
                const proj = PROJECTS.find(p => p.id === wir.projectId);
                const contractor = CONTRACTORS.find(c => c.id === wir.contractorId);
                const isOverdue = wir.slaBreach && wir.status !== 'Approved';

                return (
                  <tr
                    key={wir.id}
                    onClick={() => selectWIR(wir.id)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 group-hover:text-blue-600">
                      {wir.id}
                    </td>

                    <td className="py-3.5 px-3">
                      <span className="font-bold text-slate-900">{proj?.name}</span>
                      <p className="text-[11px] text-slate-500">{wir.tower} · {wir.floor || 'Level'}</p>
                    </td>

                    <td className="py-3.5 px-3 font-medium text-slate-900 max-w-xs truncate">
                      {wir.activity}
                    </td>

                    <td className="py-3.5 px-3 text-slate-700">
                      {contractor?.name ?? 'Civil Works'}
                    </td>

                    <td className="py-3.5 px-3 text-slate-600">
                      {wir.submittedDate}
                    </td>

                    <td className="py-3.5 px-3 font-medium text-slate-700">
                      {wir.reviewer}
                    </td>

                    <td className="py-3.5 px-3">
                      <span className={`font-bold ${isOverdue ? 'text-amber-700' : 'text-slate-600'}`}>
                        {wir.daysAwaiting}d {isOverdue && '(SLA breach)'}
                      </span>
                    </td>

                    <td className="py-3.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                        wir.firstPassResult === 'Pass' ? 'bg-emerald-50 text-emerald-800' :
                        wir.firstPassResult === 'Fail' ? 'bg-rose-50 text-rose-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {wir.firstPassResult}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          wir.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                          wir.status === 'Rejected' ? 'bg-rose-100 text-rose-800' :
                          wir.status === 'Awaiting Review' ? 'bg-amber-100 text-amber-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {wir.status}
                        </span>
                        <ChevronRight size={13} className="text-slate-300 group-hover:text-slate-600" />
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredWIRs.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No inspection requests found matching the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============================================================
          SECTION D: WIR DETAIL DRAWER
          ============================================================ */}
      {selectedWIR && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-200 overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-slate-200 bg-slate-50/60 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="font-mono text-xs font-black text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded shadow-2xs">
                    {selectedWIR.id}
                  </span>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    selectedWIR.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                    selectedWIR.status === 'Rejected' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {selectedWIR.status}
                  </span>
                  {selectedWIR.slaBreach && selectedWIR.status !== 'Approved' && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-300">
                      SLA Overdue
                    </span>
                  )}
                </div>
                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {selectedWIR.activity}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {PROJECTS.find(p => p.id === selectedWIR.projectId)?.name} · {selectedWIR.tower} · {selectedWIR.floor || ''}
                </p>
              </div>
              <button
                onClick={() => selectWIR(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Rejection Alert if rejected */}
              {selectedWIR.rejectionReason && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-rose-900 uppercase tracking-wide">
                    <AlertTriangle size={15} className="text-rose-600" />
                    <span>Inspection Rejection Reason</span>
                  </div>
                  <p className="text-xs text-rose-800 leading-relaxed pt-1">
                    {selectedWIR.rejectionReason}
                  </p>
                </div>
              )}

              {/* Site Photo & Defect Evidence */}
              {selectedWIR.sitePhoto && (
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                    Site Defect Photo & Evidence
                  </span>
                  <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-100">
                    <img
                      src={selectedWIR.sitePhoto.url}
                      alt="Defect Evidence"
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-3 bg-white text-xs">
                      <p className="font-semibold text-slate-900">{selectedWIR.sitePhoto.caption}</p>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1 pt-1 border-t border-slate-100">
                        <span>{selectedWIR.sitePhoto.locationGPS}</span>
                        <span>{selectedWIR.sitePhoto.timestamp}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Inspection Details Grid */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Inspection Specification
                </h5>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 text-[11px] block">Contractor Submitter</span>
                    <p className="font-bold text-slate-900 mt-0.5">
                      {CONTRACTORS.find(c => c.id === selectedWIR.contractorId)?.name}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">Lead Quality Reviewer</span>
                    <p className="font-bold text-slate-900 mt-0.5">{selectedWIR.reviewer}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">Submission Date</span>
                    <p className="font-bold text-slate-900 mt-0.5">{selectedWIR.submittedDate}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">First-Pass Decision</span>
                    <p className="font-bold text-slate-900 mt-0.5">{selectedWIR.firstPassResult}</p>
                  </div>
                </div>
              </div>

              {/* Resubmission History Timeline */}
              <div className="space-y-2.5">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Workflow Audit Trail ({selectedWIR.history.length} Events)
                </h5>
                <div className="border-l-2 border-slate-200 ml-2.5 pl-4 space-y-3">
                  {selectedWIR.history.map((h, i) => (
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

            {/* Footer with Workflow Action Buttons */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
              <button
                onClick={() => selectWIR(null)}
                className="px-3 py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                {/* If submitted or awaiting review -> can Approve or Reject */}
                {(selectedWIR.status === 'Submitted' || selectedWIR.status === 'Awaiting Review' || selectedWIR.status === 'Resubmitted') && (
                  <>
                    <button
                      onClick={() => setActionModal({
                        wirId: selectedWIR.id,
                        newStatus: 'Rejected',
                        note: '',
                        requiresNote: true,
                      })}
                      className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                    >
                      Reject Inspection
                    </button>
                    <button
                      onClick={() => updateWIRStatus(selectedWIR.id, 'Approved', 'Work meets specifications', 'Quality Inspector')}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                    >
                      Approve & Sign Off
                    </button>
                  </>
                )}

                {/* If rejected -> can rectify */}
                {selectedWIR.status === 'Rejected' && (
                  <button
                    onClick={() => updateWIRStatus(selectedWIR.id, 'Rectification In Progress', 'Remedial work commenced on site', 'ABC Civil Works')}
                    className="px-3.5 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                  >
                    Start Rectification
                  </button>
                )}

                {/* If rectification -> can resubmit */}
                {selectedWIR.status === 'Rectification In Progress' && (
                  <button
                    onClick={() => updateWIRStatus(selectedWIR.id, 'Resubmitted', 'Corrective action verified by contractor QC', 'ABC Civil Works')}
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                  >
                    Resubmit for Reinspection
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Dialog (for Rejection reason) */}
      {actionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-5 space-y-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                Reject Inspection Request ({actionModal.wirId})
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                A valid technical rejection reason is mandatory to enforce accountability.
              </p>
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Rejection Reason / Defect Specification *
              </label>
              <textarea
                rows={3}
                value={actionModal.note}
                onChange={e => setActionModal({ ...actionModal, note: e.target.value })}
                placeholder="e.g. Rebar spacing non-compliant with drawing IS 456; cover blocks missing..."
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
                disabled={!actionModal.note.trim()}
                onClick={handleExecuteAction}
                className={`px-4 py-1.5 text-xs font-bold rounded-xl text-white transition-all ${
                  actionModal.note.trim() ? 'bg-rose-600 hover:bg-rose-700' : 'bg-slate-300 cursor-not-allowed'
                }`}
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
