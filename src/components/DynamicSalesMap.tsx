// ============================================================
// DYNAMIC SALES & CONSTRUCTION MAP
// Dynamic vector map responsive to active city selection
// Interactive project radar pins & dynamic floating stats card
// ============================================================

import React from 'react';
import clsx from 'clsx';
import { Building2, Home, BarChart3, ShieldCheck, ChevronRight, Maximize2 } from 'lucide-react';
import { PROJECTS } from '../data/seedData';
import { useApp } from '../store/appStore';
import { getOverviewPortfolioKPIs, getCXOCommercialInventory } from '../data/calculations';

interface DynamicSalesMapProps {
  selectedCity: string;
  onSelectProject: (projectId: string) => void;
}

export function DynamicSalesMap({ selectedCity, onSelectProject }: DynamicSalesMapProps) {
  const { state } = useApp();

  // Scoped metrics for the floating card
  const kpis = getOverviewPortfolioKPIs(selectedCity, state.weights, state.wirs, state.ncs);
  const commercial = getCXOCommercialInventory(selectedCity);

  // Filter projects by city
  const cityProjects = PROJECTS.filter(p => {
    if (selectedCity === 'All locations' || selectedCity === 'All Locations') return true;
    if (selectedCity.toLowerCase() === 'mumbai') {
      return p.city === 'Mumbai' || p.city === 'Navi Mumbai' || p.city === 'Thane';
    }
    return p.city.toLowerCase() === selectedCity.toLowerCase();
  });

  // Coordinates for pins (normalized 0-100 percentage inside map SVG)
  const pinCoordinates: Record<string, { x: number; y: number; label: string }> = {
    P001: { x: 38, y: 64, label: 'Meridian Heights (Mumbai)' },
    P002: { x: 42, y: 72, label: 'Northgate Residences (Bengaluru)' },
    P003: { x: 55, y: 58, label: 'Cedar Park (Pune)' },
    P004: { x: 45, y: 32, label: 'Riverstone Towers (Gurugram)' },
    P005: { x: 62, y: 75, label: 'Harbour Point (Navi Mumbai)' },
    P006: { x: 50, y: 60, label: 'Summit Greens (Hyderabad)' },
    P007: { x: 52, y: 38, label: 'Vivanta Sereno (Thane)' },
  };

  return (
    <div className="relative w-full h-[185px] rounded-xl overflow-hidden bg-[#EDF2F7] border border-[#E2E8F0] select-none">
      {/* Stylized SVG Map Background */}
      <svg
        className="w-full h-full object-cover"
        viewBox="0 0 320 180"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Ocean / Bay Water */}
        <rect width="320" height="180" fill="#E2E8F0" />

        {/* Coastal Landmass Curves */}
        <path
          d="M0,0 L180,0 C170,40 140,60 130,90 C120,120 100,140 85,180 L0,180 Z"
          fill="#F1F5F9"
          stroke="#CBD5E1"
          strokeWidth="1"
        />
        {/* Mainland Landmass */}
        <path
          d="M140,0 L320,0 L320,180 L120,180 C135,140 155,120 160,80 C165,50 150,20 140,0 Z"
          fill="#F8FAFC"
          stroke="#CBD5E1"
          strokeWidth="1"
        />

        {/* Road & Transit Network Lines */}
        <path
          d="M30,180 C60,130 90,80 140,40 L200,20"
          stroke="#CBD5E1"
          strokeWidth="1.5"
          strokeDasharray="2 2"
          fill="none"
        />
        <path
          d="M90,90 L220,95 L300,120"
          stroke="#CBD5E1"
          strokeWidth="1"
          strokeDasharray="3 3"
          fill="none"
        />
        <path
          d="M160,20 L180,160"
          stroke="#E2E8F0"
          strokeWidth="2"
          fill="none"
        />

        {/* Geographic labels */}
        <text x="18" y="165" fontSize="8" fill="#94A3B8" fontWeight="600" letterSpacing="0.5">
          ARABIAN SEA
        </text>
        <text x="175" y="45" fontSize="8" fill="#94A3B8" fontWeight="bold">
          Thane
        </text>
        <text x="95" y="115" fontSize="8" fill="#94A3B8" fontWeight="bold">
          Mumbai
        </text>
        <text x="180" y="145" fontSize="8" fill="#94A3B8" fontWeight="bold">
          Navi Mumbai
        </text>
      </svg>

      {/* Dynamic Project Radar Pins */}
      {cityProjects.map(p => {
        const coords = pinCoordinates[p.id] || { x: 50, y: 50, label: p.name };
        const isCritical = p.id === 'P004';
        const isAtRisk = p.delayedBuildings > 0;

        return (
          <div
            key={p.id}
            onClick={() => onSelectProject(p.id)}
            style={{ left: `${coords.x}%`, top: `${coords.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20"
            title={`${p.name} (${p.city}) · Click to inspect`}
          >
            {/* Pulsing Outer Radar Ring */}
            <span
              className={clsx(
                'absolute -inset-1.5 rounded-full animate-ping opacity-60',
                isCritical ? 'bg-rose-500' : isAtRisk ? 'bg-amber-500' : 'bg-emerald-500'
              )}
            />
            {/* Pin Center Dot */}
            <div
              className={clsx(
                'relative w-3.5 h-3.5 rounded-full border-2 border-white shadow-md flex items-center justify-center transition-transform group-hover:scale-125',
                isCritical ? 'bg-[#EF4444]' : isAtRisk ? 'bg-[#F59E0B]' : 'bg-[#10B981]'
              )}
            >
              <div className="w-1 h-1 bg-white rounded-full" />
            </div>

            {/* Hover Tooltip */}
            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 bg-[#0F172A] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
              {p.name}
            </div>
          </div>
        );
      })}

      {/* Dynamic Floating Summary Card (Updates according to selected location) */}
      <div className="absolute top-2.5 right-2.5 bg-white/95 backdrop-blur-xs border border-[#E2E8F0] rounded-xl p-2.5 shadow-md w-38 text-xs z-20">
        <div className="flex items-center justify-between font-bold text-[#0F172A] pb-1 border-b border-slate-100 mb-1">
          <span className="truncate">{selectedCity}</span>
          <ChevronRight size={12} className="text-slate-400 flex-shrink-0" />
        </div>
        <div className="space-y-1 text-[11px] text-[#64748B]">
          <div className="flex items-center gap-1.5">
            <Building2 size={11} className="text-slate-400 flex-shrink-0" />
            <span className="font-semibold text-slate-800">{cityProjects.length} Projects</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Home size={11} className="text-slate-400 flex-shrink-0" />
            <span className="font-semibold text-slate-800">{commercial.soldUnits} Units Sold</span>
          </div>
          <div className="flex items-center gap-1.5">
            <BarChart3 size={11} className="text-slate-400 flex-shrink-0" />
            <span className="font-semibold text-slate-800">{kpis.overallProgress}% Construction</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={11} className="text-slate-400 flex-shrink-0" />
            <span className="font-semibold text-slate-800">{kpis.portfolioQualityScore} Quality Score</span>
          </div>
        </div>
      </div>
    </div>
  );
}
