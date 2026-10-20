// ============================================================
// DYNAMIC BUILDING SKYLINE — Stacked Floor Slab Visualization
// Code-driven, dynamic architectural elevations responsive to location
// Minimalist aesthetic: clean slabs, mullion lines, crane & roofline
// ============================================================

import React, { useState } from 'react';
import { MapPin, AlertTriangle, Eye, Layers } from 'lucide-react';
import clsx from 'clsx';
import { PROJECTS, TOWERS_DATA, FLOORS_DATA } from '../data/seedData';

interface DynamicBuildingSkylineProps {
  selectedCity: string;
  onSelectProject: (projectId: string) => void;
}

export function DynamicBuildingSkyline({ selectedCity, onSelectProject }: DynamicBuildingSkylineProps) {
  const [hoveredFloor, setHoveredFloor] = useState<{
    towerName: string;
    floorNum: number;
    stage: string;
    status: string;
    note?: string;
  } | null>(null);

  // Filter projects by selected city
  const cityProjects = PROJECTS.filter(p => {
    if (selectedCity === 'All locations' || selectedCity === 'All Locations') return true;
    if (selectedCity.toLowerCase() === 'mumbai') {
      return p.city === 'Mumbai' || p.city === 'Navi Mumbai' || p.city === 'Thane';
    }
    return p.city.toLowerCase() === selectedCity.toLowerCase();
  });

  // Pick showcase towers for each project
  const displayTowers = cityProjects.slice(0, 4).map(p => {
    const tower = TOWERS_DATA.find(t => t.projectId === p.id) || {
      id: `T-${p.id}`,
      projectId: p.id,
      name: p.towers[0] || 'Tower 1',
      totalFloors: 16,
      completedFloors: Math.round(16 * (p.progressPercentage / 100)),
      activeFloors: 2,
      delayedFloors: p.delayedBuildings > 0 ? 1 : 0,
      currentStage: p.stage,
      status: p.delayedBuildings > 0 ? 'Delayed' : 'On Track',
    };

    // Calculate slab counts
    const totalFloors = tower.totalFloors;
    const completedFloors = tower.completedFloors;
    const progressPct = p.progressPercentage;

    // Specific showcase critical floor (e.g. Riverstone Floor 05)
    const hasCritical = p.id === 'P004';
    const criticalFloorNum = hasCritical ? 5 : null;

    return {
      projectId: p.id,
      projectName: p.name,
      towerName: tower.name,
      city: p.city,
      totalFloors,
      completedFloors,
      progressPct,
      hasCritical,
      criticalFloorNum,
      isDelayed: tower.status === 'Delayed',
      stage: p.stage,
    };
  });

  return (
    <div className="relative w-full">
      {/* Dynamic Skyline Area */}
      <div className="h-[200px] w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl flex items-end justify-around px-4 pt-4 pb-2 relative overflow-hidden select-none">
        {/* Subtle Architecture Background Grid */}
        <div className="absolute inset-0 pointer-events-none opacity-20 flex flex-col justify-between py-3">
          <div className="border-b border-dashed border-slate-400 w-full" />
          <div className="border-b border-dashed border-slate-400 w-full" />
          <div className="border-b border-dashed border-slate-400 w-full" />
          <div className="border-b border-dashed border-slate-400 w-full" />
        </div>

        {/* Buildings Render */}
        {displayTowers.map(b => {
          // Height proportional to floor count (scaled to fit container)
          const maxContainerHeight = 150;
          const slabHeight = Math.max(4.5, Math.min(8, Math.floor(maxContainerHeight / b.totalFloors)));

          return (
            <div
              key={b.projectId}
              onClick={() => onSelectProject(b.projectId)}
              className="flex flex-col items-center cursor-pointer group transition-transform hover:scale-[1.02] flex-1 max-w-[140px] px-1 relative z-10"
            >
              {/* Percentage Pin Tag above Building */}
              <div className="mb-1 flex flex-col items-center">
                <span
                  className={clsx(
                    'text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-2xs leading-none transition-transform group-hover:-translate-y-0.5',
                    b.progressPct === 100
                      ? 'bg-emerald-50 text-[#10B981] border-emerald-200'
                      : b.hasCritical || b.isDelayed
                      ? 'bg-rose-50 text-[#EF4444] border-rose-200'
                      : 'bg-blue-50 text-[#315EFB] border-blue-200'
                  )}
                >
                  {b.progressPct}%
                </span>
                <div
                  className={clsx(
                    'w-0.5 h-1.5',
                    b.progressPct === 100
                      ? 'bg-emerald-300'
                      : b.hasCritical || b.isDelayed
                      ? 'bg-rose-300'
                      : 'bg-blue-300'
                  )}
                />
              </div>

              {/* Minimalist Rooftop Lift-Shaft & Parapet */}
              <div className="flex flex-col items-center w-full">
                {/* Parapet / Crane Detail */}
                <div className="w-8 h-2 border-t-2 border-r-2 border-slate-400 relative flex justify-end">
                  <div className="w-1 h-1.5 bg-slate-500 rounded-2xs" />
                </div>
                <div className="w-16 h-1 bg-slate-600 rounded-t-xs" />
              </div>

              {/* Stacked Floor Slabs (from top floor down to ground) */}
              <div
                className="w-16 sm:w-20 bg-white border border-slate-300 rounded-t-xs flex flex-col-reverse p-[1.5px] gap-[1.5px] shadow-2xs"
                style={{ height: `${b.totalFloors * (slabHeight + 1.5) + 4}px` }}
              >
                {Array.from({ length: b.totalFloors }, (_, i) => {
                  const floorNum = i + 1;
                  const isCompleted = floorNum <= b.completedFloors;
                  const isUnderConstruction = floorNum === b.completedFloors + 1;
                  const isCritical = b.hasCritical && floorNum === b.criticalFloorNum;

                  return (
                    <div
                      key={floorNum}
                      onMouseEnter={() =>
                        setHoveredFloor({
                          towerName: `${b.projectName} (${b.towerName})`,
                          floorNum,
                          stage: isCompleted ? 'Completed Slab' : isUnderConstruction ? 'Pouring & Rebar' : 'Upcoming Stage',
                          status: isCritical ? 'CRITICAL DEFECT' : isCompleted ? 'Passed' : isUnderConstruction ? 'Active' : 'Planned',
                          note: isCritical ? 'Cube test 28d failure & column honeycombing (Stop-Work Risk)' : undefined,
                        })
                      }
                      onMouseLeave={() => setHoveredFloor(null)}
                      style={{ height: `${slabHeight}px` }}
                      className={clsx(
                        'w-full rounded-2xs transition-colors flex items-center justify-around px-0.5 relative',
                        isCritical
                          ? 'bg-[#EF4444] animate-pulse ring-1 ring-red-500'
                          : isCompleted
                          ? 'bg-[#10B981]'
                          : isUnderConstruction
                          ? 'bg-[#315EFB]'
                          : 'bg-[#E2E8F0]'
                      )}
                    >
                      {/* Window mullion vertical dividers to look like building glass */}
                      <span className="w-px h-full bg-black/10" />
                      <span className="w-px h-full bg-black/10" />
                      <span className="w-px h-full bg-black/10" />

                      {/* Small warning dot on critical floor */}
                      {isCritical && (
                        <span className="absolute -right-2 top-0 w-2 h-2 rounded-full bg-rose-600 ring-2 ring-white" />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Foundation Ground Slab Line */}
              <div className="w-20 sm:w-24 h-1.5 bg-slate-400 rounded-b-sm mt-0.5" />
            </div>
          );
        })}

        {/* Hovered Floor Tooltip Overlay */}
        {hoveredFloor && (
          <div className="absolute top-2 left-3 bg-[#0F172A] text-white px-3 py-1.5 rounded-lg shadow-xl text-xs z-30 pointer-events-none border border-slate-700 animate-in fade-in duration-100">
            <div className="font-bold flex items-center gap-1.5">
              <span>{hoveredFloor.towerName}</span>
              <span className="text-[#94A3B8]">·</span>
              <span className="font-mono text-emerald-400">Floor {hoveredFloor.floorNum}</span>
            </div>
            <div className="text-[11px] text-slate-300 font-mono mt-0.5">
              {hoveredFloor.stage} · {hoveredFloor.status}
            </div>
            {hoveredFloor.note && (
              <div className="text-[10px] text-rose-300 font-mono mt-0.5 font-bold">
                ⚠️ {hoveredFloor.note}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Project Footers under Skyline */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3">
        {displayTowers.map(b => (
          <div
            key={b.projectId}
            onClick={() => onSelectProject(b.projectId)}
            className="cursor-pointer group"
          >
            <div className="text-xs font-bold text-[#0F172A] group-hover:text-[#315EFB] transition-colors truncate">
              {b.projectName}
            </div>
            <div className="text-[11px] text-[#64748B] flex items-center gap-1 mt-0.5">
              <MapPin size={10} className="text-[#94A3B8]" />
              <span>{b.city}</span>
              <span className="text-[10px] text-[#94A3B8] ml-1">({b.completedFloors}/{b.totalFloors} Fl)</span>
            </div>
            <div className="flex items-center gap-2 mt-1.5">
              <div className="flex-1 h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
                <div
                  className={clsx(
                    'h-full rounded-full transition-all duration-300',
                    b.progressPct === 100
                      ? 'bg-[#10B981]'
                      : b.hasCritical || b.isDelayed
                      ? 'bg-[#EF4444]'
                      : 'bg-[#10B981]'
                  )}
                  style={{ width: `${b.progressPct}%` }}
                />
              </div>
              <span className="text-xs font-bold text-[#0F172A] font-mono">{b.progressPct}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
