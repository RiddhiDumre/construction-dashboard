// ============================================================
// APP SHELL — Shared Application Shell & Navigation
// Apple-inspired restraint: compact 56px navigation bar,
// clear information hierarchy, subtle dividers, quiet chrome.
// ============================================================

import React, { useState } from 'react';
import {
  Search, Bell, ChevronDown, Check,
  CheckCircle2, Calendar, MapPin
} from 'lucide-react';
import clsx from 'clsx';
import { useApp, type TabKey, type UserRole } from '../store/appStore';
import { AdminModal } from './AdminModal';
import { WeightsConfigModal } from './WeightsConfigModal';
import { ActivityDetailDrawer } from './ActivityDetailDrawer';
import { AuditDetailDrawer } from './AuditDetailDrawer';

const NAV_ITEMS: { key: TabKey; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'wip', label: 'WIP' },
  { key: 'sales', label: 'Commercial Units' },
  { key: 'wir', label: 'WIR' },
  { key: 'nc', label: 'Non-Compliance' },
  { key: 'quality', label: 'Quality' },
  { key: 'contractors', label: 'Contractors' },
];

const USER_ROLES: { role: UserRole; title: string; desc: string }[] = [
  { role: 'CXO', title: 'CXO / Leadership', desc: 'Portfolio-wide risks, RAG status & high-level health' },
  { role: 'ProjectsHead', title: 'Projects Head', desc: 'Construction milestones, delayed towers & schedule variance' },
  { role: 'ProjectManager', title: 'Project Manager', desc: 'Assigned site activities, contractor handoffs & blockers' },
  { role: 'QualityInspector', title: 'Quality Inspector', desc: 'Assigned WIRs, site defect inspections & verification' },
  { role: 'Contractor', title: 'Contractor', desc: 'Contractor-specific activities, re-inspection & corrective evidence' },
  { role: 'Admin', title: 'System Administrator', desc: 'User & role permissions, project allocation & security matrix' },
];

const REPORTING_PERIODS = [
  'Q3 FY25',
  'Q2 FY25',
  'Q1 FY25',
  'FY24',
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const {
    state,
    setTab,
    setUserRole,
    setFilter,
  } = useApp();

  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [periodDropdownOpen, setPeriodDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Badges
  const openCritNCs = state.ncs.filter(n => n.severity === 'Critical' && n.status !== 'Closed').length;
  const overdueWIRs = state.wirs.filter(w => w.slaBreach && (w.status === 'Submitted' || w.status === 'Awaiting Review')).length;

  return (
    <div className="h-screen bg-[#F6F7F8] text-[#17191D] font-sans antialiased flex flex-col overflow-hidden">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-[#17191D] text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xl animate-in slide-in-from-top-2 duration-150">
          <CheckCircle2 size={15} className="text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ============================================================
          COMPACT TOP NAVIGATION (56px high)
          Left: Logo | Divider | Page Title
          Center: Overview | WIP | WIR | Non-Compliance | Quality | Contractors
          Right: Period Selector | Search | Notifications | Profile
          ============================================================ */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#E5E7EB] h-14 px-6 flex items-center justify-between">
        {/* Left: Brand Logo & Title */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div
            onClick={() => setTab('overview')}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <svg className="w-5 h-5 text-[#00594F]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 4h3v16H4V4zm6-2h3v18h-3V2zm6 5h3v13h-3V7z" />
            </svg>
            <span className="font-extrabold text-xs tracking-tight text-[#17191D] uppercase">
              BOMBAY<span className="font-semibold text-[#00594F]">DC</span>
            </span>
          </div>

          <div className="h-4 w-px bg-[#E5E7EB]" />

          <span className="text-xs font-medium text-[#737B88] tracking-tight hidden sm:inline">
            Construction Portfolio
          </span>
        </div>

        {/* Center: Primary Navigation Links */}
        <nav className="flex items-center gap-1 overflow-x-auto scrollbar-none px-4">
          {NAV_ITEMS.map(item => {
            const active =
              state.activeTab === item.key ||
              (item.key === 'overview' && state.activeTab === 'portfolio');

            return (
              <button
                key={item.key}
                onClick={() => setTab(item.key)}
                className={clsx(
                  'px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all',
                  active
                    ? 'bg-[#F1F5F9] text-[#17191D] font-semibold'
                    : 'text-[#737B88] hover:text-[#17191D] hover:bg-slate-50'
                )}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right: Period, Search, Notifications, Avatar */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          {/* Period Selector */}
          <div className="relative hidden md:block">
            <button
              onClick={() => setPeriodDropdownOpen(!periodDropdownOpen)}
              className="flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-[#E5E7EB] bg-white hover:bg-slate-50 text-xs font-medium text-[#17191D] transition-colors"
            >
              <span>{state.filters.reportingPeriod || 'Q3 FY25'}</span>
              <ChevronDown size={12} className="text-[#737B88]" />
            </button>

            {periodDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-36 bg-white border border-[#E5E7EB] rounded-xl shadow-lg p-1.5 z-50 animate-in fade-in">
                {REPORTING_PERIODS.map(p => (
                  <button
                    key={p}
                    onClick={() => {
                      setFilter('reportingPeriod', p);
                      setPeriodDropdownOpen(false);
                      triggerToast(`Period set to ${p}`);
                    }}
                    className={clsx(
                      'w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between',
                      (state.filters.reportingPeriod || 'Q3 FY25') === p
                        ? 'bg-slate-100 text-[#17191D] font-semibold'
                        : 'text-[#737B88] hover:bg-slate-50'
                    )}
                  >
                    <span>{p}</span>
                    {(state.filters.reportingPeriod || 'Q3 FY25') === p && <Check size={12} />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search Input Box */}
          <div className="relative hidden lg:block">
            <Search size={13} className="absolute left-2.5 top-2.5 text-[#94A3B8]" />
            <input
              type="text"
              placeholder="Search..."
              className="h-8 w-40 pl-7 pr-2.5 rounded-lg bg-white border border-[#E5E7EB] text-xs text-[#17191D] placeholder-[#94A3B8] focus:outline-none focus:border-[#00594F] transition-colors"
            />
          </div>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative w-8 h-8 rounded-lg bg-white hover:bg-slate-50 border border-[#E5E7EB] flex items-center justify-center text-[#737B88] hover:text-[#17191D] transition-colors"
              title="Notifications"
            >
              <Bell size={14} />
              {(openCritNCs > 0 || overdueWIRs > 0) && (
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#C63F43] rounded-full" />
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-[#E5E7EB] rounded-2xl shadow-xl p-3 z-50 animate-in fade-in">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                  <span className="text-xs font-semibold text-[#17191D]">Portfolio Alerts</span>
                  <span className="text-[10px] font-semibold text-[#C63F43] bg-rose-50 px-1.5 py-0.5 rounded">
                    {openCritNCs + overdueWIRs} Active
                  </span>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto text-xs">
                  {openCritNCs > 0 && (
                    <div
                      onClick={() => {
                        setTab('nc');
                        setNotifOpen(false);
                      }}
                      className="p-2 rounded-lg bg-rose-50/70 border border-rose-100 cursor-pointer hover:bg-rose-100/70 transition-colors"
                    >
                      <p className="font-semibold text-rose-900">
                        {openCritNCs} Critical Defect Holds
                      </p>
                      <p className="text-[11px] text-rose-700 mt-0.5">
                        Riverstone Towers: Cube test failure & honeycombing
                      </p>
                    </div>
                  )}
                  {overdueWIRs > 0 && (
                    <div
                      onClick={() => {
                        setTab('wir');
                        setNotifOpen(false);
                      }}
                      className="p-2 rounded-lg bg-amber-50/70 border border-amber-100 cursor-pointer hover:bg-amber-100/70 transition-colors"
                    >
                      <p className="font-semibold text-amber-900">
                        {overdueWIRs} Overdue WIR Inspections
                      </p>
                      <p className="text-[11px] text-amber-700 mt-0.5">
                        Inspection turnaround exceeding 7-day SLA
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* CX User Avatar */}
          <div className="relative">
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="flex items-center gap-1 p-0.5 rounded-full hover:ring-2 hover:ring-slate-200 transition-all"
            >
              <div className="w-7 h-7 rounded-full bg-[#17191D] text-white flex items-center justify-center text-[11px] font-semibold">
                CX
              </div>
              <ChevronDown size={11} className="text-[#737B88]" />
            </button>

            {roleDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-[#E5E7EB] rounded-2xl shadow-xl p-2 z-50 animate-in fade-in">
                <div className="px-2.5 py-1.5 border-b border-slate-100 mb-1">
                  <p className="text-xs font-semibold text-[#17191D]">User Role</p>
                  <p className="text-[10px] text-[#737B88]">Switch persona view</p>
                </div>
                <div className="space-y-1">
                  {USER_ROLES.map(r => (
                    <button
                      key={r.role}
                      onClick={() => {
                        setUserRole(r.role);
                        setRoleDropdownOpen(false);
                        triggerToast(`Switched view to ${r.title}`);
                      }}
                      className={clsx(
                        'w-full text-left p-2 rounded-xl text-xs transition-colors flex items-start justify-between',
                        state.userRole === r.role
                          ? 'bg-slate-100 text-[#17191D] font-semibold'
                          : 'text-[#737B88] hover:bg-slate-50'
                      )}
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span>{r.title}</span>
                          {state.userRole === r.role && <Check size={12} className="text-[#00594F]" />}
                        </div>
                        <p className="text-[10px] text-[#737B88] font-normal mt-0.5 leading-snug">
                          {r.desc}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ============================================================
          MAIN VIEWPORT CONTAINER
          ============================================================ */}
      <main className="flex-1 overflow-auto w-full max-w-[1600px] mx-auto px-6 py-5">
        {children}
      </main>

      {/* Shared Modals & Record Drawers */}
      <AdminModal />
      <WeightsConfigModal />
      {state.selectedActivityId && (
        <ActivityDetailDrawer
          activityId={state.selectedActivityId}
          onClose={() => useApp().selectActivity(null)}
        />
      )}
      {state.selectedAuditId && (
        <AuditDetailDrawer
          auditId={state.selectedAuditId}
          onClose={() => useApp().selectAudit(null)}
        />
      )}
    </div>
  );
}
