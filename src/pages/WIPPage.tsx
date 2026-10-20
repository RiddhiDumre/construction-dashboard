// ============================================================
// PAGE 2 — WORK IN PROGRESS (WIP) OPERATIONAL MODULE
// Streamlined, Un-Nested Architecture:
// 1. Top Filters & Search
// 2. Billboard Project Showcase (Luxury 3D Renders, Locality Tags, No micro-bars)
// 3. Direct Side-by-Side Project Construction Hub (Zero Nested Drawers):
//    - Left: Full architectural skyline with stacked slabs
//    - Right: Direct floor level picker, on-site mobile defect photo & statements
// ============================================================

import React, { useState, useMemo } from 'react';
import {
  Layers, Building2, CheckCircle2, AlertTriangle, Clock,
  ArrowRight, ChevronRight, Search, Filter, ShieldAlert,
  HardHat, Calendar, X, Camera, Upload, Check, ChevronDown,
  ExternalLink, MapPin
} from 'lucide-react';
import clsx from 'clsx';
import { useApp } from '../store/appStore';
import {
  PROJECTS, CONTRACTORS, TOWERS_DATA, FLOORS_DATA,
  type TowerBuilding, type FloorProgress, type WIPActivity,
} from '../data/seedData';

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

// ── Luxury Billboard Architectural Renders ──────────────────
const PROJECT_RENDERS: Record<string, string> = {
  P001: '/projects/p001-meridian.jpg',
  P002: '/projects/p002-northgate.jpg',
  P003: '/projects/p003-cedar-park.jpg',
  P004: '/projects/p004-riverstone.jpg',
  P005: '/projects/p005-harbour-point.jpg',
  P006: '/projects/p006-summit-greens.jpg',
  P007: '/projects/p007-vivanta.jpg',
};

// ── Real Site Defect Observation Feed ────────────────────────
const DEFECT_FEED: Record<string, { image: string; statement: string; author: string; timestamp: string; floorNum: number }> = {
  P004: {
    image: '/defects/nc-0001-cube-fail.jpg',
    statement: 'M35 RMC batch failed 28-day cube compression test (18.2 MPa). Heavy honeycombing observed at Grid C12–C21 column core. Structural stop-work active.',
    author: 'T. Pillai (Site QA Lead)',
    timestamp: '14 Oct 2025, 11:42 AM · Mobile Upload',
    floorNum: 5,
  },
  P001: {
    image: '/defects/nc-0002-honeycombing.jpg',
    statement: 'Surface honeycombing on shear wall junction post shuttering stripping. Shuttering vibrator under-compaction logged.',
    author: 'M. Joshi (Quality Inspector)',
    timestamp: '12 Oct 2025, 03:15 PM · Mobile Upload',
    floorNum: 6,
  },
  P002: {
    image: '/defects/nc-0006-rebar-spacing.jpg',
    statement: 'Column tie stirrup spacing 220mm against 150mm specified structural drawing. Re-tying required before concrete casting signoff.',
    author: 'D. Sen (Site Engineer)',
    timestamp: '10 Oct 2025, 09:30 AM · Mobile Upload',
    floorNum: 4,
  },
};

const CITIES = ['All Locations', 'Mumbai', 'Pune', 'Bengaluru', 'Hyderabad', 'Gurugram'];
const STATUS_FILTERS = ['All Statuses', 'Critical Holds', 'Schedule Delayed', 'On Pace'];

export function WIPPage() {
  const { state, setTab, selectWIR, selectNC, selectActivity } = useApp();

  // Filters
  const [selectedCity, setSelectedCity] = useState('All Locations');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All Statuses');
  const [searchQuery, setSearchQuery] = useState('');

  // Active Project Selection (Direct, un-nested!)
  const [activeProjectId, setActiveProjectId] = useState<string>(
    state.selectedProjectId || 'P004' // Default Riverstone Towers
  );

  // Active Tower Selection within Project
  const [activeTowerName, setActiveTowerName] = useState<string>('Tower 1');

  // Active Floor Selection within Tower
  const [activeFloorNumber, setActiveFloorNumber] = useState<number>(5);

  // Upload simulation modal
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadedToast, setUploadedToast] = useState(false);

  // Floating hover tooltip for skyline
  const [hoveredSlab, setHoveredSlab] = useState<{
    x: number;
    y: number;
    towerName: string;
    floorNumber: number;
    stage: string;
    status: string;
    isCritical: boolean;
    issueTitle?: string;
  } | null>(null);

  // Filtered Projects for Billboard Showcase
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

      // Status
      if (selectedStatusFilter === 'Critical Holds' && p.id !== 'P004') return false;
      if (selectedStatusFilter === 'Schedule Delayed' && p.delayedBuildings === 0) return false;
      if (selectedStatusFilter === 'On Pace' && (p.id === 'P004' || p.delayedBuildings > 0)) return false;

      // Search
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

  // Current Active Project
  const activeProject = useMemo(() => {
    return PROJECTS.find(p => p.id === activeProjectId) || PROJECTS[0];
  }, [activeProjectId]);

  // Towers for Active Project
  const activeTowers = useMemo(() => {
    return TOWERS_DATA.filter(t => t.projectId === activeProject.id);
  }, [activeProject]);

  // Active Tower Object
  const currentTower = useMemo(() => {
    return activeTowers.find(t => t.name === activeTowerName) || activeTowers[0] || TOWERS_DATA[0];
  }, [activeTowers, activeTowerName]);

  // Sync tower if project changes
  React.useEffect(() => {
    if (activeTowers.length > 0 && !activeTowers.some(t => t.name === activeTowerName)) {
      setActiveTowerName(activeTowers[0].name);
      setActiveFloorNumber(activeProject.id === 'P004' ? 5 : 4);
    }
  }, [activeProject, activeTowers, activeTowerName]);

  // Floors for Active Tower
  const towerFloors = useMemo(() => {
    return FLOORS_DATA.filter(f => f.projectId === activeProject.id && f.tower === currentTower.name);
  }, [activeProject, currentTower]);

  // Active Floor Record
  const currentFloorRecord = useMemo(() => {
    return towerFloors.find(f => f.floorNumber === activeFloorNumber) || towerFloors[0] || null;
  }, [towerFloors, activeFloorNumber]);

  // Work Packages on Active Floor
  const floorActivities = useMemo(() => {
    const floorStr = `Floor ${String(activeFloorNumber).padStart(2, '0')}`;
    return state.wipActivities.filter(a =>
      a.projectId === activeProject.id &&
      a.tower === currentTower.name &&
      a.floor === floorStr
    );
  }, [state.wipActivities, activeProject.id, currentTower.name, activeFloorNumber]);

  const activeDefect = DEFECT_FEED[activeProject.id];
  const hasDefectOnActiveFloor = activeDefect && activeDefect.floorNum === activeFloorNumber;

  return (
    <div className="space-y-4 pb-12">
      {/* ============================================================
          TOP LEVEL: FILTERS & SEARCH (PRIMARY CONTROLS)
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

        {/* Filter Controls Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#F1F5F9]">
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
          SHOWCASE CAROUSEL: BILLBOARD 3D ARCHITECTURAL RENDERS
          Direct project cards: Clicking any card focuses it immediately!
          NO micro progress bars! Uses big bold numbers & slab counts.
          ============================================================ */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[#737B88]">
            Select Project Portfolio ({filteredProjects.length} Developments)
          </span>
          <span className="text-[11px] text-[#737B88]">
            Click any project to inspect towers and floor casting directly below
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {filteredProjects.map(proj => {
            const active = proj.id === activeProject.id;
            const towers = TOWERS_DATA.filter(t => t.projectId === proj.id);
            const locality = LOCALITY_MAP[proj.id] || proj.city;
            const isCrit = proj.id === 'P004';
            const isDelayed = proj.delayedBuildings > 0;
            const totalFloors = towers.reduce((acc, t) => acc + t.totalFloors, 0);
            const completedFloors = towers.reduce((acc, t) => acc + t.completedFloors, 0);

            return (
              <div
                key={proj.id}
                onClick={() => setActiveProjectId(proj.id)}
                className={clsx(
                  'rounded-xl border transition-all cursor-pointer overflow-hidden flex flex-col justify-between group',
                  active
                    ? 'border-[#00594F] bg-white ring-2 ring-[#00594F] shadow-md scale-[1.02]'
                    : 'border-[#E5E7EB] bg-white hover:border-slate-300 hover:shadow-xs'
                )}
              >
                {/* Billboard Architectural Render Image */}
                <div className="relative h-28 w-full overflow-hidden bg-slate-100">
                  <img
                    src={PROJECT_RENDERS[proj.id] || '/projects/p001-meridian.jpg'}
                    alt={proj.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

                  {/* Top Locality Badge */}
                  <div className="absolute top-2 left-2">
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-black/60 text-white backdrop-blur-xs flex items-center gap-1">
                      <MapPin size={9} className="text-emerald-400" />
                      {locality}
                    </span>
                  </div>

                  {/* Status Dot */}
                  <div className="absolute top-2 right-2">
                    <span className={clsx(
                      'w-2 h-2 rounded-full block ring-2 ring-white',
                      isCrit ? 'bg-[#DC2626]' : isDelayed ? 'bg-[#D97706]' : 'bg-[#16805D]'
                    )} />
                  </div>

                  {/* Project Name */}
                  <div className="absolute bottom-2 left-2 right-2">
                    <h3 className="text-xs font-bold text-white tracking-tight truncate">
                      {proj.name}
                    </h3>
                  </div>
                </div>

                {/* Key Numbers (NO micro progress bars!) */}
                <div className="p-2.5 bg-white space-y-1 text-center">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-base font-black text-[#17191D] tabular-nums">
                      {proj.progressPercentage}%
                    </span>
                    <span className="text-[10px] text-[#737B88] font-medium">superstructure</span>
                  </div>

                  <div className="text-[10px] text-[#737B88] tabular-nums font-semibold">
                    <strong className="text-[#00594F]">{completedFloors}</strong> / {totalFloors} slabs cast
                  </div>

                  <div className="pt-1 border-t border-[#F1F5F9] text-[9px] font-bold">
                    <span className={clsx(
                      isCrit ? 'text-[#C63F43]' : isDelayed ? 'text-[#B7791F]' : 'text-[#16805D]'
                    )}>
                      {isCrit ? '⚠ Critical Hold' : isDelayed ? 'Schedule Delay' : 'On Pace'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ============================================================
          MAIN WORKSPACE: DIRECT SIDE-BY-SIDE ARCHITECTURAL HUB
          Zero nested drawers!
          Left (58%): Project Tower Elevations (Slab-by-Slab)
          Right (42%): Direct Floor Level Picker & Site Photo Evidence
          ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* ── LEFT: PROJECT ARCHITECTURAL SKYLINE (7 cols / 58%) ── */}
        <div className="lg:col-span-7 bg-white border border-[#E5E7EB] rounded-xl shadow-2xs p-5 flex flex-col justify-between">
          <div>
            {/* Header with Project Info & Locality */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#F1F5F9] gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-[#17191D] text-white">
                    {LOCALITY_MAP[activeProject.id] || activeProject.city}
                  </span>
                  <h2 className="text-base font-bold text-[#17191D]">
                    {activeProject.name} — Building Elevations
                  </h2>
                </div>
                <p className="text-xs text-[#737B88] mt-0.5">
                  Click any tower or floor slab directly to inspect casting progress.
                </p>
              </div>

              {/* Tower Tabs */}
              <div className="flex items-center gap-1">
                {activeTowers.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTowerName(t.name)}
                    className={clsx(
                      'px-2.5 py-1 rounded-md text-xs font-semibold transition-all',
                      activeTowerName === t.name
                        ? 'bg-[#00594F] text-white shadow-xs'
                        : 'bg-[#F1F5F9] text-[#737B88] hover:text-[#17191D]'
                    )}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Architectural Towers Canvas */}
            <div className="p-6 bg-[#FAFBFB] rounded-xl border border-[#F1F5F9] flex items-end justify-center gap-8 overflow-x-auto min-h-[340px] my-4">
              {activeTowers.map(tower => {
                const isCurrent = tower.name === activeTowerName;
                const total = tower.totalFloors;
                const completed = tower.completedFloors;
                const active = completed + 1;
                const isTroubled = tower.projectId === 'P004' && tower.name === 'Tower 1';
                const criticalFloor = isTroubled ? 5 : undefined;

                const slabH = 8;
                const gap = 1.5;

                return (
                  <div
                    key={tower.id}
                    onClick={() => setActiveTowerName(tower.name)}
                    className={clsx(
                      'flex flex-col items-center p-3.5 rounded-xl border transition-all cursor-pointer group',
                      isCurrent
                        ? 'border-[#00594F] bg-white shadow-md ring-2 ring-[#00594F]/20 scale-105'
                        : 'border-slate-200 bg-white/70 hover:border-slate-300'
                    )}
                    style={{ width: 130 }}
                  >
                    {/* Tower Header */}
                    <div className="w-full flex items-center justify-between text-xs mb-2">
                      <span className="font-bold text-[#17191D]">{tower.name}</span>
                      <span className={clsx(
                        'font-bold tabular-nums text-[11px]',
                        tower.status === 'Delayed' ? 'text-[#C63F43]' : 'text-[#00594F]'
                      )}>
                        {tower.actualProgress}%
                      </span>
                    </div>

                    {/* Stacking Slabs */}
                    <div
                      className="w-full flex flex-col-reverse relative group-hover:scale-[1.01] transition-transform"
                      style={{ gap: `${gap}px` }}
                    >
                      {/* Penthouse Cap */}
                      <div
                        className="w-full h-2 rounded-t-sm flex items-center justify-center text-[8px] font-bold text-white uppercase tracking-wider"
                        style={{
                          backgroundColor: tower.status === 'Delayed' ? '#DC2626' : '#17191D',
                        }}
                      >
                        Roof
                      </div>

                      {/* Slabs Loop */}
                      {Array.from({ length: total }).map((_, fIdx) => {
                        const floorNum = fIdx + 1;
                        const isCompleted = floorNum <= completed;
                        const isActive = floorNum === active;
                        const isCritical = criticalFloor === floorNum;
                        const isSelectedFloor = isCurrent && activeFloorNumber === floorNum;
                        const isDelayed = tower.status === 'Delayed' && floorNum > completed && floorNum <= completed + 2;

                        let bg = '#E2E8F0';
                        if (isCritical) bg = '#DC2626';
                        else if (isCompleted) bg = '#00594F';
                        else if (isActive) bg = '#0D9488';
                        else if (isDelayed) bg = '#D97706';

                        return (
                          <div
                            key={floorNum}
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveTowerName(tower.name);
                              setActiveFloorNumber(floorNum);
                            }}
                            onMouseEnter={(e) => {
                              const rect = e.currentTarget.getBoundingClientRect();
                              setHoveredSlab({
                                x: rect.right + 12,
                                y: rect.top - 20,
                                towerName: tower.name,
                                floorNumber: floorNum,
                                stage: isCompleted ? 'Completed Slab' : isActive ? tower.currentStage : 'Upcoming Slab',
                                status: isCritical ? 'Critical Hold' : isCompleted ? 'Inspection Passed' : isActive ? 'Active Pour' : 'Scheduled',
                                isCritical: isCritical,
                                issueTitle: isCritical ? 'Concrete cube-test failure & honeycombing' : undefined,
                              });
                            }}
                            onMouseLeave={() => setHoveredSlab(null)}
                            className={clsx(
                              'w-full rounded-[1px] relative cursor-pointer transition-all flex items-center justify-between px-1.5',
                              isSelectedFloor ? 'ring-2 ring-black z-10' : 'hover:opacity-80'
                            )}
                            style={{
                              height: `${slabH}px`,
                              backgroundColor: bg,
                            }}
                          >
                            <span className="text-[7px] font-bold text-white select-none">
                              {floorNum}
                            </span>
                            {isCritical && (
                              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                            )}
                          </div>
                        );
                      })}

                      {/* Plinth Base */}
                      <div className="w-full h-1.5 bg-slate-400 rounded-b-sm" />
                    </div>

                    <div className="mt-2.5 text-center w-full">
                      <span className="text-xs font-bold text-[#17191D] block">
                        {tower.currentStage}
                      </span>
                      <span className="text-[10px] text-[#737B88] tabular-nums block mt-0.5">
                        {completed}/{total} slabs cast ({tower.varianceDays >= 0 ? 'On pace' : `${Math.abs(tower.varianceDays)}d late`})
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Architectural Legend */}
          <div className="pt-3 border-t border-[#F1F5F9] flex flex-wrap items-center justify-between text-xs text-[#737B88] gap-2">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-[11px]">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#00594F]" />
                Completed & Passed
              </span>
              <span className="flex items-center gap-1.5 text-[11px]">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#0D9488]" />
                In Progress Casting
              </span>
              <span className="flex items-center gap-1.5 text-[11px]">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#D97706]" />
                Delayed Pours
              </span>
              <span className="flex items-center gap-1.5 text-[11px]">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#DC2626]" />
                Critical Defect Hold
              </span>
            </div>

            <span className="text-[11px] text-[#00594F] font-semibold">
              Currently Focusing: {currentTower.name} · Floor {activeFloorNumber}
            </span>
          </div>
        </div>

        {/* ── RIGHT: DIRECT FLOOR INSPECTOR & SITE DEFECT PHOTO (5 cols / 42%) ── */}
        <div className="lg:col-span-5 bg-white border border-[#E5E7EB] rounded-xl shadow-2xs p-5 flex flex-col justify-between space-y-4">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#737B88] block">
                  Interactive Floor Inspector
                </span>
                <h3 className="text-base font-bold text-[#17191D]">
                  {currentTower.name} · Floor {String(activeFloorNumber).padStart(2, '0')}
                </h3>
              </div>

              <span className={clsx(
                'text-xs font-bold px-2 py-0.5 rounded-full',
                hasDefectOnActiveFloor
                  ? 'bg-rose-100 text-[#C63F43] border border-rose-300'
                  : 'bg-emerald-100 text-[#16805D]'
              )}>
                {hasDefectOnActiveFloor ? 'Critical Hold Active' : 'Compliant'}
              </span>
            </div>

            {/* DIRECT FLOOR LEVEL PICKER (NOT JUST CLICKING TINY GRAPH!) */}
            <div className="space-y-1.5 my-3">
              <div className="flex items-center justify-between text-[11px] font-semibold text-[#737B88]">
                <span>Floor Level Selector ({currentTower.totalFloors} Levels)</span>
                <span>Tap any level to inspect</span>
              </div>

              <div className="grid grid-cols-6 sm:grid-cols-8 gap-1.5">
                {Array.from({ length: currentTower.totalFloors }).map((_, idx) => {
                  const fNum = idx + 1;
                  const isDone = fNum <= currentTower.completedFloors;
                  const isCrit = activeProject.id === 'P004' && currentTower.name === 'Tower 1' && fNum === 5;
                  const isSel = activeFloorNumber === fNum;

                  return (
                    <button
                      key={fNum}
                      onClick={() => setActiveFloorNumber(fNum)}
                      className={clsx(
                        'h-8 rounded-lg text-xs font-bold transition-all flex flex-col items-center justify-center relative',
                        isSel
                          ? 'bg-[#17191D] text-white shadow-xs scale-105'
                          : isCrit
                          ? 'bg-rose-100 text-[#C63F43] border border-rose-300'
                          : isDone
                          ? 'bg-teal-50 text-[#00594F] border border-teal-200'
                          : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                      )}
                    >
                      <span>F{String(fNum).padStart(2, '0')}</span>
                      {isCrit && (
                        <span className="w-1.5 h-1.5 rounded-full bg-red-600 absolute top-1 right-1" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Floor Metrics (NO micro progress bars!) */}
            <div className="grid grid-cols-2 gap-2 text-xs my-3">
              <div className="p-2.5 rounded-lg bg-[#FAFBFB] border border-[#F1F5F9]">
                <span className="text-[10px] text-[#737B88] font-medium block">Physical Execution</span>
                <span className="text-lg font-black text-[#17191D] tabular-nums mt-0.5 block">
                  {activeFloorNumber <= currentTower.completedFloors ? '100%' : activeFloorNumber === 5 && activeProject.id === 'P004' ? '80%' : '0%'}
                </span>
                <span className="text-[10px] text-[#737B88]">
                  {activeFloorNumber <= currentTower.completedFloors ? 'Concrete cast complete' : 'In casting cycle'}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-[#FAFBFB] border border-[#F1F5F9]">
                <span className="text-[10px] text-[#737B88] font-medium block">Quality Verification</span>
                <span className="text-lg font-black text-[#16805D] tabular-nums mt-0.5 block">
                  {activeFloorNumber <= currentTower.completedFloors ? '100%' : '0%'}
                </span>
                <span className="text-[10px] text-[#737B88]">
                  {hasDefectOnActiveFloor ? 'Blocked by testing' : 'Signed off'}
                </span>
              </div>
            </div>

            {/* REAL ON-SITE CAMERA DEFECT PHOTO EVIDENCE & STATEMENT */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#17191D] flex items-center gap-1.5">
                  <Camera size={14} className="text-[#00594F]" />
                  <span>On-Site Observation Photo & Defect Statement</span>
                </span>

                <button
                  onClick={() => setUploadModalOpen(true)}
                  className="px-2 py-1 rounded bg-[#17191D] text-white text-[10px] font-bold hover:bg-black transition-colors flex items-center gap-1 shadow-xs"
                >
                  <Upload size={10} />
                  <span>Log Site Photo</span>
                </button>
              </div>

              {hasDefectOnActiveFloor ? (
                <div className="space-y-2">
                  <div className="relative rounded-lg overflow-hidden border border-red-200 bg-black">
                    <img
                      src={activeDefect.image}
                      alt="Defect"
                      className="w-full h-40 object-cover"
                    />
                    <div className="absolute bottom-2 left-2 bg-black/75 backdrop-blur-xs text-white text-[9px] px-2 py-0.5 rounded font-mono">
                      GPS: 28.4595° N, 77.0266° E · Floor {activeFloorNumber} Core
                    </div>
                  </div>

                  <div className="text-xs bg-white p-3 rounded-lg border border-red-200 space-y-1">
                    <p className="font-bold text-[#C63F43] leading-snug">
                      "{activeDefect.statement}"
                    </p>
                    <p className="text-[10px] text-[#737B88]">
                      {activeDefect.author} · {activeDefect.timestamp}
                    </p>
                    <div className="pt-2 flex items-center gap-2">
                      <button
                        onClick={() => {
                          setTab('nc');
                          selectNC('NC-0001');
                        }}
                        className="px-2.5 py-1 rounded bg-red-600 text-white text-[10px] font-bold hover:bg-red-700 transition-colors"
                      >
                        Inspect NC-0001 →
                      </button>
                      <button
                        onClick={() => {
                          setTab('wir');
                          selectWIR('WIR-0021');
                        }}
                        className="px-2.5 py-1 rounded bg-slate-100 text-slate-800 text-[10px] font-bold hover:bg-slate-200 transition-colors"
                      >
                        Inspect WIR-0021 →
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs text-[#737B88] text-center">
                  <CheckCircle2 size={18} className="text-[#16805D] mx-auto mb-1" />
                  <p className="font-semibold text-[#17191D]">All Reinforcement & Concrete Compliant</p>
                  <p className="text-[10px]">No active defect observations registered on this floor level.</p>
                </div>
              )}
            </div>

            {/* Active Floor Work Packages */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-bold text-[#17191D] block">
                Active Work Packages on Level {activeFloorNumber}
              </span>
              <div className="space-y-1 max-h-36 overflow-y-auto text-xs">
                {floorActivities.length > 0 ? (
                  floorActivities.map(act => (
                    <div
                      key={act.id}
                      onClick={() => selectActivity(act.id)}
                      className="p-2 rounded-lg border border-[#E5E7EB] hover:bg-slate-50 transition-colors flex items-center justify-between cursor-pointer"
                    >
                      <div>
                        <span className="font-bold text-[#17191D] block text-[11px]">{act.workPackage}</span>
                        <span className="text-[10px] text-[#737B88]">{act.stage} · {act.projectManager}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-[#00594F] block tabular-nums">{act.actualProgress}%</span>
                        <span className={clsx(
                          'text-[10px] font-medium',
                          act.varianceDays < 0 ? 'text-[#C63F43]' : 'text-[#16805D]'
                        )}>
                          {act.varianceDays < 0 ? `${act.varianceDays}d late` : 'On pace'}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-2.5 text-center text-[11px] text-[#737B88] bg-[#FAFBFB] rounded-lg border border-[#F1F5F9]">
                    Standard routine slab casting cycle. No blocked activities.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#F1F5F9] flex items-center justify-between text-xs text-[#737B88]">
            <span>Contractor: <strong>{currentTower.contractorId === 'C001' ? 'ABC Civil Works' : 'Sharma Formwork'}</strong></span>
            <span>Target Slabs: <strong>{currentTower.completedFloors}/{currentTower.totalFloors} Cast</strong></span>
          </div>
        </div>
      </div>

      {/* ============================================================
          SIMULATE SITE PHOTO UPLOAD MODAL
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
                  value={`${activeProject.name} · ${currentTower.name} · Floor ${activeFloorNumber}`}
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
                  <span className="text-xs font-bold text-[#00594F] block">Tap to Capture from Mobile Camera</span>
                  <span className="text-[10px] text-[#737B88]">nc-0001-cube-fail.jpg auto-detected from mobile upload</span>
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

      {/* Floating Hover Tooltip for Skyline Slabs */}
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
              {hoveredSlab.towerName}
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
