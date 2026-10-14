// ============================================================
// WIR PAGE — Work Inspection Requests
// ============================================================

import React, { useState, useMemo } from 'react';
import clsx from 'clsx';
import { useApp } from '../store/appStore';
import { getWIRSummaryMetrics } from '../data/calculations';
import { PROJECTS, CONTRACTORS, SLA_DAYS, type WIR, type WIRStatus } from '../data/seedData';
import {
  KPICard, StatusBadge, SortableTh, FilterSelect, SearchInput,
  EmptyState, PageHeader, Drawer, DrawerSection, FieldRow,
  ActivityTimeline, OverdueBadge, SitePhotoCard,
} from '../components/ui';
import { Camera, FileCheck, AlertTriangle } from 'lucide-react';

const PROJECT_OPTIONS = PROJECTS.map(p => ({ value: p.id, label: p.name }));
const CONTRACTOR_OPTIONS = CONTRACTORS.map(c => ({ value: c.id, label: c.name }));
const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: 'Draft', label: 'Draft' },
  { value: 'Submitted', label: 'Submitted' },
  { value: 'Awaiting Review', label: 'Awaiting Review' },
  { value: 'Rejected', label: 'Rejected' },
  { value: 'Rectification In Progress', label: 'Rectification In Progress' },
  { value: 'Resubmitted', label: 'Resubmitted' },
  { value: 'Approved', label: 'Approved' },
];

// Valid transitions
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
  const { state, setFilter, resetFilters, selectWIR, updateWIRStatus } = useApp();
  const [sort, setSort] = useState<{ key: string; dir: 'asc' | 'desc' }>({ key: 'submittedDate', dir: 'desc' });
  const [actionModal, setActionModal] = useState<{
    wirId: string;
    newStatus: WIRStatus;
    note: string;
    requiresNote: boolean;
  } | null>(null);

  const { wirs } = state;
  const metrics = useMemo(() => getWIRSummaryMetrics(wirs), [wirs]);

  // Reviewers & Towers
  const REVIEWER_OPTIONS = useMemo(() => {
    return [...new Set(wirs.map(w => w.reviewer))].map(r => ({ value: r, label: r }));
  }, [wirs]);

  const TOWER_OPTIONS = useMemo(() => {
    return [...new Set(wirs.map(w => w.tower))].map(t => ({ value: t, label: t }));
  }, [wirs]);

  // Filter
  const filtered = useMemo(() => {
    let rows = wirs;
    if (state.filters.project) rows = rows.filter(w => w.projectId === state.filters.project);
    if (state.filters.contractor) rows = rows.filter(w => w.contractorId === state.filters.contractor);
    if (state.filters.status) rows = rows.filter(w => w.status === state.filters.status);
    if (state.filters.severity) rows = rows.filter(w => w.reviewer === state.filters.severity); // repurposed for reviewer filter
    if (state.filters.city) rows = rows.filter(w => w.tower === state.filters.city); // repurposed for tower filter
    if (state.filters.search) {
      const q = state.filters.search.toLowerCase();
      rows = rows.filter(w =>
        w.id.toLowerCase().includes(q) ||
        w.activity.toLowerCase().includes(q) ||
        w.reviewer.toLowerCase().includes(q) ||
        PROJECTS.find(p => p.id === w.projectId)?.name.toLowerCase().includes(q) ||
        false
      );
    }
    return rows;
  }, [wirs, state.filters]);

  // Sort
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let av: unknown, bv: unknown;
      switch (sort.key) {
        case 'submittedDate': av = a.submittedDate; bv = b.submittedDate; break;
        case 'daysAwaiting': av = a.daysAwaiting; bv = b.daysAwaiting; break;
        case 'status': av = a.status; bv = b.status; break;
        case 'id': av = a.id; bv = b.id; break;
        default: av = a.submittedDate; bv = b.submittedDate;
      }
      if (typeof av === 'string' && typeof bv === 'string') {
        return sort.dir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      const an = av as number, bn = bv as number;
      return sort.dir === 'asc' ? an - bn : bn - an;
    });
  }, [filtered, sort]);

  function handleSort(key: string) {
    setSort(prev => prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'desc' });
  }

  function initiateTransition(wirId: string, newStatus: WIRStatus) {
    setActionModal({
      wirId,
      newStatus,
      note: '',
      requiresNote: newStatus === 'Rejected',
    });
  }

  function confirmTransition() {
    if (!actionModal) return;
    const { wirId, newStatus, note } = actionModal;
    updateWIRStatus(wirId, newStatus, note, 'Rajan Mehta');
    setActionModal(null);
  }

  const selectedWIR = state.selectedWIRId ? wirs.find(w => w.id === state.selectedWIRId) : null;
  const hasFilters = Object.values(state.filters).some(v => v !== '');

  return (
    <div>
      <PageHeader title="WIR" subtitle="Work Inspection Requests: inspection pass rates, bottlenecks and approval turnaround." />

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap mb-5">
        <FilterSelect label="Project" value={state.filters.project} options={PROJECT_OPTIONS} onChange={v => setFilter('project', v)} />
        <FilterSelect label="Contractor" value={state.filters.contractor} options={CONTRACTOR_OPTIONS} onChange={v => setFilter('contractor', v)} />
        <FilterSelect label="Status" value={state.filters.status} options={STATUS_OPTIONS} onChange={v => setFilter('status', v)} />
        <FilterSelect label="Reviewer" value={state.filters.severity} options={REVIEWER_OPTIONS} onChange={v => setFilter('severity', v)} />
        <FilterSelect label="Tower/Location" value={state.filters.city} options={TOWER_OPTIONS} onChange={v => setFilter('city', v)} />
        <SearchInput value={state.filters.search} onChange={v => setFilter('search', v)} placeholder="Search WIR ID, activity, reviewer…" />
        {hasFilters && (
          <button onClick={resetFilters} className="text-xs text-[#697586] hover:text-[#20252D] underline">Reset filters</button>
        )}
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <KPICard label="First-Time Pass Rate" value={`${metrics.firstTimePassRate}%`} sub={<span className="text-xs text-[#697586]">Approved on 1st inspection</span>} />
        <KPICard label="Total WIRs" value={metrics.total} sub={<span className="text-xs text-[#697586]">Across selected scope</span>} />
        <KPICard label="Pending Beyond SLA" value={metrics.pendingBeyondSLA} alert={metrics.pendingBeyondSLA > 0 ? `>${SLA_DAYS}d SLA` : undefined} sub={<span className="text-xs text-[#697586]">Breaching review turnaround</span>} />
        <KPICard label="Rejected — Resubmit Pending" value={metrics.rejectedAwaitingResubmission} alert={metrics.rejectedAwaitingResubmission > 0 ? 'Action required' : undefined} sub={<span className="text-xs text-[#697586]">Awaiting contractor rectification</span>} />
        <KPICard label="Avg Turnaround" value={`${metrics.avgTurnaroundDays}d`} sub={<span className="text-xs text-[#697586]">Submission to approval</span>} />
      </div>

      {/* WIR Table */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-[#0F172A]">Work Inspection Requests</h2>
          <span className="text-xs text-[#94A3B8]">{sorted.length} record{sorted.length !== 1 ? 's' : ''} · Highlighted rows breach 7-day SLA</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px]">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                <SortableTh label="WIR ID" sortKey="id" currentSort={sort} onSort={handleSort} className="pl-4" />
                <th className="text-left text-xs font-medium text-[#697586] uppercase tracking-wide px-3 py-2.5">Project</th>
                <th className="text-left text-xs font-medium text-[#697586] uppercase tracking-wide px-3 py-2.5">Tower / Floor</th>
                <th className="text-left text-xs font-medium text-[#697586] uppercase tracking-wide px-3 py-2.5">Activity</th>
                <th className="text-left text-xs font-medium text-[#697586] uppercase tracking-wide px-3 py-2.5">Contractor</th>
                <SortableTh label="Submitted" sortKey="submittedDate" currentSort={sort} onSort={handleSort} />
                <th className="text-left text-xs font-medium text-[#697586] uppercase tracking-wide px-3 py-2.5">Reviewer</th>
                <SortableTh label="Status" sortKey="status" currentSort={sort} onSort={handleSort} />
                <SortableTh label="Time Awaiting" sortKey="daysAwaiting" currentSort={sort} onSort={handleSort} />
                <th className="text-left text-xs font-medium text-[#697586] uppercase tracking-wide px-3 py-2.5">1st Pass</th>
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 ? (
                <tr><td colSpan={10}><EmptyState message="No WIRs match the current filters." /></td></tr>
              ) : sorted.map(wir => {
                const project = PROJECTS.find(p => p.id === wir.projectId);
                const contractor = CONTRACTORS.find(c => c.id === wir.contractorId);
                const isBreach = wir.slaBreach && wir.status !== 'Approved';
                return (
                  <tr
                    key={wir.id}
                    className={clsx(
                      'border-b border-[#F3F4F6] last:border-0 table-row-hover',
                      isBreach && 'bg-red-50/25',
                      wir.status === 'Rejected' && 'bg-red-50/15'
                    )}
                    onClick={() => selectWIR(wir.id)}
                  >
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-mono font-medium text-[#315EFB]">{wir.id}</span>
                        {isBreach && <OverdueBadge />}
                        {wir.sitePhoto && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] text-teal-700 bg-teal-50 border border-teal-200 px-1.5 py-0.2 rounded font-semibold" title="On-site photo attached">
                            <Camera size={10} /> Photo
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-sm text-[#697586]">
                      <div className="flex items-center gap-2">
                        {project?.image && (
                          <img
                            src={project.image}
                            alt={project.name}
                            className="w-5 h-5 rounded object-cover border border-[#E2E8F0] flex-shrink-0"
                          />
                        )}
                        <span>{project?.name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-sm text-[#697586]">{wir.tower}</td>
                    <td className="px-3 py-2.5 text-sm text-[#20252D] max-w-[200px] truncate">{wir.activity}</td>
                    <td className="px-3 py-2.5 text-sm text-[#697586]">{contractor?.name}</td>
                    <td className="px-3 py-2.5 text-sm text-[#697586]">{wir.submittedDate}</td>
                    <td className="px-3 py-2.5 text-sm text-[#697586]">{wir.reviewer}</td>
                    <td className="px-3 py-2.5"><StatusBadge status={wir.status} /></td>
                    <td className="px-3 py-2.5 text-sm text-[#697586]">
                      {wir.daysAwaiting > 0 ? (
                        <span className={clsx(isBreach ? 'text-[#C63F43] font-semibold' : '')}>
                          {wir.daysAwaiting}d
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-3 py-2.5">
                      {wir.firstPassResult === 'Pass' && <span className="text-xs font-semibold text-[#16805D]">Pass</span>}
                      {wir.firstPassResult === 'Fail' && <span className="text-xs font-semibold text-[#C63F43]">Fail</span>}
                      {wir.firstPassResult === 'Pending' && <span className="text-xs text-[#8792A2]">—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* WIR Detail Drawer */}
      {selectedWIR && (
        <WIRDetailDrawer
          wir={selectedWIR}
          onClose={() => selectWIR(null)}
          onTransition={initiateTransition}
        />
      )}

      {/* Confirm action modal */}
      {actionModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setActionModal(null)} />
          <div className="relative bg-white rounded-lg border border-[#E5E7EB] shadow-lg w-[480px] p-6">
            <h3 className="text-base font-semibold text-[#20252D] mb-1">
              Inspection Action: {actionModal.newStatus}
            </h3>
            <p className="text-sm text-[#697586] mb-4">
              WIR ID: <span className="font-mono text-[#315EFB] font-medium">{actionModal.wirId}</span>
            </p>
            <div className="mb-4">
              <label className="block text-xs font-medium text-[#697586] mb-1">
                {actionModal.requiresNote ? 'Rejection Reason / Non-Compliance Finding (mandatory)' : 'Inspector Notes (optional)'}
              </label>
              <textarea
                value={actionModal.note}
                onChange={e => setActionModal({ ...actionModal, note: e.target.value })}
                rows={3}
                placeholder={
                  actionModal.newStatus === 'Rejected'
                    ? 'State the technical code violation, tolerance deviation or defect observed (e.g. stirrup spacing 250mm vs specified 150mm)…'
                    : 'Add inspection observations or sign-off notes…'
                }
                className="w-full text-sm border border-[#E5E7EB] rounded px-3 py-2 focus:outline-none focus:border-[#315EFB] resize-none"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setActionModal(null)} className="px-3 py-1.5 text-sm text-[#697586] border border-[#E5E7EB] rounded hover:bg-gray-50">Cancel</button>
              <button
                onClick={() => {
                  if (actionModal.requiresNote && !actionModal.note.trim()) return;
                  confirmTransition();
                }}
                disabled={actionModal.requiresNote && !actionModal.note.trim()}
                className="px-3 py-1.5 text-sm text-white bg-[#315EFB] rounded hover:bg-blue-700 disabled:opacity-50 font-medium"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── WIR Detail Drawer ─────────────────────────────────────────
function WIRDetailDrawer({
  wir,
  onClose,
  onTransition,
}: {
  wir: WIR;
  onClose: () => void;
  onTransition: (id: string, status: WIRStatus) => void;
}) {
  const project = PROJECTS.find(p => p.id === wir.projectId);
  const contractor = CONTRACTORS.find(c => c.id === wir.contractorId);
  const availableTransitions = VALID_TRANSITIONS[wir.status] ?? [];

  return (
    <Drawer
      open
      onClose={onClose}
      title={wir.id}
      subtitle={`${project?.name} · ${wir.tower}`}
      width="600px"
    >
      {/* Status + actions */}
      <DrawerSection title="Review status & actions">
        <div className="flex items-center gap-3 mb-3 flex-wrap">
          <StatusBadge status={wir.status} />
          {wir.slaBreach && wir.status !== 'Approved' && <OverdueBadge />}
          {wir.firstPassResult !== 'Pending' && (
            <span className={clsx('text-xs font-semibold px-2 py-0.5 rounded border',
              wir.firstPassResult === 'Pass'
                ? 'text-[#16805D] bg-green-50 border-green-200'
                : 'text-[#C63F43] bg-red-50 border-red-200'
            )}>
              {wir.firstPassResult === 'Pass' ? '1st-pass Approved' : '1st-pass Rejected'}
            </span>
          )}
        </div>

        {availableTransitions.length > 0 && (
          <div className="bg-[#F9FAFB] p-3 rounded border border-[#E5E7EB]">
            <p className="text-xs font-medium text-[#697586] mb-2">Available QA actions:</p>
            <div className="flex flex-wrap gap-2">
              {availableTransitions.map(status => (
                <button
                  key={status}
                  onClick={() => onTransition(wir.id, status)}
                  className={clsx(
                    'text-xs px-3 py-1.5 rounded border font-medium transition-colors',
                    status === 'Approved'
                      ? 'bg-[#16805D] text-white border-[#16805D] hover:bg-green-800'
                      : status === 'Rejected'
                      ? 'bg-[#C63F43] text-white border-[#C63F43] hover:bg-red-800'
                      : 'bg-white text-[#315EFB] border-[#315EFB] hover:bg-blue-50'
                  )}
                >
                  {status === 'Approved' ? 'Approve Inspection' :
                   status === 'Rejected' ? 'Reject Inspection' :
                   status === 'Rectification In Progress' ? 'Start Rectification' :
                   status === 'Resubmitted' ? 'Resubmit for Inspection' :
                   status}
                </button>
              ))}
            </div>
          </div>
        )}
      </DrawerSection>

      {/* Details */}
      <DrawerSection title="Inspection details">
        <div className="border border-[#E5E7EB] rounded-lg overflow-hidden">
          <FieldRow label="Project" value={project?.name ?? '—'} />
          <FieldRow label="Location" value={`${project?.city} · ${wir.tower}`} />
          <FieldRow label="Work package / activity" value={wir.activity} />
          <FieldRow label="Responsible contractor" value={contractor?.name ?? '—'} />
          <FieldRow label="Submitted date" value={wir.submittedDate} />
          <FieldRow label="Assigned reviewer" value={wir.reviewer} />
          <FieldRow label="Turnaround / Days awaiting" value={wir.daysAwaiting > 0 ? `${wir.daysAwaiting} days` : '0 days (decision logged)'} />
        </div>
      </DrawerSection>

      {/* Rejection reason */}
      {wir.rejectionReason && (
        <DrawerSection title="Rejection reason & code non-compliance">
          <div className="bg-red-50 border border-red-200 rounded p-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#C63F43] mb-1">
              <AlertTriangle size={13} />
              <span>Inspection Rejection Finding</span>
            </div>
            <p className="text-sm text-[#C63F43] font-medium leading-relaxed">{wir.rejectionReason}</p>
          </div>
        </DrawerSection>
      )}

      {/* Inspection notes */}
      {wir.inspectionNotes && (
        <DrawerSection title="Site QA observations">
          <p className="text-sm text-[#20252D] bg-[#F9FAFB] border border-[#E5E7EB] rounded p-3">
            {wir.inspectionNotes}
          </p>
        </DrawerSection>
      )}

      {/* Inspection Artifacts & Evidence */}
      <DrawerSection title="Evidence & inspection checklist">
        {wir.sitePhoto ? (
          <div className="space-y-3">
            <SitePhotoCard photo={wir.sitePhoto} title={`Inspection Site Evidence — ${wir.id}`} />
            <div className="grid grid-cols-2 gap-2">
              <div className="border border-[#CBD5E1] rounded-xl p-2.5 bg-[#F8FAFC] flex items-start gap-2">
                <Camera size={15} className="text-[#0F766E] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-[#0F172A]">Pre-Pour Verification Photo</p>
                  <p className="text-[11px] text-[#64748B]">Checklist #{wir.id}-SITE-PHOTO</p>
                </div>
              </div>
              <div className="border border-[#CBD5E1] rounded-xl p-2.5 bg-[#F8FAFC] flex items-start gap-2">
                <FileCheck size={15} className="text-[#16805D] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-[#0F172A]">Bar Bending / Pour Log</p>
                  <p className="text-[11px] text-[#64748B]">Signoff sheet signed by QA</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <div className="border border-[#E5E7EB] rounded p-2.5 bg-[#F9FAFB] flex items-start gap-2">
              <Camera size={16} className="text-[#315EFB] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-[#20252D]">Pre-Pour Verification Photo</p>
                <p className="text-[11px] text-[#8792A2]">Checklist attachment #{wir.id}-01.jpg</p>
              </div>
            </div>
            <div className="border border-[#E5E7EB] rounded p-2.5 bg-[#F9FAFB] flex items-start gap-2">
              <FileCheck size={16} className="text-[#16805D] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-[#20252D]">Bar Bending / Pour Log</p>
                <p className="text-[11px] text-[#8792A2]">Signoff sheet signed by QA</p>
              </div>
            </div>
          </div>
        )}
      </DrawerSection>

      {/* Activity history */}
      <DrawerSection title="Full inspection activity log">
        <ActivityTimeline entries={wir.history} />
      </DrawerSection>
    </Drawer>
  );
}
