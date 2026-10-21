// ============================================================
// PAGE: COMPLIANCE TRACKER & CP PAYMENT PORTAL
// Implements Slide 11 from Godrej presentation:
// 1. Compliance Tracker: Dynamic statutory data collection (RERA, MoEF, Fire, Safety)
// 2. CP Payment Portal: Channel Partner brokerage disbursements & transaction tracking
// Data ingested via enterprise APIs (Zero manual data entry on this end)
// ============================================================

import React, { useState, useMemo, useEffect } from 'react';
import {
  ShieldCheck, DollarSign, FileText, CheckCircle2, AlertTriangle,
  Clock, ArrowRight, Download, Search, Filter, ChevronRight, X,
  Building2, UserCheck, CreditCard, ExternalLink, RefreshCw, Layers,
  MapPin, RotateCcw, Calendar, ChevronDown
} from 'lucide-react';
import clsx from 'clsx';
import { useApp } from '../store/appStore';
import {
  COMPLIANCE_RECORDS, CP_PAYOUTS, PROJECTS,
  type ComplianceRecord, type ChannelPartnerPayout, type ComplianceCategory
} from '../data/seedData';
import { isProjectInCity } from '../data/calculations';

const CITIES = ['All Locations', 'Mumbai', 'Thane', 'Navi Mumbai', 'Pune', 'Bengaluru', 'Gurugram', 'Hyderabad'];

const COMPLIANCE_CATEGORIES: (ComplianceCategory | 'All Categories')[] = [
  'All Categories',
  'RERA Compliance',
  'Environmental Clearance (MoEF)',
  'Fire & Life Safety NOC',
  'Structural Stability (IS 456)',
  'Labour & Factory License',
];

export interface ComplianceAndCPPageProps {
  initialTab?: 'compliance' | 'cp';
  hideHeaderSwitcher?: boolean;
  selectedCity?: string;
  selectedProjectId?: string;
  onCityChange?: (city: string) => void;
  onProjectChange?: (projectId: string) => void;
}

export function ComplianceAndCPPage({
  initialTab = 'compliance',
  hideHeaderSwitcher = false,
  selectedCity: propCity,
  selectedProjectId: propProjectId,
  onCityChange,
  onProjectChange,
}: ComplianceAndCPPageProps = {}) {
  const { selectProject, setTab } = useApp();
  const [activeTab, setActiveTab] = useState<'compliance' | 'cp'>(initialTab);

  const [internalCity, setInternalCity] = useState(propCity || 'All Locations');
  const [internalProjectId, setInternalProjectId] = useState(propProjectId || 'ALL');

  const selectedCity = propCity !== undefined ? propCity : internalCity;
  const selectedProjectId = propProjectId !== undefined ? propProjectId : internalProjectId;

  const availableProjects = useMemo(() => {
    return PROJECTS.filter(p => isProjectInCity(p.city, selectedCity));
  }, [selectedCity]);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // ── Compliance Tracker State ──
  const [selectedCategory, setSelectedCategory] = useState<ComplianceCategory | 'All Categories'>('All Categories');
  const [complianceSearch, setComplianceSearch] = useState('');
  const [selectedCompliance, setSelectedCompliance] = useState<ComplianceRecord | null>(null);

  // ── CP Payment Portal State ──
  const [cpSearch, setCpSearch] = useState('');
  const [selectedPayout, setSelectedPayout] = useState<ChannelPartnerPayout | null>(null);
  const [paymentSuccessModal, setPaymentSuccessModal] = useState<{
    cpName: string;
    amountCr: number;
    utr: string;
  } | null>(null);

  // Filtered Compliance
  const filteredCompliance = useMemo(() => {
    return COMPLIANCE_RECORDS.filter(c => {
      if (selectedProjectId !== 'ALL' && c.projectId !== selectedProjectId) return false;
      if (selectedCity !== 'All Locations') {
        const proj = PROJECTS.find(p => p.id === c.projectId);
        if (!proj || !isProjectInCity(proj.city, selectedCity)) return false;
      }
      if (selectedCategory !== 'All Categories' && c.category !== selectedCategory) return false;
      if (complianceSearch.trim()) {
        const q = complianceSearch.toLowerCase();
        const proj = PROJECTS.find(p => p.id === c.projectId);
        if (!c.title.toLowerCase().includes(q) &&
            !c.authority.toLowerCase().includes(q) &&
            !proj?.name.toLowerCase().includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [selectedCategory, complianceSearch, selectedProjectId, selectedCity]);

  // Filtered CP Payouts
  const filteredCP = useMemo(() => {
    return CP_PAYOUTS.filter(cp => {
      if (selectedProjectId !== 'ALL' && cp.projectId !== selectedProjectId) return false;
      if (selectedCity !== 'All Locations') {
        const proj = PROJECTS.find(p => p.id === cp.projectId);
        if (!proj || !isProjectInCity(proj.city, selectedCity)) return false;
      }
      if (cpSearch.trim()) {
        const q = cpSearch.toLowerCase();
        const proj = PROJECTS.find(p => p.id === cp.projectId);
        if (!cp.cpName.toLowerCase().includes(q) &&
            !cp.reraRegNumber.toLowerCase().includes(q) &&
            !proj?.name.toLowerCase().includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [cpSearch, selectedProjectId, selectedCity]);

  // Metrics
  const totalBrokerage = useMemo(() => filteredCP.reduce((acc, c) => acc + c.totalBrokerageCr, 0).toFixed(2), [filteredCP]);
  const paidBrokerage = useMemo(() => filteredCP.reduce((acc, c) => acc + c.paidBrokerageCr, 0).toFixed(2), [filteredCP]);
  const outstandingBrokerage = useMemo(() => filteredCP.reduce((acc, c) => acc + c.outstandingBrokerageCr, 0).toFixed(2), [filteredCP]);

  const compliantCount = useMemo(() => filteredCompliance.filter(c => c.status === 'Compliant').length, [filteredCompliance]);
  const actionRequiredCount = useMemo(() => filteredCompliance.filter(c => c.status === 'Action Required').length, [filteredCompliance]);

  const handleSimulatePayment = (payout: ChannelPartnerPayout) => {
    const utr = `HDFCR${Date.now().toString().slice(-8)}`;
    setPaymentSuccessModal({
      cpName: payout.cpName,
      amountCr: payout.outstandingBrokerageCr,
      utr,
    });
    setSelectedPayout(null);
  };

  return (
    <div className="space-y-4 pb-12">
      {/* ============================================================
          PAGE HEADER & REST API CONNECTOR STATUS
          ============================================================ */}
      {!hideHeaderSwitcher && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E6E9ED]">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#17191D]">
                Compliance Tracker & CP Payment Portal
              </h1>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#E6F4F1] text-[#006B5B] border border-[#B3E0D8]">
                Statutory & Commercial Clearance
              </span>
            </div>
            <p className="text-xs text-[#6B7280] mt-0.5">
              Aggregated via Compliance Tracker API and CP Payment Gateway. Unified oversight across RERA filings and channel partner disbursements.
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center bg-[#F1F5F9] p-1 rounded-xl border border-[#E6E9ED] self-start sm:self-center">
            <button
              onClick={() => setActiveTab('compliance')}
              className={clsx(
                'flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all',
                activeTab === 'compliance'
                  ? 'bg-white text-[#17191D] shadow-xs'
                  : 'text-[#6B7280] hover:text-[#17191D]'
              )}
            >
              <ShieldCheck size={14} className={activeTab === 'compliance' ? 'text-[#006B5B]' : 'text-slate-400'} />
              <span>Compliance Tracker (CT)</span>
              {actionRequiredCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-amber-100 text-[#B7791F]">
                  {actionRequiredCount} Action
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('cp')}
              className={clsx(
                'flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all',
                activeTab === 'cp'
                  ? 'bg-white text-[#17191D] shadow-xs'
                  : 'text-[#6B7280] hover:text-[#17191D]'
              )}
            >
              <DollarSign size={14} className={activeTab === 'cp' ? 'text-[#18845B]' : 'text-slate-400'} />
              <span>CP Payment Portal (CP)</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-slate-200 text-slate-700">
                ₹{outstandingBrokerage} Cr Due
              </span>
            </button>
          </div>
        </div>
      )}

      {/* ============================================================
          SHARED LOCATION & PROJECT FILTER BLOCK
          ============================================================ */}
      <div className="bg-white border border-[#E6E9ED] rounded-xl p-4 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#F1F5F9]">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-[#17191D] uppercase tracking-wider">
              {activeTab === 'compliance' ? 'Statutory Compliance Scope' : 'Brokerage & Channel Partner Scope'}
            </h2>
            <span className="text-xs text-[#6B7280]">
              · {selectedCity} · {selectedProjectId === 'ALL' ? `All ${availableProjects.length} Projects` : PROJECTS.find(p => p.id === selectedProjectId)?.name}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-[#6B7280] font-medium">
            <div className="flex items-center gap-1 text-[#17191D] font-semibold">
              <Calendar size={13} className="text-[#006B5B]" />
              <span>Q3 FY25</span>
            </div>
            {(selectedCity !== 'All Locations' || selectedProjectId !== 'ALL') && (
              <>
                <div className="h-4 w-px bg-[#E6E9ED]" />
                <button
                  onClick={() => {
                    setInternalCity('All Locations');
                    setInternalProjectId('ALL');
                    if (onCityChange) onCityChange('All Locations');
                    if (onProjectChange) onProjectChange('ALL');
                  }}
                  className="flex items-center gap-1 text-xs font-medium text-[#6B7280] hover:text-[#17191D] hover:bg-[#F1F3F5] px-2 py-1 rounded transition-colors"
                >
                  <RotateCcw size={12} />
                  <span>Reset</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* 2 SIDE-BY-SIDE DROPDOWNS: Location & Project */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* 1. City Dropdown */}
          <div className="relative">
            <label className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider block mb-1">
              Location
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#1E3A8A]">
                <MapPin size={16} />
              </div>
              <select
                value={selectedCity}
                onChange={(e) => {
                  const val = e.target.value;
                  setInternalCity(val);
                  setInternalProjectId('ALL');
                  if (onCityChange) onCityChange(val);
                  if (onProjectChange) onProjectChange('ALL');
                }}
                className="h-10 w-full pl-9 pr-8 bg-white border border-slate-300 rounded-lg text-xs font-bold text-[#17191D] focus:outline-none focus:border-[#1E3A8A] shadow-2xs appearance-none cursor-pointer"
              >
                {CITIES.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
            </div>
          </div>

          {/* 2. Project Dropdown */}
          <div className="relative">
            <label className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider block mb-1">
              Project
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#1E3A8A]">
                <Building2 size={16} />
              </div>
              <select
                value={selectedProjectId}
                onChange={(e) => {
                  const val = e.target.value;
                  setInternalProjectId(val);
                  if (onProjectChange) onProjectChange(val);
                }}
                className="h-10 w-full pl-9 pr-8 bg-white border border-slate-300 rounded-lg text-xs font-bold text-[#17191D] focus:outline-none focus:border-[#1E3A8A] shadow-2xs appearance-none cursor-pointer"
              >
                <option value="ALL">All Projects ({availableProjects.length})</option>
                {availableProjects.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.city})
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================
          VIEW 1: COMPLIANCE TRACKER (CT)
          ============================================================ */}
      {activeTab === 'compliance' && (
        <div className="space-y-4">
          {/* Top KPI Metrics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white border border-[#E6E9ED] rounded-xl p-3.5 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280] block mb-1">
                Total Statutory Filings
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-[#17191D] tabular-nums tracking-tight">
                  {COMPLIANCE_RECORDS.length}
                </span>
                <span className="text-xs text-[#6B7280] font-bold">Mandatory</span>
              </div>
              <p className="text-[10px] text-[#18845B] mt-0.5 font-semibold">
                RERA, MoEF, Fire & Labour
              </p>
            </div>

            <div className="bg-white border border-[#E6E9ED] rounded-xl p-3.5 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280] block mb-1">
                Compliant & Verified
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-[#18845B] tabular-nums tracking-tight">
                  {compliantCount}
                </span>
                <span className="text-xs text-[#6B7280]">/ {COMPLIANCE_RECORDS.length}</span>
              </div>
              <p className="text-[10px] text-[#18845B] mt-0.5 font-semibold">
                {Math.round((compliantCount / COMPLIANCE_RECORDS.length) * 100)}% Statutory Adherence
              </p>
            </div>

            <div className="bg-white border border-[#E6E9ED] rounded-xl p-3.5 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280] block mb-1">
                Action Required (SEIAA / Air)
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-[#D92D20] tabular-nums tracking-tight">
                  {actionRequiredCount}
                </span>
                <span className="text-xs text-[#D92D20] font-bold">Alert</span>
              </div>
              <p className="text-[10px] text-[#D92D20] mt-0.5 font-semibold">
                Riverstone PM10 Sprinklers
              </p>
            </div>

            <div className="bg-white border border-[#E6E9ED] rounded-xl p-3.5 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280] block mb-1">
                Average Compliance Rating
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-[#006B5B] tabular-nums tracking-tight">
                  4.2
                </span>
                <span className="text-xs text-[#6B7280]">/ 5.0</span>
              </div>
              <p className="text-[10px] text-[#006B5B] mt-0.5 font-semibold">
                Dynamic 5-point rating score
              </p>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-[#E6E9ED] p-3 rounded-xl shadow-2xs">
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
              {COMPLIANCE_CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={clsx(
                    'px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all',
                    selectedCategory === cat
                      ? 'bg-[#17191D] text-white shadow-xs'
                      : 'text-[#6B7280] hover:text-[#17191D] hover:bg-slate-100'
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="relative min-w-[200px]">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search compliance or project..."
                value={complianceSearch}
                onChange={e => setComplianceSearch(e.target.value)}
                className="w-full h-8 pl-8 pr-3 text-xs bg-slate-50 border border-[#E6E9ED] rounded-lg text-[#17191D] placeholder-slate-400 outline-none focus:bg-white focus:border-[#006B5B]"
              />
            </div>
          </div>

          {/* Compliance Records Table */}
          <div className="bg-white border border-[#E6E9ED] rounded-xl shadow-2xs overflow-hidden">
            <div className="px-5 py-3 border-b border-[#F1F5F9] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#17191D]">
                  Statutory Clearances & Dynamic Compliance Forms
                </h3>
                <p className="text-xs text-[#6B7280] mt-0.5">
                  Covers RERA quarterly filings, environmental clearances, fire NOCs, and structural engineering affidavits.
                </p>
              </div>
              <span className="text-xs text-[#6B7280] font-semibold">
                Showing {filteredCompliance.length} Filings
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E6E9ED] bg-slate-50/60 text-[#6B7280] font-bold">
                    <th className="py-3 px-4">Compliance ID & Title</th>
                    <th className="py-3 px-3">Project</th>
                    <th className="py-3 px-3">Regulatory Authority</th>
                    <th className="py-3 px-3">Cadence</th>
                    <th className="py-3 px-3">Due Date</th>
                    <th className="py-3 px-3">Rating (1-5)</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9]">
                  {filteredCompliance.map(record => {
                    const proj = PROJECTS.find(p => p.id === record.projectId);
                    return (
                      <tr
                        key={record.id}
                        onClick={() => setSelectedCompliance(record)}
                        className="hover:bg-[#FAFBFB] cursor-pointer transition-colors group"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">
                              {record.id}
                            </span>
                            <span className="font-bold text-[#17191D] group-hover:text-[#006B5B] transition-colors max-w-sm line-clamp-1">
                              {record.title}
                            </span>
                          </div>
                          <span className="text-[10px] text-[#6B7280] block mt-0.5">
                            {record.category} · Officer: {record.assignedOfficer}
                          </span>
                        </td>

                        <td className="py-3 px-3 font-semibold text-[#17191D]">
                          {proj?.name}
                          <span className="text-[10px] text-[#6B7280] block">{proj?.city}</span>
                        </td>

                        <td className="py-3 px-3 text-[#6B7280] font-medium max-w-[180px] truncate">
                          {record.authority}
                        </td>

                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                            {record.filingFrequency}
                          </span>
                        </td>

                        <td className="py-3 px-3 tabular-nums font-medium text-[#17191D]">
                          {record.dueDate}
                        </td>

                        <td className="py-3 px-3">
                          <span className="font-bold tabular-nums text-[#006B5B]">
                            {'★'.repeat(record.complianceRating)}{'☆'.repeat(5 - record.complianceRating)}
                          </span>
                          <span className="text-[10px] text-slate-400 ml-1">({record.complianceRating}/5)</span>
                        </td>

                        <td className="py-3 px-3">
                          <span className={clsx(
                            'px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1',
                            record.status === 'Compliant' ? 'bg-emerald-100 text-[#18845B]' :
                            record.status === 'Action Required' ? 'bg-rose-100 text-[#D92D20]' :
                            'bg-amber-100 text-[#B7791F]'
                          )}>
                            <span className={clsx('w-1.5 h-1.5 rounded-full',
                              record.status === 'Compliant' ? 'bg-[#18845B]' :
                              record.status === 'Action Required' ? 'bg-[#D92D20]' : 'bg-[#B7791F]'
                            )} />
                            {record.status}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <span className="text-[#006B5B] font-bold hover:underline flex items-center justify-end gap-1">
                            <span>Inspect</span>
                            <ChevronRight size={12} />
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          VIEW 2: CP PAYMENT PORTAL (CP)
          From Godrej Slide 11:
          View Outstanding → Select Payment → Process Payment → Payment Confirmation
          ============================================================ */}
      {activeTab === 'cp' && (
        <div className="space-y-4">
          {/* CP 4-Stage Transaction Header */}
          <div className="bg-white border border-[#E6E9ED] rounded-xl p-4 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280] block mb-2">
              Channel Partner Brokerage Processing Lifecycle
            </span>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-lg bg-teal-50 border border-teal-200">
                <span className="text-[10px] font-bold text-[#006B5B] uppercase block">Stage 1</span>
                <span className="font-bold text-[#17191D] block mt-0.5">1. View Outstanding</span>
                <span className="text-[10px] text-[#6B7280]">Verified RERA Brokerage</span>
              </div>
              <div className="p-2.5 rounded-lg bg-teal-50 border border-teal-200">
                <span className="text-[10px] font-bold text-[#006B5B] uppercase block">Stage 2</span>
                <span className="font-bold text-[#17191D] block mt-0.5">2. Select Payment</span>
                <span className="text-[10px] text-[#6B7280]">Invoice & TDS Check (5%)</span>
              </div>
              <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200">
                <span className="text-[10px] font-bold text-blue-700 uppercase block">Stage 3</span>
                <span className="font-bold text-[#17191D] block mt-0.5">3. Process Payment</span>
                <span className="text-[10px] text-[#6B7280]">Direct Bank API Dispatch</span>
              </div>
              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200">
                <span className="text-[10px] font-bold text-emerald-700 uppercase block">Stage 4</span>
                <span className="font-bold text-[#17191D] block mt-0.5">4. Payment Confirmation</span>
                <span className="text-[10px] text-[#6B7280]">Automated UTR Generation</span>
              </div>
            </div>
          </div>

          {/* Brokerage Summary Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white border border-[#E6E9ED] rounded-xl p-3.5 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280] block mb-1">
                Total Brokerage Booked
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-[#17191D] tabular-nums tracking-tight">
                  ₹{totalBrokerage}
                </span>
                <span className="text-xs text-[#6B7280] font-bold">Cr</span>
              </div>
              <p className="text-[10px] text-[#6B7280] mt-0.5">
                Across 77 booked units
              </p>
            </div>

            <div className="bg-white border border-[#E6E9ED] rounded-xl p-3.5 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280] block mb-1">
                Disbursed to Channel Partners
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-[#18845B] tabular-nums tracking-tight">
                  ₹{paidBrokerage}
                </span>
                <span className="text-xs text-[#18845B] font-bold">Cr</span>
              </div>
              <p className="text-[10px] text-[#18845B] mt-0.5 font-semibold">
                Cleared via Direct Bank UTR
              </p>
            </div>

            <div className="bg-white border border-[#E6E9ED] rounded-xl p-3.5 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280] block mb-1">
                Outstanding Balance Due
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-[#D92D20] tabular-nums tracking-tight">
                  ₹{outstandingBrokerage}
                </span>
                <span className="text-xs text-[#D92D20] font-bold">Cr</span>
              </div>
              <p className="text-[10px] text-[#D92D20] mt-0.5 font-semibold">
                Pending finance clearance
              </p>
            </div>

            <div className="bg-white border border-[#E6E9ED] rounded-xl p-3.5 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280] block mb-1">
                Active Channel Partners
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-[#006B5B] tabular-nums tracking-tight">
                  142
                </span>
                <span className="text-xs text-[#6B7280] font-bold">Partners</span>
              </div>
              <p className="text-[10px] text-[#006B5B] mt-0.5 font-semibold">
                MahaRERA & K-RERA certified
              </p>
            </div>
          </div>

          {/* CP Payouts Table */}
          <div className="bg-white border border-[#E6E9ED] rounded-xl shadow-2xs overflow-hidden">
            <div className="px-5 py-3 border-b border-[#F1F5F9] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#17191D]">
                  Channel Partner Invoices & Disbursement Schedule
                </h3>
                <p className="text-xs text-[#6B7280] mt-0.5">
                  Direct integration with banking API gateway. One-click payment processing with statutory TDS deduction.
                </p>
              </div>

              <div className="relative min-w-[200px]">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search broker, RERA no..."
                  value={cpSearch}
                  onChange={e => setCpSearch(e.target.value)}
                  className="w-full h-8 pl-8 pr-3 text-xs bg-slate-50 border border-[#E6E9ED] rounded-lg text-[#17191D] placeholder-slate-400 outline-none focus:bg-white focus:border-[#006B5B]"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E6E9ED] bg-slate-50/60 text-[#6B7280] font-bold">
                    <th className="py-3 px-4">Channel Partner (CP)</th>
                    <th className="py-3 px-3">RERA Reg Number</th>
                    <th className="py-3 px-3">Project</th>
                    <th className="py-3 px-3 text-center">Units Booked</th>
                    <th className="py-3 px-3 text-right">Total Brokerage</th>
                    <th className="py-3 px-3 text-right">Paid Amount</th>
                    <th className="py-3 px-3 text-right">Outstanding Due</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9]">
                  {filteredCP.map(cp => {
                    const proj = PROJECTS.find(p => p.id === cp.projectId);
                    return (
                      <tr
                        key={cp.id}
                        className="hover:bg-[#FAFBFB] transition-colors"
                      >
                        <td className="py-3 px-4">
                          <span className="font-bold text-[#17191D] block">
                            {cp.cpName}
                          </span>
                          <span className="text-[10px] text-[#6B7280]">
                            Invoice: {cp.invoiceNumber}
                          </span>
                        </td>

                        <td className="py-3 px-3 font-mono text-[11px] text-slate-600">
                          {cp.reraRegNumber}
                        </td>

                        <td className="py-3 px-3 font-semibold text-[#17191D]">
                          {proj?.name}
                          <span className="text-[10px] text-[#6B7280] block">{proj?.city}</span>
                        </td>

                        <td className="py-3 px-3 text-center font-bold tabular-nums text-[#17191D]">
                          {cp.unitsBooked}
                        </td>

                        <td className="py-3 px-3 text-right font-bold text-[#17191D] tabular-nums">
                          ₹{cp.totalBrokerageCr} Cr
                        </td>

                        <td className="py-3 px-3 text-right font-semibold text-[#18845B] tabular-nums">
                          ₹{cp.paidBrokerageCr} Cr
                        </td>

                        <td className="py-3 px-3 text-right font-bold text-[#D92D20] tabular-nums">
                          ₹{cp.outstandingBrokerageCr} Cr
                        </td>

                        <td className="py-3 px-3">
                          <span className={clsx(
                            'px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1',
                            cp.status === 'Payment Completed' ? 'bg-emerald-100 text-[#18845B]' :
                            cp.status === 'Processing Payment' ? 'bg-blue-100 text-blue-700' :
                            'bg-amber-100 text-[#B7791F]'
                          )}>
                            {cp.status}
                          </span>
                          {cp.bankUtr && (
                            <span className="text-[9px] font-mono text-slate-400 block mt-0.5 truncate max-w-[110px]">
                              UTR: {cp.bankUtr}
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right">
                          {cp.outstandingBrokerageCr > 0 ? (
                            <button
                              onClick={() => setSelectedPayout(cp)}
                              className="px-2.5 py-1 bg-[#17191D] hover:bg-black text-white text-[11px] font-bold rounded-lg shadow-2xs transition-colors"
                            >
                              Process Payment
                            </button>
                          ) : (
                            <span className="text-emerald-700 font-bold text-[11px] flex items-center justify-end gap-1">
                              <CheckCircle2 size={12} /> Cleared
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          DRAWER: COMPLIANCE RECORD INSPECTOR
          ============================================================ */}
      {selectedCompliance && (
        <div
          onClick={() => setSelectedCompliance(null)}
          className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="w-full max-w-xl bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-200 overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-200 bg-slate-50/60 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="font-mono text-xs font-bold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded shadow-2xs">
                    {selectedCompliance.id}
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#006B5B] text-white">
                    {selectedCompliance.category}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {selectedCompliance.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Authority: {selectedCompliance.authority}
                </p>
              </div>

              <button
                onClick={() => setSelectedCompliance(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                  Remarks & Verification Notes
                </span>
                <p className="font-medium text-slate-800 leading-relaxed">
                  {selectedCompliance.remarks}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg border border-slate-200 bg-white">
                  <span className="text-[10px] text-slate-500 font-medium block">Filing Cadence</span>
                  <strong className="text-sm font-bold text-slate-900">{selectedCompliance.filingFrequency}</strong>
                </div>
                <div className="p-3 rounded-lg border border-slate-200 bg-white">
                  <span className="text-[10px] text-slate-500 font-medium block">Next Due Date</span>
                  <strong className="text-sm font-bold text-slate-900">{selectedCompliance.dueDate}</strong>
                </div>
              </div>

              {/* PDF Document Attachment Simulation */}
              <div className="p-4 rounded-xl border border-teal-200 bg-teal-50/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-teal-100 text-[#006B5B] flex items-center justify-center font-bold">
                    <FileText size={18} />
                  </div>
                  <div>
                    <span className="font-bold text-[#17191D] block">
                      Certified Regulatory Filing Document.pdf
                    </span>
                    <span className="text-[11px] text-[#6B7280]">
                      Digitally signed by {selectedCompliance.assignedOfficer} · 4.2 MB
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => alert(`Simulating download of verified statutory filing: ${selectedCompliance.id}.pdf`)}
                  className="px-3 py-1.5 bg-[#006B5B] hover:bg-[#0D9488] text-white font-bold rounded-lg transition-colors flex items-center gap-1 shadow-2xs"
                >
                  <Download size={13} />
                  <span>Download</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          MODAL: PROCESS CP BROKERAGE PAYMENT
          ============================================================ */}
      {selectedPayout && (
        <div
          onClick={() => setSelectedPayout(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4 animate-in zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280] block">
                  Stage 3 · Banking Gateway
                </span>
                <h3 className="text-base font-bold text-[#17191D]">
                  Disburse Channel Partner Commission
                </h3>
              </div>
              <button onClick={() => setSelectedPayout(null)} className="p-1 text-slate-400 hover:text-slate-900">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-[#6B7280]">Channel Partner:</span>
                <strong className="text-[#17191D]">{selectedPayout.cpName}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-[#6B7280]">RERA Registration:</span>
                <span className="font-mono font-bold text-slate-700">{selectedPayout.reraRegNumber}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-[#6B7280]">Invoice Number:</span>
                <span className="font-mono font-bold text-slate-700">{selectedPayout.invoiceNumber}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-[#6B7280]">Gross Outstanding Amount:</span>
                <strong className="text-[#17191D]">₹{selectedPayout.outstandingBrokerageCr} Cr</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 text-[#18845B]">
                <span>TDS Deduction (5% u/s 194H):</span>
                <span className="font-bold">-₹{(selectedPayout.outstandingBrokerageCr * 0.05).toFixed(3)} Cr</span>
              </div>
              <div className="flex justify-between py-2 bg-slate-50 px-3 rounded-lg text-sm font-bold">
                <span>Net Payable to CP:</span>
                <span className="text-[#006B5B]">₹{(selectedPayout.outstandingBrokerageCr * 0.95).toFixed(3)} Cr</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                onClick={() => setSelectedPayout(null)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSimulatePayment(selectedPayout)}
                className="px-4 py-2 bg-[#006B5B] hover:bg-[#0D9488] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <CreditCard size={14} />
                <span>Authorize & Dispatch Bank Transfer</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          MODAL: PAYMENT CONFIRMATION SUCCESS (Stage 4)
          ============================================================ */}
      {paymentSuccessModal && (
        <div
          onClick={() => setPaymentSuccessModal(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-emerald-200 p-6 space-y-4 text-center animate-in zoom-in-95 duration-200"
          >
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 size={26} />
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                Stage 4 · Payment Confirmation
              </span>
              <h3 className="text-lg font-bold text-[#17191D] mt-0.5">
                Brokerage Successfully Disbursed
              </h3>
              <p className="text-xs text-[#6B7280] mt-1">
                Direct bank transfer executed to <strong>{paymentSuccessModal.cpName}</strong>.
              </p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-left text-xs space-y-1.5 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Bank Reference UTR:</span>
                <span className="font-bold text-slate-800">{paymentSuccessModal.utr}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Disbursed Net Amount:</span>
                <span className="font-bold text-[#006B5B]">₹{(paymentSuccessModal.amountCr * 0.95).toFixed(3)} Cr</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Timestamp:</span>
                <span className="text-slate-600">{new Date().toLocaleTimeString()}</span>
              </div>
            </div>

            <button
              onClick={() => setPaymentSuccessModal(null)}
              className="w-full py-2 bg-[#17191D] hover:bg-black text-white text-xs font-bold rounded-xl transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
