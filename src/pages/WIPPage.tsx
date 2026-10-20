// ============================================================
// PAGE 2 — WORK IN PROGRESS (WIP) OPERATIONAL MODULE
// Re-architected User Flow:
// 1. Filtering first (City, Status, Search)
// 2. Full-width WIP Skyline graph for all projects with 2-word localities
// 3. Project Cards with real site photos, tower summaries & photo-logged issues
// 4. Slide-over Inspector Drawer with tower graphs, dedicated floor selector,
//    and mobile site photo upload evidence view.
// ============================================================

import React, { useState, useMemo } from 'react';
import {
  Layers, Building2, CheckCircle2, AlertTriangle, Clock,
  ArrowRight, ChevronRight, Search, Filter, ShieldAlert,
  HardHat, Calendar, X, Camera, Upload, Check, ChevronDown,
  ExternalLink, Eye, MapPin
} from 'lucide-react';
import clsx from 'clsx';
import { useApp } from '../store/appStore';
import {
  PROJECTS, CONTRACTORS, TOWERS_DATA, FLOORS_DATA,
  type TowerBuilding, type FloorProgress, type WIPActivity,
} from '../data/seedData';
import { getWIPSummaryMetrics } from '../data/calculations';

// ── Locality Map (Two-word area + city) ──────────────────────
const LOCALITY_MAP: Record<string, string> = {
  P001: 'Worli, Mumbai',
  P002: 'Hebbal, Bengaluru',
  P003: 'Kalyani Nagar, Pune',
  P004: 'Golf Course Rd, Gurugram',
  P005: 'CBD Belapur, Navi Mumbai',
  P006: 'Gachibowli, Hyderabad',
  P007: 'Ghodbunder, Thane',
};

// ── Real Site Images Map ────────────────────────────────────
const PROJECT_IMAGES: Record<string, string> = {
  P001: '/projects/p001-meridian.jpg',
  P002: '/projects/p002-northgate.jpg',
  P003: '/projects/p003-cedar-park.jpg',
  P004: '/projects/p004-riverstone.jpg',
  P005: '/projects/p005-harbour-point.jpg',
  P006: '/projects/p006-summit-greens.jpg',
  P007: '/projects/p001-meridian.jpg',
};

// ── Real Defect Photos Map ──────────────────────────────────
const DEFECT_PHOTOS: Record<string, { image: string; statement: string; author: string; timestamp: string }> = {
  P004: {
    image: '/defects/nc-0001-cube-fail.jpg',
    statement: 'M35 RMC batch failing 28-day cube compression test (18.2 MPa). Heavy honeycombing observed at Grid C12–C21 column core.',
    author: 'T. Pillai (Site QA Lead)',
    timestamp: '14 Oct 2025, 11:42 AM · Mobile Upload',
  },
  P001: {
    image: '/defects/nc-0002-honeycombing.jpg',
    statement: 'Surface honeycombing on shear wall junction post shuttering stripping. Shuttering vibrator under-utilization.',
    author: 'M. Joshi (Quality Inspector)',
    timestamp: '12 Oct 2025, 03:15 PM · Mobile Upload',
  },
  P002: {
    image: '/defects/nc-0006-rebar-spacing.jpg',
    statement: 'Column tie stirrup spacing 220mm against 150mm specified structural drawing. Re-tying required before casting.',
    author: 'D. Sen (Site Engineer)',
    timestamp: '10 Oct 2025, 09:30 AM · Mobile Upload',
  },
};

const CITIES = ['All Locations', 'Mumbai', 'Pune', 'Bengaluru', 'Hyderabad', 'Gurugram'];
const STATUS_FILTERS = ['All Statuses', 'Critical Holds', 'Schedule Delayed', 'On Track'];

export function WIPPage() {
  const { state, setTab, selectWIR, selectNC, selectActivity } = useApp();

  // Filters
  const [selectedCity, setSelectedCity] = useState('All Locations');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All Statuses');
  const [searchQuery, setSearchQuery] = useState('');

  // Active Inspector Drawer State
  const [drawerProjectId, setDrawerProjectId] = useState<string | null>(null);
  const [drawerTowerName, setDrawerTowerName] = useState<string>('Tower 1');
  const [drawerFloorNumber, setDrawerFloorNumber] = useState<number>(5);

  // Upload simulation modal
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadedToast, setUploadedToast] = useState(false);

  // Floating hover tooltip for skyline
  const [hoveredSlab, setHoveredSlab] = useState<{
    x: number;
    y: number;
    projectName: string;
    towerName: string;
    floorNumber: number;
    stage: string;
    status: string;
    isCritical: boolean;
    issueTitle?: string;
  } | null>(null);

  // Filtered Projects
  const filteredProjects = useMemo(() => {
    return PROJECTS.filter(p => {
      // City
      if (selectedCity !== 'All Locations') {
        if (selectedCity.toLowerCase() === 'mumbai') {
          if (!['Mumbai', 'Navi Mumbai', 'Thane'].includes(p.city)) return false;
        } else if (p.city.toLowerCase() !== selectedCity.toLowerCase()) {
          return false;
        }
      }

      // Status Filter
      if (selectedStatusFilter === 'Critical Holds' && p.id !== 'P004') return false;
      if (selectedStatusFilter === 'Schedule Delayed' && p.delayedBuildings === 0) return false;
      if (selectedStatusFilter === 'On Track' && (p.id === 'P004' || p.delayedBuildings > 0)) return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const loc = (LOCALITY_MAP[p.id] || '').toLowerCase();
        if (!p.name.toLowerCase().includes(q) && !p.city.toLowerCase().includes(q) && !loc.includes(q)) {
          return false;
        }
      }

      return true;
    });
  }, [selectedCity, selectedStatusFilter, searchQuery]);

  // Drawer Selected Project & Towers
  const drawerProject = useMemo(() => {
    if (!drawerProjectId) return null;
    return PROJECTS.find(p => p.id === drawerProjectId) || null;
  }, [drawerProjectId]);

  const drawerTowers = useMemo(() => {
    if (!drawerProjectId) return [];
    return TOWERS_DATA.filter(t => t.projectId === drawerProjectId);
  }, [drawerProjectId]);

  // Active Tower inside drawer
  const activeDrawerTower = useMemo(() => {
    if (drawerTowers.length === 0) return null;
    return drawerTowers.find(t => t.name === drawerTowerName) || drawerTowers[0];
  }, [drawerTowers, drawerTowerName]);

  // Floors for active drawer tower
  const activeTowerFloors = useMemo(() => {
    if (!drawerProjectId || !activeDrawerTower) return [];
    return FLOORS_DATA.filter(f => f.projectId === drawerProjectId && f.tower === activeDrawerTower.name);
  }, [drawerProjectId, activeDrawerTower]);

  // Active Floor Record
  const activeFloorRecord = useMemo(() => {
    if (activeTowerFloors.length === 0) return null;
    return activeTowerFloors.find(f => f.floorNumber === drawerFloorNumber) || activeTowerFloors[0];
  }, [activeTowerFloors, drawerFloorNumber]);

  // Active Project Activities
  const drawerActivities = useMemo(() => {
    if (!drawerProjectId) return [];
    return state.wipActivities.filter(a => a.projectId === drawerProjectId);
  }, [drawerProjectId, state.wipActivities]);

  // Open Drawer handler
  const handleOpenDrawer = (projectId: string, towerName?: string, floorNum?: number) => {
    setDrawerProjectId(projectId);
    const towers = TOWERS_DATA.filter(t => t.projectId === projectId);
    const chosenTower = towerName || towers[0]?.name || 'Tower 1';
    setDrawerTowerName(chosenTower);
    setDrawerFloorNumber(floorNum || (projectId === 'P004' ? 5 : 4));
  };

  return (
    <div className="space-y-4 pb-12">
      {/* ============================================================
          TOP FILTER & SEARCH BAR (FILTERING IS TOP PRIORITY)
          ============================================================ */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-[#17191D]">
                WIP Construction Intelligence
              </h1>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#E6F4F1] text-[#00594F] border border-[#B3E0D8]">
                Multi-Project Pacing
              </span>
            </div>
            <p className="text-xs text-[#737B88] mt-0.5">
              Superstructure physical execution, floor casting progress, and on-site photo defect verifications.
            </p>
          </div>

          {/* Search box */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search project, locality or tower…"
              className="h-9 pl-8 pr-3 text-xs bg-slate-50 border border-[#E5E7EB] rounded-lg outline-none text-[#17191D] w-full sm:w-64 focus:bg-white focus:border-[#00594F] transition-all"
            />
          </div>
        </div>

        {/* Location & Status Filters */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#F1F5F9]">
          {/* Location Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
            {CITIES.map(city => (
              <button
                key={city}
                onClick={() => setSelectedCity(city)}
                className={clsx(
                  'px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all',
                  selectedCity === city
                    ? 'bg-[#17191D] text-white shadow-xs'
                    : 'text-[#737B88] hover:text-[#17191D] hover:bg-slate-100'
                )}
              >
                {city}
              </button>
            ))}
          </div>

          {/* Status Quick Filter */}
          <div className="flex items-center gap-1">
            {STATUS_FILTERS.map(st => (
              <button
                key={st}
                onClick={() => setSelectedStatusFilter(st)}
                className={clsx(
                  'px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all',
                  selectedStatusFilter === st
                    ? 'bg-[#00594F] text-white'
                    : 'bg-[#F1F5F9] text-[#737B88] hover:text-[#17191D]'
                )}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ============================================================
          SECTION 1: ENTIRE WIP GRAPH SPREAD THROUGHOUT FULL WIDTH
          Grouped by project with 2-word locality tags
          ============================================================ */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-2xs overflow-hidden">
        <div className="px-5 py-3 border-b border-[#F1F5F9] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers size={16} className="text-[#00594F]" />
            <h2 className="text-sm font-bold text-[#17191D]">
              Portfolio WIP Skyline — All Active Projects & Towers
            </h2>
            <span className="text-xs text-[#737B88] hidden sm:inline">
              · Spread full-width · Click any project to open side inspector
            </span>
          </div>

          <span className="text-xs text-[#737B88] font-medium">
            Showing <strong className="text-[#17191D]">{filteredProjects.length}</strong> Projects
          </span>
        </div>

        {/* Full-width Skyline Canvas */}
        <div className="p-5 bg-[#FAFBFB] flex items-end justify-start gap-8 overflow-x-auto min-h-[300px]">
          {filteredProjects.map(project => {
            const towers = TOWERS_DATA.filter(t => t.projectId === project.id);
            const locality = LOCALITY_MAP[project.id] || `${project.city}`;
            const isCrit = project.id === 'P004';
            const isDelayed = project.delayedBuildings > 0;

            return (
              <div
                key={project.id}
                onClick={() => handleOpenDrawer(project.id)}
                className={clsx(
                  'flex flex-col items-center p-3 rounded-xl border transition-all cursor-pointer group hover:shadow-md hover:-translate-y-0.5',
                  isCrit
                    ? 'border-red-200 bg-red-50/20'
                    : isDelayed
                    ? 'border-amber-200 bg-amber-50/20'
                    : 'border-slate-200 bg-white/70'
                )}
                style={{ minWidth: towers.length * 56 + 28 }}
              >
                {/* Towers Stack Row */}
                <div className="flex items-end justify-center gap-2.5 w-full">
                  {towers.map(tower => {
                    const total = tower.totalFloors;
                    const completed = tower.completedFloors;
                    const active = completed + 1;
                    const isTroubled = tower.projectId === 'P004' && tower.name === 'Tower 1';
                    const criticalFloor = isTroubled ? 5 : undefined;

                    const slabH = 6;
                    const gap = 1;

                    return (
                      <div
                        key={tower.id}
                        className="flex flex-col items-center group/tower"
                        style={{ width: 40 }}
                      >
                        {/* Progress % */}
                        <span className={clsx(
                          'text-[10px] font-bold tabular-nums mb-1',
                          tower.status === 'Delayed' ? 'text-[#C63F43]' : 'text-[#00594F]'
                        )}>
                          {tower.actualProgress}%
                        </span>

                        {/* Slabs Body */}
                        <div
                          className="w-full flex flex-col-reverse relative group-hover/tower:scale-105 transition-transform"
                          style={{ gap: `${gap}px` }}
                        >
                          {/* Roof Cap */}
                          <div
                            className="w-full h-1.5 rounded-t-sm"
                            style={{
                              backgroundColor: tower.status === 'Delayed' ? '#DC2626' : '#17191D',
                            }}
                          />

                          {/* Floor Slabs */}
                          {Array.from({ length: total }).map((_, fIdx) => {
                            const floorNum = fIdx + 1;
                            const isCompleted = floorNum <= completed;
                            const isActive = floorNum === active;
                            const isCriticalFloor = criticalFloor === floorNum;
                            const isDelayedFloor = tower.status === 'Delayed' && floorNum > completed && floorNum <= completed + 2;

                            let bg = '#E2E8F0';
                            if (isCriticalFloor) bg = '#DC2626';
                            else if (isCompleted) bg = '#00594F';
                            else if (isActive) bg = '#0D9488';
                            else if (isDelayedFloor) bg = '#D97706';

                            return (
                              <div
                                key={floorNum}
                                onMouseEnter={(e) => {
                                  const rect = e.currentTarget.getBoundingClientRect();
                                  setHoveredSlab({
                                    x: rect.right + 12,
                                    y: rect.top - 20,
                                    projectName: project.name,
                                    towerName: tower.name,
                                    floorNumber: floorNum,
                                    stage: isCompleted ? 'Completed Slab' : isActive ? tower.currentStage : 'Upcoming Slab',
                                    status: isCriticalFloor ? 'Critical Hold' : isCompleted ? 'Passed' : isActive ? 'Casting' : 'Scheduled',
                                    isCritical: isCriticalFloor,
                                    issueTitle: isCriticalFloor ? 'Concrete cube-test failure & honeycombing' : undefined,
                                  });
                                }}
                                onMouseLeave={() => setHoveredSlab(null)}
                                className="w-full rounded-[1px] relative"
                                style={{
                                  height: `${slabH}px`,
                                  backgroundColor: bg,
                                }}
                              >
                                {isCriticalFloor && (
                                  <span className="absolute -right-1 -top-0.5 w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                                )}
                              </div>
                            );
                          })}

                          {/* Base */}
                          <div className="w-full h-1 bg-slate-400 rounded-b-sm" />
                        </div>

                        {/* Tower Name */}
                        <span className="text-[9px] font-semibold text-[#17191D] mt-1.5 truncate max-w-full">
                          {tower.name}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Project Locality Footer */}
                <div className="mt-2.5 pt-2 border-t border-slate-200/60 w-full text-center">
                  <span className="text-xs font-bold text-[#17191D] block truncate group-hover:text-[#00594F] transition-colors">
                    {project.name}
                  </span>
                  <div className="flex items-center justify-center gap-1 text-[10px] text-[#737B88] font-semibold mt-0.5">
                    <MapPin size={10} className="text-[#00594F]" />
                    <span>{locality}</span>
                  </div>
                  <div className="text-[10px] text-[#737B88] mt-0.5 font-medium tabular-nums">
                    {project.progressPercentage}% progress · {towers.length} towers
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ============================================================
          SECTION 2: PROJECT CARDS GRID WITH REAL SITE IMAGES & DEFECTS
          Below the full-width graph: Each project card has tower summary,
          locality tag, real photo, and photo-logged site defect highlight.
          ============================================================ */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#17191D]">
              Project Construction Cards & On-Site Observation Feeds
            </h2>
            <p className="text-xs text-[#737B88]">
              Click any project card to inspect building elevations, select floor levels, and view uploaded defect photography.
            </p>
          </div>

          <span className="text-xs text-[#737B88]">
            {filteredProjects.length} Active Sites
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map(project => {
            const towers = TOWERS_DATA.filter(t => t.projectId === project.id);
            const locality = LOCALITY_MAP[project.id] || project.city;
            const projectImg = PROJECT_IMAGES[project.id] || '/projects/p001-meridian.jpg';
            const defect = DEFECT_PHOTOS[project.id];
            const isCrit = project.id === 'P004';
            const isDelayed = project.delayedBuildings > 0;

            const totalFloors = towers.reduce((acc, t) => acc + t.totalFloors, 0);
            const completedFloors = towers.reduce((acc, t) => acc + t.completedFloors, 0);

            return (
              <div
                key={project.id}
                onClick={() => handleOpenDrawer(project.id)}
                className="bg-white border border-[#E5E7EB] rounded-xl shadow-2xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between overflow-hidden cursor-pointer group"
              >
                <div>
                  {/* Real Project Site Image Header */}
                  <div className="relative h-40 w-full overflow-hidden bg-slate-100">
                    <img
                      src={projectImg}
                      alt={project.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {/* Badge on Image */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-black/60 text-white backdrop-blur-xs flex items-center gap-1">
                        <MapPin size={11} className="text-emerald-400" />
                        {locality}
                      </span>
                    </div>

                    <div className="absolute top-3 right-3">
                      <span className={clsx(
                        'px-2 py-0.5 rounded-md text-[11px] font-bold shadow-xs',
                        isCrit ? 'bg-red-600 text-white' : isDelayed ? 'bg-amber-500 text-white' : 'bg-emerald-600 text-white'
                      )}>
                        {isCrit ? 'Critical Hold' : isDelayed ? 'Delayed Path' : 'On Track'}
                      </span>
                    </div>

                    {/* Project Name on Image bottom */}
                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="text-base font-bold text-white tracking-tight">
                        {project.name}
                      </h3>
                      <p className="text-[11px] text-slate-200">
                        Manager: {project.projectManager} · QA: {project.qualityLead}
                      </p>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-3">
                    {/* Progress Bar & Variance */}
                    <div>
                      <div className="flex justify-between text-xs font-semibold text-[#17191D] mb-1">
                        <span>Physical Superstructure</span>
                        <span className="tabular-nums">
                          {project.progressPercentage}% <span className="text-[#737B88] font-normal">vs {project.targetProgressPercentage}% planned</span>
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                        <div
                          className={clsx(
                            'h-full rounded-full',
                            isCrit ? 'bg-[#DC2626]' : isDelayed ? 'bg-[#D97706]' : 'bg-[#00594F]'
                          )}
                          style={{ width: `${project.progressPercentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Tower & Slabs Summary Strip */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 rounded-lg bg-[#FAFBFB] border border-[#F1F5F9]">
                        <span className="text-[10px] text-[#737B88] font-medium block">Towers Active</span>
                        <span className="text-sm font-bold text-[#17191D] block mt-0.5">
                          {towers.length} Buildings
                        </span>
                        <span className="text-[10px] text-[#737B88]">
                          {towers.map(t => t.name).join(', ')}
                        </span>
                      </div>

                      <div className="p-2 rounded-lg bg-[#FAFBFB] border border-[#F1F5F9]">
                        <span className="text-[10px] text-[#737B88] font-medium block">Slabs Completed</span>
                        <span className="text-sm font-bold text-[#00594F] block mt-0.5">
                          {completedFloors} / {totalFloors}
                        </span>
                        <span className="text-[10px] text-[#737B88]">
                          {Math.round((completedFloors / Math.max(1, totalFloors)) * 100)}% superstructure cast
                        </span>
                      </div>
                    </div>

                    {/* Real Site Defect / Quality Status with Photo Preview */}
                    {defect ? (
                      <div className="p-3 rounded-lg border border-red-200 bg-red-50/30 space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-[#C63F43]">
                          <span className="flex items-center gap-1.5">
                            <ShieldAlert size={14} className="text-[#DC2626]" />
                            <span>Active Site Observation (Photo Uploaded)</span>
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-100 text-red-800">
                            Stop-Work
                          </span>
                        </div>

                        {/* Defect Photo & Statement */}
                        <div className="flex items-start gap-2.5">
                          <img
                            src={defect.image}
                            alt="Site Defect"
                            className="w-14 h-14 rounded-md object-cover border border-red-200 flex-shrink-0"
                          />
                          <div className="text-[11px] text-slate-700 leading-snug">
                            <p className="font-semibold text-[#17191D] line-clamp-2">
                              "{defect.statement}"
                            </p>
                            <p className="text-[10px] text-[#737B88] mt-1 font-medium">
                              {defect.author}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/20 flex items-center gap-2 text-xs text-emerald-800 font-semibold">
                        <CheckCircle2 size={16} className="text-[#16805D] flex-shrink-0" />
                        <span>All 1st-pass concrete WIRs signed off. No active stop-works.</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="px-4 py-2.5 bg-slate-50/80 border-t border-[#F1F5F9] flex items-center justify-between text-xs">
                  <span className="text-[11px] text-[#737B88] font-medium">
                    {project.totalUnits} Residential Units
                  </span>
                  <span className="text-[#00594F] font-bold group-hover:underline flex items-center gap-1">
                    Inspect Towers & Slabs <ChevronRight size={13} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ============================================================
          SECTION 3: SLIDE-OVER PROJECT INSPECTOR DRAWER
          "a side thing pops up with the project towels listed in graph
           at the top, below that summary of everything, and if I want
           to see one specific building, then after clicking on that building
           I see details with floor selection & site photo upload."
          ============================================================ */}
      {drawerProject && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-200 overflow-hidden">
            {/* Drawer Header */}
            <div className="p-5 border-b border-[#E5E7EB] bg-slate-50/60 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#00594F] text-white">
                    {LOCALITY_MAP[drawerProject.id] || drawerProject.city}
                  </span>
                  <h2 className="text-lg font-bold text-[#17191D]">
                    {drawerProject.name}
                  </h2>
                </div>
                <p className="text-xs text-[#737B88] mt-1">
                  Manager: <strong className="text-[#17191D]">{drawerProject.projectManager}</strong> · QA: <strong className="text-[#17191D]">{drawerProject.qualityLead}</strong> · {drawerProject.totalUnits} Units
                </p>
              </div>

              <button
                onClick={() => setDrawerProjectId(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-[#17191D] hover:bg-slate-200/60 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Drawer Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Top: Project Towers Skyline Graph */}
              <div className="bg-[#FAFBFB] border border-[#E5E7EB] rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-[#17191D]">
                    Tower Superstructures Elevation
                  </span>
                  <span className="text-[11px] text-[#737B88]">
                    Click any tower below to inspect
                  </span>
                </div>

                <div className="flex items-end justify-center gap-6 py-2">
                  {drawerTowers.map(tower => {
                    const isSelected = tower.name === activeDrawerTower?.name;
                    const total = tower.totalFloors;
                    const completed = tower.completedFloors;
                    const active = completed + 1;
                    const isTroubled = tower.projectId === 'P004' && tower.name === 'Tower 1';
                    const criticalFloor = isTroubled ? 5 : undefined;

                    return (
                      <div
                        key={tower.id}
                        onClick={() => setDrawerTowerName(tower.name)}
                        className={clsx(
                          'flex flex-col items-center p-3 rounded-xl border transition-all cursor-pointer',
                          isSelected
                            ? 'border-[#00594F] bg-white shadow-md ring-2 ring-[#00594F]/20'
                            : 'border-slate-200 bg-white/60 hover:border-slate-300'
                        )}
                        style={{ width: 110 }}
                      >
                        <span className={clsx(
                          'text-xs font-bold tabular-nums mb-1',
                          tower.status === 'Delayed' ? 'text-[#C63F43]' : 'text-[#00594F]'
                        )}>
                          {tower.actualProgress}%
                        </span>

                        {/* Stacking Slabs */}
                        <div className="w-16 flex flex-col-reverse gap-0.5">
                          <div
                            className="w-full h-1.5 rounded-t-sm"
                            style={{ backgroundColor: tower.status === 'Delayed' ? '#DC2626' : '#17191D' }}
                          />
                          {Array.from({ length: total }).map((_, idx) => {
                            const fNum = idx + 1;
                            const isCrit = criticalFloor === fNum;
                            const isDone = fNum <= completed;
                            const isCur = fNum === active;
                            const isFloorSelected = isSelected && fNum === drawerFloorNumber;

                            let bg = '#E2E8F0';
                            if (isCrit) bg = '#DC2626';
                            else if (isDone) bg = '#00594F';
                            else if (isCur) bg = '#0D9488';

                            return (
                              <div
                                key={fNum}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDrawerTowerName(tower.name);
                                  setDrawerFloorNumber(fNum);
                                }}
                                className={clsx(
                                  'w-full h-1.5 rounded-[1px] transition-all',
                                  isFloorSelected ? 'ring-2 ring-black scale-110 z-10' : ''
                                )}
                                style={{ backgroundColor: bg }}
                              />
                            );
                          })}
                          <div className="w-full h-1 bg-slate-400 rounded-b-sm" />
                        </div>

                        <span className="text-xs font-bold text-[#17191D] mt-2">
                          {tower.name}
                        </span>
                        <span className="text-[10px] text-[#737B88] tabular-nums">
                          {completed}/{total} floors
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* INTUITIVE FLOOR SELECTOR (NOT JUST CLICKING TINY GRAPH) */}
              <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 size={15} className="text-[#00594F]" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#17191D]">
                      Select Floor Level ({activeDrawerTower?.name})
                    </h3>
                  </div>
                  <span className="text-[11px] text-[#737B88]">
                    {activeDrawerTower?.totalFloors} Total Levels
                  </span>
                </div>

                {/* Floor Buttons Grid */}
                <div className="grid grid-cols-6 sm:grid-cols-8 gap-1.5">
                  {Array.from({ length: activeDrawerTower?.totalFloors || 12 }).map((_, idx) => {
                    const fNum = idx + 1;
                    const isCompleted = fNum <= (activeDrawerTower?.completedFloors || 0);
                    const isCritical = activeDrawerTower?.projectId === 'P004' && activeDrawerTower?.name === 'Tower 1' && fNum === 5;
                    const isSelected = drawerFloorNumber === fNum;

                    return (
                      <button
                        key={fNum}
                        onClick={() => setDrawerFloorNumber(fNum)}
                        className={clsx(
                          'h-9 rounded-lg text-xs font-bold transition-all flex flex-col items-center justify-center relative',
                          isSelected
                            ? 'bg-[#17191D] text-white shadow-xs scale-105'
                            : isCritical
                            ? 'bg-rose-100 text-[#C63F43] border border-rose-300'
                            : isCompleted
                            ? 'bg-teal-50 text-[#00594F] border border-teal-200'
                            : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                        )}
                      >
                        <span>F{String(fNum).padStart(2, '0')}</span>
                        {isCritical && (
                          <span className="w-1.5 h-1.5 rounded-full bg-red-600 absolute top-1 right-1" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SELECTED FLOOR INSPECTION CARD & REAL SITE PHOTO UPLOAD */}
              <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[#F1F5F9]">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#737B88] block">
                      Active Floor Detail
                    </span>
                    <h3 className="text-base font-bold text-[#17191D]">
                      {activeDrawerTower?.name} · Floor {String(drawerFloorNumber).padStart(2, '0')}
                    </h3>
                  </div>

                  <span className={clsx(
                    'text-xs font-bold px-2 py-0.5 rounded-full',
                    drawerProject.id === 'P004' && drawerFloorNumber === 5
                      ? 'bg-rose-100 text-[#C63F43] border border-rose-300'
                      : 'bg-emerald-100 text-[#16805D]'
                  )}>
                    {drawerProject.id === 'P004' && drawerFloorNumber === 5 ? 'Critical Stop-Work' : 'Poured & Approved'}
                  </span>
                </div>

                {/* Physical vs Inspected */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-[#FAFBFB] border border-[#F1F5F9]">
                    <span className="text-[10px] text-[#737B88] font-medium block">Physical Poured</span>
                    <span className="text-lg font-bold text-[#17191D] tabular-nums mt-0.5 block">
                      {drawerFloorNumber <= (activeDrawerTower?.completedFloors || 0) ? '100%' : drawerFloorNumber === 5 ? '80%' : '0%'}
                    </span>
                    <span className="text-[10px] text-[#737B88]">Superstructure concrete</span>
                  </div>

                  <div className="p-3 rounded-lg bg-[#FAFBFB] border border-[#F1F5F9]">
                    <span className="text-[10px] text-[#737B88] font-medium block">Quality Inspected</span>
                    <span className="text-lg font-bold text-[#16805D] tabular-nums mt-0.5 block">
                      {drawerFloorNumber <= (activeDrawerTower?.completedFloors || 0) ? '100%' : '0%'}
                    </span>
                    <span className="text-[10px] text-[#737B88]">Accepted WIR sign-off</span>
                  </div>
                </div>

                {/* ON-SITE CAMERA PHOTO UPLOAD & STATEMENT (USER'S EXACT VISION) */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#17191D] flex items-center gap-1.5">
                      <Camera size={14} className="text-[#00594F]" />
                      <span>On-Site Photo Evidence & Statement</span>
                    </span>

                    <button
                      onClick={() => setUploadModalOpen(true)}
                      className="px-2 py-1 rounded bg-[#17191D] text-white text-[10px] font-bold hover:bg-black transition-colors flex items-center gap-1 shadow-xs"
                    >
                      <Upload size={11} />
                      <span>Upload New Site Photo</span>
                    </button>
                  </div>

                  {/* Photo Display */}
                  {drawerProject.id === 'P004' && drawerFloorNumber === 5 ? (
                    <div className="space-y-2">
                      <div className="relative rounded-lg overflow-hidden border border-red-200">
                        <img
                          src="/defects/nc-0001-cube-fail.jpg"
                          alt="Cube test failure"
                          className="w-full h-44 object-cover"
                        />
                        <div className="absolute bottom-2 left-2 bg-black/75 backdrop-blur-xs text-white text-[10px] px-2 py-1 rounded font-mono">
                          GPS: 28.4595° N, 77.0266° E · Floor 05 Core
                        </div>
                      </div>

                      <div className="text-xs bg-white p-3 rounded-lg border border-red-200">
                        <p className="font-bold text-[#C63F43] mb-1">
                          Statement: "M35 RMC cube failed 28d strength test at 18.2 MPa. Column honeycombing logged at Grid C14. Stop-work notice issued."
                        </p>
                        <p className="text-[10px] text-[#737B88]">
                          Captured by: <strong className="text-[#17191D]">T. Pillai (Site Lead)</strong> · Assigned to: <strong className="text-[#17191D]">ABC Civil Works</strong> · 14 Oct 2025
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs text-[#737B88] text-center">
                      <CheckCircle2 size={18} className="text-[#16805D] mx-auto mb-1" />
                      <p className="font-semibold text-[#17191D]">No Defect Photos on this Level</p>
                      <p className="text-[11px]">Work verified compliant by quality inspection team.</p>
                    </div>
                  )}
                </div>

                {/* Work Packages Table for this Project */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-[#17191D] block">
                    Associated Work Packages ({drawerActivities.length})
                  </span>
                  <div className="space-y-1.5 max-h-44 overflow-y-auto text-xs">
                    {drawerActivities.slice(0, 4).map(act => (
                      <div
                        key={act.id}
                        onClick={() => selectActivity(act.id)}
                        className="p-2.5 rounded-lg border border-[#E5E7EB] hover:bg-slate-50 transition-colors flex items-center justify-between cursor-pointer"
                      >
                        <div>
                          <span className="font-bold text-[#17191D] block">{act.workPackage}</span>
                          <span className="text-[10px] text-[#737B88]">{act.tower} · {act.floor} · {act.stage}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-[#00594F] block">{act.actualProgress}%</span>
                          <span className="text-[10px] text-[#737B88]">{act.varianceDays < 0 ? `${act.varianceDays}d` : 'On track'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          SIMULATE SITE PHOTO UPLOAD MODAL
          Allows site engineers to snap photo on site & post issue
          ============================================================ */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Camera size={18} className="text-[#00594F]" />
                <h3 className="text-base font-bold text-[#17191D]">
                  Log New On-Site Photo Observation
                </h3>
              </div>
              <button
                onClick={() => setUploadModalOpen(false)}
                className="text-slate-400 hover:text-black"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-bold uppercase text-[#737B88] block mb-1">
                  Location / Slab
                </label>
                <input
                  type="text"
                  readOnly
                  value={`${drawerProject?.name} · ${activeDrawerTower?.name} · Floor ${drawerFloorNumber}`}
                  className="w-full h-8 px-2.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-800 font-semibold"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-[#737B88] block mb-1">
                  Select Issue Statement
                </label>
                <select className="w-full h-8 px-2.5 bg-white border border-[#E5E7EB] rounded-lg text-[#17191D] font-medium outline-none">
                  <option>Concrete Honeycombing Observed post-stripping</option>
                  <option>Rebar Spacing Deviation in Column Ties</option>
                  <option>RMC Slump Test Exceeded Specified Tolerance</option>
                  <option>Shuttering Formwork Leakage along Cold Joint</option>
                  <option>Curing Ponding Depleted ahead of 14-day cycle</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-[#737B88] block mb-1">
                  Attach Site Photo (Camera / File)
                </label>
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:bg-slate-50 transition-colors cursor-pointer">
                  <Camera size={24} className="text-slate-400 mx-auto mb-1" />
                  <span className="text-xs font-bold text-[#00594F] block">Tap to Capture from Camera</span>
                  <span className="text-[10px] text-[#737B88]">nc-0001-cube-fail.jpg auto-detected from mobile</span>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-[#737B88] block mb-1">
                  Severity Action
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button className="h-8 rounded-lg bg-red-100 text-red-800 border border-red-300 font-bold text-xs">
                    Stop-Work
                  </button>
                  <button className="h-8 rounded-lg bg-amber-100 text-amber-800 border border-amber-300 font-bold text-xs">
                    High
                  </button>
                  <button className="h-8 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 font-bold text-xs">
                    Medium
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t">
              <button
                onClick={() => setUploadModalOpen(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setUploadModalOpen(false);
                  setUploadedToast(true);
                  setTimeout(() => setUploadedToast(false), 3000);
                }}
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-[#00594F] text-white hover:bg-[#00473E] shadow-xs"
              >
                Upload & Log Observation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Toast */}
      {uploadedToast && (
        <div className="fixed top-4 right-4 z-50 bg-[#17191D] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 animate-in slide-in-from-top-2">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>Site observation & photo successfully synchronized to portfolio</span>
        </div>
      )}

      {/* Floating Hover Tooltip for Skyline */}
      {hoveredSlab && (
        <div
          className="fixed z-50 bg-[#17191D] text-white rounded-xl p-3 shadow-2xl pointer-events-none text-xs border border-slate-700/60 max-w-xs animate-in fade-in duration-100"
          style={{
            top: Math.max(10, Math.min(window.innerHeight - 200, hoveredSlab.y)),
            left: Math.max(10, Math.min(window.innerWidth - 300, hoveredSlab.x)),
          }}
        >
          <div className="flex items-center justify-between border-b border-slate-700 pb-1.5 mb-1.5">
            <span className="font-bold text-white">
              {hoveredSlab.projectName} · {hoveredSlab.towerName}
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
              Floor {String(hoveredSlab.floorNumber).padStart(2, '0')}
            </span>
          </div>

          <div className="space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-400">Stage:</span>
              <span className="font-semibold text-slate-200">{hoveredSlab.stage}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Status:</span>
              <span className={clsx(
                'font-bold',
                hoveredSlab.isCritical ? 'text-rose-400' : 'text-emerald-400'
              )}>
                {hoveredSlab.status}
              </span>
            </div>
            {hoveredSlab.issueTitle && (
              <div className="mt-1.5 pt-1.5 border-t border-slate-700 text-rose-300 font-semibold leading-tight">
                ⚠ {hoveredSlab.issueTitle}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
