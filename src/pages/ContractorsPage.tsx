// ============================================================
// CONTRACTORS PAGE
// ============================================================

import React, { useState, useMemo } from 'react';
import clsx from 'clsx';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, ExternalLink } from 'lucide-react';
import { useApp } from '../store/appStore';
import { getAllContractorMetrics, type ContractorMetrics } from '../data/calculations';
import { PROJECTS, CONTRACTORS, type WIR, type NC } from '../data/seedData';
import {
  SeverityBadge, StatusBadge, SortableTh, FilterSelect, SearchInput,
  EmptyState, PageHeader, Drawer, DrawerSection, FieldRow,
} from '../components/ui';

const REGION_OPTIONS = [...new Set(PROJECTS.map(p => p.region))].map(r => ({ value: r, label: r }));
const CITY_OPTIONS = [...new Set(PROJECTS.map(p => p.city))].map(c => ({ value: c, label: c }));
const PROJECT_OPTIONS = PROJECTS.map(p => ({ value: p.id, label: p.name }));
const CONTRACTOR_OPTIONS = CONTRACTORS.map(c => ({ value: c.id, label: c.name }));

export function ContractorsPage() {
  const { state, setFilter, resetFilters, selectContractor, setTab, selectWIR, selectNC } = useApp();
  const [sort, setSort] = useState<{ key: string; dir: 'asc' | 'desc' }>({ key: 'firstTimePassRate', dir: 'asc' });

  const allMetrics = useMemo(() => getAllContractorMetrics(state.wirs, state.ncs), [state.wirs, state.ncs]);

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
    if (state.filters.contractor) {
      rows = rows.filter(m => m.contractor.id === state.filters.contractor);
    }
    if (state.filters.search) {
      const q = state.filters.search.toLowerCase();
      rows = rows.filter(m => m.contractor.name.toLowerCase().includes(q) || m.contractor.type.toLowerCase().includes(q));
    }
    return rows;
  }, [allMetrics, state.filters]);

  // Sort: default worst first-pass rate first
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let av: number, bv: number;
      switch (sort.key) {
        case 'firstTimePassRate': av = a.firstTimePassRate; bv = b.firstTimePassRate; break;
        case 'openNCs': av = a.openNCs; bv = b.openNCs; break;
        case 'totalWIRs': av = a.totalWIRs; bv = b.totalWIRs; break;
        case 'avgNCClosureTime': av = a.avgNCClosureTime; bv = b.avgNCClosureTime; break;
        case 'name': return sort.dir === 'asc'
          ? a.contractor.name.localeCompare(b.contractor.name)
          : b.contractor.name.localeCompare(a.contractor.name);
        default: av = a.firstTimePassRate; bv = b.firstTimePassRate;
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

  const hasFilters = Object.values(state.filters).some(v => v !== '');

  return (
    <div>
      <PageHeader
        title="Contractors"
        subtitle="Cross-project contractor quality ranking, first-time pass rates and repeat defect accountability."
      />

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap mb-5">
        <FilterSelect label="Region" value={state.filters.region} options={REGION_OPTIONS} onChange={v => setFilter('region', v)} />
        <FilterSelect label="City" value={state.filters.city} options={CITY_OPTIONS} onChange={v => setFilter('city', v)} />
        <FilterSelect label="Project" value={state.filters.project} options={PROJECT_OPTIONS} onChange={v => setFilter('project', v)} />
        <FilterSelect label="Contractor" value={state.filters.contractor} options={CONTRACTOR_OPTIONS} onChange={v => setFilter('contractor', v)} />
        <SearchInput value={state.filters.search} onChange={v => setFilter('search', v)} placeholder="Search contractor or trade…" />
        {hasFilters && (
          <button onClick={resetFilters} className="text-xs text-[#697586] hover:text-[#20252D] underline">Reset filters</button>
        )}
      </div>

      {/* Contractor Table */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-[#0F172A]">Contractor Quality Performance</h2>
          <span className="text-xs text-[#94A3B8]">{sorted.length} contractor{sorted.length !== 1 ? 's' : ''} · Sorted by poorest first-pass rate</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px]">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                <SortableTh label="Contractor" sortKey="name" currentSort={sort} onSort={handleSort} className="pl-4" />
                <th className="text-left text-xs font-medium text-[#697586] uppercase tracking-wide px-3 py-2.5">Trade / Scope</th>
                <th className="text-left text-xs font-medium text-[#697586] uppercase tracking-wide px-3 py-2.5">Active Projects</th>
                <SortableTh label="Inspected WIRs" sortKey="totalWIRs" currentSort={sort} onSort={handleSort} />
                <SortableTh label="1st-Pass Rate" sortKey="firstTimePassRate" currentSort={sort} onSort={handleSort} />
                <SortableTh label="Open NCs" sortKey="openNCs" currentSort={sort} onSort={handleSort} />
                <th className="text-left text-xs font-medium text-[#697586] uppercase tracking-wide px-3 py-2.5">Crit. NCs</th>
                <SortableTh label="Avg Close Time" sortKey="avgNCClosureTime" currentSort={sort} onSort={handleSort} />
                <th className="text-left text-xs font-medium text-[#697586] uppercase tracking-wide px-3 py-2.5">Repeats</th>
                <th className="text-left text-xs font-medium text-[#697586] uppercase tracking-wide px-3 py-2.5">Trend</th>
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 ? (
                <tr><td colSpan={10}><EmptyState message="No contractors match the current filters." /></td></tr>
              ) : sorted.map(m => {
                const projectNames = m.projects.map(pid => PROJECTS.find(p => p.id === pid)?.name ?? '').join(', ');
                return (
                  <tr
                    key={m.contractor.id}
                    className="border-b border-[#F3F4F6] last:border-0 table-row-hover"
                    onClick={() => selectContractor(m.contractor.id)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-[#20252D]">{m.contractor.name}</span>
                        {m.limitedEvidence && (
                          <span className="text-[10px] text-[#8792A2] bg-[#F3F4F6] px-1.5 py-0.5 rounded border border-[#E5E7EB]">
                            Limited evidence (&lt;5 WIRs)
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-xs text-[#697586]">{m.contractor.type}</td>
                    <td className="px-3 py-3 text-xs text-[#697586] max-w-[160px] truncate" title={projectNames}>{projectNames}</td>
                    <td className="px-3 py-3 text-sm text-[#697586]">{m.totalWIRs}</td>
                    <td className="px-3 py-3">
                      <span className={clsx('text-sm font-bold',
                        m.firstTimePassRate >= 80 ? 'text-[#16805D]' :
                        m.firstTimePassRate >= 60 ? 'text-[#B7791F]' : 'text-[#C63F43]'
                      )}>
                        {m.firstTimePassRate}%
                      </span>
                    </td>
                    <td className="px-3 py-3 text-sm text-[#697586] font-medium">{m.openNCs}</td>
                    <td className="px-3 py-3">
                      {m.criticalOpenNCs > 0 ? (
                        <span className="text-sm font-bold text-[#C63F43]">{m.criticalOpenNCs}</span>
                      ) : (
                        <span className="text-sm text-[#8792A2]">—</span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-sm text-[#697586]">
                      {m.avgNCClosureTime > 0 ? `${m.avgNCClosureTime}d` : '—'}
                    </td>
                    <td className="px-3 py-3">
                      {m.repeatNCCount > 0 ? (
                        <span className="text-xs font-semibold text-[#B7791F] bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                          {m.repeatNCCount} repeat
                        </span>
                      ) : (
                        <span className="text-xs text-[#8792A2]">0</span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <TrendIcon trend={m.trend} />
                    </td>
                  </tr>
                );
              })}
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
        />
      )}
    </div>
  );
}

// ── Trend Icon ────────────────────────────────────────────────
function TrendIcon({ trend }: { trend: 'improving' | 'declining' | 'stable' }) {
  if (trend === 'improving') return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-[#16805D]">
      <TrendingUp size={13} /> Improving
    </span>
  );
  if (trend === 'declining') return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-[#C63F43]">
      <TrendingDown size={13} /> Declining
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 text-xs text-[#8792A2]">
      <Minus size={13} /> Stable
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
}: {
  metrics: ContractorMetrics;
  wirs: WIR[];
  ncs: NC[];
  onClose: () => void;
  onViewWIR: (id: string) => void;
  onViewNC: (id: string) => void;
}) {
  const contractorWIRs = wirs.filter(w => w.contractorId === m.contractor.id);
  const contractorNCs = ncs.filter(n => n.contractorId === m.contractor.id);
  const openNCs = contractorNCs.filter(n => n.status !== 'Closed');

  // NC by severity
  const severityCounts = {
    Critical: openNCs.filter(n => n.severity === 'Critical').length,
    High: openNCs.filter(n => n.severity === 'High').length,
    Medium: openNCs.filter(n => n.severity === 'Medium').length,
    Low: openNCs.filter(n => n.severity === 'Low').length,
  };

  // Recent WIRs
  const recentWIRs = [...contractorWIRs].sort((a, b) => b.submittedDate.localeCompare(a.submittedDate)).slice(0, 6);

  // Repeat categories
  const repeatCategories = [...new Set(
    contractorNCs.filter(n => n.isRepeat && n.repeatCategory).map(n => n.repeatCategory!)
  )];

  const projectNames = m.projects.map(pid => PROJECTS.find(p => p.id === pid)?.name ?? '').filter(Boolean);
  const isMultiProject = m.projects.length > 1;

  return (
    <Drawer
      open
      onClose={onClose}
      title={m.contractor.name}
      subtitle={`${m.contractor.type} · ${isMultiProject ? 'Multi-Project Contractor' : 'Single Site Contractor'}`}
      width="600px"
    >
      {/* Overall Performance */}
      <DrawerSection title="Portfolio Quality Summary">
        <div className="grid grid-cols-3 gap-3 mb-3">
          <div className="border border-[#E5E7EB] rounded-lg p-3 text-center bg-[#FAFAFC]">
            <div className={clsx('text-2xl font-bold',
              m.firstTimePassRate >= 80 ? 'text-[#16805D]' : m.firstTimePassRate >= 60 ? 'text-[#B7791F]' : 'text-[#C63F43]'
            )}>
              {m.firstTimePassRate}%
            </div>
            <div className="text-xs text-[#697586] mt-0.5">1st-Pass Approval Rate</div>
          </div>
          <div className="border border-[#E5E7EB] rounded-lg p-3 text-center bg-[#FAFAFC]">
            <div className={clsx('text-2xl font-bold', m.openNCs > 3 ? 'text-[#C63F43]' : 'text-[#20252D]')}>
              {m.openNCs}
            </div>
            <div className="text-xs text-[#697586] mt-0.5">Open Quality Findings</div>
          </div>
          <div className="border border-[#E5E7EB] rounded-lg p-3 text-center bg-[#FAFAFC]">
            <div className="text-2xl font-bold text-[#20252D]">{m.totalWIRs}</div>
            <div className="text-xs text-[#697586] mt-0.5">Inspections Completed</div>
          </div>
        </div>

        <div className="border border-[#E5E7EB] rounded-lg overflow-hidden">
          <FieldRow label="Contractor Type" value={m.contractor.type} />
          <FieldRow label="Project Footprint" value={projectNames.join(', ')} />
          <FieldRow label="Avg NC Resolution" value={m.avgNCClosureTime > 0 ? `${m.avgNCClosureTime} days` : '—'} />
          <FieldRow label="Repeat Issue Flag" value={
            m.repeatNCCount > 0 ? (
              <span className="text-xs font-semibold text-[#B7791F]">
                {m.repeatNCCount} repeat issues ({repeatCategories.join(', ')})
              </span>
            ) : 'No repeat patterns identified'
          } />
          <FieldRow label="Performance Trend" value={<TrendIcon trend={m.trend} />} />
        </div>
      </DrawerSection>

      {/* Cross-project breakdown */}
      {isMultiProject && (
        <DrawerSection title="Cross-project accountability">
          <div className="space-y-2 mb-2">
            {m.projects.map(pid => {
              const proj = PROJECTS.find(p => p.id === pid);
              const projWIRs = contractorWIRs.filter(w => w.projectId === pid);
              const projNCs = contractorNCs.filter(n => n.projectId === pid);
              const decided = projWIRs.filter(w => w.status === 'Approved' || w.status === 'Rejected');
              const passRate = decided.length > 0
                ? Math.round(decided.filter(w => w.firstPassResult === 'Pass').length / decided.length * 100)
                : 0;
              const openProjNCs = projNCs.filter(n => n.status !== 'Closed').length;
              return (
                <div key={pid} className="flex items-center justify-between p-3 border border-[#E5E7EB] rounded-xl bg-[#FAFAFC]">
                  <div className="flex items-center gap-2.5">
                    {proj?.image && (
                      <img
                        src={proj.image}
                        alt={proj.name}
                        className="w-8 h-8 rounded-lg object-cover border border-[#CBD5E1] flex-shrink-0"
                      />
                    )}
                    <div>
                      <span className="text-sm font-semibold text-[#20252D]">{proj?.name}</span>
                      <span className="text-xs text-[#8792A2] ml-1.5">({proj?.city})</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <span className={clsx('font-bold', passRate >= 80 ? 'text-[#16805D]' : passRate >= 60 ? 'text-[#B7791F]' : 'text-[#C63F43]')}>
                      {passRate}% pass
                    </span>
                    <span className="text-[#697586]">{projWIRs.length} WIRs</span>
                    <span className={clsx('font-medium', openProjNCs > 0 ? 'text-[#C63F43]' : 'text-[#16805D]')}>
                      {openProjNCs} open NCs
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="p-2.5 rounded bg-amber-50 border border-amber-200 text-xs text-[#B7791F] flex items-start gap-2">
            <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
            <span>
              {m.firstTimePassRate < 60
                ? `System finding: Low quality performance is not isolated to a single site supervisor. It spans ${m.projects.length} separate projects, indicating systemic contractor workmanship or training deficiency.`
                : `Quality standards are consistently maintained across all ${m.projects.length} sites.`}
            </span>
          </div>
        </DrawerSection>
      )}

      {/* Open NCs by Severity */}
      {openNCs.length > 0 && (
        <DrawerSection title={`Open NCs by Severity (${openNCs.length})`}>
          <div className="space-y-2">
            {openNCs.map(nc => {
              const proj = PROJECTS.find(p => p.id === nc.projectId);
              return (
                <div key={nc.id} className="border border-[#E5E7EB] rounded p-3 bg-white">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-mono font-medium text-[#315EFB]">{nc.id}</span>
                      <SeverityBadge severity={nc.severity} />
                      <StatusBadge status={nc.status} />
                    </div>
                    <button
                      onClick={() => onViewNC(nc.id)}
                      className="text-xs text-[#315EFB] hover:underline flex items-center gap-0.5"
                    >
                      View NC <ExternalLink size={10} />
                    </button>
                  </div>
                  <p className="text-xs text-[#20252D] font-medium mt-1.5">{nc.finding}</p>
                  <p className="text-xs text-[#8792A2] mt-1">{proj?.name} · {nc.tower} · {nc.age}d open</p>
                </div>
              );
            })}
          </div>
        </DrawerSection>
      )}

      {/* Recent WIR history */}
      <DrawerSection title="Recent Work Inspection Requests">
        <div className="border border-[#E5E7EB] rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                <th className="text-left text-xs font-medium text-[#697586] px-3 py-2">WIR ID</th>
                <th className="text-left text-xs font-medium text-[#697586] px-3 py-2">Project</th>
                <th className="text-left text-xs font-medium text-[#697586] px-3 py-2">Activity</th>
                <th className="text-left text-xs font-medium text-[#697586] px-3 py-2">Status</th>
                <th className="text-left text-xs font-medium text-[#697586] px-3 py-2">1st Pass</th>
              </tr>
            </thead>
            <tbody>
              {recentWIRs.map(wir => {
                const proj = PROJECTS.find(p => p.id === wir.projectId);
                return (
                  <tr
                    key={wir.id}
                    className="border-b border-[#F3F4F6] last:border-0 hover:bg-[#F9FAFB] cursor-pointer"
                    onClick={() => onViewWIR(wir.id)}
                  >
                    <td className="px-3 py-2 text-xs font-mono font-medium text-[#315EFB]">{wir.id}</td>
                    <td className="px-3 py-2 text-xs text-[#697586]">{proj?.name}</td>
                    <td className="px-3 py-2 text-xs text-[#20252D] max-w-[140px] truncate">{wir.activity}</td>
                    <td className="px-3 py-2"><StatusBadge status={wir.status} /></td>
                    <td className="px-3 py-2">
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
      </DrawerSection>
    </Drawer>
  );
}
