import { useState, useMemo } from 'react';
import { Tabs, Table, Tag, Button, Space, Card, Row, Col, Descriptions, Modal, Form, Input, Select, DatePicker, Statistic, Progress, Empty } from 'antd';
import { Wallet, PieChart as PieChartIcon, Eye, Plus, TrendingUp, DollarSign, Users, FileText, CheckCircle2, BarChart3 } from 'lucide-react';
import useAppStore from '../../store';
import PieChart from '../../components/charts/PieChart';
import BarChart from '../../components/charts/BarChart';
import LineChart from '../../components/charts/LineChart';
import type { RevenueDistribution, AnnualReport } from '../../types';

const { TabPane } = Tabs;
const { Option } = Select;

const RECIPIENT_COLORS: Record<string, string> = {
  '林场运营方': '#3d7a2d',
  '当地政府': '#4A90A4',
  '原住民社区': '#D4A84B',
  '技术服务方': '#8B6914',
};

const RevenuePage: React.FC = () => {
  const {
    projects,
    transactions,
    getDistributionsByTransactionId,
    getTransactionsByProjectId,
    getAnnualReportsByProjectId,
  } = useAppStore();

  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');
  const [selectedDistribution, setSelectedDistribution] = useState<RevenueDistribution | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  const currentTransactions = useMemo(() => {
    return selectedProjectId ? getTransactionsByProjectId(selectedProjectId) : [];
  }, [selectedProjectId, getTransactionsByProjectId]);

  const currentDistributions = useMemo(() => {
    return currentTransactions.flatMap(t => getDistributionsByTransactionId(t.id));
  }, [currentTransactions, getDistributionsByTransactionId]);

  const currentReports = useMemo(() => {
    return selectedProjectId ? getAnnualReportsByProjectId(selectedProjectId) : [];
  }, [selectedProjectId, getAnnualReportsByProjectId]);

  const currentProject = useMemo(() => {
    return projects.find(p => p.id === selectedProjectId);
  }, [selectedProjectId, projects]);

  const recipientStats = useMemo(() => {
    const map = new Map<string, number>();
    currentDistributions.forEach(d => {
      const current = map.get(d.recipient) || 0;
      map.set(d.recipient, current + d.amount);
    });
    const total = currentDistributions.reduce((sum, d) => sum + d.amount, 0);
    return Array.from(map.entries()).map(([name, amount]) => ({
      name,
      value: total > 0 ? Number(((amount / total) * 100).toFixed(1)) : 0,
      amount,
      color: RECIPIENT_COLORS[name] || '#6b7280',
    }));
  }, [currentDistributions]);

  const revenueTrendData = useMemo(() => {
    const yearMap = new Map<string, number>();
    currentTransactions.forEach(t => {
      const year = t.transactionDate.substring(0, 4);
      const current = yearMap.get(year) || 0;
      yearMap.set(year, current + t.totalAmount);
    });
    const sortedYears = Array.from(yearMap.keys()).sort();
    return {
      years: sortedYears,
      revenue: sortedYears.map(y => yearMap.get(y) || 0),
    };
  }, [currentTransactions]);

  const projectRevenueData = useMemo(() => {
    const colors = ['#3d7a2d', '#4A90A4', '#D4A84B', '#8B6914', '#6b7280'];
    return projects.map((p, idx) => {
      const trans = getTransactionsByProjectId(p.id);
      const total = trans.reduce((sum, t) => sum + t.totalAmount, 0);
      return {
        name: p.name.slice(0, 8),
        revenue: total,
        color: colors[idx % colors.length],
      };
    });
  }, [projects, getTransactionsByProjectId]);

  const totalRevenue = useMemo(() => {
    return currentDistributions.reduce((sum, d) => sum + d.amount, 0);
  }, [currentDistributions]);

  const paidAmount = useMemo(() => {
    return currentDistributions.filter(d => d.status === 'paid').reduce((sum, d) => sum + d.amount, 0);
  }, [currentDistributions]);

  const pendingAmount = useMemo(() => {
    return currentDistributions.filter(d => d.status === 'pending').reduce((sum, d) => sum + d.amount, 0);
  }, [currentDistributions]);

  const paymentRate = useMemo(() => {
    return totalRevenue > 0 ? Math.round((paidAmount / totalRevenue) * 100) : 0;
  }, [totalRevenue, paidAmount]);

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
      title: '年度',
      dataIndex: 'year',
      key: 'year',
      width: 120,
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
      title: '报告状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: AnnualReport['status']) => {
        const map = {
          draft: { color: 'default', text: '草稿' },
          submitted: { color: 'processing', text: '已提交' },
          approved: { color: 'success', text: '已通过' },
          rejected: { color: 'error', text: '已驳回' },
        };
        return <Tag color={map[status].color}>{map[status].text}</Tag>;
      },
    },
    {
      title: '摘要',
      dataIndex: 'summary',
      key: 'summary',
      ellipsis: true,
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: () => (
        <Space>
          <Button type="link" size="small" icon={<FileText size={14} />}>查看报告</Button>
          <Button type="link" size="small" icon={<FileText size={14} />}>导出</Button>
        </Space>
      ),
    },
  ];

  const renderChartEmpty = (description: string) => (
    <Card
      title={<h3 className="text-lg font-semibold font-serif text-forest-800 m-0">{description}</h3>}
      className="stagger-item card-hover"
    >
      <div className="flex items-center justify-center" style={{ height: 300 }}>
        <Empty description="暂无数据" />
      </div>
    </Card>
  );

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
          {recipientStats.length > 0 ? (
            <PieChart
              title="收益分配比例"
              data={recipientStats}
              height={300}
            />
          ) : (
            renderChartEmpty('收益分配比例')
          )}
        </Col>
        <Col xs={24} lg={8}>
          {revenueTrendData.years.length > 0 ? (
            <LineChart
              title="年度收益趋势"
              xData={revenueTrendData.years}
              seriesData={[{ name: '收益金额', data: revenueTrendData.revenue, color: '#3d7a2d' }]}
              height={300}
            />
          ) : (
            renderChartEmpty('年度收益趋势')
          )}
        </Col>
        <Col xs={24} lg={8}>
          {projectRevenueData.some(d => d.revenue > 0) ? (
            <BarChart
              title="各项目收益对比"
              xData={projectRevenueData.map(d => d.name)}
              seriesData={projectRevenueData.map((d) => ({
                name: d.name,
                data: [d.revenue],
                color: d.color,
              }))}
              height={300}
            />
          ) : (
            renderChartEmpty('各项目收益对比')
          )}
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
                locale={{
                  emptyText: <Empty description="暂无分配记录" />,
                }}
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
                dataSource={currentReports}
                rowKey="id"
                locale={{
                  emptyText: <Empty description="暂无年度报告" />,
                }}
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
