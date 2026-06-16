import { Row, Col, Table, Tag, Button, Space } from 'antd';
import {
  Trees,
  MapPin,
  Leaf,
  Award,
  DollarSign,
  Activity,
  Clock,
  TrendingUp,
  Eye,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAppStore from '../../store';
import StatCard from '../../components/common/StatCard';
import LineChart from '../../components/charts/LineChart';
import PieChart from '../../components/charts/PieChart';
import BarChart from '../../components/charts/BarChart';
import type { Project } from '../../types';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { dashboardStats, projects, carbonTrend, projectTypeDistribution } = useAppStore();

  const formatNumber = (num: number) => {
    if (num >= 10000) {
      return (num / 10000).toFixed(2) + '万';
    }
    return num.toLocaleString();
  };

  const projectColumns = [
    {
      title: '项目名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <span className="font-medium text-forest-800">{text}</span>
      ),
    },
    {
      title: '项目类型',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: '面积(公顷)',
      dataIndex: 'totalArea',
      key: 'totalArea',
      render: (val: number) => val.toLocaleString(),
    },
    {
      title: '预计碳汇(tCO₂e)',
      dataIndex: 'expectedCarbon',
      key: 'expectedCarbon',
      render: (val: number) => val.toLocaleString(),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: Project['status']) => {
        const statusMap = {
          active: { color: 'success', text: '进行中' },
          pending: { color: 'warning', text: '待审核' },
          completed: { color: 'default', text: '已完成' },
          suspended: { color: 'error', text: '已暂停' },
        };
        const s = statusMap[status];
        return <Tag color={s.color}>{s.text}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: Project) => (
        <Button
          type="link"
          icon={<Eye size={14} />}
          onClick={() => navigate('/project')}
        >
          查看详情
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="stagger-item">
        <div className="mb-6">
          <h2 className="text-2xl font-bold font-serif text-forest-800 mb-2">
            林业碳汇项目管理系统
          </h2>
          <p className="text-forest-600/70">
            实时监控碳汇项目进展，精准计量碳汇储量，助力碳中和目标实现
          </p>
        </div>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="碳汇项目总数"
            value={dashboardStats.totalProjects}
            unit="个"
            icon={Trees}
            color="green"
            trend={{ value: 12.5, isUp: true }}
            delay={0.05}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="林地总面积"
            value={formatNumber(dashboardStats.totalArea)}
            unit="公顷"
            icon={MapPin}
            color="earth"
            trend={{ value: 8.3, isUp: true }}
            delay={0.1}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="碳汇储量"
            value={formatNumber(dashboardStats.totalCarbonStock)}
            unit="tCO₂e"
            icon={Leaf}
            color="green"
            trend={{ value: 15.7, isUp: true }}
            delay={0.15}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="已签发碳汇"
            value={formatNumber(dashboardStats.totalIssuedCarbon)}
            unit="tCO₂e"
            icon={Award}
            color="gold"
            trend={{ value: 22.1, isUp: true }}
            delay={0.2}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="交易总额"
            value={formatNumber(dashboardStats.totalTransactionAmount)}
            unit="元"
            icon={DollarSign}
            color="blue"
            trend={{ value: 18.9, isUp: true }}
            delay={0.25}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="进行中项目"
            value={dashboardStats.activeProjects}
            unit="个"
            icon={Activity}
            color="green"
            delay={0.3}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="待核查项目"
            value={dashboardStats.pendingVerifications}
            unit="个"
            icon={Clock}
            color="gold"
            delay={0.35}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="累计收益"
            value={formatNumber(dashboardStats.totalRevenue)}
            unit="元"
            icon={TrendingUp}
            color="earth"
            trend={{ value: 25.3, isUp: true }}
            delay={0.4}
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <LineChart
            title="碳汇增量趋势"
            xData={carbonTrend.map((d) => d.month)}
            seriesData={[
              {
                name: '碳汇增量(tCO₂e)',
                data: carbonTrend.map((d) => d.carbonIncrement),
                color: '#3d7a2d',
                areaColor: 'rgba(61, 122, 45, 0.25)',
              },
              {
                name: '生物量(t)',
                data: carbonTrend.map((d) => d.biomass),
                color: '#8B6914',
                areaColor: 'rgba(139, 105, 20, 0.2)',
              },
            ]}
            yAxisName="数量"
          />
        </Col>
        <Col xs={24} lg={8}>
          <PieChart
            title="项目类型分布"
            data={projectTypeDistribution.map((d, idx) => ({
              name: d.type,
              value: d.value,
              color: ['#3d7a2d', '#4A90A4', '#D4A84B'][idx],
            }))}
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <BarChart
            title="各项目碳汇储量对比"
            xData={projects.slice(0, 5).map((p) => p.name.slice(0, 6) + '...')}
            seriesData={[
              {
                name: '预计碳汇(tCO₂e)',
                data: projects.slice(0, 5).map((p) => p.expectedCarbon),
                color: '#5d964a',
              },
              {
                name: '实际碳汇(tCO₂e)',
                data: projects.slice(0, 5).map((p) => p.actualCarbon || 0),
                color: '#86b374',
              },
            ]}
            yAxisName="tCO₂e"
          />
        </Col>
        <Col xs={24} lg={12}>
          <PieChart
            title="项目状态分布"
            data={[
              {
                name: '进行中',
                value: projects.filter((p) => p.status === 'active').length,
                color: '#3d7a2d',
              },
              {
                name: '待审核',
                value: projects.filter((p) => p.status === 'pending').length,
                color: '#D4A84B',
              },
              {
                name: '已完成',
                value: projects.filter((p) => p.status === 'completed').length,
                color: '#4A90A4',
              },
            ]}
          />
        </Col>
      </Row>

      <div className="stagger-item">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold font-serif text-forest-800">
            项目列表概览
          </h3>
          <Space>
            <Button type="primary" onClick={() => navigate('/project')}>
              查看全部项目
            </Button>
          </Space>
        </div>
        <Table
          columns={projectColumns}
          dataSource={projects.slice(0, 5)}
          rowKey="id"
          pagination={false}
          className="bg-cream-50 rounded-xl overflow-hidden"
        />
      </div>
    </div>
  );
};

export default Dashboard;
