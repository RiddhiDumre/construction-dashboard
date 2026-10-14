// ============================================================
// QUALITY SCORE PAGE
// ============================================================

import React, { useState, useMemo } from 'react';
import clsx from 'clsx';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Info, Settings, ArrowLeftRight, Check } from 'lucide-react';
import { useApp } from '../store/appStore';
import { calcQualityScore, getRAGStatus, getHistoricalScoresForProjects } from '../data/calculations';
import { PROJECTS, AUDIT_RECORDS, type ScoreWeights, DEFAULT_WEIGHTS } from '../data/seedData';
import {
  StatusDot, ScoreBar, FilterSelect, PageHeader,
} from '../components/ui';

const PROJECT_OPTIONS = PROJECTS.map(p => ({ value: p.id, label: p.name }));

const CHART_COLORS: Record<string, string> = {
  'Meridian Heights': '#315EFB',
  'Northgate Residences': '#16805D',
  'Cedar Park': '#B7791F',
  'Riverstone Towers': '#C63F43',
  'Harbour Point': '#7C3AED',
  'Summit Greens': '#0891B2',
};

export function QualityScorePage() {
  const { state, setFilter } = useApp();
  const [showSettings, setShowSettings] = useState(false);
  const [showCompare, setShowCompare] = useState(false);
  const [compareProjectA, setCompareProjectA] = useState('P004'); // Riverstone Towers (struggling)
  const [compareProjectB, setCompareProjectB] = useState('P005'); // Harbour Point (healthy)
  const [weights, setWeights] = useState<ScoreWeights>(state.weights);
  const [draftWeights, setDraftWeights] = useState<ScoreWeights>(state.weights);
  const [trendProjects, setTrendProjects] = useState(PROJECTS.map(p => p.id));

  const { dispatch } = useApp();

  const allScores = useMemo(() =>
    PROJECTS.map(p => {
      const bd = calcQualityScore(p.id, weights, state.wirs, state.ncs);
      return { project: p, breakdown: bd, ragStatus: getRAGStatus(bd.finalScore) };
    }).sort((a, b) => a.breakdown.finalScore - b.breakdown.finalScore),
  [weights, state.wirs, state.ncs]);

  const trendData = useMemo(() => getHistoricalScoresForProjects(trendProjects), [trendProjects]);

  const weightsTotal = draftWeights.wirPassRate + draftWeights.ncHealth + draftWeights.auditScore;

  function applyWeights() {
    if (weightsTotal !== 100) return;
    setWeights(draftWeights);
    dispatch({ type: 'SET_WEIGHTS', weights: draftWeights });
    setShowSettings(false);
  }

  const filteredProject = state.filters.project;
  const selectedProjectScore = filteredProject
    ? allScores.find(s => s.project.id === filteredProject)
    : null;

  // Comparison projects data
  const scoreA = allScores.find(s => s.project.id === compareProjectA);
  const scoreB = allScores.find(s => s.project.id === compareProjectB);

  return (
    <div>
      <div className="flex items-start justify-between mb-5 flex-wrap gap-2">
        <PageHeader
          title="Quality Score"
          subtitle="Composite quality performance index per project calculated from WIRs, NC Health & Audits."
        />
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setShowCompare(!showCompare); if (showSettings) setShowSettings(false); }}
            className={clsx(
              'flex items-center gap-1.5 text-xs border rounded px-3 py-1.5 transition-colors',
              showCompare ? 'bg-[#315EFB] text-white border-[#315EFB]' : 'text-[#697586] border-[#E5E7EB] hover:bg-gray-50'
            )}
          >
            <ArrowLeftRight size={12} />
            Compare projects
          </button>
          <button
            onClick={() => { setShowSettings(!showSettings); if (showCompare) setShowCompare(false); }}
            className={clsx(
              'flex items-center gap-1.5 text-xs border rounded px-3 py-1.5 transition-colors',
              showSettings ? 'bg-gray-800 text-white border-gray-800' : 'text-[#697586] border-[#E5E7EB] hover:bg-gray-50'
            )}
          >
            <Settings size={12} />
            Score weights ({weights.wirPassRate}/{weights.ncHealth}/{weights.auditScore})
          </button>
        </div>
      </div>

      {/* Comparison Mode Panel */}
      {showCompare && scoreA && scoreB && (
        <div className="bg-white border border-[#E5E7EB] rounded-lg p-5 mb-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#E5E7EB] mb-4">
            <div>
              <h3 className="text-sm font-semibold text-[#20252D]">Side-by-Side Project Quality Comparison</h3>
              <p className="text-xs text-[#8792A2] mt-0.5">Compare component breakdown, pass rate, NC burden, and audit scores between two projects.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-xs">
                <span className="text-[#697586]">Project A:</span>
                <select
                  value={compareProjectA}
                  onChange={e => setCompareProjectA(e.target.value)}
                  className="border border-[#E5E7EB] rounded px-2 py-1 text-xs font-medium"
                >
                  {PROJECTS.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <span className="text-xs text-[#8792A2]">vs</span>
              <div className="flex items-center gap-1 text-xs">
                <span className="text-[#697586]">Project B:</span>
                <select
                  value={compareProjectB}
                  onChange={e => setCompareProjectB(e.target.value)}
                  className="border border-[#E5E7EB] rounded px-2 py-1 text-xs font-medium"
                >
                  {PROJECTS.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Project A Card */}
            <div className="border border-[#E5E7EB] rounded-lg p-4 bg-[#FAFAFC]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <StatusDot status={scoreA.ragStatus} size="md" />
                  <span className="text-base font-semibold text-[#20252D]">{scoreA.project.name}</span>
                  <span className="text-xs text-[#8792A2]">({scoreA.project.city})</span>
                </div>
                <div className="text-2xl font-bold" style={{ color: scoreA.ragStatus === 'green' ? '#16805D' : scoreA.ragStatus === 'amber' ? '#B7791F' : '#C63F43' }}>
                  {scoreA.breakdown.finalScore}<span className="text-xs font-normal text-[#8792A2]">/100</span>
                </div>
              </div>
              <div className="space-y-3 mt-4">
                <ScoreBar label="WIR Pass Rate" score={scoreA.breakdown.wirComponent} weight={weights.wirPassRate} contribution={scoreA.breakdown.wirComponent * (weights.wirPassRate / 100)} />
                <ScoreBar label="NC Health" score={scoreA.breakdown.ncComponent} weight={weights.ncHealth} contribution={scoreA.breakdown.ncComponent * (weights.ncHealth / 100)} />
                {scoreA.breakdown.auditAvailable ? (
                  <ScoreBar label="Latest Audit" score={scoreA.breakdown.auditComponent ?? 0} weight={weights.auditScore} contribution={(scoreA.breakdown.auditComponent ?? 0) * (weights.auditScore / 100)} />
                ) : (
                  <div className="text-xs text-[#8792A2] italic py-1">Audit data unavailable (renormalised)</div>
                )}
              </div>
            </div>

            {/* Project B Card */}
            <div className="border border-[#E5E7EB] rounded-lg p-4 bg-[#FAFAFC]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <StatusDot status={scoreB.ragStatus} size="md" />
                  <span className="text-base font-semibold text-[#20252D]">{scoreB.project.name}</span>
                  <span className="text-xs text-[#8792A2]">({scoreB.project.city})</span>
                </div>
                <div className="text-2xl font-bold" style={{ color: scoreB.ragStatus === 'green' ? '#16805D' : scoreB.ragStatus === 'amber' ? '#B7791F' : '#C63F43' }}>
                  {scoreB.breakdown.finalScore}<span className="text-xs font-normal text-[#8792A2]">/100</span>
                </div>
              </div>
              <div className="space-y-3 mt-4">
                <ScoreBar label="WIR Pass Rate" score={scoreB.breakdown.wirComponent} weight={weights.wirPassRate} contribution={scoreB.breakdown.wirComponent * (weights.wirPassRate / 100)} />
                <ScoreBar label="NC Health" score={scoreB.breakdown.ncComponent} weight={weights.ncHealth} contribution={scoreB.breakdown.ncComponent * (weights.ncHealth / 100)} />
                {scoreB.breakdown.auditAvailable ? (
                  <ScoreBar label="Latest Audit" score={scoreB.breakdown.auditComponent ?? 0} weight={weights.auditScore} contribution={(scoreB.breakdown.auditComponent ?? 0) * (weights.auditScore / 100)} />
                ) : (
                  <div className="text-xs text-[#8792A2] italic py-1">Audit data unavailable (renormalised)</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-white border border-[#E5E7EB] rounded-lg p-5 mb-5 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-[#20252D]">Configure Quality Score Weights</h3>
              <p className="text-xs text-[#8792A2] mt-0.5">Prototype configurable weights. Must total 100%.</p>
            </div>
            <span className={clsx('text-xs font-semibold px-2 py-0.5 rounded border',
              weightsTotal === 100 ? 'text-[#16805D] bg-green-50 border-green-200' : 'text-[#C63F43] bg-red-50 border-red-200'
            )}>
              Total: {weightsTotal}%
            </span>
          </div>
          <div className="grid grid-cols-3 gap-6 mb-4">
            {[
              { key: 'wirPassRate' as const, label: 'WIR First-Time Pass Rate', desc: 'Approved on 1st inspection / decided WIRs' },
              { key: 'ncHealth' as const, label: 'NC Health & Closure', desc: 'Penalties for open NCs & overdue age' },
              { key: 'auditScore' as const, label: 'Latest Audit Result', desc: 'Normalised 0–100 from internal/external audit' },
            ].map(({ key, label, desc }) => (
              <div key={key} className="border border-[#E5E7EB] rounded p-3 bg-[#F9FAFB]">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-medium text-[#20252D]">{label}</label>
                  <span className="text-xs font-bold text-[#315EFB]">{draftWeights[key]}%</span>
                </div>
                <p className="text-[11px] text-[#8792A2] mb-2">{desc}</p>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={draftWeights[key]}
                  onChange={e => setDraftWeights({ ...draftWeights, [key]: Number(e.target.value) })}
                  className="w-full cursor-pointer accent-[#315EFB]"
                />
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={applyWeights}
              disabled={weightsTotal !== 100}
              className="text-xs text-white bg-[#315EFB] px-3.5 py-1.5 rounded hover:bg-blue-700 disabled:opacity-50 font-medium"
            >
              Apply and recalculate portfolio
            </button>
            <button
              onClick={() => { setDraftWeights(DEFAULT_WEIGHTS); }}
              className="text-xs text-[#697586] border border-[#E5E7EB] px-3 py-1.5 rounded hover:bg-gray-50"
            >
              Reset defaults (40/35/25)
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-4 mb-5">
        <FilterSelect
          label="Filter by project"
          value={state.filters.project}
          options={PROJECT_OPTIONS}
          onChange={v => setFilter('project', v)}
        />
        {state.filters.project && (
          <button onClick={() => setFilter('project', '')} className="text-xs text-[#697586] hover:text-[#20252D] underline">
            Show all projects
          </button>
        )}
      </div>

      {/* All projects overview */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs mb-6">
        <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-[#20252D]">Project Quality Scores</h2>
            <div className="relative group">
              <Info size={13} className="text-[#8792A2] cursor-help" />
              <div className="absolute left-0 top-5 bg-white border border-[#E5E7EB] rounded-lg p-3 text-xs text-[#697586] w-72 z-20 hidden group-hover:block shadow-md">
                <strong>Scoring Methodology:</strong>
                <ul className="mt-1 space-y-0.5 list-disc list-inside">
                  <li>WIR Component ({weights.wirPassRate}%): 1st-pass approval rate</li>
                  <li>NC Component ({weights.ncHealth}%): 100 - severity & overdue points</li>
                  <li>Audit Component ({weights.auditScore}%): latest audit score</li>
                </ul>
                <p className="mt-1.5 text-[11px] text-[#8792A2]">Missing audit rule: renormalises remaining weights.</p>
              </div>
            </div>
          </div>
          <span className="text-xs text-[#8792A2]">Click a project card to inspect audit logs</span>
        </div>
        <div className="divide-y divide-[#F3F4F6]">
          {allScores
            .filter(s => !filteredProject || s.project.id === filteredProject)
            .map(({ project, breakdown, ragStatus }) => {
              const wirContrib = breakdown.wirComponent * (weights.wirPassRate / 100);
              const ncContrib = breakdown.ncComponent * (weights.ncHealth / 100);
              const auditContrib = breakdown.auditComponent !== null ? breakdown.auditComponent * (weights.auditScore / 100) : 0;
              const isSelected = filteredProject === project.id;
              return (
                <div
                  key={project.id}
                  className={clsx(
                    'px-4 py-4 cursor-pointer hover:bg-[#F9FAFB] transition-colors',
                    isSelected && 'bg-blue-50/20'
                  )}
                  onClick={() => setFilter('project', isSelected ? '' : project.id)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={project.image}
                        alt={project.name}
                        className="w-9 h-9 rounded-lg object-cover border border-[#E2E8F0] shadow-2xs flex-shrink-0"
                      />
                      <StatusDot status={ragStatus} size="sm" />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-bold text-[#0F172A]">{project.name}</span>
                          {isSelected && (
                            <span className="text-[10px] bg-blue-100 text-[#315EFB] font-semibold px-1.5 py-0.2 rounded ml-1">
                              Selected
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-[#64748B]">{project.city} · {project.stage} Stage</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {!breakdown.auditAvailable && (
                        <span className="text-xs text-[#8792A2] bg-[#F3F4F6] px-2 py-0.5 rounded border border-[#E5E7EB]">
                          No audit data — renormalised
                        </span>
                      )}
                      <span className={clsx('text-2xl font-semibold',
                        ragStatus === 'green' ? 'text-[#16805D]' : ragStatus === 'amber' ? 'text-[#B7791F]' : 'text-[#C63F43]'
                      )}>
                        {breakdown.finalScore}
                      </span>
                      <span className="text-sm text-[#8792A2]">/100</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <ScoreBar
                      label="WIR Pass Rate"
                      score={breakdown.wirComponent}
                      weight={weights.wirPassRate}
                      contribution={wirContrib}
                    />
                    <ScoreBar
                      label="NC Health"
                      score={breakdown.ncComponent}
                      weight={weights.ncHealth}
                      contribution={ncContrib}
                    />
                    {breakdown.auditAvailable ? (
                      <ScoreBar
                        label="Latest Audit"
                        score={breakdown.auditComponent ?? 0}
                        weight={weights.auditScore}
                        contribution={auditContrib}
                      />
                    ) : (
                      <div className="flex items-center justify-between text-xs py-1 text-[#8792A2]">
                        <span>Latest Audit Result</span>
                        <span>Component unavailable — weights renormalised</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Project Audit Details (if selected) */}
      {selectedProjectScore && (
        <div className="bg-white border border-[#E5E7EB] rounded-lg mb-6">
          <div className="px-4 py-3 border-b border-[#E5E7EB] flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#20252D]">
              {selectedProjectScore.project.name} — Internal & External Audit Records
            </h2>
            <span className="text-xs text-[#697586]">Audit supports Quality Score component</span>
          </div>
          <div className="p-4">
            {AUDIT_RECORDS.filter(a => a.projectId === selectedProjectScore.project.id).length === 0 ? (
              <p className="text-sm text-[#697586] py-4 text-center">No audit records found for this project.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                      {['Audit Date', 'Type', 'Score', 'Rating', 'Findings', 'Open CAs', 'Status', 'Auditor', 'Audit Summary'].map(h => (
                        <th key={h} className="text-left text-xs font-medium text-[#697586] px-3 py-2 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {AUDIT_RECORDS.filter(a => a.projectId === selectedProjectScore.project.id)
                      .sort((a, b) => b.auditDate.localeCompare(a.auditDate))
                      .map(audit => (
                        <tr key={audit.id} className="border-b border-[#F3F4F6] last:border-0">
                          <td className="px-3 py-2.5 text-sm text-[#697586]">{audit.auditDate}</td>
                          <td className="px-3 py-2.5 text-sm font-medium text-[#20252D]">{audit.type}</td>
                          <td className="px-3 py-2.5">
                            {audit.status === 'Completed' ? (
                              <span className={clsx('text-sm font-semibold',
                                audit.percentageScore >= 80 ? 'text-[#16805D]' : audit.percentageScore >= 60 ? 'text-[#B7791F]' : 'text-[#C63F43]'
                              )}>
                                {audit.percentageScore}%
                              </span>
                            ) : <span className="text-xs text-[#8792A2]">—</span>}
                          </td>
                          <td className="px-3 py-2.5 text-sm text-[#697586]">
                            {audit.status === 'Completed' ? `${audit.rating}/5` : '—'}
                          </td>
                          <td className="px-3 py-2.5 text-sm text-[#697586]">
                            {audit.status === 'Completed' ? audit.findingsRaised : '—'}
                          </td>
                          <td className="px-3 py-2.5 text-sm text-[#697586]">
                            {audit.status === 'Completed' ? (
                              <span className={clsx(audit.outstandingCAs > 0 ? 'text-[#C63F43] font-medium' : '')}>
                                {audit.outstandingCAs}
                              </span>
                            ) : '—'}
                          </td>
                          <td className="px-3 py-2.5">
                            <span className={clsx('text-xs font-medium px-2 py-0.5 rounded border',
                              audit.status === 'Completed' ? 'text-[#16805D] bg-green-50 border-green-200' :
                              audit.status === 'In Progress' ? 'text-[#B7791F] bg-amber-50 border-amber-200' :
                              'text-[#697586] bg-gray-50 border-gray-200'
                            )}>
                              {audit.status}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-sm text-[#697586]">{audit.auditor}</td>
                          <td className="px-3 py-2.5 text-xs text-[#697586] max-w-xs truncate">{audit.notes ?? '—'}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Trend Chart */}
      <div className="bg-white border border-[#E5E7EB] rounded-lg p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h2 className="text-base font-semibold text-[#20252D]">Quality Score historical progression (6 months)</h2>
          <div className="flex flex-wrap gap-2">
            {PROJECTS.map(p => (
              <button
                key={p.id}
                onClick={() => setTrendProjects(prev =>
                  prev.includes(p.id) ? prev.filter(id => id !== p.id) : [...prev, p.id]
                )}
                className={clsx(
                  'text-xs px-2.5 py-1 rounded border transition-colors',
                  trendProjects.includes(p.id) ? 'border-transparent text-white font-medium' : 'border-[#E5E7EB] text-[#697586] bg-white hover:bg-gray-50'
                )}
                style={trendProjects.includes(p.id) ? { backgroundColor: CHART_COLORS[p.name] } : {}}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={trendData} margin={{ top: 5, right: 16, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: '#697586' }}
              tickFormatter={m => {
                const [, mo] = m.split('-');
                const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
                return months[parseInt(mo) - 1];
              }}
            />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#697586' }} width={32} />
            <Tooltip
              contentStyle={{ fontSize: 12, border: '1px solid #E5E7EB', borderRadius: 6 }}
              formatter={(value: number, name: string) => [`${value}/100`, name]}
            />
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
            {trendProjects.map(pid => {
              const proj = PROJECTS.find(p => p.id === pid);
              if (!proj) return null;
              return (
                <Line
                  key={pid}
                  type="monotone"
                  dataKey={proj.name}
                  stroke={CHART_COLORS[proj.name]}
                  strokeWidth={2}
                  dot={{ r: 3, strokeWidth: 2 }}
                  activeDot={{ r: 5 }}
                  connectNulls
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
