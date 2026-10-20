// ============================================================
// SEED DATA — BombayDC Construction Quality Dashboard
// All metrics derive from these records. Single source of truth.
// ============================================================

export type Region = 'Mumbai' | 'Pune' | 'Bengaluru' | 'Hyderabad' | 'NCR';
export type ProjectStage = 'Foundation' | 'Structure' | 'Masonry' | 'Finishing' | 'Handover';
export type WIRStatus = 'Draft' | 'Submitted' | 'Awaiting Review' | 'Rejected' | 'Rectification In Progress' | 'Resubmitted' | 'Approved';
export type NCSeverity = 'Critical' | 'High' | 'Medium' | 'Low';
export type NCCategory = 'Material Quality' | 'Workmanship / Workforce' | 'Safety' | 'Regulatory / Approvals' | 'Process / Other';
export type NCStatus = 'Open' | 'Assigned' | 'Rectification' | 'Evidence Submitted' | 'Verification' | 'Closed' | 'Rejected Verification';
export type AuditType = 'Internal' | 'External';
export type AuditStatus = 'Completed' | 'In Progress' | 'Scheduled';
export type ConstructionStage = 'Foundation' | 'Column casting' | 'Slab casting' | 'Masonry' | 'Plastering' | 'Painting' | 'Finishing';

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
  targetProgressPercentage: number;
  projectManager: string;
  qualityLead: string;
  image: string;
  totalBuildings: number;
  completedBuildings: number;
  underConstructionBuildings: number;
  delayedBuildings: number;
  // Commercial & Unit Inventory for CXO
  totalUnits: number;
  soldUnits: number;
  underConstructionUnits: number;
  completedUnits: number;
  inventoryValueCr: number;
  bookedValueCr: number;
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
    targetProgressPercentage: 66,
    projectManager: 'A. Sharma',
    qualityLead: 'M. Joshi',
    image: '/projects/p001-meridian.jpg',
    totalBuildings: 3,
    completedBuildings: 0,
    underConstructionBuildings: 3,
    delayedBuildings: 1,
    totalUnits: 420,
    soldUnits: 336,
    underConstructionUnits: 280,
    completedUnits: 0,
    inventoryValueCr: 840,
    bookedValueCr: 672,
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
    targetProgressPercentage: 75,
    projectManager: 'R. Mehta',
    qualityLead: 'D. Sen',
    image: '/projects/p002-northgate.jpg',
    totalBuildings: 4,
    completedBuildings: 1,
    underConstructionBuildings: 3,
    delayedBuildings: 0,
    totalUnits: 560,
    soldUnits: 480,
    underConstructionUnits: 380,
    completedUnits: 120,
    inventoryValueCr: 672,
    bookedValueCr: 576,
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
    targetProgressPercentage: 35,
    projectManager: 'S. Rao',
    qualityLead: 'A. Verma',
    image: '/projects/p003-cedar-park.jpg',
    totalBuildings: 2,
    completedBuildings: 0,
    underConstructionBuildings: 2,
    delayedBuildings: 1,
    totalUnits: 320,
    soldUnits: 224,
    underConstructionUnits: 180,
    completedUnits: 0,
    inventoryValueCr: 480,
    bookedValueCr: 336,
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
    targetProgressPercentage: 62,
    projectManager: 'V. Nair',
    qualityLead: 'T. Pillai',
    image: '/projects/p004-riverstone.jpg',
    totalBuildings: 3,
    completedBuildings: 0,
    underConstructionBuildings: 3,
    delayedBuildings: 2,
    totalUnits: 480,
    soldUnits: 278,
    underConstructionUnits: 340,
    completedUnits: 0,
    inventoryValueCr: 960,
    bookedValueCr: 556,
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
    targetProgressPercentage: 86,
    projectManager: 'P. Kulkarni',
    qualityLead: 'S. Ghosh',
    image: '/projects/p005-harbour-point.jpg',
    totalBuildings: 2,
    completedBuildings: 1,
    underConstructionBuildings: 1,
    delayedBuildings: 0,
    totalUnits: 350,
    soldUnits: 315,
    underConstructionUnits: 150,
    completedUnits: 200,
    inventoryValueCr: 700,
    bookedValueCr: 630,
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
    targetProgressPercentage: 58,
    projectManager: 'K. Reddy',
    qualityLead: 'N. Iyer',
    image: '/projects/p006-summit-greens.jpg',
    totalBuildings: 3,
    completedBuildings: 0,
    underConstructionBuildings: 3,
    delayedBuildings: 1,
    totalUnits: 380,
    soldUnits: 304,
    underConstructionUnits: 260,
    completedUnits: 0,
    inventoryValueCr: 570,
    bookedValueCr: 456,
  },
  {
    id: 'P007',
    name: 'Vivanta Sereno',
    city: 'Thane',
    region: 'Mumbai',
    stage: 'Masonry',
    towers: ['Tower 1', 'Tower 2'],
    startDate: '2024-01-10',
    targetCompletion: '2026-10-31',
    progressPercentage: 65,
    targetProgressPercentage: 67,
    projectManager: 'H. Deshmukh',
    qualityLead: 'V. Rane',
    image: '/projects/p001-meridian.jpg',
    totalBuildings: 2,
    completedBuildings: 0,
    underConstructionBuildings: 2,
    delayedBuildings: 0,
    totalUnits: 340,
    soldUnits: 238,
    underConstructionUnits: 240,
    completedUnits: 0,
    inventoryValueCr: 510,
    bookedValueCr: 357,
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
  { id: 'C001', name: 'ABC Civil Works', type: 'Civil & Structural', projects: ['P001', 'P004', 'P007'] },
  { id: 'C002', name: 'Reliable Constructions', type: 'Civil & Structural', projects: ['P002', 'P003'] },
  { id: 'C003', name: 'UrbanBuild India', type: 'MEP', projects: ['P001', 'P005', 'P006'] },
  { id: 'C004', name: 'Kapoor Finishing Works', type: 'Finishing & Interiors', projects: ['P002', 'P005'] },
  { id: 'C005', name: 'Shree Ram Infra', type: 'Civil & Structural', projects: ['P006'] },
  { id: 'C006', name: 'Precision MEP Systems', type: 'MEP', projects: ['P003', 'P004'] },
  { id: 'C007', name: 'Elite Waterproofing', type: 'Waterproofing', projects: ['P001', 'P002'] },
  { id: 'C008', name: 'VK Concreting', type: 'Concrete & RCC', projects: ['P004', 'P005'] },
  { id: 'C009', name: 'Greentech Formwork', type: 'Formwork & Shuttering', projects: ['P003', 'P006', 'P007'] },
  { id: 'C010', name: 'Modi Electrical', type: 'Electrical', projects: ['P001', 'P002', 'P003'] },
  { id: 'C011', name: 'Apex Steel Fabricators', type: 'Steel & Rebar', projects: ['P004', 'P006'] },
  { id: 'C012', name: 'Heritage Tiles & Floors', type: 'Finishing & Interiors', projects: ['P002'] },
];

// ── Site Photos & Evidence ────────────────────────────────────
export interface SitePhoto {
  url: string;
  caption: string;
  timestamp: string;
  locationGPS: string;
  author: string;
  defectTag: string;
  isLabReport?: boolean;
}

// ── WIR Records ───────────────────────────────────────────────
export interface WIRHistoryEntry {
  date: string;
  action: string;
  actor: string;
  note?: string;
}

export interface WIR {
  id: string;
  projectId: string;
  tower: string;
  floor?: string;
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
  { id: 'WIR-0001', projectId: 'P001', tower: 'Tower A', floor: 'Floor 08', activity: 'Slab Pouring — 8th Floor', contractorId: 'C001', submittedDate: '2025-09-02', reviewer: 'Rajan Mehta', status: 'Approved', firstPassResult: 'Pass', daysAwaiting: 0, slaBreach: false, history: [{ date: '2025-09-02', action: 'Submitted', actor: 'ABC Civil Works' }, { date: '2025-09-03', action: 'Approved', actor: 'Rajan Mehta', note: 'Work meets specification.' }] },
  { id: 'WIR-0002', projectId: 'P001', tower: 'Tower B', floor: 'Floor 07', activity: 'Column Reinforcement — 7th Floor', contractorId: 'C001', submittedDate: '2025-09-10', reviewer: 'Rajan Mehta', status: 'Rejected', firstPassResult: 'Fail', rejectionReason: 'Rebar spacing does not meet IS 456 requirements. Cover blocks missing in 3 columns.', daysAwaiting: 3, slaBreach: false, inspectionNotes: 'Found cover blocks missing on columns B-12, B-14 and B-17. Spacing non-compliant.', history: [{ date: '2025-09-10', action: 'Submitted', actor: 'ABC Civil Works' }, { date: '2025-09-13', action: 'Rejected', actor: 'Rajan Mehta', note: 'Rebar spacing does not meet IS 456 requirements.' }] },
  { id: 'WIR-0003', projectId: 'P001', tower: 'Tower B', floor: 'Floor 07', activity: 'Column Reinforcement — 7th Floor (Resubmission)', contractorId: 'C001', submittedDate: '2025-09-18', reviewer: 'Rajan Mehta', status: 'Awaiting Review', firstPassResult: 'Fail', daysAwaiting: 8, slaBreach: true, history: [{ date: '2025-09-10', action: 'Submitted', actor: 'ABC Civil Works' }, { date: '2025-09-13', action: 'Rejected', actor: 'Rajan Mehta', note: 'Rebar spacing non-compliant.' }, { date: '2025-09-16', action: 'Rectification In Progress', actor: 'ABC Civil Works', note: 'Corrective work under way.' }, { date: '2025-09-18', action: 'Resubmitted', actor: 'ABC Civil Works', note: 'Cover blocks installed. Spacing corrected.' }] },
  { id: 'WIR-0004', projectId: 'P001', tower: 'Tower C', floor: 'Terrace', activity: 'Waterproofing — Terrace', contractorId: 'C007', submittedDate: '2025-09-20', reviewer: 'Priya Nair', status: 'Approved', firstPassResult: 'Pass', daysAwaiting: 0, slaBreach: false, history: [{ date: '2025-09-20', action: 'Submitted', actor: 'Elite Waterproofing' }, { date: '2025-09-22', action: 'Approved', actor: 'Priya Nair', note: 'Bond coat and membrane properly applied.' }] },
  { id: 'WIR-0005', projectId: 'P001', tower: 'Tower A', floor: 'Floor 09', activity: 'Slab Pouring — 9th Floor', contractorId: 'C001', submittedDate: '2025-09-25', reviewer: 'Rajan Mehta', status: 'Approved', firstPassResult: 'Pass', daysAwaiting: 0, slaBreach: false, history: [{ date: '2025-09-25', action: 'Submitted', actor: 'ABC Civil Works' }, { date: '2025-09-26', action: 'Approved', actor: 'Rajan Mehta' }] },
  { id: 'WIR-0006', projectId: 'P001', tower: 'Tower B', floor: 'Floor 06', activity: 'MEP Conduit Laying — 6th Floor', contractorId: 'C003', submittedDate: '2025-09-28', reviewer: 'Priya Nair', status: 'Rejected', firstPassResult: 'Fail', rejectionReason: 'Conduit bending radius exceeds permissible limit. Junction box positioning incorrect.', daysAwaiting: 12, slaBreach: true, inspectionNotes: 'Multiple conduit bends found at non-compliant radii. 4 junction boxes positioned outside marked zones.', history: [{ date: '2025-09-28', action: 'Submitted', actor: 'UrbanBuild India' }, { date: '2025-10-01', action: 'Rejected', actor: 'Priya Nair', note: 'Conduit bending issues.' }] },
  { id: 'WIR-0007', projectId: 'P001', tower: 'Tower A', floor: 'Floor 10', activity: 'Column Shuttering — 10th Floor', contractorId: 'C001', submittedDate: '2025-10-01', reviewer: 'Rajan Mehta', status: 'Submitted', firstPassResult: 'Pending', daysAwaiting: 13, slaBreach: true, history: [{ date: '2025-10-01', action: 'Submitted', actor: 'ABC Civil Works' }] },
  { id: 'WIR-0008', projectId: 'P001', tower: 'Tower C', floor: 'Basement', activity: 'Electrical Panel Installation — Basement', contractorId: 'C010', submittedDate: '2025-10-05', reviewer: 'Priya Nair', status: 'Awaiting Review', firstPassResult: 'Pending', daysAwaiting: 9, slaBreach: true, history: [{ date: '2025-10-05', action: 'Submitted', actor: 'Modi Electrical' }] },

  // P002 - Northgate Residences
  { id: 'WIR-0009', projectId: 'P002', tower: 'Block 1', floor: 'Floor 03', activity: 'Tile Laying — 3rd Floor Corridor', contractorId: 'C004', submittedDate: '2025-09-05', reviewer: 'Ananya Singh', status: 'Approved', firstPassResult: 'Pass', daysAwaiting: 0, slaBreach: false, history: [{ date: '2025-09-05', action: 'Submitted', actor: 'Kapoor Finishing Works' }, { date: '2025-09-07', action: 'Approved', actor: 'Ananya Singh' }] },
  { id: 'WIR-0010', projectId: 'P002', tower: 'Block 2', floor: 'Floor 04', activity: 'Tile Laying — 4th Floor Apartments', contractorId: 'C004', submittedDate: '2025-09-12', reviewer: 'Ananya Singh', status: 'Approved', firstPassResult: 'Pass', daysAwaiting: 0, slaBreach: false, history: [{ date: '2025-09-12', action: 'Submitted', actor: 'Kapoor Finishing Works' }, { date: '2025-09-14', action: 'Approved', actor: 'Ananya Singh' }] },
  { id: 'WIR-0011', projectId: 'P002', tower: 'Block 3', floor: 'Club House', activity: 'False Ceiling — Club House', contractorId: 'C004', submittedDate: '2025-09-18', reviewer: 'Ananya Singh', status: 'Approved', firstPassResult: 'Pass', daysAwaiting: 0, slaBreach: false, history: [{ date: '2025-09-18', action: 'Submitted', actor: 'Kapoor Finishing Works' }, { date: '2025-09-19', action: 'Approved', actor: 'Ananya Singh' }] },
  { id: 'WIR-0012', projectId: 'P002', tower: 'Block 1', floor: 'Floor 02', activity: 'Waterproofing — Wet Areas', contractorId: 'C007', submittedDate: '2025-09-22', reviewer: 'Ananya Singh', status: 'Rejected', firstPassResult: 'Fail', rejectionReason: 'Membrane thickness insufficient. Lap joints improperly sealed.', daysAwaiting: 5, slaBreach: false, history: [{ date: '2025-09-22', action: 'Submitted', actor: 'Elite Waterproofing' }, { date: '2025-09-24', action: 'Rejected', actor: 'Ananya Singh', note: 'Membrane thickness issue.' }] },
  { id: 'WIR-0013', projectId: 'P002', tower: 'Block 2', floor: 'Facade', activity: 'Painting — External Facade', contractorId: 'C004', submittedDate: '2025-09-28', reviewer: 'Ananya Singh', status: 'Approved', firstPassResult: 'Pass', daysAwaiting: 0, slaBreach: false, history: [{ date: '2025-09-28', action: 'Submitted', actor: 'Kapoor Finishing Works' }, { date: '2025-09-30', action: 'Approved', actor: 'Ananya Singh' }] },
  { id: 'WIR-0014', projectId: 'P002', tower: 'Block 4', floor: 'Floor 05', activity: 'Electrical Wiring — Level 5', contractorId: 'C010', submittedDate: '2025-10-02', reviewer: 'Ananya Singh', status: 'Approved', firstPassResult: 'Pass', daysAwaiting: 0, slaBreach: false, history: [{ date: '2025-10-02', action: 'Submitted', actor: 'Modi Electrical' }, { date: '2025-10-04', action: 'Approved', actor: 'Ananya Singh' }] },
  { id: 'WIR-0015', projectId: 'P002', tower: 'Block 3', floor: 'Lobby', activity: 'Flooring — Lobby', contractorId: 'C012', submittedDate: '2025-10-06', reviewer: 'Ananya Singh', status: 'Submitted', firstPassResult: 'Pending', daysAwaiting: 8, slaBreach: true, history: [{ date: '2025-10-06', action: 'Submitted', actor: 'Heritage Tiles & Floors' }] },

  // P003 - Cedar Park
  { id: 'WIR-0016', projectId: 'P003', tower: 'Wing A', floor: 'Foundation', activity: 'Pile Boring — Grid A1-A8', contractorId: 'C002', submittedDate: '2025-09-10', reviewer: 'Suresh Kumar', status: 'Approved', firstPassResult: 'Pass', daysAwaiting: 0, slaBreach: false, history: [{ date: '2025-09-10', action: 'Submitted', actor: 'Reliable Constructions' }, { date: '2025-09-12', action: 'Approved', actor: 'Suresh Kumar' }] },
  { id: 'WIR-0017', projectId: 'P003', tower: 'Wing A', floor: 'Foundation', activity: 'Pile Cap Reinforcement — Grid A1-A4', contractorId: 'C002', submittedDate: '2025-09-20', reviewer: 'Suresh Kumar', status: 'Approved', firstPassResult: 'Pass', daysAwaiting: 0, slaBreach: false, history: [{ date: '2025-09-20', action: 'Submitted', actor: 'Reliable Constructions' }, { date: '2025-09-22', action: 'Approved', actor: 'Suresh Kumar' }] },
  { id: 'WIR-0018', projectId: 'P003', tower: 'Wing B', floor: 'Foundation', activity: 'Pile Boring — Grid B1-B6', contractorId: 'C002', submittedDate: '2025-10-01', reviewer: 'Suresh Kumar', status: 'Awaiting Review', firstPassResult: 'Pending', daysAwaiting: 13, slaBreach: true, history: [{ date: '2025-10-01', action: 'Submitted', actor: 'Reliable Constructions' }] },
  { id: 'WIR-0019', projectId: 'P003', tower: 'Wing A', floor: 'Plinth', activity: 'Formwork — Grade Beam', contractorId: 'C009', submittedDate: '2025-10-05', reviewer: 'Suresh Kumar', status: 'Rejected', firstPassResult: 'Fail', rejectionReason: 'Formwork alignment deviation beyond tolerance. Bracing inadequate.', daysAwaiting: 9, slaBreach: true, history: [{ date: '2025-10-05', action: 'Submitted', actor: 'Greentech Formwork' }, { date: '2025-10-08', action: 'Rejected', actor: 'Suresh Kumar', note: 'Alignment deviation.' }] },
  { id: 'WIR-0020', projectId: 'P003', tower: 'Wing B', floor: 'Basement', activity: 'MEP Underground — Service Corridor', contractorId: 'C006', submittedDate: '2025-10-08', reviewer: 'Suresh Kumar', status: 'Submitted', firstPassResult: 'Pending', daysAwaiting: 6, slaBreach: false, history: [{ date: '2025-10-08', action: 'Submitted', actor: 'Precision MEP Systems' }] },

  // P004 - Riverstone Towers
  {
    id: 'WIR-0021',
    projectId: 'P004',
    tower: 'Tower 1',
    floor: 'Floor 05',
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
  { id: 'WIR-0022', projectId: 'P004', tower: 'Tower 1', floor: 'Floor 05', activity: 'Column Concreting — 5th Floor (Resubmission)', contractorId: 'C001', submittedDate: '2025-09-22', reviewer: 'Vikram Joshi', status: 'Rejected', firstPassResult: 'Fail', rejectionReason: 'Second concrete test still below specified strength. Remedial grouting not approved.', daysAwaiting: 22, slaBreach: true, history: [{ date: '2025-09-22', action: 'Submitted', actor: 'ABC Civil Works' }, { date: '2025-09-25', action: 'Rejected', actor: 'Vikram Joshi', note: 'Strength still insufficient.' }] },
  { id: 'WIR-0023', projectId: 'P004', tower: 'Tower 2', floor: 'Floor 04', activity: 'Slab Reinforcement — 4th Floor', contractorId: 'C008', submittedDate: '2025-09-15', reviewer: 'Vikram Joshi', status: 'Approved', firstPassResult: 'Pass', daysAwaiting: 0, slaBreach: false, history: [{ date: '2025-09-15', action: 'Submitted', actor: 'VK Concreting' }, { date: '2025-09-17', action: 'Approved', actor: 'Vikram Joshi' }] },
  { id: 'WIR-0024', projectId: 'P004', tower: 'Tower 3', floor: 'Floor 03', activity: 'MEP — HVAC Ductwork Level 3', contractorId: 'C006', submittedDate: '2025-09-25', reviewer: 'Vikram Joshi', status: 'Approved', firstPassResult: 'Pass', daysAwaiting: 0, slaBreach: false, history: [{ date: '2025-09-25', action: 'Submitted', actor: 'Precision MEP Systems' }, { date: '2025-09-27', action: 'Approved', actor: 'Vikram Joshi' }] },
  { id: 'WIR-0025', projectId: 'P004', tower: 'Tower 1', floor: 'Floor 06', activity: 'Steel Rebar Fixing — 6th Floor', contractorId: 'C011', submittedDate: '2025-10-01', reviewer: 'Vikram Joshi', status: 'Awaiting Review', firstPassResult: 'Pending', daysAwaiting: 13, slaBreach: true, history: [{ date: '2025-10-01', action: 'Submitted', actor: 'Apex Steel Fabricators' }] },
  { id: 'WIR-0026', projectId: 'P004', tower: 'Tower 2', floor: 'Floor 05', activity: 'Column Concreting — 5th Floor', contractorId: 'C008', submittedDate: '2025-10-05', reviewer: 'Vikram Joshi', status: 'Submitted', firstPassResult: 'Pending', daysAwaiting: 9, slaBreach: true, history: [{ date: '2025-10-05', action: 'Submitted', actor: 'VK Concreting' }] },

  // P005 - Harbour Point
  { id: 'WIR-0027', projectId: 'P005', tower: 'Phase 1', floor: 'Floor 08', activity: 'External Plastering — Level 8-10', contractorId: 'C003', submittedDate: '2025-09-03', reviewer: 'Meera Pillai', status: 'Approved', firstPassResult: 'Pass', daysAwaiting: 0, slaBreach: false, history: [{ date: '2025-09-03', action: 'Submitted', actor: 'UrbanBuild India' }, { date: '2025-09-05', action: 'Approved', actor: 'Meera Pillai' }] },
  { id: 'WIR-0028', projectId: 'P005', tower: 'Phase 1', floor: 'Floor 05', activity: 'Toilet Waterproofing — Level 5', contractorId: 'C008', submittedDate: '2025-09-10', reviewer: 'Meera Pillai', status: 'Approved', firstPassResult: 'Pass', daysAwaiting: 0, slaBreach: false, history: [{ date: '2025-09-10', action: 'Submitted', actor: 'VK Concreting' }, { date: '2025-09-12', action: 'Approved', actor: 'Meera Pillai' }] },
  { id: 'WIR-0029', projectId: 'P005', tower: 'Phase 2', floor: 'Floor 12', activity: 'Aluminum Facade Cladding — Level 12', contractorId: 'C003', submittedDate: '2025-09-18', reviewer: 'Meera Pillai', status: 'Approved', firstPassResult: 'Pass', daysAwaiting: 0, slaBreach: false, history: [{ date: '2025-09-18', action: 'Submitted', actor: 'UrbanBuild India' }, { date: '2025-09-20', action: 'Approved', actor: 'Meera Pillai' }] },
  { id: 'WIR-0030', projectId: 'P005', tower: 'Phase 1', floor: 'Floor 09', activity: 'Internal Plastering — Level 9', contractorId: 'C003', submittedDate: '2025-09-25', reviewer: 'Meera Pillai', status: 'Approved', firstPassResult: 'Pass', daysAwaiting: 0, slaBreach: false, history: [{ date: '2025-09-25', action: 'Submitted', actor: 'UrbanBuild India' }, { date: '2025-09-27', action: 'Approved', actor: 'Meera Pillai' }] },
  { id: 'WIR-0031', projectId: 'P005', tower: 'Phase 2', floor: 'Podium', activity: 'Waterproofing — Podium Level', contractorId: 'C008', submittedDate: '2025-10-02', reviewer: 'Meera Pillai', status: 'Approved', firstPassResult: 'Pass', daysAwaiting: 0, slaBreach: false, history: [{ date: '2025-10-02', action: 'Submitted', actor: 'VK Concreting' }, { date: '2025-10-04', action: 'Approved', actor: 'Meera Pillai' }] },
  { id: 'WIR-0032', projectId: 'P005', tower: 'Phase 2', floor: 'Basement', activity: 'MEP Earthing — HT Panel Room', contractorId: 'C003', submittedDate: '2025-10-08', reviewer: 'Meera Pillai', status: 'Approved', firstPassResult: 'Pass', daysAwaiting: 0, slaBreach: false, history: [{ date: '2025-10-08', action: 'Submitted', actor: 'UrbanBuild India' }, { date: '2025-10-09', action: 'Approved', actor: 'Meera Pillai' }] },

  // P006 - Summit Greens
  { id: 'WIR-0033', projectId: 'P006', tower: 'Tower X', floor: 'Floor 03', activity: 'Slab Reinforcement — 3rd Floor', contractorId: 'C005', submittedDate: '2025-09-05', reviewer: 'Deepak Rao', status: 'Approved', firstPassResult: 'Pass', daysAwaiting: 0, slaBreach: false, history: [{ date: '2025-09-05', action: 'Submitted', actor: 'Shree Ram Infra' }, { date: '2025-09-07', action: 'Approved', actor: 'Deepak Rao' }] },
  { id: 'WIR-0034', projectId: 'P006', tower: 'Tower Y', floor: 'Floor 03', activity: 'Column Reinforcement — 3rd Floor', contractorId: 'C005', submittedDate: '2025-09-14', reviewer: 'Deepak Rao', status: 'Rejected', firstPassResult: 'Fail', rejectionReason: 'Stirrup spacing non-compliant in column zone. Lap length insufficient.', daysAwaiting: 10, slaBreach: true, history: [{ date: '2025-09-14', action: 'Submitted', actor: 'Shree Ram Infra' }, { date: '2025-09-17', action: 'Rejected', actor: 'Deepak Rao', note: 'Stirrup spacing issue.' }] },
  { id: 'WIR-0035', projectId: 'P006', tower: 'Tower Y', floor: 'Floor 03', activity: 'Column Reinforcement — 3rd Floor (Resubmission)', contractorId: 'C005', submittedDate: '2025-09-25', reviewer: 'Deepak Rao', status: 'Approved', firstPassResult: 'Fail', daysAwaiting: 0, slaBreach: false, history: [{ date: '2025-09-14', action: 'Submitted', actor: 'Shree Ram Infra' }, { date: '2025-09-17', action: 'Rejected', actor: 'Deepak Rao' }, { date: '2025-09-23', action: 'Rectification In Progress', actor: 'Shree Ram Infra' }, { date: '2025-09-25', action: 'Resubmitted', actor: 'Shree Ram Infra' }, { date: '2025-09-27', action: 'Approved', actor: 'Deepak Rao' }] },
  { id: 'WIR-0036', projectId: 'P006', tower: 'Tower Z', floor: 'Floor 02', activity: 'MEP Plumbing Rough-In — 2nd Floor', contractorId: 'C003', submittedDate: '2025-09-20', reviewer: 'Deepak Rao', status: 'Approved', firstPassResult: 'Pass', daysAwaiting: 0, slaBreach: false, history: [{ date: '2025-09-20', action: 'Submitted', actor: 'UrbanBuild India' }, { date: '2025-09-22', action: 'Approved', actor: 'Deepak Rao' }] },
  { id: 'WIR-0037', projectId: 'P006', tower: 'Tower X', floor: 'Floor 04', activity: 'Formwork — 4th Floor Slab', contractorId: 'C009', submittedDate: '2025-10-01', reviewer: 'Deepak Rao', status: 'Approved', firstPassResult: 'Pass', daysAwaiting: 0, slaBreach: false, history: [{ date: '2025-10-01', action: 'Submitted', actor: 'Greentech Formwork' }, { date: '2025-10-03', action: 'Approved', actor: 'Deepak Rao' }] },
  { id: 'WIR-0038', projectId: 'P006', tower: 'Tower Z', floor: 'Floor 04', activity: 'Steel Rebar — 4th Floor Columns', contractorId: 'C011', submittedDate: '2025-10-06', reviewer: 'Deepak Rao', status: 'Submitted', firstPassResult: 'Pending', daysAwaiting: 8, slaBreach: true, history: [{ date: '2025-10-06', action: 'Submitted', actor: 'Apex Steel Fabricators' }] },
  { id: 'WIR-0039', projectId: 'P006', tower: 'Tower Y', floor: 'Floor 04', activity: 'Slab Pouring — 4th Floor', contractorId: 'C005', submittedDate: '2025-10-08', reviewer: 'Deepak Rao', status: 'Submitted', firstPassResult: 'Pending', daysAwaiting: 6, slaBreach: false, history: [{ date: '2025-10-08', action: 'Submitted', actor: 'Shree Ram Infra' }] },

  // P007 - Vivanta Sereno (Thane)
  { id: 'WIR-0053', projectId: 'P007', tower: 'Tower 1', floor: 'Floor 06', activity: 'Masonry Blockwork — 6th Floor', contractorId: 'C001', submittedDate: '2025-10-02', reviewer: 'V. Rane', status: 'Approved', firstPassResult: 'Pass', daysAwaiting: 0, slaBreach: false, history: [{ date: '2025-10-02', action: 'Submitted', actor: 'ABC Civil Works' }, { date: '2025-10-04', action: 'Approved', actor: 'V. Rane' }] },
  { id: 'WIR-0054', projectId: 'P007', tower: 'Tower 2', floor: 'Floor 05', activity: 'Plaster Internal — 5th Floor', contractorId: 'C009', submittedDate: '2025-10-07', reviewer: 'V. Rane', status: 'Awaiting Review', firstPassResult: 'Pending', daysAwaiting: 7, slaBreach: false, history: [{ date: '2025-10-07', action: 'Submitted', actor: 'Greentech Formwork' }] },
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
  floor?: string;
  finding: string;
  category: NCCategory;
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
    floor: 'Floor 05',
    finding: 'Concrete cube test failure — 28-day compressive strength 24.8 MPa vs required 30 MPa (M30 grade)',
    category: 'Material Quality',
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
    floor: 'Floor 05',
    finding: 'Honeycombing in structural columns T1-C12, C14, C18 — concrete voids visible on surface',
    category: 'Workmanship / Workforce',
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
  { id: 'NC-0003', projectId: 'P004', tower: 'Tower 1', floor: 'Floor 04', finding: 'Rebar cover non-compliant — measured 15 mm vs minimum 40 mm requirement at slab soffit', category: 'Workmanship / Workforce', severity: 'High', contractorId: 'C008', dateRaised: '2025-09-08', age: 36, dueDate: '2025-09-22', owner: 'Vikram Joshi', status: 'Open', isRepeat: true, repeatCategory: 'Rebar Cover', history: [{ date: '2025-09-08', action: 'NC Raised', actor: 'Vikram Joshi' }, { date: '2025-09-09', action: 'Assigned', actor: 'Vikram Joshi' }] },
  { id: 'NC-0004', projectId: 'P004', tower: 'Tower 2', floor: 'Plinth', finding: 'Dowel bars missing at construction joint — Tower 2 plinth beam to column junction', category: 'Workmanship / Workforce', severity: 'High', contractorId: 'C008', dateRaised: '2025-09-12', age: 32, dueDate: '2025-09-26', owner: 'Vikram Joshi', status: 'Assigned', isRepeat: false, history: [{ date: '2025-09-12', action: 'NC Raised', actor: 'Vikram Joshi' }, { date: '2025-09-13', action: 'Assigned', actor: 'Vikram Joshi' }] },
  { id: 'NC-0005', projectId: 'P004', tower: 'Tower 3', floor: 'Floor 03', finding: 'Surface laitance not removed before screed — 200 sq m of bonded screed at risk of delamination', category: 'Process / Other', severity: 'Medium', contractorId: 'C006', dateRaised: '2025-09-28', age: 16, dueDate: '2025-10-12', owner: 'Vikram Joshi', status: 'Open', isRepeat: false, history: [{ date: '2025-09-28', action: 'NC Raised', actor: 'Vikram Joshi' }] },
  { id: 'NC-0021', projectId: 'P004', tower: 'Tower 1', floor: 'Floor 05', finding: 'Construction joint cold joint formed — pour delay exceeded 2 hours at 5th floor slab soffit', category: 'Process / Other', severity: 'Critical', contractorId: 'C001', dateRaised: '2025-09-26', age: 18, dueDate: '2025-10-03', owner: 'Vikram Joshi', status: 'Open', isRepeat: false, history: [{ date: '2025-09-26', action: 'NC Raised', actor: 'Vikram Joshi' }, { date: '2025-09-27', action: 'Assigned', actor: 'Vikram Joshi' }] },

  // P001 - Meridian Heights (Amber)
  {
    id: 'NC-0006',
    projectId: 'P001',
    tower: 'Tower B',
    floor: 'Floor 06',
    finding: 'Rebar spacing non-compliant — column B-12, B-14, B-17: stirrup spacing 250 mm vs specified 150 mm',
    category: 'Workmanship / Workforce',
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
  { id: 'NC-0007', projectId: 'P001', tower: 'Tower B', floor: 'Floor 06', finding: 'MEP conduit bending radius non-compliant — 6 locations on 6th floor exceed maximum bend angle', category: 'Process / Other', severity: 'Medium', contractorId: 'C003', dateRaised: '2025-10-01', age: 13, dueDate: '2025-10-15', owner: 'Priya Nair', status: 'Assigned', isRepeat: false, linkedWIR: 'WIR-0006', history: [{ date: '2025-10-01', action: 'NC Raised', actor: 'Priya Nair' }, { date: '2025-10-02', action: 'Assigned', actor: 'Priya Nair' }] },
  { id: 'NC-0008', projectId: 'P001', tower: 'Tower A', floor: 'Floor 09', finding: 'Construction joint surface not prepared correctly — no shear key provided at slab-to-column junction', category: 'Process / Other', severity: 'Medium', contractorId: 'C001', dateRaised: '2025-09-20', age: 24, dueDate: '2025-10-04', owner: 'Rajan Mehta', status: 'Rectification', isRepeat: false, history: [{ date: '2025-09-20', action: 'NC Raised', actor: 'Rajan Mehta' }, { date: '2025-09-21', action: 'Assigned', actor: 'Rajan Mehta' }, { date: '2025-09-28', action: 'Rectification', actor: 'ABC Civil Works', note: 'Shear key being formed before next pour.' }] },
  { id: 'NC-0009', projectId: 'P001', tower: 'Tower C', floor: 'Floor 04', finding: 'Brick coursing alignment deviation >10 mm in external masonry — 3rd to 5th floor facade', category: 'Workmanship / Workforce', severity: 'Low', contractorId: 'C001', dateRaised: '2025-10-02', age: 12, dueDate: '2025-10-16', owner: 'Priya Nair', status: 'Open', isRepeat: false, history: [{ date: '2025-10-02', action: 'NC Raised', actor: 'Priya Nair' }] },
  { id: 'NC-0024', projectId: 'P001', tower: 'Tower B', floor: 'Floor 06', finding: 'Junction box not grouted flush — 4 junction boxes protruding 8-10 mm beyond plaster surface', category: 'Workmanship / Workforce', severity: 'Low', contractorId: 'C003', dateRaised: '2025-10-03', age: 11, dueDate: '2025-10-17', owner: 'Priya Nair', status: 'Open', isRepeat: false, linkedWIR: 'WIR-0006', history: [{ date: '2025-10-03', action: 'NC Raised', actor: 'Priya Nair' }] },

  // P006 - Summit Greens (Amber)
  {
    id: 'NC-0010',
    projectId: 'P006',
    tower: 'Tower Y',
    floor: 'Floor 03',
    finding: 'Stirrup spacing non-compliant at column head zone — 12 columns on level 3',
    category: 'Workmanship / Workforce',
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
  { id: 'NC-0011', projectId: 'P006', tower: 'Tower Z', floor: 'Floor 02', finding: 'Plumbing sleeves not installed before concreting — remedial coring required at 8 locations', category: 'Regulatory / Approvals', severity: 'Medium', contractorId: 'C003', dateRaised: '2025-09-22', age: 22, dueDate: '2025-10-06', owner: 'Deepak Rao', status: 'Rectification', isRepeat: false, history: [{ date: '2025-09-22', action: 'NC Raised', actor: 'Deepak Rao' }, { date: '2025-09-24', action: 'Assigned', actor: 'Deepak Rao' }, { date: '2025-10-01', action: 'Rectification', actor: 'UrbanBuild India', note: 'Coring approved by structural engineer.' }] },
  { id: 'NC-0012', projectId: 'P006', tower: 'Tower X', floor: 'Floor 03', finding: 'Formwork prop spacing exceeds design — 2.4 m spacing found vs 1.8 m required at 3rd floor slab', category: 'Safety', severity: 'High', contractorId: 'C009', dateRaised: '2025-10-03', age: 11, dueDate: '2025-10-17', owner: 'Deepak Rao', status: 'Open', isRepeat: false, history: [{ date: '2025-10-03', action: 'NC Raised', actor: 'Deepak Rao' }] },
  { id: 'NC-0022', projectId: 'P006', tower: 'Tower X', floor: 'Floor 04', finding: 'Concrete segregation at slab edge — aggregate visible without mortar matrix at pour edge', category: 'Material Quality', severity: 'Medium', contractorId: 'C005', dateRaised: '2025-10-06', age: 8, dueDate: '2025-10-20', owner: 'Deepak Rao', status: 'Open', isRepeat: false, history: [{ date: '2025-10-06', action: 'NC Raised', actor: 'Deepak Rao' }] },

  // P003 - Cedar Park (Amber)
  { id: 'NC-0013', projectId: 'P003', tower: 'Wing A', floor: 'Foundation', finding: 'Formwork alignment deviation — grade beam offset by 18 mm from centreline', category: 'Workmanship / Workforce', severity: 'Medium', contractorId: 'C009', dateRaised: '2025-10-08', age: 6, dueDate: '2025-10-22', owner: 'Suresh Kumar', status: 'Assigned', isRepeat: false, linkedWIR: 'WIR-0019', history: [{ date: '2025-10-08', action: 'NC Raised', actor: 'Suresh Kumar', note: 'From rejected WIR-0019.' }, { date: '2025-10-09', action: 'Assigned', actor: 'Suresh Kumar' }] },
  { id: 'NC-0014', projectId: 'P003', tower: 'Wing B', floor: 'Foundation', finding: 'Pile bore diameter deviation — 4 piles at 495 mm vs specified 550 mm', category: 'Regulatory / Approvals', severity: 'High', contractorId: 'C002', dateRaised: '2025-09-30', age: 14, dueDate: '2025-10-14', owner: 'Suresh Kumar', status: 'Open', isRepeat: false, history: [{ date: '2025-09-30', action: 'NC Raised', actor: 'Suresh Kumar' }, { date: '2025-10-01', action: 'Assigned', actor: 'Suresh Kumar' }] },
  { id: 'NC-0023', projectId: 'P003', tower: 'Wing B', floor: 'Basement', finding: 'Soil compaction test failure — Field density ratio 88% vs required 95% at subgrade', category: 'Material Quality', severity: 'High', contractorId: 'C002', dateRaised: '2025-10-04', age: 10, dueDate: '2025-10-18', owner: 'Suresh Kumar', status: 'Assigned', isRepeat: false, history: [{ date: '2025-10-04', action: 'NC Raised', actor: 'Suresh Kumar' }, { date: '2025-10-05', action: 'Assigned', actor: 'Suresh Kumar' }] },

  // P002 - Northgate Residences (Green)
  { id: 'NC-0015', projectId: 'P002', tower: 'Block 1', floor: 'Floor 02', finding: 'Waterproofing membrane lap joint inadequately bonded — 3 locations in Block 1 bathrooms', category: 'Workmanship / Workforce', severity: 'Medium', contractorId: 'C007', dateRaised: '2025-09-24', age: 20, dueDate: '2025-10-08', owner: 'Ananya Singh', status: 'Closed', isRepeat: false, linkedWIR: 'WIR-0012', rectificationNotes: 'Membrane re-applied and bonded correctly.', verificationOutcome: 'Passed — bond test confirms adequate adhesion.', history: [{ date: '2025-09-24', action: 'NC Raised', actor: 'Ananya Singh' }, { date: '2025-09-25', action: 'Assigned', actor: 'Ananya Singh' }, { date: '2025-09-29', action: 'Rectification', actor: 'Elite Waterproofing' }, { date: '2025-10-02', action: 'Evidence Submitted', actor: 'Elite Waterproofing' }, { date: '2025-10-04', action: 'Verification', actor: 'Ananya Singh' }, { date: '2025-10-05', action: 'Closed', actor: 'Ananya Singh', note: 'Passed verification.' }] },
  { id: 'NC-0016', projectId: 'P002', tower: 'Block 3', floor: 'Lobby', finding: 'Tile lippage exceeds 1.5 mm tolerance — lobby flooring to be re-laid at 6 bays', category: 'Workmanship / Workforce', severity: 'Low', contractorId: 'C012', dateRaised: '2025-10-07', age: 7, dueDate: '2025-10-21', owner: 'Ananya Singh', status: 'Assigned', isRepeat: false, history: [{ date: '2025-10-07', action: 'NC Raised', actor: 'Ananya Singh' }, { date: '2025-10-08', action: 'Assigned', actor: 'Ananya Singh' }] },

  // P005 - Harbour Point (Green)
  { id: 'NC-0017', projectId: 'P005', tower: 'Phase 1', floor: 'Floor 09', finding: 'Minor plaster crack at construction joint — 2 locations, hairline width <0.2 mm', category: 'Workmanship / Workforce', severity: 'Low', contractorId: 'C003', dateRaised: '2025-09-15', age: 29, dueDate: '2025-09-29', owner: 'Meera Pillai', status: 'Closed', isRepeat: false, rectificationNotes: 'Crack sealed with elastomeric sealant.', verificationOutcome: 'Passed.', history: [{ date: '2025-09-15', action: 'NC Raised', actor: 'Meera Pillai' }, { date: '2025-09-16', action: 'Assigned', actor: 'Meera Pillai' }, { date: '2025-09-20', action: 'Rectification', actor: 'UrbanBuild India' }, { date: '2025-09-22', action: 'Evidence Submitted', actor: 'UrbanBuild India' }, { date: '2025-09-24', action: 'Closed', actor: 'Meera Pillai' }] },
  { id: 'NC-0018', projectId: 'P005', tower: 'Phase 2', floor: 'Floor 12', finding: 'External cladding joint sealant colour mismatch — 12 panels on Level 12 east facade', category: 'Material Quality', severity: 'Low', contractorId: 'C003', dateRaised: '2025-10-05', age: 9, dueDate: '2025-10-19', owner: 'Meera Pillai', status: 'Rectification', isRepeat: false, history: [{ date: '2025-10-05', action: 'NC Raised', actor: 'Meera Pillai' }, { date: '2025-10-06', action: 'Assigned', actor: 'Meera Pillai' }, { date: '2025-10-09', action: 'Rectification', actor: 'UrbanBuild India', note: 'Replacement sealant ordered.' }] },
  { id: 'NC-0025', projectId: 'P005', tower: 'Phase 1', floor: 'Facade', finding: 'Facade paint colour variation — Lot B paint showing 4 Delta-E deviation from approved shade', category: 'Material Quality', severity: 'Low', contractorId: 'C003', dateRaised: '2025-09-28', age: 16, dueDate: '2025-10-12', owner: 'Meera Pillai', status: 'Closed', isRepeat: false, history: [{ date: '2025-09-28', action: 'NC Raised', actor: 'Meera Pillai' }, { date: '2025-10-05', action: 'Closed', actor: 'Meera Pillai', note: 'Repainting completed.' }] },

  // P007 - Vivanta Sereno (Thane)
  { id: 'NC-0026', projectId: 'P007', tower: 'Tower 2', floor: 'Floor 05', finding: 'Masonry wall raking bond omitted at T-junction — 3 internal partition walls', category: 'Workmanship / Workforce', severity: 'Medium', contractorId: 'C001', dateRaised: '2025-10-06', age: 8, dueDate: '2025-10-20', owner: 'H. Deshmukh', status: 'Assigned', isRepeat: false, history: [{ date: '2025-10-06', action: 'NC Raised', actor: 'H. Deshmukh' }] },
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
  scope?: string;
}

export const AUDIT_RECORDS: Audit[] = [
  // P001 - Meridian Heights
  { id: 'AUD-001', projectId: 'P001', auditDate: '2025-09-01', type: 'Internal', rating: 3.5, percentageScore: 70, findingsRaised: 8, outstandingCAs: 3, status: 'Completed', auditor: 'Quality Dept', notes: 'Rebar compliance issues found. Waterproofing acceptable.', scope: 'Civil & Structural Conformance (Towers A & B)' },
  { id: 'AUD-002', projectId: 'P001', auditDate: '2025-06-01', type: 'External', rating: 3.8, percentageScore: 76, findingsRaised: 5, outstandingCAs: 0, status: 'Completed', auditor: 'Bureau Veritas', notes: 'Second-party audit — structural quality satisfactory.', scope: 'IS 456 Structural Integrity Assessment' },
  // P002 - Northgate Residences
  { id: 'AUD-003', projectId: 'P002', auditDate: '2025-09-15', type: 'Internal', rating: 4.2, percentageScore: 84, findingsRaised: 3, outstandingCAs: 1, status: 'Completed', auditor: 'Quality Dept', notes: 'Finishing quality good. Minor waterproofing laps noted.', scope: 'Architectural Finishing & MEP Quality' },
  { id: 'AUD-004', projectId: 'P002', auditDate: '2025-07-01', type: 'External', rating: 4.0, percentageScore: 80, findingsRaised: 4, outstandingCAs: 0, status: 'Completed', auditor: 'SGS India', notes: 'Acceptable quality levels. Plaster crack monitoring recommended.', scope: 'External Envelope & Facade Conformance' },
  // P003 - Cedar Park
  { id: 'AUD-005', projectId: 'P003', auditDate: '2025-09-20', type: 'Internal', rating: 3.2, percentageScore: 64, findingsRaised: 6, outstandingCAs: 4, status: 'Completed', auditor: 'Quality Dept', notes: 'Pile diameter deviation and compaction failure flagged.', scope: 'Substructure & Piling Audit' },
  // P004 - Riverstone Towers
  { id: 'AUD-006', projectId: 'P004', auditDate: '2025-09-10', type: 'Internal', rating: 2.1, percentageScore: 42, findingsRaised: 14, outstandingCAs: 9, status: 'Completed', auditor: 'Quality Dept', notes: 'Critical concrete quality issues. Structural integrity review ordered.', scope: 'RCC Structure & High-Rise Core Quality' },
  { id: 'AUD-007', projectId: 'P004', auditDate: '2025-07-15', type: 'External', rating: 2.8, percentageScore: 56, findingsRaised: 10, outstandingCAs: 5, status: 'Completed', auditor: 'TÜV Rheinland India', notes: 'Below acceptable quality threshold. Follow-up audit scheduled.', scope: 'Structural Concrete & Steel Verification' },
  // P005 - Harbour Point
  { id: 'AUD-008', projectId: 'P005', auditDate: '2025-09-25', type: 'Internal', rating: 4.5, percentageScore: 90, findingsRaised: 2, outstandingCAs: 0, status: 'Completed', auditor: 'Quality Dept', notes: 'Excellent finishing quality. Minor sealant colour issue logged.', scope: 'Pre-Handover Snagging & Finishing Audit' },
  { id: 'AUD-009', projectId: 'P005', auditDate: '2025-08-01', type: 'External', rating: 4.3, percentageScore: 86, findingsRaised: 3, outstandingCAs: 0, status: 'Completed', auditor: 'Bureau Veritas', notes: 'Good quality across all inspected areas.', scope: 'Comprehensive Site Quality Audit' },
  // P006 - Summit Greens
  { id: 'AUD-010', projectId: 'P006', auditDate: '2025-09-28', type: 'Internal', rating: 3.4, percentageScore: 68, findingsRaised: 7, outstandingCAs: 4, status: 'Completed', auditor: 'Quality Dept', notes: 'Rebar and formwork compliance needs improvement.', scope: 'Reinforcement & Concreting Works' },
  { id: 'AUD-011', projectId: 'P006', auditDate: '2025-07-20', type: 'External', rating: 3.0, percentageScore: 60, findingsRaised: 9, outstandingCAs: 3, status: 'Completed', auditor: 'SGS India', notes: 'Quality concerns noted — improvement plan required.', scope: 'RCC Framework Audit' },
  // P007 - Vivanta Sereno (Thane)
  { id: 'AUD-013', projectId: 'P007', auditDate: '2025-09-22', type: 'Internal', rating: 3.9, percentageScore: 78, findingsRaised: 3, outstandingCAs: 1, status: 'Completed', auditor: 'Quality Dept', notes: 'Masonry work satisfactory. Minor raking bonds noted.', scope: 'Masonry & Wet Finishing Quality' },
  // Scheduled future
  { id: 'AUD-012', projectId: 'P003', auditDate: '2025-11-10', type: 'External', rating: 0, percentageScore: 0, findingsRaised: 0, outstandingCAs: 0, status: 'Scheduled', auditor: 'Bureau Veritas', notes: 'Pre-scheduled external audit.', scope: 'Substructure Final Handover' },
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

  // P007 - Vivanta Sereno (Thane - stable healthy)
  { month: '2025-04', projectId: 'P007', score: 77 },
  { month: '2025-05', projectId: 'P007', score: 78 },
  { month: '2025-06', projectId: 'P007', score: 76 },
  { month: '2025-07', projectId: 'P007', score: 77 },
  { month: '2025-08', projectId: 'P007', score: 79 },
  { month: '2025-09', projectId: 'P007', score: 78 },
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

// ============================================================
// WIP (WORK IN PROGRESS) DATA STRUCTURES & RECORDS
// ============================================================

export interface TowerBuilding {
  id: string;
  projectId: string;
  name: string;
  totalFloors: number;
  completedFloors: number;
  activeFloors: number;
  delayedFloors: number;
  currentStage: string;
  actualProgress: number;
  plannedProgress: number;
  varianceDays: number;
  status: 'On Track' | 'At Risk' | 'Delayed';
  contractorId: string;
}

export const TOWERS_DATA: TowerBuilding[] = [
  // P001 - Meridian Heights
  { id: 'T001', projectId: 'P001', name: 'Tower A', totalFloors: 18, completedFloors: 9, activeFloors: 2, delayedFloors: 0, currentStage: 'Slab casting', actualProgress: 68, plannedProgress: 70, varianceDays: -3, status: 'On Track', contractorId: 'C001' },
  { id: 'T002', projectId: 'P001', name: 'Tower B', totalFloors: 18, completedFloors: 6, activeFloors: 2, delayedFloors: 2, currentStage: 'Column casting', actualProgress: 48, plannedProgress: 62, varianceDays: -18, status: 'Delayed', contractorId: 'C001' },
  { id: 'T003', projectId: 'P001', name: 'Tower C', totalFloors: 14, completedFloors: 8, activeFloors: 2, delayedFloors: 1, currentStage: 'Masonry', actualProgress: 67, plannedProgress: 66, varianceDays: 0, status: 'On Track', contractorId: 'C001' },

  // P002 - Northgate Residences
  { id: 'T004', projectId: 'P002', name: 'Block 1', totalFloors: 12, completedFloors: 12, activeFloors: 0, delayedFloors: 0, currentStage: 'Finishing', actualProgress: 96, plannedProgress: 95, varianceDays: 3, status: 'On Track', contractorId: 'C002' },
  { id: 'T005', projectId: 'P002', name: 'Block 2', totalFloors: 12, completedFloors: 9, activeFloors: 2, delayedFloors: 0, currentStage: 'Finishing', actualProgress: 78, plannedProgress: 76, varianceDays: 2, status: 'On Track', contractorId: 'C004' },
  { id: 'T006', projectId: 'P002', name: 'Block 3', totalFloors: 12, completedFloors: 7, activeFloors: 3, delayedFloors: 0, currentStage: 'Plastering', actualProgress: 68, plannedProgress: 70, varianceDays: -2, status: 'On Track', contractorId: 'C004' },
  { id: 'T007', projectId: 'P002', name: 'Block 4', totalFloors: 10, completedFloors: 5, activeFloors: 2, delayedFloors: 0, currentStage: 'Plastering', actualProgress: 54, plannedProgress: 58, varianceDays: -4, status: 'On Track', contractorId: 'C002' },

  // P003 - Cedar Park
  { id: 'T008', projectId: 'P003', name: 'Wing A', totalFloors: 16, completedFloors: 0, activeFloors: 3, delayedFloors: 1, currentStage: 'Foundation', actualProgress: 32, plannedProgress: 38, varianceDays: -12, status: 'At Risk', contractorId: 'C002' },
  { id: 'T009', projectId: 'P003', name: 'Wing B', totalFloors: 16, completedFloors: 0, activeFloors: 2, delayedFloors: 2, currentStage: 'Foundation', actualProgress: 24, plannedProgress: 32, varianceDays: -19, status: 'Delayed', contractorId: 'C002' },

  // P004 - Riverstone Towers (Critical)
  { id: 'T010', projectId: 'P004', name: 'Tower 1', totalFloors: 24, completedFloors: 4, activeFloors: 2, delayedFloors: 2, currentStage: 'Column casting', actualProgress: 36, plannedProgress: 58, varianceDays: -38, status: 'Delayed', contractorId: 'C001' },
  { id: 'T011', projectId: 'P004', name: 'Tower 2', totalFloors: 24, completedFloors: 5, activeFloors: 2, delayedFloors: 1, currentStage: 'Slab casting', actualProgress: 46, plannedProgress: 60, varianceDays: -26, status: 'Delayed', contractorId: 'C008' },
  { id: 'T012', projectId: 'P004', name: 'Tower 3', totalFloors: 20, completedFloors: 8, activeFloors: 2, delayedFloors: 1, currentStage: 'Masonry', actualProgress: 62, plannedProgress: 68, varianceDays: -11, status: 'At Risk', contractorId: 'C006' },

  // P005 - Harbour Point
  { id: 'T013', projectId: 'P005', name: 'Phase 1', totalFloors: 14, completedFloors: 14, activeFloors: 0, delayedFloors: 0, currentStage: 'Handover', actualProgress: 98, plannedProgress: 96, varianceDays: 6, status: 'On Track', contractorId: 'C003' },
  { id: 'T014', projectId: 'P005', name: 'Phase 2', totalFloors: 14, completedFloors: 11, activeFloors: 2, delayedFloors: 0, currentStage: 'Finishing', actualProgress: 78, plannedProgress: 76, varianceDays: 2, status: 'On Track', contractorId: 'C003' },

  // P006 - Summit Greens
  { id: 'T015', projectId: 'P006', name: 'Tower X', totalFloors: 20, completedFloors: 7, activeFloors: 2, delayedFloors: 0, currentStage: 'Slab casting', actualProgress: 60, plannedProgress: 60, varianceDays: 0, status: 'On Track', contractorId: 'C005' },
  { id: 'T016', projectId: 'P006', name: 'Tower Y', totalFloors: 20, completedFloors: 5, activeFloors: 2, delayedFloors: 1, currentStage: 'Column casting', actualProgress: 48, plannedProgress: 56, varianceDays: -14, status: 'At Risk', contractorId: 'C005' },
  { id: 'T017', projectId: 'P006', name: 'Tower Z', totalFloors: 18, completedFloors: 8, activeFloors: 2, delayedFloors: 0, currentStage: 'Masonry', actualProgress: 60, plannedProgress: 58, varianceDays: 2, status: 'On Track', contractorId: 'C003' },

  // P007 - Vivanta Sereno (Thane)
  { id: 'T018', projectId: 'P007', name: 'Tower 1', totalFloors: 15, completedFloors: 9, activeFloors: 2, delayedFloors: 0, currentStage: 'Masonry', actualProgress: 68, plannedProgress: 68, varianceDays: 0, status: 'On Track', contractorId: 'C001' },
  { id: 'T019', projectId: 'P007', name: 'Tower 2', totalFloors: 15, completedFloors: 8, activeFloors: 2, delayedFloors: 0, currentStage: 'Plastering', actualProgress: 62, plannedProgress: 66, varianceDays: -4, status: 'On Track', contractorId: 'C009' },
];

export interface FloorProgress {
  id: string;
  projectId: string;
  tower: string;
  floorNumber: number;
  floorName: string;
  stage: ConstructionStage;
  physicalProgress: number; // 0 to 100
  inspectedProgress: number; // 0 to 100 (accepted after inspection)
  status: 'Completed' | 'In Progress' | 'Delayed' | 'Upcoming';
  contractorId: string;
  plannedFinish: string;
  forecastFinish: string;
  linkedWIRId?: string;
  linkedNCId?: string;
}

export const FLOORS_DATA: FloorProgress[] = [
  // P004 - Riverstone Towers, Tower 1 (Troubled Deep Dive)
  { id: 'FL-401', projectId: 'P004', tower: 'Tower 1', floorNumber: 1, floorName: 'Floor 01', stage: 'Slab casting', physicalProgress: 100, inspectedProgress: 100, status: 'Completed', contractorId: 'C001', plannedFinish: '2025-05-15', forecastFinish: '2025-05-18' },
  { id: 'FL-402', projectId: 'P004', tower: 'Tower 1', floorNumber: 2, floorName: 'Floor 02', stage: 'Slab casting', physicalProgress: 100, inspectedProgress: 100, status: 'Completed', contractorId: 'C001', plannedFinish: '2025-06-10', forecastFinish: '2025-06-12' },
  { id: 'FL-403', projectId: 'P004', tower: 'Tower 1', floorNumber: 3, floorName: 'Floor 03', stage: 'Slab casting', physicalProgress: 100, inspectedProgress: 100, status: 'Completed', contractorId: 'C001', plannedFinish: '2025-07-05', forecastFinish: '2025-07-10' },
  { id: 'FL-404', projectId: 'P004', tower: 'Tower 1', floorNumber: 4, floorName: 'Floor 04', stage: 'Slab casting', physicalProgress: 100, inspectedProgress: 85, status: 'Completed', contractorId: 'C008', plannedFinish: '2025-08-01', forecastFinish: '2025-08-15', linkedNCId: 'NC-0003' },
  { id: 'FL-405', projectId: 'P004', tower: 'Tower 1', floorNumber: 5, floorName: 'Floor 05', stage: 'Column casting', physicalProgress: 80, inspectedProgress: 0, status: 'Delayed', contractorId: 'C001', plannedFinish: '2025-09-10', forecastFinish: '2025-10-25', linkedWIRId: 'WIR-0021', linkedNCId: 'NC-0001' },
  { id: 'FL-406', projectId: 'P004', tower: 'Tower 1', floorNumber: 6, floorName: 'Floor 06', stage: 'Column casting', physicalProgress: 15, inspectedProgress: 0, status: 'Delayed', contractorId: 'C011', plannedFinish: '2025-09-30', forecastFinish: '2025-11-15', linkedWIRId: 'WIR-0025' },
  { id: 'FL-407', projectId: 'P004', tower: 'Tower 1', floorNumber: 7, floorName: 'Floor 07', stage: 'Slab casting', physicalProgress: 0, inspectedProgress: 0, status: 'Upcoming', contractorId: 'C001', plannedFinish: '2025-10-25', forecastFinish: '2025-12-05' },

  // P001 - Meridian Heights, Tower B (At Risk)
  { id: 'FL-101', projectId: 'P001', tower: 'Tower B', floorNumber: 4, floorName: 'Floor 04', stage: 'Slab casting', physicalProgress: 100, inspectedProgress: 100, status: 'Completed', contractorId: 'C001', plannedFinish: '2025-07-15', forecastFinish: '2025-07-16' },
  { id: 'FL-102', projectId: 'P001', tower: 'Tower B', floorNumber: 5, floorName: 'Floor 05', stage: 'Slab casting', physicalProgress: 100, inspectedProgress: 100, status: 'Completed', contractorId: 'C001', plannedFinish: '2025-08-10', forecastFinish: '2025-08-12' },
  { id: 'FL-103', projectId: 'P001', tower: 'Tower B', floorNumber: 6, floorName: 'Floor 06', stage: 'Column casting', physicalProgress: 100, inspectedProgress: 60, status: 'Delayed', contractorId: 'C003', plannedFinish: '2025-09-05', forecastFinish: '2025-09-28', linkedWIRId: 'WIR-0006', linkedNCId: 'NC-0006' },
  { id: 'FL-104', projectId: 'P001', tower: 'Tower B', floorNumber: 7, floorName: 'Floor 07', stage: 'Column casting', physicalProgress: 65, inspectedProgress: 0, status: 'Delayed', contractorId: 'C001', plannedFinish: '2025-09-22', forecastFinish: '2025-10-18', linkedWIRId: 'WIR-0003' },
  { id: 'FL-105', projectId: 'P001', tower: 'Tower B', floorNumber: 8, floorName: 'Floor 08', stage: 'Slab casting', physicalProgress: 0, inspectedProgress: 0, status: 'Upcoming', contractorId: 'C001', plannedFinish: '2025-10-15', forecastFinish: '2025-11-10' },

  // P002 - Northgate Residences, Block 2 (Healthy Finishing)
  { id: 'FL-201', projectId: 'P002', tower: 'Block 2', floorNumber: 3, floorName: 'Floor 03', stage: 'Plastering', physicalProgress: 100, inspectedProgress: 100, status: 'Completed', contractorId: 'C004', plannedFinish: '2025-08-20', forecastFinish: '2025-08-20' },
  { id: 'FL-202', projectId: 'P002', tower: 'Block 2', floorNumber: 4, floorName: 'Floor 04', stage: 'Finishing', physicalProgress: 90, inspectedProgress: 90, status: 'In Progress', contractorId: 'C004', plannedFinish: '2025-09-25', forecastFinish: '2025-09-24', linkedWIRId: 'WIR-0010' },
  { id: 'FL-203', projectId: 'P002', tower: 'Block 2', floorNumber: 5, floorName: 'Floor 05', stage: 'Finishing', physicalProgress: 60, inspectedProgress: 50, status: 'In Progress', contractorId: 'C004', plannedFinish: '2025-10-20', forecastFinish: '2025-10-22' },
];

export interface WIPActivity {
  id: string;
  projectId: string;
  tower: string;
  floor: string;
  workPackage: string;
  stage: ConstructionStage;
  plannedStart: string;
  plannedFinish: string;
  actualStart: string;
  forecastFinish: string;
  plannedProgress: number;
  actualProgress: number;
  varianceDays: number; // e.g. -14 days behind
  contractorId: string;
  projectManager: string;
  status: 'Completed' | 'In Progress' | 'Delayed' | 'Blocked';
  blockingReason?: string;
  linkedWIRId?: string;
  linkedNCId?: string;
}

export let WIP_ACTIVITIES: WIPActivity[] = [
  // P004 - Riverstone Towers (Crucial Narrative Path)
  {
    id: 'ACT-401',
    projectId: 'P004',
    tower: 'Tower 1',
    floor: 'Floor 05',
    workPackage: 'Column Concreting (Grid C12-C21)',
    stage: 'Column casting',
    plannedStart: '2025-08-15',
    plannedFinish: '2025-09-02',
    actualStart: '2025-08-18',
    forecastFinish: '2025-10-28',
    plannedProgress: 100,
    actualProgress: 60,
    varianceDays: -38,
    contractorId: 'C001',
    projectManager: 'Vikram Joshi',
    status: 'Blocked',
    blockingReason: 'Cube test failure (24.8 MPa) & structural honeycombing. Awaiting core drill test & approval.',
    linkedWIRId: 'WIR-0021',
    linkedNCId: 'NC-0001',
  },
  {
    id: 'ACT-402',
    projectId: 'P004',
    tower: 'Tower 1',
    floor: 'Floor 06',
    workPackage: 'Steel Rebar Fixing & Stirrup Binding',
    stage: 'Column casting',
    plannedStart: '2025-09-12',
    plannedFinish: '2025-09-28',
    actualStart: '2025-09-20',
    forecastFinish: '2025-11-05',
    plannedProgress: 90,
    actualProgress: 25,
    varianceDays: -28,
    contractorId: 'C011',
    projectManager: 'Vikram Joshi',
    status: 'Blocked',
    blockingReason: 'Cannot proceed past level 5 columns until core test reports on Floor 05 are cleared.',
    linkedWIRId: 'WIR-0025',
  },
  {
    id: 'ACT-403',
    projectId: 'P004',
    tower: 'Tower 2',
    floor: 'Floor 04',
    workPackage: 'Slab Reinforcement & Concreting',
    stage: 'Slab casting',
    plannedStart: '2025-08-25',
    plannedFinish: '2025-09-18',
    actualStart: '2025-08-25',
    forecastFinish: '2025-09-20',
    plannedProgress: 100,
    actualProgress: 100,
    varianceDays: -2,
    contractorId: 'C008',
    projectManager: 'Vikram Joshi',
    status: 'Completed',
    linkedWIRId: 'WIR-0023',
  },
  {
    id: 'ACT-404',
    projectId: 'P004',
    tower: 'Tower 3',
    floor: 'Floor 03',
    workPackage: 'HVAC Ductwork & Chilled Water Lines',
    stage: 'Finishing',
    plannedStart: '2025-09-10',
    plannedFinish: '2025-10-05',
    actualStart: '2025-09-12',
    forecastFinish: '2025-10-06',
    plannedProgress: 100,
    actualProgress: 95,
    varianceDays: -1,
    contractorId: 'C006',
    projectManager: 'Vikram Joshi',
    status: 'In Progress',
    linkedWIRId: 'WIR-0024',
  },

  // P001 - Meridian Heights
  {
    id: 'ACT-101',
    projectId: 'P001',
    tower: 'Tower B',
    floor: 'Floor 07',
    workPackage: 'Column Reinforcement & Shuttering',
    stage: 'Column casting',
    plannedStart: '2025-09-01',
    plannedFinish: '2025-09-15',
    actualStart: '2025-09-03',
    forecastFinish: '2025-10-18',
    plannedProgress: 100,
    actualProgress: 70,
    varianceDays: -18,
    contractorId: 'C001',
    projectManager: 'Rajan Mehta',
    status: 'Delayed',
    blockingReason: 'Rebar spacing non-compliant (250mm vs 150mm). Resubmitted WIR-0003 awaiting inspector signoff.',
    linkedWIRId: 'WIR-0003',
    linkedNCId: 'NC-0006',
  },
  {
    id: 'ACT-102',
    projectId: 'P001',
    tower: 'Tower B',
    floor: 'Floor 06',
    workPackage: 'MEP Electrical Conduits & Junction Boxes',
    stage: 'Plastering',
    plannedStart: '2025-09-20',
    plannedFinish: '2025-10-05',
    actualStart: '2025-09-22',
    forecastFinish: '2025-10-20',
    plannedProgress: 100,
    actualProgress: 55,
    varianceDays: -14,
    contractorId: 'C003',
    projectManager: 'Priya Nair',
    status: 'Delayed',
    blockingReason: 'Conduit bend radii re-work in progress post rejection.',
    linkedWIRId: 'WIR-0006',
    linkedNCId: 'NC-0007',
  },
  {
    id: 'ACT-103',
    projectId: 'P001',
    tower: 'Tower A',
    floor: 'Floor 09',
    workPackage: 'RCC Slab Casting & Formwork Stripping',
    stage: 'Slab casting',
    plannedStart: '2025-09-15',
    plannedFinish: '2025-09-28',
    actualStart: '2025-09-15',
    forecastFinish: '2025-09-27',
    plannedProgress: 100,
    actualProgress: 100,
    varianceDays: 1,
    contractorId: 'C001',
    projectManager: 'Rajan Mehta',
    status: 'Completed',
    linkedWIRId: 'WIR-0005',
  },

  // P002 - Northgate Residences
  {
    id: 'ACT-201',
    projectId: 'P002',
    tower: 'Block 2',
    floor: 'Floor 04',
    workPackage: 'Vitrified Tile Flooring & Skirting',
    stage: 'Finishing',
    plannedStart: '2025-09-08',
    plannedFinish: '2025-09-25',
    actualStart: '2025-09-08',
    forecastFinish: '2025-09-24',
    plannedProgress: 100,
    actualProgress: 100,
    varianceDays: 1,
    contractorId: 'C004',
    projectManager: 'Ananya Singh',
    status: 'Completed',
    linkedWIRId: 'WIR-0010',
  },
  {
    id: 'ACT-202',
    projectId: 'P002',
    tower: 'Block 1',
    floor: 'Floor 02',
    workPackage: 'Wet Area Waterproofing Membrane',
    stage: 'Finishing',
    plannedStart: '2025-09-15',
    plannedFinish: '2025-09-30',
    actualStart: '2025-09-16',
    forecastFinish: '2025-10-06',
    plannedProgress: 100,
    actualProgress: 100,
    varianceDays: -6,
    contractorId: 'C007',
    projectManager: 'Ananya Singh',
    status: 'Completed',
    linkedWIRId: 'WIR-0012',
    linkedNCId: 'NC-0015',
  },
];

// ── Historical S-Curve Progress Against Plan Data ─────────────
export interface ProgressCurvePoint {
  period: string; // 'Apr 25', 'May 25', etc.
  planned: number;
  actual: number;
  target?: number;
}

export const PORTFOLIO_PROGRESS_CURVE: ProgressCurvePoint[] = [
  { period: 'Apr 25', planned: 24, actual: 25 },
  { period: 'May 25', planned: 32, actual: 33 },
  { period: 'Jun 25', planned: 41, actual: 40 },
  { period: 'Jul 25', planned: 50, actual: 48 },
  { period: 'Aug 25', planned: 58, actual: 54 },
  { period: 'Sep 25', planned: 64, actual: 59 },
  { period: 'Oct 25', planned: 70, actual: 64 }, // Current reporting cut-off
  { period: 'Nov 25', planned: 76, actual: 64, target: 76 },
  { period: 'Dec 25', planned: 82, actual: 64, target: 82 },
];
