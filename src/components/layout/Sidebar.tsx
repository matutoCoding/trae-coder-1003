import { Layout, Menu } from 'antd';
import type { MenuProps } from 'antd';
import {
  LayoutDashboard,
  FileText,
  Trees,
  Activity,
  Calculator,
  TrendingUp,
  Sprout,
  Wallet,
  Leaf,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAppStore from '../../store';

const { Sider } = Layout;

type MenuItem = Required<MenuProps>['items'][number];

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { sidebarCollapsed, toggleSidebar } = useAppStore();

  const menuItems: MenuItem[] = [
    {
      key: '/',
      icon: <LayoutDashboard size={20} />,
      label: '首页概览',
      onClick: () => navigate('/'),
    },
    {
      key: '/project',
      icon: <FileText size={20} />,
      label: '项目台账',
      onClick: () => navigate('/project'),
    },
    {
      key: '/forest',
      icon: <Trees size={20} />,
      label: '林地资源',
      onClick: () => navigate('/forest'),
    },
    {
      key: '/monitoring',
      icon: <Activity size={20} />,
      label: '碳汇监测',
      onClick: () => navigate('/monitoring'),
    },
    {
      key: '/accounting',
      icon: <Calculator size={20} />,
      label: '计量核算',
      onClick: () => navigate('/accounting'),
    },
    {
      key: '/trading',
      icon: <TrendingUp size={20} />,
      label: '交易管理',
      onClick: () => navigate('/trading'),
    },
    {
      key: '/management',
      icon: <Sprout size={20} />,
      label: '营林管护',
      onClick: () => navigate('/management'),
    },
    {
      key: '/revenue',
      icon: <Wallet size={20} />,
      label: '收益分配',
      onClick: () => navigate('/revenue'),
    },
  ];

  return (
    <Sider
      collapsible
      collapsed={sidebarCollapsed}
      onCollapse={toggleSidebar}
      width={240}
      className="h-screen sticky top-0"
      style={{
        background: 'linear-gradient(180deg, #1c3819 0%, #24471f 100%)',
      }}
    >
      <div className="h-16 flex items-center justify-center border-b border-forest-700/50 px-4">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-forest-400 to-forest-600 flex items-center justify-center flex-shrink-0">
            <Leaf size={22} className="text-white" />
          </div>
          {!sidebarCollapsed && (
            <div className="overflow-hidden">
              <h1 className="text-white font-semibold text-lg font-serif whitespace-nowrap">
                林业碳汇管理
              </h1>
              <p className="text-forest-300 text-xs whitespace-nowrap">
                Forest Carbon Sink
              </p>
            </div>
          )}
        </div>
      </div>

      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        className="border-none mt-4"
        style={{
          background: 'transparent',
        }}
      />

      {!sidebarCollapsed && (
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-forest-700/50">
          <div className="bg-forest-800/50 rounded-lg p-3">
            <p className="text-forest-300 text-xs mb-2">© 2024 林业碳汇管理系统</p>
            <p className="text-forest-400 text-xs">版本 v1.0.0</p>
          </div>
        </div>
      )}
    </Sider>
  );
};

export default Sidebar;
