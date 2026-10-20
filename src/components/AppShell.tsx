// ============================================================
// APP SHELL — Shared Application Shell & Navigation
// Unified top navigation bar matching the design blueprint
// ============================================================

import React, { useState } from 'react';
import {
  Search, Bell, ChevronDown, Check,
  CheckCircle2, X
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
  { key: 'wir', label: 'WIR Inspections' },
  { key: 'quality', label: 'Audit & Quality' },
  { key: 'nc', label: 'Non-Compliance' },
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

export function AppShell({ children }: { children: React.ReactNode }) {
  const {
    state,
    setTab,
    setUserRole,
    setWeightsModalOpen,
  } = useApp();

  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
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
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] font-sans antialiased flex flex-col">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-[#0F172A] text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xl animate-in slide-in-from-top-2 duration-150">
          <CheckCircle2 size={15} className="text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ============================================================
          TOP APPLICATION HEADER (Exact Match to Mockup)
          Logo | Tabs (Overview, WIP, WIR...) | Search | Bell | CX Avatar
          ============================================================ */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#E2E8F0] h-14 px-6 flex items-center justify-between shadow-2xs">
        {/* Left: Brand Logo */}
        <div
          onClick={() => setTab('overview')}
          className="flex items-center gap-2 cursor-pointer group flex-shrink-0"
        >
          {/* Architectural 3-bar green logo + BOMBAYDC text */}
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-[#16805D]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 4h3v16H4V4zm6-2h3v18h-3V2zm6 5h3v13h-3V7z" />
            </svg>
            <span className="font-extrabold text-sm tracking-tight text-[#0F172A] uppercase">
              BOMBAY<span className="font-semibold text-[#16805D]">DC</span>
            </span>
          </div>
        </div>

        {/* Center: Navigation Tabs */}
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
                  'px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all',
                  active
                    ? 'bg-[#EBF3FE] text-[#1E293B] font-bold shadow-2xs'
                    : 'text-[#64748B] hover:text-[#0F172A] hover:bg-slate-50'
                )}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right: Search, Notification, Role Avatar */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Search Box */}
          <div className="relative hidden md:block">
            <Search size={14} className="absolute left-3 top-2.5 text-[#94A3B8]" />
            <input
              type="text"
              placeholder="Search..."
              className="h-8 w-48 pl-8 pr-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-xs text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#315EFB] transition-colors"
            />
          </div>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative w-8 h-8 rounded-lg bg-white hover:bg-slate-50 border border-[#E2E8F0] flex items-center justify-center text-[#64748B] hover:text-[#0F172A] transition-colors"
              title="Notifications"
            >
              <Bell size={15} />
              {(openCritNCs > 0 || overdueWIRs > 0) && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#EF4444] rounded-full ring-2 ring-white" />
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-[#E2E8F0] rounded-2xl shadow-xl p-3 z-50 animate-in fade-in">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-900">Urgent Portfolio Alerts</span>
                  <span className="text-[10px] font-bold bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded">
                    {openCritNCs + overdueWIRs} Urgent
                  </span>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto text-xs">
                  {openCritNCs > 0 && (
                    <div
                      onClick={() => {
                        setTab('nc');
                        setNotifOpen(false);
                      }}
                      className="p-2 rounded-lg bg-rose-50 border border-rose-200 cursor-pointer hover:bg-rose-100 transition-colors"
                    >
                      <p className="font-bold text-rose-900">
                        {openCritNCs} Critical Non-Compliances Open
                      </p>
                      <p className="text-[11px] text-rose-700 mt-0.5">
                        Riverstone Towers: Cube test failure & column honeycombing
                      </p>
                    </div>
                  )}
                  {overdueWIRs > 0 && (
                    <div
                      onClick={() => {
                        setTab('wir');
                        setNotifOpen(false);
                      }}
                      className="p-2 rounded-lg bg-amber-50 border border-amber-200 cursor-pointer hover:bg-amber-100 transition-colors"
                    >
                      <p className="font-bold text-amber-900">
                        {overdueWIRs} WIRs Awaiting Review &gt; 7d SLA
                      </p>
                      <p className="text-[11px] text-amber-700 mt-0.5">
                        Inspection turnaround bottleneck holding up concrete pours
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* CX Avatar Button */}
          <div className="relative">
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="flex items-center gap-1.5 p-0.5 rounded-full hover:ring-2 hover:ring-slate-200 transition-all"
            >
              <div className="w-8 h-8 rounded-full bg-[#0F172A] text-white flex items-center justify-center text-xs font-bold shadow-2xs">
                CX
              </div>
              <ChevronDown size={12} className="text-[#64748B]" />
            </button>

            {roleDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-[#E2E8F0] rounded-2xl shadow-xl p-2 z-50 animate-in fade-in">
                <div className="px-2.5 py-1.5 border-b border-slate-100 mb-1">
                  <p className="text-xs font-bold text-slate-900">User Role Simulator</p>
                  <p className="text-[10px] text-slate-500">Switch persona view</p>
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
                          ? 'bg-blue-50 text-blue-900 font-bold'
                          : 'text-[#1E293B] hover:bg-slate-50'
                      )}
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span>{r.title}</span>
                          {state.userRole === r.role && <Check size={13} className="text-blue-600" />}
                        </div>
                        <p className="text-[10px] text-slate-400 font-normal mt-0.5 leading-snug">
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
          MAIN CONTENT AREA
          ============================================================ */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto px-6 py-5">
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
