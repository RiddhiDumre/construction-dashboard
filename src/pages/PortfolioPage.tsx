// ============================================================
// PAGE 1 — PORTFOLIO AT A GLANCE (Overview)
// Pixel-perfect match to the master executive design blueprint
// ============================================================

import React, { useState } from 'react';
import {
  Building2, BarChart3, Home, ClipboardCheck, AlertTriangle,
  ShieldCheck, MapPin, ChevronRight, ChevronLeft, ChevronDown,
  Maximize2, ArrowRight
} from 'lucide-react';
import clsx from 'clsx';
import { useApp } from '../store/appStore';
import { ProjectDetailDrawer } from '../components/ProjectDetailDrawer';

export function PortfolioPage() {
  const { state, setTab, selectProject, selectNC, selectWIR } = useApp();

  const [activePeriod, setActivePeriod] = useState('Q3 FY25');
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState('Mumbai');

  const CITIES = ['Mumbai', 'Gurugram', 'Bengaluru', 'Pune', 'All locations'];
  const PERIODS = ['Q3 FY25', 'Q2 FY25', 'Q1 FY25', 'FY24'];

  return (
    <div className="space-y-4">
      {/* ============================================================
          PAGE HEADER: Title, City Selector, Reporting Periods
          ============================================================ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            Portfolio at a glance
          </h1>
          {/* Location Selector Dropdown */}
          <div className="relative inline-block mt-1">
            <button
              onClick={() => setCityDropdownOpen(!cityDropdownOpen)}
              className="flex items-center gap-1.5 text-xs text-[#64748B] hover:text-[#0F172A] font-medium transition-colors"
            >
              <MapPin size={13} className="text-[#64748B]" />
              <span>{selectedCity}</span>
              <ChevronDown size={12} className="text-[#64748B]" />
            </button>

            {cityDropdownOpen && (
              <div className="absolute left-0 mt-1.5 w-40 bg-white border border-[#E2E8F0] rounded-xl shadow-lg p-1.5 z-50 animate-in fade-in">
                {CITIES.map(c => (
                  <button
                    key={c}
                    onClick={() => {
                      setSelectedCity(c);
                      setCityDropdownOpen(false);
                    }}
                    className={clsx(
                      'w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors',
                      selectedCity === c ? 'bg-blue-50 text-blue-700 font-bold' : 'text-[#0F172A] hover:bg-slate-50'
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Period Tabs & Pagination Arrows */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center bg-[#F1F5F9] p-0.5 rounded-xl border border-[#E2E8F0]">
            {PERIODS.map(p => (
              <button
                key={p}
                onClick={() => setActivePeriod(p)}
                className={clsx(
                  'px-3 py-1 rounded-lg text-xs font-semibold transition-all',
                  activePeriod === p
                    ? 'bg-white text-[#0F172A] shadow-xs font-bold'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                )}
              >
                {p}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 text-[#64748B]">
            <button className="w-7 h-7 rounded-lg bg-white border border-[#E2E8F0] flex items-center justify-center hover:bg-slate-50 transition-colors">
              <ChevronLeft size={13} />
            </button>
            <button className="w-7 h-7 rounded-lg bg-white border border-[#E2E8F0] flex items-center justify-center hover:bg-slate-50 transition-colors">
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================
          TOP METRICS ROW (5 Cards in 1 Row)
          ============================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Card 1: Construction Progress */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-[#64748B]">
              <BarChart3 size={16} />
            </div>
            <span className="text-xs font-medium text-[#64748B]">Construction Progress</span>
          </div>

          <div className="my-2.5 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
              71%
            </span>
            <span className="inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-[#C63F43] border border-rose-100">
              ↓ 2%
            </span>
          </div>

          {/* Green Progress Bar */}
          <div className="w-full h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
            <div className="h-full bg-[#10B981] rounded-full" style={{ width: '71%' }} />
          </div>
        </div>

        {/* Card 2: Buildings Under Construction */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-[#64748B]">
              <Building2 size={16} />
            </div>
            <span className="text-xs font-medium text-[#64748B]">Buildings Under Construction</span>
          </div>

          <div className="my-2.5 flex items-baseline justify-between">
            <div>
              <span className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
                10
              </span>
              <span className="text-sm font-medium text-[#94A3B8] ml-1">/ 100</span>
            </div>
            {/* Subtle building icon silhouette */}
            <Building2 size={22} className="text-slate-300 stroke-1" />
          </div>

          {/* Blue Progress Bar */}
          <div className="w-full h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
            <div className="h-full bg-[#315EFB] rounded-full" style={{ width: '10%' }} />
          </div>
        </div>

        {/* Card 3: Units Sold */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-[#64748B]">
              <Home size={16} />
            </div>
            <span className="text-xs font-medium text-[#64748B]">Units Sold</span>
          </div>

          <div className="my-1.5 flex items-center justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
              889
            </span>

            {/* Donut Chart with 80% */}
            <div className="flex items-center gap-2">
              <svg className="w-9 h-9 transform -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="14" fill="none" stroke="#E2E8F0" strokeWidth="3.5" />
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="3.5"
                  strokeDasharray={2 * Math.PI * 14}
                  strokeDashoffset={2 * Math.PI * 14 * (1 - 0.8)}
                  strokeLinecap="round"
                />
              </svg>
              <div>
                <div className="text-xs font-extrabold text-[#0F172A] leading-tight">80%</div>
                <div className="text-[9px] text-[#94A3B8] font-medium leading-none">of 1,110</div>
              </div>
            </div>
          </div>

          {/* Empty spacer or subtle bar */}
          <div className="h-1.5" />
        </div>

        {/* Card 4: Overdue WIRs */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-[#64748B]">
              <ClipboardCheck size={16} />
            </div>
            <span className="text-xs font-medium text-[#64748B]">Overdue WIRs</span>
          </div>

          <div className="my-1.5 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
              7
            </span>
            <span className="inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-50 text-[#EA580C] border border-orange-100">
              ↑ 3
            </span>
          </div>

          {/* Red Sparkline Curve */}
          <div className="w-full h-4 flex items-end">
            <svg className="w-full h-3.5 overflow-visible" viewBox="0 0 100 20" preserveAspectRatio="none">
              <path
                d="M0,16 Q20,15 35,18 T70,10 T100,2"
                fill="none"
                stroke="#F87171"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* Card 5: Open NCs */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-rose-500">
              <AlertTriangle size={16} />
            </div>
            <span className="text-xs font-medium text-[#64748B]">Open NCs</span>
          </div>

          <div className="my-1.5 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
              24
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-[#C63F43] border border-rose-100">
              4 critical
            </span>
          </div>

          {/* Mini Red Vertical Bars Histogram */}
          <div className="w-full flex items-end justify-end gap-1 h-4">
            <span className="w-1.5 h-2 bg-rose-200 rounded-2xs" />
            <span className="w-1.5 h-3.5 bg-rose-300 rounded-2xs" />
            <span className="w-1.5 h-2.5 bg-rose-300 rounded-2xs" />
            <span className="w-1.5 h-4 bg-rose-400 rounded-2xs" />
            <span className="w-1.5 h-3 bg-rose-400 rounded-2xs" />
          </div>
        </div>
      </div>

      {/* ============================================================
          MAIN 2-COLUMN SECTION
          Left Column (65% width): Construction Status + Projects Table
          Right Column (35% width): Quality & Critical Issues + Map
          ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* ==========================================================
            LEFT COLUMN (8 cols out of 12)
            ========================================================== */}
        <div className="lg:col-span-8 space-y-4">
          {/* Card 1: Construction Status */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-2xs">
            {/* Header with Title and Legend */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-[#64748B]">
                  <Building2 size={15} />
                </div>
                <h2 className="text-sm font-bold text-[#0F172A]">Construction Status</h2>
              </div>

              {/* Legend with Colored Dots */}
              <div className="flex items-center gap-3.5 text-xs text-[#64748B] flex-wrap">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#10B981]" /> Completed
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#315EFB]" /> Under Construction
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#CBD5E1]" /> Planned
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#EF4444]" /> At Risk
                </span>
              </div>
            </div>

            {/* Architectural Skyline Graphic */}
            <div className="relative my-2 w-full overflow-hidden rounded-xl bg-gradient-to-b from-sky-50/20 to-transparent">
              <img
                src="/assets/construction-buildings.png"
                alt="Construction Status Skyline"
                className="w-full h-auto object-cover max-h-[190px] mx-auto select-none"
              />
            </div>

            {/* 4 Projects Progress Footer Bars */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 border-t border-slate-100">
              {/* Riverstone Towers */}
              <div
                onClick={() => selectProject('P004')}
                className="cursor-pointer group"
              >
                <div className="text-xs font-bold text-[#0F172A] group-hover:text-[#315EFB] transition-colors truncate">
                  Riverstone Towers
                </div>
                <div className="text-[11px] text-[#64748B] flex items-center gap-1 mt-0.5">
                  <MapPin size={10} /> Gurugram
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
                    <div className="h-full bg-[#10B981] rounded-full" style={{ width: '17%' }} />
                  </div>
                  <span className="text-xs font-bold text-[#0F172A]">17%</span>
                </div>
              </div>

              {/* Meridian Heights */}
              <div
                onClick={() => selectProject('P001')}
                className="cursor-pointer group"
              >
                <div className="text-xs font-bold text-[#0F172A] group-hover:text-[#315EFB] transition-colors truncate">
                  Meridian Heights
                </div>
                <div className="text-[11px] text-[#64748B] flex items-center gap-1 mt-0.5">
                  <MapPin size={10} /> Mumbai
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
                    <div className="h-full bg-[#10B981] rounded-full" style={{ width: '50%' }} />
                  </div>
                  <span className="text-xs font-bold text-[#0F172A]">50%</span>
                </div>
              </div>

              {/* Vivanta Sereno */}
              <div
                onClick={() => selectProject('P007')}
                className="cursor-pointer group"
              >
                <div className="text-xs font-bold text-[#0F172A] group-hover:text-[#315EFB] transition-colors truncate">
                  Vivanta Sereno
                </div>
                <div className="text-[11px] text-[#64748B] flex items-center gap-1 mt-0.5">
                  <MapPin size={10} /> Pune
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
                    <div className="h-full bg-[#10B981] rounded-full" style={{ width: '60%' }} />
                  </div>
                  <span className="text-xs font-bold text-[#0F172A]">60%</span>
                </div>
              </div>

              {/* Northgate Residences */}
              <div
                onClick={() => selectProject('P002')}
                className="cursor-pointer group"
              >
                <div className="text-xs font-bold text-[#0F172A] group-hover:text-[#315EFB] transition-colors truncate">
                  Northgate Residences
                </div>
                <div className="text-[11px] text-[#64748B] flex items-center gap-1 mt-0.5">
                  <MapPin size={10} /> Bengaluru
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
                    <div className="h-full bg-[#10B981] rounded-full" style={{ width: '100%' }} />
                  </div>
                  <span className="text-xs font-bold text-[#0F172A]">100%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Projects Table */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-2xs">
            <div className="flex items-center justify-between pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-[#64748B]">
                  <Building2 size={15} />
                </div>
                <h2 className="text-sm font-bold text-[#0F172A]">Projects</h2>
              </div>
              <button
                onClick={() => setTab('wip')}
                className="text-xs font-bold text-[#315EFB] hover:underline flex items-center gap-0.5"
              >
                View all projects <ChevronRight size={13} />
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left min-w-[680px]">
                <thead>
                  <tr className="text-[#94A3B8] font-medium border-b border-slate-100 pb-2">
                    <th className="py-2.5 font-medium">Project</th>
                    <th className="py-2.5 font-medium">City</th>
                    <th className="py-2.5 font-medium">Status</th>
                    <th className="py-2.5 font-medium">Progress</th>
                    <th className="py-2.5 font-medium">Units Sold</th>
                    <th className="py-2.5 font-medium">Quality Score</th>
                    <th className="py-2.5 font-medium">Open NCs</th>
                    <th className="py-2.5 font-medium">Manager</th>
                    <th className="py-2.5"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {/* Row 1: Riverstone Towers */}
                  <tr
                    onClick={() => selectProject('P004')}
                    className="hover:bg-slate-50/70 cursor-pointer transition-colors"
                  >
                    <td className="py-3 font-bold text-[#0F172A]">Riverstone Towers</td>
                    <td className="py-3 text-[#64748B]">Gurugram</td>
                    <td className="py-3">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-rose-50 text-[#C63F43] border border-rose-100 font-semibold text-[11px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" /> Critical
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#0F172A]">17%</span>
                        <div className="w-12 h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
                          <div className="h-full bg-[#EF4444] rounded-full" style={{ width: '17%' }} />
                        </div>
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[#0F172A]">320 / 480</span>
                        <div className="w-12 h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
                          <div className="h-full bg-[#10B981] rounded-full" style={{ width: '67%' }} />
                        </div>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded bg-rose-50 text-[#C63F43] font-bold">
                        52
                      </span>
                    </td>
                    <td className="py-3">
                      <span className="font-bold text-[#0F172A] mr-1.5">12</span>
                      <span className="text-[#C63F43] font-semibold text-[11px]">4 critical</span>
                    </td>
                    <td className="py-3 text-[#64748B]">A. Sharma</td>
                    <td className="py-3 text-right text-slate-300">
                      <ChevronRight size={14} />
                    </td>
                  </tr>

                  {/* Row 2: Meridian Heights */}
                  <tr
                    onClick={() => selectProject('P001')}
                    className="hover:bg-slate-50/70 cursor-pointer transition-colors"
                  >
                    <td className="py-3 font-bold text-[#0F172A]">Meridian Heights</td>
                    <td className="py-3 text-[#64748B]">Mumbai</td>
                    <td className="py-3">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-50 text-[#B7791F] border border-amber-100 font-semibold text-[11px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" /> At Risk
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#0F172A]">50%</span>
                        <div className="w-12 h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
                          <div className="h-full bg-[#315EFB] rounded-full" style={{ width: '50%' }} />
                        </div>
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[#0F172A]">280 / 420</span>
                        <div className="w-12 h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
                          <div className="h-full bg-[#315EFB] rounded-full" style={{ width: '67%' }} />
                        </div>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded bg-amber-50 text-[#B7791F] font-bold">
                        69
                      </span>
                    </td>
                    <td className="py-3">
                      <span className="font-bold text-[#0F172A] mr-1.5">7</span>
                      <span className="text-[#C63F43] font-semibold text-[11px]">1 critical</span>
                    </td>
                    <td className="py-3 text-[#64748B]">R. Mehta</td>
                    <td className="py-3 text-right text-slate-300">
                      <ChevronRight size={14} />
                    </td>
                  </tr>

                  {/* Row 3: Vivanta Sereno */}
                  <tr
                    onClick={() => selectProject('P007')}
                    className="hover:bg-slate-50/70 cursor-pointer transition-colors"
                  >
                    <td className="py-3 font-bold text-[#0F172A]">Vivanta Sereno</td>
                    <td className="py-3 text-[#64748B]">Pune</td>
                    <td className="py-3">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 text-[#16805D] border border-emerald-100 font-semibold text-[11px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" /> On Track
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#0F172A]">60%</span>
                        <div className="w-12 h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
                          <div className="h-full bg-[#0D9488] rounded-full" style={{ width: '60%' }} />
                        </div>
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[#0F172A]">238 / 340</span>
                        <div className="w-12 h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
                          <div className="h-full bg-[#0D9488] rounded-full" style={{ width: '70%' }} />
                        </div>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-[#16805D] font-bold">
                        91
                      </span>
                    </td>
                    <td className="py-3 font-bold text-[#0F172A]">2</td>
                    <td className="py-3 text-[#64748B]">S. Rao</td>
                    <td className="py-3 text-right text-slate-300">
                      <ChevronRight size={14} />
                    </td>
                  </tr>

                  {/* Row 4: Northgate Residences */}
                  <tr
                    onClick={() => selectProject('P002')}
                    className="hover:bg-slate-50/70 cursor-pointer transition-colors"
                  >
                    <td className="py-3 font-bold text-[#0F172A]">Northgate Residences</td>
                    <td className="py-3 text-[#64748B]">Bengaluru</td>
                    <td className="py-3">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 text-[#16805D] border border-emerald-100 font-semibold text-[11px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" /> On Track
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#0F172A]">100%</span>
                        <div className="w-12 h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
                          <div className="h-full bg-[#10B981] rounded-full" style={{ width: '100%' }} />
                        </div>
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[#0F172A]">51 / 60</span>
                        <div className="w-12 h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
                          <div className="h-full bg-[#10B981] rounded-full" style={{ width: '85%' }} />
                        </div>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-[#16805D] font-bold">
                        88
                      </span>
                    </td>
                    <td className="py-3 font-bold text-[#0F172A]">1</td>
                    <td className="py-3 text-[#64748B]">K. Nair</td>
                    <td className="py-3 text-right text-slate-300">
                      <ChevronRight size={14} />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ==========================================================
            RIGHT COLUMN (4 cols out of 12)
            Quality & Critical Issues + Sales & Construction Map
            ========================================================== */}
        <div className="lg:col-span-4 space-y-4">
          {/* Card 1: Quality & Critical Issues */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-2xs">
            {/* Header */}
            <div className="flex items-center gap-2.5 pb-3">
              <div className="w-7 h-7 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-[#64748B]">
                <ShieldCheck size={15} />
              </div>
              <h2 className="text-sm font-bold text-[#0F172A]">Quality & Critical Issues</h2>
            </div>

            {/* Quality Score Donut Meter + 3 Metric Bars */}
            <div className="flex items-center gap-5 my-2">
              {/* Donut Circle */}
              <div className="relative w-24 h-24 flex items-center justify-center flex-shrink-0">
                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#E2E8F0"
                    strokeWidth="8"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#0D9488"
                    strokeWidth="8"
                    strokeDasharray={2 * Math.PI * 40}
                    strokeDashoffset={2 * Math.PI * 40 * (1 - 0.79)}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-black text-[#0F172A] leading-tight">79</span>
                  <span className="text-[10px] text-[#94A3B8] font-medium leading-none">/ 100</span>
                </div>
              </div>

              {/* 3 Metric Progress Bars */}
              <div className="flex-1 space-y-2">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-[#64748B] font-medium">WIR Pass Rate</span>
                    <span className="font-extrabold text-[#0F172A]">83%</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
                    <div className="h-full bg-[#10B981] rounded-full" style={{ width: '83%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-[#64748B] font-medium">NC Health</span>
                    <span className="font-extrabold text-[#0F172A]">85%</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
                    <div className="h-full bg-[#0D9488] rounded-full" style={{ width: '85%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-[#64748B] font-medium">Audit Score</span>
                    <span className="font-extrabold text-[#0F172A]">72%</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
                    <div className="h-full bg-[#315EFB] rounded-full" style={{ width: '72%' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-slate-100 my-4" />

            {/* Top Critical Issues List */}
            <div>
              <div className="flex items-center justify-between pb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={15} className="text-rose-500" />
                  <span className="text-xs font-bold text-[#0F172A]">Top Critical Issues</span>
                </div>
                <button
                  onClick={() => setTab('nc')}
                  className="text-xs font-bold text-[#315EFB] hover:underline"
                >
                  See all &gt;
                </button>
              </div>

              <div className="space-y-3">
                {/* Item 1 */}
                <div
                  onClick={() => {
                    setTab('nc');
                    selectNC('NC-0001');
                  }}
                  className="flex items-center gap-3 p-1 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors group"
                >
                  <img
                    src="/assets/defect-thumb-1.png"
                    alt="Defect"
                    className="w-10 h-10 rounded-lg object-cover border border-slate-200 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-50 text-[#C63F43] border border-rose-100">
                        CRITICAL
                      </span>
                    </div>
                    <div className="text-xs font-bold text-[#0F172A] truncate mt-0.5 group-hover:text-[#315EFB] transition-colors">
                      Floor 05 – Column honeycombing
                    </div>
                    <div className="text-[11px] text-[#64748B] truncate">
                      Riverstone • Gurugram
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-[#94A3B8] text-xs flex-shrink-0">
                    <span>28d</span>
                    <ChevronRight size={13} />
                  </div>
                </div>

                {/* Item 2 */}
                <div
                  onClick={() => {
                    setTab('wir');
                    selectWIR('WIR-0021');
                  }}
                  className="flex items-center gap-3 p-1 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors group"
                >
                  <img
                    src="/assets/defect-thumb-2.png"
                    alt="Defect"
                    className="w-10 h-10 rounded-lg object-cover border border-slate-200 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-orange-50 text-[#EA580C] border border-orange-100">
                        SLA BREACH
                      </span>
                    </div>
                    <div className="text-xs font-bold text-[#0F172A] truncate mt-0.5 group-hover:text-[#315EFB] transition-colors">
                      WIR-0021 – Concrete pour review
                    </div>
                    <div className="text-[11px] text-[#64748B] truncate">
                      Riverstone • Gurugram
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-[#94A3B8] text-xs flex-shrink-0">
                    <span>7d</span>
                    <ChevronRight size={13} />
                  </div>
                </div>

                {/* Item 3 */}
                <div
                  onClick={() => {
                    setTab('nc');
                    selectNC('NC-0006');
                  }}
                  className="flex items-center gap-3 p-1 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors group"
                >
                  <img
                    src="/assets/defect-thumb-3.png"
                    alt="Defect"
                    className="w-10 h-10 rounded-lg object-cover border border-slate-200 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-50 text-[#315EFB] border border-blue-100">
                        WORKMANSHIP
                      </span>
                    </div>
                    <div className="text-xs font-bold text-[#0F172A] truncate mt-0.5 group-hover:text-[#315EFB] transition-colors">
                      Tower B – Rebar spacing deviation
                    </div>
                    <div className="text-[11px] text-[#64748B] truncate">
                      Meridian • Mumbai
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-[#94A3B8] text-xs flex-shrink-0">
                    <span>4d</span>
                    <ChevronRight size={13} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Sales & Construction Map */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-2xs">
            {/* Header */}
            <div className="flex items-center justify-between pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-[#64748B]">
                  <BarChart3 size={15} />
                </div>
                <h2 className="text-sm font-bold text-[#0F172A]">Sales & Construction Map</h2>
              </div>
              <button className="text-slate-400 hover:text-[#0F172A] transition-colors">
                <Maximize2 size={13} />
              </button>
            </div>

            {/* Map Canvas with Floating Info Card */}
            <div className="relative w-full h-44 rounded-xl overflow-hidden bg-slate-50 border border-slate-200">
              <img
                src="/assets/mumbai-map-card.png"
                alt="Mumbai Map"
                className="w-full h-full object-cover select-none"
              />

              {/* Floating Mumbai Summary Card */}
              <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-xs border border-[#E2E8F0] rounded-xl p-3 shadow-md w-36 text-xs pointer-events-none">
                <div className="flex items-center justify-between font-bold text-[#0F172A] pb-1.5 border-b border-slate-100 mb-1.5">
                  <span>Mumbai</span>
                  <ChevronRight size={12} className="text-slate-400" />
                </div>
                <div className="space-y-1 text-[11px] text-[#64748B]">
                  <div className="flex items-center gap-1.5">
                    <Building2 size={11} className="text-slate-400" />
                    <span>4 Projects</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Home size={11} className="text-slate-400" />
                    <span>889 Units Sold</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <BarChart3 size={11} className="text-slate-400" />
                    <span>71% Construction</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck size={11} className="text-slate-400" />
                    <span>79 Quality Score</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Project Detail Drawer */}
      {state.selectedProjectId && (
        <ProjectDetailDrawer
          projectId={state.selectedProjectId}
          onClose={() => selectProject(null)}
        />
      )}
    </div>
  );
}
