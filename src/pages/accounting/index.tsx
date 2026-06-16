import { useState } from 'react';
import { Tabs, Table, Tag, Button, Space, Card, Row, Col, Descriptions, Modal, Form, Input, Select, InputNumber, DatePicker, Statistic, Progress, Alert, message, Empty } from 'antd';
import { Calculator, FileText, Eye, Plus, Edit, Trash2, Database, TrendingUp, BarChart3 } from 'lucide-react';
import dayjs from 'dayjs';
import useAppStore from '../../store';
import BarChart from '../../components/charts/BarChart';
import PieChart from '../../components/charts/PieChart';
import type { BiomassCalculation } from '../../types';

const { TabPane } = Tabs;
const { Option } = Select;

const AccountingPage: React.FC = () => {
  const {
    projects,
    biomassCalculations,
    getCalculationsByMeasurementId,
    treeMeasurements,
    getSubcompartmentsByProjectId,
    addBiomassCalculation,
    updateBiomassCalculation,
    deleteBiomassCalculation,
  } = useAppStore();

  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');
  const [selectedCalc, setSelectedCalc] = useState<BiomassCalculation | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [formModalVisible, setFormModalVisible] = useState(false);
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
  const [editingCalc, setEditingCalc] = useState<BiomassCalculation | null>(null);
  const [calcForm] = Form.useForm();

  const currentSubs = selectedProjectId ? getSubcompartmentsByProjectId(selectedProjectId) : [];
  const currentMeasurements = currentSubs.flatMap(s => treeMeasurements.filter(m => m.subcompartmentId === s.id));
  const currentCalculations = currentMeasurements.flatMap(m => getCalculationsByMeasurementId(m.id));

  const showAddForm = () => {
    setFormMode('add');
    setEditingCalc(null);
    calcForm.resetFields();
    setFormModalVisible(true);
  };

  const showEditForm = (record: BiomassCalculation) => {
    setFormMode('edit');
    setEditingCalc(record);
    calcForm.setFieldsValue({
      measurementId: record.measurementId,
      modelType: record.modelType,
      biomassAbove: record.biomassAbove,
      biomassBelow: record.biomassBelow,
      carbonStock: record.carbonStock,
      co2Equivalent: record.co2Equivalent,
      calculationDate: dayjs(record.calculationDate),
      formula: record.formula,
    });
    setFormModalVisible(true);
  };

  const handleFormSubmit = async () => {
    try {
      const values = await calcForm.validateFields();
      const calcData = {
        measurementId: values.measurementId,
        modelType: values.modelType,
        biomassAbove: values.biomassAbove,
        biomassBelow: values.biomassBelow,
        carbonStock: values.carbonStock,
        co2Equivalent: values.co2Equivalent,
        calculationDate: values.calculationDate.format('YYYY-MM-DD'),
        formula: values.formula,
      };

      if (formMode === 'add') {
        addBiomassCalculation(calcData);
        message.success('核算记录添加成功');
      } else if (formMode === 'edit' && editingCalc) {
        updateBiomassCalculation(editingCalc.id, calcData);
        message.success('核算记录更新成功');
      }

      setFormModalVisible(false);
      calcForm.resetFields();
      setEditingCalc(null);
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这条核算记录吗？删除后无法恢复。',
      okText: '确定',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: () => {
        deleteBiomassCalculation(id);
        message.success('核算记录删除成功');
      },
    });
  };

  const showDetail = (record: BiomassCalculation) => {
    setSelectedCalc(record);
    setDetailModalVisible(true);
  };

  const calcColumns = [
    {
      title: '核算日期',
      dataIndex: 'calculationDate',
      key: 'calculationDate',
      width: 120,
    },
    {
      title: '模型类型',
      dataIndex: 'modelType',
      key: 'modelType',
      width: 160,
      render: (type: string) => <Tag color="green">{type}</Tag>,
    },
    {
      title: '地上生物量(t)',
      dataIndex: 'biomassAbove',
      key: 'biomassAbove',
      render: (val: number) => <span className="font-mono font-semibold text-forest-700">{val.toFixed(4)}</span>,
    },
    {
      title: '地下生物量(t)',
      dataIndex: 'biomassBelow',
      key: 'biomassBelow',
      render: (val: number) => <span className="font-mono font-semibold text-earth-700">{val.toFixed(4)}</span>,
    },
    {
      title: '碳储量(tC)',
      dataIndex: 'carbonStock',
      key: 'carbonStock',
      render: (val: number) => <span className="font-mono font-semibold text-sky-700">{val.toFixed(4)}</span>,
    },
    {
      title: 'CO₂当量(tCO₂e)',
      dataIndex: 'co2Equivalent',
      key: 'co2Equivalent',
      render: (val: number) => <span className="font-mono font-semibold text-gold-700">{val.toFixed(4)}</span>,
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      fixed: 'right' as const,
      render: (_: unknown, record: BiomassCalculation) => (
        <Space size="small">
          <Button type="link" size="small" icon={<Eye size={14} />} onClick={() => showDetail(record)}>
            详情
          </Button>
          <Button type="link" size="small" icon={<Edit size={14} />} onClick={() => showEditForm(record)}>
            编辑
          </Button>
          <Button type="link" size="small" danger icon={<Trash2 size={14} />} onClick={() => handleDelete(record.id)}>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  const modelOptions = [
    { value: '生物量扩展因子法', label: '生物量扩展因子法' },
    { value: '蓄积量法', label: '蓄积量法' },
    { value: '生物量回归模型法', label: '生物量回归模型法' },
    { value: 'IPCC默认值法', label: 'IPCC默认值法' },
  ];

  const formulaData = {
    categories: ['地上生物量', '地下生物量', '碳储量', 'CO₂当量'],
    values: [
      currentCalculations.reduce((sum, c) => sum + c.biomassAbove, 0).toFixed(2),
      currentCalculations.reduce((sum, c) => sum + c.biomassBelow, 0).toFixed(2),
      currentCalculations.reduce((sum, c) => sum + c.carbonStock, 0).toFixed(2),
      currentCalculations.reduce((sum, c) => sum + c.co2Equivalent, 0).toFixed(2),
    ],
  };

  const modelTypeCount: Record<string, number> = {};
  currentCalculations.forEach(c => {
    modelTypeCount[c.modelType] = (modelTypeCount[c.modelType] || 0) + 1;
  });

  const modelColors: Record<string, string> = {
    '生物量扩展因子法': '#3d7a2d',
    '蓄积量法': '#5d964a',
    '生物量回归模型法': '#8B6914',
    'IPCC默认值法': '#4A90A4',
  };

  const modelDistribution = Object.entries(modelTypeCount).map(([name, value]) => ({
    name,
    value,
    color: modelColors[name] || '#3d7a2d',
  }));

  const avgCarbonPerHectare = currentSubs.length > 0
    ? (currentCalculations.reduce((sum, c) => sum + c.co2Equivalent, 0) / currentSubs.reduce((sum, s) => sum + s.area, 0)).toFixed(2)
    : 0;

  const measurementOptions = currentMeasurements.map(m => ({
    value: m.id,
    label: `${m.id} - ${m.treeSpecies} (${m.measureDate})`,
  }));

  return (
    <div className="space-y-6">
      <div className="stagger-item">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold font-serif text-forest-800 mb-2">计量核算</h2>
            <p className="text-forest-600/70">生物量碳储量核算和碳汇计量模型管理</p>
          </div>
          <Space>
            <Button type="primary" icon={<Plus size={16} />} onClick={showAddForm}>新增核算</Button>
          </Space>
        </div>
      </div>

      <div className="stagger-item mb-4">
        <Card>
          <div className="flex flex-wrap gap-4 items-center">
            <span className="text-forest-700 font-medium">选择项目：</span>
            <Select
              value={selectedProjectId}
              onChange={setSelectedProjectId}
              style={{ width: 300 }}
            >
              {projects.map(p => (
                <Option key={p.id} value={p.id}>{p.name}</Option>
              ))}
            </Select>
          </div>
        </Card>
      </div>

      <Alert
        message="核算公式说明"
        description="本系统采用生物量扩展因子法进行碳汇核算：生物量 = 0.05 × DBH^1.8 × H^0.6，碳储量 = 生物量 × 0.5，CO₂当量 = 碳储量 × 3.667"
        type="info"
        showIcon
        className="stagger-item"
      />

      <Row gutter={[16, 16]} className="stagger-item">
        <Col xs={24} sm={12} lg={6}>
          <Card className="card-hover">
            <Statistic
              title="核算记录数"
              value={currentCalculations.length}
              suffix="条"
              valueStyle={{ color: '#3d7a2d' }}
              prefix={<Calculator size={20} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="card-hover">
            <Statistic
              title="总碳储量"
              value={currentCalculations.reduce((sum, c) => sum + c.carbonStock, 0).toFixed(2)}
              suffix="tC"
              valueStyle={{ color: '#4A90A4' }}
              prefix={<Database size={20} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="card-hover">
            <Statistic
              title="总CO₂当量"
              value={currentCalculations.reduce((sum, c) => sum + c.co2Equivalent, 0).toFixed(2)}
              suffix="tCO₂e"
              valueStyle={{ color: '#8B6914' }}
              prefix={<BarChart3 size={20} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="card-hover">
            <Statistic
              title="平均每公顷碳汇"
              value={avgCarbonPerHectare}
              suffix="tCO₂e/ha"
              valueStyle={{ color: '#D4A84B' }}
              prefix={<TrendingUp size={20} />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="stagger-item">
        <Col xs={24} lg={16}>
          <BarChart
            title="各核算指标对比"
            xData={formulaData.categories}
            seriesData={[
              {
                name: '数量',
                data: formulaData.values.map(Number),
                color: '#5d964a',
              },
            ]}
            yAxisName="数量"
          />
        </Col>
        <Col xs={24} lg={8}>
          <PieChart
            title="核算模型使用分布"
            data={modelDistribution}
          />
        </Col>
      </Row>

      <div className="stagger-item">
        <Tabs defaultActiveKey="1" className="bg-cream-50 rounded-xl">
          <TabPane tab={<span className="font-medium"><Calculator size={16} className="inline mr-2" />生物量碳储量核算</span>} key="1">
            <Card className="border-none">
              {currentCalculations.length === 0 ? (
                <Empty
                  description="暂无核算记录"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                >
                  <Button type="primary" icon={<Plus size={14} />} onClick={showAddForm}>
                    新增核算记录
                  </Button>
                </Empty>
              ) : (
                <Table
                  columns={calcColumns}
                  dataSource={currentCalculations}
                  rowKey="id"
                  scroll={{ x: 1200 }}
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `共 ${total} 条核算记录`,
                  }}
                />
              )}
            </Card>
          </TabPane>

          <TabPane tab={<span className="font-medium"><FileText size={16} className="inline mr-2" />碳汇计量模型</span>} key="2">
            <Card className="border-none">
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-forest-800 mb-4">当前使用模型</h4>
                  <Card className="bg-forest-50 border-forest-200">
                    <Descriptions bordered column={1}>
                      <Descriptions.Item label="模型名称">生物量扩展因子法</Descriptions.Item>
                      <Descriptions.Item label="模型公式">B = 0.05 × DBH^1.8 × H^0.6</Descriptions.Item>
                      <Descriptions.Item label="参数说明">
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          <li>DBH：胸径（cm）</li>
                          <li>H：树高（m）</li>
                          <li>B：生物量（t）</li>
                          <li>碳储量 = 生物量 × 0.5（碳转换系数）</li>
                          <li>CO₂当量 = 碳储量 × 3.667（碳与CO₂转换系数）</li>
                        </ul>
                      </Descriptions.Item>
                      <Descriptions.Item label="适用范围">适用于温带、亚热带森林乔木树种</Descriptions.Item>
                      <Descriptions.Item label="引用标准">《造林项目碳汇计量与监测指南》</Descriptions.Item>
                    </Descriptions>
                  </Card>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-forest-800 mb-4">模型参数配置</h4>
                  <Form layout="vertical">
                    <Row gutter={[16, 16]}>
                      <Col xs={24} sm={12} lg={8}>
                        <Form.Item label="碳转换系数" initialValue={0.5}>
                          <InputNumber style={{ width: '100%' }} step={0.01} />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12} lg={8}>
                        <Form.Item label="CO₂转换系数" initialValue={3.667}>
                          <InputNumber style={{ width: '100%' }} step={0.001} />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12} lg={8}>
                        <Form.Item label="地下/地上生物量比" initialValue={0.25}>
                          <InputNumber style={{ width: '100%' }} step={0.01} />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Space>
                      <Button type="primary">保存参数</Button>
                      <Button>重置默认</Button>
                    </Space>
                  </Form>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-forest-800 mb-4">可选模型列表</h4>
                  <Table
                    columns={[
                      { title: '模型名称', dataIndex: 'label', key: 'label' },
                      { title: '适用树种', dataIndex: 'trees', key: 'trees', render: () => '针叶林、阔叶林、竹林等' },
                      { title: '精度', dataIndex: 'accuracy', key: 'accuracy', render: () => <Progress percent={95} size="small" showInfo={false} /> },
                      {
                        title: '操作', key: 'action', render: () => (
                          <Space>
                            <Button type="link" size="small">选择使用</Button>
                            <Button type="link" size="small">查看详情</Button>
                          </Space>
                        )
                      },
                    ]}
                    dataSource={modelOptions}
                    rowKey="value"
                    pagination={false}
                  />
                </div>
              </div>
            </Card>
          </TabPane>
        </Tabs>
      </div>

      <Modal
        title="核算详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={700}
      >
        {selectedCalc && (
          <div className="space-y-6">
            <Descriptions title="核算基本信息" bordered column={2}>
              <Descriptions.Item label="核算日期">{selectedCalc.calculationDate}</Descriptions.Item>
              <Descriptions.Item label="模型类型">{selectedCalc.modelType}</Descriptions.Item>
              <Descriptions.Item label="计算公式">{selectedCalc.formula || '-'}</Descriptions.Item>
              <Descriptions.Item label="关联测量ID">{selectedCalc.measurementId}</Descriptions.Item>
            </Descriptions>

            <Descriptions title="核算参数" bordered column={2} className="mt-4">
              <Descriptions.Item label="地上生物量">
                <span className="font-mono font-semibold text-forest-700">{selectedCalc.biomassAbove.toFixed(4)} t</span>
              </Descriptions.Item>
              <Descriptions.Item label="地下生物量">
                <span className="font-mono font-semibold text-earth-700">{selectedCalc.biomassBelow.toFixed(4)} t</span>
              </Descriptions.Item>
              <Descriptions.Item label="碳储量">
                <span className="font-mono font-semibold text-sky-700">{selectedCalc.carbonStock.toFixed(4)} tC</span>
              </Descriptions.Item>
              <Descriptions.Item label="CO₂当量">
                <span className="font-mono font-semibold text-gold-700">{selectedCalc.co2Equivalent.toFixed(4)} tCO₂e</span>
              </Descriptions.Item>
            </Descriptions>

            <Row gutter={[16, 16]} className="mt-4">
              <Col xs={24} sm={12}>
                <Card className="bg-forest-50 border-forest-200 text-center">
                  <p className="text-sm text-forest-600 mb-2">地上生物量</p>
                  <p className="text-2xl font-bold font-serif text-forest-700">{selectedCalc.biomassAbove.toFixed(4)} <span className="text-sm">t</span></p>
                </Card>
              </Col>
              <Col xs={24} sm={12}>
                <Card className="bg-earth-50 border-earth-200 text-center">
                  <p className="text-sm text-earth-600 mb-2">地下生物量</p>
                  <p className="text-2xl font-bold font-serif text-earth-700">{selectedCalc.biomassBelow.toFixed(4)} <span className="text-sm">t</span></p>
                </Card>
              </Col>
              <Col xs={24} sm={12}>
                <Card className="bg-sky-50 border-sky-200 text-center">
                  <p className="text-sm text-sky-600 mb-2">碳储量</p>
                  <p className="text-2xl font-bold font-serif text-sky-700">{selectedCalc.carbonStock.toFixed(4)} <span className="text-sm">tC</span></p>
                </Card>
              </Col>
              <Col xs={24} sm={12}>
                <Card className="bg-gold-50 border-gold-200 text-center">
                  <p className="text-sm text-gold-600 mb-2">CO₂当量</p>
                  <p className="text-2xl font-bold font-serif text-gold-700">{selectedCalc.co2Equivalent.toFixed(4)} <span className="text-sm">tCO₂e</span></p>
                </Card>
              </Col>
            </Row>
          </div>
        )}
      </Modal>

      <Modal
        title={formMode === 'add' ? '新增核算记录' : '编辑核算记录'}
        open={formModalVisible}
        onCancel={() => {
          setFormModalVisible(false);
          calcForm.resetFields();
          setEditingCalc(null);
        }}
        onOk={handleFormSubmit}
        okText="保存"
        cancelText="取消"
        width={600}
      >
        <Form form={calcForm} layout="vertical">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="测量ID"
                name="measurementId"
                rules={[{ required: true, message: '请选择测量ID' }]}
              >
                <Select placeholder="请选择关联的测量记录">
                  {measurementOptions.map(opt => (
                    <Option key={opt.value} value={opt.value}>{opt.label}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="计算模型"
                name="modelType"
                rules={[{ required: true, message: '请选择计算模型' }]}
              >
                <Select placeholder="请选择计算模型">
                  {modelOptions.map(opt => (
                    <Option key={opt.value} value={opt.value}>{opt.label}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="地上生物量(t)"
                name="biomassAbove"
                rules={[{ required: true, message: '请输入地上生物量' }]}
              >
                <InputNumber style={{ width: '100%' }} step={0.0001} precision={4} min={0} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="地下生物量(t)"
                name="biomassBelow"
                rules={[{ required: true, message: '请输入地下生物量' }]}
              >
                <InputNumber style={{ width: '100%' }} step={0.0001} precision={4} min={0} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="碳储量(tC)"
                name="carbonStock"
                rules={[{ required: true, message: '请输入碳储量' }]}
              >
                <InputNumber style={{ width: '100%' }} step={0.0001} precision={4} min={0} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="CO₂当量(tCO₂e)"
                name="co2Equivalent"
                rules={[{ required: true, message: '请输入CO₂当量' }]}
              >
                <InputNumber style={{ width: '100%' }} step={0.0001} precision={4} min={0} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="计算日期"
                name="calculationDate"
                rules={[{ required: true, message: '请选择计算日期' }]}
              >
                <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item label="计算公式" name="formula">
                <Input placeholder="请输入计算公式（选填）" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default AccountingPage;
