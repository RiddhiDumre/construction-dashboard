// ============================================================
// PAGE: COMMERCIAL & UNIT INVENTORY INTELLIGENCE
// Dedicated CXO view for residential and commercial unit inventory,
// booked value (₹ Cr), sales absorption vs construction delivery pace.
// ============================================================

import React, { useState, useMemo } from 'react';
import {
  Building2, TrendingUp, DollarSign, PieChart, Layers,
  ChevronRight, ArrowUpRight, CheckCircle2, AlertCircle, Filter, Download
} from 'lucide-react';
import clsx from 'clsx';
import { useApp } from '../store/appStore';
import { getCXOCommercialInventory } from '../data/calculations';
import { PROJECTS, TOWERS_DATA } from '../data/seedData';

const CITIES = ['All Locations', 'Mumbai', 'Pune', 'Bengaluru', 'Hyderabad', 'Gurugram'];

export function CommercialUnitsPage() {
  const { selectProject, setTab } = useApp();
  const [selectedCity, setSelectedCity] = useState('All Locations');
  const [selectedType, setSelectedType] = useState('All Configurations');

  const commercial = useMemo(
    () => getCXOCommercialInventory(selectedCity),
    [selectedCity]
  );

  return (
    <div className="space-y-4 pb-12">
      {/* ============================================================
          HEADER & REGIONAL SCOPE
          ============================================================ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5E7EB]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#17191D]">
              Commercial & Unit Inventory
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#E6F4F1] text-[#00594F] border border-[#B3E0D8]">
              Sales & Inventory Intelligence
            </span>
          </div>
          <p className="text-xs text-[#737B88] mt-0.5">
            Portfolio absorption pacing, booked revenue realization (₹ Cr), and delivery milestone alignment.
          </p>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
          {CITIES.map(city => (
            <button
              key={city}
              onClick={() => setSelectedCity(city)}
              className={clsx(
                'px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all',
                selectedCity === city
                  ? 'bg-[#17191D] text-white shadow-xs'
                  : 'bg-white border border-[#E5E7EB] text-[#737B88] hover:text-[#17191D]'
              )}
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      {/* ============================================================
          TOP 4 COMMERCIAL SUMMARY KPIS
          ============================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* KPI 1: Realized Booked Value */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4.5 shadow-2xs flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#737B88]">
              Booked Realization Value
            </span>
            <div className="mt-1.5 flex items-baseline gap-1.5">
              <span className="text-3xl sm:text-4xl font-black text-[#17191D] tracking-tight tabular-nums">
                ₹{commercial.bookedValueCr.toLocaleString('en-IN')}
              </span>
              <span className="text-sm font-bold text-[#737B88]">Cr</span>
            </div>
            <div className="text-xs text-[#737B88] mt-1 font-medium">
              of <strong className="text-[#17191D]">₹{commercial.totalInventoryCr.toLocaleString('en-IN')} Cr</strong> total launch inventory
            </div>
          </div>
          <div className="w-full h-1.5 bg-[#F1F5F9] rounded-full mt-3 overflow-hidden">
            <div
              className="h-full bg-[#00594F] rounded-full"
              style={{
                width: `${Math.round((commercial.bookedValueCr / Math.max(1, commercial.totalInventoryCr)) * 100)}%`,
              }}
            />
          </div>
        </div>

        {/* KPI 2: Total Units Sold */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4.5 shadow-2xs flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#737B88]">
              Total Units Sold
            </span>
            <div className="mt-1.5 flex items-baseline gap-1.5">
              <span className="text-3xl sm:text-4xl font-black text-[#00594F] tracking-tight tabular-nums">
                {commercial.soldUnits.toLocaleString('en-IN')}
              </span>
              <span className="text-sm font-bold text-[#737B88]">
                / {commercial.totalUnits.toLocaleString('en-IN')} units
              </span>
            </div>
            <div className="text-xs text-[#737B88] mt-1 font-medium">
              <strong className="text-[#00594F]">{commercial.soldPercent}% overall absorption</strong>
              <span> · {commercial.leftUnits} units available</span>
            </div>
          </div>
          {/* 20-block absorption track */}
          <div className="mt-3 flex items-center gap-1">
            {Array.from({ length: 20 }).map((_, i) => {
              const filled = i < Math.round((commercial.soldPercent / 100) * 20);
              return (
                <div
                  key={i}
                  className={clsx(
                    'flex-1 h-1.5 rounded-full transition-colors',
                    filled ? 'bg-[#00594F]' : 'bg-[#E5E7EB]'
                  )}
                />
              );
            })}
          </div>
        </div>

        {/* KPI 3: Units Under Construction vs Completed */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4.5 shadow-2xs flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#737B88]">
              Under-Construction Inventory
            </span>
            <div className="mt-1.5 flex items-baseline gap-1.5">
              <span className="text-3xl sm:text-4xl font-black text-[#17191D] tracking-tight tabular-nums">
                {commercial.underConstructionUnits.toLocaleString('en-IN')}
              </span>
              <span className="text-xs font-semibold text-[#737B88]">units active</span>
            </div>
            <div className="text-xs text-[#737B88] mt-1 font-medium">
              <span className="text-[#16805D] font-bold">{commercial.completedUnits} ready-to-move</span>
              <span> · {commercial.upcomingUnits} upcoming</span>
            </div>
          </div>
          <div className="w-full h-1.5 bg-[#F1F5F9] rounded-full mt-3 overflow-hidden flex">
            <div
              className="h-full bg-[#16805D]"
              style={{ width: `${(commercial.completedUnits / Math.max(1, commercial.totalUnits)) * 100}%` }}
              title="Completed Units"
            />
            <div
              className="h-full bg-[#00594F]"
              style={{ width: `${(commercial.underConstructionUnits / Math.max(1, commercial.totalUnits)) * 100}%` }}
              title="Under Construction Units"
            />
          </div>
        </div>

        {/* KPI 4: Unrealized Unsold Value */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4.5 shadow-2xs flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#737B88]">
              Remaining Inventory Pipeline
            </span>
            <div className="mt-1.5 flex items-baseline gap-1.5">
              <span className="text-3xl sm:text-4xl font-black text-[#D97706] tracking-tight tabular-nums">
                ₹{commercial.unrealizedValueCr.toLocaleString('en-IN')}
              </span>
              <span className="text-sm font-bold text-[#737B88]">Cr</span>
            </div>
            <div className="text-xs text-[#737B88] mt-1 font-medium">
              Available across {commercial.leftUnits} units in {commercial.projectBreakdown.length} developments
            </div>
          </div>
          <div className="text-[11px] text-[#737B88] mt-3 pt-2 border-t border-[#F1F5F9] flex items-center justify-between font-medium">
            <span>Avg Ticket: ₹{(commercial.totalInventoryCr / Math.max(1, commercial.totalUnits)).toFixed(2)} Cr</span>
            <span className="text-[#00594F] font-bold">Q3 FY25 Target Met</span>
          </div>
        </div>
      </div>

      {/* ============================================================
          PROJECT-BY-PROJECT SALES ABSORPTION & REVENUE MATRIX
          ============================================================ */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-2xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#F1F5F9] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-[#17191D]">
              Project Unit Absorption & Delivery Correlation Matrix
            </h2>
            <p className="text-xs text-[#737B88] mt-0.5">
              Compares commercial sales absorption percentage against physical superstructure construction pace.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#737B88]">
              Showing <strong className="text-[#17191D]">{commercial.projectBreakdown.length}</strong> Projects
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left min-w-[840px]">
            <thead>
              <tr className="text-[#737B88] font-semibold border-b border-[#F1F5F9] bg-[#FAFBFB]">
                <th className="py-2.5 px-5">Project Name</th>
                <th className="py-2.5 px-3">City</th>
                <th className="py-2.5 px-3">Sales Absorption</th>
                <th className="py-2.5 px-3">Units Pacing</th>
                <th className="py-2.5 px-3">Construction Completion</th>
                <th className="py-2.5 px-3 text-right">Booked Revenue</th>
                <th className="py-2.5 px-3 text-right">Inventory Value</th>
                <th className="py-2.5 px-5">Commercial Health</th>
                <th className="py-2.5 px-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {commercial.projectBreakdown.map(p => {
                const proj = PROJECTS.find(item => item.id === p.projectId);
                const constrPct = proj?.progressPercentage || 50;
                const salesAhead = p.soldPercent >= constrPct;

                return (
                  <tr
                    key={p.projectId}
                    onClick={() => selectProject(p.projectId)}
                    className="hover:bg-[#FAFBFB] cursor-pointer transition-colors group"
                  >
                    <td className="py-3 px-5 font-bold text-[#17191D] group-hover:text-[#00594F] transition-colors">
                      {p.projectName}
                    </td>

                    <td className="py-3 px-3 text-[#737B88] font-medium">
                      {p.city}
                    </td>

                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2 tabular-nums">
                        <span className="font-bold text-[#17191D]">{p.soldPercent}%</span>
                        <div className="w-16 h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                          <div
                            className={clsx(
                              'h-full rounded-full',
                              p.soldPercent >= 75 ? 'bg-[#00594F]' : p.soldPercent >= 50 ? 'bg-[#0D9488]' : 'bg-[#D97706]'
                            )}
                            style={{ width: `${p.soldPercent}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-[#737B88] font-medium tabular-nums">
                      <strong className="text-[#17191D]">{p.soldUnits}</strong> / {p.totalUnits} ({p.leftUnits} left)
                    </td>

                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2 tabular-nums">
                        <span className="font-bold text-[#17191D]">{constrPct}%</span>
                        <div className="w-16 h-1 bg-[#F1F5F9] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-slate-800 rounded-full"
                            style={{ width: `${constrPct}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-right font-bold text-[#17191D] tabular-nums">
                      ₹{p.bookedValueCr} Cr
                    </td>

                    <td className="py-3 px-3 text-right text-[#737B88] font-medium tabular-nums">
                      ₹{p.inventoryValueCr} Cr
                    </td>

                    <td className="py-3 px-5">
                      <span className="flex items-center gap-1.5 font-bold text-xs">
                        <span
                          className={clsx(
                            'w-2 h-2 rounded-full',
                            salesAhead ? 'bg-[#16805D]' : 'bg-[#D97706]'
                          )}
                        />
                        <span className={salesAhead ? 'text-[#16805D]' : 'text-[#B7791F]'}>
                          {salesAhead ? 'Demand Ahead' : 'Inventory Lagging'}
                        </span>
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right text-slate-300 group-hover:text-[#17191D] transition-colors">
                      <ChevronRight size={14} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============================================================
          TOWER-WISE INVENTORY ALLOCATION CARDS
          ============================================================ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PROJECTS.slice(0, 3).map(proj => {
          const towers = TOWERS_DATA.filter(t => t.projectId === proj.id);
          const unitsPerTower = Math.round(proj.totalUnits / Math.max(1, towers.length));
          const soldPerTower = Math.round(proj.soldUnits / Math.max(1, towers.length));

          return (
            <div key={proj.id} className="bg-white border border-[#E5E7EB] rounded-xl p-5 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
                  <div>
                    <h3 className="text-sm font-bold text-[#17191D]">{proj.name}</h3>
                    <span className="text-[11px] text-[#737B88]">{proj.city} · {towers.length} Towers</span>
                  </div>
                  <span className="text-xs font-bold text-[#00594F]">
                    {Math.round((proj.soldUnits / proj.totalUnits) * 100)}% Sold
                  </span>
                </div>

                <div className="space-y-3 my-3">
                  {towers.map(tower => (
                    <div key={tower.id} className="text-xs">
                      <div className="flex justify-between font-medium text-slate-700 mb-1">
                        <span>{tower.name} ({tower.totalFloors} fl)</span>
                        <span className="font-bold tabular-nums text-[#17191D]">
                          {soldPerTower} / {unitsPerTower} units
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#00594F] rounded-full"
                          style={{ width: `${Math.round((soldPerTower / Math.max(1, unitsPerTower)) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-[#F1F5F9] flex items-center justify-between text-xs text-[#737B88]">
                <span>Total Project Units: <strong>{proj.totalUnits}</strong></span>
                <button
                  onClick={() => {
                    selectProject(proj.id);
                    setTab('wip');
                  }}
                  className="text-[#00594F] font-bold hover:underline flex items-center gap-0.5"
                >
                  View in WIP <ChevronRight size={12} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
