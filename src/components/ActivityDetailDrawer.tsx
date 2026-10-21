// ============================================================
// ACTIVITY DETAIL DRAWER — WIP Activity Deep Dive
// Lets executives inspect delayed work packages & dependencies
// ============================================================

import React, { useState } from 'react';
import { X, Clock, AlertTriangle, CheckCircle, ArrowRight, ShieldAlert, Building2, User, HardHat, Calendar } from 'lucide-react';
import { useApp } from '../store/appStore';
import { PROJECTS, CONTRACTORS } from '../data/seedData';

interface ActivityDetailDrawerProps {
  activityId: string;
  onClose: () => void;
}

export function ActivityDetailDrawer({ activityId, onClose }: ActivityDetailDrawerProps) {
  const { state, updateActivityProgress, selectWIR, selectNC, setTab } = useApp();
  const activity = state.wipActivities.find(a => a.id === activityId);
  const [progressVal, setProgressVal] = useState(activity?.actualProgress ?? 50);
  const [toast, setToast] = useState<string | null>(null);

  if (!activity) return null;

  const project = PROJECTS.find(p => p.id === activity.projectId);
  const contractor = CONTRACTORS.find(c => c.id === activity.contractorId);
  const linkedWIR = activity.linkedWIRId ? state.wirs.find(w => w.id === activity.linkedWIRId) : null;
  const linkedNC = activity.linkedNCId ? state.ncs.find(n => n.id === activity.linkedNCId) : null;

  const handleUpdate = () => {
    updateActivityProgress(activity.id, progressVal);
    setToast('Activity physical progress updated');
    setTimeout(() => setToast(null), 2500);
  };

  const isDelayed = activity.status === 'Delayed' || activity.status === 'Blocked';

  return (
    <div
      onClick={onClose}
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
              <span className="font-mono text-xs font-black text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded shadow-2xs">
                {activity.id}
              </span>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                activity.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                activity.status === 'Blocked' ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                activity.status === 'Delayed' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                'bg-blue-100 text-blue-800'
              }`}>
                {activity.status}
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 leading-snug">
              {activity.workPackage}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {project?.name} · {activity.tower} · {activity.floor} · {project?.city}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Blocking Dependency Alert if any */}
          {activity.blockingReason && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3">
              <AlertTriangle size={18} className="text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                <h5 className="text-xs font-bold text-rose-900 uppercase tracking-wide">
                  Schedule Blocker / Dependency
                </h5>
                <p className="text-xs text-rose-800 mt-1 leading-relaxed">
                  {activity.blockingReason}
                </p>
              </div>
            </div>
          )}

          {/* Progress & Variance Card */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">
                Physical Progress vs Planned
              </span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                activity.varianceDays < 0 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {activity.varianceDays < 0 ? `${Math.abs(activity.varianceDays)} days behind` : 'On schedule'}
              </span>
            </div>

            {/* Bars */}
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-slate-600">Actual Progress</span>
                  <span className="font-bold text-slate-900">{activity.actualProgress}%</span>
                </div>
                <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      activity.status === 'Blocked' ? 'bg-rose-500' :
                      activity.status === 'Delayed' ? 'bg-amber-500' : 'bg-emerald-600'
                    }`}
                    style={{ width: `${activity.actualProgress}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>Planned Target</span>
                  <span>{activity.plannedProgress}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-400 rounded-full" style={{ width: `${activity.plannedProgress}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Schedule Dates Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-white border border-slate-200 rounded-xl">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Baseline Finish Date
              </span>
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <Calendar size={13} className="text-slate-400" />
                <span>{activity.plannedFinish}</span>
              </div>
            </div>
            <div className="p-3 bg-white border border-slate-200 rounded-xl">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Current Forecast Finish
              </span>
              <div className={`flex items-center gap-1.5 text-xs font-bold ${isDelayed ? 'text-rose-600' : 'text-slate-800'}`}>
                <Calendar size={13} className={isDelayed ? 'text-rose-500' : 'text-slate-400'} />
                <span>{activity.forecastFinish}</span>
              </div>
            </div>
          </div>

          {/* Responsibility & Ownership */}
          <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Accountability & Trade
            </h5>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 text-[11px] block">Responsible Contractor</span>
                <p className="font-bold text-slate-900 mt-0.5">{contractor?.name ?? 'ABC Civil Works'}</p>
                <span className="text-[10px] text-slate-500">{contractor?.type}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">Project Manager</span>
                <p className="font-bold text-slate-900 mt-0.5">{activity.projectManager}</p>
                <span className="text-[10px] text-slate-500">{project?.city} Site Office</span>
              </div>
            </div>
          </div>

          {/* Linked Quality Records (Direct Bridge) */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Linked Quality Records
            </h5>

            {linkedWIR && (
              <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between hover:border-blue-400 transition-colors">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                    linkedWIR.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                    linkedWIR.status === 'Rejected' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    WIR
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{linkedWIR.id}: {linkedWIR.activity}</p>
                    <p className="text-[11px] text-slate-500">Status: {linkedWIR.status} · Reviewer: {linkedWIR.reviewer}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    setTab('wir');
                    selectWIR(linkedWIR.id);
                  }}
                  className="px-2.5 py-1 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg flex items-center gap-1 transition-colors"
                >
                  <span>Open</span>
                  <ArrowRight size={12} />
                </button>
              </div>
            )}

            {linkedNC && (
              <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between hover:border-rose-400 transition-colors">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-800 flex items-center justify-center text-xs font-bold">
                    NC
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{linkedNC.id}: {linkedNC.severity} Severity</p>
                    <p className="text-[11px] text-slate-500 truncate max-w-[280px]">{linkedNC.finding}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    setTab('nc');
                    selectNC(linkedNC.id);
                  }}
                  className="px-2.5 py-1 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg flex items-center gap-1 transition-colors"
                >
                  <span>Open</span>
                  <ArrowRight size={12} />
                </button>
              </div>
            )}

            {!linkedWIR && !linkedNC && (
              <p className="text-xs text-slate-400 italic">No quality defects or pending inspections logged for this activity.</p>
            )}
          </div>

          {/* Interactive Demo Progress Slider */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">
                Update Actual Progress (Demo)
              </span>
              <span className="text-xs font-black text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                {progressVal}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={progressVal}
              onChange={e => setProgressVal(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
            <div className="flex justify-between items-center pt-1">
              {toast && <span className="text-xs font-semibold text-emerald-700">{toast}</span>}
              <button
                onClick={handleUpdate}
                className="ml-auto px-3 py-1.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-lg transition-colors shadow-2xs"
              >
                Save Progress
              </button>
            </div>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => {
              updateActivityProgress(activity.id, 100, 'Completed');
              onClose();
            }}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
          >
            Mark Activity Completed
          </button>
        </div>
      </div>
    </div>
  );
}
