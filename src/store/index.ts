import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Project,
  Subcompartment,
  TreeMeasurement,
  MonitoringRecord,
  BiomassCalculation,
  Verification,
  CarbonIssuance,
  Transaction,
  RevenueDistribution,
  NursingTask,
  AnnualReport,
  ForestRight,
  DashboardStats,
  CarbonTrend,
  ProjectTypeDistribution,
} from '../types';
import {
  mockProjects,
  mockSubcompartments,
  mockTreeMeasurements,
  mockMonitoringRecords,
  mockBiomassCalculations,
  mockVerifications,
  mockCarbonIssuances,
  mockTransactions,
  mockRevenueDistributions,
  mockNursingTasks,
  mockAnnualReports,
  mockForestRights,
  mockDashboardStats,
  mockCarbonTrend,
  mockProjectTypeDistribution,
} from '../mock';

interface AppState {
  projects: Project[];
  subcompartments: Subcompartment[];
  treeMeasurements: TreeMeasurement[];
  monitoringRecords: MonitoringRecord[];
  biomassCalculations: BiomassCalculation[];
  verifications: Verification[];
  carbonIssuances: CarbonIssuance[];
  transactions: Transaction[];
  revenueDistributions: RevenueDistribution[];
  nursingTasks: NursingTask[];
  annualReports: AnnualReport[];
  forestRights: ForestRight[];
  dashboardStats: DashboardStats;
  carbonTrend: CarbonTrend[];
  projectTypeDistribution: ProjectTypeDistribution[];
  selectedProjectId: string | null;
  sidebarCollapsed: boolean;
  setSelectedProjectId: (id: string | null) => void;
  toggleSidebar: () => void;
  getProjectById: (id: string) => Project | undefined;
  getSubcompartmentsByProjectId: (projectId: string) => Subcompartment[];
  getMeasurementsBySubcompartmentId: (subId: string) => TreeMeasurement[];
  getMonitoringRecordsByProjectId: (projectId: string) => MonitoringRecord[];
  getVerificationsByProjectId: (projectId: string) => Verification[];
  getIssuancesByProjectId: (projectId: string) => CarbonIssuance[];
  getTransactionsByProjectId: (projectId: string) => Transaction[];
  getDistributionsByTransactionId: (transId: string) => RevenueDistribution[];
  getNursingTasksByProjectId: (projectId: string) => NursingTask[];
  getAnnualReportsByProjectId: (projectId: string) => AnnualReport[];
  getForestRightByProjectId: (projectId: string) => ForestRight | undefined;
  getCalculationsByMeasurementId: (measId: string) => BiomassCalculation[];
  addProject: (project: Omit<Project, 'id' | 'createdAt'>) => void;
  updateProject: (id: string, project: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  addSubcompartment: (sub: Omit<Subcompartment, 'id'>) => void;
  updateSubcompartment: (id: string, sub: Partial<Subcompartment>) => void;
  deleteSubcompartment: (id: string) => void;
  addTreeMeasurement: (measurement: Omit<TreeMeasurement, 'id'>) => void;
  updateTreeMeasurement: (id: string, measurement: Partial<TreeMeasurement>) => void;
  deleteTreeMeasurement: (id: string) => void;
  addMonitoringRecord: (record: Omit<MonitoringRecord, 'id'>) => void;
  updateMonitoringRecord: (id: string, record: Partial<MonitoringRecord>) => void;
  deleteMonitoringRecord: (id: string) => void;
  addBiomassCalculation: (calc: Omit<BiomassCalculation, 'id'>) => void;
  updateBiomassCalculation: (id: string, calc: Partial<BiomassCalculation>) => void;
  deleteBiomassCalculation: (id: string) => void;
  addVerification: (verification: Omit<Verification, 'id'>) => void;
  updateVerification: (id: string, verification: Partial<Verification>) => void;
  deleteVerification: (id: string) => void;
  addCarbonIssuance: (issuance: Omit<CarbonIssuance, 'id'>) => void;
  updateCarbonIssuance: (id: string, issuance: Partial<CarbonIssuance>) => void;
  deleteCarbonIssuance: (id: string) => void;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  addNursingTask: (task: Omit<NursingTask, 'id'>) => void;
  updateNursingTask: (id: string, task: Partial<NursingTask>) => void;
  deleteNursingTask: (id: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      projects: mockProjects,
      subcompartments: mockSubcompartments,
      treeMeasurements: mockTreeMeasurements,
      monitoringRecords: mockMonitoringRecords,
      biomassCalculations: mockBiomassCalculations,
      verifications: mockVerifications,
      carbonIssuances: mockCarbonIssuances,
      transactions: mockTransactions,
      revenueDistributions: mockRevenueDistributions,
      nursingTasks: mockNursingTasks,
      annualReports: mockAnnualReports,
      forestRights: mockForestRights,
      dashboardStats: mockDashboardStats,
      carbonTrend: mockCarbonTrend,
      projectTypeDistribution: mockProjectTypeDistribution,
      selectedProjectId: null,
      sidebarCollapsed: false,

      setSelectedProjectId: (id) => set({ selectedProjectId: id }),
      toggleSidebar: () => set({ sidebarCollapsed: !get().sidebarCollapsed }),

      getProjectById: (id) => get().projects.find((p) => p.id === id),
      getSubcompartmentsByProjectId: (projectId) =>
        get().subcompartments.filter((s) => s.projectId === projectId),
      getMeasurementsBySubcompartmentId: (subId) =>
        get().treeMeasurements.filter((m) => m.subcompartmentId === subId),
      getMonitoringRecordsByProjectId: (projectId) =>
        get().monitoringRecords.filter((m) => m.projectId === projectId),
      getVerificationsByProjectId: (projectId) =>
        get().verifications.filter((v) => v.projectId === projectId),
      getIssuancesByProjectId: (projectId) =>
        get().carbonIssuances.filter((i) => i.projectId === projectId),
      getTransactionsByProjectId: (projectId) =>
        get().transactions.filter((t) => t.projectId === projectId),
      getDistributionsByTransactionId: (transId) =>
        get().revenueDistributions.filter((d) => d.transactionId === transId),
      getNursingTasksByProjectId: (projectId) =>
        get().nursingTasks.filter((t) => t.projectId === projectId),
      getAnnualReportsByProjectId: (projectId) =>
        get().annualReports.filter((r) => r.projectId === projectId),
      getForestRightByProjectId: (projectId) =>
        get().forestRights.find((r) => r.projectId === projectId),
      getCalculationsByMeasurementId: (measId) =>
        get().biomassCalculations.filter((c) => c.measurementId === measId),

      addProject: (project) => {
        const newProject: Project = {
          ...project,
          id: `proj-${Date.now()}`,
        };
        set({ projects: [...get().projects, newProject] });
      },
      updateProject: (id, project) => {
        set({
          projects: get().projects.map((p) =>
            p.id === id ? { ...p, ...project } : p
          ),
        });
      },
      deleteProject: (id) => {
        set({ projects: get().projects.filter((p) => p.id !== id) });
      },

      addSubcompartment: (sub) => {
        const newSub: Subcompartment = {
          ...sub,
          id: `sub-${Date.now()}`,
        };
        set({ subcompartments: [...get().subcompartments, newSub] });
      },
      updateSubcompartment: (id, sub) => {
        set({
          subcompartments: get().subcompartments.map((s) =>
            s.id === id ? { ...s, ...sub } : s
          ),
        });
      },
      deleteSubcompartment: (id) => {
        set({ subcompartments: get().subcompartments.filter((s) => s.id !== id) });
      },

      addTreeMeasurement: (measurement) => {
        const newMeasurement: TreeMeasurement = {
          ...measurement,
          id: `meas-${Date.now()}`,
        };
        set({ treeMeasurements: [...get().treeMeasurements, newMeasurement] });
      },
      updateTreeMeasurement: (id, measurement) => {
        set({
          treeMeasurements: get().treeMeasurements.map((m) =>
            m.id === id ? { ...m, ...measurement } : m
          ),
        });
      },
      deleteTreeMeasurement: (id) => {
        set({ treeMeasurements: get().treeMeasurements.filter((m) => m.id !== id) });
      },

      addMonitoringRecord: (record) => {
        const newRecord: MonitoringRecord = {
          ...record,
          id: `mon-${Date.now()}`,
        };
        set({ monitoringRecords: [...get().monitoringRecords, newRecord] });
      },
      updateMonitoringRecord: (id, record) => {
        set({
          monitoringRecords: get().monitoringRecords.map((r) =>
            r.id === id ? { ...r, ...record } : r
          ),
        });
      },
      deleteMonitoringRecord: (id) => {
        set({ monitoringRecords: get().monitoringRecords.filter((r) => r.id !== id) });
      },

      addBiomassCalculation: (calc) => {
        const newCalc: BiomassCalculation = {
          ...calc,
          id: `calc-${Date.now()}`,
        };
        set({ biomassCalculations: [...get().biomassCalculations, newCalc] });
      },
      updateBiomassCalculation: (id, calc) => {
        set({
          biomassCalculations: get().biomassCalculations.map((c) =>
            c.id === id ? { ...c, ...calc } : c
          ),
        });
      },
      deleteBiomassCalculation: (id) => {
        set({ biomassCalculations: get().biomassCalculations.filter((c) => c.id !== id) });
      },

      addVerification: (verification) => {
        const newVerification: Verification = {
          ...verification,
          id: `ver-${Date.now()}`,
        };
        set({ verifications: [...get().verifications, newVerification] });
      },
      updateVerification: (id, verification) => {
        set({
          verifications: get().verifications.map((v) =>
            v.id === id ? { ...v, ...verification } : v
          ),
        });
      },
      deleteVerification: (id) => {
        set({ verifications: get().verifications.filter((v) => v.id !== id) });
      },

      addCarbonIssuance: (issuance) => {
        const newIssuance: CarbonIssuance = {
          ...issuance,
          id: `iss-${Date.now()}`,
        };
        set({ carbonIssuances: [...get().carbonIssuances, newIssuance] });
      },
      updateCarbonIssuance: (id, issuance) => {
        set({
          carbonIssuances: get().carbonIssuances.map((i) =>
            i.id === id ? { ...i, ...issuance } : i
          ),
        });
      },
      deleteCarbonIssuance: (id) => {
        set({ carbonIssuances: get().carbonIssuances.filter((i) => i.id !== id) });
      },

      addTransaction: (transaction) => {
        const newTransaction: Transaction = {
          ...transaction,
          id: `trans-${Date.now()}`,
        };
        set({ transactions: [...get().transactions, newTransaction] });
      },
      updateTransaction: (id, transaction) => {
        set({
          transactions: get().transactions.map((t) =>
            t.id === id ? { ...t, ...transaction } : t
          ),
        });
      },
      deleteTransaction: (id) => {
        set({ transactions: get().transactions.filter((t) => t.id !== id) });
      },

      addNursingTask: (task) => {
        const newTask: NursingTask = {
          ...task,
          id: `task-${Date.now()}`,
        };
        set({ nursingTasks: [...get().nursingTasks, newTask] });
      },
      updateNursingTask: (id, task) => {
        set({
          nursingTasks: get().nursingTasks.map((t) =>
            t.id === id ? { ...t, ...task } : t
          ),
        });
      },
      deleteNursingTask: (id) => {
        set({ nursingTasks: get().nursingTasks.filter((t) => t.id !== id) });
      },
    }),
    {
      name: 'carbon-sink-storage',
      partialize: (state) => ({
        selectedProjectId: state.selectedProjectId,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
);

export default useAppStore;
