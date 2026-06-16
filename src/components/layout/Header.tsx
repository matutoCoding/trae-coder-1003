import { Layout, Breadcrumb, Avatar, Dropdown, Badge } from 'antd';
import { Bell, Search, User, Settings, LogOut, ChevronRight } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import useAppStore from '../../store';

const { Header: AntHeader } = Layout;

const pageTitleMap: Record<string, string> = {
  '/': '首页概览',
  '/project': '项目台账',
  '/forest': '林地资源',
  '/monitoring': '碳汇监测',
  '/accounting': '计量核算',
  '/trading': '交易管理',
  '/management': '营林管护',
  '/revenue': '收益分配',
};

const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { sidebarCollapsed, toggleSidebar } = useAppStore();

  const currentTitle = pageTitleMap[location.pathname] || '首页概览';

  const userMenuItems = [
    {
      key: 'profile',
      icon: <User size={16} />,
      label: '个人中心',
    },
    {
      key: 'settings',
      icon: <Settings size={16} />,
      label: '系统设置',
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogOut size={16} />,
      label: '退出登录',
    },
  ];

  const notificationItems = [
    {
      key: '1',
      label: (
        <div className="py-2">
          <p className="text-sm font-medium text-forest-800">新的核查任务</p>
          <p className="text-xs text-gray-500">大兴安岭项目待核查</p>
        </div>
      ),
    },
    {
      key: '2',
      label: (
        <div className="py-2">
          <p className="text-sm font-medium text-forest-800">碳汇签发成功</p>
          <p className="text-xs text-gray-500">15,200 tCO2e 已签发</p>
        </div>
      ),
    },
    {
      key: '3',
      label: (
        <div className="py-2">
          <p className="text-sm font-medium text-forest-800">交易完成</p>
          <p className="text-xs text-gray-500">一笔交易已完成结算</p>
        </div>
      ),
    },
  ];

  return (
    <AntHeader
      className="glass-effect sticky top-0 z-50 h-16 flex items-center justify-between px-6"
      style={{
        background: 'rgba(253, 252, 249, 0.95)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="w-10 h-10 rounded-lg hover:bg-forest-50 flex items-center justify-center transition-colors"
        >
          <ChevronRight
            size={20}
            className={`text-forest-600 transition-transform ${sidebarCollapsed ? '' : 'rotate-180'}`}
          />
        </button>

        <Breadcrumb
          items={[
            { title: <span onClick={() => navigate('/')} className="cursor-pointer hover:text-forest-600">首页</span> },
            { title: <span className="text-forest-700 font-medium">{currentTitle}</span> },
          ]}
        />
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center bg-cream-100 rounded-lg px-3 py-2 w-64">
          <Search size={16} className="text-cream-500 mr-2" />
          <input
            type="text"
            placeholder="搜索项目、林地..."
            className="bg-transparent border-none outline-none text-sm w-full text-forest-800 placeholder-cream-500"
          />
        </div>

        <Dropdown menu={{ items: notificationItems }} placement="bottomRight" trigger={['click']}>
          <button className="w-10 h-10 rounded-lg hover:bg-forest-50 flex items-center justify-center transition-colors relative">
            <Badge count={3} size="small" offset={[-3, 3]}>
              <Bell size={20} className="text-forest-600" />
            </Badge>
          </button>
        </Dropdown>

        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
          <div className="flex items-center gap-3 cursor-pointer hover:bg-forest-50 rounded-lg px-3 py-2 transition-colors">
            <Avatar
              size={36}
              className="bg-gradient-to-br from-forest-400 to-forest-600"
              icon={<User size={18} />}
            />
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-forest-800">张管理员</p>
              <p className="text-xs text-cream-600">系统管理员</p>
            </div>
          </div>
        </Dropdown>
      </div>
    </AntHeader>
  );
};

export default Header;
