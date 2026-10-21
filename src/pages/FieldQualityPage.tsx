// ============================================================
// PAGE: FIELD QUALITY & INSPECTION REGISTER
// Unified executive module clubbing Non-Compliance (NC) defect holds
// and preventative Work Inspection Requests (WIR).
// ============================================================

import React, { useMemo } from 'react';
import { ShieldAlert, ClipboardCheck, CheckCircle2, AlertTriangle, SlidersHorizontal, ArrowRight } from 'lucide-react';
import clsx from 'clsx';
import { useApp } from '../store/appStore';
import { NCPage } from './NCPage';
import { WIRPage } from './WIRPage';

export function FieldQualityPage() {
  const { state, setTab } = useApp();

  // Active view: default to 'nc' unless activeTab is explicitly 'wir'
  const activeSubTab = state.activeTab === 'wir' ? 'wir' : 'nc';

  // Live KPI counts
  const openCritCount = useMemo(
    () => state.ncs.filter(n => n.severity === 'Critical' && n.status !== 'Closed').length,
    [state.ncs]
  );

  const totalOpenNCs = useMemo(
    () => state.ncs.filter(n => n.status !== 'Closed').length,
    [state.ncs]
  );

  const slaBreachCount = useMemo(
    () => state.wirs.filter(w => w.slaBreach && w.status !== 'Approved').length,
    [state.wirs]
  );

  const pendingWIRCount = useMemo(
    () => state.wirs.filter(w => w.status === 'Submitted' || w.status === 'Awaiting Review').length,
    [state.wirs]
  );

  return (
    <div className="space-y-4 pb-12">
      {/* ============================================================
          TOP LEVEL UNIFIED MODULE HEADER & SEGMENTED SWITCHER
          ============================================================ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5E7EB]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#17191D]">
              Field Inspections & Defects
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#E6F4F1] text-[#00594F] border border-[#B3E0D8]">
              Quality Assurance & Field Control
            </span>
          </div>
          <p className="text-xs text-[#737B88] mt-0.5">
            Preventative site inspection submittals (WIR) and authoritative non-compliance defect tracking (NC).
          </p>
        </div>

        {/* Apple Segmented Switcher */}
        <div className="flex items-center bg-[#F1F5F9] p-1 rounded-xl border border-[#E5E7EB] self-start sm:self-center">
          <button
            onClick={() => setTab('nc')}
            className={clsx(
              'flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all',
              activeSubTab === 'nc'
                ? 'bg-white text-[#17191D] shadow-xs'
                : 'text-[#737B88] hover:text-[#17191D]'
            )}
          >
            <ShieldAlert size={14} className={activeSubTab === 'nc' ? 'text-[#DC2626]' : 'text-slate-400'} />
            <span>Defects & Non-Compliance</span>
            <span className={clsx(
              'px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold',
              activeSubTab === 'nc' ? 'bg-rose-100 text-[#C63F43]' : 'bg-slate-200 text-slate-600'
            )}>
              {openCritCount > 0 ? `${openCritCount} Holds` : totalOpenNCs}
            </span>
          </button>

          <button
            onClick={() => setTab('wir')}
            className={clsx(
              'flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all',
              activeSubTab === 'wir'
                ? 'bg-white text-[#17191D] shadow-xs'
                : 'text-[#737B88] hover:text-[#17191D]'
            )}
          >
            <ClipboardCheck size={14} className={activeSubTab === 'wir' ? 'text-[#00594F]' : 'text-slate-400'} />
            <span>Work Inspection Requests (WIR)</span>
            <span className={clsx(
              'px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold',
              slaBreachCount > 0
                ? 'bg-amber-100 text-[#B7791F]'
                : activeSubTab === 'wir'
                ? 'bg-emerald-100 text-[#16805D]'
                : 'bg-slate-200 text-slate-600'
            )}>
              {slaBreachCount > 0 ? `${slaBreachCount} SLA Breaches` : `${pendingWIRCount} Pending`}
            </span>
          </button>
        </div>
      </div>

      {/* ============================================================
          SUB-VIEW EMBEDDING
          ============================================================ */}
      {activeSubTab === 'nc' ? (
        <NCPage isEmbedded />
      ) : (
        <WIRPage isEmbedded />
      )}
    </div>
  );
}
