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
