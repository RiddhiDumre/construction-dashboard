// ============================================================
// SEED DATA — BombayDC Construction Quality Dashboard
// All metrics derive from these records. Single source of truth.
// ============================================================

export type Region = 'Mumbai' | 'Pune' | 'Bengaluru' | 'Hyderabad' | 'NCR';
export type ProjectStage = 'Foundation' | 'Structure' | 'Finishing' | 'Handover';
export type WIRStatus = 'Draft' | 'Submitted' | 'Awaiting Review' | 'Rejected' | 'Rectification In Progress' | 'Resubmitted' | 'Approved';
export type NCSeverity = 'Critical' | 'High' | 'Medium' | 'Low';
export type NCStatus = 'Open' | 'Assigned' | 'Rectification' | 'Evidence Submitted' | 'Verification' | 'Closed' | 'Rejected Verification';
export type AuditType = 'Internal' | 'External';
export type AuditStatus = 'Completed' | 'In Progress' | 'Scheduled';

// ── Projects ─────────────────────────────────────────────────
export interface Project {
  id: string;
  name: string;
  city: string;
  region: Region;
  stage: ProjectStage;
  towers: string[];
  startDate: string;
  targetCompletion: string;
  progressPercentage: number;
  projectManager: string;
  qualityLead: string;
  image: string;
}

export const PROJECTS: Project[] = [
  {
    id: 'P001',
    name: 'Meridian Heights',
    city: 'Mumbai',
    region: 'Mumbai',
    stage: 'Structure',
    towers: ['Tower A', 'Tower B', 'Tower C'],
    startDate: '2024-03-01',
    targetCompletion: '2026-12-31',
    progressPercentage: 61,
    projectManager: 'A. Sharma',
    qualityLead: 'M. Joshi',
    image: '/projects/p001-meridian.jpg',
  },
  {
    id: 'P002',
    name: 'Northgate Residences',
    city: 'Bengaluru',
    region: 'Bengaluru',
    stage: 'Finishing',
    towers: ['Block 1', 'Block 2', 'Block 3', 'Block 4'],
    startDate: '2023-09-01',
    targetCompletion: '2026-06-30',
    progressPercentage: 74,
    projectManager: 'R. Mehta',
    qualityLead: 'D. Sen',
    image: '/projects/p002-northgate.jpg',
  },
  {
    id: 'P003',
    name: 'Cedar Park',
    city: 'Pune',
    region: 'Pune',
    stage: 'Foundation',
    towers: ['Wing A', 'Wing B'],
    startDate: '2025-01-15',
    targetCompletion: '2027-08-31',
    progressPercentage: 28,
    projectManager: 'S. Rao',
    qualityLead: 'A. Verma',
    image: '/projects/p003-cedar-park.jpg',
  },
  {
    id: 'P004',
    name: 'Riverstone Towers',
    city: 'Gurugram',
    region: 'NCR',
    stage: 'Structure',
    towers: ['Tower 1', 'Tower 2', 'Tower 3'],
    startDate: '2024-06-01',
    targetCompletion: '2027-03-31',
    progressPercentage: 48,
    projectManager: 'V. Nair',
    qualityLead: 'T. Pillai',
    image: '/projects/p004-riverstone.jpg',
  },
  {
    id: 'P005',
    name: 'Harbour Point',
    city: 'Navi Mumbai',
    region: 'Mumbai',
    stage: 'Finishing',
    towers: ['Phase 1', 'Phase 2'],
    startDate: '2023-06-01',
    targetCompletion: '2025-12-31',
    progressPercentage: 88,
    projectManager: 'P. Kulkarni',
    qualityLead: 'S. Ghosh',
    image: '/projects/p005-harbour-point.jpg',
  },
  {
    id: 'P006',
    name: 'Summit Greens',
    city: 'Hyderabad',
    region: 'Hyderabad',
    stage: 'Structure',
    towers: ['Tower X', 'Tower Y', 'Tower Z'],
    startDate: '2024-09-01',
    targetCompletion: '2027-06-30',
    progressPercentage: 56,
    projectManager: 'K. Reddy',
    qualityLead: 'N. Iyer',
    image: '/projects/p006-summit-greens.jpg',
  },
];

// ── Contractors ───────────────────────────────────────────────
export interface Contractor {
  id: string;
  name: string;
  type: string;
  projects: string[];
}

export const CONTRACTORS: Contractor[] = [
  { id: 'C001', name: 'ABC Civil Works', type: 'Civil & Structural', projects: ['P001', 'P004'] },
  { id: 'C002', name: 'Reliable Constructions', type: 'Civil & Structural', projects: ['P002', 'P003'] },
  { id: 'C003', name: 'UrbanBuild India', type: 'MEP', projects: ['P001', 'P005', 'P006'] },
  { id: 'C004', name: 'Kapoor Finishing Works', type: 'Finishing & Interiors', projects: ['P002', 'P005'] },
  { id: 'C005', name: 'Shree Ram Infra', type: 'Civil & Structural', projects: ['P006'] },
  { id: 'C006', name: 'Precision MEP Systems', type: 'MEP', projects: ['P003', 'P004'] },
  { id: 'C007', name: 'Elite Waterproofing', type: 'Waterproofing', projects: ['P001', 'P002'] },
  { id: 'C008', name: 'VK Concreting', type: 'Concrete & RCC', projects: ['P004', 'P005'] },
  { id: 'C009', name: 'Greentech Formwork', type: 'Formwork & Shuttering', projects: ['P003', 'P006'] },
  { id: 'C010', name: 'Modi Electrical', type: 'Electrical', projects: ['P001', 'P002', 'P003'] },
  { id: 'C011', name: 'Apex Steel Fabricators', type: 'Steel & Rebar', projects: ['P004', 'P006'] },
  { id: 'C012', name: 'Heritage Tiles & Floors', type: 'Finishing & Interiors', projects: ['P002'] },
];

// ── WIR Records ───────────────────────────────────────────────
export interface WIRHistoryEntry {
  date: string;
  action: string;
  actor: string;
  note?: string;
}

export interface SitePhoto {
  url: string;
  caption: string;
  timestamp: string;
  locationGPS: string;
  author: string;
  defectTag: string;
  isLabReport?: boolean;
}

export interface WIR {
  id: string;
  projectId: string;
  tower: string;
  activity: string;
  contractorId: string;
  submittedDate: string;
  reviewer: string;
  status: WIRStatus;
  firstPassResult: 'Pass' | 'Fail' | 'Pending';
  rejectionReason?: string;
  inspectionNotes?: string;
  daysAwaiting: number;
  slaBreach: boolean;
  history: WIRHistoryEntry[];
  sitePhoto?: SitePhoto;
}

export let WIR_RECORDS: WIR[] = [
  // P001 - Meridian Heights
  { id: 'WIR-0001', projectId: 'P001', tower: 'Tower A', activity: 'Slab Pouring — 8th Floor', contractorId: 'C001', submittedDate: '2025-09-02', reviewer: 'Rajan Mehta', status: 'Approved', firstPassResult: 'Pass', daysAwaiting: 0, slaBreach: false, history: [{ date: '2025-09-02', action: 'Submitted', actor: 'ABC Civil Works' }, { date: '2025-09-03', action: 'Approved', actor: 'Rajan Mehta', note: 'Work meets specification.' }] },
  { id: 'WIR-0002', projectId: 'P001', tower: 'Tower B', activity: 'Column Reinforcement — 7th Floor', contractorId: 'C001', submittedDate: '2025-09-10', reviewer: 'Rajan Mehta', status: 'Rejected', firstPassResult: 'Fail', rejectionReason: 'Rebar spacing does not meet IS 456 requirements. Cover blocks missing in 3 columns.', daysAwaiting: 3, slaBreach: false, inspectionNotes: 'Found cover blocks missing on columns B-12, B-14 and B-17. Spacing non-compliant.', history: [{ date: '2025-09-10', action: 'Submitted', actor: 'ABC Civil Works' }, { date: '2025-09-13', action: 'Rejected', actor: 'Rajan Mehta', note: 'Rebar spacing does not meet IS 456 requirements.' }] },
  { id: 'WIR-0003', projectId: 'P001', tower: 'Tower B', activity: 'Column Reinforcement — 7th Floor (Resubmission)', contractorId: 'C001', submittedDate: '2025-09-18', reviewer: 'Rajan Mehta', status: 'Awaiting Review', firstPassResult: 'Fail', daysAwaiting: 8, slaBreach: true, history: [{ date: '2025-09-10', action: 'Submitted', actor: 'ABC Civil Works' }, { date: '2025-09-13', action: 'Rejected', actor: 'Rajan Mehta', note: 'Rebar spacing non-compliant.' }, { date: '2025-09-16', action: 'Rectification In Progress', actor: 'ABC Civil Works', note: 'Corrective work under way.' }, { date: '2025-09-18', action: 'Resubmitted', actor: 'ABC Civil Works', note: 'Cover blocks installed. Spacing corrected.' }] },
  { id: 'WIR-0004', projectId: 'P001', tower: 'Tower C', activity: 'Waterproofing — Terrace', contractorId: 'C007', submittedDate: '2025-09-20', reviewer: 'Priya Nair', status: 'Approved', firstPassResult: 'Pass', daysAwaiting: 0, slaBreach: false, history: [{ date: '2025-09-20', action: 'Submitted', actor: 'Elite Waterproofing' }, { date: '2025-09-22', action: 'Approved', actor: 'Priya Nair', note: 'Bond coat and membrane properly applied.' }] },
  { id: 'WIR-0005', projectId: 'P001', tower: 'Tower A', activity: 'Slab Pouring — 9th Floor', contractorId: 'C001', submittedDate: '2025-09-25', reviewer: 'Rajan Mehta', status: 'Approved', firstPassResult: 'Pass', daysAwaiting: 0, slaBreach: false, history: [{ date: '2025-09-25', action: 'Submitted', actor: 'ABC Civil Works' }, { date: '2025-09-26', action: 'Approved', actor: 'Rajan Mehta' }] },
  { id: 'WIR-0006', projectId: 'P001', tower: 'Tower B', activity: 'MEP Conduit Laying — 6th Floor', contractorId: 'C003', submittedDate: '2025-09-28', reviewer: 'Priya Nair', status: 'Rejected', firstPassResult: 'Fail', rejectionReason: 'Conduit bending radius exceeds permissible limit. Junction box positioning incorrect.', daysAwaiting: 12, slaBreach: true, inspectionNotes: 'Multiple conduit bends found at non-compliant radii. 4 junction boxes positioned outside marked zones.', history: [{ date: '2025-09-28', action: 'Submitted', actor: 'UrbanBuild India' }, { date: '2025-10-01', action: 'Rejected', actor: 'Priya Nair', note: 'Conduit bending issues.' }] },
  { id: 'WIR-0007', projectId: 'P001', tower: 'Tower A', activity: 'Column Shuttering — 10th Floor', contractorId: 'C001', submittedDate: '2025-10-01', reviewer: 'Rajan Mehta', status: 'Submitted', firstPassResult: 'Pending', daysAwaiting: 13, slaBreach: true, history: [{ date: '2025-10-01', action: 'Submitted', actor: 'ABC Civil Works' }] },
  { id: 'WIR-0008', projectId: 'P001', tower: 'Tower C', activity: 'Electrical Panel Installation — Basement', contractorId: 'C010', submittedDate: '2025-10-05', reviewer: 'Priya Nair', status: 'Awaiting Review', firstPassResult: 'Pending', daysAwaiting: 9, slaBreach: true, history: [{ date: '2025-10-05', action: 'Submitted', actor: 'Modi Electrical' }] },

  // P002 - Northgate Residences
  { id: 'WIR-0009', projectId: 'P002', tower: 'Block 1', activity: 'Tile Laying — 3rd Floor Corridor', contractorId: 'C004', submittedDate: '2025-09-05', reviewer: 'Ananya Singh', status: 'Approved', firstPassResult: 'Pass', daysAwaiting: 0, slaBreach: false, history: [{ date: '2025-09-05', action: 'Submitted', actor: 'Kapoor Finishing Works' }, { date: '2025-09-07', action: 'Approved', actor: 'Ananya Singh' }] },
  { id: 'WIR-0010', projectId: 'P002', tower: 'Block 2', activity: 'Tile Laying — 4th Floor Apartments', contractorId: 'C004', submittedDate: '2025-09-12', reviewer: 'Ananya Singh', status: 'Approved', firstPassResult: 'Pass', daysAwaiting: 0, slaBreach: false, history: [{ date: '2025-09-12', action: 'Submitted', actor: 'Kapoor Finishing Works' }, { date: '2025-09-14', action: 'Approved', actor: 'Ananya Singh' }] },
  { id: 'WIR-0011', projectId: 'P002', tower: 'Block 3', activity: 'False Ceiling — Club House', contractorId: 'C004', submittedDate: '2025-09-18', reviewer: 'Ananya Singh', status: 'Approved', firstPassResult: 'Pass', daysAwaiting: 0, slaBreach: false, history: [{ date: '2025-09-18', action: 'Submitted', actor: 'Kapoor Finishing Works' }, { date: '2025-09-19', action: 'Approved', actor: 'Ananya Singh' }] },
  { id: 'WIR-0012', projectId: 'P002', tower: 'Block 1', activity: 'Waterproofing — Wet Areas', contractorId: 'C007', submittedDate: '2025-09-22', reviewer: 'Ananya Singh', status: 'Rejected', firstPassResult: 'Fail', rejectionReason: 'Membrane thickness insufficient. Lap joints improperly sealed.', daysAwaiting: 5, slaBreach: false, history: [{ date: '2025-09-22', action: 'Submitted', actor: 'Elite Waterproofing' }, { date: '2025-09-24', action: 'Rejected', actor: 'Ananya Singh', note: 'Membrane thickness issue.' }] },
  { id: 'WIR-0013', projectId: 'P002', tower: 'Block 2', activity: 'Painting — External Facade', contractorId: 'C004', submittedDate: '2025-09-28', reviewer: 'Ananya Singh', status: 'Approved', firstPassResult: 'Pass', daysAwaiting: 0, slaBreach: false, history: [{ date: '2025-09-28', action: 'Submitted', actor: 'Kapoor Finishing Works' }, { date: '2025-09-30', action: 'Approved', actor: 'Ananya Singh' }] },
  { id: 'WIR-0014', projectId: 'P002', tower: 'Block 4', activity: 'Electrical Wiring — Level 5', contractorId: 'C010', submittedDate: '2025-10-02', reviewer: 'Ananya Singh', status: 'Approved', firstPassResult: 'Pass', daysAwaiting: 0, slaBreach: false, history: [{ date: '2025-10-02', action: 'Submitted', actor: 'Modi Electrical' }, { date: '2025-10-04', action: 'Approved', actor: 'Ananya Singh' }] },
  { id: 'WIR-0015', projectId: 'P002', tower: 'Block 3', activity: 'Flooring — Lobby', contractorId: 'C012', submittedDate: '2025-10-06', reviewer: 'Ananya Singh', status: 'Submitted', firstPassResult: 'Pending', daysAwaiting: 8, slaBreach: true, history: [{ date: '2025-10-06', action: 'Submitted', actor: 'Heritage Tiles & Floors' }] },

  // P003 - Cedar Park
  { id: 'WIR-0016', projectId: 'P003', tower: 'Wing A', activity: 'Pile Boring — Grid A1-A8', contractorId: 'C002', submittedDate: '2025-09-10', reviewer: 'Suresh Kumar', status: 'Approved', firstPassResult: 'Pass', daysAwaiting: 0, slaBreach: false, history: [{ date: '2025-09-10', action: 'Submitted', actor: 'Reliable Constructions' }, { date: '2025-09-12', action: 'Approved', actor: 'Suresh Kumar' }] },
  { id: 'WIR-0017', projectId: 'P003', tower: 'Wing A', activity: 'Pile Cap Reinforcement — Grid A1-A4', contractorId: 'C002', submittedDate: '2025-09-20', reviewer: 'Suresh Kumar', status: 'Approved', firstPassResult: 'Pass', daysAwaiting: 0, slaBreach: false, history: [{ date: '2025-09-20', action: 'Submitted', actor: 'Reliable Constructions' }, { date: '2025-09-22', action: 'Approved', actor: 'Suresh Kumar' }] },
  { id: 'WIR-0018', projectId: 'P003', tower: 'Wing B', activity: 'Pile Boring — Grid B1-B6', contractorId: 'C002', submittedDate: '2025-10-01', reviewer: 'Suresh Kumar', status: 'Awaiting Review', firstPassResult: 'Pending', daysAwaiting: 13, slaBreach: true, history: [{ date: '2025-10-01', action: 'Submitted', actor: 'Reliable Constructions' }] },
  { id: 'WIR-0019', projectId: 'P003', tower: 'Wing A', activity: 'Formwork — Grade Beam', contractorId: 'C009', submittedDate: '2025-10-05', reviewer: 'Suresh Kumar', status: 'Rejected', firstPassResult: 'Fail', rejectionReason: 'Formwork alignment deviation beyond tolerance. Bracing inadequate.', daysAwaiting: 9, slaBreach: true, history: [{ date: '2025-10-05', action: 'Submitted', actor: 'Greentech Formwork' }, { date: '2025-10-08', action: 'Rejected', actor: 'Suresh Kumar', note: 'Alignment deviation.' }] },
  { id: 'WIR-0020', projectId: 'P003', tower: 'Wing B', activity: 'MEP Underground — Service Corridor', contractorId: 'C006', submittedDate: '2025-10-08', reviewer: 'Suresh Kumar', status: 'Submitted', firstPassResult: 'Pending', daysAwaiting: 6, slaBreach: false, history: [{ date: '2025-10-08', action: 'Submitted', actor: 'Precision MEP Systems' }] },

  // P004 - Riverstone Towers
  {
    id: 'WIR-0021',
    projectId: 'P004',
    tower: 'Tower 1',
    activity: 'Column Concreting — 5th Floor',
    contractorId: 'C001',
    submittedDate: '2025-09-01',
    reviewer: 'Vikram Joshi',
    status: 'Rejected',
    firstPassResult: 'Fail',
    rejectionReason: 'Concrete cube test failure — 28-day strength below M30 requirement. Honeycombing observed at 4 locations.',
    daysAwaiting: 21,
    slaBreach: true,
    inspectionNotes: 'Lab report shows 24.8 MPa vs required 30 MPa. Visual honeycombing at columns T1-C12, T1-C14, T1-C18, T1-C21.',
    history: [
      { date: '2025-09-01', action: 'Submitted', actor: 'ABC Civil Works' },
      { date: '2025-09-04', action: 'Rejected', actor: 'Vikram Joshi', note: 'Concrete cube test failure.' }
    ],
    sitePhoto: {
      url: '/defects/nc-0002-honeycombing.jpg',
      caption: 'Severe aggregate segregation and void pocket (>45mm depth) at column T1-C14 base post formwork stripping',
      timestamp: '2025-09-04 14:22 IST',
      locationGPS: '28.4595° N, 77.0266° E · Tower 1 Level 5 Column C14',
      author: 'Vikram Joshi (QA Lead)',
      defectTag: 'POUR DEFECT: Column Honeycombing > 45mm Void',
    },
  },
  { id: 'WIR-0022', projectId: 'P004', tower: 'Tower 1', activity: 'Column Concreting — 5th Floor (Resubmission)', contractorId: 'C001', submittedDate: '2025-09-22', reviewer: 'Vikram Joshi', status: 'Rejected', firstPassResult: 'Fail', rejectionReason: 'Second concrete test still below specified strength. Remedial grouting not approved.', daysAwaiting: 22, slaBreach: true, history: [{ date: '2025-09-22', action: 'Submitted', actor: 'ABC Civil Works' }, { date: '2025-09-25', action: 'Rejected', actor: 'Vikram Joshi', note: 'Strength still insufficient.' }] },
  { id: 'WIR-0023', projectId: 'P004', tower: 'Tower 2', activity: 'Slab Reinforcement — 4th Floor', contractorId: 'C008', submittedDate: '2025-09-15', reviewer: 'Vikram Joshi', status: 'Approved', firstPassResult: 'Pass', daysAwaiting: 0, slaBreach: false, history: [{ date: '2025-09-15', action: 'Submitted', actor: 'VK Concreting' }, { date: '2025-09-17', action: 'Approved', actor: 'Vikram Joshi' }] },
  { id: 'WIR-0024', projectId: 'P004', tower: 'Tower 3', activity: 'MEP — HVAC Ductwork Level 3', contractorId: 'C006', submittedDate: '2025-09-25', reviewer: 'Vikram Joshi', status: 'Approved', firstPassResult: 'Pass', daysAwaiting: 0, slaBreach: false, history: [{ date: '2025-09-25', action: 'Submitted', actor: 'Precision MEP Systems' }, { date: '2025-09-27', action: 'Approved', actor: 'Vikram Joshi' }] },
  { id: 'WIR-0025', projectId: 'P004', tower: 'Tower 1', activity: 'Steel Rebar Fixing — 6th Floor', contractorId: 'C011', submittedDate: '2025-10-01', reviewer: 'Vikram Joshi', status: 'Awaiting Review', firstPassResult: 'Pending', daysAwaiting: 13, slaBreach: true, history: [{ date: '2025-10-01', action: 'Submitted', actor: 'Apex Steel Fabricators' }] },
  { id: 'WIR-0026', projectId: 'P004', tower: 'Tower 2', activity: 'Column Concreting — 5th Floor', contractorId: 'C008', submittedDate: '2025-10-05', reviewer: 'Vikram Joshi', status: 'Submitted', firstPassResult: 'Pending', daysAwaiting: 9, slaBreach: true, history: [{ date: '2025-10-05', action: 'Submitted', actor: 'VK Concreting' }] },

  // P005 - Harbour Point
  { id: 'WIR-0027', projectId: 'P005', tower: 'Phase 1', activity: 'External Plastering — Level 8-10', contractorId: 'C003', submittedDate: '2025-09-03', reviewer: 'Meera Pillai', status: 'Approved', firstPassResult: 'Pass', daysAwaiting: 0, slaBreach: false, history: [{ date: '2025-09-03', action: 'Submitted', actor: 'UrbanBuild India' }, { date: '2025-09-05', action: 'Approved', actor: 'Meera Pillai' }] },
  { id: 'WIR-0028', projectId: 'P005', tower: 'Phase 1', activity: 'Toilet Waterproofing — Level 5', contractorId: 'C008', submittedDate: '2025-09-10', reviewer: 'Meera Pillai', status: 'Approved', firstPassResult: 'Pass', daysAwaiting: 0, slaBreach: false, history: [{ date: '2025-09-10', action: 'Submitted', actor: 'VK Concreting' }, { date: '2025-09-12', action: 'Approved', actor: 'Meera Pillai' }] },
  { id: 'WIR-0029', projectId: 'P005', tower: 'Phase 2', activity: 'Aluminum Facade Cladding — Level 12', contractorId: 'C003', submittedDate: '2025-09-18', reviewer: 'Meera Pillai', status: 'Approved', firstPassResult: 'Pass', daysAwaiting: 0, slaBreach: false, history: [{ date: '2025-09-18', action: 'Submitted', actor: 'UrbanBuild India' }, { date: '2025-09-20', action: 'Approved', actor: 'Meera Pillai' }] },
  { id: 'WIR-0030', projectId: 'P005', tower: 'Phase 1', activity: 'Internal Plastering — Level 9', contractorId: 'C003', submittedDate: '2025-09-25', reviewer: 'Meera Pillai', status: 'Approved', firstPassResult: 'Pass', daysAwaiting: 0, slaBreach: false, history: [{ date: '2025-09-25', action: 'Submitted', actor: 'UrbanBuild India' }, { date: '2025-09-27', action: 'Approved', actor: 'Meera Pillai' }] },
  { id: 'WIR-0031', projectId: 'P005', tower: 'Phase 2', activity: 'Waterproofing — Podium Level', contractorId: 'C008', submittedDate: '2025-10-02', reviewer: 'Meera Pillai', status: 'Approved', firstPassResult: 'Pass', daysAwaiting: 0, slaBreach: false, history: [{ date: '2025-10-02', action: 'Submitted', actor: 'VK Concreting' }, { date: '2025-10-04', action: 'Approved', actor: 'Meera Pillai' }] },
  { id: 'WIR-0032', projectId: 'P005', tower: 'Phase 2', activity: 'MEP Earthing — HT Panel Room', contractorId: 'C003', submittedDate: '2025-10-08', reviewer: 'Meera Pillai', status: 'Approved', firstPassResult: 'Pass', daysAwaiting: 0, slaBreach: false, history: [{ date: '2025-10-08', action: 'Submitted', actor: 'UrbanBuild India' }, { date: '2025-10-09', action: 'Approved', actor: 'Meera Pillai' }] },

  // P006 - Summit Greens
  { id: 'WIR-0033', projectId: 'P006', tower: 'Tower X', activity: 'Slab Reinforcement — 3rd Floor', contractorId: 'C005', submittedDate: '2025-09-05', reviewer: 'Deepak Rao', status: 'Approved', firstPassResult: 'Pass', daysAwaiting: 0, slaBreach: false, history: [{ date: '2025-09-05', action: 'Submitted', actor: 'Shree Ram Infra' }, { date: '2025-09-07', action: 'Approved', actor: 'Deepak Rao' }] },
  { id: 'WIR-0034', projectId: 'P006', tower: 'Tower Y', activity: 'Column Reinforcement — 3rd Floor', contractorId: 'C005', submittedDate: '2025-09-14', reviewer: 'Deepak Rao', status: 'Rejected', firstPassResult: 'Fail', rejectionReason: 'Stirrup spacing non-compliant in column zone. Lap length insufficient.', daysAwaiting: 10, slaBreach: true, history: [{ date: '2025-09-14', action: 'Submitted', actor: 'Shree Ram Infra' }, { date: '2025-09-17', action: 'Rejected', actor: 'Deepak Rao', note: 'Stirrup spacing issue.' }] },
  { id: 'WIR-0035', projectId: 'P006', tower: 'Tower Y', activity: 'Column Reinforcement — 3rd Floor (Resubmission)', contractorId: 'C005', submittedDate: '2025-09-25', reviewer: 'Deepak Rao', status: 'Approved', firstPassResult: 'Fail', daysAwaiting: 0, slaBreach: false, history: [{ date: '2025-09-14', action: 'Submitted', actor: 'Shree Ram Infra' }, { date: '2025-09-17', action: 'Rejected', actor: 'Deepak Rao' }, { date: '2025-09-23', action: 'Rectification In Progress', actor: 'Shree Ram Infra' }, { date: '2025-09-25', action: 'Resubmitted', actor: 'Shree Ram Infra' }, { date: '2025-09-27', action: 'Approved', actor: 'Deepak Rao' }] },
  { id: 'WIR-0036', projectId: 'P006', tower: 'Tower Z', activity: 'MEP Plumbing Rough-In — 2nd Floor', contractorId: 'C003', submittedDate: '2025-09-20', reviewer: 'Deepak Rao', status: 'Approved', firstPassResult: 'Pass', daysAwaiting: 0, slaBreach: false, history: [{ date: '2025-09-20', action: 'Submitted', actor: 'UrbanBuild India' }, { date: '2025-09-22', action: 'Approved', actor: 'Deepak Rao' }] },
  { id: 'WIR-0037', projectId: 'P006', tower: 'Tower X', activity: 'Formwork — 4th Floor Slab', contractorId: 'C009', submittedDate: '2025-10-01', reviewer: 'Deepak Rao', status: 'Approved', firstPassResult: 'Pass', daysAwaiting: 0, slaBreach: false, history: [{ date: '2025-10-01', action: 'Submitted', actor: 'Greentech Formwork' }, { date: '2025-10-03', action: 'Approved', actor: 'Deepak Rao' }] },
  { id: 'WIR-0038', projectId: 'P006', tower: 'Tower Z', activity: 'Steel Rebar — 4th Floor Columns', contractorId: 'C011', submittedDate: '2025-10-06', reviewer: 'Deepak Rao', status: 'Submitted', firstPassResult: 'Pending', daysAwaiting: 8, slaBreach: true, history: [{ date: '2025-10-06', action: 'Submitted', actor: 'Apex Steel Fabricators' }] },
  { id: 'WIR-0039', projectId: 'P006', tower: 'Tower Y', activity: 'Slab Pouring — 4th Floor', contractorId: 'C005', submittedDate: '2025-10-08', reviewer: 'Deepak Rao', status: 'Submitted', firstPassResult: 'Pending', daysAwaiting: 6, slaBreach: false, history: [{ date: '2025-10-08', action: 'Submitted', actor: 'Shree Ram Infra' }] },

  // Additional WIRs to hit 50+
  { id: 'WIR-0040', projectId: 'P001', tower: 'Tower A', activity: 'Beam Reinforcement — 10th Floor', contractorId: 'C001', submittedDate: '2025-08-15', reviewer: 'Rajan Mehta', status: 'Approved', firstPassResult: 'Pass', daysAwaiting: 0, slaBreach: false, history: [{ date: '2025-08-15', action: 'Submitted', actor: 'ABC Civil Works' }, { date: '2025-08-17', action: 'Approved', actor: 'Rajan Mehta' }] },
  { id: 'WIR-0041', projectId: 'P001', tower: 'Tower C', activity: 'Masonry — 5th Floor', contractorId: 'C001', submittedDate: '2025-08-20', reviewer: 'Priya Nair', status: 'Approved', firstPassResult: 'Pass', daysAwaiting: 0, slaBreach: false, history: [{ date: '2025-08-20', action: 'Submitted', actor: 'ABC Civil Works' }, { date: '2025-08-22', action: 'Approved', actor: 'Priya Nair' }] },
  { id: 'WIR-0042', projectId: 'P002', tower: 'Block 4', activity: 'External Plaster — Level 3', contractorId: 'C004', submittedDate: '2025-08-10', reviewer: 'Ananya Singh', status: 'Approved', firstPassResult: 'Pass', daysAwaiting: 0, slaBreach: false, history: [{ date: '2025-08-10', action: 'Submitted', actor: 'Kapoor Finishing Works' }, { date: '2025-08-12', action: 'Approved', actor: 'Ananya Singh' }] },
  { id: 'WIR-0043', projectId: 'P004', tower: 'Tower 3', activity: 'Slab Reinforcement — 3rd Floor', contractorId: 'C008', submittedDate: '2025-08-25', reviewer: 'Vikram Joshi', status: 'Approved', firstPassResult: 'Pass', daysAwaiting: 0, slaBreach: false, history: [{ date: '2025-08-25', action: 'Submitted', actor: 'VK Concreting' }, { date: '2025-08-27', action: 'Approved', actor: 'Vikram Joshi' }] },
  { id: 'WIR-0044', projectId: 'P004', tower: 'Tower 1', activity: 'Steel Rebar — 4th Floor', contractorId: 'C011', submittedDate: '2025-08-20', reviewer: 'Vikram Joshi', status: 'Rejected', firstPassResult: 'Fail', rejectionReason: 'Dowel bar diameter incorrect. Lapping zone non-compliant.', daysAwaiting: 0, slaBreach: false, history: [{ date: '2025-08-20', action: 'Submitted', actor: 'Apex Steel Fabricators' }, { date: '2025-08-22', action: 'Rejected', actor: 'Vikram Joshi', note: 'Dowel bar issue.' }, { date: '2025-08-25', action: 'Resubmitted', actor: 'Apex Steel Fabricators' }, { date: '2025-08-28', action: 'Approved', actor: 'Vikram Joshi' }] },
  { id: 'WIR-0045', projectId: 'P005', tower: 'Phase 1', activity: 'Tile Work — Level 3', contractorId: 'C008', submittedDate: '2025-08-15', reviewer: 'Meera Pillai', status: 'Approved', firstPassResult: 'Pass', daysAwaiting: 0, slaBreach: false, history: [{ date: '2025-08-15', action: 'Submitted', actor: 'VK Concreting' }, { date: '2025-08-17', action: 'Approved', actor: 'Meera Pillai' }] },
  { id: 'WIR-0046', projectId: 'P006', tower: 'Tower X', activity: 'Slab Pouring — 2nd Floor', contractorId: 'C005', submittedDate: '2025-08-10', reviewer: 'Deepak Rao', status: 'Approved', firstPassResult: 'Pass', daysAwaiting: 0, slaBreach: false, history: [{ date: '2025-08-10', action: 'Submitted', actor: 'Shree Ram Infra' }, { date: '2025-08-12', action: 'Approved', actor: 'Deepak Rao' }] },
  { id: 'WIR-0047', projectId: 'P003', tower: 'Wing A', activity: 'Pile Load Test — A3 Pile', contractorId: 'C002', submittedDate: '2025-08-28', reviewer: 'Suresh Kumar', status: 'Approved', firstPassResult: 'Pass', daysAwaiting: 0, slaBreach: false, history: [{ date: '2025-08-28', action: 'Submitted', actor: 'Reliable Constructions' }, { date: '2025-08-30', action: 'Approved', actor: 'Suresh Kumar' }] },
  { id: 'WIR-0048', projectId: 'P002', tower: 'Block 2', activity: 'Internal Plaster — Level 5', contractorId: 'C004', submittedDate: '2025-08-18', reviewer: 'Ananya Singh', status: 'Approved', firstPassResult: 'Pass', daysAwaiting: 0, slaBreach: false, history: [{ date: '2025-08-18', action: 'Submitted', actor: 'Kapoor Finishing Works' }, { date: '2025-08-20', action: 'Approved', actor: 'Ananya Singh' }] },
  { id: 'WIR-0049', projectId: 'P001', tower: 'Tower B', activity: 'Slab Waterproofing — 4th Floor', contractorId: 'C007', submittedDate: '2025-08-05', reviewer: 'Priya Nair', status: 'Approved', firstPassResult: 'Pass', daysAwaiting: 0, slaBreach: false, history: [{ date: '2025-08-05', action: 'Submitted', actor: 'Elite Waterproofing' }, { date: '2025-08-07', action: 'Approved', actor: 'Priya Nair' }] },
  { id: 'WIR-0050', projectId: 'P004', tower: 'Tower 2', activity: 'MEP Chasing — Level 3', contractorId: 'C006', submittedDate: '2025-09-10', reviewer: 'Vikram Joshi', status: 'Approved', firstPassResult: 'Pass', daysAwaiting: 0, slaBreach: false, history: [{ date: '2025-09-10', action: 'Submitted', actor: 'Precision MEP Systems' }, { date: '2025-09-12', action: 'Approved', actor: 'Vikram Joshi' }] },
  { id: 'WIR-0051', projectId: 'P006', tower: 'Tower Z', activity: 'Column Shuttering — 3rd Floor', contractorId: 'C009', submittedDate: '2025-09-12', reviewer: 'Deepak Rao', status: 'Approved', firstPassResult: 'Pass', daysAwaiting: 0, slaBreach: false, history: [{ date: '2025-09-12', action: 'Submitted', actor: 'Greentech Formwork' }, { date: '2025-09-14', action: 'Approved', actor: 'Deepak Rao' }] },
  { id: 'WIR-0052', projectId: 'P005', tower: 'Phase 2', activity: 'Internal Plaster — Level 14', contractorId: 'C003', submittedDate: '2025-08-28', reviewer: 'Meera Pillai', status: 'Approved', firstPassResult: 'Pass', daysAwaiting: 0, slaBreach: false, history: [{ date: '2025-08-28', action: 'Submitted', actor: 'UrbanBuild India' }, { date: '2025-08-30', action: 'Approved', actor: 'Meera Pillai' }] },
];

// ── NC Records ────────────────────────────────────────────────
export interface NCHistoryEntry {
  date: string;
  action: string;
  actor: string;
  note?: string;
}

export interface NC {
  id: string;
  projectId: string;
  tower: string;
  finding: string;
  severity: NCSeverity;
  contractorId: string;
  dateRaised: string;
  age: number;
  dueDate: string;
  owner: string;
  status: NCStatus;
  isRepeat: boolean;
  repeatCategory?: string;
  linkedWIR?: string;
  rectificationNotes?: string;
  verificationOutcome?: string;
  history: NCHistoryEntry[];
  sitePhoto?: SitePhoto;
}

export let NC_RECORDS: NC[] = [
  // P004 - Riverstone Towers (Critical / Poor)
  {
    id: 'NC-0001',
    projectId: 'P004',
    tower: 'Tower 1',
    finding: 'Concrete cube test failure — 28-day compressive strength 24.8 MPa vs required 30 MPa (M30 grade)',
    severity: 'Critical',
    contractorId: 'C001',
    dateRaised: '2025-09-05',
    age: 39,
    dueDate: '2025-09-15',
    owner: 'Vikram Joshi',
    status: 'Open',
    isRepeat: false,
    linkedWIR: 'WIR-0021',
    history: [
      { date: '2025-09-05', action: 'NC Raised', actor: 'Vikram Joshi', note: 'Cube test failure reported from lab.' },
      { date: '2025-09-06', action: 'Assigned', actor: 'Vikram Joshi', note: 'Assigned to ABC Civil Works.' }
    ],
    sitePhoto: {
      url: '/defects/nc-0001-cube-fail.jpg',
      caption: 'IS:516 Compressive Strength Test Failure — 28-day concrete cube crushed at 24.8 MPa (Spec: M30)',
      timestamp: '2025-09-05 11:40 IST',
      locationGPS: '28.4595° N, 77.0266° E · NABL On-Site Testing Lab',
      author: 'Vikram Joshi (QA Lead)',
      defectTag: 'CRITICAL FAILURE: 24.8 MPa vs 30.0 MPa Specified',
      isLabReport: true,
    },
  },
  {
    id: 'NC-0002',
    projectId: 'P004',
    tower: 'Tower 1',
    finding: 'Honeycombing in structural columns T1-C12, C14, C18 — concrete voids visible on surface',
    severity: 'Critical',
    contractorId: 'C001',
    dateRaised: '2025-09-05',
    age: 39,
    dueDate: '2025-09-20',
    owner: 'Vikram Joshi',
    status: 'Rectification',
    isRepeat: false,
    linkedWIR: 'WIR-0021',
    rectificationNotes: 'Non-shrink grout injection planned. Structural engineer approval obtained.',
    history: [
      { date: '2025-09-05', action: 'NC Raised', actor: 'Vikram Joshi' },
      { date: '2025-09-06', action: 'Assigned', actor: 'Vikram Joshi' },
      { date: '2025-09-25', action: 'Rectification', actor: 'ABC Civil Works', note: 'Grouting commenced.' }
    ],
    sitePhoto: {
      url: '/defects/nc-0002-honeycombing.jpg',
      caption: 'Severe aggregate segregation and void cavity (>45mm depth) at column T1-C14 base post-stripping',
      timestamp: '2025-09-05 14:15 IST',
      locationGPS: '28.4595° N, 77.0266° E · Tower 1 Level 5 Column C14',
      author: 'Vikram Joshi (QA Lead)',
      defectTag: 'DEFECT: Structural Honeycombing >45mm Void',
    },
  },
  { id: 'NC-0003', projectId: 'P004', tower: 'Tower 1', finding: 'Rebar cover non-compliant — measured 15 mm vs minimum 40 mm requirement at slab soffit', severity: 'High', contractorId: 'C008', dateRaised: '2025-09-08', age: 36, dueDate: '2025-09-22', owner: 'Vikram Joshi', status: 'Open', isRepeat: true, repeatCategory: 'Rebar Cover', history: [{ date: '2025-09-08', action: 'NC Raised', actor: 'Vikram Joshi' }, { date: '2025-09-09', action: 'Assigned', actor: 'Vikram Joshi' }] },
  { id: 'NC-0004', projectId: 'P004', tower: 'Tower 2', finding: 'Dowel bars missing at construction joint — Tower 2 plinth beam to column junction', severity: 'High', contractorId: 'C008', dateRaised: '2025-09-12', age: 32, dueDate: '2025-09-26', owner: 'Vikram Joshi', status: 'Assigned', isRepeat: false, history: [{ date: '2025-09-12', action: 'NC Raised', actor: 'Vikram Joshi' }, { date: '2025-09-13', action: 'Assigned', actor: 'Vikram Joshi' }] },
  { id: 'NC-0005', projectId: 'P004', tower: 'Tower 3', finding: 'Surface laitance not removed before screed — 200 sq m of bonded screed at risk of delamination', severity: 'Medium', contractorId: 'C006', dateRaised: '2025-09-28', age: 16, dueDate: '2025-10-12', owner: 'Vikram Joshi', status: 'Open', isRepeat: false, history: [{ date: '2025-09-28', action: 'NC Raised', actor: 'Vikram Joshi' }] },

  // P001 - Meridian Heights (Amber)
  {
    id: 'NC-0006',
    projectId: 'P001',
    tower: 'Tower B',
    finding: 'Rebar spacing non-compliant — column B-12, B-14, B-17: stirrup spacing 250 mm vs specified 150 mm',
    severity: 'High',
    contractorId: 'C001',
    dateRaised: '2025-09-13',
    age: 31,
    dueDate: '2025-09-27',
    owner: 'Rajan Mehta',
    status: 'Open',
    isRepeat: true,
    repeatCategory: 'Rebar Spacing',
    linkedWIR: 'WIR-0002',
    history: [
      { date: '2025-09-13', action: 'NC Raised', actor: 'Rajan Mehta', note: 'From rejected WIR-0002.' },
      { date: '2025-09-14', action: 'Assigned', actor: 'Rajan Mehta' }
    ],
    sitePhoto: {
      url: '/defects/nc-0006-rebar-spacing.jpg',
      caption: 'Column cage inspection with tape measurement showing 250mm stirrup tie spacing vs 150mm drawing spec',
      timestamp: '2025-09-13 16:05 IST',
      locationGPS: '19.0760° N, 72.8777° E · Tower B 6th Floor',
      author: 'Rajan Mehta (Site QA)',
      defectTag: 'NON-COMPLIANCE: 250mm Spacing > 150mm Spec',
    },
  },
  { id: 'NC-0007', projectId: 'P001', tower: 'Tower B', finding: 'MEP conduit bending radius non-compliant — 6 locations on 6th floor exceed maximum bend angle', severity: 'Medium', contractorId: 'C003', dateRaised: '2025-10-01', age: 13, dueDate: '2025-10-15', owner: 'Priya Nair', status: 'Assigned', isRepeat: false, linkedWIR: 'WIR-0006', history: [{ date: '2025-10-01', action: 'NC Raised', actor: 'Priya Nair' }, { date: '2025-10-02', action: 'Assigned', actor: 'Priya Nair' }] },
  { id: 'NC-0008', projectId: 'P001', tower: 'Tower A', finding: 'Construction joint surface not prepared correctly — no shear key provided at slab-to-column junction', severity: 'Medium', contractorId: 'C001', dateRaised: '2025-09-20', age: 24, dueDate: '2025-10-04', owner: 'Rajan Mehta', status: 'Rectification', isRepeat: false, history: [{ date: '2025-09-20', action: 'NC Raised', actor: 'Rajan Mehta' }, { date: '2025-09-21', action: 'Assigned', actor: 'Rajan Mehta' }, { date: '2025-09-28', action: 'Rectification', actor: 'ABC Civil Works', note: 'Shear key being formed before next pour.' }] },
  { id: 'NC-0009', projectId: 'P001', tower: 'Tower C', finding: 'Brick coursing alignment deviation >10 mm in external masonry — 3rd to 5th floor facade', severity: 'Low', contractorId: 'C001', dateRaised: '2025-10-02', age: 12, dueDate: '2025-10-16', owner: 'Priya Nair', status: 'Open', isRepeat: false, history: [{ date: '2025-10-02', action: 'NC Raised', actor: 'Priya Nair' }] },

  // P006 - Summit Greens (Amber)
  {
    id: 'NC-0010',
    projectId: 'P006',
    tower: 'Tower Y',
    finding: 'Stirrup spacing non-compliant at column head zone — 12 columns on level 3',
    severity: 'High',
    contractorId: 'C005',
    dateRaised: '2025-09-17',
    age: 27,
    dueDate: '2025-10-01',
    owner: 'Deepak Rao',
    status: 'Open',
    isRepeat: true,
    repeatCategory: 'Rebar Spacing',
    linkedWIR: 'WIR-0034',
    history: [
      { date: '2025-09-17', action: 'NC Raised', actor: 'Deepak Rao' },
      { date: '2025-09-18', action: 'Assigned', actor: 'Deepak Rao' }
    ],
    sitePhoto: {
      url: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=1200&q=80',
      caption: 'Column head zone reinforcement showing lack of confinement links before shuttering closure',
      timestamp: '2025-09-17 10:30 IST',
      locationGPS: '13.0827° N, 80.2707° E · Tower Y Level 3',
      author: 'Deepak Rao (QA Lead)',
      defectTag: 'CONFINEMENT ZONE: Missing secondary ties',
    },
  },
  { id: 'NC-0011', projectId: 'P006', tower: 'Tower Z', finding: 'Plumbing sleeves not installed before concreting — remedial coring required at 8 locations', severity: 'Medium', contractorId: 'C003', dateRaised: '2025-09-22', age: 22, dueDate: '2025-10-06', owner: 'Deepak Rao', status: 'Rectification', isRepeat: false, history: [{ date: '2025-09-22', action: 'NC Raised', actor: 'Deepak Rao' }, { date: '2025-09-24', action: 'Assigned', actor: 'Deepak Rao' }, { date: '2025-10-01', action: 'Rectification', actor: 'UrbanBuild India', note: 'Coring approved by structural engineer.' }] },
  { id: 'NC-0012', projectId: 'P006', tower: 'Tower X', finding: 'Formwork prop spacing exceeds design — 2.4 m spacing found vs 1.8 m required at 3rd floor slab', severity: 'High', contractorId: 'C009', dateRaised: '2025-10-03', age: 11, dueDate: '2025-10-17', owner: 'Deepak Rao', status: 'Open', isRepeat: false, history: [{ date: '2025-10-03', action: 'NC Raised', actor: 'Deepak Rao' }] },

  // P003 - Cedar Park (Amber)
  { id: 'NC-0013', projectId: 'P003', tower: 'Wing A', finding: 'Formwork alignment deviation — grade beam offset by 18 mm from centreline', severity: 'Medium', contractorId: 'C009', dateRaised: '2025-10-08', age: 6, dueDate: '2025-10-22', owner: 'Suresh Kumar', status: 'Assigned', isRepeat: false, linkedWIR: 'WIR-0019', history: [{ date: '2025-10-08', action: 'NC Raised', actor: 'Suresh Kumar', note: 'From rejected WIR-0019.' }, { date: '2025-10-09', action: 'Assigned', actor: 'Suresh Kumar' }] },
  { id: 'NC-0014', projectId: 'P003', tower: 'Wing B', finding: 'Pile bore diameter deviation — 4 piles at 495 mm vs specified 550 mm', severity: 'High', contractorId: 'C002', dateRaised: '2025-09-30', age: 14, dueDate: '2025-10-14', owner: 'Suresh Kumar', status: 'Open', isRepeat: false, history: [{ date: '2025-09-30', action: 'NC Raised', actor: 'Suresh Kumar' }, { date: '2025-10-01', action: 'Assigned', actor: 'Suresh Kumar' }] },

  // P002 - Northgate Residences (Green/Amber)
  { id: 'NC-0015', projectId: 'P002', tower: 'Block 1', finding: 'Waterproofing membrane lap joint inadequately bonded — 3 locations in Block 1 bathrooms', severity: 'Medium', contractorId: 'C007', dateRaised: '2025-09-24', age: 20, dueDate: '2025-10-08', owner: 'Ananya Singh', status: 'Closed', isRepeat: false, linkedWIR: 'WIR-0012', rectificationNotes: 'Membrane re-applied and bonded correctly.', verificationOutcome: 'Passed — bond test confirms adequate adhesion.', history: [{ date: '2025-09-24', action: 'NC Raised', actor: 'Ananya Singh' }, { date: '2025-09-25', action: 'Assigned', actor: 'Ananya Singh' }, { date: '2025-09-29', action: 'Rectification', actor: 'Elite Waterproofing' }, { date: '2025-10-02', action: 'Evidence Submitted', actor: 'Elite Waterproofing' }, { date: '2025-10-04', action: 'Verification', actor: 'Ananya Singh' }, { date: '2025-10-05', action: 'Closed', actor: 'Ananya Singh', note: 'Passed verification.' }] },
  { id: 'NC-0016', projectId: 'P002', tower: 'Block 3', finding: 'Tile lippage exceeds 1.5 mm tolerance — lobby flooring to be re-laid at 6 bays', severity: 'Low', contractorId: 'C012', dateRaised: '2025-10-07', age: 7, dueDate: '2025-10-21', owner: 'Ananya Singh', status: 'Assigned', isRepeat: false, history: [{ date: '2025-10-07', action: 'NC Raised', actor: 'Ananya Singh' }, { date: '2025-10-08', action: 'Assigned', actor: 'Ananya Singh' }] },

  // P005 - Harbour Point (Green)
  { id: 'NC-0017', projectId: 'P005', tower: 'Phase 1', finding: 'Minor plaster crack at construction joint — 2 locations, hairline width <0.2 mm', severity: 'Low', contractorId: 'C003', dateRaised: '2025-09-15', age: 29, dueDate: '2025-09-29', owner: 'Meera Pillai', status: 'Closed', isRepeat: false, rectificationNotes: 'Crack sealed with elastomeric sealant.', verificationOutcome: 'Passed.', history: [{ date: '2025-09-15', action: 'NC Raised', actor: 'Meera Pillai' }, { date: '2025-09-16', action: 'Assigned', actor: 'Meera Pillai' }, { date: '2025-09-20', action: 'Rectification', actor: 'UrbanBuild India' }, { date: '2025-09-22', action: 'Evidence Submitted', actor: 'UrbanBuild India' }, { date: '2025-09-24', action: 'Closed', actor: 'Meera Pillai' }] },
  { id: 'NC-0018', projectId: 'P005', tower: 'Phase 2', finding: 'External cladding joint sealant colour mismatch — 12 panels on Level 12 east facade', severity: 'Low', contractorId: 'C003', dateRaised: '2025-10-05', age: 9, dueDate: '2025-10-19', owner: 'Meera Pillai', status: 'Rectification', isRepeat: false, history: [{ date: '2025-10-05', action: 'NC Raised', actor: 'Meera Pillai' }, { date: '2025-10-06', action: 'Assigned', actor: 'Meera Pillai' }, { date: '2025-10-09', action: 'Rectification', actor: 'UrbanBuild India', note: 'Replacement sealant ordered.' }] },

  // Additional NC for repeat tracking
  { id: 'NC-0019', projectId: 'P001', tower: 'Tower A', finding: 'Rebar spacing non-compliant — beam stirrups at 250 mm vs 125 mm at critical zone (5th Floor)', severity: 'High', contractorId: 'C001', dateRaised: '2025-07-15', age: 91, dueDate: '2025-07-29', owner: 'Rajan Mehta', status: 'Closed', isRepeat: false, repeatCategory: 'Rebar Spacing', history: [{ date: '2025-07-15', action: 'NC Raised', actor: 'Rajan Mehta' }, { date: '2025-07-20', action: 'Rectification', actor: 'ABC Civil Works' }, { date: '2025-07-28', action: 'Closed', actor: 'Rajan Mehta' }] },
  { id: 'NC-0020', projectId: 'P004', tower: 'Tower 2', finding: 'Rebar cover insufficient — slab top steel cover 18 mm vs required 25 mm at Level 4', severity: 'High', contractorId: 'C008', dateRaised: '2025-08-10', age: 65, dueDate: '2025-08-24', owner: 'Vikram Joshi', status: 'Closed', isRepeat: true, repeatCategory: 'Rebar Cover', history: [{ date: '2025-08-10', action: 'NC Raised', actor: 'Vikram Joshi' }, { date: '2025-08-18', action: 'Rectification', actor: 'VK Concreting' }, { date: '2025-08-23', action: 'Closed', actor: 'Vikram Joshi' }] },
  { id: 'NC-0021', projectId: 'P004', tower: 'Tower 1', finding: 'Construction joint cold joint formed — pour delay exceeded 2 hours at 5th floor slab soffit', severity: 'Critical', contractorId: 'C001', dateRaised: '2025-09-26', age: 18, dueDate: '2025-10-03', owner: 'Vikram Joshi', status: 'Open', isRepeat: false, history: [{ date: '2025-09-26', action: 'NC Raised', actor: 'Vikram Joshi' }, { date: '2025-09-27', action: 'Assigned', actor: 'Vikram Joshi' }] },
  { id: 'NC-0022', projectId: 'P006', tower: 'Tower X', finding: 'Concrete segregation at slab edge — aggregate visible without mortar matrix at pour edge', severity: 'Medium', contractorId: 'C005', dateRaised: '2025-10-06', age: 8, dueDate: '2025-10-20', owner: 'Deepak Rao', status: 'Open', isRepeat: false, history: [{ date: '2025-10-06', action: 'NC Raised', actor: 'Deepak Rao' }] },
  { id: 'NC-0023', projectId: 'P003', tower: 'Wing B', finding: 'Soil compaction test failure — Field density ratio 88% vs required 95% at subgrade', severity: 'High', contractorId: 'C002', dateRaised: '2025-10-04', age: 10, dueDate: '2025-10-18', owner: 'Suresh Kumar', status: 'Assigned', isRepeat: false, history: [{ date: '2025-10-04', action: 'NC Raised', actor: 'Suresh Kumar' }, { date: '2025-10-05', action: 'Assigned', actor: 'Suresh Kumar' }] },
  { id: 'NC-0024', projectId: 'P001', tower: 'Tower B', finding: 'Junction box not grouted flush — 4 junction boxes protruding 8-10 mm beyond plaster surface', severity: 'Low', contractorId: 'C003', dateRaised: '2025-10-03', age: 11, dueDate: '2025-10-17', owner: 'Priya Nair', status: 'Open', isRepeat: false, linkedWIR: 'WIR-0006', history: [{ date: '2025-10-03', action: 'NC Raised', actor: 'Priya Nair' }] },
  { id: 'NC-0025', projectId: 'P005', tower: 'Phase 1', finding: 'Facade paint colour variation — Lot B paint showing 4 Delta-E deviation from approved shade', severity: 'Low', contractorId: 'C003', dateRaised: '2025-09-28', age: 16, dueDate: '2025-10-12', owner: 'Meera Pillai', status: 'Closed', isRepeat: false, history: [{ date: '2025-09-28', action: 'NC Raised', actor: 'Meera Pillai' }, { date: '2025-10-05', action: 'Closed', actor: 'Meera Pillai', note: 'Repainting completed.' }] },
];

// ── Audit Records ─────────────────────────────────────────────
export interface Audit {
  id: string;
  projectId: string;
  auditDate: string;
  type: AuditType;
  rating: number; // 1–5 scale
  percentageScore: number; // normalised 0–100
  findingsRaised: number;
  outstandingCAs: number;
  status: AuditStatus;
  auditor: string;
  notes?: string;
}

export const AUDIT_RECORDS: Audit[] = [
  // P001 - Meridian Heights
  { id: 'AUD-001', projectId: 'P001', auditDate: '2025-09-01', type: 'Internal', rating: 3.5, percentageScore: 70, findingsRaised: 8, outstandingCAs: 3, status: 'Completed', auditor: 'Quality Dept', notes: 'Rebar compliance issues found. Waterproofing acceptable.' },
  { id: 'AUD-002', projectId: 'P001', auditDate: '2025-06-01', type: 'External', rating: 3.8, percentageScore: 76, findingsRaised: 5, outstandingCAs: 0, status: 'Completed', auditor: 'Bureau Veritas', notes: 'Second-party audit — structural quality satisfactory.' },
  // P002 - Northgate Residences
  { id: 'AUD-003', projectId: 'P002', auditDate: '2025-09-15', type: 'Internal', rating: 4.2, percentageScore: 84, findingsRaised: 3, outstandingCAs: 1, status: 'Completed', auditor: 'Quality Dept', notes: 'Finishing quality good. Minor waterproofing laps noted.' },
  { id: 'AUD-004', projectId: 'P002', auditDate: '2025-07-01', type: 'External', rating: 4.0, percentageScore: 80, findingsRaised: 4, outstandingCAs: 0, status: 'Completed', auditor: 'SGS India', notes: 'Acceptable quality levels. Plaster crack monitoring recommended.' },
  // P003 - Cedar Park
  { id: 'AUD-005', projectId: 'P003', auditDate: '2025-09-20', type: 'Internal', rating: 3.2, percentageScore: 64, findingsRaised: 6, outstandingCAs: 4, status: 'Completed', auditor: 'Quality Dept', notes: 'Pile diameter deviation and compaction failure flagged.' },
  // P004 - Riverstone Towers
  { id: 'AUD-006', projectId: 'P004', auditDate: '2025-09-10', type: 'Internal', rating: 2.1, percentageScore: 42, findingsRaised: 14, outstandingCAs: 9, status: 'Completed', auditor: 'Quality Dept', notes: 'Critical concrete quality issues. Structural integrity review ordered.' },
  { id: 'AUD-007', projectId: 'P004', auditDate: '2025-07-15', type: 'External', rating: 2.8, percentageScore: 56, findingsRaised: 10, outstandingCAs: 5, status: 'Completed', auditor: 'TÜV Rheinland India', notes: 'Below acceptable quality threshold. Follow-up audit scheduled.' },
  // P005 - Harbour Point
  { id: 'AUD-008', projectId: 'P005', auditDate: '2025-09-25', type: 'Internal', rating: 4.5, percentageScore: 90, findingsRaised: 2, outstandingCAs: 0, status: 'Completed', auditor: 'Quality Dept', notes: 'Excellent finishing quality. Minor sealant colour issue logged.' },
  { id: 'AUD-009', projectId: 'P005', auditDate: '2025-08-01', type: 'External', rating: 4.3, percentageScore: 86, findingsRaised: 3, outstandingCAs: 0, status: 'Completed', auditor: 'Bureau Veritas', notes: 'Good quality across all inspected areas.' },
  // P006 - Summit Greens
  { id: 'AUD-010', projectId: 'P006', auditDate: '2025-09-28', type: 'Internal', rating: 3.4, percentageScore: 68, findingsRaised: 7, outstandingCAs: 4, status: 'Completed', auditor: 'Quality Dept', notes: 'Rebar and formwork compliance needs improvement.' },
  { id: 'AUD-011', projectId: 'P006', auditDate: '2025-07-20', type: 'External', rating: 3.0, percentageScore: 60, findingsRaised: 9, outstandingCAs: 3, status: 'Completed', auditor: 'SGS India', notes: 'Quality concerns noted — improvement plan required.' },
  // Scheduled future
  { id: 'AUD-012', projectId: 'P003', auditDate: '2025-11-10', type: 'External', rating: 0, percentageScore: 0, findingsRaised: 0, outstandingCAs: 0, status: 'Scheduled', auditor: 'Bureau Veritas', notes: 'Pre-scheduled external audit.' },
];

// ── Historical Quality Score Snapshots ─────────────────────────
export interface HistoricalScore {
  month: string; // 'YYYY-MM'
  projectId: string;
  score: number;
}

export const HISTORICAL_SCORES: HistoricalScore[] = [
  // P001 - Meridian Heights (gradual decline from 82 to 68)
  { month: '2025-04', projectId: 'P001', score: 82 },
  { month: '2025-05', projectId: 'P001', score: 80 },
  { month: '2025-06', projectId: 'P001', score: 78 },
  { month: '2025-07', projectId: 'P001', score: 75 },
  { month: '2025-08', projectId: 'P001', score: 72 },
  { month: '2025-09', projectId: 'P001', score: 68 },

  // P002 - Northgate Residences (stable high)
  { month: '2025-04', projectId: 'P002', score: 84 },
  { month: '2025-05', projectId: 'P002', score: 85 },
  { month: '2025-06', projectId: 'P002', score: 83 },
  { month: '2025-07', projectId: 'P002', score: 86 },
  { month: '2025-08', projectId: 'P002', score: 85 },
  { month: '2025-09', projectId: 'P002', score: 84 },

  // P003 - Cedar Park (early-stage, declining)
  { month: '2025-04', projectId: 'P003', score: 78 },
  { month: '2025-05', projectId: 'P003', score: 75 },
  { month: '2025-06', projectId: 'P003', score: 72 },
  { month: '2025-07', projectId: 'P003', score: 70 },
  { month: '2025-08', projectId: 'P003', score: 67 },
  { month: '2025-09', projectId: 'P003', score: 63 },

  // P004 - Riverstone Towers (sharp drop — critical)
  { month: '2025-04', projectId: 'P004', score: 70 },
  { month: '2025-05', projectId: 'P004', score: 66 },
  { month: '2025-06', projectId: 'P004', score: 61 },
  { month: '2025-07', projectId: 'P004', score: 55 },
  { month: '2025-08', projectId: 'P004', score: 49 },
  { month: '2025-09', projectId: 'P004', score: 42 },

  // P005 - Harbour Point (strong and improving)
  { month: '2025-04', projectId: 'P005', score: 85 },
  { month: '2025-05', projectId: 'P005', score: 86 },
  { month: '2025-06', projectId: 'P005', score: 88 },
  { month: '2025-07', projectId: 'P005', score: 87 },
  { month: '2025-08', projectId: 'P005', score: 89 },
  { month: '2025-09', projectId: 'P005', score: 91 },

  // P006 - Summit Greens (moderate, slight decline)
  { month: '2025-04', projectId: 'P006', score: 74 },
  { month: '2025-05', projectId: 'P006', score: 72 },
  { month: '2025-06', projectId: 'P006', score: 73 },
  { month: '2025-07', projectId: 'P006', score: 70 },
  { month: '2025-08', projectId: 'P006', score: 68 },
  { month: '2025-09', projectId: 'P006', score: 65 },
];

// ── SLA Config ────────────────────────────────────────────────
export const SLA_DAYS = 7; // WIR review SLA in days

// ── Score Config (configurable weights) ───────────────────────
export interface ScoreWeights {
  wirPassRate: number;   // 0–100 (percentage)
  ncHealth: number;      // 0–100 (percentage)
  auditScore: number;    // 0–100 (percentage)
}

export const DEFAULT_WEIGHTS: ScoreWeights = {
  wirPassRate: 40,
  ncHealth: 35,
  auditScore: 25,
};

// NC Penalty config
export const NC_PENALTIES = {
  Critical: 12,
  High: 7,
  Medium: 3,
  Low: 1,
  overduePerWeek: 2,
  overdueMax: 10,
};

// RAG thresholds
export const RAG_THRESHOLDS = {
  green: 80,
  amber: 60,
};
