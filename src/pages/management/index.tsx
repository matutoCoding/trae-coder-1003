import { useState } from 'react';
import { Tabs, Table, Tag, Button, Space, Card, Row, Col, Descriptions, Modal, Form, Input, Select, DatePicker, Statistic, Progress, Calendar, Badge } from 'antd';
import { Sprout, FileText, Eye, Plus, Edit, Users, Calendar as CalendarIcon, TrendingUp, CheckCircle2 } from 'lucide-react';
import dayjs, { Dayjs } from 'dayjs';
import useAppStore from '../../store';
import type { NursingTask } from '../../types';

const { TabPane } = Tabs;
const { Option } = Select;

const taskTypeMap: Record<string, { label: string; color: string }> = {
  tending: { label: '抚育间伐', color: 'green' },
  pruning: { label: '修枝整形', color: 'blue' },
  fertilization: { label: '施肥养护', color: 'gold' },
  pestControl: { label: '病虫害防治', color: 'red' },
  firePrevention: { label: '森林防火', color: 'orange' },
};

const statusMap: Record<string, { label: string; color: string }> = {
  notStarted: { label: '未开始', color: 'default' },
  inProgress: { label: '进行中', color: 'processing' },
  completed: { label: '已完成', color: 'success' },
  delayed: { label: '已延期', color: 'warning' },
};

const ManagementPage: React.FC = () => {
  const { projects, nursingTasks, getNursingTasksByProjectId } = useAppStore();
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');
  const [selectedTask, setSelectedTask] = useState<NursingTask | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  const currentTasks = selectedProjectId ? getNursingTasksByProjectId(selectedProjectId) : nursingTasks;

  const taskColumns = [
    {
      title: '任务名称',
      dataIndex: 'taskName',
      key: 'taskName',
      width: 160,
      render: (text: string) => <span className="font-medium text-forest-800">{text}</span>,
    },
    {
      title: '任务类型',
      dataIndex: 'taskType',
      key: 'taskType',
      width: 120,
      render: (type: string) => {
        const t = taskTypeMap[type];
        return <Tag color={t.color}>{t.label}</Tag>;
      },
    },
    {
      title: '计划日期',
      dataIndex: 'planDate',
      key: 'planDate',
      width: 120,
    },
    {
      title: '执行人',
      dataIndex: 'executor',
      key: 'executor',
      width: 100,
    },
    {
      title: '进度',
      dataIndex: 'progress',
      key: 'progress',
      width: 200,
      render: (progress: number) => (
        <div className="flex items-center gap-2">
          <Progress percent={progress} size="small" strokeColor="#3d7a2d" className="flex-1" />
          <span className="text-sm font-mono text-forest-700">{progress}%</span>
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const s = statusMap[status];
        return <Tag color={s.color}>{s.label}</Tag>;
      },
    },
    {
      title: '实际工时(h)',
      dataIndex: 'workHours',
      key: 'workHours',
      width: 100,
      render: (val?: number) => val || '-',
    },
    {
      title: '成本(元)',
      dataIndex: 'cost',
      key: 'cost',
      width: 120,
      render: (val?: number) => val?.toLocaleString() || '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right' as const,
      render: (_: unknown, record: NursingTask) => (
        <Space size="small">
          <Button type="link" size="small" icon={<Eye size={14} />} onClick={() => {
            setSelectedTask(record);
            setDetailModalVisible(true);
          }}>
            详情
          </Button>
          <Button type="link" size="small" icon={<Edit size={14} />}>
            编辑
          </Button>
        </Space>
      ),
    },
  ];

  const recordColumns = [
    {
      title: '日期',
      dataIndex: 'planDate',
      key: 'planDate',
      width: 120,
    },
    {
      title: '作业类型',
      dataIndex: 'taskType',
      key: 'taskType',
      render: (type: string) => taskTypeMap[type]?.label,
    },
    {
      title: '作业内容',
      dataIndex: 'taskName',
      key: 'taskName',
    },
    {
      title: '作业人员',
      dataIndex: 'executor',
      key: 'executor',
      width: 100,
    },
    {
      title: '抚育方式',
      dataIndex: 'taskType',
      key: 'nursingType',
      render: (type: string) => {
        const map: Record<string, string> = {
          tending: '人工抚育',
          pruning: '人工修枝',
          fertilization: '根部施肥',
          pestControl: '生物防治',
          firePrevention: '巡护排查',
        };
        return map[type] || '-';
      },
    },
    {
      title: '效果评估',
      dataIndex: 'effectEvaluation',
      key: 'effectEvaluation',
      render: (val?: string) => val || '待评估',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const s = statusMap[status];
        return <Tag color={s.color}>{s.label}</Tag>;
      },
    },
  ];

  const getListData = (value: Dayjs) => {
    const dateStr = value.format('YYYY-MM-DD');
    const tasksOnDate = currentTasks.filter(t => t.planDate === dateStr);
    return tasksOnDate.map(t => ({
      type: t.status === 'completed' ? 'success' : t.status === 'inProgress' ? 'warning' : 'default',
      content: t.taskName,
    }));
  };

  const dateCellRender = (value: Dayjs) => {
    const listData = getListData(value);
    return (
      <ul className="p-0 m-0 list-none">
        {listData.map((item, idx) => (
          <li key={idx} className="text-xs mb-1">
            <Badge status={item.type as any} text={item.content} />
          </li>
        ))}
      </ul>
    );
  };

  const taskStats = {
    total: currentTasks.length,
    completed: currentTasks.filter(t => t.status === 'completed').length,
    inProgress: currentTasks.filter(t => t.status === 'inProgress').length,
    delayed: currentTasks.filter(t => t.status === 'delayed').length,
    totalCost: currentTasks.reduce((sum, t) => sum + (t.cost || 0), 0),
    totalHours: currentTasks.reduce((sum, t) => sum + (t.workHours || 0), 0),
  };

  const completionRate = taskStats.total > 0 ? Math.round((taskStats.completed / taskStats.total) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="stagger-item">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold font-serif text-forest-800 mb-2">营林管护</h2>
            <p className="text-forest-600/70">营林抚育管护和抚育作业记录</p>
          </div>
          <Space>
            <Button type="primary" icon={<Plus size={16} />}>新增任务</Button>
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
        <Col xs={24} sm={12} lg={4}>
          <Card className="card-hover">
            <Statistic
              title="总任务数"
              value={taskStats.total}
              suffix="项"
              valueStyle={{ color: '#3d7a2d' }}
              prefix={<FileText size={20} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card className="card-hover">
            <Statistic
              title="已完成"
              value={taskStats.completed}
              suffix="项"
              valueStyle={{ color: '#5d964a' }}
              prefix={<CheckCircle2 size={20} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card className="card-hover">
            <Statistic
              title="进行中"
              value={taskStats.inProgress}
              suffix="项"
              valueStyle={{ color: '#4A90A4' }}
              prefix={<TrendingUp size={20} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card className="card-hover">
            <Statistic
              title="已延期"
              value={taskStats.delayed}
              suffix="项"
              valueStyle={{ color: '#D4A84B' }}
              prefix={<CalendarIcon size={20} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card className="card-hover">
            <Statistic
              title="累计工时"
              value={taskStats.totalHours}
              suffix="h"
              valueStyle={{ color: '#8B6914' }}
              prefix={<Users size={20} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card className="card-hover">
            <Statistic
              title="累计成本"
              value={taskStats.totalCost.toLocaleString()}
              suffix="元"
              valueStyle={{ color: '#D4A84B' }}
              prefix={<Sprout size={20} />}
            />
          </Card>
        </Col>
      </Row>

      <div className="stagger-item">
        <Card className="card-hover mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-semibold text-forest-800 mb-2">整体完成进度</h4>
              <p className="text-forest-600/70 text-sm">已完成 {taskStats.completed} / {taskStats.total} 项任务</p>
            </div>
            <div className="w-96">
              <Progress
                percent={completionRate}
                strokeColor={{
                  '0%': '#86b374',
                  '100%': '#2D5A27',
                }}
                size={[300, 16]}
              />
            </div>
          </div>
        </Card>
      </div>

      <div className="stagger-item">
        <Tabs defaultActiveKey="1" className="bg-cream-50 rounded-xl">
          <TabPane tab={<span className="font-medium"><Sprout size={16} className="inline mr-2" />营林抚育管护</span>} key="1">
            <Card className="border-none">
              <Row gutter={[16, 16]}>
                <Col xs={24} lg={10}>
                  <h4 className="text-lg font-semibold text-forest-800 mb-4">作业日历</h4>
                  <Card>
                    <Calendar
                      dateCellRender={dateCellRender}
                      fullscreen={false}
                      defaultValue={dayjs()}
                    />
                  </Card>
                </Col>
                <Col xs={24} lg={14}>
                  <div className="flex flex-wrap gap-4 mb-4">
                    <Form layout="inline">
                      <Form.Item name="taskType">
                        <Select placeholder="任务类型" allowClear style={{ width: 160 }}>
                          {Object.entries(taskTypeMap).map(([key, val]) => (
                            <Option key={key} value={key}>{val.label}</Option>
                          ))}
                        </Select>
                      </Form.Item>
                      <Form.Item name="status">
                        <Select placeholder="任务状态" allowClear style={{ width: 160 }}>
                          {Object.entries(statusMap).map(([key, val]) => (
                            <Option key={key} value={key}>{val.label}</Option>
                          ))}
                        </Select>
                      </Form.Item>
                      <Button type="primary">查询</Button>
                      <Button>重置</Button>
                    </Form>
                  </div>
                  <Table
                    columns={taskColumns}
                    dataSource={currentTasks}
                    rowKey="id"
                    scroll={{ x: 1400 }}
                    pagination={{
                      pageSize: 10,
                      showSizeChanger: true,
                      showTotal: (total) => `共 ${total} 项任务`,
                    }}
                  />
                </Col>
              </Row>
            </Card>
          </TabPane>

          <TabPane tab={<span className="font-medium"><FileText size={16} className="inline mr-2" />抚育作业记录</span>} key="2">
            <Card className="border-none">
              <Table
                columns={recordColumns}
                dataSource={currentTasks.filter(t => t.status === 'completed')}
                rowKey="id"
                scroll={{ x: 1200 }}
                pagination={{ pageSize: 10 }}
              />
            </Card>
          </TabPane>
        </Tabs>
      </div>

      <Modal
        title="任务详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={700}
      >
        {selectedTask && (
          <div className="space-y-6">
            <Descriptions title="任务基本信息" bordered column={2}>
              <Descriptions.Item label="任务名称">{selectedTask.taskName}</Descriptions.Item>
              <Descriptions.Item label="任务类型">
                <Tag color={taskTypeMap[selectedTask.taskType].color}>
                  {taskTypeMap[selectedTask.taskType].label}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="计划日期">{selectedTask.planDate}</Descriptions.Item>
              <Descriptions.Item label="执行人">{selectedTask.executor}</Descriptions.Item>
              <Descriptions.Item label="实际完成日期">{selectedTask.actualDate || '-'}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={statusMap[selectedTask.status].color}>
                  {statusMap[selectedTask.status].label}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <Card className="bg-sky-50 border-sky-200 text-center">
                  <p className="text-sm text-sky-600 mb-2">作业进度</p>
                  <Progress
                    percent={selectedTask.progress}
                    strokeColor="#4A90A4"
                    size="small"
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12}>
                <Card className="bg-earth-50 border-earth-200 text-center">
                  <p className="text-sm text-earth-600 mb-2">实际工时</p>
                  <p className="text-2xl font-bold font-serif text-earth-700">{selectedTask.workHours || 0} <span className="text-sm">h</span></p>
                </Card>
              </Col>
              <Col xs={24} sm={24}>
                <Card className="bg-gold-50 border-gold-200 text-center">
                  <p className="text-sm text-gold-600 mb-2">作业成本</p>
                  <p className="text-2xl font-bold font-serif text-gold-700">{selectedTask.cost?.toLocaleString() || 0} <span className="text-sm">元</span></p>
                </Card>
              </Col>
            </Row>

            {selectedTask.effectEvaluation && (
              <Card className="bg-forest-50 border-forest-200">
                <p className="text-sm text-forest-600 mb-2">效果评估</p>
                <p className="text-forest-800">{selectedTask.effectEvaluation}</p>
              </Card>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ManagementPage;
