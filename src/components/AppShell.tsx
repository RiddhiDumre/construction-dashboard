// ============================================================
// APP SHELL — Shared Application Shell & Horizontal Navigation
// Linear-inspired visual discipline: crisp borders, neutral surfaces,
// compact header, horizontal navigation, global geographic & role selectors
// ============================================================

import React, { useState } from 'react';
import {
  Search, Download, RefreshCcw, ChevronDown, Check,
  PlayCircle, X, ChevronRight, Sparkles, Bell, Menu,
  Sliders, Shield, SlidersHorizontal, CheckCircle2,
  Calendar, MapPin, User, LayoutDashboard, Construction,
  ClipboardCheck, Award, AlertTriangle, Users
} from 'lucide-react';
import clsx from 'clsx';
import { useApp, type TabKey, type UserRole } from '../store/appStore';
import { PROJECTS, CONTRACTORS } from '../data/seedData';
import { AdminModal } from './AdminModal';
import { WeightsConfigModal } from './WeightsConfigModal';
import { ActivityDetailDrawer } from './ActivityDetailDrawer';
import { AuditDetailDrawer } from './AuditDetailDrawer';

const NAV_ITEMS: { key: TabKey; label: string; icon: React.ComponentType<{ size: number; className?: string }> }[] = [
  { key: 'overview', label: 'Overview', icon: LayoutDashboard },
  { key: 'wip', label: 'WIP — Work in Progress', icon: Construction },
  { key: 'wir', label: 'WIR Inspections', icon: ClipboardCheck },
  { key: 'quality', label: 'Audit & Quality', icon: Award },
  { key: 'nc', label: 'Non-Compliance', icon: AlertTriangle },
  { key: 'contractors', label: 'Contractors', icon: Users },
];

const CITIES = [
  'All locations',
  'Mumbai',
  'Thane',
  'Navi Mumbai',
  'Pune',
  'Bengaluru',
  'Hyderabad',
  'Gurugram',
];

const REPORTING_PERIODS = [
  'Q3 FY25 (Current)',
  'Last 30 Days',
  'Last 90 Days',
  'FY 2025-26',
];

const USER_ROLES: { role: UserRole; title: string; desc: string }[] = [
  { role: 'CXO', title: 'CEO / CXO', desc: 'Portfolio-wide risks, RAG status & high-level health' },
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
    setFilter,
    resetFilters,
    resetDemo,
    selectActivity,
    selectAudit,
    setWeightsModalOpen,
  } = useApp();

  const [searchOpen, setSearchOpen] = useState(false);
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const [periodDropdownOpen, setPeriodDropdownOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Tour state
  const [tourOpen, setTourOpen] = useState(false);
  const [tourStep, setTourStep] = useState(0);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Badges
  const openCritNCs = state.ncs.filter(n => n.severity === 'Critical' && n.status !== 'Closed').length;
  const overdueWIRs = state.wirs.filter(w => w.slaBreach && (w.status === 'Submitted' || w.status === 'Awaiting Review')).length;
  const delayedActs = state.wipActivities.filter(a => a.status === 'Delayed' || a.status === 'Blocked').length;

  // Handle CSV export of the active view
  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    const timestamp = new Date().toISOString().slice(0, 10);

    if (state.activeTab === 'overview') {
      csvContent += 'Project ID,Project Name,City,Stage,Progress %,Target %,Quality Score\n';
      PROJECTS.forEach(p => {
        csvContent += `"${p.id}","${p.name}","${p.city}","${p.stage}","${p.progressPercentage}%","${p.targetProgressPercentage}%","${p.progressPercentage}"\n`;
      });
    } else if (state.activeTab === 'wip') {
      csvContent += 'Activity ID,Project,Tower,Floor,Work Package,Status,Actual %,Planned %,Variance Days\n';
      state.wipActivities.forEach(a => {
        csvContent += `"${a.id}","${a.projectId}","${a.tower}","${a.floor}","${a.workPackage}","${a.status}","${a.actualProgress}%","${a.plannedProgress}%","${a.varianceDays}"\n`;
      });
    } else if (state.activeTab === 'wir') {
      csvContent += 'WIR ID,Project,Tower,Floor,Activity,Contractor,Reviewer,Status,First Pass\n';
      state.wirs.forEach(w => {
        csvContent += `"${w.id}","${w.projectId}","${w.tower}","${w.floor || ''}","${w.activity}","${w.contractorId}","${w.reviewer}","${w.status}","${w.firstPassResult}"\n`;
      });
    } else if (state.activeTab === 'nc') {
      csvContent += 'NC ID,Project,Tower,Category,Severity,Status,Date Raised,Due Date,Finding\n';
      state.ncs.forEach(n => {
        csvContent += `"${n.id}","${n.projectId}","${n.tower}","${n.category}","${n.severity}","${n.status}","${n.dateRaised}","${n.dueDate}","${n.finding.replace(/"/g, '""')}"\n`;
      });
    } else {
      csvContent += 'Contractor ID,Name,Trade,Projects\n';
      CONTRACTORS.forEach(c => {
        csvContent += `"${c.id}","${c.name}","${c.type}","${c.projects.join('; ')}"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `BombayDC_${state.activeTab}_${timestamp}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    triggerToast(`Exported ${state.activeTab.toUpperCase()} data to CSV`);
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#20252D] font-sans antialiased flex flex-col">
      {/* Toast Notification Container */}
      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-[#20252D] text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xl animate-in slide-in-from-top-2 duration-150">
          <CheckCircle2 size={15} className="text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ============================================================
          TOP APPLICATION HEADER (Slim Executive Shell)
          ============================================================ */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#E5E7EB] h-14 px-6 flex items-center justify-between shadow-2xs">
        {/* Left: Brand & Product Name */}
        <div className="flex items-center gap-5">
          <div
            onClick={() => setTab('overview')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <img
              src="/logo.png"
              alt="BombayDC"
              className="h-7 w-auto object-contain transition-transform group-hover:scale-[1.02] mix-blend-multiply"
            />
            <div className="h-4 w-px bg-[#E5E7EB] mx-1 hidden sm:block" />
            <span className="text-xs font-bold tracking-tight text-[#20252D] hidden sm:inline whitespace-nowrap">
              Construction Portfolio
            </span>
          </div>

          {/* DEMO DATA Indicator Pill */}
          <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-[#697586] border border-slate-200">
            Demo Data
          </span>

          {/* Reporting Period Selector */}
          <div className="relative hidden lg:block">
            <button
              onClick={() => {
                setPeriodDropdownOpen(!periodDropdownOpen);
                setCityDropdownOpen(false);
                setRoleDropdownOpen(false);
              }}
              className="flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-[#E5E7EB] bg-[#F7F8FA] hover:bg-slate-100 text-xs font-semibold text-[#20252D] transition-colors"
            >
              <Calendar size={13} className="text-[#697586]" />
              <span>{state.filters.reportingPeriod || 'Q3 FY25'}</span>
              <ChevronDown size={12} className="text-[#697586]" />
            </button>

            {periodDropdownOpen && (
              <div className="absolute left-0 mt-1.5 w-48 bg-white border border-[#E5E7EB] rounded-xl shadow-lg p-1.5 z-50 animate-in fade-in">
                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Reporting Scope
                </div>
                {REPORTING_PERIODS.map(p => (
                  <button
                    key={p}
                    onClick={() => {
                      setFilter('reportingPeriod', p.split(' ')[0]);
                      setPeriodDropdownOpen(false);
                      triggerToast(`Period set to ${p}`);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between ${
                      state.filters.reportingPeriod === p.split(' ')[0]
                        ? 'bg-blue-50 text-blue-700 font-bold'
                        : 'text-[#20252D] hover:bg-slate-50'
                    }`}
                  >
                    <span>{p}</span>
                    {state.filters.reportingPeriod === p.split(' ')[0] && <Check size={13} />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Geographic Scope Selector */}
          <div className="relative">
            <button
              onClick={() => {
                setCityDropdownOpen(!cityDropdownOpen);
                setPeriodDropdownOpen(false);
                setRoleDropdownOpen(false);
              }}
              className="flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-blue-200 bg-blue-50/60 hover:bg-blue-100/70 text-xs font-bold text-blue-900 transition-colors"
            >
              <MapPin size={13} className="text-blue-600" />
              <span>{state.filters.city || 'All locations'}</span>
              <ChevronDown size={12} className="text-blue-600" />
            </button>

            {cityDropdownOpen && (
              <div className="absolute left-0 mt-1.5 w-52 bg-white border border-[#E5E7EB] rounded-xl shadow-lg p-1.5 z-50 animate-in fade-in">
                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Geographic Scope
                </div>
                {CITIES.map(c => (
                  <button
                    key={c}
                    onClick={() => {
                      setFilter('city', c);
                      setCityDropdownOpen(false);
                      triggerToast(`Portfolio scoped to ${c}`);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between ${
                      state.filters.city === c
                        ? 'bg-blue-600 text-white font-bold'
                        : 'text-[#20252D] hover:bg-slate-50'
                    }`}
                  >
                    <span>{c}</span>
                    {state.filters.city === c && <Check size={13} className="text-white" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-2.5">
          {/* Quick Search */}
          <div className="relative">
            {searchOpen ? (
              <div className="flex items-center border border-slate-300 rounded-xl px-2.5 py-1 bg-white shadow-xs">
                <Search size={13} className="text-slate-400 mr-2" />
                <input
                  type="text"
                  autoFocus
                  value={state.filters.search}
                  onChange={e => setFilter('search', e.target.value)}
                  placeholder="Search projects, IDs, contractors…"
                  className="w-44 text-xs outline-none text-[#20252D] placeholder:text-slate-400"
                />
                <button
                  onClick={() => setSearchOpen(false)}
                  className="text-slate-400 hover:text-slate-700 ml-1"
                >
                  <X size={13} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="h-8 px-2.5 rounded-lg border border-[#E5E7EB] bg-white hover:bg-slate-50 flex items-center gap-1.5 text-xs text-[#697586] hover:text-[#20252D] transition-colors"
                title="Search records"
              >
                <Search size={13} />
                <span className="hidden md:inline text-[11px]">Search…</span>
              </button>
            )}
          </div>

          {/* Export CSV Action */}
          <button
            onClick={handleExportCSV}
            className="hidden sm:flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-[#E5E7EB] bg-white hover:bg-slate-50 text-xs font-semibold text-[#20252D] transition-colors"
            title="Export view to CSV"
          >
            <Download size={13} className="text-[#697586]" />
            <span>Export CSV</span>
          </button>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative w-8 h-8 rounded-lg border border-[#E5E7EB] bg-white hover:bg-slate-50 flex items-center justify-center text-[#697586] hover:text-[#20252D] transition-colors"
              title="Notifications"
            >
              <Bell size={14} />
              {(openCritNCs > 0 || overdueWIRs > 0) && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#C63F43] rounded-full ring-2 ring-white" />
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-[#E5E7EB] rounded-2xl shadow-xl p-3 z-50 animate-in fade-in">
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
                      className="p-2 rounded-lg bg-rose-50/70 border border-rose-200/80 cursor-pointer hover:bg-rose-100/70 transition-colors"
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
                      className="p-2 rounded-lg bg-amber-50/70 border border-amber-200/80 cursor-pointer hover:bg-amber-100/70 transition-colors"
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

          {/* User Role Selector */}
          <div className="relative">
            <button
              onClick={() => {
                setRoleDropdownOpen(!roleDropdownOpen);
                setCityDropdownOpen(false);
                setPeriodDropdownOpen(false);
              }}
              className="flex items-center gap-1.5 h-8 pl-1.5 pr-2.5 rounded-lg border border-[#E5E7EB] bg-white hover:bg-slate-50 text-xs font-bold text-[#20252D] transition-colors"
            >
              <div className="w-5 h-5 rounded-md bg-[#20252D] text-white flex items-center justify-center text-[10px] font-black">
                {state.userRole.slice(0, 2).toUpperCase()}
              </div>
              <span className="hidden sm:inline">
                {state.userRole === 'ProjectsHead' ? 'Projects Head' : state.userRole === 'ProjectManager' ? 'Project Mgr' : state.userRole === 'QualityInspector' ? 'Quality Insp' : state.userRole}
              </span>
              <ChevronDown size={11} className="text-[#697586]" />
            </button>

            {roleDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-64 bg-white border border-[#E5E7EB] rounded-2xl shadow-xl p-2 z-50 animate-in fade-in">
                <div className="px-2.5 py-1.5 border-b border-slate-100 mb-1">
                  <p className="text-[11px] font-bold text-slate-900">Prototype Role Simulator</p>
                  <p className="text-[10px] text-slate-500">Switch user role to observe different perspective emphasis</p>
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
                      className={`w-full text-left p-2 rounded-xl text-xs transition-colors flex items-start justify-between ${
                        state.userRole === r.role
                          ? 'bg-blue-50 text-blue-900 font-bold'
                          : 'text-[#20252D] hover:bg-slate-50'
                      }`}
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

          {/* Reset Demo Button */}
          <button
            onClick={() => {
              resetDemo();
              triggerToast('Demo reset to initial seed data');
            }}
            className="p-1.5 rounded-lg text-[#697586] hover:text-[#20252D] hover:bg-slate-100 transition-colors"
            title="Reset demo data"
          >
            <RefreshCcw size={14} />
          </button>
        </div>
      </header>

      {/* ============================================================
          HORIZONTAL NAVIGATION BAR (Linear Style)
          ============================================================ */}
      <nav className="bg-white border-b border-[#E5E7EB] px-6 flex items-center justify-between overflow-x-auto scrollbar-none z-30">
        <div className="flex items-center gap-1">
          {NAV_ITEMS.map(item => {
            const active = state.activeTab === item.key || (item.key === 'overview' && state.activeTab === 'portfolio');
            const Icon = item.icon;

            const badge =
              item.key === 'nc' && openCritNCs > 0
                ? openCritNCs
                : item.key === 'wir' && overdueWIRs > 0
                ? overdueWIRs
                : item.key === 'wip' && delayedActs > 0
                ? delayedActs
                : null;

            return (
              <button
                key={item.key}
                onClick={() => setTab(item.key)}
                className={clsx(
                  'relative h-11 px-3.5 flex items-center gap-2 text-xs font-semibold whitespace-nowrap transition-all border-b-2',
                  active
                    ? 'border-[#20252D] text-[#20252D] font-bold'
                    : 'border-transparent text-[#697586] hover:text-[#20252D] hover:border-slate-300'
                )}
              >
                <Icon size={14} className={active ? 'text-[#20252D]' : 'text-[#697586]'} />
                <span>{item.label}</span>

                {badge !== null && (
                  <span
                    className={clsx(
                      'text-[10px] px-1.5 py-0.2 rounded-full font-black leading-none ml-1',
                      active
                        ? 'bg-[#20252D] text-white'
                        : item.key === 'nc'
                        ? 'bg-rose-100 text-[#C63F43]'
                        : item.key === 'wir'
                        ? 'bg-amber-100 text-[#B7791F]'
                        : 'bg-blue-100 text-[#315EFB]'
                    )}
                  >
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right side nav helpers: Weights Config & Executive Tour */}
        <div className="hidden md:flex items-center gap-2 pl-4">
          <button
            onClick={() => setWeightsModalOpen(true)}
            className="flex items-center gap-1.5 text-xs text-[#697586] hover:text-[#20252D] hover:bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200 transition-colors font-medium"
            title="Configure Quality Score Weights"
          >
            <SlidersHorizontal size={13} />
            <span>Score Weights</span>
          </button>

          <button
            onClick={() => setTourOpen(!tourOpen)}
            className={clsx(
              'flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-lg border transition-all',
              tourOpen
                ? 'bg-[#20252D] text-white border-transparent'
                : 'bg-blue-50 text-[#315EFB] border-blue-200 hover:bg-blue-100'
            )}
          >
            <Sparkles size={13} className={tourOpen ? 'text-amber-300' : 'text-blue-600'} />
            <span>Executive Pitch Tour</span>
          </button>
        </div>
      </nav>

      {/* ============================================================
          FLOATING EXECUTIVE PITCH TOUR (Optional interactive guide)
          ============================================================ */}
      {tourOpen && (
        <div className="fixed bottom-6 right-8 z-50 w-96 bg-white border border-slate-300 rounded-2xl shadow-2xl p-4 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-[#20252D] text-white flex items-center justify-center text-[10px] font-bold">
                {tourStep + 1}
              </span>
              <span className="text-xs font-bold text-[#20252D]">Executive Pitch Narrative</span>
            </div>
            <button onClick={() => setTourOpen(false)} className="text-slate-400 hover:text-slate-700">
              <X size={15} />
            </button>
          </div>

          <div className="space-y-2 text-xs">
            {tourStep === 0 && (
              <>
                <p className="font-bold text-slate-900">Step 1: Portfolio Status at a Glance</p>
                <p className="text-slate-600 leading-relaxed">
                  The CEO immediately spots that 2 of 7 projects are Critical, with Overall Construction Progress at 64% vs 70% plan.
                </p>
                <button
                  onClick={() => {
                    setTab('overview');
                    setTourStep(1);
                  }}
                  className="w-full mt-2 py-1.5 px-3 bg-[#20252D] text-white font-bold rounded-lg hover:bg-black text-xs flex items-center justify-center gap-1"
                >
                  <span>Scope to Troubled City →</span>
                </button>
              </>
            )}
            {tourStep === 1 && (
              <>
                <p className="font-bold text-slate-900">Step 2: Spot Riverstone Towers (Gurugram)</p>
                <p className="text-slate-600 leading-relaxed">
                  Riverstone Towers has a Critical Quality Score of 42/100 and is 38 days behind schedule on Tower 1.
                </p>
                <button
                  onClick={() => {
                    setTab('wip');
                    setFilter('project', 'P004');
                    setTourStep(2);
                  }}
                  className="w-full mt-2 py-1.5 px-3 bg-[#20252D] text-white font-bold rounded-lg hover:bg-black text-xs flex items-center justify-center gap-1"
                >
                  <span>Drill into WIP Floor Matrix →</span>
                </button>
              </>
            )}
            {tourStep === 2 && (
              <>
                <p className="font-bold text-slate-900">Step 3: Root-Cause on Floor 05 Block</p>
                <p className="text-slate-600 leading-relaxed">
                  Floor 05 column concreting is blocked due to Concrete Cube Test failure (NC-0001) & rejected inspection WIR-0021.
                </p>
                <button
                  onClick={() => {
                    setTab('nc');
                    setFilter('project', 'P004');
                    setTourStep(3);
                  }}
                  className="w-full mt-2 py-1.5 px-3 bg-[#20252D] text-white font-bold rounded-lg hover:bg-black text-xs flex items-center justify-center gap-1"
                >
                  <span>Inspect Defect Photo & Evidence →</span>
                </button>
              </>
            )}
            {tourStep === 3 && (
              <>
                <p className="font-bold text-slate-900">Step 4: Contractor Accountability</p>
                <p className="text-slate-600 leading-relaxed">
                  NC-0001 reveals contractor ABC Civil Works. We can trace their cross-project pass rate and repeated defects.
                </p>
                <button
                  onClick={() => {
                    setTab('contractors');
                    setTourStep(0);
                    setTourOpen(false);
                  }}
                  className="w-full mt-2 py-1.5 px-3 bg-[#20252D] text-white font-bold rounded-lg hover:bg-black text-xs flex items-center justify-center gap-1"
                >
                  <span>View Contractor Performance →</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ============================================================
          MAIN CONTENT AREA (Full Width Desktop)
          ============================================================ */}
      <main
        className={clsx(
          "flex-1 w-full max-w-[1680px] mx-auto",
          (state.activeTab === 'overview' || state.activeTab === 'portfolio')
            ? "px-4 py-2 h-[calc(100vh-6.25rem)] overflow-hidden flex flex-col"
            : "px-6 py-6"
        )}
      >
        {children}
      </main>

      {/* Shared Modals & Record Drawers */}
      <AdminModal />
      <WeightsConfigModal />
      {state.selectedActivityId && (
        <ActivityDetailDrawer
          activityId={state.selectedActivityId}
          onClose={() => selectActivity(null)}
        />
      )}
      {state.selectedAuditId && (
        <AuditDetailDrawer
          auditId={state.selectedAuditId}
          onClose={() => selectAudit(null)}
        />
      )}
    </div>
  );
}
