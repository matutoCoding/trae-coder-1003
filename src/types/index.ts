export interface Project {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'pending' | 'completed' | 'suspended';
  startDate: string;
  endDate: string;
  totalArea: number;
  location: string;
  owner: string;
  description?: string;
  filingNo?: string;
  monitoringCycle: string;
  expectedCarbon: number;
  actualCarbon?: number;
}

export interface Subcompartment {
  id: string;
  projectId: string;
  code: string;
  name: string;
  area: number;
  dominantTree: string;
  age: number;
  soilType: string;
  geometry: number[][];
  center: [number, number];
  stockVolume?: number;
  canopyDensity?: number;
}

export interface TreeMeasurement {
  id: string;
  subcompartmentId: string;
  measureDate: string;
  treeSpecies: string;
  dbh: number;
  treeHeight: number;
  crownWidth?: number;
  samplePlotNo?: string;
  treeCount?: number;
}

export interface MonitoringRecord {
  id: string;
  projectId: string;
  recordDate: string;
  carbonIncrement: number;
  biomass: number;
  monitoringMethod: string;
  monitoringPerson?: string;
  remarks?: string;
}

export interface BiomassCalculation {
  id: string;
  measurementId: string;
  modelType: string;
  biomassAbove: number;
  biomassBelow: number;
  carbonStock: number;
  co2Equivalent: number;
  calculationDate: string;
  formula?: string;
}

export interface Verification {
  id: string;
  projectId: string;
  verificationAgency: string;
  verificationDate: string;
  verifier: string;
  conclusion: 'pass' | 'fail' | 'pending';
  verifiedAmount: number;
  reportNo?: string;
  remarks?: string;
  content?: string;
  attachments?: string[];
}

export interface CarbonIssuance {
  id: string;
  projectId: string;
  verificationId: string;
  issuanceDate: string;
  issuedAmount: number;
  certificateNo: string;
  issuingAuthority: string;
  status: 'issued' | 'pending' | 'revoked';
  validFrom?: string;
  validTo?: string;
  remarks?: string;
}

export interface Transaction {
  id: string;
  projectId: string;
  issuanceId: string;
  transactionDate: string;
  buyer: string;
  seller: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  contractNo?: string;
  status: 'completed' | 'pending' | 'cancelled';
  remarks?: string;
}

export interface RevenueDistribution {
  id: string;
  transactionId: string;
  recipient: string;
  amount: number;
  ratio: number;
  distributeDate: string;
  status: 'paid' | 'pending' | 'overdue';
  paymentMethod?: string;
  remark?: string;
}

export interface NursingTask {
  id: string;
  projectId: string;
  taskName: string;
  taskType: 'tending' | 'pruning' | 'fertilization' | 'pestControl' | 'firePrevention';
  planDate: string;
  executor: string;
  progress: number;
  status: 'notStarted' | 'inProgress' | 'completed' | 'delayed';
  actualDate?: string;
  workHours?: number;
  cost?: number;
  effectEvaluation?: string;
}

export interface AnnualReport {
  id: string;
  projectId: string;
  year: string;
  submitDate: string;
  auditor?: string;
  auditDate?: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  fileUrl?: string;
  summary?: string;
}

export interface ForestRight {
  id: string;
  projectId: string;
  subcompartmentId?: string;
  owner: string;
  ownerType: string;
  certificateNo: string;
  issueDate: string;
  validUntil: string;
  area: number;
  transferRecords?: TransferRecord[];
}

export interface TransferRecord {
  id: string;
  date: string;
  transferor: string;
  transferee: string;
  area: number;
  price: number;
}

export interface DashboardStats {
  totalProjects: number;
  totalArea: number;
  totalCarbonStock: number;
  totalIssuedCarbon: number;
  totalTransactionAmount: number;
  activeProjects: number;
  pendingVerifications: number;
  totalRevenue: number;
}

export interface CarbonTrend {
  month: string;
  carbonIncrement: number;
  biomass: number;
}

export interface ProjectTypeDistribution {
  type: string;
  value: number;
}
