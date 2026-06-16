import { useState } from 'react';
import { Tabs, Table, Tag, Button, Space, Modal, Form, Input, DatePicker, Select, Descriptions, Card, Row, Col, Statistic } from 'antd';
import { Eye, Plus, Edit, Trash2, Download, FileText, Calendar } from 'lucide-react';
import dayjs from 'dayjs';
import useAppStore from '../../store';
import type { Project, AnnualReport } from '../../types';

const { TabPane } = Tabs;
const { Option } = Select;
const { RangePicker } = DatePicker;

const ProjectPage: React.FC = () => {
  const { projects, getAnnualReportsByProjectId, getVerificationsByProjectId, getIssuancesByProjectId } = useAppStore();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [form] = Form.useForm();

  const statusMap: Record<Project['status'], { color: string; text: string }> = {
    active: { color: 'success', text: '进行中' },
    pending: { color: 'warning', text: '待审核' },
    completed: { color: 'default', text: '已完成' },
    suspended: { color: 'error', text: '已暂停' },
  };

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
      render: (val?: number) => val ? `${val.toLocaleString()} tCO₂e` : '-',
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
      width: 180,
      fixed: 'right' as const,
      render: (_: unknown, record: Project) => (
        <Space size="small">
          <Button type="link" size="small" icon={<Eye size={14} />} onClick={() => showProjectDetail(record)}>
            详情
          </Button>
          <Button type="link" size="small" icon={<Edit size={14} />}>
            编辑
          </Button>
        </Space>
      ),
    },
  ];

  const reportColumns = [
    {
      title: '报告年度',
      dataIndex: 'year',
      key: 'year',
    },
    {
      title: '提交日期',
      dataIndex: 'submitDate',
      key: 'submitDate',
    },
    {
      title: '审核人',
      dataIndex: 'auditor',
      key: 'auditor',
    },
    {
      title: '审核日期',
      dataIndex: 'auditDate',
      key: 'auditDate',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
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
      render: () => (
        <Space>
          <Button type="link" size="small" icon={<Eye size={14} />}>查看</Button>
          <Button type="link" size="small" icon={<Download size={14} />}>下载</Button>
        </Space>
      ),
    },
  ];

  const showProjectDetail = (project: Project) => {
    setSelectedProject(project);
    setDetailModalVisible(true);
  };

  return (
    <div className="space-y-6">
      <div className="stagger-item">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold font-serif text-forest-800 mb-2">项目台账</h2>
            <p className="text-forest-600/70">管理碳汇项目档案和年度报告</p>
          </div>
          <Button type="primary" icon={<Plus size={16} />}>
            新增项目
          </Button>
        </div>
      </div>

      <Row gutter={[16, 16]} className="stagger-item">
        <Col xs={24} sm={12} lg={6}>
          <Card className="card-hover">
            <Statistic
              title="项目总数"
              value={projects.length}
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
              value={projects.filter(p => p.status === 'active').length}
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
              value={projects.reduce((sum, p) => sum + p.totalArea, 0)}
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
              value={projects.reduce((sum, p) => sum + p.expectedCarbon, 0)}
              suffix="tCO₂e"
              valueStyle={{ color: '#D4A84B' }}
              prefix={<FileText size={20} />}
            />
          </Card>
        </Col>
      </Row>

      <div className="stagger-item">
        <Tabs defaultActiveKey="1" className="bg-cream-50 rounded-xl">
          <TabPane tab={<span className="font-medium"><FileText size={16} className="inline mr-2" />碳汇项目档案</span>} key="1">
            <Card className="border-none">
              <div className="flex flex-wrap gap-4 mb-4">
                <Form layout="inline" form={form}>
                  <Form.Item name="keyword">
                    <Input.Search placeholder="搜索项目名称" allowClear style={{ width: 240 }} />
                  </Form.Item>
                  <Form.Item name="status">
                    <Select placeholder="项目状态" allowClear style={{ width: 160 }}>
                      <Option value="active">进行中</Option>
                      <Option value="pending">待审核</Option>
                      <Option value="completed">已完成</Option>
                    </Select>
                  </Form.Item>
                  <Form.Item name="type">
                    <Select placeholder="项目类型" allowClear style={{ width: 160 }}>
                      <Option value="森林经营">森林经营</Option>
                      <Option value="造林再造林">造林再造林</Option>
                      <Option value="森林保护">森林保护</Option>
                    </Select>
                  </Form.Item>
                  <Form.Item name="date">
                    <RangePicker />
                  </Form.Item>
                  <Button type="primary">查询</Button>
                  <Button>重置</Button>
                </Form>
              </div>
              <Table
                columns={projectColumns}
                dataSource={projects}
                rowKey="id"
                scroll={{ x: 1400 }}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showTotal: (total) => `共 ${total} 条记录`,
                }}
              />
            </Card>
          </TabPane>

          <TabPane tab={<span className="font-medium"><Calendar size={16} className="inline mr-2" />项目年度报告</span>} key="2">
            <Card className="border-none">
              <Table
                columns={reportColumns}
                dataSource={selectedProject ? getAnnualReportsByProjectId(selectedProject.id) : projects.flatMap(p => getAnnualReportsByProjectId(p.id))}
                rowKey="id"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                }}
              />
            </Card>
          </TabPane>
        </Tabs>
      </div>

      <Modal
        title={selectedProject?.name}
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>关闭</Button>,
          <Button key="edit" type="primary">编辑项目</Button>,
        ]}
        width={800}
      >
        {selectedProject && (
          <div className="space-y-6">
            <Descriptions title="项目基本信息" bordered column={2}>
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
              <Descriptions.Item label="项目地点" span={2}>{selectedProject.location}</Descriptions.Item>
              <Descriptions.Item label="业主单位" span={2}>{selectedProject.owner}</Descriptions.Item>
              <Descriptions.Item label="预计碳汇量">{selectedProject.expectedCarbon.toLocaleString()} tCO₂e</Descriptions.Item>
              <Descriptions.Item label="实际碳汇量">
                {selectedProject.actualCarbon ? `${selectedProject.actualCarbon.toLocaleString()} tCO₂e` : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="项目描述" span={2}>{selectedProject.description}</Descriptions.Item>
            </Descriptions>

            <Descriptions title="核查与签发信息" bordered column={2}>
              <Descriptions.Item label="核查次数">{getVerificationsByProjectId(selectedProject.id).length} 次</Descriptions.Item>
              <Descriptions.Item label="已签发碳汇">
                {getIssuancesByProjectId(selectedProject.id).reduce((sum, i) => sum + i.issuedAmount, 0).toLocaleString()} tCO₂e
              </Descriptions.Item>
              <Descriptions.Item label="年度报告数量">{getAnnualReportsByProjectId(selectedProject.id).length} 份</Descriptions.Item>
              <Descriptions.Item label="最新报告年度">
                {getAnnualReportsByProjectId(selectedProject.id).sort((a, b) => b.year.localeCompare(a.year))[0]?.year || '-'}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ProjectPage;
