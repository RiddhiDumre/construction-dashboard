// ============================================================
// PAGE 1 — PORTFOLIO OVERVIEW
// Apple-inspired executive dashboard for BombayDC leadership.
// Minimalist architectural elevations, clean tabular typography,
// dynamic location scoping, and restrained status hierarchy.
// ============================================================

import React, { useState, useMemo } from 'react';
import {
  Building2, CheckCircle2, ChevronRight, MapPin,
  ArrowRight, ShieldAlert, Award
} from 'lucide-react';
import clsx from 'clsx';
import { useApp } from '../store/appStore';
import {
  getAllProjectMetrics, getOverviewPortfolioKPIs, getNeedsAttentionAlerts,
  getCXOCommercialInventory, getPortfolioSlabMetrics,
} from '../data/calculations';
import { PROJECTS, TOWERS_DATA, FLOORS_DATA } from '../data/seedData';
import { ProjectDetailDrawer } from '../components/ProjectDetailDrawer';

const CITIES = [
  'All Locations',
  'Mumbai',
  'Thane',
  'Navi Mumbai',
  'Pune',
  'Bengaluru',
  'Hyderabad',
  'Gurugram',
];

export function PortfolioPage() {
  const { state, setTab, selectProject, selectNC, selectWIR, setFilter } = useApp();

  const [selectedCity, setSelectedCity] = useState<string>('All Locations');
  const [projectTableTab, setProjectTableTab] = useState<'attention' | 'all'>('attention');
  const [hoveredFloor, setHoveredFloor] = useState<{
    towerName: string;
    floorNumber: number;
    status: string;
    detail?: string;
  } | null>(null);

  // Dynamic Portfolio KPIs scoped to geographic selection
  const kpis = useMemo(
    () => getOverviewPortfolioKPIs(selectedCity, state.weights, state.wirs, state.ncs),
    [selectedCity, state.weights, state.wirs, state.ncs]
  );

  // Commercial Units Sold Metrics
  const commercialData = useMemo(
    () => getCXOCommercialInventory(selectedCity),
    [selectedCity]
  );

  // All project metrics scoped to city
  const allProjectMetrics = useMemo(
    () => getAllProjectMetrics(state.weights, state.wirs, state.ncs),
    [state.weights, state.wirs, state.ncs]
  );

  const scopedProjectMetrics = useMemo(() => {
    if (selectedCity === 'All Locations') return allProjectMetrics;
    if (selectedCity.toLowerCase() === 'mumbai') {
      return allProjectMetrics.filter(m => m.project.city === 'Mumbai' || m.project.city === 'Navi Mumbai' || m.project.city === 'Thane');
    }
    return allProjectMetrics.filter(m => m.project.city.toLowerCase() === selectedCity.toLowerCase());
  }, [allProjectMetrics, selectedCity]);

  // Projects requiring attention vs all projects
  const attentionProjects = useMemo(() => {
    return scopedProjectMetrics.filter(m => m.healthCategory === 'Critical' || m.healthCategory === 'At Risk');
  }, [scopedProjectMetrics]);

  // Dynamic Skyline Towers
  const skylineTowers = useMemo(() => {
    if (selectedCity === 'All Locations') {
      // 4 signature representative towers across regions
      return [
        {
          id: 'T010',
          projectId: 'P004',
          projectName: 'Riverstone Towers',
          towerName: 'Tower 1',
          city: 'Gurugram',
          totalFloors: 24,
          completedFloors: 4,
          activeFloor: 6,
          criticalFloor: 5,
          criticalIssue: 'Concrete cube-test failure & honeycombing',
          progressPct: 48,
          delayDays: -38,
        },
        {
          id: 'T001',
          projectId: 'P001',
          projectName: 'Meridian Heights',
          towerName: 'Tower A',
          city: 'Mumbai',
          totalFloors: 18,
          completedFloors: 9,
          activeFloor: 10,
          progressPct: 61,
          delayDays: -3,
        },
        {
          id: 'T018',
          projectId: 'P007',
          projectName: 'Vivanta Sereno',
          towerName: 'Tower 1',
          city: 'Thane',
          totalFloors: 15,
          completedFloors: 9,
          activeFloor: 10,
          progressPct: 65,
          delayDays: 0,
        },
        {
          id: 'T004',
          projectId: 'P002',
          projectName: 'Northgate Residences',
          towerName: 'Block 1',
          city: 'Bengaluru',
          totalFloors: 12,
          completedFloors: 12,
          activeFloor: 12,
          progressPct: 74,
          delayDays: 3,
        },
      ];
    }

    // Filter to towers of projects in this specific city
    const cityProjIds = PROJECTS.filter(p => {
      if (selectedCity.toLowerCase() === 'mumbai') return p.city === 'Mumbai' || p.city === 'Navi Mumbai' || p.city === 'Thane';
      return p.city.toLowerCase() === selectedCity.toLowerCase();
    }).map(p => p.id);

    const filteredTowers = TOWERS_DATA.filter(t => cityProjIds.includes(t.projectId));

    return filteredTowers.slice(0, 4).map(t => {
      const proj = PROJECTS.find(p => p.id === t.projectId);
      const isCritical = t.projectId === 'P004' && t.name === 'Tower 1';
      return {
        id: t.id,
        projectId: t.projectId,
        projectName: proj?.name || '',
        towerName: t.name,
        city: proj?.city || '',
        totalFloors: t.totalFloors,
        completedFloors: t.completedFloors,
        activeFloor: Math.min(t.totalFloors, t.completedFloors + 1),
        criticalFloor: isCritical ? 5 : undefined,
        criticalIssue: isCritical ? 'Concrete cube-test failure & honeycombing' : undefined,
        progressPct: t.actualProgress,
        delayDays: t.varianceDays,
      };
    });
  }, [selectedCity]);

  // Priority Operational Critical Issues
  const alerts = useMemo(
    () => getNeedsAttentionAlerts(selectedCity, state.wirs, state.ncs, state.weights),
    [selectedCity, state.wirs, state.ncs, state.weights]
  );

  return (
    <div className="space-y-6 pb-12">
      {/* ============================================================
          SECTION 5: PORTFOLIO FILTERS (Segmented Location Selector)
          ============================================================ */}
      <div className="flex items-center justify-between gap-4 pb-1 border-b border-[#E5E7EB]">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-1">
          {CITIES.map(city => {
            const active = selectedCity === city;
            return (
              <button
                key={city}
                onClick={() => {
                  setSelectedCity(city);
                  setFilter('city', city === 'All Locations' ? '' : city);
                }}
                className={clsx(
                  'px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all',
                  active
                    ? 'bg-[#17191D] text-white font-semibold shadow-xs'
                    : 'text-[#737B88] hover:text-[#17191D] hover:bg-white'
                )}
              >
                {city}
              </button>
            );
          })}
        </div>

        <div className="text-xs text-[#737B88] font-medium hidden sm:block">
          {scopedProjectMetrics.length} Active {scopedProjectMetrics.length === 1 ? 'Project' : 'Projects'}
        </div>
      </div>

      {/* ============================================================
          SECTION 6: EXECUTIVE KPI STRIP (4 Prominent Cards)
          Make the important information impossible to miss.
          ============================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Construction Progress */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="text-xs text-[#737B88] font-medium">Construction progress</div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-semibold text-[#17191D] tracking-tight tabular-nums">
                {kpis.overallProgress}%
              </span>
            </div>
            <div className="text-xs text-[#737B88] mt-1.5 flex items-center gap-1.5">
              <span>{kpis.overallTargetProgress}% planned</span>
              <span>·</span>
              <span className={clsx(
                'font-medium',
                kpis.progressVariance < 0 ? 'text-[#B7791F]' : 'text-[#16805D]'
              )}>
                {kpis.progressVariance < 0
                  ? `${Math.abs(kpis.progressVariance)} pts behind`
                  : `${kpis.progressVariance} pts ahead`}
              </span>
            </div>
          </div>

          {/* Thin Refined Progress Bar */}
          <div className="w-full h-1.5 bg-[#F1F5F9] rounded-full mt-4 overflow-hidden">
            <div
              className="h-full bg-[#00594F] rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, Math.max(0, kpis.overallProgress))}%` }}
            />
          </div>
        </div>

        {/* Card 2: Residential Units Sold (Inventory Strip Blocks) */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="text-xs text-[#737B88] font-medium">Units sold</div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-semibold text-[#17191D] tracking-tight tabular-nums">
                {commercialData.soldUnits.toLocaleString()}
              </span>
              <span className="text-xs font-medium text-[#737B88]">
                ({commercialData.soldPercent}% sold)
              </span>
            </div>
            <div className="text-xs text-[#737B88] mt-1.5">
              {commercialData.soldUnits.toLocaleString()} sold / {commercialData.totalUnits.toLocaleString()} total · {commercialData.leftUnits.toLocaleString()} remaining
            </div>
          </div>

          {/* Minimalist 20-Block Inventory Strip */}
          <div className="mt-4 flex items-center gap-1">
            {Array.from({ length: 20 }).map((_, i) => {
              const isFilled = i < Math.round((commercialData.soldPercent / 100) * 20);
              return (
                <div
                  key={i}
                  className={clsx(
                    'flex-1 h-2 rounded-2xs transition-colors',
                    isFilled ? 'bg-[#00594F]' : 'bg-[#E5E7EB]'
                  )}
                  title={`${commercialData.soldPercent}% Sold`}
                />
              );
            })}
          </div>
        </div>

        {/* Card 3: Quality Score */}
        <div
          onClick={() => setTab('quality')}
          className="bg-white border border-[#E5E7EB] rounded-xl p-5 shadow-2xs flex flex-col justify-between cursor-pointer hover:border-slate-300 transition-colors group"
        >
          <div>
            <div className="flex items-center justify-between text-xs text-[#737B88] font-medium">
              <span>Quality score</span>
              <span className="text-[11px] text-[#00594F] font-semibold group-hover:underline flex items-center gap-0.5">
                Breakdown <ChevronRight size={12} />
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-3xl sm:text-4xl font-semibold text-[#17191D] tracking-tight tabular-nums">
                {kpis.portfolioQualityScore}
              </span>
              <span className="text-base font-normal text-[#737B88]">/100</span>
            </div>
            <div className="text-xs mt-1.5 flex items-center gap-1.5">
              <span
                className={clsx(
                  'w-2 h-2 rounded-full',
                  kpis.portfolioQualityScore >= 80
                    ? 'bg-[#16805D]'
                    : kpis.portfolioQualityScore >= 60
                    ? 'bg-[#B7791F]'
                    : 'bg-[#C63F43]'
                )}
              />
              <span className="text-[#17191D] font-medium">
                {kpis.portfolioQualityScore >= 80
                  ? 'On track'
                  : kpis.portfolioQualityScore >= 60
                  ? 'Needs attention'
                  : 'Critical risk'}
              </span>
              <span className="text-[#737B88]">· {kpis.portfolioWIRPassRate}% pass rate</span>
            </div>
          </div>

          {/* Thin Horizontal Score Track */}
          <div className="w-full h-1.5 bg-[#F1F5F9] rounded-full mt-4 overflow-hidden">
            <div
              className={clsx(
                'h-full rounded-full transition-all duration-300',
                kpis.portfolioQualityScore >= 80
                  ? 'bg-[#16805D]'
                  : kpis.portfolioQualityScore >= 60
                  ? 'bg-[#B7791F]'
                  : 'bg-[#C63F43]'
              )}
              style={{ width: `${kpis.portfolioQualityScore}%` }}
            />
          </div>
        </div>

        {/* Card 4: Critical Defects */}
        <div
          onClick={() => setTab('nc')}
          className="bg-white border border-[#E5E7EB] rounded-xl p-5 shadow-2xs flex flex-col justify-between cursor-pointer hover:border-slate-300 transition-colors"
        >
          <div>
            <div className="text-xs text-[#737B88] font-medium">Critical defect holds</div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className={clsx(
                'text-3xl sm:text-4xl font-semibold tracking-tight tabular-nums',
                kpis.criticalNCs > 0 ? 'text-[#C63F43]' : 'text-[#17191D]'
              )}>
                {kpis.criticalNCs}
              </span>
            </div>
            <div className="text-xs mt-1.5 flex items-center gap-1.5">
              <span
                className={clsx(
                  'w-2 h-2 rounded-full',
                  kpis.criticalNCs > 0 ? 'bg-[#C63F43]' : 'bg-[#16805D]'
                )}
              />
              <span className="text-[#17191D] font-medium">
                {kpis.criticalNCs > 0
                  ? 'Riverstone Towers: Floor 05 hold'
                  : 'No active holds across sites'}
              </span>
            </div>
          </div>

          <div className="text-[11px] text-[#737B88] mt-4 pt-1 border-t border-[#F1F5F9] flex items-center justify-between">
            <span>{kpis.openNCs} total open findings</span>
            <span>{kpis.overdueWIRs} overdue WIRs</span>
          </div>
        </div>
      </div>

      {/* ============================================================
          MAIN CONTENT: TWO-COLUMN COMPOSITION (Section 7, 8, 9)
          Left: WIP Construction Skyline (~54% width)
          Right: Quality & Issues (~46% width)
          ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* ==========================================================
            LEFT PANEL: WIP CONSTRUCTION SKYLINE (Section 8)
            ========================================================== */}
        <div className="lg:col-span-7 bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-2xs flex flex-col justify-between">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#F1F5F9]">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-semibold text-[#17191D] tracking-tight">
                  Construction Progress
                </span>
                <span className="text-xs text-[#737B88]">
                  · Building-by-building overview
                </span>
              </div>
            </div>

            <button
              onClick={() => setTab('wip')}
              className="text-xs font-medium text-[#00594F] hover:underline flex items-center gap-1"
            >
              View all projects <ChevronRight size={13} />
            </button>
          </div>

          {/* Dynamic Architectural SVG Elevations Area */}
          <div className="relative py-4 my-2 flex-1 min-h-[220px] flex items-end justify-around gap-4 bg-[#FAFBFB] rounded-lg border border-[#F1F5F9] px-4">
            {skylineTowers.map(tower => {
              const total = tower.totalFloors;
              const completed = tower.completedFloors;
              const active = tower.activeFloor;
              const critical = tower.criticalFloor;

              return (
                <div
                  key={tower.id}
                  onClick={() => selectProject(tower.projectId)}
                  className="flex-1 flex flex-col items-center cursor-pointer group transition-transform hover:-translate-y-0.5 max-w-[130px]"
                >
                  {/* Clean SVG Elevation Drawing */}
                  <div className="w-full flex justify-center">
                    <svg
                      viewBox="0 0 100 220"
                      className="w-24 h-48 overflow-visible"
                    >
                      {/* Architectural Rooftop Line & Antenna */}
                      <line
                        x1="50"
                        y1={190 - total * 7 - 12}
                        x2="50"
                        y2={190 - total * 7}
                        stroke="#737B88"
                        strokeWidth="1.5"
                      />
                      <line
                        x1="22"
                        y1={190 - total * 7}
                        x2="78"
                        y2={190 - total * 7}
                        stroke="#17191D"
                        strokeWidth="1.5"
                      />

                      {/* Stacked Floor Rectangles (From ground to top floor) */}
                      {Array.from({ length: total }).map((_, idx) => {
                        const floorNum = idx + 1;
                        const floorY = 190 - floorNum * 7;
                        const isCompleted = floorNum <= completed;
                        const isActive = floorNum === active;
                        const isCritical = critical === floorNum;

                        let fill = '#F1F5F9';
                        let stroke = '#E5E7EB';

                        if (isCritical) {
                          fill = '#EF4444';
                          stroke = '#DC2626';
                        } else if (isCompleted) {
                          fill = '#00594F';
                          stroke = '#00473E';
                        } else if (isActive) {
                          fill = '#0D9488';
                          stroke = '#0F766E';
                        }

                        return (
                          <g key={floorNum}>
                            <rect
                              x="25"
                              y={floorY}
                              width="50"
                              height="5.5"
                              rx="0.5"
                              fill={fill}
                              stroke={stroke}
                              strokeWidth="0.5"
                              className="transition-colors"
                              onMouseEnter={() =>
                                setHoveredFloor({
                                  towerName: `${tower.projectName} · ${tower.towerName}`,
                                  floorNumber: floorNum,
                                  status: isCritical
                                    ? 'Critical Construction Hold'
                                    : isCompleted
                                    ? 'Completed Slab'
                                    : isActive
                                    ? 'In Progress Casting'
                                    : 'Upcoming Slab',
                                  detail: isCritical ? tower.criticalIssue : undefined,
                                })
                              }
                              onMouseLeave={() => setHoveredFloor(null)}
                            />

                            {/* Precise Dot Marker on Critical Hold Floor */}
                            {isCritical && (
                              <circle
                                cx="83"
                                cy={floorY + 2.75}
                                r="3"
                                fill="#DC2626"
                                stroke="#FFFFFF"
                                strokeWidth="1"
                              />
                            )}
                          </g>
                        );
                      })}

                      {/* Foundation Ground Line */}
                      <line
                        x1="10"
                        y1="191"
                        x2="90"
                        y2="191"
                        stroke="#737B88"
                        strokeWidth="1.5"
                      />
                      <rect
                        x="20"
                        y="191"
                        width="60"
                        height="3"
                        fill="#CBD5E1"
                        rx="0.5"
                      />
                    </svg>
                  </div>

                  {/* Below-Building Label */}
                  <div className="text-center mt-2 w-full">
                    <div className="text-xs font-medium text-[#17191D] group-hover:text-[#00594F] transition-colors truncate">
                      {tower.projectName}
                    </div>
                    <div className="text-[11px] text-[#737B88] mt-0.5 tabular-nums">
                      {tower.totalFloors} floors · {tower.progressPct}% complete
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Understated Hover Tooltip */}
            {hoveredFloor && (
              <div className="absolute top-3 left-3 bg-[#17191D] text-white text-xs px-3 py-1.5 rounded-lg shadow-lg pointer-events-none animate-in fade-in duration-100 z-20">
                <div className="font-medium">
                  {hoveredFloor.towerName} · Floor {hoveredFloor.floorNumber.toString().padStart(2, '0')}
                </div>
                <div className="text-[11px] text-slate-300 mt-0.5">
                  {hoveredFloor.status}
                </div>
                {hoveredFloor.detail && (
                  <div className="text-[11px] text-rose-300 font-medium mt-0.5">
                    {hoveredFloor.detail}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Architectural Legend */}
          <div className="pt-3 border-t border-[#F1F5F9] flex items-center justify-between text-xs text-[#737B88]">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-2xs bg-[#00594F]" /> Completed
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-2xs bg-[#0D9488]" /> In progress
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-2xs bg-[#F1F5F9] border border-[#E5E7EB]" /> Upcoming
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#DC2626]" /> Defect hold
              </span>
            </div>

            <span className="text-[11px] text-[#737B88]">
              Select any building to view full structural packages
            </span>
          </div>
        </div>

        {/* ==========================================================
            RIGHT PANEL: QUALITY AND CRITICAL ISSUES (Section 9)
            ========================================================== */}
        <div className="lg:col-span-5 bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-2xs flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
              <span className="text-base font-semibold text-[#17191D] tracking-tight">
                Quality & Issues
              </span>
              <button
                onClick={() => setTab('nc')}
                className="text-xs font-medium text-[#00594F] hover:underline"
              >
                View all issues →
              </button>
            </div>

            {/* Compact Quality Summary Row */}
            <div className="grid grid-cols-4 gap-2 my-4 p-3 rounded-lg bg-[#FAFBFB] border border-[#F1F5F9] text-center">
              <div>
                <div className="text-base font-semibold text-[#17191D] tabular-nums">
                  {kpis.portfolioQualityScore}/100
                </div>
                <div className="text-[11px] text-[#737B88] mt-0.5">Quality score</div>
              </div>
              <div>
                <div className="text-base font-semibold text-[#17191D] tabular-nums">
                  {kpis.portfolioWIRPassRate}%
                </div>
                <div className="text-[11px] text-[#737B88] mt-0.5">1st-pass WIR</div>
              </div>
              <div>
                <div className="text-base font-semibold text-[#17191D] tabular-nums">
                  {kpis.openNCs}
                </div>
                <div className="text-[11px] text-[#737B88] mt-0.5">Open NCs</div>
              </div>
              <div>
                <div className={clsx(
                  'text-base font-semibold tabular-nums',
                  kpis.overdueWIRs > 0 ? 'text-[#B7791F]' : 'text-[#17191D]'
                )}>
                  {kpis.overdueWIRs}
                </div>
                <div className="text-[11px] text-[#737B88] mt-0.5">Overdue WIRs</div>
              </div>
            </div>

            {/* Top Critical Issues List (Ranked by severity & urgency) */}
            <div className="space-y-2 mt-4">
              {/* Issue 1 */}
              <div
                onClick={() => {
                  setTab('nc');
                  selectNC('NC-0001');
                }}
                className="p-3 rounded-lg border border-[#E5E7EB] hover:border-slate-300 transition-colors cursor-pointer group"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-medium text-[#17191D]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626]" />
                    <span className="text-[#C63F43] font-semibold">Critical</span>
                    <span>·</span>
                    <span>Riverstone Towers</span>
                  </div>
                  <span className="text-[11px] text-[#737B88]">Open 7 days</span>
                </div>
                <div className="text-xs font-medium text-[#17191D] mt-1 group-hover:text-[#00594F] transition-colors">
                  Floor 05 — Concrete cube-test failure & column honeycombing
                </div>
                <div className="text-[11px] text-[#737B88] mt-0.5">
                  Structural stop-work notice issued to ABC Civil Works
                </div>
              </div>

              {/* Issue 2 */}
              <div
                onClick={() => {
                  setTab('wir');
                  selectWIR('WIR-0021');
                }}
                className="p-3 rounded-lg border border-[#E5E7EB] hover:border-slate-300 transition-colors cursor-pointer group"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-medium text-[#17191D]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]" />
                    <span className="text-[#B7791F] font-semibold">Overdue</span>
                    <span>·</span>
                    <span>Meridian Heights</span>
                  </div>
                  <span className="text-[11px] text-[#737B88]">3 days overdue</span>
                </div>
                <div className="text-xs font-medium text-[#17191D] mt-1 group-hover:text-[#00594F] transition-colors">
                  Tower B — WIR inspection pending review beyond 7d SLA
                </div>
                <div className="text-[11px] text-[#737B88] mt-0.5">
                  Holding slab reinforcement sign-off for casting
                </div>
              </div>

              {/* Issue 3 */}
              <div
                onClick={() => {
                  setTab('nc');
                  selectNC('NC-0006');
                }}
                className="p-3 rounded-lg border border-[#E5E7EB] hover:border-slate-300 transition-colors cursor-pointer group"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-medium text-[#17191D]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]" />
                    <span className="text-[#B7791F] font-semibold">High</span>
                    <span>·</span>
                    <span>Northgate Residences</span>
                  </div>
                  <span className="text-[11px] text-[#737B88]">Open 4 days</span>
                </div>
                <div className="text-xs font-medium text-[#17191D] mt-1 group-hover:text-[#00594F] transition-colors">
                  Block 2 — Rebar spacing deviation in column ties
                </div>
                <div className="text-[11px] text-[#737B88] mt-0.5">
                  Assigned to Kapoor Finishing Works for re-tying
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#F1F5F9] text-xs text-[#737B88]">
            Quality score incorporates inspection velocity, NC severity aging, and internal audit scores.
          </div>
        </div>
      </div>

      {/* ============================================================
          SECTION 10: SECONDARY ROW — SALES OVERVIEW & DYNAMIC MAP
          ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Card 1: Sales Overview (Comparative Progress Bars) */}
        <div className="lg:col-span-7 bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
              <div>
                <span className="text-base font-semibold text-[#17191D] tracking-tight">
                  Sales Overview
                </span>
                <span className="text-xs text-[#737B88] ml-2">
                  · Residential inventory absorption
                </span>
              </div>
              <button
                onClick={() => setTab('wip')}
                className="text-xs font-medium text-[#00594F] hover:underline"
              >
                View sales details →
              </button>
            </div>

            {/* Thin Horizontal Comparison Bars */}
            <div className="space-y-4 my-4">
              {commercialData.projectBreakdown.slice(0, 4).map(p => (
                <div key={p.projectId} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-[#17191D]">{p.projectName}</span>
                    <div className="flex items-center gap-3 text-xs tabular-nums text-[#737B88]">
                      <span className="font-medium text-[#17191D]">
                        {p.soldUnits.toLocaleString()} / {p.totalUnits.toLocaleString()} units
                      </span>
                      <span>·</span>
                      <span className="font-semibold text-[#17191D]">{p.soldPercent}% sold</span>
                      <span>·</span>
                      <span>{p.leftUnits} remaining</span>
                    </div>
                  </div>

                  <div className="w-full h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                    <div
                      className={clsx(
                        'h-full rounded-full transition-all duration-300',
                        p.soldPercent < 60 ? 'bg-[#B7791F]' : 'bg-[#00594F]'
                      )}
                      style={{ width: `${p.soldPercent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-[#F1F5F9] text-xs text-[#737B88] flex items-center justify-between">
            <span>Portfolio sales achievement: {commercialData.soldPercent}%</span>
            <span>Total inventory value: ₹{commercialData.totalInventoryCr} Cr</span>
          </div>
        </div>

        {/* Card 2: Dynamic Project Map & Footprint */}
        <div className="lg:col-span-5 bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
              <span className="text-base font-semibold text-[#17191D] tracking-tight">
                Regional Footprint
              </span>
              <span className="text-xs text-[#737B88]">
                {selectedCity}
              </span>
            </div>

            {/* Dynamic Interactive SVG Map Canvas */}
            <div className="relative my-3 w-full h-44 rounded-lg bg-[#FAFBFB] border border-[#F1F5F9] overflow-hidden flex items-center justify-center">
              <svg viewBox="0 0 400 200" className="w-full h-full">
                {/* Coastal / Regional Contour Curves */}
                <path
                  d="M10,20 Q60,40 120,30 T240,60 T350,40 L400,200 L0,200 Z"
                  fill="#F8FAFC"
                  stroke="#E2E8F0"
                  strokeWidth="1"
                />
                <path
                  d="M80,0 Q130,50 160,110 T200,200"
                  fill="none"
                  stroke="#CBD5E1"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                />

                {/* Geo Location Pins according to demo data */}
                {/* 1. Gurugram */}
                <g
                  className="cursor-pointer"
                  onClick={() => setSelectedCity('Gurugram')}
                >
                  <circle cx="140" cy="40" r="5" fill="#DC2626" />
                  <circle cx="140" cy="40" r="10" fill="#DC2626" opacity="0.2" />
                  <text x="150" y="44" fontSize="10" fill="#17191D" fontWeight="500">
                    Gurugram (Riverstone)
                  </text>
                </g>

                {/* 2. Mumbai / Thane */}
                <g
                  className="cursor-pointer"
                  onClick={() => setSelectedCity('Mumbai')}
                >
                  <circle cx="100" cy="110" r="6" fill="#00594F" />
                  <circle cx="100" cy="110" r="12" fill="#00594F" opacity="0.2" />
                  <text x="112" y="114" fontSize="10" fill="#17191D" fontWeight="600">
                    Mumbai MMR (3 Projects)
                  </text>
                </g>

                {/* 3. Pune */}
                <g
                  className="cursor-pointer"
                  onClick={() => setSelectedCity('Pune')}
                >
                  <circle cx="120" cy="145" r="4.5" fill="#00594F" />
                  <text x="130" y="148" fontSize="9" fill="#737B88">
                    Pune (Cedar Park)
                  </text>
                </g>

                {/* 4. Bengaluru */}
                <g
                  className="cursor-pointer"
                  onClick={() => setSelectedCity('Bengaluru')}
                >
                  <circle cx="130" cy="175" r="5" fill="#00594F" />
                  <circle cx="130" cy="175" r="10" fill="#00594F" opacity="0.2" />
                  <text x="142" y="179" fontSize="10" fill="#17191D" fontWeight="500">
                    Bengaluru (Northgate)
                  </text>
                </g>

                {/* 5. Hyderabad */}
                <g
                  className="cursor-pointer"
                  onClick={() => setSelectedCity('Hyderabad')}
                >
                  <circle cx="190" cy="130" r="4.5" fill="#00594F" />
                  <text x="200" y="133" fontSize="9" fill="#737B88">
                    Hyderabad (Summit Greens)
                  </text>
                </g>
              </svg>

              {/* Floating Summary Card on Map */}
              <div className="absolute top-2.5 right-2.5 bg-white/95 backdrop-blur-xs border border-[#E5E7EB] rounded-lg p-2.5 shadow-sm text-xs pointer-events-none">
                <div className="font-semibold text-[#17191D] pb-1 border-b border-slate-100">
                  {selectedCity}
                </div>
                <div className="space-y-0.5 text-[11px] text-[#737B88] mt-1 tabular-nums">
                  <div>{scopedProjectMetrics.length} Active {scopedProjectMetrics.length === 1 ? 'project' : 'projects'}</div>
                  <div>{commercialData.soldUnits.toLocaleString()} units sold ({commercialData.soldPercent}%)</div>
                  <div>{kpis.overallProgress}% construction progress</div>
                  <div>{kpis.portfolioQualityScore}/100 quality score</div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#F1F5F9] text-xs text-[#737B88]">
            Click any regional pin to filter the entire portfolio view.
          </div>
        </div>
      </div>

      {/* ============================================================
          SECTION 11: LOWER SECTION — PROJECTS TO WATCH
          Clean table with proper sectioning and minimal typography.
          ============================================================ */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-2xs">
        {/* Header & Sectioning Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F1F5F9]">
          <div className="flex items-center gap-3">
            <span className="text-base font-semibold text-[#17191D] tracking-tight">
              Projects to Watch
            </span>
            <div className="flex items-center gap-1 bg-[#F1F5F9] p-0.5 rounded-lg border border-[#E5E7EB]">
              <button
                onClick={() => setProjectTableTab('attention')}
                className={clsx(
                  'px-2.5 py-1 rounded-md text-xs font-medium transition-all',
                  projectTableTab === 'attention'
                    ? 'bg-white text-[#17191D] font-semibold shadow-2xs'
                    : 'text-[#737B88] hover:text-[#17191D]'
                )}
              >
                Requiring Attention ({attentionProjects.length})
              </button>
              <button
                onClick={() => setProjectTableTab('all')}
                className={clsx(
                  'px-2.5 py-1 rounded-md text-xs font-medium transition-all',
                  projectTableTab === 'all'
                    ? 'bg-white text-[#17191D] font-semibold shadow-2xs'
                    : 'text-[#737B88] hover:text-[#17191D]'
                )}
              >
                All Projects ({scopedProjectMetrics.length})
              </button>
            </div>
          </div>

          <span className="text-xs text-[#737B88]">
            Sorted by urgency · Click any row to open executive deep dive
          </span>
        </div>

        {/* Clean Table with Tabular Figures & Minimal Status Dots */}
        <div className="overflow-x-auto mt-2">
          <table className="w-full text-xs text-left min-w-[760px]">
            <thead>
              <tr className="text-[#737B88] font-medium border-b border-[#F1F5F9]">
                <th className="py-2.5 font-medium">Project</th>
                <th className="py-2.5 font-medium">Location</th>
                <th className="py-2.5 font-medium">Progress</th>
                <th className="py-2.5 font-medium text-right">Units Sold</th>
                <th className="py-2.5 font-medium text-right">Quality</th>
                <th className="py-2.5 font-medium text-right">Open NCs</th>
                <th className="py-2.5 font-medium text-right">Overdue WIRs</th>
                <th className="py-2.5 font-medium">Manager</th>
                <th className="py-2.5 font-medium">Status</th>
                <th className="py-2.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {(projectTableTab === 'attention' ? attentionProjects : scopedProjectMetrics).map(m => {
                const isCritical = m.healthCategory === 'Critical';
                const isAtRisk = m.healthCategory === 'At Risk';

                return (
                  <tr
                    key={m.project.id}
                    onClick={() => selectProject(m.project.id)}
                    className="hover:bg-[#FAFBFB] cursor-pointer transition-colors group"
                  >
                    <td className="py-3 font-medium text-[#17191D] group-hover:text-[#00594F] transition-colors">
                      {m.project.name}
                    </td>
                    <td className="py-3 text-[#737B88]">{m.project.city}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2 tabular-nums">
                        <span className="font-medium text-[#17191D]">{m.project.progressPercentage}%</span>
                        <div className="w-16 h-1 bg-[#F1F5F9] rounded-full overflow-hidden">
                          <div
                            className={clsx(
                              'h-full rounded-full',
                              isCritical ? 'bg-[#C63F43]' : isAtRisk ? 'bg-[#B7791F]' : 'bg-[#00594F]'
                            )}
                            style={{ width: `${m.project.progressPercentage}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-right tabular-nums text-[#737B88]">
                      {m.project.soldUnits} / {m.project.totalUnits}
                    </td>
                    <td className="py-3 text-right font-medium tabular-nums text-[#17191D]">
                      {m.qualityScore}/100
                    </td>
                    <td className="py-3 text-right tabular-nums">
                      <span className={clsx(m.openNCs > 0 && isCritical ? 'text-[#C63F43] font-semibold' : 'text-[#737B88]')}>
                        {m.openNCs}
                      </span>
                    </td>
                    <td className="py-3 text-right tabular-nums text-[#737B88]">
                      {m.overdueWIRs}
                    </td>
                    <td className="py-3 text-[#737B88]">{m.project.projectManager}</td>
                    <td className="py-3">
                      {/* Subtle Status Dots instead of Garish AI Pills */}
                      <span className="flex items-center gap-1.5 font-medium text-xs">
                        <span
                          className={clsx(
                            'w-1.5 h-1.5 rounded-full',
                            isCritical ? 'bg-[#DC2626]' : isAtRisk ? 'bg-[#D97706]' : 'bg-[#16805D]'
                          )}
                        />
                        <span className={clsx(
                          isCritical ? 'text-[#C63F43]' : isAtRisk ? 'text-[#B7791F]' : 'text-[#737B88]'
                        )}>
                          {isCritical ? 'Critical' : isAtRisk ? 'Requires attention' : 'On track'}
                        </span>
                      </span>
                    </td>
                    <td className="py-3 text-right text-slate-300 group-hover:text-[#17191D] transition-colors">
                      <ChevronRight size={13} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Project Detail Drawer */}
      {state.selectedProjectId && (
        <ProjectDetailDrawer
          projectId={state.selectedProjectId}
          onClose={() => selectProject(null)}
        />
      )}
    </div>
  );
}
