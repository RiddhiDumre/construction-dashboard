// ============================================================
// AUDIT DETAIL DRAWER — Audit & Quality Deep Dive
// Lets executives inspect audit observations, score & linked NCs
// ============================================================

import React from 'react';
import { X, Award, AlertTriangle, FileText, CheckCircle, ArrowRight, ShieldCheck, Calendar, User } from 'lucide-react';
import { useApp } from '../store/appStore';
import { AUDIT_RECORDS, PROJECTS } from '../data/seedData';

interface AuditDetailDrawerProps {
  auditId: string;
  onClose: () => void;
}

export function AuditDetailDrawer({ auditId, onClose }: AuditDetailDrawerProps) {
  const { state, setTab, selectNC } = useApp();
  const audit = AUDIT_RECORDS.find(a => a.id === auditId);

  if (!audit) return null;

  const project = PROJECTS.find(p => p.id === audit.projectId);
  const linkedNCs = state.ncs.filter(n => n.projectId === audit.projectId);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-200 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 bg-slate-50/60 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-mono text-xs font-black text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded shadow-2xs">
                {audit.id}
              </span>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                audit.type === 'External' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
              }`}>
                {audit.type} Quality Audit
              </span>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                audit.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {audit.status}
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 leading-snug">
              {audit.scope || `${audit.type} Quality Assessment`}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {project?.name} · {project?.city} · Auditor: {audit.auditor}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Audit Score Card */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Assessment Rating
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900">{audit.percentageScore}/100</span>
                <span className="text-xs text-slate-500 font-semibold">({audit.rating.toFixed(1)} / 5.0 Star)</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Audit Date
              </span>
              <span className="text-xs font-bold text-slate-700">{audit.auditDate}</span>
            </div>
          </div>

          {/* Observations & Summary */}
          <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Auditor Observations & Summary
            </h5>
            <p className="text-xs text-slate-700 leading-relaxed">
              {audit.notes || 'Full visual and destructive testing conducted per IS standards. Concrete, steel rebar spacing, and formwork alignments inspected.'}
            </p>
          </div>

          {/* Findings & Non-Compliances */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Audit Findings & Non-Compliances ({audit.findingsRaised} Raised · {audit.outstandingCAs} Open)
              </h5>
            </div>

            <div className="space-y-2">
              {linkedNCs.slice(0, 4).map(nc => (
                <div
                  key={nc.id}
                  className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between hover:border-slate-300 transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-[10px] font-bold text-slate-500">{nc.id}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                        nc.severity === 'Critical' ? 'bg-rose-100 text-rose-800' :
                        nc.severity === 'High' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {nc.severity}
                      </span>
                      <span className="text-[10px] text-slate-400">{nc.category}</span>
                    </div>
                    <p className="text-xs font-medium text-slate-900 line-clamp-1">{nc.finding}</p>
                  </div>
                  <button
                    onClick={() => {
                      setTab('nc');
                      selectNC(nc.id);
                    }}
                    className="ml-3 px-2 py-1 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg flex items-center gap-1 transition-colors flex-shrink-0"
                  >
                    <span>Inspect</span>
                    <ArrowRight size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Corrective Action Protocol */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
            <h5 className="font-bold text-slate-800">Quality Assurance Verification Protocol</h5>
            <p className="text-slate-600 leading-relaxed">
              All findings identified during this audit require verified corrective actions and closure evidence before subsequent slab/pour clearance.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all shadow-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
