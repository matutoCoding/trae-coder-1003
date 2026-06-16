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

const generateId = () => Math.random().toString(36).substring(2, 11);

export const mockProjects: Project[] = [
  {
    id: 'proj-001',
    name: '大兴安岭林业碳汇项目',
    type: '森林经营',
    status: 'active',
    startDate: '2020-03-15',
    endDate: '2050-03-14',
    totalArea: 5000,
    location: '黑龙江省大兴安岭地区',
    owner: '大兴安岭林业集团',
    description: '大兴安岭原始林区森林经营碳汇项目，涵盖针叶林、阔叶林等多种林分类型',
    filingNo: 'CCER-2020-0012',
    monitoringCycle: '每年一次',
    expectedCarbon: 150000,
    actualCarbon: 45600,
  },
  {
    id: 'proj-002',
    name: '西双版纳热带雨林修复项目',
    type: '造林再造林',
    status: 'active',
    startDate: '2019-06-01',
    endDate: '2049-05-31',
    totalArea: 3200,
    location: '云南省西双版纳傣族自治州',
    owner: '云南林业投资有限公司',
    description: '热带雨林生态修复项目，以望天树、云南石梓等乡土树种为主',
    filingNo: 'CCER-2019-0028',
    monitoringCycle: '每半年一次',
    expectedCarbon: 96000,
    actualCarbon: 38400,
  },
  {
    id: 'proj-003',
    name: '张家界公益林保护项目',
    type: '森林保护',
    status: 'active',
    startDate: '2021-01-10',
    endDate: '2041-01-09',
    totalArea: 2800,
    location: '湖南省张家界市',
    owner: '张家界市林业局',
    description: '重点公益林保护项目，保护生物多样性的同时产生碳汇效益',
    filingNo: 'CCER-2021-0005',
    monitoringCycle: '每年一次',
    expectedCarbon: 84000,
    actualCarbon: 21000,
  },
  {
    id: 'proj-004',
    name: '内蒙科尔沁沙地治理项目',
    type: '造林再造林',
    status: 'pending',
    startDate: '2024-04-01',
    endDate: '2054-03-31',
    totalArea: 4500,
    location: '内蒙古自治区通辽市',
    owner: '内蒙古治沙基金会',
    description: '科尔沁沙地防风固沙造林项目，以樟子松、杨柴等固沙树种为主',
    filingNo: 'CCER-2024-0033',
    monitoringCycle: '每年两次',
    expectedCarbon: 135000,
    actualCarbon: 0,
  },
  {
    id: 'proj-005',
    name: '福建武夷山竹林碳汇项目',
    type: '森林经营',
    status: 'completed',
    startDate: '2018-09-01',
    endDate: '2023-08-31',
    totalArea: 1500,
    location: '福建省南平市武夷山市',
    owner: '武夷山国有林场',
    description: '毛竹林集约经营碳汇项目，竹林年均固碳量显著',
    filingNo: 'CCER-2018-0045',
    monitoringCycle: '每年一次',
    expectedCarbon: 30000,
    actualCarbon: 31200,
  },
];

const treeSpecies = ['兴安落叶松', '白桦', '红松', '樟子松', '望天树', '云南石梓', '毛竹', '马尾松', '杉木', '栎树'];
const soilTypes = ['棕色针叶林土', '暗棕壤', '红壤', '砖红壤', '黄棕壤', '褐土', '风沙土', '水稻土'];

export const mockSubcompartments: Subcompartment[] = mockProjects.flatMap((project) => {
  const count = project.id === 'proj-001' ? 15 : project.id === 'proj-002' ? 12 : 8;
  return Array.from({ length: count }, (_, i) => {
    const baseLat = project.location.includes('黑龙江') ? 52 : project.location.includes('云南') ? 22 : project.location.includes('湖南') ? 29 : project.location.includes('内蒙古') ? 43 : 27;
    const baseLng = project.location.includes('黑龙江') ? 124 : project.location.includes('云南') ? 101 : project.location.includes('湖南') ? 110 : project.location.includes('内蒙古') ? 122 : 118;
    return {
      id: `sub-${project.id}-${String(i + 1).padStart(3, '0')}`,
      projectId: project.id,
      code: `${project.id.slice(-3)}-${String(i + 1).padStart(3, '0')}`,
      name: `小班${i + 1}号`,
      area: Number((project.totalArea / count).toFixed(2)),
      dominantTree: treeSpecies[Math.floor(Math.random() * treeSpecies.length)],
      age: Math.floor(Math.random() * 40) + 10,
      soilType: soilTypes[Math.floor(Math.random() * soilTypes.length)],
      center: [baseLat + (Math.random() - 0.5) * 0.5, baseLng + (Math.random() - 0.5) * 0.5] as [number, number],
      geometry: [],
      stockVolume: Number((Math.random() * 150 + 80).toFixed(2)),
      canopyDensity: Number((Math.random() * 0.4 + 0.5).toFixed(2)),
    };
  });
});

export const mockTreeMeasurements: TreeMeasurement[] = mockSubcompartments.flatMap((sub) => {
  return Array.from({ length: 3 }, (_, i) => ({
    id: `meas-${sub.id}-${i + 1}`,
    subcompartmentId: sub.id,
    measureDate: `202${i + 1}-${String(Math.floor(Math.random() * 8) + 5).padStart(2, '0')}-${String(Math.floor(Math.random() * 20) + 10).padStart(2, '0')}`,
    treeSpecies: sub.dominantTree,
    dbh: Number((Math.random() * 20 + 12).toFixed(1)),
    treeHeight: Number((Math.random() * 15 + 8).toFixed(1)),
    crownWidth: Number((Math.random() * 4 + 2).toFixed(1)),
    samplePlotNo: `样地-${String(i + 1).padStart(2, '0')}`,
    treeCount: Math.floor(Math.random() * 50) + 100,
  }));
});

export const mockMonitoringRecords: MonitoringRecord[] = mockProjects.flatMap((project) => {
  const records: MonitoringRecord[] = [];
  for (let year = 2021; year <= 2024; year++) {
    for (let month = 3; month <= 12; month += 3) {
      records.push({
        id: `mon-${project.id}-${year}-${month}`,
        projectId: project.id,
        recordDate: `${year}-${String(month).padStart(2, '0')}-${String(Math.floor(Math.random() * 20) + 10).padStart(2, '0')}`,
        carbonIncrement: Number((Math.random() * 500 + 800).toFixed(2)),
        biomass: Number((Math.random() * 300 + 500).toFixed(2)),
        monitoringMethod: Math.random() > 0.5 ? '样地实测法' : '模型模拟法',
        monitoringPerson: ['张工', '李工', '王工', '赵工'][Math.floor(Math.random() * 4)],
        remarks: Math.random() > 0.7 ? '本季度气候适宜，林木生长良好' : undefined,
      });
    }
  }
  return records;
});

export const mockBiomassCalculations: BiomassCalculation[] = mockTreeMeasurements.map((meas) => {
  const biomassAbove = Number((0.05 * Math.pow(meas.dbh, 1.8) * Math.pow(meas.treeHeight, 0.6)).toFixed(2));
  const biomassBelow = Number((biomassAbove * 0.25).toFixed(2));
  const carbonStock = Number(((biomassAbove + biomassBelow) * 0.5).toFixed(2));
  return {
    id: `calc-${meas.id}`,
    measurementId: meas.id,
    modelType: '生物量扩展因子法',
    biomassAbove,
    biomassBelow,
    carbonStock,
    co2Equivalent: Number((carbonStock * 3.667).toFixed(2)),
    calculationDate: meas.measureDate,
    formula: 'B = 0.05 × DBH^1.8 × H^0.6',
  };
});

export const mockVerifications: Verification[] = mockProjects.slice(0, 3).map((project, idx) => ({
  id: `ver-${project.id}`,
  projectId: project.id,
  verificationAgency: ['北京中创碳投科技有限公司', '上海环境能源交易所', '广州碳排放权交易所'][idx],
  verificationDate: `2024-${String(idx + 3).padStart(2, '0')}-15`,
  verifier: ['王核查员', '李核查员', '张核查员'][idx],
  conclusion: 'pass' as const,
  verifiedAmount: [15200, 12800, 7000][idx],
  reportNo: `VER-2024-${String(idx + 1).padStart(4, '0')}`,
  remarks: '核查通过，数据真实有效',
}));

export const mockCarbonIssuances: CarbonIssuance[] = mockVerifications.map((ver, idx) => ({
  id: `iss-${ver.id}`,
  projectId: ver.projectId,
  verificationId: ver.id,
  issuanceDate: `2024-${String(idx + 5).padStart(2, '0')}-01`,
  issuedAmount: ver.verifiedAmount,
  certificateNo: `CCER-${2024 + idx}-${String(idx + 1).padStart(6, '0')}`,
  issuingAuthority: '国家应对气候变化战略研究和国际合作中心',
  status: 'issued' as const,
}));

export const mockTransactions: Transaction[] = mockCarbonIssuances.flatMap((iss, idx) => {
  const quantity = Math.floor(iss.issuedAmount * (Math.random() * 0.6 + 0.3));
  const unitPrice = Math.floor(Math.random() * 30 + 40);
  return [
    {
      id: `trans-${iss.id}-1`,
      projectId: iss.projectId,
      issuanceId: iss.id,
      transactionDate: `2024-${String(idx + 6).padStart(2, '0')}-${String(Math.floor(Math.random() * 20) + 10).padStart(2, '0')}`,
      buyer: ['国家能源集团', '中国石油化工集团', '国家电网有限公司'][idx],
      seller: ['大兴安岭林业集团', '云南林业投资有限公司', '张家界市林业局'][idx],
      quantity,
      unitPrice,
      totalAmount: quantity * unitPrice,
      contractNo: `CONT-${2024}-${String(idx + 1).padStart(6, '0')}`,
      status: 'completed' as const,
    },
  ];
});

export const mockRevenueDistributions: RevenueDistribution[] = mockTransactions.flatMap((trans) => {
  const distributions = [
    { recipient: '林场运营方', ratio: 50 },
    { recipient: '当地政府', ratio: 20 },
    { recipient: '原住民社区', ratio: 20 },
    { recipient: '技术服务方', ratio: 10 },
  ];
  return distributions.map((dist, idx) => ({
    id: `dist-${trans.id}-${idx + 1}`,
    transactionId: trans.id,
    recipient: dist.recipient,
    amount: Math.floor(trans.totalAmount * dist.ratio / 100),
    ratio: dist.ratio,
    distributeDate: trans.transactionDate,
    status: 'paid' as const,
    paymentMethod: '银行转账',
    remark: '按期足额支付',
  }));
});

const taskTypes = ['tending', 'pruning', 'fertilization', 'pestControl', 'firePrevention'] as const;
const taskTypeNames: Record<string, string> = {
  tending: '抚育间伐',
  pruning: '修枝整形',
  fertilization: '施肥养护',
  pestControl: '病虫害防治',
  firePrevention: '森林防火',
};

export const mockNursingTasks: NursingTask[] = mockProjects.slice(0, 4).flatMap((project, projIdx) => {
  return Array.from({ length: 5 }, (_, i) => {
    const taskType = taskTypes[i % taskTypes.length];
    const progress = [100, 75, 40, 0][Math.floor(Math.random() * 4)];
    return {
      id: `task-${project.id}-${i + 1}`,
      projectId: project.id,
      taskName: `${taskTypeNames[taskType]}作业`,
      taskType,
      planDate: `2024-${String((i + projIdx + 2) % 12 + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 20) + 10).padStart(2, '0')}`,
      executor: ['张队', '李队', '王队', '赵队'][Math.floor(Math.random() * 4)],
      progress,
      status: progress === 100 ? 'completed' : progress > 50 ? 'inProgress' : progress > 0 ? 'delayed' : 'notStarted',
      actualDate: progress === 100 ? `2024-${String((i + projIdx + 3) % 12 + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 20) + 10).padStart(2, '0')}` : undefined,
      workHours: progress > 0 ? Math.floor(Math.random() * 80 + 40) : undefined,
      cost: progress > 0 ? Math.floor(Math.random() * 50000 + 10000) : undefined,
      effectEvaluation: progress === 100 ? '抚育效果良好，林分质量提升明显' : undefined,
    };
  });
});

export const mockAnnualReports: AnnualReport[] = mockProjects.slice(0, 3).flatMap((project) => {
  return Array.from({ length: 3 }, (_, i) => ({
    id: `report-${project.id}-${2021 + i}`,
    projectId: project.id,
    year: `${2021 + i}年度`,
    submitDate: `${2022 + i}-03-15`,
    auditor: ['张主任', '李主任', '王主任'][i],
    auditDate: `${2022 + i}-03-30`,
    status: 'approved' as const,
    fileUrl: `/reports/${project.id}-${2021 + i}.pdf`,
    summary: `本报告详细记录了${project.name}${2021 + i}年度的碳汇监测、计量、核查等工作情况，各项数据均符合相关规范要求。`,
  }));
});

export const mockForestRights: ForestRight[] = mockProjects.flatMap((project) => ({
  id: `right-${project.id}`,
  projectId: project.id,
  owner: project.owner,
  ownerType: project.owner.includes('集团') || project.owner.includes('公司') ? '企业' : '事业单位',
  certificateNo: `林证字（2020）第${String(Math.floor(Math.random() * 100000)).padStart(6, '0')}号`,
  issueDate: '2020-06-01',
  validUntil: '2070-05-31',
  area: project.totalArea,
  transferRecords: project.id === 'proj-005' ? [
    {
      id: 'transf-001',
      date: '2023-06-15',
      transferor: project.owner,
      transferee: '福建碳汇科技有限公司',
      area: 1500,
      price: 7500000,
    },
  ] : undefined,
}));

export const mockDashboardStats: DashboardStats = {
  totalProjects: mockProjects.length,
  totalArea: mockProjects.reduce((sum, p) => sum + p.totalArea, 0),
  totalCarbonStock: mockMonitoringRecords.reduce((sum, m) => sum + m.carbonIncrement, 0),
  totalIssuedCarbon: mockCarbonIssuances.reduce((sum, i) => sum + i.issuedAmount, 0),
  totalTransactionAmount: mockTransactions.reduce((sum, t) => sum + t.totalAmount, 0),
  activeProjects: mockProjects.filter(p => p.status === 'active').length,
  pendingVerifications: mockProjects.filter(p => p.status === 'pending').length,
  totalRevenue: mockRevenueDistributions.reduce((sum, d) => sum + d.amount, 0),
};

export const mockCarbonTrend: CarbonTrend[] = Array.from({ length: 12 }, (_, i) => ({
  month: `${2024}-${String(i + 1).padStart(2, '0')}`,
  carbonIncrement: Number((Math.random() * 3000 + 2000).toFixed(2)),
  biomass: Number((Math.random() * 2000 + 1500).toFixed(2)),
}));

export const mockProjectTypeDistribution: ProjectTypeDistribution[] = [
  { type: '森林经营', value: 2 },
  { type: '造林再造林', value: 2 },
  { type: '森林保护', value: 1 },
];

export const mockData = {
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
};

export default mockData;
