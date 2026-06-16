import { useState } from 'react';
import { Tabs, Table, Tag, Button, Space, Card, Row, Col, Descriptions, Modal, Form, Input, Select, DatePicker, Statistic, Progress } from 'antd';
import { Wallet, PieChart as PieChartIcon, Eye, Plus, TrendingUp, DollarSign, Users, FileText, CheckCircle2, BarChart3 } from 'lucide-react';
import useAppStore from '../../store';
import PieChart from '../../components/charts/PieChart';
import BarChart from '../../components/charts/BarChart';
import LineChart from '../../components/charts/LineChart';
import type { RevenueDistribution } from '../../types';

const { TabPane } = Tabs;
const { Option } = Select;

const RevenuePage: React.FC = () => {
  const { projects, transactions, revenueDistributions, getDistributionsByTransactionId, getTransactionsByProjectId } = useAppStore();
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');
  const [selectedDistribution, setSelectedDistribution] = useState<RevenueDistribution | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  const currentTransactions = selectedProjectId ? getTransactionsByProjectId(selectedProjectId) : transactions;
  const currentDistributions = currentTransactions.flatMap(t => getDistributionsByTransactionId(t.id));

  const distributionColumns = [
    {
      title: '分配日期',
      dataIndex: 'distributeDate',
      key: 'distributeDate',
      width: 120,
    },
    {
      title: '分配对象',
      dataIndex: 'recipient',
      key: 'recipient',
      width: 160,
    },
    {
      title: '分配金额',
      dataIndex: 'amount',
      key: 'amount',
      render: (val: number) => <span className="font-mono font-semibold text-gold-700">{val.toLocaleString()} 元</span>,
    },
    {
      title: '分配比例',
      dataIndex: 'ratio',
      key: 'ratio',
      render: (val: number) => <span className="font-mono font-semibold text-forest-700">{val}%</span>,
    },
    {
      title: '支付方式',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      width: 120,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: RevenueDistribution['status']) => {
        const map = {
          paid: { color: 'success', text: '已到账' },
          pending: { color: 'warning', text: '待支付' },
          overdue: { color: 'error', text: '已逾期' },
        };
        return <Tag color={map[status].color}>{map[status].text}</Tag>;
      },
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_: unknown, record: RevenueDistribution) => (
        <Space size="small">
          <Button type="link" size="small" icon={<Eye size={14} />} onClick={() => {
            setSelectedDistribution(record);
            setDetailModalVisible(true);
          }}>
            详情
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
      title: '年度',
      dataIndex: 'year',
      key: 'year',
      width: 100,
    },
    {
      title: '碳汇交易量',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (val: number) => `${val.toLocaleString()} tCO₂e`,
    },
    {
      title: '交易总收入',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (val: number) => `${val.toLocaleString()} 元`,
    },
    {
      title: '分配总金额',
      dataIndex: 'distributedAmount',
      key: 'distributedAmount',
      render: (val: number) => `${val.toLocaleString()} 元`,
    },
    {
      title: '报告状态',
      dataIndex: 'status',
      key: 'status',
      render: () => <Tag color="success">已完成</Tag>,
    },
    {
      title: '操作',
      key: 'action',
      render: () => (
        <Space>
          <Button type="link" size="small" icon={<FileText size={14} />}>查看报告</Button>
          <Button type="link" size="small" icon={<FileText size={14} />}>导出</Button>
        </Space>
      ),
    },
  ];

  const recipientStats = [
    { name: '林场运营方', value: 50, amount: 1250000, color: '#3d7a2d' },
    { name: '当地政府', value: 20, amount: 500000, color: '#4A90A4' },
    { name: '原住民社区', value: 20, amount: 500000, color: '#D4A84B' },
    { name: '技术服务方', value: 10, amount: 250000, color: '#8B6914' },
  ];

  const revenueTrendData = {
    months: ['2021', '2022', '2023', '2024'],
    revenue: [800000, 1500000, 2000000, 2500000],
  };

  const projectRevenueData = projects.slice(0, 3).map((p, idx) => {
    const trans = getTransactionsByProjectId(p.id);
    const total = trans.reduce((sum, t) => sum + t.totalAmount, 0);
    return {
      name: p.name.slice(0, 8),
      revenue: total,
      color: ['#3d7a2d', '#4A90A4', '#D4A84B'][idx],
    };
  });

  const totalRevenue = currentDistributions.reduce((sum, d) => sum + d.amount, 0);
  const paidAmount = currentDistributions.filter(d => d.status === 'paid').reduce((sum, d) => sum + d.amount, 0);
  const pendingAmount = currentDistributions.filter(d => d.status === 'pending').reduce((sum, d) => sum + d.amount, 0);
  const paymentRate = totalRevenue > 0 ? Math.round((paidAmount / totalRevenue) * 100) : 0;

  const yearlyReports = [
    {
      id: '1',
      projectName: '大兴安岭林业碳汇项目',
      year: '2024',
      quantity: 8500,
      totalAmount: 425000,
      distributedAmount: 425000,
      status: 'approved',
    },
    {
      id: '2',
      projectName: '西双版纳热带雨林修复项目',
      year: '2024',
      quantity: 7200,
      totalAmount: 360000,
      distributedAmount: 360000,
      status: 'approved',
    },
    {
      id: '3',
      projectName: '张家界公益林保护项目',
      year: '2024',
      quantity: 4000,
      totalAmount: 200000,
      distributedAmount: 200000,
      status: 'approved',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="stagger-item">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold font-serif text-forest-800 mb-2">收益分配</h2>
            <p className="text-forest-600/70">收益分配台账和收益统计分析</p>
          </div>
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
              title="分配总金额"
              value={totalRevenue.toLocaleString()}
              suffix="元"
              valueStyle={{ color: '#3d7a2d' }}
              prefix={<Wallet size={20} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="card-hover">
            <Statistic
              title="已到账金额"
              value={paidAmount.toLocaleString()}
              suffix="元"
              valueStyle={{ color: '#5d964a' }}
              prefix={<CheckCircle2 size={20} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="card-hover">
            <Statistic
              title="待支付金额"
              value={pendingAmount.toLocaleString()}
              suffix="元"
              valueStyle={{ color: '#D4A84B' }}
              prefix={<DollarSign size={20} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="card-hover">
            <div className="h-full">
              <div className="text-sm text-forest-600 mb-2">支付完成率</div>
              <div className="flex items-center gap-3">
                <Progress
                  type="circle"
                  percent={paymentRate}
                  size={50}
                  strokeColor="#3d7a2d"
                />
                <div className="flex-1">
                  <div className="text-xs text-forest-500">分配笔数</div>
                  <div className="text-lg font-bold text-forest-800">{currentDistributions.length} 笔</div>
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="stagger-item">
        <Col xs={24} lg={8}>
          <PieChart
            title="收益分配比例"
            data={recipientStats}
            height={300}
          />
        </Col>
        <Col xs={24} lg={8}>
          <LineChart
            title="年度收益趋势"
            xData={revenueTrendData.months}
            seriesData={[{ name: '收益金额', data: revenueTrendData.revenue, color: '#3d7a2d' }]}
            height={300}
          />
        </Col>
        <Col xs={24} lg={8}>
          <BarChart
            title="各项目收益对比"
            xData={projectRevenueData.map(d => d.name)}
            seriesData={projectRevenueData.map((d, idx) => ({
              name: d.name,
              data: [d.revenue],
              color: d.color,
            }))}
            height={300}
          />
        </Col>
      </Row>

      <div className="stagger-item">
        <Card className="card-hover">
          <Tabs defaultActiveKey="1">
            <TabPane tab={<span className="flex items-center gap-2"><Wallet size={16} />收益分配台账</span>} key="1">
              <Table
                columns={distributionColumns}
                dataSource={currentDistributions}
                rowKey="id"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showTotal: (total) => `共 ${total} 条记录`,
                }}
                scroll={{ x: 1000 }}
              />
            </TabPane>
            <TabPane tab={<span className="flex items-center gap-2"><FileText size={16} />项目年度报告</span>} key="2">
              <Table
                columns={reportColumns}
                dataSource={yearlyReports}
                rowKey="id"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showTotal: (total) => `共 ${total} 条记录`,
                }}
              />
            </TabPane>
          </Tabs>
        </Card>
      </div>

      <Modal
        title="收益分配详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>,
        ]}
        width={600}
      >
        {selectedDistribution && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="分配编号">{selectedDistribution.id}</Descriptions.Item>
            <Descriptions.Item label="分配日期">{selectedDistribution.distributeDate}</Descriptions.Item>
            <Descriptions.Item label="分配对象">{selectedDistribution.recipient}</Descriptions.Item>
            <Descriptions.Item label="分配金额">
              <span className="text-gold-600 font-bold">{selectedDistribution.amount.toLocaleString()} 元</span>
            </Descriptions.Item>
            <Descriptions.Item label="分配比例">{selectedDistribution.ratio}%</Descriptions.Item>
            <Descriptions.Item label="支付方式">{selectedDistribution.paymentMethod}</Descriptions.Item>
            <Descriptions.Item label="支付状态">
              <Tag color={selectedDistribution.status === 'paid' ? 'success' : selectedDistribution.status === 'pending' ? 'warning' : 'error'}>
                {selectedDistribution.status === 'paid' ? '已到账' : selectedDistribution.status === 'pending' ? '待支付' : '已逾期'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="关联交易">{selectedDistribution.transactionId}</Descriptions.Item>
            <Descriptions.Item label="备注">{selectedDistribution.remark || '-'}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default RevenuePage;