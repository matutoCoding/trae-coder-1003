import { useState, useMemo } from 'react';
import { Tabs, Table, Tag, Button, Space, Card, Row, Col, Modal, Form, Input, InputNumber, Select, DatePicker, Statistic, message, Empty, Descriptions } from 'antd';
import { Activity, Ruler, Eye, Plus, Edit, Trash2, TrendingUp, BarChart3 } from 'lucide-react';
import dayjs from 'dayjs';
import useAppStore from '../../store';
import LineChart from '../../components/charts/LineChart';
import BarChart from '../../components/charts/BarChart';
import type { TreeMeasurement, MonitoringRecord } from '../../types';

const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;

const MonitoringPage: React.FC = () => {
  const {
    projects,
    treeMeasurements,
    monitoringRecords,
    getMonitoringRecordsByProjectId,
    getMeasurementsBySubcompartmentId,
    getSubcompartmentsByProjectId,
    addTreeMeasurement,
    updateTreeMeasurement,
    deleteTreeMeasurement,
  } = useAppStore();

  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');
  const [selectedMeasurement, setSelectedMeasurement] = useState<TreeMeasurement | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [formModalVisible, setFormModalVisible] = useState(false);
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
  const [editingMeasurement, setEditingMeasurement] = useState<TreeMeasurement | null>(null);
  const [measurementForm] = Form.useForm();

  const currentMonRecords = selectedProjectId ? getMonitoringRecordsByProjectId(selectedProjectId) : monitoringRecords;
  const currentSubs = selectedProjectId ? getSubcompartmentsByProjectId(selectedProjectId) : [];
  const currentMeasurements = currentSubs.flatMap(s => getMeasurementsBySubcompartmentId(s.id));

  const quarterlyCarbonData = useMemo(() => {
    const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
    const data = [0, 0, 0, 0];
    currentMonRecords.forEach(record => {
      const month = dayjs(record.recordDate).month();
      const quarterIndex = Math.floor(month / 3);
      if (quarterIndex >= 0 && quarterIndex < 4) {
        data[quarterIndex] += record.carbonIncrement;
      }
    });
    return quarters.map((q, i) => ({ quarter: q, value: Number(data[i].toFixed(2)) }));
  }, [currentMonRecords]);

  const growthData = useMemo(() => {
    const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
    const dbhGrowth: number[] = new Array(12).fill(0);
    const heightGrowth: number[] = new Array(12).fill(0);
    const counts: number[] = new Array(12).fill(0);

    currentMeasurements.forEach(m => {
      const month = dayjs(m.measureDate).month();
      if (month >= 0 && month < 12) {
        dbhGrowth[month] += m.dbh;
        heightGrowth[month] += m.treeHeight;
        counts[month] += 1;
      }
    });

    const avgDbhGrowth = dbhGrowth.map((val, i) => counts[i] > 0 ? Number((val / counts[i] / 100).toFixed(2)) : 0);
    const avgHeightGrowth = heightGrowth.map((val, i) => counts[i] > 0 ? Number((val / counts[i] / 100).toFixed(2)) : 0);

    return {
      months,
      dbhGrowth: avgDbhGrowth,
      heightGrowth: avgHeightGrowth,
    };
  }, [currentMeasurements]);

  const showAddForm = () => {
    setFormMode('add');
    setEditingMeasurement(null);
    measurementForm.resetFields();
    setFormModalVisible(true);
  };

  const showEditForm = (record: TreeMeasurement) => {
    setFormMode('edit');
    setEditingMeasurement(record);
    measurementForm.setFieldsValue({
      subcompartmentId: record.subcompartmentId,
      measureDate: dayjs(record.measureDate),
      treeSpecies: record.treeSpecies,
      dbh: record.dbh,
      treeHeight: record.treeHeight,
      crownWidth: record.crownWidth,
      samplePlotNo: record.samplePlotNo,
      treeCount: record.treeCount,
    });
    setFormModalVisible(true);
  };

  const handleFormSubmit = async () => {
    try {
      const values = await measurementForm.validateFields();
      const measurementData = {
        subcompartmentId: values.subcompartmentId,
        measureDate: values.measureDate.format('YYYY-MM-DD'),
        treeSpecies: values.treeSpecies,
        dbh: values.dbh,
        treeHeight: values.treeHeight,
        crownWidth: values.crownWidth,
        samplePlotNo: values.samplePlotNo,
        treeCount: values.treeCount,
      };

      if (formMode === 'add') {
        addTreeMeasurement(measurementData);
        message.success('测量记录添加成功');
      } else if (formMode === 'edit' && editingMeasurement) {
        updateTreeMeasurement(editingMeasurement.id, measurementData);
        message.success('测量记录更新成功');
      }

      setFormModalVisible(false);
      measurementForm.resetFields();
      setEditingMeasurement(null);
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这条测量记录吗？删除后无法恢复。',
      okText: '确定',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: () => {
        deleteTreeMeasurement(id);
        message.success('测量记录删除成功');
      },
    });
  };

  const showDetail = (record: TreeMeasurement) => {
    setSelectedMeasurement(record);
    setDetailModalVisible(true);
  };

  const getSubcompartmentInfo = (subId: string) => {
    return currentSubs.find(s => s.id === subId);
  };

  const measurementColumns = [
    {
      title: '测量日期',
      dataIndex: 'measureDate',
      key: 'measureDate',
      width: 120,
    },
    {
      title: '树种',
      dataIndex: 'treeSpecies',
      key: 'treeSpecies',
      width: 120,
    },
    {
      title: '胸径(cm)',
      dataIndex: 'dbh',
      key: 'dbh',
      width: 100,
      render: (val: number) => <span className="font-mono font-semibold text-forest-700">{val}</span>,
    },
    {
      title: '树高(m)',
      dataIndex: 'treeHeight',
      key: 'treeHeight',
      width: 100,
      render: (val: number) => <span className="font-mono font-semibold text-sky-700">{val}</span>,
    },
    {
      title: '冠幅(m)',
      dataIndex: 'crownWidth',
      key: 'crownWidth',
      width: 100,
      render: (val?: number) => val || '-',
    },
    {
      title: '样地号',
      dataIndex: 'samplePlotNo',
      key: 'samplePlotNo',
      width: 100,
    },
    {
      title: '株数',
      dataIndex: 'treeCount',
      key: 'treeCount',
      width: 80,
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      fixed: 'right' as const,
      render: (_: unknown, record: TreeMeasurement) => (
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

  const monitoringColumns = [
    {
      title: '记录日期',
      dataIndex: 'recordDate',
      key: 'recordDate',
      width: 120,
    },
    {
      title: '碳汇增量(tCO₂e)',
      dataIndex: 'carbonIncrement',
      key: 'carbonIncrement',
      render: (val: number) => <span className="font-mono font-semibold text-forest-700">{val.toFixed(2)}</span>,
    },
    {
      title: '生物量(t)',
      dataIndex: 'biomass',
      key: 'biomass',
      render: (val: number) => <span className="font-mono font-semibold text-earth-700">{val.toFixed(2)}</span>,
    },
    {
      title: '监测方法',
      dataIndex: 'monitoringMethod',
      key: 'monitoringMethod',
      width: 140,
      render: (method: string) => (
        <Tag color="blue">{method}</Tag>
      ),
    },
    {
      title: '监测人员',
      dataIndex: 'monitoringPerson',
      key: 'monitoringPerson',
      width: 100,
    },
    {
      title: '备注',
      dataIndex: 'remarks',
      key: 'remarks',
      ellipsis: true,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="stagger-item">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold font-serif text-forest-800 mb-2">碳汇监测</h2>
            <p className="text-forest-600/70">树种胸径测量和固碳增量监测</p>
          </div>
          <Space>
            <Button type="primary" icon={<Plus size={16} />} onClick={showAddForm}>
              新增测量
            </Button>
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

      <Row gutter={[16, 16]} className="stagger-item">
        <Col xs={24} sm={12} lg={6}>
          <Card className="card-hover">
            <Statistic
              title="监测记录数"
              value={currentMonRecords.length}
              suffix="条"
              valueStyle={{ color: '#3d7a2d' }}
              prefix={<Activity size={20} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="card-hover">
            <Statistic
              title="累计固碳增量"
              value={currentMonRecords.reduce((sum, m) => sum + m.carbonIncrement, 0).toFixed(2)}
              suffix="tCO₂e"
              valueStyle={{ color: '#4A90A4' }}
              prefix={<TrendingUp size={20} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="card-hover">
            <Statistic
              title="胸径测量数"
              value={currentMeasurements.length}
              suffix="次"
              valueStyle={{ color: '#8B6914' }}
              prefix={<Ruler size={20} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="card-hover">
            <Statistic
              title="平均胸径"
              value={currentMeasurements.length > 0 ? (currentMeasurements.reduce((sum, m) => sum + m.dbh, 0) / currentMeasurements.length).toFixed(1) : 0}
              suffix="cm"
              valueStyle={{ color: '#D4A84B' }}
              prefix={<BarChart3 size={20} />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="stagger-item">
        <Col xs={24} lg={12}>
          <LineChart
            title="林木生长曲线"
            xData={growthData.months}
            seriesData={[
              {
                name: '胸径生长(cm)',
                data: growthData.dbhGrowth,
                color: '#3d7a2d',
                areaColor: 'rgba(61, 122, 45, 0.2)',
              },
              {
                name: '树高生长(m)',
                data: growthData.heightGrowth,
                color: '#4A90A4',
                areaColor: 'rgba(74, 144, 164, 0.2)',
              },
            ]}
            yAxisName="生长量"
          />
        </Col>
        <Col xs={24} lg={12}>
          <BarChart
            title="各季度碳汇增量"
            xData={quarterlyCarbonData.map(d => d.quarter)}
            seriesData={[
              {
                name: '碳汇增量(tCO₂e)',
                data: quarterlyCarbonData.map(d => d.value),
                color: '#5d964a',
              },
            ]}
            yAxisName="tCO₂e"
          />
        </Col>
      </Row>

      <div className="stagger-item">
        <Tabs defaultActiveKey="1" className="bg-cream-50 rounded-xl">
          <TabPane tab={<span className="font-medium"><Ruler size={16} className="inline mr-2" />树种胸径测量</span>} key="1">
            <Card className="border-none">
              <div className="flex flex-wrap gap-4 mb-4">
                <Form layout="inline">
                  <Form.Item name="subcompartment">
                    <Select placeholder="选择小班" allowClear style={{ width: 200 }}>
                      {currentSubs.map(s => (
                        <Option key={s.id} value={s.id}>{s.code} - {s.name}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                  <Form.Item name="date">
                    <DatePicker.RangePicker />
                  </Form.Item>
                  <Button type="primary">查询</Button>
                  <Button>重置</Button>
                </Form>
              </div>
              <Table
                columns={measurementColumns}
                dataSource={currentMeasurements}
                rowKey="id"
                scroll={{ x: 1000 }}
                locale={{
                  emptyText: <Empty description="暂无测量记录" />,
                }}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showTotal: (total) => `共 ${total} 条测量记录`,
                }}
              />
            </Card>
          </TabPane>

          <TabPane tab={<span className="font-medium"><Activity size={16} className="inline mr-2" />固碳增量监测</span>} key="2">
            <Card className="border-none">
              <Table
                columns={monitoringColumns}
                dataSource={currentMonRecords}
                rowKey="id"
                scroll={{ x: 1000 }}
                locale={{
                  emptyText: <Empty description="暂无监测记录" />,
                }}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showTotal: (total) => `共 ${total} 条监测记录`,
                }}
              />
            </Card>
          </TabPane>
        </Tabs>
      </div>

      <Modal
        title="测量详情"
        open={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false);
          setSelectedMeasurement(null);
        }}
        footer={[
          <Button key="close" onClick={() => {
            setDetailModalVisible(false);
            setSelectedMeasurement(null);
          }}>
            关闭
          </Button>,
          <Button key="edit" type="primary" onClick={() => {
            if (selectedMeasurement) {
              setDetailModalVisible(false);
              showEditForm(selectedMeasurement);
            }
          }}>
            编辑记录
          </Button>,
        ]}
        width={600}
      >
        {selectedMeasurement && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-forest-50 border-forest-200">
                <p className="text-sm text-forest-600 mb-1">胸径 (DBH)</p>
                <p className="text-3xl font-bold font-serif text-forest-700">{selectedMeasurement.dbh} <span className="text-lg">cm</span></p>
              </Card>
              <Card className="bg-sky-50 border-sky-200">
                <p className="text-sm text-sky-600 mb-1">树高</p>
                <p className="text-3xl font-bold font-serif text-sky-700">{selectedMeasurement.treeHeight} <span className="text-lg">m</span></p>
              </Card>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gold-50 rounded-lg">
                <p className="text-sm text-gold-600 mb-1">冠幅</p>
                <p className="text-xl font-bold text-gold-700">{selectedMeasurement.crownWidth || '-'} m</p>
              </div>
              <div className="p-4 bg-earth-50 rounded-lg">
                <p className="text-sm text-earth-600 mb-1">株数</p>
                <p className="text-xl font-bold text-earth-700">{selectedMeasurement.treeCount || '-'} 株</p>
              </div>
            </div>
            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label="树种">{selectedMeasurement.treeSpecies}</Descriptions.Item>
              <Descriptions.Item label="测量日期">{selectedMeasurement.measureDate}</Descriptions.Item>
              <Descriptions.Item label="样地编号">{selectedMeasurement.samplePlotNo || '-'}</Descriptions.Item>
              <Descriptions.Item label="所属小班">
                {getSubcompartmentInfo(selectedMeasurement.subcompartmentId)
                  ? `${getSubcompartmentInfo(selectedMeasurement.subcompartmentId)?.code} - ${getSubcompartmentInfo(selectedMeasurement.subcompartmentId)?.name}`
                  : selectedMeasurement.subcompartmentId}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>

      <Modal
        title={formMode === 'add' ? '新增测量记录' : '编辑测量记录'}
        open={formModalVisible}
        onCancel={() => {
          setFormModalVisible(false);
          measurementForm.resetFields();
          setEditingMeasurement(null);
        }}
        onOk={handleFormSubmit}
        okText="保存"
        cancelText="取消"
        width={600}
        destroyOnClose
      >
        <Form form={measurementForm} layout="vertical" size="middle">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="subcompartmentId"
                label="所属小班"
                rules={[{ required: true, message: '请选择所属小班' }]}
              >
                <Select placeholder="请选择小班">
                  {currentSubs.map(s => (
                    <Option key={s.id} value={s.id}>{s.code} - {s.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="measureDate"
                label="测量日期"
                rules={[{ required: true, message: '请选择测量日期' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="treeSpecies"
                label="树种"
                rules={[{ required: true, message: '请输入树种名称' }]}
              >
                <Input placeholder="请输入树种名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="samplePlotNo"
                label="样地编号"
              >
                <Input placeholder="请输入样地编号" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="dbh"
                label="胸径(cm)"
                rules={[{ required: true, message: '请输入胸径' }]}
              >
                <InputNumber style={{ width: '100%' }} min={0} step={0.1} precision={1} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="treeHeight"
                label="树高(m)"
                rules={[{ required: true, message: '请输入树高' }]}
              >
                <InputNumber style={{ width: '100%' }} min={0} step={0.1} precision={1} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="crownWidth"
                label="冠幅(m)"
              >
                <InputNumber style={{ width: '100%' }} min={0} step={0.1} precision={1} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="treeCount"
            label="株数"
          >
            <InputNumber style={{ width: '100%' }} min={0} step={1} precision={0} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MonitoringPage;
