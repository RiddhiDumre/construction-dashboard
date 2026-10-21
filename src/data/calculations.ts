// ============================================================
// METRIC CALCULATIONS — derived from seed data
// All portfolio, quality score, contractor, and WIP metrics live here
// ============================================================

import {
  PROJECTS, CONTRACTORS, WIR_RECORDS, NC_RECORDS, AUDIT_RECORDS, HISTORICAL_SCORES,
  TOWERS_DATA, FLOORS_DATA, WIP_ACTIVITIES, PORTFOLIO_PROGRESS_CURVE,
  DEFAULT_WEIGHTS, NC_PENALTIES, RAG_THRESHOLDS,
  type Project, type Contractor, type WIR, type NC, type Audit, type ScoreWeights,
  type TowerBuilding, type FloorProgress, type WIPActivity, type ProgressCurvePoint,
} from './seedData';

// ── Helpers ───────────────────────────────────────────────────

export function isProjectInCity(projectCity: string, selectedCity?: string): boolean {
  if (!selectedCity || selectedCity === 'All Locations') return true;
  const pCity = projectCity.toLowerCase().trim();
  const sCity = selectedCity.toLowerCase().trim();
  if (sCity === 'mumbai') {
    return pCity === 'mumbai' || pCity === 'navi mumbai' || pCity === 'thane';
  }
  return pCity === sCity;
}

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

    // Overdue penalty: 2 pts per full week overdue, capped at 10 pts
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
  progressVariance: number = 0,
): 'On Track' | 'At Risk' | 'Critical' {
  if (qualityScore < 60 || criticalOpenNCs >= 2 || progressVariance <= -15) {
    return 'Critical';
  }
  if (qualityScore < 80 || criticalOpenNCs > 0 || overdueWIRs > 0 || progressVariance <= -5) {
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
  progressVariance: number;
}

export function getProjectMetrics(
  projectId: string,
  weights: ScoreWeights = DEFAULT_WEIGHTS,
  wirs?: WIR[],
  ncs?: NC[],
): ProjectMetrics {
  const project = PROJECTS.find(p => p.id === projectId) || PROJECTS[0];
  const breakdown = calcQualityScore(projectId, weights, wirs, ncs);
  const projectWIRs = (wirs ?? WIR_RECORDS).filter(w => w.projectId === projectId);
  const projectNCs = (ncs ?? NC_RECORDS).filter(n => n.projectId === projectId);
  const openNCs = projectNCs.filter(n => n.status !== 'Closed');
  const overdueWIRs = projectWIRs.filter(w => w.slaBreach && (w.status === 'Submitted' || w.status === 'Awaiting Review'));
  const criticalOpenNCs = openNCs.filter(n => n.severity === 'Critical').length;
  const progressVariance = project.progressPercentage - project.targetProgressPercentage;
  const healthCategory = getProjectHealthCategory(breakdown.finalScore, criticalOpenNCs, overdueWIRs.length, progressVariance);

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
    progressVariance,
  };
}

export function getAllProjectMetrics(
  weights: ScoreWeights = DEFAULT_WEIGHTS,
  wirs?: WIR[],
  ncs?: NC[],
): ProjectMetrics[] {
  return PROJECTS.map(p => getProjectMetrics(p.id, weights, wirs, ncs))
    .sort((a, b) => {
      // Sort priority: Critical first, then At Risk, then On Track.
      // Within same health tier, lowest Quality Score first.
      const rank = { Critical: 0, 'At Risk': 1, 'On Track': 2 };
      if (rank[a.healthCategory] !== rank[b.healthCategory]) {
        return rank[a.healthCategory] - rank[b.healthCategory];
      }
      return a.qualityScore - b.qualityScore;
    });
}

// ── Overview 4 Portfolio KPIs ──────────────────────────────────
export interface OverviewPortfolioKPIs {
  overallProgress: number;
  overallTargetProgress: number;
  progressVariance: number;
  projectsTotal: number;
  projectsOnTrack: number;
  projectsAtRisk: number;
  projectsCritical: number;
  overdueWIRs: number;
  openNCs: number;
  criticalNCs: number;
  avgQualityScore: number;
  portfolioQualityScore: number;
  portfolioWIRPassRate: number;
}

export function getOverviewPortfolioKPIs(
  city?: string,
  weights: ScoreWeights = DEFAULT_WEIGHTS,
  wirs?: WIR[],
  ncs?: NC[],
): OverviewPortfolioKPIs {
  const activeWIRs = wirs ?? WIR_RECORDS;
  const activeNCs = ncs ?? NC_RECORDS;
  let allMetrics = getAllProjectMetrics(weights, activeWIRs, activeNCs);

  if (city && city !== 'All locations' && city !== 'All Locations') {
    if (city.toLowerCase() === 'mumbai') {
      allMetrics = allMetrics.filter(m => m.project.city === 'Mumbai' || m.project.city === 'Navi Mumbai' || m.project.city === 'Thane');
    } else {
      allMetrics = allMetrics.filter(m => m.project.city.toLowerCase() === city.toLowerCase());
    }
  }

  const projectIds = allMetrics.map(m => m.project.id);
  const scopedWIRs = activeWIRs.filter(w => projectIds.includes(w.projectId));
  const scopedNCs = activeNCs.filter(n => projectIds.includes(n.projectId));

  const totalProgress = allMetrics.length > 0
    ? Math.round(allMetrics.reduce((sum, m) => sum + m.project.progressPercentage, 0) / allMetrics.length)
    : 0;
  const targetProgress = allMetrics.length > 0
    ? Math.round(allMetrics.reduce((sum, m) => sum + m.project.targetProgressPercentage, 0) / allMetrics.length)
    : 0;

  const onTrack = allMetrics.filter(m => m.healthCategory === 'On Track').length;
  const atRisk = allMetrics.filter(m => m.healthCategory === 'At Risk').length;
  const critical = allMetrics.filter(m => m.healthCategory === 'Critical').length;

  const overdueWIRs = scopedWIRs.filter(w => w.slaBreach && (w.status === 'Submitted' || w.status === 'Awaiting Review')).length;
  const openNCs = scopedNCs.filter(n => n.status !== 'Closed');
  const criticalNCs = openNCs.filter(n => n.severity === 'Critical').length;

  const avgQualityScore = allMetrics.length > 0
    ? Math.round(allMetrics.reduce((sum, m) => sum + m.qualityScore, 0) / allMetrics.length)
    : 0;
  const portfolioWIRPassRate = calcWIRPassRate(scopedWIRs);

  return {
    overallProgress: totalProgress,
    overallTargetProgress: targetProgress,
    progressVariance: totalProgress - targetProgress,
    projectsTotal: allMetrics.length,
    projectsOnTrack: onTrack,
    projectsAtRisk: atRisk,
    projectsCritical: critical,
    overdueWIRs,
    openNCs: openNCs.length,
    criticalNCs,
    avgQualityScore,
    portfolioQualityScore: avgQualityScore,
    portfolioWIRPassRate,
  };
}

// ── WIP Summary Metrics ───────────────────────────────────────
export interface WIPSummaryMetrics {
  totalBuildings: number;
  buildingsCompleted: number;
  buildingsUnderConstruction: number;
  buildingsDelayed: number;
  overallActualProgress: number;
  overallPlannedProgress: number;
  progressVariance: number;
}

export function getWIPSummaryMetrics(city?: string, projectId?: string): WIPSummaryMetrics {
  let towers = [...TOWERS_DATA];

  if (projectId) {
    towers = towers.filter(t => t.projectId === projectId);
  } else if (city && city !== 'All locations' && city !== 'All Locations') {
    const matchingProjects = PROJECTS.filter(p => {
      if (city.toLowerCase() === 'mumbai') return p.city === 'Mumbai' || p.city === 'Navi Mumbai' || p.city === 'Thane';
      return p.city.toLowerCase() === city.toLowerCase();
    }).map(p => p.id);
    towers = towers.filter(t => matchingProjects.includes(t.projectId));
  }

  const total = towers.length;
  const completed = towers.filter(t => t.actualProgress >= 95).length;
  const delayed = towers.filter(t => t.status === 'Delayed').length;
  const underConstruction = total - completed;

  const avgActual = total > 0 ? Math.round(towers.reduce((acc, t) => acc + t.actualProgress, 0) / total) : 0;
  const avgPlanned = total > 0 ? Math.round(towers.reduce((acc, t) => acc + t.plannedProgress, 0) / total) : 0;

  return {
    totalBuildings: total,
    buildingsCompleted: completed,
    buildingsUnderConstruction: underConstruction,
    buildingsDelayed: delayed,
    overallActualProgress: avgActual,
    overallPlannedProgress: avgPlanned,
    progressVariance: avgActual - avgPlanned,
  };
}

// ── WIP Progress S-Curve ──────────────────────────────────────
export function getProgressCurveData(city?: string, projectId?: string): ProgressCurvePoint[] {
  if (projectId === 'P004') {
    // Riverstone: significantly behind plan
    return [
      { period: 'Apr 25', planned: 20, actual: 20 },
      { period: 'May 25', planned: 28, actual: 26 },
      { period: 'Jun 25', planned: 36, actual: 32 },
      { period: 'Jul 25', planned: 45, actual: 38 },
      { period: 'Aug 25', planned: 54, actual: 44 },
      { period: 'Sep 25', planned: 62, actual: 48 },
      { period: 'Oct 25', planned: 70, actual: 48 },
      { period: 'Nov 25', planned: 78, actual: 48, target: 78 },
      { period: 'Dec 25', planned: 85, actual: 48, target: 85 },
    ];
  }
  if (projectId === 'P005') {
    // Harbour Point: ahead of plan
    return [
      { period: 'Apr 25', planned: 60, actual: 62 },
      { period: 'May 25', planned: 68, actual: 70 },
      { period: 'Jun 25', planned: 75, actual: 78 },
      { period: 'Jul 25', planned: 80, actual: 82 },
      { period: 'Aug 25', planned: 84, actual: 85 },
      { period: 'Sep 25', planned: 86, actual: 88 },
      { period: 'Oct 25', planned: 90, actual: 88 },
      { period: 'Nov 25', planned: 94, actual: 88, target: 94 },
      { period: 'Dec 25', planned: 100, actual: 88, target: 100 },
    ];
  }
  return PORTFOLIO_PROGRESS_CURVE;
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

  // Trend: compare first-pass rate of recent vs older WIRs
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
    limitedEvidence: contractorWIRs.length < 4,
  };
}

export function getAllContractorMetrics(wirs?: WIR[], ncs?: NC[]): ContractorMetrics[] {
  return CONTRACTORS
    .map(c => getContractorMetrics(c.id, wirs, ncs))
    .filter(m => m.totalWIRs > 0)
    .sort((a, b) => {
      // Risk order: lowest pass rate and highest critical NCs first
      if (a.criticalOpenNCs !== b.criticalOpenNCs) {
        return b.criticalOpenNCs - a.criticalOpenNCs;
      }
      return a.firstTimePassRate - b.firstTimePassRate;
    });
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
  type: 'nc' | 'score' | 'contractor' | 'wip';
  severity: 'critical' | 'high' | 'medium';
  title: string;
  projectName: string;
  projectId: string;
  detail: string;
  owner: string;
  linkType: 'nc' | 'wir' | 'contractor' | 'project' | 'wip';
  linkId: string;
  ncId?: string;
  contractorId?: string;
  actionText: string;
}

export function getNeedsAttentionAlerts(
  city?: string,
  wirs?: WIR[],
  ncs?: NC[],
  weights: ScoreWeights = DEFAULT_WEIGHTS
): Alert[] {
  const activeWIRs = wirs ?? WIR_RECORDS;
  const activeNCs = ncs ?? NC_RECORDS;
  let alerts: Alert[] = [];
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
      title: `${nc.severity} NC Overdue (${daysOverdue}d)`,
      projectName: proj?.name ?? '',
      projectId: nc.projectId,
      detail: `${nc.finding.slice(0, 75)}${nc.finding.length > 75 ? '…' : ''}`,
      owner: contractor?.name ?? nc.owner,
      linkType: 'nc',
      linkId: nc.id,
      ncId: nc.id,
      actionText: 'Review NC',
    });
  }

  // 2. WIP Construction Activities significantly delayed
  const delayedActs = WIP_ACTIVITIES.filter(a => a.status === 'Delayed' || a.status === 'Blocked');
  for (const act of delayedActs) {
    const proj = PROJECTS.find(p => p.id === act.projectId);
    const contractor = CONTRACTORS.find(c => c.id === act.contractorId);
    alerts.push({
      id: `alert-wip-${act.id}`,
      type: 'wip',
      severity: act.status === 'Blocked' ? 'critical' : 'high',
      title: `Delayed Milestone: ${act.workPackage.slice(0, 32)}…`,
      projectName: proj?.name ?? '',
      projectId: act.projectId,
      detail: act.blockingReason || `${Math.abs(act.varianceDays)} days behind baseline schedule`,
      owner: contractor?.name ?? act.projectManager,
      linkType: 'wip',
      linkId: act.projectId,
      actionText: 'Inspect Floor',
    });
  }

  // 3. Projects with significant score drop
  const metrics = getAllProjectMetrics(weights, activeWIRs, activeNCs);
  for (const m of metrics) {
    if (m.scoreDelta !== null && m.scoreDelta <= -6) {
      alerts.push({
        id: `alert-score-${m.project.id}`,
        type: 'score',
        severity: m.qualityScore < 60 ? 'critical' : 'high',
        title: 'Quality Score Declining',
        projectName: m.project.name,
        projectId: m.project.id,
        detail: `Dropped ${Math.abs(m.scoreDelta)} points vs previous month (${m.qualityScore}/100)`,
        owner: m.project.projectManager,
        linkType: 'project',
        linkId: m.project.id,
        actionText: 'View Project',
      });
    }
  }

  // 4. Contractors with low first-time pass rate
  const contractorMetrics = getAllContractorMetrics(activeWIRs, activeNCs);
  for (const cm of contractorMetrics) {
    if (cm.firstTimePassRate < 50 && cm.totalWIRs >= 3) {
      alerts.push({
        id: `alert-contractor-${cm.contractor.id}`,
        type: 'contractor',
        severity: cm.firstTimePassRate < 40 ? 'critical' : 'high',
        title: 'Contractor Pass Rate Declining',
        projectName: cm.projects.map(pid => PROJECTS.find(p => p.id === pid)?.name ?? '').join(', '),
        projectId: cm.projects[0],
        detail: `${cm.contractor.name} at ${cm.firstTimePassRate}% first-time pass rate across ${cm.projects.length} sites`,
        owner: cm.contractor.name,
        linkType: 'contractor',
        linkId: cm.contractor.id,
        contractorId: cm.contractor.id,
        actionText: 'Audit Contractor',
      });
    }
  }

  // Filter to city if specified
  if (city && city !== 'All locations' && city !== 'All Locations') {
    alerts = alerts.filter(a => {
      const proj = PROJECTS.find(p => p.id === a.projectId);
      if (!proj) return false;
      if (city.toLowerCase() === 'mumbai') return proj.city === 'Mumbai' || proj.city === 'Navi Mumbai' || proj.city === 'Thane';
      return proj.city.toLowerCase() === city.toLowerCase();
    });
  }

  // Sort by severity (critical first)
  const order = { critical: 0, high: 1, medium: 2 };
  return alerts.sort((a, b) => order[a.severity] - order[b.severity]).slice(0, 5);
}

// ── CXO Commercial Inventory Metrics ──────────────────────────
export interface CommercialInventoryMetrics {
  totalUnits: number;
  soldUnits: number;
  leftUnits: number;
  soldPercent: number;
  leftPercent: number;
  underConstructionUnits: number;
  completedUnits: number;
  upcomingUnits: number;
  totalInventoryCr: number;
  bookedValueCr: number;
  unrealizedValueCr: number;
  projectBreakdown: {
    projectId: string;
    projectName: string;
    city: string;
    totalUnits: number;
    soldUnits: number;
    leftUnits: number;
    soldPercent: number;
    underConstructionUnits: number;
    completedUnits: number;
    bookedValueCr: number;
    inventoryValueCr: number;
  }[];
}

export function getCXOCommercialInventory(city?: string): CommercialInventoryMetrics {
  let projects = PROJECTS;
  if (city && city !== 'All locations' && city !== 'All Locations') {
    if (city.toLowerCase() === 'mumbai') {
      projects = projects.filter(p => p.city === 'Mumbai' || p.city === 'Navi Mumbai' || p.city === 'Thane');
    } else {
      projects = projects.filter(p => p.city.toLowerCase() === city.toLowerCase());
    }
  }

  const totalUnits = projects.reduce((acc, p) => acc + (p.totalUnits || 0), 0);
  const soldUnits = projects.reduce((acc, p) => acc + (p.soldUnits || 0), 0);
  const underConstructionUnits = projects.reduce((acc, p) => acc + (p.underConstructionUnits || 0), 0);
  const completedUnits = projects.reduce((acc, p) => acc + (p.completedUnits || 0), 0);
  const totalInventoryCr = projects.reduce((acc, p) => acc + (p.inventoryValueCr || 0), 0);
  const bookedValueCr = projects.reduce((acc, p) => acc + (p.bookedValueCr || 0), 0);

  const leftUnits = Math.max(0, totalUnits - soldUnits);
  const upcomingUnits = Math.max(0, totalUnits - underConstructionUnits - completedUnits);
  const unrealizedValueCr = Math.max(0, totalInventoryCr - bookedValueCr);

  const soldPercent = totalUnits > 0 ? Math.round((soldUnits / totalUnits) * 100) : 0;
  const leftPercent = 100 - soldPercent;

  const projectBreakdown = projects.map(p => ({
    projectId: p.id,
    projectName: p.name,
    city: p.city,
    totalUnits: p.totalUnits || 0,
    soldUnits: p.soldUnits || 0,
    leftUnits: Math.max(0, (p.totalUnits || 0) - (p.soldUnits || 0)),
    soldPercent: (p.totalUnits || 0) > 0 ? Math.round(((p.soldUnits || 0) / (p.totalUnits || 0)) * 100) : 0,
    underConstructionUnits: p.underConstructionUnits || 0,
    completedUnits: p.completedUnits || 0,
    bookedValueCr: p.bookedValueCr || 0,
    inventoryValueCr: p.inventoryValueCr || 0,
  }));

  return {
    totalUnits,
    soldUnits,
    leftUnits,
    soldPercent,
    leftPercent,
    underConstructionUnits,
    completedUnits,
    upcomingUnits,
    totalInventoryCr,
    bookedValueCr,
    unrealizedValueCr,
    projectBreakdown,
  };
}

// ── Portfolio Slab-Wise Construction Metrics ───────────────────
export interface PortfolioSlabMetrics {
  totalSlabs: number;
  castSlabs: number;
  activeSlabs: number;
  delayedSlabs: number;
  pendingSlabs: number;
  castPercent: number;
  activePercent: number;
  towers: {
    towerId: string;
    towerName: string;
    projectId: string;
    projectName: string;
    city: string;
    totalFloors: number;
    completedFloors: number;
    activeFloors: number;
    delayedFloors: number;
    currentStage: string;
    status: string;
  }[];
}

export function getPortfolioSlabMetrics(city?: string): PortfolioSlabMetrics {
  let towers = TOWERS_DATA;
  if (city && city !== 'All locations' && city !== 'All Locations') {
    const projIds = PROJECTS.filter(p => {
      if (city.toLowerCase() === 'mumbai') return p.city === 'Mumbai' || p.city === 'Navi Mumbai' || p.city === 'Thane';
      return p.city.toLowerCase() === city.toLowerCase();
    }).map(p => p.id);
    towers = towers.filter(t => projIds.includes(t.projectId));
  }

  const totalSlabs = towers.reduce((acc, t) => acc + t.totalFloors, 0);
  const castSlabs = towers.reduce((acc, t) => acc + t.completedFloors, 0);
  const activeSlabs = towers.reduce((acc, t) => acc + t.activeFloors, 0);
  const delayedSlabs = towers.reduce((acc, t) => acc + t.delayedFloors, 0);
  const pendingSlabs = Math.max(0, totalSlabs - castSlabs - activeSlabs);

  const castPercent = totalSlabs > 0 ? Math.round((castSlabs / totalSlabs) * 100) : 0;
  const activePercent = totalSlabs > 0 ? Math.round((activeSlabs / totalSlabs) * 100) : 0;

  const towerList = towers.map(t => {
    const proj = PROJECTS.find(p => p.id === t.projectId);
    return {
      towerId: t.id,
      towerName: t.name,
      projectId: t.projectId,
      projectName: proj?.name || '',
      city: proj?.city || '',
      totalFloors: t.totalFloors,
      completedFloors: t.completedFloors,
      activeFloors: t.activeFloors,
      delayedFloors: t.delayedFloors,
      currentStage: t.currentStage,
      status: t.status,
    };
  });

  return {
    totalSlabs,
    castSlabs,
    activeSlabs,
    delayedSlabs,
    pendingSlabs,
    castPercent,
    activePercent,
    towers: towerList,
  };
}

