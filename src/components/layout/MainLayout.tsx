import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const { Content } = Layout;

const MainLayout: React.FC = () => {
  return (
    <Layout className="h-screen w-full overflow-hidden">
      <Sidebar />
      <Layout className="overflow-hidden">
        <Header />
        <Content
          className="overflow-auto"
          style={{
            background: '#f5f1e8',
            height: 'calc(100vh - 64px)',
          }}
        >
          <div className="p-6">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
