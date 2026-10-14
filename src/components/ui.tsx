// ============================================================
// SHARED UI COMPONENTS — Styled with Fundio Visual Inspiration
// Pure white cards, rounded-2xl geometry, subtle borders, crisp typography
// ============================================================

import React, { useState } from 'react';
import {
  X, ChevronUp, ChevronDown, Minus, ArrowUpRight, ArrowDownRight,
  Camera, MapPin, Clock, User, AlertCircle, FileText, Maximize2
} from 'lucide-react';
import clsx from 'clsx';
import type { SitePhoto } from '../data/seedData';

// ── RAG Status Dot ────────────────────────────────────────────
interface StatusDotProps {
  status: 'green' | 'amber' | 'red';
  size?: 'sm' | 'md';
}
export function StatusDot({ status, size = 'sm' }: StatusDotProps) {
  const colors = { green: 'bg-[#10B981]', amber: 'bg-[#F59E0B]', red: 'bg-[#EF4444]' };
  const sizes = { sm: 'w-2 h-2', md: 'w-2.5 h-2.5' };
  return <span className={clsx('inline-block rounded-full flex-shrink-0', colors[status], sizes[size])} />;
}

// ── Score Badge ───────────────────────────────────────────────
interface ScoreBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}
export function ScoreBadge({ score, size = 'md' }: ScoreBadgeProps) {
  const status = score >= 80 ? 'green' : score >= 60 ? 'amber' : 'red';
  const colors = {
    green: 'text-[#0F766E]',
    amber: 'text-[#D97706]',
    red: 'text-[#DC2626]',
  };
  const sizes = {
    sm: 'text-xs font-bold',
    md: 'text-sm font-bold',
    lg: 'text-2xl font-bold tracking-tight',
  };
  return <span className={clsx(colors[status], sizes[size])}>{score}</span>;
}

// ── Severity Badge ────────────────────────────────────────────
interface SeverityBadgeProps {
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
}
export function SeverityBadge({ severity }: SeverityBadgeProps) {
  const styles: Record<string, string> = {
    Critical: 'bg-rose-50 text-[#DC2626] border border-rose-200/80',
    High: 'bg-orange-50 text-[#EA580C] border border-orange-200/80',
    Medium: 'bg-amber-50 text-[#D97706] border border-amber-200/80',
    Low: 'bg-slate-50 text-[#64748B] border border-slate-200/80',
  };
  return (
    <span className={clsx('inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold', styles[severity])}>
      {severity}
    </span>
  );
}

// ── Status Badge (De-sauced: crisp rounded-md instead of full pill) ──────
interface StatusBadgeProps {
  status: string;
}
export function StatusBadge({ status }: StatusBadgeProps) {
  const styles: Record<string, string> = {
    Healthy: 'bg-emerald-50 text-[#0F766E] border border-emerald-200 font-semibold',
    'At Risk': 'bg-amber-50 text-[#D97706] border border-amber-200 font-semibold',
    Critical: 'bg-rose-50 text-[#DC2626] border border-rose-200 font-semibold',
    Approved: 'bg-emerald-50 text-[#0F766E] border border-emerald-200',
    Closed: 'bg-emerald-50 text-[#0F766E] border border-emerald-200',
    Submitted: 'bg-blue-50 text-[#2563EB] border border-blue-200',
    'Awaiting Review': 'bg-blue-50 text-[#2563EB] border border-blue-200',
    Resubmitted: 'bg-blue-50 text-[#2563EB] border border-blue-200',
    Rejected: 'bg-rose-50 text-[#DC2626] border border-rose-200',
    'Rejected Verification': 'bg-rose-50 text-[#DC2626] border border-rose-200',
    Draft: 'bg-slate-50 text-[#64748B] border border-slate-200',
    'Rectification In Progress': 'bg-amber-50 text-[#D97706] border border-amber-200',
    Rectification: 'bg-amber-50 text-[#D97706] border border-amber-200',
    Assigned: 'bg-purple-50 text-[#7C3AED] border border-purple-200',
    Open: 'bg-rose-50 text-[#DC2626] border border-rose-200',
    'Evidence Submitted': 'bg-teal-50 text-[#0D9488] border border-teal-200',
    Verification: 'bg-indigo-50 text-[#4F46E5] border border-indigo-200',
  };
  return (
    <span className={clsx('inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold whitespace-nowrap', styles[status] ?? 'bg-slate-50 text-slate-700 border border-slate-200')}>
      {status}
    </span>
  );
}

// ── Pill Delta Badge (De-sauced: crisp rounded-md badge) ──
interface PillDeltaProps {
  value: number | string;
  isPositive?: boolean;
  neutral?: boolean;
}
export function PillDelta({ value, isPositive = true, neutral = false }: PillDeltaProps) {
  if (neutral) {
    return (
      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-slate-50 text-[#64748B] border border-slate-200">
        {value}
      </span>
    );
  }
  return (
    <span className={clsx(
      'inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold border',
      isPositive
        ? 'bg-emerald-50 text-[#0F766E] border-emerald-200/80'
        : 'bg-rose-50 text-[#DC2626] border-rose-200/80'
    )}>
      <span>{value}</span>
      {isPositive ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
    </span>
  );
}

// ── Delta Indicator ───────────────────────────────────────────
interface DeltaProps {
  value: number | null;
  unit?: string;
  inverse?: boolean; // if true, positive = bad (e.g. open NCs)
}
export function Delta({ value, unit = '', inverse = false }: DeltaProps) {
  if (value === null) return <span className="text-xs text-[#94A3B8]">—</span>;
  const isPositive = value > 0;
  const isGood = inverse ? !isPositive : isPositive;
  const absVal = Math.abs(value);

  if (value === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-[#94A3B8]">
        <Minus size={11} /> No change
      </span>
    );
  }

  return (
    <span className={clsx('inline-flex items-center gap-0.5 text-xs font-semibold',
      isGood ? 'text-[#0F766E]' : 'text-[#DC2626]'
    )}>
      {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
      {absVal}{unit} vs last period
    </span>
  );
}

// ── KPI Card (Individual metric block) ─────────────────────────
interface KPICardProps {
  label: string;
  value: string | number;
  sub?: React.ReactNode;
  alert?: string;
  icon?: React.ReactNode;
}
export function KPICard({ label, value, sub, alert, icon }: KPICardProps) {
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 flex flex-col justify-between shadow-xs hover:border-[#CBD5E1] transition-all">
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">{label}</span>
        {icon && <div className="text-[#94A3B8]">{icon}</div>}
      </div>
      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-3xl font-bold text-[#0F172A] tracking-tight">{value}</span>
        {alert && (
          <span className="text-xs font-semibold text-[#DC2626] bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded">
            {alert}
          </span>
        )}
      </div>
      {sub && <div className="text-xs text-[#64748B]">{sub}</div>}
    </div>
  );
}

// ── Drawer ────────────────────────────────────────────────────
interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  width?: string;
}
export function Drawer({ open, onClose, title, subtitle, children, width = '580px' }: DrawerProps) {
  if (!open) return null;
  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="drawer-panel" style={{ width }}>
        <div className="flex items-start justify-between px-7 py-5 border-b border-[#E2E8F0] flex-shrink-0 bg-white">
          <div>
            <h2 className="text-base font-bold text-[#0F172A] tracking-tight">{title}</h2>
            {subtitle && <p className="text-xs text-[#64748B] mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-[#64748B] hover:text-[#0F172A] transition-colors"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-7 py-6 space-y-6 bg-white">
          {children}
        </div>
      </div>
    </>
  );
}

// ── Section in Drawer ─────────────────────────────────────────
interface DrawerSectionProps {
  title: string;
  children: React.ReactNode;
}
export function DrawerSection({ title, children }: DrawerSectionProps) {
  return (
    <div>
      <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-3">{title}</h3>
      {children}
    </div>
  );
}

// ── Field Row ─────────────────────────────────────────────────
interface FieldRowProps {
  label: string;
  value: React.ReactNode;
}
export function FieldRow({ label, value }: FieldRowProps) {
  return (
    <div className="flex gap-4 py-2.5 px-3 border-b border-[#F1F5F9] last:border-0 hover:bg-slate-50/50">
      <span className="text-xs text-[#64748B] w-36 flex-shrink-0">{label}</span>
      <span className="text-xs font-medium text-[#0F172A] flex-1">{value}</span>
    </div>
  );
}

// ── Activity Timeline ─────────────────────────────────────────
interface TimelineEntry {
  date: string;
  action: string;
  actor: string;
  note?: string;
}
export function ActivityTimeline({ entries }: { entries: TimelineEntry[] }) {
  return (
    <div className="relative pl-1">
      {[...entries].reverse().map((entry, idx) => (
        <div key={idx} className="flex gap-3 pb-4 last:pb-0">
          <div className="flex flex-col items-center">
            <div className="w-2 h-2 rounded-full bg-[#0F172A] mt-1.5 flex-shrink-0" />
            {idx < entries.length - 1 && <div className="w-px flex-1 bg-[#E2E8F0] mt-1" />}
          </div>
          <div className="flex-1 pb-1">
            <div className="flex items-baseline gap-2">
              <span className="text-xs font-bold text-[#0F172A]">{entry.action}</span>
              <span className="text-[11px] text-[#94A3B8]">{entry.date}</span>
            </div>
            <p className="text-xs text-[#64748B] mt-0.5">{entry.actor}{entry.note ? ` — ${entry.note}` : ''}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Filter Select (Fundio Style) ──────────────────────────────
interface FilterSelectProps {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}
export function FilterSelect({ label, value, options, onChange }: FilterSelectProps) {
  return (
    <div className="flex items-center gap-1.5">
      <label className="text-xs font-medium text-[#64748B] whitespace-nowrap">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="text-xs font-medium border border-[#E2E8F0] rounded-xl bg-white px-3 py-1.5 text-[#0F172A] focus:outline-none focus:border-[#0F172A] shadow-xs cursor-pointer"
      >
        <option value="">All</option>
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

// ── Search Input ──────────────────────────────────────────────
interface SearchInputProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}
export function SearchInput({ value, onChange, placeholder = 'Search…' }: SearchInputProps) {
  return (
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="text-xs border border-[#E2E8F0] rounded-xl bg-white px-3 py-1.5 text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#0F172A] shadow-xs w-48"
    />
  );
}

// ── Sortable Table Header ─────────────────────────────────────
interface SortableThProps {
  label: string;
  sortKey: string;
  currentSort: { key: string; dir: 'asc' | 'desc' };
  onSort: (key: string) => void;
  className?: string;
}
export function SortableTh({ label, sortKey, currentSort, onSort, className }: SortableThProps) {
  const active = currentSort.key === sortKey;
  return (
    <th
      onClick={() => onSort(sortKey)}
      className={clsx(
        'text-left text-[11px] font-semibold text-[#64748B] uppercase tracking-wider cursor-pointer select-none whitespace-nowrap',
        'hover:text-[#0F172A] transition-colors px-4 py-3',
        className
      )}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {active ? (
          currentSort.dir === 'asc' ? <ChevronUp size={12} className="text-[#0F172A]" /> : <ChevronDown size={12} className="text-[#0F172A]" />
        ) : (
          <span className="text-[#CBD5E1]"><ChevronUp size={12} /></span>
        )}
      </span>
    </th>
  );
}

// ── Empty State ───────────────────────────────────────────────
export function EmptyState({ message }: { message: string }) {
  return (
    <div className="py-14 text-center text-xs font-medium text-[#64748B]">{message}</div>
  );
}

// ── Score Bar (Decomposition) ─────────────────────────────────
interface ScoreBarProps {
  label: string;
  score: number;
  weight: number;
  contribution: number;
}
export function ScoreBar({ label, score, weight, contribution }: ScoreBarProps) {
  const color = score >= 80 ? '#10B981' : score >= 60 ? '#F59E0B' : '#EF4444';
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-[#1E293B]">{label}</span>
        <div className="flex items-center gap-2.5">
          <span className="text-[11px] text-[#94A3B8]">
            ×{weight}% = <strong className="font-semibold text-[#0F172A]">{contribution.toFixed(1)}pts</strong>
          </span>
          <span className="text-xs font-bold" style={{ color }}>
            {score}<span className="text-[10px] font-normal text-[#94A3B8]">/100</span>
          </span>
        </div>
      </div>
      <div className="h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-300" style={{ width: `${score}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

// ── Page Header ───────────────────────────────────────────────
interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}
export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">{title}</h1>
        {subtitle && <p className="text-xs text-[#64748B] mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

// ── Overdue Badge ─────────────────────────────────────────────
export function OverdueBadge() {
  return (
    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-[#DC2626] border border-rose-200">
      Overdue
    </span>
  );
}

// ── On-Site Mobile Photo Card ─────────────────────────────────
interface SitePhotoCardProps {
  photo: SitePhoto;
  title?: string;
}
export function SitePhotoCard({ photo, title = 'On-Site Mobile Defect Photo' }: SitePhotoCardProps) {
  const [zoomed, setZoomed] = useState(false);

  return (
    <div className="border border-[#CBD5E1] rounded-xl overflow-hidden bg-white shadow-xs">
      {/* Header bar indicating mobile field capture */}
      <div className="bg-[#1E293B] text-white px-3 py-2 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Camera size={13} className="text-teal-400" />
          <span className="font-semibold text-slate-100">{title}</span>
        </div>
        <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-white/10 text-slate-300">
          Mobile QA App
        </span>
      </div>

      {/* Photo with defect tag overlay */}
      <div
        className="relative group cursor-pointer overflow-hidden bg-slate-950 aspect-[16/10]"
        onClick={() => setZoomed(true)}
      >
        <img
          src={photo.url}
          alt={photo.caption}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 opacity-95"
        />

        {/* Defect Highlight Bounding / Tag Banner */}
        <div className="absolute top-2.5 left-2.5 bg-black/75 backdrop-blur-sm border border-red-500/80 text-white text-[11px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1.5 shadow-md">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span>{photo.defectTag}</span>
        </div>

        {/* Zoom cue on hover */}
        <div className="absolute bottom-2.5 right-2.5 bg-black/60 backdrop-blur-sm text-white p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-[11px]">
          <Maximize2 size={12} />
          <span>Expand</span>
        </div>
      </div>

      {/* Geotag, Timestamp & Inspector Signature Strip */}
      <div className="p-3 bg-slate-50 border-t border-[#E2E8F0] space-y-2 text-xs">
        <p className="font-medium text-[#0F172A] text-xs leading-snug">
          {photo.caption}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1 text-[11px] text-[#64748B] border-t border-slate-200/60">
          <div className="flex items-center gap-1.5">
            <MapPin size={11} className="text-[#94A3B8] flex-shrink-0" />
            <span className="truncate">{photo.locationGPS}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock size={11} className="text-[#94A3B8] flex-shrink-0" />
            <span>{photo.timestamp}</span>
          </div>
          <div className="flex items-center gap-1.5 col-span-full">
            <User size={11} className="text-[#94A3B8] flex-shrink-0" />
            <span>Field Inspector: <strong className="text-[#1E293B] font-semibold">{photo.author}</strong></span>
          </div>
        </div>
      </div>

      {/* Fullscreen Zoom Modal */}
      {zoomed && (
        <div
          className="fixed inset-0 z-[120] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 sm:p-10 animate-in fade-in"
          onClick={() => setZoomed(false)}
        >
          <div
            className="max-w-4xl w-full bg-[#0F172A] rounded-2xl overflow-hidden shadow-2xl border border-slate-700"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 text-white">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span className="text-xs font-bold">{photo.defectTag}</span>
              </div>
              <button
                onClick={() => setZoomed(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>
            <img src={photo.url} alt={photo.caption} className="w-full max-h-[70vh] object-contain bg-black" />
            <div className="p-4 text-xs text-slate-300 bg-slate-900 border-t border-slate-800 space-y-1">
              <p className="text-white font-medium">{photo.caption}</p>
              <p className="text-slate-400 text-[11px]">{photo.locationGPS} · {photo.timestamp} · Verified by {photo.author}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
