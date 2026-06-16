import { useState } from 'react';
import { Tabs, Table, Tag, Button, Space, Card, Row, Col, Descriptions, Modal, Form, Input, InputNumber, Select, DatePicker, message, Empty, Timeline, Statistic, Progress, Popconfirm } from 'antd';
import { TrendingUp, Award, FileCheck, Eye, Plus, Edit, DollarSign, FileText, Trash2, File } from 'lucide-react';
import dayjs from 'dayjs';
import useAppStore from '../../store';
import BarChart from '../../components/charts/BarChart';
import type { Verification, CarbonIssuance, Transaction } from '../../types';

const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;

const TradingPage: React.FC = () => {
  const {
    projects,
    verifications,
    carbonIssuances,
    transactions,
    getVerificationsByProjectId,
    getIssuancesByProjectId,
    getTransactionsByProjectId,
    addVerification,
    updateVerification,
    deleteVerification,
    addCarbonIssuance,
    updateCarbonIssuance,
    addTransaction,
    updateTransaction,
  } = useAppStore();

  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');
  const [activeTab, setActiveTab] = useState('1');

  const [verificationModalVisible, setVerificationModalVisible] = useState(false);
  const [editingVerification, setEditingVerification] = useState<Verification | null>(null);
  const [verificationDetailVisible, setVerificationDetailVisible] = useState(false);
  const [selectedVerification, setSelectedVerification] = useState<Verification | null>(null);
  const [reportModalVisible, setReportModalVisible] = useState(false);

  const [issuanceModalVisible, setIssuanceModalVisible] = useState(false);
  const [editingIssuance, setEditingIssuance] = useState<CarbonIssuance | null>(null);
  const [issuanceDetailVisible, setIssuanceDetailVisible] = useState(false);
  const [selectedIssuance, setSelectedIssuance] = useState<CarbonIssuance | null>(null);
  const [certificateModalVisible, setCertificateModalVisible] = useState(false);

  const [transactionModalVisible, setTransactionModalVisible] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [transactionDetailVisible, setTransactionDetailVisible] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [contractModalVisible, setContractModalVisible] = useState(false);

  const [verificationForm] = Form.useForm();
  const [issuanceForm] = Form.useForm();
  const [transactionForm] = Form.useForm();

  const currentVerifications = selectedProjectId ? getVerificationsByProjectId(selectedProjectId) : verifications;
  const currentIssuances = selectedProjectId ? getIssuancesByProjectId(selectedProjectId) : carbonIssuances;
  const currentTransactions = selectedProjectId ? getTransactionsByProjectId(selectedProjectId) : transactions;

  const getVerificationTimelineItems = () => {
    if (currentVerifications.length === 0) {
      return [
        { color: 'gray', children: '暂无核查记录', label: '' },
      ];
    }
    const items = [];
    const latest = currentVerifications.reduce((prev, curr) => 
      dayjs(curr.verificationDate).isAfter(dayjs(prev.verificationDate)) ? curr : prev
    );
    
    items.push({ color: 'green', children: '核查任务分配', label: dayjs(latest.verificationDate).subtract(15, 'day').format('YYYY-MM-DD') });
    items.push({ color: 'green', children: '现场核查', label: dayjs(latest.verificationDate).subtract(10, 'day').format('YYYY-MM-DD') });
    items.push({ color: 'green', children: '数据核实', label: dayjs(latest.verificationDate).subtract(5, 'day').format('YYYY-MM-DD') });
    items.push({ color: 'green', children: '出具核查报告', label: latest.verificationDate });
    
    if (latest.conclusion === 'pass') {
      items.push({ color: 'blue', children: '核查通过，等待签发', label: dayjs(latest.verificationDate).add(5, 'day').format('YYYY-MM-DD') });
    } else if (latest.conclusion === 'fail') {
      items.push({ color: 'red', children: '核查未通过', label: dayjs(latest.verificationDate).add(3, 'day').format('YYYY-MM-DD') });
    } else {
      items.push({ color: 'gray', children: '待核查', label: '' });
    }
    
    return items;
  };

  const getIssuanceTimelineItems = () => {
    if (currentIssuances.length === 0) {
      return [
        { color: 'gray', children: '暂无签发记录', label: '' },
      ];
    }
    const items = [];
    const latest = currentIssuances.reduce((prev, curr) => 
      dayjs(curr.issuanceDate).isAfter(dayjs(prev.issuanceDate)) ? curr : prev
    );
    
    items.push({ color: 'green', children: '提交签发申请', label: dayjs(latest.issuanceDate).subtract(20, 'day').format('YYYY-MM-DD') });
    items.push({ color: 'green', children: '材料审核', label: dayjs(latest.issuanceDate).subtract(15, 'day').format('YYYY-MM-DD') });
    items.push({ color: 'green', children: '专家评审', label: dayjs(latest.issuanceDate).subtract(10, 'day').format('YYYY-MM-DD') });
    items.push({ color: 'green', children: '碳汇量签发', label: latest.issuanceDate });
    items.push({ color: 'blue', children: '证书生成', label: latest.issuanceDate });
    
    return items;
  };

  const getTransactionTimelineItems = () => {
    if (currentTransactions.length === 0) {
      return [
        { color: 'gray', children: '暂无交易记录', label: '' },
      ];
    }
    const items = [];
    const latest = currentTransactions.reduce((prev, curr) => 
      dayjs(curr.transactionDate).isAfter(dayjs(prev.transactionDate)) ? curr : prev
    );
    
    items.push({ color: 'green', children: '交易意向发布', label: dayjs(latest.transactionDate).subtract(15, 'day').format('YYYY-MM-DD') });
    items.push({ color: 'green', children: '买方询价', label: dayjs(latest.transactionDate).subtract(12, 'day').format('YYYY-MM-DD') });
    items.push({ color: 'green', children: '价格磋商', label: dayjs(latest.transactionDate).subtract(8, 'day').format('YYYY-MM-DD') });
    items.push({ color: 'green', children: '签订合同', label: dayjs(latest.transactionDate).subtract(3, 'day').format('YYYY-MM-DD') });
    
    if (latest.status === 'completed') {
      items.push({ color: 'green', children: '资金结算', label: latest.transactionDate });
      items.push({ color: 'blue', children: '交易完成', label: latest.transactionDate });
    } else if (latest.status === 'pending') {
      items.push({ color: 'orange', children: '待结算', label: '' });
    } else {
      items.push({ color: 'gray', children: '交易已取消', label: '' });
    }
    
    return items;
  };

  const handleAddVerification = () => {
    setEditingVerification(null);
    verificationForm.resetFields();
    setVerificationModalVisible(true);
  };

  const handleEditVerification = (record: Verification) => {
    setEditingVerification(record);
    verificationForm.setFieldsValue({
      ...record,
      verificationDate: dayjs(record.verificationDate),
    });
    setVerificationModalVisible(true);
  };

  const handleVerificationDetail = (record: Verification) => {
    setSelectedVerification(record);
    setVerificationDetailVisible(true);
  };

  const handleDeleteVerification = (id: string) => {
    deleteVerification(id);
    message.success('删除成功');
  };

  const handleVerificationSubmit = () => {
    verificationForm.validateFields().then((values) => {
      const data = {
        ...values,
        projectId: selectedProjectId,
        verificationDate: values.verificationDate.format('YYYY-MM-DD'),
      };
      if (editingVerification) {
        updateVerification(editingVerification.id, data);
        message.success('更新成功');
      } else {
        addVerification(data);
        message.success('新增成功');
      }
      setVerificationModalVisible(false);
      verificationForm.resetFields();
    });
  };

  const handleAddIssuance = () => {
    setEditingIssuance(null);
    issuanceForm.resetFields();
    setIssuanceModalVisible(true);
  };

  const handleEditIssuance = (record: CarbonIssuance) => {
    setEditingIssuance(record);
    issuanceForm.setFieldsValue({
      ...record,
      issuanceDate: dayjs(record.issuanceDate),
      validFrom: record.validFrom ? dayjs(record.validFrom) : undefined,
      validTo: record.validTo ? dayjs(record.validTo) : undefined,
    });
    setIssuanceModalVisible(true);
  };

  const handleIssuanceDetail = (record: CarbonIssuance) => {
    setSelectedIssuance(record);
    setIssuanceDetailVisible(true);
  };

  const handleIssuanceSubmit = () => {
    issuanceForm.validateFields().then((values) => {
      const data = {
        ...values,
        projectId: selectedProjectId,
        issuanceDate: values.issuanceDate.format('YYYY-MM-DD'),
        validFrom: values.validFrom ? values.validFrom.format('YYYY-MM-DD') : undefined,
        validTo: values.validTo ? values.validTo.format('YYYY-MM-DD') : undefined,
      };
      if (editingIssuance) {
        updateCarbonIssuance(editingIssuance.id, data);
        message.success('更新成功');
      } else {
        addCarbonIssuance(data);
        message.success('新增成功');
      }
      setIssuanceModalVisible(false);
      issuanceForm.resetFields();
    });
  };

  const handleAddTransaction = () => {
    setEditingTransaction(null);
    transactionForm.resetFields();
    setTransactionModalVisible(true);
  };

  const handleEditTransaction = (record: Transaction) => {
    setEditingTransaction(record);
    transactionForm.setFieldsValue({
      ...record,
      transactionDate: dayjs(record.transactionDate),
    });
    setTransactionModalVisible(true);
  };

  const handleTransactionDetail = (record: Transaction) => {
    setSelectedTransaction(record);
    setTransactionDetailVisible(true);
  };

  const handleTransactionSubmit = () => {
    transactionForm.validateFields().then((values) => {
      const totalAmount = values.quantity * values.unitPrice;
      const data = {
        ...values,
        projectId: selectedProjectId,
        transactionDate: values.transactionDate.format('YYYY-MM-DD'),
        totalAmount,
      };
      if (editingTransaction) {
        updateTransaction(editingTransaction.id, data);
        message.success('更新成功');
      } else {
        addTransaction(data);
        message.success('新增成功');
      }
      setTransactionModalVisible(false);
      transactionForm.resetFields();
    });
  };

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
      width: 240,
      fixed: 'right' as const,
      render: (_: unknown, record: Verification) => (
        <Space size="small">
          <Button type="link" size="small" icon={<Eye size={14} />} onClick={() => handleVerificationDetail(record)}>详情</Button>
          <Button type="link" size="small" icon={<FileText size={14} />} onClick={() => {
            setSelectedVerification(record);
            setReportModalVisible(true);
          }}>报告</Button>
          <Button type="link" size="small" icon={<Edit size={14} />} onClick={() => handleEditVerification(record)}>编辑</Button>
          <Popconfirm title="确定要删除这条记录吗？" onConfirm={() => handleDeleteVerification(record.id)} okText="确定" cancelText="取消">
            <Button type="link" size="small" danger icon={<Trash2 size={14} />}>删除</Button>
          </Popconfirm>
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
      title: '有效期至',
      dataIndex: 'validTo',
      key: 'validTo',
      width: 120,
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
      width: 200,
      fixed: 'right' as const,
      render: (_: unknown, record: CarbonIssuance) => (
        <Space size="small">
          <Button type="link" size="small" icon={<Eye size={14} />} onClick={() => handleIssuanceDetail(record)}>详情</Button>
          <Button type="link" size="small" icon={<Award size={14} />} onClick={() => {
            setSelectedIssuance(record);
            setCertificateModalVisible(true);
          }}>证书</Button>
          <Button type="link" size="small" icon={<Edit size={14} />} onClick={() => handleEditIssuance(record)}>编辑</Button>
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
      width: 200,
      fixed: 'right' as const,
      render: (_: unknown, record: Transaction) => (
        <Space size="small">
          <Button type="link" size="small" icon={<Eye size={14} />} onClick={() => handleTransactionDetail(record)}>详情</Button>
          <Button type="link" size="small" icon={<FileText size={14} />} onClick={() => {
            setSelectedTransaction(record);
            setContractModalVisible(true);
          }}>合同</Button>
          <Button type="link" size="small" icon={<Edit size={14} />} onClick={() => handleEditTransaction(record)}>编辑</Button>
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
                <Button type="primary" icon={<Plus size={14} />} onClick={handleAddVerification}>新增核查</Button>
              </div>
              <Timeline
                mode="left"
                items={getVerificationTimelineItems()}
                className="mb-6"
              />
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-semibold text-forest-800">核查记录</h4>
              </div>
              {currentVerifications.length === 0 ? (
                <Empty description="暂无核查记录" className="py-12" />
              ) : (
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
              )}
            </Card>
          </TabPane>

          <TabPane tab={<span className="font-medium"><Award size={16} className="inline mr-2" />碳汇签发登记</span>} key="2">
            <Card className="border-none">
              <div className="flex justify-between mb-4">
                <h4 className="text-lg font-semibold text-forest-800">签发流程</h4>
                <Button type="primary" icon={<Plus size={14} />} onClick={handleAddIssuance}>新增签发</Button>
              </div>
              <Timeline
                mode="left"
                items={getIssuanceTimelineItems()}
                className="mb-6"
              />
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-semibold text-forest-800">签发记录</h4>
              </div>
              {currentIssuances.length === 0 ? (
                <Empty description="暂无签发记录" className="py-12" />
              ) : (
                <Table
                  columns={issuanceColumns}
                  dataSource={currentIssuances}
                  rowKey="id"
                  scroll={{ x: 1000 }}
                  pagination={{ pageSize: 10 }}
                />
              )}
            </Card>
          </TabPane>

          <TabPane tab={<span className="font-medium"><TrendingUp size={16} className="inline mr-2" />碳排放权交易</span>} key="3">
            <Card className="border-none">
              <div className="flex justify-between mb-4">
                <h4 className="text-lg font-semibold text-forest-800">交易流程</h4>
                <Button type="primary" icon={<Plus size={14} />} onClick={handleAddTransaction}>发起交易</Button>
              </div>
              <Timeline
                mode="left"
                items={getTransactionTimelineItems()}
                className="mb-6"
              />
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-semibold text-forest-800">交易记录</h4>
              </div>
              {currentTransactions.length === 0 ? (
                <Empty description="暂无交易记录" className="py-12" />
              ) : (
                <Table
                  columns={transactionColumns}
                  dataSource={currentTransactions}
                  rowKey="id"
                  scroll={{ x: 1200 }}
                  pagination={{ pageSize: 10 }}
                />
              )}
            </Card>
          </TabPane>
        </Tabs>
      </div>

      <Modal
        title={editingVerification ? '编辑核查记录' : '新增核查记录'}
        open={verificationModalVisible}
        onCancel={() => setVerificationModalVisible(false)}
        onOk={handleVerificationSubmit}
        okText="确定"
        cancelText="取消"
        width={700}
      >
        <Form form={verificationForm} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="verificationAgency"
                label="核查机构"
                rules={[{ required: true, message: '请输入核查机构' }]}
              >
                <Input placeholder="请输入核查机构" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="verifier"
                label="核查人员"
                rules={[{ required: true, message: '请输入核查人员' }]}
              >
                <Input placeholder="请输入核查人员" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="verificationDate"
                label="核查日期"
                rules={[{ required: true, message: '请选择核查日期' }]}
              >
                <DatePicker style={{ width: '100%' }} placeholder="请选择核查日期" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="conclusion"
                label="核查结论"
                rules={[{ required: true, message: '请选择核查结论' }]}
              >
                <Select placeholder="请选择核查结论">
                  <Option value="pass">通过</Option>
                  <Option value="fail">不通过</Option>
                  <Option value="pending">待核查</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="verifiedAmount"
                label="核查碳汇量 (tCO₂e)"
                rules={[{ required: true, message: '请输入核查碳汇量' }]}
              >
                <InputNumber style={{ width: '100%' }} placeholder="请输入核查碳汇量" min={0} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="reportNo"
                label="报告编号"
              >
                <Input placeholder="请输入报告编号" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="content"
            label="核查内容"
          >
            <TextArea rows={4} placeholder="请输入核查内容" />
          </Form.Item>
          <Form.Item
            name="remarks"
            label="备注"
          >
            <TextArea rows={3} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="核查详情"
        open={verificationDetailVisible}
        onCancel={() => setVerificationDetailVisible(false)}
        footer={null}
        width={700}
      >
        {selectedVerification && (
          <div className="space-y-6">
            <Descriptions title="基本信息" bordered column={2}>
              <Descriptions.Item label="核查机构">{selectedVerification.verificationAgency}</Descriptions.Item>
              <Descriptions.Item label="核查人员">{selectedVerification.verifier}</Descriptions.Item>
              <Descriptions.Item label="核查日期">{selectedVerification.verificationDate}</Descriptions.Item>
              <Descriptions.Item label="报告编号">{selectedVerification.reportNo || '-'}</Descriptions.Item>
              <Descriptions.Item label="核查碳汇量">
                <span className="font-mono font-semibold text-forest-700">{selectedVerification.verifiedAmount.toLocaleString()} tCO₂e</span>
              </Descriptions.Item>
              <Descriptions.Item label="核查结论">
                <Tag color={selectedVerification.conclusion === 'pass' ? 'success' : selectedVerification.conclusion === 'fail' ? 'error' : 'warning'}>
                  {selectedVerification.conclusion === 'pass' ? '通过' : selectedVerification.conclusion === 'fail' ? '不通过' : '待核查'}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            {selectedVerification.content && (
              <div>
                <h4 className="text-lg font-semibold text-forest-800 mb-3">核查内容</h4>
                <div className="bg-cream-50 p-4 rounded-lg text-forest-700">
                  {selectedVerification.content}
                </div>
              </div>
            )}

            {selectedVerification.attachments && selectedVerification.attachments.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-forest-800 mb-3">附件</h4>
                <div className="space-y-2">
                  {selectedVerification.attachments.map((att, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-cream-50 rounded hover:bg-cream-100 cursor-pointer">
                      <File size={18} className="text-forest-600" />
                      <span className="text-forest-700">{att}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedVerification.remarks && (
              <div>
                <h4 className="text-lg font-semibold text-forest-800 mb-3">备注</h4>
                <div className="bg-cream-50 p-4 rounded-lg text-forest-700">
                  {selectedVerification.remarks}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      <Modal
        title="核查报告"
        open={reportModalVisible}
        onCancel={() => setReportModalVisible(false)}
        footer={null}
        width={900}
      >
        {selectedVerification && (
          <div className="space-y-6">
            <div className="text-center border-b pb-4">
              <h3 className="text-xl font-bold text-forest-800 font-serif">碳汇项目核查报告</h3>
              <p className="text-forest-600 mt-2">报告编号：{selectedVerification.reportNo || '-'}</p>
            </div>

            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="核查机构">{selectedVerification.verificationAgency}</Descriptions.Item>
              <Descriptions.Item label="核查人员">{selectedVerification.verifier}</Descriptions.Item>
              <Descriptions.Item label="核查日期">{selectedVerification.verificationDate}</Descriptions.Item>
              <Descriptions.Item label="项目编号">{selectedVerification.projectId}</Descriptions.Item>
            </Descriptions>

            <div>
              <h4 className="font-semibold text-forest-800 mb-2">一、核查概述</h4>
              <p className="text-forest-700 text-sm leading-relaxed">
                本次核查依据《温室气体自愿减排交易管理暂行办法》及相关技术规范，对项目产生的碳汇量进行独立第三方核查。
                核查范围涵盖项目全部监测区域，采用文件审查、现场核查、数据验证等方法。
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-forest-800 mb-2">二、核查结果</h4>
              <div className="bg-forest-50 p-4 rounded-lg">
                <div className="text-center">
                  <p className="text-sm text-forest-600 mb-2">经核查确认的碳汇量</p>
                  <p className="text-3xl font-bold font-serif text-forest-700">{selectedVerification.verifiedAmount.toLocaleString()} <span className="text-lg">tCO₂e</span></p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-forest-800 mb-2">三、核查结论</h4>
              <div className={`p-4 rounded-lg ${selectedVerification.conclusion === 'pass' ? 'bg-green-50' : selectedVerification.conclusion === 'fail' ? 'bg-red-50' : 'bg-yellow-50'}`}>
                <p className={`font-medium ${selectedVerification.conclusion === 'pass' ? 'text-green-700' : selectedVerification.conclusion === 'fail' ? 'text-red-700' : 'text-yellow-700'}`}>
                  {selectedVerification.conclusion === 'pass' ? '✓ 核查通过' : selectedVerification.conclusion === 'fail' ? '✗ 核查未通过' : '○ 待核查'}
                </p>
                {selectedVerification.remarks && (
                  <p className="mt-2 text-sm text-forest-600">{selectedVerification.remarks}</p>
                )}
              </div>
            </div>

            <div className="text-right text-sm text-forest-600">
              <p>核查机构盖章：____________________</p>
              <p className="mt-1">日期：{selectedVerification.verificationDate}</p>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        title={editingIssuance ? '编辑签发记录' : '新增签发记录'}
        open={issuanceModalVisible}
        onCancel={() => setIssuanceModalVisible(false)}
        onOk={handleIssuanceSubmit}
        okText="确定"
        cancelText="取消"
        width={700}
      >
        <Form form={issuanceForm} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="issuanceDate"
                label="签发日期"
                rules={[{ required: true, message: '请选择签发日期' }]}
              >
                <DatePicker style={{ width: '100%' }} placeholder="请选择签发日期" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="issuedAmount"
                label="签发量 (tCO₂e)"
                rules={[{ required: true, message: '请输入签发量' }]}
              >
                <InputNumber style={{ width: '100%' }} placeholder="请输入签发量" min={0} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="certificateNo"
                label="证书编号"
                rules={[{ required: true, message: '请输入证书编号' }]}
              >
                <Input placeholder="请输入证书编号" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="issuingAuthority"
                label="签发机构"
                rules={[{ required: true, message: '请输入签发机构' }]}
              >
                <Input placeholder="请输入签发机构" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="validFrom"
                label="有效期起"
              >
                <DatePicker style={{ width: '100%' }} placeholder="请选择起始日期" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="validTo"
                label="有效期至"
              >
                <DatePicker style={{ width: '100%' }} placeholder="请选择截止日期" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="status"
                label="状态"
                rules={[{ required: true, message: '请选择状态' }]}
              >
                <Select placeholder="请选择状态">
                  <Option value="issued">已签发</Option>
                  <Option value="pending">待签发</Option>
                  <Option value="revoked">已撤销</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="verificationId"
                label="关联核查记录"
              >
                <Select placeholder="请选择关联的核查记录" allowClear>
                  {currentVerifications.map(v => (
                    <Option key={v.id} value={v.id}>{v.reportNo || v.verificationAgency}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="remarks"
            label="备注"
          >
            <TextArea rows={3} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="签发详情"
        open={issuanceDetailVisible}
        onCancel={() => setIssuanceDetailVisible(false)}
        footer={null}
        width={700}
      >
        {selectedIssuance && (
          <div className="space-y-6">
            <Descriptions title="签发信息" bordered column={2}>
              <Descriptions.Item label="证书编号">{selectedIssuance.certificateNo}</Descriptions.Item>
              <Descriptions.Item label="签发日期">{selectedIssuance.issuanceDate}</Descriptions.Item>
              <Descriptions.Item label="签发机构">{selectedIssuance.issuingAuthority}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={selectedIssuance.status === 'issued' ? 'success' : selectedIssuance.status === 'pending' ? 'warning' : 'error'}>
                  {selectedIssuance.status === 'issued' ? '已签发' : selectedIssuance.status === 'pending' ? '待签发' : '已撤销'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="签发量">
                <span className="font-mono font-semibold text-gold-700">{selectedIssuance.issuedAmount.toLocaleString()} tCO₂e</span>
              </Descriptions.Item>
              <Descriptions.Item label="有效期">
                {selectedIssuance.validFrom && selectedIssuance.validTo 
                  ? `${selectedIssuance.validFrom} 至 ${selectedIssuance.validTo}`
                  : '-'}
              </Descriptions.Item>
            </Descriptions>

            {selectedIssuance.remarks && (
              <div>
                <h4 className="text-lg font-semibold text-forest-800 mb-3">备注</h4>
                <div className="bg-cream-50 p-4 rounded-lg text-forest-700">
                  {selectedIssuance.remarks}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      <Modal
        title="碳汇证书"
        open={certificateModalVisible}
        onCancel={() => setCertificateModalVisible(false)}
        footer={null}
        width={700}
      >
        {selectedIssuance && (
          <div className="space-y-6">
            <div className="text-center border-b pb-4">
              <div className="inline-block p-4 bg-gold-100 rounded-full mb-4">
                <Award size={48} className="text-gold-600" />
              </div>
              <h3 className="text-2xl font-bold text-forest-800 font-serif">国家核证自愿减排量证书</h3>
              <p className="text-gold-600 mt-2 font-medium">证书编号：{selectedIssuance.certificateNo}</p>
            </div>

            <div className="bg-gradient-to-br from-cream-50 to-forest-50 p-6 rounded-xl border border-forest-200">
              <div className="text-center mb-6">
                <p className="text-forest-600 mb-2">经审核确认，特发此证</p>
                <p className="text-4xl font-bold font-serif text-forest-700">{selectedIssuance.issuedAmount.toLocaleString()}</p>
                <p className="text-forest-600 mt-1">吨二氧化碳当量 (tCO₂e)</p>
              </div>

              <Descriptions bordered column={1} size="small">
                <Descriptions.Item label="项目编号">{selectedIssuance.projectId}</Descriptions.Item>
                <Descriptions.Item label="签发机构">{selectedIssuance.issuingAuthority}</Descriptions.Item>
                <Descriptions.Item label="签发日期">{selectedIssuance.issuanceDate}</Descriptions.Item>
                <Descriptions.Item label="有效期">
                  {selectedIssuance.validFrom && selectedIssuance.validTo 
                    ? `${selectedIssuance.validFrom} 至 ${selectedIssuance.validTo}`
                    : '长期有效'}
                </Descriptions.Item>
              </Descriptions>
            </div>

            <div className="text-right text-sm text-forest-600">
              <p>签发机构盖章：____________________</p>
              <p className="mt-1">签发日期：{selectedIssuance.issuanceDate}</p>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        title={editingTransaction ? '编辑交易记录' : '新增交易记录'}
        open={transactionModalVisible}
        onCancel={() => setTransactionModalVisible(false)}
        onOk={handleTransactionSubmit}
        okText="确定"
        cancelText="取消"
        width={700}
      >
        <Form form={transactionForm} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="transactionDate"
                label="交易日期"
                rules={[{ required: true, message: '请选择交易日期' }]}
              >
                <DatePicker style={{ width: '100%' }} placeholder="请选择交易日期" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="交易状态"
                rules={[{ required: true, message: '请选择交易状态' }]}
              >
                <Select placeholder="请选择交易状态">
                  <Option value="completed">已完成</Option>
                  <Option value="pending">待结算</Option>
                  <Option value="cancelled">已取消</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="buyer"
                label="买方"
                rules={[{ required: true, message: '请输入买方名称' }]}
              >
                <Input placeholder="请输入买方名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="seller"
                label="卖方"
                rules={[{ required: true, message: '请输入卖方名称' }]}
              >
                <Input placeholder="请输入卖方名称" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="quantity"
                label="交易量 (tCO₂e)"
                rules={[{ required: true, message: '请输入交易量' }]}
              >
                <InputNumber style={{ width: '100%' }} placeholder="请输入交易量" min={0} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="unitPrice"
                label="单价 (元/t)"
                rules={[{ required: true, message: '请输入单价' }]}
              >
                <InputNumber style={{ width: '100%' }} placeholder="请输入单价" min={0} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="contractNo"
                label="合同编号"
              >
                <Input placeholder="请输入合同编号" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="issuanceId"
                label="关联签发记录"
              >
                <Select placeholder="请选择关联的签发记录" allowClear>
                  {currentIssuances.map(i => (
                    <Option key={i.id} value={i.id}>{i.certificateNo}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="remarks"
            label="备注"
          >
            <TextArea rows={3} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="交易详情"
        open={transactionDetailVisible}
        onCancel={() => setTransactionDetailVisible(false)}
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
              <Descriptions.Item label="合同编号">{selectedTransaction.contractNo || '-'}</Descriptions.Item>
              <Descriptions.Item label="交易状态">
                <Tag color={selectedTransaction.status === 'completed' ? 'success' : selectedTransaction.status === 'pending' ? 'warning' : 'default'}>
                  {selectedTransaction.status === 'completed' ? '已完成' : selectedTransaction.status === 'pending' ? '待结算' : '已取消'}
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

            {selectedTransaction.remarks && (
              <div>
                <h4 className="text-lg font-semibold text-forest-800 mb-3">备注</h4>
                <div className="bg-cream-50 p-4 rounded-lg text-forest-700">
                  {selectedTransaction.remarks}
                </div>
              </div>
            )}

            <div>
              <h4 className="text-lg font-semibold text-forest-800 mb-3">交易进度</h4>
              <Progress 
                percent={selectedTransaction.status === 'completed' ? 100 : selectedTransaction.status === 'pending' ? 70 : 0} 
                status={selectedTransaction.status === 'completed' ? 'success' : selectedTransaction.status === 'pending' ? 'active' : 'exception'} 
                strokeColor="#3d7a2d" 
              />
            </div>
          </div>
        )}
      </Modal>

      <Modal
        title="交易合同"
        open={contractModalVisible}
        onCancel={() => setContractModalVisible(false)}
        footer={null}
        width={900}
      >
        {selectedTransaction && (
          <div className="space-y-6">
            <div className="text-center border-b pb-4">
              <h3 className="text-xl font-bold text-forest-800 font-serif">碳排放权交易合同</h3>
              <p className="text-forest-600 mt-2">合同编号：{selectedTransaction.contractNo || '-'}</p>
            </div>

            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="签订日期">{selectedTransaction.transactionDate}</Descriptions.Item>
              <Descriptions.Item label="合同编号">{selectedTransaction.contractNo || '-'}</Descriptions.Item>
              <Descriptions.Item label="买方（甲方）">{selectedTransaction.buyer}</Descriptions.Item>
              <Descriptions.Item label="卖方（乙方）">{selectedTransaction.seller}</Descriptions.Item>
            </Descriptions>

            <div className="space-y-4 text-sm text-forest-700">
              <div>
                <h4 className="font-semibold text-forest-800 mb-2">第一条 交易标的</h4>
                <p className="leading-relaxed">
                  乙方同意将其持有的国家核证自愿减排量（CCER）出售给甲方，甲方同意受让。
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-forest-800 mb-2">第二条 交易数量与价格</h4>
                <div className="bg-cream-50 p-4 rounded-lg">
                  <Row gutter={16}>
                    <Col span={8} className="text-center">
                      <p className="text-xs text-forest-600">交易数量</p>
                      <p className="text-xl font-bold font-serif text-forest-700">{selectedTransaction.quantity.toLocaleString()} tCO₂e</p>
                    </Col>
                    <Col span={8} className="text-center">
                      <p className="text-xs text-forest-600">交易单价</p>
                      <p className="text-xl font-bold font-serif text-earth-700">{selectedTransaction.unitPrice} 元/t</p>
                    </Col>
                    <Col span={8} className="text-center">
                      <p className="text-xs text-forest-600">交易总额</p>
                      <p className="text-xl font-bold font-serif text-gold-700">{selectedTransaction.totalAmount.toLocaleString()} 元</p>
                    </Col>
                  </Row>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-forest-800 mb-2">第三条 付款方式</h4>
                <p className="leading-relaxed">
                  甲方应在本合同签订后5个工作日内，将全部交易款项一次性支付至乙方指定的银行账户。
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-forest-800 mb-2">第四条 交割方式</h4>
                <p className="leading-relaxed">
                  乙方应在收到全部交易款项后3个工作日内，通过国家碳排放权注册登记系统完成相应碳减排量的划转。
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-forest-800 mb-2">第五条 违约责任</h4>
                <p className="leading-relaxed">
                  任何一方违反本合同约定，应承担违约责任，并赔偿对方因此遭受的全部损失。
                </p>
              </div>
            </div>

            <div className="flex justify-between mt-8 text-sm text-forest-600">
              <div>
                <p>甲方(盖章): ____________________</p>
                <p className="mt-2">法定代表人(签字): ____________</p>
              </div>
              <div>
                <p>乙方(盖章): ____________________</p>
                <p className="mt-2">法定代表人(签字): ____________</p>
              </div>
            </div>

            <div className="text-center text-sm text-forest-600">
              <p>签订日期: {selectedTransaction.transactionDate}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TradingPage;
