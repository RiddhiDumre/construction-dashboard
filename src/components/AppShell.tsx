// ============================================================
// APP SHELL — Redesigned with Fundio Visual Inspiration
// Slim top bar, dark active pill tab, restrained icons & controls
// ============================================================

import React, { useState } from 'react';
import {
  Search, Download, RefreshCcw, ChevronDown, Check,
  PlayCircle, X, ChevronRight, Sparkles, Bell, Menu,
  LayoutDashboard, ClipboardCheck, AlertTriangle,
  BarChart3, Users, Building2
} from 'lucide-react';
import clsx from 'clsx';
import { useApp } from '../store/appStore';
import { PROJECTS, CONTRACTORS } from '../data/seedData';
import { calcQualityScore } from '../data/calculations';

const NAV_ITEMS = [
  { key: 'portfolio' as const, label: 'Portfolio', icon: LayoutDashboard },
  { key: 'wir' as const, label: 'WIR Inspections', icon: ClipboardCheck },
  { key: 'nc' as const, label: 'Non-Compliance', icon: AlertTriangle },
  { key: 'quality' as const, label: 'Quality Score', icon: BarChart3 },
  { key: 'contractors' as const, label: 'Contractors', icon: Users },
];

const DEMO_STEPS = [
  {
    step: 1,
    title: 'Open Portfolio Overview',
    desc: 'The executive home screen surfaces portfolio-wide health in under 60 seconds.',
    actionName: 'View Portfolio',
    run: (app: ReturnType<typeof useApp>) => {
      app.resetFilters();
      app.setTab('portfolio');
      app.selectProject(null);
    },
  },
  {
    step: 2,
    title: 'Spot Projects in Trouble',
    desc: 'Default sort highlights worst performers first: Riverstone Towers (Gurugram) is Critical at 42/100.',
    actionName: 'Highlight Critical Project',
    run: (app: ReturnType<typeof useApp>) => {
      app.setTab('portfolio');
      app.selectProject(null);
    },
  },
  {
    step: 3,
    title: 'Inspect Project Breakdown',
    desc: 'Open Riverstone Towers detail drawer to examine why it is struggling.',
    actionName: 'Open Riverstone Towers',
    run: (app: ReturnType<typeof useApp>) => {
      app.setTab('portfolio');
      app.selectProject('P004');
    },
  },
  {
    step: 4,
    title: 'Deconstruct Score Components',
    desc: 'Riverstone Towers has low NC Health (48/100) and poor Latest Audit (42/100). Concrete cube test failure flagged.',
    actionName: 'Review Quality Breakdown',
    run: (app: ReturnType<typeof useApp>) => {
      app.setTab('portfolio');
      app.selectProject('P004');
    },
  },
  {
    step: 5,
    title: 'Drill into Overdue Critical NC',
    desc: 'Open NC-0001: Concrete cube test failure (24.8 MPa vs 30 MPa M30 required), open 39 days.',
    actionName: 'Open NC-0001 Drawer',
    run: (app: ReturnType<typeof useApp>) => {
      app.selectProject(null);
      app.setTab('nc');
      app.selectNC('NC-0001');
    },
  },
  {
    step: 6,
    title: 'Inspect Contractor Ownership',
    desc: 'NC-0001 is owned by contractor "ABC Civil Works". Examine site notes and audit trail.',
    actionName: 'Review NC Audit Trail',
    run: (app: ReturnType<typeof useApp>) => {
      app.setTab('nc');
      app.selectNC('NC-0001');
    },
  },
  {
    step: 7,
    title: 'Check Contractor Accountability',
    desc: 'Navigate to Contractors tab to see if ABC Civil Works has quality issues across multiple projects.',
    actionName: 'Open Contractors',
    run: (app: ReturnType<typeof useApp>) => {
      app.selectNC(null);
      app.setTab('contractors');
      app.selectContractor(null);
    },
  },
  {
    step: 8,
    title: 'Analyse ABC Civil Works Cross-Project',
    desc: 'Open ABC Civil Works drawer: First-time pass rate is only 43%, with 4 critical NCs spanning 2 projects.',
    actionName: 'Inspect ABC Civil Works',
    run: (app: ReturnType<typeof useApp>) => {
      app.setTab('contractors');
      app.selectContractor('C001');
    },
  },
  {
    step: 9,
    title: 'Inspect WIR Operational Bottlenecks',
    desc: 'Navigate to WIR tab to inspect recent inspection rejections and SLA breaches.',
    actionName: 'Open WIR Tab',
    run: (app: ReturnType<typeof useApp>) => {
      app.selectContractor(null);
      app.setTab('wir');
      app.selectWIR(null);
    },
  },
  {
    step: 10,
    title: 'Examine Rejected Inspection WIR-0021',
    desc: 'WIR-0021: Column Concreting 5th Floor rejected due to cube strength failure and visible honeycombing.',
    actionName: 'Open WIR-0021',
    run: (app: ReturnType<typeof useApp>) => {
      app.setTab('wir');
      app.selectWIR('WIR-0021');
    },
  },
  {
    step: 11,
    title: 'Advance Workflow State',
    desc: 'Change WIR or NC state: e.g. Open NC-0002 (Honeycombing) and transition from Rectification to Evidence Submitted.',
    actionName: 'Open NC-0002 for Action',
    run: (app: ReturnType<typeof useApp>) => {
      app.selectWIR(null);
      app.setTab('nc');
      app.selectNC('NC-0002');
    },
  },
  {
    step: 12,
    title: 'Return to Portfolio: Real-Time Score Update',
    desc: 'Portfolio Quality Scores, Pass Rates and KPI strip automatically recompute from the single source of truth.',
    actionName: 'Verify Portfolio Update',
    run: (app: ReturnType<typeof useApp>) => {
      app.selectNC(null);
      app.resetFilters();
      app.setTab('portfolio');
    },
  },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const app = useApp();
  const { state, setTab, setFilter, resetDemo } = app;

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [tourOpen, setTourOpen] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Dynamic counts for left nav badges
  const critNCs = state.ncs.filter(n => n.severity === 'Critical' && n.status !== 'Closed').length;
  const overdueWIRs = state.wirs.filter(w => w.slaBreach && w.status !== 'Approved').length;

  function triggerToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  }

  // Handle Export CSV
  function handleExport() {
    let csvContent = '';
    let filename = '';

    if (state.activeTab === 'portfolio') {
      csvContent = 'Project,City,Region,Stage,QualityScore,FirstTimePassRate,OpenNCs,OverdueWIRs\n' +
        PROJECTS.map(p => {
          const bd = calcQualityScore(p.id, state.weights, state.wirs, state.ncs);
          const pWIRs = state.wirs.filter(w => w.projectId === p.id);
          const pNCs = state.ncs.filter(n => n.projectId === p.id && n.status !== 'Closed');
          const pOverdue = pWIRs.filter(w => w.slaBreach && w.status !== 'Approved');
          return `"${p.name}","${p.city}","${p.region}","${p.stage}",${bd.finalScore},${bd.wirComponent}%,${pNCs.length},${pOverdue.length}`;
        }).join('\n');
      filename = 'bombaydc-portfolio-quality-report.csv';
    } else if (state.activeTab === 'wir') {
      csvContent = 'WIR_ID,Project,Tower,Activity,Contractor,Submitted,Reviewer,Status,DaysAwaiting,FirstPassResult\n' +
        state.wirs.map(w => {
          const proj = PROJECTS.find(p => p.id === w.projectId)?.name ?? '';
          const cont = CONTRACTORS.find(c => c.id === w.contractorId)?.name ?? '';
          return `"${w.id}","${proj}","${w.tower}","${w.activity}","${cont}","${w.submittedDate}","${w.reviewer}","${w.status}",${w.daysAwaiting},"${w.firstPassResult}"`;
        }).join('\n');
      filename = 'bombaydc-wir-inspections.csv';
    } else if (state.activeTab === 'nc') {
      csvContent = 'NC_ID,Project,Tower,Finding,Severity,Contractor,DateRaised,Age,DueDate,Status,IsRepeat\n' +
        state.ncs.map(n => {
          const proj = PROJECTS.find(p => p.id === n.projectId)?.name ?? '';
          const cont = CONTRACTORS.find(c => c.id === n.contractorId)?.name ?? '';
          return `"${n.id}","${proj}","${n.tower}","${n.finding.replace(/"/g, '""')}","${n.severity}","${cont}","${n.dateRaised}",${n.age},"${n.dueDate}","${n.status}",${n.isRepeat}`;
        }).join('\n');
      filename = 'bombaydc-non-compliance-register.csv';
    } else if (state.activeTab === 'quality') {
      csvContent = 'Project,QualityScore,WIR_Component,NC_Component,Audit_Component\n' +
        PROJECTS.map(p => {
          const bd = calcQualityScore(p.id, state.weights, state.wirs, state.ncs);
          return `"${p.name}",${bd.finalScore},${bd.wirComponent},${bd.ncComponent},${bd.auditComponent ?? 'N/A'}`;
        }).join('\n');
      filename = 'bombaydc-quality-scores.csv';
    } else {
      csvContent = 'Contractor,Trade,WIRs,FirstTimePassRate,OpenNCs\n' +
        CONTRACTORS.map(c => {
          const cW = state.wirs.filter(w => w.contractorId === c.id);
          const cN = state.ncs.filter(n => n.contractorId === c.id && n.status !== 'Closed');
          const pass = cW.filter(w => w.firstPassResult === 'Pass').length;
          const rate = cW.length > 0 ? Math.round((pass / cW.length) * 100) : 0;
          return `"${c.name}","${c.type}",${cW.length},${rate}%,${cN.length}`;
        }).join('\n');
      filename = 'bombaydc-contractor-quality-rankings.csv';
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast(`Exported ${filename}`);
  }

  const currentStep = DEMO_STEPS[currentStepIndex];

  return (
    <div className="min-h-screen bg-[#F4F5F7] flex text-[#1E293B]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[#0F172A] text-white text-xs font-medium px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 border border-slate-700/60 animate-in fade-in slide-in-from-top-2">
          <Check size={14} className="text-[#10B981]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* ============================================================
          LEFT VERTICAL NAVIGATION SIDEBAR (Linear / Fundio / Executive Style)
          ============================================================ */}
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-[#E2E8F0] flex flex-col justify-between transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 lg:h-screen lg:sticky lg:top-0 shadow-lg lg:shadow-none flex-shrink-0',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Logo / Brand Header */}
          <div className="h-16 px-5 border-b border-[#F1F5F9] flex items-center justify-between">
            <div
              onClick={() => {
                setTab('portfolio');
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <img
                src="/logo.png"
                alt="BombayDC Construction Quality"
                className="h-9 w-auto object-contain transition-transform group-hover:scale-[1.02] mix-blend-multiply"
              />
            </div>
            {/* Close button for mobile */}
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden text-[#94A3B8] hover:text-[#0F172A] p-1.5 rounded-lg hover:bg-slate-100"
            >
              <X size={18} />
            </button>
          </div>

          {/* Vertical Navigation Links */}
          <div className="p-3 space-y-3">
            <nav className="space-y-1">
              {NAV_ITEMS.map(item => {
                const active = state.activeTab === item.key;
                const Icon = item.icon;
                const badge = item.key === 'nc' && critNCs > 0
                  ? critNCs
                  : item.key === 'wir' && overdueWIRs > 0
                  ? overdueWIRs
                  : null;
                const badgeTitle = item.key === 'nc'
                  ? `${critNCs} Critical Non-Compliances`
                  : item.key === 'wir'
                  ? `${overdueWIRs} Overdue Inspections`
                  : '';

                return (
                  <button
                    key={item.key}
                    onClick={() => {
                      setTab(item.key);
                      setMobileMenuOpen(false);
                    }}
                    className={clsx(
                      'w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all duration-150',
                      active
                        ? 'bg-[#18181B] text-white shadow-xs'
                        : 'text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100/80 font-semibold'
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon size={16} className={clsx('flex-shrink-0', active ? 'text-white' : 'text-[#94A3B8]')} />
                      <span className="whitespace-nowrap">{item.label}</span>
                    </div>
                    {badge !== null && (
                      <span
                        title={badgeTitle}
                        className={clsx(
                          'text-[10px] min-w-[20px] h-5 px-1.5 rounded-full font-black inline-flex items-center justify-center leading-none flex-shrink-0 shadow-2xs',
                          active
                            ? 'bg-white/20 text-white'
                            : item.key === 'nc'
                            ? 'bg-rose-100 text-[#9F1239] border border-rose-300'
                            : 'bg-amber-100 text-[#B45309] border border-amber-300'
                        )}
                      >
                        {badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Subtle Divider */}
            <div className="border-t border-[#F1F5F9] my-2" />

            {/* Executive Quick Actions */}
            <div className="space-y-1">
              <button
                onClick={() => {
                  handleExport();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#475569] hover:text-[#0F172A] hover:bg-slate-100/80 transition-colors"
              >
                <Download size={15} className="text-[#94A3B8] flex-shrink-0" />
                <span className="whitespace-nowrap">Export Quality CSV</span>
              </button>

              <button
                onClick={() => {
                  setTourOpen(!tourOpen);
                  setMobileMenuOpen(false);
                }}
                className={clsx(
                  'w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all border',
                  tourOpen
                    ? 'bg-[#18181B] text-white border-transparent'
                    : 'bg-blue-50/60 text-[#1E3A8A] border-blue-200/80 hover:bg-blue-100/70'
                )}
              >
                <div className="flex items-center gap-2">
                  <Sparkles size={14} className={tourOpen ? 'text-amber-300' : 'text-[#315EFB]'} />
                  <span className="whitespace-nowrap">Executive Tour</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded font-extrabold bg-blue-200/60 text-blue-900 leading-none">
                  {currentStepIndex + 1}/12
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar Footer: User Profile & Demo Reset */}
        <div className="p-3 border-t border-[#F1F5F9] bg-[#FAFAFA]">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-[#E2E8F0] shadow-2xs">
            <div className="flex items-center gap-2.5 min-w-0 pr-1">
              <div className="w-8 h-8 rounded-lg bg-[#18181B] text-white flex items-center justify-center text-xs font-extrabold flex-shrink-0">
                QH
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#0F172A] truncate leading-tight">Quality Head</p>
              </div>
            </div>
            <button
              onClick={() => {
                resetDemo();
                triggerToast('Demo state reset to original seed data');
              }}
              className="text-[#94A3B8] hover:text-[#0F172A] transition-colors p-1.5 rounded-lg hover:bg-slate-100 flex-shrink-0"
              title="Reset demo data"
            >
              <RefreshCcw size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* ============================================================
          MAIN CONTENT COLUMN
          ============================================================ */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Slim Executive Top Bar with Search & Alerts */}
        <header className="sticky top-0 z-30 h-14 bg-white/85 backdrop-blur-md border-b border-black/[0.06] flex items-center justify-between px-6 sm:px-8">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl border border-[#E2E8F0] bg-white text-[#64748B] hover:text-[#0F172A] shadow-2xs"
              title="Open Navigation Menu"
            >
              <Menu size={16} />
            </button>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              {searchOpen ? (
                <div className="flex items-center border border-[#CBD5E1] rounded-xl px-3 py-1.5 bg-white shadow-xs">
                  <Search size={14} className="text-[#94A3B8] mr-2" />
                  <input
                    type="text"
                    autoFocus
                    value={state.filters.search}
                    onChange={e => setFilter('search', e.target.value)}
                    placeholder="Search projects, IDs, contractors…"
                    className="w-48 text-xs text-[#0F172A] outline-none placeholder:text-[#94A3B8]"
                  />
                  <button onClick={() => setSearchOpen(false)} className="text-[#94A3B8] hover:text-[#0F172A] ml-1.5">
                    <X size={13} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="h-9 px-3 rounded-xl border border-[#E2E8F0] bg-white flex items-center gap-2 text-[#64748B] hover:text-[#0F172A] hover:bg-slate-50 transition-colors shadow-2xs text-xs font-medium"
                  title="Search"
                >
                  <Search size={14} className="text-[#94A3B8]" />
                  <span className="hidden md:inline text-[11px] text-[#94A3B8]">Quick Search…</span>
                </button>
              )}
            </div>

            {/* Quick Export Button */}
            <button
              onClick={handleExport}
              className="hidden sm:flex items-center gap-1.5 h-9 px-3 rounded-xl border border-[#CBD5E1] bg-white text-xs font-bold text-[#1E293B] hover:bg-slate-50 transition-colors shadow-2xs"
              title="Export Current View to CSV"
            >
              <Download size={13} className="text-[#64748B]" />
              <span>Export CSV</span>
            </button>

            {/* Notifications Bell */}
            <button
              onClick={() => triggerToast('No pending critical notifications')}
              className="relative w-9 h-9 rounded-xl border border-[#E2E8F0] bg-white flex items-center justify-center text-[#64748B] hover:text-[#0F172A] hover:bg-slate-50 transition-colors shadow-2xs"
              title="Notifications"
            >
              <Bell size={15} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-[#EF4444] rounded-full ring-2 ring-white" />
            </button>
          </div>
        </header>

        {/* Website Dimming Backdrop when Tour is Active */}
        {tourOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-[80] transition-opacity animate-in fade-in duration-200 pointer-events-none"
          />
        )}

        {/* Floating Interactive Pitch Walkthrough Guide */}
        {tourOpen && (() => {
          const isDrawerOpen = Boolean(state.selectedProjectId || state.selectedNCId || state.selectedWIRId || state.selectedContractorId);
          return (
            <div
              className={clsx(
                'fixed z-[100] w-[390px] bg-white border border-[#CBD5E1] rounded-2xl shadow-2xl p-5 animate-in fade-in transition-all duration-300',
                isDrawerOpen ? 'bottom-6 left-8 lg:left-72' : 'bottom-6 right-8 sm:right-10'
              )}
            >
              {/* Top Bar with Step and ONLY CTA #1: Cross Button */}
              <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-[#F1F5F9]">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-[#18181B] text-white flex items-center justify-center text-[10px] font-bold">
                    {currentStep.step}
                  </span>
                  <span className="text-xs font-bold text-[#0F172A]">Executive Pitch Tour ({currentStep.step}/12)</span>
                </div>

                {/* CTA #1: Cross Button */}
                <button
                  onClick={() => setTourOpen(false)}
                  className="w-7 h-7 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100 flex items-center justify-center transition-colors"
                  title="Close Tour"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Target Highlight with Moving Animated Arrow */}
              <div className="flex items-center gap-2 mb-3 bg-blue-50/80 border border-blue-200/80 rounded-lg px-2.5 py-1.5 text-xs">
                <span className="inline-block transform animate-bounce text-blue-600 text-sm">
                  {isDrawerOpen ? '👉' : '🔍'}
                </span>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] uppercase font-bold text-blue-700 tracking-wider block">Live Focus Target</span>
                  <span className="font-semibold text-blue-900 truncate block">{currentStep.title}</span>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-[#475569] mb-4 leading-relaxed font-normal">
                {currentStep.desc}
              </p>

              {/* Bottom Bar with ONLY CTA #2: The Demo Action Button */}
              <div className="pt-2 border-t border-slate-100">
                <button
                  onClick={() => {
                    currentStep.run(app);
                    const nextIdx = (currentStepIndex + 1) % DEMO_STEPS.length;
                    setCurrentStepIndex(nextIdx);
                  }}
                  className="w-full flex items-center justify-center gap-2 text-xs font-bold bg-[#18181B] text-white py-2.5 px-4 rounded-xl hover:bg-black transition-all shadow-md active:scale-[0.99] group"
                >
                  <PlayCircle size={14} className="text-emerald-400 group-hover:scale-110 transition-transform" />
                  <span>Demo Step {currentStep.step}: {currentStep.actionName} →</span>
                </button>
              </div>
            </div>
          );
        })()}

        {/* Main Content Area */}
        <main className="flex-1 px-6 sm:px-8 py-6 w-full max-w-[1600px] mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
