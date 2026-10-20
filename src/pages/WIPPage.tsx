// ============================================================
// PAGE 2 — WIP: WORK IN PROGRESS (Central Operational Module)
// Highest Operational Priority after Overview
// Lets executives move from portfolio to City -> Project -> Tower -> Floor -> Activity
// ============================================================

import React, { useState, useMemo } from 'react';
import {
  Construction, Building2, Layers, CheckCircle2, AlertTriangle,
  Clock, ArrowRight, ChevronDown, ChevronRight, Search, SlidersHorizontal,
  Download, Calendar, ShieldAlert, HardHat, Filter
} from 'lucide-react';
import clsx from 'clsx';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line
} from 'recharts';
import { useApp } from '../store/appStore';
import {
  PROJECTS, CONTRACTORS, TOWERS_DATA, FLOORS_DATA,
  type TowerBuilding, type FloorProgress, type WIPActivity,
} from '../data/seedData';
import {
  getWIPSummaryMetrics, getProgressCurveData,
} from '../data/calculations';

const CITIES = [
  'All locations',
  'Mumbai',
  'Thane',
  'Navi Mumbai',
  'Pune',
  'Bengaluru',
  'Hyderabad',
  'Gurugram',
];

const STAGES = ['All Stages', 'Foundation', 'Column casting', 'Slab casting', 'Masonry', 'Plastering', 'Painting', 'Finishing'];
const STATUSES = ['All Statuses', 'In Progress', 'Delayed', 'Blocked', 'Completed'];

export function WIPPage() {
  const { state, setFilter, selectActivity, selectProject, selectWIR, selectNC, setTab } = useApp();

  // Dependent Hierarchy Selectors
  const [selectedCity, setSelectedCity] = useState(state.filters.city || 'All locations');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('P004'); // Default: Riverstone Towers (troubled showcase)
  const [selectedTower, setSelectedTower] = useState<string>('Tower 1');
  const [selectedFloor, setSelectedFloor] = useState<string>('Floor 05');
  const [selectedStage, setSelectedStage] = useState('All Stages');
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');
  const [activitySearch, setActivitySearch] = useState('');

  // Expandable Towers in Tree
  const [expandedTowers, setExpandedTowers] = useState<Record<string, boolean>>({
    'T010': true, // Tower 1
    'T011': false,
    'T012': false,
  });

  // WIP Summary Metrics for scope
  const summary = useMemo(
    () => getWIPSummaryMetrics(selectedCity, selectedProjectId || undefined),
    [selectedCity, selectedProjectId]
  );

  // Filtered Projects for City
  const availableProjects = useMemo(() => {
    if (selectedCity === 'All locations' || !selectedCity) return PROJECTS;
    if (selectedCity.toLowerCase() === 'mumbai') {
      return PROJECTS.filter(p => p.city === 'Mumbai' || p.city === 'Navi Mumbai' || p.city === 'Thane');
    }
    return PROJECTS.filter(p => p.city.toLowerCase() === selectedCity.toLowerCase());
  }, [selectedCity]);

  // Current Selected Project
  const currentProject = useMemo(() => {
    return PROJECTS.find(p => p.id === selectedProjectId) || availableProjects[0] || PROJECTS[0];
  }, [selectedProjectId, availableProjects]);

  // Towers for current Project
  const projectTowers = useMemo(() => {
    return TOWERS_DATA.filter(t => t.projectId === currentProject.id);
  }, [currentProject]);

  // Floors for active Tower
  const towerFloors = useMemo(() => {
    const activeTowerObj = projectTowers.find(t => t.name === selectedTower) || projectTowers[0];
    const towerName = activeTowerObj?.name || 'Tower 1';
    return FLOORS_DATA.filter(f => f.projectId === currentProject.id && f.tower === towerName);
  }, [currentProject, projectTowers, selectedTower]);

  // Activities for Table
  const filteredActivities = useMemo(() => {
    return state.wipActivities.filter(a => {
      if (selectedProjectId && a.projectId !== selectedProjectId) return false;
      if (selectedTower && a.tower !== selectedTower) return false;
      if (selectedFloor && a.floor !== selectedFloor) return false;
      if (selectedStage !== 'All Stages' && a.stage !== selectedStage) return false;
      if (selectedStatus !== 'All Statuses' && a.status !== selectedStatus) return false;
      if (activitySearch.trim()) {
        const q = activitySearch.toLowerCase();
        if (!a.workPackage.toLowerCase().includes(q) && !a.id.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [state.wipActivities, selectedProjectId, selectedTower, selectedFloor, selectedStage, selectedStatus, activitySearch]);

  // Progress Curve Data for Chart
  const curveData = useMemo(
    () => getProgressCurveData(selectedCity, selectedProjectId),
    [selectedCity, selectedProjectId]
  );

  const toggleTower = (id: string) => {
    setExpandedTowers(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-6">
      {/* ============================================================
          SECTION A: WIP HEADER & 5 COMPACT SUMMARY METRICS
          ============================================================ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#E5E7EB]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#20252D]">
              Work in Progress (WIP)
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-900 border border-blue-200">
              Core Operations
            </span>
          </div>
          <p className="text-xs text-[#697586] mt-0.5">
            Physical construction tracking across towers, floors and critical activities.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-[#697586]">Selected Project:</span>
          <span className="font-bold text-[#20252D] bg-white border border-[#E5E7EB] px-2.5 py-1 rounded-lg shadow-2xs">
            {currentProject.name} ({currentProject.city})
          </span>
        </div>
      </div>

      {/* 5 Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-3.5 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#697586] block mb-1">
            Total Buildings / Towers
          </span>
          <span className="text-xl font-black text-[#20252D]">
            {summary.totalBuildings}
          </span>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Across active scope
          </p>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-xl p-3.5 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#697586] block mb-1">
            Buildings Completed
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-black text-[#16805D]">
              {summary.buildingsCompleted}
            </span>
            <span className="text-xs text-slate-500">ready / handover</span>
          </div>
          <p className="text-[11px] text-[#16805D] mt-0.5">
            Structural & finishing signed off
          </p>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-xl p-3.5 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#697586] block mb-1">
            Under Construction
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-black text-blue-600">
              {summary.buildingsUnderConstruction}
            </span>
            <span className="text-xs text-slate-500">active towers</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Superstructure & wet works
          </p>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-xl p-3.5 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#697586] block mb-1">
            Behind Schedule
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-black text-[#C63F43]">
              {summary.buildingsDelayed}
            </span>
            <span className="text-xs text-[#C63F43] font-semibold">delayed towers</span>
          </div>
          <p className="text-[11px] text-[#C63F43] mt-0.5">
            Critical path pour hold-ups
          </p>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-xl p-3.5 shadow-2xs col-span-2 sm:col-span-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#697586] block mb-1">
            Physical vs Plan
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-black text-[#20252D]">
              {summary.overallActualProgress}%
            </span>
            <span className="text-xs text-slate-500">vs {summary.overallPlannedProgress}%</span>
          </div>
          <span className={clsx(
            'inline-block text-[10px] font-bold px-1.5 py-0.2 rounded mt-0.5',
            summary.progressVariance >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
          )}>
            {summary.progressVariance >= 0 ? `+${summary.progressVariance}% ahead` : `${summary.progressVariance}% variance`}
          </span>
        </div>
      </div>

      {/* ============================================================
          SECTION B: DEPENDENT HIERARCHICAL SELECTORS
          City → Project → Building / Tower → Floor
          ============================================================ */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 shadow-2xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-blue-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Construction Hierarchy Drill-Down
            </span>
          </div>
          <span className="text-[11px] text-slate-400">
            Select hierarchy to focus on specific towers, active floors and work packages
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Level 1: City */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              1. City
            </label>
            <select
              value={selectedCity}
              onChange={e => {
                const c = e.target.value;
                setSelectedCity(c);
                const projs = c === 'All locations' ? PROJECTS : PROJECTS.filter(p => p.city.toLowerCase() === c.toLowerCase());
                if (projs.length > 0) {
                  setSelectedProjectId(projs[0].id);
                  setSelectedTower(projs[0].towers[0]);
                }
              }}
              className="w-full h-8 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 outline-none"
            >
              {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Level 2: Project */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              2. Project
            </label>
            <select
              value={selectedProjectId}
              onChange={e => {
                const pid = e.target.value;
                setSelectedProjectId(pid);
                const proj = PROJECTS.find(p => p.id === pid);
                if (proj && proj.towers.length > 0) {
                  setSelectedTower(proj.towers[0]);
                }
              }}
              className="w-full h-8 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 outline-none"
            >
              {availableProjects.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.city})</option>
              ))}
            </select>
          </div>

          {/* Level 3: Building / Tower */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              3. Building / Tower
            </label>
            <select
              value={selectedTower}
              onChange={e => setSelectedTower(e.target.value)}
              className="w-full h-8 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 outline-none"
            >
              {currentProject.towers.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Level 4: Floor */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              4. Active Floor
            </label>
            <select
              value={selectedFloor}
              onChange={e => setSelectedFloor(e.target.value)}
              className="w-full h-8 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 outline-none"
            >
              <option value="">All Floors</option>
              {['Floor 01', 'Floor 02', 'Floor 03', 'Floor 04', 'Floor 05', 'Floor 06', 'Floor 07', 'Floor 08', 'Floor 09', 'Floor 10', 'Club House', 'Plinth', 'Basement'].map(f => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ============================================================
          SECTION C: PROGRESS AGAINST PLAN (S-Curve Timeline)
          Clear actual progress area, muted target reference, obvious variance
          ============================================================ */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#20252D]">
                Progress Against Plan: {currentProject.name}
              </h3>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                summary.progressVariance >= 0
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-rose-50 text-rose-700'
              }`}>
                {summary.progressVariance >= 0 ? 'On Track' : 'Behind Plan (-14% Variance)'}
              </span>
            </div>
            <p className="text-xs text-[#697586] mt-0.5">
              Monthly cumulative physical execution (green foreground area) versus baseline engineering target (slate dashed line)
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-slate-700">
              <span className="w-3 h-3 rounded-sm bg-[#16805D]" />
              <span>Actual Physical Progress</span>
            </span>
            <span className="flex items-center gap-1.5 text-slate-500">
              <span className="w-3 h-0.5 bg-slate-400" />
              <span>Baseline Plan</span>
            </span>
          </div>
        </div>

        {/* Chart */}
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={curveData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16805D" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#16805D" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#64748B' }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748B' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E2E8F0',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                  fontSize: '12px',
                }}
              />
              <Area
                type="monotone"
                dataKey="actual"
                stroke="#16805D"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#actualGradient)"
                name="Actual Progress %"
              />
              <Line
                type="monotone"
                dataKey="planned"
                stroke="#94A3B8"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={{ r: 3, fill: '#94A3B8' }}
                name="Planned Target %"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ============================================================
          SECTION D & E: FLOOR-WISE CONSTRUCTION STAGES MATRIX
          Shows physical progress vs quality-inspected approval
          ============================================================ */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-[#20252D]">
              Floor-Wise Construction Matrix: {currentProject.name} — {selectedTower}
            </h3>
            <p className="text-xs text-[#697586] mt-0.5">
              Distinguishes between <strong className="text-slate-700">physically completed work</strong> and <strong className="text-slate-700">accepted inspection approval</strong>
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-emerald-800">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600" />
              <span>Inspection Passed</span>
            </span>
            <span className="flex items-center gap-1.5 text-amber-800">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" />
              <span>Physically Done, Pending WIR</span>
            </span>
            <span className="flex items-center gap-1.5 text-rose-800">
              <span className="w-2.5 h-2.5 rounded-sm bg-rose-600" />
              <span>Rejected / NC Blocker</span>
            </span>
          </div>
        </div>

        {/* Floor Cards Elevation View */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {towerFloors.map(floor => {
            const hasInspectionGap = floor.physicalProgress > floor.inspectedProgress;
            const isBlocked = floor.status === 'Delayed';

            return (
              <div
                key={floor.id}
                onClick={() => setSelectedFloor(floor.floorName)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  selectedFloor === floor.floorName
                    ? 'border-blue-600 bg-blue-50/40 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-xs text-slate-900">{floor.floorName}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    floor.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                    floor.status === 'Delayed' ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {floor.status}
                  </span>
                </div>

                <div className="text-[11px] text-slate-600 mb-2">
                  Stage: <strong className="text-slate-800">{floor.stage}</strong>
                </div>

                {/* Progress bars: Physical vs Inspected */}
                <div className="space-y-1.5 text-[10px]">
                  <div>
                    <div className="flex justify-between text-slate-500 mb-0.5">
                      <span>Physical Execution</span>
                      <span className="font-bold text-slate-800">{floor.physicalProgress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full" style={{ width: `${floor.physicalProgress}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-500 mb-0.5">
                      <span>Quality Inspected</span>
                      <span className="font-bold text-emerald-700">{floor.inspectedProgress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${floor.inspectedProgress}%` }} />
                    </div>
                  </div>
                </div>

                {/* Discrepancy Alert */}
                {hasInspectionGap && (
                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-amber-700 font-semibold flex items-center gap-1">
                      <AlertTriangle size={12} />
                      <span>{floor.physicalProgress - floor.inspectedProgress}% unverified</span>
                    </span>
                    {floor.linkedWIRId && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setTab('wir');
                          selectWIR(floor.linkedWIRId!);
                        }}
                        className="text-blue-600 font-bold hover:underline"
                      >
                        {floor.linkedWIRId}
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {towerFloors.length === 0 && (
            <div className="col-span-full py-6 text-center text-xs text-slate-400">
              No floor activity records available for this tower in demo data.
            </div>
          )}
        </div>
      </div>

      {/* ============================================================
          SECTION F: ACTIVITY STATUS TABLE (Work Packages)
          Clicking row opens ActivityDetailDrawer
          ============================================================ */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-2xs overflow-hidden">
        {/* Table Header & Controls */}
        <div className="px-5 py-3.5 border-b border-[#E5E7EB] bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-[#20252D]">
              Active Work Packages Register ({filteredActivities.length})
            </h3>
            <p className="text-xs text-[#697586]">
              Detailed activity schedule, contractor assignments and quality inspection linkages
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                value={activitySearch}
                onChange={e => setActivitySearch(e.target.value)}
                placeholder="Search work packages…"
                className="h-8 pl-7 pr-3 text-xs bg-white border border-[#E5E7EB] rounded-lg outline-none text-[#20252D] w-36 sm:w-44"
              />
            </div>

            <select
              value={selectedStage}
              onChange={e => setSelectedStage(e.target.value)}
              className="h-8 px-2.5 bg-white border border-[#E5E7EB] rounded-lg text-xs font-medium text-[#20252D] outline-none"
            >
              {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="h-8 px-2.5 bg-white border border-[#E5E7EB] rounded-lg text-xs font-medium text-[#20252D] outline-none"
            >
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* The Activities Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-slate-50/70 text-[#697586] font-semibold">
                <th className="py-3 px-4">Activity & Location</th>
                <th className="py-3 px-3">Work Package</th>
                <th className="py-3 px-3">Stage</th>
                <th className="py-3 px-3">Planned Finish</th>
                <th className="py-3 px-3">Progress</th>
                <th className="py-3 px-3">Variance</th>
                <th className="py-3 px-3">Contractor</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4">Linked Quality</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {filteredActivities.map(act => {
                const contractor = CONTRACTORS.find(c => c.id === act.contractorId);
                const isDelayed = act.status === 'Delayed' || act.status === 'Blocked';

                return (
                  <tr
                    key={act.id}
                    onClick={() => selectActivity(act.id)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                  >
                    <td className="py-3 px-4">
                      <span className="font-mono text-xs font-bold text-slate-900 group-hover:text-blue-600">
                        {act.id}
                      </span>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {act.tower} · {act.floor}
                      </p>
                    </td>

                    <td className="py-3 px-3 font-semibold text-slate-900 max-w-xs truncate">
                      {act.workPackage}
                    </td>

                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium">
                        {act.stage}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-slate-600">
                      {act.plannedFinish}
                    </td>

                    <td className="py-3 px-3">
                      <div className="w-24">
                        <div className="flex justify-between text-[11px] font-semibold mb-0.5">
                          <span>{act.actualProgress}%</span>
                          <span className="text-slate-400">/ {act.plannedProgress}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              act.status === 'Blocked' ? 'bg-rose-500' :
                              act.status === 'Delayed' ? 'bg-amber-500' : 'bg-emerald-600'
                            }`}
                            style={{ width: `${act.actualProgress}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span className={`text-[11px] font-bold ${
                        act.varianceDays < 0 ? 'text-rose-600' : 'text-emerald-700'
                      }`}>
                        {act.varianceDays < 0 ? `${Math.abs(act.varianceDays)}d behind` : 'On track'}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-slate-700 font-medium">
                      {contractor?.name ?? 'ABC Civil'}
                    </td>

                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        act.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                        act.status === 'Blocked' ? 'bg-rose-100 text-rose-800' :
                        act.status === 'Delayed' ? 'bg-amber-100 text-amber-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {act.status}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        {act.linkedWIRId && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                            {act.linkedWIRId}
                          </span>
                        )}
                        {act.linkedNCId && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                            {act.linkedNCId}
                          </span>
                        )}
                        {!act.linkedWIRId && !act.linkedNCId && (
                          <span className="text-slate-300">—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredActivities.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No work package activities found matching the selected hierarchy filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
