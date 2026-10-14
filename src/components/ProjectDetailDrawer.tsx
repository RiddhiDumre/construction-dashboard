// ============================================================
// PROJECT DETAIL DRAWER — Executive Deep Dive
// Answers: Why is the project On Track / At Risk / Critical?
// ============================================================

import React from 'react';
import { Drawer, DrawerSection, FieldRow, ScoreBar, StatusBadge, StatusDot, SeverityBadge, SitePhotoCard } from './ui';
import { useApp } from '../store/appStore';
import { getProjectMetrics } from '../data/calculations';
import { PROJECTS, CONTRACTORS, AUDIT_RECORDS } from '../data/seedData';
import clsx from 'clsx';
import { ArrowRight, AlertTriangle, AlertCircle, CheckCircle, Clock, Camera } from 'lucide-react';

interface ProjectDetailDrawerProps {
  projectId: string;
  onClose: () => void;
}

export function ProjectDetailDrawer({ projectId, onClose }: ProjectDetailDrawerProps) {
  const { state, setTab, setFilter, selectNC, selectWIR } = useApp();
  const project = PROJECTS.find(p => p.id === projectId);
  if (!project) return null;

  const metrics = getProjectMetrics(projectId, state.weights, state.wirs, state.ncs);
  const { breakdown } = metrics;
  const audits = AUDIT_RECORDS.filter(a => a.projectId === projectId && a.status === 'Completed')
    .sort((a, b) => b.auditDate.localeCompare(a.auditDate));
  const latestAudit = audits[0];

  // Project NCs and WIRs from dynamic state
  const projectNCs = state.ncs.filter(n => n.projectId === projectId);
  const openNCs = projectNCs.filter(n => n.status !== 'Closed');
  const projectWIRs = state.wirs.filter(w => w.projectId === projectId);
  const problemWIRs = projectWIRs.filter(w => w.status === 'Rejected' || (w.slaBreach && w.status !== 'Approved'));

  const wirWeight = state.weights.wirPassRate;
  const ncWeight = state.weights.ncHealth;
  const auditWeight = state.weights.auditScore;
  const wirContrib = breakdown.wirComponent * (wirWeight / 100);
  const ncContrib = breakdown.ncComponent * (ncWeight / 100);
  const auditContrib = breakdown.auditComponent !== null ? breakdown.auditComponent * (auditWeight / 100) : 0;

  const ragColor = { green: '#16805D', amber: '#B7791F', red: '#C63F43' }[metrics.ragStatus];

  // Derive the 3 Key Executive Reasons for Status
  const reasons: { title: string; desc: string; type: 'critical' | 'warning' | 'positive' }[] = [];

  // Reason 1: Quality Score & Repeat Defect trend
  if (metrics.qualityScore < 60) {
    reasons.push({
      title: 'Quality Score below critical threshold (42/100)',
      desc: `Score deteriorated significantly due to repeat concrete non-compliances and low 1st-pass inspection rate (${metrics.wirPassRate}%).`,
      type: 'critical',
    });
  } else if (metrics.qualityScore < 80) {
    reasons.push({
      title: `Quality Score at risk (${metrics.qualityScore}/100)`,
      desc: `Score is within monitoring band (60–79). WIR 1st-pass rate is ${metrics.wirPassRate}%, with unresolved contractor findings.`,
      type: 'warning',
    });
  } else {
    reasons.push({
      title: `Quality Score consistently healthy (${metrics.qualityScore}/100)`,
      desc: `High first-time inspection approval (${metrics.wirPassRate}%) and zero critical open findings.`,
      type: 'positive',
    });
  }

  // Reason 2: WIR Turnaround & SLA
  if (metrics.overdueWIRs > 0) {
    reasons.push({
      title: `${metrics.overdueWIRs} WIR(s) awaiting review beyond 7-day SLA`,
      desc: `Inspection bottlenecks are delaying concrete pour signoffs. Turnaround currently averaging ${problemWIRs[0]?.daysAwaiting ?? 8} days.`,
      type: metrics.overdueWIRs >= 3 ? 'critical' : 'warning',
    });
  } else {
    reasons.push({
      title: 'Site inspections on schedule',
      desc: `All ${projectWIRs.length} work inspection requests are within the 7-day review turnaround window.`,
      type: 'positive',
    });
  }

  // Reason 3: Open NCs & Critical findings
  if (metrics.criticalOpenNCs > 0) {
    const oldestAge = Math.max(...openNCs.map(n => n.age));
    reasons.push({
      title: `${metrics.criticalOpenNCs} critical finding(s) pending resolution`,
      desc: `Longest open finding is ${oldestAge} days old (${oldestAge > 30 ? 'exceeded 30-day target' : 'under rectification'}). Requires structural consultant signoff.`,
      type: 'critical',
    });
  } else if (metrics.openNCs > 0) {
    reasons.push({
      title: `${metrics.openNCs} low/medium finding(s) under rectification`,
      desc: 'All open findings are non-structural and assigned to responsible trade contractors with active due dates.',
      type: 'warning',
    });
  } else {
    reasons.push({
      title: 'Zero open non-compliances',
      desc: 'All logged non-compliance findings have completed formal site verification and closure.',
      type: 'positive',
    });
  }

  function handleInspectNC(ncId: string) {
    onClose();
    setTab('nc');
    selectNC(ncId);
  }

  function handleInspectWIR(wirId: string) {
    onClose();
    setTab('wir');
    selectWIR(wirId);
  }

  // Find on-site photo evidence for this project if available
  const featuredPhoto = openNCs.find(n => n.sitePhoto)?.sitePhoto ?? problemWIRs.find(w => w.sitePhoto)?.sitePhoto;

  return (
    <Drawer
      open
      onClose={onClose}
      title={project.name}
      subtitle={`${project.city} · ${project.stage} Stage · ${project.progressPercentage}% Construction Progress`}
      width="640px"
    >
      {/* Executive Condition Banner with Site Thumbnail */}
      <div className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-2xl p-4 mb-4 shadow-xs">
        <div className="flex items-center gap-3.5 mb-3.5 pb-3.5 border-b border-[#E2E8F0]">
          <img
            src={project.image}
            alt={project.name}
            className="w-14 h-14 rounded-xl object-cover border border-[#CBD5E1] shadow-2xs flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-[#0F172A] truncate">{project.name}</h3>
            <p className="text-xs text-[#64748B] mt-0.5">{project.city} · {project.stage} Stage · PM: {project.projectManager}</p>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-[#64748B] block">Construction</span>
            <span className="text-xs font-bold text-[#0F172A]">{project.progressPercentage}%</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl font-extrabold tracking-tight" style={{ color: ragColor }}>
              {metrics.qualityScore}
            </span>
            <span className="text-xs text-[#64748B] font-medium">/ 100 Quality Score</span>
            <span className={clsx(
              'px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider',
              metrics.healthCategory === 'Critical' ? 'bg-rose-100 text-[#DC2626] border border-rose-200' :
              metrics.healthCategory === 'At Risk' ? 'bg-amber-100 text-[#D97706] border border-amber-200' :
              'bg-emerald-100 text-[#0F766E] border border-emerald-200'
            )}>
              {metrics.healthCategory}
            </span>
          </div>
          <div className="text-right text-xs">
            <span className="text-[#64748B]">Open Findings: </span>
            <strong className={clsx(metrics.criticalOpenNCs > 0 ? 'text-[#DC2626]' : 'text-[#0F172A]')}>
              {openNCs.length} ({metrics.criticalOpenNCs} critical)
            </strong>
          </div>
        </div>
      </div>

      {/* 3 Key Reasons for Current Status */}
      <DrawerSection title="Primary Drivers of Current Status">
        <div className="space-y-2.5">
          {reasons.map((r, i) => (
            <div
              key={i}
              className={clsx(
                'p-3.5 rounded-xl border flex items-start gap-3',
                r.type === 'critical' ? 'bg-rose-50/60 border-rose-200' :
                r.type === 'warning' ? 'bg-amber-50/60 border-amber-200' :
                'bg-emerald-50/60 border-emerald-200'
              )}
            >
              <div className="mt-0.5 flex-shrink-0">
                {r.type === 'critical' && <AlertCircle size={16} className="text-[#DC2626]" />}
                {r.type === 'warning' && <AlertTriangle size={16} className="text-[#D97706]" />}
                {r.type === 'positive' && <CheckCircle size={16} className="text-[#0F766E]" />}
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-[#0F172A]">{r.title}</p>
                <p className="text-xs text-[#475569] mt-0.5 leading-relaxed">{r.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </DrawerSection>

      {/* Project Ownership & Team */}
      <DrawerSection title="Project Leadership">
        <div className="border border-[#E2E8F0] rounded-xl overflow-hidden text-xs">
          <FieldRow label="Project Manager" value={<strong className="text-[#0F172A]">{project.projectManager}</strong>} />
          <FieldRow label="Quality Lead" value={<strong className="text-[#0F172A]">{project.qualityLead}</strong>} />
          <FieldRow label="Region / City" value={`${project.region} · ${project.city}`} />
          <FieldRow label="Towers / Scope" value={project.towers.join(', ')} />
          <FieldRow label="Target Handover" value={project.targetCompletion} />
        </div>
      </DrawerSection>

      {/* Quality Score Breakdown */}
      <DrawerSection title="Quality Score Decomposition">
        <div className="space-y-3">
          <ScoreBar
            label="WIR First-Time Pass Rate"
            score={breakdown.wirComponent}
            weight={wirWeight}
            contribution={wirContrib}
          />
          <ScoreBar
            label="NC Health & Resolution Performance"
            score={breakdown.ncComponent}
            weight={ncWeight}
            contribution={ncContrib}
          />
          {breakdown.auditAvailable ? (
            <ScoreBar
              label={`Latest Completed Audit (${latestAudit?.type ?? 'Internal'})`}
              score={breakdown.auditComponent ?? 0}
              weight={auditWeight}
              contribution={auditContrib}
            />
          ) : (
            <div className="flex items-center justify-between py-2 border-b border-[#F1F5F9] text-xs">
              <span className="text-[#64748B]">Latest Audit</span>
              <span className="text-[#94A3B8] bg-slate-50 px-2 py-0.5 rounded">No audit completed — weights renormalised</span>
            </div>
          )}
        </div>
      </DrawerSection>

      {/* On-Site Defect Evidence (Mobile Capture) */}
      {featuredPhoto && (
        <DrawerSection title="On-Site Inspection Defect Evidence">
          <SitePhotoCard photo={featuredPhoto} title="Captured on Field QA App" />
        </DrawerSection>
      )}

      {/* Open Quality Findings (NCs) */}
      <DrawerSection title={`Open Quality Findings (${openNCs.length})`}>
        {openNCs.length === 0 ? (
          <p className="text-xs text-[#0F766E] bg-emerald-50 p-3 rounded-xl border border-emerald-200">
            No open non-compliance findings for this project.
          </p>
        ) : (
          <div className="space-y-2">
            {openNCs.slice(0, 3).map(nc => {
              const contractor = CONTRACTORS.find(c => c.id === nc.contractorId);
              return (
                <div key={nc.id} className="border border-[#E2E8F0] rounded-xl p-3 bg-white hover:border-[#CBD5E1] transition-colors">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-mono font-bold text-[#315EFB]">{nc.id}</span>
                      <SeverityBadge severity={nc.severity} />
                      <StatusBadge status={nc.status} />
                      {nc.isRepeat && (
                        <span className="text-[10px] text-[#D97706] bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">Repeat</span>
                      )}
                    </div>
                    <button
                      onClick={() => handleInspectNC(nc.id)}
                      className="text-xs font-semibold text-[#315EFB] hover:underline flex items-center gap-0.5 flex-shrink-0"
                    >
                      Inspect <ArrowRight size={11} />
                    </button>
                  </div>
                  <p className="text-xs text-[#0F172A] font-medium line-clamp-2">{nc.finding}</p>
                  <div className="flex items-center gap-3 mt-1.5 text-[11px] text-[#64748B]">
                    <span>Contractor: <strong className="text-[#0F172A]">{contractor?.name}</strong></span>
                    <span>·</span>
                    <span>{nc.tower}</span>
                    <span>·</span>
                    <span className={clsx(nc.age > 30 ? 'text-[#DC2626] font-bold' : '')}>{nc.age}d open</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </DrawerSection>

      {/* Problem WIRs */}
      {problemWIRs.length > 0 && (
        <DrawerSection title={`Inspections Needing Attention (${problemWIRs.length})`}>
          <div className="space-y-2">
            {problemWIRs.slice(0, 2).map(wir => {
              const contractor = CONTRACTORS.find(c => c.id === wir.contractorId);
              return (
                <div key={wir.id} className="border border-rose-200 rounded-xl p-3 bg-rose-50/30">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-mono font-bold text-[#315EFB]">{wir.id}</span>
                      <StatusBadge status={wir.status} />
                      {wir.slaBreach && (
                        <span className="text-[10px] font-bold text-[#DC2626] bg-rose-100 px-1.5 py-0.5 rounded">SLA Breach ({wir.daysAwaiting}d)</span>
                      )}
                    </div>
                    <button
                      onClick={() => handleInspectWIR(wir.id)}
                      className="text-xs text-[#315EFB] font-semibold hover:underline flex items-center gap-0.5 flex-shrink-0"
                    >
                      Inspect WIR <ArrowRight size={11} />
                    </button>
                  </div>
                  <p className="text-xs text-[#0F172A] font-medium">{wir.activity} · {wir.tower}</p>
                  <p className="text-[11px] text-[#64748B] mt-0.5">Contractor: {contractor?.name}</p>
                  {wir.rejectionReason && (
                    <p className="text-xs text-[#DC2626] mt-1 bg-white p-2 rounded-lg border border-rose-200">
                      Reason: {wir.rejectionReason}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </DrawerSection>
      )}

      {/* Quick Navigation Shortcuts */}
      <DrawerSection title="Investigate Further">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => { setTab('wir'); setFilter('project', projectId); onClose(); }}
            className="text-xs font-semibold text-[#0F172A] bg-[#F1F5F9] hover:bg-[#E2E8F0] rounded-xl px-3 py-2 transition-colors"
          >
            All Project WIRs →
          </button>
          <button
            onClick={() => { setTab('nc'); setFilter('project', projectId); onClose(); }}
            className="text-xs font-semibold text-[#0F172A] bg-[#F1F5F9] hover:bg-[#E2E8F0] rounded-xl px-3 py-2 transition-colors"
          >
            All Project NCs →
          </button>
          <button
            onClick={() => { setTab('quality'); setFilter('project', projectId); onClose(); }}
            className="text-xs font-semibold text-[#0F172A] bg-[#F1F5F9] hover:bg-[#E2E8F0] rounded-xl px-3 py-2 transition-colors"
          >
            Audit History & Quality Score →
          </button>
        </div>
      </DrawerSection>
    </Drawer>
  );
}
