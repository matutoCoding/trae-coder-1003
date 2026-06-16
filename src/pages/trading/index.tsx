import { useState } from 'react';
import { Tabs, Table, Tag, Button, Space, Card, Row, Col, Descriptions, Modal, Form, Input, Select, DatePicker, Statistic, Timeline, Progress } from 'antd';
import { TrendingUp, Award, FileCheck, Eye, Plus, Edit, DollarSign, FileText } from 'lucide-react';
import useAppStore from '../../store';
import BarChart from '../../components/charts/BarChart';
import type { Verification, CarbonIssuance, Transaction } from '../../types';

const { TabPane } = Tabs;
const { Option } = Select;

const TradingPage: React.FC = () => {
  const { projects, verifications, carbonIssuances, transactions, getVerificationsByProjectId, getIssuancesByProjectId, getTransactionsByProjectId } = useAppStore();
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('1');

  const currentVerifications = selectedProjectId ? getVerificationsByProjectId(selectedProjectId) : verifications;
  const currentIssuances = selectedProjectId ? getIssuancesByProjectId(selectedProjectId) : carbonIssuances;
  const currentTransactions = selectedProjectId ? getTransactionsByProjectId(selectedProjectId) : transactions;

  const verificationColumns = [
    {
      title: '核查机构',
      dataIndex: 'verificationAgency',
      key: 'verificationAgency',
      width: 200,
    },
    {
      title: '核查日期',
      dataIndex: 'verificationDate',
      key: 'verificationDate',
      width: 120,
    },
    {
      title: '核查人员',
      dataIndex: 'verifier',
      key: 'verifier',
      width: 100,
    },
    {
      title: '核查碳汇量',
      dataIndex: 'verifiedAmount',
      key: 'verifiedAmount',
      render: (val: number) => <span className="font-mono font-semibold text-forest-700">{val.toLocaleString()} tCO₂e</span>,
    },
    {
      title: '核查结论',
      dataIndex: 'conclusion',
      key: 'conclusion',
      render: (conclusion: Verification['conclusion']) => {
        const map = {
          pass: { color: 'success', text: '通过' },
          fail: { color: 'error', text: '不通过' },
          pending: { color: 'warning', text: '待核查' },
        };
        return <Tag color={map[conclusion].color}>{map[conclusion].text}</Tag>;
      },
    },
    {
      title: '报告编号',
      dataIndex: 'reportNo',
      key: 'reportNo',
      width: 160,
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_: unknown, record: Verification) => (
        <Space size="small">
          <Button type="link" size="small" icon={<Eye size={14} />}>详情</Button>
          <Button type="link" size="small" icon={<FileText size={14} />}>报告</Button>
        </Space>
      ),
    },
  ];

  const issuanceColumns = [
    {
      title: '签发日期',
      dataIndex: 'issuanceDate',
      key: 'issuanceDate',
      width: 120,
    },
    {
      title: '签发量',
      dataIndex: 'issuedAmount',
      key: 'issuedAmount',
      render: (val: number) => <span className="font-mono font-semibold text-gold-700">{val.toLocaleString()} tCO₂e</span>,
    },
    {
      title: '证书编号',
      dataIndex: 'certificateNo',
      key: 'certificateNo',
      width: 180,
    },
    {
      title: '签发机构',
      dataIndex: 'issuingAuthority',
      key: 'issuingAuthority',
      width: 220,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: CarbonIssuance['status']) => {
        const map = {
          issued: { color: 'success', text: '已签发' },
          pending: { color: 'warning', text: '待签发' },
          revoked: { color: 'error', text: '已撤销' },
        };
        return <Tag color={map[status].color}>{map[status].text}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: () => (
        <Space size="small">
          <Button type="link" size="small" icon={<Eye size={14} />}>详情</Button>
          <Button type="link" size="small" icon={<Award size={14} />}>证书</Button>
        </Space>
      ),
    },
  ];

  const transactionColumns = [
    {
      title: '交易日期',
      dataIndex: 'transactionDate',
      key: 'transactionDate',
      width: 120,
    },
    {
      title: '买方',
      dataIndex: 'buyer',
      key: 'buyer',
      width: 180,
    },
    {
      title: '卖方',
      dataIndex: 'seller',
      key: 'seller',
      width: 180,
    },
    {
      title: '交易量',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (val: number) => <span className="font-mono font-semibold text-forest-700">{val.toLocaleString()} tCO₂e</span>,
    },
    {
      title: '单价',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      render: (val: number) => <span className="font-mono font-semibold text-earth-700">{val} 元/t</span>,
    },
    {
      title: '交易总额',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (val: number) => <span className="font-mono font-semibold text-gold-700">{val.toLocaleString()} 元</span>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: Transaction['status']) => {
        const map = {
          completed: { color: 'success', text: '已完成' },
          pending: { color: 'warning', text: '待结算' },
          cancelled: { color: 'default', text: '已取消' },
        };
        return <Tag color={map[status].color}>{map[status].text}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_: unknown, record: Transaction) => (
        <Space size="small">
          <Button type="link" size="small" icon={<Eye size={14} />} onClick={() => {
            setSelectedTransaction(record);
            setDetailModalVisible(true);
          }}>详情</Button>
          <Button type="link" size="small" icon={<FileText size={14} />}>合同</Button>
        </Space>
      ),
    },
  ];

  const priceTrendData = {
    months: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
    prices: [42, 45, 48, 52, 55, 58, 62, 65, 68, 70, 72, 75],
  };

  return (
    <div className="space-y-6">
      <div className="stagger-item">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold font-serif text-forest-800 mb-2">交易管理</h2>
            <p className="text-forest-600/70">第三方核查、碳汇签发登记和碳排放权交易</p>
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
              title="核查次数"
              value={currentVerifications.length}
              suffix="次"
              valueStyle={{ color: '#3d7a2d' }}
              prefix={<FileCheck size={20} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="card-hover">
            <Statistic
              title="已签发碳汇"
              value={currentIssuances.reduce((sum, i) => sum + i.issuedAmount, 0).toLocaleString()}
              suffix="tCO₂e"
              valueStyle={{ color: '#D4A84B' }}
              prefix={<Award size={20} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="card-hover">
            <Statistic
              title="交易总额"
              value={currentTransactions.reduce((sum, t) => sum + t.totalAmount, 0).toLocaleString()}
              suffix="元"
              valueStyle={{ color: '#8B6914' }}
              prefix={<DollarSign size={20} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="card-hover">
            <Statistic
              title="累计交易量"
              value={currentTransactions.reduce((sum, t) => sum + t.quantity, 0).toLocaleString()}
              suffix="tCO₂e"
              valueStyle={{ color: '#4A90A4' }}
              prefix={<TrendingUp size={20} />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="stagger-item">
        <Col xs={24} lg={24}>
          <BarChart
            title="碳汇交易价格走势（元/tCO₂e）"
            xData={priceTrendData.months}
            seriesData={[
              {
                name: '交易价格',
                data: priceTrendData.prices,
                color: '#D4A84B',
              },
            ]}
            yAxisName="元/tCO₂e"
          />
        </Col>
      </Row>

      <div className="stagger-item">
        <Tabs activeKey={activeTab} onChange={setActiveTab} className="bg-cream-50 rounded-xl">
          <TabPane tab={<span className="font-medium"><FileCheck size={16} className="inline mr-2" />第三方核查</span>} key="1">
            <Card className="border-none">
              <div className="flex justify-between mb-4">
                <h4 className="text-lg font-semibold text-forest-800">核查流程</h4>
                <Button type="primary" icon={<Plus size={14} />}>发起核查</Button>
              </div>
              <Timeline
                mode="left"
                items={[
                  { color: 'green', children: '核查任务分配', label: '2024-03-01' },
                  { color: 'green', children: '现场核查', label: '2024-03-10' },
                  { color: 'green', children: '数据核实', label: '2024-03-15' },
                  { color: 'green', children: '出具核查报告', label: '2024-03-20' },
                  { color: 'blue', children: '核查通过，等待签发', label: '2024-03-25' },
                ]}
                className="mb-6"
              />
              <Table
                columns={verificationColumns}
                dataSource={currentVerifications}
                rowKey="id"
                scroll={{ x: 1200 }}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                }}
              />
            </Card>
          </TabPane>

          <TabPane tab={<span className="font-medium"><Award size={16} className="inline mr-2" />碳汇签发登记</span>} key="2">
            <Card className="border-none">
              <div className="flex justify-between mb-4">
                <h4 className="text-lg font-semibold text-forest-800">签发流程</h4>
              </div>
              <Timeline
                mode="left"
                items={[
                  { color: 'green', children: '提交签发申请', label: '2024-04-01' },
                  { color: 'green', children: '材料审核', label: '2024-04-05' },
                  { color: 'green', children: '专家评审', label: '2024-04-10' },
                  { color: 'green', children: '碳汇量签发', label: '2024-05-01' },
                  { color: 'blue', children: '证书生成', label: '2024-05-01' },
                ]}
                className="mb-6"
              />
              <Table
                columns={issuanceColumns}
                dataSource={currentIssuances}
                rowKey="id"
                scroll={{ x: 1000 }}
                pagination={{ pageSize: 10 }}
              />
            </Card>
          </TabPane>

          <TabPane tab={<span className="font-medium"><TrendingUp size={16} className="inline mr-2" />碳排放权交易</span>} key="3">
            <Card className="border-none">
              <div className="flex justify-between mb-4">
                <h4 className="text-lg font-semibold text-forest-800">交易流程</h4>
                <Button type="primary" icon={<Plus size={14} />}>发起交易</Button>
              </div>
              <Timeline
                mode="left"
                items={[
                  { color: 'green', children: '交易意向发布', label: '2024-06-01' },
                  { color: 'green', children: '买方询价', label: '2024-06-05' },
                  { color: 'green', children: '价格磋商', label: '2024-06-10' },
                  { color: 'green', children: '签订合同', label: '2024-06-15' },
                  { color: 'green', children: '资金结算', label: '2024-06-20' },
                  { color: 'blue', children: '交易完成', label: '2024-06-20' },
                ]}
                className="mb-6"
              />
              <Table
                columns={transactionColumns}
                dataSource={currentTransactions}
                rowKey="id"
                scroll={{ x: 1200 }}
                pagination={{ pageSize: 10 }}
              />
            </Card>
          </TabPane>
        </Tabs>
      </div>

      <Modal
        title="交易详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={700}
      >
        {selectedTransaction && (
          <div className="space-y-6">
            <Descriptions title="交易基本信息" bordered column={2}>
              <Descriptions.Item label="交易编号">{selectedTransaction.id}</Descriptions.Item>
              <Descriptions.Item label="交易日期">{selectedTransaction.transactionDate}</Descriptions.Item>
              <Descriptions.Item label="买方">{selectedTransaction.buyer}</Descriptions.Item>
              <Descriptions.Item label="卖方">{selectedTransaction.seller}</Descriptions.Item>
              <Descriptions.Item label="合同编号">{selectedTransaction.contractNo}</Descriptions.Item>
              <Descriptions.Item label="交易状态">
                <Tag color={selectedTransaction.status === 'completed' ? 'success' : 'warning'}>
                  {selectedTransaction.status === 'completed' ? '已完成' : '待结算'}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            <Row gutter={[16, 16]}>
              <Col xs={24} sm={8}>
                <Card className="bg-forest-50 border-forest-200 text-center">
                  <p className="text-sm text-forest-600 mb-2">交易量</p>
                  <p className="text-2xl font-bold font-serif text-forest-700">{selectedTransaction.quantity.toLocaleString()} <span className="text-sm">tCO₂e</span></p>
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card className="bg-earth-50 border-earth-200 text-center">
                  <p className="text-sm text-earth-600 mb-2">单价</p>
                  <p className="text-2xl font-bold font-serif text-earth-700">{selectedTransaction.unitPrice} <span className="text-sm">元/t</span></p>
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card className="bg-gold-50 border-gold-200 text-center">
                  <p className="text-sm text-gold-600 mb-2">交易总额</p>
                  <p className="text-2xl font-bold font-serif text-gold-700">{selectedTransaction.totalAmount.toLocaleString()} <span className="text-sm">元</span></p>
                </Card>
              </Col>
            </Row>

            <div>
              <h4 className="text-lg font-semibold text-forest-800 mb-3">交易进度</h4>
              <Progress percent={100} status="success" strokeColor="#3d7a2d" />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TradingPage;
