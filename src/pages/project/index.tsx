import { useState, useMemo } from 'react';
import { Tabs, Table, Tag, Button, Space, Modal, Form, Input, DatePicker, Select, Descriptions, Card, Row, Col, Statistic, InputNumber, message, Empty } from 'antd';
import { Eye, Plus, Edit, Trash2, Download, FileText, Calendar, Search, RefreshCw } from 'lucide-react';
import dayjs from 'dayjs';
import useAppStore from '../../store';
import type { Project, AnnualReport } from '../../types';

const { TabPane } = Tabs;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

const ProjectPage: React.FC = () => {
  const {
    projects,
    getAnnualReportsByProjectId,
    getVerificationsByProjectId,
    getIssuancesByProjectId,
    addProject,
    updateProject,
    deleteProject,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState('1');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [formModalVisible, setFormModalVisible] = useState(false);
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [reportProjectId, setReportProjectId] = useState<string>('');
  const [searchForm] = Form.useForm();
  const [projectForm] = Form.useForm();
  const [filters, setFilters] = useState<{
    keyword: string;
    status: string;
    type: string;
    dateRange: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null;
  }>({
    keyword: '',
    status: '',
    type: '',
    dateRange: null,
  });

  const statusMap: Record<Project['status'], { color: string; text: string }> = {
    active: { color: 'success', text: '进行中' },
    pending: { color: 'warning', text: '待审核' },
    completed: { color: 'default', text: '已完成' },
    suspended: { color: 'error', text: '已暂停' },
  };

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      if (filters.keyword && !project.name.toLowerCase().includes(filters.keyword.toLowerCase())) {
        return false;
      }
      if (filters.status && project.status !== filters.status) {
        return false;
      }
      if (filters.type && project.type !== filters.type) {
        return false;
      }
      if (filters.dateRange && filters.dateRange[0] && filters.dateRange[1]) {
        const startDate = dayjs(project.startDate);
        const endDate = dayjs(project.endDate);
        const filterStart = filters.dateRange[0];
        const filterEnd = filters.dateRange[1];
        if (endDate.isBefore(filterStart) || startDate.isAfter(filterEnd)) {
          return false;
        }
      }
      return true;
    });
  }, [projects, filters]);

  const annualReports = useMemo(() => {
    if (reportProjectId) {
      return getAnnualReportsByProjectId(reportProjectId);
    }
    return projects.flatMap((p) => getAnnualReportsByProjectId(p.id));
  }, [projects, reportProjectId, getAnnualReportsByProjectId]);

  const projectColumns = [
    {
      title: '项目名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <span className="font-medium text-forest-800">{text}</span>,
    },
    {
      title: '项目类型',
      dataIndex: 'type',
      key: 'type',
      width: 120,
    },
    {
      title: '备案编号',
      dataIndex: 'filingNo',
      key: 'filingNo',
      width: 160,
    },
    {
      title: '面积(公顷)',
      dataIndex: 'totalArea',
      key: 'totalArea',
      width: 100,
      render: (val: number) => val.toLocaleString(),
    },
    {
      title: '项目地点',
      dataIndex: 'location',
      key: 'location',
      width: 200,
      ellipsis: true,
    },
    {
      title: '监测周期',
      dataIndex: 'monitoringCycle',
      key: 'monitoringCycle',
      width: 100,
    },
    {
      title: '预计碳汇',
      dataIndex: 'expectedCarbon',
      key: 'expectedCarbon',
      width: 120,
      render: (val: number) => `${val.toLocaleString()} tCO₂e`,
    },
    {
      title: '实际碳汇',
      dataIndex: 'actualCarbon',
      key: 'actualCarbon',
      width: 120,
      render: (val?: number) => (val ? `${val.toLocaleString()} tCO₂e` : '-'),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: Project['status']) => {
        const s = statusMap[status];
        return <Tag color={s.color}>{s.text}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 220,
      fixed: 'right' as const,
      render: (_: unknown, record: Project) => (
        <Space size="small">
          <Button type="link" size="small" icon={<Eye size={14} />} onClick={() => showProjectDetail(record)}>
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

  const reportColumns = [
    {
      title: '项目名称',
      dataIndex: 'projectName',
      key: 'projectName',
      width: 200,
    },
    {
      title: '报告年度',
      dataIndex: 'year',
      key: 'year',
      width: 100,
    },
    {
      title: '提交日期',
      dataIndex: 'submitDate',
      key: 'submitDate',
      width: 120,
    },
    {
      title: '审核人',
      dataIndex: 'auditor',
      key: 'auditor',
      width: 100,
    },
    {
      title: '审核日期',
      dataIndex: 'auditDate',
      key: 'auditDate',
      width: 120,
    },
    {
      title: '碳汇量(tCO₂e)',
      dataIndex: 'carbonAmount',
      key: 'carbonAmount',
      width: 140,
      render: (val: number) => val.toLocaleString(),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: AnnualReport['status']) => {
        const map: Record<string, { color: string; text: string }> = {
          draft: { color: 'default', text: '草稿' },
          submitted: { color: 'warning', text: '已提交' },
          approved: { color: 'success', text: '已通过' },
          rejected: { color: 'error', text: '已驳回' },
        };
        return <Tag color={map[status].color}>{map[status].text}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 140,
      render: () => (
        <Space>
          <Button type="link" size="small" icon={<Eye size={14} />}>
            查看
          </Button>
          <Button type="link" size="small" icon={<Download size={14} />}>
            下载
          </Button>
        </Space>
      ),
    },
  ];

  const showProjectDetail = (project: Project) => {
    setSelectedProject(project);
    setDetailModalVisible(true);
  };

  const showAddForm = () => {
    setFormMode('add');
    setEditingProject(null);
    projectForm.resetFields();
    setFormModalVisible(true);
  };

  const showEditForm = (project: Project) => {
    setFormMode('edit');
    setEditingProject(project);
    projectForm.setFieldsValue({
      name: project.name,
      type: project.type,
      status: project.status,
      filingNo: project.filingNo,
      totalArea: project.totalArea,
      location: project.location,
      monitoringCycle: project.monitoringCycle,
      expectedCarbon: project.expectedCarbon,
      actualCarbon: project.actualCarbon,
      startDate: dayjs(project.startDate),
      endDate: dayjs(project.endDate),
      owner: project.owner,
      description: project.description,
    });
    setFormModalVisible(true);
  };

  const handleSearch = () => {
    const values = searchForm.getFieldsValue();
    setFilters({
      keyword: values.keyword || '',
      status: values.status || '',
      type: values.type || '',
      dateRange: values.date || null,
    });
  };

  const handleReset = () => {
    searchForm.resetFields();
    setFilters({
      keyword: '',
      status: '',
      type: '',
      dateRange: null,
    });
  };

  const handleFormSubmit = async () => {
    try {
      const values = await projectForm.validateFields();
      const projectData = {
        name: values.name,
        type: values.type,
        status: values.status,
        filingNo: values.filingNo,
        totalArea: values.totalArea,
        location: values.location,
        monitoringCycle: values.monitoringCycle,
        expectedCarbon: values.expectedCarbon,
        actualCarbon: values.actualCarbon || 0,
        startDate: values.startDate.format('YYYY-MM-DD'),
        endDate: values.endDate.format('YYYY-MM-DD'),
        owner: values.owner,
        description: values.description || '',
      };

      if (formMode === 'add') {
        addProject(projectData);
        message.success('项目创建成功');
      } else if (formMode === 'edit' && editingProject) {
        updateProject(editingProject.id, projectData);
        message.success('项目更新成功');
      }

      setFormModalVisible(false);
      projectForm.resetFields();
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个项目吗？删除后无法恢复。',
      okText: '确定',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: () => {
        deleteProject(id);
        message.success('项目删除成功');
      },
    });
  };

  const totalStats = useMemo(() => {
    return {
      total: filteredProjects.length,
      active: filteredProjects.filter((p) => p.status === 'active').length,
      area: filteredProjects.reduce((sum, p) => sum + p.totalArea, 0),
      expectedCarbon: filteredProjects.reduce((sum, p) => sum + p.expectedCarbon, 0),
    };
  }, [filteredProjects]);

  return (
    <div className="space-y-6">
      <div className="stagger-item">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold font-serif text-forest-800 mb-2">项目台账</h2>
            <p className="text-forest-600/70">管理碳汇项目档案和年度报告</p>
          </div>
          <Button type="primary" icon={<Plus size={16} />} onClick={showAddForm}>
            新增项目
          </Button>
        </div>
      </div>

      <Row gutter={[16, 16]} className="stagger-item">
        <Col xs={24} sm={12} lg={6}>
          <Card className="card-hover">
            <Statistic
              title="项目总数"
              value={totalStats.total}
              suffix="个"
              valueStyle={{ color: '#3d7a2d' }}
              prefix={<FileText size={20} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="card-hover">
            <Statistic
              title="进行中项目"
              value={totalStats.active}
              suffix="个"
              valueStyle={{ color: '#4A90A4' }}
              prefix={<Calendar size={20} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="card-hover">
            <Statistic
              title="总面积"
              value={totalStats.area}
              suffix="公顷"
              valueStyle={{ color: '#8B6914' }}
              prefix={<FileText size={20} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="card-hover">
            <Statistic
              title="预计总碳汇"
              value={totalStats.expectedCarbon}
              suffix="tCO₂e"
              valueStyle={{ color: '#D4A84B' }}
              prefix={<FileText size={20} />}
            />
          </Card>
        </Col>
      </Row>

      <div className="stagger-item">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          className="bg-cream-50 rounded-xl"
        >
          <TabPane
            tab={
              <span className="font-medium">
                <FileText size={16} className="inline mr-2" />
                碳汇项目档案
              </span>
            }
            key="1"
          >
            <Card className="border-none">
              <div className="flex flex-wrap gap-4 mb-4 items-end">
                <Form layout="inline" form={searchForm} onFinish={handleSearch}>
                  <Form.Item name="keyword" label="关键词">
                    <Input placeholder="项目名称" allowClear style={{ width: 200 }} prefix={<Search size={14} />} />
                  </Form.Item>
                  <Form.Item name="status" label="状态">
                    <Select placeholder="全部" allowClear style={{ width: 120 }}>
                      <Option value="active">进行中</Option>
                      <Option value="pending">待审核</Option>
                      <Option value="completed">已完成</Option>
                      <Option value="suspended">已暂停</Option>
                    </Select>
                  </Form.Item>
                  <Form.Item name="type" label="类型">
                    <Select placeholder="全部" allowClear style={{ width: 140 }}>
                      <Option value="森林经营">森林经营</Option>
                      <Option value="造林再造林">造林再造林</Option>
                      <Option value="森林保护">森林保护</Option>
                    </Select>
                  </Form.Item>
                  <Form.Item name="date" label="日期">
                    <RangePicker />
                  </Form.Item>
                  <Form.Item>
                    <Space>
                      <Button type="primary" htmlType="submit" icon={<Search size={14} />}>
                        查询
                      </Button>
                      <Button onClick={handleReset} icon={<RefreshCw size={14} />}>
                        重置
                      </Button>
                    </Space>
                  </Form.Item>
                </Form>
              </div>
              <Table
                columns={projectColumns}
                dataSource={filteredProjects}
                rowKey="id"
                scroll={{ x: 1400 }}
                locale={{
                  emptyText: <Empty description="暂无项目数据" />,
                }}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showTotal: (total) => `共 ${total} 条记录`,
                }}
              />
            </Card>
          </TabPane>

          <TabPane
            tab={
              <span className="font-medium">
                <Calendar size={16} className="inline mr-2" />
                项目年度报告
              </span>
            }
            key="2"
          >
            <Card className="border-none">
              <div className="mb-4">
                <Space>
                  <span className="text-forest-700 font-medium">选择项目：</span>
                  <Select
                    placeholder="全部项目"
                    allowClear
                    style={{ width: 300 }}
                    value={reportProjectId || undefined}
                    onChange={(val) => setReportProjectId(val || '')}
                  >
                    {projects.map((p) => (
                      <Option key={p.id} value={p.id}>
                        {p.name}
                      </Option>
                    ))}
                  </Select>
                </Space>
              </div>
              <Table
                columns={reportColumns}
                dataSource={annualReports}
                rowKey="id"
                locale={{
                  emptyText: <Empty description="暂无年度报告数据" />,
                }}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showTotal: (total) => `共 ${total} 条记录`,
                }}
              />
            </Card>
          </TabPane>
        </Tabs>
      </div>

      <Modal
        title={selectedProject?.name || '项目详情'}
        open={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false);
          setSelectedProject(null);
        }}
        footer={[
          <Button key="close" onClick={() => {
            setDetailModalVisible(false);
            setSelectedProject(null);
          }}>
            关闭
          </Button>,
          <Button key="edit" type="primary" onClick={() => {
            if (selectedProject) {
              setDetailModalVisible(false);
              showEditForm(selectedProject);
            }
          }}>
            编辑项目
          </Button>,
        ]}
        width={800}
      >
        {selectedProject && (
          <div className="space-y-6">
            <Descriptions title="项目基本信息" bordered column={2} size="small">
              <Descriptions.Item label="项目名称">{selectedProject.name}</Descriptions.Item>
              <Descriptions.Item label="项目类型">{selectedProject.type}</Descriptions.Item>
              <Descriptions.Item label="备案编号">{selectedProject.filingNo}</Descriptions.Item>
              <Descriptions.Item label="项目状态">
                <Tag color={statusMap[selectedProject.status].color}>
                  {statusMap[selectedProject.status].text}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="开始日期">{selectedProject.startDate}</Descriptions.Item>
              <Descriptions.Item label="结束日期">{selectedProject.endDate}</Descriptions.Item>
              <Descriptions.Item label="总面积">{selectedProject.totalArea} 公顷</Descriptions.Item>
              <Descriptions.Item label="监测周期">{selectedProject.monitoringCycle}</Descriptions.Item>
              <Descriptions.Item label="项目地点" span={2}>
                {selectedProject.location}
              </Descriptions.Item>
              <Descriptions.Item label="业主单位" span={2}>
                {selectedProject.owner}
              </Descriptions.Item>
              <Descriptions.Item label="预计碳汇量">
                {selectedProject.expectedCarbon.toLocaleString()} tCO₂e
              </Descriptions.Item>
              <Descriptions.Item label="实际碳汇量">
                {selectedProject.actualCarbon
                  ? `${selectedProject.actualCarbon.toLocaleString()} tCO₂e`
                  : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="项目描述" span={2}>
                {selectedProject.description}
              </Descriptions.Item>
            </Descriptions>

            <Descriptions title="核查与签发信息" bordered column={2} size="small">
              <Descriptions.Item label="核查次数">
                {getVerificationsByProjectId(selectedProject.id).length} 次
              </Descriptions.Item>
              <Descriptions.Item label="已签发碳汇">
                {getIssuancesByProjectId(selectedProject.id)
                  .reduce((sum, i) => sum + i.issuedAmount, 0)
                  .toLocaleString()}{' '}
                tCO₂e
              </Descriptions.Item>
              <Descriptions.Item label="年度报告数量">
                {getAnnualReportsByProjectId(selectedProject.id).length} 份
              </Descriptions.Item>
              <Descriptions.Item label="最新报告年度">
                {getAnnualReportsByProjectId(selectedProject.id)
                  .sort((a, b) => b.year.localeCompare(a.year))[0]?.year || '-'}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>

      <Modal
        title={formMode === 'add' ? '新增项目' : '编辑项目'}
        open={formModalVisible}
        onCancel={() => {
          setFormModalVisible(false);
          projectForm.resetFields();
          setEditingProject(null);
        }}
        onOk={handleFormSubmit}
        okText="保存"
        cancelText="取消"
        width={700}
        destroyOnClose
      >
        <Form form={projectForm} layout="vertical" size="middle">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="项目名称"
                rules={[{ required: true, message: '请输入项目名称' }]}
              >
                <Input placeholder="请输入项目名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="type"
                label="项目类型"
                rules={[{ required: true, message: '请选择项目类型' }]}
              >
                <Select placeholder="请选择项目类型">
                  <Option value="森林经营">森林经营</Option>
                  <Option value="造林再造林">造林再造林</Option>
                  <Option value="森林保护">森林保护</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="status"
                label="项目状态"
                rules={[{ required: true, message: '请选择项目状态' }]}
              >
                <Select placeholder="请选择项目状态">
                  <Option value="active">进行中</Option>
                  <Option value="pending">待审核</Option>
                  <Option value="completed">已完成</Option>
                  <Option value="suspended">已暂停</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="filingNo"
                label="备案编号"
                rules={[{ required: true, message: '请输入备案编号' }]}
              >
                <Input placeholder="请输入备案编号" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="startDate"
                label="开始日期"
                rules={[{ required: true, message: '请选择开始日期' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="endDate"
                label="结束日期"
                rules={[{ required: true, message: '请选择结束日期' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="totalArea"
                label="总面积(公顷)"
                rules={[{ required: true, message: '请输入总面积' }]}
              >
                <InputNumber style={{ width: '100%' }} min={0} step={0.01} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="monitoringCycle"
                label="监测周期"
                rules={[{ required: true, message: '请输入监测周期' }]}
              >
                <Input placeholder="如：5年/周期" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="owner"
                label="业主单位"
                rules={[{ required: true, message: '请输入业主单位' }]}
              >
                <Input placeholder="请输入业主单位" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="expectedCarbon"
                label="预计碳汇量(tCO₂e)"
                rules={[{ required: true, message: '请输入预计碳汇量' }]}
              >
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="actualCarbon" label="实际碳汇量(tCO₂e)">
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="location" label="项目地点" rules={[{ required: true, message: '请输入项目地点' }]}>
            <Input placeholder="请输入项目地点" />
          </Form.Item>
          <Form.Item name="description" label="项目描述">
            <TextArea rows={3} placeholder="请输入项目描述" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProjectPage;
