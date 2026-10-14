// ============================================================
// NON-COMPLIANCE PAGE
// ============================================================

import React, { useState, useMemo } from 'react';
import clsx from 'clsx';
import { useApp } from '../store/appStore';
import { getNCSummaryMetrics } from '../data/calculations';
import { PROJECTS, CONTRACTORS, type NC, type NCStatus } from '../data/seedData';
import {
  KPICard, SeverityBadge, StatusBadge, SortableTh, FilterSelect,
  SearchInput, EmptyState, PageHeader, Drawer, DrawerSection,
  FieldRow, ActivityTimeline, OverdueBadge, SitePhotoCard,
} from '../components/ui';
import { FileText, Camera, AlertCircle, RefreshCw } from 'lucide-react';

const PROJECT_OPTIONS = PROJECTS.map(p => ({ value: p.id, label: p.name }));
const CONTRACTOR_OPTIONS = CONTRACTORS.map(c => ({ value: c.id, label: c.name }));
const SEVERITY_OPTIONS = [
  { value: 'Critical', label: 'Critical' },
  { value: 'High', label: 'High' },
  { value: 'Medium', label: 'Medium' },
  { value: 'Low', label: 'Low' },
];
const STATUS_OPTIONS = [
  { value: 'Open', label: 'Open' },
  { value: 'Assigned', label: 'Assigned' },
  { value: 'Rectification', label: 'Rectification' },
  { value: 'Evidence Submitted', label: 'Evidence Submitted' },
  { value: 'Verification', label: 'Verification' },
  { value: 'Closed', label: 'Closed' },
  { value: 'Rejected Verification', label: 'Rejected Verification' },
];

// Valid NC transitions
const VALID_NC_TRANSITIONS: Record<NCStatus, NCStatus[]> = {
  Open: ['Assigned'],
  Assigned: ['Rectification'],
  Rectification: ['Evidence Submitted'],
  'Evidence Submitted': ['Verification'],
  Verification: ['Closed', 'Rejected Verification'],
  Closed: [],
  'Rejected Verification': ['Rectification'],
};

const SEVERITY_ORDER = { Critical: 0, High: 1, Medium: 2, Low: 3 };

export function NCPage() {
  const { state, setFilter, resetFilters, selectNC, updateNCStatus } = useApp();
  const [sort, setSort] = useState<{ key: string; dir: 'asc' | 'desc' }>({ key: 'severity', dir: 'asc' });
  const [actionModal, setActionModal] = useState<{
    ncId: string;
    newStatus: NCStatus;
    note: string;
    requiresNote: boolean;
  } | null>(null);

  const { ncs } = state;
  const today = new Date();

  const metrics = useMemo(() => getNCSummaryMetrics(ncs), [ncs]);

  // Unique owners
  const OWNER_OPTIONS = useMemo(() => {
    return [...new Set(ncs.map(n => n.owner))].map(o => ({ value: o, label: o }));
  }, [ncs]);

  // Severity/Ageing breakdown
  const openNCs = useMemo(() => ncs.filter(n => n.status !== 'Closed'), [ncs]);
  const ageBands = useMemo(() => ({
    '0–7d': openNCs.filter(n => n.age <= 7).length,
    '8–14d': openNCs.filter(n => n.age >= 8 && n.age <= 14).length,
    '15–30d': openNCs.filter(n => n.age >= 15 && n.age <= 30).length,
    '>30d': openNCs.filter(n => n.age > 30).length,
  }), [openNCs]);
  const severityCounts = useMemo(() => ({
    Critical: openNCs.filter(n => n.severity === 'Critical').length,
    High: openNCs.filter(n => n.severity === 'High').length,
    Medium: openNCs.filter(n => n.severity === 'Medium').length,
    Low: openNCs.filter(n => n.severity === 'Low').length,
  }), [openNCs]);

  // Filter
  const filtered = useMemo(() => {
    let rows = ncs;
    if (state.filters.project) rows = rows.filter(n => n.projectId === state.filters.project);
    if (state.filters.contractor) rows = rows.filter(n => n.contractorId === state.filters.contractor);
    if (state.filters.severity) rows = rows.filter(n => n.severity === state.filters.severity);
    if (state.filters.status) rows = rows.filter(n => n.status === state.filters.status);
    if (state.filters.dateTo) rows = rows.filter(n => n.owner === state.filters.dateTo); // repurposed as owner filter
    if (state.filters.search) {
      const q = state.filters.search.toLowerCase();
      rows = rows.filter(n =>
        n.id.toLowerCase().includes(q) ||
        n.finding.toLowerCase().includes(q) ||
        n.owner.toLowerCase().includes(q) ||
        PROJECTS.find(p => p.id === n.projectId)?.name.toLowerCase().includes(q) ||
        false
      );
    }
    return rows;
  }, [ncs, state.filters]);

  // Sort: default severity + age
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      switch (sort.key) {
        case 'severity': {
          const sOrd = SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity];
          if (sOrd !== 0) return sort.dir === 'asc' ? sOrd : -sOrd;
          return b.age - a.age; // secondary sort: oldest first
        }
        case 'age': return sort.dir === 'asc' ? a.age - b.age : b.age - a.age;
        case 'dateRaised': return sort.dir === 'asc' ? a.dateRaised.localeCompare(b.dateRaised) : b.dateRaised.localeCompare(a.dateRaised);
        case 'status': return sort.dir === 'asc' ? a.status.localeCompare(b.status) : b.status.localeCompare(a.status);
        case 'id': return sort.dir === 'asc' ? a.id.localeCompare(b.id) : b.id.localeCompare(a.id);
        default: return SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity];
      }
    });
  }, [filtered, sort]);

  function handleSort(key: string) {
    setSort(prev => prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' });
  }

  function initiateTransition(ncId: string, newStatus: NCStatus) {
    setActionModal({
      ncId,
      newStatus,
      note: '',
      requiresNote: newStatus === 'Closed' || newStatus === 'Rejected Verification' || newStatus === 'Rectification',
    });
  }

  function confirmTransition() {
    if (!actionModal) return;
    const { ncId, newStatus, note } = actionModal;
    updateNCStatus(ncId, newStatus, note, 'Site QA Team');
    setActionModal(null);
  }

  const selectedNC = state.selectedNCId ? ncs.find(n => n.id === state.selectedNCId) : null;
  const hasFilters = Object.values(state.filters).some(v => v !== '');

  return (
    <div>
      <PageHeader title="Non-Compliance" subtitle="Open quality findings, corrective actions and closure performance across projects." />

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap mb-5">
        <FilterSelect label="Project" value={state.filters.project} options={PROJECT_OPTIONS} onChange={v => setFilter('project', v)} />
        <FilterSelect label="Contractor" value={state.filters.contractor} options={CONTRACTOR_OPTIONS} onChange={v => setFilter('contractor', v)} />
        <FilterSelect label="Severity" value={state.filters.severity} options={SEVERITY_OPTIONS} onChange={v => setFilter('severity', v)} />
        <FilterSelect label="Status" value={state.filters.status} options={STATUS_OPTIONS} onChange={v => setFilter('status', v)} />
        <FilterSelect label="Owner" value={state.filters.dateTo} options={OWNER_OPTIONS} onChange={v => setFilter('dateTo', v)} />
        <SearchInput value={state.filters.search} onChange={v => setFilter('search', v)} placeholder="Search NC ID, finding, owner…" />
        {hasFilters && (
          <button onClick={resetFilters} className="text-xs text-[#697586] hover:text-[#20252D] underline">Reset filters</button>
        )}
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <KPICard label="Open NCs" value={metrics.totalOpen} sub={<span className="text-xs text-[#697586]">All active findings</span>} />
        <KPICard label="Critical + High Open" value={metrics.criticalHighOpen} alert={metrics.criticalHighOpen > 0 ? 'High risk' : undefined} sub={<span className="text-xs text-[#697586]">Immediate action</span>} />
        <KPICard label="Overdue NCs" value={metrics.overdue} alert={metrics.overdue > 0 ? 'Exceeded SLA' : undefined} sub={<span className="text-xs text-[#697586]">Past target closure date</span>} />
        <KPICard label="Avg Days to Close" value={`${metrics.avgDaysToClose}d`} sub={<span className="text-xs text-[#697586]">Verified closures</span>} />
        <KPICard label="Repeat NCs" value={metrics.repeatCount} sub={<span className="text-xs text-[#697586]">Same contractor & category</span>} />
      </div>

      {/* Severity + Ageing breakdown */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Severity */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs">
          <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-4">Open NCs by severity</h3>
          <div className="space-y-3">
            {(['Critical', 'High', 'Medium', 'Low'] as const).map(sev => {
              const count = severityCounts[sev];
              const pct = openNCs.length > 0 ? (count / openNCs.length) * 100 : 0;
              const colors = { Critical: '#DC2626', High: '#EA580C', Medium: '#D97706', Low: '#64748B' };
              return (
                <div key={sev} className="flex items-center gap-3">
                  <span className="text-xs font-medium text-[#475569] w-16">{sev}</span>
                  <div className="flex-1 h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: colors[sev] }} />
                  </div>
                  <span className="text-xs font-bold text-[#0F172A] w-6 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Ageing */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs">
          <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-4">Open NCs by ageing band</h3>
          <div className="space-y-3">
            {Object.entries(ageBands).map(([band, count]) => {
              const pct = openNCs.length > 0 ? (count / openNCs.length) * 100 : 0;
              return (
                <div key={band} className="flex items-center gap-3">
                  <span className="text-xs font-medium text-[#475569] w-16">{band}</span>
                  <div className="flex-1 h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-[#315EFB] transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs font-bold text-[#0F172A] w-6 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* NC Table */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-[#0F172A]">Non-Compliance Records</h2>
          <span className="text-xs text-[#94A3B8]">{sorted.length} record{sorted.length !== 1 ? 's' : ''} · Sorted by severity & age</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1200px]">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                <SortableTh label="NC ID" sortKey="id" currentSort={sort} onSort={handleSort} className="pl-4" />
                <th className="text-left text-xs font-medium text-[#697586] uppercase tracking-wide px-3 py-2.5">Project</th>
                <th className="text-left text-xs font-medium text-[#697586] uppercase tracking-wide px-3 py-2.5">Location</th>
                <th className="text-left text-xs font-medium text-[#697586] uppercase tracking-wide px-3 py-2.5">Finding</th>
                <SortableTh label="Severity" sortKey="severity" currentSort={sort} onSort={handleSort} />
                <th className="text-left text-xs font-medium text-[#697586] uppercase tracking-wide px-3 py-2.5">Contractor</th>
                <SortableTh label="Raised" sortKey="dateRaised" currentSort={sort} onSort={handleSort} />
                <SortableTh label="Age" sortKey="age" currentSort={sort} onSort={handleSort} />
                <th className="text-left text-xs font-medium text-[#697586] uppercase tracking-wide px-3 py-2.5">Due</th>
                <SortableTh label="Status" sortKey="status" currentSort={sort} onSort={handleSort} />
                <th className="text-left text-xs font-medium text-[#697586] uppercase tracking-wide px-3 py-2.5">Repeat</th>
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 ? (
                <tr><td colSpan={11}><EmptyState message="No NC records match the current filters." /></td></tr>
              ) : sorted.map(nc => {
                const project = PROJECTS.find(p => p.id === nc.projectId);
                const contractor = CONTRACTORS.find(c => c.id === nc.contractorId);
                const isOverdue = new Date(nc.dueDate) < today && nc.status !== 'Closed';
                return (
                  <tr
                    key={nc.id}
                    className={clsx(
                      'border-b border-[#F3F4F6] last:border-0 table-row-hover',
                      nc.severity === 'Critical' && nc.status !== 'Closed' && 'bg-red-50/20',
                    )}
                    onClick={() => selectNC(nc.id)}
                  >
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-mono font-medium text-[#315EFB]">{nc.id}</span>
                        {isOverdue && <OverdueBadge />}
                        {nc.sitePhoto && (
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
                    <td className="px-3 py-2.5 text-sm text-[#697586]">{nc.tower}</td>
                    <td className="px-3 py-2.5 text-sm text-[#20252D] max-w-[240px] truncate">{nc.finding}</td>
                    <td className="px-3 py-2.5"><SeverityBadge severity={nc.severity} /></td>
                    <td className="px-3 py-2.5 text-sm text-[#697586]">{contractor?.name}</td>
                    <td className="px-3 py-2.5 text-sm text-[#697586]">{nc.dateRaised}</td>
                    <td className="px-3 py-2.5">
                      <span className={clsx('text-sm', nc.age > 30 && nc.status !== 'Closed' ? 'text-[#C63F43] font-medium' : 'text-[#697586]')}>
                        {nc.age}d
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-sm text-[#697586]">{nc.dueDate}</td>
                    <td className="px-3 py-2.5"><StatusBadge status={nc.status} /></td>
                    <td className="px-3 py-2.5">
                      {nc.isRepeat ? (
                        <span className="text-xs font-medium text-[#B7791F] bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                          Repeat
                        </span>
                      ) : (
                        <span className="text-xs text-[#8792A2]">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* NC Detail Drawer */}
      {selectedNC && (
        <NCDetailDrawer
          nc={selectedNC}
          allNCs={ncs}
          onClose={() => selectNC(null)}
          onTransition={initiateTransition}
        />
      )}

      {/* Confirm action modal */}
      {actionModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setActionModal(null)} />
          <div className="relative bg-white rounded-lg border border-[#E5E7EB] shadow-lg w-[480px] p-6">
            <h3 className="text-base font-semibold text-[#20252D] mb-1">
              Transition NC to: {actionModal.newStatus}
            </h3>
            <p className="text-sm text-[#697586] mb-4">Record: {actionModal.ncId}</p>
            {actionModal.requiresNote && (
              <div className="mb-4">
                <label className="block text-xs font-medium text-[#697586] mb-1">
                  {actionModal.newStatus === 'Closed' ? 'Verification Outcome & Signoff Notes (required)' :
                   actionModal.newStatus === 'Rejected Verification' ? 'Reason for Verification Rejection (required)' :
                   'Rectification Details (required)'}
                </label>
                <textarea
                  value={actionModal.note}
                  onChange={e => setActionModal({ ...actionModal, note: e.target.value })}
                  rows={3}
                  placeholder={
                    actionModal.newStatus === 'Closed' ? 'e.g. Field inspection completed. Re-test passed specifications (cube strength >30 MPa).' :
                    actionModal.newStatus === 'Rejected Verification' ? 'e.g. Workmanship remains non-compliant. Grouting voids still detected.' :
                    'Describe corrective action undertaken by contractor…'
                  }
                  className="w-full text-sm border border-[#E5E7EB] rounded px-3 py-2 focus:outline-none focus:border-[#315EFB] resize-none"
                />
              </div>
            )}
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
                Confirm Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── NC Detail Drawer ──────────────────────────────────────────
function NCDetailDrawer({
  nc,
  allNCs,
  onClose,
  onTransition,
}: {
  nc: NC;
  allNCs: NC[];
  onClose: () => void;
  onTransition: (id: string, status: NCStatus) => void;
}) {
  const project = PROJECTS.find(p => p.id === nc.projectId);
  const contractor = CONTRACTORS.find(c => c.id === nc.contractorId);
  const today = new Date();
  const isOverdue = new Date(nc.dueDate) < today && nc.status !== 'Closed';
  const availableTransitions = VALID_NC_TRANSITIONS[nc.status] ?? [];

  // Repeat issue cross-project history
  const relatedRepeats = nc.repeatCategory ? allNCs.filter(
    n => n.id !== nc.id && n.contractorId === nc.contractorId && n.repeatCategory === nc.repeatCategory
  ) : [];

  return (
    <Drawer
      open
      onClose={onClose}
      title={nc.id}
      subtitle={`${nc.severity} Finding · ${project?.name} · ${nc.tower}`}
      width="600px"
    >
      {/* Status + Actions */}
      <DrawerSection title="Lifecycle status & actions">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <StatusBadge status={nc.status} />
          <SeverityBadge severity={nc.severity} />
          {isOverdue && <OverdueBadge />}
          {nc.isRepeat && (
            <span className="text-xs font-medium text-[#B7791F] bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              Repeat Issue ({nc.repeatCategory})
            </span>
          )}
        </div>

        {availableTransitions.length > 0 && (
          <div className="bg-[#F9FAFB] p-3 rounded border border-[#E5E7EB]">
            <p className="text-xs font-medium text-[#697586] mb-2">Advance workflow state:</p>
            <div className="flex flex-wrap gap-2">
              {availableTransitions.map(status => (
                <button
                  key={status}
                  onClick={() => onTransition(nc.id, status)}
                  className={clsx(
                    'text-xs px-3 py-1.5 rounded border font-medium transition-colors',
                    status === 'Closed'
                      ? 'bg-[#16805D] text-white border-[#16805D] hover:bg-green-800'
                      : status === 'Rejected Verification'
                      ? 'bg-[#C63F43] text-white border-[#C63F43] hover:bg-red-800'
                      : 'bg-white text-[#315EFB] border-[#315EFB] hover:bg-blue-50'
                  )}
                >
                  {status === 'Closed' ? 'Verify & Close Finding' :
                   status === 'Rejected Verification' ? 'Reject Verification' :
                   status === 'Evidence Submitted' ? 'Submit Corrective Evidence' :
                   status === 'Verification' ? 'Send for QA Verification' :
                   status}
                </button>
              ))}
            </div>
            {nc.status === 'Verification' && (
              <p className="text-[11px] text-[#8792A2] mt-2">
                * Note: A finding cannot be closed without formal verification review.
              </p>
            )}
          </div>
        )}
      </DrawerSection>

      {/* Repeat Category History */}
      {relatedRepeats.length > 0 && (
        <DrawerSection title="Repeat issue visibility">
          <div className="border border-amber-200 bg-amber-50/50 rounded-lg p-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#B7791F] mb-1">
              <RefreshCw size={12} />
              <span>Contractor Repeat Pattern: {nc.repeatCategory}</span>
            </div>
            <p className="text-xs text-[#697586] mb-2">
              {contractor?.name} has {relatedRepeats.length} other recorded finding(s) in this exact category:
            </p>
            <div className="space-y-1.5">
              {relatedRepeats.map(rn => {
                const rProj = PROJECTS.find(p => p.id === rn.projectId);
                return (
                  <div key={rn.id} className="text-xs bg-white p-2 rounded border border-amber-200/80 flex items-center justify-between">
                    <div>
                      <strong className="text-[#20252D] font-mono">{rn.id}</strong>
                      <span className="text-[#697586] ml-2">{rProj?.name} ({rn.tower})</span>
                    </div>
                    <StatusBadge status={rn.status} />
                  </div>
                );
              })}
            </div>
          </div>
        </DrawerSection>
      )}

      {/* Finding Details */}
      <DrawerSection title="Finding description">
        <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded p-3 mb-3">
          <p className="text-sm text-[#20252D] leading-relaxed font-medium">{nc.finding}</p>
        </div>
        <div className="border border-[#E5E7EB] rounded-lg overflow-hidden">
          <FieldRow label="Project" value={project?.name ?? '—'} />
          <FieldRow label="Location" value={`${project?.city} · ${nc.tower}`} />
          <FieldRow label="Responsible contractor" value={contractor?.name ?? '—'} />
          <FieldRow label="Quality owner" value={nc.owner} />
          <FieldRow label="Date raised" value={nc.dateRaised} />
          <FieldRow label="Due date" value={nc.dueDate} />
          <FieldRow label="Days open" value={<span className={clsx(nc.age > 30 && nc.status !== 'Closed' ? 'text-[#C63F43] font-semibold' : '')}>{nc.age} days</span>} />
          {nc.linkedWIR && <FieldRow label="Linked WIR" value={<span className="font-mono text-[#315EFB] font-medium">{nc.linkedWIR}</span>} />}
        </div>
      </DrawerSection>

      {/* On-Site Defect Photo & Evidence */}
      <DrawerSection title="On-Site Inspection Defect Evidence">
        {nc.sitePhoto ? (
          <div className="space-y-3">
            <SitePhotoCard photo={nc.sitePhoto} title={`Mobile Defect Capture — ${nc.id}`} />
            <div className="grid grid-cols-2 gap-2">
              <div className="border border-[#CBD5E1] rounded-xl p-2.5 bg-[#F8FAFC] flex items-start gap-2">
                <Camera size={15} className="text-[#0F766E] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-[#0F172A]">GPS Geotag Verified</p>
                  <p className="text-[11px] text-[#64748B] truncate">{nc.sitePhoto.locationGPS}</p>
                </div>
              </div>
              <div className="border border-[#CBD5E1] rounded-xl p-2.5 bg-[#F8FAFC] flex items-start gap-2">
                <FileText size={15} className="text-[#315EFB] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-[#0F172A]">{nc.sitePhoto.isLabReport ? 'NABL Test Log' : 'Inspection Ticket'}</p>
                  <p className="text-[11px] text-[#64748B]">#{nc.id}-QA-RECORD</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <div className="border border-[#E5E7EB] rounded-xl p-2.5 bg-[#F9FAFB] flex items-start gap-2">
              <Camera size={16} className="text-[#315EFB] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-[#20252D]">Site Inspection Photo</p>
                <p className="text-[11px] text-[#8792A2]">Defect record #{nc.id}-IMG01.jpg</p>
                <span className="text-[10px] text-[#16805D] bg-green-50 px-1.5 py-0.2 rounded border border-green-200 mt-1 inline-block">Geo-tagged</span>
              </div>
            </div>
            <div className="border border-[#E5E7EB] rounded-xl p-2.5 bg-[#F9FAFB] flex items-start gap-2">
              <FileText size={16} className="text-[#315EFB] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-[#20252D]">NABL Lab Test Report</p>
                <p className="text-[11px] text-[#8792A2]">Certificate #IS-516-2025.pdf</p>
                <span className="text-[10px] text-[#B7791F] bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200 mt-1 inline-block">Verified by QA</span>
              </div>
            </div>
          </div>
        )}
      </DrawerSection>

      {/* Rectification Notes */}
      {nc.rectificationNotes && (
        <DrawerSection title="Rectification notes">
          <p className="text-sm text-[#20252D] bg-[#F9FAFB] border border-[#E5E7EB] rounded p-3">
            {nc.rectificationNotes}
          </p>
        </DrawerSection>
      )}

      {/* Verification outcome */}
      {nc.verificationOutcome && (
        <DrawerSection title="Verification outcome">
          <div className="bg-green-50 border border-green-200 rounded p-3">
            <p className="text-sm text-[#16805D] font-medium">{nc.verificationOutcome}</p>
          </div>
        </DrawerSection>
      )}

      {/* Activity History */}
      <DrawerSection title="Complete activity audit trail">
        <ActivityTimeline entries={nc.history} />
      </DrawerSection>
    </Drawer>
  );
}
