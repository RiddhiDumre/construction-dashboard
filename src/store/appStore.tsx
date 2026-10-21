// ============================================================
// APP STORE — Global state using React Context + useReducer
// ============================================================

import React, { createContext, useContext, useReducer, useCallback } from 'react';
import {
  WIR_RECORDS, NC_RECORDS, WIP_ACTIVITIES,
  DEFAULT_WEIGHTS,
  type WIR, type NC, type WIRStatus, type NCStatus, type ScoreWeights, type WIPActivity,
} from '../data/seedData';

// ── State ─────────────────────────────────────────────────────
export type TabKey = 'overview' | 'wip' | 'sales' | 'commercial' | 'wir' | 'quality' | 'nc' | 'compliance' | 'contractors' | 'project-detail' | 'portfolio';
export type UserRole = 'CXO' | 'ProjectsHead' | 'ProjectManager' | 'QualityInspector' | 'Contractor' | 'SalesCommercial' | 'Admin';

export interface AppState {
  // Navigation
  activeTab: TabKey;
  previousTab?: TabKey;

  // Role
  userRole: UserRole;

  // Filters
  filters: {
    region: string;
    city: string;
    stage: string;
    contractor: string;
    project: string;
    tower: string;
    floor: string;
    dateFrom: string;
    dateTo: string;
    status: string;
    severity: string;
    category: string;
    search: string;
    reportingPeriod: string;
  };

  // Data (mutable records for demo interactions)
  wirs: WIR[];
  ncs: NC[];
  wipActivities: WIPActivity[];

  // Quality Score weights
  weights: ScoreWeights;

  // UI state
  selectedProjectId: string | null;
  selectedWIRId: string | null;
  selectedNCId: string | null;
  selectedContractorId: string | null;
  selectedActivityId: string | null;
  selectedAuditId: string | null;

  // Modals
  adminModalOpen: boolean;
  weightsModalOpen: boolean;

  // Chart state
  trendProjectIds: string[];
}

const initialFilters = {
  region: '',
  city: 'All locations',
  stage: '',
  contractor: '',
  project: '',
  tower: '',
  floor: '',
  dateFrom: '',
  dateTo: '',
  status: '',
  severity: '',
  category: '',
  search: '',
  reportingPeriod: 'Q3 FY25',
};

const initialState: AppState = {
  activeTab: 'overview',
  userRole: 'CXO',
  filters: initialFilters,
  wirs: WIR_RECORDS,
  ncs: NC_RECORDS,
  wipActivities: WIP_ACTIVITIES,
  weights: DEFAULT_WEIGHTS,
  selectedProjectId: null,
  selectedWIRId: null,
  selectedNCId: null,
  selectedContractorId: null,
  selectedActivityId: null,
  selectedAuditId: null,
  adminModalOpen: false,
  weightsModalOpen: false,
  trendProjectIds: ['P004', 'P001', 'P002', 'P005'],
};

// ── Actions ───────────────────────────────────────────────────
type Action =
  | { type: 'SET_TAB'; tab: TabKey }
  | { type: 'SET_USER_ROLE'; role: UserRole }
  | { type: 'SET_FILTER'; key: keyof AppState['filters']; value: string }
  | { type: 'RESET_FILTERS' }
  | { type: 'SET_WEIGHTS'; weights: ScoreWeights }
  | { type: 'SELECT_PROJECT'; id: string | null }
  | { type: 'SELECT_WIR'; id: string | null }
  | { type: 'SELECT_NC'; id: string | null }
  | { type: 'SELECT_CONTRACTOR'; id: string | null }
  | { type: 'SELECT_ACTIVITY'; id: string | null }
  | { type: 'SELECT_AUDIT'; id: string | null }
  | { type: 'SET_ADMIN_MODAL'; open: boolean }
  | { type: 'SET_WEIGHTS_MODAL'; open: boolean }
  | { type: 'UPDATE_WIR_STATUS'; id: string; status: WIRStatus; note?: string; actor?: string }
  | { type: 'UPDATE_NC_STATUS'; id: string; status: NCStatus; note?: string; actor?: string }
  | { type: 'UPDATE_ACTIVITY_PROGRESS'; id: string; actualProgress: number; status?: WIPActivity['status'] }
  | { type: 'SET_TREND_PROJECTS'; ids: string[] }
  | { type: 'RESET_DEMO_DATA' };

// ── Reducer ───────────────────────────────────────────────────
function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_TAB':
      return {
        ...state,
        previousTab: state.activeTab,
        activeTab: action.tab === 'portfolio' ? 'overview' : (action.tab === 'sales' ? 'commercial' : action.tab),
      };

    case 'SET_USER_ROLE':
      return {
        ...state,
        userRole: action.role,
        adminModalOpen: action.role === 'Admin',
      };

    case 'SET_FILTER':
      return {
        ...state,
        filters: { ...state.filters, [action.key]: action.value },
      };

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

    case 'SELECT_ACTIVITY':
      return { ...state, selectedActivityId: action.id };

    case 'SELECT_AUDIT':
      return { ...state, selectedAuditId: action.id };

    case 'SET_ADMIN_MODAL':
      return { ...state, adminModalOpen: action.open };

    case 'SET_WEIGHTS_MODAL':
      return { ...state, weightsModalOpen: action.open };

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
                    actor: action.actor ?? 'Quality Inspector',
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
                    actor: action.actor ?? 'Site Engineer',
                    note: action.note,
                  },
                ],
              }
            : n
        ),
      };
    }

    case 'UPDATE_ACTIVITY_PROGRESS': {
      return {
        ...state,
        wipActivities: state.wipActivities.map(a =>
          a.id === action.id
            ? {
                ...a,
                actualProgress: action.actualProgress,
                status: action.status ?? (action.actualProgress >= 100 ? 'Completed' : a.status),
              }
            : a
        ),
      };
    }

    case 'SET_TREND_PROJECTS':
      return { ...state, trendProjectIds: action.ids };

    case 'RESET_DEMO_DATA':
      return {
        ...initialState,
        wirs: [...WIR_RECORDS],
        ncs: [...NC_RECORDS],
        wipActivities: [...WIP_ACTIVITIES],
      };

    default:
      return state;
  }
}

// ── Context ───────────────────────────────────────────────────
interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  setTab: (tab: TabKey) => void;
  navigateBack: () => void;
  setUserRole: (role: UserRole) => void;
  setFilter: (key: keyof AppState['filters'], value: string) => void;
  resetFilters: () => void;
  setWeights: (weights: ScoreWeights) => void;
  selectProject: (id: string | null) => void;
  selectWIR: (id: string | null) => void;
  selectNC: (id: string | null) => void;
  selectContractor: (id: string | null) => void;
  selectActivity: (id: string | null) => void;
  selectAudit: (id: string | null) => void;
  setAdminModalOpen: (open: boolean) => void;
  setWeightsModalOpen: (open: boolean) => void;
  updateWIRStatus: (id: string, status: WIRStatus, note?: string, actor?: string) => void;
  updateNCStatus: (id: string, status: NCStatus, note?: string, actor?: string) => void;
  updateActivityProgress: (id: string, actualProgress: number, status?: WIPActivity['status']) => void;
  resetDemo: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const setTab = useCallback((tab: TabKey) => dispatch({ type: 'SET_TAB', tab }), []);
  const navigateBack = useCallback(() => {
    dispatch({ type: 'SET_TAB', tab: state.previousTab || 'overview' });
  }, [state.previousTab]);
  const setUserRole = useCallback((role: UserRole) => dispatch({ type: 'SET_USER_ROLE', role }), []);
  const setFilter = useCallback((key: keyof AppState['filters'], value: string) => dispatch({ type: 'SET_FILTER', key, value }), []);
  const resetFilters = useCallback(() => dispatch({ type: 'RESET_FILTERS' }), []);
  const setWeights = useCallback((weights: ScoreWeights) => dispatch({ type: 'SET_WEIGHTS', weights }), []);
  const selectProject = useCallback((id: string | null) => dispatch({ type: 'SELECT_PROJECT', id }), []);
  const selectWIR = useCallback((id: string | null) => dispatch({ type: 'SELECT_WIR', id }), []);
  const selectNC = useCallback((id: string | null) => dispatch({ type: 'SELECT_NC', id }), []);
  const selectContractor = useCallback((id: string | null) => dispatch({ type: 'SELECT_CONTRACTOR', id }), []);
  const selectActivity = useCallback((id: string | null) => dispatch({ type: 'SELECT_ACTIVITY', id }), []);
  const selectAudit = useCallback((id: string | null) => dispatch({ type: 'SELECT_AUDIT', id }), []);
  const setAdminModalOpen = useCallback((open: boolean) => dispatch({ type: 'SET_ADMIN_MODAL', open }), []);
  const setWeightsModalOpen = useCallback((open: boolean) => dispatch({ type: 'SET_WEIGHTS_MODAL', open }), []);
  const updateWIRStatus = useCallback((id: string, status: WIRStatus, note?: string, actor?: string) =>
    dispatch({ type: 'UPDATE_WIR_STATUS', id, status, note, actor }), []);
  const updateNCStatus = useCallback((id: string, status: NCStatus, note?: string, actor?: string) =>
    dispatch({ type: 'UPDATE_NC_STATUS', id, status, note, actor }), []);
  const updateActivityProgress = useCallback((id: string, actualProgress: number, status?: WIPActivity['status']) =>
    dispatch({ type: 'UPDATE_ACTIVITY_PROGRESS', id, actualProgress, status }), []);
  const resetDemo = useCallback(() => dispatch({ type: 'RESET_DEMO_DATA' }), []);

  return (
    <AppContext.Provider value={{
      state, dispatch,
      setTab, navigateBack, setUserRole, setFilter, resetFilters, setWeights,
      selectProject, selectWIR, selectNC, selectContractor, selectActivity, selectAudit,
      setAdminModalOpen, setWeightsModalOpen,
      updateWIRStatus, updateNCStatus, updateActivityProgress, resetDemo,
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
