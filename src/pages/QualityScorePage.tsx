// ============================================================
// BOMBAYDC — EXECUTIVE QUALITY DASHBOARD (PILLAR 3)
// Fully Redesigned for CEO / CXO Decision Making
// 
// Hierarchy:
// 1. Compact Page Header & Filter Row (All locations, All projects, Q3 FY25 default)
// 2. Section 1: Portfolio Quality Summary KPI Strip (4 restrained metrics with tooltips)
// 3. Section 2: Project Quality Overview (Centerpiece! Worst scores first, sortable)
// 4. Section 3: Priority Findings ("Needs attention" - 3 to 5 urgent findings with photo proof)
// 5. Section 4: Quality Trends (6-month line chart 0–100, target line, interpretation)
// 6. Section 5: Audit Summary and Recent History (Internal/External summary + table)
// 7. Interactive Drawers: Project Quality Detail Drawer & Issue Detail Drawer
// ============================================================

import React, { useState, useMemo, useEffect } from 'react';
import {
  Award, Shield, ArrowRight, Check, Info, ChevronDown,
  Building2, Search, AlertTriangle, CheckCircle2, ShieldAlert,
  Clock, TrendingUp, TrendingDown, MapPin, Camera, ExternalLink,
  ChevronLeft, ChevronRight, X, ArrowUpRight, Filter, RotateCcw,
  SlidersHorizontal, UserCheck, Calendar, FileText, ChevronUp, AlertOctagon, CheckSquare
} from 'lucide-react';
import clsx from 'clsx';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { useApp } from '../store/appStore';
import {
  calcQualityScore, getRAGStatus, getAllProjectMetrics, isProjectInCity, type ProjectMetrics
} from '../data/calculations';
import {
  PROJECTS, AUDIT_RECORDS, CONTRACTORS, type Audit, type ScoreWeights,
  type Project, type NC
} from '../data/seedData';

// ── Locality & City Mappings ────────────────────────────────
const LOCALITY_MAP: Record<string, string> = {
  P001: 'Worli, Mumbai',
  P002: 'Hebbal, Bengaluru',
  P003: 'Kalyani Nagar, Pune',
  P004: 'Golf Course Rd, Gurugram',
  P005: 'CBD Belapur, Navi Mumbai',
  P006: 'Gachibowli, Hyderabad',
  P007: 'Ghodbunder, Thane',
};

const CITIES = ['All Locations', 'Mumbai', 'Thane', 'Navi Mumbai', 'Pune', 'Bengaluru', 'Gurugram', 'Hyderabad'];

const REPORTING_PERIODS = [
  'Q3 FY25 (Oct–Dec 2025)',
  'Q2 FY25 (Jul–Sep 2025)',
  'Q1 FY25 (Apr–Jun 2025)',
  'FY 24–25 (Annual)'
];

// ── Defect Previews for Urgent Findings ───────────────────────
interface DefectPreview {
  image: string;
  title: string;
  statement: string;
  ncId: string;
  severity: 'Critical' | 'Major';
  timestamp: string;
}

const DEFECT_PREVIEWS: Record<string, DefectPreview> = {
  P004: {
    image: '/defects/nc-0001-cube-fail.jpg',
    title: 'Floor 05 Stop-Work Hold (Cube Compression Fail)',
    statement: 'M35 RMC batch failing 28-day cube compression test (18.2 MPa vs 35 MPa req). Concrete re-coring and structural integrity review active.',
    ncId: 'NC-0001',
    severity: 'Critical',
    timestamp: '14 Oct 2025 · Mobile Upload',
  },
  P001: {
    image: '/defects/nc-0002-honeycombing.jpg',
    title: 'Shear Wall Honeycombing (Vibrator Under-Compaction)',
    statement: 'Surface honeycombing on shear wall junction post formwork stripping. Grouting rectification in progress.',
    ncId: 'NC-0003',
    severity: 'Major',
    timestamp: '12 Oct 2025 · Mobile Upload',
  },
  P002: {
    image: '/defects/nc-0006-rebar-spacing.jpg',
    title: 'Column Tie Stirrup Spacing Non-Compliance',
    statement: 'Column tie stirrup spacing 220mm against 150mm structural drawing. Re-tying required before casting.',
    ncId: 'NC-0006',
    severity: 'Major',
    timestamp: '10 Oct 2025 · Mobile Upload',
  },
};

// ── 6-Month Quality Score Trajectory Series ───────────────────
interface TrendDataPoint {
  month: string;
  portfolio: number;
  target: number;
  mumbai?: number;
  gurugram?: number;
  bengaluru?: number;
  pune?: number;
  projectScore?: number;
}

const HISTORICAL_TRENDS: TrendDataPoint[] = [
  { month: 'Apr', portfolio: 80, target: 85, mumbai: 82, gurugram: 70, bengaluru: 84, pune: 78 },
  { month: 'May', portfolio: 82, target: 85, mumbai: 80, gurugram: 66, bengaluru: 85, pune: 75 },
  { month: 'Jun', portfolio: 85, target: 85, mumbai: 78, gurugram: 61, bengaluru: 83, pune: 72 },
  { month: 'Jul', portfolio: 78, target: 85, mumbai: 75, gurugram: 55, bengaluru: 86, pune: 70 },
  { month: 'Aug', portfolio: 74, target: 85, mumbai: 72, gurugram: 49, bengaluru: 85, pune: 67 },
  { month: 'Sep', portfolio: 72, target: 85, mumbai: 68, gurugram: 42, bengaluru: 84, pune: 63 },
];

const PROJECT_TREND_DATA: Record<string, number[]> = {
  P001: [82, 80, 78, 75, 72, 68],
  P002: [84, 85, 83, 86, 85, 84],
  P003: [78, 75, 72, 70, 67, 63],
  P004: [70, 66, 61, 55, 49, 42],
  P005: [85, 86, 88, 87, 89, 91],
  P006: [74, 72, 73, 70, 68, 65],
  P007: [77, 78, 76, 77, 79, 78],
};

interface QualityScorePageProps {
  selectedCity?: string;
  selectedProjectId?: string;
  onCityChange?: (city: string) => void;
  onProjectChange?: (projectId: string) => void;
  onNavigateToTab?: (tab: 'audits' | 'defects' | 'wirs') => void;
}

type SortField = 'score' | 'wir' | 'nc' | 'overdue' | 'audit' | 'name';
type SortDirection = 'asc' | 'desc';

export function QualityScorePage({
  selectedCity = 'All Locations',
  selectedProjectId = 'ALL',
  onCityChange,
  onProjectChange,
  onNavigateToTab,
}: QualityScorePageProps) {
  const { state, setTab, selectProject, selectAudit, setWeightsModalOpen } = useApp();

  // Reporting period state
  const [selectedPeriod, setSelectedPeriod] = useState<string>(REPORTING_PERIODS[0]);

  // Table sorting (Default: worst score first, as required by Section 9!)
  const [sortField, setSortField] = useState<SortField>('score');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Trend chart mode
  const [trendMode, setTrendMode] = useState<'portfolio' | 'project' | 'regional'>('portfolio');

  // Audit Type Filter state for Section 5
  const [auditTypeFilter, setAuditTypeFilter] = useState<'All' | 'Internal' | 'External'>('All');

  // Dynamic sync: when selectedProjectId or selectedCity changes, automatically adapt trendMode
  useEffect(() => {
    if (selectedProjectId !== 'ALL') {
      setTrendMode('project');
    } else if (selectedCity !== 'All Locations') {
      setTrendMode('regional');
    } else {
      setTrendMode('portfolio');
    }
  }, [selectedProjectId, selectedCity]);

  // Drawer states
  const [selectedDrawerProject, setSelectedDrawerProject] = useState<Project | null>(null);
  const [selectedDrawerNC, setSelectedDrawerNC] = useState<NC | null>(null);

  // Score tooltip popup state
  const [showScoreInfo, setShowScoreInfo] = useState(false);

  // Available projects based on selected city (supports Mumbai MMR, etc.)
  const availableProjects = useMemo(() => {
    return PROJECTS.filter(p => isProjectInCity(p.city, selectedCity));
  }, [selectedCity]);

  // All metrics across portfolio
  const allMetrics = useMemo(
    () => getAllProjectMetrics(state.weights, state.wirs, state.ncs),
    [state.weights, state.wirs, state.ncs]
  );

  // Filtered metrics based on active selections
  const filteredMetrics = useMemo(() => {
    return allMetrics.filter(m => {
      if (!isProjectInCity(m.project.city, selectedCity)) return false;
      if (selectedProjectId !== 'ALL' && m.project.id !== selectedProjectId) {
        return false;
      }
      return true;
    });
  }, [allMetrics, selectedCity, selectedProjectId]);

  // Sorted metrics for the Project Quality Table
  const sortedMetrics = useMemo(() => {
    return [...filteredMetrics].sort((a, b) => {
      let diff = 0;
      if (sortField === 'score') {
        diff = a.qualityScore - b.qualityScore;
      } else if (sortField === 'wir') {
        diff = a.wirPassRate - b.wirPassRate;
      } else if (sortField === 'nc') {
        diff = a.openNCs - b.openNCs;
      } else if (sortField === 'overdue') {
        const overdueA = a.overdueWIRs + (a.criticalOpenNCs > 0 ? 1 : 0);
        const overdueB = b.overdueWIRs + (b.criticalOpenNCs > 0 ? 1 : 0);
        diff = overdueA - overdueB;
      } else if (sortField === 'audit') {
        const scoreA = a.latestAudit?.percentageScore ?? 0;
        const scoreB = b.latestAudit?.percentageScore ?? 0;
        diff = scoreA - scoreB;
      } else if (sortField === 'name') {
        diff = a.project.name.localeCompare(b.project.name);
      }
      return sortDirection === 'asc' ? diff : -diff;
    });
  }, [filteredMetrics, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      // For score, ascending = worst first (default). For others, descending usually highlights highest.
      setSortDirection(field === 'score' ? 'asc' : 'desc');
    }
  };

  // Section 1: KPI Summary Data
  const summaryKPIs = useMemo(() => {
    const metricsToUse = filteredMetrics.length > 0 ? filteredMetrics : allMetrics;
    const avgScore = Math.round(metricsToUse.reduce((acc, m) => acc + m.qualityScore, 0) / metricsToUse.length);
    const avgWIR = Math.round(metricsToUse.reduce((acc, m) => acc + m.wirPassRate, 0) / metricsToUse.length);
    
    // Project IDs in current scope
    const projectIds = new Set(metricsToUse.map(m => m.project.id));
    
    // Open NCs in current scope
    const openNCsList = state.ncs.filter(n => projectIds.has(n.projectId) && n.status !== 'Closed');
    const totalOpenNCs = openNCsList.length;
    const criticalOpenNCs = openNCsList.filter(n => n.severity === 'Critical').length;
    
    // Overdue Corrective Actions (age > 7 days or past due date)
    const overdueCAs = openNCsList.filter(n => n.age > 7 || new Date(n.dueDate) < new Date('2025-10-15')).length;
    const criticalOverdueCAs = openNCsList.filter(n => (n.age > 7 || new Date(n.dueDate) < new Date('2025-10-15')) && n.severity === 'Critical').length;

    // Status label
    let statusLabel = 'On track';
    let statusColor = 'text-[#18845B] bg-[#18845B]/10';
    if (avgScore < 60 || criticalOpenNCs > 0) {
      statusLabel = 'Critical';
      statusColor = 'text-[#D92D20] bg-[#D92D20]/10';
    } else if (avgScore < 80) {
      statusLabel = 'Needs attention';
      statusColor = 'text-[#B7791F] bg-[#B7791F]/10';
    }

    return {
      qualityScore: avgScore,
      scoreDelta: -4, // vs Q2
      statusLabel,
      statusColor,
      wirPassRate: avgWIR,
      wirDelta: -4, // vs 85 target
      totalOpenNCs,
      criticalOpenNCs,
      overdueCAs,
      criticalOverdueCAs,
    };
  }, [filteredMetrics, allMetrics, state.ncs]);

  // Section 3: Priority Findings ("Needs attention" - 4 urgent items)
  const priorityFindings = useMemo(() => {
    // Collect active issues matching current project/city filter
    const activeProjectIds = new Set(filteredMetrics.map(m => m.project.id));
    const activeNCs = state.ncs.filter(n => activeProjectIds.has(n.projectId) && n.status !== 'Closed');

    // Priority sort: Critical first, then longest open age
    const sorted = [...activeNCs].sort((a, b) => {
      const sevRank = { Critical: 0, High: 1, Medium: 2, Low: 3 };
      if (sevRank[a.severity] !== sevRank[b.severity]) {
        return sevRank[a.severity] - sevRank[b.severity];
      }
      return b.age - a.age;
    });

    return sorted;
  }, [filteredMetrics, state.ncs]);

  // Needs Attention Stack Navigation (3 per stack with right/left arrows)
  const [needsAttentionStackIndex, setNeedsAttentionStackIndex] = useState(0);
  const needsAttentionPerStack = 3;
  const totalNeedsAttentionStacks = Math.max(1, Math.ceil(priorityFindings.length / needsAttentionPerStack));
  const currentNeedsAttentionStack = useMemo(() => {
    const start = needsAttentionStackIndex * needsAttentionPerStack;
    return priorityFindings.slice(start, start + needsAttentionPerStack);
  }, [priorityFindings, needsAttentionStackIndex]);

  useEffect(() => {
    setNeedsAttentionStackIndex(0);
  }, [selectedProjectId, selectedCity]);

  // Section 4: Chart Series Data
  const chartData = useMemo(() => {
    return HISTORICAL_TRENDS.map((pt, idx) => {
      const item: any = {
        month: pt.month,
        target: 85,
        portfolio: pt.portfolio,
      };

      if (trendMode === 'project') {
        const activeProjId = selectedProjectId !== 'ALL' ? selectedProjectId : 'P004'; // Default Riverstone if ALL
        item.projectScore = PROJECT_TREND_DATA[activeProjId] ? PROJECT_TREND_DATA[activeProjId][idx] : pt.portfolio;
        item.projectName = PROJECTS.find(p => p.id === activeProjId)?.name || 'Project';
      } else if (trendMode === 'regional') {
        item.mumbai = pt.mumbai;
        item.gurugram = pt.gurugram;
        item.bengaluru = pt.bengaluru;
        item.pune = pt.pune;
      }
      return item;
    });
  }, [trendMode, selectedProjectId]);

  const activeProjectScore = useMemo(() => {
    const activeProjId = selectedProjectId !== 'ALL' ? selectedProjectId : 'P004';
    const m = filteredMetrics.find(metric => metric.project.id === activeProjId);
    return m ? m.qualityScore : 78;
  }, [selectedProjectId, filteredMetrics]);

  const activeProjectObj = useMemo(() => {
    if (selectedProjectId === 'ALL') return null;
    return PROJECTS.find(p => p.id === selectedProjectId) || null;
  }, [selectedProjectId]);

  const projectStrokeColor = activeProjectScore >= 85 ? '#18845B' : activeProjectScore >= 70 ? '#B7791F' : '#D92D20';

  const dynamicInterpretationNote = useMemo(() => {
    if (selectedProjectId !== 'ALL' && activeProjectObj) {
      if (selectedProjectId === 'P004') {
        return `Riverstone quality score dropped to 58 (-14 pts) due to Floor 05 cube test failure (18.4 MPa vs 30 MPa target) and active stop-work hold.`;
      }
      if (selectedProjectId === 'P001') {
        return `Meridian Heights scored 81 pts; 3 active shear wall honeycombing NCs under polymer mortar repair.`;
      }
      if (selectedProjectId === 'P003') {
        return `Cedar Park leads the portfolio at 89 pts with 100% inspection pass rate and zero high-severity holds.`;
      }
      if (selectedProjectId === 'P002') {
        return `Northgate stands at 84 pts, maintaining steady trajectory across substructure foundation packages.`;
      }
      if (selectedProjectId === 'P005') {
        return `Harbour Point scored 83 pts with satisfactory MEP pre-installation inspections.`;
      }
      if (selectedProjectId === 'P006') {
        return `Summit Greens achieved 87 pts with consistent third-party structural audit clearance.`;
      }
      if (selectedProjectId === 'P007') {
        return `Elysium Reserve scored 88 pts, on track with pre-cast slab certifications.`;
      }
      return `${activeProjectObj.name} quality score stands at ${activeProjectScore} pts. Tracking against 85 benchmark.`;
    }

    if (selectedCity !== 'All Locations') {
      return `${selectedCity} regional quality trajectory reflecting local contractor audit compliance against the 85 benchmark.`;
    }

    return `Score dropped from 85 to 72 (-13 pts), driven by Riverstone Floor 05 cube compression failure and Meridian Heights shear wall honeycombing.`;
  }, [selectedProjectId, selectedCity, activeProjectObj, activeProjectScore]);

  // Section 5: Audit Summary Data
  const auditSummary = useMemo(() => {
    const activeProjectIds = new Set(filteredMetrics.map(m => m.project.id));
    let matchingAudits = AUDIT_RECORDS.filter(a => activeProjectIds.has(a.projectId));
    if (auditTypeFilter !== 'All') {
      matchingAudits = matchingAudits.filter(a => a.type === auditTypeFilter);
    }
    const completedAudits = matchingAudits.filter(a => a.status === 'Completed');
    
    const internalAudits = matchingAudits.filter(a => a.type === 'Internal' && a.status === 'Completed');
    const externalAudits = matchingAudits.filter(a => a.type === 'External' && a.status === 'Completed');

    const internalScore = internalAudits.length > 0
      ? Math.round(internalAudits.reduce((acc, a) => acc + a.percentageScore, 0) / internalAudits.length)
      : 78;

    const externalScore = externalAudits.length > 0
      ? Math.round(externalAudits.reduce((acc, a) => acc + a.percentageScore, 0) / externalAudits.length)
      : 88;

    const latestAuditDate = completedAudits[0]?.auditDate || (matchingAudits[0]?.auditDate || '15 Sep 2025');
    const openFindings = matchingAudits.reduce((acc, a) => acc + a.findingsRaised, 0);
    const overdueCAs = matchingAudits.reduce((acc, a) => acc + a.outstandingCAs, 0);

    const recentRecords = matchingAudits.slice(0, 6);

    return {
      internalScore,
      externalScore,
      latestAuditDate,
      openFindings,
      overdueCAs,
      recentRecords,
      totalCount: matchingAudits.length,
    };
  }, [filteredMetrics, auditTypeFilter]);

  // Reset Filters to Portfolio View
  const handleResetFilters = () => {
    if (onCityChange) onCityChange('All Locations');
    if (onProjectChange) onProjectChange('ALL');
    setSelectedPeriod(REPORTING_PERIODS[0]);
  };

  const isFiltered = selectedCity !== 'All Locations' || selectedProjectId !== 'ALL';

  return (
    <div className="space-y-4 pb-12 animate-in fade-in duration-150">
      {/* ============================================================
          PAGE HEADER & 2 SIDE-BY-SIDE DROPDOWNS: Location & Project
          Matching Commercial & WIP Pages layout & padding
          ============================================================ */}
      <div className="bg-white border border-[#E6E9ED] rounded-xl p-4 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#F1F5F9]">
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold text-[#17191D] uppercase tracking-wider">
              Quality Assurance & Executive Governance
            </h1>
            <span className="text-xs text-[#6B7280]">
              · {selectedCity} · {selectedProjectId === 'ALL' ? `All ${availableProjects.length} Projects` : PROJECTS.find(p => p.id === selectedProjectId)?.name}
            </span>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
            {/* Reporting Period */}
            <div className="flex items-center gap-1.5 h-8.5 px-2.5 bg-[#F6F7F8] border border-[#E6E9ED] rounded-lg text-xs">
              <Calendar size={13} className="text-[#6B7280]" />
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="bg-transparent text-xs font-semibold text-[#17191D] focus:outline-hidden cursor-pointer"
              >
                {REPORTING_PERIODS.map(rp => (
                  <option key={rp} value={rp}>{rp}</option>
                ))}
              </select>
            </div>

            {/* Weights Shortcut */}
            <button
              onClick={() => setWeightsModalOpen(true)}
              className="flex items-center gap-1.5 h-8.5 px-2.5 rounded-lg border border-[#E6E9ED] hover:bg-slate-50 text-xs font-medium text-[#17191D] transition-colors shadow-2xs"
              title="Configure Quality Score Weights (40% WIR, 35% NC, 25% Audit)"
            >
              <SlidersHorizontal size={13} className="text-[#006B5B]" />
              <span>Weights</span>
            </button>

            {/* Reset Filters */}
            {isFiltered && (
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-1 h-8.5 px-2.5 rounded-lg text-xs font-medium text-[#6B7280] hover:text-[#17191D] hover:bg-[#F1F3F5] transition-colors"
              >
                <RotateCcw size={12} />
                <span>Reset</span>
              </button>
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
                onChange={(e) => onCityChange && onCityChange(e.target.value)}
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
                onChange={(e) => onProjectChange && onProjectChange(e.target.value)}
                className="h-10 w-full pl-9 pr-8 bg-white border border-slate-300 rounded-lg text-xs font-bold text-[#17191D] focus:outline-none focus:border-[#1E3A8A] shadow-2xs appearance-none cursor-pointer"
              >
                <option value="ALL">All Projects ({availableProjects.length})</option>
                {availableProjects.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({LOCALITY_MAP[p.id] || p.city})
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================
          SECTION ONE — TOP 4 QUALITY SUMMARY KPIS
          Identical card style, p-4 padding & min-h-[145px] as other pages
          ============================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* KPI 1: Quality Health Score */}
        <div className="bg-white border border-[#E6E9ED] rounded-xl p-4 shadow-2xs flex flex-col justify-between min-h-[145px] hover:border-slate-300 transition-colors group">
          <div>
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
              <span className="truncate">Quality Health Score</span>
              <div className="relative">
                <button
                  onClick={() => setShowScoreInfo(!showScoreInfo)}
                  className="text-[#8B93A1] hover:text-[#17191D] transition-colors p-0.5 rounded-sm"
                  title="View Quality Score Calculation"
                >
                  <Info size={14} />
                </button>
                {showScoreInfo && (
                  <div className="absolute right-0 top-6 z-30 w-64 p-3 bg-[#17191D] text-white rounded-lg shadow-xl text-[11px] leading-relaxed">
                    <div className="font-semibold mb-1 text-slate-200">Quality Score Formula:</div>
                    <div className="space-y-1 text-slate-300">
                      <div>• 40% First-pass WIR Pass Rate</div>
                      <div>• 35% Non-Compliance Closure Health</div>
                      <div>• 25% Latest Internal/External Audit</div>
                    </div>
                    <div className="mt-2 pt-2 border-t border-slate-700 flex justify-between items-center">
                      <span className="text-slate-400">Scale: 0–100 pts</span>
                      <button
                        onClick={() => { setShowScoreInfo(false); setWeightsModalOpen(true); }}
                        className="text-teal-300 hover:underline"
                      >
                        Adjust weights
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-2 flex items-baseline gap-1.5 flex-wrap">
              <span className={clsx(
                'text-2xl sm:text-3xl font-black tracking-tight tabular-nums',
                summaryKPIs.qualityScore >= 80 ? 'text-[#18845B]' : summaryKPIs.qualityScore >= 60 ? 'text-[#B7791F]' : 'text-[#D92D20]'
              )}>
                {summaryKPIs.qualityScore}
              </span>
              <span className="text-xs font-bold text-[#6B7280]">/ 100</span>
            </div>

            <div className="text-xs text-[#6B7280] mt-1.5 font-medium flex items-center gap-1.5">
              <span className={clsx(
                'w-2 h-2 rounded-full shrink-0',
                summaryKPIs.qualityScore >= 80 ? 'bg-[#18845B]' : summaryKPIs.qualityScore >= 60 ? 'bg-[#B7791F]' : 'bg-[#D92D20]'
              )} />
              <span className="text-[#17191D] font-bold truncate">
                {summaryKPIs.statusLabel} (Weighted Index)
              </span>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-[#F1F5F9] flex items-center justify-between text-[11px] text-[#6B7280] font-medium">
            <span className="flex items-center gap-1 text-[#D92D20] font-semibold tabular-nums shrink-0">
              <TrendingDown size={13} />
              <span>{Math.abs(summaryKPIs.scoreDelta)} pts vs Q2</span>
            </span>
            <button
              onClick={() => setWeightsModalOpen(true)}
              className="text-[#006B5B] font-bold hover:underline shrink-0"
            >
              Weights →
            </button>
          </div>
        </div>

        {/* KPI 2: First-pass WIR rate */}
        <div
          onClick={() => onNavigateToTab && onNavigateToTab('wirs')}
          className="bg-white border border-[#E6E9ED] rounded-xl p-4 shadow-2xs flex flex-col justify-between min-h-[145px] hover:border-slate-300 transition-colors group cursor-pointer text-left"
        >
          <div>
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
              <span className="truncate group-hover:text-[#006B5B] transition-colors">First-Pass WIR Rate</span>
              <ArrowUpRight size={13} className="text-[#006B5B] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
            </div>

            <div className="mt-2 flex items-baseline gap-1.5 flex-wrap">
              <span className="text-2xl sm:text-3xl font-black text-[#006B5B] tracking-tight tabular-nums">
                {summaryKPIs.wirPassRate}%
              </span>
              <span className="text-xs font-bold text-[#6B7280]">clearance rate</span>
            </div>

            <div className="text-xs text-[#6B7280] mt-1.5 font-medium leading-normal truncate">
              Target: <strong className="text-[#17191D]">85%</strong> · 1st-pass site approval
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-[#F1F5F9] flex items-center justify-between text-[11px] text-[#6B7280] font-medium">
            <span className="text-[#D92D20] font-semibold tabular-nums shrink-0">-4% vs target</span>
            <span className="text-[#006B5B] font-bold shrink-0">View WIRs →</span>
          </div>
        </div>

        {/* KPI 3: Open Non-Compliances */}
        <div
          onClick={() => onNavigateToTab && onNavigateToTab('defects')}
          className="bg-white border border-[#E6E9ED] rounded-xl p-4 shadow-2xs flex flex-col justify-between min-h-[145px] hover:border-slate-300 transition-colors group cursor-pointer text-left"
        >
          <div>
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
              <span className="truncate group-hover:text-[#D92D20] transition-colors">Open Non-Compliances</span>
              <ArrowUpRight size={13} className="text-[#D92D20] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
            </div>

            <div className="mt-2 flex items-baseline gap-1.5 flex-wrap">
              <span className="text-2xl sm:text-3xl font-black text-[#17191D] tracking-tight tabular-nums">
                {summaryKPIs.totalOpenNCs}
              </span>
              <span className="text-xs font-bold text-[#6B7280]">active defects</span>
            </div>

            <div className="text-xs text-[#6B7280] mt-1.5 font-medium leading-normal truncate">
              <strong className="text-[#D92D20]">{summaryKPIs.criticalOpenNCs} critical holds</strong>
              <span> · {summaryKPIs.totalOpenNCs - summaryKPIs.criticalOpenNCs} moderate</span>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-[#F1F5F9] flex items-center justify-between text-[11px] text-[#6B7280] font-medium">
            <span className={clsx(
              'font-semibold tabular-nums shrink-0',
              summaryKPIs.criticalOpenNCs > 0 ? 'text-[#D92D20]' : 'text-[#18845B]'
            )}>
              {summaryKPIs.criticalOpenNCs > 0 ? `${summaryKPIs.criticalOpenNCs} Blocking Pours` : '0 Blocking Pours'}
            </span>
            <span className="text-[#D92D20] font-bold shrink-0">Inspect NCs →</span>
          </div>
        </div>

        {/* KPI 4: Overdue Corrective Actions */}
        <div
          onClick={() => onNavigateToTab && onNavigateToTab('defects')}
          className="bg-white border border-[#E6E9ED] rounded-xl p-4 shadow-2xs flex flex-col justify-between min-h-[145px] hover:border-slate-300 transition-colors group cursor-pointer text-left"
        >
          <div>
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
              <span className="truncate group-hover:text-[#B7791F] transition-colors">Overdue Beyond SLA</span>
              <ArrowUpRight size={13} className="text-[#B7791F] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
            </div>

            <div className="mt-2 flex items-baseline gap-1.5 flex-wrap">
              <span className="text-2xl sm:text-3xl font-black text-[#B7791F] tracking-tight tabular-nums">
                {summaryKPIs.overdueCAs}
              </span>
              <span className="text-xs font-bold text-[#6B7280]">overdue actions</span>
            </div>

            <div className="text-xs text-[#6B7280] mt-1.5 font-medium leading-normal truncate">
              Past resolution SLA · Escalated to PM
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-[#F1F5F9] flex items-center justify-between text-[11px] text-[#6B7280] font-medium">
            <span className="text-[#B7791F] font-semibold tabular-nums shrink-0">
              {summaryKPIs.criticalOverdueCAs > 0 ? `${summaryKPIs.criticalOverdueCAs} Critical SLA` : 'Normal Turnaround'}
            </span>
            <span className="text-[#B7791F] font-bold shrink-0">View Overdue →</span>
          </div>
        </div>
      </div>

      {/* ============================================================
          SECTION TWO — 2-COLUMN ROW: PROJECT QUALITY (LEFT) + QUALITY TRENDS (RIGHT)
          ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* LEFT COLUMN: PROJECT QUALITY OVERVIEW TABLE (7 COLS) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-[#E6E9ED] shadow-2xs flex flex-col justify-between overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-[#E6E9ED] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-bold text-[#17191D] uppercase tracking-wider">Project quality</h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 tabular-nums">
                  {sortedMetrics.length} Projects
                </span>
              </div>
              <p className="text-[11px] text-[#6B7280] mt-0.5">
                Compare performance across portfolio · Sorted by lowest Quality Score first
              </p>
            </div>

            <div className="text-[11px] text-[#8B93A1] flex items-center gap-1.5 shrink-0">
              <span>Click row to inspect</span>
            </div>
          </div>

          {/* Project Quality Table */}
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#F8F9FA] border-b border-[#E6E9ED] text-[#6B7280] font-semibold">
                  <th
                    onClick={() => handleSort('name')}
                    className="py-3 px-3.5 cursor-pointer hover:text-[#17191D] select-none whitespace-nowrap"
                  >
                    <div className="flex items-center gap-1">
                      <span>Project</span>
                      {sortField === 'name' && (sortDirection === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('score')}
                    className="py-3 px-3.5 cursor-pointer hover:text-[#17191D] select-none whitespace-nowrap"
                  >
                    <div className="flex items-center gap-1">
                      <span>Score</span>
                      {sortField === 'score' && (sortDirection === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('wir')}
                    className="py-3 px-3.5 cursor-pointer hover:text-[#17191D] select-none whitespace-nowrap"
                  >
                    <div className="flex items-center gap-1">
                      <span>1st-Pass</span>
                      {sortField === 'wir' && (sortDirection === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('nc')}
                    className="py-3 px-3.5 cursor-pointer hover:text-[#17191D] select-none whitespace-nowrap"
                  >
                    <div className="flex items-center gap-1">
                      <span>Open NCs</span>
                      {sortField === 'nc' && (sortDirection === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('overdue')}
                    className="py-3 px-3.5 cursor-pointer hover:text-[#17191D] select-none whitespace-nowrap"
                  >
                    <div className="flex items-center gap-1">
                      <span>Overdue</span>
                      {sortField === 'overdue' && (sortDirection === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('audit')}
                    className="py-3 px-3.5 cursor-pointer hover:text-[#17191D] select-none whitespace-nowrap"
                  >
                    <div className="flex items-center gap-1">
                      <span>Audit</span>
                      {sortField === 'audit' && (sortDirection === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
                    </div>
                  </th>
                  <th className="py-3 px-3.5 text-right whitespace-nowrap">Status</th>
                  <th className="py-3 px-2 text-center w-8"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6E9ED]">
                {sortedMetrics.map((m) => {
                  const ragColor = m.qualityScore < 60 ? '#D92D20' : m.qualityScore < 80 ? '#B7791F' : '#18845B';
                  const statusText = m.healthCategory === 'Critical' ? 'Critical' : m.healthCategory === 'At Risk' ? 'Attention' : 'On track';
                  const statusBadgeStyle = m.healthCategory === 'Critical'
                    ? 'bg-[#D92D20]/10 text-[#D92D20] border-[#D92D20]/20'
                    : m.healthCategory === 'At Risk'
                      ? 'bg-[#B7791F]/10 text-[#B7791F] border-[#B7791F]/20'
                      : 'bg-[#18845B]/10 text-[#18845B] border-[#18845B]/20';

                  return (
                    <tr
                      key={m.project.id}
                      onClick={() => setSelectedDrawerProject(m.project)}
                      className="hover:bg-[#F8F9FA] transition-colors cursor-pointer group"
                    >
                      {/* Project & City */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <div className="font-semibold text-[#17191D] group-hover:text-[#006B5B] transition-colors truncate max-w-[180px]" title={m.project.name}>
                          {m.project.name}
                        </div>
                        <div className="text-[10px] text-[#6B7280] flex items-center gap-1 mt-0.5 truncate max-w-[180px]">
                          <span>{LOCALITY_MAP[m.project.id]?.split(',')[0] || m.project.city}</span>
                          <span>·</span>
                          <span className="text-[#8B93A1]">{m.project.stage}</span>
                        </div>
                      </td>

                      {/* Quality Score + Progress Bar */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-[#17191D] tabular-nums">
                            {m.qualityScore}
                          </span>
                          <div className="w-10 h-1.5 bg-[#E6E9ED] rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{ width: `${m.qualityScore}%`, backgroundColor: ragColor }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* First-pass WIR */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <span className="font-semibold text-[#17191D] tabular-nums">
                          {m.wirPassRate}%
                        </span>
                      </td>

                      {/* Open NCs */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <span className="font-semibold text-[#17191D] tabular-nums">
                            {m.openNCs}
                          </span>
                          {m.criticalOpenNCs > 0 && (
                            <span className="px-1 py-0.2 rounded text-[9px] font-bold bg-[#D92D20] text-white">
                              {m.criticalOpenNCs}c
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Overdue Actions */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        {m.overdueWIRs > 0 || m.criticalOpenNCs > 0 ? (
                          <span className="font-semibold text-[#D92D20] tabular-nums">
                            {m.overdueWIRs + (m.criticalOpenNCs > 0 ? 1 : 0)}
                          </span>
                        ) : (
                          <span className="text-[#8B93A1] tabular-nums">0</span>
                        )}
                      </td>

                      {/* Latest Audit */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        {m.latestAudit ? (
                          <span className="font-semibold text-[#17191D] tabular-nums">{m.latestAudit.percentageScore}%</span>
                        ) : (
                          <span className="text-[#8B93A1]">—</span>
                        )}
                      </td>

                      {/* Status Pill */}
                      <td className="py-3 px-3.5 text-right whitespace-nowrap">
                        <span className={clsx('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border', statusBadgeStyle)}>
                          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: ragColor }} />
                          <span>{statusText}</span>
                        </span>
                      </td>

                      {/* Arrow action */}
                      <td className="py-3 px-2 text-center">
                        <ChevronRight size={13} className="text-[#8B93A1] group-hover:text-[#006B5B] transition-colors" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT COLUMN: QUALITY TRENDS GRAPH (5 COLS) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-[#E6E9ED] shadow-2xs p-4 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#F1F5F9]">
            <div>
              <h2 className="text-xs font-bold text-[#17191D] uppercase tracking-wider">Quality trends</h2>
              <p className="text-[11px] text-[#6B7280] mt-0.5">
                Quality Score trajectory over last 6 months (0–100 scale)
              </p>
            </div>

            {/* Mode Switcher */}
            <div className="flex items-center bg-[#F6F7F8] p-0.5 rounded-lg border border-[#E6E9ED]">
              <button
                onClick={() => setTrendMode('portfolio')}
                className={clsx(
                  'px-2 py-0.5 rounded text-[10px] font-semibold transition-all',
                  trendMode === 'portfolio' ? 'bg-white text-[#17191D] shadow-2xs' : 'text-[#6B7280] hover:text-[#17191D]'
                )}
              >
                Portfolio
              </button>
              <button
                onClick={() => setTrendMode('project')}
                className={clsx(
                  'px-2 py-0.5 rounded text-[10px] font-semibold transition-all',
                  trendMode === 'project' ? 'bg-white text-[#17191D] shadow-2xs' : 'text-[#6B7280] hover:text-[#17191D]'
                )}
              >
                Project
              </button>
              <button
                onClick={() => setTrendMode('regional')}
                className={clsx(
                  'px-2 py-0.5 rounded text-[10px] font-semibold transition-all',
                  trendMode === 'regional' ? 'bg-white text-[#17191D] shadow-2xs' : 'text-[#6B7280] hover:text-[#17191D]'
                )}
              >
                Regions
              </button>
            </div>
          </div>

          <div className="py-2">
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 15, left: -5, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F3F5" />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={{ stroke: '#E6E9ED' }}
                    tick={{ fontSize: 11, fill: '#6B7280' }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    ticks={[0, 20, 40, 60, 80, 100]}
                    width={32}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: '#8B93A1' }}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-[#17191D] text-white p-2.5 rounded-lg shadow-xl text-xs space-y-1">
                            <div className="font-bold text-slate-300">{label} 2025</div>
                            {payload.map((p: any) => (
                              <div key={p.name} className="flex items-center justify-between gap-4">
                                <span style={{ color: p.color }}>{p.name}:</span>
                                <span className="font-bold tabular-nums">{p.value} / 100</span>
                              </div>
                            ))}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <ReferenceLine
                    y={85}
                    stroke="#8B93A1"
                    strokeDasharray="4 4"
                    label={{ value: 'Target 85', fill: '#8B93A1', fontSize: 10, position: 'insideTopRight' }}
                  />

                  {trendMode === 'portfolio' && (
                    <Line
                      type="monotone"
                      dataKey="portfolio"
                      name="Portfolio Score"
                      stroke="#006B5B"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: '#006B5B', stroke: '#fff', strokeWidth: 2 }}
                      activeDot={{ r: 6 }}
                    />
                  )}

                  {trendMode === 'project' && (
                    <Line
                      type="monotone"
                      dataKey="projectScore"
                      name={chartData[0]?.projectName || 'Project Score'}
                      stroke={projectStrokeColor}
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: projectStrokeColor, stroke: '#fff', strokeWidth: 2 }}
                      activeDot={{ r: 6 }}
                    />
                  )}

                  {trendMode === 'regional' && (
                    <>
                      <Line type="monotone" dataKey="mumbai" name="Mumbai" stroke="#3168D8" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="gurugram" name="Gurugram" stroke="#D92D20" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="bengaluru" name="Bengaluru" stroke="#18845B" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="pune" name="Pune" stroke="#B7791F" strokeWidth={2} dot={false} />
                    </>
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Executive Interpretation Banner */}
            <div className="mt-2 p-2.5 bg-[#F8F9FA] rounded-lg border border-[#E6E9ED] flex items-start gap-2 text-xs text-[#17191D]">
              <Info size={14} className="text-[#006B5B] shrink-0 mt-0.5" />
              <span className="text-[#6B7280] text-[11px] leading-relaxed">
                <strong className="font-semibold text-[#17191D]">Note: </strong>
                {dynamicInterpretationNote}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================
          SECTION THREE — 5-CARD AUDIT ASSURANCE KPI STRIP
          Matching NCPage and WIRPage card style, p-4 padding & min-height
          ============================================================ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Card 1: Latest Internal Audit */}
        <div className="bg-white border border-[#E6E9ED] rounded-xl p-4 shadow-2xs flex flex-col justify-between min-h-[120px]">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280] block truncate">
              Latest Internal Audit
            </span>
            <div className="mt-2 flex items-baseline gap-1.5 flex-wrap">
              <span className="text-2xl sm:text-3xl font-black text-[#17191D] tracking-tight tabular-nums">
                {auditSummary.internalScore}%
              </span>
              <span className="text-xs font-bold text-[#6B7280]">score</span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-[#F1F5F9] flex items-center justify-between text-[11px] text-[#6B7280] font-medium">
            <span className="truncate">IS 456 Benchmark</span>
            <span className="text-[#18845B] font-bold shrink-0">Passed</span>
          </div>
        </div>

        {/* Card 2: Latest External Audit */}
        <div className="bg-white border border-[#E6E9ED] rounded-xl p-4 shadow-2xs flex flex-col justify-between min-h-[120px]">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280] block truncate">
              Latest External Audit
            </span>
            <div className="mt-2 flex items-baseline gap-1.5 flex-wrap">
              <span className="text-2xl sm:text-3xl font-black text-[#18845B] tracking-tight tabular-nums">
                {auditSummary.externalScore}%
              </span>
              <span className="text-xs font-bold text-[#6B7280]">certified</span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-[#F1F5F9] flex items-center justify-between text-[11px] text-[#6B7280] font-medium">
            <span className="truncate">TÜV SÜD & BV</span>
            <span className="text-[#18845B] font-bold shrink-0">Verified</span>
          </div>
        </div>

        {/* Card 3: Last Audit Conducted */}
        <div className="bg-white border border-[#E6E9ED] rounded-xl p-4 shadow-2xs flex flex-col justify-between min-h-[120px]">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280] block truncate">
              Last Audit Conducted
            </span>
            <div className="mt-2 flex items-baseline gap-1.5 flex-wrap">
              <span className="text-xl sm:text-2xl font-black text-[#17191D] tracking-tight whitespace-nowrap">
                {auditSummary.latestAuditDate}
              </span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-[#F1F5F9] flex items-center justify-between text-[11px] text-[#6B7280] font-medium">
            <span className="truncate">Schedule Cycle</span>
            <span className="text-[#006B5B] font-bold shrink-0">Q3 Active</span>
          </div>
        </div>

        {/* Card 4: Open Audit Findings */}
        <div className="bg-white border border-[#E6E9ED] rounded-xl p-4 shadow-2xs flex flex-col justify-between min-h-[120px]">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280] block truncate">
              Open Audit Findings
            </span>
            <div className="mt-2 flex items-baseline gap-1.5 flex-wrap">
              <span className="text-2xl sm:text-3xl font-black text-[#B7791F] tracking-tight tabular-nums">
                {auditSummary.openFindings}
              </span>
              <span className="text-xs font-bold text-[#6B7280]">findings</span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-[#F1F5F9] flex items-center justify-between text-[11px] text-[#6B7280] font-medium">
            <span className="truncate">Requiring Closure</span>
            <span className="text-[#B7791F] font-bold shrink-0">In Progress</span>
          </div>
        </div>

        {/* Card 5: Overdue CAs */}
        <div className="bg-white border border-[#E6E9ED] rounded-xl p-4 shadow-2xs flex flex-col justify-between min-h-[120px] col-span-2 sm:col-span-1">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280] block truncate">
              Overdue CAs
            </span>
            <div className="mt-2 flex items-baseline gap-1.5 flex-wrap">
              <span className="text-2xl sm:text-3xl font-black text-[#D92D20] tracking-tight tabular-nums">
                {auditSummary.overdueCAs}
              </span>
              <span className="text-xs font-bold text-[#6B7280]">escalated</span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-[#F1F5F9] flex items-center justify-between text-[11px] text-[#6B7280] font-medium">
            <span className="truncate">Escalated to Head</span>
            <span className="text-[#D92D20] font-bold shrink-0">Urgent</span>
          </div>
        </div>
      </div>

      {/* ============================================================
          SECTION FOUR — AUDIT SUMMARY AND HISTORY TABLE
          ============================================================ */}
      <div className="bg-white rounded-xl border border-[#E6E9ED] shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-[#E6E9ED] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-[#17191D]">Audit summary and history</h2>
            <p className="text-xs text-[#6B7280] mt-0.5">
              Internal governance & external third-party compliance verification
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Audit Type Filter Pills */}
            <div className="flex items-center gap-1 bg-[#F6F7F8] p-0.5 rounded-lg border border-[#E6E9ED]">
              {(['All', 'Internal', 'External'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setAuditTypeFilter(type)}
                  className={clsx(
                    'px-2.5 py-1 rounded text-xs font-semibold transition-all',
                    auditTypeFilter === type
                      ? 'bg-white text-[#17191D] shadow-2xs font-bold'
                      : 'text-[#6B7280] hover:text-[#17191D]'
                  )}
                >
                  {type === 'All' ? 'All Audits' : `${type} Audits`}
                </button>
              ))}
            </div>

            <button
              onClick={() => onNavigateToTab && onNavigateToTab('audits')}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#006B5B] hover:text-[#005245] transition-colors"
            >
              <span>View all audits ({AUDIT_RECORDS.length})</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>

        {/* Recent Audit Records Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#F8F9FA] border-b border-[#E6E9ED] text-[#6B7280] font-semibold">
                <th className="py-3 px-4 whitespace-nowrap">Audit ID</th>
                <th className="py-3 px-4 whitespace-nowrap">Project</th>
                <th className="py-3 px-4 whitespace-nowrap">Audit Type</th>
                <th className="py-3 px-4 whitespace-nowrap">Date</th>
                <th className="py-3 px-4 whitespace-nowrap">Score</th>
                <th className="py-3 px-4 whitespace-nowrap">Findings</th>
                <th className="py-3 px-4 whitespace-nowrap">Open CAs</th>
                <th className="py-3 px-4 whitespace-nowrap">Auditor</th>
                <th className="py-3 px-3 text-center w-8"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6E9ED]">
              {auditSummary.recentRecords.map(a => {
                const project = PROJECTS.find(p => p.id === a.projectId);
                return (
                  <tr
                    key={a.id}
                    onClick={() => selectAudit(a.id)}
                    className="hover:bg-[#F8F9FA] transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-4 font-mono font-semibold text-[#17191D] whitespace-nowrap group-hover:text-[#006B5B] transition-colors">
                      {a.id}
                    </td>
                    <td className="py-3 px-4 font-medium text-[#17191D] whitespace-nowrap">
                      {project?.name}
                      <span className="text-[11px] text-[#8B93A1] ml-1.5">({project?.city})</span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={clsx(
                        'px-2 py-0.5 rounded-full text-[10px] font-semibold',
                        a.type === 'External' ? 'bg-[#3168D8]/10 text-[#3168D8]' : 'bg-slate-100 text-slate-700'
                      )}>
                        {a.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#6B7280] tabular-nums whitespace-nowrap">{a.auditDate}</td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={clsx(
                        'font-bold tabular-nums',
                        a.percentageScore < 60 ? 'text-[#D92D20]' : a.percentageScore < 80 ? 'text-[#B7791F]' : 'text-[#18845B]'
                      )}>
                        {a.percentageScore}%
                      </span>
                    </td>
                    <td className="py-3 px-4 tabular-nums text-[#17191D] whitespace-nowrap">{a.findingsRaised}</td>
                    <td className="py-3 px-4 tabular-nums whitespace-nowrap">
                      {a.outstandingCAs > 0 ? (
                        <span className="font-semibold text-[#D92D20]">{a.outstandingCAs}</span>
                      ) : (
                        <span className="text-[#18845B]">0</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-[#6B7280] whitespace-nowrap">{a.auditor}</td>
                    <td className="py-3 px-3 text-center">
                      <ChevronRight size={13} className="text-[#8B93A1] group-hover:text-[#006B5B] transition-colors" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============================================================
          INTERACTIVE DRAWER: PROJECT QUALITY DETAIL (SECTION 9)
          ============================================================ */}
      {selectedDrawerProject && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-2xs flex justify-end animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col justify-between border-l border-[#E6E9ED] animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="p-5 border-b border-[#E6E9ED] flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-[#17191D]">{selectedDrawerProject.name}</h3>
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                    {selectedDrawerProject.stage}
                  </span>
                </div>
                <p className="text-xs text-[#6B7280] mt-0.5">
                  {LOCALITY_MAP[selectedDrawerProject.id] || selectedDrawerProject.city} · PM: {selectedDrawerProject.projectManager}
                </p>
              </div>
              <button
                onClick={() => setSelectedDrawerProject(null)}
                className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#17191D] hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {/* Score breakdown card */}
              {(() => {
                const metric = allMetrics.find(m => m.project.id === selectedDrawerProject.id);
                if (!metric) return null;
                const breakdown = metric.breakdown;

                return (
                  <div className="space-y-4">
                    <div className="p-4 bg-[#F8F9FA] rounded-xl border border-[#E6E9ED]">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-[#6B7280]">Overall Quality Score</span>
                        <span className={clsx(
                          'px-2 py-0.5 rounded-full text-xs font-bold',
                          metric.healthCategory === 'Critical' ? 'bg-[#D92D20]/10 text-[#D92D20]' : metric.healthCategory === 'At Risk' ? 'bg-[#B7791F]/10 text-[#B7791F]' : 'bg-[#18845B]/10 text-[#18845B]'
                        )}>
                          {metric.healthCategory}
                        </span>
                      </div>
                      <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-4xl font-extrabold text-[#17191D] tabular-nums">{metric.qualityScore}</span>
                        <span className="text-sm font-semibold text-[#8B93A1]">/ 100</span>
                      </div>

                      {/* Component breakdown */}
                      <div className="mt-4 pt-3 border-t border-[#E6E9ED] space-y-2.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[#6B7280]">1. First-pass WIR Pass Rate (40% wt)</span>
                          <span className="font-bold text-[#17191D] tabular-nums">{breakdown.wirComponent}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-[#E6E9ED] rounded-full overflow-hidden">
                          <div className="h-full bg-[#006B5B] rounded-full" style={{ width: `${breakdown.wirComponent}%` }} />
                        </div>

                        <div className="flex items-center justify-between text-xs pt-1">
                          <span className="text-[#6B7280]">2. Non-Compliance Closure Health (35% wt)</span>
                          <span className="font-bold text-[#17191D] tabular-nums">{breakdown.ncComponent}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-[#E6E9ED] rounded-full overflow-hidden">
                          <div className="h-full bg-[#B7791F] rounded-full" style={{ width: `${breakdown.ncComponent}%` }} />
                        </div>

                        <div className="flex items-center justify-between text-xs pt-1">
                          <span className="text-[#6B7280]">3. Latest Audit Performance (25% wt)</span>
                          <span className="font-bold text-[#17191D] tabular-nums">{breakdown.auditComponent ?? 75}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-[#E6E9ED] rounded-full overflow-hidden">
                          <div className="h-full bg-[#3168D8] rounded-full" style={{ width: `${breakdown.auditComponent ?? 75}%` }} />
                        </div>
                      </div>
                    </div>

                    {/* Key Project Statistics */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-3 bg-white rounded-lg border border-[#E6E9ED] text-center">
                        <span className="text-[11px] text-[#6B7280] block">Open NCs</span>
                        <span className="text-xl font-bold text-[#17191D] tabular-nums mt-0.5 block">{metric.openNCs}</span>
                        <span className="text-[10px] text-[#D92D20] font-semibold">{metric.criticalOpenNCs} Critical</span>
                      </div>
                      <div className="p-3 bg-white rounded-lg border border-[#E6E9ED] text-center">
                        <span className="text-[11px] text-[#6B7280] block">First-pass WIR</span>
                        <span className="text-xl font-bold text-[#006B5B] tabular-nums mt-0.5 block">{metric.wirPassRate}%</span>
                        <span className="text-[10px] text-[#6B7280]">Pass rate</span>
                      </div>
                      <div className="p-3 bg-white rounded-lg border border-[#E6E9ED] text-center">
                        <span className="text-[11px] text-[#6B7280] block">Overdue WIRs</span>
                        <span className="text-xl font-bold text-[#B7791F] tabular-nums mt-0.5 block">{metric.overdueWIRs}</span>
                        <span className="text-[10px] text-[#8B93A1]">Awaiting SLA</span>
                      </div>
                    </div>

                    {/* Assigned Leadership & Contractors */}
                    <div className="p-4 bg-white rounded-lg border border-[#E6E9ED] space-y-3">
                      <h4 className="text-xs font-bold text-[#17191D] uppercase tracking-wider">Project Quality Governance</h4>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-[#8B93A1] block">Project Manager</span>
                          <span className="font-semibold text-[#17191D]">{selectedDrawerProject.projectManager}</span>
                        </div>
                        <div>
                          <span className="text-[#8B93A1] block">Quality Lead</span>
                          <span className="font-semibold text-[#17191D]">{selectedDrawerProject.qualityLead}</span>
                        </div>
                      </div>
                    </div>

                    {/* Active Findings for this Project */}
                    <div>
                      <h4 className="text-xs font-bold text-[#17191D] uppercase tracking-wider mb-2">
                        Active Non-Compliances ({state.ncs.filter(n => n.projectId === selectedDrawerProject.id && n.status !== 'Closed').length})
                      </h4>
                      <div className="space-y-2">
                        {state.ncs.filter(n => n.projectId === selectedDrawerProject.id && n.status !== 'Closed').map(nc => (
                          <div
                            key={nc.id}
                            onClick={() => setSelectedDrawerNC(nc)}
                            className="p-3 rounded-lg border border-[#E6E9ED] hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-between"
                          >
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1.5">
                                <span className={clsx(
                                  'px-1.5 py-0.2 rounded text-[10px] font-bold uppercase',
                                  nc.severity === 'Critical' ? 'bg-[#D92D20] text-white' : 'bg-[#B7791F] text-white'
                                )}>
                                  {nc.severity}
                                </span>
                                <span className="font-semibold text-xs text-[#17191D]">{nc.finding}</span>
                              </div>
                              <span className="text-[11px] text-[#6B7280] block">
                                {nc.floor || 'Site wide'} · Open {nc.age} days
                              </span>
                            </div>
                            <ChevronRight size={14} className="text-[#8B93A1]" />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Project Specific Audit History */}
                    <div className="p-4 bg-white rounded-lg border border-[#E6E9ED] space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-[#17191D] uppercase tracking-wider">
                          Project Audit History ({AUDIT_RECORDS.filter(a => a.projectId === selectedDrawerProject.id).length})
                        </h4>
                        <span className="text-[11px] text-[#6B7280]">IS 456 & Bureau Veritas</span>
                      </div>
                      
                      <div className="space-y-2">
                        {AUDIT_RECORDS.filter(a => a.projectId === selectedDrawerProject.id).map(audit => (
                          <div
                            key={audit.id}
                            className="p-3 rounded-lg border border-[#E6E9ED] bg-[#F8F9FA]/60 space-y-1.5"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-bold text-[#17191D]">{audit.id}</span>
                                <span className={clsx(
                                  'px-2 py-0.5 rounded-full text-[10px] font-semibold',
                                  audit.type === 'External' ? 'bg-[#3168D8]/10 text-[#3168D8]' : 'bg-slate-200 text-slate-700'
                                )}>
                                  {audit.type} Audit
                                </span>
                              </div>
                              <span className={clsx(
                                'font-black text-xs tabular-nums',
                                audit.percentageScore < 60 ? 'text-[#D92D20]' : audit.percentageScore < 80 ? 'text-[#B7791F]' : 'text-[#18845B]'
                              )}>
                                {audit.percentageScore}%
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-[11px] text-[#6B7280]">
                              <span>Auditor: <strong className="text-[#17191D]">{audit.auditor}</strong></span>
                              <span>Date: {audit.auditDate}</span>
                            </div>
                            <div className="flex items-center gap-3 text-[11px] pt-1 border-t border-slate-200/60">
                              <span>Findings: <strong className="text-[#17191D]">{audit.findingsRaised}</strong></span>
                              <span>Outstanding CAs: <strong className={audit.outstandingCAs > 0 ? 'text-[#D92D20]' : 'text-[#18845B]'}>{audit.outstandingCAs}</strong></span>
                              <span className="ml-auto font-medium text-slate-500">{audit.status}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-[#E6E9ED] bg-[#F8F9FA] flex items-center justify-between gap-3">
              <button
                onClick={() => {
                  selectProject(selectedDrawerProject.id);
                  setTab('wip');
                }}
                className="flex items-center gap-2 h-9 px-4 rounded-lg bg-white border border-[#E6E9ED] hover:bg-slate-50 text-xs font-semibold text-[#17191D] transition-colors"
              >
                <Building2 size={14} />
                <span>Open in WIP View</span>
              </button>

              <button
                onClick={() => {
                  if (onProjectChange) onProjectChange(selectedDrawerProject.id);
                  if (onNavigateToTab) onNavigateToTab('defects');
                  setSelectedDrawerProject(null);
                }}
                className="flex items-center gap-2 h-9 px-4 rounded-lg bg-[#006B5B] hover:bg-[#005245] text-xs font-semibold text-white transition-colors"
              >
                <span>View All NCs</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          INTERACTIVE DRAWER: ISSUE DETAIL (WITH ALL DETAILS FROM REFERENCE IMAGES)
          ============================================================ */}
      {selectedDrawerNC && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-2xs flex justify-end animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col justify-between border-l border-[#E6E9ED] animate-in slide-in-from-right duration-200">
            {/* Header (Matching Reference Image Style) */}
            <div className="p-5 border-b border-[#E6E9ED] bg-[#F8F9FA]/60">
              <div className="flex items-center justify-between pb-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold text-white bg-[#1E3A8A] px-2.5 py-0.5 rounded shadow-2xs">
                    {selectedDrawerNC.id}
                  </span>
                  <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                    {selectedDrawerNC.status}
                  </span>
                  {selectedDrawerNC.severity === 'Critical' && (
                    <span className="px-2 py-0.5 rounded text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                      <AlertOctagon size={12} className="text-[#DC2626]" />
                      <span>Blocking Pour / Hold</span>
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setSelectedDrawerNC(null)}
                  className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#17191D] hover:bg-slate-200 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <h3 className="text-base font-bold text-[#17191D] leading-snug">
                Work Inspection: {selectedDrawerNC.finding}
              </h3>
              <p className="text-xs text-[#6B7280] mt-1 flex items-center gap-1.5">
                <span>{PROJECTS.find(p => p.id === selectedDrawerNC.projectId)?.name}</span>
                <span>•</span>
                <span>{selectedDrawerNC.tower || 'Block A'}</span>
                <span>•</span>
                <span className="font-medium text-[#17191D]">{selectedDrawerNC.floor || 'Level 5'}</span>
              </p>
            </div>

            {/* Body with All Sections from Reference Image */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* 1. LINKED WORK ACTIVITY */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                    LINKED WORK ACTIVITY
                  </span>
                  <strong className="text-xs font-bold text-slate-900 block">
                    {selectedDrawerNC.tower || 'Block A'} {selectedDrawerNC.floor || 'Level 5'} Column Casting & Shuttering
                  </strong>
                </div>
                <button
                  onClick={() => {
                    selectProject(selectedDrawerNC.projectId);
                    setTab('wip');
                  }}
                  className="text-xs font-semibold text-[#1E3A8A] hover:underline flex items-center gap-0.5 shrink-0"
                >
                  <span>View Activity</span>
                  <ChevronRight size={13} />
                </button>
              </div>

              {/* 2. INSPECTION WORKFLOW STAGE (STEPPER) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">Inspection Workflow Stage:</span>
                  <span className="font-bold text-[#1E3A8A]">{selectedDrawerNC.status}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-center">
                    <span className="text-[11px] font-bold text-slate-700 block">1. Contractor Raised</span>
                    <span className="text-[10px] text-slate-400">WIR Submitted</span>
                  </div>
                  <div className="p-2.5 rounded-lg border-2 border-[#1E3A8A] bg-blue-50/50 text-center shadow-2xs">
                    <span className="text-[11px] font-bold text-[#1E3A8A] block">2. QA Field Check</span>
                    <span className="text-[10px] text-blue-700 font-semibold">Active Review</span>
                  </div>
                  <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-center opacity-70">
                    <span className="text-[11px] font-bold text-slate-500 block">3. Pour Cleared</span>
                    <span className="text-[10px] text-slate-400">Final Sign-off</span>
                  </div>
                </div>
              </div>

              {/* 3. SUBMITTED BY & ASSIGNED QA REVIEWER */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Submitted By
                  </span>
                  <strong className="text-xs font-bold text-slate-900 block truncate">
                    Ramesh Kulkarni ({CONTRACTORS.find(c => c.id === selectedDrawerNC.contractorId)?.name || 'Sterling Eng'})
                  </strong>
                  <span className="text-[11px] text-slate-500 font-mono block mt-0.5">
                    {selectedDrawerNC.dateRaised || '2026-10-03'}
                  </span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Assigned QA Reviewer
                  </span>
                  <strong className="text-xs font-bold text-slate-900 block truncate">
                    {selectedDrawerNC.owner || 'Rohan Mehra (Godrej QA Lead)'}
                  </strong>
                  <span className="text-[11px] text-amber-700 font-semibold block mt-0.5">
                    {selectedDrawerNC.age} days in queue
                  </span>
                </div>
              </div>

              {/* 4. NON-CONFORMANCE REASON (ALERT BOX FROM REFERENCE IMAGE) */}
              <div className="p-4 rounded-xl bg-rose-50/90 border border-rose-200 space-y-1.5 text-xs text-rose-950">
                <div className="flex items-center gap-1.5 font-bold text-rose-800">
                  <AlertOctagon size={15} className="text-[#DC2626] shrink-0" />
                  <span>Inspection Disapproved / Non-Conformance Reason</span>
                </div>
                <p className="text-slate-800 leading-relaxed text-xs">
                  {DEFECT_PREVIEWS[selectedDrawerNC.projectId]?.statement || selectedDrawerNC.finding}
                </p>
              </div>

              {/* 5. MANDATORY QUALITY INSPECTION CHECKLIST (FROM REFERENCE IMAGE) */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                  MANDATORY QUALITY INSPECTION CHECKLIST
                </span>
                <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-2.5 text-xs">
                  <div className="flex items-center gap-2.5 text-slate-700">
                    <span className="w-4 h-4 rounded-full border-2 border-slate-300 flex items-center justify-center shrink-0" />
                    <span>Verticality of column shutters using plumb bob / total station (&lt;5mm allowable)</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-slate-700">
                    <span className="w-4 h-4 rounded-full border-2 border-slate-300 flex items-center justify-center shrink-0" />
                    <span>Adequate cover block spacing (min 40mm) every 1m along rebar cage</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-emerald-800 font-medium">
                    <span className="w-4 h-4 rounded-full bg-emerald-100 border border-emerald-500 flex items-center justify-center text-emerald-700 shrink-0">
                      <Check size={11} strokeWidth={3} />
                    </span>
                    <span>Slurry tightness of formwork joints at kicker junction</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-slate-700">
                    <span className="w-4 h-4 rounded-full border-2 border-slate-300 flex items-center justify-center shrink-0" />
                    <span>Debris removal / air blowing inside column foot before concrete casting</span>
                  </div>
                </div>
              </div>

              {/* 6. QUALITY REVIEW NOTES (FROM REFERENCE IMAGE) */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                  QUALITY REVIEW NOTES
                </span>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed">
                  {selectedDrawerNC.rectificationNotes || 'Pour disallowed. Must strip shutter, re-align kicker and provide fiber-reinforced cover blocks before resubmission.'}
                </div>
              </div>

              {/* 7. SITE EVIDENCE PHOTO */}
              {(() => {
                const preview = DEFECT_PREVIEWS[selectedDrawerNC.projectId];
                const photoSrc = selectedDrawerNC.sitePhoto?.url || preview?.image;
                if (!photoSrc) return null;

                return (
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                      SITE EVIDENCE PHOTO
                    </span>
                    <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-900">
                      <img
                        src={photoSrc}
                        alt="Defect Proof"
                        className="w-full h-52 object-cover"
                        onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                      />
                      <div className="p-2.5 bg-[#17191D] text-white flex items-center justify-between text-xs">
                        <span className="text-slate-300">NABL / Site Audit Verification Proof</span>
                        <span className="text-slate-400 tabular-nums">{preview?.timestamp || '14 Oct 2025'}</span>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Sticky Action Footer (Matching Reference Image) */}
            <div className="p-4 border-t border-[#E6E9ED] bg-[#F8F9FA] flex items-center justify-between gap-3">
              <span className="text-xs font-bold text-slate-700">
                Status: <strong className="text-amber-800">{selectedDrawerNC.status}</strong>
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedDrawerNC(null)}
                  className="px-4 py-2 rounded-lg border border-rose-300 bg-white hover:bg-rose-50 text-xs font-bold text-rose-700 transition-colors shadow-2xs"
                >
                  Reject & Hold
                </button>

                <button
                  onClick={() => {
                    if (onProjectChange) onProjectChange(selectedDrawerNC.projectId);
                    if (onNavigateToTab) onNavigateToTab('defects');
                    setSelectedDrawerNC(null);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#18845B] hover:bg-[#136b49] text-xs font-bold text-white transition-colors shadow-2xs"
                >
                  <Check size={14} />
                  <span>Approve & Clear Pour</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
