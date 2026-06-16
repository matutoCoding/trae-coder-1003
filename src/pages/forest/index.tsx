import { useState } from 'react';
import { Tabs, Table, Tag, Button, Space, Card, Row, Col, Descriptions, Modal, Form, Input, Select, Statistic } from 'antd';
import { Map, FileText, Trees, Eye, Plus, Edit, TrendingUp } from 'lucide-react';
import { MapContainer, TileLayer, Polygon, Popup, CircleMarker } from 'react-leaflet';
import useAppStore from '../../store';
import type { Subcompartment } from '../../types';

const { TabPane } = Tabs;
const { Option } = Select;

const ForestPage: React.FC = () => {
  const { subcompartments, projects, getForestRightByProjectId, getSubcompartmentsByProjectId } = useAppStore();
  const [selectedSub, setSelectedSub] = useState<Subcompartment | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');

  const currentSubs = selectedProjectId ? getSubcompartmentsByProjectId(selectedProjectId) : subcompartments;
  const currentForestRight = selectedProjectId ? getForestRightByProjectId(selectedProjectId) : null;

  const subColumns = [
    {
      title: '小班编号',
      dataIndex: 'code',
      key: 'code',
      width: 120,
      render: (text: string) => <span className="font-mono font-medium text-forest-700">{text}</span>,
    },
    {
      title: '小班名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '面积(公顷)',
      dataIndex: 'area',
      key: 'area',
      width: 100,
      render: (val: number) => val.toFixed(2),
    },
    {
      title: '优势树种',
      dataIndex: 'dominantTree',
      key: 'dominantTree',
      width: 120,
    },
    {
      title: '林龄(年)',
      dataIndex: 'age',
      key: 'age',
      width: 80,
    },
    {
      title: '土壤类型',
      dataIndex: 'soilType',
      key: 'soilType',
      width: 140,
    },
    {
      title: '蓄积量(m³/ha)',
      dataIndex: 'stockVolume',
      key: 'stockVolume',
      width: 130,
      render: (val?: number) => val?.toFixed(2) || '-',
    },
    {
      title: '郁闭度',
      dataIndex: 'canopyDensity',
      key: 'canopyDensity',
      width: 80,
      render: (val?: number) => val?.toFixed(2) || '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_: unknown, record: Subcompartment) => (
        <Space size="small">
          <Button type="link" size="small" icon={<Eye size={14} />} onClick={() => {
            setSelectedSub(record);
            setDetailModalVisible(true);
          }}>
            详情
          </Button>
        </Space>
      ),
    },
  ];

  const rightColumns = [
    {
      title: '权属证号',
      dataIndex: 'certificateNo',
      key: 'certificateNo',
    },
    {
      title: '权利人',
      dataIndex: 'owner',
      key: 'owner',
    },
    {
      title: '权利类型',
      dataIndex: 'ownerType',
      key: 'ownerType',
    },
    {
      title: '面积(公顷)',
      dataIndex: 'area',
      key: 'area',
      render: (val: number) => val.toLocaleString(),
    },
    {
      title: '发证日期',
      dataIndex: 'issueDate',
      key: 'issueDate',
    },
    {
      title: '有效期至',
      dataIndex: 'validUntil',
      key: 'validUntil',
    },
    {
      title: '操作',
      key: 'action',
      render: () => (
        <Space>
          <Button type="link" size="small" icon={<Eye size={14} />}>查看</Button>
          <Button type="link" size="small" icon={<Edit size={14} />}>编辑</Button>
        </Space>
      ),
    },
  ];

  const mapCenter: [number, number] = currentSubs.length > 0
    ? currentSubs[0].center
    : [35.8617, 104.1954];

  return (
    <div className="space-y-6">
      <div className="stagger-item">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold font-serif text-forest-800 mb-2">林地资源</h2>
            <p className="text-forest-600/70">管理林地小班区划和林权权属信息</p>
          </div>
          <Space>
            <Button type="primary" icon={<Plus size={16} />}>新增小班</Button>
          </Space>
        </div>
      </div>

      <Row gutter={[16, 16]} className="stagger-item">
        <Col xs={24} sm={12} lg={6}>
          <Card className="card-hover">
            <Statistic
              title="小班总数"
              value={currentSubs.length}
              suffix="个"
              valueStyle={{ color: '#3d7a2d' }}
              prefix={<Trees size={20} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="card-hover">
            <Statistic
              title="小班总面积"
              value={currentSubs.reduce((sum, s) => sum + s.area, 0).toFixed(2)}
              suffix="公顷"
              valueStyle={{ color: '#8B6914' }}
              prefix={<Map size={20} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="card-hover">
            <Statistic
              title="优势树种数"
              value={new Set(currentSubs.map(s => s.dominantTree)).size}
              suffix="种"
              valueStyle={{ color: '#4A90A4' }}
              prefix={<Trees size={20} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="card-hover">
            <Statistic
              title="平均林龄"
              value={currentSubs.length > 0 ? (currentSubs.reduce((sum, s) => sum + s.age, 0) / currentSubs.length).toFixed(1) : 0}
              suffix="年"
              valueStyle={{ color: '#D4A84B' }}
              prefix={<TrendingUp size={20} />}
            />
          </Card>
        </Col>
      </Row>

      <div className="stagger-item">
        <Tabs defaultActiveKey="1" className="bg-cream-50 rounded-xl">
          <TabPane tab={<span className="font-medium"><Map size={16} className="inline mr-2" />林地小班区划</span>} key="1">
            <div className="space-y-4">
              <Card className="border-none mb-4">
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
                  <Button type="primary" icon={<Plus size={14} />}>新增区划</Button>
                  <Button icon={<Edit size={14} />}>编辑区划</Button>
                </div>
              </Card>

              <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                  <Card title="小班地图" className="card-hover">
                    <div style={{ height: 500 }}>
                      <MapContainer
                        center={mapCenter}
                        zoom={8}
                        style={{ height: '100%', width: '100%', borderRadius: 8 }}
                      >
                        <TileLayer
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        {currentSubs.slice(0, 10).map((sub) => {
                          const bounds: [number, number][] = [
                            [sub.center[0] - 0.02, sub.center[1] - 0.02],
                            [sub.center[0] - 0.02, sub.center[1] + 0.02],
                            [sub.center[0] + 0.02, sub.center[1] + 0.02],
                            [sub.center[0] + 0.02, sub.center[1] - 0.02],
                          ];
                          return (
                            <div key={sub.id}>
                              <Polygon
                                positions={bounds}
                                pathOptions={{
                                  color: '#3d7a2d',
                                  fillColor: '#86b374',
                                  fillOpacity: 0.5,
                                  weight: 2,
                                }}
                              >
                                <Popup>
                                  <div className="text-sm">
                                    <p className="font-semibold">{sub.code} - {sub.name}</p>
                                    <p>面积: {sub.area} 公顷</p>
                                    <p>树种: {sub.dominantTree}</p>
                                  </div>
                                </Popup>
                              </Polygon>
                              <CircleMarker
                                center={sub.center}
                                radius={5}
                                pathOptions={{ color: '#2D5A27', fillColor: '#5d964a', fillOpacity: 1 }}
                              />
                            </div>
                          );
                        })}
                      </MapContainer>
                    </div>
                  </Card>
                </Col>
                <Col xs={24} lg={12}>
                  <Card title="小班列表" className="card-hover">
                    <Table
                      columns={subColumns}
                      dataSource={currentSubs}
                      rowKey="id"
                      scroll={{ x: 1000, y: 400 }}
                      pagination={{
                        pageSize: 8,
                        showSizeChanger: true,
                      }}
                    />
                  </Card>
                </Col>
              </Row>
            </div>
          </TabPane>

          <TabPane tab={<span className="font-medium"><FileText size={16} className="inline mr-2" />林权权属</span>} key="2">
            <Card className="border-none">
              {currentForestRight && (
                <div className="space-y-6">
                  <Descriptions title="林权基本信息" bordered column={2}>
                    <Descriptions.Item label="林权证书号">{currentForestRight.certificateNo}</Descriptions.Item>
                    <Descriptions.Item label="权利人">{currentForestRight.owner}</Descriptions.Item>
                    <Descriptions.Item label="权利类型">{currentForestRight.ownerType}</Descriptions.Item>
                    <Descriptions.Item label="林地面积">{currentForestRight.area} 公顷</Descriptions.Item>
                    <Descriptions.Item label="发证日期">{currentForestRight.issueDate}</Descriptions.Item>
                    <Descriptions.Item label="有效期至">{currentForestRight.validUntil}</Descriptions.Item>
                  </Descriptions>

                  {currentForestRight.transferRecords && currentForestRight.transferRecords.length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold text-forest-800 mb-3">流转记录</h4>
                      <Table
                        columns={[
                          { title: '流转日期', dataIndex: 'date', key: 'date' },
                          { title: '转出方', dataIndex: 'transferor', key: 'transferor' },
                          { title: '转入方', dataIndex: 'transferee', key: 'transferee' },
                          { title: '流转面积(公顷)', dataIndex: 'area', key: 'area', render: (v: number) => v.toLocaleString() },
                          { title: '流转价格(元)', dataIndex: 'price', key: 'price', render: (v: number) => v.toLocaleString() },
                        ]}
                        dataSource={currentForestRight.transferRecords}
                        rowKey="id"
                        pagination={false}
                      />
                    </div>
                  )}
                </div>
              )}

              <div className="mt-6">
                <Table
                  columns={rightColumns}
                  dataSource={selectedProjectId ? [currentForestRight].filter(Boolean) : projects.map(p => getForestRightByProjectId(p.id)).filter(Boolean)}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                />
              </div>
            </Card>
          </TabPane>
        </Tabs>
      </div>

      <Modal
        title="小班详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={700}
      >
        {selectedSub && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="小班编号">{selectedSub.code}</Descriptions.Item>
            <Descriptions.Item label="小班名称">{selectedSub.name}</Descriptions.Item>
            <Descriptions.Item label="面积">{selectedSub.area} 公顷</Descriptions.Item>
            <Descriptions.Item label="优势树种">{selectedSub.dominantTree}</Descriptions.Item>
            <Descriptions.Item label="林龄">{selectedSub.age} 年</Descriptions.Item>
            <Descriptions.Item label="土壤类型">{selectedSub.soilType}</Descriptions.Item>
            <Descriptions.Item label="蓄积量">{selectedSub.stockVolume?.toFixed(2)} m³/ha</Descriptions.Item>
            <Descriptions.Item label="郁闭度">{selectedSub.canopyDensity?.toFixed(2)}</Descriptions.Item>
            <Descriptions.Item label="中心坐标" span={2}>
              {selectedSub.center[0].toFixed(4)}, {selectedSub.center[1].toFixed(4)}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default ForestPage;
