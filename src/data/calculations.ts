// ============================================================
// METRIC CALCULATIONS — derived from seed data
// All portfolio, quality score, and contractor metrics live here
// ============================================================

import {
  PROJECTS, CONTRACTORS, WIR_RECORDS, NC_RECORDS, AUDIT_RECORDS, HISTORICAL_SCORES,
  DEFAULT_WEIGHTS, NC_PENALTIES, RAG_THRESHOLDS,
  type Project, type Contractor, type WIR, type NC, type Audit, type ScoreWeights,
} from './seedData';

// ── Helpers ───────────────────────────────────────────────────

export function getRAGStatus(score: number): 'green' | 'amber' | 'red' {
  if (score >= RAG_THRESHOLDS.green) return 'green';
  if (score >= RAG_THRESHOLDS.amber) return 'amber';
  return 'red';
}

export function getRAGLabel(score: number): string {
  const s = getRAGStatus(score);
  if (s === 'green') return 'Healthy';
  if (s === 'amber') return 'At Risk';
  return 'Critical';
}

export function daysBetween(d1: string, d2: string): number {
  return Math.floor((new Date(d1).getTime() - new Date(d2).getTime()) / 86400000);
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

// ── WIR Component (0–100) ────────────────────────────────────
export function calcWIRPassRate(wirs: WIR[]): number {
  const decided = wirs.filter(w => w.status === 'Approved' || w.status === 'Rejected');
  if (decided.length === 0) return 0;
  const firstPass = decided.filter(w => w.firstPassResult === 'Pass');
  return Math.round((firstPass.length / decided.length) * 100);
}

// ── NC Health Component (0–100) ──────────────────────────────
export function calcNCHealth(ncs: NC[], asOfDate?: string): number {
  const today = asOfDate ? new Date(asOfDate) : new Date();
  const openNCs = ncs.filter(nc => nc.status !== 'Closed');
  let score = 100;

  for (const nc of openNCs) {
    const base = NC_PENALTIES[nc.severity] ?? 0;
    score -= base;

    // Overdue penalty
    const due = new Date(nc.dueDate);
    if (today > due) {
      const daysOverdue = Math.floor((today.getTime() - due.getTime()) / 86400000);
      const weeksOverdue = Math.floor(daysOverdue / 7);
      const penalty = Math.min(weeksOverdue * NC_PENALTIES.overduePerWeek, NC_PENALTIES.overdueMax);
      score -= penalty;
    }
  }

  return clamp(Math.round(score), 0, 100);
}

// ── Audit Component (0–100) ──────────────────────────────────
export function getLatestAudit(projectId: string): Audit | null {
  const completed = AUDIT_RECORDS.filter(a => a.projectId === projectId && a.status === 'Completed');
  if (completed.length === 0) return null;
  return completed.sort((a, b) => b.auditDate.localeCompare(a.auditDate))[0];
}

// ── Quality Score (composite) ─────────────────────────────────
export interface QualityScoreBreakdown {
  projectId: string;
  wirComponent: number;
  ncComponent: number;
  auditComponent: number | null;
  auditAvailable: boolean;
  finalScore: number;
  weights: ScoreWeights;
}

export function calcQualityScore(
  projectId: string,
  weights: ScoreWeights = DEFAULT_WEIGHTS,
  wirs?: WIR[],
  ncs?: NC[],
): QualityScoreBreakdown {
  const projectWIRs = (wirs ?? WIR_RECORDS).filter(w => w.projectId === projectId);
  const projectNCs = (ncs ?? NC_RECORDS).filter(n => n.projectId === projectId);
  const latestAudit = getLatestAudit(projectId);

  const wirComp = calcWIRPassRate(projectWIRs);
  const ncComp = calcNCHealth(projectNCs);
  const auditComp = latestAudit ? latestAudit.percentageScore : null;

  let finalScore: number;
  const totalWeightPercent = weights.wirPassRate + weights.ncHealth + weights.auditScore;

  if (auditComp === null) {
    // Renormalise without audit component
    const renormWIR = weights.wirPassRate / (weights.wirPassRate + weights.ncHealth);
    const renormNC = weights.ncHealth / (weights.wirPassRate + weights.ncHealth);
    finalScore = wirComp * renormWIR + ncComp * renormNC;
  } else {
    finalScore =
      wirComp * (weights.wirPassRate / totalWeightPercent) +
      ncComp * (weights.ncHealth / totalWeightPercent) +
      (auditComp ?? 0) * (weights.auditScore / totalWeightPercent);
  }

  return {
    projectId,
    wirComponent: wirComp,
    ncComponent: ncComp,
    auditComponent: auditComp,
    auditAvailable: auditComp !== null,
    finalScore: Math.round(finalScore),
    weights,
  };
}

// ── Project Metrics (Portfolio table row) ─────────────────────
export function getProjectHealthCategory(
  qualityScore: number,
  criticalOpenNCs: number,
  overdueWIRs: number,
): 'On Track' | 'At Risk' | 'Critical' {
  if (qualityScore < 60 || criticalOpenNCs >= 3) {
    return 'Critical';
  }
  if (qualityScore < 80 || criticalOpenNCs > 0 || overdueWIRs > 0) {
    return 'At Risk';
  }
  return 'On Track';
}

export interface ProjectMetrics {
  project: Project;
  qualityScore: number;
  ragStatus: 'green' | 'amber' | 'red';
  healthCategory: 'On Track' | 'At Risk' | 'Critical';
  wirPassRate: number;
  openNCs: number;
  criticalOpenNCs: number;
  overdueWIRs: number;
  latestAudit: Audit | null;
  breakdown: QualityScoreBreakdown;
  prevScore: number | null;
  scoreDelta: number | null;
}

export function getProjectMetrics(
  projectId: string,
  weights: ScoreWeights = DEFAULT_WEIGHTS,
  wirs?: WIR[],
  ncs?: NC[],
): ProjectMetrics {
  const project = PROJECTS.find(p => p.id === projectId)!;
  const breakdown = calcQualityScore(projectId, weights, wirs, ncs);
  const projectWIRs = (wirs ?? WIR_RECORDS).filter(w => w.projectId === projectId);
  const projectNCs = (ncs ?? NC_RECORDS).filter(n => n.projectId === projectId);
  const openNCs = projectNCs.filter(n => n.status !== 'Closed');
  const overdueWIRs = projectWIRs.filter(w => w.slaBreach && (w.status === 'Submitted' || w.status === 'Awaiting Review'));
  const criticalOpenNCs = openNCs.filter(n => n.severity === 'Critical').length;
  const healthCategory = getProjectHealthCategory(breakdown.finalScore, criticalOpenNCs, overdueWIRs.length);

  // Previous period score from HISTORICAL_SCORES
  const hist = HISTORICAL_SCORES.filter(h => h.projectId === projectId).sort((a, b) => b.month.localeCompare(a.month));
  const prevScore = hist.length >= 2 ? hist[1].score : null;
  const scoreDelta = prevScore !== null ? breakdown.finalScore - prevScore : null;

  return {
    project,
    qualityScore: breakdown.finalScore,
    ragStatus: getRAGStatus(breakdown.finalScore),
    healthCategory,
    wirPassRate: breakdown.wirComponent,
    openNCs: openNCs.length,
    criticalOpenNCs,
    overdueWIRs: overdueWIRs.length,
    latestAudit: getLatestAudit(projectId),
    breakdown,
    prevScore,
    scoreDelta,
  };
}

export function getAllProjectMetrics(
  weights: ScoreWeights = DEFAULT_WEIGHTS,
  wirs?: WIR[],
  ncs?: NC[],
): ProjectMetrics[] {
  return PROJECTS.map(p => getProjectMetrics(p.id, weights, wirs, ncs)).sort((a, b) => a.qualityScore - b.qualityScore);
}

// ── Portfolio KPIs ────────────────────────────────────────────
export interface PortfolioKPIs {
  avgQualityScore: number;
  prevAvgQualityScore: number | null;
  firstTimePassRate: number;
  prevFirstTimePassRate: number | null;
  openNCs: number;
  criticalOpenNCs: number;
  avgDaysToClose: number;
}

export function getPortfolioKPIs(
  weights: ScoreWeights = DEFAULT_WEIGHTS,
  wirs?: WIR[],
  ncs?: NC[],
): PortfolioKPIs {
  const activeWIRs = wirs ?? WIR_RECORDS;
  const activeNCs = ncs ?? NC_RECORDS;
  const allMetrics = getAllProjectMetrics(weights, activeWIRs, activeNCs);
  const scores = allMetrics.map(m => m.qualityScore);
  const avgQualityScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

  // Previous month scores from history
  const prevMonthScores = HISTORICAL_SCORES.filter(h => {
    const months = HISTORICAL_SCORES.filter(hh => hh.projectId === h.projectId).map(hh => hh.month).sort();
    return h.month === months[months.length - 2];
  });
  const prevAvgQualityScore = prevMonthScores.length > 0
    ? Math.round(prevMonthScores.reduce((a, b) => a + b.score, 0) / prevMonthScores.length)
    : null;

  // First-time pass rate across all WIRs
  const firstTimePassRate = calcWIRPassRate(activeWIRs);
  const prevFirstTimePassRate = 64; // Historical snapshot

  // Open NCs
  const openNCs = activeNCs.filter(n => n.status !== 'Closed');
  const criticalOpenNCs = openNCs.filter(n => n.severity === 'Critical').length;

  // Average days to close
  const closedNCs = activeNCs.filter(n => n.status === 'Closed');
  const avgDaysToClose = closedNCs.length > 0
    ? Math.round(closedNCs.reduce((acc, nc) => acc + nc.age, 0) / closedNCs.length)
    : 0;

  return {
    avgQualityScore,
    prevAvgQualityScore,
    firstTimePassRate,
    prevFirstTimePassRate,
    openNCs: openNCs.length,
    criticalOpenNCs,
    avgDaysToClose,
  };
}

// ── Contractor Metrics ────────────────────────────────────────
export interface ContractorMetrics {
  contractor: Contractor;
  totalWIRs: number;
  firstTimePassRate: number;
  openNCs: number;
  criticalOpenNCs: number;
  avgNCClosureTime: number;
  repeatNCCount: number;
  projects: string[];
  trend: 'improving' | 'declining' | 'stable';
  limitedEvidence: boolean;
}

export function getContractorMetrics(
  contractorId: string,
  wirs?: WIR[],
  ncs?: NC[],
): ContractorMetrics {
  const activeWIRs = wirs ?? WIR_RECORDS;
  const activeNCs = ncs ?? NC_RECORDS;
  const contractor = CONTRACTORS.find(c => c.id === contractorId)!;
  const contractorWIRs = activeWIRs.filter(w => w.contractorId === contractorId);
  const contractorNCs = activeNCs.filter(n => n.contractorId === contractorId);

  const openNCs = contractorNCs.filter(n => n.status !== 'Closed');
  const closedNCs = contractorNCs.filter(n => n.status === 'Closed');
  const avgNCClosureTime = closedNCs.length > 0
    ? Math.round(closedNCs.reduce((acc, nc) => acc + nc.age, 0) / closedNCs.length)
    : 0;

  const passRate = calcWIRPassRate(contractorWIRs);
  const repeatNCs = contractorNCs.filter(n => n.isRepeat).length;

  // Simple trend: compare first-pass rate of recent vs older WIRs
  const sortedWIRs = [...contractorWIRs].sort((a, b) => a.submittedDate.localeCompare(b.submittedDate));
  const half = Math.floor(sortedWIRs.length / 2);
  const olderWIRs = sortedWIRs.slice(0, half);
  const newerWIRs = sortedWIRs.slice(half);
  const olderRate = calcWIRPassRate(olderWIRs);
  const newerRate = calcWIRPassRate(newerWIRs);
  const trend: 'improving' | 'declining' | 'stable' =
    newerRate > olderRate + 5 ? 'improving' :
    newerRate < olderRate - 5 ? 'declining' : 'stable';

  const projectIds = [...new Set(contractorWIRs.map(w => w.projectId))];

  return {
    contractor,
    totalWIRs: contractorWIRs.length,
    firstTimePassRate: passRate,
    openNCs: openNCs.length,
    criticalOpenNCs: openNCs.filter(n => n.severity === 'Critical').length,
    avgNCClosureTime,
    repeatNCCount: repeatNCs,
    projects: projectIds,
    trend,
    limitedEvidence: contractorWIRs.length < 5,
  };
}

export function getAllContractorMetrics(wirs?: WIR[], ncs?: NC[]): ContractorMetrics[] {
  return CONTRACTORS
    .map(c => getContractorMetrics(c.id, wirs, ncs))
    .filter(m => m.totalWIRs > 0)
    .sort((a, b) => a.firstTimePassRate - b.firstTimePassRate);
}

// ── WIR Summary Metrics ───────────────────────────────────────
export interface WIRSummaryMetrics {
  total: number;
  firstTimePassRate: number;
  pendingBeyondSLA: number;
  rejectedAwaitingResubmission: number;
  avgTurnaroundDays: number;
}

export function getWIRSummaryMetrics(wirs: WIR[] = WIR_RECORDS): WIRSummaryMetrics {
  const total = wirs.length;
  const firstTimePassRate = calcWIRPassRate(wirs);
  const pendingBeyondSLA = wirs.filter(w => w.slaBreach && (w.status === 'Submitted' || w.status === 'Awaiting Review')).length;
  const rejectedAwaitingResubmission = wirs.filter(w => w.status === 'Rejected').length;

  const decided = wirs.filter(w => w.status === 'Approved' || w.status === 'Rejected');
  const avgTurnaroundDays = decided.length > 0
    ? Math.round(decided.reduce((acc, w) => acc + w.daysAwaiting, 0) / decided.length)
    : 0;

  return { total, firstTimePassRate, pendingBeyondSLA, rejectedAwaitingResubmission, avgTurnaroundDays };
}

// ── NC Summary Metrics ────────────────────────────────────────
export interface NCSummaryMetrics {
  totalOpen: number;
  criticalHighOpen: number;
  overdue: number;
  avgDaysToClose: number;
  repeatCount: number;
}

export function getNCSummaryMetrics(ncs: NC[] = NC_RECORDS): NCSummaryMetrics {
  const openNCs = ncs.filter(n => n.status !== 'Closed');
  const today = new Date();
  const overdue = openNCs.filter(n => new Date(n.dueDate) < today).length;
  const closed = ncs.filter(n => n.status === 'Closed');
  const avgDaysToClose = closed.length > 0
    ? Math.round(closed.reduce((acc, n) => acc + n.age, 0) / closed.length)
    : 0;

  return {
    totalOpen: openNCs.length,
    criticalHighOpen: openNCs.filter(n => n.severity === 'Critical' || n.severity === 'High').length,
    overdue,
    avgDaysToClose,
    repeatCount: ncs.filter(n => n.isRepeat).length,
  };
}

// ── Historical Scores for chart ───────────────────────────────
export function getHistoricalScoresForProjects(projectIds: string[]) {
  const months = [...new Set(HISTORICAL_SCORES.map(h => h.month))].sort();
  return months.map(month => {
    const entry: Record<string, unknown> = { month };
    for (const pid of projectIds) {
      const h = HISTORICAL_SCORES.find(hh => hh.month === month && hh.projectId === pid);
      const proj = PROJECTS.find(p => p.id === pid);
      if (proj) {
        entry[proj.name] = h?.score ?? null;
      }
    }
    return entry;
  });
}

// ── Needs Attention Alerts ────────────────────────────────────
export interface Alert {
  id: string;
  type: 'nc' | 'score' | 'contractor';
  severity: 'critical' | 'high' | 'medium';
  title: string;
  projectName: string;
  projectId: string;
  detail: string;
  owner: string;
  linkType: 'nc' | 'wir' | 'contractor' | 'project';
  linkId: string;
  ncId?: string;
  contractorId?: string;
}

export function getNeedsAttentionAlerts(wirs?: WIR[], ncs?: NC[], weights: ScoreWeights = DEFAULT_WEIGHTS): Alert[] {
  const activeWIRs = wirs ?? WIR_RECORDS;
  const activeNCs = ncs ?? NC_RECORDS;
  const alerts: Alert[] = [];
  const today = new Date();

  // 1. Critical NCs overdue
  const critOverdueNCs = activeNCs.filter(n =>
    (n.severity === 'Critical' || n.severity === 'High') &&
    n.status !== 'Closed' &&
    new Date(n.dueDate) < today
  );
  for (const nc of critOverdueNCs) {
    const proj = PROJECTS.find(p => p.id === nc.projectId);
    const contractor = CONTRACTORS.find(c => c.id === nc.contractorId);
    const daysOverdue = Math.floor((today.getTime() - new Date(nc.dueDate).getTime()) / 86400000);
    alerts.push({
      id: `alert-nc-${nc.id}`,
      type: 'nc',
      severity: nc.severity === 'Critical' ? 'critical' : 'high',
      title: `${nc.severity} NC overdue`,
      projectName: proj?.name ?? '',
      projectId: nc.projectId,
      detail: `${nc.finding.slice(0, 80)}${nc.finding.length > 80 ? '…' : ''} · ${daysOverdue}d overdue`,
      owner: contractor?.name ?? nc.owner,
      linkType: 'nc',
      linkId: nc.id,
      ncId: nc.id,
    });
  }

  // 2. Projects with significant score drop
  const metrics = getAllProjectMetrics(weights, activeWIRs, activeNCs);
  for (const m of metrics) {
    if (m.scoreDelta !== null && m.scoreDelta <= -6) {
      alerts.push({
        id: `alert-score-${m.project.id}`,
        type: 'score',
        severity: m.qualityScore < 60 ? 'critical' : 'high',
        title: 'Quality Score declining',
        projectName: m.project.name,
        projectId: m.project.id,
        detail: `Score dropped ${Math.abs(m.scoreDelta)} points vs previous period (now ${m.qualityScore}/100)`,
        owner: 'Project Team',
        linkType: 'project',
        linkId: m.project.id,
      });
    }
  }

  // 3. Contractors with poor first-time pass rate
  const contractorMetrics = getAllContractorMetrics(activeWIRs, activeNCs);
  for (const cm of contractorMetrics) {
    if (cm.firstTimePassRate < 55 && cm.totalWIRs >= 3) {
      alerts.push({
        id: `alert-contractor-${cm.contractor.id}`,
        type: 'contractor',
        severity: cm.firstTimePassRate < 40 ? 'critical' : 'high',
        title: 'Low first-time pass rate',
        projectName: cm.projects.map(pid => PROJECTS.find(p => p.id === pid)?.name ?? '').join(', '),
        projectId: cm.projects[0],
        detail: `${cm.contractor.name} — ${cm.firstTimePassRate}% first-time pass rate across ${cm.projects.length} project(s)`,
        owner: cm.contractor.name,
        linkType: 'contractor',
        linkId: cm.contractor.id,
        contractorId: cm.contractor.id,
      });
    }
  }

  // Sort by severity
  const order = { critical: 0, high: 1, medium: 2 };
  return alerts.sort((a, b) => order[a.severity] - order[b.severity]);
}
