// ============================================================
// APP STORE — Global state using React Context + useReducer
// ============================================================

import React, { createContext, useContext, useReducer, useCallback } from 'react';
import {
  WIR_RECORDS, NC_RECORDS,
  DEFAULT_WEIGHTS,
  type WIR, type NC, type WIRStatus, type NCStatus, type ScoreWeights,
} from '../data/seedData';

// ── State ─────────────────────────────────────────────────────
export interface AppState {
  // Navigation
  activeTab: 'portfolio' | 'wir' | 'nc' | 'quality' | 'contractors';

  // Filters
  filters: {
    region: string;
    city: string;
    stage: string;
    contractor: string;
    project: string;
    dateFrom: string;
    dateTo: string;
    status: string;
    severity: string;
    search: string;
  };

  // Data (mutable records for demo interactions)
  wirs: WIR[];
  ncs: NC[];

  // Quality Score weights
  weights: ScoreWeights;

  // UI state
  selectedProjectId: string | null;
  selectedWIRId: string | null;
  selectedNCId: string | null;
  selectedContractorId: string | null;

  // Chart state
  trendProjectIds: string[];
}

const initialFilters = {
  region: '',
  city: '',
  stage: '',
  contractor: '',
  project: '',
  dateFrom: '',
  dateTo: '',
  status: '',
  severity: '',
  search: '',
};

const initialState: AppState = {
  activeTab: 'portfolio',
  filters: initialFilters,
  wirs: WIR_RECORDS,
  ncs: NC_RECORDS,
  weights: DEFAULT_WEIGHTS,
  selectedProjectId: null,
  selectedWIRId: null,
  selectedNCId: null,
  selectedContractorId: null,
  trendProjectIds: ['P001', 'P002', 'P004', 'P005'],
};

// ── Actions ───────────────────────────────────────────────────
type Action =
  | { type: 'SET_TAB'; tab: AppState['activeTab'] }
  | { type: 'SET_FILTER'; key: keyof AppState['filters']; value: string }
  | { type: 'RESET_FILTERS' }
  | { type: 'SET_WEIGHTS'; weights: ScoreWeights }
  | { type: 'SELECT_PROJECT'; id: string | null }
  | { type: 'SELECT_WIR'; id: string | null }
  | { type: 'SELECT_NC'; id: string | null }
  | { type: 'SELECT_CONTRACTOR'; id: string | null }
  | { type: 'UPDATE_WIR_STATUS'; id: string; status: WIRStatus; note?: string; actor?: string }
  | { type: 'UPDATE_NC_STATUS'; id: string; status: NCStatus; note?: string; actor?: string }
  | { type: 'SET_TREND_PROJECTS'; ids: string[] }
  | { type: 'RESET_DEMO_DATA' };

// ── Reducer ───────────────────────────────────────────────────
function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_TAB':
      return { ...state, activeTab: action.tab };

    case 'SET_FILTER':
      return { ...state, filters: { ...state.filters, [action.key]: action.value } };

    case 'RESET_FILTERS':
      return { ...state, filters: initialFilters };

    case 'SET_WEIGHTS':
      return { ...state, weights: action.weights };

    case 'SELECT_PROJECT':
      return { ...state, selectedProjectId: action.id };

    case 'SELECT_WIR':
      return { ...state, selectedWIRId: action.id };

    case 'SELECT_NC':
      return { ...state, selectedNCId: action.id };

    case 'SELECT_CONTRACTOR':
      return { ...state, selectedContractorId: action.id };

    case 'UPDATE_WIR_STATUS': {
      const now = new Date().toISOString().split('T')[0];
      return {
        ...state,
        wirs: state.wirs.map(w =>
          w.id === action.id
            ? {
                ...w,
                status: action.status,
                daysAwaiting: action.status === 'Approved' || action.status === 'Rejected' ? 0 : w.daysAwaiting,
                firstPassResult: action.status === 'Approved' && w.firstPassResult === 'Pending' ? 'Pass'
                  : action.status === 'Rejected' && w.firstPassResult === 'Pending' ? 'Fail'
                  : w.firstPassResult,
                rejectionReason: action.status === 'Rejected' ? (action.note ?? w.rejectionReason) : w.rejectionReason,
                slaBreach: action.status === 'Approved' ? false : w.slaBreach,
                history: [
                  ...w.history,
                  {
                    date: now,
                    action: action.status,
                    actor: action.actor ?? 'System',
                    note: action.note,
                  },
                ],
              }
            : w
        ),
      };
    }

    case 'UPDATE_NC_STATUS': {
      const now = new Date().toISOString().split('T')[0];
      return {
        ...state,
        ncs: state.ncs.map(n =>
          n.id === action.id
            ? {
                ...n,
                status: action.status,
                verificationOutcome: action.status === 'Closed' ? action.note : n.verificationOutcome,
                rectificationNotes: action.status === 'Rectification' ? action.note : n.rectificationNotes,
                history: [
                  ...n.history,
                  {
                    date: now,
                    action: action.status,
                    actor: action.actor ?? 'System',
                    note: action.note,
                  },
                ],
              }
            : n
        ),
      };
    }

    case 'SET_TREND_PROJECTS':
      return { ...state, trendProjectIds: action.ids };

    case 'RESET_DEMO_DATA':
      return { ...initialState };

    default:
      return state;
  }
}

// ── Context ───────────────────────────────────────────────────
interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  setTab: (tab: AppState['activeTab']) => void;
  setFilter: (key: keyof AppState['filters'], value: string) => void;
  resetFilters: () => void;
  selectProject: (id: string | null) => void;
  selectWIR: (id: string | null) => void;
  selectNC: (id: string | null) => void;
  selectContractor: (id: string | null) => void;
  updateWIRStatus: (id: string, status: WIRStatus, note?: string, actor?: string) => void;
  updateNCStatus: (id: string, status: NCStatus, note?: string, actor?: string) => void;
  resetDemo: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const setTab = useCallback((tab: AppState['activeTab']) => dispatch({ type: 'SET_TAB', tab }), []);
  const setFilter = useCallback((key: keyof AppState['filters'], value: string) => dispatch({ type: 'SET_FILTER', key, value }), []);
  const resetFilters = useCallback(() => dispatch({ type: 'RESET_FILTERS' }), []);
  const selectProject = useCallback((id: string | null) => dispatch({ type: 'SELECT_PROJECT', id }), []);
  const selectWIR = useCallback((id: string | null) => dispatch({ type: 'SELECT_WIR', id }), []);
  const selectNC = useCallback((id: string | null) => dispatch({ type: 'SELECT_NC', id }), []);
  const selectContractor = useCallback((id: string | null) => dispatch({ type: 'SELECT_CONTRACTOR', id }), []);
  const updateWIRStatus = useCallback((id: string, status: WIRStatus, note?: string, actor?: string) =>
    dispatch({ type: 'UPDATE_WIR_STATUS', id, status, note, actor }), []);
  const updateNCStatus = useCallback((id: string, status: NCStatus, note?: string, actor?: string) =>
    dispatch({ type: 'UPDATE_NC_STATUS', id, status, note, actor }), []);
  const resetDemo = useCallback(() => dispatch({ type: 'RESET_DEMO_DATA' }), []);

  return (
    <AppContext.Provider value={{
      state, dispatch,
      setTab, setFilter, resetFilters,
      selectProject, selectWIR, selectNC, selectContractor,
      updateWIRStatus, updateNCStatus, resetDemo,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
