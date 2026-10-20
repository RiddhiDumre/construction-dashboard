// ============================================================
// WEIGHTS CONFIG MODAL — Quality Score Calculation Methodology
// Allows leadership to adjust weights & see recalculation live
// ============================================================

import React, { useState } from 'react';
import { X, Sliders, Info, RotateCcw, Check } from 'lucide-react';
import { useApp } from '../store/appStore';
import { DEFAULT_WEIGHTS, NC_PENALTIES } from '../data/seedData';
import { getOverviewPortfolioKPIs } from '../data/calculations';

export function WeightsConfigModal() {
  const { state, setWeightsModalOpen, setWeights } = useApp();
  const [wirRate, setWirRate] = useState(state.weights.wirPassRate);
  const [ncHealth, setNcHealth] = useState(state.weights.ncHealth);
  const [auditScore, setAuditScore] = useState(state.weights.auditScore);

  if (!state.weightsModalOpen) return null;

  const total = wirRate + ncHealth + auditScore;
  const isValid = total === 100;

  const currentKPIs = getOverviewPortfolioKPIs(state.filters.city, state.weights, state.wirs, state.ncs);
  const previewKPIs = getOverviewPortfolioKPIs(
    state.filters.city,
    { wirPassRate: wirRate, ncHealth, auditScore },
    state.wirs,
    state.ncs
  );

  const handleApply = () => {
    if (isValid) {
      setWeights({ wirPassRate: wirRate, ncHealth, auditScore });
      setWeightsModalOpen(false);
    }
  };

  const handleReset = () => {
    setWirRate(DEFAULT_WEIGHTS.wirPassRate);
    setNcHealth(DEFAULT_WEIGHTS.ncHealth);
    setAuditScore(DEFAULT_WEIGHTS.auditScore);
    setWeights(DEFAULT_WEIGHTS);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Sliders size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Quality Score Methodology & Weights</h3>
              <p className="text-xs text-slate-500">Configure weighting distribution (must total 100%)</p>
            </div>
          </div>
          <button
            onClick={() => setWeightsModalOpen(false)}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Sliders & Formula Breakdown */}
        <div className="p-6 space-y-5 bg-white">
          {/* Explanation Box */}
          <div className="p-3 bg-blue-50/70 border border-blue-200/70 rounded-xl flex items-start gap-2.5 text-xs text-blue-900">
            <Info size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>Deterministic Formula:</strong> Quality Score = (WIR Pass Rate × WIR Weight) + (NC Health Score × NC Weight) + (Audit Result × Audit Weight). Missing audit data automatically renormalises over WIR & NC.
            </div>
          </div>

          {/* Component 1: WIR Pass Rate */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800">
                1. First-Time WIR Pass Rate
              </label>
              <span className="text-xs font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                {wirRate}%
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="70"
              step="5"
              value={wirRate}
              onChange={e => setWirRate(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
            <p className="text-[11px] text-slate-500">
              Measures percentage of work inspection requests approved on first review without rework.
            </p>
          </div>

          {/* Component 2: NC Health */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800">
                2. Non-Compliance Health & Closure
              </label>
              <span className="text-xs font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                {ncHealth}%
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="70"
              step="5"
              value={ncHealth}
              onChange={e => setNcHealth(Number(e.target.value))}
              className="w-full accent-amber-600"
            />
            <p className="text-[11px] text-slate-500">
              Deductions: Critical (-{NC_PENALTIES.Critical} pts), High (-{NC_PENALTIES.High} pts), Overdue (-{NC_PENALTIES.overduePerWeek} pts/wk).
            </p>
          </div>

          {/* Component 3: Audit Result */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800">
                3. Latest Audit Result (Internal / External)
              </label>
              <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                {auditScore}%
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="50"
              step="5"
              value={auditScore}
              onChange={e => setAuditScore(Number(e.target.value))}
              className="w-full accent-emerald-600"
            />
            <p className="text-[11px] text-slate-500">
              Latest completed Bureau Veritas / SGS / Quality Dept audit score on 100-pt scale.
            </p>
          </div>

          {/* Live Impact Preview */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 block">Total Allocation:</span>
              <span className={`text-sm font-black ${isValid ? 'text-emerald-700' : 'text-rose-600'}`}>
                {total}% {isValid ? '✓ Valid' : '(Must equal 100%)'}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 block">Portfolio Avg Score Impact:</span>
              <div className="flex items-center gap-1.5 justify-end">
                <span className="text-xs line-through text-slate-400">{currentKPIs.avgQualityScore}</span>
                <span className="text-base font-black text-slate-900">{previewKPIs.avgQualityScore}/100</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-200 bg-slate-50">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <RotateCcw size={13} />
            <span>Restore Defaults (40 / 35 / 25)</span>
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => setWeightsModalOpen(false)}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              Cancel
            </button>
            <button
              disabled={!isValid}
              onClick={handleApply}
              className={`px-4 py-1.5 text-xs font-bold rounded-xl text-white transition-all shadow-xs ${
                isValid ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-300 cursor-not-allowed'
              }`}
            >
              Apply New Weights
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
