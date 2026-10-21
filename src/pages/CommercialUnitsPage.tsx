// ============================================================
// PAGE: COMMERCIAL & UNIT INVENTORY INTELLIGENCE
// Dedicated CXO view for residential and commercial unit inventory,
// booked value (₹ Cr), sales absorption vs construction delivery pace.
// ============================================================

import React, { useState, useMemo, useEffect } from 'react';
import {
  Building2, MapPin, RotateCcw, Calendar, TrendingUp, DollarSign, PieChart, Layers,
  ChevronRight, ArrowUpRight, CheckCircle2, AlertCircle, Filter, Download, ChevronDown,
  FileText, User, Phone, Mail, FileCheck, Shield, Upload, Check, X, Search, SlidersHorizontal
} from 'lucide-react';
import clsx from 'clsx';
import { useApp } from '../store/appStore';
import { getCXOCommercialInventory, isProjectInCity } from '../data/calculations';
import { PROJECTS, TOWERS_DATA, D4U_ENQUIRIES, type D4UEnquiry, type D4UDocument, type D4UStage } from '../data/seedData';

const PROJECT_BILLBOARDS: Record<string, string> = {
  P001: '/projects/billboards/meridian-billboard.jpg',
  P002: '/projects/billboards/northgate-billboard.jpg',
  P003: '/projects/billboards/cedar-park-billboard.jpg',
  P004: '/projects/billboards/riverstone-billboard.jpg',
  P005: '/projects/billboards/harbour-point-billboard.jpg',
  P006: '/projects/billboards/summit-greens-billboard.jpg',
  P007: '/projects/billboards/vivanta-sereno-billboard.jpg',
};

const CITIES = ['All Locations', 'Mumbai', 'Thane', 'Navi Mumbai', 'Pune', 'Bengaluru', 'Gurugram', 'Hyderabad'];

export interface CommercialUnitsPageProps {
  initialSubTab?: 'inventory' | 'd4u-workflow' | 'd4u-config';
  hideHeaderSwitcher?: boolean;
  selectedCity?: string;
  selectedProjectId?: string;
  onCityChange?: (city: string) => void;
  onProjectChange?: (projectId: string) => void;
}

export function CommercialUnitsPage({
  initialSubTab = 'inventory',
  hideHeaderSwitcher = false,
  selectedCity: propCity,
  selectedProjectId: propProjectId,
  onCityChange,
  onProjectChange,
}: CommercialUnitsPageProps = {}) {
  const { selectProject, setTab } = useApp();
  const [activeSubTab, setActiveSubTab] = useState<'inventory' | 'd4u-workflow' | 'd4u-config'>(initialSubTab);
  const [internalCity, setInternalCity] = useState('All Locations');
  const [internalProjectId, setInternalProjectId] = useState('ALL');
  const [selectedType, setSelectedType] = useState('All Configurations');

  const selectedCity = propCity !== undefined ? propCity : internalCity;
  const selectedProjectId = propProjectId !== undefined ? propProjectId : internalProjectId;

  useEffect(() => {
    setActiveSubTab(initialSubTab);
  }, [initialSubTab]);

  const availableProjects = useMemo(() => {
    if (selectedCity === 'All Locations') return PROJECTS;
    return PROJECTS.filter(p => isProjectInCity(p.city, selectedCity));
  }, [selectedCity]);

  // D4U State
  const [enquiries, setEnquiries] = useState<D4UEnquiry[]>(D4U_ENQUIRIES);
  const [selectedEnquiry, setSelectedEnquiry] = useState<D4UEnquiry | null>(null);
  const [enquiryFilterStage, setEnquiryFilterStage] = useState<string>('All Stages');
  const [enquirySearch, setEnquirySearch] = useState<string>('');

  const commercial = useMemo(
    () => getCXOCommercialInventory(selectedCity),
    [selectedCity]
  );

  // Filtered D4U enquiries
  const filteredEnquiries = useMemo(() => {
    return enquiries.filter(enq => {
      if (selectedProjectId !== 'ALL' && enq.projectId !== selectedProjectId) return false;
      if (selectedCity !== 'All Locations') {
        const proj = PROJECTS.find(p => p.id === enq.projectId);
        if (!proj || !isProjectInCity(proj.city, selectedCity)) return false;
      }
      if (enquiryFilterStage !== 'All Stages' && enq.stage !== enquiryFilterStage) return false;
      if (enquirySearch.trim()) {
        const q = enquirySearch.toLowerCase();
        const proj = PROJECTS.find(p => p.id === enq.projectId);
        if (!enq.customerName.toLowerCase().includes(q) &&
            !enq.id.toLowerCase().includes(q) &&
            !proj?.name.toLowerCase().includes(q) &&
            !enq.unitNumber.toLowerCase().includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [enquiries, enquiryFilterStage, enquirySearch, selectedProjectId, selectedCity]);

  const handleVerifyDocument = (enqId: string, docId: string) => {
    setEnquiries(prev => prev.map(enq => {
      if (enq.id !== enqId) return enq;
      const updatedDocs = enq.documents.map(d => {
        if (d.id === docId) {
          return { ...d, status: 'Verified' as const, verifiedBy: 'D4U Automated KYC API' };
        }
        return d;
      });
      return { ...enq, documents: updatedDocs };
    }));

    if (selectedEnquiry && selectedEnquiry.id === enqId) {
      setSelectedEnquiry(prev => {
        if (!prev) return null;
        return {
          ...prev,
          documents: prev.documents.map(d => d.id === docId ? { ...d, status: 'Verified', verifiedBy: 'D4U Automated KYC API' } : d)
        };
      });
    }
  };

  return (
    <div className="space-y-4 pb-12">
      {/* ============================================================
          HEADER & REGIONAL SCOPE
          ============================================================ */}
      {!hideHeaderSwitcher && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E6E9ED]">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#17191D]">
                Commercial Units & D4U Sales Pipeline
              </h1>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#E6F4F1] text-[#006B5B] border border-[#B3E0D8]">
                Godrej D4U Connected
              </span>
            </div>
            <p className="text-xs text-[#6B7280] mt-0.5">
              Synchronized with Godrej D4U API. End-to-end buyer enquiry, KYC masking & document verification.
            </p>
          </div>

          {/* Sub-tab Switcher */}
          <div className="flex items-center bg-[#F1F5F9] p-1 rounded-xl border border-[#E6E9ED] self-start sm:self-center">
            <button
              onClick={() => setActiveSubTab('inventory')}
              className={clsx(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all',
                activeSubTab === 'inventory'
                  ? 'bg-white text-[#17191D] shadow-xs'
                  : 'text-[#6B7280] hover:text-[#17191D]'
              )}
            >
              <Building2 size={13} className={activeSubTab === 'inventory' ? 'text-[#006B5B]' : 'text-slate-400'} />
              <span>Unit Inventory & Absorption</span>
            </button>

            <button
              onClick={() => setActiveSubTab('d4u-workflow')}
              className={clsx(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all',
                activeSubTab === 'd4u-workflow'
                  ? 'bg-white text-[#17191D] shadow-xs'
                  : 'text-[#6B7280] hover:text-[#17191D]'
              )}
            >
              <FileCheck size={13} className={activeSubTab === 'd4u-workflow' ? 'text-[#006B5B]' : 'text-slate-400'} />
              <span>D4U Enquiry & KYC Flow</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-teal-100 text-[#006B5B]">
                {enquiries.length}
              </span>
            </button>

            <button
              onClick={() => setActiveSubTab('d4u-config')}
              className={clsx(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all',
                activeSubTab === 'd4u-config'
                  ? 'bg-white text-[#17191D] shadow-xs'
                  : 'text-[#6B7280] hover:text-[#17191D]'
              )}
            >
              <SlidersHorizontal size={13} className={activeSubTab === 'd4u-config' ? 'text-[#006B5B]' : 'text-slate-400'} />
              <span>D4U Config & BSP</span>
            </button>
          </div>
        </div>
      )}

      {/* ============================================================
          SHARED LOCATION & PROJECT FILTER BLOCK (APPLIES TO ALL VIEWS)
          ============================================================ */}
      <div className="bg-white border border-[#E6E9ED] rounded-xl p-4 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#F1F5F9]">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-[#17191D] uppercase tracking-wider">
              Commercial Portfolio Scope
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
          VIEW 1: UNIT INVENTORY & COMMERCIAL ABSORPTION (Current View)
          ============================================================ */}
      {activeSubTab === 'inventory' && (
        <div className="space-y-4">
          {/* TOP 4 COMMERCIAL SUMMARY KPIS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* KPI 1: Realized Booked Value */}
            <div className="bg-white border border-[#E6E9ED] rounded-xl p-4 shadow-2xs flex flex-col justify-between min-h-[145px]">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280] block truncate">
                  Booked Realization Value
                </span>
                <div className="mt-2 flex items-baseline gap-1.5 flex-wrap">
                  <span className="text-2xl sm:text-3xl font-black text-[#17191D] tracking-tight tabular-nums">
                    ₹{commercial.bookedValueCr.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs font-bold text-[#6B7280]">Cr</span>
                </div>
                <div className="text-xs text-[#6B7280] mt-1.5 font-medium leading-normal">
                  of <strong className="text-[#17191D]">₹{commercial.totalInventoryCr.toLocaleString('en-IN')} Cr</strong> total launch inventory
                </div>
              </div>
              <div className="w-full h-1.5 bg-[#F1F5F9] rounded-full mt-3 overflow-hidden">
                <div
                  className="h-full bg-[#006B5B] rounded-full"
                  style={{
                    width: `${Math.round((commercial.bookedValueCr / Math.max(1, commercial.totalInventoryCr)) * 100)}%`,
                  }}
                />
              </div>
            </div>

            {/* KPI 2: Total Units Sold */}
            <div className="bg-white border border-[#E6E9ED] rounded-xl p-4 shadow-2xs flex flex-col justify-between min-h-[145px]">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280] block truncate">
                  Total Units Sold
                </span>
                <div className="mt-2 flex items-baseline gap-1.5 flex-wrap">
                  <span className="text-2xl sm:text-3xl font-black text-[#006B5B] tracking-tight tabular-nums">
                    {commercial.soldUnits.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs font-bold text-[#6B7280]">
                    / {commercial.totalUnits.toLocaleString('en-IN')} units
                  </span>
                </div>
                <div className="text-xs text-[#6B7280] mt-1.5 font-medium leading-normal">
                  <strong className="text-[#006B5B]">{commercial.soldPercent}% absorbed</strong>
                  <span> · {commercial.leftUnits} units available</span>
                </div>
              </div>
              {/* 20-block absorption track */}
              <div className="mt-3 flex items-center gap-1">
                {Array.from({ length: 20 }).map((_, i) => {
                  const filled = i < Math.round((commercial.soldPercent / 100) * 20);
                  return (
                    <div
                      key={i}
                      className={clsx(
                        'flex-1 h-1.5 rounded-full transition-colors',
                        filled ? 'bg-[#006B5B]' : 'bg-[#E6E9ED]'
                      )}
                    />
                  );
                })}
              </div>
            </div>

            {/* KPI 3: Units Under Construction vs Completed */}
            <div className="bg-white border border-[#E6E9ED] rounded-xl p-4 shadow-2xs flex flex-col justify-between min-h-[145px]">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280] block truncate">
                  Under-Construction Inventory
                </span>
                <div className="mt-2 flex items-baseline gap-1.5 flex-wrap">
                  <span className="text-2xl sm:text-3xl font-black text-[#17191D] tracking-tight tabular-nums">
                    {commercial.underConstructionUnits.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs font-semibold text-[#6B7280]">units active</span>
                </div>
                <div className="text-xs text-[#6B7280] mt-1.5 font-medium leading-normal">
                  <span className="text-[#18845B] font-bold">{commercial.completedUnits} ready</span>
                  <span> · {commercial.upcomingUnits} upcoming</span>
                </div>
              </div>
              <div className="w-full h-1.5 bg-[#F1F5F9] rounded-full mt-3 overflow-hidden flex">
                <div
                  className="h-full bg-[#18845B]"
                  style={{ width: `${(commercial.completedUnits / Math.max(1, commercial.totalUnits)) * 100}%` }}
                  title="Completed Units"
                />
                <div
                  className="h-full bg-[#006B5B]"
                  style={{ width: `${(commercial.underConstructionUnits / Math.max(1, commercial.totalUnits)) * 100}%` }}
                  title="Under Construction Units"
                />
              </div>
            </div>

            {/* KPI 4: Unrealized Unsold Value */}
            <div className="bg-white border border-[#E6E9ED] rounded-xl p-4 shadow-2xs flex flex-col justify-between min-h-[145px]">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280] block truncate">
                  Remaining Inventory Pipeline
                </span>
                <div className="mt-2 flex items-baseline gap-1.5 flex-wrap">
                  <span className="text-2xl sm:text-3xl font-black text-[#B7791F] tracking-tight tabular-nums">
                    ₹{commercial.unrealizedValueCr.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs font-bold text-[#6B7280]">Cr</span>
                </div>
                <div className="text-xs text-[#6B7280] mt-1.5 font-medium leading-normal truncate">
                  {commercial.leftUnits} units across {commercial.projectBreakdown.length} developments
                </div>
              </div>
              <div className="text-[11px] text-[#6B7280] mt-3 pt-2 border-t border-[#F1F5F9] flex items-center justify-between font-medium">
                <span>Avg Ticket: ₹{(commercial.totalInventoryCr / Math.max(1, commercial.totalUnits)).toFixed(2)} Cr</span>
                <span className="text-[#006B5B] font-bold">Target Met</span>
              </div>
            </div>
          </div>

      {/* ============================================================
          PROJECT-BY-PROJECT SALES ABSORPTION & REVENUE MATRIX
          ============================================================ */}
      <div className="bg-white border border-[#E6E9ED] rounded-xl shadow-2xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#F1F5F9] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-[#17191D]">
              Project Unit Absorption & Delivery Correlation Matrix
            </h2>
            <p className="text-xs text-[#6B7280] mt-0.5">
              Compares commercial sales absorption percentage against physical superstructure construction pace.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#6B7280]">
              Showing <strong className="text-[#17191D]">{commercial.projectBreakdown.length}</strong> Projects
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left min-w-[840px]">
            <thead>
              <tr className="text-[#6B7280] font-semibold border-b border-[#F1F5F9] bg-[#FAFBFB]">
                <th className="py-2.5 px-5">Project Name</th>
                <th className="py-2.5 px-3">City</th>
                <th className="py-2.5 px-3">Sales Absorption</th>
                <th className="py-2.5 px-3">Units Pacing</th>
                <th className="py-2.5 px-3">Construction Completion</th>
                <th className="py-2.5 px-3 text-right">Booked Revenue</th>
                <th className="py-2.5 px-3 text-right">Inventory Value</th>
                <th className="py-2.5 px-5">Commercial Health</th>
                <th className="py-2.5 px-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {commercial.projectBreakdown.map(p => {
                const proj = PROJECTS.find(item => item.id === p.projectId);
                const constrPct = proj?.progressPercentage || 50;
                const salesAhead = p.soldPercent >= constrPct;

                return (
                  <tr
                    key={p.projectId}
                    onClick={() => selectProject(p.projectId)}
                    className="hover:bg-[#FAFBFB] cursor-pointer transition-colors group"
                  >
                    <td className="py-3 px-5 font-bold text-[#17191D] group-hover:text-[#006B5B] transition-colors">
                      {p.projectName}
                    </td>

                    <td className="py-3 px-3 text-[#6B7280] font-medium">
                      {p.city}
                    </td>

                    <td className="py-3 px-3">
                      <span className={clsx(
                        'font-bold tabular-nums',
                        p.soldPercent >= 75 ? 'text-[#006B5B]' : p.soldPercent >= 50 ? 'text-[#0D9488]' : 'text-[#B7791F]'
                      )}>
                        {p.soldPercent}%
                      </span>
                    </td>

                    <td className="py-3 px-3 text-[#6B7280] font-medium tabular-nums">
                      <strong className="text-[#17191D]">{p.soldUnits}</strong> / {p.totalUnits} ({p.leftUnits} left)
                    </td>

                    <td className="py-3 px-3">
                      <span className="font-bold tabular-nums text-slate-800">
                        {constrPct}%
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right font-bold text-[#17191D] tabular-nums">
                      ₹{p.bookedValueCr} Cr
                    </td>

                    <td className="py-3 px-3 text-right text-[#6B7280] font-medium tabular-nums">
                      ₹{p.inventoryValueCr} Cr
                    </td>

                    <td className="py-3 px-5">
                      <span className="flex items-center gap-1.5 font-bold text-xs">
                        <span
                          className={clsx(
                            'w-2 h-2 rounded-full',
                            salesAhead ? 'bg-[#18845B]' : 'bg-[#B7791F]'
                          )}
                        />
                        <span className={salesAhead ? 'text-[#18845B]' : 'text-[#B7791F]'}>
                          {salesAhead ? 'Demand Ahead' : 'Inventory Lagging'}
                        </span>
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right text-slate-300 group-hover:text-[#17191D] transition-colors">
                      <ChevronRight size={14} />
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
          VIEW 2: D4U ENQUIRY & DOCUMENT VERIFICATION WORKFLOW
          Directly implementing Godrej Slides 9, 10 & 12
          ============================================================ */}
      {activeSubTab === 'd4u-workflow' && (
        <div className="space-y-4">
          {/* 7-Stage End-to-End Business Flow Strip (Godrej Slide 10) */}
          <div className="bg-white border border-[#E6E9ED] rounded-xl p-4 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                D4U End-to-End Sales & Document Processing Lifecycle
              </span>
              <span className="text-[11px] text-[#006B5B] font-semibold flex items-center gap-1">
                <CheckCircle2 size={12} /> Auto-synced with D4U Core Engine
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1.5 text-center text-xs">
              {[
                { stage: 'Enquiry Created', count: 184, bg: 'bg-slate-100 text-slate-700' },
                { stage: 'Enquiry Review', count: 42, bg: 'bg-blue-50 text-blue-700 border border-blue-200' },
                { stage: 'Approval', count: 38, bg: 'bg-blue-50 text-blue-700 border border-blue-200' },
                { stage: 'Document Upload', count: 29, bg: 'bg-amber-50 text-amber-800 border border-amber-200' },
                { stage: 'Document Verification', count: 24, bg: 'bg-amber-100 text-amber-900 border border-amber-300 font-bold ring-2 ring-amber-400/40' },
                { stage: 'Further Processing', count: 18, bg: 'bg-teal-50 text-teal-800 border border-teal-200' },
                { stage: 'Flat / Sales Tracking', count: 12, bg: 'bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold' },
              ].map((step, idx) => (
                <div key={step.stage} className={clsx('p-2 rounded-lg', step.bg)}>
                  <span className="text-[9px] font-bold uppercase block opacity-75">Step {idx + 1}</span>
                  <span className="font-bold block mt-0.5 leading-tight">{step.stage}</span>
                  <span className="text-[10px] font-mono tabular-nums block mt-1">{step.count} active</span>
                </div>
              ))}
            </div>
          </div>

          {/* Search & Filter Strip */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-[#E6E9ED] p-3 rounded-xl shadow-2xs">
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
              {[
                'All Stages',
                'Enquiry Review',
                'Document Upload',
                'Document Verification',
                'Further Processing',
                'Flat / Sales Tracking'
              ].map(stg => (
                <button
                  key={stg}
                  onClick={() => setEnquiryFilterStage(stg)}
                  className={clsx(
                    'px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all',
                    enquiryFilterStage === stg
                      ? 'bg-[#17191D] text-white shadow-xs'
                      : 'text-[#6B7280] hover:text-[#17191D] hover:bg-slate-100'
                  )}
                >
                  {stg}
                </button>
              ))}
            </div>

            <div className="relative min-w-[220px]">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search customer, unit, lead..."
                value={enquirySearch}
                onChange={e => setEnquirySearch(e.target.value)}
                className="w-full h-8 pl-8 pr-3 text-xs bg-slate-50 border border-[#E6E9ED] rounded-lg text-[#17191D] placeholder-slate-400 outline-none focus:bg-white focus:border-[#006B5B]"
              />
            </div>
          </div>

          {/* Enquiries Register Table */}
          <div className="bg-white border border-[#E6E9ED] rounded-xl shadow-2xs overflow-hidden">
            <div className="px-5 py-3 border-b border-[#F1F5F9] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#17191D]">
                  Customer Enquiries & KYC Document Verification Queue
                </h3>
                <p className="text-xs text-[#6B7280] mt-0.5">
                  Masks confidential customer PAN & Aadhaar details (Godrej KYC Security Standard). Single-click verification.
                </p>
              </div>
              <span className="text-xs text-[#6B7280] font-semibold">
                Showing {filteredEnquiries.length} Enquiries
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E6E9ED] bg-slate-50/60 text-[#6B7280] font-bold">
                    <th className="py-3 px-4">Enquiry ID & Customer</th>
                    <th className="py-3 px-3">Project & Tower</th>
                    <th className="py-3 px-3">Unit & Type</th>
                    <th className="py-3 px-3">Budget</th>
                    <th className="py-3 px-3">Payment Plan</th>
                    <th className="py-3 px-3">Lifecycle Stage</th>
                    <th className="py-3 px-3">KYC & Documents</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9]">
                  {filteredEnquiries.map(enq => {
                    const proj = PROJECTS.find(p => p.id === enq.projectId);
                    const verifiedDocsCount = enq.documents.filter(d => d.status === 'Verified').length;
                    const totalDocs = enq.documents.length;

                    return (
                      <tr
                        key={enq.id}
                        onClick={() => setSelectedEnquiry(enq)}
                        className="hover:bg-[#FAFBFB] cursor-pointer transition-colors group"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">
                              {enq.id}
                            </span>
                            <span className="font-bold text-[#17191D] group-hover:text-[#006B5B] transition-colors">
                              {enq.customerName}
                            </span>
                          </div>
                          <span className="text-[10px] text-[#6B7280] block mt-0.5">
                            Lead: {enq.assignedSalesLead} · {enq.phone}
                          </span>
                        </td>

                        <td className="py-3 px-3 font-semibold text-[#17191D]">
                          {proj?.name}
                          <span className="text-[10px] text-[#6B7280] block">{enq.tower}</span>
                        </td>

                        <td className="py-3 px-3">
                          <strong className="text-[#17191D] block">{enq.unitNumber}</strong>
                          <span className="text-[10px] text-[#6B7280]">{enq.unitType}</span>
                        </td>

                        <td className="py-3 px-3 font-bold tabular-nums text-[#17191D]">
                          ₹{enq.budgetCr} Cr
                        </td>

                        <td className="py-3 px-3 text-[#6B7280] font-medium max-w-[140px] truncate">
                          {enq.paymentPlan}
                        </td>

                        <td className="py-3 px-3">
                          <span className={clsx(
                            'px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1',
                            enq.stage === 'Flat / Sales Tracking' ? 'bg-emerald-100 text-[#18845B]' :
                            enq.stage === 'Further Processing' ? 'bg-teal-100 text-teal-800' :
                            enq.stage === 'Document Verification' ? 'bg-amber-100 text-amber-900' :
                            'bg-slate-100 text-slate-700'
                          )}>
                            {enq.stage}
                          </span>
                        </td>

                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-xs text-[#006B5B]">
                              {verifiedDocsCount}/{totalDocs}
                            </span>
                            <span className="text-[10px] text-[#6B7280]">Verified</span>
                          </div>
                          <div className="flex gap-0.5 mt-1">
                            {enq.documents.map(d => (
                              <span
                                key={d.id}
                                title={`${d.name}: ${d.status}`}
                                className={clsx(
                                  'w-2 h-2 rounded-full',
                                  d.status === 'Verified' ? 'bg-[#18845B]' :
                                  d.status === 'Uploaded' ? 'bg-[#B7791F]' : 'bg-slate-200'
                                )}
                              />
                            ))}
                          </div>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <span className="text-[#006B5B] font-bold hover:underline flex items-center justify-end gap-1">
                            <span>Verify KYC</span>
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
          VIEW 3: D4U CONFIGURATION & SCHEME SETUP
          Directly implementing Godrej Slide 9 & 10 prerequisite flow
          ============================================================ */}
      {activeSubTab === 'd4u-config' && (
        <div className="space-y-4">
          {/* Configuration Prerequisite Flow Strip */}
          <div className="bg-white border border-[#E6E9ED] rounded-xl p-4 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280] block mb-2">
              D4U Configuration Prerequisite Flow (Must complete before enquiry activation)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-center text-xs">
              {[
                { name: '1. User Creation', detail: 'RBAC Roles Assigned', done: true },
                { name: '2. Access Config', detail: 'Project Permissions', done: true },
                { name: '3. Project Config', detail: 'Towers & Floor Master', done: true },
                { name: '4. Payment / BSP', detail: 'Base Selling Rates', done: true },
                { name: '5. EOI Config', detail: 'Token & Conditions', done: true },
                { name: '6. Scheme Setup', detail: 'Active Launch Schemes', done: true },
              ].map(step => (
                <div key={step.name} className="p-2.5 rounded-lg bg-teal-50/70 border border-teal-200">
                  <CheckCircle2 size={13} className="text-[#006B5B] mx-auto mb-1" />
                  <span className="font-bold text-[#17191D] block">{step.name}</span>
                  <span className="text-[10px] text-[#6B7280]">{step.detail}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Project BSP & Commercial Scheme Configuration Register */}
          <div className="bg-white border border-[#E6E9ED] rounded-xl shadow-2xs overflow-hidden">
            <div className="px-5 py-3 border-b border-[#F1F5F9] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#17191D]">
                  Project Commercial Terms & Base Sale Price (BSP) Register
                </h3>
                <p className="text-xs text-[#6B7280] mt-0.5">
                  Pre-configured payment milestones, Expression of Interest (EOI) terms, and floor-rise charges.
                </p>
              </div>
              <span className="text-xs text-[#006B5B] font-bold bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
                All 7 Projects Active
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E6E9ED] bg-slate-50/60 text-[#6B7280] font-bold">
                    <th className="py-3 px-4">Project Name</th>
                    <th className="py-3 px-3">City / Locality</th>
                    <th className="py-3 px-3">Base Sale Price (BSP)</th>
                    <th className="py-3 px-3">Floor Rise Premium</th>
                    <th className="py-3 px-3">Active Payment Schemes</th>
                    <th className="py-3 px-3">EOI Launch Status</th>
                    <th className="py-3 px-4 text-right">Cost Sheet Terms</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9]">
                  {[
                    { name: 'Meridian Heights', city: 'Mumbai', bsp: '₹18,400 / sq.ft', fr: '₹120 / floor', schemes: 'CLP, 10:90, Flexi 20:80', eoi: 'Active (Batch 4)', costSheet: 'Standard RERA Approved' },
                    { name: 'Riverstone Residences', city: 'Pune', bsp: '₹22,500 / sq.ft', fr: '₹150 / floor', schemes: 'CLP, 10:90, Subvention', eoi: 'Active (Batch 2)', costSheet: 'Standard RERA Approved' },
                    { name: 'Northgate Heights', city: 'Bengaluru', bsp: '₹14,200 / sq.ft', fr: '₹95 / floor', schemes: 'CLP, 20:80', eoi: 'Active (Batch 1)', costSheet: 'Standard RERA Approved' },
                    { name: 'Harbour Point', city: 'Navi Mumbai', bsp: '₹29,000 / sq.ft', fr: '₹200 / floor', schemes: 'CLP, NRI Flexi Pay', eoi: 'Exclusive Launch', costSheet: 'Luxury RERA Approved' },
                    { name: 'Cedar Park Estate', city: 'Hyderabad', bsp: '₹16,800 / sq.ft', fr: '₹110 / floor', schemes: 'CLP, 10:90', eoi: 'Active (Batch 3)', costSheet: 'Standard RERA Approved' },
                    { name: 'Summit Greens', city: 'Gurugram', bsp: '₹24,000 / sq.ft', fr: '₹175 / floor', schemes: 'CLP, 30:70', eoi: 'Active (Batch 2)', costSheet: 'Standard RERA Approved' },
                  ].map(p => (
                    <tr key={p.name} className="hover:bg-[#FAFBFB]">
                      <td className="py-3 px-4 font-bold text-[#17191D]">{p.name}</td>
                      <td className="py-3 px-3 text-[#6B7280] font-medium">{p.city}</td>
                      <td className="py-3 px-3 font-mono font-bold text-[#006B5B]">{p.bsp}</td>
                      <td className="py-3 px-3 font-mono text-slate-700">{p.fr}</td>
                      <td className="py-3 px-3 text-[#17191D] font-medium">{p.schemes}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {p.eoi}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-slate-600 font-medium">
                        {p.costSheet}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          DRAWER: D4U CUSTOMER KYC & DOCUMENT VERIFICATION
          Directly implementing Godrej Slide 10 & 12 KYC details & masking
          ============================================================ */}
      {selectedEnquiry && (
        <div
          onClick={() => setSelectedEnquiry(null)}
          className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="w-full max-w-xl bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-200 overflow-hidden"
          >
            {/* Drawer Header */}
            <div className="p-6 border-b border-slate-200 bg-slate-50/60 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="font-mono text-xs font-bold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded shadow-2xs">
                    {selectedEnquiry.id}
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#006B5B] text-white">
                    {selectedEnquiry.stage}
                  </span>
                  {selectedEnquiry.eoiNumber && (
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                      {selectedEnquiry.eoiNumber}
                    </span>
                  )}
                </div>
                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {selectedEnquiry.customerName}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Unit: <strong className="text-slate-800">{selectedEnquiry.unitNumber}</strong> ({selectedEnquiry.unitType}) · {PROJECTS.find(p => p.id === selectedEnquiry.projectId)?.name}
                </p>
              </div>

              <button
                onClick={() => setSelectedEnquiry(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
              {/* KYC Security Banner */}
              <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-xl flex items-start gap-2.5">
                <Shield size={16} className="text-[#18845B] flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#18845B] block">Godrej D4C KYC Security Standard Active</strong>
                  <p className="text-slate-600 mt-0.5">
                    Confidential identity data is automatically masked on executive screens. Automated verification via UIDAI and NSDL income tax databases.
                  </p>
                </div>
              </div>

              {/* Commercial Terms Summary */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                  Commercial Scheme & Booking Terms
                </span>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 text-[11px] block">Agreement Value</span>
                    <strong className="text-sm font-bold text-slate-900 tabular-nums">₹{selectedEnquiry.budgetCr} Cr</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px] block">Base Selling Price (BSP)</span>
                    <strong className="text-sm font-bold text-[#006B5B] tabular-nums">₹{selectedEnquiry.bspRateSqFt.toLocaleString('en-IN')}/sq.ft</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px] block">Selected Payment Plan</span>
                    <span className="font-semibold text-slate-800">{selectedEnquiry.paymentPlan}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px] block">Token Amount Received</span>
                    <span className="font-bold text-emerald-700 tabular-nums">₹{(selectedEnquiry.tokenPaid / 100000).toFixed(1)} Lakhs</span>
                  </div>
                </div>
              </div>

              {/* Document Checklist & Verification Actions */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Customer Documents ({selectedEnquiry.documents.length})
                  </span>
                  <span className="text-[11px] text-[#6B7280]">
                    Click to inspect or certify
                  </span>
                </div>

                <div className="space-y-2">
                  {selectedEnquiry.documents.map(doc => (
                    <div
                      key={doc.id}
                      className="p-3 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className={clsx(
                          'w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs',
                          doc.status === 'Verified' ? 'bg-emerald-100 text-[#18845B]' :
                          doc.status === 'Uploaded' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-500'
                        )}>
                          <FileText size={16} />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900">{doc.name}</span>
                            {doc.maskedNumber && (
                              <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                                {doc.maskedNumber}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-[#6B7280] block">
                            {doc.status === 'Verified' && doc.verifiedBy
                              ? `Verified by ${doc.verifiedBy}`
                              : doc.status === 'Uploaded'
                              ? `Uploaded on ${doc.uploadedDate || 'today'}`
                              : 'Pending upload by customer'}
                          </span>
                        </div>
                      </div>

                      <div>
                        {doc.status === 'Verified' ? (
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-[11px] flex items-center gap-1">
                            <Check size={12} /> Verified
                          </span>
                        ) : doc.status === 'Uploaded' ? (
                          <button
                            onClick={() => handleVerifyDocument(selectedEnquiry.id, doc.id)}
                            className="px-2.5 py-1 rounded-lg bg-[#006B5B] hover:bg-[#0D9488] text-white font-bold text-[11px] shadow-2xs transition-colors"
                          >
                            Verify & Approve
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">
                            Awaiting
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
